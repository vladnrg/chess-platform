import { useState, useEffect } from 'react'
import { X, Loader2, Trophy, Minus, TrendingDown } from 'lucide-react'
import { GameAnalysisModal } from './GameAnalysisModal'
import { translateOpeningName } from '@/lib/chess-translations'

export interface LichessGame {
  id: string
  players: {
    white: { userId?: string; user?: { name: string }; rating?: number }
    black: { userId?: string; user?: { name: string }; rating?: number }
  }
  winner?: 'white' | 'black'
  opening?: { eco: string; name: string }
  moves: string
  createdAt: number
  perf: string
}

interface Props {
  eco: string
  openingName: string
  lichessUsername: string
  playerColor: 'white' | 'black'
  onClose: () => void
}

export function GameListModal({ eco, openingName, lichessUsername, playerColor, onClose }: Props) {
  const [games, setGames] = useState<LichessGame[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<LichessGame | null>(null)

  useEffect(() => {
    async function fetchGames() {
      try {
        const res = await fetch(
          `https://lichess.org/api/games/user/${encodeURIComponent(lichessUsername)}?max=100&opening=true&perfType=rapid,blitz,classical&format=json`,
          { headers: { Accept: 'application/x-ndjson' } },
        )
        if (!res.ok) throw new Error('Lichess API error')
        const text = await res.text()
        const all: LichessGame[] = text
          .split('\n')
          .filter(Boolean)
          .map(l => { try { return JSON.parse(l) } catch { return null } })
          .filter(Boolean)
        const filtered = all.filter(g => g.opening?.eco === eco).slice(0, 10)
        setGames(filtered)
      } catch {
        setError('Nu am putut încărca partidele de pe Lichess.')
      } finally {
        setLoading(false)
      }
    }
    void fetchGames()
  }, [eco, lichessUsername])

  if (selected) {
    return (
      <GameAnalysisModal
        game={selected}
        lichessUsername={lichessUsername}
        playerColor={playerColor}
        onClose={() => setSelected(null)}
        onBack={() => setSelected(null)}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl bg-[#141414] border border-[#2A2A2A] shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#141414]">
          <div>
            <h2 className="font-bold text-[#F0F0F0]">Partide recente</h2>
            <p className="text-xs text-[#6B6B6B] mt-0.5">{translateOpeningName(openingName)}</p>
          </div>
          <button onClick={onClose} className="text-[#6B6B6B] hover:text-[#F0F0F0] transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-[#6B6B6B]">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Se încarcă partidele...</span>
            </div>
          ) : error ? (
            <p className="text-center text-sm text-[#FB7185] py-8">{error}</p>
          ) : games.length === 0 ? (
            <p className="text-center text-sm text-[#6B6B6B] py-8">
              Nu am găsit partide cu {translateOpeningName(openingName)} pentru @{lichessUsername}.
            </p>
          ) : (
            games.map(game => {
              const isWhite = (game.players.white.userId ?? '').toLowerCase() === lichessUsername.toLowerCase()
              const myColor = isWhite ? 'white' : 'black'
              const opponentPlayer = isWhite ? game.players.black : game.players.white
              const opponentName = opponentPlayer.userId ?? opponentPlayer.user?.name ?? '?'
              const opponentRating = opponentPlayer.rating ?? 0
              const result = !game.winner ? 'draw' : game.winner === myColor ? 'win' : 'loss'
              const date = new Date(game.createdAt).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: '2-digit' })

              return (
                <button
                  key={game.id}
                  onClick={() => setSelected(game)}
                  className="w-full flex items-center gap-3 rounded-xl bg-[#141414] border border-[#2A2A2A] px-4 py-3 text-left hover:border-[#E2B340] hover:bg-[rgba(226,179,64,0.05)] transition-all group"
                >
                  {/* Result icon */}
                  <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    result === 'win' ? 'bg-[rgba(74,222,128,0.15)] text-[#4ade80]' :
                    result === 'loss' ? 'bg-[rgba(251,113,133,0.15)] text-[#FB7185]' :
                    'bg-[#2A2A2A] text-[#A0A0A0]'
                  }`}>
                    {result === 'win' ? <Trophy className="h-3.5 w-3.5" /> :
                     result === 'loss' ? <TrendingDown className="h-3.5 w-3.5" /> :
                     <Minus className="h-3.5 w-3.5" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#F0F0F0] truncate group-hover:text-[#E2B340] transition-colors">
                        vs {opponentName}
                      </span>
                      {opponentRating > 0 && (
                        <span className="text-xs text-[#6B6B6B]">({opponentRating})</span>
                      )}
                    </div>
                    <p className="text-xs text-[#6B6B6B] mt-0.5">
                      {date} · {game.perf} · cu {myColor === 'white' ? 'Albul' : 'Negrul'}
                    </p>
                  </div>

                  <span className="text-xs text-[#E2B340] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    Analizează →
                  </span>
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
