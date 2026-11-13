export interface TacticsQuestion {
  type: 'tactics'
  id: string
  fen: string
  /**
   * Mutările soluţiei, în UCI, pe rând: a ta, a adversarului, a ta… Una singură
   * = „Găseşte cea mai bună mutare"; mai multe = „Găseşte cea mai bună secvenţă",
   * iar adversarul răspunde singur după fiecare mutare corectă.
   */
  solutie: string[]
  /** Dificultatea puzzle-ului pe Lichess. Din ea se estimează nivelul. */
  rating: number
}

export interface McqQuestion {
  type: 'mcq'
  id: string
  question: string
  options: { label: string; value: string }[]
  correct: string
  category: 'knowledge' | 'style'
}

export type AssessmentQuestion = TacticsQuestion | McqQuestion

// Întrebările de tactică: 15 puzzle-uri Lichess, tot mai grele (~400 → ~2400),
// în ordinea cerută de utilizator pe 2026-11-13: trei de o mutare, o secvenţă,
// două de o mutare, o secvenţă, două de o mutare, două secvenţe, una de o mutare,
// trei secvenţe. Fără indicii — pe ecran scrie doar cine e la mutare.
//
// Fiecare mutare a jucătorului din soluţie e trecută prin motor
// (scripts/verificari/evaluare-nivel.mjs): e cea mai bună şi singura care
// câştigă (cel puţin 1,5 pioni peste a doua), sau dă mat. La treptele unde
// puzzle-urile de o mutare erau doar maturi, întrebarea cere prima mutare dintr-un
// puzzle mai lung — verificată la fel.
export const TACTICS_QUESTIONS: TacticsQuestion[] = [
  {
    // Lichess 02NvQ (405) · o mutare · şah descoperit, mat
    type: 'tactics',
    id: 't1',
    fen: '2krr3/1pp3p1/p4p2/5P2/5P2/7P/PPQp2R1/1R1KBB2 b - - 0 30',
    solutie: ["d2e1q"],
    rating: 405,
  },
  {
    // Lichess 00FHX (475) · o mutare · piesă neapărată, mat
    type: 'tactics',
    id: 't2',
    fen: '2r3k1/5p1p/4pP2/3p3P/8/5P2/p5P1/1bR3K1 w - - 1 31',
    solutie: ["c1c8"],
    rating: 475,
  },
  {
    // Lichess 002vV (564) · o mutare · mat
    type: 'tactics',
    id: 't3',
    fen: '8/6k1/1R5p/5p1P/5P1K/6P1/8/r7 b - - 3 58',
    solutie: ["a1h1"],
    rating: 564,
  },
  {
    // Lichess 005N7 (651) · secvenţă · mat pe ultimul rând, piesă neapărată, mat
    type: 'tactics',
    id: 't4',
    fen: 'r6k/2q3pp/8/2p5/R1np4/7P/2PB1PP1/6K1 w - - 0 33',
    solutie: ["a4a8", "c7b8", "a8b8"],
    rating: 651,
  },
  {
    // Lichess 09Skm (786) · o mutare · final de pioni
    type: 'tactics',
    id: 't5',
    fen: '8/8/3k1p1p/1p3P1P/1Pp2K2/2P5/8/8 b - - 4 47',
    solutie: ["d6d5"],
    rating: 786,
  },
  {
    // Lichess 0F9xB (931) · o mutare · mutare intermediară
    type: 'tactics',
    id: 't6',
    fen: 'r1bqk2r/pp3ppp/2n2b2/1B1Q4/8/2N1P3/PP3PPP/R3K1NR b KQkq - 0 10',
    solutie: ["f6c3"],
    rating: 931,
  },
  {
    // Lichess 003r5 (1107) · secvenţă · furculiţă
    type: 'tactics',
    id: 't7',
    fen: 'r2qr1k1/ppp2ppp/4P3/8/1nP2Q2/2N2N1P/PP3KP1/R4R2 b - - 0 15',
    solutie: ["b4d3", "f2g1", "d3f4"],
    rating: 1107,
  },
  {
    // Lichess 007OE (1284) · o mutare · piesă neapărată, mutare liniştită
    type: 'tactics',
    id: 't8',
    fen: '8/pkp5/2p1p3/3p4/N2q4/1P4Q1/1PP3Pr/K2R4 b - - 0 29',
    solutie: ["d4d1"],
    rating: 1284,
  },
  {
    // Lichess 0199s (1441) · o mutare · tactică
    type: 'tactics',
    id: 't9',
    fen: 'r3qr1k/1p2b1p1/4p1Qp/2ppP3/p4P2/2P1P1P1/PP4P1/1K1R3R w - - 1 21',
    solutie: ["h1h6"],
    rating: 1441,
  },
  {
    // Lichess 00Gc5 (1600) · secvenţă · deviere
    type: 'tactics',
    id: 't10',
    fen: '8/p1r2p2/4r3/2P1PK2/1P4R1/3R2pk/8/8 b - - 3 46',
    solutie: ["e6e5", "f5e5", "h3g4"],
    rating: 1600,
  },
  {
    // Lichess 001h8 (1780) · secvenţă · deviere
    type: 'tactics',
    id: 't11',
    fen: '2r3k1/2r4p/4p1p1/1p1q1pP1/p2P1P1Q/P6R/4bB2/2R3K1 w - - 6 35',
    solutie: ["h4h7", "c7h7", "c1c8", "g8g7", "c8c7"],
    rating: 1780,
  },
  {
    // Lichess 00A5m (1965) · o mutare · mutare liniştită
    type: 'tactics',
    id: 't12',
    fen: '8/1p6/p1p2p2/P3b3/1PK3P1/2PB4/3k4/8 w - - 4 61',
    solutie: ["d3f5"],
    rating: 1965,
  },
  {
    // Lichess 00JH5 (2082) · secvenţă · tactică
    type: 'tactics',
    id: 't13',
    fen: '8/2Q2pk1/8/3pp2P/2q5/2P5/KP6/8 w - - 2 37',
    solutie: ["c7c4", "d5c4", "b2b4"],
    rating: 2082,
  },
  {
    // Lichess 00mca (2242) · secvenţă · legare
    type: 'tactics',
    id: 't14',
    fen: '7Q/p3nkpp/3p2q1/3P4/4P3/B1r2B1b/P4PPP/R4RK1 b - - 0 20',
    solutie: ["c3f3", "g2g3", "f3a3"],
    rating: 2242,
  },
  {
    // Lichess 00BZ6 (2401) · secvenţă · tactică
    type: 'tactics',
    id: 't15',
    fen: '1r1r1bk1/3n1p1p/1qp3p1/2N1p3/PpQ1P3/4BP2/4N1PP/1RR3K1 b - - 1 24',
    solutie: ["f8c5", "e3c5", "d7c5"],
    rating: 2401,
  },
]

export const MCQ_QUESTIONS: McqQuestion[] = [
  // Cunoștințe openings
  {
    type: 'mcq',
    id: 'k1',
    category: 'knowledge',
    question: 'Care este prima mutare tipică în Sistemul Londra pentru alb?',
    options: [
      { label: '1.d4', value: 'd4' },
      { label: '1.e4', value: 'e4' },
      { label: '1.c4', value: 'c4' },
      { label: '1.Nf3', value: 'nf3' },
    ],
    correct: 'd4',
  },
  {
    type: 'mcq',
    id: 'k2',
    category: 'knowledge',
    question: 'Apărarea Siciliană pornește cu...',
    options: [
      { label: '1.e4 c5', value: 'e4c5' },
      { label: '1.e4 e5', value: 'e4e5' },
      { label: '1.e4 d5', value: 'e4d5' },
      { label: '1.e4 e6', value: 'e4e6' },
    ],
    correct: 'e4c5',
  },
  {
    type: 'mcq',
    id: 'k3',
    category: 'knowledge',
    question: 'Ce urmărește Gambitul Damei (1.d4 d5 2.c4)?',
    options: [
      { label: 'Câștigarea unui pion central', value: 'pion' },
      { label: 'Control spațiu + presiune centrală', value: 'spatiu' },
      { label: 'Atac rapid pe flanc', value: 'flanc' },
      { label: 'Schimb de regine rapid', value: 'regine' },
    ],
    correct: 'spatiu',
  },
  {
    type: 'mcq',
    id: 'k4',
    category: 'knowledge',
    question: 'Caro-Kann (1.e4 c6) este considerată o deschidere...',
    options: [
      { label: 'Solidă și defensivă', value: 'defensiv' },
      { label: 'Agresivă și tactică', value: 'agresiv' },
      { label: 'Dezechilibrată', value: 'dezechilibrat' },
      { label: 'Potrivită doar pentru avansați', value: 'avansat' },
    ],
    correct: 'defensiv',
  },
  {
    type: 'mcq',
    id: 'k5',
    category: 'knowledge',
    question: 'În partida italiană, după 1.e4 e5 2.Nf3 Nc6 3.Bc4, care este ideea principală a albului?',
    options: [
      { label: 'Presiune pe f7 și control al centrului', value: 'f7' },
      { label: 'Schimb rapid de piese', value: 'schimb' },
      { label: 'Atac pe flancul reginei', value: 'regina' },
      { label: 'Structură de pioni solidă', value: 'pioni' },
    ],
    correct: 'f7',
  },
  // Stil de joc
  {
    type: 'mcq',
    id: 's1',
    category: 'style',
    question: 'Ai o poziție solidă, fără atacuri clare. Ce preferi?',
    options: [
      { label: 'Forțez un atac chiar dacă poziția nu îl cere', value: 'offensive' },
      { label: 'Mențin echilibrul și aștept greșeala adversarului', value: 'defensive' },
      { label: 'Simplific la un final tehnic avantajos', value: 'pragmatic' },
      { label: 'Caut cel mai bun plan obiectiv', value: 'balanced' },
    ],
    correct: '',
  },
  {
    type: 'mcq',
    id: 's2',
    category: 'style',
    question: 'Preferi să joci cu pionii centrali sau să controlezi centrul cu piesele?',
    options: [
      { label: 'Pionii centrali — merg înainte agresiv', value: 'offensive' },
      { label: 'Control cu piesele — mai flexibil', value: 'balanced' },
      { label: 'Structuri solide, de preferință simetrice', value: 'defensive' },
      { label: 'Depinde de poziție — nu am preferință fixă', value: 'pragmatic' },
    ],
    correct: '',
  },
  {
    type: 'mcq',
    id: 's3',
    category: 'style',
    question: 'Adversarul îți oferă un gambit (sacrifică un pion). Ce faci?',
    options: [
      { label: 'Accept întotdeauna — material e material', value: 'pragmatic' },
      { label: 'Refuz și joc solid', value: 'defensive' },
      { label: 'Accept dacă văd cum să contraatac rapid', value: 'offensive' },
      { label: 'Analizez și decid în funcție de poziție', value: 'balanced' },
    ],
    correct: '',
  },
  {
    type: 'mcq',
    id: 's4',
    category: 'style',
    question: 'Finalizarea partidelor tale tipice:',
    options: [
      { label: 'Mat sau atac decisiv la rege', value: 'offensive' },
      { label: 'Victorie în final tehnic câștigat', value: 'pragmatic' },
      { label: 'Remiză dintr-o poziție solidă', value: 'defensive' },
      { label: 'Variază — câștig cum pot', value: 'balanced' },
    ],
    correct: '',
  },
  {
    type: 'mcq',
    id: 's5',
    category: 'style',
    question: 'Câtă pregătire de opening faci înainte de o partidă?',
    options: [
      { label: 'Mult — vreau să știu linii exacte', value: 'offensive' },
      { label: 'Puțin — prefer să improvizez', value: 'balanced' },
      { label: 'Suficient cât să am o structură solidă', value: 'defensive' },
      { label: 'Studiez liniile practice, nu teoretice', value: 'pragmatic' },
    ],
    correct: '',
  },
]
