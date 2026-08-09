import { Chess } from 'chess.js'
import { supabase } from '@/lib/supabase'
import type { OpeningLine } from '@/types'

export type TrainerStage = 'opening' | 'middlegame' | 'trap'

/** Planul din spatele mutărilor: structura, ideile şi greşeala tipică. */
export interface MiddlegamePlan {
  structure: string | null
  ideas: { title: string; detail: string }[]
  avoid: string | null
}

/**
 * Linia antrenată, oricare ar fi etapa.
 *
 * Jocul de mijloc şi capcanele pornesc din poziţii deja jucate, deci nu mai e
 * adevărat că semi-mutarea 0 e a albului — de aceea `start_fen`.
 */
export type TrainerLine = OpeningLine & {
  /** Poziţia de plecare. Lipsă = poziţia iniţială a partidei. */
  start_fen?: string
  /** Doar la etapa de joc de mijloc. */
  plan?: MiddlegamePlan
}

/** Poziţia după primele `pana` semi-mutări dintr-o listă UCI. */
function fenDupa(moves: string, pana: number, dela?: string): string {
  const game = new Chess(dela)
  moves.split(' ').slice(0, pana).forEach(m => {
    try { game.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m[4] ?? 'q' }) }
    catch { /* mutare imposibilă în datele semănate — ne oprim aici */ }
  })
  return game.fen()
}

async function linieDeschidere(lineId: string): Promise<TrainerLine | null> {
  const { data } = await supabase.from('opening_lines').select('*').eq('id', lineId).single()
  return (data as OpeningLine | null) ?? null
}

async function linieJocDeMijloc(lineId: string): Promise<TrainerLine | null> {
  const opening = await linieDeschidere(lineId)
  if (!opening) return null

  const { data: plan } = await supabase
    .from('middlegame_plans')
    .select('moves_uci, move_explanations, structure, ideas, avoid')
    .eq('opening_line_id', opening.id)
    .single()
  if (!plan?.moves_uci) return null

  return {
    ...opening,
    moves_uci: plan.moves_uci,
    move_explanations: (plan.move_explanations ?? {}) as Record<string, string>,
    // Poziţia de la capătul deschiderii, reconstruită — ca să nu ţinem un FEN
    // duplicat în baza de date.
    start_fen: fenDupa(opening.moves_uci, opening.moves_uci.split(' ').length),
    plan: {
      structure: plan.structure,
      ideas: plan.ideas ?? [],
      avoid: plan.avoid,
    },
  }
}

export async function incarcaLinie(
  stage: TrainerStage,
  _mode: 'guided' | 'practice',
  id: string,
): Promise<TrainerLine | null> {
  if (stage === 'middlegame') return linieJocDeMijloc(id)
  if (stage === 'trap') return null // primeşte trup în etapa următoare
  return linieDeschidere(id)
}
