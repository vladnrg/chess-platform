import { X } from 'lucide-react'

interface Props {
  minutesLeft: number
  onDismiss: () => void
}

export function SessionTimer({ minutesLeft, onDismiss }: Props) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl bg-[rgba(251,113,133,0.1)] border border-[rgba(251,113,133,0.4)] px-4 py-3 shadow-lg">
      <div>
        <p className="text-sm font-semibold text-[#FB7185]">{minutesLeft} minute rămase din sesiune</p>
        <p className="text-xs text-[#A0A0A0]">Progresul e salvat automat</p>
      </div>
      <button onClick={onDismiss} className="text-[#6B6B6B] hover:text-[#F0F0F0] transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
