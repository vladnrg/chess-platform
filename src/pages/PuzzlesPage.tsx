import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { CheckCircle2, RefreshCw, Loader2, RotateCcw, Info, Target, Flame } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { fetchLichessPuzzleNext, eloToDifficulty, fetchLichessCloudEval } from '@/lib/lichess'
import { initPuzzleState, lichessPuzzleToLocal, uciToSan, analyzeWrongMove, basePuzzleXp, hintXpFactor, buildSpecificHint, type PuzzleState } from '@/lib/puzzle-utils'
import { accessibleBands, bandForRating, type BandOffset, type PuzzleBand } from '@/lib/puzzle-rating'
import { themeLabel, displayThemes } from '@/lib/puzzle-themes'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { AICoachPanel } from '@/components/chess/AICoachPanel'
import { MascotEnPassant } from '@/components/ui/MascotEnPassant'
import { cn } from '@/lib/utils'
import type { Puzzle } from '@/types'

// Culoare / etichetă per poziție a benzii (inferioară / curentă / superioară)
function offsetColor(o: BandOffset): string {
  return o === -1 ? '#60a5fa' : o === 0 ? '#E2B340' : '#f97316'
}
function offsetLabel(o: BandOffset): string {
  return o === -1 ? 'Inferioară' : o === 0 ? 'Nivelul tău' : 'Superioară'
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
      <div className="relative flex-1 w-full rounded-lg overflow-hidden border border-[#2A2A2A] bg-[#1C1C1C]" style={{ minHeight: 80 }}>
        <div
          className="absolute bottom-0 left-0 right-0 bg-[#F0F0F0] transition-all duration-700 ease-out"
          style={{ height: `${fillPct}%` }}
        />
      </div>
      <span className="text-[11px] font-mono font-bold text-[#F0F0F0] leading-none tabular-nums">{label}</span>
      {deltaLabel && (
        <span className={`text-[10px] font-mono leading-none tabular-nums ${deltaPositive ? 'text-[#4ade80]' : 'text-[#FB7185]'}`}>
          {deltaLabel}
        </span>
      )}
    </div>
  )
}

export function PuzzlesPage() {
  const navigate = useNavigate()
  const { user, profile, fetchProfile } = useAuth()
  const { isPro } = useSubscription()

  const [puzzleState, setPuzzleState] = useState<PuzzleState | null>(null)
  const [initialPuzzleState, setInitialPuzzleState] = useState<PuzzleState | null>(null)
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null)
  const [todayCount, setTodayCount] = useState(0)
  const [nextLoading, setNextLoading] = useState(false)
  const [coachOpen, setCoachOpen] = useState(false)

  // Rating de puzzle (sursa de adevăr: profilul; oglindit local pentru update instant)
  const [puzzleRating, setPuzzleRating] = useState<number | null>(profile?.puzzle_rating ?? null)
  const [winStreak, setWinStreak] = useState(profile?.puzzle_win_streak ?? 0)
  const [activeOffset, setActiveOffset] = useState<BandOffset>(0)
  const [lastDelta, setLastDelta] = useState<number | null>(null)
  const ratingAppliedRef = useRef(false)

  // Burst "+XP" la fiecare serie de 3 rezolvări
  const [correctStreak, setCorrectStreak] = useState(0)
  const [xpBurst, setXpBurst] = useState<number | null>(null)
  const puzzlePerfectRef = useRef(true)

  // Indicii graduale: 0 = niciunul, 1 = indiciu, 2 = arată piesa, 3 = arată mutarea
  const [hintLevel, setHintLevel] = useState(0)
  const hintLevelRef = useRef(0)
  const [secondHint, setSecondHint] = useState<string | null>(null)

  // Anti-skip: timestamps ale apăsărilor pe "Puzzle nou" (fereastră 60 min)
  const skipTimestampsRef = useRef<number[]>([])
  const pendingHintRef = useRef<string>('')

  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white')

  // Wrong move state
  const [wrongMoveFrom, setWrongMoveFrom] = useState<string | null>(null)
  const [wrongMoveTo, setWrongMoveTo] = useState<string | null>(null)
  const [moveExplanation, setMoveExplanation] = useState<MoveExplanation | null>(null)
  const [evalLoading, setEvalLoading] = useState(false)
  const [expectedMoveUci, setExpectedMoveUci] = useState<string | null>(null)
  const [wrongFen, setWrongFen] = useState<string | null>(null)
  const [playerMoveSan, setPlayerMoveSan] = useState<string | null>(null)

  // Click-to-move state
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [shakingSquare, setShakingSquare] = useState<string | null>(null)

  // Eval bar
  const [evalHistory, setEvalHistory] = useState<{ cp?: number; mate?: number }[]>([])
  const [evalBarEnabled, setEvalBarEnabled] = useState(false)
  const boardEval = evalHistory.at(-1) ?? null
  const prevBoardEval = evalHistory.at(-2) ?? null

  const FREE_LIMIT = 10

  // Sincronizează rating-ul local cu profilul când acesta se încarcă/schimbă
  useEffect(() => {
    if (profile?.puzzle_rating != null) {
      setPuzzleRating(profile.puzzle_rating)
      setWinStreak(profile.puzzle_win_streak ?? 0)
    }
  }, [profile?.puzzle_rating, profile?.puzzle_win_streak])

  // Numără tentativele de azi
  useEffect(() => {
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    void supabase
      .from('user_puzzle_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('attempted_at', `${today}T00:00:00`)
      .then(({ count }: { count: number | null }) => setTodayCount(count ?? 0))
  }, [user])

  // Încarcă primul puzzle când avem rating (banda curentă)
  useEffect(() => {
    if (puzzleRating != null && !currentPuzzle) {
      void loadNext(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzleRating])

  const attemptMutation = useMutation({
    mutationFn: async ({ solved, timeSeconds, xpAmount }: { solved: boolean; timeSeconds: number; xpAmount: number }) => {
      if (!user || !currentPuzzle) return
      await supabase.from('user_puzzle_attempts').insert({
        user_id: user.id,
        puzzle_id: currentPuzzle.id,
        solved,
        time_seconds: timeSeconds,
      })
      if (solved && xpAmount > 0) {
        await supabase.rpc('award_xp', { p_user_id: user.id, p_amount: xpAmount })
        await fetchProfile(user.id)
      }
      if (solved) setTodayCount(c => c + 1)
    },
  })

  // Aplică rezultatul la rating-ul de puzzle (o singură dată per puzzle, server-side)
  function applyRating(solved: boolean) {
    if (ratingAppliedRef.current || !user || !currentPuzzle) return
    ratingAppliedRef.current = true
    void (async () => {
      const { data, error } = await supabase.rpc('apply_puzzle_result', {
        p_user_id: user.id, p_puzzle_id: currentPuzzle.id, p_solved: solved,
      })
      if (error || !data || (typeof data === 'object' && 'error' in data)) return
      const res = data as { rating: number; delta: number; promoted: boolean; streak: number }
      setPuzzleRating(res.rating)
      setWinStreak(res.streak)
      setLastDelta(res.delta)
      window.setTimeout(() => setLastDelta(null), 2200)
      if (res.promoted) toast.success('Promovat! 5 corecte la rând — treci la banda superioară 🎯')
    })()
  }

  // Penalizare anti-skip: după 3 apăsări pe "Puzzle nou" în 60 min, XP × 1/3
  function skipPenaltyActive(): boolean {
    const cutoff = Date.now() - 60 * 60 * 1000
    skipTimestampsRef.current = skipTimestampsRef.current.filter(t => t > cutoff)
    return skipTimestampsRef.current.length > 3
  }

  function computeSolveXp(rating: number): number {
    const base = basePuzzleXp(rating)
    const factor = hintXpFactor(hintLevelRef.current)
    const skip = skipPenaltyActive() ? (1 / 3) : 1
    return Math.round(base * factor * skip)
  }

  function registerSolve(xpAmount: number) {
    setCorrectStreak(prev => {
      const next = prev + 1
      if (next % 3 === 0) {
        setXpBurst(xpAmount)
        window.setTimeout(() => setXpBurst(null), 1500)
      }
      return next
    })
  }

  function registerWrong() {
    puzzlePerfectRef.current = false
    setCorrectStreak(0)
  }

  function useHint(level: number) {
    setHintLevel(level)
    hintLevelRef.current = level
    puzzlePerfectRef.current = false
    if (level >= 1) setSecondHint(pendingHintRef.current || null)
  }

  function handleSkipPuzzle() {
    if (puzzleState && puzzleState.status === 'playing') {
      skipTimestampsRef.current.push(Date.now())
      setCorrectStreak(0)
    }
    void loadNext(activeOffset)
  }

  function clearWrongState() {
    setWrongMoveFrom(null)
    setWrongMoveTo(null)
    setMoveExplanation(null)
    setEvalLoading(false)
    setExpectedMoveUci(null)
    setWrongFen(null)
    setPlayerMoveSan(null)
    setHintLevel(0)
    hintLevelRef.current = 0
    setSecondHint(null)
    setSelectedSquare(null)
    setShakingSquare(null)
  }

  function loadPuzzle(puzzle: Puzzle) {
    clearWrongState()
    setCurrentPuzzle(puzzle)
    setEvalHistory([])
    puzzlePerfectRef.current = true
    ratingAppliedRef.current = false
    try {
      const state = initPuzzleState(puzzle.fen, puzzle.moves)
      setPuzzleState(state)
      setInitialPuzzleState(state)
      setPlayerColor(state.game.turn() === 'w' ? 'white' : 'black')
    } catch (e) {
      console.error('[loadPuzzle] initPuzzleState failed:', e, { fen: puzzle.fen, moves: puzzle.moves })
      setCurrentPuzzle(null)
      toast.error('Puzzle invalid — se încarcă altul...')
      void loadNext(activeOffset)
    }
  }

  function resetToInitial() {
    if (!initialPuzzleState) return
    setPuzzleState({ ...initialPuzzleState, startTime: Date.now() })
    setEvalHistory([])
    clearWrongState()
  }

  // Încarcă un puzzle din banda corespunzătoare offset-ului (relativ la rating-ul curent)
  async function loadNext(offset: BandOffset) {
    if (puzzleRating == null) return
    if (!isPro && todayCount >= FREE_LIMIT) {
      toast.error('Limita zilnică atinsă. Upgrade la Pro pentru puzzle-uri nelimitate.')
      return
    }
    const bands = accessibleBands(puzzleRating)
    const chosen = bands.find(b => b.offset === offset) ?? bands.find(b => b.offset === 0)!
    setActiveOffset(chosen.offset)
    const band: PuzzleBand = chosen.band

    setNextLoading(true)
    try {
      const { data } = await supabase.from('puzzles').select('*')
        .gte('rating', band.floor)
        .lt('rating', band.ceil)
        .limit(40)
      const pool = (data ?? []) as Puzzle[]
      if (pool.length >= 1) {
        loadPuzzle(pool[Math.floor(Math.random() * pool.length)])
        return
      }
      // Fallback Lichess (mijlocul benzii)
      const lp = await fetchLichessPuzzleNext(eloToDifficulty(band.floor + 100))
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

        const contextMessage = analyzeWrongMove(
          fenBeforeMove, myMove, correctUci, currentPuzzle.themes
        )

        puzzlePerfectRef.current = false
        pendingHintRef.current = buildSpecificHint(fenBeforeMove, correctUci, currentPuzzle.themes)
        setWrongFen(fenBeforeMove)
        setPlayerMoveSan(uciToSan(fenBeforeMove, myMove))
        setPuzzleState(s => s ? { ...s, game: gameCopy, status: 'wrong' } : null)
        setWrongMoveFrom(source)
        setWrongMoveTo(target)
        setExpectedMoveUci(correctUci)
        setMoveExplanation({
          type: 'wrong',
          message: contextMessage,
          bestMoveSan: uciToSan(fenBeforeMove, correctUci),
        })

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
                const xpNear = computeSolveXp(currentPuzzle.rating)
                attemptMutation.mutate({ solved: true, timeSeconds: elapsed, xpAmount: xpNear })
                registerSolve(xpNear)
                applyRating(true)
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
          registerWrong()
          attemptMutation.mutate({ solved: false, timeSeconds: elapsed, xpAmount: 0 })
          applyRating(false)
        })()

        return true
      }

      const nextIdx = puzzleState.currentMoveIdx + 1
      const isLast = nextIdx >= puzzleState.solutionMoves.length

      if (isLast) {
        setPuzzleState(s => s ? { ...s, game: gameCopy, status: 'correct', currentMoveIdx: nextIdx } : null)
        const elapsed = Math.round((Date.now() - puzzleState.startTime) / 1000)
        toast.success('Corect!')
        const xpSolve = computeSolveXp(currentPuzzle.rating)
        attemptMutation.mutate({ solved: true, timeSeconds: elapsed, xpAmount: xpSolve })
        registerSolve(xpSolve)
        applyRating(true)
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

  // ---- Gate: testul de plasament ----
  if (profile && profile.puzzle_rating == null && puzzleRating == null) {
    return (
      <div className="max-w-lg mx-auto mt-10">
        <Card className="p-8 text-center space-y-5">
          <div className="flex justify-center">
            <MascotEnPassant mood="encouraging" size={64} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F0F0F0]">Întâi, hai să-ți aflăm nivelul</h1>
            <p className="text-[#A0A0A0] text-sm mt-2 leading-relaxed">
              Rezolvi un test de plasament cu 20 de puzzle-uri progresiv mai grele. Pe baza lui primești un
              <span className="text-[#E2B340] font-medium"> rating de puzzle</span> și începi să joci exact la nivelul tău.
            </p>
          </div>
          <Button size="lg" className="w-full" onClick={() => navigate('/puzzles/placement')}>
            Începe testul de plasament
          </Button>
        </Card>
      </div>
    )
  }

  const bands = puzzleRating != null ? accessibleBands(puzzleRating) : []
  const currentBand = puzzleRating != null ? bandForRating(puzzleRating) : null

  const boardSquareStyles: Record<string, React.CSSProperties> = {
    ...(wrongMoveFrom && wrongMoveTo ? {
      [wrongMoveFrom]: { backgroundColor: 'rgba(251, 191, 36, 0.35)' },
      [wrongMoveTo]: { backgroundColor: 'rgba(249, 115, 22, 0.55)' },
    } : {}),
    ...(hintLevel >= 2 && expectedMoveUci ? {
      [expectedMoveUci.slice(0, 2)]: { backgroundColor: 'rgba(226,179,64, 0.45)' },
    } : {}),
    ...(hintLevel >= 3 && expectedMoveUci ? {
      [expectedMoveUci.slice(2, 4)]: { backgroundColor: 'rgba(226,179,64, 0.7)' },
    } : {}),
    ...(selectedSquare ? {
      [selectedSquare]: { backgroundColor: 'rgba(226,179,64, 0.4)' },
    } : {}),
    ...(shakingSquare ? {
      [shakingSquare]: { animation: 'piece-shake 0.4s ease-in-out' },
    } : {}),
  }

  const boardArrows = [
    ...(wrongMoveFrom && wrongMoveTo ? [{ startSquare: wrongMoveFrom, endSquare: wrongMoveTo, color: '#f97316' }] : []),
    ...(hintLevel >= 3 && expectedMoveUci ? [{ startSquare: expectedMoveUci.slice(0, 2), endSquare: expectedMoveUci.slice(2, 4), color: '#E2B340' }] : []),
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F0F0F0]">Puzzle-uri</h1>
          <p className="text-[#6B6B6B] text-sm mt-0.5">
            {isPro ? 'Nelimitat' : `${todayCount} / ${FREE_LIMIT} azi`}
            {currentBand && (
              <> · <span style={{ color: offsetColor(0) }}>Banda {currentBand.label}</span></>
            )}
            {currentPuzzle && (
              <> · <span className="text-[#F0F0F0] font-medium">puzzle ELO {currentPuzzle.rating}</span></>
            )}
          </p>
        </div>

        {/* Rating curent — stil chess.com */}
        <div className="flex items-center gap-3">
          {winStreak > 0 && (
            <span className="flex items-center gap-1 text-sm font-semibold text-[#f97316]" title="Corecte la rând">
              <Flame className="h-4 w-4" /> {winStreak}
            </span>
          )}
          <div className="relative rounded-xl border border-[#2A2A2A] bg-[#141414] px-4 py-2 text-center">
            <p className="text-[10px] uppercase tracking-wider text-[#6B6B6B] flex items-center justify-center gap-1">
              <Target className="h-3 w-3" /> Rating-ul tău
            </p>
            <p className="text-2xl font-black text-[#F0F0F0] leading-tight tabular-nums">{puzzleRating}</p>
            {lastDelta !== null && lastDelta !== 0 && (
              <span
                className={`absolute -right-2 -top-2 rounded-full px-2 py-0.5 text-xs font-black shadow-lg ${lastDelta > 0 ? 'bg-[#4ade80] text-black' : 'bg-[#FB7185] text-black'}`}
                style={{ animation: 'xp-float 2.2s ease-out forwards' }}
              >
                {lastDelta > 0 ? `+${lastDelta}` : lastDelta}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Selector pe 3 benzi: inferioară / curentă / superioară */}
      <div className="flex gap-2 flex-wrap">
        {bands.map(({ offset, band, gain, loss }) => (
          <button
            key={offset}
            onClick={() => void loadNext(offset)}
            disabled={limitReached || nextLoading}
            className={cn(
              'flex flex-col items-start gap-0.5 rounded-xl px-4 py-2.5 text-sm font-semibold border-2 transition-all disabled:opacity-50',
              activeOffset === offset
                ? 'text-black border-transparent'
                : 'bg-transparent text-[#A0A0A0] border-[#2A2A2A] hover:border-[#3A3A3A] hover:text-[#F0F0F0]'
            )}
            style={activeOffset === offset ? { backgroundColor: offsetColor(offset), borderColor: offsetColor(offset) } : {}}
          >
            <span className="flex items-center gap-1.5">
              {offsetLabel(offset)}
              <span className="opacity-70 font-normal">· {band.label}</span>
            </span>
            <span className={cn('text-xs font-bold', activeOffset === offset ? 'text-black/70' : '')}>
              <span className={activeOffset === offset ? '' : 'text-[#4ade80]'}>+{gain}</span>
              {' / '}
              <span className={activeOffset === offset ? '' : 'text-[#FB7185]'}>−{loss}</span>
            </span>
          </button>
        ))}
        <Button variant="secondary" size="sm" className="ml-auto self-center" onClick={handleSkipPuzzle} disabled={limitReached || nextLoading}>
          <RefreshCw className={`h-4 w-4 ${nextLoading ? 'animate-spin' : ''}`} /> Puzzle nou
        </Button>
      </div>

      {limitReached && (
        <div className="rounded-xl bg-[rgba(226,179,64,0.08)] border border-[rgba(226,179,64,0.3)] p-4 text-center">
          <p className="text-[#E2B340] font-semibold">Ai atins limita zilnică de {FREE_LIMIT} puzzle-uri</p>
          <p className="text-[#6B6B6B] text-sm mt-1">Upgrade la Pro pentru puzzle-uri nelimitate</p>
          <a href="/pricing" className="mt-3 inline-block">
            <Button size="sm">Upgrade la Pro</Button>
          </a>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tablă */}
        <div className="lg:col-span-2">
          {nextLoading && !puzzleState ? (
            <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
          ) : puzzleState ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-[#F0F0F0]">
                {puzzleState.status === 'playing' && !puzzleState.waitingOpponent
                  ? <><span className="text-[#E2B340]">Mutarea ta!</span> Joci cu <span className={`px-1.5 py-0.5 rounded text-xs ${playerColor === 'white' ? 'bg-[#F0F0F0] text-black' : 'bg-[#2A2A2A] border border-[#3A3A3A] text-[#F0F0F0]'}`}>{playerColor === 'white' ? '♔ Alb' : '♚ Negru'}</span></>
                  : <>Joci cu <span className={`px-1.5 py-0.5 rounded text-xs ${playerColor === 'white' ? 'bg-[#F0F0F0] text-black' : 'bg-[#2A2A2A] border border-[#3A3A3A] text-[#F0F0F0]'}`}>{playerColor === 'white' ? '♔ Alb' : '♚ Negru'}</span></>
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
                <div className="relative flex-1 rounded-xl overflow-hidden border border-[#2A2A2A]">
                  <Chessboard
                    options={{
                      position: puzzleState.game.fen(),
                      onPieceDrop,
                      onSquareClick,
                      allowDragging: puzzleState.status === 'playing' && !puzzleState.waitingOpponent,
                      boardOrientation: playerColor,
                      boardStyle: { borderRadius: 0 },
                      darkSquareStyle: { backgroundColor: '#3A3A3A' },
                      lightSquareStyle: { backgroundColor: '#f0d9b5' },
                      squareStyles: boardSquareStyles,
                      arrows: boardArrows,
                    }}
                  />
                  {xpBurst !== null && (
                    <div
                      className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-10 rounded-full bg-[rgba(226,179,64,0.95)] px-4 py-1.5 text-sm font-black text-black shadow-lg"
                      style={{ animation: 'xp-float 1.5s ease-out forwards' }}
                    >
                      +{xpBurst} XP · Serie {correctStreak}
                    </div>
                  )}

                  {puzzleState.status === 'wrong' && (
                    <div className="absolute top-0 left-0 right-0 z-20 p-2">
                      <div
                        className="mx-auto max-w-md rounded-xl border border-[rgba(251,191,36,0.45)] bg-[#1C1C1C]/95 backdrop-blur-sm shadow-2xl p-3 space-y-2"
                        style={{ animation: 'pop-in 0.25s ease-out' }}
                      >
                        <div className="flex items-center gap-2">
                          {evalLoading
                            ? <Loader2 className="h-4 w-4 animate-spin text-[#fbbf24]" />
                            : <Info className="h-4 w-4 text-[#fbbf24]" />}
                          <p className="text-sm font-bold text-[#fbbf24]">Mai gândește-te</p>
                        </div>
                        {evalLoading ? (
                          <p className="text-sm text-[#A0A0A0]">Se analizează poziția...</p>
                        ) : moveExplanation ? (
                          <p className="text-sm text-[#F0F0F0] leading-relaxed">{moveExplanation.message}</p>
                        ) : null}
                        {secondHint && (
                          <div className="rounded-lg bg-[rgba(226,179,64,0.1)] border border-[rgba(226,179,64,0.3)] p-2.5">
                            <p className="text-sm text-[#F0C85A]">{secondHint}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Corect (fără near-equal) */}
              {puzzleState.status === 'correct' && !moveExplanation && (
                <div className="flex items-center gap-2 rounded-lg bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.3)] p-3">
                  <CheckCircle2 className="h-5 w-5 text-[#4ade80]" />
                  <span className="text-[#4ade80] font-semibold">Corect! Excelent!</span>
                  <Button size="sm" className="ml-auto" onClick={() => void loadNext(activeOffset)}>Următor</Button>
                </div>
              )}

              {/* Near-equal — acceptat */}
              {puzzleState.status === 'correct' && moveExplanation?.type === 'near-equal' && (
                <div className="rounded-lg bg-[rgba(226,179,64,0.1)] border border-[rgba(226,179,64,0.3)] p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-[#E2B340] mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#E2B340] font-semibold">Bine jucat!</p>
                      <p className="text-sm text-[#A0A0A0] mt-0.5">{moveExplanation.message}</p>
                      {moveExplanation.nearEqualAlternatives && moveExplanation.nearEqualAlternatives.length > 0 && (
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span className="text-xs text-[#6B6B6B]">Variante echivalente:</span>
                          {moveExplanation.nearEqualAlternatives.map(san => (
                            <span key={san} className="font-mono text-xs font-semibold text-[#E2B340] bg-[rgba(226,179,64,0.15)] px-1.5 py-0.5 rounded">
                              {san}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button size="sm" className="ml-auto flex-shrink-0" onClick={() => void loadNext(activeOffset)}>Următor</Button>
                  </div>
                </div>
              )}

              {/* Opțiuni — exact sub puzzle */}
              {puzzleState.status === 'wrong' && (
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="secondary" className="gap-2" onClick={resetToInitial}>
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reia poziția
                  </Button>

                  {hintLevel < 1 && (
                    <Button size="sm" variant="secondary" onClick={() => useHint(1)}>
                      Dă-mi un indiciu <span className="opacity-60 ml-1">· ¾ XP</span>
                    </Button>
                  )}
                  {hintLevel < 2 && (
                    <Button size="sm" variant="secondary" onClick={() => useHint(2)}>
                      Arată ce trebuie să mut <span className="opacity-60 ml-1">· ¼ XP</span>
                    </Button>
                  )}
                  {hintLevel < 3 && (
                    <Button size="sm" variant="secondary" onClick={() => useHint(3)}>
                      Nu mă prind, arată mutarea <span className="opacity-60 ml-1">· fără XP</span>
                    </Button>
                  )}

                  <Button size="sm" className="ml-auto" onClick={() => void loadNext(activeOffset)}>Următor</Button>
                </div>
              )}

              {puzzleState.waitingOpponent && (
                <p className="text-sm text-[#6B6B6B] text-center">Adversarul mută...</p>
              )}
            </div>
          ) : (
            <div className="flex justify-center py-16 text-[#6B6B6B]">Niciun puzzle încărcat.</div>
          )}
        </div>

        {/* Info puzzle */}
        <div className="space-y-4">
          {currentPuzzle && (
            <Card className="p-4 space-y-3">
              <div>
                <p className="text-xs text-[#6B6B6B] uppercase tracking-wider mb-1">Rating puzzle</p>
                <p className="text-2xl font-bold text-[#F0F0F0]">{currentPuzzle.rating}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B6B6B] uppercase tracking-wider mb-2">Teme</p>
                <div className="flex flex-wrap gap-1.5">
                  {displayThemes(currentPuzzle.themes).map(theme => (
                    <Badge key={theme} variant="accent">
                      {themeLabel(theme)}
                    </Badge>
                  ))}
                </div>
              </div>
              {currentPuzzle.game_url && (
                <a
                  href={currentPuzzle.game_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#E2B340] hover:text-[#F0C85A]"
                >
                  Partida originală pe Lichess →
                </a>
              )}
            </Card>
          )}

          <Card className="p-4">
            <p className="text-xs text-[#6B6B6B] uppercase tracking-wider mb-2">Cum funcționează rating-ul</p>
            <ul className="space-y-1.5 text-sm text-[#A0A0A0]">
              <li>• Joci doar din 3 benzi: inferioară, a ta și superioară</li>
              <li>• Banda ta: <span className="text-[#4ade80]">+5</span> / <span className="text-[#FB7185]">−5</span> · inferioară: <span className="text-[#4ade80]">+3</span> / <span className="text-[#FB7185]">−7</span> · superioară: <span className="text-[#4ade80]">+7</span> / <span className="text-[#FB7185]">−3</span></li>
              <li>• 5 corecte la rând → promovare automată la banda superioară</li>
            </ul>
            <button
              onClick={() => navigate('/puzzles/placement')}
              className="mt-3 text-xs text-[#A0A0A0] hover:text-[#E2B340] transition-colors underline underline-offset-2"
            >
              Refă testul de plasament
            </button>
          </Card>

          <Card className="p-4">
            <label className="flex items-center justify-between gap-3 cursor-pointer select-none">
              <div>
                <p className="text-sm text-[#F0F0F0] font-medium">Bara de evaluare</p>
                <p className="text-xs text-[#6B6B6B] mt-0.5">Afișează evaluarea după fiecare mutare</p>
              </div>
              <button
                role="switch"
                aria-checked={evalBarEnabled}
                onClick={() => setEvalBarEnabled(v => !v)}
                className={cn(
                  'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200',
                  evalBarEnabled ? 'bg-[#E2B340]' : 'bg-[#2A2A2A]'
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
              Consultă-l pe En Passant
            </Button>
          )}
        </div>
      </div>

      {coachOpen && puzzleState && (
        <AICoachPanel
          fen={playerMoveSan && wrongFen ? wrongFen : puzzleState.game.fen()}
          context={
            playerMoveSan && wrongFen
              ? `Exercițiu tactic (puzzle). FEN-ul dat este poziția DE DINAINTE de mutarea jucătorului — la mutare este ${playerColor === 'white' ? 'Albul' : 'Negrul'}. Jucătorul a încercat ${playerMoveSan}, dar nu este mutarea corectă; cea corectă este ${moveExplanation?.bestMoveSan ?? 'necunoscută'}. Explică de ce ${playerMoveSan} nu funcționează și ce idee era mai bună.`
              : `Exercițiu tactic (puzzle). La mutare este ${playerColor === 'white' ? 'Albul' : 'Negrul'}.`
          }
          onClose={() => setCoachOpen(false)}
        />
      )}
    </div>
  )
}
