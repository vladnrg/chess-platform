import type { MatchReason } from '@/lib/supabase'

/**
 * Mesajele de la finalul partidei.
 *
 * ── AICI SE EDITEAZĂ TEXTELE ──────────────────────────────────────────────────
 * Fiecare situaţie are mai multe variante; se alege una în funcţie de partidă.
 * Poţi adăuga sau şterge variante liber — nu trebuie nimic altundeva.
 *
 * Alegerea e determinată de id-ul partidei, nu aleatorie: aceeaşi partidă arată
 * mereu acelaşi mesaj. Altfel textul s-ar schimba la fiecare redesenare, iar dacă
 * revii peste o oră la partidă ai citi altceva decât prima dată.
 *
 * Tonul: la victorie sărbătorim fără emfază, la înfrângere rămânem calzi — sunt
 * şi copii pe platformă, iar o partidă pierdută nu trebuie să sune ca un verdict.
 */

export interface MatchMessage {
  title: string
  line: string
}

type Bucket = MatchMessage[]

// ── VICTORII ────────────────────────────────────────────────────────────────
const WIN_CHECKMATE: Bucket = [
  { title: 'Mat!', line: 'L-ai încolțit și n-a mai avut unde să fugă.' },
  { title: 'Mat!', line: 'Exact așa arată o partidă dusă până la capăt.' },
  { title: 'Ai câștigat!', line: 'Regele advers n-a mai avut nicio scăpare.' },
]

const WIN_RESIGN: Bucket = [
  { title: 'Ai câștigat!', line: 'Adversarul a abandonat — a văzut unde duce poziția.' },
  { title: 'Victorie', line: 'A cedat înainte de final. Presiunea și-a spus cuvântul.' },
]

const WIN_TIMEOUT: Bucket = [
  { title: 'Ai câștigat!', line: 'I-a expirat timpul. Și ceasul face parte din joc.' },
  { title: 'Victorie la timp', line: 'Ai gândit mai repede când a contat.' },
]

const WIN_ABANDON: Bucket = [
  { title: 'Ai câștigat!', line: 'Adversarul a părăsit partida.' },
]

// ── ÎNFRÂNGERI ──────────────────────────────────────────────────────────────
const LOSS_CHECKMATE: Bucket = [
  { title: 'Ai pierdut', line: 'Uită-te încă o dată la poziție — unde s-a rupt firul?' },
  { title: 'Mat', line: 'S-a terminat urât, dar de-aici se învață cel mai mult.' },
  { title: 'Ai pierdut', line: 'Reia partida în minte. A doua oară o vezi venind.' },
]

const LOSS_RESIGN: Bucket = [
  { title: 'Ai abandonat', line: 'Uneori e cea mai bună decizie. Data viitoare, altfel.' },
  { title: 'Partidă cedată', line: 'Mai bine o partidă nouă decât una fără speranță.' },
]

const LOSS_TIMEOUT: Bucket = [
  { title: 'Timp expirat', line: 'Poziția era încă a ta. Doar ceasul n-a mai fost.' },
  { title: 'Ai pierdut la timp', line: 'Încearcă să te hotărăști mai repede în pozițiile simple.' },
]

const LOSS_ABANDON: Bucket = [
  { title: 'Partidă părăsită', line: 'Ai ieșit din partidă și s-a încheiat.' },
]

// ── REMIZE ──────────────────────────────────────────────────────────────────
const DRAW_AGREEMENT: Bucket = [
  { title: 'Remiză', line: 'V-ați înțeles. Un punct împărțit cinstit.' },
]

const DRAW_STALEMATE: Bucket = [
  { title: 'Pat', line: 'Regele n-are unde muta, dar nu e în șah. Remiză.' },
  { title: 'Pat — remiză', line: 'Atenție la pat când ai avantaj: se pierd victorii așa.' },
]

const DRAW_REPETITION: Bucket = [
  { title: 'Remiză prin repetiție', line: 'Aceeași poziție de trei ori. Niciunul n-a vrut să cedeze.' },
]

const DRAW_INSUFFICIENT: Bucket = [
  { title: 'Remiză', line: 'N-a mai rămas material cu care să se dea mat.' },
]

const DRAW_FIFTY: Bucket = [
  { title: 'Remiză', line: '50 de mutări fără captură și fără pion mutat.' },
]

const DRAW_FALLBACK: Bucket = [
  { title: 'Remiză', line: 'Partidă egală.' },
]

/** Mesajul potrivit pentru cum s-a încheiat partida şi din perspectiva cui. */
export function matchMessage(
  outcome: 'win' | 'loss' | 'draw',
  reason: MatchReason | null,
  seed: string
): MatchMessage {
  const bucket = bucketFor(outcome, reason)
  return bucket[hash(seed) % bucket.length]
}

function bucketFor(outcome: 'win' | 'loss' | 'draw', reason: MatchReason | null): Bucket {
  if (outcome === 'draw') {
    switch (reason) {
      case 'agreement': return DRAW_AGREEMENT
      case 'stalemate': return DRAW_STALEMATE
      case 'repetition': return DRAW_REPETITION
      case 'insufficient': return DRAW_INSUFFICIENT
      case 'fifty': return DRAW_FIFTY
      default: return DRAW_FALLBACK
    }
  }

  if (outcome === 'win') {
    switch (reason) {
      case 'checkmate': return WIN_CHECKMATE
      case 'resign': return WIN_RESIGN
      case 'timeout': return WIN_TIMEOUT
      case 'abandon': return WIN_ABANDON
      default: return WIN_CHECKMATE
    }
  }

  switch (reason) {
    case 'checkmate': return LOSS_CHECKMATE
    case 'resign': return LOSS_RESIGN
    case 'timeout': return LOSS_TIMEOUT
    case 'abandon': return LOSS_ABANDON
    default: return LOSS_CHECKMATE
  }
}

/**
 * Hash simplu şi stabil peste id-ul partidei. Funcţie pură — spre deosebire de
 * `Math.random()`, dă acelaşi rezultat de fiecare dată pentru aceeaşi partidă.
 */
function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}
