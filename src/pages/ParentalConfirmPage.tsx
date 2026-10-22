import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

type PageState = 'loading' | 'confirm' | 'already-used' | 'expired' | 'done-confirm' | 'done-reject' | 'error'

/**
 * Pagina pe care o deschide părintele din email.
 *
 * Linkul se verifică şi decizia se ia pe server (`citeste_cerere_parinte`,
 * `raspunde_cerere_parinte`, migrarea 115). Înainte pagina citea tabelul de
 * linkuri direct — pe care oricine îl putea citi întreg — şi scria în profilul
 * copilului din browser, ceea ce baza nu permitea fără cont.
 *
 * Decizia cere un click. Linkul din email are `action=confirm`, dar nu se mai
 * execută singur la deschidere: multe servicii de email deschid linkurile
 * automat, ca să le verifice, iar aşa un cont s-ar fi aprobat fără părinte.
 */
export function ParentalConfirmPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const sugerat = searchParams.get('action') === 'reject' ? 'reject' : 'confirm'

  // Fără token nu e nimic de verificat — pornim direct în starea finală.
  const [state, setState] = useState<PageState>(token ? 'loading' : 'expired')
  const [childName, setChildName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    void supabase.rpc('citeste_cerere_parinte', { p_token: token }).then(({ data, error }) => {
      if (cancelled) return
      if (error || !data) { setState('error'); return }
      if (data.stare === 'folosit') { setState('already-used'); return }
      if (data.stare !== 'valid') { setState('expired'); return }
      setChildName(data.copil ?? 'copilul dumneavoastră')
      setState('confirm')
    })
    return () => { cancelled = true }
  }, [token])

  async function raspunde(accept: boolean) {
    if (!token) return
    setSubmitting(true)
    const { data, error } = await supabase.rpc('raspunde_cerere_parinte', { p_token: token, p_accept: accept })
    setSubmitting(false)
    if (error) { setState('error'); return }
    if (data === 'confirmat') setState('done-confirm')
    else if (data === 'respins') setState('done-reject')
    else if (data === 'folosit') setState('already-used')
    else setState('expired')
  }

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <p className="text-[#6B6B6B]">Se verifică linkul...</p>
      </div>
    )
  }

  if (state === 'error') {
    return <StatusPage icon="⚠️" title="Ceva n-a mers" message="Nu am putut procesa cererea. Încercați din nou peste câteva minute — linkul rămâne valabil." />
  }

  if (state === 'expired') {
    return <StatusPage icon="⌛" title="Link expirat" message="Linkul a expirat sau nu e valid. Copilul poate cere un email nou după ce se autentifică în contul lui." />
  }

  if (state === 'already-used') {
    return <StatusPage icon="✅" title="Răspuns deja dat" message="Pentru acest cont ați răspuns deja. Dacă vreți să schimbați decizia, scrieți-ne." />
  }

  if (state === 'done-confirm') {
    return <StatusPage icon="✅" title="Cont activat" message={`Contul lui ${childName} e deschis. Se poate autentifica acum și poate începe să învețe șah.`} />
  }

  if (state === 'done-reject') {
    return <StatusPage icon="❌" title="Cerere respinsă" message={`Contul lui ${childName} rămâne închis. Nu îi folosim datele.`} />
  }

  // state === 'confirm'
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="text-5xl mb-4">♟</div>
          <h1 className="text-2xl font-bold text-[#F0F0F0] mb-2">Acordul dumneavoastră pentru CleanChess</h1>
          <p className="text-[#A0A0A0] text-sm">
            <span className="text-[#F0F0F0] font-semibold">{childName}</span> și-a creat un cont pe CleanChess.
            Pentru că are sub 16 ani, contul se deschide doar cu acordul unui părinte sau tutore.
          </p>
        </div>

        <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] p-5 space-y-3 text-sm text-[#A0A0A0]">
          <p className="font-semibold text-[#F0F0F0]">Ce primește copilul:</p>
          <ul className="space-y-1.5 list-disc list-inside">
            <li>Cursuri interactive de deschideri, tactică și jocul de mijloc</li>
            <li>Puzzle-uri pe nivelul lui</li>
            <li>Sub 14 ani, sesiuni cu pauze obligatorii</li>
            <li>Nicio plată fără dumneavoastră</li>
          </ul>
          <p className="font-semibold text-[#F0F0F0] pt-2">Ce date folosim:</p>
          <p>
            Numele de utilizator, emailul și anul nașterii, progresul din cursuri și puzzle-uri, iar dacă îi pune
            întrebări antrenorului AI, întrebările și pozițiile de pe tablă.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => void raspunde(false)}
            disabled={submitting}
            className={`rounded-lg bg-[#141414] border text-[#FB7185] font-semibold py-3 hover:border-[#FB7185] transition-colors disabled:opacity-50 ${
              sugerat === 'reject' ? 'border-[#FB7185]' : 'border-[#2A2A2A]'
            }`}
          >
            Nu sunt de acord
          </button>
          <button
            onClick={() => void raspunde(true)}
            disabled={submitting}
            className="rounded-lg bg-[#E2B340] text-black font-semibold py-3 hover:bg-[#F0C85A] transition-colors disabled:opacity-50"
          >
            Sunt de acord
          </button>
        </div>
      </div>
    </div>
  )
}

function StatusPage({ icon, title, message }: { icon: string; title: string; message: string }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center space-y-4">
        <div className="text-5xl">{icon}</div>
        <h1 className="text-2xl font-bold text-[#F0F0F0]">{title}</h1>
        <p className="text-[#A0A0A0] text-sm">{message}</p>
      </div>
    </div>
  )
}
