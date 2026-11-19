import { useLayoutEffect, useState } from 'react'

/**
 * Aşezarea „tablă + panou" a tuturor cursurilor (deschideri şi lecţiile de bază).
 *
 * Ca la Chessly, tabla şi panoul din dreapta formează un singur bloc, centrat pe
 * ecran, iar antetul de deasupra are exact lăţimea blocului. Numerele stau aici,
 * într-un singur loc, ca paginile de curs să nu se depărteze una de alta.
 */

/** Lăţimea panoului din dreapta tablei (21rem), în pixeli. */
export const LATIME_PANOU = 336
/** Spaţiul dintre tablă şi panou (1rem), în pixeli. */
export const SPATIU_TABLA_PANOU = 16
/**
 * Latura maximă a tablei, în pixeli de pagină. Fără plafon, la zoom 50% tabla
 * creştea de două ori şi umplea iar ecranul; cu el, se micşorează odată cu
 * restul paginii, ca la Chessly. La zoom 100% contează doar pe ecrane foarte înalte.
 */
export const LATURA_MAXIMA = 920

/**
 * Latura tablei, calculată din spaţiul în care stă ea alături de panou: fie din
 * înălţimea rămasă, fie din lăţimea rămasă după panou — care dintre ele e mai
 * mică — dar nu peste `LATURA_MAXIMA`.
 *
 * Întoarce `null` sub `lg` (telefon, tabletă îngustă): acolo panoul stă sub
 * tablă, iar tabla ia toată lăţimea, fără niciun calcul.
 */
export function useLaturaTablei(
  /** Rândul care ţine tabla şi panoul (cel care se întinde pe înălţimea rămasă). */
  rand: HTMLElement | null,
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
      // Fără padding: spaţiul liber de sub tablă e pus ca padding pe rând.
      const stil = getComputedStyle(rand)
      const inaltime = rand.clientHeight - parseFloat(stil.paddingTop) - parseFloat(stil.paddingBottom)
      const latime = rand.clientWidth - parseFloat(stil.paddingLeft) - parseFloat(stil.paddingRight)
      const l = Math.floor(Math.min(inaltime, latime - LATIME_PANOU - SPATIU_TABLA_PANOU, LATURA_MAXIMA))
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
  }, [rand])

  return latura
}
