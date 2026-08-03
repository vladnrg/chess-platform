import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type {
  OpeningChallengeStatus, OpeningSession,
  OpeningAnswerResult, OpeningSessionSummary,
} from '@/types'

const ERRORS: Record<string, string> = {
  not_a_challenge_day: 'Azi nu e zi de provocare. Revino la data următoare.',
  session_not_found: 'Nu găsesc calupul ăsta.',
  session_finished: 'Calupul e deja închis.',
  session_complete: 'Ai răspuns la toate întrebările.',
  session_incomplete: 'Mai ai întrebări fără răspuns.',
  not_enough_questions: 'Nu sunt destule întrebări în bază. Anunță-ne.',
  not_authenticated: 'Trebuie să fii conectat.',
}

function message(error: { message?: string } | null): string {
  const raw = error?.message ?? ''
  const key = Object.keys(ERRORS).find(k => raw.includes(k))
  return key ? ERRORS[key] : 'Ceva n-a mers. Încearcă din nou.'
}

/** Starea provocării de azi: e zi de provocare? am început? am terminat? */
export function useChallengeStatus() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['opening-challenge-status', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('opening_challenge_status')
      if (error) throw error
      return data as OpeningChallengeStatus | null
    },
    enabled: !!user,
    staleTime: 60_000,
  })
}

/**
 * Porneşte calupul de azi, sau îl continuă dacă a fost deja început.
 * Serverul e idempotent: două apeluri în aceeaşi zi întorc aceeaşi sesiune.
 */
export function useStartSession() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('start_opening_session')
      if (error) throw new Error(message(error))
      return data as OpeningSession
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['opening-challenge-status', user?.id] })
    },
    onError: (e: Error) => { toast.error(e.message) },
  })
}

/**
 * Un răspuns, definitiv.
 *
 * Nu primeşte indexul întrebării: serverul răspunde mereu la următoarea
 * nerezolvată. Aşa nu se poate sări peste una grea şi nici răspunde de două ori
 * la aceeaşi — ceea ce era chiar problema cu vechiul „încearcă din nou".
 */
export function useAnswerQuestion() {
  return useMutation({
    mutationFn: async ({ sessionId, answer }: { sessionId: string; answer: number }) => {
      const { data, error } = await supabase.rpc('answer_opening_question', {
        p_session_id: sessionId,
        p_answer: answer,
      })
      if (error) throw new Error(message(error))
      return data as OpeningAnswerResult
    },
    onError: (e: Error) => { toast.error(e.message) },
  })
}

/** Închide calupul şi acordă XP-ul. XP-ul poate fi şi negativ. */
export function useFinishSession() {
  const { user, fetchProfile } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase.rpc('finish_opening_session', {
        p_session_id: sessionId,
      })
      if (error) throw new Error(message(error))
      return data as OpeningSessionSummary
    },
    onSuccess: async () => {
      if (user) await fetchProfile(user.id)
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['opening-challenge-status', user?.id] }),
        qc.invalidateQueries({ queryKey: ['events', user?.id] }),
        qc.invalidateQueries({ queryKey: ['weekly-xp', user?.id] }),
      ])
    },
    onError: (e: Error) => { toast.error(e.message) },
  })
}
