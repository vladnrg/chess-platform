// Trasee de tactici pe niveluri (stil Duolingo).
// Fiecare pereche (categorie × nivel) are un traseu FIX de exerciții, ales determinist:
// puzzle-urile care se potrivesc temei categoriei, în intervalul de ELO al nivelului,
// sortate după `id` (stabil, în JS peste tot) — primele `TACTIC_PATH_SIZE`.
// Progresul se derivă din `user_puzzle_attempts` (solved), fără tabel dedicat.

import type { TacticCategory } from '@/data/tactics'

export interface TacticTier {
  id: string
  label: string
  floor: number
  ceil: number // limită superioară exclusivă
}

// Cele 4 niveluri, mapate peste benzile din puzzle-rating.ts
export const TACTIC_TIERS: TacticTier[] = [
  { id: 'incepator', label: 'Începător', floor: 400, ceil: 1000 },
  { id: 'intermediar', label: 'Intermediar', floor: 1000, ceil: 1600 },
  { id: 'avansat', label: 'Avansat', floor: 1600, ceil: 2200 },
  { id: 'master', label: 'Master', floor: 2200, ceil: 2600 },
]

export const TACTIC_PATH_SIZE = 20

// Minimul necesar pentru selecție/progres (Puzzle complet îl satisface implicit)
interface PuzzleLike {
  id: string
  rating: number
  themes: string[]
}

export function matchesCategory(
  themes: string[] | null | undefined,
  category: TacticCategory,
): boolean {
  if (!themes) return false
  return category.lichessThemes.some(t => themes.includes(t))
}

// Comparator stabil pe id — folosit identic în ambele pagini ca traseele să coincidă.
function byId(a: { id: string }, b: { id: string }): number {
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
}

// Traseul (obiectele puzzle) pentru (categorie, nivel).
export function pickPath<T extends PuzzleLike>(
  puzzles: T[],
  category: TacticCategory,
  tier: TacticTier,
  size: number = TACTIC_PATH_SIZE,
): T[] {
  return puzzles
    .filter(p => p.rating >= tier.floor && p.rating < tier.ceil && matchesCategory(p.themes, category))
    .sort(byId)
    .slice(0, size)
}

// Doar id-urile traseului (pentru calculul rapid al progresului pe pagina de ansamblu).
export function pickPathIds(
  puzzles: PuzzleLike[],
  category: TacticCategory,
  tier: TacticTier,
  size: number = TACTIC_PATH_SIZE,
): string[] {
  return pickPath(puzzles, category, tier, size).map(p => p.id)
}
