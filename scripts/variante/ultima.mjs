import { readFileSync } from 'node:fs'
import { Chess } from 'chess.js'
import { translateNotation } from '../../src/lib/chess-translations.ts'
const R = JSON.parse(readFileSync('scripts/variante/date/ramuri.json', 'utf8'))
const NUME = { p: 'pion', n: 'cal', b: 'nebun', r: 'tură', q: 'damă', k: 'rege' }
const VAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }
for (const r of R.filter(x => !process.argv[2] || process.argv.slice(2).includes(x.curs))) {
  const g = new Chess(); let m
  for (const u of r.uci) m = g.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] })
  const i = r.uci.length - 1, nr = Math.floor(i / 2) + 1
  let mat = 0; for (const row of g.board()) for (const p of row) if (p) mat += (p.color === (r.culoare === 'white' ? 'w' : 'b') ? 1 : -1) * VAL[p.type]
  const fapte = [m.captured ? `ia ${NUME[m.captured]}` : '', g.inCheck() ? 'ŞAH' : ''].filter(Boolean).join('; ')
  console.log(`${r.id} :: ${i % 2 === 0 ? nr + '.' : nr + '…'}${translateNotation(m.san)}${fapte ? ' (' + fapte + ')' : ''} | eval ${r.note.at(-1).match(/\(([^)]+)\)/)?.[1]} | material ${mat >= 0 ? '+' : ''}${mat} | ${g.fen().split(' ')[0]}`)
}
