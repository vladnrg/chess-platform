import { useCallback, useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, type Match } from '@/lib/supabase'
import { useAuth } from './useAuth'

/**
 * O partidă live: starea din baza de date, actualizată în timp real, plus ceasul
 * care curge local între mutări.
 *
 * Ceasul afişat nu e o a doua sursă de adevăr — e doar interpolare. Valorile
 * oficiale sunt cele din rând (`white_time_ms`, `last_move_at`), iar aici doar
 * scădem timpul scurs de atunci, ca cifra să nu stea încremenită între mutări.
 * Cine pierde la timp se decide tot pe server.
 */
export function useMatch(matchId: string | undefined) {
  const qc = useQueryClient()
  const { user } = useAuth()

  const { data: match, isLoading } = useQuery({
    queryKey: ['match', matchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches').select('*').eq('id', matchId!).single()
      if (error) throw error
      return data as Match
    },
    enabled: !!matchId,
  })

  // Actualizările vin prin Realtime: adversarul mută, rândul se schimbă la noi.
  useEffect(() => {
    if (!matchId) return
    const channel = supabase
      .channel(`match:${matchId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` },
        payload => qc.setQueryData(['match', matchId], payload.new as Match)
      )
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [matchId, qc])

  // Ticker pentru ceas. `setState` stă într-un callback de interval, nu în corpul
  // efectului — altfel ar declanşa randări în cascadă.
  const [tick, setTick] = useState(() => Date.now())
  useEffect(() => {
    if (match?.status !== 'active') return
    const id = setInterval(() => setTick(Date.now()), 200)
    return () => clearInterval(id)
  }, [match?.status])

  const clocks = computeClocks(match, tick)

  const myColor: 'w' | 'b' | null = !match || !user
    ? null
    : match.white_id === user.id ? 'w'
    : match.black_id === user.id ? 'b'
    : null

  /** Trimite mutarea arbitrului. Întoarce mesajul de eroare, sau `null` la reuşită. */
  const playMove = useCallback(async (from: string, to: string, promotion?: string) => {
    if (!matchId) return 'no_match'
    const { data, error } = await supabase.functions.invoke('play-move', {
      body: { matchId, from, to, promotion },
    })
    if (error) return 'network'
    const res = data as { ok?: boolean; error?: string }
    return res.ok ? null : (res.error ?? 'unknown')
  }, [matchId])

  return {
    match,
    isLoading,
    myColor,
    isMyTurn: !!match && match.status === 'active' && myColor === match.turn,
    clocks,
    playMove,
  }
}

export interface Clocks {
  whiteMs: number
  blackMs: number
  /** Cine a rămas fără timp, dacă e cazul — clientul poate revendica finalul. */
  flagged: 'w' | 'b' | null
}

function computeClocks(match: Match | undefined, now: number): Clocks {
  if (!match) return { whiteMs: 0, blackMs: 0, flagged: null }

  // Partidă încheiată: ceasurile îngheaţă la valorile finale
  if (match.status !== 'active') {
    return { whiteMs: match.white_time_ms, blackMs: match.black_time_ms, flagged: null }
  }

  const elapsed = Math.max(0, now - new Date(match.last_move_at).getTime())
  const whiteMs = match.turn === 'w' ? match.white_time_ms - elapsed : match.white_time_ms
  const blackMs = match.turn === 'b' ? match.black_time_ms - elapsed : match.black_time_ms

  return {
    whiteMs: Math.max(0, whiteMs),
    blackMs: Math.max(0, blackMs),
    flagged: whiteMs <= 0 ? 'w' : blackMs <= 0 ? 'b' : null,
  }
}

/** `mm:ss`, iar sub 20 de secunde şi zecimea — ca la ceasurile de blitz. */
export function formatClock(ms: number): string {
  const total = Math.max(0, ms)
  const minutes = Math.floor(total / 60000)
  const seconds = Math.floor((total % 60000) / 1000)
  if (total < 20000) {
    const tenths = Math.floor((total % 1000) / 100)
    return `${minutes}:${String(seconds).padStart(2, '0')}.${tenths}`
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
