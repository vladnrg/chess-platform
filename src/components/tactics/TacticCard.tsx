import { useNavigate } from 'react-router-dom'
import { Chessboard } from 'react-chessboard'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { TacticInfo } from '@/data/tactics'
import { TACTIC_DIFFICULTY_LABELS } from '@/data/tactics'

const DIFFICULTY_VARIANT: Record<string, Parameters<typeof Badge>[0]['variant']> = {
  beginner: 'beginner',
  intermediate: 'intermediate',
  advanced: 'advanced',
}

interface TacticCardProps {
  tactic: TacticInfo
}

export function TacticCard({ tactic }: TacticCardProps) {
  const navigate = useNavigate()

  return (
    <div className="rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] overflow-hidden flex flex-col">
      {/* Board preview */}
      <div className="aspect-square w-full pointer-events-none select-none">
        <Chessboard
          options={{
            position: tactic.fen,
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
          <h3 className="font-semibold text-[#f0f0f0]">{tactic.name}</h3>
          <Badge variant={DIFFICULTY_VARIANT[tactic.difficulty] ?? 'default'} className="flex-shrink-0">
            {TACTIC_DIFFICULTY_LABELS[tactic.difficulty]}
          </Badge>
        </div>
        <p className="text-sm text-[#888] leading-relaxed flex-1">{tactic.description}</p>
        <Button
          size="sm"
          variant="secondary"
          className="w-full gap-2 mt-auto"
          onClick={() => navigate(`/puzzles?theme=${tactic.lichessTheme}`)}
        >
          Exersează
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
