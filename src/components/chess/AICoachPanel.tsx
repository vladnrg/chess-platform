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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60" onClick={onClose}>
      <div
        className="relative w-full max-w-4xl bg-[#141414] border border-[#2A2A2A] rounded-2xl flex flex-col max-h-[94vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2A2A2A] shrink-0">
          <div className="flex items-center gap-2.5">
            <MascotEnPassant mood={loading ? 'thinking' : answer ? 'happy' : 'idle'} size={36} animated={loading} />
            <div>
              <h2 className="text-sm font-semibold text-[#F0F0F0]">En Passant</h2>
              <p className="text-xs text-[#6B6B6B]">
                {isPro ? 'Nelimitat' : 'Până la 3 întrebări/zi'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#6B6B6B] hover:text-[#F0F0F0] hover:bg-[#2A2A2A] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Corp: tabla stânga (mereu vizibilă), conversația dreapta */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row">
          {/* Tabla — nu se mai acoperă cu textul */}
          <div className="p-4 sm:p-5 flex flex-col items-center gap-2 md:w-[46%] md:border-r border-b md:border-b-0 border-[#2A2A2A] shrink-0">
            <div className="w-full max-w-[360px] rounded-lg overflow-hidden border border-[#2A2A2A]">
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
            <p className="text-[11px] text-[#6B6B6B] text-center leading-relaxed max-w-[320px]">
              Apasă o coordonată din explicație (ex. <span className="font-mono text-[#E2B340]">e4</span>) ca s-o vezi evidențiată aici.
            </p>
          </div>

          {/* Conversația — dreapta, cu scroll propriu */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Întrebări + input (sus, fix) */}
            <div className="px-5 py-4 space-y-3 border-b border-[#2A2A2A] shrink-0">
              <p className="text-xs text-[#6B6B6B] uppercase tracking-wider">Întreabă-l ceva</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => handleAsk(q)}
                    disabled={loading}
                    className="rounded-full px-3 py-1 text-xs border border-[#2A2A2A] text-[#A0A0A0] hover:border-[#E2B340] hover:text-[#E2B340] transition-colors disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customQuestion}
                  onChange={e => setCustomQuestion(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && customQuestion.trim()) { handleAsk(customQuestion); setCustomQuestion('') } }}
                  placeholder="Sau scrie orice întrebare..."
                  className="flex-1 min-w-0 rounded-lg bg-[#141414] border border-[#2A2A2A] px-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#3A3A3A] focus:outline-none focus:border-[#E2B340]"
                />
                <Button
                  size="sm"
                  onClick={() => { if (customQuestion.trim()) { handleAsk(customQuestion); setCustomQuestion('') } }}
                  disabled={loading || !customQuestion.trim()}
                >
                  Întreabă
                </Button>
              </div>
            </div>

            {/* Răspuns (scroll propriu) */}
            <div className="flex-1 overflow-y-auto px-5 py-4 min-h-[120px]">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                  <Loader2 className="h-4 w-4 animate-spin text-[#E2B340]" />
                  En Passant studiază poziția...
                </div>
              ) : error ? (
                <p className="text-sm text-[#fbbf24]">{error}</p>
              ) : answer ? (
                <p className="text-sm text-[#F0F0F0] leading-relaxed whitespace-pre-wrap">
                  {renderAnswer(answer)}
                </p>
              ) : (
                <p className="text-sm text-[#6B6B6B] leading-relaxed">
                  Alege o întrebare de mai sus sau scrie una — îți explic direct, iar coordonatele le poți vedea pe tabla din stânga.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
