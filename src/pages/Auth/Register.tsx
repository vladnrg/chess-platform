import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AgeGateStep } from '@/components/auth/AgeGateStep'

type Step = 'credentials' | 'age' | 'done-minor'

export function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('credentials')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [createdUserId, setCreatedUserId] = useState<string | null>(null)

  function validate() {
    const e: Record<string, string> = {}
    if (username.length < 3) e.username = 'Minim 3 caractere'
    if (!email.includes('@')) e.email = 'Email invalid'
    if (password.length < 8) e.password = 'Minim 8 caractere'
    return e
  }

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    }) as any

    setLoading(false)
    if (error) {
      setErrors({ general: error.message })
      return
    }

    setCreatedUserId(data?.user?.id ?? null)
    setStep('age')
  }

  async function handleAgeComplete(birthYear: number | null, parentalEmail: string | null) {
    if (!createdUserId) return

    // Save birth_year to profile
    if (birthYear) {
      await supabase.from('profiles').update({ birth_year: birthYear }).eq('id', createdUserId) as any
    }

    const isMinor = birthYear !== null && (new Date().getFullYear() - birthYear) < 14

    if (isMinor && parentalEmail) {
      // Freeze account and send parental consent email
      setLoading(true)
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/request-parental-consent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ userId: createdUserId, parentalEmail, childUsername: username }),
      })
      setLoading(false)
      setStep('done-minor')
    } else {
      navigate('/onboarding')
    }
  }

  if (step === 'done-minor') {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-5">
          <div className="text-5xl">📧</div>
          <h1 className="text-2xl font-bold text-[#f0f0f0]">Verifică emailul părintelui</h1>
          <p className="text-[#a0a0a0] text-sm">
            Am trimis o cerere de aprobare la adresa indicată. Contul tău va fi activat
            după ce părintele sau tutorele confirmă prin email.
          </p>
          <p className="text-xs text-[#666]">
            Cererea expiră în 30 de zile. Dacă nu e confirmată, contul este șters automat.
          </p>
          <Link to="/" className="block text-sm text-[#c8a84b] hover:text-[#d4b860]">
            Înapoi la pagina principală
          </Link>
        </div>
      </div>
    )
  }

  if (step === 'age') {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c8a84b] mx-auto mb-4">
              <span className="text-black font-black text-xl">♟</span>
            </div>
            <h1 className="text-xl font-bold text-[#f0f0f0]">Un ultim pas</h1>
            <p className="mt-1 text-sm text-[#a0a0a0]">Când ai fost născut?</p>
          </div>
          <AgeGateStep onComplete={handleAgeComplete} />
          {loading && <p className="text-xs text-[#666] text-center mt-4">Se procesează...</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c8a84b]">
              <span className="text-black font-black text-xl">♟</span>
            </div>
            <span className="font-bold text-[#f0f0f0] text-xl">ChessUp</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#f0f0f0]">Creează cont gratuit</h1>
          <p className="mt-1 text-sm text-[#a0a0a0]">Începe să înveți șah azi</p>
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
            <p className="text-sm text-[#f87171] text-center">{errors.general}</p>
          )}
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Înregistrare gratuită
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-[#666]">
          Prin înregistrare, accepți{' '}
          <Link to="/terms" className="text-[#a0a0a0] hover:text-[#c8a84b]">Termenii și condițiile</Link>
        </p>

        <p className="mt-4 text-center text-sm text-[#a0a0a0]">
          Ai deja cont?{' '}
          <Link to="/login" className="text-[#c8a84b] hover:text-[#d4b860] font-medium">
            Conectează-te
          </Link>
        </p>
      </div>
    </div>
  )
}
