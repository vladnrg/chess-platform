/**
 * O bucată dreptunghiulară de tablă, arătată ca un întreg.
 *
 * Există pentru lucrurile care nu se pot spune arătând un pătrat sau o mutare,
 * fiindcă sunt despre o *zonă*. La cursa dintre pion şi regele advers, tot
 * răspunsul e „regele nu e unde ar trebui să fie": pionul de pe e6 are două
 * împingeri până la capăt, iar regele îl mai poate prinde doar dacă stă deja
 * înăuntrul pătratului din faţa pionului. Pe tablă asta nu se vede din piese —
 * se vede numărând, iar un copil nu numără pătrate din proprie iniţiativă.
 * Desenat, se vede dintr-o privire: regele e afară.
 *
 * Zona se scrie cu două colţuri opuse, `"c6:g8"`, ca un interval. Restul
 * pătratelor se completează singure. Marginea se desenează doar pe laturile din
 * afară, ca să iasă un dreptunghi, nu cincisprezece pătrate colorate — iar
 * laturile se întorc odată cu tabla, altfel chenarul ar cădea pe dinăuntru la
 * exerciţiile jucate din partea negrului.
 */
import type { CSSProperties } from 'react'

const PATRAT = /^[a-h][1-8]$/
const COLOANE = 'abcdefgh'

/** Acelaşi galben ca al ultimei mutări, dar mai palid: e fundal, nu subiect. */
const UMPLERE = 'rgba(226,179,64,0.15)'
const MARGINE = 'rgba(226,179,64,0.7)'
const GROSIME = '3px'

/** Pătratele zonei, gata de dat lui `squareStyles`. */
export function stilulZonei(
  zona: string | undefined,
  orientare: 'white' | 'black' = 'white',
): Record<string, CSSProperties> {
  const colturi = zona?.split(':')
  if (!colturi || colturi.length !== 2) return {}

  const [unul, altul] = colturi
  if (!PATRAT.test(unul) || !PATRAT.test(altul)) return {}

  const coloane = [COLOANE.indexOf(unul[0]), COLOANE.indexOf(altul[0])]
  const randuri = [Number(unul[1]), Number(altul[1])]
  const cMin = Math.min(...coloane)
  const cMax = Math.max(...coloane)
  const rMin = Math.min(...randuri)
  const rMax = Math.max(...randuri)

  // Cu negrul jos, rândul 8 e în josul ecranului şi coloana a în dreapta lui:
  // latura „de sus" a dreptunghiului trebuie desenată pe partea cealaltă.
  const rasturnata = orientare === 'black'
  const sus = rasturnata ? `inset 0 -${GROSIME} 0 0 ${MARGINE}` : `inset 0 ${GROSIME} 0 0 ${MARGINE}`
  const jos = rasturnata ? `inset 0 ${GROSIME} 0 0 ${MARGINE}` : `inset 0 -${GROSIME} 0 0 ${MARGINE}`
  const stanga = rasturnata ? `inset -${GROSIME} 0 0 0 ${MARGINE}` : `inset ${GROSIME} 0 0 0 ${MARGINE}`
  const dreapta = rasturnata ? `inset ${GROSIME} 0 0 0 ${MARGINE}` : `inset -${GROSIME} 0 0 0 ${MARGINE}`

  const stiluri: Record<string, CSSProperties> = {}
  for (let c = cMin; c <= cMax; c++) {
    for (let r = rMin; r <= rMax; r++) {
      const laturi: string[] = []
      if (r === rMax) laturi.push(sus)
      if (r === rMin) laturi.push(jos)
      if (c === cMin) laturi.push(stanga)
      if (c === cMax) laturi.push(dreapta)

      stiluri[`${COLOANE[c]}${r}`] = {
        backgroundColor: UMPLERE,
        ...(laturi.length > 0 && { boxShadow: laturi.join(', ') }),
      }
    }
  }
  return stiluri
}
