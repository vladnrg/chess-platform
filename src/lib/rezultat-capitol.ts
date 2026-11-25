/**
 * Rezultatul exersărilor unui capitol: pentru fiecare variantă (cheia e
 * indexul ei, de la 0), dacă ai jucat-o fără greşeală şi cât ţi-a luat. Din el se
 * face fereastra de la finalul capitolului (cerută pe 2026-11-25, după Chessly):
 * câte exersări perfecte, timpul, şi „Refă exersările greşite".
 *
 * Stă în localStorage, nu în baza de date: e rezumatul unei treceri, nu un
 * progres de păstrat. Fiecare exersare terminată îşi suprascrie varianta.
 */

export interface RezultatParte {
  /** Fără nicio mutare greşită şi fără „Soluţie". */
  perfect: boolean
  /** Durata exersării, în milisecunde. */
  ms: number
}

export type RezultatCapitol = Record<string, RezultatParte>

const cheie = (lineId: string) => `rezultat-capitol:${lineId}`

export function citesteRezultat(lineId: string): RezultatCapitol {
  try {
    const brut = localStorage.getItem(cheie(lineId))
    return brut ? (JSON.parse(brut) as RezultatCapitol) : {}
  } catch {
    return {}
  }
}

export function salveazaVarianta(lineId: string, varianta: number, rezultat: RezultatParte): RezultatCapitol {
  const tot = { ...citesteRezultat(lineId), [String(varianta)]: rezultat }
  try {
    localStorage.setItem(cheie(lineId), JSON.stringify(tot))
  } catch {
    // Spaţiu plin sau navigare privată: fereastra merge şi fără să ţină minte.
  }
  return tot
}

/** „20:58" — minute şi secunde. */
export function formatDurata(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
