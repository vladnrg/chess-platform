/**
 * Verifică regulile Probei de foc fără browser şi fără bază de date.
 *
 * Rulare: node --experimental-strip-types scripts/verify-arena.ts
 */
import {
  engineSettings, targetEloFor, toUserCp, roundGain, runScore,
  formatPawns, estimateXp, pickPlausibleMistake, ELO_FLOOR, ELO_CEILING,
} from '../src/lib/arena.ts'

let pass = 0
const fails: string[] = []

function check(name: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want)
  if (ok) pass++
  else fails.push(`${name}\n    aşteptat: ${JSON.stringify(want)}\n    obţinut:  ${JSON.stringify(got)}`)
}
function ok(name: string, cond: boolean) {
  if (cond) pass++
  else fails.push(name)
}

// ---- forţa motorului -------------------------------------------------------
check('800 → Skill 0, fără LimitStrength', engineSettings(800).skill, 0)
ok('800 nu foloseşte UCI_Elo', engineSettings(800).limitStrength === false)
check('1250 → Skill 10', engineSettings(1250).skill, 10)
ok('1319 rămâne pe Skill Level', engineSettings(1319).limitStrength === false)
ok('1320 trece pe UCI_Elo', engineSettings(ELO_FLOOR).limitStrength === true)
check('1320 cere exact 1320', engineSettings(ELO_FLOOR).elo, ELO_FLOOR)
check('peste plafon se plafonează', engineSettings(5000).elo, ELO_CEILING)
ok('Skill Level nu iese din 0–20',
  [600, 900, 1100, 1250, 1319, 1500, 3000].every(e => {
    const s = engineSettings(e).skill
    return s >= 0 && s <= 20
  }))
ok('timpul de gândire creşte cu nivelul',
  engineSettings(800).movetime <= engineSettings(1500).movetime &&
  engineSettings(1500).movetime <= engineSettings(2800).movetime)
ok('timpul de gândire rămâne sub o secundă',
  [600, 1200, 2000, 3190].every(e => engineSettings(e).movetime <= 800))

// ---- nivelul ţintă ---------------------------------------------------------
check('900 → adversar de 1100', targetEloFor(900), 1100)
check('fără rating, pornim de la 900', targetEloFor(null), 1100)
check('nu depăşim plafonul motorului', targetEloFor(3100), ELO_CEILING)

// ---- semnul evaluării (locul unde greşeala ar fi invizibilă) ---------------
const wMove = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
const bMove = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1'
check('alb la mutare, user alb', toUserCp({ cp: 50 }, wMove, 'white'), 50)
check('alb la mutare, user negru', toUserCp({ cp: 50 }, wMove, 'black'), -50)
check('negru la mutare, user negru', toUserCp({ cp: 50 }, bMove, 'black'), 50)
check('negru la mutare, user alb', toUserCp({ cp: 50 }, bMove, 'white'), -50)
check('matul tău = plafonul', toUserCp({ cp: 30000, mate: 3 }, wMove, 'white'), 1000)
check('matul lui = minus plafonul', toUserCp({ cp: 30000, mate: 3 }, wMove, 'black'), -1000)
check('evaluările uriaşe se plafonează', toUserCp({ cp: 4000 }, wMove, 'white'), 1000)

// ---- punctarea, adică unificarea celor două idei ---------------------------
check('construit: 0.00 → +1.20 valorează 120', roundGain(0, 120), 120)
check('recuperat: −1.20 → 0.00 valorează tot 120', roundGain(-120, 0), 120)
ok('ACEEAŞI regulă punctează şi construcţia, şi recuperarea',
  roundGain(0, 120) === roundGain(-120, 0))
check('pierderea de teren e negativă', roundGain(50, -70), -120)
check('scorul probei e suma rundelor',
  runScore([
    { base_cp: 0, final_cp: 120 },
    { base_cp: -120, final_cp: 0 },
    { base_cp: 20, final_cp: -30 },
  ]), 190)

// ---- afişare ---------------------------------------------------------------
check('+1.20', formatPawns(120), '+1.20')
check('−0.35', formatPawns(-35), '−0.35')
check('zero fără semn', formatPawns(0), '0.00')

// ---- XP: trebuie să dea exact ce dă migrarea 043 ---------------------------
check('proba dusă la capăt = 10 XP', estimateXp(0), 10)
check('100 de sutimi = 15 XP', estimateXp(100), 15)
check('plafon la 70', estimateXp(5000), 70)
check('scor negativ nu ia XP negativ', estimateXp(-500), 10)
ok('formula nu sare peste plafon nicăieri',
  [-2000, -1, 0, 1, 19, 20, 1199, 1200, 1201, 99999]
    .every(cp => { const x = estimateXp(cp); return x >= 10 && x <= 70 }))

// ---- greşeala plauzibilă ---------------------------------------------------
check('alege pierderea cea mai apropiată de un pion',
  pickPlausibleMistake([
    { cp: 50, pv: ['e2e4'] },
    { cp: -60, pv: ['b1a3'] },
    { cp: -400, pv: ['g1h3'] },
  ]), 'b1a3')
check('nu alege niciodată mutarea cea mai bună',
  pickPlausibleMistake([
    { cp: 300, pv: ['d2d4'] },
    { cp: 290, pv: ['g1f3'] },
  ]), 'g1f3')
check('o singură variantă → nu există greşeală de ales',
  pickPlausibleMistake([{ cp: 10, pv: ['a2a3'] }]), null)
check('numai maturi → nimic de ales', pickPlausibleMistake([{ mate: 2, pv: ['h7h8q'] }]), null)
check('listă goală → nimic', pickPlausibleMistake([]), null)

// Cazul găsit pe motorul real: acelaşi prim-mutare raportat în două slot-uri,
// fiindcă variantele vin de la adâncimi diferite. Fără eliminarea duplicatelor,
// „greşeala" aleasă era chiar mutarea cea mai bună.
check('duplicatul primei variante nu poate fi greşeala',
  pickPlausibleMistake([
    { cp: -43, pv: ['g8f6'] },
    { cp: -44, pv: ['g8f6'] },
    { cp: -52, pv: ['c6d4'] },
    { cp: -54, pv: ['g8e7'] },
  ]), 'g8e7')
check('toate variantele aceeaşi mutare → nimic de ales',
  pickPlausibleMistake([
    { cp: -43, pv: ['g8f6'] },
    { cp: -44, pv: ['g8f6'] },
  ]), null)
check('ordinea din listă nu contează, doar evaluarea',
  pickPlausibleMistake([
    { cp: -200, pv: ['a7a6'] },
    { cp: 50, pv: ['e7e5'] },
    { cp: -60, pv: ['d7d5'] },
  ]), 'd7d5')
ok('greşeala nu e niciodată mutarea cea mai bine evaluată',
  (() => {
    const lines = [
      { cp: 120, pv: ['d2d4'] },
      { cp: 118, pv: ['g1f3'] },
      { cp: 10, pv: ['b1c3'] },
    ]
    return pickPlausibleMistake(lines) !== 'd2d4'
  })())

// ---------------------------------------------------------------------------
console.log(fails.length === 0
  ? `Toate cele ${pass} verificări trec.`
  : `${pass} trec, ${fails.length} PICĂ:\n\n  - ${fails.join('\n  - ')}`)
process.exit(fails.length === 0 ? 0 : 1)
