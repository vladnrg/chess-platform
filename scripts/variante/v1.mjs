// V1 al fiecărui capitol (deschidere + jocul de mijloc lipit), din baza de date.
import { readFileSync, writeFileSync } from 'node:fs'
import { Chess } from 'chess.js'
import { envProiect } from '../../../flota-cursuri/unelte/comun.mjs'
const env = envProiect()
const ia = async q => (await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/${q}`, { headers: { apikey: env.VITE_SUPABASE_ANON_KEY } })).json()
const inv = JSON.parse(readFileSync('scripts/variante/date/inventar.json', 'utf8')).filter(c => c.linii.length && c.slug !== 'italian-game')
const planuri = await ia('middlegame_plans?select=opening_line_id,moves_uci')
const out = []
for (const c of inv) {
  for (const l of c.linii) {
    const p = planuri.find(x => x.opening_line_id === l.id)
    const uci = (l.moves_uci + (p?.moves_uci ? ' ' + p.moves_uci : '')).split(' ').filter(Boolean)
    out.push({ curs: c.slug, cod: l.variation_code, nume: l.variation_name, culoare: l.user_color, nOpen: l.moves_uci.split(' ').length, uci })
  }
}
for (const v of out) {
  let desp = 0
  for (const o of out) if (o.curs === v.curs && o.cod !== v.cod) { let k = 0; while (v.uci[k] === o.uci[k]) k++; desp = Math.max(desp, k) }
  v.desp = desp
  const g = new Chess(); const san = []
  for (const u of v.uci) san.push(g.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san)
  v.san = san
  const aLui = (desp % 2 === 0) === (v.culoare === 'black')
  console.log(`${v.curs} ${v.cod} ${v.culoare[0]} desp=${desp}${aLui ? ' (adv)' : ' (TU)'} ${v.uci.length}ply: ${san.map((s, i) => (i % 2 === 0 ? `${i / 2 + 1}.` : '') + s).join(' ')}`)
}
writeFileSync('scripts/variante/date/v1.json', JSON.stringify(out))
