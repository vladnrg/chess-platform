import { Chessboard } from 'react-chessboard'
import { ArrowRight, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { TacticCategory } from '@/data/tactics'

interface TacticCardProps {
  tactic: TacticCategory
  onExercise: (themes: string[]) => void
}

export function TacticCard({ tactic, onExercise }: TacticCardProps) {
  return (
    <div className="rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] overflow-hidden flex flex-col">
      {/* Board preview */}
      <div className="aspect-square w-full pointer-events-none select-none">
        <Chessboard
          options={{
            position: tactic.coverFen,
            allowDragging: false,
            boardStyle: { borderRadius: 0 },
            darkSquareStyle: { backgroundColor: '#3d3d3d' },
            lightSquareStyle: { backgroundColor: '#f0d9b5' },
          }}
        />
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[#f0f0f0] text-sm leading-snug">{tactic.title}</h3>
          {tactic.isPro && (
            <span className="flex items-center gap-1 text-xs font-semibold text-[#c8a84b] bg-[rgba(200,168,75,0.12)] px-2 py-0.5 rounded-full flex-shrink-0">
              <Lock className="h-2.5 w-2.5" />
              Pro
            </span>
          )}
        </div>
        <p className="text-xs text-[#888] leading-relaxed flex-1">{tactic.description}</p>
        <Button
          size="sm"
          variant="secondary"
          className="w-full gap-2 mt-auto"
          onClick={() => onExercise(tactic.lichessThemes)}
        >
          Exersează
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
