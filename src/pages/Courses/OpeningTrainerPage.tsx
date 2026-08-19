import { useState, useCallback, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Chess } from 'chess.js'
import { Chessboard, type PieceDropHandlerArgs } from 'react-chessboard'
import { ChevronLeft, ChevronRight, ChevronDown, ChevronsLeft, ChevronsRight, RotateCcw, CheckCircle2, AlertTriangle } from 'lucide-react'
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

/**
 * Poziţia după `ply` semi-mutări, plus mutarea care a dus la ea.
 *
 * Foloseşte aceeaşi rejucare ca `buildResumedState`, dar nu construieşte o stare
 * de antrenament — doar arată. De aici vine derularea înapoi prin mutările deja
 * jucate, fără să se atingă de partida în curs.
 */
function pozitiaLa(line: TrainerLine, ply: number): { fen: string; de: string | null; la: string | null } {
  const moves = line.moves_uci.split(' ')
  const tinta = Math.max(0, Math.min(ply, moves.length))
  const game = new Chess(line.start_fen)
  for (let i = 0; i < tinta; i++) {
    const m = moves[i]
    try { game.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m[4] ?? 'q' }) } catch { break }
  }
  const ultima = tinta > 0 ? moves[tinta - 1] : null
  return { fen: game.fen(), de: ultima?.slice(0, 2) ?? null, la: ultima?.slice(2, 4) ?? null }
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

  // Calea către exerciţiu, scrisă o singură dată. Era scrisă în două locuri, iar
  // unul dintre ele uitase capcanele: butonul „Pe cont propriu" de la capătul
  // liniei trimitea id-ul capcanei către ruta deschiderilor, care evident nu-l
  // găsea în `opening_lines` — de acolo „Varianta nu a fost găsită.".
  const practicePath = `/courses/${slug}/${
    isTrap ? 'trap-practice' : isMiddlegame ? 'middlegame-practice' : 'practice'
  }/${lineId}`

  const { data: line, isLoading } = useQuery({
    queryKey: ['trainer-line', lineId, stage, mode],
    queryFn: () => incarcaLinie(stage, mode, lineId!),
    enabled: !!lineId,
  })

  const [state, setState] = useState<TrainerState | null>(null)
  /**
   * Ce semi-mutare priveşti acum. `null` = poziţia din partidă.
   *
   * Separată de starea de antrenament, nu amestecată cu ea: cât timp te uiţi
   * înapoi, partida stă pe loc — nu mută nici adversarul, nici tu. Altfel
   * derularea ar fi însemnat că pierzi ce ai jucat.
   */
  const [vazut, setVazut] = useState<number | null>(null)

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
      last_activity_at: new Date().toISOString(),
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
    if (vazut !== null) return // priveşti înapoi: partida aşteaptă
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
  }, [status, plyIdx, line, vazut])

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
    setVazut(null)
  }

  /**
   * Reia partida din poziţia pe care o priveşti.
   *
   * Nu „derulează" starea înapoi, ci o reconstruieşte de la zero până la
   * semi-mutarea aceea — aceeaşi cale ca la reluarea de a doua zi. Aşa nu poate
   * rămâne nimic din ce s-a jucat după, nici pe tablă, nici în status.
   */
  function reiaDeAici() {
    if (!line || vazut === null) return
    setState(buildResumedState(line, vazut))
    setVazut(null)
  }



  // Întâi „nu există", abia apoi „se încarcă": invers, o variantă lipsă lăsa
  // rotiţa să se învârtă la nesfârşit, fiindcă starea nu se construia niciodată.
  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
  }
  if (!line) {
    return <p className="text-[#6B6B6B]">Varianta nu a fost găsită.</p>
  }
  if (!state) {
    return <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
  }

  const moves = line.moves_uci.split(' ')
  const totalParts = getTotalParts(moves.length, line.singlePart)
  const progressPct = moves.length > 0 ? (state.plyIdx / moves.length) * 100 : 0

  // Explicaţia mutării care TOCMAI s-a jucat, nu a celei care urmează.
  //
  // Înainte se arăta explicaţia mutării următoare — deci textul despre mutarea
  // adversarului apărea cât timp scria „Calculez răspunsul teoretic...", iar
  // după 600 ms, când mutarea chiar se făcea pe tablă, textul dispărea şi îi lua
  // locul altul. Se citea despre ceva ce încă nu se întâmplase.
  const plyVazut = vazut ?? state.plyIdx
  const explicatiaUltimei = plyVazut > 0 ? line.move_explanations?.[String(plyVazut - 1)] ?? '' : ''
  const ultimaEAAdversarului = plyVazut > 0
    && !isUserPly(plyVazut - 1, line.user_color, whiteMovesFirst(line))
  /** Îndrumarea pentru mutarea ta, în modul ghidat. */
  const explanation = line.move_explanations?.[String(state.plyIdx)] ?? ''

  const priveste = vazut !== null
  const vedere = priveste ? pozitiaLa(line, vazut) : null

  // Square highlights
  const squareStyles: Record<string, React.CSSProperties> = {}
  if (vazut !== null) {
    // Cât timp priveşti înapoi, se marchează mutarea care a dus la poziţia
    // aceea — nu îndrumarea aurie, care ar arăta un sfat pentru altă clipă.
    const v = pozitiaLa(line, vazut)
    if (v.de) squareStyles[v.de] = { backgroundColor: 'rgba(96,165,250,0.45)' }
    if (v.la) squareStyles[v.la] = { backgroundColor: 'rgba(96,165,250,0.30)' }
  }
  if (vazut === null && state.status === 'user-turn') {
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
    <div className="flex flex-col gap-4 lg:h-[var(--app-page-h)]">
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
        {/* Tabla — pătrată şi centrată, dar dimensionată din altceva după ecran.
            Pe lat, din înălţime (`lg:h-full`): pagina e blocată la înălţimea
            ecranului şi tabla ia tot ce rămâne pe verticală.
            Pe telefon, din lăţime (`w-full`): acolo panourile stau sub tablă, nu
            lângă ea, deci înălţimea rămasă e mică — luată din ea, tabla ieşea de
            127px, cu pătrate de 16px pe care nu poţi juca (măsurat). Tot de-aia
            înălţimea fixă a paginii e şi ea doar de la `lg` în sus: pe telefon
            pagina se derulează, în loc să înghesuie totul într-un ecran. */}
        <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center">
          <div className="aspect-square w-full max-w-full overflow-hidden rounded-xl border border-[#2A2A2A] lg:h-full lg:max-h-full lg:w-auto">
            <Chessboard
              options={{
                position: vedere ? vedere.fen : state.game.fen(),
                onPieceDrop: handlePieceDrop,
                allowDragging: !priveste && state.status === 'user-turn',
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
          {/* Derularea prin mutările deja jucate.
              Apare abia după prima mutare — până atunci n-are ce arăta. */}
          {state.plyIdx > 0 && (
            <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-3">
              <div className="flex items-center justify-center gap-1">
                {([
                  ['La început', ChevronsLeft, () => setVazut(0), plyVazut === 0],
                  ['Înapoi', ChevronLeft, () => setVazut(Math.max(0, plyVazut - 1)), plyVazut === 0],
                  ['Înainte', ChevronRight, () => setVazut(plyVazut + 1 >= state.plyIdx ? null : plyVazut + 1), !priveste],
                  ['La poziţia curentă', ChevronsRight, () => setVazut(null), !priveste],
                ] as const).map(([eticheta, Icoana, apasa, stins]) => (
                  <button
                    key={eticheta}
                    type="button"
                    onClick={apasa}
                    disabled={stins}
                    aria-label={eticheta}
                    title={eticheta}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#1C1C1C] text-[#A0A0A0] transition-colors hover:border-[#3A3A3A] hover:text-[#F0F0F0] disabled:pointer-events-none disabled:opacity-30"
                  >
                    <Icoana className="h-4 w-4" />
                  </button>
                ))}
                <span className="ml-2 min-w-[3.5rem] text-center text-xs text-[#6B6B6B]">
                  {plyVazut} / {state.plyIdx}
                </span>
              </div>

              {priveste && (
                <div className="mt-3 space-y-2 border-t border-[#2A2A2A] pt-3">
                  <p className="text-xs text-[#60A5FA]">
                    Priveşti o poziţie de mai devreme. Partida te aşteaptă.
                  </p>
                  <button
                    type="button"
                    onClick={reiaDeAici}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[rgba(226,179,64,0.3)] bg-[rgba(226,179,64,0.08)] px-3 py-2 text-sm text-[#E2B340] transition-colors hover:bg-[rgba(226,179,64,0.14)]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reia de aici
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Status + explanation card */}
          <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] p-4">
            {priveste ? (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#60A5FA]">
                  {plyVazut === 0 ? 'Poziţia de plecare' : `Mutarea ${plyVazut}`}
                </p>
                <p className="text-sm text-[#A0A0A0]">
                  {plyVazut === 0
                    ? 'Aici a început varianta.'
                    : explicatiaUltimei || 'Fără explicaţie pentru mutarea asta.'}
                </p>
              </div>
            ) : <>
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
            {/* Ce tocmai a jucat adversarul. Stă cât timp e rândul tău, deci ai
                timp să citeşti — nu 600 ms, cât dura înainte. */}
            {state.status === 'user-turn' && ultimaEAAdversarului && explicatiaUltimei && (
              <div className="mt-3 border-t border-[#2A2A2A] pt-3">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[#60A5FA]">
                  Adversarul a jucat
                </p>
                <p className="text-xs leading-relaxed text-[#A0A0A0]">{explicatiaUltimei}</p>
              </div>
            )}
            {state.status === 'computer-thinking' && (
              <div>
                <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">
                  Adversarul mută
                </p>
                <p className="text-sm text-[#A0A0A0]">Calculez răspunsul teoretic...</p>
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
            </>}
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
                    <Link to={practicePath} className="flex-1">
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
                to={practicePath}
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
