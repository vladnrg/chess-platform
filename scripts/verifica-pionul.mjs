// Citeşte din baza de date reală ce scrie acum în lecţia „Pionul".
// Rulat de `aplica-schimbarile.bat`, ca dovada să fie ce a rămas în bază,
// nu ce am trimis noi acolo.
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => l.includes('='))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
)

const r = await fetch(
  `${env.VITE_SUPABASE_URL}/rest/v1/lessons?select=title,theory_html&title=eq.Pionul`,
  { headers: { apikey: env.VITE_SUPABASE_ANON_KEY } },
)
const lectii = await r.json()

if (!Array.isArray(lectii) || lectii.length === 0) {
  console.log('Nu am gasit lectia „Pionul" in baza de date.')
  process.exit(1)
}

const text = lectii[0].theory_html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
const areTextulNou = text.includes('promovarea în regină')
const areTextulVechi = text.includes('cea mai mică piesă')

console.log('')
console.log('Ce scrie ACUM in lectia „Pionul", citit din baza de date:')
console.log('')
console.log('   ' + text)
console.log('')
if (areTextulNou && !areTextulVechi) console.log('>>> GATA. Fraza noua este in aplicatie.')
else if (areTextulVechi) console.log('>>> Fraza veche este inca acolo. Schimbarea NU s-a aplicat.')
else console.log('>>> Text neasteptat -- verifica mai sus ce scrie.')
console.log('')
