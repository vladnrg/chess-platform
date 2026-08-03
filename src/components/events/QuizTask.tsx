import { useState } from 'react'
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { OpeningBoard } from './OpeningBoard'
import { useCompleteTask } from '@/hooks/useEvents'
import type { EventTask, TaskResult } from '@/types'

interface QuizTaskProps {
  task: EventTask
  slug: string
  onSolved?: (result: TaskResult) => void
}

/**
 * O întrebare cu variante. Verificarea e pe server — variantele vin la client,
 * dar răspunsul corect nu, până când nu răspunzi.
 *
 * Un răspuns greşit nu se înregistrează: quiz-urile de eveniment sunt de învăţat,
 * nu de pedepsit. Poţi reîncerca, dar XP-ul vine o singură dată.
 */
export function QuizTask({ task, slug, onSolved }: QuizTaskProps) {
  const [picked, setPicked] = useState<number | null>(null)
  const [result, setResult] = useState<TaskResult | null>(null)
  const complete = useCompleteTask(slug)

  const options = task.payload.options ?? []
  // După rezolvare, serverul trimite şi răspunsul — îl folosim ca să marcăm
  // varianta corectă când reintri pe o sarcină deja făcută.
  const revealed = result ?? (task.done
    ? { correct: true, xp: 0, answer: task.payload.answer, explanation: task.payload.explanation }
    : null)
  const locked = task.done || result?.correct === true

  async function submit() {
    if (picked === null) return
    const r = await complete.mutateAsync({ taskId: task.id, answer: picked })
    setResult(r)
    if (r.correct) onSolved?.(r)
  }

  return (
    <div className="space-y-4">
      {/* Poziţia, când întrebarea e despre o deschidere. Stă înaintea întrebării:
          întâi vezi despre ce e vorba, apoi ţi se cere să o numeşti. */}
      {task.payload.moves && <OpeningBoard moves={task.payload.moves} />}

      {task.prompt && (
        <p className="text-[#F0F0F0] text-lg leading-relaxed">{task.prompt}</p>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option, idx) => {
          const isCorrect = revealed?.answer === idx
          const isPicked = picked === idx
          const showWrong = revealed && !revealed.correct && isPicked

          return (
            <button
              key={option}
              type="button"
              disabled={locked || complete.isPending}
              onClick={() => { setPicked(idx); setResult(null) }}
              className={[
                'flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors',
                'disabled:cursor-default',
                revealed && isCorrect
                  ? 'border-[#4ade80] bg-[rgba(74,222,128,0.1)] text-[#F0F0F0]'
                  : showWrong
                    ? 'border-[#FB7185] bg-[rgba(251,113,133,0.1)] text-[#F0F0F0]'
                    : isPicked
                      ? 'border-[#E2B340] bg-[rgba(226,179,64,0.08)] text-[#F0F0F0]'
                      : 'border-[#2A2A2A] bg-[#141414] text-[#A0A0A0] hover:border-[#3A3A3A] hover:text-[#F0F0F0]',
              ].join(' ')}
            >
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-current text-xs font-semibold">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1">{option}</span>
              {revealed && isCorrect && <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#4ade80]" />}
              {showWrong && <XCircle className="h-4 w-4 flex-shrink-0 text-[#FB7185]" />}
            </button>
          )
        })}
      </div>

      {!locked && (
        <Button onClick={() => void submit()} disabled={picked === null || complete.isPending}>
          {complete.isPending ? 'Verific…' : result && !result.correct ? 'Încearcă din nou' : 'Răspunde'}
        </Button>
      )}

      {revealed?.explanation && (
        <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-4">
          <p className="text-sm leading-relaxed text-[#A0A0A0]">{revealed.explanation}</p>
        </div>
      )}

      {result?.correct && result.xp > 0 && (
        <p className="flex items-center gap-2 text-sm font-semibold text-[#E2B340]">
          <Sparkles className="h-4 w-4" />
          +{result.xp} XP
        </p>
      )}

      {result && !result.correct && (
        <p className="text-sm text-[#FB7185]">
          Nu e asta. Mai încearcă — nu pierzi nimic.
        </p>
      )}
    </div>
  )
}
