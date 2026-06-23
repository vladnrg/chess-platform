// Dl. En Passant — mascota platformei: un pion cu față, ușor "smirky",
// sigur pe el. Desenat manual ca SVG, cu expresii care variază după `mood`.

export type MascotMood = 'idle' | 'thinking' | 'happy' | 'encouraging'

interface Props {
  mood?: MascotMood
  size?: number
  className?: string
  /** Animație blândă de plutire (pentru momente "în viață") */
  animated?: boolean
}

export function MascotEnPassant({ mood = 'idle', size = 40, className = '', animated = false }: Props) {
  const id = `mascot-grad-${mood}`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={animated ? { animation: 'mascot-bob 2.4s ease-in-out infinite' } : undefined}
      role="img"
      aria-label="Dl. En Passant"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0C85A" />
          <stop offset="55%" stopColor="#E2B340" />
          <stop offset="100%" stopColor="#C99A2E" />
        </linearGradient>
      </defs>

      {/* Corpul pionului */}
      {/* Bază */}
      <path
        d="M16 56 C16 50 20 48 22 47 L42 47 C44 48 48 50 48 56 Z"
        fill={`url(#${id})`}
      />
      {/* Gât/trunchi */}
      <path
        d="M25 47 C24 40 23 36 26 33 L38 33 C41 36 40 40 39 47 Z"
        fill={`url(#${id})`}
      />
      {/* Inel/guler */}
      <rect x="23" y="30" width="18" height="5" rx="2.5" fill={`url(#${id})`} />
      {/* Cap */}
      <circle cx="32" cy="20" r="12" fill={`url(#${id})`} />
      {/* Umbră subtilă pe cap pentru volum */}
      <circle cx="32" cy="20" r="12" fill="#000" opacity="0.06" />

      {/* ——— Față ——— */}
      <Face mood={mood} />
    </svg>
  )
}

function Face({ mood }: { mood: MascotMood }) {
  const eyeFill = '#1C1C1C'

  if (mood === 'happy') {
    return (
      <g stroke={eyeFill} strokeWidth="2" strokeLinecap="round" fill="none">
        {/* ochi fericiți (arcuri) */}
        <path d="M25 19 q2.5 -3 5 0" />
        <path d="M34 19 q2.5 -3 5 0" />
        {/* zâmbet larg */}
        <path d="M27 24 q5 5 10 0" />
      </g>
    )
  }

  if (mood === 'thinking') {
    return (
      <g>
        {/* ochi ridicați spre colț (gândește) */}
        <circle cx="28" cy="18" r="1.7" fill={eyeFill} />
        <circle cx="37" cy="18" r="1.7" fill={eyeFill} />
        {/* gură mică, neutră */}
        <path d="M29 25 q3 1.5 6 0" stroke={eyeFill} strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* punctuleț de gând */}
        <circle cx="44" cy="11" r="1.6" fill="#E2B340" opacity="0.9" />
      </g>
    )
  }

  if (mood === 'encouraging') {
    return (
      <g stroke={eyeFill} strokeWidth="2" strokeLinecap="round" fill="none">
        {/* clipește (wink) cu ochiul stâng */}
        <path d="M25 19 q2.5 -2.5 5 0" />
        <circle cx="37" cy="19" r="1.8" fill={eyeFill} stroke="none" />
        {/* zâmbet încurajator */}
        <path d="M27 24 q5 4 10 0" />
      </g>
    )
  }

  // idle — "smirky": o sprânceană ridicată + zâmbet asimetric, sigur pe el
  return (
    <g>
      <circle cx="28" cy="19" r="1.8" fill={eyeFill} />
      <circle cx="37" cy="19" r="1.8" fill={eyeFill} />
      {/* sprânceană ridicată (dreapta) */}
      <path d="M35 14.5 q2.5 -1.5 4.5 0" stroke={eyeFill} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      {/* zâmbet asimetric (smirk) — urcă într-o parte */}
      <path d="M27 25 q4 3 9 -1.5" stroke={eyeFill} strokeWidth="2" strokeLinecap="round" fill="none" />
    </g>
  )
}
