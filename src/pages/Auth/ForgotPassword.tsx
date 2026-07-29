import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) {
      setError('Nu am putut trimite emailul. Verifică adresa și încearcă din nou.')
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E2B340]">
              <span className="text-black font-black text-xl">♟</span>
            </div>
            <span className="font-bold text-[#F0F0F0] text-xl">CleanChess</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#F0F0F0]">Ți-ai uitat parola?</h1>
          <p className="mt-1 text-sm text-[#A0A0A0]">Îți trimitem un link de resetare pe email</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="text-5xl">📧</div>
            <p className="text-[#F0F0F0]">Verifică-ți emailul</p>
            <p className="text-sm text-[#A0A0A0]">
              Dacă există un cont pentru <span className="text-[#F0F0F0]">{email}</span>, vei primi un link de
              resetare. Verifică și folderul Spam.
            </p>
            <Link to="/login" className="inline-block text-sm text-[#E2B340] hover:text-[#F0C85A] font-medium">
              ← Înapoi la conectare
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="tu@exemplu.ro"
                value={email}
                onChange={e => setEmail(e.target.value)}
                error={error}
                required
              />
              <Button type="submit" size="lg" className="w-full" loading={loading}>
                Trimite link de resetare
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-[#A0A0A0]">
              Ți-ai amintit-o?{' '}
              <Link to="/login" className="text-[#E2B340] hover:text-[#F0C85A] font-medium">
                Conectează-te
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
