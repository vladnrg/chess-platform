import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type {
  SeasonalEvent, SeasonalEventDetail, TaskResult,
  ChessathonProgress, OwnedCosmetic, Cosmetic, CosmeticKind, Puzzle,
} from '@/types'

const EVENT_ERRORS: Record<string, string> = {
  event_closed: 'Evenimentul nu mai e deschis.',
  event_not_found: 'Evenimentul nu există.',
  task_not_found: 'Sarcina nu există.',
  task_not_open: 'Ușa asta încă nu se deschide. Mai ai răbdare.',
  target_not_reached: 'Nu ai atins încă ținta.',
  cosmetic_not_owned: 'Nu ai câștigat încă lucrul ăsta.',
  unknown_cosmetic: 'Nu recunosc recompensa asta.',
  not_authenticated: 'Trebuie să fii conectat.',
}

function message(error: { message?: string } | null): string {
  const raw = error?.message ?? ''
  const key = Object.keys(EVENT_ERRORS).find(k => raw.includes(k))
  return key ? EVENT_ERRORS[key] : 'Ceva n-a mers. Încearcă din nou.'
}

/** Toate evenimentele vizibile: în desfăşurare, viitoare şi încheiate recent. */
export function useEvents() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['events', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('list_events')
      if (error) throw error
      return (data ?? []) as SeasonalEvent[]
    },
    enabled: !!user,
    staleTime: 60_000,
  })
}

/** Un eveniment cu sarcinile lui. Răspunsurile nerezolvate vin fără soluţie. */
export function useEventDetail(slug: string | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['event', slug, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('event_detail', { p_slug: slug! })
      if (error) throw error
      return data as SeasonalEventDetail | null
    },
    enabled: !!user && !!slug,
    staleTime: 30_000,
  })
}

/**
 * Puzzle-ul unei sarcini. Alegerea e stabilă pe server, deci reîncărcarea nu
 * schimbă exerciţiul — altfel s-ar putea reîncerca până pică unul uşor.
 */
export function useTaskPuzzle(taskId: string | undefined) {
  return useQuery({
    queryKey: ['event-task-puzzle', taskId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('event_task_puzzle', { p_task_id: taskId! })
      if (error) throw error
      return data as Puzzle | null
    },
    enabled: !!taskId,
    // Stabil pe server; nu are rost să-l reinterogăm.
    staleTime: Infinity,
  })
}

/**
 * Rezolvarea unei sarcini. Verificarea răspunsului e pe server; aici doar
 * trimitem indexul variantei alese şi arătăm ce s-a câştigat.
 */
export function useCompleteTask(slug: string | undefined) {
  const { user, fetchProfile } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ taskId, answer }: { taskId: string; answer?: number | null }) => {
      const { data, error } = await supabase.rpc('complete_event_task', {
        p_task_id: taskId,
        p_answer: answer ?? null,
      })
      if (error) throw new Error(message(error))
      return data as TaskResult
    },
    onSuccess: async (result) => {
      // Răspuns greşit: nu s-a schimbat nimic în bază, deci nici de reîncărcat.
      if (!result.correct) return

      await Promise.all([
        qc.invalidateQueries({ queryKey: ['event', slug, user?.id] }),
        qc.invalidateQueries({ queryKey: ['events', user?.id] }),
        qc.invalidateQueries({ queryKey: ['my-cosmetics', user?.id] }),
      ])
      // XP-ul a crescut, deci şi nivelul se poate schimba.
      if (result.xp > 0 && user) await fetchProfile(user.id)
    },
    onError: (e: Error) => { toast.error(e.message) },
  })
}

/** Progresul într-un chessathon: cât am strâns eu şi cât comunitatea. */
export function useChessathonProgress(slug: string | undefined, enabled = true) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['chessathon', slug, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('chessathon_progress', { p_slug: slug! })
      if (error) throw error
      return data as ChessathonProgress | null
    },
    enabled: !!user && !!slug && enabled,
    staleTime: 30_000,
  })
}

export function useClaimChessathon(slug: string | undefined) {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('claim_chessathon_reward', { p_slug: slug! })
      if (error) throw new Error(message(error))
      return data as { cosmetic: string; cosmetic_is_new: boolean }
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['chessathon', slug, user?.id] }),
        qc.invalidateQueries({ queryKey: ['my-cosmetics', user?.id] }),
      ])
    },
    onError: (e: Error) => { toast.error(e.message) },
  })
}

/** Cosmeticele pe care le deţin. */
export function useMyCosmetics() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['my-cosmetics', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('my_cosmetics')
      if (error) throw error
      return (data ?? []) as OwnedCosmetic[]
    },
    enabled: !!user,
    staleTime: 5 * 60_000,
  })
}

/**
 * Catalogul complet. Se citeşte public, intenţionat: un premiu pe care nu-l vezi
 * nu motivează pe nimeni.
 */
export function useCosmeticCatalog() {
  return useQuery({
    queryKey: ['cosmetic-catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cosmetics')
        .select('*')
        .order('rarity')
      if (error) throw error
      return (data ?? []) as unknown as Cosmetic[]
    },
    staleTime: 30 * 60_000,
  })
}

export function useEquipCosmetic() {
  const { user, fetchProfile } = useAuth()

  return useMutation({
    mutationFn: async ({ id, kind }: { id: string | null; kind: CosmeticKind }) => {
      const { error } = id === null
        ? await supabase.rpc('unequip_cosmetic', { p_kind: kind })
        : await supabase.rpc('equip_cosmetic', { p_cosmetic_id: id })
      if (error) throw new Error(message(error))
    },
    onSuccess: async () => { if (user) await fetchProfile(user.id) },
    onError: (e: Error) => { toast.error(e.message) },
  })
}
