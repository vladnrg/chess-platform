import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

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
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c8a84b]">
              <span className="text-black font-black text-xl">♟</span>
            </div>
            <span className="font-bold text-[#f0f0f0] text-xl">ChessUp</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#f0f0f0]">Bun revenit!</h1>
          <p className="mt-1 text-sm text-[#a0a0a0]">Conectează-te la contul tău</p>
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
          <Input
            label="Parolă"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={error}
            required
          />
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Conectare
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#a0a0a0]">
          Nu ai cont?{' '}
          <Link to="/register" className="text-[#c8a84b] hover:text-[#d4b860] font-medium">
            Înregistrează-te gratuit
          </Link>
        </p>
      </div>
    </div>
  )
}
