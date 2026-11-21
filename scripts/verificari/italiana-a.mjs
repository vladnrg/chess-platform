// Verifică afirmaţiile din textele Partidei Italiene, varianta A (Giuoco Piano),
// cerute pe 2026-11-21:
//   - după 5.d4 Cxe4?, 6.dxc5 câştigă piesa (nebunul negru);
//   - după 10.Db3, Cce7 e singura apărare bună a negrului.
// Rulare: node scripts/verificari/italiana-a.mjs
import { Chess } from 'chess.js'
import { analizeaza, scrieScor } from './motor.mjs'

const linie = 'e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 c2c3 g8f6 d2d4 e5d4 c3d4 c5b4 c1d2 b4d2 b1d2 d7d5 e4d5 f6d5 d1b3'.split(' ')

function dupa(n, extra = []) {
  const g = new Chess()
  for (const m of [...linie.slice(0, n), ...extra]) g.move({ from: m.slice(0, 2), to: m.slice(2, 4) })
  return g
}

function san(fen, uciList) {
  const g = new Chess(fen)
  return uciList.slice(0, 8).map(m => g.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m[4] }).san).join(' ')
}

// 1) Poziţia după 5.d4: ce merge pentru negru, şi cât costă 5...Cxe4.
const dupaD4 = dupa(9)
console.log('După 5.d4 — cele mai bune 4 mutări ale negrului:')
for (const r of await analizeaza(dupaD4.fen(), { adancime: 24, variante: 4 })) {
  console.log(`  ${scrieScor(r).padStart(7)}  ${san(dupaD4.fen(), r.linie)}`)
}
const dupaCxe4 = dupa(9, ['f6e4'])
console.log('\nDupă 5...Cxe4 — răspunsurile albului:')
for (const r of await analizeaza(dupaCxe4.fen(), { adancime: 24, variante: 3 })) {
  console.log(`  ${scrieScor(r).padStart(7)}  ${san(dupaCxe4.fen(), r.linie)}`)
}

// 2) Poziţia după 10.Db3: toate apărările negrului, cu scorul lor.
const dupaDb3 = dupa(19)
console.log('\nDupă 10.Db3 — cele mai bune 6 mutări ale negrului (scor din partea negrului):')
for (const r of await analizeaza(dupaDb3.fen(), { adancime: 26, variante: 6 })) {
  console.log(`  ${scrieScor(r).padStart(7)}  ${san(dupaDb3.fen(), r.linie)}`)
}

// 3) După 9.exd5: are negrul altceva decât Cxd5?
const dupaExd5 = dupa(17)
console.log('\nDupă 9.exd5 — cele mai bune 4 mutări ale negrului:')
for (const r of await analizeaza(dupaExd5.fen(), { adancime: 24, variante: 4 })) {
  console.log(`  ${scrieScor(r).padStart(7)}  ${san(dupaExd5.fen(), r.linie)}`)
}
