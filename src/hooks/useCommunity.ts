import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { League, PlayingStyle } from '@/types'

export interface PublicProfile {
  id: string
  username: string
  current_league: League
  xp: number
  estimated_elo: number
  playing_style: PlayingStyle | null
  streak_days: number
  city: string | null
  county: string | null
}

export type CommunitySortKey = 'xp' | 'estimated_elo'

interface UseCommunityParams {
  filter: 'region' | 'all'
  sort: CommunitySortKey
  search: string
  userCity?: string | null
}

export function useCommunity({ filter, sort, search, userCity }: UseCommunityParams) {
  return useQuery({
    queryKey: ['community', filter, sort, search, userCity],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('id, username, current_league, xp, estimated_elo, playing_style, streak_days, city, county')
        .order(sort, { ascending: false })
        .limit(40)

      if (filter === 'region' && userCity) {
        query = query.eq('city', userCity)
      }

      if (search.trim()) {
        query = query.ilike('username', `%${search.trim()}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as PublicProfile[]
    },
    staleTime: 60_000,
  })
}
