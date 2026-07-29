import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { Chessboard } from 'react-chessboard'
import { useAICoach } from '@/hooks/useAICoach'
import { useSubscription } from '@/hooks/useSubscription'
import { Button } from '@/components/ui/Button'
import { MascotEnPassant } from '@/components/ui/MascotEnPassant'

// Întrebări concrete (cu context), nu abstracte — răspunsuri mai utile.
const QUICK_QUESTIONS = [
  'De ce nu merge mutarea pe care am încercat-o?',
  'Care e cea mai periculoasă piesă a adversarului acum?',
  'Care e cea mai slabă piesă a mea și cum o apăr?',
  'Care ar fi planul în următoarele 3 mutări?',
]

const SQUARE_RE = /^[a-h][1-8]$/

// Traduce notația SAN englezească (Rxg7, Qh6, Nf3) în română (Txg7, Dh6, Cf3).
// K=Rege→R, Q=Damă→D, R=Tură→T, B=Nebun→N, N=Cal→C. Se aplică doar când litera
// e urmată de o coordonată — deci cuvintele (Regele, Nebunul) rămân neatinse.
const PIECE_MAP: Record<string, string> = { K: 'R', Q: 'D', R: 'T', B: 'N', N: 'C' }
function translateNotation(text: string): string {
  return text.replace(/\b([KQRBN])([a-h1-8]?x?)(?=[a-h][1-8])/g, (_m, piece: string, rest: string) => (PIECE_MAP[piece] ?? piece) + rest)
}

interface AICoachPanelProps {
  fen: string
  context?: string
  onClose: () => void
}

export function AICoachPanel({ fen, context = '', onClose }: AICoachPanelProps) {
  const [customQuestion, setCustomQuestion] = useState('')
  const [highlight, setHighlight] = useState<string | null>(null)
  const { ask, answer, loading, error, reset } = useAICoach()
  const { isPro } = useSubscription()

  function handleAsk(question: string) {
    reset()
    setHighlight(null)
    void ask(fen, question, context)
  }

  // Transformă coordonatele (e4, f3...) din răspuns în butoane care evidențiază pătratul.
  function renderAnswer(text: string) {
    const parts = translateNotation(text).split(/([a-h][1-8])/g)
    return parts.map((part, i) =>
      SQUARE_RE.test(part) ? (
        <button
          key={i}
          onClick={() => setHighlight(h => (h === part ? null : part))}
          className="mx-0.5 rounded px-1 font-mono font-semibold text-[#E2B340] bg-[rgba(226,179,64,0.12)] hover:bg-[rgba(226,179,64,0.25)] transition-colors"
        >
          {part}
        </button>
      ) : (
        <span key={i}>{part}</span>
      ),
    )
  }

  const squareStyles: Record<string, React.CSSProperties> = highlight
    ? { [highlight]: { backgroundColor: 'rgba(226,179,64,0.55)', boxShadow: 'inset 0 0 0 3px #E2B340' } }
    : {}

  return (
    // Panou flotant pe dreapta, centrat vertical — fundal discret ca tabla principală să rămână vizibilă
    <div className="fixed inset-0 z-50 flex items-center justify-end p-4 sm:p-6 bg-black/20" onClick={onClose}>
      <div
        className="w-full max-w-[560px] max-h-[88vh] bg-[#141414] border border-[#2A2A2A] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2A2A2A] shrink-0">
          <div className="flex items-center gap-4">
            <MascotEnPassant mood={loading ? 'thinking' : answer ? 'happy' : 'idle'} size={68} animated={loading} />
            <div>
              <h2 className="text-2xl font-semibold text-[#F0F0F0]">En Passant</h2>
              <p className="text-base text-[#6B6B6B]">
                {isPro ? 'Nelimitat' : 'Până la 3 întrebări/zi'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#6B6B6B] hover:text-[#F0F0F0] hover:bg-[#2A2A2A] transition-colors"
          >
            <X className="h-7 w-7" />
          </button>
        </div>

        {/* Întrebări + input (fix, sus) */}
        <div className="px-6 py-5 space-y-4 border-b border-[#2A2A2A] shrink-0">
          <p className="text-sm text-[#6B6B6B] uppercase tracking-wider">Întreabă-l ceva</p>
          <div className="flex flex-wrap gap-2.5">
            {QUICK_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => handleAsk(q)}
                disabled={loading}
                className="rounded-full px-4 py-2 text-base border border-[#2A2A2A] text-[#A0A0A0] hover:border-[#E2B340] hover:text-[#E2B340] transition-colors disabled:opacity-50 text-left"
              >
                {q}
              </button>
            ))}
          </div>
          <div className="flex gap-2.5">
            <input
              type="text"
              value={customQuestion}
              onChange={e => setCustomQuestion(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && customQuestion.trim()) { handleAsk(customQuestion); setCustomQuestion('') } }}
              placeholder="Sau scrie orice întrebare..."
              className="flex-1 min-w-0 rounded-lg bg-[#141414] border border-[#2A2A2A] px-4 py-3 text-lg text-[#F0F0F0] placeholder:text-[#3A3A3A] focus:outline-none focus:border-[#E2B340]"
            />
            <Button
              size="lg"
              onClick={() => { if (customQuestion.trim()) { handleAsk(customQuestion); setCustomQuestion('') } }}
              disabled={loading || !customQuestion.trim()}
            >
              Întreabă
            </Button>
          </div>
        </div>

        {/* Răspuns (scroll propriu) */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex items-center gap-2.5 text-lg text-[#6B6B6B]">
              <Loader2 className="h-6 w-6 animate-spin text-[#E2B340]" />
              En Passant studiază poziția...
            </div>
          ) : error ? (
            <p className="text-lg text-[#fbbf24]">{error}</p>
          ) : answer ? (
            <>
              <p className="text-lg text-[#F0F0F0] leading-relaxed whitespace-pre-wrap">
                {renderAnswer(answer)}
              </p>
              {/* Mini-tablă: click pe o coordonată din text → o vezi aici */}
              <div className="mt-4">
                <p className="text-sm text-[#6B6B6B] mb-2">
                  Apasă o coordonată din explicație (ex. <span className="font-mono text-[#E2B340]">e4</span>) ca s-o vezi aici.
                </p>
                <div className="w-full max-w-[300px] mx-auto rounded-lg overflow-hidden border border-[#2A2A2A]">
                  <Chessboard
                    options={{
                      position: fen,
                      allowDragging: false,
                      boardStyle: { borderRadius: 0 },
                      darkSquareStyle: { backgroundColor: '#3A3A3A' },
                      lightSquareStyle: { backgroundColor: '#f0d9b5' },
                      squareStyles,
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-[#6B6B6B] leading-relaxed">
              Alege o întrebare de mai sus sau scrie una — îți explic pe scurt, direct.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
