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
    playMove,
  }
}

/**
 * Timpul rămas al unei culori, la momentul `now`.
 *
 * Funcţie pură, nu hook: cine are nevoie de un ceas care curge îşi porneşte
 * propriul ticker, ca actualizarea lui să nu redeseneze şi tabla. Un ticker în
 * pagină ar fi însemnat cinci randări pe secundă ale întregii table — exact
 * genul de lucru care face mutările să pară că vin cu întârziere.
 */
export function timeLeft(match: Match | undefined, color: 'w' | 'b', now: number): number {
  if (!match) return 0
  const stored = color === 'w' ? match.white_time_ms : match.black_time_ms
  // Partidă încheiată: ceasurile îngheaţă la valorile finale
  if (match.status !== 'active' || match.turn !== color) return Math.max(0, stored)

  const elapsed = Math.max(0, now - new Date(match.last_move_at).getTime())
  return Math.max(0, stored - elapsed)
}

/** Un ceas care curge, izolat în componenta care îl afişează. */
export function useTicker(active: boolean, everyMs = 100) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setNow(Date.now()), everyMs)
    return () => clearInterval(id)
  }, [active, everyMs])

  return now
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
