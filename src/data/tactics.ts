export interface TacticCategory {
  id: string
  title: string
  description: string
  lichessThemes: string[]
  isPro: boolean
  coverFen: string
}

export const TACTIC_CATEGORIES: TacticCategory[] = [
  {
    id: 'fork',
    title: 'Furculiță și atac dublu',
    description: 'O piesă atacă simultan două piese adverse. Adversarul nu le poate salva pe amândouă.',
    lichessThemes: ['fork'],
    isPro: false,
    coverFen: '4k3/3q1r2/8/4N3/8/8/8/4K3 w - - 0 1',
  },
  {
    id: 'pin',
    title: 'Legarea absolută și relativă',
    description: 'O piesă nu poate muta fără să expună o piesă mai valoroasă din spatele ei.',
    lichessThemes: ['pin'],
    isPro: false,
    coverFen: '4k3/8/2n5/1B6/8/8/8/4K3 w - - 0 1',
  },
  {
    id: 'discovered',
    title: 'Atac prin descoperire, șah prin descoperire și șah dublu',
    description: 'O piesă mută dezvăluind atacul alteia. Poate da simultan șah de la două piese.',
    lichessThemes: ['discoveredAttack', 'doubleCheck'],
    isPro: false,
    coverFen: '1q2k3/8/8/8/8/1B6/8/1R2K3 w - - 0 1',
  },
  {
    id: 'attraction',
    title: 'Atragerea / Devierea / Atracția',
    description: 'Forțezi o piesă adversă pe un pătrat dezavantajos sau o îndepărtezi de la apărare.',
    lichessThemes: ['attraction', 'deflection'],
    isPro: true,
    coverFen: '3k4/3q4/8/8/8/8/3Q4/3K4 w - - 0 1',
  },
  {
    id: 'remove-defender',
    title: 'Îndepărtarea apărătorului: capturare sau supraîncărcare',
    description: 'Elimini sau supraîncărci piesa care apără un pătrat sau o piesă cheie.',
    lichessThemes: ['removeDefender', 'overloading'],
    isPro: true,
    coverFen: '5k2/5ppp/8/8/8/5N2/5PPP/5RK1 w - - 0 1',
  },
  {
    id: 'skewer',
    title: 'Teapă și atacul cu „raze X"',
    description: 'Forțezi o piesă valoroasă să mute, capturând piesa ascunsă în spatele ei.',
    lichessThemes: ['skewer', 'xRayAttack'],
    isPro: true,
    coverFen: '4k3/4r3/8/8/8/8/8/4R3 w - - 0 1',
  },
  {
    id: 'trapped',
    title: 'Prinderea piesei',
    description: 'O piesă adversă nu are pătrate sigure unde să se retragă. O capturezi în câteva mutări.',
    lichessThemes: ['trappedPiece'],
    isPro: true,
    coverFen: '8/8/5k2/6p1/5Bp1/8/8/5K2 b - - 0 1',
  },
  {
    id: 'mate',
    title: 'Tactici de mat',
    description: 'Modele de mat forțat: mat în 1, 2, 3 mutări, mat sufocant, mat pe ultima linie.',
    lichessThemes: ['mateIn1', 'mateIn2', 'mateIn3', 'smotheredMate', 'backRankMate'],
    isPro: true,
    coverFen: '6rk/6pp/8/8/8/8/8/4R1K1 w - - 0 1',
  },
  {
    id: 'forced-draws',
    title: 'Remize forțate',
    description: 'Șah perpetuu, pat sau repetiție triplă — tactici pentru a salva o poziție pierdută.',
    lichessThemes: ['perpetualCheck', 'stalemate'],
    isPro: true,
    coverFen: '6k1/5ppp/8/8/8/8/8/4Q1K1 w - - 0 1',
  },
  {
    id: 'zwischenzug',
    title: 'Atac intermediar (Zwischenzug)',
    description: 'În loc să răspunzi forțat, intercalezi o mutare intermediară care schimbă calculul.',
    lichessThemes: ['zwischenzug', 'interference'],
    isPro: true,
    coverFen: 'r1bqk2r/ppp2ppp/2n2n2/3pp3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 7',
  },
  {
    id: 'sacrifice',
    title: 'Sacrificii',
    description: 'Cedezi material deliberat pentru avantaj pozițional, atac sau mat.',
    lichessThemes: ['sacrifice'],
    isPro: true,
    coverFen: 'r1bqk2r/pp2bppp/2np1n2/4p3/2B1P3/2NP1N2/PPP2PPP/R1BQR1K1 w kq - 0 9',
  },
  {
    id: 'subscribers',
    title: 'Tactici pentru abonați',
    description: 'Teme avansate: eliberare, mutare liniștită, zugzwang, coerciție.',
    lichessThemes: ['clearance', 'quietMove', 'zugzwang', 'coercion'],
    isPro: true,
    coverFen: '8/8/8/3k4/3P4/3K4/8/8 w - - 0 1',
  },
  {
    id: 'hybrid',
    title: 'Tactici hibride',
    description: 'Combinații complexe din mijlocul jocului și finaluri cu teme tactice suprapuse.',
    lichessThemes: ['middlegame', 'endgame', 'exposedKing'],
    isPro: true,
    coverFen: 'r1bqr1k1/pp3pbp/2np1np1/3Np3/2B1P3/2N1BP2/PPP3PP/R2Q1RK1 w - - 0 12',
  },
  {
    id: 'mixed-bonus',
    title: 'Tactici mixte bonus',
    description: 'Colecție bonus cu poziții de top selectate din partide reale de mare nivel.',
    lichessThemes: ['crushing', 'equality', 'advantage'],
    isPro: true,
    coverFen: 'r2qk2r/pb1nbppp/1p2pn2/2pp4/3P4/2PBP3/PP1N1PPP/R1BQK2R w KQkq - 0 9',
  },
]
