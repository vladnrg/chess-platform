import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number
  max?: number
  className?: string
  barClassName?: string
  showLabel?: boolean
}

export function Progress({ value, max = 100, className, barClassName, showLabel }: ProgressProps) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className={cn('relative h-2 w-full overflow-hidden rounded-full bg-[#2a2a2a]', className)}>
      <div
        className={cn('h-full rounded-full bg-[#c8a84b] transition-all duration-500', barClassName)}
        style={{ width: `${pct}%` }}
      />
      {showLabel && (
        <span className="absolute right-0 top-3 text-xs text-[#a0a0a0]">{pct}%</span>
      )}
    </div>
  )
}
