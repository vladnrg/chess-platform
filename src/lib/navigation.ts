import {
  LayoutDashboard, BookOpen, Puzzle, BarChart2,
  User, Sword, Calendar, Users, Library, Trophy, GraduationCap,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  icon: LucideIcon
  label: string
}

/** Meniul principal. Sursă unică: sidebar-ul îl randează, shell-ul îi ia titlurile. */
export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Bârlogul șahistului' },
  { to: '/courses', icon: BookOpen, label: 'Cursuri interactive' },
  { to: '/puzzles', icon: Puzzle, label: 'Puzzle-uri' },
  { to: '/tactics', icon: Sword, label: 'Cufărul cu tactici' },
  { to: '/pentru-incepatori', icon: GraduationCap, label: 'Pentru începători' },
  { to: '/calendar', icon: Calendar, label: 'Calendar competițional' },
  { to: '/community', icon: Users, label: 'Comunitate' },
  { to: '/leagues', icon: Trophy, label: 'Ligi' },
  { to: '/stats', icon: BarChart2, label: 'Statistici personale' },
  { to: '/repertoire', icon: Library, label: 'Studiază-ți partidele' },
  { to: '/profile', icon: User, label: 'Profil' },
]

/**
 * Arhetipul de pagină — decide cum se comportă shell-ul.
 *
 * `focus`   — construită în jurul unei table (puzzle, lecție, trainer). Umple
 *             viewport-ul, sidebar-ul se retrage, tabla primește spațiul.
 * `catalog` — de răsfoit (cursuri, tactici, resurse). Conținutul de primul ecran
 *             încape întreg; ce e mai mult se derulează orizontal, în carusele.
 *
 * Înlocuiește verificările ad-hoc de `pathname` împrăștiate prin layout.
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
 * Pagini care îşi poartă singure titlul (hero propriu sau antet cu context lângă
 * el). Pentru ele shell-ul nu randează bara de sus — altfel titlul s-ar dubla şi
 * pagina ar pierde degeaba înălţime.
 *
 * Lista e o excepţie asumată, nu norma: pe termen lung aceste pagini ar trebui
 * aduse la acelaşi antet ca restul. Până atunci rămân aşa cum erau.
 */
const OWN_HEADER_ROUTES = new Set(['/courses', '/puzzles'])

export function hasOwnHeader(pathname: string): boolean {
  return OWN_HEADER_ROUTES.has(pathname)
}

/**
 * Titlul afișat în bara de sus, pentru paginile care nu-şi poartă unul propriu.
 */
const EXTRA_TITLES: Record<string, string> = {
  '/pricing': 'Abonament Pro',
  '/puzzles/placement': 'Test de plasament',
}

export function pageTitleFor(pathname: string): string {
  if (EXTRA_TITLES[pathname]) return EXTRA_TITLES[pathname]
  // Cea mai specifică potrivire câștigă: /courses/foo → „Cursuri interactive"
  const match = NAV_ITEMS
    .filter(i => pathname === i.to || pathname.startsWith(`${i.to}/`))
    .sort((a, b) => b.to.length - a.to.length)[0]
  return match?.label ?? 'CleanChess'
}
