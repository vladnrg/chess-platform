import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export function useAICoach() {
  const { user } = useAuth()
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function ask(fen: string, question: string, context = '') {
    if (!user) { setError('Trebuie să fii autentificat.'); return }
    setLoading(true)
    setError(null)
    setAnswer('')
    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-coach', {
        body: { fen, question, context, userId: user.id },
      })
      if (fnError) throw fnError
      if (data?.error) throw new Error(data.error)
      setAnswer(data?.answer ?? '')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Eroare la conectarea cu AI Coach-ul.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setAnswer('')
    setError(null)
  }

  return { ask, answer, loading, error, reset }
}
