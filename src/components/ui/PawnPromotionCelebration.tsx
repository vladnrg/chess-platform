import { useEffect, useState } from 'react'

// Celebrare tematică de șah (NU confetti): un pion urcă și se transformă
// într-o damă, în timp ce piese de șah plutesc în sus în jurul lui.

interface Props {
  /** Culoarea accentului (ex. culoarea ligii noi) */
  accentColor?: string
  /** Durata totală în ms după care se auto-ascunde */
  duration?: number
  onDone?: () => void
}

const FLOATING_PIECES = ['♟', '♞', '♝', '♜', '♛', '♙', '♘', '♗', '♖']

export function PawnPromotionCelebration({ accentColor = '#c8a84b', duration = 2200, onDone }: Props) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onDone?.() }, duration)
    return () => clearTimeout(t)
  }, [duration, onDone])

  if (!visible) return null

  // Generăm piese plutitoare cu poziții/întârzieri randomizate
  const pieces = Array.from({ length: 14 }, (_, i) => {
    const left = 8 + Math.random() * 84
    const delay = Math.random() * 0.5
    const dur = 1.3 + Math.random() * 0.9
    const spin = `${(Math.random() * 80 - 40).toFixed(0)}deg`
    const sizeP = 14 + Math.random() * 16
    return { i, left, delay, dur, spin, sizeP, glyph: FLOATING_PIECES[i % FLOATING_PIECES.length] }
  })

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden flex items-center justify-center">
      {/* Piese plutitoare */}
      {pieces.map(p => (
        <span
          key={p.i}
          className="absolute bottom-1/3 select-none"
          style={{
            left: `${p.left}%`,
            fontSize: p.sizeP,
            color: accentColor,
            ['--spin' as string]: p.spin,
            animation: `piece-rise ${p.dur}s ease-out ${p.delay}s forwards`,
          }}
        >
          {p.glyph}
        </span>
      ))}

      {/* Pion → damă în centru */}
      <div className="relative flex items-center justify-center">
        <span
          className="select-none"
          style={{
            fontSize: 56,
            color: accentColor,
            animation: 'pawn-rise 1.4s ease-out forwards',
            filter: `drop-shadow(0 0 14px ${accentColor}80)`,
          }}
        >
          ♙
        </span>
        {/* Coroana care apare deasupra (sugestia promovării) */}
        <span
          className="absolute select-none"
          style={{
            top: -10,
            fontSize: 30,
            color: accentColor,
            animation: 'crown-pop 1.6s ease-out forwards',
            filter: `drop-shadow(0 0 10px ${accentColor})`,
          }}
        >
          ♛
        </span>
      </div>
    </div>
  )
}
