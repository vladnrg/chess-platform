import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Chess } from 'chess.js'
import { Chessboard, type PieceDropHandlerArgs, type Arrow } from 'react-chessboard'
import type { Square } from 'chess.js'
import {
  ChevronLeft, ChevronRight, ChevronDown, ChevronsLeft, ChevronsRight, RotateCcw, CheckCircle2, AlertTriangle,
  BookOpen, Dumbbell, Lightbulb, MoreHorizontal, Search, LogOut,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { incarcaLinie, type TrainerLine, type MiddlegamePlan, type PlanBranch } from '@/lib/trainer-line'
import { useAuth } from '@/hooks/useAuth'
import { useBoardTheme } from '@/hooks/useBoardTheme'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { CalutulOmniscient } from '@/components/ui/CalutulOmniscient'

/**
 * Cât durează alunecarea unei piese dintr-un pătrat în altul.
 *
 * Scrisă aici, nu lăsată pe seama valorii implicite din bibliotecă, fiindcă tot
 * de ea atârnă şi momentul în care apare explicaţia: textul despre mutarea
 * adversarului nu are ce căuta pe ecran cât timp piesa e încă în aer.
 */
const ANIMATIE_MS = 350

/** E albul la mutare în poziţia de plecare? */
function whiteMovesFirst(line: TrainerLine): boolean {
  return !line.start_fen || line.start_fen.includes(' w ')
}

function isUserPly(plyIdx: number, userColor: 'white' | 'black', whiteFirst = true): boolean {
  const whitePly = whiteFirst ? plyIdx % 2 === 0 : plyIdx % 2 === 1
  return (userColor === 'white') === whitePly
}

type PlanBranchView = PlanBranch & { ply?: number }

interface MutarePlan {
  ply: number
  uci: string
  san: string
  explicatie: string
  aUserului: boolean
}

function primaPropozitie(text: string): string {
  const curat = text.trim()
  if (!curat) return ''
  return curat.match(/^.+?[.!?](?:\s|$)/)?.[0].trim() ?? curat
}

function paginiDescrierePozitie(text: string | null): string[] {
  const curat = text?.trim()
  if (!curat) return []

  const dupaMutareaATreia = curat.match(/^(.*?mutarea a treia\.)(?:\s+)(.+)$/i)
  if (dupaMutareaATreia) return [dupaMutareaATreia[1], dupaMutareaATreia[2]]

  const propozitii = curat
    .match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)
    ?.map(propozitie => propozitie.trim())
    .filter(Boolean) ?? [curat]

  if (propozitii.length <= 2) return [curat]

  const jumatate = curat.length / 2
  let limita = 1
  let celMaiAproape = Number.POSITIVE_INFINITY
  for (let i = 1; i < propozitii.length; i++) {
    const lungime = propozitii.slice(0, i).join(' ').length
    const distanta = Math.abs(jumatate - lungime)
    if (distanta < celMaiAproape) {
      celMaiAproape = distanta
      limita = i
    }
  }

  return [
    propozitii.slice(0, limita).join(' '),
    propozitii.slice(limita).join(' '),
  ].filter(Boolean)
}

function mutariPentruPlan(line: TrainerLine): MutarePlan[] {
  const game = new Chess(line.start_fen)
  const whiteFirst = whiteMovesFirst(line)
  const mutari = line.moves_uci.split(' ').filter(Boolean)
  const rezultat: MutarePlan[] = []

  for (let i = 0; i < mutari.length; i++) {
    const uci = mutari[i]
    try {
      const mutare = game.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci[4] ?? 'q',
      })
      rezultat.push({
        ply: i,
        uci,
        san: mutare.san,
        explicatie: line.move_explanations?.[String(i)]?.trim() ?? '',
        aUserului: isUserPly(i, line.user_color, whiteFirst),
      })
    } catch {
      break
    }
  }

  return rezultat
}

function planuriDeExecutie(plan: MiddlegamePlan, line: TrainerLine): PlanBranchView[] {
  const planuriScrise = plan.ideas.flatMap(idea =>
    (idea.branches ?? []).map(branch => ({
      ...branch,
      title: branch.title || idea.title,
      detail: branch.detail || idea.detail,
    })),
  )
  if (planuriScrise.length > 0) return planuriScrise

  const mutari = mutariPentruPlan(line)
  const mutarileUserului = mutari.filter(mutare => mutare.aUserului)

  return mutarileUserului.slice(0, 4).map((mutare, i) => {
    const idee = plan.ideas[i]
    const adversarInainte = [...mutari]
      .slice(0, mutare.ply)
      .reverse()
      .find(candidat => !candidat.aUserului)
    const adversarDupa = mutari.find(candidat => candidat.ply > mutare.ply && !candidat.aUserului)
    const replicaTa = adversarDupa
      ? mutari.find(candidat => candidat.ply > adversarDupa.ply && candidat.aUserului)
      : null
    const explicatieMutare = mutare.explicatie || idee?.detail || ''

    return {
      ply: mutare.ply,
      title: idee?.title || primaPropozitie(explicatieMutare) || `Plan cu ${mutare.san}`,
      trigger: adversarInainte
        ? `Dacă adversarul a jucat ${adversarInainte.san}`
        : adversarDupa
        ? `Dacă adversarul răspunde cu ${adversarDupa.san}`
        : 'Când poziția îți dă timp să îmbunătățești piesele',
      move: `Joacă ${mutare.san}`,
      response: adversarDupa && replicaTa
        ? `Dacă vine ${adversarDupa.san}, continuă cu ${replicaTa.san}.`
        : undefined,
      detail: explicatieMutare || 'Pune piesa pe cel mai activ pătrat și păstrează presiunea pe centrul poziției.',
    }
  })
}

// Varianta se joacă dintr-o bucată, ca pe Chessly. Înainte se rupea în trei
// („primele 5 mutări", „următoarele 5", „spre jocul de mijloc"), cu o pauză şi
// un buton între ele; părţile de acum sunt deschiderea şi jocul de mijloc.
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
  return { game, plyIdx: target, partEnd: moves.length, status, wrongFrom: null, wrongTo: null }
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
  p: 'pionul', n: 'calul', b: 'nebunul', r: 'tura', q: 'regina', k: 'regele',
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

  // Cursul din care face parte varianta: titlul pentru antet, variantele pentru
  // „Capitolul N" şi meniu, şi care dintre ele au joc de mijloc — de aici ies
  // segmentele barei de sus şi unde duce „Continuă".
  const { data: curs } = useQuery({
    queryKey: ['trainer-curs', slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data: c } = await supabase.from('courses').select('id, title').eq('slug', slug!).single()
      if (!c) return null
      const { data: linii } = await supabase
        .from('opening_lines')
        .select('id, variation_name')
        .eq('course_id', c.id)
        .order('order_index')
      const ids = (linii ?? []).map(l => l.id)
      const { data: planuri } = ids.length > 0
        ? await supabase.from('middlegame_plans').select('opening_line_id, moves_uci').in('opening_line_id', ids)
        : { data: [] }
      return {
        titlu: c.title,
        linii: linii ?? [],
        cuPlan: new Set((planuri ?? []).filter(p => p.moves_uci).map(p => p.opening_line_id)),
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
  /** Adevărat cât timp piesa adversarului încă alunecă pe tablă. */
  const [seMuta, setSeMuta] = useState(false)
  const [arataRamificari, setArataRamificari] = useState(true)
  const [ramuraAleasa, setRamuraAleasa] = useState<number | null>(null)
  const [semnalRamificari, setSemnalRamificari] = useState(0)
  /** Greşelile la mutarea curentă, la exersare. La o semi-mutare nouă se numără de la zero. */
  const [greseli, setGreseli] = useState<{ ply: number; n: number }>({ ply: -1, n: 0 })
  /** La ce semi-mutare ai cerut soluţia. */
  const [solutieLa, setSolutieLa] = useState<number | null>(null)
  const [meniu, setMeniu] = useState(false)

  /**
   * Când treci la altă variantă, panoul se întoarce la lista de ramificaţii.
   * Se ajustează la desenare, nu într-un efect: altfel prima imagine ar arăta
   * ramura rămasă de la varianta dinainte, şi abia a doua ar corecta-o.
   */
  const cheieVarianta = `${lineId}|${stage}|${mode}`
  const [variantaVazuta, setVariantaVazuta] = useState(cheieVarianta)
  if (variantaVazuta !== cheieVarianta) {
    setVariantaVazuta(cheieVarianta)
    setArataRamificari(true)
    setRamuraAleasa(null)
    setGreseli({ ply: -1, n: 0 })
    setSolutieLa(null)
    setMeniu(false)
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
          nextStatus = 'line-done'
        } else {
          nextStatus = isUserPly(nextPly, line.user_color, whiteMovesFirst(line)) ? 'user-turn' : 'computer-thinking'
        }
        setState(s => s ? { ...s, game: gameCopy, plyIdx: nextPly, status: nextStatus } : null)
        setSeMuta(true) // explicaţia aşteaptă să se aşeze piesa
      } catch {
        // invalid move in seed data — skip silently
      }
    }, 600)

    return () => clearTimeout(timer)
    // Intenționat doar status + plyIdx: `state` conține instanța Chess, care se
    // schimbă la fiecare mutare și ar reporni cronometrul de 600 ms al calculatorului.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, plyIdx, line, vazut])

  // Piesa s-a aşezat: de-abia acum poate apărea explicaţia.
  useEffect(() => {
    if (!seMuta) return
    const t = setTimeout(() => setSeMuta(false), ANIMATIE_MS)
    return () => clearTimeout(t)
  }, [seMuta])

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
          const ply = state.plyIdx
          setGreseli(g => ({ ply, n: g.ply === ply ? g.n + 1 : 1 }))
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
        nextStatus = 'line-done'
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

  function resetLine() {
    if (!line) return
    setState(buildInitialState(line))
    setVazut(null)
    setGreseli({ ply: -1, n: 0 })
    setSolutieLa(null)
  }

  function alegeRamuraPlan(index: number) {
    setRamuraAleasa(index)
    setArataRamificari(false)
  }

  function revinoLaRamificari() {
    setArataRamificari(true)
    setRamuraAleasa(null)
    setSemnalRamificari(semnal => semnal + 1)
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
  const gata = state.status === 'line-done'
  const plyVazut = vazut ?? state.plyIdx
  const priveste = vazut !== null
  const vedere = priveste ? pozitiaLa(line, vazut) : null
  const urmatoarea = moves[state.plyIdx]
  const greseliAici = greseli.ply === state.plyIdx ? greseli.n : 0

  // ── Părţile capitolului ─────────────────────────────────────────────────────
  // Ca la Chessly: fiecare parte se învaţă, apoi se exersează imediat, iar bara
  // de sus are câte un segment pentru fiecare dintre ele. La noi un capitol are
  // două părţi, deschiderea şi jocul de mijloc, deci tot patru segmente.
  const arePlan = isMiddlegame || (curs?.cuPlan.has(line.id) ?? false)
  const parti = isTrap
    ? [{ nume: 'Capcana', invatare: `/courses/${slug}/trap/${lineId}`, exersare: `/courses/${slug}/trap-practice/${lineId}` }]
    : [
        { nume: 'Deschiderea', invatare: `/courses/${slug}/guided/${lineId}`, exersare: `/courses/${slug}/practice/${lineId}` },
        ...(arePlan
          ? [{ nume: 'Jocul de mijloc', invatare: `/courses/${slug}/middlegame/${lineId}`, exersare: `/courses/${slug}/middlegame-practice/${lineId}` }]
          : []),
      ]
  const parteaCurenta = isMiddlegame ? 1 : 0
  const segmente = parti.flatMap(p => [
    { eticheta: `${p.nume}, învățare`, href: p.invatare },
    { eticheta: `${p.nume}, exersare`, href: p.exersare },
  ])
  const segmentCurent = parteaCurenta * 2 + (isGuided ? 0 : 1)
  const umplere = (i: number) =>
    i < segmentCurent ? 100
      : i > segmentCurent ? 0
      : gata ? 100
      : moves.length > 0 ? (state.plyIdx / moves.length) * 100 : 0

  const indexCapitol = curs?.linii.findIndex(l => l.id === lineId) ?? -1
  const capitolUrmator = indexCapitol >= 0 ? curs?.linii[indexCapitol + 1] : undefined
  const etichetaCapitol = isTrap
    ? `Capcane uzuale · ${line.variation_name}`
    : indexCapitol >= 0 ? `Capitolul ${indexCapitol + 1} · ${line.variation_name}` : line.variation_name

  /** Unde duce „Continuă" de la capătul variantei. */
  const urmator = isGuided
    ? { eticheta: 'Continuă la exersare', href: practicePath }
    : !isTrap && !isMiddlegame && arePlan
    ? { eticheta: 'Continuă: jocul de mijloc', href: `/courses/${slug}/middlegame/${lineId}` }
    : !isTrap && capitolUrmator
    ? { eticheta: 'Capitolul următor', href: `/courses/${slug}/guided/${capitolUrmator.id}` }
    : { eticheta: 'Înapoi la curs', href: `/courses/${slug}` }

  // ── Balonul ─────────────────────────────────────────────────────────────────
  // Textul stă pe mutarea TA: înaintea ei spune ce a jucat adversarul şi ce
  // răspunzi. Cât timp adversarul mută (sau piesa lui încă alunecă), rămâne
  // textul de dinainte — altfel balonul ar clipi la fiecare mutare a lui.
  const plyBalon = state.status === 'user-turn' && !seMuta
    ? state.plyIdx
    : ultimaMutareATa(line, state.plyIdx - 1)
  // Recapitularea, după ce ai terminat varianta (la învăţare şi la exersare,
  // ca pe Chessly): cu săgeţile te întorci prin poziţii, iar fiecare îşi arată
  // comentariul. O poziţie în care eşti tu la mutare are comentariul mutării
  // tale de acolo; una în care mută adversarul îl păstrează pe al mutării tale
  // de dinainte. În timpul jocului, privitul înapoi rămâne fără comentariu: acolo
  // textul e despre partida în curs, nu despre poziţia răsfoită.
  const recapitulare = gata && priveste
  const albPrimul = whiteMovesFirst(line)
  const plyRecapitulare = recapitulare
    ? isUserPly(plyVazut, line.user_color, albPrimul) ? plyVazut : ultimaMutareATa(line, plyVazut - 1)
    : null
  // La exersare nu se explică nimic în timpul jocului; finalul arată la fel.
  const balon = recapitulare && plyRecapitulare !== null
    ? textBalon(line, plyRecapitulare)
    : gata ? textFinal(line) : isGuided ? textBalon(line, plyBalon) : []

  // ── Tabla: săgeţi şi pătrate ────────────────────────────────────────────────
  const sageti: Arrow[] = []
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
      sageti.push({ startSquare: s.from, endSquare: s.to, color: 'rgba(45,212,191,0.85)' })
    }
  }

  const squareStyles: Record<string, React.CSSProperties> = {}
  if (vedere) {
    // Cât timp priveşti înapoi, se marchează mutarea care a dus la poziţia aceea.
    if (vedere.de) squareStyles[vedere.de] = { backgroundColor: 'rgba(96,165,250,0.45)' }
    if (vedere.la) squareStyles[vedere.la] = { backgroundColor: 'rgba(96,165,250,0.30)' }
  } else {
    // Ultima mutare jucată, discret: ca să se vadă ce tocmai s-a schimbat pe tablă.
    // Îndrumarea pentru mutarea ta e săgeata, nu pătratele.
    const ultima = state.plyIdx > 0 ? moves[state.plyIdx - 1] : null
    if (ultima) {
      squareStyles[ultima.slice(0, 2)] = { backgroundColor: 'rgba(226,179,64,0.18)' }
      squareStyles[ultima.slice(2, 4)] = { backgroundColor: 'rgba(226,179,64,0.32)' }
    }
    // De la a treia greşeală: piesa care trebuie mutată se luminează.
    if (!isGuided && state.status === 'user-turn' && greseliAici >= 3 && urmatoarea) {
      squareStyles[urmatoarea.slice(0, 2)] = { backgroundColor: 'rgba(74,222,128,0.55)' }
    }
  }
  if (state.wrongFrom) squareStyles[state.wrongFrom] = { backgroundColor: 'rgba(251,113,133,0.55)' }
  if (state.wrongTo) squareStyles[state.wrongTo] = { backgroundColor: 'rgba(251,113,133,0.30)' }

  const fenAcum = vedere ? vedere.fen : state.game.fen()
  const elementMeniu = 'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-[#D0D0D0] transition-colors hover:bg-[#1C1C1C]'

  return (
    // Pagina umple ecranul: antetul rămâne sus, iar tabla primeşte toată înălţimea
    // rămasă. Înainte, un `max-w-4xl` plafona totul la 896px şi tabla lua 2/3 din
    // atât — pe un ecran lat rezulta o tablă mică într-o mare de negru.
    <div className="flex flex-col gap-3 lg:h-[var(--app-page-h)]">
      {meniu && <div className="fixed inset-0 z-30" onClick={() => setMeniu(false)} aria-hidden />}

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
            {parti.length > 1 && `Partea ${parteaCurenta + 1} din ${parti.length} · `}
            {parti[parteaCurenta].nume} · {isGuided ? 'învățare' : 'exersare'}
          </p>
          {!isGuided && !gata && (
            <button
              type="button"
              onClick={() => setSolutieLa(state.plyIdx)}
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
                <RotateCcw className="h-4 w-4 text-[#6B6B6B]" /> Reia de la început
              </button>
              {!isTrap && curs && curs.linii.length > 1 && (
                <>
                  <p className="px-3 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]">
                    Mergi la variantă
                  </p>
                  {curs.linii.map((l, i) => (
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

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:gap-4">
        {/* Tabla — pătrată şi centrată, dar dimensionată din altceva după ecran.
            Pe lat, din înălţime (`lg:h-full`): pagina e blocată la înălţimea
            ecranului şi tabla ia tot ce rămâne pe verticală.
            Pe telefon, din lăţime (`w-full`): acolo panourile stau sub tablă, nu
            lângă ea, deci înălţimea rămasă e mică — luată din ea, tabla ieşea de
            127px, cu pătrate de 16px pe care nu poţi juca (măsurat). Tot de-aia
            înălţimea fixă a paginii e şi ea doar de la `lg` în sus: pe telefon
            pagina se derulează, în loc să înghesuie totul într-un ecran. */}
        <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center lg:justify-end">
          <div className="aspect-square w-full max-w-full overflow-hidden rounded-xl border border-[#2A2A2A] lg:h-full lg:max-h-full lg:w-auto">
            <Chessboard
              options={{
                position: fenAcum,
                onPieceDrop: handlePieceDrop,
                allowDragging: !priveste && state.status === 'user-turn',
                boardOrientation: line.user_color === 'white' ? 'white' : 'black',
                squareStyles,
                arrows: sageti,
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

          {recapitulare && (
            <p className="px-1 text-sm text-[#60A5FA]">
              Recapitulare · {plyVazut === 0 ? 'poziţia de plecare' : `poziţia după mutarea ${plyVazut}`}
            </p>
          )}

          {priveste && !gata && (
            <div className="space-y-2 rounded-lg border border-[#2A2A2A] bg-[#141414] p-3.5">
              <p className="text-sm text-[#60A5FA]">
                {plyVazut === 0 ? 'Priveşti poziţia de plecare.' : `Priveşti poziţia după mutarea ${plyVazut}.`}{' '}
                Partida te aşteaptă.
              </p>
              <button
                type="button"
                onClick={reiaDeAici}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[rgba(226,179,64,0.3)] bg-[rgba(226,179,64,0.08)] px-3 py-2 text-base text-[#E2B340] transition-colors hover:bg-[rgba(226,179,64,0.14)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reia de aici
              </button>
            </div>
          )}

          {gata && (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={resetLine}>
                <RotateCcw className="h-3.5 w-3.5" /> Reia
              </Button>
              <Link to={urmator.href} className="flex-1">
                <Button size="sm" className="w-full">
                  {urmator.eticheta} <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}

          {/* Balonul de comentariu. Cât timp priveşti în urmă în timpul jocului,
              dispare: textul e despre poziţia din partidă, nu despre cea
              răsfoită. După final rămâne, cu comentariul poziţiei privite. */}
          {(!priveste || recapitulare) && balon.length > 0 && (
            <div className="space-y-3 rounded-lg border border-[rgba(226,179,64,0.35)] bg-[rgba(226,179,64,0.07)] p-4">
              {balon.map((paragraf, i) => (
                <p key={i} className="text-[15px] leading-relaxed text-[#E8E8E8]">{paragraf}</p>
              ))}
            </div>
          )}

          {gata && isMiddlegame && !priveste && (
            <button
              type="button"
              onClick={revinoLaRamificari}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[rgba(45,212,191,0.3)] bg-[rgba(45,212,191,0.08)] px-3 py-2.5 text-sm font-semibold text-[#2DD4BF] transition-colors hover:bg-[rgba(45,212,191,0.14)]"
            >
              <ChevronLeft className="h-4 w-4" />
              Înapoi la ramificări
            </button>
          )}

          {/* Exersarea: tăcută până la a treia greşeală, apoi Căluţul dă un indiciu. */}
          {!isGuided && !gata && !priveste && greseliAici < 3 && (
            <p className="px-1 text-sm leading-relaxed text-[#6B6B6B]">
              Joacă varianta din memorie. La a treia greșeală pe aceeași mutare, Căluțul savant îți dă un indiciu.
            </p>
          )}
          {!isGuided && !gata && !priveste && greseliAici >= 3 && (
            <div className="flex items-end gap-3 pt-2">
              <CalutulOmniscient mood="encouraging" size={96} />
              <p className="flex-1 rounded-xl rounded-bl-none border border-[rgba(74,222,128,0.35)] bg-[rgba(74,222,128,0.07)] p-3 text-sm leading-relaxed text-[#E8E8E8]">
                {indiciu(line, state.plyIdx, state.game)}
              </p>
            </div>
          )}

          {/* Planul variantei — doar la jocul de mijloc, unde există.
              Deschis din start la lecţie, strâns la exerciţiu: acolo te testezi,
              iar „c5 e singura ta spargere" citit înainte de mutare nu mai e
              gândire, e răspuns. Rămâne la un click distanţă dacă te blochezi. */}
          {isMiddlegame && line.plan && (
            <PlanulVariantei
              line={line}
              plan={line.plan}
              plyIdx={state.plyIdx}
              arataRamificari={arataRamificari}
              ramuraAleasa={ramuraAleasa}
              semnalRamificari={semnalRamificari}
              onAlegeRamura={alegeRamuraPlan}
              onRevinoLaRamificari={revinoLaRamificari}
              deschisInitial={isGuided}
            />
          )}
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
  line,
  plan,
  plyIdx,
  arataRamificari,
  ramuraAleasa,
  semnalRamificari,
  onAlegeRamura,
  onRevinoLaRamificari,
  deschisInitial,
}: {
  line: TrainerLine
  plan: MiddlegamePlan
  plyIdx: number
  arataRamificari: boolean
  ramuraAleasa: number | null
  semnalRamificari: number
  onAlegeRamura: (index: number) => void
  onRevinoLaRamificari: () => void
  deschisInitial: boolean
}) {
  const [deschis, setDeschis] = useState(deschisInitial)
  const [aratAvoid, setAratAvoid] = useState(false)
  const [paginaDescriere, setPaginaDescriere] = useState(0)
  const planuri = useMemo(() => planuriDeExecutie(plan, line), [line, plan])
  const descrieri = useMemo(() => paginiDescrierePozitie(plan.structure), [plan.structure])

  /**
   * Text nou de descriere înseamnă că se citeşte iar de la prima pagină.
   * Se ajustează la desenare, nu într-un efect, ca să nu se vadă o clipă
   * numărul paginii vechi peste textul nou.
   */
  const [structuraVazuta, setStructuraVazuta] = useState(plan.structure)
  if (structuraVazuta !== plan.structure) {
    setStructuraVazuta(plan.structure)
    setPaginaDescriere(0)
  }

  const indexSugerit = planuri.findIndex(planCurent => planCurent.ply != null && planCurent.ply >= plyIdx)
  const indexActiv = Math.max(
    0,
    Math.min(ramuraAleasa ?? (indexSugerit >= 0 ? indexSugerit : planuri.length - 1), planuri.length - 1),
  )
  const planActiv = planuri[indexActiv]
  const descriereActiva = descrieri[paginaDescriere]

  /**
   * Semnalul creşte când ceri lista de ramificaţii de undeva din afara
   * panoului. Panoul se deschide singur atunci, ca lista să se vadă fără
   * încă un clic. Se ajustează la desenare, nu într-un efect.
   */
  const [semnalVazut, setSemnalVazut] = useState(semnalRamificari)
  if (semnalVazut !== semnalRamificari) {
    setSemnalVazut(semnalRamificari)
    setDeschis(true)
  }

  if (!planActiv) return null

  return (
    <div className="rounded-xl border border-[#2A2A2A] bg-[#141414]">
      <button
        onClick={() => setDeschis(d => !d)}
        aria-expanded={deschis}
        className="flex w-full items-center justify-between gap-2 p-4 text-left"
      >
        <div>
          <span className="text-xs uppercase tracking-wider text-[#2DD4BF]">Plan de joc</span>
          <p className="mt-1 text-sm font-semibold text-[#F0F0F0]">
            {arataRamificari ? 'Ramificări din poziția asta' : planActiv.title}
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-[#6B6B6B] transition-transform ${deschis ? 'rotate-180' : ''}`}
        />
      </button>

      {deschis && (
        <div className="space-y-4 border-t border-[#2A2A2A] p-4">
          {descriereActiva && (
            <div className="rounded-lg border border-[#2A2A2A] bg-[#101010] p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#2DD4BF]">
                  Descrierea poziției
                </p>
                {descrieri.length > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPaginaDescriere(Math.max(0, paginaDescriere - 1))}
                      disabled={paginaDescriere === 0}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-[#2A2A2A] text-[#A0A0A0] transition-colors hover:bg-[#1C1C1C] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaginaDescriere(Math.min(descrieri.length - 1, paginaDescriere + 1))}
                      disabled={paginaDescriere === descrieri.length - 1}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-[#2A2A2A] text-[#A0A0A0] transition-colors hover:bg-[#1C1C1C] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm leading-relaxed text-[#A0A0A0]">
                {descriereActiva}
              </p>
              {descrieri.length > 1 && (
                <p className="mt-2 text-right text-[11px] text-[#6B6B6B]">
                  {paginaDescriere + 1} / {descrieri.length}
                </p>
              )}
            </div>
          )}

          {arataRamificari ? (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]">
                Cele mai comune răspunsuri
              </p>
              {planuri.map((ramura, i) => (
                <button
                  key={`${ramura.title}-${i}`}
                  type="button"
                  onClick={() => onAlegeRamura(i)}
                  className="w-full rounded-lg border border-[#2A2A2A] bg-[#101010] p-4 text-left transition-colors hover:border-[rgba(45,212,191,0.5)] hover:bg-[#151515]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#2DD4BF]">
                        Variația {i + 1}
                      </p>
                      <p className="mt-1 text-base font-semibold leading-snug text-[#F0F0F0]">
                        {ramura.title}
                      </p>
                    </div>
                    <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#6B6B6B]" />
                  </div>
                  {ramura.trigger && (
                    <p className="mt-3 text-sm leading-relaxed text-[#A0A0A0]">
                      {ramura.trigger}
                    </p>
                  )}
                  {ramura.move && (
                    <p className="mt-2 text-sm leading-relaxed text-[#D0D0D0]">
                      <span className="font-semibold text-[#E2B340]">Plan: </span>
                      {ramura.move}
                    </p>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-[#2A2A2A] bg-[#101010] p-4">
              <div className="mb-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]">
                  Variația {indexActiv + 1} din {planuri.length}
                </p>
                <p className="mt-1 text-base font-semibold leading-snug text-[#F0F0F0]">{planActiv.title}</p>
              </div>

              <button
                type="button"
                onClick={onRevinoLaRamificari}
                className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2DD4BF] transition-colors hover:text-[#5EEAD4]"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Înapoi la ramificări
              </button>

              <div className="space-y-2.5">
                {planActiv.trigger && (
                  <p className="text-sm leading-relaxed text-[#A0A0A0]">
                    <span className="font-semibold text-[#2DD4BF]">Dacă: </span>
                    {planActiv.trigger}
                  </p>
                )}
                {planActiv.move && (
                  <p className="text-sm leading-relaxed text-[#D0D0D0]">
                    <span className="font-semibold text-[#E2B340]">Joacă: </span>
                    {planActiv.move}
                  </p>
                )}
                {planActiv.response && (
                  <p className="text-sm leading-relaxed text-[#A0A0A0]">
                    <span className="font-semibold text-[#60A5FA]">Apoi: </span>
                    {planActiv.response}
                  </p>
                )}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-[#A0A0A0]">{planActiv.detail}</p>
            </div>
          )}

          {!arataRamificari && planuri.length > 1 && (
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onAlegeRamura(Math.max(0, indexActiv - 1))}
                disabled={indexActiv === 0}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#2A2A2A] px-3 py-2 text-sm text-[#A0A0A0] transition-colors hover:bg-[#1C1C1C] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Variația anterioară
              </button>
              <button
                type="button"
                onClick={() => onAlegeRamura(Math.min(planuri.length - 1, indexActiv + 1))}
                disabled={indexActiv === planuri.length - 1}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#2A2A2A] px-3 py-2 text-sm text-[#A0A0A0] transition-colors hover:bg-[#1C1C1C] disabled:cursor-not-allowed disabled:opacity-35"
              >
                Variația următoare
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {plan.avoid && (
            <>
              <button
                type="button"
                onClick={() => setAratAvoid(arata => !arata)}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-[rgba(251,113,133,0.2)] bg-[rgba(251,113,133,0.04)] px-3 py-2 text-left text-sm font-semibold text-[#FB7185] transition-colors hover:bg-[rgba(251,113,133,0.08)]"
              >
                <span>Ce să evit?</span>
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              </button>
              {aratAvoid && (
                <p className="rounded-lg border border-[rgba(251,113,133,0.2)] bg-[rgba(251,113,133,0.05)] p-3 text-sm leading-relaxed text-[#A0A0A0]">
                  {plan.avoid}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
