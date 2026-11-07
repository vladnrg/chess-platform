export interface TacticsQuestion {
  type: 'tactics'
  id: string
  fen: string
  correctMove: string
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

// Întrebările de tactică: cinci puzzle-uri Lichess pe trepte de dificultate
// (~1160, ~1460, ~1750, ~1960, ~2150). Fără indicii — pe ecran scrie doar cine e
// la mutare, dedus din poziţie. Un test de plasament cu „Mat în 1" lângă o
// poziţie uşoară nu plasează pe nimeni.
//
// Fiecare e trecută prin motor (scripts/verificari/evaluare-nivel.mjs): mutarea
// cerută e cea mai bună şi e cu cel puţin doi pioni peste a doua. Contează doar
// prima mutare din puzzle; restul liniei nu se joacă aici.
export const TACTICS_QUESTIONS: TacticsQuestion[] = [
  {
    // Lichess 01VBW: şah dublu cu calul, care loveşte apoi şi regina.
    type: 'tactics',
    id: 't1',
    fen: '2b1rr1k/3q2pB/p1p5/PpPp4/1P1b1Np1/8/2Q2P1P/R4RK1 w - - 0 22',
    correctMove: 'f4g6',
    rating: 1157,
  },
  {
    // Lichess 01Btz: regina ia calul de pe b3; pionul care l-ar lua înapoi e legat.
    type: 'tactics',
    id: 't2',
    fen: '2r1k2r/1p2bppp/1q1p4/p2Pp1P1/P4n1P/1N3P2/1PPQ4/2KR1B1R b k - 0 17',
    correctMove: 'b6b3',
    rating: 1459,
  },
  {
    // Lichess 006fF: şahul cu regina descoperă atacul nebunului.
    type: 'tactics',
    id: 't3',
    fen: 'r1b4r/pp1k2p1/2nb2qp/1B1p2B1/3p3Q/8/PPP2PPP/3RR1K1 w - - 0 18',
    correctMove: 'h4g4',
    rating: 1752,
  },
  {
    // Lichess 000mr: tura se dă pe pionul de pe f4 şi rupe apărarea regelui alb.
    type: 'tactics',
    id: 't4',
    fen: '5r1k/5rp1/p7/1b2B2p/1P1P1Pq1/2R3Q1/P3p1P1/2R3K1 b - - 1 41',
    correctMove: 'f7f4',
    rating: 1957,
  },
  {
    // Lichess 08p1T: mat în trei, începând cu nebunul pe b5.
    type: 'tactics',
    id: 't5',
    fen: 'Q2r3r/1ppkbppp/3p1n2/3P4/4Pq2/3B4/PPPN2PP/R5K1 w - - 2 16',
    correctMove: 'd3b5',
    rating: 2154,
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
