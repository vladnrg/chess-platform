/**
 * Pragurile de vârstă, într-un singur loc. Sunt două, cu temeiuri diferite:
 *
 *  - 16 ani: acordul părintelui pentru datele copilului. În România vârsta
 *    consimţământului digital e 16 (GDPR art. 8). Sub ea contul rămâne blocat
 *    până confirmă părintele. Acelaşi prag e scris în baza de date (migrarea 115,
 *    `handle_new_user` şi `seteaza_varsta`) — cele două trebuie să rămână egale.
 *
 *  - 14 ani: plata şi sesiunile cu pauze. Sub 14 ani copilul nu poate încheia
 *    singur contracte (Codul civil), deci abonamentul îl plăteşte părintele.
 *
 * Vârsta se calculează doar din an, ca în baza de date.
 */
export const VARSTA_ACORD_PARINTE = 16
export const VARSTA_COPIL = 14

export function varstaDin(anNastere: number | null | undefined): number | null {
  return anNastere == null ? null : new Date().getFullYear() - anNastere
}

export function areNevoieDeAcord(anNastere: number | null | undefined): boolean {
  const v = varstaDin(anNastere)
  return v !== null && v < VARSTA_ACORD_PARINTE
}

export function esteCopil(anNastere: number | null | undefined): boolean {
  const v = varstaDin(anNastere)
  return v !== null && v < VARSTA_COPIL
}
