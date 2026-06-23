import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface LevelPillProps {
  level: number
  xp: number
  /** Element de avatar opțional la stânga (img/SVG/mascotă). */
  avatar?: ReactNode
  className?: string
}

function formatXp(xp: number): string {
  if (xp >= 1000) return `${(xp / 1000).toFixed(xp >= 10000 ? 0 : 1)}K`
  return String(xp)
}

/**
 * Pill „LVL X · Y XP" pe verde/teal cu avatar — ca în Chessly.
 * Folosit în Sidebar și pe pagina de profil.
 */
export function LevelPill({ level, xp, avatar, className }: LevelPillProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-[rgba(74,222,128,0.35)] bg-[rgba(74,222,128,0.12)] py-1 pl-1 pr-3',
        className
      )}
    >
      {avatar && (
        <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-bg-elevated">
          {avatar}
        </span>
      )}
      <span className="font-display text-xs font-bold tracking-wide text-success">
        LVL {level}
      </span>
      <span className="text-xs font-semibold tabular-nums text-text-secondary">
        {formatXp(xp)} XP
      </span>
    </div>
  )
}
