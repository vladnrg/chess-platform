/**
 * Preţurile abonamentului Pro, într-un singur loc.
 *
 * Patru pagini afişează preţuri (prezentarea, cele două pagini de vânzare şi
 * pagina de preţuri). Fiecare îşi ţinea propriile cifre şi ajunseseră trei
 * variante diferite — $9.99, €9.99 şi €98 pe an — niciuna cea din Stripe.
 *
 * Suma încasată de fapt o hotărăşte preţul din Stripe (secretele
 * STRIPE_MONTHLY_PRICE_ID / STRIPE_ANNUAL_PRICE_ID ale funcţiilor). Cifrele de
 * aici trebuie schimbate odată cu acela.
 */

export const PRET_LUNAR = 24
export const PRET_ANUAL = 199
export const MONEDA = 'lei'

/** Cât economiseşte anualul faţă de douăsprezece plăţi lunare: 89 lei. */
export const ECONOMIE_ANUALA = PRET_LUNAR * 12 - PRET_ANUAL

/** Economia, în luni de abonament: 89 / 24 ≈ 3,7 — „aproape 4". */
export const LUNI_ECONOMISITE = Math.ceil(ECONOMIE_ANUALA / PRET_LUNAR)

export function pret(suma: number): string {
  return `${suma} ${MONEDA}`
}
