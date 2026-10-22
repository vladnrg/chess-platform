import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AgeGateStep } from '@/components/auth/AgeGateStep'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { Logo } from '@/components/ui/Logo'
import { areNevoieDeAcord } from '@/lib/varsta'

type Step = 'credentials' | 'age' | 'done-minor' | 'confirm-email'

export function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('credentials')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [emailParinteTrimis, setEmailParinteTrimis] = useState(false)

  function validate() {
    const e: Record<string, string> = {}
    if (username.length < 3) e.username = 'Minim 3 caractere'
    if (!email.includes('@')) e.email = 'Email invalid'
    if (password.length < 8) e.password = 'Minim 8 caractere'
    return e
  }

  // Datele de cont se verifică aici, dar contul se creează abia după ce ştim
  // vârsta. Înainte se crea întâi contul şi apoi se salva anul naşterii din
  // pagină — doar că până la confirmarea emailului nu există sesiune, aşa că
  // salvarea era respinsă în tăcere şi niciun copil nu ajungea marcat ca minor.
  function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setStep('age')
  }

  async function handleAgeComplete(birthYear: number, parentalEmail: string | null) {
    setLoading(true)
    // Anul şi emailul părintelui pleacă odată cu contul; baza de date le scrie în
    // profil la creare şi blochează contul dacă e sub 16 ani (migrarea 115).
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, birth_year: String(birthYear), parental_email: parentalEmail ?? '' } },
    })

    if (error) {
      setLoading(false)
      setErrors({ general: error.message })
      setStep('credentials')
      return
    }

    if (areNevoieDeAcord(birthYear) && data.user) {
      const { data: rezultat } = await supabase.functions.invoke<{ ok: boolean }>(
        'request-parental-consent',
        { body: { userId: data.user.id } },
      )
      setEmailParinteTrimis(rezultat?.ok === true)
      setLoading(false)
      setStep('done-minor')
      return
    }

    setLoading(false)
    // Cu confirmarea emailului pornită, Supabase nu dă încă sesiune: omul trebuie
    // să ştie că are un email de deschis, altfel ajunge la login fără să ştie de ce.
    if (data.session) navigate('/onboarding')
    else setStep('confirm-email')
  }

  if (step === 'confirm-email') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-5">
          <div className="text-5xl">📧</div>
          <h1 className="text-2xl font-bold text-[#F0F0F0]">Confirmă-ți emailul</h1>
          <p className="text-[#A0A0A0] text-sm">
            Ți-am trimis un email la <span className="text-[#F0F0F0]">{email}</span>. Apasă pe linkul din el
            și contul tău e gata.
          </p>
          <Link to="/login" className="block text-sm text-[#E2B340] hover:text-[#F0C85A]">
            Am confirmat, vreau să mă autentific
          </Link>
        </div>
      </div>
    )
  }

  if (step === 'done-minor') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-5">
          <div className="text-5xl">📧</div>
          <h1 className="text-2xl font-bold text-[#F0F0F0]">
            {emailParinteTrimis ? 'Am scris părintelui tău' : 'Contul e creat'}
          </h1>
          {/* Spunem exact ce s-a întâmplat. Înainte scria „am trimis" şi când
              emailul nu plecase deloc. */}
          <p className="text-[#A0A0A0] text-sm">
            {emailParinteTrimis
              ? 'I-am trimis părintelui tău un email cu un buton de acord. Contul tău se deschide după ce îl apasă.'
              : 'Nu am putut trimite acum emailul către părintele tău. După ce te autentifici, îl poți retrimite cu un singur buton.'}
          </p>
          <p className="text-[#A0A0A0] text-sm">
            Între timp, confirmă-ți și tu adresa: ți-am trimis un email la{' '}
            <span className="text-[#F0F0F0]">{email}</span>.
          </p>
          <Link to="/" className="block text-sm text-[#E2B340] hover:text-[#F0C85A]">
            Înapoi la pagina principală
          </Link>
        </div>
      </div>
    )
  }

  if (step === 'age') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E2B340] mx-auto mb-4">
              <Logo className="h-6 w-6 text-black" />
            </div>
            <h1 className="text-xl font-bold text-[#F0F0F0]">Un ultim pas</h1>
            <p className="mt-1 text-sm text-[#A0A0A0]">Când ai fost născut?</p>
          </div>
          <AgeGateStep onComplete={handleAgeComplete} loading={loading} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E2B340]">
              <Logo className="h-6 w-6 text-black" />
            </div>
            <span className="font-bold text-[#F0F0F0] text-xl">CleanChess</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#F0F0F0]">Creează cont gratuit</h1>
          <p className="mt-1 text-sm text-[#A0A0A0]">Începe să înveți șah azi</p>
        </div>

        <GoogleButton label="Înregistrează-te cu Google" />

        {/* Separator */}
        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-[#2A2A2A]" />
          <span className="text-xs text-[#6B6B6B]">sau cu email</span>
          <span className="h-px flex-1 bg-[#2A2A2A]" />
        </div>

        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
          <Input
            label="Nume utilizator"
            type="text"
            placeholder="jucator_sah"
            value={username}
            onChange={e => setUsername(e.target.value)}
            error={errors.username}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="tu@exemplu.ro"
            value={email}
            onChange={e => setEmail(e.target.value)}
            error={errors.email}
            required
          />
          <Input
            label="Parolă"
            type="password"
            placeholder="Minim 8 caractere"
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={errors.password}
            required
          />
          {errors.general && (
            <p className="text-sm text-[#FB7185] text-center">{errors.general}</p>
          )}
          <Button type="submit" size="lg" className="w-full">
            Înregistrare gratuită
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-[#6B6B6B]">
          Prin înregistrare, accepți{' '}
          <Link to="/terms" className="text-[#A0A0A0] hover:text-[#E2B340]">Termenii și condițiile</Link>
        </p>

        <p className="mt-4 text-center text-sm text-[#A0A0A0]">
          Ai deja cont?{' '}
          <Link to="/login" className="text-[#E2B340] hover:text-[#F0C85A] font-medium">
            Conectează-te
          </Link>
        </p>
      </div>
    </div>
  )
}
