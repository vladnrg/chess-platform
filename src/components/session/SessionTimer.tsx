import { X } from 'lucide-react'

interface Props {
  minutesLeft: number
  onDismiss: () => void
}

export function SessionTimer({ minutesLeft, onDismiss }: Props) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.4)] px-4 py-3 shadow-lg">
      <div>
        <p className="text-sm font-semibold text-[#f87171]">Sesiunea se termină în {minutesLeft} min</p>
        <p className="text-xs text-[#a0a0a0]">Progresul e salvat automat</p>
      </div>
      <button onClick={onDismiss} className="text-[#666] hover:text-[#f0f0f0] transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
