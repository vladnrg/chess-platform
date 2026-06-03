import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tournament } from '@/types'

export function useCalendar() {
  return useQuery({
    queryKey: ['calendar'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*, participant_count:tournament_participants(count)')
        .eq('is_published', true)
        .gte('starts_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
        .order('starts_at', { ascending: true })

      if (error) throw error
      return (data ?? []) as Tournament[]
    },
    staleTime: 5 * 60_000,
  })
}

export function useTournamentRegistration(tournamentId: string, userId: string | undefined) {
  return useQuery({
    queryKey: ['tournament-registered', tournamentId, userId],
    queryFn: async () => {
      if (!userId) return false
      const { data } = await supabase
        .from('tournament_participants')
        .select('tournament_id')
        .eq('tournament_id', tournamentId)
        .eq('user_id', userId)
        .maybeSingle()
      return !!data
    },
    enabled: !!userId,
  })
}
