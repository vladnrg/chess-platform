// Căluțul savant — mascota platformei: un CAL de șah (knight) savant, cu
// ochelari rotunzi și păr alb creț. SVG desenat manual, cu expresii care
// variază după `mood`.

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
  const hairId = `mascot-hair-${mood}`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={animated ? { animation: 'mascot-bob 2.4s ease-in-out infinite' } : undefined}
      role="img"
      aria-label="Căluțul savant"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0C85A" />
          <stop offset="55%" stopColor="#E2B340" />
          <stop offset="100%" stopColor="#C99A2E" />
        </linearGradient>
        <linearGradient id={hairId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#D2D2D2" />
        </linearGradient>
      </defs>

      {/* Bază + guler (piesa de șah) */}
      <path d="M15 57 C15 52 19 50 21 49 L43 49 C45 50 49 52 49 57 Z" fill={`url(#${id})`} />
      <rect x="22" y="45" width="20" height="5" rx="2.5" fill={`url(#${id})`} />

      {/* Capul de cal (profil, spre stânga) */}
      <path
        d="M12 33 C12 28 15 24 20 22 C25 20 30 18 34 17 C40 16 44 19 44 26 C45 33 43 41 42 47 L24 47 C24 40 23 36 26 33 C22 37 16 37 13 35 C12 35 12 34 12 33 Z"
        fill={`url(#${id})`}
        stroke="#A8801C"
        strokeWidth="0.75"
      />

      {/* Păr alb creț — bucle rotunjite pe creștet */}
      <g fill={`url(#${hairId})`} stroke="#C8C8C8" strokeWidth="0.5">
        <path d="M19 22 C17 14 25 9 31 12 C37 9 46 13 44 22 C39 18 24 18 19 22 Z" />
        <circle cx="21" cy="15" r="4.2" />
        <circle cx="27" cy="11" r="4.6" />
        <circle cx="33" cy="10" r="4.3" />
        <circle cx="39" cy="12" r="4.4" />
        <circle cx="44.5" cy="17" r="4" />
        <circle cx="46" cy="23" r="3.6" />
        <circle cx="23" cy="16" r="3" />
        <circle cx="36" cy="15" r="3.2" />
      </g>

      {/* Urechi (peste păr, ca să iasă) */}
      <path d="M25 16 L27 7 L31 15 Z" fill={`url(#${id})`} stroke="#A8801C" strokeWidth="0.6" strokeLinejoin="round" />
      <path d="M37 15 L42 7 L41 17 Z" fill={`url(#${id})`} stroke="#A8801C" strokeWidth="0.6" strokeLinejoin="round" />

      {/* Ochelari rotunzi de savant */}
      <g stroke="#1C1C1C" strokeWidth="1.8" fill="none" strokeLinecap="round">
        <circle cx="25" cy="26" r="6" />
        <circle cx="16" cy="28" r="4.5" />
        <path d="M20.5 27 L23 26.5" strokeWidth="1.4" />
        <path d="M31 25 Q34 22 37 21" strokeWidth="1.4" />
      </g>

      {/* ——— Față (expresie) ——— */}
      <Face mood={mood} />
    </svg>
  )
}

function Face({ mood }: { mood: MascotMood }) {
  const c = '#1C1C1C'

  if (mood === 'happy') {
    return (
      <g stroke={c} strokeWidth="2" strokeLinecap="round" fill="none">
        {/* ochi fericit (arc) sub lentilă */}
        <path d="M22 26.5 q3 -3 6 0" />
        {/* zâmbet pe bot */}
        <path d="M14 35 q4.5 3 8.5 0" />
      </g>
    )
  }

  if (mood === 'thinking') {
    return (
      <g>
        {/* ochi ridicat spre colț */}
        <circle cx="26" cy="25" r="1.8" fill={c} />
        {/* gură mică, neutră */}
        <path d="M15 35.5 q3.5 1.2 6.5 0" stroke={c} strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* punctuleț de gând */}
        <circle cx="50" cy="10" r="1.7" fill="#E2B340" opacity="0.9" />
      </g>
    )
  }

  if (mood === 'encouraging') {
    return (
      <g stroke={c} strokeWidth="2" strokeLinecap="round" fill="none">
        {/* clipește (wink) */}
        <path d="M22 26 q3 -2.5 6 0" />
        {/* zâmbet încurajator */}
        <path d="M14 35 q4.5 3 8.5 0" />
      </g>
    )
  }

  // idle — confident & smirky: sprânceană ridicată + zâmbet superior asimetric
  return (
    <g>
      {/* sprânceană ridicată, sigur pe el (peste ochelari) */}
      <path d="M20 18.5 q3.5 -1.8 6.5 -0.3" stroke={c} strokeWidth="1.7" strokeLinecap="round" fill="none" />
      {/* ochi confident */}
      <circle cx="25.5" cy="26.5" r="2" fill={c} />
      {/* smirk superior — un colț urcă mult */}
      <path d="M14 36 q4.5 2.5 9 -2.5" stroke={c} strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </g>
  )
}
