/**
 * Verifică, din baza de date reală, că schimbările trimise chiar au ajuns acolo.
 *
 * Rulat de `aplica-schimbarile.bat`, ca ultimul pas. Citeşte cu cheia publică —
 * aceeaşi cu care citeşte aplicaţia — deci ce scrie aici e ce vede şi omul în
 * browser, nu ce-am trimis noi.
 *
 * Lista creşte cu fiecare migrare care schimbă ceva vizibil. E singurul loc
 * unde trebuie adăugat ceva; batch-ul rămâne cum e.
 */
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => l.includes('='))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
)

const BAZA = env.VITE_SUPABASE_URL
const CHEIE = env.VITE_SUPABASE_ANON_KEY

async function ia(cale) {
  const r = await fetch(`${BAZA}/rest/v1/${cale}`, { headers: { apikey: CHEIE } })
  return { ok: r.ok, stare: r.status, corp: r.ok ? await r.json() : await r.text() }
}

const verificari = [
  {
    ce: 'Lectia „Pionul" are fraza noua',
    async cum() {
      const r = await ia('lessons?select=title&theory_html=like.*promovarea%20%C3%AEn%20regin%C4%83*')
      return r.ok && r.corp.length > 0
        ? 'da'
        : 'NU — a ramas fraza veche'
    },
  },
  {
    ce: 'Progresul retine cand ai fost ultima data la un curs',
    async cum() {
      const r = await ia('user_course_progress?select=last_activity_at&limit=1')
      // 400 inseamna „coloana nu exista"; lista goala e in regula (nu suntem logati).
      return r.ok ? 'da' : `NU — baza raspunde ${r.stare}`
    },
  },
  {
    ce: 'Exista raftul pentru poze de profil',
    async cum() {
      // Storage cere si `Authorization`, nu doar `apikey` — altfel raspunde 400
      // „headers must have required property 'authorization'", care arata a
      // raft lipsa desi raftul exista.
      const r = await fetch(`${BAZA}/storage/v1/object/list/avatare`, {
        method: 'POST',
        headers: {
          apikey: CHEIE,
          Authorization: `Bearer ${CHEIE}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prefix: '', limit: 1 }),
      })
      return r.ok ? 'da' : `NU — raftul raspunde ${r.status}: ${(await r.text()).slice(0, 90)}`
    },
  },
]

console.log('')
console.log('Verific in baza de date reala:')
console.log('')

let tot = true
for (const v of verificari) {
  let rezultat
  try {
    rezultat = await v.cum()
  } catch (e) {
    rezultat = `NU — ${e.message}`
  }
  const bun = rezultat === 'da'
  if (!bun) tot = false
  console.log(`  [${bun ? 'OK' : '!!'}] ${v.ce}${bun ? '' : ' -> ' + rezultat}`)
}

console.log('')
console.log(tot ? '>>> GATA. Totul e la locul lui.' : '>>> Ceva nu a intrat. Trimite-mi randurile de mai sus.')
console.log('')

if (!tot) process.exitCode = 1
