// Traducerea temelor de puzzle Lichess în română (sursă unică, folosită peste tot).

export const PUZZLE_THEME_RO: Record<string, string> = {
  // Motive tactice
  fork: 'Furculiță',
  pin: 'Legare',
  skewer: 'Țeapă',
  xRayAttack: 'Atac cu raze X',
  discoveredAttack: 'Atac descoperit',
  discoveredCheck: 'Șah descoperit',
  doubleCheck: 'Șah dublu',
  attraction: 'Atragere',
  deflection: 'Deviere',
  capturingDefender: 'Eliminarea apărătorului',
  removeDefender: 'Eliminarea apărătorului',
  interference: 'Interpunere',
  intermezzo: 'Mutare intermediară',
  clearance: 'Eliberare de câmp',
  quietMove: 'Mutare liniștită',
  zugzwang: 'Zugzwang',
  sacrifice: 'Sacrificiu',
  trappedPiece: 'Piesă prinsă',
  hangingPiece: 'Piesă neapărată',
  defensiveMove: 'Mutare defensivă',
  exposedKing: 'Rege expus',
  advancedPawn: 'Pion avansat',
  promotion: 'Transformare',
  underPromotion: 'Subpromovare',
  enPassant: 'En passant',
  castling: 'Rocadă',
  desperado: 'Desperado',
  coercion: 'Constrângere',
  attackingF2F7: 'Atac pe f2/f7',
  kingsideAttack: 'Atac pe flancul regelui',
  queensideAttack: 'Atac pe flancul damei',

  // Atacuri / mat
  mate: 'Mat',
  mateIn1: 'Mat în 1',
  mateIn2: 'Mat în 2',
  mateIn3: 'Mat în 3',
  mateIn4: 'Mat în 4',
  mateIn5: 'Mat în 5',
  smotheredMate: 'Mat înăbușit',
  backRankMate: 'Mat pe ultima linie',
  bodenMate: 'Mat Boden',
  dovetailMate: 'Mat coadă de rândunică',
  hookMate: 'Mat cârlig',
  arabianMate: 'Mat arab',
  anastasiaMate: 'Mat Anastasia',
  doubleBishopMate: 'Mat cu doi nebuni',
  killBoxMate: 'Mat în cutie',
  vukovicMate: 'Mat Vuković',
  cornerMate: 'Mat în colț',
  epauletteMate: 'Mat epoletă',
  pillsburysMate: 'Mat Pillsbury',
  morphysMate: 'Mat Morphy',
  operaMate: 'Mat de la operă',

  // Faze de joc
  opening: 'Deschidere',
  middlegame: 'Mijlocul jocului',
  endgame: 'Final',

  // Finaluri specifice
  pawnEndgame: 'Final de pioni',
  rookEndgame: 'Final de turn',
  bishopEndgame: 'Final de nebuni',
  knightEndgame: 'Final de cai',
  queenEndgame: 'Final de dame',
  queenRookEndgame: 'Final damă și turn',

  // Evaluare
  advantage: 'Avantaj',
  crushing: 'Avantaj decisiv',
  equality: 'Egalitate',
}

// Teme „meta" (lungime/forța adversarului) — zgomot pentru utilizator, nu le afișăm.
const HIDDEN_THEMES = new Set([
  'short', 'long', 'veryLong', 'oneMove',
  'master', 'masterVsMaster', 'superGM',
])

export function themeLabel(theme: string): string {
  return PUZZLE_THEME_RO[theme] ?? theme
}

// Temele de afișat pentru un puzzle: scoatem zgomotul, traducem implicit la randare.
export function displayThemes(themes: string[], max = 5): string[] {
  return themes.filter(t => !HIDDEN_THEMES.has(t)).slice(0, max)
}
