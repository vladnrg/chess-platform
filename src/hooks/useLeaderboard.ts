import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getCurrentWeekStart } from '@/lib/utils'
import type { League, PlayingStyle } from '@/types'

export interface RankedPlayer {
  rank: number
  id: string
  username: string
  xp: number
  streak_days: number
  playing_style: PlayingStyle | null
  city: string | null
}

/**
 * Clasamentul săptămânal al unei ligi — cine a strâns cel mai mult XP în
 * săptămâna curentă. E competiţia care decide promovarea şi retrogradarea.
 *
 * Depinde de migrarea 025: până atunci, regula de acces lasă fiecare utilizator
 * să-şi vadă doar propriul rând din `user_weekly_xp`, deci lista ar avea o
 * singură linie.
 *
 * Cine n-a strâns XP săptămâna asta nu are rând în tabelă, deci nu apare —
 * corect pentru un clasament săptămânal. Pagina îl adaugă separat pe utilizatorul
 * curent dacă lipseşte, ca să-şi vadă totuşi situaţia.
 */
export function useWeeklyLeaderboard(league: League | undefined) {
  const weekStart = getCurrentWeekStart().toISOString().split('T')[0]

  return useQuery({
    queryKey: ['weekly-leaderboard', league, weekStart],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_weekly_xp')
        .select('user_id, xp_earned, profiles(username, city, streak_days, playing_style)')
        .eq('week_start', weekStart)
        .eq('league_at_week_start', league!)
        .order('xp_earned', { ascending: false })
        .limit(50)

      if (error) throw error

      return (data ?? [])
        .filter(row => row.profiles)
        .map((row, i) => ({
          rank: i + 1,
          id: row.user_id,
          username: row.profiles!.username,
          xp: row.xp_earned,
          streak_days: row.profiles!.streak_days,
          playing_style: row.profiles!.playing_style,
          city: row.profiles!.city,
        })) as RankedPlayer[]
    },
    enabled: !!league,
    staleTime: 60_000,
  })
}

/**
 * Clasamentul pe XP total din ligă. Se schimbă lent, dar arată direct cine e mai
 * aproape de promovare — ligile sunt intervale de XP.
 */
export function useTotalLeaderboard(league: League | undefined) {
  return useQuery({
    queryKey: ['total-leaderboard', league],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, xp, streak_days, playing_style, city')
        .eq('current_league', league!)
        .order('xp', { ascending: false })
        .limit(50)

      if (error) throw error

      return (data ?? []).map((p, i) => ({ ...p, rank: i + 1 })) as RankedPlayer[]
    },
    enabled: !!league,
    staleTime: 60_000,
  })
}

/** Câte ore mai sunt până la resetarea săptămânii (luni, 00:00 UTC). */
export function hoursUntilWeekEnd(): number {
  const end = getCurrentWeekStart().getTime() + 7 * 24 * 60 * 60 * 1000
  return Math.max(0, Math.ceil((end - Date.now()) / (60 * 60 * 1000)))
}
