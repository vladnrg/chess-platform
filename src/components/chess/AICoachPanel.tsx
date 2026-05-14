import { useState } from 'react'
import { X, Bot, Loader2 } from 'lucide-react'
import { useAICoach } from '@/hooks/useAICoach'
import { useSubscription } from '@/hooks/useSubscription'
import { Button } from '@/components/ui/Button'

const QUICK_QUESTIONS = [
  'Care e planul pentru mine în această poziție?',
  'De ce e această mutare bună?',
  'Ce greșesc în această poziție?',
  'Cum ar ataca un jucător mai bun?',
]

interface AICoachPanelProps {
  fen: string
  context?: string
  onClose: () => void
}

export function AICoachPanel({ fen, context = '', onClose }: AICoachPanelProps) {
  const [customQuestion, setCustomQuestion] = useState('')
  const { ask, answer, loading, error, reset } = useAICoach()
  const { isPro } = useSubscription()

  function handleAsk(question: string) {
    reset()
    void ask(fen, question, context)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="relative w-full max-w-md bg-[#161616] border border-[#2a2a2a] rounded-2xl flex flex-col gap-0 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-[#c8a84b]/15 p-1.5">
              <Bot className="h-4 w-4 text-[#c8a84b]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#f0f0f0]">Domnul En Passant</h2>
              <p className="text-xs text-[#555]">
                {isPro ? 'Nelimitat' : `Până la ${3} întrebări/zi — Free`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#666] hover:text-[#f0f0f0] hover:bg-[#2a2a2a] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick questions */}
        <div className="px-5 py-4 space-y-3">
          <p className="text-xs text-[#555] uppercase tracking-wider">Întrebări rapide</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => handleAsk(q)}
                disabled={loading}
                className="rounded-full px-3 py-1 text-xs border border-[#2a2a2a] text-[#a0a0a0] hover:border-[#c8a84b] hover:text-[#c8a84b] transition-colors disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Custom question */}
        <div className="px-5 pb-4 flex gap-2">
          <input
            type="text"
            value={customQuestion}
            onChange={e => setCustomQuestion(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && customQuestion.trim()) { handleAsk(customQuestion); setCustomQuestion('') } }}
            placeholder="Sau scrie orice întrebare..."
            className="flex-1 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-2 text-sm text-[#f0f0f0] placeholder:text-[#444] focus:outline-none focus:border-[#c8a84b]"
          />
          <Button
            size="sm"
            onClick={() => { if (customQuestion.trim()) { handleAsk(customQuestion); setCustomQuestion('') } }}
            disabled={loading || !customQuestion.trim()}
          >
            Întreabă
          </Button>
        </div>

        {/* Response */}
        {(loading || answer || error) && (
          <div className="border-t border-[#2a2a2a] px-5 py-4">
            <p className="text-xs text-[#555] uppercase tracking-wider mb-2">Răspuns</p>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-[#666]">
                <Loader2 className="h-4 w-4 animate-spin text-[#c8a84b]" />
                Coach-ul gândește...
              </div>
            ) : error ? (
              <p className="text-sm text-[#f87171]">{error}</p>
            ) : (
              <p className="text-sm text-[#d0d0d0] leading-relaxed whitespace-pre-wrap">{answer}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
