// Construieşte ramificaţiile pas cu pas (generalizat din pilotul Italianei).
//   node pas.mjs init            → ramuri.json din def.json
//   node pas.mjs fens            → poziţiile de cerut la explorer
//   node pas.mjs aplica fis.json → alege mutările (motor + explorer) şi le adaugă
import { readFileSync, writeFileSync } from 'node:fs'
import { Chess } from 'chess.js'
import { analizeaza } from '../verificari/motor.mjs'
import { joc, fenEP, uciDin, culoare, aLui } from './comun.mjs'

const DIR = 'scripts/variante/date/'
const STARE = DIR + 'ramuri.json'
const PLY_DUPA = 7 // după mutarea de despărţire: 4 mutări ale tale, 3 ale lui

const cmd = process.argv[2]
if (cmd === 'init') {
  const v1 = JSON.parse(readFileSync(DIR + 'v1.json', 'utf8'))
  const def = JSON.parse(readFileSync(DIR + 'def.json', 'utf8'))
  const ramuri = def.map(([curs, cod, ply, san]) => {
    const v = v1.find(c => c.curs === curs && c.cod === cod)
    const { g } = joc(v.uci.slice(0, ply))
    const m = g.move(san)
    return { id: `${curs}|${cod}|${ply}|${san}`, curs, cod, culoare: v.culoare, ply, san, uci: [...v.uci.slice(0, ply), uciDin(m)], gata: false, note: [] }
  })
  writeFileSync(STARE, JSON.stringify(ramuri, null, 1))
  console.log(ramuri.length, 'ramuri')
} else if (cmd === 'fens') {
  const ramuri = JSON.parse(readFileSync(STARE, 'utf8'))
  const out = ramuri.filter(r => !r.gata).map(r => {
    const { g, ult } = joc(r.uci)
    const lui = aLui(r.uci.length, r.culoare)
    return [r.id, fenEP(g, ult), culoare(g), [lui ? [1000, 1600] : [1600, 2300]]]
  })
  writeFileSync(DIR + 'in-pas.json', JSON.stringify(out))
  console.log(out.length, 'poziţii')
} else if (cmd === 'aplica') {
  const ramuri = JSON.parse(readFileSync(STARE, 'utf8'))
  const exp = JSON.parse(readFileSync(process.argv[3], 'utf8'))
  for (const r of ramuri) {
    if (r.gata) continue
    const { g } = joc(r.uci)
    const lui = aLui(r.uci.length, r.culoare)
    const d = exp[r.id]?.[lui ? '1000' : '1600'] ?? { tot: 0, m: [] }
    let ales = null
    if (!lui) {
      // Mutarea ta: cea mai jucată la 1600–2300 dintre cele aproape la fel de bune ca a motorului.
      const an = await analizeaza(g.fen(), { adancime: 18, variante: 4 })
      const cel = an[0]
      const bune = an.filter(a => a.fel === cel.fel && (cel.fel === 'mate' ? a.scor === cel.scor : cel.scor - a.scor <= 35))
      const uciBune = new Set(bune.map(a => a.linie[0]))
      for (const [san] of d.m) {
        let m = null; try { m = new Chess(g.fen()).move(san) } catch { /* */ }
        if (m && uciBune.has(uciDin(m))) { ales = san; break }
      }
      if (!ales) ales = new Chess(g.fen()).move({ from: cel.linie[0].slice(0, 2), to: cel.linie[0].slice(2, 4), promotion: cel.linie[0][4] }).san
      r.note.push(`${ales} (${cel.fel === 'mate' ? 'M' + cel.scor : (cel.scor / 100).toFixed(2)})`)
    } else {
      // Mutarea lui: cea mai frecventă la 1000–1600, dacă sunt destule partide; altfel a motorului.
      if (d.tot >= 30 && d.m.length) {
        ales = d.m[0][0]
        r.note.push(`${ales} [${Math.round(d.m[0][1] / d.tot * 100)}% din ${d.tot}]`)
      } else {
        const an = await analizeaza(g.fen(), { adancime: 18 })
        const u = an[0].linie[0]
        ales = new Chess(g.fen()).move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san
        r.note.push(`${ales} [motor]`)
      }
    }
    const m = g.move(ales)
    r.uci.push(uciDin(m))
    if (r.uci.length >= r.ply + 1 + PLY_DUPA || g.isGameOver()) r.gata = true
  }
  writeFileSync(STARE, JSON.stringify(ramuri, null, 1))
  console.log(ramuri.filter(r => !r.gata).length, 'ramuri încă deschise')
}
process.exit(0)
