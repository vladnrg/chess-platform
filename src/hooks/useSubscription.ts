import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Subscription } from '@/types'
import { useAuth } from './useAuth'

export function useSubscription() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }

    void supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        setSubscription(data as Subscription | null)
        setLoading(false)
      })
  }, [user])

  const isPro = subscription?.status === 'active' || subscription?.status === 'trialing'

  return { subscription, isPro, loading }
}
