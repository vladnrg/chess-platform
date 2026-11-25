import { readFileSync, writeFileSync } from 'node:fs'
import { Chess } from 'chess.js'
import { joc } from './comun.mjs'
const v1 = JSON.parse(readFileSync('scripts/variante/date/v1.json', 'utf8'))
const cc = JSON.parse(readFileSync('scripts/variante/date/cc-candidati.json', 'utf8'))
const MAX = Number(process.argv[2] ?? 3)
const poz = f => f.split(' ').slice(0, 4).join(' ')
// poziţiile tuturor liniilor V1 dintr-un curs, ca să nu alegem transpoziţii
const cunoscute = {}
for (const v of v1) { const s = (cunoscute[v.curs] ??= new Set()); const g = new Chess(); s.add(poz(g.fen())); for (const u of v.uci) { g.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }); s.add(poz(g.fen())) } }
const ales = []
for (const v of v1) {
  const cand = []
  for (const [id, d] of Object.entries(cc)) {
    const [curs, cod, plyS] = id.split('|'); if (curs !== v.curs || cod !== v.cod) continue
    const ply = Number(plyS), mid = d['1000']; if (!mid || mid.tot < 15000) continue
    for (const [san, n] of mid.m) {
      if (san === v.san[ply]) continue
      const p = n / mid.tot
      const alte = [d['400'], d['1600']].filter(x => x && x.tot >= 100).map(x => (x.m.find(y => y[0] === san)?.[1] ?? 0) / x.tot)
      if (p < 0.10 || alte.some(a => a < 0.04)) continue
      const { g } = joc(v.uci.slice(0, ply)); g.move(san)
      if (cunoscute[v.curs].has(poz(g.fen()))) continue
      cand.push({ ply, san, p, reach: mid.tot, scor: mid.tot * p, alte })
    }
  }
  cand.sort((a, b) => b.scor - a.scor)
  const lista = []; const pePoz = {}
  for (const c of cand) { if (lista.length >= MAX) break; if ((pePoz[c.ply] ?? 0) >= 2) continue; pePoz[c.ply] = (pePoz[c.ply] ?? 0) + 1; lista.push(c) }
  for (const c of lista) ales.push([v.curs, v.cod, c.ply, c.san])
  console.log(`${v.curs} ${v.cod}: ` + lista.map(c => `${c.ply}:${c.san} ${(c.p * 100).toFixed(0)}% (${c.alte.map(a => (a * 100).toFixed(0)).join('/')}) n=${c.reach}`).join(' | ') + `   [${cand.length} cand.]`)
}
writeFileSync('scripts/variante/date/def.json', JSON.stringify(ales))
console.log(ales.length, 'ramuri')
