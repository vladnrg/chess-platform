/**
 * Începutul fiecărui capitol: bun venit (doar la primul), o frază despre capitol
 * şi mutările care îl definesc, jucate pe mini-tabla de lângă text.
 *
 * Cerut pe 2026-11-24. Nimic de aici nu e scris în baza de date în afară de
 * textul de bun venit al cursului (`courses.bun_venit`): mutările şi procentul
 * se calculează, ca să fie adevărate pe orice curs şi pentru orice nivel.
 */
import { Chess } from 'chess.js'
import { translateNotation } from './chess-translations'
import { procentPeNivel, type Nivel } from './capitole-curs'
import type { OpeningLine } from '@/types'

type LinieMinima = Pick<OpeningLine, 'id' | 'moves_uci'>

/**
 * Mutările comune întregului capitol: până la cea care îl deosebeşte de
 * celelalte capitole ale cursului, inclusiv ea. La „3…h6": 1.e4 e5 2.Cf3 Cc6
 * 3.Nc4 h6 — nimic din ce urmează în studiu.
 *
 * Se calculează din capitolele cursului, nu se scriu de mână: aşa merge pe
 * toate cursurile, iar un capitol nou mută singur punctul de despărţire.
 */
export function mutariDefinitorii(linie: LinieMinima, toate: LinieMinima[]): string[] {
  const mutari = linie.moves_uci.split(' ').filter(Boolean)
  let comun = -1
  for (const alta of toate) {
    if (alta.id === linie.id) continue
    const altele = alta.moves_uci.split(' ')
    let k = 0
    while (k < mutari.length && k < altele.length && mutari[k] === altele[k]) k++
    comun = Math.max(comun, k)
  }
  // Un curs cu un singur capitol n-are de ce se despărţi: primele mutări ajung.
  if (comun < 0) return mutari.slice(0, Math.min(mutari.length, 6))
  return mutari.slice(0, Math.min(mutari.length, comun + 1))
}

/** Mutările în notaţia românească, numerotate: „1.e4 e5 2.Cf3 Cc6 3.Nc4 h6". */
export function notatie(uci: string[]): string {
  const joc = new Chess()
  const parti: string[] = []
  uci.forEach((u, i) => {
    const m = joc.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] })
    const san = translateNotation(m.san)
    const nr = Math.floor(i / 2) + 1
    parti.push(i % 2 === 0 ? `${nr}.${san}` : san)
  })
  return parti.join(' ')
}

/** Cele patru formulări date de utilizator, prin rotaţie, ca să nu se repete. */
const FORMULARI = [
  (t: string) => `ne vom concentra pe capitolul „${t}”`,
  (t: string) => `ne vom axa pe capitolul „${t}”`,
  (t: string) => `vom oferi toată atenţia noastră capitolului „${t}”`,
  (t: string) => `vom intra în capitolul „${t}”`,
]

/**
 * Paragrafele de la începutul capitolului: bun venitul (dacă e primul capitol
 * în ordinea nivelului tău) şi fraza despre capitol.
 *
 * Procentul e al nivelului tău. Unde capitolul se deosebeşte printr-o mutare a
 * TA (Pianissimo e 5.d3 după 3…Nc5), procentul e al mutării adversarului de la
 * care porneşte, şi fraza o spune pe faţă — altfel ar părea că alegerea ta
 * „se întâmplă" în 28% din partide.
 */
export function introCapitol({
  linie, toate, nivel, index, bunVenit,
}: {
  linie: Pick<OpeningLine, 'id' | 'moves_uci' | 'variation_name' | 'user_color' | 'popularity_pct' | 'grup' | 'popularitate_niveluri'>
  toate: LinieMinima[]
  nivel: Nivel
  /** Locul capitolului în ordinea nivelului tău, de la 0. */
  index: number
  bunVenit?: string | null
}): string[] {
  const paragrafe = (bunVenit ?? '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)

  const mutari = mutariDefinitorii(linie, toate)
  const p = procentPeNivel(linie, nivel)
  const cat = p < 1 ? 'în mai puţin de 1%' : `în aproximativ ${Math.round(p)}%`
  const unde = linie.popularitate_niveluri ? 'din partidele de la nivelul tău' : 'din partidele jucătorilor de 1000–2000'
  const ultimaEATa = (mutari.length - 1) % 2 === (linie.user_color === 'white' ? 0 : 1)

  const desprePopularitate = linie.grup && linie.popularitate_niveluri && ultimaEATa
    ? `Această variantă apare după mutările ${notatie(mutari)}. La ${linie.grup}, mutarea adversarului de la care porneşte, se ajunge ${cat} ${unde}.`
    : `Această variantă apare după mutările ${notatie(mutari)} şi se întâmplă ${cat} ${unde}.`

  paragrafe.push(`În cele ce urmează, ${FORMULARI[index % FORMULARI.length](linie.variation_name)}. ${desprePopularitate}`)
  return paragrafe
}
