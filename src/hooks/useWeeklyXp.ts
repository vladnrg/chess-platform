import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { getCurrentWeekStart } from '@/lib/utils'

export function useWeeklyXp() {
  const { user } = useAuth()
  const weekStart = getCurrentWeekStart().toISOString().split('T')[0]

  const { data: weeklyXp, isLoading } = useQuery({
    queryKey: ['weekly-xp', user?.id, weekStart],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_weekly_xp')
        .select('xp_earned')
        .eq('user_id', user!.id)
        .eq('week_start', weekStart)
        .maybeSingle()
      // Într-o săptămână fără activitate nu există rând — 0, nu eroare
      if (error) throw error
      return data?.xp_earned ?? 0
    },
    enabled: !!user,
  })

  return { weeklyXp: weeklyXp ?? 0, loading: !!user && isLoading }
}
