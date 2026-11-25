import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { incheieLegareLichess } from '@/lib/conturi-sah'
import { Spinner } from '@/components/ui/Spinner'

/**
 * Pagina la care te întoarce Lichess după „Autorizează" (cerut pe 2026-11-25).
 * Află contul şi ratingul, le salvează în profil şi te duce înapoi la profil.
 */
export function LegareLichess() {
  const [parametri] = useSearchParams()
  const { user, fetchProfile } = useAuth()
  const navigate = useNavigate()
  const [eroare, setEroare] = useState<string | null>(null)
  // Codul de la Lichess merge o singură dată; în modul de dezvoltare efectul
  // rulează de două ori, iar a doua încercare ar strica legarea.
  const pornit = useRef(false)

  useEffect(() => {
    if (!user || pornit.current) return
    pornit.current = true
    void (async () => {
      try {
        const { username, rating } = await incheieLegareLichess(parametri)
        const { error } = await supabase.from('profiles').update({
          lichess_username: username,
          lichess_rating: rating?.rating ?? null,
          ...(rating ? { sursa_rating: 'lichess' as const, rating_ritm: rating.ritm } : {}),
          rating_actualizat_la: new Date().toISOString(),
        }).eq('id', user.id)
        if (error) throw new Error('Nu am putut salva contul.')
        await fetchProfile(user.id)
        toast.success(rating
          ? `Cont Lichess legat: ${username}, ${rating.ritm} ${rating.rating}.`
          : `Cont Lichess legat: ${username}. N-are încă rating sigur de rapid sau blitz.`)
        navigate('/profile', { replace: true })
      } catch (e) {
        setEroare(e instanceof Error ? e.message : 'Legarea nu a mers.')
      }
    })()
  }, [user, parametri, fetchProfile, navigate])

  if (eroare) {
    return (
      <div className="mx-auto max-w-md space-y-3 py-16 text-center">
        <p className="text-[#F0F0F0]">{eroare}</p>
        <Link to="/profile" className="text-sm text-[#E2B340] hover:underline">Înapoi la profil</Link>
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-[#A0A0A0]">
      <Spinner className="h-7 w-7" />
      <p className="text-sm">Legăm contul de Lichess…</p>
    </div>
  )
}
