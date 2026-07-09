import { type CSSProperties } from 'react'
import { cn } from '@/lib/utils'

// Tratament cinematic unitar pentru fotografiile de stock, ca toate să intre în
// aceeași familie vizuală cu brand-ul ChessUp (negru neutru + auriu #E2B340).
// Straturi: fotografia → grade auriu cald → întunecare direcțională (lizibilitate)
// → vignetă → grain fin. Toate straturile sunt pointer-events-none.

type Overlay = 'hero' | 'section' | 'frame'

interface CinematicImageProps {
  src: string
  alt: string
  /** hero = întunecare puternică spre stânga-jos pentru text; section/frame = mai blândă */
  overlay?: Overlay
  /** încarcă imediat (hero, above-the-fold) */
  priority?: boolean
  className?: string
  imgClassName?: string
  /** ex: 'center', '50% 30%' */
  objectPosition?: string
}

// Grain fin generat inline (fără request extern)
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

const DARKEN: Record<Overlay, CSSProperties> = {
  // Hero full-bleed: text la stânga rămâne lizibil + blend spre pagină în jos
  hero: {
    background:
      'linear-gradient(90deg, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.74) 38%, rgba(10,10,10,0.32) 72%, rgba(10,10,10,0.60) 100%),' +
      'linear-gradient(0deg, #0A0A0A 2%, rgba(10,10,10,0) 45%)',
  },
  // Fotografie de secțiune într-un card/frame: întunecare uniformă blândă
  section: {
    background:
      'linear-gradient(0deg, rgba(10,10,10,0.88) 0%, rgba(10,10,10,0.30) 55%, rgba(10,10,10,0.55) 100%)',
  },
  // Frame lateral (ex. părinți): tușă caldă, întunecare la margini
  frame: {
    background:
      'linear-gradient(0deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.10) 40%, rgba(10,10,10,0.35) 100%)',
  },
}

export function CinematicImage({
  src,
  alt,
  overlay = 'section',
  priority = false,
  className,
  imgClassName,
  objectPosition = 'center',
}: CinematicImageProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={cn('h-full w-full object-cover', imgClassName)}
        style={{ objectPosition }}
      />

      {/* Grade auriu cald — leagă fotografia de accentul de brand */}
      <div
        className="pointer-events-none absolute inset-0 mix-blend-soft-light"
        style={{
          background:
            'radial-gradient(130% 120% at 28% 35%, rgba(226,179,64,0.22), rgba(226,179,64,0) 60%)',
        }}
      />

      {/* Întunecare direcțională pentru lizibilitate + blend cu pagina */}
      <div className="pointer-events-none absolute inset-0" style={DARKEN[overlay]} />

      {/* Vignetă */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 120% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      {/* Grain fin */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{ backgroundImage: GRAIN, backgroundSize: '140px 140px' }}
      />
    </div>
  )
}
