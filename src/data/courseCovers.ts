import { Chess } from 'chess.js'

// Secvența de mutări (UCI) care duce la poziția-semnătură a fiecărei deschideri.
// Aceasta e randată ca mini-tablă pe cardul cursului — poziția E simbolul deschiderii.
const COVER_MOVES: Record<string, string> = {
  // White openings
  'london-system':        'd2d4 d7d5 g1f3 g8f6 c1f4 e7e6',
  'italian-game':         'e2e4 e7e5 g1f3 b8c6 f1c4 f8c5',
  'kings-gambit':         'e2e4 e7e5 f2f4',
  'queens-gambit':        'd2d4 d7d5 c2c4',
  'catalan-opening':      'd2d4 g8f6 c2c4 e7e6 g2g3 d7d5 f1g2',
  'ruy-lopez':            'e2e4 e7e5 g1f3 b8c6 f1b5 a7a6',
  'english-opening':      'c2c4 c7c5 g1f3 b8c6 b1c3 g8f6 g2g3',
  'kings-indian-attack':  'g1f3 d7d5 g2g3 c7c5 f1g2 b8c6 e1g1',
  'colle-system':         'd2d4 d7d5 g1f3 g8f6 e2e3 e7e6 f1d3',
  'vienna-game':          'e2e4 e7e5 b1c3 g8f6 f1c4',
  // Black defenses
  'sicilian-defense':     'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 a7a6',
  'french-defense':       'e2e4 e7e6 d2d4 d7d5 b1c3 f8b4',
  'caro-kann-defense':    'e2e4 c7c6 d2d4 d7d5 b1c3 d5e4',
  'kings-indian-defense': 'd2d4 g8f6 c2c4 g7g6 b1c3 f8g7 e2e4 d7d6',
  'nimzo-indian-defense': 'd2d4 g8f6 c2c4 e7e6 b1c3 f8b4',
  'dutch-defense':        'd2d4 f7f5 g2g3 g8f6 f1g2 g7g6',
  'slav-defense':         'd2d4 d7d5 c2c4 c7c6 g1f3 g8f6',
  'pirc-defense':         'e2e4 d7d6 d2d4 g8f6 b1c3 g7g6',
  'scandinavian-defense': 'e2e4 d7d5 e4d5 d8d5 b1c3 d5a5',
  'alekhine-defense':     'e2e4 g8f6 e4e5 f6d5 d2d4 d7d6',
}

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
const cache = new Map<string, string>()

// FEN-ul poziției-semnătură pentru un curs (memoizat). Fallback: poziția inițială.
export function coverFenForSlug(slug: string): string {
  if (cache.has(slug)) return cache.get(slug)!
  const seq = COVER_MOVES[slug]
  if (!seq) {
    cache.set(slug, START_FEN)
    return START_FEN
  }
  try {
    const g = new Chess()
    for (const uci of seq.split(' ').filter(Boolean)) {
      g.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] ?? undefined })
    }
    const fen = g.fen()
    cache.set(slug, fen)
    return fen
  } catch {
    cache.set(slug, START_FEN)
    return START_FEN
  }
}

// Orientarea: la apărările negrului, arătăm tabla din perspectiva negrului
const BLACK_DEFENSES = new Set([
  'sicilian-defense', 'french-defense', 'caro-kann-defense', 'kings-indian-defense',
  'nimzo-indian-defense', 'dutch-defense', 'slav-defense', 'pirc-defense',
  'scandinavian-defense', 'alekhine-defense',
])

export function coverOrientationForSlug(slug: string): 'white' | 'black' {
  return BLACK_DEFENSES.has(slug) ? 'black' : 'white'
}
