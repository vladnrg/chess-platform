/**
 * Ce joacă adversarul între paşi e o mutare pe care ar face-o un om?
 *
 * `mutari-cu-motorul.mjs` verifică mutările cerute de la elev. Răspunsurile
 * botului le juca fără să le întrebe nimic — şi acolo era greşeala: la „cursa
 * pionilor", unde toată cerinţa e „nu ai timp de pierdut, altfel pionul lui
 * ajunge primul", negrul îşi plimba regele şi nu împingea pionul niciodată.
 * Exerciţiul îşi contrazicea propria poveste, iar elevul învăţa că se câştigă
 * fiindcă adversarul face gafă după gafă.
 *
 *   node --experimental-strip-types --import ./scripts/verificari/register.mjs \
 *        scripts/verificari/raspunsurile-botului.mjs
 *
 * Ce se cere de la un răspuns: să nu piardă mai mult de `PRAG_PIERDUT` faţă de
 * cea mai bună mutare din poziţie. Nu se cere să *fie* cea mai bună — un om
 * rezonabil nu joacă mereu prima alegere a motorului, iar o lecţie are voie să
 * aleagă dintre mutările bune pe cea care se vede mai limpede. Se cere doar să
 * nu fie o gafă.
 *
 * Poziţiile pierdute intră pe aceeaşi măsură. Când negrul e oricum mat, orice
 * mutare „pierde", dar nu toate la fel: ce se compară acolo e cât rezistă, iar
 * o mutare care scurtează matul împotriva ei e o predare, nu o apărare. Un mat
 * mai scurt cu o mutare face 100 pe scara din `caPuncte`, deci pragul de 150
 * lasă să treacă egalităţile şi opreşte predările. Aşa s-a prins pasul doi din
 * cursă: Rb6 era mat în −11, iar b3 mat în −13.
 *
 * CE NU POATE PRINDE. Motorul spune dacă mutarea strică ceva, nu dacă e mutarea
 * pe care ar face-o un om. La pasul întâi al aceleiaşi curse, toate cele patru
 * mutări legale sunt mat în −13: pentru el, a-şi plimba regele şi a-şi împinge
 * pionul sunt acelaşi lucru. Pentru oricine se uită la tablă, nu. Judecata aia
 * rămâne a celui care scrie lecţia: răspunsul adversarului trebuie să se
 * potrivească cu povestea pe care o spune exerciţiul. Rulează cu `--tot` ca să
 * vezi fiecare răspuns lângă alternativele lui, nu doar pe cele semnalate.
 *
 * Durează câteva minute: la fiecare poziţie motorul cântăreşte toate mutările
 * legale deodată, nu doar pe cea mai bună.
 */
import { readFileSync } from 'node:fs'
import { Chess } from 'chess.js'
import { analizeaza, scrieScor } from './motor.mjs'

const ADANCIME = 26
/** Cât are voie să piardă un răspuns faţă de cel mai bun, în centipioni. */
const PRAG_PIERDUT = 150
/**
 * Câte mutări cântăreşte deodată, şi de ce nu mai multe.
 *
 * Adâncimea trebuie să fie mare cât să iasă mat în TOATE variantele deodată.
 * Altfel una se termină în „mat în −16" şi vecina ei în „−58.84", fiindcă în a
 * doua motorul n-a apucat să vadă matul — iar atunci lista se aşază pe dos şi
 * mutarea bună pare gafă. Adâncime mare cere listă scurtă; o mutare care nu e
 * nici între primele atâtea oricum n-ar fi alegerea unui om.
 */
const MAX_VARIANTE = 12
/** `--tot`: arată fiecare răspuns, nu doar gafele. */
const TOT = process.argv.includes('--tot')

const env = Object.fromEntries(
  readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => l.includes('='))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
)

/** Evaluarea ca un singur număr, ca să se poată compara mat cu centipioni. */
function caPuncte(r) {
  if (!r) return 0
  if (r.fel !== 'mate') return r.scor
  return r.scor > 0 ? 100000 - r.scor * 100 : -100000 - r.scor * 100
}

const lectii = await (await fetch(
  `${env.VITE_SUPABASE_URL}/rest/v1/lessons?select=title,exercises&order=order_index`,
  { headers: { apikey: env.VITE_SUPABASE_ANON_KEY } },
)).json()

let verificate = 0
const gafe = []

for (const lectie of lectii) {
  for (const ex of lectie.exercises ?? []) {
    if (ex.type !== 'move_piece' || !ex.line) continue

    let joc
    try {
      joc = new Chess(ex.fen)
    } catch {
      continue
    }

    for (const pas of ex.line) {
      joc.move({ from: pas.move.slice(0, 2), to: pas.move.slice(2, 4), promotion: pas.move.slice(4) || undefined })
      if (!pas.reply) continue

      verificate++
      const inainte = joc.fen()
      // O SINGURĂ căutare, cu toate mutările legale în ea. Două căutări nu se
      // pot compara, oricât ar părea că da: la aceeaşi adâncime, motorul vede
      // matul când se uită la o singură mutare şi nu-l vede când le cântăreşte
      // pe toate deodată — aşa ieşea „mat în −15" pus lângă „−58.84" şi orice
      // răspuns părea o gafă. În aceeaşi listă, scorurile sunt pe aceeaşi scară.
      const variante = await analizeaza(inainte, {
        adancime: ADANCIME,
        variante: Math.min(joc.moves().length, MAX_VARIANTE),
      })
      const celMaiBun = variante[0]
      // Lipsă din listă = nici măcar între primele atâtea mutări, deci sigur nu
      // e o alegere de om.
      const obtinut = variante.find(v => v.linie[0] === pas.reply) ?? null

      joc.move({ from: pas.reply.slice(0, 2), to: pas.reply.slice(2, 4), promotion: pas.reply.slice(4) || undefined })

      // Cu amândouă pe aceeaşi scară, o singură scădere ajunge. Un mat mai
      // scurt cu o mutare face exact 100, deci pragul de 150 lasă loc pentru
      // mutările la fel de bune şi prinde predările.
      const pierdut = obtinut ? caPuncte(celMaiBun) - caPuncte(obtinut) : Infinity
      const eGafa = pierdut > PRAG_PIERDUT

      if (eGafa) {
        gafe.push({
          lectie: lectie.title,
          ex,
          pas,
          fen: inainte,
          celMaiBun,
          obtinut,
          alternative: variante.slice(0, 3),
        })
      }

      if (TOT) {
        console.log(`[${lectie.title}] ${pas.instruction ?? ex.instruction}`)
        console.log(`   botul joacă ${pas.reply} → ${obtinut ? scrieScor(obtinut) : `nici în primele ${MAX_VARIANTE}`}${eGafa ? '   ← gafă' : ''}`)
        for (const v of variante.slice(0, 3)) {
          console.log(`   ar fi jucat ${v.linie[0].padEnd(6)} → ${scrieScor(v).padStart(9)}   ${v.linie.slice(0, 6).join(' ')}`)
        }
        console.log()
      }
    }
  }
}

console.log(`Răspunsuri ale adversarului, trecute prin motor: ${verificate}`)

if (gafe.length === 0) {
  console.log('\nToate răspunsurile sunt mutări pe care le-ar face un om. ✓')
} else {
  console.log(`\nRĂSPUNSURI CARE SUNT GAFE: ${gafe.length}\n`)
  for (const g of gafe) {
    console.log(`  [${g.lectie}] ${g.pas.instruction ?? g.ex.instruction}`)
    console.log(`     poziţia lui: ${g.fen}`)
    console.log(`     botul joacă:  ${g.pas.reply.padEnd(6)} → ${(g.obtinut ? scrieScor(g.obtinut) : 'în afara listei').padStart(9)}`)
    for (const v of g.alternative) {
      console.log(`     ar fi jucat:  ${v.linie[0].padEnd(6)} → ${scrieScor(v).padStart(9)}   ${v.linie.slice(0, 6).join(' ')}`)
    }
    console.log()
  }
  process.exitCode = 1
}
