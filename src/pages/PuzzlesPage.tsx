import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Chessboard, type PieceDropHandlerArgs } from 'react-chessboard'
import { Chess } from 'chess.js'
import { CheckCircle2, RefreshCw, Loader2, Info, Target, Flame, Calendar, Lightbulb, Sparkles, ChevronLeft, ChevronRight, ChevronDown, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useBoardTheme } from '@/hooks/useBoardTheme'
import { useSubscription } from '@/hooks/useSubscription'
import { fetchLichessPuzzleNext, eloToDifficulty, fetchLichessCloudEval } from '@/lib/lichess'
import { initPuzzleState, lichessPuzzleToLocal, uciToSan, analyzeWrongMove, basePuzzleXp, buildSpecificHint, type PuzzleState } from '@/lib/puzzle-utils'
import { accessibleBands, type BandOffset, type PuzzleBand } from '@/lib/puzzle-rating'
import { themeLabel, displayThemes } from '@/lib/puzzle-themes'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { AICoachPanel } from '@/components/chess/AICoachPanel'
import { MascotEnPassant } from '@/components/ui/MascotEnPassant'
import { cn } from '@/lib/utils'
import type { Puzzle } from '@/types'

// Culoare per poziție a benzii (inferioară / curentă / superioară)
function offsetColor(o: BandOffset): string {
  return o === -1 ? '#60a5fa' : o === 0 ? '#E2B340' : '#f97316'
}

// Helperi cu efect (ceas), ținuți la nivel de modul — nu în corpul componentei.
// Sunt apelați doar din handlere și efecte, niciodată în timpul render-ului.
//
// `pickRandom` a dispărut odată cu alegerea în client: acum serverul alege,
// fiindcă doar el ştie ce ai rezolvat deja.
function nowMs(): number {
  return Date.now()
}

// ---- Completarea benzii din Lichess ----
// Sub atâtea puzzle-uri nevăzute rămase în bandă, aducem altele. Pragul e
// deasupra lui zero intenţionat: dacă am aştepta să se golească, ai apuca să
// vezi ultimele câteva de mai multe ori.
const TOP_UP_THRESHOLD = 8
const TOP_UP_BATCH = 5
// Lichess nu ţinteşte exact o bandă, deci unele aduse pot cădea alături. Fără
// răcire, o bandă greu de umplut ar declanşa cereri la fiecare puzzle.
const TOP_UP_COOLDOWN_MS = 60_000
let lastTopUp = 0

/** Aduce un puzzle de la Lichess şi îl salvează în banca noastră. */
async function fetchAndStore(band: PuzzleBand): Promise<Puzzle> {
  const lp = await fetchLichessPuzzleNext(eloToDifficulty(band.floor + 100))
  const puzzle = lichessPuzzleToLocal(lp)
  // Prin RPC, nu prin insert direct: `puzzles` e tabel comun şi n-are politică
  // de scriere — vechiul `upsert` din client era respins în tăcere.
  await supabase.rpc('store_lichess_puzzle', {
    p_id: puzzle.id,
    p_fen: puzzle.fen,
    p_moves: puzzle.moves,
    p_rating: puzzle.rating,
    p_themes: puzzle.themes,
    p_game_url: puzzle.game_url ?? null,
  })
  return puzzle
}

/**
 * Plasă de siguranţă: un puzzle din bandă, ales în client.
 *
 * Se foloseşte doar când `next_puzzle_for` nu răspunde — de obicei fiindcă
 * migrarea 037 n-a fost aplicată. Nu ştie ce ai rezolvat deja, deci se pot
 * repeta; dar o pagină care repetă e mai bună decât una care nu încarcă nimic.
 */
async function loadFromBand(band: PuzzleBand): Promise<Puzzle | null> {
  const { data } = await supabase.from('puzzles').select('*')
    .gte('rating', band.floor)
    .lt('rating', band.ceil)
    .limit(200)
  const pool = (data ?? []) as Puzzle[]
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

/** Îmbogăţeşte banda în fundal. Eşecurile se ignoră — e doar o completare. */
async function topUpBand(band: PuzzleBand): Promise<void> {
  if (nowMs() - lastTopUp < TOP_UP_COOLDOWN_MS) return
  lastTopUp = nowMs()
  for (let i = 0; i < TOP_UP_BATCH; i++) {
    try {
      await fetchAndStore(band)
    } catch {
      return
    }
  }
}

// Penalizarea fixă de XP pentru fiecare indiciu (scăzută din recompensa puzzle-ului).
// Nivel 3 („arată mutarea") = pierzi toată recompensa. Eșec după un indiciu = −1 XP.
const HINT_PENALTY: Record<number, number> = { 1: 2, 2: 3 }
const HINT_FAIL_PENALTY = 1

// Teme pentru provocările zilnice curate
const COUNTER_THEMES = ['quietMove', 'zugzwang', 'defensiveMove', 'interference', 'clearance', 'xRayAttack', 'intermezzo', 'underPromotion']
const SATISFYING_THEMES = ['smotheredMate', 'doubleCheck', 'discoveredAttack', 'attraction', 'sacrifice', 'backRankMate', 'operaMate']

type DailyKind = 'zi' | 'contra' | 'satisf'
// Doar titlul: subtitlurile („Provocarea de azi, aceeaşi pentru toţi") repetau
// ce spunea deja numele şi ocupau înălţime înaintea tablei.
const DAILY_META: Record<DailyKind, { title: string }> = {
  zi: { title: 'Puzzle-ul zilei' },
  contra: { title: 'Cel mai contraintuitiv' },
  satisf: { title: 'Cel mai satisfăcător' },
}

interface MoveExplanation {
  type: 'wrong' | 'near-equal'
  message: string
  bestMoveSan?: string
  nearEqualAlternatives?: string[]
}

export function PuzzlesPage() {
  const navigate = useNavigate()
  const { user, profile, fetchProfile } = useAuth()
  const { isPro } = useSubscription()
  const { lightSquareStyle, darkSquareStyle } = useBoardTheme()

  const [puzzleState, setPuzzleState] = useState<PuzzleState | null>(null)
  // Cea mai avansată semi-mutare atinsă în linia curentă = poziția „actuală" spre care duce săgeata dreapta
  const [maxPly, setMaxPly] = useState(0)
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null)
  const [todayCount, setTodayCount] = useState(0)
  const [nextLoading, setNextLoading] = useState(false)
  const [coachOpen, setCoachOpen] = useState(false)
  const [showRatingInfo, setShowRatingInfo] = useState(false)

  // Rating de puzzle: sursa de adevăr e profilul, dar rezultatul unei rezolvări
  // ajunge aici înaintea reîncărcării profilului. Îl păstrăm local și îi dăm
  // prioritate — derivat, nu oglindit printr-un efect.
  const [latestResult, setLatestResult] = useState<{ rating: number; streak: number } | null>(null)
  const puzzleRating = latestResult?.rating ?? profile?.puzzle_rating ?? null
  const winStreak = latestResult?.streak ?? profile?.puzzle_win_streak ?? 0
  const [activeOffset, setActiveOffset] = useState<BandOffset>(0)
  const [lastDelta, setLastDelta] = useState<number | null>(null)
  const ratingAppliedRef = useRef(false)

  // Burst "+XP" la fiecare serie de 3 rezolvări
  const [correctStreak, setCorrectStreak] = useState(0)
  const [xpBurst, setXpBurst] = useState<number | null>(null)
  const puzzlePerfectRef = useRef(true)

  // Indicii: 0 = niciunul, 1 = indiciu (−2), 2 = arată piesa (−3), 3 = arată mutarea (fără XP).
  // Un singur indiciu pe puzzle; după el trebuie nimerită mutarea, altfel −1 XP (o dată).
  const [hintLevel, setHintLevel] = useState(0)
  const hintLevelRef = useRef(0)
  const hintFailAppliedRef = useRef(false)
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

  const FREE_LIMIT = 10

  // ---- Provocările zilei (puzzle-uri curate, fără plasament) ----
  const [daily, setDaily] = useState<Partial<Record<DailyKind, Puzzle>>>({})
  const [mode, setMode] = useState<'rated' | 'daily'>('rated')
  // Oglindă a lui `mode` citibilă din callback-uri async (evaluări Stockfish care se întorc
  // târziu). Ținut sincron manual în loadDaily / backToChallenges — singurele locuri care
  // schimbă modul — ca să nu scriem în ref în timpul render-ului.
  const modeRef = useRef<'rated' | 'daily'>('rated')
  const [dailyKind, setDailyKind] = useState<DailyKind | null>(null)

  // Alege puzzle-urile zilnice determinist (seed = data), din tabela locală
  useEffect(() => {
    void (async () => {
      const seed = Number(new Date().toISOString().slice(0, 10).replace(/-/g, ''))
      const pick = async (
        q: ReturnType<ReturnType<typeof supabase.from>['select']>, offset: number,
      ): Promise<Puzzle | undefined> => {
        const { data } = await q.order('id').limit(300)
        const pool = (data ?? []) as Puzzle[]
        return pool.length ? pool[(seed + offset) % pool.length] : undefined
      }
      const [zi, contra, satisf] = await Promise.all([
        pick(supabase.from('puzzles').select('*').gte('rating', 900).lt('rating', 1600), 0),
        pick(supabase.from('puzzles').select('*').overlaps('themes', COUNTER_THEMES), 1),
        pick(supabase.from('puzzles').select('*').overlaps('themes', SATISFYING_THEMES), 2),
      ])
      setDaily({ zi, contra, satisf })
    })()
  }, [])

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

  const attemptMutation = useMutation({
    mutationFn: async ({ solved, timeSeconds, xpAmount }: { solved: boolean; timeSeconds: number; xpAmount: number }) => {
      if (!user || !currentPuzzle) return
      await supabase.from('user_puzzle_attempts').insert({
        user_id: user.id,
        puzzle_id: currentPuzzle.id,
        solved,
        time_seconds: timeSeconds,
      })
      if (xpAmount !== 0) {
        await supabase.rpc('award_xp', { p_user_id: user.id, p_amount: xpAmount })
        await fetchProfile(user.id)
      }
      if (solved) setTodayCount(c => c + 1)
    },
  })

  // Aplică rezultatul la rating-ul de puzzle (o singură dată per puzzle, server-side).
  // Memoizat fiindcă e dependență a lui tryMove.
  const applyRating = useCallback((solved: boolean) => {
    if (modeRef.current === 'daily') return  // provocările zilnice nu schimbă rating-ul
    if (ratingAppliedRef.current || !user || !currentPuzzle) return
    ratingAppliedRef.current = true
    void (async () => {
      const { data, error } = await supabase.rpc('apply_puzzle_result', {
        p_user_id: user.id, p_puzzle_id: currentPuzzle.id, p_solved: solved,
      })
      if (error || !data || (typeof data === 'object' && 'error' in data)) return
      const res = data as { rating: number; delta: number; promoted: boolean; streak: number }
      setLatestResult({ rating: res.rating, streak: res.streak })
      setLastDelta(res.delta)
      window.setTimeout(() => setLastDelta(null), 2200)
      if (res.promoted) toast.success('Promovat! 5 corecte la rând — treci la intervalul de Elo superior 🎯')
    })()
  }, [user, currentPuzzle])

  // Penalizare anti-skip: după 3 apăsări pe "Puzzle nou" în 60 min, XP × 1/3
  function skipPenaltyActive(): boolean {
    const cutoff = nowMs() - 60 * 60 * 1000
    skipTimestampsRef.current = skipTimestampsRef.current.filter(t => t > cutoff)
    return skipTimestampsRef.current.length > 3
  }

  // Citește doar din ref-uri, deci nu are dependențe. Memoizat ca dependență a lui tryMove.
  const computeSolveXp = useCallback((rating: number): number => {
    const base = basePuzzleXp(rating)
    const level = hintLevelRef.current
    const penalty = level >= 3 ? base : (HINT_PENALTY[level] ?? 0)
    const skip = skipPenaltyActive() ? (1 / 3) : 1
    return Math.max(0, Math.round((base - penalty) * skip))
  }, [])

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

  function revealHint(level: number) {
    setHintLevel(level)
    hintLevelRef.current = level
    puzzlePerfectRef.current = false
    if (level >= 1) setSecondHint(pendingHintRef.current || null)
  }

  function handleSkipPuzzle() {
    if (puzzleState && puzzleState.status === 'playing') {
      skipTimestampsRef.current.push(nowMs())
      setCorrectStreak(0)
    }
    void loadNext(activeOffset)
  }

  // Încarcă un puzzle-provocare zilnic (fără plasament, nu afectează rating-ul)
  function loadDaily(kind: DailyKind) {
    const p = daily[kind]
    if (!p) return
    setMode('daily')
    modeRef.current = 'daily'
    setDailyKind(kind)
    loadPuzzle(p)
  }

  // Revine la lista de provocări (și reia antrenamentul rated dacă are rating)
  function backToChallenges() {
    setMode('rated')
    modeRef.current = 'rated'
    setDailyKind(null)
    setCurrentPuzzle(null)
    setPuzzleState(null)
    clearWrongState()
    if (puzzleRating != null) void loadNext(activeOffset)  // reia antrenamentul rated
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
    puzzlePerfectRef.current = true
    ratingAppliedRef.current = false
    hintFailAppliedRef.current = false
    try {
      const state = initPuzzleState(puzzle.fen, puzzle.moves)
      setPuzzleState(state)
      setMaxPly(state.currentMoveIdx)
      setPlayerColor(state.game.turn() === 'w' ? 'white' : 'black')
    } catch (e) {
      console.error('[loadPuzzle] initPuzzleState failed:', e, { fen: puzzle.fen, moves: puzzle.moves })
      setCurrentPuzzle(null)
      toast.error('Puzzle invalid — se încarcă altul...')
      void loadNext(activeOffset)
    }
  }

  // Navighează la o poziție unde e RÂNDUL JUCĂTORULUI (`target`), animând întâi mutarea
  // adversarului care duce acolo — ca s-o vezi — apoi poți muta imediat.
  function goToPlayerPosition(target: number) {
    if (!currentPuzzle || !puzzleState) return
    const fen = currentPuzzle.fen
    const mvs = puzzleState.solutionMoves
    const t = Math.max(0, Math.min(target, mvs.length))
    const build = (idx: number) => {
      const g = new Chess(fen)
      for (let i = 0; i < idx; i++) {
        const m = mvs[i]
        g.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m[4] ?? undefined })
      }
      return g
    }
    clearWrongState()
    if (t > 0) {
      // Arată poziția dinainte de mutarea adversarului (solutionMoves[t-1]), apoi o animează.
      setPuzzleState(s => s ? { ...s, game: build(t - 1), currentMoveIdx: t - 1, status: 'playing', waitingOpponent: true } : null)
      setTimeout(() => {
        setPuzzleState(s => s ? { ...s, game: build(t), currentMoveIdx: t, status: 'playing', waitingOpponent: false } : null)
      }, 450)
    } else {
      setPuzzleState(s => s ? { ...s, game: build(0), currentMoveIdx: 0, status: 'playing', waitingOpponent: false } : null)
    }
  }

  // „Înapoi": la decizia ta anterioară. Din „greșit", prima apăsare reia poziția curentă
  // (re-animează mutarea adversarului și poți re-juca). Aterizează mereu pe rândul tău.
  function stepBack() {
    if (!puzzleState || puzzleState.waitingOpponent) return
    const cur = puzzleState.currentMoveIdx
    const target = puzzleState.status === 'wrong' ? cur : cur - 2
    goToPlayerPosition(Math.max(1, target))
  }

  // „Înainte": spre poziția curentă (cea mai avansată), o mutare completă odată.
  function stepForward() {
    if (!puzzleState || puzzleState.waitingOpponent) return
    goToPlayerPosition(Math.min(maxPly, puzzleState.currentMoveIdx + 2))
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
      // Serverul alege unul pe care nu l-ai mai văzut. Înainte luam primele 40
      // rânduri din bandă, fără ordonare — adică mereu aceleaşi.
      const { data, error } = await supabase.rpc('next_puzzle_for', {
        p_floor: band.floor,
        p_ceil: band.ceil,
      })

      if (!error) {
        const res = data as { puzzle: Puzzle | null; unseen_left: number; band_total: number }
        if (res.puzzle) {
          loadPuzzle(res.puzzle)
          // Se apropie de fundul benzii: aducem altele în fundal, ca data
          // viitoare să existe din ce alege.
          if (res.unseen_left <= TOP_UP_THRESHOLD) void topUpBand(band)
          return
        }
        // Banda e goală de tot — aducem unul de la Lichess, cu aşteptare.
        loadPuzzle(await fetchAndStore(band))
        return
      }

      // RPC-ul lipseşte (migrarea 037 neaplicată) sau a eşuat. Nu lăsăm pagina
      // moartă din cauza asta: încărcăm din bandă ca înainte. Se pot repeta
      // puzzle-uri, dar măcar există puzzle-uri.
      console.warn('[puzzles] next_puzzle_for a eşuat, folosesc varianta simplă:', error)
      const fallback = await loadFromBand(band)
      if (fallback) {
        loadPuzzle(fallback)
        return
      }
      loadPuzzle(await fetchAndStore(band))
    } catch (e) {
      console.error('[puzzles] încărcare eşuată:', e)
      toast.error('Nu am putut încărca un puzzle nou.')
    } finally {
      setNextLoading(false)
    }
  }

  // Încarcă primul puzzle când avem rating (banda curentă).
  // Declarat după `loadNext` ca efectul să prindă versiunea din render-ul curent.
  useEffect(() => {
    if (puzzleRating != null && !currentPuzzle) {
      void loadNext(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzleRating])

  // Logica unei mutări, independentă de sursa ei (drag sau click-to-move).
  const tryMove = useCallback((source: string, target: string) => {
    if (!puzzleState || puzzleState.status !== 'playing' || puzzleState.waitingOpponent) return false
    if (!currentPuzzle) return false
    // În timpul derulării poți ajunge la o poziție unde e rândul adversarului — atunci nu se mută.
    if (puzzleState.game.turn() !== (playerColor === 'white' ? 'w' : 'b')) return false

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
        pendingHintRef.current = buildSpecificHint(currentPuzzle.themes)
        setWrongFen(fenBeforeMove)
        setPlayerMoveSan(uciToSan(fenBeforeMove, myMove))
        setPuzzleState(s => s ? { ...s, game: gameCopy, status: 'wrong' } : null)
        setMaxPly(puzzleState.currentMoveIdx)
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
          registerWrong()
          // Dacă ai folosit un indiciu (nivel 1/2) și tot ai greșit → −1 XP, o singură dată.
          let failPenalty = 0
          if ((hintLevelRef.current === 1 || hintLevelRef.current === 2) && !hintFailAppliedRef.current) {
            failPenalty = -HINT_FAIL_PENALTY
            hintFailAppliedRef.current = true
          }
          attemptMutation.mutate({ solved: false, timeSeconds: elapsed, xpAmount: failPenalty })
          applyRating(false)
        })()

        return true
      }

      const nextIdx = puzzleState.currentMoveIdx + 1
      const isLast = nextIdx >= puzzleState.solutionMoves.length

      if (isLast) {
        setPuzzleState(s => s ? { ...s, game: gameCopy, status: 'correct', currentMoveIdx: nextIdx } : null)
        setMaxPly(nextIdx)
        const elapsed = Math.round((Date.now() - puzzleState.startTime) / 1000)
        toast.success('Corect!')
        const xpSolve = computeSolveXp(currentPuzzle.rating)
        attemptMutation.mutate({ solved: true, timeSeconds: elapsed, xpAmount: xpSolve })
        registerSolve(xpSolve)
        applyRating(true)
        return true
      }

      const opponentMove = puzzleState.solutionMoves[nextIdx]
      setPuzzleState(s => s ? { ...s, game: gameCopy, currentMoveIdx: nextIdx, waitingOpponent: true } : null)
      setMaxPly(nextIdx)

      setTimeout(() => {
        try {
          const g2 = new Chess(gameCopy.fen())
          g2.move({ from: opponentMove.slice(0, 2), to: opponentMove.slice(2, 4), promotion: opponentMove[4] ?? undefined })
          setPuzzleState(s => s ? { ...s, game: g2, currentMoveIdx: nextIdx + 1, waitingOpponent: false } : null)
          setMaxPly(nextIdx + 1)
        } catch { /* skip */ }
      }, 500)

      return true
    } catch {
      return false
    }
  }, [puzzleState, currentPuzzle, playerColor, attemptMutation, applyRating, computeSolveXp])

  // Adaptor pentru tablă: targetSquare e null când piesa e lăsată în afara ei.
  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs) =>
      targetSquare ? tryMove(sourceSquare, targetSquare) : false,
    [tryMove]
  )

  const onSquareClick = useCallback(({ square }: { square: string; piece?: unknown }) => {
    if (!puzzleState || puzzleState.status !== 'playing' || puzzleState.waitingOpponent) return
    if (puzzleState.game.turn() !== (playerColor === 'white' ? 'w' : 'b')) return

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

    const ok = tryMove(selectedSquare, square)
    const from = selectedSquare
    setSelectedSquare(null)
    if (!ok) {
      setShakingSquare(from)
      setTimeout(() => setShakingSquare(null), 1500)
    }
  }, [puzzleState, selectedSquare, playerColor, tryMove])

  const limitReached = !isPro && todayCount >= FREE_LIMIT
  const hasRating = puzzleRating != null

  // `currentBand` a dispărut odată cu antetul: banda curentă se vede în
  // selectorul „Interval de Elo" din şina dreaptă, care o şi evidenţiază.
  const bands = hasRating ? accessibleBands(puzzleRating!) : []

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
    // Zoom 10% pe toată pagina de puzzle-uri (mărește uniform tot conținutul).
    // `zoom: 1.1` a stat aici de la o ajustare veche şi făcea pagina asta cu 10%
    // mai mare decât toate celelalte — inclusiv tabla, faţă de Cufărul cu tactici.
    <div className="space-y-6">
      {/* Fără antet de pagină: „Puzzle-uri" repeta intrarea deja evidenţiată în
          bara de sus, intervalul de Elo e chiar selectorul din şina dreaptă, iar
          rating-ul puzzle-ului curent apare tot acolo. Rămâne doar ce nu se vede
          în altă parte: câte puzzle-uri ţi-au mai rămas azi, pe planul gratuit. */}
      <div className="flex items-center justify-end gap-3">
        {!isPro && (
          <span className="text-sm text-[#6B6B6B]">
            {todayCount} / {FREE_LIMIT} azi
          </span>
        )}

        {/* Rating curent — stil chess.com */}
        {hasRating && (
        <>
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
        </>
        )}
      </div>

      {/* Provocările zilei — mereu vizibile, fără plasament */}
      <div>
        <h2 className="text-base font-bold text-[#F0F0F0] uppercase tracking-wider mb-4">Provocările zilei</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {(['zi', 'contra', 'satisf'] as DailyKind[]).map(kind => {
            const p = daily[kind]
            const Icon = kind === 'zi' ? Calendar : kind === 'contra' ? Lightbulb : Sparkles
            const active = mode === 'daily' && dailyKind === kind
            return (
              // Fără subtitlu: „Provocarea de azi, aceeaşi pentru toţi" nu spunea
              // nimic ce nu se vedea deja din titlu, şi împingea tabla în jos.
              <button
                key={kind}
                onClick={() => loadDaily(kind)}
                disabled={!p}
                className={cn(
                  'flex items-center gap-3 text-left rounded-xl border p-3 transition-all disabled:opacity-50',
                  active
                    ? 'border-[rgba(226,179,64,0.55)] bg-[rgba(226,179,64,0.06)] shadow-[0_0_18px_rgba(226,179,64,0.12)]'
                    : 'border-[#2A2A2A] bg-[#141414] hover:border-[#3A3A3A] hover:-translate-y-0.5'
                )}
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[rgba(226,179,64,0.12)] text-[#E2B340]">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-[#F0F0F0]">
                    {DAILY_META[kind].title}
                  </span>
                  <span className="block text-xs font-semibold text-[#E2B340]">
                    {p ? `Rezolvă · ELO ${p.rating}` : 'Indisponibil azi'}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Banner plasament (dacă nu ai rating) — antrenamentul pe nivelul tău */}
      {!hasRating && mode === 'rated' && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center rounded-xl border border-[rgba(226,179,64,0.3)] bg-[rgba(226,179,64,0.06)] p-4">
          <MascotEnPassant mood="encouraging" size={44} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#F0F0F0]">Deblochează antrenamentul pe nivelul tău</p>
            <p className="text-xs text-[#A0A0A0] mt-0.5">
              Fă testul de plasament (20 de puzzle-uri) ca să primești un rating și puzzle-uri exact pe măsura ta.
            </p>
          </div>
          <Button size="sm" className="flex-shrink-0" onClick={() => navigate('/puzzles/placement')}>
            Începe testul de plasament
          </Button>
        </div>
      )}

      {/* Back când rezolvi o provocare zilnică */}
      {mode === 'daily' && (
        <button onClick={backToChallenges} className="flex items-center gap-1.5 text-sm text-[#A0A0A0] hover:text-[#F0F0F0] transition-colors">
          <ChevronLeft className="h-4 w-4" /> Înapoi la provocări
        </button>
      )}

      {/* Buton „Cum funcționează rating-ul" — stânga sus; explicația apare ca popover peste tablă */}
      {hasRating && mode === 'rated' && (
      <div>
        <button
          onClick={() => setShowRatingInfo(v => !v)}
          className="flex items-center gap-2 rounded-xl border border-[#2A2A2A] bg-[#141414] px-4 py-2.5 text-sm text-[#A0A0A0] hover:text-[#E2B340] hover:border-[#3A3A3A] transition-colors"
        >
          <Info className="h-4 w-4" /> Cum funcționează rating-ul
          <ChevronDown className={`h-4 w-4 transition-transform ${showRatingInfo ? 'rotate-180' : ''}`} />
        </button>
      </div>
      )}

      {limitReached && (
        <div className="rounded-xl bg-[rgba(226,179,64,0.08)] border border-[rgba(226,179,64,0.3)] p-4 text-center">
          <p className="text-[#E2B340] font-semibold">Ai atins limita zilnică de {FREE_LIMIT} puzzle-uri</p>
          <p className="text-[#6B6B6B] text-sm mt-1">Upgrade la Pro pentru puzzle-uri nelimitate</p>
          <a href="/pricing" className="mt-3 inline-block">
            <Button size="sm">Upgrade la Pro</Button>
          </a>
        </div>
      )}

      {/* Coloana din dreapta (acțiuni/rating/interval) e mai lată ca textul butoanelor
          să intre pe un singur rând; containerul e lărgit ca panoul să folosească marginea din dreapta. */}
      {/* Coloanele şi plafonul de lăţime stau în `.board-grid` (index.css):
          aveau nevoie de un `calc` cu --board-max, care ca şir de utilitare
          arbitrare ar fi fost de necitit. */}
      <div className="board-grid">
        {/* Panou stânga — explicația mutării greșite (sus, în zona liberă din stânga tablei) */}
        <div className="xl:order-1 order-2 space-y-4">
          {puzzleState?.status === 'wrong' && (
            <Card className="p-4 space-y-2 border-[rgba(251,191,36,0.4)]">
              <div className="flex items-center gap-2">
                {evalLoading
                  ? <Loader2 className="h-4 w-4 animate-spin text-[#fbbf24]" />
                  : <Info className="h-4 w-4 text-[#fbbf24]" />}
                <p className="text-sm font-bold text-[#fbbf24]">Mai gândește-te</p>
              </div>
              {/* Feedback inițial DOAR până apeși un indiciu (hintLevel 0). L1 = întrebare orientativă.
                  L2+ = doar highlight pe piesă, fără niciun text. */}
              {evalLoading ? (
                <p className="text-sm text-[#A0A0A0]">Se analizează poziția...</p>
              ) : hintLevel === 0 && moveExplanation ? (
                <p className="text-sm text-[#F0F0F0] leading-relaxed">{moveExplanation.message}</p>
              ) : hintLevel === 1 && secondHint ? (
                <div className="rounded-lg bg-[rgba(226,179,64,0.1)] border border-[rgba(226,179,64,0.3)] p-2.5">
                  <p className="text-sm text-[#F0C85A]">{secondHint}</p>
                </div>
              ) : null}
            </Card>
          )}
        </div>

        {/* Tablă */}
        <div className="xl:order-2 order-1 relative min-w-0">
          {/* „Cum funcționează rating-ul" — popover flotant, centrat deasupra tablei; nu deplasează layout-ul */}
          {showRatingInfo && (
            <div className="absolute left-1/2 top-1 z-30 w-[min(94%,26rem)] -translate-x-1/2 rounded-xl border border-[#2A2A2A] bg-[#141414]/95 backdrop-blur-sm shadow-2xl p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-xs text-[#6B6B6B] uppercase tracking-wider">Cum funcționează rating-ul</p>
                <button onClick={() => setShowRatingInfo(false)} className="-mr-1 -mt-1 rounded p-1 text-[#6B6B6B] hover:text-[#F0F0F0] hover:bg-[#2A2A2A] transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ul className="space-y-1.5 text-sm text-[#A0A0A0]">
                <li>• Joci doar din 3 intervale de Elo: sub tine, al tău și peste tine</li>
                <li>• Intervalul tău: <span className="text-[#4ade80]">+5</span> / <span className="text-[#FB7185]">−5</span> · sub tine: <span className="text-[#4ade80]">+3</span> / <span className="text-[#FB7185]">−7</span> · peste tine: <span className="text-[#4ade80]">+7</span> / <span className="text-[#FB7185]">−3</span></li>
                <li>• 5 corecte la rând → urci automat la intervalul de Elo superior</li>
              </ul>
              <button onClick={() => { setShowRatingInfo(false); navigate('/puzzles/placement') }} className="mt-3 text-xs text-[#A0A0A0] hover:text-[#E2B340] transition-colors underline underline-offset-2">
                Refă testul de plasament
              </button>
            </div>
          )}
          {nextLoading && !puzzleState ? (
            <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
          ) : puzzleState ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-[#F0F0F0]">
                {puzzleState.status === 'playing' && !puzzleState.waitingOpponent && puzzleState.game.turn() === (playerColor === 'white' ? 'w' : 'b')
                  ? <><span className="text-[#E2B340]">Mutarea ta!</span> Joci cu <span className={`px-1.5 py-0.5 rounded text-xs ${playerColor === 'white' ? 'bg-[#F0F0F0] text-black' : 'bg-[#2A2A2A] border border-[#3A3A3A] text-[#F0F0F0]'}`}>{playerColor === 'white' ? '♔ Alb' : '♚ Negru'}</span></>
                  : <>Joci cu <span className={`px-1.5 py-0.5 rounded text-xs ${playerColor === 'white' ? 'bg-[#F0F0F0] text-black' : 'bg-[#2A2A2A] border border-[#3A3A3A] text-[#F0F0F0]'}`}>{playerColor === 'white' ? '♔ Alb' : '♚ Negru'}</span></>
                }
              </div>
              {/* Aceeaşi latură ca în Cufărul cu tactici — vezi --board-max */}
              <div className="flex gap-2 items-stretch">
                <div
                  className="relative w-full rounded-xl overflow-hidden border border-[#2A2A2A]"
                  style={{ maxWidth: 'min(var(--board-max), 100%)' }}
                >
                  <Chessboard
                    options={{
                      position: puzzleState.game.fen(),
                      onPieceDrop,
                      onSquareClick,
                      allowDragging: puzzleState.status === 'playing' && !puzzleState.waitingOpponent && puzzleState.game.turn() === (playerColor === 'white' ? 'w' : 'b'),
                      boardOrientation: playerColor,
                      boardStyle: { borderRadius: 0 },
                      darkSquareStyle,
                      lightSquareStyle,
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

                </div>
              </div>

              {/* Navigare prin mutări — la fiecare pas se animează mutarea adversarului,
                  apoi e rândul tău: poți muta imediat ce o vezi. */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={stepBack}
                  disabled={puzzleState.waitingOpponent || (puzzleState.currentMoveIdx <= 1 && puzzleState.status !== 'wrong')}
                  title="Înapoi la mutarea ta anterioară"
                  className="flex items-center gap-1 rounded-lg border border-[#2A2A2A] bg-[#141414] px-3 py-1.5 text-sm text-[#A0A0A0] hover:text-[#F0F0F0] hover:border-[#3A3A3A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" /> Înapoi
                </button>
                {puzzleState.currentMoveIdx < maxPly && (
                  <button
                    onClick={stepForward}
                    disabled={puzzleState.waitingOpponent}
                    title="Înainte, spre poziția curentă"
                    className="flex items-center gap-1 rounded-lg border border-[#2A2A2A] bg-[#141414] px-3 py-1.5 text-sm text-[#A0A0A0] hover:text-[#F0F0F0] hover:border-[#3A3A3A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Înainte <ChevronRight className="h-4 w-4" />
                  </button>
                )}
                {puzzleState.currentMoveIdx < maxPly && (
                  <span className="text-xs text-[#6B6B6B]">
                    {puzzleState.waitingOpponent
                      ? 'Se joacă mutarea adversarului…'
                      : 'E rândul tău — mută ca să reiei de aici'}
                  </span>
                )}
              </div>

              {/* Corect (fără near-equal) */}
              {puzzleState.status === 'correct' && !moveExplanation && (
                <div className="flex items-center gap-2 rounded-lg bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.3)] p-3">
                  <CheckCircle2 className="h-5 w-5 text-[#4ade80]" />
                  <span className="text-[#4ade80] font-semibold">Corect! Excelent!</span>
                  <Button size="sm" className="ml-auto" onClick={mode === 'daily' ? backToChallenges : () => void loadNext(activeOffset)}>{mode === 'daily' ? 'Înapoi la provocări' : 'Următor'}</Button>
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
                    <Button size="sm" className="ml-auto flex-shrink-0" onClick={mode === 'daily' ? backToChallenges : () => void loadNext(activeOffset)}>{mode === 'daily' ? 'Înapoi la provocări' : 'Următor'}</Button>
                  </div>
                </div>
              )}

              {puzzleState.waitingOpponent && (
                <p className="text-sm text-[#6B6B6B] text-center">Adversarul mută...</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-16 text-center text-[#6B6B6B]">
              <p>{hasRating ? 'Niciun puzzle încărcat.' : 'Alege o provocare de mai sus ca să începi să rezolvi.'}</p>
              {hasRating && (
                <Button size="sm" variant="secondary" onClick={() => void loadNext(0)}>Încarcă un puzzle</Button>
              )}
            </div>
          )}
        </div>

        {/* Info puzzle */}
        <div className="space-y-4 xl:order-3 order-3">
          {/* „Puzzle nou" — buton de sine stătător, sus dreapta */}
          {hasRating && mode === 'rated' && (
            <Button variant="secondary" size="md" className="w-full justify-center gap-2 text-base" onClick={handleSkipPuzzle} disabled={limitReached || nextLoading}>
              <RefreshCw className={`h-4 w-4 ${nextLoading ? 'animate-spin' : ''}`} /> Puzzle nou
            </Button>
          )}

          {/* Coach — buton de sine stătător, cu mascota în dreapta textului (tot centrat) */}
          {puzzleState && (
            <Button variant="secondary" size="md" className="w-full justify-center gap-2 text-base" onClick={() => setCoachOpen(true)}>
              Consultă Căluțul savant
              <MascotEnPassant size={22} />
            </Button>
          )}

          {/* Acțiuni (indicii) — doar când ai greșit. Un singur indiciu pe puzzle:
              după ce alegi unul, toate dispar. */}
          {puzzleState?.status === 'wrong' && (
            <Card className="p-4 space-y-2">
              <p className="text-xs text-[#6B6B6B] uppercase tracking-wider mb-1">Acțiuni</p>
              {hintLevel === 0 ? (
                <>
                  <Button size="sm" variant="secondary" className="w-full justify-start" onClick={() => revealHint(1)}>
                    Dă-mi un indiciu <span className="opacity-60 ml-auto">−2 XP</span>
                  </Button>
                  <Button size="sm" variant="secondary" className="w-full justify-start" onClick={() => revealHint(2)}>
                    Arată ce trebuie să mut <span className="opacity-60 ml-auto">−3 XP</span>
                  </Button>
                  <Button size="sm" variant="secondary" className="w-full justify-start" onClick={() => revealHint(3)}>
                    Nu mă prind, arată mutarea <span className="opacity-60 ml-auto">fără XP</span>
                  </Button>
                </>
              ) : (hintLevel === 1 || hintLevel === 2) ? (
                <p className="text-xs text-[#fbbf24] leading-relaxed">
                  Nimerește mutarea acum — dacă greșești, pierzi <span className="font-semibold">−1 XP</span> în plus.
                </p>
              ) : null}
              <Button size="sm" className="w-full" onClick={mode === 'daily' ? backToChallenges : () => void loadNext(activeOffset)}>
                {mode === 'daily' ? 'Înapoi la provocări' : 'Următor'}
              </Button>
            </Card>
          )}

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

          {/* Interval de Elo — mărit, lângă „Rating puzzle" */}
          {hasRating && mode === 'rated' && (
            <Card className="p-4">
              <p className="text-xs text-[#6B6B6B] uppercase tracking-wider mb-2">Interval de Elo</p>
              <div className="space-y-2">
                {bands.map(({ offset, band, gain, loss }) => (
                  <button
                    key={offset}
                    onClick={() => void loadNext(offset)}
                    disabled={limitReached || nextLoading}
                    className={cn(
                      'w-full flex items-center justify-between rounded-xl px-4 py-2.5 border-2 transition-all disabled:opacity-50',
                      activeOffset === offset
                        ? 'text-black border-transparent'
                        : 'bg-transparent text-[#A0A0A0] border-[#2A2A2A] hover:border-[#3A3A3A] hover:text-[#F0F0F0]'
                    )}
                    style={activeOffset === offset ? { backgroundColor: offsetColor(offset), borderColor: offsetColor(offset) } : {}}
                  >
                    <span className="text-sm font-bold tabular-nums">{band.label}</span>
                    <span className={cn('text-sm font-bold', activeOffset === offset ? 'text-black/80' : '')}>
                      <span className={activeOffset === offset ? '' : 'text-[#4ade80]'}>+{gain}</span>
                      {' / '}
                      <span className={activeOffset === offset ? '' : 'text-[#FB7185]'}>−{loss}</span>
                    </span>
                  </button>
                ))}
              </div>
            </Card>
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
