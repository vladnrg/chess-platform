import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface RewardBurstProps {
  /** Cantitatea de XP afișată (ex. 70 → "+70 XP"). */
  xp: number
  /** Numărul de particule care „explodează". Default: 12. */
  particles?: number
  /** Apelat după ce animația s-a terminat (pentru a demonta overlay-ul). */
  onComplete?: () => void
}

/**
 * Burst de recompensă cu Framer Motion: "+N XP" care apare cu spring + particule
 * de șah care „explodează" în afară. Se montează la momentul recompensei
 * (rezolvare puzzle, completare lecție) și se autodemontează prin onComplete.
 *
 * De randat într-un container `relative` (sau full-screen `fixed`), pointer-events
 * fiind dezactivate ca să nu blocheze interacțiunea.
 */
export function RewardBurst({ xp, particles = 12, onComplete }: RewardBurstProps) {
  const bits = useMemo(
    () =>
      Array.from({ length: particles }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / particles + Math.random() * 0.4
        const dist = 60 + Math.random() * 50
        return {
          id: i,
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          rotate: (Math.random() - 0.5) * 240,
          delay: Math.random() * 0.08,
        }
      }),
    [particles]
  )

  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
      {bits.map((b) => (
        <motion.span
          key={b.id}
          className="absolute h-2 w-2 rounded-[2px] bg-accent"
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
          animate={{ opacity: [0, 1, 0], x: b.x, y: b.y, scale: 1, rotate: b.rotate }}
          transition={{ duration: 0.7, delay: b.delay, ease: 'easeOut' }}
        />
      ))}

      <motion.div
        className="font-display text-2xl font-bold text-accent drop-shadow-[0_0_12px_rgba(226,179,64,0.6)]"
        initial={{ opacity: 0, scale: 0.5, y: 10 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1, 1], y: [10, 0, -6, -24] }}
        transition={{ duration: 1.1, ease: 'easeOut', times: [0, 0.2, 0.65, 1] }}
        onAnimationComplete={onComplete}
      >
        +{xp} XP
      </motion.div>
    </div>
  )
}
