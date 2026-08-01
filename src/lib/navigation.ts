import {
  LayoutDashboard, BookOpen, Puzzle, BarChart2,
  User, Sword, Calendar, Users, Library, Trophy, GraduationCap,
  type LucideIcon,
} from 'lucide-react'

/** O pagină din navigare. `label` e eticheta din bară (scurtă); `title` e antetul
 *  paginii, când acesta merită să fie mai explicit. */
export interface NavLeaf {
  to: string
  label: string
  title?: string
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
  { to: '/courses', label: 'Cursuri', title: 'Cursuri interactive', icon: BookOpen },
  {
    label: 'Antrenament',
    items: [
      { to: '/puzzles', label: 'Puzzle-uri', icon: Puzzle },
      { to: '/tactics', label: 'Cufărul cu tactici', icon: Sword },
      { to: '/pentru-incepatori', label: 'Pentru începători', icon: GraduationCap },
    ],
  },
  {
    label: 'Comunitate',
    items: [
      { to: '/leagues', label: 'Ligi', icon: Trophy },
      { to: '/community', label: 'Comunitate', icon: Users },
      { to: '/calendar', label: 'Calendar competițional', icon: Calendar },
    ],
  },
]

/** Paginile care ţin de cont — stau în meniul de sub avatar, nu în navigarea principală. */
export const ACCOUNT_ITEMS: NavLeaf[] = [
  { to: '/stats', label: 'Statistici personale', icon: BarChart2 },
  { to: '/repertoire', label: 'Studiază-ți partidele', icon: Library },
  { to: '/profile', label: 'Profil', icon: User },
]

/** Toate paginile, aplatizate — pentru titluri şi pentru meniul de pe mobil. */
export const ALL_PAGES: NavLeaf[] = [
  ...NAV.flatMap(e => (isGroup(e) ? e.items : [e])),
  ...ACCOUNT_ITEMS,
]

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
