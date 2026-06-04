import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { CheckCircle2, RefreshCw, Loader2, RotateCcw, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { fetchLichessDailyPuzzle, fetchLichessPuzzleNext, eloToDifficulty, fetchLichessCloudEval } from '@/lib/lichess'
import { initPuzzleState, lichessPuzzleToLocal, uciToSan, analyzeWrongMove, type PuzzleState } from '@/lib/puzzle-utils'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { AICoachPanel } from '@/components/chess/AICoachPanel'
import { cn } from '@/lib/utils'
import type { Puzzle } from '@/types'

const PUZZLE_THEMES: Record<string, string> = {
  fork: 'Bifurcare', pin: 'Andocare', skewer: 'Frigare',
  mateIn1: 'Mat în 1', mateIn2: 'Mat în 2', mateIn3: 'Mat în 3',
  discoveredAttack: 'Atac descoperit', endgame: 'Final',
  middlegame: 'Mijlocul jocului', opening: 'Deschidere',
  hangingPiece: 'Piesă agățată', sacrifice: 'Sacrificiu',
}

const ELO_BANDS = [
  { id: 'beginner',     label: 'Începător',  range: [400,  800]  as [number, number], color: '#4ade80', desc: '< 800'       },
  { id: 'intermediate', label: 'Mediu',      range: [800,  1200] as [number, number], color: '#60a5fa', desc: '800 – 1200'  },
  { id: 'advanced',     label: 'Avansat',    range: [1200, 1600] as [number, number], color: '#c8a84b', desc: '1200 – 1600' },
  { id: 'expert',       label: 'Expert',     range: [1600, 2000] as [number, number], color: '#f97316', desc: '1600 – 2000' },
  { id: 'master',       label: 'Master',     range: [2000, 3500] as [number, number], color: '#f87171', desc: '2000+'       },
]
type ELOBand = typeof ELO_BANDS[number]

function getBandForElo(elo: number): ELOBand {
  return ELO_BANDS.find(b => elo >= b.range[0] && elo < b.range[1]) ?? ELO_BANDS[1]
}

interface MoveExplanation {
  type: 'wrong' | 'near-equal'
  message: string
  bestMoveSan?: string
  nearEqualAlternatives?: string[]
}

function cpToWhitePct(cp: number) {
  return Math.min(97, Math.max(3, 50 + 50 * Math.tanh(cp / 600)))
}

interface EvalBarProps {
  cp?: number
  mate?: number
  prevCp?: number
  prevMate?: number
  orientation: 'white' | 'black'
}

function EvalBar({ cp, mate, prevCp, prevMate, orientation }: EvalBarProps) {
  const whiteAdv = mate !== undefined ? (mate > 0 ? 97 : 3) : cp !== undefined ? cpToWhitePct(cp) : 50
  const fillPct = orientation === 'white' ? whiteAdv : 100 - whiteAdv

  const label = mate !== undefined
    ? `M${Math.abs(mate)}`
    : cp !== undefined
      ? `${cp >= 0 ? '+' : ''}${(cp / 100).toFixed(1)}`
      : '0.0'

  const prevAdv = prevMate !== undefined
    ? (prevMate > 0 ? 97 : 3)
    : prevCp !== undefined
      ? cpToWhitePct(prevCp)
      : null

  const playerFactor = orientation === 'white' ? 1 : -1
  const rawDelta = prevAdv !== null && cp !== undefined && prevCp !== undefined
    ? (cp - prevCp) * playerFactor
    : null
  const deltaLabel = rawDelta !== null
    ? `${rawDelta >= 0 ? '▲' : '▼'} ${(Math.abs(rawDelta) / 100).toFixed(1)}`
    : null
  const deltaPositive = rawDelta !== null && rawDelta >= 0

  return (
    <div className="flex flex-col items-center gap-1 select-none" style={{ width: 28 }}>
      <div className="relative flex-1 w-full rounded-lg overflow-hidden border border-[#2a2a2a] bg-[#222]" style={{ minHeight: 80 }}>
        <div
          className="absolute bottom-0 left-0 right-0 bg-[#e8e8e8] transition-all duration-700 ease-out"
          style={{ height: `${fillPct}%` }}
        />
      </div>
      <span className="text-[11px] font-mono font-bold text-[#f0f0f0] leading-none tabular-nums">{label}</span>
      {deltaLabel && (
        <span className={`text-[10px] font-mono leading-none tabular-nums ${deltaPositive ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
          {deltaLabel}
        </span>
      )}
    </div>
  )
}

export function PuzzlesPage() {
  const { user, profile, fetchProfile } = useAuth()
  const { isPro } = useSubscription()

  const [puzzleState, setPuzzleState] = useState<PuzzleState | null>(null)
  const [initialPuzzleState, setInitialPuzzleState] = useState<PuzzleState | null>(null)
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null)
  const [todayCount, setTodayCount] = useState(0)
  const [activeBand, setActiveBand] = useState<ELOBand>(() => getBandForElo(profile?.estimated_elo ?? 800))
  const [nextLoading, setNextLoading] = useState(false)
  const [coachOpen, setCoachOpen] = useState(false)
  const [solvedInBand, setSolvedInBand] = useState(0)
  const [showLevelUpPrompt, setShowLevelUpPrompt] = useState(false)

  const SOLVED_TO_LEVEL_UP = 10
  const nextBand = ELO_BANDS[ELO_BANDS.findIndex(b => b.id === activeBand.id) + 1] ?? null

  // Board orientation — fixed for the duration of each puzzle
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white')

  // Wrong move state
  const [wrongMoveFrom, setWrongMoveFrom] = useState<string | null>(null)
  const [wrongMoveTo, setWrongMoveTo] = useState<string | null>(null)
  const [moveExplanation, setMoveExplanation] = useState<MoveExplanation | null>(null)
  const [evalLoading, setEvalLoading] = useState(false)
  const [expectedMoveUci, setExpectedMoveUci] = useState<string | null>(null)
  const [showHintConfirm, setShowHintConfirm] = useState(false)
  const [hintRevealed, setHintRevealed] = useState(false)

  // Click-to-move state
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [shakingSquare, setShakingSquare] = useState<string | null>(null)

  // Eval bar
  const [evalHistory, setEvalHistory] = useState<{ cp?: number; mate?: number }[]>([])
  const [evalBarEnabled, setEvalBarEnabled] = useState(false)
  const boardEval = evalHistory.at(-1) ?? null
  const prevBoardEval = evalHistory.at(-2) ?? null

  const FREE_LIMIT = 10
  const playerElo = profile?.estimated_elo ?? 800

  const { data: dailyPuzzleData, isLoading: dailyLoading } = useQuery({
    queryKey: ['daily-puzzle'],
    queryFn: async () => {
      const lp = await fetchLichessDailyPuzzle()
      return lichessPuzzleToLocal(lp)
    },
    staleTime: Infinity,
  })

  useEffect(() => {
    if (dailyPuzzleData && !currentPuzzle) {
      loadPuzzle(dailyPuzzleData)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyPuzzleData])

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
    queryKey: ['puzzles-pool', activeBand.id],
    queryFn: async () => {
      const { data } = await supabase.from('puzzles').select('*')
        .gte('rating', activeBand.range[0])
        .lte('rating', activeBand.range[1])
        .limit(30)
      return (data ?? []) as Puzzle[]
    },
    enabled: !!profile,
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
        setSolvedInBand(prev => {
          const next = prev + 1
          if (next >= SOLVED_TO_LEVEL_UP && nextBand) {
            setShowLevelUpPrompt(true)
          }
          return next
        })
      }
    },
  })

  function clearWrongState() {
    setWrongMoveFrom(null)
    setWrongMoveTo(null)
    setMoveExplanation(null)
    setEvalLoading(false)
    setExpectedMoveUci(null)
    setShowHintConfirm(false)
    setHintRevealed(false)
    setSelectedSquare(null)
    setShakingSquare(null)
  }

  function loadPuzzle(puzzle: Puzzle) {
    clearWrongState()
    setCurrentPuzzle(puzzle)
    setEvalHistory([])
    try {
      const state = initPuzzleState(puzzle.fen, puzzle.moves)
      setPuzzleState(state)
      setInitialPuzzleState(state)
      setPlayerColor(state.game.turn() === 'w' ? 'white' : 'black')
    } catch (e) {
      console.error('[loadPuzzle] initPuzzleState failed:', e, { fen: puzzle.fen, moves: puzzle.moves })
      setCurrentPuzzle(null)
      toast.error('Puzzle invalid — se încarcă altul...')
      void loadNextForBand(getBandForElo(puzzle.rating))
    }
  }

  function resetToInitial() {
    if (!initialPuzzleState) return
    setPuzzleState({ ...initialPuzzleState, startTime: Date.now() })
    setEvalHistory([])
    clearWrongState()
  }

  async function loadNextForBand(band: ELOBand) {
    if (!isPro && todayCount >= FREE_LIMIT) {
      toast.error('Limita zilnică atinsă. Upgrade la Pro pentru puzzle-uri nelimitate.')
      return
    }
    setNextLoading(true)
    try {
      const pool = (fallbackPuzzles ?? []).filter(
        p => p.rating >= band.range[0] && p.rating <= band.range[1]
      )
      if (pool.length >= 1) {
        loadPuzzle(pool[Math.floor(Math.random() * pool.length)])
        return
      }
      const midElo = (band.range[0] + band.range[1]) / 2
      const lp = await fetchLichessPuzzleNext(eloToDifficulty(midElo))
      const puzzle = lichessPuzzleToLocal(lp)
      await supabase.from('puzzles').upsert(
        { id: puzzle.id, fen: puzzle.fen, moves: puzzle.moves, rating: puzzle.rating, themes: puzzle.themes, game_url: puzzle.game_url },
        { onConflict: 'id' }
      )
      loadPuzzle(puzzle)
    } catch {
      toast.error('Nu am putut încărca un puzzle nou.')
    } finally {
      setNextLoading(false)
    }
  }

  function handleBandChange(band: ELOBand) {
    setActiveBand(band)
    setSolvedInBand(0)
    void loadNextForBand(band)
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
        const fenBeforeMove = puzzleState.game.fen()
        const elapsed = Math.round((Date.now() - puzzleState.startTime) / 1000)
        const correctUci = expectedMove.slice(0, 4)

        // Contextual explanation — instant, based on themes + chess analysis
        const contextMessage = analyzeWrongMove(
          fenBeforeMove, myMove, correctUci, currentPuzzle.themes
        )

        setPuzzleState(s => s ? { ...s, game: gameCopy, status: 'wrong' } : null)
        setWrongMoveFrom(source)
        setWrongMoveTo(target)
        setExpectedMoveUci(correctUci)
        setMoveExplanation({
          type: 'wrong',
          message: contextMessage,
          bestMoveSan: uciToSan(fenBeforeMove, correctUci),
        })

        // Async: check near-equal via cloud eval
        setEvalLoading(true)
        void (async () => {
          try {
            const evalData = await fetchLichessCloudEval(fenBeforeMove, 5)
            if (evalData?.pvs?.length) {
              const bestPv = evalData.pvs[0]
              const bestCp = bestPv.cp
              const playerPv = evalData.pvs.find(pv => pv.moves.startsWith(myMove))
              const playerCp = playerPv?.cp
              const isNearEqual =
                bestCp !== undefined && playerCp !== undefined &&
                bestPv.mate === undefined && playerPv?.mate === undefined &&
                Math.abs(bestCp - playerCp) <= 20

              if (isNearEqual) {
                const bestMoveUci = bestPv.moves.split(' ')[0]
                const playerIsBest = myMove === bestMoveUci

                // Collect other near-equal alternatives (within 20cp, excluding player's move)
                const nearEqualAlternatives = evalData.pvs
                  .filter(pv => {
                    const pvFirst = pv.moves.split(' ')[0]
                    return pvFirst !== myMove &&
                      pv.cp !== undefined && bestCp !== undefined &&
                      pv.mate === undefined &&
                      Math.abs(bestCp - pv.cp) <= 20
                  })
                  .map(pv => uciToSan(fenBeforeMove, pv.moves.split(' ')[0]))

                let message: string
                if (playerIsBest) {
                  message = nearEqualAlternatives.length > 0
                    ? `Excelent! Ai ales cea mai bună mutare. Mai există ${nearEqualAlternatives.length === 1 ? 'o variantă la fel de bună' : `${nearEqualAlternatives.length} variante la fel de bune`} în această poziție — descoperă alternativele.`
                    : 'Excelent! Ai ales cea mai bună mutare din această poziție!'
                } else {
                  const bestSan = uciToSan(fenBeforeMove, bestMoveUci)
                  message = `Mutarea ta este bună! Motorul preferă ${bestSan}, dar diferența este neglijabilă.`
                }

                setMoveExplanation({
                  type: 'near-equal',
                  message,
                  nearEqualAlternatives: nearEqualAlternatives.length > 0 ? nearEqualAlternatives : undefined,
                })
                setPuzzleState(s => s ? { ...s, status: 'correct' } : null)
                setWrongMoveFrom(null)
                setWrongMoveTo(null)
                setExpectedMoveUci(null)
                attemptMutation.mutate({ solved: true, timeSeconds: elapsed })
                return
              }
            }
          } catch { /* keep contextual message */ }
          finally { setEvalLoading(false) }
          if (evalBarEnabled) {
            void fetchLichessCloudEval(gameCopy.fen(), 1).then(data => {
              if (data?.pvs?.[0]) setEvalHistory(h => [...h, { cp: data.pvs![0].cp, mate: data.pvs![0].mate }])
            })
          }
          attemptMutation.mutate({ solved: false, timeSeconds: elapsed })
        })()

        return true
      }

      const nextIdx = puzzleState.currentMoveIdx + 1
      const isLast = nextIdx >= puzzleState.solutionMoves.length

      if (isLast) {
        setPuzzleState(s => s ? { ...s, game: gameCopy, status: 'correct', currentMoveIdx: nextIdx } : null)
        const elapsed = Math.round((Date.now() - puzzleState.startTime) / 1000)
        toast.success('Corect! 🎉')
        attemptMutation.mutate({ solved: true, timeSeconds: elapsed })
        void fetchLichessCloudEval(gameCopy.fen(), 1).then(data => {
          if (data?.pvs?.[0]) setEvalHistory(h => [...h, { cp: data.pvs![0].cp, mate: data.pvs![0].mate }])
        })
        return true
      }

      const opponentMove = puzzleState.solutionMoves[nextIdx]
      setPuzzleState(s => s ? { ...s, game: gameCopy, currentMoveIdx: nextIdx, waitingOpponent: true } : null)

      setTimeout(() => {
        try {
          const g2 = new Chess(gameCopy.fen())
          g2.move({ from: opponentMove.slice(0, 2), to: opponentMove.slice(2, 4), promotion: opponentMove[4] ?? undefined })
          setPuzzleState(s => s ? { ...s, game: g2, currentMoveIdx: nextIdx + 1, waitingOpponent: false } : null)
          if (evalBarEnabled) {
            void fetchLichessCloudEval(g2.fen(), 1).then(data => {
              if (data?.pvs?.[0]) setEvalHistory(h => [...h, { cp: data.pvs![0].cp, mate: data.pvs![0].mate }])
            })
          }
        } catch { /* skip */ }
      }, 500)

      return true
    } catch {
      return false
    }
  }, [puzzleState, currentPuzzle, attemptMutation, evalBarEnabled, setEvalHistory])

  const onSquareClick = useCallback(({ square }: { square: string; piece?: unknown }) => {
    if (!puzzleState || puzzleState.status !== 'playing' || puzzleState.waitingOpponent) return

    const piece = puzzleState.game.get(square as Parameters<typeof puzzleState.game.get>[0])
    const isMyPiece = piece && piece.color === (playerColor === 'white' ? 'w' : 'b')

    if (selectedSquare === null) {
      if (isMyPiece) setSelectedSquare(square)
      return
    }

    if (square === selectedSquare) {
      setSelectedSquare(null)
      return
    }

    if (isMyPiece) {
      setSelectedSquare(square)
      return
    }

    const ok = onPieceDrop({ sourceSquare: selectedSquare, targetSquare: square })
    const from = selectedSquare
    setSelectedSquare(null)
    if (!ok) {
      setShakingSquare(from)
      setTimeout(() => setShakingSquare(null), 1500)
    }
  }, [puzzleState, selectedSquare, playerColor, onPieceDrop])

  const limitReached = !isPro && todayCount >= FREE_LIMIT

  // Board decorations — wrong move (red) + hint (gold) + selected (gold dim) + shake
  const boardSquareStyles: Record<string, React.CSSProperties> = {
    ...(wrongMoveFrom && wrongMoveTo ? {
      [wrongMoveFrom]: { backgroundColor: 'rgba(248, 113, 113, 0.35)' },
      [wrongMoveTo]: { backgroundColor: 'rgba(248, 113, 113, 0.6)' },
    } : {}),
    ...(hintRevealed && expectedMoveUci ? {
      [expectedMoveUci.slice(0, 2)]: { backgroundColor: 'rgba(200, 168, 75, 0.45)' },
      [expectedMoveUci.slice(2, 4)]: { backgroundColor: 'rgba(200, 168, 75, 0.7)' },
    } : {}),
    ...(selectedSquare ? {
      [selectedSquare]: { backgroundColor: 'rgba(200, 168, 75, 0.4)' },
    } : {}),
    ...(shakingSquare ? {
      [shakingSquare]: { animation: 'piece-shake 0.4s ease-in-out' },
    } : {}),
  }

  const boardArrows = [
    ...(wrongMoveFrom && wrongMoveTo ? [{ startSquare: wrongMoveFrom, endSquare: wrongMoveTo, color: '#ef4444' }] : []),
    ...(hintRevealed && expectedMoveUci ? [{ startSquare: expectedMoveUci.slice(0, 2), endSquare: expectedMoveUci.slice(2, 4), color: '#c8a84b' }] : []),
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f0f0f0]">Puzzle-uri</h1>
          <p className="text-[#666] text-sm mt-0.5">
            {isPro ? 'Nelimitat' : `${todayCount} / ${FREE_LIMIT} azi`}
            {' · '}
            <span style={{ color: activeBand.color }}>{activeBand.label} ({activeBand.desc})</span>
            {nextBand && solvedInBand > 0 && (
              <> · <span className="text-[#888]">{solvedInBand}/{SOLVED_TO_LEVEL_UP} la nivel curent</span></>
            )}
            {currentPuzzle && (
              <> · <span className="text-[#f0f0f0] font-medium">ELO {currentPuzzle.rating}</span></>
            )}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void loadNextForBand(activeBand)} disabled={limitReached || nextLoading}>
          <RefreshCw className={`h-4 w-4 ${nextLoading ? 'animate-spin' : ''}`} /> Puzzle nou
        </Button>
      </div>

      {/* Benzi ELO */}
      <div className="flex gap-2 flex-wrap">
        {ELO_BANDS.map(band => (
          <button
            key={band.id}
            onClick={() => handleBandChange(band)}
            className={cn(
              'flex flex-col items-center gap-0.5 rounded-xl px-4 py-2.5 text-sm font-semibold border-2 transition-all',
              activeBand.id === band.id
                ? 'text-black border-transparent'
                : 'bg-transparent text-[#666] border-[#2a2a2a] hover:border-[#3a3a3a] hover:text-[#f0f0f0]'
            )}
            style={activeBand.id === band.id ? { backgroundColor: band.color, borderColor: band.color } : {}}
          >
            <span>{band.label}</span>
            <span className="text-xs font-normal opacity-70">{band.desc}</span>
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
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-[#f0f0f0]">
                {puzzleState.status === 'playing' && !puzzleState.waitingOpponent
                  ? <><span className="text-[#c8a84b]">Mutarea ta!</span> Joci cu <span className={`px-1.5 py-0.5 rounded text-xs ${playerColor === 'white' ? 'bg-[#f0f0f0] text-black' : 'bg-[#2a2a2a] border border-[#444] text-[#f0f0f0]'}`}>{playerColor === 'white' ? '♔ Alb' : '♚ Negru'}</span></>
                  : <>Joci cu <span className={`px-1.5 py-0.5 rounded text-xs ${playerColor === 'white' ? 'bg-[#f0f0f0] text-black' : 'bg-[#2a2a2a] border border-[#444] text-[#f0f0f0]'}`}>{playerColor === 'white' ? '♔ Alb' : '♚ Negru'}</span></>
                }
              </div>
              <div className="flex gap-2 items-stretch">
                {(evalBarEnabled || puzzleState.status === 'correct') && boardEval !== null && (
                  <EvalBar
                    cp={boardEval.cp}
                    mate={boardEval.mate}
                    prevCp={prevBoardEval?.cp}
                    prevMate={prevBoardEval?.mate}
                    orientation={playerColor}
                  />
                )}
                <div className="flex-1 rounded-xl overflow-hidden border border-[#2a2a2a]">
                  <Chessboard
                    options={{
                      position: puzzleState.game.fen(),
                      onPieceDrop,
                      onSquareClick,
                      allowDragging: puzzleState.status === 'playing' && !puzzleState.waitingOpponent,
                      boardOrientation: playerColor,
                      boardStyle: { borderRadius: 0 },
                      darkSquareStyle: { backgroundColor: '#3d3d3d' },
                      lightSquareStyle: { backgroundColor: '#f0d9b5' },
                      squareStyles: boardSquareStyles,
                      arrows: boardArrows,
                    }}
                  />
                </div>
              </div>

              {/* Corect (fără near-equal) */}
              {puzzleState.status === 'correct' && !moveExplanation && (
                <div className="flex items-center gap-2 rounded-lg bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.3)] p-3">
                  <CheckCircle2 className="h-5 w-5 text-[#4ade80]" />
                  <span className="text-[#4ade80] font-semibold">Corect! Excelent!</span>
                  <Button size="sm" className="ml-auto" onClick={() => void loadNextForBand(activeBand)}>Următor</Button>
                </div>
              )}

              {/* Near-equal — acceptat */}
              {puzzleState.status === 'correct' && moveExplanation?.type === 'near-equal' && (
                <div className="rounded-lg bg-[rgba(200,168,75,0.1)] border border-[rgba(200,168,75,0.3)] p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-[#c8a84b] mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#c8a84b] font-semibold">Bine jucat!</p>
                      <p className="text-sm text-[#a0a0a0] mt-0.5">{moveExplanation.message}</p>
                      {moveExplanation.nearEqualAlternatives && moveExplanation.nearEqualAlternatives.length > 0 && (
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span className="text-xs text-[#666]">Variante echivalente:</span>
                          {moveExplanation.nearEqualAlternatives.map(san => (
                            <span key={san} className="font-mono text-xs font-semibold text-[#c8a84b] bg-[rgba(200,168,75,0.15)] px-1.5 py-0.5 rounded">
                              {san}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button size="sm" className="ml-auto flex-shrink-0" onClick={() => void loadNextForBand(activeBand)}>Următor</Button>
                  </div>
                </div>
              )}

              {/* Greșit — cu explicație și buton reset */}
              {puzzleState.status === 'wrong' && (
                <div className="rounded-lg bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.3)] p-4 space-y-3">
                  {evalLoading ? (
                    <div className="flex items-center gap-2 text-sm text-[#666]">
                      <Loader2 className="h-4 w-4 animate-spin text-[#f87171]" />
                      <span>Se analizează poziția...</span>
                    </div>
                  ) : moveExplanation ? (
                    <p className="text-sm text-[#f0f0f0]">{moveExplanation.message}</p>
                  ) : null}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-2"
                      onClick={resetToInitial}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Întoarce-te la poziția inițială
                    </Button>
                    {!hintRevealed && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setShowHintConfirm(true)}
                      >
                        Arată mutarea optimă
                      </Button>
                    )}
                  </div>
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
                <p className="text-xs text-[#666] uppercase tracking-wider mb-1">Rating puzzle</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-[#f0f0f0]">{currentPuzzle.rating}</p>
                  <span className={`text-xs font-medium ${
                    currentPuzzle.rating < playerElo - 150 ? 'text-[#4ade80]' :
                    currentPuzzle.rating > playerElo + 300 ? 'text-[#f87171]' :
                    'text-[#c8a84b]'
                  }`}>
                    {currentPuzzle.rating < playerElo - 150 ? 'ușor' :
                     currentPuzzle.rating > playerElo + 300 ? 'dificil' :
                     'pe nivelul tău'}
                  </span>
                </div>
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
            <p className="text-xs text-[#666] uppercase tracking-wider mb-2">Cum funcționează</p>
            <ol className="space-y-1.5 text-sm text-[#a0a0a0]">
              <li>1. Piesele pot fi mutate cu drag &amp; drop sau prin click pe piesă → click pe pătratul dorit</li>
              <li>2. Continuă secvența de mutări până ajungi la finalul exercițiului</li>
            </ol>
          </Card>

          <Card className="p-4">
            <label className="flex items-center justify-between gap-3 cursor-pointer select-none">
              <div>
                <p className="text-sm text-[#f0f0f0] font-medium">Bara de evaluare</p>
                <p className="text-xs text-[#666] mt-0.5">Afișează evaluarea după fiecare mutare</p>
              </div>
              <button
                role="switch"
                aria-checked={evalBarEnabled}
                onClick={() => setEvalBarEnabled(v => !v)}
                className={cn(
                  'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200',
                  evalBarEnabled ? 'bg-[#c8a84b]' : 'bg-[#2a2a2a]'
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                    evalBarEnabled ? 'translate-x-4' : 'translate-x-0'
                  )}
                />
              </button>
            </label>
          </Card>

          {puzzleState && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full gap-2"
              onClick={() => setCoachOpen(true)}
            >
              Consultă-l pe Antrenorul En Passant
            </Button>
          )}
        </div>
      </div>

      {showLevelUpPrompt && nextBand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => { setShowLevelUpPrompt(false); setSolvedInBand(0) }}>
          <div
            className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-7 max-w-sm w-full mx-4 space-y-5 text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-4xl">🏆</div>
            <div>
              <p className="text-[#f0f0f0] font-black text-xl">Ți-ai arătat valoarea!</p>
              <p className="text-[#888] text-sm mt-2 leading-relaxed">
                Ai rezolvat {SOLVED_TO_LEVEL_UP} puzzle-uri la nivel{' '}
                <span style={{ color: activeBand.color }}>{activeBand.label}</span>.
                Treci la{' '}
                <span style={{ color: nextBand.color }}>{nextBand.label}</span>?
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                size="sm"
                variant="secondary"
                className="flex-1"
                onClick={() => { setShowLevelUpPrompt(false); setSolvedInBand(0) }}
              >
                Rămân la {activeBand.label}
              </Button>
              <Button
                size="sm"
                className="flex-1 font-bold"
                style={{ backgroundColor: nextBand.color, color: '#000', border: 'none' }}
                onClick={() => {
                  setShowLevelUpPrompt(false)
                  handleBandChange(nextBand)
                }}
              >
                Da, trec la {nextBand.label}!
              </Button>
            </div>
          </div>
        </div>
      )}

      {showHintConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setShowHintConfirm(false)}
        >
          <div
            className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-6 max-w-sm w-full mx-4 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-[#f0f0f0] font-semibold text-lg text-center">Așa ușor vrei să renunți?</p>
            <p className="text-[#888] text-sm text-center leading-relaxed">
              Dacă vezi mutarea, pierzi șansa de a o descoperi singur — dar alegerea îți aparține.
            </p>
            <div className="flex gap-3">
              <Button
                size="sm"
                variant="secondary"
                className="flex-1"
                onClick={() => setShowHintConfirm(false)}
              >
                Nu, mă mai gândesc
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => { setShowHintConfirm(false); setHintRevealed(true) }}
              >
                Da, arată mutarea
              </Button>
            </div>
          </div>
        </div>
      )}

      {coachOpen && puzzleState && (
        <AICoachPanel
          fen={puzzleState.game.fen()}
          context="Puzzle tactic"
          onClose={() => setCoachOpen(false)}
        />
      )}
    </div>
  )
}
