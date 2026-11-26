// Uneltele comune pentru studii şi variante (2026-11-26): prelungirea liniilor cu
// regula de lungime şi căutarea abaterilor adversarului, prin punte şi motor.
import { Chess } from 'chess.js'
import { analizeaza } from '../verificari/motor.mjs'
import { joc, fenEP, uciDin, culoare, aLui } from './comun.mjs'
import { explorer } from './punte.mjs'

export const MIN_DUPA = 5, MUTARE_AVANTAJ = 8, PRAG_AVANTAJ = 100, MUTARE_MAX = 14
export const B3 = [[400, 1000], [1000, 1600], [1600, 2300]]

/**
 * Prelungeşte liniile până la regula de lungime: după mutarea ta, linia se
 * opreşte când ai avantaj clar (≥ +1,0 de la mutarea 8) sau la mutarea 14, cu
 * cel puţin 5 semi-mutări după despărţire. Mutarea ta: cea mai jucată la
 * 1600–2300 dintre cele la ≤0,35 de Stockfish (adâncime 18); a adversarului:
 * cea mai frecventă la 1000–1600, iar unde nu sunt partide, a motorului.
 * Linie: { id, culoare, ply (indexul abaterii), uci[], gata, note[] }.
 */
export async function prelungeste(linii, jurnal = () => {}) {
  for (let runda = 0; linii.some(l => !l.gata); runda++) {
    await Promise.all(linii.filter(l => !l.gata).map(async l => {
      const { g, ult } = joc(l.uci)
      const lui = aLui(l.uci.length, l.culoare)
      l._d = await explorer(fenEP(g, ult), culoare(g), lui ? [1000, 1600] : [1600, 2300]) ?? { tot: 0, m: [] }
    }))
    for (const l of linii.filter(x => !x.gata)) {
      const { g } = joc(l.uci)
      const lui = aLui(l.uci.length, l.culoare)
      const d = l._d; delete l._d
      let ales, scor = 0
      if (!lui) {
        const an = await analizeaza(g.fen(), { adancime: 18, variante: 4 })
        const cel = an[0]
        const bune = new Set(an.filter(a => a.fel === cel.fel && (cel.fel === 'mate' ? a.scor === cel.scor : cel.scor - a.scor <= 35)).map(a => a.linie[0]))
        for (const [san] of d.m) {
          let m = null; try { m = new Chess(g.fen()).move(san) } catch { /* */ }
          if (m && bune.has(uciDin(m))) { ales = san; break }
        }
        if (!ales) ales = new Chess(g.fen()).move({ from: cel.linie[0].slice(0, 2), to: cel.linie[0].slice(2, 4), promotion: cel.linie[0][4] }).san
        scor = cel.fel === 'mate' ? (cel.scor > 0 ? 10000 : -10000) : cel.scor
        l.note.push(`${ales} (${cel.fel === 'mate' ? 'M' + cel.scor : (cel.scor / 100).toFixed(2)})`)
        l.scor = scor
      } else if (d.tot >= 30 && d.m.length) {
        ales = d.m[0][0]
        l.note.push(`${ales} [${Math.round(d.m[0][1] / d.tot * 100)}% din ${d.tot}]`)
      } else {
        const an = await analizeaza(g.fen(), { adancime: 18 })
        const u = an[0].linie[0]
        ales = new Chess(g.fen()).move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san
        l.note.push(`${ales} [motor]`)
      }
      l.uci.push(uciDin(g.move(ales)))
      const dupa = l.uci.length - l.ply - 1
      const mutareNr = Math.ceil(l.uci.length / 2)
      if (g.isGameOver()) l.gata = true
      else if (!lui && dupa >= MIN_DUPA && ((mutareNr >= MUTARE_AVANTAJ && scor >= PRAG_AVANTAJ) || mutareNr >= MUTARE_MAX)) l.gata = true
    }
    jurnal(`runda ${runda + 1}: ${linii.filter(l => !l.gata).length} linii deschise`)
  }
  return linii
}

/**
 * Abaterile adversarului de-a lungul unei linii, de la indexul `dela` încolo:
 * pentru fiecare poziţie în care mută el, mutările lui altele decât cea din
 * linie, cu procentul la 400–1000 / 1000–1600 / 1600–2300 şi câte partide
 * ajung acolo la 1000–1600.
 */
export async function abateri(uci, culoareTa, dela) {
  const pozitii = []
  for (let i = dela; i < uci.length - 1; i++) {
    if (!aLui(i, culoareTa)) continue
    const { g, ult } = joc(uci.slice(0, i))
    pozitii.push({ i, fen: fenEP(g, ult), cul: culoare(g) })
  }
  const date = await Promise.all(pozitii.map(p => Promise.all(B3.map(b => explorer(p.fen, p.cul, b)))))
  const out = []
  pozitii.forEach((p, k) => {
    const [lo, mid, hi] = date[k]
    if (!mid) return
    const mutareaLiniei = new Chess(p.fen).move({ from: uci[p.i].slice(0, 2), to: uci[p.i].slice(2, 4), promotion: uci[p.i][4] }).san
    for (const [san, n] of mid.m) {
      if (san === mutareaLiniei) continue
      const cota = d => d && d.tot >= 100 ? (d.m.find(x => x[0] === san)?.[1] ?? 0) / d.tot : null
      out.push({ ply: p.i, san, p: n / mid.tot, lo: cota(lo), hi: cota(hi), ajung: mid.tot, partide: n })
    }
  })
  return out
}
