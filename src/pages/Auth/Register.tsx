import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function Register() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (username.length < 3) e.username = 'Minim 3 caractere'
    if (!email.includes('@')) e.email = 'Email invalid'
    if (password.length < 8) e.password = 'Minim 8 caractere'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    setLoading(false)
    if (error) {
      setErrors({ general: error.message })
    } else {
      navigate('/onboarding')
    }
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

        <form onSubmit={handleSubmit} className="space-y-4">
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
