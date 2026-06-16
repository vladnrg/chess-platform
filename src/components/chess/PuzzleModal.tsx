import { useState, useCallback, useEffect, useRef } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { CheckCircle2, XCircle, RefreshCw, X, Lightbulb, Eye, ListVideo } from 'lucide-react'
import toast from 'react-hot-toast'
import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { initPuzzleState, type PuzzleState } from '@/lib/puzzle-utils'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import type { Puzzle } from '@/types'

const PUZZLE_THEMES: Record<string, string> = {
  fork: 'Bifurcare',
  pin: 'Andocare',
  skewer: 'Frigare',
  mateIn1: 'Mat în 1',
  mateIn2: 'Mat în 2',
  mateIn3: 'Mat în 3',
  discoveredAttack: 'Atac descoperit',
  endgame: 'Final',
  middlegame: 'Mijlocul jocului',
  opening: 'Deschidere',
  hangingPiece: 'Piesă agățată',
  sacrifice: 'Sacrificiu',
  zugzwang: 'Zugzwang',
  promotion: 'Transformare',
  perpetualCheck: 'Șah perpetuu',
  trappedPiece: 'Piesă capturată',
}

interface Props {
  theme: string
  onClose: () => void
}

const FREE_LIMIT = 10

export function PuzzleModal({ theme, onClose }: Props) {
  const { user, profile, fetchProfile } = useAuth()
  const { isPro } = useSubscription()

  const [puzzleState, setPuzzleState] = useState<PuzzleState | null>(null)
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null)
  const [loading, setLoading] = useState(false)
  const [todayCount, setTodayCount] = useState(0)

  // Orientare fixată la încărcare (nu se mai rotește când mută adversarul)
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white')
  // Indicii
  const [hintFrom, setHintFrom] = useState<string | null>(null)   // evidențiază piesa de mutat
  const [showMove, setShowMove] = useState(false)                 // evidențiază mutarea (from+to)
  const [revealed, setRevealed] = useState(false)                 // secvența a fost arătată
  const [seqPlaying, setSeqPlaying] = useState(false)
  const seqAbort = useRef(false)

  const playerElo = profile?.estimated_elo ?? 800

  function clearHints() {
    setHintFrom(null)
    setShowMove(false)
    setRevealed(false)
    setSeqPlaying(false)
    seqAbort.current = true
  }

  // Count today's attempts
  useQuery({
    queryKey: ['today-attempts-modal', user?.id],
    queryFn: async () => {
      if (!user) return 0
      const today = new Date().toISOString().split('T')[0]
      const { count } = await supabase
        .from('user_puzzle_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('attempted_at', `${today}T00:00:00`)
      setTodayCount(count ?? 0)
      return count
    },
    enabled: !!user,
  })

  const attemptMutation = useMutation({
    mutationFn: async ({ solved, timeSeconds }: { solved: boolean; timeSeconds: number }) => {
      if (!user || !currentPuzzle) return
      await supabase.from('user_puzzle_attempts').insert({
        user_id: user.id,
        puzzle_id: currentPuzzle.id,
        solved,
        time_seconds: timeSeconds,
      })
      if (solved) {
        const xp = currentPuzzle.rating < 1000 ? 10 : currentPuzzle.rating < 1500 ? 20 : 30
        await supabase.rpc('award_xp', { p_user_id: user.id, p_amount: xp })
        await fetchProfile(user.id)
        setTodayCount(c => c + 1)
      }
    },
  })

  function loadPuzzle(puzzle: Puzzle) {
    setCurrentPuzzle(puzzle)
    clearHints()
    seqAbort.current = false
    try {
      const state = initPuzzleState(puzzle.fen, puzzle.moves)
      setPuzzleState(state)
      setPlayerColor(state.game.turn() === 'w' ? 'white' : 'black')
    } catch {
      toast.error('Eroare la încărcarea puzzle-ului.')
    }
  }

  async function fetchNextPuzzle() {
    if (!isPro && todayCount >= FREE_LIMIT) return
    setLoading(true)
    try {
      const minRating = Math.max(400, playerElo - 150)
      const maxRating = playerElo + 300
      const { data } = await supabase.from('puzzles').select('*')
        .gte('rating', minRating)
        .lte('rating', maxRating)
        .contains('themes', [theme])
        .limit(30)
      const pool = (data ?? []) as Puzzle[]

      if (pool.length === 0) {
        toast.error('Nu există puzzle-uri pentru această temă.')
        return
      }

      const p = pool[Math.floor(Math.random() * pool.length)]
      loadPuzzle(p)
    } catch (e) {
      console.error('[PuzzleModal] fetchNextPuzzle error:', e)
      toast.error('Nu am putut încărca un puzzle.')
    } finally {
      setLoading(false)
    }
  }

  // Load first puzzle on mount
  useEffect(() => {
    void fetchNextPuzzle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onPieceDrop = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ sourceSquare: source, targetSquare: target }: any): boolean => {
      if (!puzzleState || puzzleState.status !== 'playing' || puzzleState.waitingOpponent) return false
      if (!currentPuzzle) return false

      const expectedMove = puzzleState.solutionMoves[puzzleState.currentMoveIdx]
      if (!expectedMove) return false

      const myMove = source + target

      try {
        const gameCopy = new Chess(puzzleState.game.fen())
        const moved = gameCopy.move({ from: source, to: target, promotion: 'q' })
        if (!moved) return false   // mutare ilegală → snap-back curat

        const isCorrect = myMove === expectedMove.slice(0, 4)

        if (!isCorrect) {
          // Snap-back curat: NU actualizăm poziția, returnăm false (fără glitch)
          setPuzzleState(s => s ? { ...s, status: 'wrong' } : null)
          const elapsed = Math.round((Date.now() - puzzleState.startTime) / 1000)
          attemptMutation.mutate({ solved: false, timeSeconds: elapsed })
          return false
        }

        clearHints()
        const nextIdx = puzzleState.currentMoveIdx + 1
        const isLast = nextIdx >= puzzleState.solutionMoves.length

        if (isLast) {
          setPuzzleState(s => s ? { ...s, game: gameCopy, status: 'correct', currentMoveIdx: nextIdx } : null)
          const elapsed = Math.round((Date.now() - puzzleState.startTime) / 1000)
          toast.success('Corect!')
          attemptMutation.mutate({ solved: true, timeSeconds: elapsed })
          return true
        }

        const opponentMove = puzzleState.solutionMoves[nextIdx]
        setPuzzleState(s => s ? { ...s, game: gameCopy, currentMoveIdx: nextIdx, waitingOpponent: true } : null)

        setTimeout(() => {
          try {
            const g2 = new Chess(gameCopy.fen())
            g2.move({ from: opponentMove.slice(0, 2), to: opponentMove.slice(2, 4), promotion: opponentMove[4] ?? undefined })
            setPuzzleState(s => s ? { ...s, game: g2, currentMoveIdx: nextIdx + 1, waitingOpponent: false } : null)
          } catch { /* skip */ }
        }, 500)

        return true
      } catch {
        return false
      }
    },
    [puzzleState, currentPuzzle, attemptMutation],
  )

  // Mutarea pe care trebuie să o facă jucătorul acum (UCI)
  const expectedNext = puzzleState && puzzleState.status === 'playing'
    ? puzzleState.solutionMoves[puzzleState.currentMoveIdx]
    : undefined
  const expFrom = expectedNext?.slice(0, 2)
  const expTo = expectedNext?.slice(2, 4)

  // Tactică multi-mutare? (mai rămân cel puțin player+adversar+player)
  const isMultiMove = !!puzzleState && puzzleState.solutionMoves.length - puzzleState.currentMoveIdx >= 3

  // Redă întreaga secvență rămasă, pas cu pas
  async function showSequence() {
    if (!puzzleState) return
    seqAbort.current = false
    setSeqPlaying(true)
    setHintFrom(null)
    setShowMove(false)
    const g = new Chess(puzzleState.game.fen())
    const moves = puzzleState.solutionMoves
    for (let i = puzzleState.currentMoveIdx; i < moves.length; i++) {
      if (seqAbort.current) { setSeqPlaying(false); return }
      const m = moves[i]
      try { g.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m[4] ?? 'q' }) } catch { break }
      const fen = g.fen()
      setPuzzleState(s => s ? { ...s, game: new Chess(fen) } : null)
      await new Promise(r => setTimeout(r, 750))
    }
    setSeqPlaying(false)
    setRevealed(true)
  }

  const squareStyles: Record<string, React.CSSProperties> = {}
  if (hintFrom) squareStyles[hintFrom] = { background: 'rgba(200,168,75,0.55)', boxShadow: 'inset 0 0 0 3px #c8a84b' }
  if (showMove && expFrom && expTo) {
    squareStyles[expFrom] = { background: 'rgba(200,168,75,0.45)' }
    squareStyles[expTo] = { background: 'rgba(200,168,75,0.7)' }
  }
  const boardArrows = showMove && expFrom && expTo
    ? [{ startSquare: expFrom, endSquare: expTo, color: '#c8a84b' }]
    : []

  const limitReached = !isPro && todayCount >= FREE_LIMIT
  const themeLabel = PUZZLE_THEMES[theme] ?? theme

  return (
    <div
      className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-[#161616] border border-[#2a2a2a] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
          <div>
            <h2 className="text-base font-semibold text-[#f0f0f0]">Exersează: {themeLabel}</h2>
            <p className="text-xs text-[#666] mt-0.5">
              {isPro ? 'Nelimitat' : `${todayCount} / ${FREE_LIMIT} puzzle-uri azi`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#666] hover:text-[#f0f0f0] hover:bg-[#2a2a2a] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {limitReached ? (
            <div className="rounded-xl bg-[rgba(200,168,75,0.08)] border border-[rgba(200,168,75,0.3)] p-6 text-center">
              <p className="text-[#c8a84b] font-semibold">Ai atins limita zilnică de {FREE_LIMIT} puzzle-uri</p>
              <p className="text-[#666] text-sm mt-1">Upgrade la Pro pentru puzzle-uri nelimitate</p>
              <a href="/pricing" className="mt-3 inline-block">
                <Button size="sm">Upgrade la Pro</Button>
              </a>
            </div>
          ) : loading && !puzzleState ? (
            <div className="flex justify-center py-16">
              <Spinner className="h-7 w-7" />
            </div>
          ) : puzzleState ? (
            <div className="grid gap-5 lg:grid-cols-3">
              {/* Board */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center gap-2 text-sm text-[#a0a0a0]">
                  <span>Joci cu</span>
                  <span className={`font-semibold px-2 py-0.5 rounded text-xs ${puzzleState.game.turn() === 'w' ? 'bg-[#f0f0f0] text-black' : 'bg-[#1a1a1a] border border-[#444] text-[#f0f0f0]'}`}>
                    {puzzleState.game.turn() === 'w' ? '♔ Alb' : '♚ Negru'}
                  </span>
                </div>

                <div className="rounded-xl overflow-hidden border border-[#2a2a2a]">
                  <Chessboard
                    options={{
                      position: puzzleState.game.fen(),
                      onPieceDrop,
                      allowDragging: puzzleState.status === 'playing' && !puzzleState.waitingOpponent && !seqPlaying && !revealed,
                      boardOrientation: playerColor,
                      boardStyle: { borderRadius: 0 },
                      darkSquareStyle: { backgroundColor: '#3d3d3d' },
                      lightSquareStyle: { backgroundColor: '#f0d9b5' },
                      squareStyles,
                      arrows: boardArrows,
                    }}
                  />
                </div>

                {/* Indicii — doar cât timp e rândul jucătorului */}
                {puzzleState.status === 'playing' && !puzzleState.waitingOpponent && !seqPlaying && !revealed && (
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" className="gap-1.5"
                      onClick={() => setHintFrom(expFrom ?? null)} disabled={!expFrom}>
                      <Lightbulb className="h-3.5 w-3.5" /> Dă-mi un indiciu
                    </Button>
                    <Button size="sm" variant="secondary" className="gap-1.5"
                      onClick={() => { setShowMove(true); setHintFrom(expFrom ?? null) }} disabled={!expFrom}>
                      <Eye className="h-3.5 w-3.5" /> Arată mutarea
                    </Button>
                    {isMultiMove && (
                      <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => void showSequence()}>
                        <ListVideo className="h-3.5 w-3.5" /> Arată secvența
                      </Button>
                    )}
                  </div>
                )}

                {seqPlaying && (
                  <p className="text-sm text-[#c8a84b] text-center">Se redă secvența...</p>
                )}
                {revealed && !seqPlaying && (
                  <div className="flex items-center gap-2 rounded-lg bg-[rgba(200,168,75,0.1)] border border-[rgba(200,168,75,0.3)] p-3">
                    <ListVideo className="h-5 w-5 text-[#c8a84b]" />
                    <span className="text-[#c8a84b] font-semibold">Aceasta era soluția completă.</span>
                    <Button size="sm" variant="secondary" className="ml-auto" onClick={() => loadPuzzle(currentPuzzle!)}>
                      Reia
                    </Button>
                  </div>
                )}

                {puzzleState.status === 'correct' && (
                  <div className="flex items-center gap-2 rounded-lg bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.3)] p-3">
                    <CheckCircle2 className="h-5 w-5 text-[#4ade80]" />
                    <span className="text-[#4ade80] font-semibold">Corect! Excelent!</span>
                    <Button size="sm" className="ml-auto" onClick={() => void fetchNextPuzzle()}>
                      <RefreshCw className="h-3.5 w-3.5" /> Următor
                    </Button>
                  </div>
                )}
                {puzzleState.status === 'wrong' && (
                  <div className="flex items-center gap-2 rounded-lg bg-[rgba(251,191,36,0.1)] border border-[rgba(251,191,36,0.35)] p-3">
                    <XCircle className="h-5 w-5 text-[#fbbf24]" />
                    <span className="text-[#fbbf24] font-semibold">Mai gândește-te. Încearcă din nou.</span>
                    <Button size="sm" variant="secondary" className="ml-auto" onClick={() => loadPuzzle(currentPuzzle!)}>
                      Reia
                    </Button>
                  </div>
                )}
                {puzzleState.waitingOpponent && (
                  <p className="text-sm text-[#666] text-center">Adversarul mută...</p>
                )}
              </div>

              {/* Info */}
              <div className="space-y-4">
                {currentPuzzle && (
                  <div className="rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] p-4 space-y-3">
                    <div>
                      <p className="text-xs text-[#666] uppercase tracking-wider mb-1">Rating puzzle</p>
                      <p className="text-2xl font-bold text-[#f0f0f0]">{currentPuzzle.rating}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#666] uppercase tracking-wider mb-2">Teme</p>
                      <div className="flex flex-wrap gap-1.5">
                        {currentPuzzle.themes.slice(0, 5).map(t => (
                          <Badge key={t} variant="accent">
                            {PUZZLE_THEMES[t] ?? t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {currentPuzzle.game_url && (
                      <a
                        href={currentPuzzle.game_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#c8a84b] hover:text-[#d4b860]"
                      >
                        Partida originală pe Lichess →
                      </a>
                    )}
                  </div>
                )}

                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => void fetchNextPuzzle()}
                  disabled={loading || limitReached}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Puzzle următor
                </Button>

                <div className="rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] p-4">
                  <p className="text-xs text-[#666] uppercase tracking-wider mb-2">Cum funcționează</p>
                  <ol className="space-y-1.5 text-xs text-[#888]">
                    <li>1. Ultima mutare a fost a adversarului — acum e rândul tău</li>
                    <li>2. Mută piesa cu drag & drop spre pătratul dorit</li>
                    <li>3. Blocat? „Dă-mi un indiciu" îți arată piesa, „Arată mutarea" îți arată mutarea</li>
                    <li>4. La tacticile cu mai multe mutări, „Arată secvența" redă toată soluția</li>
                  </ol>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-16 text-[#666]">Niciun puzzle disponibil.</div>
          )}
        </div>
      </div>
    </div>
  )
}
