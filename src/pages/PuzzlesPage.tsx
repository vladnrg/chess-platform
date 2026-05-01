import { useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { fetchLichessDailyPuzzle } from '@/lib/lichess'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
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
}

interface PuzzleState {
  game: Chess
  solutionMoves: string[]
  currentMoveIdx: number
  status: 'playing' | 'correct' | 'wrong' | 'opponent-moving'
  startTime: number
  waitingOpponent: boolean
}

function initPuzzleState(fen: string, movesStr: string): PuzzleState {
  const g = new Chess(fen)
  const moves = movesStr.split(' ')

  // Fă prima mutare (a adversarului) automat
  const firstMove = moves[0]
  if (firstMove) {
    g.move({ from: firstMove.slice(0, 2), to: firstMove.slice(2, 4), promotion: firstMove[4] ?? undefined })
  }

  return {
    game: g,
    solutionMoves: moves,
    currentMoveIdx: 1,
    status: 'playing',
    startTime: Date.now(),
    waitingOpponent: false,
  }
}

export function PuzzlesPage() {
  const { user, fetchProfile } = useAuth()
  const { isPro } = useSubscription()
  const [searchParams] = useSearchParams()

  const [puzzleState, setPuzzleState] = useState<PuzzleState | null>(null)
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null)
  const [todayCount, setTodayCount] = useState(0)
  const [activeTheme, setActiveTheme] = useState<string | null>(searchParams.get('theme'))

  const FREE_LIMIT = 10

  const { isLoading: dailyLoading } = useQuery({
    queryKey: ['daily-puzzle'],
    queryFn: async () => {
      const lp = await fetchLichessDailyPuzzle()
      const puzzle: Puzzle = {
        id: lp.puzzle.id,
        fen: lp.game.pgn ? (() => {
          const g = new Chess(); g.loadPgn(lp.game.pgn)
          // Setare la poziția puzzle-ului
          for (let i = 0; i < lp.puzzle.initialPly; i++) {
            if (i > 0) { /* already loaded */ }
          }
          return g.fen()
        })() : lp.puzzle.id,
        moves: lp.puzzle.solution.join(' '),
        rating: lp.puzzle.rating,
        themes: lp.puzzle.themes,
        game_url: `https://lichess.org/training/${lp.puzzle.id}`,
      }
      loadPuzzle(puzzle)
      return puzzle
    },
    staleTime: Infinity,
  })

  // Count today's attempts
  useQuery({
    queryKey: ['today-attempts', user?.id],
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

  const { data: fallbackPuzzles } = useQuery({
    queryKey: ['puzzles-pool', activeTheme],
    queryFn: async () => {
      let q = supabase.from('puzzles').select('*').limit(30)
      if (activeTheme) q = q.contains('themes', [activeTheme])
      const { data } = await q
      return (data ?? []) as Puzzle[]
    },
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
    try {
      setPuzzleState(initPuzzleState(puzzle.fen, puzzle.moves))
    } catch {
      toast.error('Eroare la încărcarea puzzle-ului.')
    }
  }

  function loadNext() {
    if (!isPro && todayCount >= FREE_LIMIT) {
      toast.error('Limita zilnică atinsă. Upgrade la Pro pentru puzzle-uri nelimitate.')
      return
    }
    const pool = fallbackPuzzles ?? []
    if (pool.length === 0) return
    const p = pool[Math.floor(Math.random() * pool.length)]
    loadPuzzle(p)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onPieceDrop = useCallback(({ sourceSquare: source, targetSquare: target }: any) => {
    if (!puzzleState || puzzleState.status !== 'playing' || puzzleState.waitingOpponent) return false
    if (!currentPuzzle) return false

    const expectedMove = puzzleState.solutionMoves[puzzleState.currentMoveIdx]
    if (!expectedMove) return false

    const myMove = source + target

    try {
      const gameCopy = new Chess(puzzleState.game.fen())
      gameCopy.move({ from: source, to: target, promotion: 'q' })

      const isCorrect = myMove === expectedMove.slice(0, 4)

      if (!isCorrect) {
        setPuzzleState(s => s ? { ...s, status: 'wrong' } : null)
        const elapsed = Math.round((Date.now() - puzzleState.startTime) / 1000)
        attemptMutation.mutate({ solved: false, timeSeconds: elapsed })
        return true
      }

      const nextIdx = puzzleState.currentMoveIdx + 1
      const isLast = nextIdx >= puzzleState.solutionMoves.length

      if (isLast) {
        setPuzzleState(s => s ? { ...s, game: gameCopy, status: 'correct', currentMoveIdx: nextIdx } : null)
        const elapsed = Math.round((Date.now() - puzzleState.startTime) / 1000)
        toast.success('Corect! 🎉')
        attemptMutation.mutate({ solved: true, timeSeconds: elapsed })
        return true
      }

      // Mutarea adversarului
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
  }, [puzzleState, currentPuzzle, attemptMutation])

  const limitReached = !isPro && todayCount >= FREE_LIMIT

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f0f0f0]">Puzzle-uri tactice</h1>
          <p className="text-[#666] text-sm mt-0.5">
            {isPro ? 'Nelimitat' : `${todayCount} / ${FREE_LIMIT} azi`}
            {activeTheme && (
              <> · <span className="text-[#c8a84b]">{PUZZLE_THEMES[activeTheme] ?? activeTheme}</span></>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {activeTheme && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTheme(null)}
            >
              × Elimină filtru
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={loadNext} disabled={limitReached}>
            <RefreshCw className="h-4 w-4" /> Puzzle nou
          </Button>
        </div>
      </div>

      {/* Filtre teme */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(PUZZLE_THEMES).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTheme(prev => prev === key ? null : key)}
            className={[
              'rounded-full px-3 py-1 text-xs font-medium border transition-colors',
              activeTheme === key
                ? 'bg-[#c8a84b] text-black border-[#c8a84b]'
                : 'bg-transparent text-[#666] border-[#2a2a2a] hover:border-[#3a3a3a] hover:text-[#a0a0a0]',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {limitReached && (
        <div className="rounded-xl bg-[rgba(200,168,75,0.08)] border border-[rgba(200,168,75,0.3)] p-4 text-center">
          <p className="text-[#c8a84b] font-semibold">Ai atins limita zilnică de {FREE_LIMIT} puzzle-uri</p>
          <p className="text-[#666] text-sm mt-1">Upgrade la Pro pentru puzzle-uri nelimitate</p>
          <a href="/pricing" className="mt-3 inline-block">
            <Button size="sm">Upgrade la Pro</Button>
          </a>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tablă */}
        <div className="lg:col-span-2">
          {dailyLoading && !puzzleState ? (
            <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
          ) : puzzleState ? (
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden border border-[#2a2a2a]">
                <Chessboard
                  options={{
                    position: puzzleState.game.fen(),
                    onPieceDrop,
                    allowDragging: puzzleState.status === 'playing' && !puzzleState.waitingOpponent,
                    boardOrientation: puzzleState.game.turn() === 'w' ? 'white' : 'black',
                    boardStyle: { borderRadius: 0 },
                    darkSquareStyle: { backgroundColor: '#3d3d3d' },
                    lightSquareStyle: { backgroundColor: '#f0d9b5' },
                  }}
                />
              </div>

              {puzzleState.status === 'correct' && (
                <div className="flex items-center gap-2 rounded-lg bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.3)] p-3">
                  <CheckCircle2 className="h-5 w-5 text-[#4ade80]" />
                  <span className="text-[#4ade80] font-semibold">Corect! Excelent!</span>
                  <Button size="sm" className="ml-auto" onClick={loadNext}>Următor</Button>
                </div>
              )}
              {puzzleState.status === 'wrong' && (
                <div className="flex items-center gap-2 rounded-lg bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.3)] p-3">
                  <XCircle className="h-5 w-5 text-[#f87171]" />
                  <span className="text-[#f87171] font-semibold">Greșit. Încearcă din nou.</span>
                  <Button size="sm" variant="secondary" className="ml-auto" onClick={() => loadPuzzle(currentPuzzle!)}>Reia</Button>
                </div>
              )}
              {puzzleState.waitingOpponent && (
                <p className="text-sm text-[#666] text-center">Adversarul mută...</p>
              )}
            </div>
          ) : (
            <div className="flex justify-center py-16 text-[#666]">Niciun puzzle încărcat.</div>
          )}
        </div>

        {/* Info puzzle */}
        <div className="space-y-4">
          {currentPuzzle && (
            <Card className="p-4 space-y-3">
              <div>
                <p className="text-xs text-[#666] uppercase tracking-wider mb-1">Rating</p>
                <p className="text-2xl font-bold text-[#f0f0f0]">{currentPuzzle.rating}</p>
              </div>
              <div>
                <p className="text-xs text-[#666] uppercase tracking-wider mb-2">Teme</p>
                <div className="flex flex-wrap gap-1.5">
                  {currentPuzzle.themes.slice(0, 5).map(theme => (
                    <Badge key={theme} variant="accent">
                      {PUZZLE_THEMES[theme] ?? theme}
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
            </Card>
          )}

          <Card className="p-4">
            <p className="text-xs text-[#666] uppercase tracking-wider mb-2">Cum se joacă</p>
            <ol className="space-y-1.5 text-sm text-[#a0a0a0]">
              <li>1. Adversarul face prima mutare automat</li>
              <li>2. Tu trebuie să găsești cea mai bună replică</li>
              <li>3. Continuă până la finalul secvenței</li>
            </ol>
          </Card>
        </div>
      </div>
    </div>
  )
}
