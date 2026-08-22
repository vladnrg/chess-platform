/**
 * Mutarea pe care tocmai a făcut-o adversarul, arătată pe tabla exerciţiului.
 *
 * Exerciţiile de lecţie dau o poziţie, nu o partidă: omul vede tabla aşa cum e
 * ACUM şi n-are de unde şti ce s-a întâmplat cu o clipă înainte. La aproape
 * toate lecţiile nu contează. La en passant contează tot: regula spune că poţi
 * captura pionul care tocmai a trecut cu două pătrate pe lângă al tău, iar
 * „tocmai" nu se vede nicăieri pe tablă. Aceeaşi poziţie, cu pionul ajuns acolo
 * cu o mutare mai devreme, nu mai permite captura — şi arată identic.
 *
 * De unde ştim mutarea:
 *   1. din câmpul de en passant al FEN-ului (`… w KQkq d6 0 3`), care există
 *      exact fiindcă un pion tocmai a fost împins cu două pătrate: `d6` spune
 *      că pionul negru a plecat de pe d7 şi stă acum pe d5;
 *   2. din `last_move` scris în exerciţiu (`"d7d5"`), pentru poziţiile în care
 *      ultima mutare a adversarului merită văzută, dar n-a fost o împingere de
 *      pion — acolo FEN-ul nu ţine minte nimic.
 *
 * Culorile sunt aceleaşi cu ale antrenorului de deschideri: pătratul de plecare
 * palid, cel de sosire mai aprins. Tabla trebuie să vorbească aceeaşi limbă în
 * toată aplicaţia.
 */
import type { CSSProperties } from 'react'
import { defaultArrowOptions } from 'react-chessboard'
import { piesaDePe } from './mutare-pe-tabla'

export interface UltimaMutare {
  /** De pe ce pătrat a plecat piesa. */
  de: string
  /** Pe ce pătrat stă acum. */
  la: string
  /** Cine a mutat-o. */
  culoare: 'w' | 'b'
  /** Numele piesei, aşa cum se spune în română: „pionul", „tura"… */
  piesa: string
  /** Pion împins cu două pătrate — adică fix mutarea care deschide en passant. */
  impinsDoua: boolean
}

const PATRAT = /^[a-h][1-8]$/

const NUME_PIESE: Record<string, string> = {
  p: 'pionul',
  r: 'tura',
  n: 'calul',
  b: 'nebunul',
  q: 'regina',
  k: 'regele',
}

/**
 * Ultima mutare a adversarului, sau `null` dacă poziţia nu spune nimic despre ea.
 *
 * `declarata` (`"d7d5"`) bate întotdeauna deducerea din FEN.
 */
export function citesteUltimaMutare(
  fen: string | undefined,
  declarata?: string,
): UltimaMutare | null {
  if (!fen) return null

  const mutare = declarata ? dinNotatie(declarata) : dinEnPassant(fen)
  if (!mutare) return null

  // Piesa se citeşte de pe tablă, nu se presupune: dacă pe pătratul de sosire nu
  // stă nimic, mutarea declarată nu se potriveşte cu poziţia şi e mai bine să nu
  // arătăm nimic decât să arătăm o săgeată care porneşte din senin.
  const piesa = piesaDePe(fen, mutare.la)
  if (!piesa) return null

  const litera = piesa.toLowerCase()
  return {
    ...mutare,
    culoare: piesa === piesa.toUpperCase() ? 'w' : 'b',
    piesa: NUME_PIESE[litera] ?? 'piesa',
    impinsDoua: litera === 'p' && Math.abs(Number(mutare.la[1]) - Number(mutare.de[1])) === 2,
  }
}

/** `"d7d5"` → pătratele. Litera de promovare de la capăt, dacă e, se ignoră. */
function dinNotatie(text: string): { de: string; la: string } | null {
  const de = text.slice(0, 2)
  const la = text.slice(2, 4)
  return PATRAT.test(de) && PATRAT.test(la) ? { de, la } : null
}

/**
 * Împingerea de pion scrisă în câmpul de en passant al FEN-ului.
 *
 * Câmpul ţine pătratul PESTE care a sărit pionul: `d6` pentru negru (a plecat de
 * pe d7, e pe d5), `e3` pentru alb (de pe e2, e pe e4). Deci se poate reface
 * mutarea întreagă din el, fără să mai fie scrisă nicăieri de mână.
 */
function dinEnPassant(fen: string): { de: string; la: string } | null {
  const camp = fen.split(' ')[3]
  if (!camp || camp.length !== 2) return null

  const coloana = camp[0]
  if (!PATRAT.test(camp)) return null
  if (camp[1] === '6') return { de: `${coloana}7`, la: `${coloana}5` }
  if (camp[1] === '3') return { de: `${coloana}2`, la: `${coloana}4` }
  return null
}

/** Cele două pătrate colorate, gata de dat lui `squareStyles`. */
export function stilulUltimeiMutari(mutare: UltimaMutare | null): Record<string, CSSProperties> {
  if (!mutare) return {}
  return {
    [mutare.de]: { backgroundColor: 'rgba(226,179,64,0.25)' },
    [mutare.la]: { backgroundColor: 'rgba(226,179,64,0.4)' },
  }
}

/**
 * Săgeata de la plecare la sosire.
 *
 * Pătratele colorate spun „aici s-a întâmplat ceva", săgeata spune în ce sens.
 * La en passant chiar trece prin pătratul pe care va ateriza pionul care
 * capturează — adică desenează exact drumul „în trecere" al regulii.
 */
export function sagetileUltimeiMutari(mutare: UltimaMutare | null) {
  return mutare ? [{ startSquare: mutare.de, endSquare: mutare.la, color: '#E2B340' }] : []
}

/**
 * Cât de gros şi cât de lung se desenează.
 *
 * Săgeata implicită a bibliotecii e lată cât o cincime de pătrat şi merge până
 * în mijlocul pătratului de sosire — adică fix peste pionul pe care omul trebuie
 * să-l vadă, fiindcă pe el urmează să-l captureze. Mai subţire, şi oprită
 * înainte de piesă: arată spre pătrat, nu peste el.
 */
export const OPTIUNI_SAGEATA = {
  ...defaultArrowOptions,
  arrowWidthDenominator: 9,
  arrowLengthReducerDenominator: 3,
  opacity: 0.8,
}

/** Aceeaşi mutare, spusă în cuvinte — pentru cine nu prinde culorile de pe tablă. */
export function descrieUltimaMutare(mutare: UltimaMutare): string {
  const cine = mutare.culoare === 'w' ? 'Albul' : 'Negrul'
  const verb = mutare.impinsDoua ? 'a împins' : 'a mutat'
  return `${cine} tocmai ${verb} ${mutare.piesa} de pe ${mutare.de} pe ${mutare.la}`
}
