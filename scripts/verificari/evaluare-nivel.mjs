// Trece prin motor întrebările de tactică din evaluarea de nivel (onboarding).
//
// Pentru fiecare: care sunt cele mai bune mutări din poziţie şi cât valorează
// mutarea cerută. O întrebare e bună doar dacă mutarea cerută e cea mai bună —
// sau la acelaşi deznodământ cu ea —, nu doar legală. Vezi memoria
// „pozitiile-se-trec-prin-motor".
//
// Rulare:
//   node --experimental-strip-types --import ./scripts/verificari/register.mjs scripts/verificari/evaluare-nivel.mjs

import { Chess } from 'chess.js'
import { TACTICS_QUESTIONS } from '@/pages/Onboarding/assessmentData'
import { analizeaza, scrieScor } from './motor.mjs'

function san(fen, uci) {
  try {
    return new Chess(fen).move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] ?? 'q' }).san
  } catch {
    return `${uci} (ILEGALĂ)`
  }
}

/** Scorul pentru cel care a mutat, după mutarea `uci`. */
async function dupaMutare(fen, uci) {
  const g = new Chess(fen)
  g.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] ?? 'q' })
  if (g.isCheckmate()) return 'mat'
  const [r] = await analizeaza(g.fen(), { adancime: 20 })
  if (!r) return '?'
  // Scorul e al adversarului; îl întoarcem spre cel care a mutat.
  return scrieScor({ ...r, scor: -r.scor })
}

for (const q of TACTICS_QUESTIONS) {
  const top = await analizeaza(q.fen, { adancime: 20, variante: 3 })
  const ceruta = await dupaMutare(q.fen, q.correctMove)
  console.log(`\n${q.id}  „${q.hint}"`)
  console.log(`   cerută: ${san(q.fen, q.correctMove)} → ${ceruta}`)
  for (const r of top) console.log(`   motor ${r.nr}: ${san(q.fen, r.linie[0])} → ${scrieScor(r)}`)
}
