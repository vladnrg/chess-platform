import { ExternalLink } from 'lucide-react'
import type { FamousGame } from '@/data/famousGames'

interface FamousGameCardProps {
  game: FamousGame
}

export function FamousGameCard({ game }: FamousGameCardProps) {
  return (
    <div className="rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#f0f0f0] leading-snug">{game.title}</h3>
          <p className="text-xs text-[#c8a84b] mt-0.5">{game.players}</p>
        </div>
        <div className="flex-shrink-0 rounded-lg bg-[#111] border border-[#2a2a2a] px-2.5 py-1.5 text-center">
          <p className="text-sm font-bold text-[#f0f0f0]">{game.year}</p>
          <p className={[
            'text-xs font-semibold',
            game.result === '1-0' ? 'text-[#4ade80]' :
            game.result === '0-1' ? 'text-[#f87171]' : 'text-[#666]'
          ].join(' ')}>{game.result}</p>
        </div>
      </div>

      <p className="text-xs text-[#555]">{game.event}</p>
      <p className="text-sm text-[#888] leading-relaxed">{game.description}</p>

      <div className="flex items-center justify-between mt-auto pt-1 border-t border-[#2a2a2a]">
        <div className="text-xs text-[#666]">
          <span className="text-[#555]">Lecție: </span>
          <span className="text-[#a0a0a0]">{game.keyLesson}</span>
        </div>
        <a
          href={game.lichessUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-[#c8a84b] hover:text-[#d4b860] transition-colors"
        >
          Lichess
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  )
}
