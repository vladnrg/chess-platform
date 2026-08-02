import {
  LayoutDashboard, BookOpen, Puzzle, BarChart2,
  User, Sword, Calendar, Users, Library, Trophy, GraduationCap,
  type LucideIcon,
} from 'lucide-react'

/**
 * O pagină din navigare.
 *
 * `label` — eticheta din bară (scurtă)
 * `title` — antetul paginii, când merită să fie mai explicit decât eticheta
 * `description` — ce faci concret acolo. Prezenţa ei e chiar mecanismul prin care
 *   pagina intră în harta de pe Bârlog; cele fără descriere nu apar acolo.
 */
export interface NavLeaf {
  to: string
  label: string
  title?: string
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
  { to: '/dashboard', label: 'Bârlog', title: 'Bârlogul șahistului', icon: LayoutDashboard },
  {
    to: '/courses',
    label: 'Cursuri',
    title: 'Cursuri interactive',
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
        to: '/tactics',
        label: 'Cufărul cu tactici',
        description: 'Trasee pe categorii — furculiță, țintuire, sacrificiu — de la începător la maestru.',
        icon: Sword,
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

/** Toate paginile, aplatizate — pentru titluri şi pentru meniul de pe mobil. */
export const ALL_PAGES: NavLeaf[] = [
  ...NAV.flatMap(e => (isGroup(e) ? e.items : [e])),
  ...ACCOUNT_ITEMS,
]

/**
 * Zonele din harta de pe Bârlog — exact paginile care şi-au declarat o descriere.
 * Bârlogul însuşi şi Profilul nu au, deci nu apar: harta arată unde poţi merge,
 * nu unde eşti deja.
 */
export const MAP_ZONES: NavLeaf[] = ALL_PAGES.filter(p => p.description)

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
  /^\/courses\/[^/]+\/(lessons|guided|practice)\//,
  /^\/tactics\/[^/]+\/[^/]+$/,
]

export function archetypeFor(pathname: string): PageArchetype {
  return FOCUS_PATTERNS.some(re => re.test(pathname)) ? 'focus' : 'catalog'
}

/**
 * Pagini care îşi poartă singure antetul (hero propriu). Shell-ul nu le mai pune
 * un titlu deasupra, ca să nu se dubleze.
 */
const OWN_HEADER_ROUTES = new Set(['/courses', '/puzzles'])

/**
 * Titlul pe care shell-ul îl randează ca prim element al conţinutului, sau `null`
 * dacă pagina şi-l poartă singură.
 *
 * Doar potrivire exactă: sub-paginile (un curs, o lecţie, o variantă) au deja un
 * titlu contextual propriu — mult mai util decât numele secţiunii din care fac
 * parte. Un „Cursuri interactive" deasupra lui „Linia Clasică" ar fi doar zgomot.
 */
export function shellTitleFor(pathname: string): string | null {
  if (OWN_HEADER_ROUTES.has(pathname)) return null
  const page = ALL_PAGES.find(p => p.to === pathname)
  return page ? (page.title ?? page.label) : null
}

/** Grupul e „activ" dacă ruta curentă e una dintre paginile lui. */
export function isEntryActive(entry: NavEntry, pathname: string): boolean {
  const pages = isGroup(entry) ? entry.items : [entry]
  return pages.some(p => pathname === p.to || pathname.startsWith(`${p.to}/`))
}
