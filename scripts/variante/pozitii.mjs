import { readFileSync, writeFileSync } from 'node:fs'
import { joc, fenEP, culoare, aLui } from './comun.mjs'
const v1 = JSON.parse(readFileSync('scripts/variante/date/v1.json', 'utf8'))
const B3 = [[400, 1000], [1000, 1600], [1600, 2300]]
const out = []
for (const v of v1) {
  for (let i = v.desp + 1; i < v.uci.length - 2; i++) {
    if (!aLui(i, v.culoare)) continue
    const { g, ult } = joc(v.uci.slice(0, i))
    out.push([`${v.curs}|${v.cod}|${i}`, fenEP(g, ult), culoare(g), B3])
  }
}
writeFileSync('scripts/variante/date/in-candidati.json', JSON.stringify(out))
console.log(out.length, 'poziţii')
