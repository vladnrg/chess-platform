import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getCurrentWeekStart } from '@/lib/utils'
import { useAuth } from './useAuth'

export interface LeagueStanding {
  rank: number
  weekly_xp: number
  /** Câţi oameni sunt în ligă, cu tot cu cei inactivi. */
  members: number
  /** Câţi urcă la finalul săptămânii. 0 în liga supremă. */
  promote_slots: number
  /** Câţi coboară la finalul săptămânii. 0 în prima ligă. */
  relegate_slots: number
  in_promotion_zone: boolean
  in_relegation_zone: boolean
  /** Câte scuturi de retrogradare îi mai rămân. */
  shields_left: number
}

/**
 * Unde stau în clasamentul ligii mele.
 *
 * De la migrarea 038, liga se decide numai pe clasament: primii o treime urcă,
 * ultimii o treime coboară, restul rămân. Nu mai există prag minim de XP, deci
 * ce contează e exclusiv pe ce loc eşti.
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
