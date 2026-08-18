import { readFileSync } from 'node:fs'
import { TACTIC_CATEGORIES } from '@/data/tactics.ts'
import { TACTIC_TIERS, TACTIC_PATH_SIZE, TRIAL_SIZE, pickPath, pickTrial, categoryInTier, matchesCategory } from '@/lib/tactics-path.ts'
import { niveluriPeTeme, temaSlaba, deRepetat, temaZilei, xpPentru } from '@/lib/tactici-progres.ts'

const env = Object.fromEntries(readFileSync('.env','utf8').split(/\r?\n/).filter(l=>l.includes('='))
  .map(l => [l.slice(0,l.indexOf('=')).trim(), l.slice(l.indexOf('=')+1).trim()]))
let banca = [], from = 0
for (;;) {
  const r = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/puzzles?select=id,rating,themes&order=id.asc`,
    { headers: { apikey: env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}`, Range: `${from}-${from+999}` } })
  const p = await r.json(); banca = banca.concat(p); if (p.length < 1000) break; from += 1000
}
let rele = 0
const ok = (c, m) => { if (!c) rele++; console.log(`  ${c ? '✓' : '✗'} ${m}`) }

console.log(`banca live: ${banca.length} puzzle-uri\n`)
console.log('1) Ce arată fiecare cufăr')
for (const t of TACTIC_TIERS) {
  const c = TACTIC_CATEGORIES.filter(x => categoryInTier(x, t))
  console.log(`   ${t.label.padEnd(12)} ${String(c.length).padStart(2)}: ${c.map(x => x.title).join(' · ')}`)
}
ok(TACTIC_CATEGORIES.filter(c => categoryInTier(c, TACTIC_TIERS[3])).every(c => c.fel),
   'la master nu mai e nicio temă cu nume — doar proba şi formatele')
ok(TACTIC_CATEGORIES.filter(c => !c.fel).every(c => c.maxTier === 'avansat'), 'cele 12 teme se opresc la avansat')
ok(TACTIC_TIERS.every(t => TACTIC_CATEGORIES.some(c => c.fel === 'proba' && categoryInTier(c, t))), 'proba apare în toate cele patru cufere')

console.log('\n2) Proba: zece poziţii, din teme cât mai diferite')
for (const t of TACTIC_TIERS) {
  const p = pickTrial(banca, TACTIC_CATEGORIES, t)
  const teme = TACTIC_CATEGORIES.filter(c => !c.fel && categoryInTier(c, t)).filter(c => p.some(x => matchesCategory(x.themes, c))).length
  console.log(`   ${t.label.padEnd(12)} ${p.length} poziţii · acoperă ${teme} teme diferite`)
}
const p1 = pickTrial(banca, TACTIC_CATEGORIES, TACTIC_TIERS[0])
ok(p1.length === TRIAL_SIZE, `proba are exact ${TRIAL_SIZE} poziţii`)
ok(new Set(p1.map(x => x.id)).size === p1.length, 'fără poziţii repetate în probă')
ok(JSON.stringify(pickTrial(banca, TACTIC_CATEGORIES, TACTIC_TIERS[0]).map(x => x.id)) === JSON.stringify(p1.map(x => x.id)),
   'alegerea e fixă între rulări, deci progresul se poate deduce din încercări')

console.log('\n3) Formatele de la master trag din toate temele')
for (const id of ['master-mixt', 'master-cronometru', 'master-fara-greseala']) {
  const c = TACTIC_CATEGORIES.find(x => x.id === id)
  const n = pickPath(banca, c, TACTIC_TIERS[3]).length
  ok(n === TACTIC_PATH_SIZE, `„${c.title}" umple traseul: ${n}/${TACTIC_PATH_SIZE}`)
}

console.log('\n4) Harta punctelor slabe (încercări simulate)')
// Ambele teme din aceeaşi bandă de dificultate: altfel n-ar fi o comparaţie
// între jucător şi jucător, ci între două pool-uri de poziţii diferite.
const banda = p => p.rating >= 1200 && p.rating < 1400
const furci = banca.filter(p => banda(p) && p.themes.includes('fork')).slice(0, 10)
const legari = banca.filter(p => banda(p) && p.themes.includes('pin')).slice(0, 10)
const inc = [
  ...furci.map((p, i) => ({ puzzle_id: p.id, solved: i < 8, attempted_at: '2026-08-18T10:00:00Z' })),
  ...legari.map((p, i) => ({ puzzle_id: p.id, solved: i < 2, attempted_at: '2026-08-18T10:00:00Z' })),
]
const niv = niveluriPeTeme(inc, banca, TACTIC_CATEGORIES)
const f = niv.find(n => n.categorie.id === 'fork'), l = niv.find(n => n.categorie.id === 'pin')
console.log(`   furculiţă: nivel ${f.nivel} (${f.rezolvate}/${f.incercari} → ${f.procentReusita}%)`)
console.log(`   legare:    nivel ${l.nivel} (${l.rezolvate}/${l.incercari} → ${l.procentReusita}%)`)
ok(f.nivel > l.nivel, 'tema la care merge bine iese peste cea la care merge prost')
ok(temaSlaba(niv)?.categorie.id === 'pin', 'punctul slab detectat corect: legarea')
ok(niveluriPeTeme([], banca, TACTIC_CATEGORIES).every(n => n.nivel === null), 'fără date, niciun nivel inventat')
const putine = niveluriPeTeme(inc.slice(0, 5), banca, TACTIC_CATEGORIES)
ok(putine.every(n => n.nivel === null), 'sub 8 încercări pe temă, tot nimic — nu ghicim din cinci')

console.log('\n5) Repetiţia la interval')
const ieri = new Date(Date.now() - 864e5).toISOString()
const acum5 = new Date(Date.now() - 5 * 864e5).toISOString()
ok(deRepetat([{ puzzle_id: 'a', solved: false, attempted_at: ieri }]).length === 0, 'ratată ieri → încă nu (pragul e 3 zile)')
ok(deRepetat([{ puzzle_id: 'a', solved: false, attempted_at: acum5 }]).length === 1, 'ratată acum 5 zile → se repetă')
ok(deRepetat([{ puzzle_id: 'a', solved: false, attempted_at: acum5 }, { puzzle_id: 'a', solved: true, attempted_at: ieri }]).length === 0,
   'rezolvată între timp → iese din listă')

console.log('\n6) Tema zilei şi XP-ul')
const t1 = temaZilei(TACTIC_CATEGORIES, new Date('2026-08-18'))
const t3 = temaZilei(TACTIC_CATEGORIES, new Date('2026-08-19'))
ok(t1?.id === temaZilei(TACTIC_CATEGORIES, new Date('2026-08-18'))?.id, 'aceeaşi temă de două ori în aceeaşi zi')
ok(t1?.id !== t3?.id, `altă temă mâine (azi „${t1?.title}", mâine „${t3?.title}")`)
ok(!t1?.fel && !t1?.isPro, 'tema zilei e o temă adevărată şi gratuită')
ok(xpPentru(1200, false) === 20 && xpPentru(1200, true) === 40, 'tema zilei dublează XP-ul (20 → 40)')

console.log(rele ? `\n${rele} verificări au picat` : '\nTOATE VERIFICĂRILE AU TRECUT')
