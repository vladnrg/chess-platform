// Sistem de rating pentru puzzle-uri (stil chess.com).
// Benzi de 200 ELO între 400 și 2600; helperi puri, fără efecte secundare.

export const BAND_WIDTH = 200
export const MIN_RATING = 400
export const MAX_RATING = 2600
export const BAND_COUNT = 11 // [400,600) ... [2400,2600)

export interface PuzzleBand {
  index: number
  floor: number
  ceil: number // limită superioară exclusivă (floor + 200)
  label: string // ex. "1400–1600"
}

export const PUZZLE_BANDS: PuzzleBand[] = Array.from({ length: BAND_COUNT }, (_, i) => {
  const floor = MIN_RATING + i * BAND_WIDTH
  return { index: i, floor, ceil: floor + BAND_WIDTH, label: `${floor}–${floor + BAND_WIDTH}` }
})

export function clampRating(r: number): number {
  return Math.max(MIN_RATING, Math.min(MAX_RATING, Math.round(r)))
}

export function bandIndex(rating: number): number {
  return Math.max(0, Math.min(BAND_COUNT - 1, Math.floor((clampRating(rating) - MIN_RATING) / BAND_WIDTH)))
}

export function bandForRating(rating: number): PuzzleBand {
  return PUZZLE_BANDS[bandIndex(rating)]
}

export type BandOffset = -1 | 0 | 1

// Puncte câștigate/pierdute, în funcție de banda puzzle-ului față de a ta.
export function deltaFor(offset: BandOffset, solved: boolean): number {
  if (solved) return offset === -1 ? 3 : offset === 0 ? 5 : 7
  return offset === -1 ? -7 : offset === 0 ? -5 : -3
}

export interface AccessibleBand {
  offset: BandOffset
  band: PuzzleBand
  gain: number // puncte la corect
  loss: number // puncte la greșit (valoare pozitivă)
}

// Cele (până la) 3 benzi accesibile în jurul rating-ului: inferioară / curentă / superioară.
export function accessibleBands(rating: number): AccessibleBand[] {
  const idx = bandIndex(rating)
  const out: AccessibleBand[] = []
  const add = (offset: BandOffset, i: number) => {
    if (i < 0 || i > BAND_COUNT - 1) return
    out.push({ offset, band: PUZZLE_BANDS[i], gain: deltaFor(offset, true), loss: -deltaFor(offset, false) })
  }
  add(-1, idx - 1)
  add(0, idx)
  add(1, idx + 1)
  return out
}

// ---- Plasament: 20 de puzzle-uri progresiv mai grele, acoperind 450→2550 ----
export const PLACEMENT_COUNT = 20

export function placementTargets(): number[] {
  const lo = 450
  const hi = 2550
  const step = (hi - lo) / (PLACEMENT_COUNT - 1)
  return Array.from({ length: PLACEMENT_COUNT }, (_, i) => Math.round(lo + i * step))
}

export interface PlacementResult {
  rating: number
  solved: boolean
}

// Rating brut de plasament = pragul dintre cel mai greu puzzle rezolvat
// și primul nerezolvat de deasupra lui.
export function computePlacementRating(results: PlacementResult[]): number {
  const sorted = [...results].sort((a, b) => a.rating - b.rating)
  const solved = sorted.filter(r => r.solved)
  if (solved.length === 0) return MIN_RATING + 50 // 450
  if (solved.length === sorted.length) return MAX_RATING - 50 // 2550

  const hardestSolved = Math.max(...solved.map(r => r.rating))
  const firstFailAbove = sorted.find(r => !r.solved && r.rating > hardestSolved)
  const crossover = firstFailAbove ? (hardestSolved + firstFailAbove.rating) / 2 : hardestSolved
  return clampRating(crossover)
}

// Rating stocat după plasament = centrul benzii rezultate (floor + 100).
export function placementToStoredRating(rawRating: number): number {
  return bandForRating(rawRating).floor + 100
}
