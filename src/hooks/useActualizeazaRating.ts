import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { ratingChesscom, ratingLichess } from '@/lib/conturi-sah'
import type { Profile } from '@/types'

const O_ZI_MS = 24 * 60 * 60 * 1000

/**
 * Ratingul conturilor legate se schimbă de la o zi la alta. O dată pe zi, la
 * prima pagină deschisă, îl citim din nou de pe Chess.com şi Lichess (cerut pe
 * 2026-11-25, odată cu legarea conturilor). Fără cont legat, nu face nimic.
 */
export function useActualizeazaRating() {
  const { profile, user, fetchProfile } = useAuth()
  const facut = useRef(false)

  useEffect(() => {
    if (!profile || !user || facut.current) return
    if (!profile.chesscom_username && !(profile.lichess_username && profile.lichess_rating != null)) return
    const ultima = profile.rating_actualizat_la ? Date.parse(profile.rating_actualizat_la) : 0
    if (Date.now() - ultima < O_ZI_MS) return
    facut.current = true

    void (async () => {
      const campuri: Partial<Profile> = { rating_actualizat_la: new Date().toISOString() }
      try {
        if (profile.chesscom_username) {
          const r = await ratingChesscom(profile.chesscom_username)
          if (r) {
            campuri.chesscom_rating = r.rating
            if (profile.sursa_rating === 'chesscom') campuri.rating_ritm = r.ritm
          }
        }
        if (profile.lichess_username && profile.lichess_rating != null) {
          const r = await ratingLichess(profile.lichess_username)
          if (r) {
            campuri.lichess_rating = r.rating
            if (profile.sursa_rating === 'lichess') campuri.rating_ritm = r.ritm
          }
        }
      } catch {
        // Fără reţea sau site-ul nu răspunde: rămâne ratingul de ieri.
      }
      const { error } = await supabase.from('profiles').update(campuri).eq('id', user.id)
      if (!error) await fetchProfile(user.id)
    })()
  }, [profile, user, fetchProfile])
}
