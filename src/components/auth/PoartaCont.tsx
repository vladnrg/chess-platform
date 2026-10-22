import { useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { AgeGateStep } from './AgeGateStep'

/**
 * Poarta prin care trece orice pagină cu cont.
 *
 *  - Fără an de naştere (intrat cu Google, sau cont făcut înainte de migrarea
 *    115) → întâi întrebarea de vârstă. Altfel un copil intrat cu Google nu era
 *    întrebat niciodată.
 *  - Cont blocat → doar ecranul de aşteptare. Înainte blocarea exista doar în
 *    baza de date; nicio pagină n-o citea, deci contul blocat intra peste tot.
 *
 * Asta e partea vizibilă. Partea care contează e în baza de date: copilul nu-şi
 * mai poate schimba singur anul, blocarea sau emailul părintelui.
 */
export function PoartaCont({ children }: { children: React.ReactNode }) {
  const { profile, profileLoaded } = useAuth()

  if (!profileLoaded) return <Ecran><p className="text-sm text-[#6B6B6B]">Se încarcă...</p></Ecran>
  if (!profile) return <>{children}</>
  if (profile.birth_year == null) return <IntrebareVarsta />
  if (profile.account_frozen) return <ContBlocat />
  return <>{children}</>
}

function IntrebareVarsta() {
  const { user, fetchProfile, signOut } = useAuth()
  const [loading, setLoading] = useState(false)

  async function salveaza(an: number, emailParinte: string | null) {
    if (!user) return
    setLoading(true)
    const { data: eMinor, error } = await supabase.rpc('seteaza_varsta', { p_an: an, p_email_parinte: emailParinte })
    if (error) {
      setLoading(false)
      toast.error(error.message)
      return
    }
    if (eMinor) {
      await supabase.functions.invoke('request-parental-consent', { body: { userId: user.id } })
    }
    await fetchProfile(user.id)
    setLoading(false)
  }

  return (
    <Ecran>
      <div className="w-full max-w-sm">
        <Antet titlu="Un ultim pas" subtitlu="Când ai fost născut? Întrebăm o singură dată." />
        <AgeGateStep onComplete={salveaza} loading={loading} />
        <button onClick={() => void signOut()} className="mt-6 w-full text-xs text-[#6B6B6B] hover:text-[#F0F0F0]">
          Deconectează-te
        </button>
      </div>
    </Ecran>
  )
}

const MOTIVE: Record<string, string> = {
  trimis_recent: 'Emailul a plecat de curând. Mai încearcă peste 10 minute.',
  email_neconfigurat: 'Trimiterea emailurilor nu e încă pornită. Încearcă puțin mai târziu.',
  email_esuat: 'Emailul nu a putut fi trimis. Încearcă din nou peste câteva minute.',
}

function ContBlocat() {
  const { user, profile, signOut } = useAuth()
  const [trimit, setTrimit] = useState(false)
  const respins = profile?.account_frozen_reason === 'rejected'

  async function retrimite() {
    if (!user) return
    setTrimit(true)
    const { data, error } = await supabase.functions.invoke<{ ok: boolean }>(
      'request-parental-consent',
      { body: { userId: user.id } },
    )
    setTrimit(false)
    if (data?.ok) { toast.success('Am retrimis emailul către părintele tău.'); return }
    let motiv: string | undefined
    const context: unknown = (error as { context?: unknown } | null)?.context
    if (context instanceof Response) {
      motiv = (await context.json().catch(() => null) as { motiv?: string } | null)?.motiv
    }
    toast.error(MOTIVE[motiv ?? ''] ?? 'Emailul nu a putut fi trimis. Încearcă din nou mai târziu.')
  }

  return (
    <Ecran>
      <div className="w-full max-w-sm text-center">
        <Antet
          titlu={respins ? 'Contul nu a fost aprobat' : 'Așteptăm acordul părintelui tău'}
          subtitlu={respins
            ? 'Părintele tău nu a fost de acord cu acest cont, așa că nu-l putem deschide.'
            // Nu „i-am scris": ecranul nu ştie dacă emailul a plecat (poate n-a
            // plecat deloc). Spune doar unde merge şi ce urmează.
            : `Cererea de acord merge la ${ascundeEmail(profile?.parental_email)}. Contul se deschide imediat ce părintele apasă butonul de acord din email.`}
        />
        {!respins && (
          <Button className="w-full" onClick={() => void retrimite()} loading={trimit}>
            Retrimite emailul
          </Button>
        )}
        {!respins && (
          <p className="mt-3 text-xs text-[#6B6B6B]">
            Nu-l găsește? Să se uite și în dosarul de spam. Adresa greșită o poate schimba doar echipa CleanChess.
          </p>
        )}
        <button onClick={() => void signOut()} className="mt-6 w-full text-xs text-[#6B6B6B] hover:text-[#F0F0F0]">
          Deconectează-te
        </button>
      </div>
    </Ecran>
  )
}

/** „m***a@gmail.com": copilul recunoaşte adresa, dar ecranul n-o arată întreagă. */
function ascundeEmail(email: string | null | undefined) {
  if (!email) return 'părintele tău'
  const [nume, domeniu] = email.split('@')
  if (!domeniu) return email
  return `${nume.slice(0, 1)}***${nume.length > 1 ? nume.slice(-1) : ''}@${domeniu}`
}

function Antet({ titlu, subtitlu }: { titlu: string; subtitlu: string }) {
  return (
    <div className="mb-8 text-center">
      <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#E2B340]">
        <Logo className="h-6 w-6 text-black" />
      </div>
      <h1 className="text-xl font-bold text-[#F0F0F0]">{titlu}</h1>
      <p className="mt-2 text-sm text-[#A0A0A0]">{subtitlu}</p>
    </div>
  )
}

function Ecran({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-4">{children}</div>
}
