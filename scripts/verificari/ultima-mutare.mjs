/**
 * Ce exerciţii din baza reală arată acum ultima mutare a adversarului — şi e ea
 * chiar mutarea potrivită?
 *
 * Mutarea nu e scrisă nicăieri: se deduce din câmpul de en passant al FEN-ului.
 * Deci se poate deduce şi greşit, tăcut, fără să pice nimic la compilare — o
 * săgeată care porneşte dintr-un pătrat gol sau de la piesa nepotrivită ar
 * încurca exact copilul pe care ar trebui să-l ajute.
 *
 * Verificarea ia fiecare exerciţiu din baza reală, cere aplicaţiei ultima
 * mutare şi o pune la trei încercări, citind tabla singură din şirul FEN:
 *   - pe pătratul de sosire chiar stă un pion, al culorii care tocmai a mutat;
 *   - pătratul de plecare şi cel sărit peste sunt libere (altfel n-avea pe unde);
 *   - cine e la mutare acum e chiar celălalt.
 *
 *   node --experimental-strip-types --import ./scripts/verificari/register.mjs \
 *        scripts/verificari/ultima-mutare.mjs
 */
import { readFileSync } from 'node:fs'
import { citesteUltimaMutare, descrieUltimaMutare } from '../../src/lib/ultima-mutare.ts'

const env = Object.fromEntries(
  readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => l.includes('='))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
)

const lectii = await (await fetch(
  `${env.VITE_SUPABASE_URL}/rest/v1/lessons?select=title,exercises&order=order_index`,
  { headers: { apikey: env.VITE_SUPABASE_ANON_KEY } },
)).json()

let citite = 0
const aratate = []
const cazute = []

for (const lectie of lectii) {
  for (const ex of lectie.exercises ?? []) {
    if (!ex.fen) continue
    citite++

    const mutare = citesteUltimaMutare(ex.fen, ex.last_move)
    if (!mutare) continue // poziţie fără istorie: nu se arată nimic, e în regulă

    aratate.push({ lectie: lectie.title, ex, mutare })

    const motiv = ceNuTorna(ex.fen, mutare, ex.last_move)
    if (motiv) cazute.push({ lectie: lectie.title, ex, mutare, motiv })
  }
}

/** Ce nu se leagă între mutarea dedusă şi tabla dată. Gol = totul e în regulă. */
function ceNuTorna(fen, mutare, declarata) {
  const peSosire = ceStaPe(fen, mutare.la)
  if (!peSosire) return `pe ${mutare.la} nu stă nimic`
  if (ceStaPe(fen, mutare.de)) return `pe ${mutare.de} încă stă ceva (${ceStaPe(fen, mutare.de)})`

  const eAlb = peSosire === peSosire.toUpperCase()
  if ((eAlb ? 'w' : 'b') !== mutare.culoare) return 'culoarea dedusă nu e a piesei de pe tablă'

  const laMutare = fen.split(' ')[1]
  if (laMutare === mutare.culoare) return 'ar fi mutat de două ori la rând'

  // Restul are sens doar la împingerea de pion dedusă din câmpul de en passant.
  if (declarata) return ''
  if (peSosire.toLowerCase() !== 'p') return `pe ${mutare.la} nu e pion, ci ${peSosire}`
  const sarit = `${mutare.de[0]}${(Number(mutare.de[1]) + Number(mutare.la[1])) / 2}`
  if (ceStaPe(fen, sarit)) return `pionul n-avea pe unde: ${sarit} e ocupat`
  return ''
}

/**
 * Ce literă stă pe un pătrat.
 *
 * Citeşte direct din şirul FEN, cu totul altfel decât `mutare-pe-tabla.ts` —
 * altfel ar confirma aceeaşi greşeală de două ori.
 */
function ceStaPe(fen, patrat) {
  const coloana = 'abcdefgh'.indexOf(patrat[0])
  const rand = fen.split(' ')[0].split('/')[8 - Number(patrat[1])]
  let unde = 0
  for (const semn of rand) {
    if (semn >= '1' && semn <= '8') {
      unde += Number(semn)
      if (unde > coloana) return null // pătratul căutat cade într-un gol
    } else {
      if (unde === coloana) return semn
      unde++
    }
  }
  return null
}

console.log(`Exerciţii cu tablă, din baza reală: ${citite}`)
console.log(`Arată acum ultima mutare a adversarului: ${aratate.length}\n`)
for (const a of aratate) {
  console.log(`  ${a.lectie} — ${a.ex.instruction}`)
  console.log(`     ${descrieUltimaMutare(a.mutare)}\n`)
}

if (cazute.length === 0) {
  console.log('Toate se potrivesc cu tabla pe care sunt desenate. ✓')
} else {
  console.log(`GREŞITE: ${cazute.length}\n`)
  for (const c of cazute) {
    console.log(`  ${c.lectie} — ${c.ex.instruction}`)
    console.log(`     ${c.mutare.de}→${c.mutare.la} pe ${c.ex.fen}`)
    console.log(`     ${c.motiv}\n`)
  }
  process.exitCode = 1
}
