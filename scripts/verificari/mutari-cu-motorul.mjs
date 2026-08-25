/**
 * Mutarea pe care o cere lecţia e chiar o mutare bună?
 *
 * Verificarea din `exercitii-lectii.mjs` întreabă doar dacă mutarea e primită
 * de aplicaţie. Asta e altceva: întreabă motorul dacă mutarea e şi *bună*.
 *
 * A apărut fiindcă la „Promovarea pionului" cerinţa era „promovează pionul
 * liber", iar mutarea cerută dădea dama pe loc: turnul negru ţinea tot rândul
 * opt, deci lua noua damă. Poziţia era −4,23 pentru alb înainte de mutare, şi
 * nimic din cod n-avea cum să observe — exerciţiul „funcţiona".
 *
 * Fiecare mutare cerută se compară cu cea mai bună mutare din poziţie — nu la
 * cifră, ci la deznodământ. „+5" în loc de „+8" e tot partidă câştigată şi nu
 * spune nimic; ce se semnalează e mutarea care schimbă rezultatul: din câştig
 * face egal, sau din egal face pierdere.
 *
 *   node --experimental-strip-types --import ./scripts/verificari/register.mjs \
 *        scripts/verificari/mutari-cu-motorul.mjs
 *
 * Durează câteva minute: motorul se gândeşte la fiecare poziţie.
 */
import { readFileSync } from 'node:fs'
import { Chess } from 'chess.js'
import { analizeaza, scrieScor } from './motor.mjs'

const ADANCIME = 18
/** De la cât în sus poziţia se cheamă câştigată. Sub minus atâta, pierdută. */
const PRAG = 250

const env = Object.fromEntries(
  readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => l.includes('='))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
)

/** Evaluarea ca un singur număr, ca să se poată compara mat cu centipioni. */
function caPuncte(r) {
  if (!r) return null
  if (r.fel !== 'mate') return r.scor
  return r.scor > 0 ? 100000 - r.scor * 100 : -100000 - r.scor * 100
}

/**
 * Cum se termină, dacă amândoi joacă bine: câştig, egal sau pierdere.
 *
 * Se compară deznodământul, nu cifra. Altfel ar cădea şi mutări bune: după
 * promovare motorul dă „+5" acolo unde înainte dădea „+8", fiindcă vede alt
 * drum spre acelaşi mat — iar asta nu e o greşeală, e aceeaşi partidă câştigată.
 * Ce contează la o lecţie e dacă mutarea cerută schimbă rezultatul.
 */
function deznodamant(puncte) {
  if (puncte === null) return 'egal'
  if (puncte >= PRAG) return 'câştig'
  if (puncte <= -PRAG) return 'pierdere'
  return 'egal'
}

const ORDINE = { pierdere: 0, egal: 1, 'câştig': 2 }

const lectii = await (await fetch(
  `${env.VITE_SUPABASE_URL}/rest/v1/lessons?select=title,exercises&order=order_index`,
  { headers: { apikey: env.VITE_SUPABASE_ANON_KEY } },
)).json()

let verificate = 0
const nevazute = []
const slabe = []

for (const lectie of lectii) {
  for (const ex of lectie.exercises ?? []) {
    if (ex.type !== 'move_piece' || !ex.fen) continue

    const pasi = ex.line ?? (ex.correct_move ? [{ move: ex.correct_move }] : [])
    if (pasi.length === 0) continue

    let joc
    try {
      joc = new Chess(ex.fen)
    } catch {
      // Tablă de învăţat, fără regi: motorul n-o primeşte, deci nu se poate
      // spune nimic despre ce e bine acolo. Se raportează, nu se trece cu vederea.
      nevazute.push({ lectie: lectie.title, ex, motiv: 'poziţie fără regi' })
      continue
    }

    for (const pas of pasi) {
      verificate++
      const fenulPasului = joc.fen()
      const inainte = await analizeaza(fenulPasului, { adancime: ADANCIME })
      const ceruta = pas.move

      joc.move({ from: ceruta.slice(0, 2), to: ceruta.slice(2, 4), promotion: ceruta.slice(4) || undefined })

      // Evaluarea de după e din partea celuilalt; o întorc, ca să fie tot din
      // partea celui care tocmai a mutat.
      const dupa = joc.isGameOver() ? null : await analizeaza(joc.fen(), { adancime: ADANCIME })
      const celMaiBun = caPuncte(inainte[0])
      const obtinut = joc.isCheckmate() ? 100000 : dupa ? -caPuncte(dupa[0]) : 0

      const cerutaDa = deznodamant(joc.isCheckmate() ? 100000 : obtinut)
      const ceaMaiBunaDa = deznodamant(celMaiBun)
      if (ORDINE[cerutaDa] < ORDINE[ceaMaiBunaDa]) {
        slabe.push({
          lectie: lectie.title,
          ex,
          pas,
          fen: fenulPasului,
          celMaiBun: inainte[0],
          mutareaBuna: inainte[0].linie[0],
          obtinut,
          cerutaDa,
          ceaMaiBunaDa,
        })
      }

      if (pas.reply) {
        joc.move({ from: pas.reply.slice(0, 2), to: pas.reply.slice(2, 4), promotion: pas.reply.slice(4) || undefined })
      }
    }
  }
}

console.log(`Mutări cerute de lecţii, trecute prin motor: ${verificate}`)
if (nevazute.length) {
  console.log(`\nPoziţii pe care motorul nu le poate judeca: ${nevazute.length}`)
  for (const n of nevazute) console.log(`  [${n.lectie}] ${n.ex.instruction} — ${n.motiv}`)
}

if (slabe.length === 0) {
  console.log('\nToate mutările cerute sunt mutări bune. ✓')
} else {
  console.log(`\nMUTĂRI CERUTE CARE PIERD: ${slabe.length}\n`)
  for (const s of slabe) {
    console.log(`  [${s.lectie}] ${s.pas.instruction ?? s.ex.instruction}`)
    console.log(`     poziţia: ${s.fen}`)
    console.log(`     cerută:       ${s.pas.move.padEnd(6)} → ${(s.obtinut / 100).toFixed(2).padStart(7)}  (${s.cerutaDa})`)
    console.log(`     cea mai bună: ${s.mutareaBuna.padEnd(6)} → ${scrieScor(s.celMaiBun).padStart(7)}  (${s.ceaMaiBunaDa})\n`)
  }
  process.exitCode = 1
}
