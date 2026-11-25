import { writeFileSync } from 'node:fs'
import { envProiect } from '../../../flota-cursuri/unelte/comun.mjs'
const env = envProiect()
const ia = async q => (await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/${q}`, { headers: { apikey: env.VITE_SUPABASE_ANON_KEY } })).json()
const cursuri = await ia('courses?select=id,slug,title,order_index&order=order_index')
const linii = await ia('opening_lines?select=id,course_id,variation_code,variation_name,user_color,moves_uci,tip,grup,order_index,popularitate_niveluri,popularitate_pe_rating,variante&order=order_index')
const planuri = await ia('middlegame_plans?select=id,opening_line_id')
const out = []
for (const c of cursuri) {
  const L = linii.filter(l => l.course_id === c.id)
  console.log(`${c.slug} (${L.length} cap.)`, L.map(l => `${l.variation_code}:${l.user_color[0]}:${l.moves_uci.split(' ').length}${planuri.some(p => p.opening_line_id === l.id) ? '+p' : ''}${l.popularitate_niveluri ? '+n' : ''}${l.popularitate_pe_rating ? '+r' : ''}${l.variante ? '+v' + l.variante.length : ''}`).join(' '))
  out.push({ ...c, linii: L })
}
writeFileSync('scripts/variante/date/inventar.json', JSON.stringify(out))
