const LICHESS_BASE = 'https://lichess.org/api'

export interface LichessPuzzle {
  puzzle: {
    id: string
    rating: number
    themes: string[]
    solution: string[]
    initialPly: number
  }
  game: {
    id: string
    pgn: string
    players: unknown[]
  }
}

export type LichessDifficulty = 'easiest' | 'easier' | 'normal' | 'harder' | 'hardest'

export function eloToDifficulty(elo: number): LichessDifficulty {
  if (elo <= 800) return 'easiest'
  if (elo <= 1000) return 'easier'
  if (elo <= 1300) return 'normal'
  if (elo <= 1600) return 'harder'
  return 'hardest'
}

export async function fetchLichessDailyPuzzle(): Promise<LichessPuzzle> {
  const res = await fetch(`${LICHESS_BASE}/puzzle/daily`)
  if (!res.ok) throw new Error('Lichess daily puzzle fetch failed')
  return res.json() as Promise<LichessPuzzle>
}

export async function fetchLichessPuzzleNext(difficulty: LichessDifficulty, angle?: string): Promise<LichessPuzzle> {
  const params = new URLSearchParams({ difficulty })
  if (angle) params.set('angle', angle)
  const res = await fetch(`${LICHESS_BASE}/puzzle/next?${params}`)
  if (!res.ok) throw new Error('Lichess puzzle/next fetch failed')
  return res.json() as Promise<LichessPuzzle>
}

export interface CloudEvalPv {
  moves: string
  cp?: number
  mate?: number
}

export interface CloudEval {
  fen: string
  depth: number
  knodes: number
  pvs: CloudEvalPv[]
}

export async function fetchLichessCloudEval(fen: string, multiPv = 5): Promise<CloudEval | null> {
  try {
    const res = await fetch(`https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}&multiPv=${multiPv}`)
    if (!res.ok) return null
    return res.json() as Promise<CloudEval>
  } catch {
    return null
  }
}

export async function fetchLichessPuzzleById(id: string): Promise<LichessPuzzle> {
  const res = await fetch(`${LICHESS_BASE}/puzzle/${id}`)
  if (!res.ok) throw new Error(`Lichess puzzle ${id} fetch failed`)
  return res.json() as Promise<LichessPuzzle>
}

export interface OpeningMove {
  uci: string
  san: string
  averageRating: number
  white: number
  draws: number
  black: number
}

export interface OpeningData {
  moves: OpeningMove[]
  topGames: unknown[]
}

export async function fetchOpeningExplorer(fen: string, play?: string): Promise<OpeningData> {
  const params = new URLSearchParams({ fen, speeds: 'rapid,classical', ratings: '1600,1800,2000,2200,2500' })
  if (play) params.set('play', play)
  const res = await fetch(`https://explorer.lichess.ovh/lichess?${params}`)
  if (!res.ok) throw new Error('Lichess opening explorer fetch failed')
  return res.json() as Promise<OpeningData>
}
