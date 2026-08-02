import type { MatchReason } from '@/lib/supabase'

/**
 * Mesajele de la finalul partidei.
 *
 * Voce unitară: metafora spălatului, legată de numele platformei. Mesajul e gluma;
 * deasupra lui rămâne o etichetă factuală („Ai câștigat" / „Ai pierdut" / „Remiză"),
 * fiindcă din „Apă călâie" un copil de 10 ani n-are cum să deducă rezultatul.
 *
 * ── AICI SE EDITEAZĂ TEXTELE ──────────────────────────────────────────────────
 * Fiecare situaţie are mai multe variante. Se pot adăuga sau şterge liber — nu
 * trebuie atins nimic altundeva.
 *
 * Alegerea variantei e determinată de id-ul partidei, nu aleatorie: aceeaşi
 * partidă arată mereu acelaşi mesaj. Altfel textul s-ar schimba la fiecare
 * redesenare, iar revenind peste o oră ai citi altceva decât prima dată.
 */

// ── VICTORII ────────────────────────────────────────────────────────────────

/** Victorie strânsă, fără strălucire. */
const WIN_MODEST: string[] = [
  'Curățenie de rutină',
  'L-ai șters de pe tablă',
  'Încă o pată scoasă',
  'Spălat la program scurt',
  'Ai făcut doar puțină ordine',
  'Curat, dar nu lună',
  'L-ai clătit ușor',
  'Detergent standard, rezultat standard',
]

/**
 * Victorie zdrobitoare — material mult peste adversar la final.
 *
 * SCRISE DE MINE, de înlocuit: categoria n-avea texte, dar acum e detectabilă,
 * iar „Curat, dar nu lună" după o demolare ar suna fals.
 */
const WIN_CRUSHING: string[] = [
  'L-ai băgat la 90 de grade',
  'Program intensiv, cu prespălare',
  'Nu doar l-ai spălat — l-ai și călcat',
  'Curățenie generală',
]

/** Victorie cu ceasul aproape gol. */
const WIN_TIME_SCRAMBLE: string[] = [
  'Spălat rapid, la secundă',
  'Program scurt de 30 de secunde',
  'Ai stors totul în ultima clipă',
  'Curățenie contra cronometru',
  'L-ai uscat fix înainte să sune alarma',
]

/** Adversarul a rămas fără timp. */
const WIN_TIMEOUT: string[] = [
  'S-a înecat singur în lighean',
  'L-ai lăsat la înmuiat prea mult',
  'Uscat de timp',
  'A uitat rufele în mașină',
  'A ținut să iasă cu degetele încrețite',
]

// ── ÎNFRÂNGERI ──────────────────────────────────────────────────────────────

/** Înfrângere la limită, nu usturătoare. */
const LOSS_TOLERABLE: string[] = [
  'Te-a cam săpunit',
  'Ai ieșit puțin șifonat',
  'O pată mică pe palmares',
  'Te-a băgat la spălat, dar la 30 de grade',
  'Nimic ce nu iese la prima spălare',
  'Te-a stors, dar doar pe jumătate',
]

/**
 * Înfrângere grea — material mult sub adversar la final.
 *
 * SCRISE DE MINE, de înlocuit: aceeaşi situaţie ca la victoria zdrobitoare.
 */
const LOSS_HEAVY: string[] = [
  'Te-a băgat la fiert',
  'Program lung, la temperatură mare',
  'Ai ieșit din mașină cu tot cu culoare',
]

// ── REMIZE ──────────────────────────────────────────────────────────────────
const DRAW_DULL: string[] = [
  'Apă călâie',
  'Ambii ați ieșit curați',
  'Ați împărțit detergentul frățește',
  'Spălare pe uscat',
  'Program eco: consum minim, rezultat minim',
  'Scorul a rămas imaculat, ca la început',
  'Zero pete, zero emoții',
  'V-ați îmbăiat în ape calme',
]

// ── PRAGURI ─────────────────────────────────────────────────────────────────

/** Peste atâta material în plus, victoria nu mai e „de rutină". */
const CRUSHING_MATERIAL = 5
/** Sub atâta timp rămas, victoria a fost la limita ceasului. */
const SCRAMBLE_MS = 20_000
/** Sau sub atâta parte din timpul iniţial — pentru partidele lungi. */
const SCRAMBLE_RATIO = 0.08

/** Ce ştim despre cum s-a terminat partida, din perspectiva unui jucător. */
export interface MatchShape {
  outcome: 'win' | 'loss' | 'draw'
  reason: MatchReason | null
  /** Diferenţa de material la final, din perspectiva jucătorului. */
  materialDiff: number
  /** Timpul rămas al jucătorului, în milisecunde. */
  timeLeftMs: number
  /** Timpul de la începutul partidei, ca să putem raporta. */
  initialMs: number
}

export interface MatchMessage {
  /** Eticheta factuală, ca rezultatul să fie limpede. */
  label: string
  /** Gluma — titlul mare. */
  text: string
}

export function matchMessage(shape: MatchShape, seed: string): MatchMessage {
  const bucket = bucketFor(shape)
  const label = shape.outcome === 'draw' ? 'Remiză' : shape.outcome === 'win' ? 'Ai câștigat' : 'Ai pierdut'
  return { label, text: bucket[hash(seed) % bucket.length] }
}

function bucketFor(shape: MatchShape): string[] {
  if (shape.outcome === 'draw') return DRAW_DULL

  if (shape.outcome === 'win') {
    // Mecanismul are întâietate: dacă adversarul a căzut la timp, asta e povestea
    if (shape.reason === 'timeout') return WIN_TIMEOUT

    const scramble =
      shape.timeLeftMs < SCRAMBLE_MS ||
      (shape.initialMs > 0 && shape.timeLeftMs < shape.initialMs * SCRAMBLE_RATIO)
    if (scramble) return WIN_TIME_SCRAMBLE

    return shape.materialDiff >= CRUSHING_MATERIAL ? WIN_CRUSHING : WIN_MODEST
  }

  return shape.materialDiff <= -CRUSHING_MATERIAL ? LOSS_HEAVY : LOSS_TOLERABLE
}

// ── Măsurarea partidei ──────────────────────────────────────────────────────

const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 }

/**
 * Materialul rămas pe tablă, citit direct din poziţia finală.
 *
 * Poziţia e primul câmp din FEN: literele mari sunt piesele albe, cele mici ale
 * negrului. Nu e nevoie de motor de şah pentru o numărătoare.
 */
export function materialBalance(fen: string): { white: number; black: number } {
  const placement = fen.split(' ')[0] ?? ''
  let white = 0
  let black = 0

  for (const ch of placement) {
    const value = PIECE_VALUES[ch.toLowerCase()]
    if (!value) continue
    if (ch === ch.toLowerCase()) black += value
    else white += value
  }

  return { white, black }
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
