/**
 * Cum arată tabla după o mutare — inclusiv pe tablele de învăţat.
 *
 * `chess.js` refuză din start orice poziţie fără cei doi regi: aruncă
 * „Invalid FEN: missing white king" încă din constructor, înainte să apuce
 * cineva să mute ceva. Iar tablele din lecţii au pe ele exact piesa despre care
 * e lecţia — „mută tura de la a1 la h1" stă pe `8/8/8/8/8/8/8/R7`, fără regi,
 * fiindcă un rege acolo n-ar face decât să distragă.
 *
 * Rezultatul: 14 exerciţii din cursul de mişcare a pieselor răspundeau „Nu e
 * mutarea potrivită" la mutarea potrivită. Excepţia era înghiţită de un `catch`
 * gol, aşa că nu se vedea nici în consolă.
 *
 * Deci: `chess.js` acolo unde poziţia chiar e o partidă (ştie rocada, en
 * passant, promovarea, capturile), iar unde nu e, mutăm piesa direct în şirul
 * FEN. Ce e corect şi ce nu **nu se decide aici** — lecţia îşi declară singură
 * mutarea aşteptată. Funcţia asta răspunde doar la „cum arată tabla după".
 */
import { Chess } from 'chess.js'

const COLOANE = 'abcdefgh'

/**
 * Poziţia de după mutare, sau `null` dacă mutarea n-are sens pe tabla dată.
 *
 * `promovare` se foloseşte doar când un pion ajunge la capăt.
 */
export function aplicaMutarea(
  fen: string,
  de: string,
  la: string,
  promovare = 'q',
): string | null {
  // Întâi încercăm ca partidă adevărată. Dacă poziţia se încarcă, tot ce
  // urmează e treaba lui chess.js — inclusiv verdictul că mutarea e ilegală.
  let joc: Chess | undefined
  try {
    joc = new Chess(fen)
  } catch {
    // Poziţie de învăţat, nu partidă: `joc` rămâne nedefinit şi mutăm de mână.
  }

  if (joc) {
    try {
      return joc.move({ from: de, to: la, promotion: promovare }) ? joc.fen() : null
    } catch {
      return null // mutare ilegală într-o poziţie legală: chiar e greşită
    }
  }

  return mutaInSir(fen, de, la, promovare)
}

/** Numărul pătratului în tabloul de 64, numărat de la a8 (0) la h1 (63). */
function indexPatrat(patrat: string): number | null {
  const coloana = COLOANE.indexOf(patrat[0])
  const rand = Number(patrat[1])
  if (coloana < 0 || !Number.isInteger(rand) || rand < 1 || rand > 8) return null
  return (8 - rand) * 8 + coloana
}

/** Cele 64 de pătrate din partea de tablă a unui FEN, cu `''` pentru cele goale. */
function desfaTabla(tabla: string): string[] | null {
  const randuri = tabla.split('/')
  if (randuri.length !== 8) return null
  const patrate: string[] = []
  for (const rand of randuri) {
    let cate = 0
    for (const semn of rand) {
      if (semn >= '1' && semn <= '8') {
        const goale = Number(semn)
        for (let i = 0; i < goale; i++) patrate.push('')
        cate += goale
      } else {
        patrate.push(semn)
        cate++
      }
    }
    if (cate !== 8) return null
  }
  return patrate
}

/** Drumul înapoi: din 64 de pătrate în notaţia prescurtată a FEN-ului. */
function strangeTabla(patrate: string[]): string {
  const randuri: string[] = []
  for (let rand = 0; rand < 8; rand++) {
    let text = ''
    let goale = 0
    for (let coloana = 0; coloana < 8; coloana++) {
      const piesa = patrate[rand * 8 + coloana]
      if (piesa === '') {
        goale++
        continue
      }
      if (goale) {
        text += goale
        goale = 0
      }
      text += piesa
    }
    if (goale) text += goale
    randuri.push(text)
  }
  return randuri.join('/')
}

/**
 * Mutarea pe o tablă de învăţat: ia piesa de pe un pătrat şi o pune pe altul.
 *
 * Ce e pe pătratul de sosire dispare — adică exact captura, care în lecţii se
 * învaţă pe „atacă pionul de pe d8". Rocada şi en passant nu ajung aici: ele au
 * nevoie de regi pe tablă, deci poziţia e legală şi le ia chess.js.
 */
function mutaInSir(fen: string, de: string, la: string, promovare: string): string | null {
  const parti = fen.split(' ')
  const patrate = desfaTabla(parti[0])
  if (!patrate) return null

  const iDe = indexPatrat(de)
  const iLa = indexPatrat(la)
  if (iDe === null || iLa === null) return null

  const piesa = patrate[iDe]
  if (!piesa) return null // nu e nimic de mutat de acolo

  const eAlb = piesa === piesa.toUpperCase()
  const ajungeLaCapat = eAlb ? iLa < 8 : iLa >= 56
  patrate[iLa] = piesa.toLowerCase() === 'p' && ajungeLaCapat
    ? (eAlb ? promovare.toUpperCase() : promovare.toLowerCase())
    : piesa
  patrate[iDe] = ''

  parti[0] = strangeTabla(patrate)
  if (parti[1]) parti[1] = parti[1] === 'w' ? 'b' : 'w'
  if (parti[3]) parti[3] = '-' // orice mutare obişnuită închide fereastra de en passant
  return parti.join(' ')
}

/**
 * Ce piesă stă pe un pătrat, în litera din FEN (`P` pion alb, `n` cal negru…).
 *
 * `null` dacă pătratul e gol sau dacă nu există. Folosită de „ultima mutare",
 * ca să afle cine a mutat şi ce anume — fără să mai desfacă o dată FEN-ul.
 */
export function piesaDePe(fen: string, patrat: string): string | null {
  const patrate = desfaTabla(fen.split(' ')[0])
  const i = indexPatrat(patrat)
  if (!patrate || i === null) return null
  return patrate[i] || null
}
