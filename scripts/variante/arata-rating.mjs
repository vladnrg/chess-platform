import { readFileSync } from 'node:fs'
const poz = JSON.parse(readFileSync('scripts/variante/date/rating-pozitii.json', 'utf8'))
const cc = JSON.parse(readFileSync('scripts/variante/date/cc-rating.json', 'utf8'))
const li = JSON.parse(readFileSync('scripts/variante/date/li-rating.json', 'utf8'))
const g = JSON.parse(readFileSync('scripts/variante/date/grupuri.json', 'utf8'))
for (const p of poz.filter(p => p.cheie.split('|').length === 2)) {
  const c = Object.entries(cc[p.fen]).map(([b, d]) => d && d.tot >= 100 ? Math.round((d.m.find(x => x[0] === p.san)?.[1] ?? 0) / d.tot * 100) : '-').join('/')
  const l = Object.entries(li[p.fen]).map(([b, d]) => d && d.tot >= 100 ? Math.round((d.m[p.san] ?? 0) / d.tot * 100) : '-').join('/')
  console.log(p.cheie.padEnd(24), (g[p.cheie] ?? '').padEnd(8), 'CC', c.padEnd(20), 'LI', l)
}
