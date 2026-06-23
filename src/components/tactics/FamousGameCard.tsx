import { ExternalLink } from 'lucide-react'
import type { FamousGame } from '@/data/famousGames'

interface FamousGameCardProps {
  game: FamousGame
}

export function FamousGameCard({ game }: FamousGameCardProps) {
  return (
    <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#F0F0F0] leading-snug">{game.title}</h3>
          <p className="text-xs text-[#E2B340] mt-0.5">{game.players}</p>
        </div>
        <div className="flex-shrink-0 rounded-lg bg-[#141414] border border-[#2A2A2A] px-2.5 py-1.5 text-center">
          <p className="text-sm font-bold text-[#F0F0F0]">{game.year}</p>
          <p className={[
            'text-xs font-semibold',
            game.result === '1-0' ? 'text-[#4ade80]' :
            game.result === '0-1' ? 'text-[#FB7185]' : 'text-[#6B6B6B]'
          ].join(' ')}>{game.result}</p>
        </div>
      </div>

      <p className="text-xs text-[#6B6B6B]">{game.event}</p>
      <p className="text-sm text-[#A0A0A0] leading-relaxed">{game.description}</p>

      <div className="flex items-center justify-between mt-auto pt-1 border-t border-[#2A2A2A]">
        <div className="text-xs text-[#6B6B6B]">
          <span className="text-[#6B6B6B]">Lecție: </span>
          <span className="text-[#A0A0A0]">{game.keyLesson}</span>
        </div>
        <a
          href={game.lichessUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-[#E2B340] hover:text-[#F0C85A] transition-colors"
        >
          Lichess
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  )
}
