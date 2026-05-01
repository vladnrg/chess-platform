import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { getCurrentWeekStart } from '@/lib/utils'

export function useWeeklyXp() {
  const { user } = useAuth()
  const [weeklyXp, setWeeklyXp] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    const weekStart = getCurrentWeekStart().toISOString().split('T')[0]
    void supabase
      .from('user_weekly_xp')
      .select('xp_earned')
      .eq('user_id', user.id)
      .eq('week_start', weekStart)
      .single()
      .then(({ data }: any) => {
        setWeeklyXp(data?.xp_earned ?? 0)
        setLoading(false)
      })
  }, [user])

  return { weeklyXp, loading }
}
