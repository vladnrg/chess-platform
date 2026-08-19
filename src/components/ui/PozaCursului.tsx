import { useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Poza unui curs.
 *
 * Stă în `public/openings/<slug>.png` — nu în baza de date. `courses.thumbnail_url`
 * există de la prima migrare şi e gol la toate cele 22 de cursuri; poza se
 * găseşte după numele scurt al cursului, care e oricum unic.
 *
 * Al treilea loc care o arată (catalogul, pagina cursului, Bârlogul), deci a
 * ieşit într-o singură bucată. Copiată a treia oară, ar fi început să difere —
 * ca mărimea tablei din lecţii, care a ajuns la 320px într-un singur exerciţiu.
 *
 * Când poza lipseşte rămâne pătratul închis cu rama lui, nu un gol: un
 * dreptunghi gol lângă titlu arată a pagină stricată, nu a curs fără poză.
 */
export function PozaCursului({
  slug, titlu, className, zoom, stinsa,
}: {
  slug: string
  /** Pentru cititoarele de ecran; titlul se scrie oricum alături. */
  titlu: string
  /** Mărimea şi rotunjirea vin de la cine o foloseşte — diferă de la o pagină la alta. */
  className?: string
  /** Măreşte puţin poza ca să taie marginea transparentă din jurul desenului. */
  zoom?: string
  /** Cursurile închise se arată mai stinse. */
  stinsa?: boolean
}) {
  const [aPicat, setAPicat] = useState(false)

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-[#141414] shadow-[0_2px_10px_rgba(0,0,0,0.45)]',
        className,
      )}
    >
      {!aPicat && (
        <img
          src={`/openings/${slug}.png`}
          alt={titlu}
          loading="lazy"
          onError={() => setAPicat(true)}
          className={cn('h-full w-full object-cover', zoom, stinsa && 'opacity-60')}
        />
      )}
      {stinsa && <div className="absolute inset-0 bg-black/30" />}
    </div>
  )
}
