import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Subscription } from '@/types'
import { useAuth } from './useAuth'

export function useSubscription() {
  const { user } = useAuth()

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle()
      // maybeSingle → lipsa abonamentului nu e eroare, doar `null`
      if (error) throw error
      return data as Subscription | null
    },
    enabled: !!user,
  })

  const isPro = subscription?.status === 'active' || subscription?.status === 'trialing'

  return { subscription: subscription ?? null, isPro, loading: !!user && isLoading }
}
