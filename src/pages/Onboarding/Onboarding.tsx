import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chessboard, type PieceDropHandlerArgs } from 'react-chessboard'
import { Chess } from 'chess.js'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useBoardTheme } from '@/hooks/useBoardTheme'
import { getLeagueForXp } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { TACTICS_QUESTIONS, MCQ_QUESTIONS, type AssessmentQuestion } from './assessmentData'
import type { PlayingStyle } from '@/types'

const ALL_QUESTIONS: AssessmentQuestion[] = [
  ...TACTICS_QUESTIONS,
  ...MCQ_QUESTIONS.filter(q => q.category === 'knowledge'),
  ...MCQ_QUESTIONS.filter(q => q.category === 'style'),
]

interface TacticsState {
  /** A cărei întrebări e tabla. Fără el, tabla rămânea cea de la prima tactică. */
  id: string
  game: Chess
  solved: boolean | null
  attempted: boolean
}

function initTactics(id: string, fen: string): TacticsState {
  const g = new Chess(fen)
  return { id, game: g, solved: null, attempted: false }
}

function computeResults(answers: Record<string, string>) {
  let puzzleScore = 0
  let knowledgeScore = 0
  const styleCounts: Record<string, number> = { offensive: 0, balanced: 0, pragmatic: 0, defensive: 0 }

  TACTICS_QUESTIONS.forEach(q => {
    if (answers[q.id] === 'correct') puzzleScore++
  })
  MCQ_QUESTIONS.filter(q => q.category === 'knowledge').forEach(q => {
    if (answers[q.id] === q.correct) knowledgeScore++
  })
  MCQ_QUESTIONS.filter(q => q.category === 'style').forEach(q => {
    const ans = answers[q.id]
    if (ans && ans in styleCounts) styleCounts[ans]++
  })

  const playing_style = (Object.entries(styleCounts).sort((a, b) => b[1] - a[1])[0][0]) as PlayingStyle

  const totalScore = puzzleScore * 2 + knowledgeScore
  const estimated_elo =
    totalScore >= 13 ? 1800 :
    totalScore >= 10 ? 1400 :
    totalScore >= 7 ? 1100 :
    totalScore >= 4 ? 800 :
    600

  return { puzzleScore, knowledgeScore, playing_style, estimated_elo }
}

export function Onboarding() {
  const { user, fetchProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [tacticsState, setTacticsState] = useState<TacticsState | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const current = ALL_QUESTIONS[step]
  const total = ALL_QUESTIONS.length
  const pct = Math.round((step / total) * 100)

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

  function handlePieceDrop(sourceSquare: string, targetSquare: string) {
    if (!tacticsState || current.type !== 'tactics') return false
    const move = sourceSquare + targetSquare
    try {
      const gameCopy = new Chess(tacticsState.game.fen())
      gameCopy.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
      const isCorrect = move === current.correctMove
      setAnswers(prev => ({ ...prev, [current.id]: isCorrect ? 'correct' : 'wrong' }))
      setTacticsState({ id: current.id, game: gameCopy, solved: isCorrect, attempted: true })
      setTimeout(() => nextStep(), 1800)
      return true
    } catch {
      return false
    }
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
        className={`w-full ${current?.type === 'tactics' ? '' : 'max-w-2xl'}`}
        style={current?.type === 'tactics' ? { maxWidth: 'max(42rem, calc(var(--board-max) + 3rem))' } : undefined}
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
          {current?.type === 'tactics' && tacticsState && (
            <TacticsQuestion
              question={current}
              tacticsState={tacticsState}
              onDrop={handlePieceDrop}
              onSkip={nextStep}
            />
          )}
          {current?.type === 'mcq' && (
            <McqQuestion
              question={current}
              selected={answers[current.id]}
              onAnswer={handleMcqAnswer}
            />
          )}
          {!current && (
            <div className="text-center py-8">
              <p className="text-[#A0A0A0] mb-4">Evaluare completată!</p>
              <Button onClick={handleFinish} loading={submitting} size="lg">
                Salvează și continuă
              </Button>
            </div>
          )}
        </div>

        {/* Section label */}
        <p className="mt-4 text-center text-xs text-[#6B6B6B]">
          {step < 5 ? '♟ Tactici' : step < 10 ? '📚 Cunoștințe openings' : '🎯 Stil de joc'}
        </p>
      </div>
    </div>
  )
}

function TacticsQuestion({
  question, tacticsState, onDrop, onSkip,
}: {
  question: { fen: string; hint: string; correctMove: string }
  tacticsState: TacticsState
  onDrop: (from: string, to: string) => boolean
  onSkip: () => void
}) {
  const { lightSquareStyle, darkSquareStyle } = useBoardTheme()
  // Cine e la mutare joacă de jos, ca în cursuri: la o poziţie cu negrul la
  // mutare, tabla întoarsă cu albul jos te punea să gândeşti cu capul în jos.
  const negrulMuta = question.fen.split(' ')[1] === 'b'
  return (
    <div>
      <h2 className="text-lg font-semibold text-[#F0F0F0] mb-2">Găsește cea mai bună mutare</h2>
      <p className="text-sm text-[#A0A0A0] mb-4">{question.hint}</p>
      {/* Aceeaşi latură ca oriunde altundeva — vezi --board-max */}
      <div
        className="mx-auto overflow-hidden rounded-xl border border-[#2A2A2A]"
        style={{ maxWidth: 'min(var(--board-max), 100%)' }}
      >
        <Chessboard
          options={{
            position: tacticsState.game.fen(),
            // targetSquare e null la drop în afara tablei → snap-back
            onPieceDrop: ({ sourceSquare, targetSquare }: PieceDropHandlerArgs) =>
              targetSquare ? onDrop(sourceSquare, targetSquare) : false,
            boardOrientation: negrulMuta ? 'black' : 'white',
            boardStyle: { borderRadius: 0 },
            darkSquareStyle,
            lightSquareStyle,
          }}
        />
      </div>
      {tacticsState.solved === true && (
        <p className="mt-4 text-center text-[#4ade80] font-semibold">✓ Corect!</p>
      )}
      {tacticsState.solved === false && (
        <p className="mt-4 text-center text-[#fbbf24] font-semibold">Mai gândește-te</p>
      )}
      {!tacticsState.attempted && (
        <button onClick={onSkip} className="mt-4 w-full text-sm text-[#6B6B6B] hover:text-[#A0A0A0] transition-colors">
          Nu știu — treci mai departe
        </button>
      )}
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
