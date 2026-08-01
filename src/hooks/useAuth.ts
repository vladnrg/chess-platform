import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export function useAuthInit() {
  const { setSession } = useAuthStore()

  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      useAuthStore.setState({ initialized: true, loading: false })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      useAuthStore.setState({ initialized: true, loading: false })
    })

    return () => subscription.unsubscribe()
  }, [setSession])
}

export function useAuth() {
  return useAuthStore()
}
