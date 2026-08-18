export interface TacticCategory {
  id: string
  title: string
  description: string
  lichessThemes: string[]
  isPro: boolean
  coverFen: string
  /**
   * Primul cufăr în care apare tactica. Peste el apare în toate.
   *
   * Nu toate tacticile au ce căuta la începător: un sacrificiu cere să vezi trei
   * mutări înainte şi să accepţi că pierzi material pe moment — n-ai ce face cu
   * el înainte să recunoşti o furculiţă. Ordinea de aici e cea în care se învaţă
   * la şah, nu una alfabetică sau după câte puzzle-uri există.
   *
   * Vezi `TACTIC_TIERS` din `src/lib/tactics-path.ts` pentru cele patru trepte.
   */
  minTier: 'incepator' | 'intermediar' | 'avansat' | 'master'
  /**
   * Ultimul cufăr în care mai apare. Lipsă = până sus.
   *
   * Temele obişnuite se opresc la avansat: la master nu mai primeşti cartonaşe
   * cu nume, fiindcă diferenţa dintre 1800 şi 2400 nu e că ştii mai multe teme,
   * ci că le recunoşti fără să ţi le anunţe cineva.
   */
  maxTier?: 'incepator' | 'intermediar' | 'avansat' | 'master'
  /**
   * Ce fel de cartonaş e. Lipsă = temă obişnuită.
   *
   * `proba` — cele zece poziţii amestecate de la capătul fiecărui cufăr.
   * `mixt`  — formatele de la master: trag din toate temele deodată.
   */
  fel?: 'proba' | 'mixt'
  /** Regula de joc, doar la formatele de la master. */
  mod?: 'cronometru' | 'fara-greseala'
}

/** Temele Lichess folosite de cartonaşele care trag din tot (proba, formatele). */
export const TOATE_TEMELE = [
  'fork', 'pin', 'discoveredAttack', 'doubleCheck', 'attraction', 'deflection',
  'capturingDefender', 'skewer', 'xRayAttack', 'trappedPiece',
  'mateIn1', 'mateIn2', 'mateIn3', 'smotheredMate', 'backRankMate',
  'defensiveMove', 'intermezzo', 'interference', 'sacrifice',
  'clearance', 'quietMove', 'zugzwang',
]

export const TACTIC_CATEGORIES: TacticCategory[] = [
  {
    id: 'fork',
    title: 'Furculița',
    description: 'O piesă atacă simultan două ținte, iar adversarul nu le poate salva pe amândouă. E momentul în care un singur cal valorează cât o regină furată.',
    lichessThemes: ['fork'],
    isPro: false,
    coverFen: '4k3/3q1r2/8/4N3/8/8/8/4K3 w - - 0 1',
    minTier: 'incepator',
    maxTier: 'avansat',
  },
  {
    id: 'pin',
    title: 'Legarea absolută și relativă',
    description: 'Ții o piesă „țintuită" — dacă mută, expune ceva mai valoros din spate. Practic, îi pui adversarului o piesă în lanțuri și arunci cheia.',
    lichessThemes: ['pin'],
    isPro: false,
    coverFen: '4k3/8/2n5/1B6/8/8/8/4K3 w - - 0 1',
    minTier: 'incepator',
    maxTier: 'avansat',
  },
  {
    id: 'discovered',
    title: 'Atac prin descoperire',
    description: 'Muți o piesă și dezvălui atacul alteia din spatele ei — uneori două șahuri deodată. E trădarea perfectă: una se dă la o parte, cealaltă lovește.',
    lichessThemes: ['discoveredAttack', 'doubleCheck'],
    isPro: false,
    coverFen: '1q2k3/8/8/8/8/1B6/8/1R2K3 w - - 0 1',
    minTier: 'incepator',
    maxTier: 'avansat',
  },
  {
    id: 'attraction',
    title: 'Atragerea și devierea',
    description: 'Forțezi o piesă adversă fix unde vrei tu sau o tragi departe de ce apăra. Un mic „vino-ncoace" care se termină prost pentru ea.',
    lichessThemes: ['attraction', 'deflection'],
    isPro: true,
    coverFen: '3k4/3q4/8/8/8/8/3Q4/3K4 w - - 0 1',
    minTier: 'intermediar',
    maxTier: 'avansat',
  },
  {
    id: 'remove-defender',
    title: 'Eliminarea apărătorului',
    description: 'Elimini sau supraîncarci piesa care ține totul pe loc, iar apărarea se prăbușește. Scoți un bolț — și se dărâmă toată construcția.',
    lichessThemes: ['capturingDefender'],
    isPro: true,
    coverFen: '5k2/5ppp/8/8/8/5N2/5PPP/5RK1 w - - 0 1',
    minTier: 'intermediar',
    maxTier: 'avansat',
  },
  {
    id: 'skewer',
    title: 'Atacul cu raze X',
    description: 'Ataci o piesă valoroasă care, când se ferește, lasă descoperită prada din spate. E furculița întoarsă pe dos — și la fel de dureroasă.',
    lichessThemes: ['skewer', 'xRayAttack'],
    isPro: true,
    coverFen: '4k3/4r3/8/8/8/8/8/4R3 w - - 0 1',
    minTier: 'incepator',
    maxTier: 'avansat',
  },
  {
    id: 'trapped',
    title: 'Prinderea piesei',
    description: 'O piesă adversă rămâne fără pătrate sigure și o capturezi în câteva mutări. Toată tabla, și ea tot n-are unde fugi.',
    lichessThemes: ['trappedPiece'],
    isPro: true,
    coverFen: '8/8/5k2/6p1/5Bp1/8/8/5K2 b - - 0 1',
    minTier: 'intermediar',
    maxTier: 'avansat',
  },
  {
    id: 'mate',
    title: 'Mat în N mutări',
    description: 'Secvențe forțate care se termină inevitabil cu mat — în 1, 2 sau 3 mutări. Vezi finalul înainte să se întâmple și execută-l fără milă.',
    lichessThemes: ['mateIn1', 'mateIn2', 'mateIn3', 'smotheredMate', 'backRankMate'],
    isPro: true,
    coverFen: '6rk/6pp/8/8/8/8/8/4R1K1 w - - 0 1',
    minTier: 'incepator',
    maxTier: 'avansat',
  },
  {
    id: 'forced-draws',
    title: 'Resurse defensive',
    description: 'Poziția pare pierdută, dar există o singură mutare care te salvează. Învață să găsești colacul de salvare când totul arde în jur.',
    lichessThemes: ['defensiveMove'],
    isPro: true,
    coverFen: '6k1/5ppp/8/8/8/8/8/4Q1K1 w - - 0 1',
    minTier: 'avansat',
    maxTier: 'avansat',
  },
  {
    id: 'zwischenzug',
    title: 'Mutarea intermediară',
    description: 'În loc să răspunzi cuminte, strecori o mutare-surpriză care schimbă tot calculul. Cuvântul e german, durerea pentru adversar e universală.',
    lichessThemes: ['intermezzo', 'interference'],
    isPro: true,
    coverFen: 'r1bqk2r/ppp2ppp/2n2n2/3pp3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 7',
    minTier: 'avansat',
    maxTier: 'avansat',
  },
  {
    id: 'sacrifice',
    title: 'Sacrificiu',
    description: 'Cedezi material intenționat pentru atac, inițiativă sau mat — și înveți să deosebești geniul de sinucidere. Nu orice damă dăruită e o capodoperă.',
    lichessThemes: ['sacrifice'],
    isPro: true,
    coverFen: 'r1bqk2r/pp2bppp/2np1n2/4p3/2B1P3/2NP1N2/PPP2PPP/R1BQR1K1 w kq - 0 9',
    minTier: 'avansat',
    maxTier: 'avansat',
  },
  {
    id: 'subscribers',
    title: 'Combinații de tactici',
    // Aici s-au strâns şi „Tactici hibride" şi „Tactici mixte bonus": caseta
    // ţine acum şi combinaţiile înlănţuite, şi poziţiile fără temă anunţată.
    // De-aia temele ei sunt largi — e singura categorie care nu-ţi spune
    // dinainte ce cauţi.
    description: 'Mai multe tactici înlănțuite într-o singură partidă, plus poziții din mijloc de joc și finaluri fără temă anunțată. Tu descoperi lovitura — exact ca într-o partidă adevărată.',
    lichessThemes: [
      'clearance', 'quietMove', 'zugzwang',
      'middlegame', 'endgame', 'exposedKing',
      'crushing', 'equality', 'advantage',
    ],
    isPro: true,
    coverFen: '8/8/8/3k4/3P4/3K4/8/8 w - - 0 1',
    minTier: 'avansat',
    maxTier: 'avansat',
  },
  {
    // Proba stă în fiecare cufăr, la capătul rândului. Zece poziţii din temele
    // cufărului, amestecate şi fără să ţi se spună ce cauţi — cufărul are
    // desenată o broască de lacăt, iar asta e cheia.
    id: 'proba',
    title: 'Proba cufărului',
    description: 'Zece poziții din tot ce e în cufărul ăsta, amestecate. Nu ți se spune tema — exact ca într-o partidă. Le iei pe toate, cufărul e al tău.',
    lichessThemes: TOATE_TEMELE,
    isPro: false,
    coverFen: '4k3/8/8/8/8/8/8/4K3 w - - 0 1',
    minTier: 'incepator',
    fel: 'proba',
  },
  {
    id: 'master-mixt',
    title: 'Fără temă anunțată',
    description: 'Poziții din toate temele, la rând, fără etichetă. Aici nu se mai verifică dacă știi tema, ci dacă o vezi.',
    lichessThemes: TOATE_TEMELE,
    isPro: true,
    coverFen: '4k3/8/8/8/8/8/8/4K3 w - - 0 1',
    minTier: 'master',
    fel: 'mixt',
  },
  {
    id: 'master-cronometru',
    title: 'Contra cronometru',
    description: 'Aceleași poziții, dar cu ceasul pornit. Ai un minut de fiecare. Tactica pe care o vezi în zece secunde e a ta; restul sunt de învățat.',
    lichessThemes: TOATE_TEMELE,
    isPro: true,
    coverFen: '4k3/8/8/8/8/8/8/4K3 w - - 0 1',
    minTier: 'master',
    fel: 'mixt',
    mod: 'cronometru',
  },
  {
    id: 'master-fara-greseala',
    title: 'Fără greșeală',
    description: 'Zece la rând, fără să greșești. O singură ratare și seria se rupe de la capăt. Precizia, nu numărul, e ce se măsoară aici.',
    lichessThemes: TOATE_TEMELE,
    isPro: true,
    coverFen: '4k3/8/8/8/8/8/8/4K3 w - - 0 1',
    minTier: 'master',
    fel: 'mixt',
    mod: 'fara-greseala',
  },
]
