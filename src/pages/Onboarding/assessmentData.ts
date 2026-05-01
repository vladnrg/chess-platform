export interface TacticsQuestion {
  type: 'tactics'
  id: string
  fen: string
  correctMove: string
  hint: string
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

export const TACTICS_QUESTIONS: TacticsQuestion[] = [
  {
    type: 'tactics',
    id: 't1',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    correctMove: 'f3g5',
    hint: 'Atacă pionul negru neprotejat de pe e5',
  },
  {
    type: 'tactics',
    id: 't2',
    fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
    correctMove: 'e1e8',
    hint: 'Mat în 1 — unde îl atacă tura?',
  },
  {
    type: 'tactics',
    id: 't3',
    fen: 'r1b1kb1r/pppp1ppp/2n2q2/4p3/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq d3 0 5',
    correctMove: 'f6f2',
    hint: 'Dama albă este pe d1 — există o mișcare câștigătoare?',
  },
  {
    type: 'tactics',
    id: 't4',
    fen: '2r3k1/5ppp/8/8/8/8/5PPP/2R3K1 w - - 0 1',
    correctMove: 'c1c8',
    hint: 'Schimb egal sau câștig material?',
  },
  {
    type: 'tactics',
    id: 't5',
    fen: 'rnbqkb1r/ppp2ppp/3p1n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 2 4',
    correctMove: 'f3e5',
    hint: 'Există un cal agățat?',
  },
]

export const MCQ_QUESTIONS: McqQuestion[] = [
  // Cunoștințe openings
  {
    type: 'mcq',
    id: 'k1',
    category: 'knowledge',
    question: 'Care este prima mutare tipică în Sistemul London pentru alb?',
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
      { label: 'Schimb de dame rapid', value: 'dame' },
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
      { label: 'Atac pe flancul damei', value: 'dama' },
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
