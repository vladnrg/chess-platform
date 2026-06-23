import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number
  max?: number
  className?: string
  barClassName?: string
  showLabel?: boolean
  /** 'active' = teal (în desfășurare), 'complete' = verde, 'gold' = auriu */
  tone?: 'active' | 'complete' | 'gold'
}

const toneClasses: Record<NonNullable<ProgressProps['tone']>, string> = {
  active: 'bg-active',
  complete: 'bg-success',
  gold: 'bg-accent',
}

export function Progress({ value, max = 100, className, barClassName, showLabel, tone }: ProgressProps) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  // Auto: 100% → verde (completat), altfel teal (în desfășurare)
  const resolvedTone = tone ?? (pct >= 100 ? 'complete' : 'active')
  return (
    <div className={cn('relative h-2 w-full overflow-hidden rounded-full bg-bg-elevated', className)}>
      <div
        className={cn('relative h-full overflow-hidden rounded-full transition-all duration-500', toneClasses[resolvedTone], barClassName)}
        style={{ width: `${pct}%` }}
      >
        {pct > 0 && pct < 100 && (
          <span
            className="absolute inset-y-0 left-0 w-1/3 bg-white/25 blur-[2px]"
            style={{ animation: 'progress-sweep 2.2s ease-in-out infinite' }}
          />
        )}
      </div>
      {showLabel && (
        <span className="absolute right-0 top-3 text-xs text-text-secondary">{pct}%</span>
      )}
    </div>
  )
}
