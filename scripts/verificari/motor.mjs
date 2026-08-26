/**
 * Stockfish, cu un capăt de aţă la care se poate trage din Node.
 *
 * Există fiindcă afirmaţiile de şah din cursuri nu se verifică din ochi. „Doar
 * unul dintre pioni poate ajunge la capăt, promovează-l pe cel liber" suna
 * convingător şi era o mutare care pierde dama pe loc: motorul dădea −4,23
 * pentru alb în poziţia aceea, iar cea mai bună mutare nici măcar nu era
 * promovarea.
 *
 * Motorul e cel din `node_modules` (varianta `lite-single`), acelaşi pe care îl
 * foloseşte şi aplicaţia în browser — deci nu trebuie instalat nimic în plus.
 */
import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const RADACINA = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const EXE = join(RADACINA, 'node_modules/.bin/stockfish.cmd')

function porneste() {
  const p = spawn(EXE, [], { stdio: ['pipe', 'pipe', 'inherit'], shell: true })
  p.stdin.setDefaultEncoding('utf8')
  p.stdout.setEncoding('utf8')

  let tampon = ''
  const asteptari = []
  p.stdout.on('data', d => {
    tampon += d
    const linii = tampon.split(/\r?\n/)
    tampon = linii.pop()
    for (const l of linii) {
      for (const a of [...asteptari]) {
        if (a.test(l)) {
          asteptari.splice(asteptari.indexOf(a), 1)
          a.gata(l)
        }
      }
    }
  })

  return {
    p,
    zi: s => p.stdin.write(s + '\n'),
    asteapta: rx => new Promise(gata => asteptari.push({ test: l => rx.test(l), gata })),
  }
}

/**
 * Ce spune motorul despre o poziţie, din punctul de vedere al celui la mutare.
 *
 * Întoarce câte o intrare pentru fiecare variantă cerută, cea mai bună prima:
 * `{ fel: 'cp' | 'mate', scor, linie }`. Lista e goală dacă motorul refuză
 * poziţia — se întâmplă la tablele de învăţat, care n-au regi pe ele.
 *
 * Două scoruri se pot compara doar dacă vin din ACEEAŞI chemare. La aceeaşi
 * adâncime, motorul vede matul când se uită la o singură mutare şi nu-l vede
 * când le cântăreşte pe toate deodată — deci „mat în −15" dintr-o căutare pus
 * lângă „−58.84" din alta nu spune nimic. Când ai nevoie de scorul unei mutări
 * anume, cere `variante` cât să încapă şi ea în listă.
 */
export async function analizeaza(fen, { adancime = 26, variante = 1 } = {}) {
  const m = porneste()
  m.zi('uci')
  await m.asteapta(/^uciok/)
  m.zi(`setoption name MultiPV value ${variante}`)
  m.zi('isready')
  await m.asteapta(/^readyok/)
  m.zi(`position fen ${fen}`)

  const rezultate = new Map()
  const asculta = d => {
    for (const l of d.split(/\r?\n/)) {
      const md = l.match(/^info depth (\d+).*?score (cp|mate) (-?\d+).*? pv (.+)$/)
      if (!md) continue
      const mv = l.match(/multipv (\d+)/)
      rezultate.set(mv ? Number(mv[1]) : 1, {
        adancime: Number(md[1]),
        fel: md[2],
        scor: Number(md[3]),
        linie: md[4].trim().split(' '),
      })
    }
  }
  m.p.stdout.on('data', asculta)
  m.zi(`go depth ${adancime}`)
  await m.asteapta(/^bestmove/)
  m.p.stdout.off('data', asculta)
  m.zi('quit')

  return [...rezultate.entries()].sort((a, b) => a[0] - b[0]).map(([nr, r]) => ({ nr, ...r }))
}

/** Evaluarea în cuvinte: „mat în 7" sau „+2.31". */
export function scrieScor(r) {
  if (!r) return '?'
  if (r.fel === 'mate') return `mat în ${r.scor}`
  return `${r.scor > 0 ? '+' : ''}${(r.scor / 100).toFixed(2)}`
}

/** Câştigă cel care e la mutare, fără îndoială? Mat, sau peste 5 pioni în plus. */
export function eCastigat(r) {
  if (!r) return false
  return r.fel === 'mate' ? r.scor > 0 : r.scor >= 500
}
