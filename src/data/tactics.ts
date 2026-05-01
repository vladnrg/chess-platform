export type TacticDifficulty = 'beginner' | 'intermediate' | 'advanced'
export type TacticSection = 'basic' | 'advanced' | 'mate'

export interface TacticInfo {
  id: string
  name: string
  lichessTheme: string
  description: string
  difficulty: TacticDifficulty
  section: TacticSection
  fen: string
}

export const TACTICS: TacticInfo[] = [
  // Basic
  {
    id: 'fork',
    name: 'Furculița',
    lichessTheme: 'fork',
    description: 'O piesă atacă simultan două piese adverse. Adversarul nu le poate salva pe amândouă.',
    difficulty: 'beginner',
    section: 'basic',
    // Knight on e5 attacks queen on d7 and rook on f7
    fen: '4k3/3q1r2/8/4N3/8/8/8/4K3 w - - 0 1',
  },
  {
    id: 'pin',
    name: 'Acul',
    lichessTheme: 'pin',
    description: 'O piesă nu poate muta fără să expună o piesă mai valoroasă din spatele ei.',
    difficulty: 'beginner',
    section: 'basic',
    // Bishop on b5 pins knight on c6 to king on e8
    fen: '4k3/8/2n5/1B6/8/8/8/4K3 w - - 0 1',
  },
  {
    id: 'skewer',
    name: 'Traversarea',
    lichessTheme: 'skewer',
    description: 'Invers față de ac: forțezi o piesă valoroasă să mute, capturând piesa din spatele ei.',
    difficulty: 'beginner',
    section: 'basic',
    // Rook on e1 skewers king on e8 (must move) revealing rook on e7
    fen: '4k3/4r3/8/8/8/8/8/4R3 w - - 0 1',
  },
  {
    id: 'discoveredAttack',
    name: 'Descoperirea',
    lichessTheme: 'discoveredAttack',
    description: 'O piesă mută dezvăluind atacul altei piese. Dă două amenințări simultane.',
    difficulty: 'intermediate',
    section: 'basic',
    // Moving bishop on b3 reveals rook on b1 attacking queen on b7
    fen: '1q2k3/8/8/8/8/1B6/8/1R2K3 w - - 0 1',
  },
  {
    id: 'doubleCheck',
    name: 'Dubla amenințare',
    lichessTheme: 'doubleCheck',
    description: 'Două piese atacă simultan regele. Singura apărare este să muți regele.',
    difficulty: 'intermediate',
    section: 'basic',
    // Position illustrating two attackers on the king
    fen: '4k3/8/8/8/8/5N2/8/3BK2R w K - 0 1',
  },
  {
    id: 'sacrifice',
    name: 'Sacrificiul',
    lichessTheme: 'sacrifice',
    description: 'Cedezi material în mod deliberat pentru a obține un avantaj pozițional sau de atac.',
    difficulty: 'intermediate',
    section: 'basic',
    // Complex middlegame position suggesting sacrifice
    fen: 'r1bqk2r/pp2bppp/2np1n2/4p3/2B1P3/2NP1N2/PPP2PPP/R1BQR1K1 w kq - 0 9',
  },
  // Advanced
  {
    id: 'zugzwang',
    name: 'Zugzwang',
    lichessTheme: 'zugzwang',
    description: 'Orice mutare a adversarului îi înrăutățește poziția. Dacă nu ar trebui să mute, ar sta mai bine.',
    difficulty: 'advanced',
    section: 'advanced',
    // Classic K+P endgame zugzwang
    fen: '8/8/8/3k4/3P4/3K4/8/8 w - - 0 1',
  },
  {
    id: 'promotion',
    name: 'Promovarea',
    lichessTheme: 'promotion',
    description: 'Un pion ajunge pe ultima linie și devine damă (sau altă piesă). Adesea decisivă.',
    difficulty: 'intermediate',
    section: 'advanced',
    fen: '8/1P6/8/3k4/8/8/8/3K4 w - - 0 1',
  },
  {
    id: 'perpetualCheck',
    name: 'Perpetuu',
    lichessTheme: 'perpetualCheck',
    description: 'O piesă dă șah la nesfârșit — adversarul nu poate evita verificările. Rezultă remiză.',
    difficulty: 'intermediate',
    section: 'advanced',
    fen: '6k1/5ppp/8/8/8/8/5PPP/5QK1 w - - 0 1',
  },
  {
    id: 'trappedPiece',
    name: 'Piesa prinsă',
    lichessTheme: 'trappedPiece',
    description: 'O piesă adversă nu are pătrate unde să mute în siguranță. Poți să o capturezi în mutările următoare.',
    difficulty: 'intermediate',
    section: 'advanced',
    fen: '8/8/5k2/6p1/5Bp1/8/8/5K2 b - - 0 1',
  },
  // Mate in N
  {
    id: 'mateIn1',
    name: 'Mat în 1',
    lichessTheme: 'mateIn1',
    description: 'Există o singură mutare care duce la șah-mat imediat. Găsește-o!',
    difficulty: 'beginner',
    section: 'mate',
    // Rh8# position
    fen: '4k3/8/4K3/8/8/8/8/7R w - - 0 1',
  },
  {
    id: 'mateIn2',
    name: 'Mat în 2',
    lichessTheme: 'mateIn2',
    description: 'Calculezi exact 2 mutări: amenințare + mat inevitabil, indiferent ce face adversarul.',
    difficulty: 'beginner',
    section: 'mate',
    // Two rooks ladder mate setup
    fen: '4k3/8/4K3/8/8/8/8/3RR3 w - - 0 1',
  },
  {
    id: 'mateIn3',
    name: 'Mat în 3',
    lichessTheme: 'mateIn3',
    description: 'Secvență de 3 mutări exacte care forțează matul. Necesită calcul riguros.',
    difficulty: 'intermediate',
    section: 'mate',
    // Classic back rank setup
    fen: '4k3/4p3/8/8/8/8/4P3/R3K2R w KQ - 0 1',
  },
]

export const TACTIC_SECTION_LABELS: Record<TacticSection, string> = {
  basic: 'Tactici de Bază',
  advanced: 'Tactici Avansate',
  mate: 'Mat în N Mutări',
}

export const TACTIC_DIFFICULTY_LABELS: Record<TacticDifficulty, string> = {
  beginner: 'Începător',
  intermediate: 'Intermediar',
  advanced: 'Avansat',
}
