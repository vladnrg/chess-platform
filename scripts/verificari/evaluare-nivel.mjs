// Trece prin motor puzzle-urile din evaluarea de nivel (onboarding).
//
// Fiecare mutare a jucătorului din soluţie trebuie să fie cea mai bună din
// poziţia ei şi singura care câştigă — cel puţin 1,5 pioni peste a doua —, sau
// să dea mat (orice mat e primit, deci nu trebuie să fie singurul). Altfel cineva
// care joacă o mutare la fel de bună ar fi notat greşit. Vezi memoria
// „pozitiile-se-trec-prin-motor".
//
// Rulare:
//   node --experimental-strip-types --import ./scripts/verificari/register.mjs scripts/verificari/evaluare-nivel.mjs

import { Chess } from 'chess.js'
import { TACTICS_QUESTIONS } from '@/pages/Onboarding/assessmentData'
import { analizeaza, scrieScor } from './motor.mjs'

const pct = s => s.fel === 'mate' ? (s.scor > 0 ? 10000 - s.scor : -10000 - s.scor) : s.scor

function joaca(fen, uci) {
  const g = new Chess(fen)
  const m = g.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] ?? 'q' })
  return { g, san: m.san }
}

let picate = 0
for (const q of TACTICS_QUESTIONS) {
  const fel = q.solutie.length > 1 ? 'secvenţă' : 'o mutare'
  console.log(`\n${q.id}  Lichess ~${q.rating} · ${fel} · ${q.fen.split(' ')[1] === 'w' ? 'albul' : 'negrul'} la mutare`)
  let poz = q.fen
  for (let k = 0; k < q.solutie.length; k++) {
    const { g, san } = joaca(poz, q.solutie[k])
    if (k % 2 === 0) {
      if (g.isCheckmate()) {
        console.log(`   ${san}: mat`)
      } else {
        const top = await analizeaza(poz, { adancime: 20, variante: 2 })
        const bun = top[0]?.linie[0] === q.solutie[k]
        const unic = top.length < 2 || pct(top[0]) - pct(top[1]) >= 150
        const ok = bun && unic
        if (!ok) picate++
        console.log(`   ${san}: ${ok ? 'BUN' : 'PICĂ'} — motor ${scrieScor(top[0])}${top[1] ? `, a doua ${scrieScor(top[1])}` : ''}`)
      }
    } else {
      console.log(`   (adversarul: ${san})`)
    }
    poz = g.fen()
  }
}
console.log(`\n${picate === 0 ? 'Toate mutările trec.' : `${picate} mutări NU trec.`}`)
process.exitCode = picate === 0 ? 0 : 1
