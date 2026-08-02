import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
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
 * Clasamentul unei ligi, ordonat după XP total.
 *
 * De ce XP total şi nu XP-ul săptămânal, care ar fi mai potrivit pentru competiţia
 * de promovare/retrogradare: regula de acces din baza de date lasă fiecare
 * utilizator să-şi vadă doar propriul rând din `user_weekly_xp`. Un clasament
 * săptămânal ar cere mai întâi o modificare acolo.
 *
 * Ordonarea după XP total rămâne oricum semnificativă: ligile sunt intervale de XP,
 * deci poziţia arată direct cine e mai aproape de promovare.
 */
export function useLeagueLeaderboard(league: League | undefined) {
  return useQuery({
    queryKey: ['league-leaderboard', league],
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
