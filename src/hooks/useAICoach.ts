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
      const msg = e instanceof Error ? e.message : 'Nu am putut lua legătura cu Căluțul savant. Mai încearcă.'
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

/** Verdictul şi notele pentru linia care refută mutarea greşită. */
export interface Refutation {
  verdict: string
  /** Câte o notă per semi-mutare din linie, în ordine. Poate fi goală. */
  notes: string[]
}

/**
 * „De ce nu merge mutarea mea": un singur apel pentru toată linia.
 *
 * Motorul calculează refutarea, iar Căluţul savant o comentează mutare cu
 * mutare. Nu cerem câte o explicaţie pe mutare, fiindcă un cont gratuit are
 * trei întrebări pe zi — n-ar apuca să vadă nici o refutare întreagă.
 */
export function useRefutation() {
  const { user } = useAuth()
  const [data, setData] = useState<Refutation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function explain(args: {
    /** Poziţia de dinaintea mutării greşite. */
    fen: string
    playerMoveSan: string
    bestMoveSan: string
    /** Linia motorului după mutarea greşită, în notaţie SAN. */
    lineSan: string[]
  }) {
    if (!user) { setError('Trebuie să fii autentificat.'); return }
    setLoading(true)
    setError(null)
    setData(null)

    const context = [
      `Jucătorul a jucat ${args.playerMoveSan}, care e greșit.`,
      `Mutarea corectă era ${args.bestMoveSan}.`,
      `După ${args.playerMoveSan}, motorul arată această continuare: ${args.lineSan.join(' ')}.`,
      `Linia are ${args.lineSan.length} mutări, deci dă exact ${args.lineSan.length} note.`,
    ].join(' ')

    try {
      const { data: res, error: fnError } = await supabase.functions.invoke('ai-coach', {
        body: {
          fen: args.fen,
          question: `De ce nu merge ${args.playerMoveSan}?`,
          context,
          userId: user.id,
          mode: 'refutation',
        },
      })
      if (fnError) throw fnError
      if (res?.error) throw new Error(res.error)
      setData({ verdict: res?.verdict ?? '', notes: res?.notes ?? [] })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Nu am putut lua legătura cu Căluțul savant.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setData(null)
    setError(null)
  }

  return { explain, data, loading, error, reset }
}
