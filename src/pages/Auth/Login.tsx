import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { GoogleButton } from '@/components/auth/GoogleButton'

export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError('Email sau parolă incorectă.')
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E2B340]">
              <span className="text-black font-black text-xl">♟</span>
            </div>
            <span className="font-bold text-[#F0F0F0] text-xl">CleanChess</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#F0F0F0]">Bun revenit!</h1>
          <p className="mt-1 text-sm text-[#A0A0A0]">Conectează-te la contul tău</p>
        </div>

        <GoogleButton label="Conectează-te cu Google" />

        {/* Separator */}
        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-[#2A2A2A]" />
          <span className="text-xs text-[#6B6B6B]">sau cu email</span>
          <span className="h-px flex-1 bg-[#2A2A2A]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="tu@exemplu.ro"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <div>
            <Input
              label="Parolă"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={error}
              required
            />
            <div className="mt-1.5 text-right">
              <Link to="/forgot-password" className="text-xs text-[#A0A0A0] hover:text-[#E2B340]">
                Ai uitat parola?
              </Link>
            </div>
          </div>
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Conectare
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#A0A0A0]">
          Nu ai cont?{' '}
          <Link to="/register" className="text-[#E2B340] hover:text-[#F0C85A] font-medium">
            Înregistrează-te gratuit
          </Link>
        </p>
      </div>
    </div>
  )
}
