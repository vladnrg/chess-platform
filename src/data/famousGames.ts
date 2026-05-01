export interface FamousGame {
  id: string
  title: string
  players: string
  year: number
  event: string
  description: string
  keyLesson: string
  lichessUrl: string
  result: string
}

export const FAMOUS_GAMES: FamousGame[] = [
  {
    id: 'immortal-game',
    title: 'Partida Nemuritoare',
    players: 'Adolf Anderssen vs Lionel Kieseritzky',
    year: 1851,
    event: 'Londra, partidă neoficială',
    description:
      'Anderssen sacrifică ambele turnuri, nebunul și o damă pentru a da mat cu cele trei piese minore rămase. Considerată cea mai spectaculoasă combinație din istoria șahului.',
    keyLesson: 'Atacul de rege și sacrificiile de material',
    lichessUrl: 'https://lichess.org/study/EaKcWVp7',
    result: '1-0',
  },
  {
    id: 'opera-game',
    title: 'Partida de la Operă',
    players: 'Paul Morphy vs Duke of Brunswick & Count Isouard',
    year: 1858,
    event: 'Paris Opera, partidă în lojă',
    description:
      'Morphy câștigă cu o demonstrație perfectă de dezvoltare rapidă și control al coloanelor deschise, terminând cu un mat elegant pe coloana d. Lecție perfectă de principii de deschidere.',
    keyLesson: 'Dezvoltare rapidă, control centru și coloane deschise',
    lichessUrl: 'https://lichess.org/study/RMKRLfNA',
    result: '1-0',
  },
  {
    id: 'evergreen-game',
    title: 'Partida Veșnic Verde',
    players: 'Adolf Anderssen vs Jean Dufresne',
    year: 1852,
    event: 'Berlin, partidă privată',
    description:
      'Anderssen sacrifică dama și ambii turnuri pentru a ataca regele negru rămas în centru. Finala include celebrul "Qxf7+!" — un sacrificiu ce a rămas în manuale ca exemplu de atac necontenit.',
    keyLesson: 'Pericole regale și control centru',
    lichessUrl: 'https://lichess.org/study/p5CdExRQ',
    result: '1-0',
  },
  {
    id: 'deep-blue-kasparov',
    title: 'Deep Blue vs. Kasparov, Partida 2',
    players: 'Deep Blue vs Garry Kasparov',
    year: 1997,
    event: 'New York, Remiatch',
    description:
      'Prima victorie a unui calculator împotriva unui campion mondial în condiții de competiție. Deep Blue joacă un sacrifice pozițional subtil pe mutarea 36 pe care Kasparov nu îl anticipează. Moment istoric în istoria șahului și a inteligenței artificiale.',
    keyLesson: 'Sacrificii poziționale și planificare pe termen lung',
    lichessUrl: 'https://lichess.org/study/fVFkBqRa',
    result: '1-0',
  },
  {
    id: 'kasparov-topalov',
    title: 'Partida Secolului XX',
    players: 'Garry Kasparov vs Veselin Topalov',
    year: 1999,
    event: 'Wijk aan Zee',
    description:
      'Kasparov avansează regele propriu în mijlocul luptei și sacrifică un turn pentru a crea presiune de atac insurmontabilă. Votată „Partida Secolului" de publicația ChessBase.',
    keyLesson: 'Activarea regelui și sacrificii de material în atac',
    lichessUrl: 'https://lichess.org/study/2Zf7Y4Dp',
    result: '1-0',
  },
  {
    id: 'fischer-byrne',
    title: 'Partida Secolului (Fischer)',
    players: 'Robert James Fischer vs Donald Byrne',
    year: 1956,
    event: 'Rosenwald Trophy, New York',
    description:
      'Fischer, la 13 ani, sacrifică dama pe mutarea 17 și construiește un atac devastator. Tabloul final, cu negrul câștigând prin material superior după ce regele alb este prins în centru, rămâne unul dintre cele mai frumoase din istoria șahului.',
    keyLesson: 'Activarea pieselor și sacrificiul damei',
    lichessUrl: 'https://lichess.org/study/TsEJ24Tb',
    result: '0-1',
  },
]

export const PDF_RESOURCES = [
  {
    id: 'fide-rules',
    title: 'Regulamentul Oficial FIDE',
    description: 'Regulile complete ale șahului clasic, rapid și blitz conform FIDE 2023.',
    url: 'https://www.fide.com/FIDE/handbook/LawsOfChess.pdf',
    language: 'EN',
  },
  {
    id: 'chess-notation-guide',
    title: 'Ghid Notație Algebrică',
    description: 'Cum se citesc și se scriu mutările în notație algebrică standard.',
    url: 'https://www.chess.com/learn-how-to-play-chess',
    language: 'EN',
  },
  {
    id: 'tactics-workbook',
    title: 'Caiet de Tactici — Nivel Începător',
    description: '50 de probleme tactice cu soluții pentru jucătorii de la 600-1000 Elo.',
    url: 'https://lichess.org/practice',
    language: 'EN',
  },
]
