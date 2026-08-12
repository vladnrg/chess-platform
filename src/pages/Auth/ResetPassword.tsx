import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false) // sesiunea de recuperare a fost detectată
  const [done, setDone] = useState(false)

  // Când utilizatorul ajunge de pe link-ul din email, supabase-js stabilește o sesiune
  // temporară de recuperare (eveniment PASSWORD_RECOVERY). Fără ea nu putem schimba parola.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true)
    })
    // Fallback: dacă sesiunea era deja procesată înainte să atașăm listener-ul.
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Parola trebuie să aibă minim 8 caractere.'); return }
    if (password !== confirm) { setError('Parolele nu coincid.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError('Nu am putut schimba parola. Link-ul poate a expirat — cere unul nou.')
    } else {
      setDone(true)
      setTimeout(() => navigate('/dashboard'), 1600)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E2B340] mx-auto mb-4">
            <span className="text-black font-black text-xl">♟</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F0F0F0]">Setează o parolă nouă</h1>
          <p className="mt-1 text-sm text-[#A0A0A0]">Alege o parolă pe care nu o mai uiți</p>
        </div>

        {done ? (
          <div className="text-center space-y-4">
            <div className="text-5xl">✅</div>
            <p className="text-[#F0F0F0]">Parola a fost schimbată!</p>
            <p className="text-sm text-[#A0A0A0]">Te ducem în cont...</p>
          </div>
        ) : !ready ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-[#A0A0A0]">
              Deschide această pagină din link-ul primit pe email. Dacă ai ajuns aici direct, cere un link nou.
            </p>
            <Link to="/forgot-password" className="inline-block text-sm text-[#E2B340] hover:text-[#F0C85A] font-medium">
              Cere link de resetare
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Parolă nouă"
              type="password"
              placeholder="Minim 8 caractere"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <Input
              label="Confirmă parola"
              type="password"
              placeholder="Repetă parola"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              error={error}
              required
            />
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Schimbă parola
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
