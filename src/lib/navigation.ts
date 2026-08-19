import {
  LayoutDashboard, BookOpen, Puzzle, BarChart2,
  User, Sword, Calendar, Users, Library, Trophy, GraduationCap, Sparkles, Target, Cpu, Flame,
  type LucideIcon,
} from 'lucide-react'

/**
 * O pagină din navigare.
 *
 * `label` — eticheta din bară (scurtă)
 * `description` — ce faci concret acolo. Prezenţa ei e chiar mecanismul prin care
 *   pagina intră în harta de pe Bârlog; cele fără descriere nu apar acolo.
 */
export interface NavLeaf {
  to: string
  label: string
  description?: string
  icon: LucideIcon
}

/** Un grup din bara de sus, care se deschide într-un meniu. */
export interface NavGroup {
  label: string
  items: NavLeaf[]
}

export type NavEntry = NavLeaf | NavGroup

export function isGroup(entry: NavEntry): entry is NavGroup {
  return 'items' in entry
}

/**
 * Navigarea principală, aşezată în bara de sus.
 *
 * Puţine elemente vizibile, restul în meniuri: cele 11 pagini puse toate pe
 * orizontală ar cere ~2000px numai pentru navigare şi n-ar încăpea.
 */
export const NAV: NavEntry[] = [
  { to: '/dashboard', label: 'Bârlog', icon: LayoutDashboard },
  {
    to: '/courses',
    label: 'Cursuri',
    description: 'Deschideri explicate mutare cu mutare, cu antrenament pe tablă.',
    icon: BookOpen,
  },
  {
    label: 'Antrenament',
    items: [
      {
        to: '/puzzles',
        label: 'Puzzle-uri',
        description: 'Exerciții tactice la nivelul tău, cu rating care se ajustează după fiecare.',
        icon: Puzzle,
      },
      {
        to: '/misiuni',
        label: 'Misiunile zilei',
        description: 'Trei obiective mici pe zi, cu XP la fiecare și bonus dacă le termini pe toate.',
        icon: Target,
      },
      {
        to: '/tactics',
        label: 'Cuferele cu tactici',
        description: 'Trasee pe categorii — furculiță, țintuire, sacrificiu — de la începător la maestru.',
        icon: Sword,
      },
      {
        to: '/analiza',
        label: 'Tabla de analiză',
        description: 'Mută liber și vezi pe loc cum evaluează motorul fiecare variantă.',
        icon: Cpu,
      },
      {
        to: '/proba',
        label: 'Proba de foc',
        description: 'Trei poziții din deschiderile tale, contra unui adversar mai tare. Câștigi cât îmbunătățești poziția.',
        icon: Flame,
      },
      {
        to: '/pentru-incepatori',
        label: 'Pentru începători',
        description: 'Regulile jocului, notația și primele tipare, dacă pornești de la zero.',
        icon: GraduationCap,
      },
    ],
  },
  {
    label: 'Comunitate',
    items: [
      {
        to: '/leagues',
        label: 'Ligi',
        description: 'Câștigi XP din tot ce faci și avansezi prin cele șapte ligi.',
        icon: Trophy,
      },
      {
        to: '/clasament',
        label: 'Clasament',
        description: 'Cum stai față de ceilalți jucători din liga ta.',
        icon: Users,
      },
      {
        to: '/evenimente',
        label: 'Evenimente',
        description: 'Sărbători, zile ale marilor jucători și provocări cu termen.',
        icon: Sparkles,
      },
      {
        to: '/calendar',
        label: 'Calendar competițional',
        description: 'Turnee pe platformă și competiții pe tablă reală.',
        icon: Calendar,
      },
    ],
  },
]

/** Paginile care ţin de cont — stau în meniul de sub avatar, nu în navigarea principală. */
export const ACCOUNT_ITEMS: NavLeaf[] = [
  {
    to: '/stats',
    label: 'Statistici personale',
    description: 'Cum ți-a evoluat rating-ul și unde greșești cel mai des.',
    icon: BarChart2,
  },
  {
    to: '/repertoire',
    label: 'Studiază-ți partidele',
    description: 'Îți importă partidele din Lichess și arată la ce deschideri pierzi.',
    icon: Library,
  },
  { to: '/profile', label: 'Profil', icon: User },
]

/** Toate paginile, aplatizate — pentru meniul de pe mobil. */
export const ALL_PAGES: NavLeaf[] = [
  ...NAV.flatMap(e => (isGroup(e) ? e.items : [e])),
  ...ACCOUNT_ITEMS,
]

// Aici era `MAP_ZONES`, harta cu toate zonele de pe Bârlog. Pagina de start nu
// mai deschide treisprezece uşi deodată — descrierile de o linie au rămas
// totuşi în `NAV`, fiindcă spun ce e fiecare pagină şi îşi găsesc oricând alt
// loc unde să fie de folos.

/**
 * Arhetipul de pagină — decide cum se comportă shell-ul.
 *
 * `focus`   — construită în jurul unei table (puzzle, lecție, trainer). Umple
 *             viewport-ul şi primeşte toată lăţimea.
 * `catalog` — de răsfoit. Conţinutul stă într-un container centrat.
 */
export type PageArchetype = 'focus' | 'catalog'

const FOCUS_PATTERNS: RegExp[] = [
  /^\/puzzles(\/|$)/,
  /^\/analiza$/,
  /^\/courses\/[^/]+\/(lessons|guided|practice|middlegame|middlegame-practice)\//,
  /^\/tactics\/[^/]+\/[^/]+$/,
  /^\/proba\/joc$/,
]

export function archetypeFor(pathname: string): PageArchetype {
  return FOCUS_PATTERNS.some(re => re.test(pathname)) ? 'focus' : 'catalog'
}

/**
 * Cât de mare se randează o pagină faţă de restul aplicaţiei.
 *
 * Bârlogul e pagina pe care o vede toată lumea prima, şi e alcătuită aproape
 * numai din text mic: etichete, descrieri de o linie, cifre. La 100% arăta
 * pierdut într-un ecran lat. Mărirea se face cu `zoom`, ca la bara de sus — un
 * singur număr care creşte deodată şi scrisul, şi casetele, şi spaţiile dintre
 * ele, fără să rescriem zeci de clase Tailwind.
 *
 * Aici, nu în layout, ca decizia să stea lângă celelalte care ţin de pagini.
 */
export function pageZoomFor(pathname: string): number {
  return pathname === '/dashboard' ? 1.25 : 1
}

/** Grupul e „activ" dacă ruta curentă e una dintre paginile lui. */
export function isEntryActive(entry: NavEntry, pathname: string): boolean {
  const pages = isGroup(entry) ? entry.items : [entry]
  return pages.some(p => pathname === p.to || pathname.startsWith(`${p.to}/`))
}
