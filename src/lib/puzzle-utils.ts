import { Chess } from 'chess.js'
import type { LichessPuzzle } from './lichess'
import type { Puzzle } from '@/types'

export interface PuzzleState {
  game: Chess
  solutionMoves: string[]
  currentMoveIdx: number
  status: 'playing' | 'correct' | 'wrong' | 'opponent-moving'
  startTime: number
  waitingOpponent: boolean
}

// XP de bază pentru un puzzle, după rating
export function basePuzzleXp(rating: number): number {
  return rating < 1000 ? 10 : rating < 1500 ? 20 : 30
}

// Factor XP după nivelul maxim de indiciu folosit:
// 0 = niciun indiciu → integral; 1 = indiciu → 3/4; 2 = arată piesa → 1/4; 3 = arată mutarea → 0
export function hintXpFactor(level: number): number {
  return [1, 0.75, 0.25, 0][level] ?? 0
}

// Indiciu de nivel 1 („Dă-mi un indiciu"): o întrebare care orientează spre IDEE,
// FĂRĂ să dezvăluie ce piesă trebuie mutată (dezvăluirea piesei e treaba nivelului 2).
// Ton curios, nu condescendent — nu-l face pe jucător să se simtă prost.
export function buildSpecificHint(themes: string[]): string {
  if (themes.some(t => t.startsWith('mate'))) return 'Cum îl poți da mat pe regele advers în această poziție?'
  if (themes.includes('fork')) return 'Cum poți ataca două piese ale adversarului în același timp?'
  if (themes.includes('pin')) return 'Poți imobiliza o piesă a adversarului în fața uneia mai valoroase?'
  if (themes.includes('skewer') || themes.includes('xRayAttack')) return 'Poți forța o piesă valoroasă să se dea la o parte și să iei ce rămâne în spate?'
  if (themes.includes('discoveredAttack') || themes.includes('doubleCheck')) return 'Poți dezvălui un atac mutând o piesă din fața alteia?'
  if (themes.includes('capturingDefender')) return 'Poți elimina piesa care apără punctul cheie?'
  if (themes.includes('attraction') || themes.includes('deflection') || themes.includes('sacrifice')) return 'Merită să dai material pentru un atac decisiv aici?'
  return 'Cum poți câștiga material în această poziție?'
}

export function initPuzzleState(fen: string, movesStr: string): PuzzleState {
  const g = new Chess(fen)
  const moves = movesStr.split(' ').filter(Boolean)
  const firstMove = moves[0]
  if (firstMove) {
    const from = firstMove.slice(0, 2)
    const to = firstMove.slice(2, 4)
    const promotion = firstMove.length > 4 ? firstMove[4] : undefined
    const result = g.move({ from, to, promotion })
    if (!result) throw new Error(`Trigger move invalid: ${firstMove} on FEN: ${fen}`)
  }
  return {
    game: g,
    solutionMoves: moves,
    currentMoveIdx: 1,
    status: 'playing',
    startTime: Date.now(),
    waitingOpponent: false,
  }
}

export function analyzeWrongMove(
  fenBefore: string,
  playerMoveUci: string,
  correctMoveUci: string,
  puzzleThemes: string[],
): string {
  try {
    const gCorrect = new Chess(fenBefore)
    const correctResult = gCorrect.move({
      from: correctMoveUci.slice(0, 2),
      to: correctMoveUci.slice(2, 4),
      promotion: correctMoveUci[4] ?? undefined,
    })
    const correctIsCheck = !!(correctResult?.san?.includes('+') || correctResult?.san?.includes('#'))
    const correctIsCapture = !!correctResult?.captured

    const gPlayer = new Chess(fenBefore)
    const playerResult = gPlayer.move({
      from: playerMoveUci.slice(0, 2),
      to: playerMoveUci.slice(2, 4),
      promotion: playerMoveUci[4] ?? undefined,
    })
    const playerIsCapture = !!playerResult?.captured
    const playerIsCheck = !!(playerResult?.san?.includes('+'))

    // Mat disponibil
    if (puzzleThemes.some(t => ['mateIn1', 'mateIn2', 'mateIn3', 'smotheredMate', 'backRankMate'].includes(t))) {
      if (correctResult?.san?.includes('#')) {
        return 'Există mat disponibil în această poziție! Caută piesa care poate pune capăt imediat partidei.'
      }
      return 'Există o combinație de mat în această poziție. Calculează secvența cu atenție — regele adversarului e în pericol!'
    }

    // Șah decisiv ratat
    if (correctIsCheck && !playerIsCheck) {
      return 'Trebuia să dai șah mai întâi! Șahul forțează adversarul să răspundă și îți câștigă tempo decisiv.'
    }

    // Player a capturat, dar mutarea corectă nu e o captură.
    // NU presupune un „sacrificiu" — evaluează materialul: poate fi doar un schimb egal.
    if (playerIsCapture && !correctIsCapture) {
      const VAL: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 }
      const capturedVal = VAL[playerResult?.captured ?? ''] ?? 0
      const movingVal = VAL[playerResult?.piece ?? ''] ?? 0
      // După mutarea jucătorului e rândul adversarului — poate recaptura pe câmpul de sosire?
      const to = playerMoveUci.slice(2, 4)
      const canRecapture = gPlayer.moves({ verbose: true }).some((m: { to?: string; captured?: string }) => m.to === to && !!m.captured)

      if (canRecapture && capturedVal < movingVal) {
        return 'Dai mai mult material decât iei înapoi cu această captură, iar poziția nu-ți oferă compensație. Verifică întâi dacă schimbul e avantajos.'
      }
      if (canRecapture && capturedVal === movingVal) {
        return 'Asta e doar un schimb egal de material — există o mutare mai puternică decât un simplu schimb.'
      }
      return 'Captura câștigă material, dar nu e cea mai bună alegere — există o mutare și mai benefică în această poziție.'
    }

    // Material gratuit ratat
    if (correctIsCapture && !playerIsCapture) {
      return 'Puteai câștiga material gratuit! Adversarul a lăsat o piesă fără apărare — nu lăsa niciodată un cadou pe tablă.'
    }

    // Mutare pasivă când există o variantă agresivă
    if (puzzleThemes.includes('fork')) {
      return 'Există posibilitatea unui atac dublu în această poziție! Caută piesa care poate amenința simultan două piese ale adversarului.'
    }

    if (puzzleThemes.includes('pin')) {
      return 'Există o piesă legată care poate fi exploatată. Atacând piesa legată câștigi material fără contraatac!'
    }

    if (puzzleThemes.includes('skewer') || puzzleThemes.includes('xRayAttack')) {
      return 'Există o "frigare" disponibilă — atacă piesa valoroasă din față și câștigă ce e în spatele ei!'
    }

    if (puzzleThemes.includes('discoveredAttack') || puzzleThemes.includes('doubleCheck')) {
      return 'Există un atac prin descoperire! Mișcând o piesă, dezvălui atacul alteia și câștigi material cu tempo.'
    }

    if (puzzleThemes.includes('attraction') || puzzleThemes.includes('deflection')) {
      return 'Trebuia să atragi sau să deviezi o piesă cheie a adversarului. Sacrificiul este uneori prețul corect!'
    }

    if (puzzleThemes.includes('capturingDefender')) {
      return 'Trebuia să elimini apărătorul cheie al adversarului. O piesă nu poate apăra simultan două câmpuri critice!'
    }

    if (puzzleThemes.includes('sacrifice')) {
      return 'Există o mutare mai agresivă în poziție — uneori trebuie să sacrifici material pentru a obține o inițiativă decisivă.'
    }

    return 'Există o mutare mai puternică în această poziție. Analizează ce amenințare poți crea sau ce slăbiciune poți exploata.'
  } catch {
    return 'Aceasta nu este cea mai bună mutare din această poziție.'
  }
}

export function uciToSan(fen: string, uci: string): string {
  try {
    const g = new Chess(fen)
    const move = g.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] ?? undefined })
    return move?.san ?? uci
  } catch {
    return uci
  }
}

function parsePgnSanMoves(pgn: string): string[] {
  return pgn
    .replace(/\[[^\]]*\]/g, '')            // remove PGN headers [...]
    .replace(/\{[^}]*\}/g, '')              // remove comments {...}
    .replace(/\$\d+/g, '')                  // remove NAG symbols ($1, $2…)
    .replace(/[!?]+/g, '')                  // remove move quality (!, ?, !?, ?!)
    .replace(/\d+\.\.\.\s*/g, '')           // remove black move numbers (12...)
    .replace(/\d+\.\s*/g, '')               // remove white move numbers (12.)
    .replace(/1-0|0-1|1\/2-1\/2|\*/g, '')  // remove result tokens
    .split(/\s+/)
    .filter(Boolean)
}

export function lichessPuzzleToLocal(lp: LichessPuzzle): Puzzle {
  try {
    const sanMoves = parsePgnSanMoves(lp.game.pgn)

    // Replay all PGN moves to collect from/to/promotion for each half-move
    const full = new Chess()
    const verboseMoves: { from: string; to: string; promotion?: string }[] = []
    for (const san of sanMoves) {
      const result = full.move(san)
      if (!result) throw new Error(`Invalid SAN: ${san}`)
      verboseMoves.push({ from: result.from, to: result.to, promotion: result.promotion })
    }

    if (verboseMoves.length < lp.puzzle.initialPly) {
      throw new Error(`PGN has ${verboseMoves.length} moves but initialPly=${lp.puzzle.initialPly}`)
    }

    // Replay initialPly moves to get FEN BEFORE the trigger
    // initialPly is 0-indexed: trigger is at verboseMoves[initialPly]
    const beforeTrigger = new Chess()
    for (let i = 0; i < lp.puzzle.initialPly; i++) {
      const m = verboseMoves[i]
      beforeTrigger.move({ from: m.from, to: m.to, promotion: m.promotion })
    }
    const fen = beforeTrigger.fen()

    // Trigger = opponent's last move that sets up the puzzle
    const trigger = verboseMoves[lp.puzzle.initialPly]
    const triggerUci = trigger.from + trigger.to + (trigger.promotion ?? '')

    return {
      id: lp.puzzle.id,
      fen,
      moves: [triggerUci, ...lp.puzzle.solution].join(' '),
      rating: lp.puzzle.rating,
      themes: lp.puzzle.themes,
      game_url: `https://lichess.org/training/${lp.puzzle.id}`,
    }
  } catch (e) {
    console.error('[lichessPuzzleToLocal] Failed to parse puzzle:', lp.puzzle.id, e)
    throw e
  }
}
