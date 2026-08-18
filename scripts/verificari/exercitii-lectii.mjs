/**
 * Fiecare exerciţiu de lecţie din baza reală poate fi chiar rezolvat?
 *
 * A apărut fiindcă „mută tura de la a1 la h1" răspundea „Nu e mutarea
 * potrivită" la a1→h1. Cauza nu era în exerciţiul acela: `chess.js` refuză
 * orice poziţie fără cei doi regi, iar tablele din lecţii au pe ele doar piesa
 * despre care e lecţia. Erau 14 exerciţii blocate, nu unul — dar nimeni n-avea
 * cum să ştie fără să le încerce pe toate, una câte una, cu mâna.
 *
 * Verificarea asta le încearcă pe toate, cu funcţia adevărată din aplicaţie.
 *
 *   node --experimental-strip-types --import ./scripts/verificari/register.mjs \
 *        scripts/verificari/exercitii-lectii.mjs
 */
import { readFileSync } from 'node:fs'
import { aplicaMutarea } from '../../src/lib/mutare-pe-tabla.ts'

const env = Object.fromEntries(
  readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => l.includes('='))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
)

const lectii = await (await fetch(
  `${env.VITE_SUPABASE_URL}/rest/v1/lessons?select=title,exercises`,
  { headers: { apikey: env.VITE_SUPABASE_ANON_KEY } },
)).json()

let incercate = 0
const cazute = []

for (const lectie of lectii) {
  for (const ex of lectie.exercises ?? []) {
    if (ex.type !== 'move_piece' || !ex.fen || !ex.correct_move) continue
    incercate++

    const de = ex.correct_move.slice(0, 2)
    const la = ex.correct_move.slice(2, 4)
    const promovare = ex.correct_move.slice(4) || 'q'
    const dupa = aplicaMutarea(ex.fen, de, la, promovare)

    if (!dupa) {
      cazute.push({ lectie: lectie.title, ex, motiv: 'mutarea corectă e respinsă' })
      continue
    }
    // Piesa chiar a ajuns unde trebuia? Altfel „a mers" nu înseamnă nimic.
    if (!arePiesa(dupa, la) || arePiesa(dupa, de)) {
      cazute.push({ lectie: lectie.title, ex, motiv: `poziţia rezultată e greşită: ${dupa}` })
    }
  }
}

/**
 * Pătratul are o piesă pe el?
 *
 * Citeşte direct din şirul FEN, cu totul altfel decât `mutare-pe-tabla.ts` —
 * altfel ar confirma aceeaşi greşeală de două ori.
 */
function arePiesa(fen, patrat) {
  const coloana = 'abcdefgh'.indexOf(patrat[0])
  const rand = fen.split(' ')[0].split('/')[8 - Number(patrat[1])]
  let unde = 0
  for (const semn of rand) {
    if (semn >= '1' && semn <= '8') {
      unde += Number(semn)
      if (unde > coloana) return false // pătratul căutat cade într-un gol
    } else {
      if (unde === coloana) return true
      unde++
    }
  }
  return false
}

console.log(`Exerciţii de mutat piesa, din baza reală: ${incercate}`)
if (cazute.length === 0) {
  console.log('Toate pot fi rezolvate. ✓')
} else {
  console.log(`\nBLOCATE: ${cazute.length}\n`)
  for (const c of cazute) {
    console.log(`  ${c.lectie} — ${c.ex.instruction}`)
    console.log(`     ${c.ex.correct_move} pe ${c.ex.fen}`)
    console.log(`     ${c.motiv}\n`)
  }
  process.exitCode = 1
}
