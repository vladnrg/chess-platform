import { useState } from 'react'
import { supabase } from '@/lib/supabase'

// Logo-ul Google „G" oficial (4 culori), inline ca să nu depindem de nimic extern.
function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22 22-9.8 22-22c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 4.1 29.6 2 24 2 15.9 2 8.8 6.6 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 46c5.5 0 10.5-2.1 14.3-5.6l-6.6-5.6C29.6 36.4 26.9 37 24 37c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C8.7 41.4 15.8 46 24 46z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.6 5.6C41.6 36.3 44 30.7 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  )
}

interface GoogleButtonProps {
  label?: string
  /** Unde revine utilizatorul după autentificare (implicit /dashboard). */
  redirectTo?: string
}

export function GoogleButton({ label = 'Continuă cu Google', redirectTo = '/dashboard' }: GoogleButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function signIn() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}${redirectTo}` },
    })
    // La succes, browserul e redirecționat către Google — nu mai ajungem aici.
    if (error) {
      setLoading(false)
      setError('Conectarea cu Google nu e disponibilă momentan.')
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={signIn}
        disabled={loading}
        className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-[#2A2A2A] bg-[#141414] text-sm font-medium text-[#F0F0F0] hover:bg-[#1C1C1C] hover:border-[#3A3A3A] transition-colors disabled:opacity-50"
      >
        <GoogleIcon />
        {loading ? 'Se conectează...' : label}
      </button>
      {error && <p className="text-xs text-[#FB7185] text-center">{error}</p>}
    </div>
  )
}
