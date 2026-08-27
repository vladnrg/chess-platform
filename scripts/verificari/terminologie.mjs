/**
 * Cuvinte care n-au voie în conţinutul cursurilor.
 *
 * Piesa se numeşte **tura**, la feminin. Migrarea 022 curăţase deja „turnul"
 * din tot ce era în bază la acea dată — iar apoi au intrat patru cursuri de
 * deschideri, planurile de mijloc de partidă, capcanele şi lecţia de promovare,
 * şi cuvântul s-a întors de 178 de ori, în patru tabele. Utilizatorul a cerut
 * schimbarea de trei ori.
 *
 * O migrare repară ce e acum; verificarea asta e ca să nu se mai întoarcă. Se
 * uită în baza reală, nu în fişiere: conţinutul se scrie cu migrări, dar se
 * citeşte de acolo, iar o migrare nouă poate aduce oricând cuvântul înapoi.
 *
 *   node --experimental-strip-types --import ./scripts/verificari/register.mjs \
 *        scripts/verificari/terminologie.mjs
 */
import { readFileSync } from 'node:fs'

/** Ce nu se scrie, şi ce se scrie în loc. */
const INTERZISE = [
  {
    ce: /\b[Tt]urn(ul|ului|uri|urile|urilor)?\b/g,
    gresit: 'turn / turnul / turnuri',
    corect: 'tură / tura / ture (piesa e la feminin)',
  },
  {
    // Mutarea care se iveşte ACUM pe tablă se scrie la prezent şi fără „tocmai".
    // „Negrul tocmai a mutat regele de pe a8 pe b7" pune între elev şi tablă o
    // mutare terminată şi dusă, când de fapt el se uită la ea cum se face; iar
    // „tocmai" e un cuvânt în plus care spune ce se vede oricum. Rămâne „negrul
    // mută regele de pe a8 pe b7". Utilizatorul, pe 2026-08-27: „elimină
    // cuvântul «tocmai» din construcţii… pentru ce se iveşte acum pe tablă,
    // scrie verbul la prezent, fără «tocmai»".
    //
    // Regula se agaţă de „tocmai" urmat de un verb de mutare, la orice timp —
    // nu de perfectul compus în sine: „albul a împins trei pioni" povesteşte
    // cum s-a ajuns la poziţie, iar acolo trecutul e chiar forma potrivită.
    // Din cele 41 de perechi găsite când regula prindea orice perfect compus,
    // 38 erau istorie scrisă corect. Nici „tocmai" singur nu e interzis:
    // „tocmai de aceea" sau „tocmai fiindcă" n-au nicio treabă cu mutările.
    //
    // Capătul de cuvânt e scris cu o privire înainte, nu cu `\b`: în JavaScript
    // `\b` se uită doar la litere ASCII, iar „ă" nu e una — deci „mută\b" nu se
    // potriveşte niciodată, şi exact aşa a scăpat neprins „albul tocmai mută
    // nebunul pe d3" la prima trecere. Verbele româneşti se termină prea des în
    // ă, ş, ţ ca să meargă altfel.
    ce: /\btocmai\s+(([şșs]i-)?(a|au)\s+)?(mută|mutăm|împinge|impinge|joacă|capturează|ia|iau|promovează|avansează|retrage|sare|mutat|împins|impins|jucat|capturat|luat|promovat|avansat|retras|sărit|sarit)(?![A-Za-zĂÂÎŞŢȘȚăâîşţșț])/gi,
    gresit: '„tocmai" lipit de o mutare: tocmai mută / tocmai a mutat / tocmai împinge…',
    corect: 'doar verbul, la prezent: mută / împinge / ia',
  },
]

/** Unde se uită: tabelul şi coloanele lui cu text de curs. */
const TABELE = {
  courses: ['title', 'description'],
  lessons: ['title', 'theory_html', 'exercises', 'key_positions'],
  opening_lines: ['variation_name', 'move_explanations'],
  middlegame_plans: ['structure', 'avoid', 'ideas', 'move_explanations'],
  opening_traps: ['title', 'explanation', 'move_explanations'],
  events: ['title', 'description'],
}

const env = Object.fromEntries(
  readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => l.includes('='))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
)

/** Tot textul dintr-o valoare, oricât de adânc ar fi îngropat în JSON. */
function* texte(v) {
  if (typeof v === 'string') yield v
  else if (v && typeof v === 'object') for (const x of Object.values(v)) yield* texte(x)
}

const gasite = []
let cautate = 0

for (const [tabel, coloane] of Object.entries(TABELE)) {
  const raspuns = await fetch(
    `${env.VITE_SUPABASE_URL}/rest/v1/${tabel}?select=${coloane.join(',')}&limit=5000`,
    { headers: { apikey: env.VITE_SUPABASE_ANON_KEY } },
  )
  if (!raspuns.ok) {
    gasite.push({ tabel, fraza: `nu se poate citi (${raspuns.status})`, regula: null })
    continue
  }
  for (const rand of await raspuns.json()) {
    cautate++
    for (const text of texte(rand)) {
      for (const regula of INTERZISE) {
        regula.ce.lastIndex = 0
        if (!regula.ce.test(text)) continue
        for (const fraza of text.split(/(?<=[.!?;:])\s+|\|/)) {
          regula.ce.lastIndex = 0
          if (regula.ce.test(fraza)) gasite.push({ tabel, fraza: fraza.trim(), regula })
        }
      }
    }
  }
}

console.log(`Rânduri de conţinut citite din baza reală: ${cautate}`)

if (gasite.length === 0) {
  console.log('Niciun cuvânt interzis. ✓')
} else {
  console.log(`\nCUVINTE INTERZISE: ${gasite.length}\n`)
  for (const g of gasite) {
    console.log(`  [${g.tabel}] ${g.fraza}`)
    if (g.regula) console.log(`     „${g.regula.gresit}" → se scrie ${g.regula.corect}\n`)
  }
  process.exitCode = 1
}
