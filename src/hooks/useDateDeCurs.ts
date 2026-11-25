import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { DateDeCurs } from '@/lib/capitole-curs'

/**
 * Capcanele unui curs de deschideri (planurile de joc de mijloc nu mai sunt paşi, din 2026-11-25).
 *
 * Fără ele, traseul ar avea paşi care duc în pagini goale: nu orice variantă
 * are un plan scris, şi nu orice deschidere are capcane.
 *
 * Aceeaşi cheie de cache pentru cuprinsul cursului şi pentru Bârlog — dacă
 * intri pe curs de pe pagina de start, răspunsul e deja acolo.
 */
export function useDateDeCurs(slug: string | undefined) {
  return useQuery({
    queryKey: ['course-middlegame', slug],
    enabled: !!slug,
    queryFn: async (): Promise<DateDeCurs> => {
      const { data } = await supabase.rpc('course_middlegame', { p_slug: slug! })
      return {
        capcane: (data?.traps ?? []).filter(t => t.opening_line_id),
      }
    },
  })
}
