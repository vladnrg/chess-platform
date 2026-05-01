import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
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
  game: Chess
  solved: boolean | null
  attempted: boolean
}

function initTactics(fen: string): TacticsState {
  const g = new Chess(fen)
  return { game: g, solved: null, attempted: false }
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
  let estimated_elo = 500
  if (totalScore >= 13) estimated_elo = 1800
  else if (totalScore >= 10) estimated_elo = 1400
  else if (totalScore >= 7) estimated_elo = 1100
  else if (totalScore >= 4) estimated_elo = 800
  else estimated_elo = 600

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

  // Init tactics board when we reach a tactics question
  if (current?.type === 'tactics' && !tacticsState) {
    setTacticsState(initTactics(current.fen))
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
      setTacticsState({ game: gameCopy, solved: isCorrect, attempted: true })
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
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center gap-2 justify-center mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8a84b]">
              <span className="text-black font-black">♟</span>
            </div>
            <span className="font-bold text-[#f0f0f0] text-lg">ChessUp</span>
          </div>
          <h1 className="text-2xl font-bold text-[#f0f0f0] mb-1">Evaluare nivel</h1>
          <p className="text-[#a0a0a0] text-sm">
            Întrebarea {step + 1} din {total} — răspunde cinstit pentru recomandări precise
          </p>
        </div>

        {/* Progress */}
        <Progress value={pct} className="mb-8 h-2" />

        {/* Question */}
        <div className="rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] p-6">
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
              <p className="text-[#a0a0a0] mb-4">Evaluare completată!</p>
              <Button onClick={handleFinish} loading={submitting} size="lg">
                Salvează și continuă
              </Button>
            </div>
          )}
        </div>

        {/* Section label */}
        <p className="mt-4 text-center text-xs text-[#666]">
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
  return (
    <div>
      <h2 className="text-lg font-semibold text-[#f0f0f0] mb-2">Găsește cea mai bună mutare</h2>
      <p className="text-sm text-[#a0a0a0] mb-4">{question.hint}</p>
      <div className="mx-auto" style={{ maxWidth: 380 }}>
        <Chessboard
          position={tacticsState.game.fen()}
          onPieceDrop={onDrop}
          boardStyle={{ borderRadius: 8 }}
          customBoardStyle={{ borderRadius: 8 }}
          customDarkSquareStyle={{ backgroundColor: '#3d3d3d' }}
          customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
        />
      </div>
      {tacticsState.solved === true && (
        <p className="mt-4 text-center text-[#4ade80] font-semibold">✓ Corect!</p>
      )}
      {tacticsState.solved === false && (
        <p className="mt-4 text-center text-[#f87171] font-semibold">✗ Greșit</p>
      )}
      {!tacticsState.attempted && (
        <button onClick={onSkip} className="mt-4 w-full text-sm text-[#666] hover:text-[#a0a0a0] transition-colors">
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
      <h2 className="text-lg font-semibold text-[#f0f0f0] mb-5">{question.question}</h2>
      <div className="space-y-3">
        {question.options.map(opt => (
          <button
            key={opt.value}
            onClick={() => !selected && onAnswer(opt.value)}
            className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all ${
              selected === opt.value
                ? 'border-[#c8a84b] bg-[rgba(200,168,75,0.12)] text-[#c8a84b]'
                : 'border-[#2a2a2a] text-[#a0a0a0] hover:border-[#3a3a3a] hover:text-[#f0f0f0]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
