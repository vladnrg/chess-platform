import { useLayoutEffect, useState } from 'react'

/**
 * Latura tablei, calculată din spaţiul în care stă ea alături de panoul din dreapta.
 *
 * Ca la Chessly, tabla şi panoul formează un singur bloc, centrat pe ecran, iar
 * antetul de deasupra are exact lăţimea blocului. Pentru asta trebuie ştiută
 * latura tablei în pixeli: ea vine fie din înălţimea rămasă, fie din lăţimea
 * rămasă după panou — care dintre ele e mai mică.
 *
 * Întoarce `null` sub `lg` (telefon, tabletă îngustă): acolo panoul stă sub
 * tablă, iar tabla ia toată lăţimea, fără niciun calcul.
 */
export function useLaturaTablei(
  /** Rândul care ţine tabla şi panoul (cel care se întinde pe înălţimea rămasă). */
  rand: HTMLElement | null,
  /** Lăţimea panoului din dreapta plus spaţiul dintre el şi tablă, în pixeli. */
  latimePanou: number,
): number | null {
  const [latura, setLatura] = useState<number | null>(null)

  // Înainte de desenare, ca tabla să nu apară o clipă la mărimea greşită.
  useLayoutEffect(() => {
    if (!rand) return
    const lat = window.matchMedia('(min-width: 1024px)')

    const masoara = () => {
      if (!lat.matches) {
        setLatura(null)
        return
      }
      const { width, height } = rand.getBoundingClientRect()
      const l = Math.floor(Math.min(height, width - latimePanou))
      setLatura(l > 0 ? l : null)
    }

    masoara()
    const observator = new ResizeObserver(masoara)
    observator.observe(rand)
    lat.addEventListener('change', masoara)
    return () => {
      observator.disconnect()
      lat.removeEventListener('change', masoara)
    }
  }, [rand, latimePanou])

  return latura
}
