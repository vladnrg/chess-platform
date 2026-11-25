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
/** Rezervele fiecărei trepte, după id-ul puzzle-ului principal (vezi `TREPTE_TACTICA`). */
const REZERVE: Record<string, TacticsQuestion[]> = {
  t1: [
    // Lichess 004iZ (499) · o mutare · kingsideAttack, mate, mateIn1
    { type: 'tactics', id: 't1b', fen: 'r2r2k1/2q1bpp1/3p3p/1ppn4/1P1BP3/P5Q1/4RPPP/R5K1 w - - 0 21', solutie: ["g3g7"], rating: 499 },
    // Lichess 00uHj (502) · o mutare · endgame, mate, mateIn2
    { type: 'tactics', id: 't1c', fen: 'r5k1/p4p1p/1p3ppB/8/2pP4/4QP1q/P1n2P2/4R1K1 w - - 0 22', solutie: ["e3e8"], rating: 502 },
    // Lichess 0030b (538) · o mutare · backRankMate, mate, mateIn2
    { type: 'tactics', id: 't1d', fen: '6k1/5ppp/5n2/pp6/4b1rP/5N1Q/Pq2r1P1/3R2RK w - - 5 33', solutie: ["d1d8"], rating: 538 },
  ],
  t2: [
    // Lichess 0071N (555) · o mutare · endgame, mate, mateIn2
    { type: 'tactics', id: 't2b', fen: '6k1/p4pp1/1p5p/4b3/4B3/4P1P1/P1R2PKP/1q1r4 w - - 0 31', solutie: ["c2c8"], rating: 555 },
    // Lichess 000rZ (557) · o mutare · kingsideAttack, mate, mateIn1
    { type: 'tactics', id: 't2c', fen: '2kr1b1r/p1p2pp1/2pqN3/7p/6n1/2NPB3/PPP2PPP/R2Q1RK1 b - - 0 13', solutie: ["d6h2"], rating: 557 },
    // Lichess 00awK (569) · o mutare · backRankMate, endgame, mate
    { type: 'tactics', id: 't2d', fen: 'r6k/2p2Qpp/p7/4b3/8/8/1PP1KR2/2q5 w - - 1 25', solutie: ["f7f8"], rating: 569 },
  ],
  t3: [
    // Lichess 007HB (538) · o mutare · mate, mateIn1, middlegame
    { type: 'tactics', id: 't3b', fen: 'rn2q1k1/pp3ppp/2pb4/3p1B2/2PN4/1Q6/PP3PPP/R1B4K b - - 0 15', solutie: ["e8e1"], rating: 538 },
    // Lichess 023Pt (553) · o mutare · backRankMate, long, mate
    { type: 'tactics', id: 't3c', fen: '4r2k/pp2r1p1/2p1qp1p/2P5/3P1P2/2Q5/2R2NPP/3R2K1 b - - 3 28', solutie: ["e6e1"], rating: 553 },
    // Lichess 0042j (555) · o mutare · backRankMate, mate, mateIn2
    { type: 'tactics', id: 't3d', fen: '3r2k1/4nppp/pq3b2/1p2p3/2r2P2/2P1NR2/PP1Q2BP/3R2K1 w - - 0 25', solutie: ["d2d8"], rating: 555 },
  ],
  t4: [
    // Lichess 04YLh (602) · secvenţă · clearance, endgame, master
    { type: 'tactics', id: 't4b', fen: '6k1/p6p/2p3pB/3q4/3b4/P4QP1/1r5P/5R1K w - - 0 28', solutie: ["f3d5","c6d5","f1f8"], rating: 602 },
    // Lichess 01244 (616) · secvenţă · mate, mateIn2, middlegame
    { type: 'tactics', id: 't4c', fen: '4r1k1/5ppp/B1R2b2/5P2/2Q2p1P/pP2qP2/P1P5/1K5R b - - 0 28', solutie: ["e3e1","h1e1","e8e1"], rating: 616 },
    // Lichess 05EXs (617) · secvenţă · mate, mateIn2, middlegame
    { type: 'tactics', id: 't4d', fen: '4r2k/1br3bp/3p2p1/1p1P1q2/1P6/1B6/1B4PP/1R2R1K1 w - - 0 28', solutie: ["e1e8","f5f8","e8f8"], rating: 617 },
  ],
  t5: [
    // Lichess 1cJ8l (749) · o mutare · advantage, middlegame, short
    { type: 'tactics', id: 't5b', fen: 'r3b1k1/3P1pp1/6np/1p6/2pqN3/5P2/6PP/3R1BK1 w - - 0 38', solutie: ["d1d4"], rating: 749 },
    // Lichess 007mr (750) · o mutare · backRankMate, endgame, mate
    { type: 'tactics', id: 't5c', fen: '5k2/p2r3p/1p4pP/3r1q2/4R3/2P5/PP3PQ1/K3R3 b - - 0 33', solutie: ["d5d1"], rating: 750 },
    // Lichess 005Ep (752) · o mutare · endgame, mate, mateIn1
    { type: 'tactics', id: 't5d', fen: '5kr1/ppR3p1/3R3p/1n6/1r6/8/1P3PPP/2K5 w - - 5 32', solutie: ["d6d8"], rating: 752 },
  ],
  t6: [
    // Lichess 001pC (870) · o mutare · mate, mateIn1, middlegame
    { type: 'tactics', id: 't6b', fen: 'r4rk1/pp3ppp/3b4/2p1pPB1/7N/2PP3n/PP4PP/R2Q2RK b - - 0 18', solutie: ["h3f2"], rating: 870 },
    // Lichess 0HkxM (871) · o mutare · crushing, defensiveMove, endgame
    { type: 'tactics', id: 't6c', fen: '8/8/4p3/r4p2/K3k1p1/1P2P1P1/P6P/8 w - - 0 48', solutie: ["a4a5"], rating: 871 },
    // Lichess 06Ipb (872) · o mutare · backRankMate, endgame, long
    { type: 'tactics', id: 't6d', fen: '8/p3k3/1q2rpp1/8/1p2R3/8/PPP1Q2P/1K6 b - - 1 30', solutie: ["b6g1"], rating: 872 },
  ],
  t7: [
    // Lichess 00WG3 (1044) · secvenţă · crushing, endgame, fork
    { type: 'tactics', id: 't7b', fen: '8/pk1r1Rp1/1p2p2p/4P1bP/4N3/8/PP6/1K1r1R2 w - - 5 34', solutie: ["f1d1","d7f7","e4d6","b7c7","d6f7"], rating: 1044 },
    // Lichess 018KD (1045) · secvenţă · crushing, defensiveMove, endgame
    { type: 'tactics', id: 't7c', fen: 'k6r/1b5p/6p1/1P6/3Q1P2/PP2R3/3K3q/8 w - - 0 32', solutie: ["e3e2","h2e2","d2e2"], rating: 1045 },
    // Lichess 01Bmi (1046) · secvenţă · advantage, middlegame, short
    { type: 'tactics', id: 't7d', fen: 'rn1qk2r/ppp2ppp/5b2/3P4/4P3/5Q1P/PPP2PP1/RN2KB1R b KQkq - 0 10', solutie: ["f6b2","f3b3","b2a1"], rating: 1046 },
  ],
  t8: [
    // Lichess 02F4S (1221) · o mutare · crushing, endgame, interference
    { type: 'tactics', id: 't8b', fen: '8/4n1k1/4P3/3p2PP/rp1P4/3K4/P4R2/8 b - - 1 47', solutie: ["a4a3"], rating: 1221 },
    // Lichess 04bfk (1225) · o mutare · advancedPawn, advantage, capturingDefender
    { type: 'tactics', id: 't8c', fen: 'r4k2/1p4p1/p4p2/1PP1p3/P1Ppn3/B7/5R1P/1K6 w - - 0 30', solutie: ["c5c6"], rating: 1225 },
    // Lichess 00SgB (1226) · o mutare · advantage, exposedKing, kingsideAttack
    { type: 'tactics', id: 't8d', fen: 'b4rk1/qn2r3/1p3ppp/1P1p4/1Q1PnB2/P3P3/4BPPP/5RK1 w - - 0 29', solutie: ["b4e7"], rating: 1226 },
  ],
  t9: [
    // Lichess 00m6L (1380) · o mutare · crushing, defensiveMove, endgame
    { type: 'tactics', id: 't9b', fen: '8/8/k6p/p4p1P/K1p1pP2/2P1P3/1P6/8 b - - 0 49', solutie: ["a6b6"], rating: 1380 },
    // Lichess 00BrZ (1382) · o mutare · attraction, kingsideAttack, long
    { type: 'tactics', id: 't9c', fen: 'r6r/pp2kb2/3p1p2/1N1Pp3/3bP3/P2B2P1/1P1Q2PP/7K b - - 7 28', solutie: ["h8h2"], rating: 1382 },
    // Lichess 0008Q (1383) · o mutare · advantage, endgame, rookEndgame
    { type: 'tactics', id: 't9d', fen: '8/5R2/1p2P3/p4r2/P6p/1P3Pk1/4K3/8 b - - 2 64', solutie: ["f5e5"], rating: 1383 },
  ],
  t10: [
    // Lichess 01HgH (1544) · secvenţă · advantage, long, middlegame
    { type: 'tactics', id: 't10b', fen: 'r3k2r/pppqbppp/2n1b3/3p2PQ/PP1Pp2P/2P1P3/5PB1/RNB1K1NR b KQkq - 0 11', solutie: ["e6g4","g2h3","g4h5","h3d7","e8d7"], rating: 1544 },
    // Lichess 047JD (1545) · secvenţă · advantage, endgame, short
    { type: 'tactics', id: 't10c', fen: '5r2/p5k1/3p4/2pP2pQ/2Pb1qN1/8/P4PPP/5R1K b - - 2 35', solutie: ["f8h8","h5h8","g7h8"], rating: 1545 },
    // Lichess 00EXS (1548) · secvenţă · advantage, discoveredAttack, middlegame
    { type: 'tactics', id: 't10d', fen: 'r3r1k1/p2Q1p1p/1p2p1p1/8/1P1P4/P3P3/1B2Nb1q/2KR3R b - - 1 19', solutie: ["f2e3","c1b1","h2e2"], rating: 1548 },
  ],
  t11: [
    // Lichess 00IMS (1706) · secvenţă · clearance, crushing, kingsideAttack
    { type: 'tactics', id: 't11b', fen: '1r4k1/r5q1/p2p1pP1/4pn2/2p1P2Q/2Pb1BK1/P6R/2R5 w - - 0 36', solutie: ["e4f5","d3f5","f3d5"], rating: 1706 },
    // Lichess 00MwU (1709) · secvenţă · advantage, attraction, endgame
    { type: 'tactics', id: 't11c', fen: '3r1b1R/1pq3p1/p1k3P1/3p4/1P1Q4/4PP2/P1P5/2K5 w - - 0 27', solutie: ["h8f8","d8f8","d4c5","c6d7","c5f8"], rating: 1709 },
    // Lichess 03jHI (1710) · secvenţă · crushing, fork, long
    { type: 'tactics', id: 't11d', fen: '6k1/5ppp/1q2p3/2Q1b2b/P3P3/3P4/P1RBPK1P/1r5R b - - 2 24', solutie: ["e5d4","c5d4","b6d4","d2e3","d4f6"], rating: 1710 },
  ],
  t12: [
    // Lichess 01gjE (1890) · o mutare · equality, long, middlegame
    { type: 'tactics', id: 't12b', fen: '1Q2n1kr/B4ppp/q7/bb6/4p3/2P1P3/P3NPPP/RN2K2R b KQ - 0 21', solutie: ["a5c7"], rating: 1890 },
    // Lichess 003aS (1890) · o mutare · advancedPawn, crushing, defensiveMove
    { type: 'tactics', id: 't12c', fen: '8/8/5k1p/6pP/1R4P1/1p2KP2/8/1r6 b - - 0 43', solutie: ["b3b2"], rating: 1890 },
    // Lichess 03TkB (1894) · o mutare · advantage, middlegame, short
    { type: 'tactics', id: 't12d', fen: '4r1k1/1p2rpb1/p5p1/2pPp2p/2q5/2N2Q1P/PP2R1P1/5R1K w - - 0 28', solutie: ["e2e4"], rating: 1894 },
  ],
  t13: [
    // Lichess 00cxG (2031) · secvenţă · endgame, mate, mateIn2
    { type: 'tactics', id: 't13b', fen: '2r5/3RQ2p/6pk/8/5q1P/1P6/1K6/8 b - - 17 42', solutie: ["f4c1","b2a2","c8c2"], rating: 2031 },
    // Lichess 00H2I (2033) · secvenţă · crushing, fork, middlegame
    { type: 'tactics', id: 't13c', fen: '4rrk1/ppp2pp1/7p/3n4/3P3q/1P2p2P/PB4P1/R2QRBK1 b - - 3 23', solutie: ["h4f2","g1h2","f2b2"], rating: 2033 },
    // Lichess 0aXzH (2035) · secvenţă · fork, long, mate
    { type: 'tactics', id: 't13d', fen: '2k4r/pp3ppp/4p3/2P5/1Q1bnq2/8/P3BPPP/1R1R2K1 b - - 0 21', solutie: ["f4f2","g1h1","f2g1","d1g1","e4f2"], rating: 2035 },
  ],
  t14: [
    // Lichess 00TuA (2173) · secvenţă · crushing, defensiveMove, endgame
    { type: 'tactics', id: 't14b', fen: '8/6p1/8/pp2k1p1/2p2p2/2P2PPP/PP3K2/8 b - - 1 37', solutie: ["f4g3","f2g3","e5f5"], rating: 2173 },
    // Lichess 00YjD (2175) · secvenţă · crushing, endgame, long
    { type: 'tactics', id: 't14c', fen: '8/8/2p5/5k2/2R3p1/1P1P2K1/2r5/8 b - - 1 38', solutie: ["c2c4","d3c4","c6c5","b3b4","c5b4"], rating: 2175 },
    // Lichess 00bvs (2179) · secvenţă · attraction, crushing, long
    { type: 'tactics', id: 't14d', fen: '8/6p1/4pk2/P2n1p1Q/2pP1Pr1/2P5/2qB2RP/R5K1 b - - 0 33', solutie: ["g4g2","g1g2","d5f4","g2g1","f4h5"], rating: 2179 },
  ],
  t15: [
    // Lichess 00i8I (2330) · secvenţă · crushing, defensiveMove, endgame
    { type: 'tactics', id: 't15b', fen: '8/6kp/p4r2/1p6/4P3/P3KR2/6P1/8 b - - 2 48', solutie: ["f6f3","e3f3","g7f6"], rating: 2330 },
    // Lichess 00OKo (2331) · secvenţă · advantage, exposedKing, long
    { type: 'tactics', id: 't15c', fen: 'r3rk2/pbq5/1p2pp1p/2p1N3/2PP2Q1/1P1B4/P5PP/R5K1 w - - 2 25', solutie: ["a1f1","c7g7","f1f6","g7f6","e5d7"], rating: 2331 },
    // Lichess 00ZK8 (2332) · secvenţă · advantage, deflection, opening
    { type: 'tactics', id: 't15d', fen: 'r2q1b1r/pp3kpp/3pbn2/3Q4/2n1P3/5N2/PP3PPP/RNB1K2R w KQ - 2 11', solutie: ["f3g5","f7g6","d5e6"], rating: 2332 },
  ],
}

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

/**
 * Cele 15 trepte ale testului, fiecare cu mai multe puzzle-uri de acelaşi fel
 * (o mutare / secvenţă) şi aceeaşi dificultate, din care testul alege unul la
 * sorţi (cerut pe 2026-11-25). Primul din fiecare treaptă e cel de mai sus.
 */
export const TREPTE_TACTICA: TacticsQuestion[][] = TACTICS_QUESTIONS.map(q => [q, ...(REZERVE[q.id] ?? [])])

export const MCQ_QUESTIONS: McqQuestion[] = [
  // Întrebările despre deschideri (5, „Cu ce începe Siciliana?") au fost scoase pe
  // 2026-11-13: testul avea 25 de întrebări, iar ele verificau nume învăţate pe de
  // rost, nu nivelul — pe care tactica îl măsoară deja. Au rămas cele de stil, singura
  // sursă a stilului de joc (recomandările de cursuri, eticheta din comunitate).

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

  // De aici încolo: întrebările adăugate pe 2026-11-25, ca testul să aibă alte
  // întrebări de stil de la o rezolvare la alta (se aleg 5 din toate).
  {
    type: 'mcq',
    id: 's6',
    category: 'style',
    question: 'Ai de ales între o mutare care deschide jocul spre regele advers și una care îți îmbunătățește liniștit o piesă. Ce alegi?',
    options: [
      { label: 'Deschid jocul spre rege', value: 'offensive' },
      { label: 'Îmbunătățesc piesa, fără riscuri', value: 'defensive' },
      { label: 'Pe cea care duce spre un final mai bun', value: 'pragmatic' },
      { label: 'Le calculez pe amândouă și aleg obiectiv', value: 'balanced' },
    ],
    correct: '',
  },
  {
    type: 'mcq',
    id: 's7',
    category: 'style',
    question: 'Ai un pion în plus. Cum continui?',
    options: [
      { label: 'Schimb piese și merg spre final', value: 'pragmatic' },
      { label: 'Caut un atac, ca să termin repede', value: 'offensive' },
      { label: 'Consolidez și nu-i las nicio șansă', value: 'defensive' },
      { label: 'Depinde de poziție', value: 'balanced' },
    ],
    correct: '',
  },
  {
    type: 'mcq',
    id: 's8',
    category: 'style',
    question: 'Ești în dezavantaj. Ce faci?',
    options: [
      { label: 'Complic jocul și caut șanse tactice', value: 'offensive' },
      { label: 'Mă apăr cu răbdare', value: 'defensive' },
      { label: 'Caut un final în care să pot ține remiza', value: 'pragmatic' },
      { label: 'Caut cea mai bună mutare, ca de obicei', value: 'balanced' },
    ],
    correct: '',
  },
  {
    type: 'mcq',
    id: 's9',
    category: 'style',
    question: 'Ce fel de poziții îți plac cel mai mult?',
    options: [
      { label: 'Ascuțite, cu regii atacați', value: 'offensive' },
      { label: 'Închise, cu manevre lente', value: 'defensive' },
      { label: 'Simple, cu un plan clar', value: 'pragmatic' },
      { label: 'Oricare, cât timp le înțeleg', value: 'balanced' },
    ],
    correct: '',
  },
  {
    type: 'mcq',
    id: 's10',
    category: 'style',
    question: 'Care parte a partidei îți place cel mai mult?',
    options: [
      { label: 'Atacul din jocul de mijloc', value: 'offensive' },
      { label: 'Finalul', value: 'pragmatic' },
      { label: 'Deschiderea, bine pregătită', value: 'balanced' },
      { label: 'Apărarea unei poziții grele', value: 'defensive' },
    ],
    correct: '',
  },
  {
    type: 'mcq',
    id: 's11',
    category: 'style',
    question: 'Adversarul îți atacă regele. Care e prima ta reacție?',
    options: [
      { label: 'Contraatac pe celălalt flanc', value: 'offensive' },
      { label: 'Aduc piese la apărare', value: 'defensive' },
      { label: 'Schimb piesele cu care atacă', value: 'pragmatic' },
      { label: 'Calculez exact cât de periculos e', value: 'balanced' },
    ],
    correct: '',
  },
  {
    type: 'mcq',
    id: 's12',
    category: 'style',
    question: 'Poți sacrifica o piesă pentru atac, dar nu vezi totul până la capăt. Ce faci?',
    options: [
      { label: 'Sacrific', value: 'offensive' },
      { label: 'Nu sacrific, prefer varianta sigură', value: 'defensive' },
      { label: 'Sacrific doar dacă am măcar remiza asigurată', value: 'pragmatic' },
      { label: 'Sacrific doar dacă am calculat destul', value: 'balanced' },
    ],
    correct: '',
  },
  {
    type: 'mcq',
    id: 's13',
    category: 'style',
    question: 'Cum îți alegi o deschidere nouă?',
    options: [
      { label: 'Una agresivă, cu gambituri', value: 'offensive' },
      { label: 'Una solidă, greu de spart', value: 'defensive' },
      { label: 'Una cu planuri simple, pe care o învăț repede', value: 'pragmatic' },
      { label: 'Una bună obiectiv, chiar dacă cere studiu', value: 'balanced' },
    ],
    correct: '',
  },
  {
    type: 'mcq',
    id: 's14',
    category: 'style',
    question: 'Ce fel de victorie te bucură cel mai mult?',
    options: [
      { label: 'Un atac cu sacrificii', value: 'offensive' },
      { label: 'O apărare din care adversarul n-a scos nimic', value: 'defensive' },
      { label: 'Un final câștigat cu precizie', value: 'pragmatic' },
      { label: 'O partidă jucată fără greșeli', value: 'balanced' },
    ],
    correct: '',
  },
  {
    type: 'mcq',
    id: 's15',
    category: 'style',
    question: 'Tu și adversarul ați făcut rocada pe flancuri opuse. Ce faci?',
    options: [
      { label: 'Pornesc imediat cu pionii spre regele lui', value: 'offensive' },
      { label: 'Întâi îmi întăresc regele', value: 'defensive' },
      { label: 'Schimb damele, ca atacurile să se stingă', value: 'pragmatic' },
      { label: 'Văd cine e mai rapid și decid', value: 'balanced' },
    ],
    correct: '',
  },
]

/** Câte întrebări de stil intră într-un test (16–20). */
const INTREBARI_STIL = 5
const CHEIE_ULTIMUL_TEST = 'plasament-ultimele-intrebari'

function amesteca<T>(lista: T[]): T[] {
  const b = [...lista]
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}

/**
 * Întrebările unui test, trase la sorţi (cerut pe 2026-11-25): la fiecare din
 * cele 15 trepte de tactică, unul dintre puzzle-urile de acelaşi fel şi aceeaşi
 * dificultate; apoi 5 întrebări de stil din toate, cu răspunsurile amestecate.
 * Ce a apărut la testul dinainte (pe acelaşi dispozitiv) se ocoleşte.
 */
export function alegeTest(): AssessmentQuestion[] {
  let ultimele = new Set<string>()
  try { ultimele = new Set(JSON.parse(localStorage.getItem(CHEIE_ULTIMUL_TEST) ?? '[]') as string[]) } catch { /* fără istoric */ }

  const tactici = TREPTE_TACTICA.map(treapta => {
    const noi = treapta.filter(q => !ultimele.has(q.id))
    const din = noi.length > 0 ? noi : treapta
    return din[Math.floor(Math.random() * din.length)]
  })
  const toateStil = MCQ_QUESTIONS.filter(q => q.category === 'style')
  const stilNoi = toateStil.filter(q => !ultimele.has(q.id))
  const stil = amesteca(stilNoi.length >= INTREBARI_STIL ? stilNoi : toateStil)
    .slice(0, INTREBARI_STIL)
    .map(q => ({ ...q, options: amesteca(q.options) }))

  const test: AssessmentQuestion[] = [...tactici, ...stil]
  try { localStorage.setItem(CHEIE_ULTIMUL_TEST, JSON.stringify(test.map(q => q.id))) } catch { /* fără istoric */ }
  return test
}
