/**
 * Cât de bună a fost o mutare, după cât de mult a scăzut evaluarea motorului.
 *
 * Aceleaşi praguri ca la analiza partidelor importate din Lichess
 * (components/chess/GameAnalysisModal.tsx), ca o gafă să însemne acelaşi lucru
 * peste tot în aplicaţie.
 */
export type MoveQuality = 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder'

export function qualityOf(drop: number): MoveQuality {
  if (drop < 20) return 'best'
  if (drop < 50) return 'good'
  if (drop < 100) return 'inaccuracy'
  if (drop < 250) return 'mistake'
  return 'blunder'
}

export const QUALITY_LABEL: Record<MoveQuality, string> = {
  best: 'cea mai bună',
  good: 'bună',
  inaccuracy: 'imprecizie',
  mistake: 'greșeală',
  blunder: 'gafă',
}

export const QUALITY_COLOR: Record<MoveQuality, string> = {
  best: '#4ade80',
  good: '#A0A0A0',
  inaccuracy: '#fbbf24',
  mistake: '#f97316',
  blunder: '#FB7185',
}
