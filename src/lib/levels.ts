/**
 * Nivelul jucătorului — progresul permanent, calculat din XP-ul total.
 *
 * Diferenţa faţă de ligă: **nivelul nu scade niciodată**. Liga e competiţia
 * săptămânală şi poate retrograda; nivelul e ce ai adunat, şi rămâne al tău.
 * Amândouă pornesc din acelaşi XP, dar spun lucruri diferite.
 *
 * Nu are nevoie de nimic în baza de date: XP-ul există deja şi vine din
 * puzzle-uri, lecţii şi cursuri. Nivelul e doar o citire a lui.
 */

export const MAX_LEVEL = 100

/**
 * Cele două constante care dau forma progresiei. Se reglează AICI.
 *
 * `BASE`  — cât XP costă primul nivel. Mai mic = primele niveluri vin mai repede.
 * `CURVE` — cât de repede se îngreunează. 1 ar fi liniar; peste 2 înseamnă că
 *           fiecare nivel costă simţitor mai mult decât precedentul.
 */
const BASE = 5
const CURVE = 2.2

/** XP-ul total necesar ca să atingi nivelul dat. Nivelul 1 începe de la 0. */
export function xpForLevel(level: number): number {
  const clamped = Math.max(1, Math.min(MAX_LEVEL, Math.floor(level)))
  return Math.round(BASE * Math.pow(clamped - 1, CURVE))
}

/** Nivelul corespunzător unui XP total. */
export function levelFromXp(xp: number): number {
  if (xp <= 0) return 1
  const level = Math.floor(Math.pow(xp / BASE, 1 / CURVE)) + 1
  return Math.max(1, Math.min(MAX_LEVEL, level))
}

export interface LevelProgress {
  level: number
  /** XP adunat în interiorul nivelului curent. */
  xpInLevel: number
  /** Cât XP are nivelul curent, de la un capăt la altul. */
  xpForThisLevel: number
  /** Cât mai lipseşte până la nivelul următor; `null` la nivelul maxim. */
  xpToNext: number | null
  /** Procentul din nivelul curent, pentru bara de progres. */
  percent: number
  isMax: boolean
}

/** Tot ce trebuie ca să desenezi starea de nivel a unui jucător. */
export function levelProgress(xp: number): LevelProgress {
  const level = levelFromXp(xp)
  const isMax = level >= MAX_LEVEL

  if (isMax) {
    return { level: MAX_LEVEL, xpInLevel: 0, xpForThisLevel: 0, xpToNext: null, percent: 100, isMax: true }
  }

  const start = xpForLevel(level)
  const next = xpForLevel(level + 1)
  const span = Math.max(1, next - start)
  const xpInLevel = Math.max(0, xp - start)

  return {
    level,
    xpInLevel,
    xpForThisLevel: span,
    xpToNext: Math.max(0, next - xp),
    percent: Math.min(100, Math.round((xpInLevel / span) * 100)),
    isMax: false,
  }
}
