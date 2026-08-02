import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase, type MatchChallenge } from '@/lib/supabase'
import { useAuth } from './useAuth'

const CHALLENGE_ERRORS: Record<string, string> = {
  league_too_far: 'Poți juca doar cu jucători din liga ta, una mai jos sau una mai sus.',
  challenge_already_pending: 'I-ai trimis deja o provocare. Așteaptă răspunsul.',
  cannot_challenge_self: 'Nu poți juca împotriva ta.',
  challenge_expired: 'Provocarea a expirat.',
  challenge_not_pending: 'Provocarea nu mai e valabilă.',
}

function message(error: { message?: string } | null): string {
  const raw = error?.message ?? ''
  const key = Object.keys(CHALLENGE_ERRORS).find(k => raw.includes(k))
  return key ? CHALLENGE_ERRORS[key] : 'Ceva n-a mers. Încearcă din nou.'
}

/** Provocările primite şi încă valabile. */
export function useIncomingChallenges() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['challenges-incoming', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('match_challenges')
        .select('*')
        .eq('to_user', user!.id)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as MatchChallenge[]
    },
    enabled: !!user,
    // Provocările expiră în 10 minute; nu merită ţinute mult în memorie.
    staleTime: 15_000,
  })

  // Realtime, ca provocarea să apară fără reîncărcare.
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel(`challenges:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'match_challenges', filter: `to_user=eq.${user.id}` },
        () => { void qc.invalidateQueries({ queryKey: ['challenges-incoming', user.id] }) }
      )
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [user, qc])

  return query
}

/** Trimite o provocare. Regula ligilor e verificată pe server. */
export function useSendChallenge() {
  return useMutation({
    mutationFn: async (vars: { toUser: string; rated: boolean; minutes: number; increment: number }) => {
      const { error } = await supabase.rpc('create_challenge', {
        p_to_user: vars.toUser,
        p_rated: vars.rated,
        p_minutes: vars.minutes,
        p_increment: vars.increment,
      })
      if (error) throw error
    },
    onSuccess: () => toast.success('Provocare trimisă. Are 10 minute să răspundă.'),
    onError: (e: { message?: string }) => toast.error(message(e)),
  })
}

/** Acceptă sau refuză. La acceptare, sare direct în partidă. */
export function useRespondChallenge() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (vars: { challengeId: string; accept: boolean }) => {
      const { data, error } = await supabase.rpc('respond_challenge', {
        p_challenge_id: vars.challengeId,
        p_accept: vars.accept,
      })
      if (error) throw error
      return data as string | null
    },
    onSuccess: (matchId) => {
      void qc.invalidateQueries({ queryKey: ['challenges-incoming'] })
      if (matchId) navigate(`/partida/${matchId}`)
    },
    onError: (e: { message?: string }) => toast.error(message(e)),
  })
}

/**
 * Partidele mele active — ca să pot reveni într-una lăsată în urmă.
 * Cine închide fila şi se întoarce trebuie să găsească partida acolo unde a lăsat-o.
 */
export function useActiveMatches() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['active-matches', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('id, white_id, black_id, minutes, rated, turn')
        .eq('status', 'active')
        .or(`white_id.eq.${user!.id},black_id.eq.${user!.id}`)
      if (error) throw error
      return data
    },
    enabled: !!user,
    staleTime: 10_000,
  })
}
