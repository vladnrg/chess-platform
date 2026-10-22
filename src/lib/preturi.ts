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

/**
 * Garanţia: banii înapoi integral, fără întrebări, în primele 7 zile de la
 * PRIMUL abonament. Reînnoirile nu intră, iar cine a primit o dată banii înapoi
 * nu mai are garanţie — ca la Chessly şi Chess Tempo.
 *
 * A înlocuit „60 de zile, dacă nu progresezi" (cea mai lungă de pe piaţă şi
 * singura cu o condiţie, iar „progres" e exact lucrul despre care te cerţi).
 * Separat de ea, la plată omul renunţă expres la dreptul legal de retragere
 * de 14 zile (OUG 34/2014, art. 16 lit. m) — vezi PricingPage.
 */
export const GARANTIE_ZILE = 7

export function pret(suma: number): string {
  return `${suma} ${MONEDA}`
}
