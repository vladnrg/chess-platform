import { useState } from 'react'
import { HatGlasses } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Poza jucătorului.
 *
 * De unde vine, în ordine:
 *   1. ce şi-a pus el (`profiles.avatar_url`);
 *   2. poza din contul Google, luată o dată la intrare (vezi migrarea 090);
 *   3. pălăria cu ochelari — pentru cine s-a înscris cu adresa de mail şi n-a
 *      pus nimic. Nu iniţialele numelui: două litere într-un cerc arată a
 *      lipsă, iar incognito-ul arată a alegere.
 *
 * Adresa poate şi să pice — pozele Google expiră, se schimbă, sunt limitate la
 * număr de cereri. Când se întâmplă, cade tot pe incognito, nu pe pătratul rupt
 * al browserului.
 */
export function AvatarJucator({
  src, nume, marime = 64, className, inel,
}: {
  src: string | null | undefined
  /** Doar pentru cititoarele de ecran — nu se scrie nimic peste poză. */
  nume: string
  marime?: number
  className?: string
  /** Culoarea inelului din jur; lipsă = fără inel. */
  inel?: string
}) {
  const [aPicat, setAPicat] = useState(false)
  const arataPoza = !!src && !aPicat

  return (
    <span
      className={cn(
        'relative inline-flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1A1A1A]',
        className,
      )}
      style={{
        width: marime,
        height: marime,
        boxShadow: inel ? `0 0 0 3px ${inel}` : undefined,
      }}
    >
      {arataPoza ? (
        <img
          src={src}
          alt={nume}
          width={marime}
          height={marime}
          className="h-full w-full object-cover"
          onError={() => setAPicat(true)}
          // Poza vine de pe googleusercontent; fără asta, browserul trimite
          // adresa paginii noastre ca referer la fiecare afişare.
          referrerPolicy="no-referrer"
        />
      ) : (
        <HatGlasses
          aria-label={nume}
          className="text-[#6B6B6B]"
          style={{ width: marime * 0.55, height: marime * 0.55 }}
        />
      )}
    </span>
  )
}
