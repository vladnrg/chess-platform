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

/**
 * Apare tactica în cufărul ăsta?
 *
 * Fiecare categorie are un prag (`minTier`) — primul cufăr în care se arată.
 * Peste el se arată în toate: o furculiţă rămâne furculiţă şi la 2400, doar că
 * e ascunsă mai adânc în poziţie. Tăierea se face doar la bază, unde un
 * sacrificiu sau o combinaţie n-au ce căuta.
 */
export function categoryInTier(category: TacticCategory, tier: TacticTier): boolean {
  const jos = TACTIC_TIERS.findIndex(t => t.id === category.minTier)
  const sus = category.maxTier ? TACTIC_TIERS.findIndex(t => t.id === category.maxTier) : TACTIC_TIERS.length - 1
  const acum = TACTIC_TIERS.findIndex(t => t.id === tier.id)
  return jos >= 0 && acum >= jos && acum <= sus
}

/** Câte poziţii are proba unui cufăr. */
export const TRIAL_SIZE = 10

/**
 * Cele zece poziţii ale probei, luate pe rând din fiecare temă a cufărului.
 *
 * Nu se ia „primele zece după id" ca la trasee: aşa ar ieşi zece furculiţe şi
 * proba n-ar mai însemna nimic. Se merge în cerc prin temele cufărului şi se ia
 * câte una din fiecare, până se strâng zece — deci o probă atinge cât mai multe
 * teme diferite, care e chiar rostul ei.
 *
 * Alegerea rămâne fixă (sortare după id, fără aleatoriu), ca progresul să se
 * poată deduce din `user_puzzle_attempts`, exact ca la trasee.
 */
export function pickTrial<T extends PuzzleLike>(
  puzzles: T[],
  categories: TacticCategory[],
  tier: TacticTier,
  size: number = TRIAL_SIZE,
): T[] {
  // Temele arătate în cufărul ăsta. La master nu se mai arată niciuna — acolo
  // proba se întinde peste toate, ceea ce e chiar rostul cufărului de sus.
  const aleCufarului = categories.filter(c => !c.fel && categoryInTier(c, tier))
  const teme = aleCufarului.length > 0 ? aleCufarului : categories.filter(c => !c.fel)
  if (teme.length === 0) return []
  const cozi = teme.map(cat =>
    puzzles
      .filter(p => p.rating >= tier.floor && p.rating < tier.ceil && matchesCategory(p.themes, cat))
      .sort(byId),
  )
  const alese: T[] = []
  const vazute = new Set<string>()
  for (let rand = 0; alese.length < size && rand < 60; rand++) {
    let sAdaugat = false
    for (const coada of cozi) {
      const p = coada[rand]
      if (!p || vazute.has(p.id)) continue
      vazute.add(p.id)
      alese.push(p)
      sAdaugat = true
      if (alese.length === size) break
    }
    if (!sAdaugat) break
  }
  return alese
}

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
