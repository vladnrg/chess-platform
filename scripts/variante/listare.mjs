// Listare pentru scrierea textelor: pentru fiecare ramificaţie, mutările de la despărţire, cu fapte (captură, şah, ce atacă).
import { readFileSync, writeFileSync } from 'node:fs'
import { Chess } from 'chess.js'
import { translateNotation } from '../../src/lib/chess-translations.ts'
const R = JSON.parse(readFileSync('scripts/variante/date/ramuri.json', 'utf8'))
const v1 = JSON.parse(readFileSync('scripts/variante/date/v1.json', 'utf8'))
const cursuri = process.argv.slice(2)
const NUME = { p: 'pion', n: 'cal', b: 'nebun', r: 'tură', q: 'damă', k: 'rege' }
const VAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 }
let txt = ''
for (const r of R.filter(x => !cursuri.length || cursuri.includes(x.curs))) {
  const v = v1.find(x => x.curs === r.curs && x.cod === r.cod)
  const g = new Chess(); const san = []
  r.uci.forEach((u, i) => {
    const fenInainte = g.fen()
    const m = g.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] })
    if (i < r.ply) { san.push(m.san); return }
    const fapte = []
    if (m.captured) fapte.push(`ia ${NUME[m.captured]} ${m.to}`)
    if (g.inCheck()) fapte.push('ŞAH')
    // ce atacă piesa mutată acum (piese adverse de valoare)
    const tinte = g.moves({ square: m.to, verbose: true }).length === 0 ? [] : []
    const t = new Chess(g.fen().replace(/ [wb] /, m.color === 'w' ? ' w ' : ' b '))
    try { for (const x of t.moves({ square: m.to, verbose: true })) if (x.captured && x.captured !== 'p') tinte.push(`${NUME[x.captured]} ${x.to}`) } catch { /* */ }
    if (tinte.length) fapte.push('atacă ' + tinte.join(', '))
    const nr = Math.floor(i / 2) + 1
    san.push(m.san)
    txt += `  ${i % 2 === 0 ? nr + '.' : nr + '…'}${translateNotation(m.san)}${m.color === (r.culoare === 'white' ? 'w' : 'b') ? ' [TU]' : ''}${fapte.length ? '  (' + fapte.join('; ') + ')' : ''}\n`
  })
  const inainte = san.slice(0, r.ply).map((s, i) => (i % 2 === 0 ? `${i / 2 + 1}.` : '') + translateNotation(s)).join(' ')
  txt = txt.replace(/@@$/, '')
  const cap = `\n### ${r.id}  (${r.culoare === 'white' ? 'tu = albul' : 'tu = negrul'}; V1 la ply ${r.ply}: ${translateNotation(v.san[r.ply])})\n  înainte: ${inainte}\n`
  const blocuri = txt.split('\n').filter(Boolean)
  txt = ''
  process.stdout.write(cap + blocuri.join('\n') + `\n  final FEN: ${g.fen()}\n`)
}
