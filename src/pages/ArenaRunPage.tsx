import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Chess } from 'chess.js'
import { Chessboard, type PieceDropHandlerArgs } from 'react-chessboard'
import { Flame, Timer, ChevronLeft, TrendingUp, TrendingDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { useStockfish } from '@/hooks/useStockfish'
import { useBoardTheme } from '@/hooks/useBoardTheme'
import { useArenaDraw, useArenaSubmit, ARENA_ROUNDS } from '@/hooks/useArena'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import {
  engineSettings, targetEloFor, toUserCp, roundGain, runScore,
  formatPawns, scoreVerdict, estimateXp, pickPlausibleMistake,
  type ArenaRoundResult,
} from '@/lib/arena'
import type { ArenaDrawRow } from '@/lib/supabase'

/** Ceasul întregii probe. Unul singur, nu unul pe rundă. */
const CLOCK_MS = 8 * 60 * 1000

/** Adâncimea la care se măsoară poziţia. Aceeaşi la început şi la final —
 *  altfel diferenţa ar măsura adâncimea, nu jocul. */
const EVAL_DEPTH = 14

type Phase =
  | 'trag'          // se trag rundele la sorţi
  | 'pregatesc'     // se construieşte poziţia de start a rundei
  | 'tu'            // e rândul tău
  | 'motor'         // adversarul se gândeşte
  | 'runda-gata'    // runda s-a încheiat, se arată bilanţul
  | 'trimit'
  | 'gata'

interface RoundState {
  game: Chess
  baseCp: number
  startFen: string
  moves: string[]
  plyBudget: number
}

/** Transformă o mutare UCI în forma cerută de chess.js. */
function uciToMove(uci: string) {
  return { from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] || 'q' }
}

/** Aplică o mutare, întorcând `false` dacă e ilegală în loc să arunce. */
function tryMove(game: Chess, uci: string): boolean {
  try {
    return game.move(uciToMove(uci)) !== null
  } catch {
    return false
  }
}

export function ArenaRunPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { lightSquareStyle, darkSquareStyle } = useBoardTheme()
  const { evalPosition, getCandidates, getMoveAtStrength, resetStrength } = useStockfish()
  const draw = useArenaDraw()
  const submit = useArenaSubmit()

  // Doar numărul se ţine în afara efectelor: `engineSettings` întoarce un obiect
  // nou la fiecare apel, deci ca dependenţă ar reporni efectele la nesfârşit.
  const targetElo = targetEloFor(profile?.puzzle_rating ?? profile?.estimated_elo)

  const [phase, setPhase] = useState<Phase>('trag')
  const [rounds, setRounds] = useState<ArenaDrawRow[]>([])
  const [idx, setIdx] = useState(0)
  const [round, setRound] = useState<RoundState | null>(null)
  const [results, setResults] = useState<ArenaRoundResult[]>([])
  const [liveCp, setLiveCp] = useState<number | null>(null)
  const [msLeft, setMsLeft] = useState(CLOCK_MS)
  const [finalXp, setFinalXp] = useState<number | null>(null)

  /** Momentul pornirii. 0 = proba n-a început încă; se pune la tragerea la sorţi. */
  const startedAt = useRef(0)
  /** Împiedică pornirea de două ori a aceleiaşi etape (StrictMode, re-randări). */
  const busy = useRef(false)

  const current = rounds[idx] ?? null

  // ---- ceasul --------------------------------------------------------------
  const timeUp = msLeft <= 0
  useEffect(() => {
    if (phase === 'gata' || phase === 'trimit' || phase === 'trag') return
    const t = setInterval(() => {
      const left = Math.max(0, CLOCK_MS - (Date.now() - startedAt.current))
      setMsLeft(left)
      // Expirarea se tratează aici, nu într-un efect separat: acolo ar fi o
      // schimbare de stare pornită sincron din corpul unui efect.
      if (left <= 0) setPhase(p => (p === 'tu' || p === 'motor' ? 'runda-gata' : p))
    }, 250)
    return () => clearInterval(t)
  }, [phase])

  // ---- 1. tragerea la sorţi ------------------------------------------------
  useEffect(() => {
    if (phase !== 'trag' || busy.current) return
    busy.current = true
    draw.mutateAsync()
      .then(rows => {
        busy.current = false
        if (rows.length === 0) {
          toast.error('Nu am găsit deschideri din cursurile tale.')
          navigate('/proba')
          return
        }
        startedAt.current = Date.now()
        setRounds(rows)
        setPhase('pregatesc')
      })
      .catch((e: Error) => {
        busy.current = false
        toast.error(e.message || 'Nu am putut porni proba.')
        navigate('/proba')
      })
  }, [phase, draw, navigate])

  // ---- 2. construirea poziţiei de start ------------------------------------
  useEffect(() => {
    if (phase !== 'pregatesc' || !current || busy.current) return
    busy.current = true

    void (async () => {
      const game = new Chess()

      // Poziţia de plecare: fie capătul variantei studiate, fie un FEN dat.
      if (current.fen) {
        try { game.load(current.fen) } catch { /* rămâne poziţia iniţială */ }
      } else if (current.moves_uci) {
        for (const uci of current.moves_uci.trim().split(/\s+/)) {
          if (!tryMove(game, uci)) break
        }
      }

      const userColor = current.user_color

      // Dacă nu e rândul tău, adversarul mută o dată — proba începe mereu cu tine.
      const turnOf = () => (game.turn() === 'w' ? 'white' : 'black')
      if (turnOf() !== userColor && !game.isGameOver()) {
        try {
          const m = await getMoveAtStrength(game.fen(), engineSettings(targetElo))
          tryMove(game, m)
        } catch { /* mergem mai departe cu poziţia aşa cum e */ }
      }

      // Rundele de dezavantaj: motorul face în locul tău o greşeală plauzibilă,
      // apoi adversarul o pedepseşte. De-aici pleci — dintr-o groapă pe care
      // chiar ai fi putut s-o sapi singur în deschiderea asta.
      if (current.kind === 'dezavantaj' && !game.isGameOver() && turnOf() === userColor) {
        try {
          const lines = await getCandidates(game.fen(), 4, 12)
          const mistake = pickPlausibleMistake(lines)
          if (mistake && tryMove(game, mistake) && !game.isGameOver()) {
            const reply = await getMoveAtStrength(game.fen(), engineSettings(targetElo))
            tryMove(game, reply)
          }
        } catch { /* fără dezavantaj fabricat — runda rămâne una obişnuită */ }
      }

      // Măsurătoarea de plecare. Fără ea nu există punctaj.
      let baseCp = 0
      try {
        const raw = await evalPosition(game.fen(), EVAL_DEPTH, true)
        baseCp = toUserCp(raw, game.fen(), userColor)
      } catch { /* 0 e o plecare onestă dacă motorul tace */ }

      busy.current = false
      setRound({
        game,
        baseCp,
        startFen: game.fen(),
        moves: [],
        plyBudget: current.plies,
      })
      setLiveCp(baseCp)
      setPhase(game.isGameOver() ? 'runda-gata' : 'tu')
    })()
  }, [phase, current, targetElo, evalPosition, getCandidates, getMoveAtStrength])

  // ---- 3. mutarea adversarului ---------------------------------------------
  useEffect(() => {
    if (phase !== 'motor' || !round || busy.current) return
    busy.current = true

    void (async () => {
      let played = false
      try {
        const m = await getMoveAtStrength(round.game.fen(), engineSettings(targetElo))
        played = tryMove(round.game, m)
        if (played) round.moves.push(m)
      } catch { /* dacă motorul nu răspunde, îţi dăm rândul înapoi */ }

      busy.current = false
      const done = round.game.isGameOver() || round.moves.length >= round.plyBudget
      setRound({ ...round })
      setPhase(done ? 'runda-gata' : 'tu')
      if (!played && !done) setPhase('tu')
    })()
  }, [phase, round, targetElo, getMoveAtStrength])

  // ---- 4. închiderea rundei ------------------------------------------------
  useEffect(() => {
    if (phase !== 'runda-gata' || !round || !current || busy.current) return
    busy.current = true

    void (async () => {
      const userColor = current.user_color
      let finalCp: number

      if (round.game.isCheckmate()) {
        // Matul e decisiv indiferent ce zice căutarea: cine e la mutare a pierdut.
        const loser = round.game.turn() === 'w' ? 'white' : 'black'
        finalCp = loser === userColor ? -1000 : 1000
      } else if (round.game.isGameOver()) {
        finalCp = 0   // pat, repetiţie, material insuficient — remiză curată
      } else {
        try {
          const raw = await evalPosition(round.game.fen(), EVAL_DEPTH, true)
          finalCp = toUserCp(raw, round.game.fen(), userColor)
        } catch {
          finalCp = round.baseCp
        }
      }

      setLiveCp(finalCp)
      setResults(prev => [...prev, {
        course_slug: current.course_slug,
        label: current.label,
        kind: current.kind,
        start_fen: round.startFen,
        base_cp: round.baseCp,
        final_cp: finalCp,
        moves_uci: round.moves.join(' '),
      }])
      busy.current = false
    })()
  }, [phase, round, current, evalPosition])

  // ---- 5. runda următoare, sau finalul -------------------------------------
  const goNext = useCallback(() => {
    const last = idx + 1 >= rounds.length || timeUp
    if (last) {
      setPhase('trimit')
      return
    }
    setIdx(i => i + 1)
    setRound(null)
    setLiveCp(null)
    setPhase('pregatesc')
  }, [idx, rounds.length, timeUp])

  // ---- 6. trimiterea la server ---------------------------------------------
  useEffect(() => {
    if (phase !== 'trimit' || busy.current) return
    busy.current = true
    resetStrength()

    submit.mutateAsync({
      targetElo,
      durationMs: Date.now() - startedAt.current,
      rounds: results,
    })
      .then(res => { busy.current = false; setFinalXp(res.xp); setPhase('gata') })
      .catch((e: Error) => {
        busy.current = false
        toast.error(e.message || 'Nu am putut salva proba.')
        setPhase('gata')
      })
  }, [phase, submit, results, targetElo, resetStrength])

  // ---- mutarea ta ----------------------------------------------------------
  const handleDrop = useCallback(({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
    if (phase !== 'tu' || !round || !targetSquare) return false

    const uci = `${sourceSquare}${targetSquare}`
    const before = round.game.fen()
    if (!tryMove(round.game, uci) && !tryMove(round.game, `${uci}q`)) return false
    if (round.game.fen() === before) return false

    round.moves.push(round.game.history({ verbose: true }).slice(-1)[0]?.lan ?? uci)

    const done = round.game.isGameOver() || round.moves.length >= round.plyBudget
    setRound({ ...round })
    setPhase(done ? 'runda-gata' : 'motor')
    return true
  }, [phase, round])

  // ---- randare -------------------------------------------------------------
  if (phase === 'trag') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <Spinner />
        <p className="text-sm text-[#6B6B6B]">Aleg trei poziţii din cursurile tale…</p>
      </div>
    )
  }

  if (phase === 'gata') {
    return <RunSummary results={results} xp={finalXp} />
  }

  const total = runScore(results)
  const gainNow = round && liveCp !== null ? roundGain(round.baseCp, liveCp) : 0
  const roundDone = phase === 'runda-gata' && results.length > idx

  return (
    <div className="flex flex-col gap-4 lg:h-[var(--app-page-h)]">
      {/* Antet: ceas, rundă, scor */}
      <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/proba"
            className="flex items-center gap-1 text-sm text-[#6B6B6B] transition-colors hover:text-[#A0A0A0]"
          >
            <ChevronLeft className="h-4 w-4" />
            Renunţă
          </Link>
          <span className="text-sm text-[#6B6B6B]">
            Runda <span className="font-semibold text-[#F0F0F0]">{idx + 1}</span> din{' '}
            {rounds.length || ARENA_ROUNDS}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1.5 tabular-nums ${
            msLeft < 60000 ? 'text-[#FB7185]' : 'text-[#A0A0A0]'
          }`}>
            <Timer className="h-4 w-4" />
            <span className="font-semibold">
              {Math.floor(msLeft / 60000)}:{String(Math.floor((msLeft % 60000) / 1000)).padStart(2, '0')}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-[#E2B340]" />
            <span className="font-semibold tabular-nums text-[#F0F0F0]">
              {formatPawns(total)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
        {/* Tabla */}
        <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center">
          <div className="aspect-square w-full max-w-full overflow-hidden rounded-xl border border-[#2A2A2A] lg:h-full lg:max-h-full lg:w-auto">
            {round ? (
              <Chessboard
                options={{
                  position: round.game.fen(),
                  onPieceDrop: handleDrop,
                  allowDragging: phase === 'tu',
                  boardOrientation: current?.user_color === 'black' ? 'black' : 'white',
                  boardStyle: { borderRadius: 0 },
                  darkSquareStyle,
                  lightSquareStyle,
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[#141414]">
                <Spinner />
              </div>
            )}
          </div>
        </div>

        {/* Coloana dreaptă */}
        <div className="min-h-0 shrink-0 space-y-3 overflow-y-auto lg:w-[var(--app-rail)]">
          {/* Ce joci acum */}
          <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
              {current?.course_title}
            </p>
            <p className="mt-1 text-sm font-semibold text-[#F0F0F0]">{current?.label}</p>
            <p className="mt-2 text-xs leading-relaxed text-[#6B6B6B]">
              {current?.kind === 'dezavantaj'
                ? 'Porneşti dintr-o poziţie proastă. Adu-o înapoi cât poţi de aproape de egalitate.'
                : 'Porneşti de la capătul deschiderii. Construieşte un avantaj.'}
            </p>
          </div>

          {/* Măsurătoarea */}
          {round && (
            <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-[#6B6B6B]">Ai primit</span>
                <span className="text-sm tabular-nums text-[#A0A0A0]">
                  {formatPawns(round.baseCp)}
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xs text-[#6B6B6B]">Acum</span>
                <span className="text-sm tabular-nums text-[#F0F0F0]">
                  {liveCp === null ? '…' : formatPawns(liveCp)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-[#2A2A2A] pt-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                  Runda asta
                </span>
                <span className={`flex items-center gap-1 font-bold tabular-nums ${
                  gainNow > 0 ? 'text-[#4ade80]' : gainNow < 0 ? 'text-[#FB7185]' : 'text-[#A0A0A0]'
                }`}>
                  {gainNow > 0 ? <TrendingUp className="h-4 w-4" /> : gainNow < 0 ? <TrendingDown className="h-4 w-4" /> : null}
                  {formatPawns(gainNow)}
                </span>
              </div>
              <p className="mt-2 text-xs text-[#6B6B6B]">
                {round.moves.length} din {round.plyBudget} semimutări
              </p>
            </div>
          )}

          {/* Starea */}
          <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-4">
            {phase === 'pregatesc' && <p className="text-sm text-[#A0A0A0]">Pregătesc poziţia…</p>}
            {phase === 'tu' && <p className="text-sm font-medium text-[#E2B340]">E rândul tău.</p>}
            {phase === 'motor' && <p className="text-sm text-[#A0A0A0]">Călușul se gândeşte…</p>}
            {phase === 'trimit' && <p className="text-sm text-[#A0A0A0]">Salvez proba…</p>}
            {phase === 'runda-gata' && (
              roundDone ? (
                <div>
                  <p className="text-sm font-semibold text-[#F0F0F0]">
                    {scoreVerdict(gainNow)}
                  </p>
                  <p className="mt-1 text-xs text-[#6B6B6B]">
                    {timeUp ? 'Ceasul a expirat.' : 'Runda s-a încheiat.'}
                  </p>
                  <Button onClick={goNext} className="mt-3 w-full">
                    {idx + 1 >= rounds.length || timeUp ? 'Vezi rezultatul' : 'Runda următoare'}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-[#A0A0A0]">Măsor poziţia finală…</p>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Bilanţul probei, rundă cu rundă. */
function RunSummary({ results, xp }: { results: ArenaRoundResult[]; xp: number | null }) {
  const total = runScore(results)

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#1A1410] to-[#141414] p-6 text-center">
        <Flame className="mx-auto h-8 w-8 text-[#E2B340]" />
        <p className="mt-3 text-3xl font-bold tabular-nums text-[#F0F0F0]">
          {formatPawns(total)}
        </p>
        <p className="mt-1 text-sm text-[#A0A0A0]">{scoreVerdict(total)}</p>
        <p className="mt-3 text-sm text-[#E2B340]">
          +{xp ?? estimateXp(total)} XP
        </p>
      </div>

      <div className="space-y-2">
        {results.map((r, i) => {
          const g = roundGain(r.base_cp, r.final_cp)
          return (
            <div
              key={i}
              className="flex items-center justify-between gap-4 rounded-xl border border-[#2A2A2A] bg-[#141414] p-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#F0F0F0]">{r.label}</p>
                <p className="mt-0.5 text-xs text-[#6B6B6B]">
                  {r.kind === 'dezavantaj' ? 'Recuperare' : 'Construcţie'}
                  {' · '}
                  {formatPawns(r.base_cp)} → {formatPawns(r.final_cp)}
                </p>
              </div>
              <span className={`flex-shrink-0 font-bold tabular-nums ${
                g > 0 ? 'text-[#4ade80]' : g < 0 ? 'text-[#FB7185]' : 'text-[#A0A0A0]'
              }`}>
                {formatPawns(g)}
              </span>
            </div>
          )
        })}
      </div>

      <div className="flex gap-3">
        <Link
          to="/proba"
          className="flex-1 rounded-xl border border-[#2A2A2A] bg-[#141414] py-3 text-center text-sm font-medium text-[#F0F0F0] transition-colors hover:border-[#3A3A3A]"
        >
          Înapoi
        </Link>
        <Link
          to="/clasament"
          className="flex-1 rounded-xl bg-[#E2B340] py-3 text-center text-sm font-semibold text-black transition-colors hover:bg-[#EFC25C]"
        >
          Clasament
        </Link>
      </div>
    </div>
  )
}
