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

export async function fetchLichessDailyPuzzle(): Promise<LichessPuzzle> {
  const res = await fetch(`${LICHESS_BASE}/puzzle/daily`)
  if (!res.ok) throw new Error('Lichess daily puzzle fetch failed')
  return res.json() as Promise<LichessPuzzle>
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
