import { readFileSync, writeFileSync } from 'node:fs'
import { joc, fenEP, culoare, aLui } from './comun.mjs'
import { translateNotation } from '../../src/lib/chess-translations.ts'
const v1 = JSON.parse(readFileSync('scripts/variante/date/v1.json', 'utf8'))
const def = JSON.parse(readFileSync('scripts/variante/date/def.json', 'utf8'))
const poz = []
const grupuri = {}
for (const v of v1) {
  let k = v.desp; while (!aLui(k, v.culoare)) k--
  const { g, ult } = joc(v.uci.slice(0, k))
  const nr = Math.floor(k / 2) + 1
  grupuri[`${v.curs}|${v.cod}`] = k % 2 === 0 ? `${nr}.${translateNotation(v.san[k])}` : `${nr}…${translateNotation(v.san[k])}`
  poz.push({ cheie: `${v.curs}|${v.cod}`, fen: fenEP(g, ult), san: v.san[k], culoare: culoare(g) })
}
for (const [curs, cod, ply, san] of def) {
  const v = v1.find(x => x.curs === curs && x.cod === cod)
  const { g, ult } = joc(v.uci.slice(0, ply))
  poz.push({ cheie: `${curs}|${cod}|${ply}|${san}`, fen: fenEP(g, ult), san, culoare: culoare(g) })
}
writeFileSync('scripts/variante/date/rating-pozitii.json', JSON.stringify(poz))
writeFileSync('scripts/variante/date/grupuri.json', JSON.stringify(grupuri, null, 1))
const fens = [...new Set(poz.map(p => p.fen))]
const CC = [[400, 700], [700, 1000], [1000, 1300], [1300, 1600], [1600, 1900], [1900, 2300]]
writeFileSync('scripts/variante/date/in-rating-cc.json', JSON.stringify(fens.map(f => [f, f, poz.find(p => p.fen === f).culoare, CC])))
writeFileSync('scripts/variante/date/in-rating-li.json', JSON.stringify(fens))
console.log(poz.length, 'poziţii,', fens.length, 'distincte'); console.log(Object.entries(grupuri).map(([k, g]) => k.split('|')[0].slice(0, 8) + k.split('|')[1] + '=' + g).join(' '))
