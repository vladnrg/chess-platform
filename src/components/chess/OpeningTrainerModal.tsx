import { useState, useEffect, useCallback, useRef } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { X, ChevronLeft, ChevronRight, RotateCcw, Brain } from 'lucide-react'
import { useStockfish } from '@/hooks/useStockfish'
import { cn } from '@/lib/utils'

interface Props {
  openingName: string
  playerColor: 'white' | 'black'
  elo: number
  onClose: () => void
}

type GameStatus = 'playing' | 'thinking' | 'won' | 'lost' | 'draw'

const ELO_LABELS: Record<number, string> = {
  1600: 'Avansat', 1700: 'Avansat+', 1800: 'Expert',
  1900: 'Expert+', 2000: 'Master candidat', 2100: 'Master candidat+',
  2200: 'FM', 2300: 'FM+', 2400: 'IM', 2500: 'IM+',
  2600: 'GM', 2700: 'GM Elite', 2800: 'Super GM', 2900: 'Top 10', 3000: 'Motor'
}

export function OpeningTrainerModal({ openingName, playerColor, elo, onClose }: Props) {
  const [game, setGame] = useState(new Chess())
  const [status, setStatus] = useState<GameStatus>('playing')
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const { getBestMove } = useStockfish()
  const isEngineMoving = useRef(false)

  const checkGameEnd = useCallback((g: Chess): GameStatus | null => {
    if (g.isCheckmate()) return g.turn() === playerColor[0] ? 'lost' : 'won'
    if (g.isDraw() || g.isStalemate() || g.isThreefoldRepetition()) return 'draw'
    return null
  }, [playerColor])

  const makeEngineMove = useCallback(async (g: Chess) => {
    if (isEngineMoving.current) return
    isEngineMoving.current = true
    setStatus('thinking')
    try {
      const uci = await getBestMove(g.fen(), elo)
      const from = uci.slice(0, 2)
      const to = uci.slice(2, 4)
      const promotion = uci[4] ?? undefined
      const newGame = new Chess(g.fen())
      const result = newGame.move({ from, to, promotion })
      if (result) {
        setLastMove({ from, to })
        setMoveHistory(prev => [...prev, result.san])
        const end = checkGameEnd(newGame)
        setStatus(end ?? 'playing')
        setGame(newGame)
      }
    } catch {
      setStatus('playing')
    } finally {
      isEngineMoving.current = false
    }
  }, [getBestMove, elo, checkGameEnd])

  // Engine moves first if player is Black
  useEffect(() => {
    if (playerColor === 'black' && game.moveNumber() === 1 && game.turn() === 'w') {
      void makeEngineMove(game)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onDrop({ sourceSquare, targetSquare, piece }: { sourceSquare: string; targetSquare: string | null; piece: any }) {
    if (!targetSquare) return false
    if (status !== 'playing') return false
    if ((game.turn() === 'w') !== (playerColor === 'white')) return false

    try {
      const newGame = new Chess(game.fen())
      const pieceStr = String(piece)
      const isPromotion = pieceStr[1] === 'P' &&
        ((playerColor === 'white' && targetSquare[1] === '8') ||
         (playerColor === 'black' && targetSquare[1] === '1'))
      const result = newGame.move({
        from: sourceSquare, to: targetSquare,
        promotion: isPromotion ? 'q' : undefined,
      })
      if (!result) return false

      setLastMove({ from: sourceSquare, to: targetSquare })
      setMoveHistory(prev => [...prev, result.san])
      const end = checkGameEnd(newGame)
      setGame(newGame)
      if (end) { setStatus(end); return true }
      setStatus('playing')
      void makeEngineMove(newGame)
      return true
    } catch {
      return false
    }
  }

  function resetGame() {
    isEngineMoving.current = false
    const g = new Chess()
    setGame(g)
    setMoveHistory([])
    setLastMove(null)
    setStatus('playing')
    if (playerColor === 'black') {
      setTimeout(() => void makeEngineMove(g), 300)
    }
  }

  const squareStyles: Record<string, React.CSSProperties> = {}
  if (lastMove) {
    squareStyles[lastMove.from] = { backgroundColor: 'rgba(200,168,75,0.25)' }
    squareStyles[lastMove.to] = { backgroundColor: 'rgba(200,168,75,0.4)' }
  }

  const statusText = {
    playing: `Rândul tău (${playerColor === 'white' ? '♔ Alb' : '♚ Negru'})`,
    thinking: `Dl. En Passant gândește... (${elo} ELO)`,
    won: '🎉 Ai câștigat!',
    lost: '😔 Ai pierdut. Încearcă din nou!',
    draw: '🤝 Remiză',
  }[status]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-3xl rounded-2xl bg-[#111] border border-[#2a2a2a] shadow-2xl flex flex-col md:flex-row overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Board */}
        <div className="flex-shrink-0 w-full md:w-[420px]">
          <Chessboard
            options={{
              position: game.fen(),
              boardOrientation: playerColor,
              allowDragging: status === 'playing',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onPieceDrop: (args: any) => onDrop(args),
              squareStyles,
              darkSquareStyle: { backgroundColor: '#3d5c3a' },
              lightSquareStyle: { backgroundColor: '#c8e6c0' },
            }}
          />
        </div>

        {/* Side panel */}
        <div className="flex flex-col flex-1 p-5 gap-4 min-h-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Brain className="h-4 w-4 text-[#c8a84b]" />
                <span className="text-xs font-semibold text-[#c8a84b] uppercase tracking-wider">Dl. En Passant</span>
              </div>
              <h3 className="font-bold text-[#f0f0f0] text-sm leading-snug">{openingName}</h3>
              <p className="text-xs text-[#555] mt-0.5">
                {elo} ELO · {ELO_LABELS[elo] ?? ''}
              </p>
            </div>
            <button onClick={onClose} className="text-[#555] hover:text-[#f0f0f0] transition-colors flex-shrink-0">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Status */}
          <div className={cn(
            'rounded-lg px-3 py-2 text-sm font-medium text-center',
            status === 'playing' ? 'bg-[#1a1a1a] text-[#a0a0a0]' :
            status === 'thinking' ? 'bg-[rgba(200,168,75,0.1)] text-[#c8a84b]' :
            status === 'won' ? 'bg-[rgba(74,222,128,0.1)] text-[#4ade80]' :
            status === 'lost' ? 'bg-[rgba(248,113,113,0.1)] text-[#f87171]' :
            'bg-[#1a1a1a] text-[#a0a0a0]'
          )}>
            {statusText}
          </div>

          {/* Move history */}
          <div className="flex-1 min-h-0 overflow-y-auto rounded-lg bg-[#0d0d0d] border border-[#1e1e1e] p-2">
            {moveHistory.length === 0 ? (
              <p className="text-xs text-[#444] text-center py-4">Nicio mutare încă</p>
            ) : (
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs font-mono">
                {Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => (
                  <div key={i} className="contents">
                    <div className="flex items-center gap-1.5 rounded px-1.5 py-0.5 hover:bg-[#1a1a1a]">
                      <span className="text-[#444] w-4">{i + 1}.</span>
                      <span className="text-[#f0f0f0]">{moveHistory[i * 2]}</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded px-1.5 py-0.5 hover:bg-[#1a1a1a]">
                      {moveHistory[i * 2 + 1] && (
                        <span className="text-[#a0a0a0]">{moveHistory[i * 2 + 1]}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={resetGame}
              className="flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-2 text-xs text-[#a0a0a0] hover:text-[#f0f0f0] hover:border-[#3a3a3a] transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Resetează
            </button>
            <div className="flex items-center gap-1 ml-auto text-xs text-[#555]">
              <ChevronLeft className="h-4 w-4" />
              <span>mutare</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
