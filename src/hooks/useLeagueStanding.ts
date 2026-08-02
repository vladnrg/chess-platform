import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getCurrentWeekStart } from '@/lib/utils'
import { useAuth } from './useAuth'

export interface LeagueStanding {
  rank: number
  weekly_xp: number
  weekly_min: number
  /** Câţi urcă din liga ta la finalul săptămânii. */
  promote_slots: number
  /** Câţi au atins minimul, deci intră în competiţie. */
  eligible: number
  in_promotion_zone: boolean
}

/**
 * Unde stau în competiţia săptămânală a ligii mele.
 *
 * De când promovarea e competitivă (migrarea 029), liga nu mai depinde de XP-ul
 * total — deci „încă N XP până la liga următoare" nu mai are sens. Ce contează
 * e pe ce loc eşti şi câţi urcă.
 */
export function useLeagueStanding() {
  const { user } = useAuth()
  const weekStart = getCurrentWeekStart().toISOString().split('T')[0]

  return useQuery({
    queryKey: ['league-standing', user?.id, weekStart],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('my_league_standing', { p_week_start: weekStart })
      if (error) throw error
      return data as LeagueStanding | null
    },
    enabled: !!user,
    staleTime: 60_000,
  })
}
