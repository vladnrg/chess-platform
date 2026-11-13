import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chessboard, type PieceDropHandlerArgs, type Arrow } from 'react-chessboard'
import { Chess } from 'chess.js'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useBoardTheme } from '@/hooks/useBoardTheme'
import { getLeagueForXp } from '@/lib/utils'
import { translateNotation } from '@/lib/chess-translations'
import { AlegePromovare } from '@/components/chess/AlegePromovare'
import { ePromovare } from '@/lib/promovare'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { TACTICS_QUESTIONS, MCQ_QUESTIONS, type AssessmentQuestion, type TacticsQuestion as Tactica } from './assessmentData'
import type { PlayingStyle } from '@/types'

const ALL_QUESTIONS: AssessmentQuestion[] = [
  ...TACTICS_QUESTIONS,
  ...MCQ_QUESTIONS.filter(q => q.category === 'style'),
]

const NR_TACTICI = TACTICS_QUESTIONS.length

interface TacticsState {
  /** A cărei întrebări e tabla. Fără el, tabla rămânea cea de la prima tactică. */
  id: string
  game: Chess
  /** Indexul din soluţie al mutării pe care o aşteptăm de la jucător. */
  pas: number
  /** Cât timp răspunde adversarul, în secvenţe, nu se poate muta. */
  adversarMuta: boolean
  solved: boolean | null
  attempted: boolean
}

function initTactics(id: string, fen: string): TacticsState {
  const g = new Chess(fen)
  return { id, game: g, pas: 0, adversarMuta: false, solved: null, attempted: false }
}

function mutaUci(game: Chess, uci: string) {
  return game.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] ?? 'q' })
}

function computeResults(answers: Record<string, string>) {
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

  // Nivelul vine din tactică, fiindcă puzzle-urile au dificultate măsurată:
  // cel mai greu rezolvat, cu o treaptă mai jos (o nimereală norocoasă nu te
  // urcă la nivelul ei). Fără niciunul, 400 — cât primul puzzle. Plafonul urcă
  // odată cu treptele (ultimul puzzle e ~2400). Întrebările despre deschideri, care
  // mutau rezultatul cu ±100, au fost scoase: nivelul vine doar din tablă.
  const rezolvate = TACTICS_QUESTIONS.filter(q => answers[q.id] === 'correct').map(q => q.rating)
  const dinTactica = rezolvate.length === 0 ? 400 : Math.max(...rezolvate) - 150
  const estimated_elo = Math.round(Math.min(2400, Math.max(400, dinTactica)) / 50) * 50

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
  /** Mutările jucate la fiecare puzzle (ale tale, în ordine), ca să poată fi revăzute. Lipsă = sărit. */
  const [mutari, setMutari] = useState<Record<string, string[]>>({})
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

  /**
   * O mutare a jucătorului. E corectă dacă e cea din soluţie sau dacă dă mat (un
   * mat e un mat, oricum ar fi dat). La o secvenţă, după fiecare mutare corectă
   * răspunde adversarul; prima greşeală încheie puzzle-ul ca greşit.
   */
  function handlePieceDrop(sourceSquare: string, targetSquare: string, promovare?: string) {
    if (!tacticsState || current.type !== 'tactics') return false
    if (tacticsState.attempted || tacticsState.adversarMuta) return false
    const q = current
    const asteptata = q.solutie[tacticsState.pas]
    const copie = new Chess(tacticsState.game.fen())
    let jucata
    try {
      // Piesa de promovare o alege jucătorul (vezi `AlegePromovare`); fără promovare,
      // `promotion` e ignorat.
      jucata = copie.move({ from: sourceSquare, to: targetSquare, promotion: promovare ?? 'q' })
    } catch {
      return false
    }
    const uci = sourceSquare + targetSquare + (jucata.promotion ?? '')
    setMutari(prev => ({ ...prev, [q.id]: [...(prev[q.id] ?? []), uci] }))

    // La promovare contează şi piesa aleasă: un pion făcut nebun nu e soluţia care
    // cere regină — decât dacă dă tot mat.
    const corecta = (jucata.promotion ? uci === asteptata : (sourceSquare + targetSquare) === asteptata?.slice(0, 4))
      || copie.isCheckmate()
    const urmatorul = tacticsState.pas + 1
    const gata = !corecta || urmatorul >= q.solutie.length || copie.isCheckmate()

    if (gata) {
      setAnswers(prev => ({ ...prev, [q.id]: corecta ? 'correct' : 'wrong' }))
      setTacticsState({ ...tacticsState, game: copie, solved: corecta, attempted: true })
      setTimeout(() => nextStep(), 1800)
      return true
    }

    // Secvenţă, mutare corectă: răspunde adversarul, apoi e iar rândul tău.
    setTacticsState({ ...tacticsState, game: copie, pas: urmatorul, adversarMuta: true })
    const raspuns = q.solutie[urmatorul]
    setTimeout(() => {
      setTacticsState(s => {
        if (!s || s.id !== q.id) return s
        const g = new Chess(s.game.fen())
        mutaUci(g, raspuns)
        return { ...s, game: g, pas: urmatorul + 1, adversarMuta: false }
      })
    }, 600)
    return true
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
    const { puzzleScore, knowledgeScore, playing_style, estimated_elo } = computeResults(answers)
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
              mutari={mutari[ALL_QUESTIONS[deRevazut].id]}
              rezultat={answers[ALL_QUESTIONS[deRevazut].id]}
            />
          )}
          {deRevazut === null && current?.type === 'tactics' && tacticsState && (
            <TacticsQuestion
              key={current.id}
              question={current}
              tacticsState={tacticsState}
              onDrop={handlePieceDrop}
              onSkip={nextStep}
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
  question, tacticsState, onDrop, onSkip,
}: {
  question: Tactica
  tacticsState: TacticsState
  onDrop: (from: string, to: string, promovare?: string) => boolean
  onSkip: () => void
}) {
  const { lightSquareStyle, darkSquareStyle } = useBoardTheme()
  /** Un pion ajuns pe ultimul rând aşteaptă să alegi piesa. */
  const [deAles, setDeAles] = useState<{ de: string; la: string } | null>(null)
  // Cine e la mutare joacă de jos, ca în cursuri: la o poziţie cu negrul la
  // mutare, tabla întoarsă cu albul jos te punea să gândeşti cu capul în jos.
  const negrulMuta = question.fen.split(' ')[1] === 'b'
  const secventa = question.solutie.length > 1
  return (
    <div>
      <h2 className="text-lg font-semibold text-[#F0F0F0] mb-2">
        {secventa ? 'Găsește cea mai bună secvență' : 'Găsește cea mai bună mutare'}
      </h2>
      {/* Doar cine e la mutare. Niciun indiciu: testul măsoară ce vezi singur. */}
      <p className="text-sm text-[#A0A0A0] mb-4">{negrulMuta ? 'Negrul la mutare' : 'Albul la mutare'}</p>
      {/* Aceeaşi latură ca oriunde altundeva — vezi --board-max */}
      <div
        className="relative mx-auto overflow-hidden rounded-xl border border-[#2A2A2A]"
        style={{ maxWidth: 'min(var(--board-max), 100%)' }}
      >
        <Chessboard
          options={{
            position: tacticsState.game.fen(),
            onPieceDrop: ({ piece, sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
              // targetSquare e null la drop în afara tablei → snap-back
              if (!targetSquare) return false
              if (ePromovare(piece.pieceType, targetSquare)) {
                // Doar dacă mutarea e legală; altfel piesa se întoarce, fără întrebare.
                try {
                  new Chess(tacticsState.game.fen()).move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
                } catch {
                  return false
                }
                setDeAles({ de: sourceSquare, la: targetSquare })
                return false
              }
              return onDrop(sourceSquare, targetSquare)
            },
            allowDragging: !tacticsState.attempted && !tacticsState.adversarMuta && !deAles,
            boardOrientation: negrulMuta ? 'black' : 'white',
            boardStyle: { borderRadius: 0 },
            darkSquareStyle,
            lightSquareStyle,
          }}
        />
        {deAles && (
          <AlegePromovare
            culoare={negrulMuta ? 'b' : 'w'}
            onAlege={litera => {
              const { de, la } = deAles
              setDeAles(null)
              onDrop(de, la, litera)
            }}
          />
        )}
      </div>
      {tacticsState.solved === true && (
        <p className="mt-4 text-center text-[#4ade80] font-semibold">✓ Corect!</p>
      )}
      {/* Răspunsul e definitiv, deci nu „mai gândeşte-te": urmează întrebarea următoare. */}
      {tacticsState.solved === false && (
        <p className="mt-4 text-center text-[#fbbf24] font-semibold">Nu e cea mai bună mutare.</p>
      )}
      {!tacticsState.attempted && (
        <button onClick={onSkip} className="mt-4 w-full text-sm text-[#6B6B6B] hover:text-[#A0A0A0] transition-colors">
          Nu știu — treci mai departe
        </button>
      )}
    </div>
  )
}

/**
 * Un puzzle deja parcurs. Tabla arată poziţia din clipa în care ai greşit (sau
 * de la început, dacă ai rezolvat ori ai sărit), cu mutarea ta în roşu şi cea
 * bună în verde. La secvenţe, dedesubt e scrisă toată soluţia.
 */
function Revizuire({ question, numar, mutari, rezultat }: {
  question: Tactica
  numar: number
  mutari: string[] | undefined
  rezultat: string | undefined
}) {
  const { lightSquareStyle, darkSquareStyle } = useBoardTheme()
  const negrulMuta = question.fen.split(' ')[1] === 'b'
  const corect = rezultat === 'correct'
  const ale = mutari ?? []

  // Unde s-a rupt: prima mutare a ta care nu e cea din soluţie.
  let k = 0
  while (!corect && k < ale.length && ale[k].slice(0, 4) === question.solutie[2 * k]?.slice(0, 4)) k++
  const indexRuptura = corect ? 0 : 2 * k

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
  const gresita = !corect ? ale[k] : undefined
  const sageti: Arrow[] = []
  if (gresita) {
    sageti.push({ startSquare: gresita.slice(0, 2), endSquare: gresita.slice(2, 4), color: 'rgba(251,113,133,0.9)' })
  }
  if (buna) {
    sageti.push({ startSquare: buna.slice(0, 2), endSquare: buna.slice(2, 4), color: 'rgba(74,222,128,0.9)' })
  }
  const secventa = question.solutie.length > 1

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#F0F0F0] mb-2">Revezi întrebarea {numar}</h2>
      <p className="text-sm text-[#A0A0A0] mb-1">
        {corect
          ? secventa ? 'Ai găsit toată secvența: corect.' : `Ai jucat ${sanSolutie[0]}: corect.`
          : gresita
          ? `Ai jucat ${san(fenRuptura, gresita)} (roșu). Mutarea cea mai bună era ${san(fenRuptura, buna)} (verde).`
          : `Ai sărit peste acest puzzle. Mutarea cea mai bună era ${san(fenRuptura, buna)} (verde).`}
      </p>
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
