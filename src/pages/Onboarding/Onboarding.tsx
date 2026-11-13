import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chessboard, type Arrow } from 'react-chessboard'
import { Chess } from 'chess.js'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useBoardTheme } from '@/hooks/useBoardTheme'
import { usePromovare } from '@/hooks/usePromovare'
import { getLeagueForXp } from '@/lib/utils'
import { translateNotation } from '@/lib/chess-translations'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { TACTICS_QUESTIONS, MCQ_QUESTIONS, type AssessmentQuestion, type TacticsQuestion as Tactica } from './assessmentData'
import type { PlayingStyle } from '@/types'

const ALL_QUESTIONS: AssessmentQuestion[] = [
  ...TACTICS_QUESTIONS,
  ...MCQ_QUESTIONS.filter(q => q.category === 'style'),
]

const NR_TACTICI = TACTICS_QUESTIONS.length
/** Cât costă, din nivelul final, un puzzle la care ai greşit (o singură dată pe puzzle). */
const PENALIZARE_GRESEALA = 100
/** De la a câta greşeală la rând apar ajutoarele. */
const GRESELI_PANA_LA_AJUTOR = 2

interface TacticsState {
  /** A cărei întrebări e tabla. Fără el, tabla rămânea cea de la prima tactică. */
  id: string
  game: Chess
  /** Indexul din soluţie al mutării pe care o aşteptăm de la jucător. */
  pas: number
  /** Cât timp răspunde adversarul, în secvenţe, nu se poate muta. */
  adversarMuta: boolean
  /** Mutarea greşită, încă pe tablă până apeşi „Mai încearcă o dată". */
  gresit: { fenInainte: string; de: string; la: string } | null
  /** Greşeli una după alta la mutarea curentă; de la a doua apar ajutoarele. */
  greseliLaRand: number
  /** Piesa de mutat, luminată („Oferă un indiciu"). */
  indiciu: boolean
  /** Săgeata mutării corecte („Arată mutarea"). */
  arataMutarea: boolean
  /** Soluţia rulează singură („Arată secvenţa"). */
  ruleazaSecventa: boolean
  /** Ultima mutare jucată pe tablă (a ta sau a adversarului), marcată discret. */
  ultima: string | null
  terminat: 'rezolvat' | 'dezvaluit' | null
}

/** Ce s-a întâmplat la un puzzle, pentru nivel şi pentru revedere. */
interface Incercare {
  /** Prima greşeală: la ce mutare din soluţie şi ce ai jucat. Costă o dată −100. */
  primaGreseala?: { pas: number; uci: string }
  /** Ai cerut mutarea sau secvenţa: puzzle-ul nu mai contează ca rezolvat. */
  dezvaluit?: boolean
}

function initTactics(id: string, fen: string): TacticsState {
  return {
    id, game: new Chess(fen), pas: 0, adversarMuta: false, gresit: null, greseliLaRand: 0,
    indiciu: false, arataMutarea: false, ruleazaSecventa: false, ultima: null, terminat: null,
  }
}

function mutaUci(game: Chess, uci: string) {
  return game.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] ?? 'q' })
}

function computeResults(answers: Record<string, string>, incercari: Record<string, Incercare>) {
  let puzzleScore = 0
  const styleCounts: Record<string, number> = { offensive: 0, balanced: 0, pragmatic: 0, defensive: 0 }

  TACTICS_QUESTIONS.forEach(q => {
    if (answers[q.id] === 'correct') puzzleScore++
  })
  MCQ_QUESTIONS.filter(q => q.category === 'style').forEach(q => {
    const ans = answers[q.id]
    if (ans && ans in styleCounts) styleCounts[ans]++
  })

  const playing_style = (Object.entries(styleCounts).sort((a, b) => b[1] - a[1])[0][0]) as PlayingStyle

  // Nivelul vine din tactică, fiindcă puzzle-urile au dificultate măsurată: cel
  // mai greu rezolvat (fără să ceri soluţia), cu o treaptă mai jos — o nimereală
  // norocoasă nu te urcă la nivelul ei. Fără niciunul, 400, cât primul puzzle.
  // Din el se scad 100 pentru fiecare puzzle la care ai greşit măcar o dată:
  // poţi reîncerca oricât, dar prima greşeală se plăteşte (cerut pe 2026-11-13).
  const rezolvate = TACTICS_QUESTIONS.filter(q => answers[q.id] === 'correct').map(q => q.rating)
  const dinTactica = rezolvate.length === 0 ? 400 : Math.max(...rezolvate) - 150
  const cuGreseli = TACTICS_QUESTIONS.filter(q => incercari[q.id]?.primaGreseala).length
  const estimated_elo = Math.round(
    Math.max(400, Math.min(2400, dinTactica) - cuGreseli * PENALIZARE_GRESEALA) / 50,
  ) * 50

  // Coloana `knowledge_score` rămâne în baza de date; fără întrebări, e 0.
  return { puzzleScore, knowledgeScore: 0, playing_style, estimated_elo }
}

export function Onboarding() {
  const { user, fetchProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [tacticsState, setTacticsState] = useState<TacticsState | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [incercari, setIncercari] = useState<Record<string, Incercare>>({})
  /**
   * Indexul puzzle-ului revăzut, dacă te-ai întors la unul de dinainte; altfel
   * `null`. Întrebarea curentă nu se atinge cât revezi: „Reia de unde ai rămas"
   * te duce înapoi exact unde erai.
   */
  const [revazut, setRevazut] = useState<number | null>(null)

  const current = ALL_QUESTIONS[step]
  const total = ALL_QUESTIONS.length
  const pct = Math.round((step / total) * 100)

  /** Ultimul puzzle dinaintea poziţiei `pana` (exclusiv), sau -1. */
  const puzzleInainte = (pana: number) => {
    for (let i = Math.min(pana, ALL_QUESTIONS.length) - 1; i >= 0; i--) {
      if (ALL_QUESTIONS[i].type === 'tactics') return i
    }
    return -1
  }
  const deRevazut = revazut
  // „Înapoi" pleacă de la puzzle-ul revăzut, dacă eşti deja într-unul: aşa poţi
  // merge pas cu pas până la primul.
  const anterior = puzzleInainte(deRevazut ?? step)
  /** Pe ecran e o tablă — întrebarea curentă sau un puzzle revăzut. */
  const cuTabla = deRevazut !== null || current?.type === 'tactics'

  // Tabla se pregăteşte la FIECARE întrebare de tactică, nu doar la prima.
  // Înainte condiţia era „nu există încă o tablă", iar tabla nu se golea decât la
  // întrebările cu variante — deci de la a doua tactică încolo toată lumea vedea
  // poziţia primei întrebări, verificată faţă de mutarea alteia.
  if (current?.type === 'tactics' && tacticsState?.id !== current.id) {
    setTacticsState(initTactics(current.id, current.fen))
  }
  if (current?.type !== 'tactics' && tacticsState) {
    setTacticsState(null)
  }

  function handleMcqAnswer(value: string) {
    setAnswers(prev => ({ ...prev, [current.id]: value }))
    setTimeout(() => nextStep(), 500)
  }

  /** Răspunsul adversarului într-o secvenţă, după o mutare corectă a ta. */
  function raspundeAdversarul(qId: string, raspuns: string, pasDupa: number) {
    setTimeout(() => {
      setTacticsState(s => {
        if (!s || s.id !== qId) return s
        const g = new Chess(s.game.fen())
        mutaUci(g, raspuns)
        return { ...s, game: g, pas: pasDupa, adversarMuta: false, ultima: raspuns }
      })
    }, 600)
  }

  /**
   * O mutare a jucătorului. E corectă dacă e cea din soluţie sau dacă dă mat (un
   * mat e un mat, oricum ar fi dat). O greşeală rămâne pe tablă, în roşu, până
   * apeşi „Mai încearcă o dată"; prima greşeală de la un puzzle costă 100 din
   * nivelul final, următoarele nimic.
   */
  function handlePieceDrop(sourceSquare: string, targetSquare: string, promovare?: string) {
    const ts = tacticsState
    if (!ts || current.type !== 'tactics') return false
    if (ts.terminat || ts.adversarMuta || ts.gresit || ts.ruleazaSecventa) return false
    const q = current
    const asteptata = q.solutie[ts.pas]
    const copie = new Chess(ts.game.fen())
    let jucata
    try {
      // Piesa de promovare o alege jucătorul (vezi `usePromovare`); fără
      // promovare, `promotion` e ignorat.
      jucata = copie.move({ from: sourceSquare, to: targetSquare, promotion: promovare ?? 'q' })
    } catch {
      return false
    }
    const uci = sourceSquare + targetSquare + (jucata.promotion ?? '')

    // La promovare contează şi piesa aleasă: un pion făcut nebun nu e soluţia care
    // cere regină — decât dacă dă tot mat.
    const corecta = (jucata.promotion ? uci === asteptata : (sourceSquare + targetSquare) === asteptata?.slice(0, 4))
      || copie.isCheckmate()

    if (!corecta) {
      setIncercari(prev => prev[q.id]?.primaGreseala
        ? prev
        : { ...prev, [q.id]: { ...prev[q.id], primaGreseala: { pas: ts.pas, uci } } })
      setTacticsState({
        ...ts, game: copie, ultima: null, arataMutarea: false,
        gresit: { fenInainte: ts.game.fen(), de: sourceSquare, la: targetSquare },
        greseliLaRand: ts.greseliLaRand + 1,
      })
      return true
    }

    const urmatorul = ts.pas + 1
    const ajutor = { greseliLaRand: 0, indiciu: false, arataMutarea: false, ultima: uci }
    if (urmatorul >= q.solutie.length || copie.isCheckmate()) {
      const dezvaluit = !!incercari[q.id]?.dezvaluit
      setAnswers(prev => ({ ...prev, [q.id]: dezvaluit ? 'wrong' : 'correct' }))
      setTacticsState({ ...ts, ...ajutor, game: copie, terminat: dezvaluit ? 'dezvaluit' : 'rezolvat' })
      setTimeout(() => nextStep(), 1800)
      return true
    }

    // Secvenţă, mutare corectă: răspunde adversarul, apoi e iar rândul tău.
    setTacticsState({ ...ts, ...ajutor, game: copie, pas: urmatorul, adversarMuta: true })
    raspundeAdversarul(q.id, q.solutie[urmatorul], urmatorul + 1)
    return true
  }

  /** „Mai încearcă o dată": mutarea greşită dispare, poziţia e cea de dinainte. */
  function reincearca() {
    setTacticsState(s => s?.gresit ? { ...s, game: new Chess(s.gresit.fenInainte), gresit: null } : s)
  }

  function dezvaluie() {
    if (current?.type !== 'tactics') return
    setIncercari(prev => ({ ...prev, [current.id]: { ...prev[current.id], dezvaluit: true } }))
  }

  function oferaIndiciu() {
    reincearca()
    setTacticsState(s => s ? { ...s, indiciu: true } : s)
  }

  function arataMutarea() {
    dezvaluie()
    reincearca()
    setTacticsState(s => s ? { ...s, arataMutarea: true } : s)
  }

  /** „Arată secvenţa": restul soluţiei se joacă singur, mutare cu mutare. */
  function arataSecventa() {
    const ts = tacticsState
    if (!ts || current?.type !== 'tactics') return
    const q = current
    dezvaluie()
    const rest = q.solutie.slice(ts.pas)
    setTacticsState({
      ...ts, game: new Chess(ts.gresit ? ts.gresit.fenInainte : ts.game.fen()),
      gresit: null, indiciu: false, arataMutarea: false, ruleazaSecventa: true,
    })
    rest.forEach((uci, i) => {
      setTimeout(() => {
        const gata = i === rest.length - 1
        setTacticsState(s => {
          if (!s || s.id !== q.id) return s
          const g = new Chess(s.game.fen())
          mutaUci(g, uci)
          return { ...s, game: g, pas: ts.pas + i + 1, ultima: uci, ruleazaSecventa: !gata, terminat: gata ? 'dezvaluit' : null }
        })
        if (gata) setAnswers(prev => ({ ...prev, [q.id]: 'wrong' }))
      }, 800 * (i + 1))
    })
  }

  function treciMaiDeparte() {
    // Sărit după o greşeală: nu e rezolvat. Fără greşeală, rămâne pur şi simplu sărit.
    if (current?.type === 'tactics' && incercari[current.id]?.primaGreseala && !answers[current.id]) {
      setAnswers(prev => ({ ...prev, [current.id]: 'wrong' }))
    }
    nextStep()
  }

  function nextStep() {
    if (step < total - 1) {
      setStep(s => s + 1)
    } else {
      void handleFinish()
    }
  }

  async function handleFinish() {
    if (!user) return
    setSubmitting(true)
    const { puzzleScore, knowledgeScore, playing_style, estimated_elo } = computeResults(answers, incercari)
    const league = getLeagueForXp(0)

    const { error: assessErr } = await supabase.from('assessment_results').upsert({
      user_id: user.id,
      answers,
      puzzle_score: puzzleScore,
      knowledge_score: knowledgeScore,
      estimated_elo,
      playing_style,
      recommended_course_ids: [],
    })

    const { error: profileErr } = await supabase.from('profiles').update({
      assessment_completed: true,
      estimated_elo,
      playing_style,
      current_league: league,
      xp: 100,
    }).eq('id', user.id)

    if (assessErr || profileErr) {
      toast.error('Eroare la salvarea evaluării.')
      setSubmitting(false)
      return
    }

    await fetchProfile(user.id)
    toast.success('Evaluare completată! +100 XP')
    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0A] px-2 py-6 sm:px-4 sm:py-12">
      {/* La tactică pagina se lărgeşte după tablă, ca tabla să aibă aceeaşi latură
          ca în cursuri (--board-max). Lăţimea fixă de 2xl o strângea la ~600px, iar
          tabla avea oricum un plafon de 380px. La întrebările cu variante de
          răspuns rămâne îngustă: acolo un rând lung de buton se citeşte greu. */}
      <div
        className={`w-full ${cuTabla ? '' : 'max-w-2xl'}`}
        style={cuTabla ? { maxWidth: 'max(42rem, calc(var(--board-max) + 3rem))' } : undefined}
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center gap-2 justify-center mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E2B340]">
              <span className="text-black font-black">♟</span>
            </div>
            <span className="font-bold text-[#F0F0F0] text-lg">CleanChess</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F0F0F0] mb-1">Evaluare nivel</h1>
          <p className="text-[#A0A0A0] text-sm">
            Întrebarea {step + 1} din {total} — răspunde cinstit pentru recomandări precise
          </p>
        </div>

        {/* Progress */}
        <Progress value={pct} className="mb-8 h-2" />

        {/* Question */}
        <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-3 sm:p-6">
          {deRevazut !== null && ALL_QUESTIONS[deRevazut].type === 'tactics' && (
            <Revizuire
              question={ALL_QUESTIONS[deRevazut] as Tactica}
              numar={deRevazut + 1}
              incercare={incercari[ALL_QUESTIONS[deRevazut].id]}
              rezultat={answers[ALL_QUESTIONS[deRevazut].id]}
            />
          )}
          {deRevazut === null && current?.type === 'tactics' && tacticsState && (
            <TacticsQuestion
              key={current.id}
              question={current}
              tacticsState={tacticsState}
              onDrop={handlePieceDrop}
              onReincearca={reincearca}
              onIndiciu={oferaIndiciu}
              onArataMutarea={arataMutarea}
              onArataSecventa={arataSecventa}
              onSkip={treciMaiDeparte}
            />
          )}
          {deRevazut === null && current?.type === 'mcq' && (
            <McqQuestion
              question={current}
              selected={answers[current.id]}
              onAnswer={handleMcqAnswer}
            />
          )}
          {deRevazut === null && !current && (
            <div className="text-center py-8">
              <p className="text-[#A0A0A0] mb-4">Evaluare completată!</p>
              <Button onClick={handleFinish} loading={submitting} size="lg">
                Salvează și continuă
              </Button>
            </div>
          )}
        </div>

        {/* Drumul înapoi la puzzle-urile deja parcurse, şi înapoi la exerciţiul
            curent. Răspunsurile nu se schimbă: aici doar te uiţi. */}
        {(anterior >= 0 || deRevazut !== null) && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {anterior >= 0 && (
              <Button variant="secondary" size="sm" onClick={() => setRevazut(anterior)}>
                ← Înapoi la dezlegarea anterioară
              </Button>
            )}
            {deRevazut !== null && (
              <Button size="sm" onClick={() => setRevazut(null)}>
                Reia de unde ai rămas →
              </Button>
            )}
          </div>
        )}

        {/* Section label */}
        <p className="mt-4 text-center text-xs text-[#6B6B6B]">
          {step < NR_TACTICI ? '♟ Tactici' : '🎯 Stil de joc'}
        </p>
      </div>
    </div>
  )
}

function TacticsQuestion({
  question, tacticsState: ts, onDrop, onReincearca, onIndiciu, onArataMutarea, onArataSecventa, onSkip,
}: {
  question: Tactica
  tacticsState: TacticsState
  onDrop: (from: string, to: string, promovare?: string) => boolean
  onReincearca: () => void
  onIndiciu: () => void
  onArataMutarea: () => void
  onArataSecventa: () => void
  onSkip: () => void
}) {
  const { lightSquareStyle, darkSquareStyle } = useBoardTheme()
  // La promovare alegi piesa (usePromovare); restul mutărilor merg direct.
  const promovare = usePromovare(ts.game.fen(), onDrop)
  // Cine e la mutare joacă de jos, ca în cursuri: la o poziţie cu negrul la
  // mutare, tabla întoarsă cu albul jos te punea să gândeşti cu capul în jos.
  const negrulMuta = question.fen.split(' ')[1] === 'b'
  const secventa = question.solutie.length > 1
  const urmatoarea = question.solutie[ts.pas]
  const ocupat = !!ts.terminat || ts.adversarMuta || !!ts.gresit || ts.ruleazaSecventa
  const ajutoare = !ts.terminat && !ts.ruleazaSecventa && ts.greseliLaRand >= GRESELI_PANA_LA_AJUTOR

  const squareStyles: Record<string, React.CSSProperties> = {}
  if (ts.ultima) {
    squareStyles[ts.ultima.slice(0, 2)] = { backgroundColor: 'rgba(226,179,64,0.22)' }
    squareStyles[ts.ultima.slice(2, 4)] = { backgroundColor: 'rgba(226,179,64,0.38)' }
  }
  if (ts.indiciu && urmatoarea && !ts.gresit) {
    squareStyles[urmatoarea.slice(0, 2)] = { backgroundColor: 'rgba(74,222,128,0.55)' }
  }
  if (ts.gresit) {
    squareStyles[ts.gresit.de] = { backgroundColor: 'rgba(251,113,133,0.45)' }
    squareStyles[ts.gresit.la] = { backgroundColor: 'rgba(251,113,133,0.6)' }
  }
  const sageti: Arrow[] = ts.arataMutarea && urmatoarea && !ts.gresit
    ? [{ startSquare: urmatoarea.slice(0, 2), endSquare: urmatoarea.slice(2, 4), color: 'rgba(74,222,128,0.9)' }]
    : []

  return (
    <div>
      {/* Antetul: întrebarea în stânga, verdictul în dreapta sus. */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#F0F0F0] mb-2">
            {secventa ? 'Găsește cea mai bună secvență' : 'Găsește cea mai bună mutare'}
          </h2>
          {/* Doar cine e la mutare. Niciun indiciu: testul măsoară ce vezi singur. */}
          <p className="text-sm text-[#A0A0A0]">{negrulMuta ? 'Negrul la mutare' : 'Albul la mutare'}</p>
        </div>
        <div className="flex min-h-[2.5rem] flex-col items-end gap-1.5 text-right">
          {ts.terminat === 'rezolvat' && (
            <p className="text-base font-semibold text-[#4ade80]">✓ Corect</p>
          )}
          {ts.terminat === 'dezvaluit' && (
            <p className="text-sm font-semibold text-[#A0A0A0]">Aceasta era soluția</p>
          )}
          {ts.gresit && (
            <>
              <p className="text-base font-semibold text-[#FB7185]">Greșit.</p>
              <Button size="sm" variant="secondary" onClick={onReincearca}>
                Mai încearcă o dată
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Aceeaşi latură ca oriunde altundeva — vezi --board-max */}
      <div
        className="relative mx-auto overflow-hidden rounded-xl border border-[#2A2A2A]"
        style={{ maxWidth: 'min(var(--board-max), 100%)' }}
      >
        <Chessboard
          options={{
            position: ts.game.fen(),
            onPieceDrop: promovare.laDrop,
            allowDragging: !ocupat && !promovare.asteapta,
            boardOrientation: negrulMuta ? 'black' : 'white',
            boardStyle: { borderRadius: 0 },
            squareStyles,
            arrows: sageti,
            darkSquareStyle,
            lightSquareStyle,
          }}
        />
        {promovare.alegere}
      </div>

      {/* Ajutoarele, de la a doua greşeală la rând. Indiciul nu costă nimic;
          mutarea sau secvenţa arătată face ca puzzle-ul să nu mai conteze. */}
      {ajutoare && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button size="sm" variant="secondary" onClick={onIndiciu} disabled={ts.indiciu}>
            Oferă un indiciu
          </Button>
          <Button size="sm" variant="secondary" onClick={onArataMutarea} disabled={ts.arataMutarea}>
            Arată mutarea
          </Button>
          {secventa && (
            <Button size="sm" variant="secondary" onClick={onArataSecventa}>
              Arată secvența
            </Button>
          )}
        </div>
      )}

      {!ts.terminat && !ts.ruleazaSecventa && (
        <button onClick={onSkip} className="mt-4 w-full text-sm text-[#6B6B6B] hover:text-[#A0A0A0] transition-colors">
          Nu știu — treci mai departe
        </button>
      )}
      {/* După o secvenţă arătată, omul se uită cât vrea şi merge mai departe singur. */}
      {ts.terminat === 'dezvaluit' && (
        <div className="mt-4 flex justify-center">
          <Button size="sm" onClick={onSkip}>Mai departe →</Button>
        </div>
      )}
    </div>
  )
}

/**
 * Un puzzle deja parcurs. Tabla arată poziţia din clipa primei greşeli (sau de
 * la început, dacă ai rezolvat din prima ori ai sărit), cu mutarea ta în roşu şi
 * cea bună în verde. La secvenţe, dedesubt e scrisă toată soluţia.
 */
function Revizuire({ question, numar, incercare, rezultat }: {
  question: Tactica
  numar: number
  incercare: Incercare | undefined
  rezultat: string | undefined
}) {
  const { lightSquareStyle, darkSquareStyle } = useBoardTheme()
  const negrulMuta = question.fen.split(' ')[1] === 'b'
  const corect = rezultat === 'correct'
  const greseala = incercare?.primaGreseala
  const indexRuptura = greseala?.pas ?? 0

  const joc = new Chess(question.fen)
  const sanSolutie: string[] = []
  let fenRuptura = question.fen
  question.solutie.forEach((uci, i) => {
    if (i === indexRuptura) fenRuptura = joc.fen()
    sanSolutie.push(translateNotation(mutaUci(joc, uci).san))
  })
  const san = (fen: string, uci: string) => {
    try {
      return translateNotation(mutaUci(new Chess(fen), uci).san)
    } catch {
      return uci
    }
  }

  const buna = question.solutie[indexRuptura]
  const sageti: Arrow[] = []
  if (greseala) {
    sageti.push({ startSquare: greseala.uci.slice(0, 2), endSquare: greseala.uci.slice(2, 4), color: 'rgba(251,113,133,0.9)' })
  }
  if (buna) {
    sageti.push({ startSquare: buna.slice(0, 2), endSquare: buna.slice(2, 4), color: 'rgba(74,222,128,0.9)' })
  }
  const secventa = question.solutie.length > 1

  let text: string
  if (greseala) {
    const gresit = `Ai greșit întâi cu ${san(fenRuptura, greseala.uci)} (roșu); mutarea cea mai bună era ${san(fenRuptura, buna)} (verde).`
    text = corect
      ? `${gresit} Ai găsit soluția la reîncercare (−${PENALIZARE_GRESEALA}).`
      : incercare?.dezvaluit
      ? `${gresit} Ai cerut apoi soluția.`
      : gresit
  } else if (corect) {
    text = secventa ? 'Ai găsit toată secvența din prima: corect.' : `Ai jucat ${sanSolutie[0]}: corect.`
  } else {
    text = `Ai sărit peste acest puzzle. Mutarea cea mai bună era ${san(fenRuptura, buna)} (verde).`
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#F0F0F0] mb-2">Revezi întrebarea {numar}</h2>
      <p className="text-sm text-[#A0A0A0] mb-1">{text}</p>
      {secventa && (
        <p className="text-sm text-[#A0A0A0] mb-4">
          Secvența completă: <span className="text-[#F0F0F0]">{sanSolutie.join('  ')}</span>
        </p>
      )}
      {!secventa && <div className="mb-3" />}
      <div
        className="mx-auto overflow-hidden rounded-xl border border-[#2A2A2A]"
        style={{ maxWidth: 'min(var(--board-max), 100%)' }}
      >
        <Chessboard
          options={{
            position: fenRuptura,
            allowDragging: false,
            arrows: sageti,
            boardOrientation: negrulMuta ? 'black' : 'white',
            boardStyle: { borderRadius: 0 },
            darkSquareStyle,
            lightSquareStyle,
          }}
        />
      </div>
      <p className="mt-3 text-center text-xs text-[#6B6B6B]">
        Răspunsul rămâne cel dat. Aici doar revezi poziția.
      </p>
    </div>
  )
}

function McqQuestion({
  question, selected, onAnswer,
}: {
  question: { question: string; options: { label: string; value: string }[] }
  selected: string | undefined
  onAnswer: (v: string) => void
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-[#F0F0F0] mb-5">{question.question}</h2>
      <div className="space-y-3">
        {question.options.map(opt => (
          <button
            key={opt.value}
            onClick={() => !selected && onAnswer(opt.value)}
            className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all ${
              selected === opt.value
                ? 'border-[#E2B340] bg-[rgba(226,179,64,0.12)] text-[#E2B340]'
                : 'border-[#2A2A2A] text-[#A0A0A0] hover:border-[#3A3A3A] hover:text-[#F0F0F0]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
