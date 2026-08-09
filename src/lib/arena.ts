/**
 * Proba de foc — reguli de punctare şi reglarea forţei motorului.
 *
 * Tot ce e aici e funcţie pură: intră numere, ies numere. Partea de tablă şi de
 * motor stă în pagină; aici stă doar ce trebuie să fie corect şi verificabil
 * fără browser.
 */

/** O rundă, aşa cum o trimitem la server la finalul probei. */
export interface ArenaRoundResult {
  course_slug: string
  label: string
  kind: 'deschidere' | 'dezavantaj'
  start_fen: string
  base_cp: number
  final_cp: number
  moves_uci: string
}

/** Setările trimise motorului pentru o forţă ţintă. */
export interface EngineSettings {
  /** `Skill Level` 0–20 — singurul buton care slăbeşte motorul sub 1320. */
  skill: number
  /** `UCI_LimitStrength` + `UCI_Elo`. Motorul refuză sub 1320, deci nu-l cerem. */
  limitStrength: boolean
  elo: number
  /** Milisecunde de gândire. Ţine ritmul, nu forţa. */
  movetime: number
}

/**
 * Pragurile motorului, citite de la el, nu presupuse.
 *
 * `uci` răspunde exact: `option name UCI_Elo type spin default 1320 min 1320
 * max 3190`. Sub 1320 valoarea e ignorată în tăcere — ceri 600, primeşti 1320.
 */
export const ELO_FLOOR = 1320
export const ELO_CEILING = 3190

/** Cât de mult peste jucător joacă motorul. Din cerinţa iniţială. */
export const ELO_HANDICAP = 200

/**
 * Evaluările se plafonează la ±10 pioni, iar matul valorează exact plafonul.
 *
 * Fără plafon, o rundă terminată cu mat ar valora cât toate celelalte la un loc
 * (motorul dă ±30000 pentru mat), iar clasamentul ar măsura „ai dat mat o dată",
 * nu „joci bine".
 */
export const EVAL_CAP = 1000

/**
 * Forţa motorului pentru un jucător de un anumit nivel.
 *
 * Măsurat pe motorul din proiect (Stockfish 18 lite, un fir):
 *   - `movetime` e un buton prost pentru forţă: la 50ms ajunge deja la
 *     adâncimea 13, adică joacă mult peste nivelul de club.
 *   - `Skill Level` e butonul care funcţionează: la 10 sau mai puţin pierde
 *     ~40–50 sutimi de pion pe mutare, la 14 pierde 10, la 20 pierde 3.
 *
 * Sub 1320 folosim doar Skill Level. Peste, trecem pe `UCI_Elo`, care e mai
 * fin — dar atenţie: când `UCI_LimitStrength` e pornit, motorul ignoră Skill
 * Level, deci nu are rost să-l mai coborâm acolo.
 */
export function engineSettings(targetElo: number): EngineSettings {
  const elo = Math.round(targetElo)

  // Ritmul: destul cât să joace decent, destul de scurt cât să nu aştepţi.
  const movetime = Math.round(200 + clamp((elo - 1000) / 4, 0, 600))

  if (elo >= ELO_FLOOR) {
    return {
      skill: 20,
      limitStrength: true,
      elo: Math.min(elo, ELO_CEILING),
      movetime,
    }
  }

  // 800 → Skill 0, 1250 → Skill 10. Mai jos de Skill 0 motorul nu poate coborî:
  // ăsta e podeaua reală a adversarului, oricât de începător ar fi jucătorul.
  return {
    skill: Math.round(clamp((elo - 800) / 45, 0, 10)),
    limitStrength: false,
    elo,
    movetime,
  }
}

/** Nivelul ţintă al adversarului, pornind de la puterea estimată a jucătorului. */
export function targetEloFor(playerRating: number | null | undefined, fallback = 900): number {
  const base = playerRating && playerRating > 0 ? playerRating : fallback
  return clamp(Math.round(base) + ELO_HANDICAP, 600, ELO_CEILING)
}

/**
 * Evaluarea brută a motorului, adusă la perspectiva jucătorului.
 *
 * UCI dă scorul din perspectiva celui la mutare, nu a albului. Fără conversia
 * asta, jumătate din runde ar fi punctate invers — iar greşeala ar fi invizibilă,
 * fiindcă numerele ar arăta perfect rezonabil.
 */
export function toUserCp(
  raw: { cp: number; mate?: number },
  fen: string,
  userColor: 'white' | 'black',
): number {
  const sideToMove = fen.split(' ')[1] === 'b' ? 'black' : 'white'
  const signed = raw.mate !== undefined
    ? (raw.mate > 0 ? EVAL_CAP : -EVAL_CAP)
    : clamp(raw.cp, -EVAL_CAP, EVAL_CAP)
  return sideToMove === userColor ? signed : -signed
}

/**
 * Punctajul unei runde: cât ai îmbunătăţit poziţia faţă de plecare.
 *
 * Regula nu se uită la cât de bună era poziţia iniţială — de asta aceeaşi
 * formulă punctează şi „am construit un avantaj din deschidere", şi „am
 * recuperat dintr-un dezavantaj".
 */
export function roundGain(baseCp: number, finalCp: number): number {
  return clamp(finalCp - baseCp, -2 * EVAL_CAP, 2 * EVAL_CAP)
}

/** Suma rundelor — scorul probei. */
export function runScore(rounds: { base_cp: number; final_cp: number }[]): number {
  return rounds.reduce((s, r) => s + roundGain(r.base_cp, r.final_cp), 0)
}

/** „+1.20" / „−0.35" / „0.00", cu semnul făcut vizibil. */
export function formatPawns(cp: number): string {
  const pawns = cp / 100
  if (Math.abs(pawns) < 0.005) return '0.00'
  return `${pawns > 0 ? '+' : '−'}${Math.abs(pawns).toFixed(2)}`
}

/** Cum se cheamă un rezultat, în cuvinte. */
export function scoreVerdict(cp: number): string {
  if (cp >= 300) return 'Excelent'
  if (cp >= 120) return 'Foarte bine'
  if (cp >= 30) return 'Bine'
  if (cp > -30) return 'Ai ţinut poziţia'
  if (cp > -150) return 'Ai pierdut teren'
  return 'Greu de tot'
}

/**
 * XP-ul estimat, ca să-l putem arăta înainte de trimitere.
 *
 * Trebuie să dea acelaşi rezultat ca `arena_submit` din migrarea 043. Dacă se
 * schimbă acolo, se schimbă şi aici — altfel utilizatorul vede o cifră şi
 * primeşte alta.
 */
export function estimateXp(scoreCp: number): number {
  return 10 + Math.min(60, Math.max(0, Math.trunc(scoreCp / 20)))
}

/**
 * Care e „greşeala plauzibilă" dintre variantele propuse de motor?
 *
 * Pentru rundele de tip dezavantaj nu ţinem poziţii scrise de mână: punem
 * motorul să aleagă în locul tău o mutare care pierde aproximativ un pion —
 * exact genul de greşeală pe care ar face-o un om. Alegem cea mai apropiată de
 * ţintă dintre variantele întoarse, ignorând-o pe cea mai bună.
 *
 * `lines` vine de la motor cu scorul din perspectiva celui la mutare, adică
 * chiar a jucătorului: cu cât mai mic, cu atât mai rău pentru el.
 */
export function pickPlausibleMistake(
  lines: { cp?: number; mate?: number; pv: string[] }[],
  targetLossCp = 110,
): string | null {
  const usable = lines.filter(l => l.pv.length > 0 && l.mate === undefined && l.cp !== undefined)
  if (usable.length === 0) return null

  // Sortăm după evaluare, nu ne bazăm pe ordinea din listă: motorul trimite
  // variantele pe măsură ce coboară în adâncime, aşa că slot-ul 2 poate purta
  // încă un rezultat mai vechi decât slot-ul 1.
  const sorted = [...usable].sort((a, b) => (b.cp as number) - (a.cp as number))
  const bestCp = sorted[0].cp as number

  // Aceeaşi mutare poate apărea în două slot-uri, măsurată la adâncimi diferite.
  // Fără eliminarea duplicatelor, „greşeala" aleasă putea fi chiar mutarea cea
  // mai bună — iar runda de dezavantaj devenea în tăcere una obişnuită.
  const seen = new Set<string>([sorted[0].pv[0]])
  const candidates: typeof sorted = []
  for (const l of sorted.slice(1)) {
    if (seen.has(l.pv[0])) continue
    seen.add(l.pv[0])
    candidates.push(l)
  }

  // O singură mutare distinctă înseamnă că nu există alternativă de ales.
  if (candidates.length === 0) return null

  const wanted = bestCp - targetLossCp
  let best = candidates[0]
  for (const l of candidates) {
    if (Math.abs((l.cp as number) - wanted) < Math.abs((best.cp as number) - wanted)) best = l
  }
  return best.pv[0]
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}
