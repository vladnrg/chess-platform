import { useState, useEffect, useCallback } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { X, Brain, Loader2, ChevronRight, ChevronLeft, Lightbulb, CheckCircle2, AlertCircle } from 'lucide-react'
import { useStockfish } from '@/hooks/useStockfish'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { uciToSan } from '@/lib/puzzle-utils'
import { Button } from '@/components/ui/Button'
import type { LichessGame } from './GameListModal'

interface CriticalPosition {
  gameId: string
  opponent: string
  fen: string           // position BEFORE the mistake
  playedUci: string     // what user played (mistake)
  playedSan: string
  bestUci: string       // Stockfish best move
  bestSan: string
  evalDrop: number      // centipawns lost
  moveNumber: number
  playerColor: 'white' | 'black'
  date: string
}

interface Props {
  lichessUsername: string
  onClose: () => void
}

type Phase = 'loading' | 'list' | 'solving'

const DROP_THRESHOLD = 120  // centipawns minimum to count as a mistake

export function PersonalTacticsModal({ lichessUsername, onClose }: Props) {
  const { user } = useAuth()
  const { analyzePositions } = useStockfish()

  const [phase, setPhase] = useState<Phase>('loading')
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('Se descarcă partidele...')
  const [positions, setPositions] = useState<CriticalPosition[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [userMove, setUserMove] = useState<{ from: string; to: string } | null>(null)
  const [moveResult, setMoveResult] = useState<'correct' | 'wrong' | null>(null)
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  const [hintLoading, setHintLoading] = useState(false)
  const [showBest, setShowBest] = useState(false)

  const current = positions[currentIdx] ?? null

  // ── Analysis pipeline ──────────────────────────────────────
  useEffect(() => {
    void run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function run() {
    try {
      // 1. Fetch recent games
      setProgressLabel('Se descarcă partidele de pe Lichess...')
      setProgress(5)

      const res = await fetch(
        `https://lichess.org/api/games/user/${encodeURIComponent(lichessUsername)}?max=5&opening=false&perfType=rapid,blitz,classical&format=json`,
        { headers: { Accept: 'application/x-ndjson' } }
      )
      if (!res.ok) throw new Error('Lichess error')

      const text = await res.text()
      const games: LichessGame[] = text.split('\n').filter(Boolean)
        .map(l => { try { return JSON.parse(l) } catch { return null } })
        .filter(Boolean)

      if (games.length === 0) {
        setPositions([])
        setPhase('list')
        return
      }

      // 2. Collect all (fen, played_uci) pairs per game
      setProgressLabel(`Se analizează ${games.length} partide...`)
      setProgress(15)

      const allCritical: CriticalPosition[] = []
      const gamesSlice = games.slice(0, 3)  // max 3 games to keep it fast

      for (let gi = 0; gi < gamesSlice.length; gi++) {
        const game = gamesSlice[gi]
        const sans = (game.moves ?? '').split(' ').filter(Boolean)
        if (sans.length < 10) continue

        const isWhite = (game.players.white.userId ?? '').toLowerCase() === lichessUsername.toLowerCase()
        const playerColor: 'white' | 'black' = isWhite ? 'white' : 'black'
        const opponent = isWhite
          ? (game.players.black.userId ?? '?')
          : (game.players.white.userId ?? '?')
        const date = new Date(game.createdAt).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' })

        // Replay game, collect fens + played moves
        const g = new Chess()
        const pairs: { fen: string; played: string; moveNum: number; isPlayerMove: boolean }[] = []

        for (let i = 0; i < sans.length; i++) {
          const fenBefore = g.fen()
          try {
            const result = g.move(sans[i])
            if (!result) break
            const uci = result.from + result.to + (result.promotion ?? '')
            const isPlayerMove = isWhite ? (i % 2 === 0) : (i % 2 === 1)
            // Only analyze player's moves (can't miss opponent's tactics here)
            if (isPlayerMove) {
              pairs.push({ fen: fenBefore, played: uci, moveNum: Math.floor(i / 2) + 1, isPlayerMove })
            }
          } catch { break }
        }

        if (pairs.length === 0) continue

        // 3. Analyze positions
        setProgressLabel(`Partida ${gi + 1}/${gamesSlice.length}: analizez ${pairs.length} mutări...`)

        const evals = await analyzePositions(
          pairs.map(p => ({ fen: p.fen, played: p.played })),
          (pct) => {
            const base = 15 + gi * (80 / gamesSlice.length)
            const segment = 80 / gamesSlice.length
            setProgress(Math.round(base + (pct / 100) * segment))
          }
        )

        for (let i = 0; i < evals.length; i++) {
          const ev = evals[i]
          const pair = pairs[i]
          if (ev.drop >= DROP_THRESHOLD && ev.best && ev.best !== ev.played) {
            const bestSan = uciToSan(pair.fen, ev.best)
            const playedSan = uciToSan(pair.fen, ev.played)
            if (bestSan && playedSan) {
              allCritical.push({
                gameId: game.id,
                opponent,
                fen: pair.fen,
                playedUci: ev.played,
                playedSan,
                bestUci: ev.best,
                bestSan,
                evalDrop: ev.drop,
                moveNumber: pair.moveNum,
                playerColor,
                date,
              })
            }
          }
        }
      }

      // Sort by severity, take top 8
      allCritical.sort((a, b) => b.evalDrop - a.evalDrop)
      setPositions(allCritical.slice(0, 8))
      setProgress(100)
      setPhase('list')
    } catch {
      setPositions([])
      setPhase('list')
    }
  }

  // ── Puzzle interaction ────────────────────────────────────
  function startSolving(idx: number) {
    setCurrentIdx(idx)
    setUserMove(null)
    setMoveResult(null)
    setSelectedSquare(null)
    setHint(null)
    setHintLoading(false)
    setShowBest(false)
    setPhase('solving')
  }

  function resetCurrent() {
    setUserMove(null)
    setMoveResult(null)
    setSelectedSquare(null)
    setHint(null)
    setShowBest(false)
  }

  const onPieceDrop = useCallback(({ sourceSquare: from, targetSquare: to }: { sourceSquare: string; targetSquare: string | null }) => {
    if (!to || !current || moveResult !== null) return false
    try {
      const g = new Chess(current.fen)
      const result = g.move({ from, to, promotion: 'q' })
      if (!result) return false
      const uci = from + to
      const isCorrect = uci === current.bestUci.slice(0, 4)
      setUserMove({ from, to })
      setMoveResult(isCorrect ? 'correct' : 'wrong')
      setSelectedSquare(null)
      return true
    } catch { return false }
  }, [current, moveResult])

  const onSquareClick = useCallback(({ square }: { square: string }) => {
    if (!current || moveResult !== null) return
    const g = new Chess(current.fen)
    const piece = g.get(square as Parameters<typeof g.get>[0])
    const isMyPiece = piece && piece.color === (current.playerColor === 'white' ? 'w' : 'b')

    if (!selectedSquare) {
      if (isMyPiece) setSelectedSquare(square)
      return
    }
    if (square === selectedSquare) { setSelectedSquare(null); return }
    if (isMyPiece) { setSelectedSquare(square); return }

    onPieceDrop({ sourceSquare: selectedSquare, targetSquare: square })
  }, [current, moveResult, selectedSquare, onPieceDrop])

  async function askHint() {
    if (!current || !user) return
    setHintLoading(true)
    try {
      const { data } = await supabase.functions.invoke('ai-coach', {
        body: {
          fen: current.fen,
          question: `Sunt în această poziție și joc cu ${current.playerColor === 'white' ? 'Albul' : 'Negrul'}. Am jucat ${current.playedSan} dar era o mutare mai bună disponibilă. Dă-mi un indiciu subtil despre cum să gândesc această poziție — fără să-mi spui mutarea exactă.`,
          context: `Exercițiu tactic extras din partida mea reală vs ${current.opponent}. Mutare nr. ${current.moveNumber}.`,
          userId: user.id,
        },
      })
      if (data?.answer) setHint(data.answer)
    } finally {
      setHintLoading(false)
    }
  }

  // Board styles
  const squareStyles: Record<string, React.CSSProperties> = {}
  if (selectedSquare) squareStyles[selectedSquare] = { backgroundColor: 'rgba(200,168,75,0.4)' }
  if (moveResult === 'correct' && userMove) {
    squareStyles[userMove.from] = { backgroundColor: 'rgba(74,222,128,0.35)' }
    squareStyles[userMove.to] = { backgroundColor: 'rgba(74,222,128,0.55)' }
  }
  if (moveResult === 'wrong' && userMove) {
    squareStyles[userMove.from] = { backgroundColor: 'rgba(248,113,113,0.35)' }
    squareStyles[userMove.to] = { backgroundColor: 'rgba(248,113,113,0.55)' }
  }
  if (showBest && current) {
    squareStyles[current.bestUci.slice(0, 2)] = { backgroundColor: 'rgba(200,168,75,0.45)' }
    squareStyles[current.bestUci.slice(2, 4)] = { backgroundColor: 'rgba(200,168,75,0.7)' }
  }

  const boardForSolving = (() => {
    if (!current || moveResult === null) return current?.fen ?? null
    const g = new Chess(current.fen)
    try { g.move({ from: userMove!.from, to: userMove!.to, promotion: 'q' }) } catch { /* */ }
    return g.fen()
  })()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 md:p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[95vh] rounded-2xl bg-[#111] border border-[#2a2a2a] shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1e1e1e] flex-shrink-0">
          {phase === 'solving' && (
            <button onClick={() => setPhase('list')} className="text-[#555] hover:text-[#f0f0f0] transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-[#f0f0f0]">Tactici din partidele tale</h2>
            {phase === 'solving' && current && (
              <p className="text-xs text-[#555] mt-0.5">
                Mutarea {current.moveNumber} · vs {current.opponent} · {current.date}
              </p>
            )}
            {phase === 'list' && positions.length > 0 && (
              <p className="text-xs text-[#555] mt-0.5">{positions.length} momente critice găsite</p>
            )}
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-[#f0f0f0] transition-colors flex-shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {/* LOADING */}
          {phase === 'loading' && (
            <div className="flex flex-col items-center justify-center gap-6 py-16 px-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#c8a84b]" />
              <div className="w-full max-w-sm space-y-2">
                <p className="text-sm text-[#888] text-center">{progressLabel}</p>
                <div className="h-1.5 rounded-full bg-[#1e1e1e] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#c8a84b] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-[#555] text-center">{progress}%</p>
              </div>
              <p className="text-xs text-[#444] text-center max-w-xs leading-relaxed">
                Stockfish analizează pozițiile din partidele tale pentru a găsi momentele în care ai putut juca mai bine.
              </p>
            </div>
          )}

          {/* LIST */}
          {phase === 'list' && (
            <div className="p-4 space-y-3">
              {positions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#888] font-medium">Niciun moment critic găsit.</p>
                  <p className="text-[#555] text-sm mt-1">
                    {lichessUsername ? 'Partidele importate sunt foarte bine jucate!' : 'Importă mai întâi partide de pe Lichess.'}
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-[#555] px-1">
                    Selectează o poziție pentru a o antrena:
                  </p>
                  {positions.map((pos, i) => {
                    const severity = pos.evalDrop >= 300 ? { label: 'Gafă', color: '#f87171' }
                      : pos.evalDrop >= 150 ? { label: 'Greșeală', color: '#f97316' }
                      : { label: 'Imprecizie', color: '#fbbf24' }
                    return (
                      <button
                        key={i}
                        onClick={() => startSolving(i)}
                        className="w-full flex items-center gap-3 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] px-4 py-3 text-left hover:border-[#c8a84b] hover:bg-[rgba(200,168,75,0.05)] transition-all group"
                      >
                        <div className="flex-shrink-0 text-left">
                          <div
                            className="text-xs font-bold px-2 py-0.5 rounded"
                            style={{ backgroundColor: severity.color + '20', color: severity.color }}
                          >
                            {severity.label}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#f0f0f0] group-hover:text-[#c8a84b] transition-colors">
                            Mutarea {pos.moveNumber} vs {pos.opponent}
                          </p>
                          <p className="text-xs text-[#555] mt-0.5">
                            {pos.date} · ai jucat {pos.playedSan} · pierdere {Math.round(pos.evalDrop / 100 * 10) / 10} pioni
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[#444] group-hover:text-[#c8a84b] transition-colors flex-shrink-0" />
                      </button>
                    )
                  })}
                </>
              )}
            </div>
          )}

          {/* SOLVING */}
          {phase === 'solving' && current && (
            <div className="p-4 space-y-4">
              {/* Instruction */}
              <div className="rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] px-4 py-3">
                <p className="text-sm text-[#f0f0f0] font-medium">
                  Joci cu {current.playerColor === 'white' ? '♔ Albul' : '♚ Negrul'} — mutarea {current.moveNumber}
                </p>
                <p className="text-xs text-[#666] mt-1">
                  Ai jucat <span className="font-mono text-[#f87171] font-semibold">{current.playedSan}</span>{' '}
                  dar exista o mutare mai buna. Gaseste-o!
                </p>
              </div>

              {/* Board */}
              <div className="rounded-xl overflow-hidden border border-[#2a2a2a]">
                <Chessboard
                  options={{
                    position: moveResult !== null ? (boardForSolving ?? current.fen) : current.fen,
                    boardOrientation: current.playerColor,
                    allowDragging: moveResult === null,
                    onPieceDrop,
                    onSquareClick,
                    squareStyles,
                    darkSquareStyle: { backgroundColor: '#3d5c3a' },
                    lightSquareStyle: { backgroundColor: '#c8e6c0' },
                  }}
                />
              </div>

              {/* Result feedback */}
              {moveResult === 'correct' && (
                <div className="rounded-lg bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.3)] p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#4ade80]" />
                    <p className="font-bold text-[#4ade80]">Excelent! Ai găsit cea mai bună mutare!</p>
                  </div>
                  <p className="text-sm text-[#888]">
                    <span className="font-mono font-semibold text-[#4ade80]">{current.bestSan}</span>{' '}
                    era cu {Math.round(current.evalDrop / 100 * 10) / 10} pioni mai bună decât {current.playedSan}.
                  </p>
                  <div className="flex gap-2 pt-1">
                    {currentIdx < positions.length - 1 && (
                      <Button size="sm" onClick={() => startSolving(currentIdx + 1)} className="gap-2">
                        Poziția următoare <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button size="sm" variant="secondary" onClick={() => setPhase('list')}>
                      Toate pozițiile
                    </Button>
                  </div>
                </div>
              )}

              {moveResult === 'wrong' && (
                <div className="rounded-lg bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.3)] p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-[#f87171]" />
                    <p className="text-sm font-semibold text-[#f87171]">Nu e cea mai bună mutare. Mai încearcă!</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="secondary" onClick={resetCurrent}>
                      Încearcă din nou
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-2"
                      onClick={askHint}
                      disabled={hintLoading}
                    >
                      {hintLoading
                        ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Gândesc...</>
                        : <><Lightbulb className="h-3.5 w-3.5" /> Indiciu de la Dl. En Passant</>
                      }
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setShowBest(v => !v)}
                    >
                      {showBest ? 'Ascunde mutarea' : 'Arată mutarea optimă'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Hint from AI Coach */}
              {hint && (
                <div className="rounded-xl bg-[rgba(200,168,75,0.07)] border border-[rgba(200,168,75,0.25)] p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-[#c8a84b]" />
                    <p className="text-xs font-semibold text-[#c8a84b] uppercase tracking-wider">Dl. En Passant</p>
                  </div>
                  <p className="text-sm text-[#c0a060] leading-relaxed">{hint}</p>
                </div>
              )}

              {/* Navigation dots */}
              {positions.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-2">
                  {positions.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => startSolving(i)}
                      className="rounded-full transition-all"
                      style={{
                        width: i === currentIdx ? 20 : 8,
                        height: 8,
                        backgroundColor: i === currentIdx ? '#c8a84b' : '#2a2a2a',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
