import { useState, useCallback, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Chess } from 'chess.js'
import { Chessboard, type PieceDropHandlerArgs } from 'react-chessboard'
import { ChevronLeft, ChevronRight, ChevronDown, RotateCcw, CheckCircle2, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { incarcaLinie, type TrainerLine, type MiddlegamePlan } from '@/lib/trainer-line'
import { useAuth } from '@/hooks/useAuth'
import { useBoardTheme } from '@/hooks/useBoardTheme'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

// Part boundaries (ply indices): Part1 = 0-9, Part2 = 10-15, Part3 = 16+
const PART_ENDS = [10, 16]

function getPartEnd(totalPlies: number, part: number, singlePart = false): number {
  if (singlePart) return totalPlies
  if (part === 1) return Math.min(PART_ENDS[0], totalPlies)
  if (part === 2) return Math.min(PART_ENDS[1], totalPlies)
  return totalPlies
}

function getTotalParts(totalPlies: number, singlePart = false): number {
  if (singlePart) return 1
  if (totalPlies > PART_ENDS[1]) return 3
  if (totalPlies > PART_ENDS[0]) return 2
  return 1
}


/** E albul la mutare în poziţia de plecare? */
function whiteMovesFirst(line: TrainerLine): boolean {
  return !line.start_fen || line.start_fen.includes(' w ')
}

function isUserPly(plyIdx: number, userColor: 'white' | 'black', whiteFirst = true): boolean {
  const whitePly = whiteFirst ? plyIdx % 2 === 0 : plyIdx % 2 === 1
  return (userColor === 'white') === whitePly
}

type TrainerStatus =
  | 'user-turn'
  | 'computer-thinking'
  | 'wrong'
  | 'part-done'
  | 'line-done'

interface TrainerState {
  game: Chess
  plyIdx: number
  part: number
  partEnd: number
  status: TrainerStatus
  wrongFrom: string | null
  wrongTo: string | null
}

function buildInitialState(line: TrainerLine): TrainerState {
  const moves = line.moves_uci.split(' ')
  const partEnd = getPartEnd(moves.length, 1, line.singlePart)
  return {
    game: new Chess(line.start_fen),
    plyIdx: 0,
    part: 1,
    partEnd,
    status: isUserPly(0, line.user_color, whiteMovesFirst(line)) ? 'user-turn' : 'computer-thinking',
    wrongFrom: null,
    wrongTo: null,
  }
}

// Reconstruiește poziția la reluare, rejucând mutările până la plyIdx-ul salvat.
function buildResumedState(line: TrainerLine, plyIdx: number): TrainerState {
  const moves = line.moves_uci.split(' ')
  const target = Math.max(0, Math.min(plyIdx, moves.length))
  const game = new Chess(line.start_fen)
  for (let i = 0; i < target; i++) {
    const m = moves[i]
    try { game.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m[4] ?? 'q' }) } catch { break }
  }
  const part = target >= PART_ENDS[1] ? 3 : target >= PART_ENDS[0] ? 2 : 1
  const partEnd = getPartEnd(moves.length, part, line.singlePart)
  const status: TrainerStatus = target >= moves.length
    ? 'line-done'
    : target >= partEnd
    ? 'part-done'
    : isUserPly(target, line.user_color, whiteMovesFirst(line)) ? 'user-turn' : 'computer-thinking'
  return { game, plyIdx: target, part, partEnd, status, wrongFrom: null, wrongTo: null }
}

const resumeKey = (lineId: string, stage: string) => `op-resume:${stage}:${lineId}`

const PART_LABELS = ['Primele 5 mutări', 'Următoarele 5 mutări', 'Spre jocul de mijloc']

interface Props {
  mode: 'guided' | 'practice'
  /** 'opening' = linia de deschidere; 'middlegame' = continuarea de după ea; 'trap' = capcana. */
  stage?: 'opening' | 'middlegame' | 'trap'
}

export function OpeningTrainerPage({ mode, stage = 'opening' }: Props) {
  const { slug, lineId } = useParams<{ slug: string; lineId: string }>()
  const { user, fetchProfile } = useAuth()
  const { lightSquareStyle, darkSquareStyle } = useBoardTheme()
  const isGuided = mode === 'guided'
  const isMiddlegame = stage === 'middlegame'
  const isTrap = stage === 'trap'
  const savedDoneRef = useRef(false)

  const { data: line, isLoading } = useQuery({
    queryKey: ['trainer-line', lineId, stage, mode],
    queryFn: () => incarcaLinie(stage, mode, lineId!),
    enabled: !!lineId,
  })

  const [state, setState] = useState<TrainerState | null>(null)

  // Persistă progresul (doar mod ghidat): varianta curentă + eventual finalizarea.
  const persistProgress = useCallback(async (markDone: boolean) => {
    if (!isGuided || !line || !user) return
    const { data: existing } = await supabase
      .from('user_course_progress')
      .select('completed_lesson_ids, xp_earned')
      .eq('user_id', user.id).eq('course_id', line.course_id).single()
    const prev: string[] = existing?.completed_lesson_ids ?? []
    const already = prev.includes(line.id)
    await supabase.from('user_course_progress').upsert({
      user_id: user.id,
      course_id: line.course_id,
      completed_lesson_ids: markDone && !already ? [...prev, line.id] : prev,
      last_lesson_id: line.id,
      xp_earned: (existing?.xp_earned ?? 0) + (markDone && !already ? 30 : 0),
    })
    if (markDone && !already) {
      await supabase.rpc('award_xp', { p_user_id: user.id, p_amount: 30 })
      await fetchProfile(user.id)
      toast.success('+30 XP — Variantă stăpânită!')
    }
  }, [isGuided, line, user, fetchProfile])

  // Inițializează tabla când varianta sosește din query (react-query, deci async):
  // reia din plyIdx-ul salvat în mod ghidat, altfel pornește de la zero.
  //
  // Soluția idiomatică ar fi o componentă copil montată cu `key={line.id}`, care
  // ar putea inițializa starea direct în useState. Ar însemna însă mutarea întregii
  // logici de antrenament (9 puncte de setState) și nu merită riscul aici.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!line) return
    savedDoneRef.current = false
    if (isGuided) {
      const saved = Number(localStorage.getItem(resumeKey(line.id, stage)))
      setState(saved > 0 ? buildResumedState(line, saved) : buildInitialState(line))
      void persistProgress(false)
    } else {
      setState(buildInitialState(line))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Efectele de mai jos reacționează la progres/stare, nu la obiectul `state` întreg
  // (care conține și instanța Chess, schimbată la fiecare mutare).
  const plyIdx = state?.plyIdx
  const status = state?.status

  // Salvează punctul curent (plyIdx) pentru reluare exactă.
  useEffect(() => {
    if (!isGuided || !line || plyIdx == null || status === 'line-done') return
    localStorage.setItem(resumeKey(line.id, stage), String(plyIdx))
  }, [plyIdx, status, isGuided, line, stage])

  // La finalizarea variantei: marchează complet + curăță punctul de reluare.
  useEffect(() => {
    if (!isGuided || !line || state?.status !== 'line-done' || savedDoneRef.current) return
    savedDoneRef.current = true
    localStorage.removeItem(resumeKey(line.id, stage))
    void persistProgress(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  // Auto-play computer moves
  useEffect(() => {
    if (!state || !line || state.status !== 'computer-thinking') return
    const moves = line.moves_uci.split(' ')
    if (state.plyIdx >= state.partEnd || state.plyIdx >= moves.length) return

    const timer = setTimeout(() => {
      const uciMove = moves[state.plyIdx]
      const gameCopy = new Chess(state.game.fen())
      try {
        gameCopy.move({
          from: uciMove.slice(0, 2),
          to: uciMove.slice(2, 4),
          promotion: uciMove[4] ?? undefined,
        })
        const nextPly = state.plyIdx + 1
        let nextStatus: TrainerStatus
        if (nextPly >= state.partEnd) {
          nextStatus = state.partEnd >= moves.length ? 'line-done' : 'part-done'
        } else {
          nextStatus = isUserPly(nextPly, line.user_color, whiteMovesFirst(line)) ? 'user-turn' : 'computer-thinking'
        }
        setState(s => s ? { ...s, game: gameCopy, plyIdx: nextPly, status: nextStatus } : null)
      } catch {
        // invalid move in seed data — skip silently
      }
    }, 600)

    return () => clearTimeout(timer)
    // Intenționat doar status + plyIdx: `state` conține instanța Chess, care se
    // schimbă la fiecare mutare și ar reporni cronometrul de 600 ms al calculatorului.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, plyIdx, line])

  // Auto-clear wrong feedback after 1.2s in practice mode
  useEffect(() => {
    if (status !== 'wrong') return
    const timer = setTimeout(() => {
      setState(s => s ? { ...s, status: 'user-turn', wrongFrom: null, wrongTo: null } : null)
    }, 1200)
    return () => clearTimeout(timer)
  }, [status])

  const handlePieceDrop = useCallback(
    ({ sourceSquare: from, targetSquare: to }: PieceDropHandlerArgs): boolean => {
      if (!state || !line || state.status !== 'user-turn') return false
      // Piesă lăsată în afara tablei — snap-back, nu o marcăm ca mutare greșită
      if (!to) return false
      const moves = line.moves_uci.split(' ')
      const expected = moves[state.plyIdx]
      if (!expected) return false

      const myMove = from + to

      if (myMove !== expected.slice(0, 4)) {
        if (!isGuided) {
          setState(s => s ? { ...s, status: 'wrong', wrongFrom: from, wrongTo: to } : null)
        }
        return false
      }

      const gameCopy = new Chess(state.game.fen())
      try {
        gameCopy.move({ from, to, promotion: expected[4] ?? 'q' })
      } catch {
        return false
      }

      const nextPly = state.plyIdx + 1
      let nextStatus: TrainerStatus
      if (nextPly >= state.partEnd) {
        nextStatus = state.partEnd >= moves.length ? 'line-done' : 'part-done'
      } else {
        nextStatus = isUserPly(nextPly, line.user_color, whiteMovesFirst(line)) ? 'user-turn' : 'computer-thinking'
      }

      setState(s => s
        ? { ...s, game: gameCopy, plyIdx: nextPly, status: nextStatus, wrongFrom: null, wrongTo: null }
        : null)
      return true
    },
    [state, line, isGuided]
  )

  function advancePart() {
    if (!state || !line) return
    const moves = line.moves_uci.split(' ')
    const nextPart = state.part + 1
    const nextPartEnd = getPartEnd(moves.length, nextPart, line.singlePart)
    const nextPly = state.plyIdx
    const nextStatus: TrainerStatus = isUserPly(nextPly, line.user_color, whiteMovesFirst(line)) ? 'user-turn' : 'computer-thinking'
    setState(s => s
      ? { ...s, part: nextPart, partEnd: nextPartEnd, status: nextStatus, wrongFrom: null, wrongTo: null }
      : null)
  }

  function resetLine() {
    if (!line) return
    setState(buildInitialState(line))
  }



  if (isLoading || !state) {
    return <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
  }
  if (!line) {
    return <p className="text-[#6B6B6B]">Varianta nu a fost găsită.</p>
  }

  const moves = line.moves_uci.split(' ')
  const totalParts = getTotalParts(moves.length, line.singlePart)
  const progressPct = moves.length > 0 ? (state.plyIdx / moves.length) * 100 : 0

  // Current explanation (for whichever ply is being played now)
  const explanation = line.move_explanations?.[String(state.plyIdx)] ?? ''

  // Square highlights
  const squareStyles: Record<string, React.CSSProperties> = {}
  if (state.status === 'user-turn') {
    const nextMove = moves[state.plyIdx]
    if (isGuided && nextMove) {
      squareStyles[nextMove.slice(0, 2)] = { backgroundColor: 'rgba(226,179,64,0.65)' }
      squareStyles[nextMove.slice(2, 4)] = { backgroundColor: 'rgba(226,179,64,0.35)' }
    }
  }
  if (state.wrongFrom) {
    squareStyles[state.wrongFrom] = { backgroundColor: 'rgba(251,113,133,0.55)' }
  }
  if (state.wrongTo) {
    squareStyles[state.wrongTo] = { backgroundColor: 'rgba(251,113,133,0.30)' }
  }

  const isPlaying = state.status === 'user-turn' || state.status === 'computer-thinking' || state.status === 'wrong'

  return (
    // Pagina umple ecranul: antetul rămâne sus, iar tabla primeşte toată înălţimea
    // rămasă. Înainte, un `max-w-4xl` plafona totul la 896px şi tabla lua 2/3 din
    // atât — pe un ecran lat rezulta o tablă mică într-o mare de negru.
    <div className="flex flex-col gap-4" style={{ height: 'var(--app-page-h)' }}>
      {/* Back */}
      <Link
        to={`/courses/${slug}`}
        className="flex flex-shrink-0 items-center gap-1.5 text-sm text-[#A0A0A0] hover:text-[#F0F0F0] transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Înapoi la curs
      </Link>

      {/* Title row */}
      <div className="flex flex-shrink-0 items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#F0F0F0]">{line.variation_name}</h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">
            {isGuided ? 'Mod ghidat' : 'Pe cont propriu'}
            {isPlaying && (
              <> · <span className="text-[#A0A0A0]">Partea {state.part} din {totalParts}</span></>
            )}
          </p>
          {isTrap && line.fromVariation && (
            <p className="mt-1 text-sm text-[#6B6B6B]">
              Din <span className="text-[#A0A0A0]">{line.fromVariation}</span> · {line.user_color === 'white'
                ? 'joci cu albul — tu întinzi cursa'
                : 'joci cu negrul — tu pedepseşti greşeala'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs font-medium px-2 py-1 rounded-full border ${
            line.user_color === 'white'
              ? 'bg-[#F0F0F0] text-black border-[#F0F0F0]'
              : 'bg-[#141414] text-[#F0F0F0] border-[#3A3A3A]'
          }`}>
            {line.user_color === 'white' ? '♔ Alb' : '♚ Negru'}
          </span>
          <button
            onClick={resetLine}
            title="Reia de la început"
            className="p-1.5 text-[#3A3A3A] hover:text-[#A0A0A0] transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 flex-shrink-0 bg-[#2A2A2A] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#E2B340] rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
        {/* Tabla — pătrată, dimensionată din înălţimea rămasă şi centrată.
            `aspect-square h-full` îi dă lăţimea din înălţime; `max-w-full` o
            împiedică să depăşească pe ecrane mai înguste decât înalte. */}
        <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center">
          <div className="aspect-square h-full max-h-full max-w-full overflow-hidden rounded-xl border border-[#2A2A2A]">
            <Chessboard
              options={{
                position: state.game.fen(),
                onPieceDrop: handlePieceDrop,
                allowDragging: state.status === 'user-turn',
                boardOrientation: line.user_color === 'white' ? 'white' : 'black',
                squareStyles,
                boardStyle: { borderRadius: 0 },
                darkSquareStyle,
                lightSquareStyle,
              }}
            />
          </div>
        </div>

        {/* Coloana dreaptă — lăţime fixă, cu scroll propriu dacă e nevoie, ca
            înălţimea ei să nu influenţeze niciodată dimensiunea tablei.
            De aici vine şi libertatea de a pune planul întreg în ea. */}
        <div
          className="min-h-0 shrink-0 space-y-3 overflow-y-auto lg:w-[var(--app-rail)]"
        >
          {/* Status + explanation card */}
          <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] p-4">
            {state.status === 'user-turn' && (
              <div>
                <p className="text-xs font-semibold text-[#E2B340] uppercase tracking-wider mb-2">
                  Mutarea ta
                </p>
                {isGuided ? (
                  <p className="text-sm text-[#A0A0A0]">
                    Mută piesa de pe pătratul auriu pe destinație.
                  </p>
                ) : (
                  <p className="text-sm text-[#A0A0A0]">
                    Gândește-te la teoria opening-ului și mută.
                  </p>
                )}
                {isGuided && explanation && (
                  <div className="mt-3 pt-3 border-t border-[#2A2A2A]">
                    <p className="text-xs text-[#A0A0A0] leading-relaxed">{explanation}</p>
                  </div>
                )}
              </div>
            )}
            {state.status === 'computer-thinking' && (
              <div>
                <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">
                  Adversarul mută
                </p>
                <p className="text-sm text-[#A0A0A0]">Calculez răspunsul teoretic...</p>
                {isGuided && explanation && (
                  <div className="mt-3 pt-3 border-t border-[#2A2A2A]">
                    <p className="text-xs text-[#A0A0A0] leading-relaxed">{explanation}</p>
                  </div>
                )}
              </div>
            )}
            {state.status === 'wrong' && (
              <div>
                <p className="text-xs font-semibold text-[#FB7185] uppercase tracking-wider mb-2">
                  Mutare greșită
                </p>
                <p className="text-sm text-[#A0A0A0]">
                  Aceasta nu este mutarea din teorie. Gândește-te din nou.
                </p>
              </div>
            )}
            {(state.status === 'part-done' || state.status === 'line-done') && (
              <div>
                <p className="text-xs font-semibold text-[#4ade80] uppercase tracking-wider mb-2">
                  {state.status === 'line-done' ? 'Variantă completă' : 'Fază completă'}
                </p>
                <p className="text-sm text-[#A0A0A0]">
                  {state.status === 'line-done'
                    ? 'Ai parcurs toate mutările din această variantă.'
                    : 'Excelent! Ai finalizat această parte a opening-ului.'}
                </p>
              </div>
            )}
          </div>

          {/* Planul variantei — doar la jocul de mijloc, unde există.
              Deschis din start la lecţie, strâns la exerciţiu: acolo te testezi,
              iar „c5 e singura ta spargere" citit înainte de mutare nu mai e
              gândire, e răspuns. Rămâne la un click distanţă dacă te blochezi. */}
          {isMiddlegame && line.plan && (
            <PlanulVariantei plan={line.plan} deschisInitial={isGuided} />
          )}

          {/* Parts tracker */}
          <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] p-4">
            <p className="text-xs text-[#6B6B6B] uppercase tracking-wider mb-3">Progres Variație</p>
            <div className="space-y-2.5">
              {Array.from({ length: totalParts }).map((_, i) => {
                const partNum = i + 1
                const isDone = state.part > partNum || state.status === 'line-done'
                const isCurrent = state.part === partNum && state.status !== 'line-done'
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-2.5 text-sm ${
                      isDone ? 'text-[#4ade80]' : isCurrent ? 'text-[#F0F0F0]' : 'text-[#3A3A3A]'
                    }`}
                  >
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isDone
                        ? 'bg-[#4ade80] text-black'
                        : isCurrent
                        ? 'bg-[#E2B340] text-black'
                        : 'bg-[#1C1C1C] text-[#3A3A3A]'
                    }`}>
                      {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : partNum}
                    </div>
                    <span>{line.singlePart ? 'Capcana, de la cap la coadă' : PART_LABELS[i]}</span>
                  </div>
                )
              })}
            </div>

            {/* Part-done CTA — inline, not fullscreen */}
            {state.status === 'part-done' && (
              <button
                onClick={advancePart}
                className="mt-4 w-full flex items-center justify-between gap-2 rounded-lg border border-[rgba(226,179,64,0.3)] bg-[rgba(226,179,64,0.08)] px-3 py-2.5 text-sm text-[#E2B340] hover:bg-[rgba(226,179,64,0.14)] transition-colors"
              >
                <span>Ești gata de următoarea fază a opening-ului?</span>
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              </button>
            )}

            {/* Line-done CTAs */}
            {state.status === 'line-done' && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-[#4ade80] font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  {isTrap ? 'Capcana, ştiută pe de rost!' : isMiddlegame ? 'Planul dus până la capăt!' : 'Opening parcurs cu succes!'}
                </div>

                {isTrap && line.conclusion && (
                  <p className="mt-2 text-sm leading-relaxed text-[#A0A0A0]">{line.conclusion}</p>
                )}

                {/* Următoarea etapă. Din deschidere treci la jocul de mijloc,
                    plecând exact din poziţia la care ai ajuns. */}
                {stage === 'opening' && (
                  <Link
                    to={`/courses/${slug}/middlegame/${lineId}`}
                    className="flex w-full items-center justify-between gap-2 rounded-lg border border-[rgba(226,179,64,0.3)] bg-[rgba(226,179,64,0.08)] px-3 py-2.5 text-sm text-[#E2B340] transition-colors hover:bg-[rgba(226,179,64,0.14)]"
                  >
                    <span>Parcurge ideile din jocul de mijloc</span>
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  </Link>
                )}

                <div className="flex gap-2 pt-1">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={resetLine}>
                    Repetă
                  </Button>
                  {isGuided && (
                    <Link
                      to={isMiddlegame
                        ? `/courses/${slug}/middlegame-practice/${lineId}`
                        : `/courses/${slug}/practice/${lineId}`}
                      className="flex-1"
                    >
                      <Button size="sm" className="w-full">Pe cont propriu</Button>
                    </Link>
                  )}
                  {!isGuided && (
                    <Link to={`/courses/${slug}`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full">Alte variante</Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mode switcher. Rămâne în etapa în care eşti: de la planul de joc de
              mijloc, „pe cont propriu" înseamnă tot jocul de mijloc, nu te aruncă
              înapoi în deschidere. */}
          <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] p-4">
            <p className="text-xs text-[#6B6B6B] uppercase tracking-wider mb-2">Antrenează-te</p>
            <div className="space-y-1">
              <Link
                to={
                  isTrap
                    ? `/courses/${slug}/trap/${lineId}`
                    : isMiddlegame
                    ? `/courses/${slug}/middlegame/${lineId}`
                    : `/courses/${slug}/guided/${lineId}`
                }
                className={`block text-sm px-3 py-2 rounded-lg transition-colors ${
                  isGuided
                    ? 'bg-[rgba(226,179,64,0.15)] text-[#E2B340]'
                    : 'text-[#6B6B6B] hover:text-[#A0A0A0] hover:bg-[#1C1C1C]'
                }`}
              >
                Ghidat — vreau indicații vizuale
              </Link>
              <Link
                to={
                  isTrap
                    ? `/courses/${slug}/trap-practice/${lineId}`
                    : isMiddlegame
                    ? `/courses/${slug}/middlegame-practice/${lineId}`
                    : `/courses/${slug}/practice/${lineId}`
                }
                className={`block text-sm px-3 py-2 rounded-lg transition-colors ${
                  !isGuided
                    ? 'bg-[rgba(226,179,64,0.15)] text-[#E2B340]'
                    : 'text-[#6B6B6B] hover:text-[#A0A0A0] hover:bg-[#1C1C1C]'
                }`}
              >
                Pe cont propriu — vreau să mă testez
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Planul variantei, lângă tablă.
 *
 * Structura într-o propoziţie, ideile în ordinea în care se pun în practică şi
 * greşeala care costă cel mai des. Mutările de pe tablă sunt planul ăsta jucat;
 * fără el, rămân o listă de mutări memorate — adică exact ce nu vrem.
 */
function PlanulVariantei({
  plan, deschisInitial,
}: {
  plan: MiddlegamePlan
  deschisInitial: boolean
}) {
  const [deschis, setDeschis] = useState(deschisInitial)

  return (
    <div className="rounded-xl border border-[#2A2A2A] bg-[#141414]">
      <button
        onClick={() => setDeschis(d => !d)}
        aria-expanded={deschis}
        className="flex w-full items-center justify-between gap-2 p-4 text-left"
      >
        <span className="text-xs uppercase tracking-wider text-[#2DD4BF]">Planul variantei</span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-[#6B6B6B] transition-transform ${deschis ? 'rotate-180' : ''}`}
        />
      </button>

      {deschis && (
        <div className="space-y-3 border-t border-[#2A2A2A] p-4">
          {plan.structure && (
            <p className="border-l-2 border-[#2DD4BF] pl-3 text-sm leading-relaxed text-[#A0A0A0]">
              {plan.structure}
            </p>
          )}

          <ol className="space-y-3">
            {plan.ideas.map((idea, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(45,212,191,0.15)] text-[11px] font-bold text-[#2DD4BF]">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#F0F0F0]">{idea.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-[#6B6B6B]">{idea.detail}</p>
                </div>
              </li>
            ))}
          </ol>

          {plan.avoid && (
            <div className="flex gap-2.5 rounded-lg border border-[rgba(251,113,133,0.25)] bg-[rgba(251,113,133,0.06)] p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#FB7185]" />
              <p className="text-sm leading-relaxed text-[#A0A0A0]">{plan.avoid}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
