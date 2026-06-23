import { useState } from 'react'
import { X, Sparkles } from 'lucide-react'
import { randomQuip } from '@/data/chessJokes'

const STORAGE_KEY = 'session-quip-dismissed'

export function SessionQuip() {
  const [quip] = useState(randomQuip)
  const [visible, setVisible] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) !== '1'
    } catch {
      return true
    }
  })

  function dismiss() {
    setVisible(false)
    try { sessionStorage.setItem(STORAGE_KEY, '1') } catch { /* ignore */ }
  }

  if (!visible) return null

  return (
    <div
      className="mb-5 flex items-center gap-3 rounded-xl border border-[rgba(226,179,64,0.25)] bg-[rgba(226,179,64,0.06)] px-4 py-3"
      style={{ animation: 'pop-in 0.4s ease-out' }}
    >
      <Sparkles className="h-4 w-4 flex-shrink-0 text-[#E2B340]" />
      <p className="flex-1 text-sm text-[#F0C85A] leading-snug">{quip}</p>
      <button
        onClick={dismiss}
        className="flex-shrink-0 rounded-md p-1 text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#2A2A2A] transition-colors"
        aria-label="Închide"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
