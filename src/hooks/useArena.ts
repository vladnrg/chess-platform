import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { ArenaDrawRow } from '@/lib/supabase'
import type { ArenaRoundResult } from '@/lib/arena'

/** Câte cursuri trebuie parcurse ca proba să se deschidă. */
export const ARENA_MIN_COURSES = 3

/** Câte runde are o probă. */
export const ARENA_ROUNDS = 3

export interface ArenaStats {
  eligible_courses: number
  runs: number
  best_cp: number | null
  best_week_cp: number | null
  last_at: string | null
}

/** Starea ta: eşti pregătit pentru probă şi cum ai stat până acum. */
export function useArenaStats() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['arena-stats', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<ArenaStats> => {
      const { data, error } = await supabase.rpc('my_arena_stats')
      if (error) throw error
      return data as ArenaStats
    },
  })
}

/**
 * Trage la sorţi o probă nouă.
 *
 * Nu e `useQuery`: tragerea la sorţi e o acţiune, nu o citire. Pusă în cache, ar
 * da aceleaşi trei runde la fiecare intrare pe pagină.
 */
export function useArenaDraw() {
  return useMutation({
    mutationFn: async (): Promise<ArenaDrawRow[]> => {
      const { data, error } = await supabase.rpc('arena_draw', { p_rounds: ARENA_ROUNDS })
      if (error) throw error
      return (data ?? []) as ArenaDrawRow[]
    },
  })
}

export function useArenaSubmit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      targetElo: number
      durationMs: number
      rounds: ArenaRoundResult[]
    }) => {
      const { data, error } = await supabase.rpc('arena_submit', {
        p_target_elo: payload.targetElo,
        p_duration_ms: payload.durationMs,
        p_rounds: payload.rounds,
      })
      if (error) throw error
      return data as { run_id: string; score_cp: number; rounds: number; xp: number }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['arena-stats'] })
      void qc.invalidateQueries({ queryKey: ['arena-leaderboard'] })
      // Proba dă XP, deci mişcă şi liga, şi streak-ul.
      void qc.invalidateQueries({ queryKey: ['profile'] })
      void qc.invalidateQueries({ queryKey: ['streak-week'] })
    },
  })
}

export function useArenaLeaderboard(period: 'week' | 'all') {
  return useQuery({
    queryKey: ['arena-leaderboard', period],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('arena_leaderboard', {
        p_period: period,
        p_limit: 50,
      })
      if (error) throw error
      return data ?? []
    },
  })
}
