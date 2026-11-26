import { useState, useCallback, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Chess } from 'chess.js'
import { Chessboard, type PieceDropHandlerArgs, type Arrow } from 'react-chessboard'
import type { Square } from 'chess.js'
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RotateCcw, CheckCircle2,
  BookOpen, Dumbbell, Lightbulb, MoreHorizontal, Search, LogOut,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { CULORI_SAGETI, OPTIUNI_SAGETI, ULTIMA_MUTARE } from '@/lib/sageti'
import { adresaEtapei, etapeCapitol, incadrareDin, nodVarianta, ordoneazaPeNivel, procentMasurat, studiiLinie, variantaleSetului } from '@/lib/capitole-curs'
import { introCapitol, mutariMiniTabla } from '@/lib/intro-capitol'
import { MiniTablaVarianta } from '@/components/chess/MiniTablaVarianta'
import { RezumatCapitol } from '@/components/courses/RezumatCapitol'
import { salveazaVarianta, type RezultatCapitol } from '@/lib/rezultat-capitol'
import { incarcaLinie, type TrainerLine } from '@/lib/trainer-line'
import { useAuth } from '@/hooks/useAuth'
import { useBoardTheme } from '@/hooks/useBoardTheme'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { CalutulOmniscient } from '@/components/ui/CalutulOmniscient'
import { useLaturaTablei, LATIME_PANOU, SPATIU_TABLA_PANOU } from '@/hooks/useLaturaTablei'

/**
 * Cât durează alunecarea unei piese dintr-un pătrat în altul.
 *
 * Scrisă aici, nu lăsată pe seama valorii implicite din bibliotecă, fiindcă tot
 * de ea atârnă şi momentul în care apare explicaţia: textul despre mutarea
 * adversarului nu are ce căuta pe ecran cât timp piesa e încă în aer.
 */
const ANIMATIE_MS = 350

/*
 * Regulile de culoare pentru toate cursurile de deschideri (utilizatorul,
 * 2026-11-23):
 *   1. câmp ţintit (al tău sau al lui) → roz;
 *   2. câmp al cărui control se discută → după ce stă pe el: piesa adversarului
 *      verde închis, piesa ta roşu închis, gol albastru;
 *   3. săgeţi pentru mutări posibile sau viitoare → ale tale verde, ale
 *      adversarului roşu (nuanţe calde, din `lib/sageti.ts`). Săgeata aurie, care arată mutarea de jucat,
 *      rămâne separată.
 */

/** Regula 3: `green` = o mutare posibilă a ta, `red` = una a adversarului. */
const CULOARE_SAGEATA = CULORI_SAGETI

/** Regula 2. */
const CULOARE_CONTROL = {
  alLui: 'rgba(21,128,61,0.8)',
  alMeu: 'rgba(185,28,28,0.75)',
  gol: 'rgba(59,130,246,0.65)',
} as const

/**
 * Câmpul-cheie dintr-un text („nebunul ţinteşte f7"). Roz închis, ca să se vadă
 * şi pe câmpurile negre: rozul deschis de la început (cerut pe 2026-11-21) se
 * pierdea, iar utilizatorul a cerut pe 2026-11-23 unul mai închis.
 */
const CULOARE_CAMP_CHEIE = 'rgba(236,72,153,0.7)'

/** E albul la mutare în poziţia de plecare? */
function whiteMovesFirst(line: TrainerLine): boolean {
  return !line.start_fen || line.start_fen.includes(' w ')
}

function isUserPly(plyIdx: number, userColor: 'white' | 'black', whiteFirst = true): boolean {
  const whitePly = whiteFirst ? plyIdx % 2 === 0 : plyIdx % 2 === 1
  return (userColor === 'white') === whitePly
}

// Varianta se joacă dintr-o bucată, ca pe Chessly. Înainte se rupea în trei
// („primele 5 mutări", „următoarele 5", „spre jocul de mijloc"), cu o pauză şi
// un buton între ele; acum capitolul are paşi de câte două variante (2026-11-25).
type TrainerStatus =
  | 'user-turn'
  | 'computer-thinking'
  | 'wrong'
  | 'line-done'

interface TrainerState {
  game: Chess
  plyIdx: number
  /** Unde se opreşte varianta: numărul de semi-mutări. */
  partEnd: number
  status: TrainerStatus
  wrongFrom: string | null
  wrongTo: string | null
  /** Poziţia cu mutarea greşită făcută, arătată 750 ms (cerut pe 2026-11-25). */
  wrongFen: string | null
}

function buildInitialState(line: TrainerLine): TrainerState {
  const moves = line.moves_uci.split(' ')
  return {
    game: new Chess(line.start_fen),
    plyIdx: 0,
    partEnd: moves.length,
    status: isUserPly(0, line.user_color, whiteMovesFirst(line)) ? 'user-turn' : 'computer-thinking',
    wrongFrom: null,
    wrongTo: null,
    wrongFen: null,
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
  const status: TrainerStatus = target >= moves.length
    ? 'line-done'
    : isUserPly(target, line.user_color, whiteMovesFirst(line)) ? 'user-turn' : 'computer-thinking'
  return { game, plyIdx: target, partEnd: moves.length, status, wrongFrom: null, wrongTo: null, wrongFen: null }
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

/**
 * Ora curentă, pentru cronometrul exersării. `resetLine` o citeşte doar din
 * clicuri, dar analiza React nu ştie asta şi refuză `Date.now()` scris direct.
 */
const acum = () => Date.now()

const resumeKey = (lineId: string, stage: string, varianta: number) => `op-resume:${stage}:${lineId}:${varianta}`

/** Textul împărţit în paragrafe, la rândurile goale. */
function paragrafe(text: string | null | undefined): string[] {
  return (text ?? '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
}

/** Prima semi-mutare a ta din variantă. */
function primaMutareATa(line: TrainerLine): number {
  return isUserPly(0, line.user_color, whiteMovesFirst(line)) ? 0 : 1
}

/** Ultima semi-mutare a ta, la `ply` sau înaintea lui; -1 dacă nu e niciuna. */
function ultimaMutareATa(line: TrainerLine, ply: number): number {
  const albPrimul = whiteMovesFirst(line)
  for (let i = ply; i >= 0; i--) if (isUserPly(i, line.user_color, albPrimul)) return i
  return -1
}

/**
 * Ce scrie în balon înaintea mutării tale de la semi-mutarea `ply`.
 *
 * Textele noi (migrarea 118) au întâietate: la prima ta mutare introducerea, la
 * celelalte comentariul care leagă mutarea adversarului de răspunsul tău. Unde
 * lipsesc, se compune acelaşi lucru din explicaţiile vechi, câte una pe
 * semi-mutare: întâi a adversarului, apoi a ta. Aşa panoul nou merge şi pe
 * cursurile pe care flota nu le-a rescris încă.
 */
function textBalon(line: TrainerLine, ply: number): string[] {
  if (ply < 0) return paragrafe(line.intro)
  if (ply === primaMutareATa(line) && line.intro) return paragrafe(line.intro)
  const scris = line.move_comments?.[String(ply)]
  if (scris) return paragrafe(scris)

  const parti: string[] = []
  if (ply > 0 && !isUserPly(ply - 1, line.user_color, whiteMovesFirst(line))) {
    const aLui = line.move_explanations?.[String(ply - 1)]?.trim()
    if (aLui) parti.push(aLui)
  }
  const aTa = line.move_explanations?.[String(ply)]?.trim()
  if (aTa) parti.push(aTa)
  return parti
}

/** Balonul de la capătul variantei: planul de după, sau ce avem în loc. */
function textFinal(line: TrainerLine): string[] {
  if (line.final_text) return paragrafe(line.final_text)
  if (line.conclusion) return paragrafe(line.conclusion)
  const ultima = line.move_explanations?.[String(line.moves_uci.split(' ').length - 1)]?.trim()
  return ultima ? [ultima] : []
}

const NUME_PIESA: Record<string, string> = {
  p: 'pionul', n: 'calul', b: 'nebunul', r: 'tura', q: 'dama', k: 'regele',
}

/**
 * Indiciul de la a treia greşeală: piesa de mutat, nu şi unde. Cel scris de
 * flotă are întâietate; altfel îl spunem din poziţie.
 */
function indiciu(line: TrainerLine, ply: number, game: Chess): string {
  const scris = line.move_hints?.[String(ply)]?.trim()
  if (scris) return scris
  const mutare = line.moves_uci.split(' ')[ply]
  if (!mutare) return ''
  const piesa = game.get(mutare.slice(0, 2) as Square)
  return `Mută ${piesa ? NUME_PIESA[piesa.type] : 'piesa'} de pe ${mutare.slice(0, 2)}.`
}

/**
 * Semnul roşu din colţul piesei mutate greşit, ca pe Chessly (cerut pe
 * 2026-11-25). Stă peste colţul câmpului, deasupra pieselor vecine.
 */
function SemnGresit() {
  return (
    <span
      aria-label="Mutare greşită"
      className="pointer-events-none absolute -right-[8%] -top-[8%] z-20 flex aspect-square w-[40%] items-center justify-center rounded-full border-2 border-white bg-[#EF4444] shadow-md"
    >
      <span className="h-[14%] w-[52%] rounded-full bg-white" />
    </span>
  )
}

interface Props {
  mode: 'guided' | 'practice'
  /**
   * 'opening' = o variantă a capitolului (`?v=`); 'middlegame' = adresa veche a
   * pasului cu variantele 3–4, păstrată pentru legăturile vechi (fără `?v=`
   * deschide varianta 3); 'trap' = capcana.
   */
  stage?: 'opening' | 'middlegame' | 'trap'
}

export function OpeningTrainerPage({ mode, stage = 'opening' }: Props) {
  const { slug, lineId } = useParams<{ slug: string; lineId: string }>()
  const { user, profile, fetchProfile } = useAuth()
  const { lightSquareStyle, darkSquareStyle } = useBoardTheme()
  const isGuided = mode === 'guided'
  const isTrap = stage === 'trap'
  const savedDoneRef = useRef(false)
  const navigate = useNavigate()
  // Fiecare variantă e o etapă de studiu şi una de exersare, pe rând (cerut pe
  // 2026-11-26; înainte, câte două variante pe etapă). `?v=` = varianta.
  // „Refă exersările greşite" deschide exersarea cu `?refacere=1,3` (variantele
  // greşite): se joacă doar ele, una după alta, iar la capăt revine fereastra de rezultat.
  const [parametri] = useSearchParams()
  const refacere = (parametri.get('refacere') ?? '').split(',').filter(x => /^\d+$/.test(x)).map(Number)
  // Gantera şi pălăria din harta studiului (cerut pe 2026-11-26): exersări la
  // rând, `?lista=0,1,2&etapa=r0-1`; la capăt se notează etapa şi vine fereastra.
  const lista = mode === 'practice' ? (parametri.get('lista') ?? '').split(',').filter(x => /^\d+$/.test(x)).map(Number) : []
  const etapaParam = parametri.get('etapa')
  const vCerut = parametri.get('v')
  const varianta = isTrap ? 0
    : vCerut !== null && /^\d+$/.test(vCerut) ? Number(vCerut)
    : refacere[0] ?? (stage === 'middlegame' ? 2 : 0)
  /** Când a început exersarea şi dacă a avut vreo greşeală sau „Soluţie". */
  const inceputRunda = useRef(0)
  const rundaImperfecta = useRef(false)
  /** Rezultatul capitolului, setat la capătul unei exersări; închis = fereastra ascunsă. */
  const [rezultate, setRezultate] = useState<RezultatCapitol | null>(null)
  const [rezumatInchis, setRezumatInchis] = useState(false)

  // Calea către exerciţiu, scrisă o singură dată. Era scrisă în două locuri, iar
  // unul dintre ele uitase capcanele: butonul „Pe cont propriu" de la capătul
  // liniei trimitea id-ul capcanei către ruta deschiderilor, care evident nu-l
  // găsea în `opening_lines` — de acolo „Varianta nu a fost găsită.".
  const practicePath = isTrap
    ? `/courses/${slug}/trap-practice/${lineId}`
    : `/courses/${slug}/practice/${lineId}?v=${varianta}`

  const { data: line, isLoading } = useQuery({
    queryKey: ['trainer-line', lineId, stage, mode, varianta],
    queryFn: () => incarcaLinie(stage, mode, lineId!, varianta),
    enabled: !!lineId,
  })

  // Cursul din care face parte varianta: titlul pentru antet, capitolele pentru
  // „Capitolul N", meniu şi „Capitolul următor".
  const { data: curs } = useQuery({
    queryKey: ['trainer-curs', slug],
    enabled: !!slug,
    queryFn: async () => {
      // `*`: `bun_venit` vine din migrarea 133; cerut pe nume, o bază fără ea ar strica tot.
      const { data: c } = await supabase.from('courses').select('*').eq('slug', slug!).single()
      if (!c) return null
      // `*`, nu doar coloanele folosite: o bază care n-a primit încă migrarea 132
      // n-are `grup` şi `popularitate_niveluri`, iar cerute pe nume ar strica tot.
      const { data: linii } = await supabase
        .from('opening_lines')
        .select('*')
        .eq('course_id', c.id)
        .order('order_index')
      return {
        titlu: c.title,
        bunVenit: c.bun_venit ?? null,
        linii: linii ?? [],
      }
    },
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
  /** Greşelile la mutarea curentă, la exersare. La o semi-mutare nouă se numără de la zero. */
  const [greseli, setGreseli] = useState<{ ply: number; n: number }>({ ply: -1, n: 0 })
  /** La ce semi-mutare ai cerut soluţia. */
  const [solutieLa, setSolutieLa] = useState<number | null>(null)
  const [meniu, setMeniu] = useState(false)
  // Rândul cu tabla şi panoul: din el se calculează latura tablei (vezi useLaturaTablei).
  const [randTabla, setRandTabla] = useState<HTMLDivElement | null>(null)
  const latura = useLaturaTablei(randTabla)

  /**
   * Când treci la altă variantă, greşelile, soluţia şi meniul o iau de la capăt.
   * Se ajustează la desenare, nu într-un efect: altfel prima imagine ar arăta
   * ce rămăsese de la varianta dinainte, şi abia a doua ar corecta-o.
   */
  const cheieVarianta = `${lineId}|${stage}|${mode}|${varianta}`
  const [variantaVazuta, setVariantaVazuta] = useState(cheieVarianta)
  if (variantaVazuta !== cheieVarianta) {
    setVariantaVazuta(cheieVarianta)
    setGreseli({ ply: -1, n: 0 })
    setSolutieLa(null)
    setMeniu(false)
    setRezultate(null)
    setRezumatInchis(false)
  }

  // Persistă progresul (doar mod ghidat): varianta curentă + eventual finalizarea.
  const persistProgress = useCallback(async (markDone: boolean) => {
    if (!isGuided || !line || !user) return
    const { data: existing } = await supabase
      .from('user_course_progress')
      .select('completed_lesson_ids, xp_earned')
      .eq('user_id', user.id).eq('course_id', line.course_id).maybeSingle() // primul pas: încă niciun rând
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
    inceputRunda.current = Date.now()
    rundaImperfecta.current = false
    if (isGuided) {
      const saved = Number(localStorage.getItem(resumeKey(line.id, stage, line.variantaIndex ?? 0)))
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
    localStorage.setItem(resumeKey(line.id, stage, line.variantaIndex ?? 0), String(plyIdx))
  }, [plyIdx, status, isGuided, line, stage])

  // La finalizarea variantei: marchează complet + curăță punctul de reluare.
  useEffect(() => {
    if (!isGuided || !line || state?.status !== 'line-done' || savedDoneRef.current) return
    savedDoneRef.current = true
    localStorage.removeItem(resumeKey(line.id, stage, line.variantaIndex ?? 0))
    // Capitolul e studiat abia după ultima lui variantă.
    void persistProgress((line.variantaIndex ?? 0) >= (line.nrVariante ?? 1) - 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  // Etapa de pe traseu (studiul sau exersarea unei variante) se notează cu data,
  // ca pagina cursului să ştie ce e deblocat, unde „te afli" şi care e „ultimul
  // studiu completat" (cerut pe 2026-11-25). Şi refacerea mută data.
  const clientQuery = useQueryClient()
  useEffect(() => {
    if (status !== 'line-done' || !line || !user || !lineId) return
    const v = line.variantaIndex ?? 0
    const nodId = isTrap
      ? `${lineId}-${isGuided ? 'lectie' : 'exercitiu'}`
      : nodVarianta(lineId, v, isGuided ? 'teorie' : 'exersare')
    // Gantera sau pălăria e gata după ultima exersare din lista ei.
    const nodEtapa = !isTrap && lista.length > 0 && etapaParam && v === lista[lista.length - 1] ? `${lineId}-${etapaParam}` : null
    void (async () => {
      const { data } = await supabase
        .from('user_course_progress')
        .select('noduri_parcurse')
        .eq('user_id', user.id).eq('course_id', line.course_id).maybeSingle() // primul pas: încă niciun rând
      const acum = new Date().toISOString()
      await supabase.from('user_course_progress').upsert({
        user_id: user.id,
        course_id: line.course_id,
        noduri_parcurse: { ...(data?.noduri_parcurse ?? {}), [nodId]: acum, ...(nodEtapa ? { [nodEtapa]: acum } : {}) },
        last_activity_at: acum,
      })
      void clientQuery.invalidateQueries({ queryKey: ['course-progress'] })
      void clientQuery.invalidateQueries({ queryKey: ['barlog-cursuri-incepute'] })
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  // La capătul unei exersări: rezultatul părţii se scrie, iar fereastra de
  // final se poate arăta (vezi `arataRezumat`).
  useEffect(() => {
    if (isGuided || isTrap || !lineId || status !== 'line-done') return
    setRezultate(salveazaVarianta(lineId, line?.variantaIndex ?? 0, {
      perfect: !rundaImperfecta.current,
      ms: Date.now() - inceputRunda.current,
    }))
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
          nextStatus = 'line-done'
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

  // Mutarea greşită stă 750 ms pe tablă (cerut pe 2026-11-25; întâi fusese o secundă), cu semnul roşu, apoi piesa se întoarce.
  useEffect(() => {
    if (status !== 'wrong') return
    const timer = setTimeout(() => {
      setState(s => s ? { ...s, status: 'user-turn', wrongFrom: null, wrongTo: null, wrongFen: null } : null)
    }, 750)
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
        // Mutarea greşită se arată 750 ms, ca pe Chessly, la învăţare şi la
        // exersare. Una ilegală se arată şi ea: piesa e pusă pe câmpul ales.
        const proba = new Chess(state.game.fen())
        let wrongFen: string | null = null
        try {
          proba.move({ from, to, promotion: 'q' })
          wrongFen = proba.fen()
        } catch {
          const piesa = proba.get(from as Square)
          if (piesa && proba.remove(from as Square) && proba.put(piesa, to as Square)) wrongFen = proba.fen()
        }
        setState(s => s ? { ...s, status: 'wrong', wrongFrom: from, wrongTo: to, wrongFen } : null)
        if (!isGuided) {
          rundaImperfecta.current = true
          const ply = state.plyIdx
          setGreseli(g => ({ ply, n: g.ply === ply ? g.n + 1 : 1 }))
        }
        return wrongFen !== null
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
        nextStatus = 'line-done'
      } else {
        nextStatus = isUserPly(nextPly, line.user_color, whiteMovesFirst(line)) ? 'user-turn' : 'computer-thinking'
      }

      setState(s => s
        ? { ...s, game: gameCopy, plyIdx: nextPly, status: nextStatus, wrongFrom: null, wrongTo: null, wrongFen: null }
        : null)
      return true
    },
    [state, line, isGuided]
  )

  function resetLine() {
    if (!line) return
    setState(buildInitialState(line))
    setVazut(null)
    setGreseli({ ply: -1, n: 0 })
    setSolutieLa(null)
    setRezultate(null)
    setRezumatInchis(false)
    inceputRunda.current = acum()
    rundaImperfecta.current = false
  }

  /**
   * Săgeţile de la tastatură răsfoiesc mutările deja jucate, ca butoanele de
   * navigare: stânga înapoi, dreapta înainte, dar nu mai departe de poziţia din
   * partidă — o mutare pe care n-ai făcut-o încă nu se poate vedea dinainte.
   * Cerut pe 2026-11-23. („Reia de aici" a fost scos atunci: n-avea rost.)
   */
  const plyJucat = state?.plyIdx ?? 0
  useEffect(() => {
    function laTasta(e: KeyboardEvent) {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
      const tinta = e.target as HTMLElement | null
      if (tinta && (tinta.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(tinta.tagName))) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setVazut(v => {
          const acum = v ?? plyJucat
          return acum === 0 ? v : acum - 1
        })
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setVazut(v => (v === null || v + 1 >= plyJucat ? null : v + 1))
      }
    }
    window.addEventListener('keydown', laTasta)
    return () => window.removeEventListener('keydown', laTasta)
  }, [plyJucat])



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
  const gata = state.status === 'line-done'
  const plyVazut = vazut ?? state.plyIdx
  const priveste = vazut !== null
  const vedere = priveste ? pozitiaLa(line, vazut) : null
  const urmatoarea = moves[state.plyIdx]
  const greseliAici = greseli.ply === state.plyIdx ? greseli.n : 0

  // ── Etapele capitolului ─────────────────────────────────────────────────────
  // Variantele se iau în seturi de câte două (cerut pe 2026-11-26): studiul
  // variantei, exersarea ei, apoi a doua variantă la fel; ultimul set poate avea
  // una singură. Bara de sus arată doar setul curent: 4 segmente, sau 2.
  // Ordinea capitolelor e a nivelului tău, ca în cuprins: „Capitolul N" şi
  // „Capitolul următor" trebuie să spună acelaşi lucru ca pagina cursului.
  const liniiCurs = curs ? ordoneazaPeNivel(curs.linii, incadrareDin(profile)) : []
  const indexCapitol = liniiCurs.findIndex(l => l.id === lineId)
  const capitolUrmator = indexCapitol >= 0 ? liniiCurs[indexCapitol + 1] : undefined
  const nrVariante = isTrap ? 1 : line.nrVariante ?? 1
  const variantaAici = line.variantaIndex ?? 0
  // Studiile capitolului (din bază, migrarea 143); până vine cursul, unul singur, în ordine.
  const linieCurs = curs?.linii.find(l => l.id === lineId)
  const studiiCap = linieCurs ? studiiLinie(linieCurs) : [{ titlu: '', variante: Array.from({ length: nrVariante }, (_, i) => i) }]
  const etape = etapeCapitol(studiiCap)
  const indexStudiu = Math.max(0, studiiCap.findIndex(st => st.variante.includes(variantaAici)))
  const studiulAici = studiiCap[indexStudiu]
  const nrInStudiu = (v: number) => studiulAici.variante.indexOf(v) + 1
  const dinSet = isTrap ? [0] : variantaleSetului(variantaAici, studiiCap)
  const adresa = (v: number, exersare: boolean) => isTrap
    ? `/courses/${slug}/${exersare ? 'trap-practice' : 'trap'}/${lineId}`
    : `/courses/${slug}/${exersare ? 'practice' : 'guided'}/${lineId}?v=${v}`
  // Etapa din hartă în care eşti: gantera/pălăria din adresă, altfel cartea variantei.
  const inLista = !isTrap && lista.length > 0 && lista.includes(variantaAici)
  const etapaAici = inLista
    ? etape.find(e => e.id === etapaParam)
    : etape.find(e => e.tip === 'set' && e.variante.includes(variantaAici))
  const etapaUrmatoare = etapaAici ? etape[etape.indexOf(etapaAici) + 1] : undefined
  const dupaEtapa = etapaUrmatoare
    ? { href: adresaEtapei(slug!, lineId!, etapaUrmatoare), eticheta: etapaUrmatoare.tip === 'recap' ? 'Continuă: recapitularea' : etapaUrmatoare.tip === 'test' ? 'Continuă: verificarea studiului' : etapaUrmatoare.studiu !== etapaAici?.studiu ? `Continuă: studiul ${etapaUrmatoare.studiu + 1}` : `Continuă: varianta ${nrInStudiu(etapaUrmatoare.variante[0])}` }
    : capitolUrmatorLink()
  const cuLista = (v: number) => `${adresa(v, true)}&lista=${lista.join(',')}&etapa=${etapaParam ?? ''}`
  /** La refacere sau într-o listă de exersări, următoarea de jucat. */
  const variantaUrmatoare = !isGuided && refacere.includes(variantaAici)
    ? refacere[refacere.indexOf(variantaAici) + 1] as number | undefined
    : inLista ? lista[lista.indexOf(variantaAici) + 1] as number | undefined
    : undefined
  const segmente = inLista
    ? lista.map(v => ({ eticheta: `Exersare: varianta ${nrInStudiu(v)}`, href: cuLista(v) }))
    : dinSet.flatMap(v => [
        { eticheta: `Varianta ${nrInStudiu(v)}: Studiu`, href: adresa(v, false) },
        { eticheta: `Varianta ${nrInStudiu(v)}: Practică pe baza studiului`, href: adresa(v, true) },
      ])
  const segmentCurent = inLista
    ? lista.indexOf(variantaAici)
    : Math.max(0, dinSet.indexOf(variantaAici)) * 2 + (isGuided ? 0 : 1)
  const umplere = (i: number) =>
    i < segmentCurent ? 100
      : i > segmentCurent ? 0
      : (gata ? 1 : moves.length > 0 ? state.plyIdx / moves.length : 0) * 100

  function capitolUrmatorLink() {
    return capitolUrmator
      ? { eticheta: 'Capitolul următor', href: `/courses/${slug}/guided/${capitolUrmator.id}` }
      : { eticheta: 'Înapoi la curs', href: `/courses/${slug}` }
  }
  const etichetaCapitol = isTrap
    ? `Capcane uzuale · ${line.variation_name}`
    : indexCapitol >= 0 ? `Capitolul ${indexCapitol + 1} · ${line.variation_name}` : line.variation_name

  // ── Fereastra de final ──────────────────────────────────────────────────────
  // La capătul unei cărţi (după exersarea ultimei variante din set), al unei
  // gantere sau al pălăriei — ori după o refacere pornită din fereastră —, cu
  // rezultatul variantelor de acolo (ca la Chessly).
  const partiRezumat = inLista ? lista : dinSet
  const ultimaDinParti = partiRezumat[partiRezumat.length - 1]
  const arataRezumat = gata && !isGuided && !isTrap && !rezumatInchis && variantaUrmatoare === undefined
    && (refacere.length > 0 || variantaAici === ultimaDinParti)
  const continuaHref = dupaEtapa.href
  const gresite = partiRezumat.filter(i => rezultate?.[String(i)] && !rezultate[String(i)].perfect)
  const refaGresite = gresite.length > 0
    ? () => {
        if (gresite[0] === variantaAici) resetLine()
        navigate(`${adresa(gresite[0], true)}&refacere=${gresite.join(',')}`)
      }
    : null

  /** Unde duce „Continuă" de la capătul variantei. */
  const urmator = variantaUrmatoare !== undefined
    ? { eticheta: `Continuă: exersarea variantei ${nrInStudiu(variantaUrmatoare)}`, href: refacere.length > 0 ? `${adresa(variantaUrmatoare, true)}&refacere=${refacere.join(',')}` : cuLista(variantaUrmatoare) }
    : isGuided
    ? { eticheta: 'Continuă spre exersare', href: practicePath }
    : !isTrap && !inLista && refacere.length === 0 && variantaAici !== dinSet[dinSet.length - 1]
    ? { eticheta: `Continuă: varianta ${nrInStudiu(dinSet[dinSet.indexOf(variantaAici) + 1])}`, href: adresa(dinSet[dinSet.indexOf(variantaAici) + 1], false) }
    : isTrap ? capitolUrmatorLink()
    : dupaEtapa

  // ── Balonul ─────────────────────────────────────────────────────────────────
  // Textul stă pe mutarea TA: înaintea ei spune ce a jucat adversarul şi ce
  // răspunzi. Textul nou apare odată cu mutarea adversarului, cât piesa lui
  // încă alunecă (cerut pe 2026-11-23: înainte aştepta să se aşeze piesa şi
  // părea întârziat). Până mută el, rămâne textul de dinainte.
  const plyBalon = state.status === 'user-turn' || state.status === 'wrong'
    ? state.plyIdx
    : ultimaMutareATa(line, state.plyIdx - 1)
  // Recapitularea: cu săgeţile te întorci prin poziţii, iar fiecare îşi arată
  // comentariul, câmpurile colorate şi săgeţile ei — nu pe ale mutării din
  // partidă (cerut pe 2026-11-23: culorile de mai târziu rămâneau pe poziţiile
  // vechi). O poziţie în care eşti tu la mutare are comentariul mutării tale de
  // acolo; una în care mută adversarul îl păstrează pe al mutării tale de
  // dinainte. Merge după final (ca pe Chessly) şi la învăţare oricând; la
  // exersare, în timpul jocului, privitul înapoi rămâne tăcut.
  const recapitulare = priveste && (gata || isGuided)
  const albPrimul = whiteMovesFirst(line)
  const plyRecapitulare = recapitulare
    ? isUserPly(plyVazut, line.user_color, albPrimul) ? plyVazut : ultimaMutareATa(line, plyVazut - 1)
    : null
  // La exersare nu se explică nimic în timpul jocului; finalul arată la fel.
  const balon = recapitulare && plyRecapitulare !== null
    ? textBalon(line, plyRecapitulare)
    : gata ? textFinal(line) : isGuided ? textBalon(line, plyBalon) : []

  // Începutul capitolului (cerut pe 2026-11-24): bun venitul — doar la primul
  // capitol din ordinea nivelului tău, ca să nu-l citeşti la fiecare —, o frază
  // despre capitol şi mini-tabla cu mutările lui comune. Doar la studiul
  // deschiderii, cât balonul arată introducerea.
  const laPrimaMutare = recapitulare
    ? plyRecapitulare !== null && plyRecapitulare <= primaMutareATa(line)
    : !gata && plyBalon <= primaMutareATa(line)
  const laInceput = stage === 'opening' && isGuided && variantaAici === 0 && indexCapitol >= 0 && laPrimaMutare
  const liniaCurs = laInceput ? liniiCurs[indexCapitol] : undefined
  // Începutul variantelor 2–4 (2026-11-25): ce face adversarul altfel şi cât de
  // des, cu mini-tabla oprită la mutarea de despărţire, marcată violet. Fără el,
  // varianta pornea cu panoul gol.
  const despartire = line.despartire
  const laInceputRamurii = !isTrap && isGuided && variantaAici > 0 && despartire != null && laPrimaMutare
  const procentRamura = procentMasurat({ popularitate_niveluri: line.popularitateVarianta, popularitate_pe_rating: line.popularitatePeRatingVarianta }, incadrareDin(profile))
  const inceput = liniaCurs
    ? {
        paragrafe: introCapitol({
          linie: liniaCurs,
          toate: liniiCurs,
          inc: incadrareDin(profile),
          index: indexCapitol,
          bunVenit: indexCapitol === 0 ? curs?.bunVenit : null,
        }),
        ...mutariMiniTabla(liniaCurs, liniiCurs),
      }
    : laInceputRamurii && line.numeVarianta
    ? {
        paragrafe: [
          `În varianta asta, ${line.numeVarianta.replace(/^Dacă /, '')}.`
            + (procentRamura != null
              ? ` La nivelul tău, mutarea apare în aproximativ ${Math.max(1, Math.round(procentRamura))}% din partidele care ajung în poziţia aceea.`
              : '')
            + ' Până acolo, mutările sunt cele pe care le ştii.',
        ],
        mutari: moves.slice(0, despartire + 1),
        cheie: despartire,
      }
    : null

  // ── Tabla: săgeţi şi câmpuri ────────────────────────────────────────────────
  // Marcajele scrise lângă textul unei mutări (câmpuri-cheie, săgeţi cu o idee)
  // se văd exact cât se vede şi textul: la învăţare şi în recapitulare.
  const plyMarcaje = recapitulare ? plyRecapitulare : isGuided && !gata ? plyBalon : null
  const marcaje = plyMarcaje !== null ? line.move_marks?.[String(plyMarcaje)] : undefined

  const sageti: Arrow[] = []
  for (const s of marcaje?.arrows ?? []) {
    sageti.push({ startSquare: s.from, endSquare: s.to, color: CULOARE_SAGEATA[s.color ?? 'green'] })
  }
  if (!priveste && state.status === 'user-turn' && urmatoarea && (isGuided || solutieLa === state.plyIdx)) {
    sageti.push({ startSquare: urmatoarea.slice(0, 2), endSquare: urmatoarea.slice(2, 4), color: 'rgba(226,179,64,0.9)' })
  }
  // În recapitulare, săgeata arată mutarea ta din poziţia pe care o priveşti.
  const mutareaVazuta = recapitulare && isUserPly(plyVazut, line.user_color, albPrimul) ? moves[plyVazut] : null
  if (mutareaVazuta) {
    sageti.push({ startSquare: mutareaVazuta.slice(0, 2), endSquare: mutareaVazuta.slice(2, 4), color: 'rgba(226,179,64,0.9)' })
  }
  if (!priveste && gata) {
    for (const s of line.final_arrows ?? []) {
      // Ideile de după deschidere sunt mutări viitoare ale tale: verde.
      sageti.push({ startSquare: s.from, endSquare: s.to, color: CULOARE_SAGEATA.green })
    }
  }

  // Ultima mutare are aceeaşi culoare, albastră, şi la prima trecere, şi când
  // priveşti înapoi (cerut pe 2026-11-25: înainte era aurie la prima trecere).
  const squareStyles: Record<string, React.CSSProperties> = {}
  if (vedere) {
    // Cât timp priveşti înapoi, se marchează mutarea care a dus la poziţia aceea.
    if (vedere.de) squareStyles[vedere.de] = { backgroundColor: ULTIMA_MUTARE.de }
    if (vedere.la) squareStyles[vedere.la] = { backgroundColor: ULTIMA_MUTARE.la }
  } else {
    // Ultima mutare jucată: ca să se vadă ce tocmai s-a schimbat pe tablă.
    // Îndrumarea pentru mutarea ta e săgeata, nu câmpurile.
    const ultima = state.plyIdx > 0 ? moves[state.plyIdx - 1] : null
    if (ultima) {
      squareStyles[ultima.slice(0, 2)] = { backgroundColor: ULTIMA_MUTARE.de }
      squareStyles[ultima.slice(2, 4)] = { backgroundColor: ULTIMA_MUTARE.la }
    }
    // De la a treia greşeală: piesa care trebuie mutată se luminează.
    if (!isGuided && state.status === 'user-turn' && greseliAici >= 3 && urmatoarea) {
      squareStyles[urmatoarea.slice(0, 2)] = { backgroundColor: 'rgba(74,222,128,0.55)' }
    }
  }
  // Câmpurile ţintite din text (f7, punctul slab), în roz.
  for (const camp of marcaje?.squares ?? []) {
    squareStyles[camp] = { ...squareStyles[camp], backgroundColor: CULOARE_CAMP_CHEIE }
  }
  // Câmpurile al căror control se discută: culoarea vine din ce stă pe câmp, nu
  // din cine preia controlul (regula din 2026-11-23). Se judecă poziţia de după
  // mutarea ta, când textul devine adevărat: la „Cb6 — păzeşte d5" calul încă
  // stă pe d5 înainte să mute, dar câmpul despre care se vorbeşte e cel gol.
  if (marcaje?.control?.length && plyMarcaje !== null) {
    const tabla = new Chess(pozitiaLa(line, plyMarcaje + 1).fen)
    const culoareaMea = line.user_color === 'white' ? 'w' : 'b'
    for (const camp of marcaje.control) {
      const piesa = tabla.get(camp as Square)
      const fel = !piesa ? 'gol' : piesa.color === culoareaMea ? 'alMeu' : 'alLui'
      squareStyles[camp] = { ...squareStyles[camp], backgroundColor: CULOARE_CONTROL[fel] }
    }
  }
  // Mutarea greşită se colorează ca orice ultimă mutare; greşeala o spune semnul roşu.
  if (state.wrongFrom) squareStyles[state.wrongFrom] = { backgroundColor: ULTIMA_MUTARE.de }
  if (state.wrongTo) squareStyles[state.wrongTo] = { backgroundColor: ULTIMA_MUTARE.la }

  const fenAcum = vedere ? vedere.fen : state.status === 'wrong' && state.wrongFen ? state.wrongFen : state.game.fen()
  const elementMeniu = 'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-[#D0D0D0] transition-colors hover:bg-[#1C1C1C]'

  return (
    // Pagina umple ecranul: antetul rămâne sus, iar tabla primeşte toată înălţimea
    // rămasă. Înainte, un `max-w-4xl` plafona totul la 896px şi tabla lua 2/3 din
    // atât — pe un ecran lat rezulta o tablă mică într-o mare de negru.
    <div className="flex flex-col gap-3 lg:h-[var(--app-page-h)]">
      {meniu && <div className="fixed inset-0 z-30" onClick={() => setMeniu(false)} aria-hidden />}

      {/* Antetul şi bara părţii au lăţimea blocului tablă + panou, ca să înceapă
          deasupra marginii stângi a tablei şi să se termine deasupra panoului —
          ca la Chessly. Înainte se întindeau pe tot ecranul, iar tabla stătea
          împinsă spre dreapta, sub ele. */}
      <div
        className="flex flex-shrink-0 flex-col gap-3 lg:mx-auto lg:max-w-full"
        style={latura ? { width: latura + SPATIU_TABLA_PANOU + LATIME_PANOU } : undefined}
      >
      {/* Antetul: cursul şi capitolul */}
      <div className="flex flex-shrink-0 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to={`/courses/${slug}`}
            aria-label="Înapoi la curs"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#141414] text-[#A0A0A0] transition-colors hover:text-[#F0F0F0]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-[#F0F0F0]">{curs?.titlu ?? line.variation_name}</p>
            <p className="truncate text-sm text-[#A0A0A0]">{etichetaCapitol}</p>
          </div>
        </div>
        <span className={`flex-shrink-0 rounded-full border px-2 py-1 text-xs font-medium ${
          line.user_color === 'white'
            ? 'border-[#F0F0F0] bg-[#F0F0F0] text-black'
            : 'border-[#3A3A3A] bg-[#141414] text-[#F0F0F0]'
        }`}>
          {line.user_color === 'white' ? '♔ Alb' : '♚ Negru'}
        </span>
      </div>

      {/* Partea în care eşti, cu segmentele ei. Segmentele duc direct la partea lor. */}
      <div className="flex-shrink-0 space-y-1">
        <div className="relative flex items-center gap-2 rounded-lg border border-[#2A2A2A] bg-[#141414] px-3 py-2">
          {isGuided
            ? <BookOpen className="h-4 w-4 flex-shrink-0 text-[#E2B340]" />
            : <Dumbbell className="h-4 w-4 flex-shrink-0 text-[#E2B340]" />}
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-[#E2B340]">
            {/* Numele etapelor, cerute pe 2026-11-23: „Studiu" şi „Practică pe baza studiului". */}
            {/* Din 2026-11-26, o variantă pe etapă: studiul ei, apoi exersarea ei. */}
            {isTrap && 'Capcana: '}
            {studiiCap.length > 1 && `Studiul ${indexStudiu + 1} · `}
            {inLista
              ? `${etapaAici?.tip === 'test' ? 'Verificarea studiului' : 'Recapitulare'} · Exersarea ${lista.indexOf(variantaAici) + 1} din ${lista.length}`
              : <>{studiulAici.variante.length > 1 && `Varianta ${nrInStudiu(variantaAici)} din ${studiulAici.variante.length}: `}{isGuided ? 'Studiu' : 'Practică pe baza studiului'}</>}
          </p>
          {!isGuided && !gata && (
            <button
              type="button"
              onClick={() => { rundaImperfecta.current = true; setSolutieLa(state.plyIdx) }}
              disabled={state.status !== 'user-turn' || priveste}
              className="flex items-center gap-1.5 rounded-md border border-[#2A2A2A] px-2.5 py-1 text-sm text-[#A0A0A0] transition-colors hover:text-[#F0F0F0] disabled:opacity-40"
            >
              <Lightbulb className="h-3.5 w-3.5" />
              Soluție
            </button>
          )}
          <button
            type="button"
            onClick={() => setMeniu(m => !m)}
            aria-label="Mai multe"
            aria-expanded={meniu}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#A0A0A0] transition-colors hover:bg-[#1C1C1C] hover:text-[#F0F0F0]"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {meniu && (
            <div className="absolute right-2 top-full z-40 mt-1 max-h-[70vh] w-72 overflow-y-auto rounded-xl border border-[#2A2A2A] bg-[#141414] p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
              <Link
                to={`/analiza?fen=${encodeURIComponent(fenAcum)}&orientare=${line.user_color === 'black' ? 'negru' : 'alb'}`}
                className={elementMeniu}
              >
                <Search className="h-4 w-4 text-[#6B6B6B]" /> Analizează poziția
              </Link>
              <button type="button" onClick={() => { resetLine(); setMeniu(false) }} className={elementMeniu}>
                <RotateCcw className="h-4 w-4 text-[#6B6B6B]" /> Reia varianta de la început
              </button>
              {!isTrap && liniiCurs.length > 1 && (
                <>
                  <p className="px-3 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]">
                    Mergi la variantă
                  </p>
                  {liniiCurs.map((l, i) => (
                    <Link
                      key={l.id}
                      to={`/courses/${slug}/guided/${l.id}`}
                      onClick={() => setMeniu(false)}
                      className={`${elementMeniu} ${l.id === lineId ? 'text-[#E2B340]' : ''}`}
                    >
                      <span className="w-4 flex-shrink-0 text-[#6B6B6B]">{i + 1}.</span>
                      <span className="truncate">{l.variation_name}</span>
                    </Link>
                  ))}
                </>
              )}
              <div className="my-1 border-t border-[#2A2A2A]" />
              <Link to={`/courses/${slug}`} className={`${elementMeniu} text-[#FB7185]`}>
                <LogOut className="h-4 w-4" /> Încheie sesiunea
              </Link>
            </div>
          )}
        </div>

        <div className="flex gap-1.5">
          {segmente.map((segment, i) => (
            <Link key={segment.href} to={segment.href} aria-label={segment.eticheta} className="flex-1 py-1.5">
              <div className="h-1.5 overflow-hidden rounded-full bg-[#2A2A2A]">
                <div
                  className="h-full rounded-full bg-[#E2B340] transition-all duration-500"
                  style={{ width: `${umplere(i)}%` }}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
      </div>

      {/* `lg:pb-24`: spaţiu negru sub tablă, de cinci ori cât marginea paginii (24px),
          cerut ca tabla să nu mai atingă marginea de jos a ecranului. */}
      <div ref={setRandTabla} className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:justify-center lg:gap-4 lg:pb-24">
        {/* Tabla — pătrată şi centrată, dar dimensionată din altceva după ecran.
            Pe lat, din înălţime (`lg:h-full`): pagina e blocată la înălţimea
            ecranului şi tabla ia tot ce rămâne pe verticală.
            Pe telefon, din lăţime (`w-full`): acolo panourile stau sub tablă, nu
            lângă ea, deci înălţimea rămasă e mică — luată din ea, tabla ieşea de
            127px, cu pătrate de 16px pe care nu poţi juca (măsurat). Tot de-aia
            înălţimea fixă a paginii e şi ea doar de la `lg` în sus: pe telefon
            pagina se derulează, în loc să înghesuie totul într-un ecran. */}
        <div className={`flex min-h-0 min-w-0 items-center justify-center ${latura ? 'lg:items-start' : 'flex-1'}`}>
          <div
            className="aspect-square w-full max-w-full overflow-hidden rounded-xl border border-[#2A2A2A]"
            style={latura ? { width: latura, height: latura } : undefined}
          >
            <Chessboard
              options={{
                position: fenAcum,
                onPieceDrop: handlePieceDrop,
                allowDragging: !priveste && state.status === 'user-turn',
                boardOrientation: line.user_color === 'white' ? 'white' : 'black',
                squareStyles,
                // Doar cât se vede mutarea greşită: altfel tabla îşi desenează
                // singură câmpurile. Înlocuitorul face acelaşi lucru, plus semnul.
                squareRenderer: state.status === 'wrong' && state.wrongTo
                  ? ({ square, children }) => (
                      <div style={{ width: '100%', height: '100%', position: 'relative', ...squareStyles[square] }}>
                        {children}
                        {square === state.wrongTo && <SemnGresit />}
                      </div>
                    )
                  : undefined,
                arrows: sageti,
                arrowOptions: OPTIUNI_SAGETI,
                boardStyle: { borderRadius: 0 },
                animationDurationInMs: ANIMATIE_MS,
                darkSquareStyle,
                lightSquareStyle,
              }}
            />
          </div>
        </div>

        {/* Coloana dreaptă — lăţime fixă, cu scroll propriu dacă e nevoie, ca
            înălţimea ei să nu influenţeze niciodată dimensiunea tablei.
            Ca la Chessly, are doar două lucruri: navigarea şi balonul. Progresul
            şi alegerea modului au urcat în antet. */}
        <div className="min-h-0 shrink-0 space-y-3 overflow-y-auto lg:w-[21rem]">
          {/* Navigarea, mereu sus — şi la poziţia de start, unde e doar stinsă. */}
          <div className="flex items-center gap-1.5">
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
                className="flex h-9 w-10 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#1C1C1C] text-[#A0A0A0] transition-colors hover:border-[#3A3A3A] hover:text-[#F0F0F0] disabled:pointer-events-none disabled:opacity-30"
              >
                <Icoana className="h-4 w-4" />
              </button>
            ))}
            {gata && (
              <span className="ml-auto flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-[#4ade80]">
                <CheckCircle2 className="h-4 w-4" /> Variantă completă
              </span>
            )}
          </div>

          {gata && (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={resetLine}>
                <RotateCcw className="h-3.5 w-3.5" /> {isGuided ? 'Refă studiul' : 'Refă exersarea'}
              </Button>
              <Link to={urmator.href} className="flex-1">
                <Button size="sm" className="w-full">
                  {urmator.eticheta} <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}

          {/* Jocul de mijloc se exersează în Analiză, din poziţia de la capăt
              (cerut pe 2026-11-25, când jocul de mijloc a ieşit din capitole).
              Doar la exersare: studiul ţine atenţia pe conţinut, iar pentru
              poziţie există „Analizează poziţia" din meniu (cerut pe 2026-11-26). */}
          {gata && !isTrap && !isGuided && !priveste && (
            <Link
              to={`/analiza?fen=${encodeURIComponent(fenAcum)}&orientare=${line.user_color === 'black' ? 'negru' : 'alb'}`}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[rgba(45,212,191,0.3)] bg-[rgba(45,212,191,0.08)] px-3 py-2 text-sm font-semibold text-[#2DD4BF] transition-colors hover:bg-[rgba(45,212,191,0.14)]"
            >
              <Search className="h-4 w-4" /> Joacă mai departe în Analiză
            </Link>
          )}

          {/* Balonul de comentariu: al poziţiei privite, în recapitulare; la
              exersare, cât priveşti înapoi în timpul jocului, dispare. */}
          {(!priveste || recapitulare) && (balon.length > 0 || inceput) && (
            <div className="space-y-3 rounded-lg border border-[rgba(226,179,64,0.35)] bg-[rgba(226,179,64,0.07)] p-4">
              {/* `flow-root`: blocul îşi cuprinde mini-tabla aşezată la dreapta
                  textului, iar textul de după el începe sub ea, nu lângă ea. */}
              {inceput && (
                <div className="flow-root space-y-3">
                  <MiniTablaVarianta
                    mutari={inceput.mutari}
                    cheie={inceput.cheie}
                    orientare={line.user_color === 'white' ? 'white' : 'black'}
                    titlu={line.variation_name}
                  />
                  {inceput.paragrafe.map((paragraf, i) => (
                    <p key={`inceput-${i}`} className="text-[15px] leading-relaxed text-[#E8E8E8]">{paragraf}</p>
                  ))}
                </div>
              )}
              {balon.map((paragraf, i) => (
                <p key={i} className="text-[15px] leading-relaxed text-[#E8E8E8]">{paragraf}</p>
              ))}
            </div>
          )}

          {/* Exersarea: tăcută până la a treia greşeală, apoi Căluţul dă un indiciu.
              Fără text de instrucţiuni aici (scos pe 2026-11-23, la cererea
              utilizatorului): îndemnul stă în antet, lângă „exersare". */}
          {!isGuided && !gata && !priveste && greseliAici >= 3 && (
            <div className="flex items-end gap-3 pt-2">
              <CalutulOmniscient mood="encouraging" size={96} />
              <p className="flex-1 rounded-xl rounded-bl-none border border-[rgba(74,222,128,0.35)] bg-[rgba(74,222,128,0.07)] p-3 text-sm leading-relaxed text-[#E8E8E8]">
                {indiciu(line, state.plyIdx, state.game)}
              </p>
            </div>
          )}

        </div>
      </div>

      {arataRezumat && rezultate && (
        <RezumatCapitol
          parti={dinSet}
          rezultate={rezultate}
          continuaHref={continuaHref}
          onRefa={refaGresite}
          onInchide={() => setRezumatInchis(true)}
        />
      )}
    </div>
  )
}
