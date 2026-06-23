import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CourseIconProps {
  /** Culoarea de fundal a iconului (per-curs). Default: teal activ. */
  color?: string
  /** Simbol/emoji/element în centru (ex. "♞", "🔥", un <svg/> sau o literă). */
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-10 w-10 text-lg rounded-lg',
  md: 'h-14 w-14 text-2xl rounded-xl',
  lg: 'h-20 w-20 text-4xl rounded-2xl',
}

/**
 * Pătrat rotunjit vibrant cu motiv de tablă de șah în carouri (ca iconurile de
 * curs din Chessly). Pattern reutilizabil: o culoare per-curs + un simbol în centru.
 */
export function CourseIcon({ color = '#2DD4BF', children, size = 'md', className }: CourseIconProps) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden font-display font-bold text-white shadow-card',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: color }}
    >
      {/* Motiv de tablă în carouri, subtil */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(45deg, rgba(255,255,255,0.5) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.5) 75%), linear-gradient(45deg, rgba(255,255,255,0.5) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.5) 75%)',
          backgroundSize: '50% 50%',
          backgroundPosition: '0 0, 25% 25%',
        }}
      />
      <span className="relative z-10 drop-shadow">{children}</span>
    </div>
  )
}
