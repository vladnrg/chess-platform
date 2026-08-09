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
  /** Din ce variantă răsare capcana. */
  fromVariation?: string
  /** Paragraful de încheiere, arătat la capătul liniei. */
  conclusion?: string
  /** Linia nu se rupe în părţi (capcanele au 11–12 semi-mutări). */
  singlePart?: boolean
}

/** Poziţia după primele `pana` semi-mutări dintr-o listă UCI. */
function fenDupa(moves: string, pana: number, dela?: string): string {
  const game = new Chess(dela)
  const lista = moves.split(' ').slice(0, pana)
  for (const m of lista) {
    try {
      game.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m[4] ?? 'q' })
    } catch {
      // Mutare imposibilă în datele semănate: ne oprim aici şi întoarcem poziţia
      // de până acum, exact ca varianta din care a fost mutată funcţia.
      break
    }
  }
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

/**
 * O capcană, modelată ca linie de antrenat.
 *
 * Culoarea nu se scrie de mână, se deduce: dacă victima e cel care ţine
 * deschiderea, tu joci cu cealaltă culoare — fiindcă tu eşti cel care întinde
 * cursa. De aceea capcana are nevoie de varianta din care răsare: de acolo vine
 * `user_color`.
 */
async function linieCapcana(trapId: string, mode: 'guided' | 'practice'): Promise<TrainerLine | null> {
  const { data: trap } = await supabase
    .from('opening_traps')
    .select('*')
    .eq('id', trapId)
    .single()
  if (!trap?.opening_line_id) return null

  const { data: linie } = await supabase
    .from('opening_lines')
    .select('*')
    .eq('id', trap.opening_line_id)
    .single()
  if (!linie) return null

  const alTau = trap.victim === 'ours'
    ? (linie.user_color === 'white' ? 'black' : 'white')
    : linie.user_color

  const exerseaza = mode === 'practice' && trap.spring_ply != null && trap.spring_ply > 0
  const toate = trap.moves_uci.split(' ')

  return {
    ...linie,
    id: trap.id,
    variation_name: trap.title,
    user_color: alTau,
    moves_uci: exerseaza ? toate.slice(trap.spring_ply!).join(' ') : trap.moves_uci,
    // La exerciţiu nu se arată explicaţii, deci nu are rost să le reindexăm.
    move_explanations: exerseaza ? {} : (trap.move_explanations ?? {}),
    start_fen: exerseaza ? fenDupa(trap.moves_uci, trap.spring_ply!) : undefined,
    fromVariation: linie.variation_name,
    conclusion: trap.explanation,
    singlePart: true,
  }
}

export async function incarcaLinie(
  stage: TrainerStage,
  mode: 'guided' | 'practice',
  id: string,
): Promise<TrainerLine | null> {
  if (stage === 'middlegame') return linieJocDeMijloc(id)
  if (stage === 'trap') return linieCapcana(id, mode)
  return linieDeschidere(id)
}
