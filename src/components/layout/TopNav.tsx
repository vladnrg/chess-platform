import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronDown, Crown, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { StreakBadge } from './StreakBadge'
import { cn, getLeagueConfig } from '@/lib/utils'
import {
  NAV, ACCOUNT_ITEMS, ALL_PAGES, isGroup, isEntryActive, type NavLeaf,
} from '@/lib/navigation'

/**
 * Închide panoul la clic în afara lui sau la Escape. Întors ca hook ca să nu
 * repetăm aceeaşi logică în fiecare meniu din bară.
 */
function useDismiss(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return ref
}

/**
 * Panourile care nu sunt meniuri din bară, ţinute în aceeaşi stare cu ele.
 * Fiecare îşi are propriul mecanism de închidere, ancorat pe elementul lui.
 */
const MOBILE_PANEL = '__mobile'
const ACCOUNT_PANEL = '__account'

const itemClass = (active: boolean) => cn(
  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
  active
    ? 'bg-[rgba(226,179,64,0.12)] text-[#E2B340]'
    : 'text-[#A0A0A0] hover:bg-[#1C1C1C] hover:text-[#F0F0F0]'
)

function MenuLink({ item, onNavigate }: { item: NavLeaf; onNavigate: () => void }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) => itemClass(isActive)}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {item.label}
    </NavLink>
  )
}

export function TopNav() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { pathname } = useLocation()

  // Un singur panou deschis la un moment dat. Reţinem şi ruta pe care a fost
  // deschis: aşa o navigare îl închide singură, prin derivare, fără un efect care
  // să scrie în state după fiecare schimbare de pagină.
  const [panel, setPanel] = useState<{ id: string; at: string } | null>(null)
  const openMenu = panel?.at === pathname ? panel.id : null
  const mobileOpen = openMenu === MOBILE_PANEL

  const toggle = useCallback(
    (id: string) => setPanel(p => (p?.id === id && p.at === pathname ? null : { id, at: pathname })),
    [pathname]
  )
  const closeMenu = useCallback(() => setPanel(null), [])

  // Închiderea la click în afară e armată DOAR pentru meniurile din bară.
  //
  // Panoul de cont şi cel de pe mobil îşi au propriul `useDismiss`, ancorat pe
  // elementul lor. Armată şi pentru ele, verificarea de aici s-ar face faţă de
  // <nav>, care nu le conţine — aşa că un `mousedown` pe un buton dinăuntrul
  // panoului de cont îl închidea pe loc. Butonul dispărea înainte să apuce să se
  // producă `click`, iar Deconectarea părea că nu face nimic.
  const grupDinBaraDeschis =
    openMenu !== null && openMenu !== ACCOUNT_PANEL && openMenu !== MOBILE_PANEL
  const navRef = useDismiss(grupDinBaraDeschis, closeMenu)
  const mobileRef = useDismiss(mobileOpen, closeMenu)

  const league = profile ? getLeagueConfig(profile.current_league) : null

  /**
   * Deconectarea nu aşteaptă serverul.
   *
   * `signOut` curăţă starea locală sincron, înainte de orice apel de reţea, deci
   * până aici utilizatorul e deja deconectat. Restul — confirmarea revocării —
   * se rezolvă în fundal; dacă am fi aşteptat-o, o sesiune expirată ar fi blocat
   * tot ce urmează, inclusiv navigarea.
   */
  function handleSignOut() {
    closeMenu()
    void signOut()
    // Datele din cache aparţin contului care tocmai a plecat: fără golire, ele
    // s-ar vedea o clipă la următoarea autentificare, pe alt cont.
    queryClient.clear()
    navigate('/login', { replace: true })
  }

  return (
    <header
      className="relative z-30 flex flex-shrink-0 items-center border-b border-[#2A2A2A] bg-[#141414] px-4"
      style={{ height: 'var(--app-header)' }}
    >
      {/* Tot ce e în bară, mărit cu 25%.
          Zoom-ul stă pe învelişul ăsta, nu pe `header`: aşa înălţimea barei
          rămâne dată de --app-header (de care depinde şi calculul înălţimii
          tablelor de şah), iar mărirea atinge doar conţinutul.
          `relative` fiindcă panoul de pe mobil se poziţionează faţă de el —
          altfel ar cădea în afara sistemului de coordonate al zoom-ului. */}
      <div
        className="relative flex w-full items-center gap-4"
        style={{ zoom: 'var(--app-header-zoom)' }}
      >
      {/* Logo */}
      <Link to="/dashboard" className="flex flex-shrink-0 items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E2B340]">
          <span className="text-sm font-black text-black">♟</span>
        </div>
        <span className="font-display text-lg font-bold tracking-tight text-[#F0F0F0]">CleanChess</span>
      </Link>

      {/* Navigare principală — centrată, ca la referinţă */}
      <nav ref={navRef} className="hidden flex-1 items-center justify-center gap-1 lg:flex">
        {NAV.map(entry => {
          const active = isEntryActive(entry, pathname)

          if (!isGroup(entry)) {
            return (
              <NavLink
                key={entry.to}
                to={entry.to}
                className={cn(
                  'rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                  active ? 'bg-[#1C1C1C] text-[#F0F0F0]' : 'text-[#A0A0A0] hover:text-[#F0F0F0]'
                )}
              >
                {entry.label}
              </NavLink>
            )
          }

          const open = openMenu === entry.label
          return (
            <div key={entry.label} className="relative">
              <button
                onClick={() => toggle(entry.label)}
                aria-expanded={open}
                className={cn(
                  'flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                  active || open ? 'bg-[#1C1C1C] text-[#F0F0F0]' : 'text-[#A0A0A0] hover:text-[#F0F0F0]'
                )}
              >
                {entry.label}
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
              </button>
              {open && (
                <div className="absolute left-0 top-full mt-1.5 w-60 rounded-xl border border-[#2A2A2A] bg-[#141414] p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
                  {entry.items.map(item => (
                    <MenuLink key={item.to} item={item} onNavigate={closeMenu} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Dreapta: streak + cont */}
      <div className="ml-auto flex flex-shrink-0 items-center gap-3 lg:ml-0">
        {/* Streak-ul. Se vede mereu, şi când e 0: un şir care apare doar după
            ce l-ai pornit nu-ţi spune niciodată că ar trebui să-l porneşti. */}
        <StreakBadge />

        <AccountMenu
          open={openMenu === ACCOUNT_PANEL}
          onToggle={() => toggle(ACCOUNT_PANEL)}
          onClose={closeMenu}
          onSignOut={handleSignOut}
        />

        {/* Meniul de pe mobil */}
        <div ref={mobileRef} className="lg:hidden">
          <button
            onClick={() => toggle(MOBILE_PANEL)}
            aria-label="Meniu"
            className="rounded-lg p-2 text-[#A0A0A0] transition-colors hover:bg-[#1C1C1C] hover:text-[#F0F0F0]"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          {mobileOpen && (
            <div className="absolute inset-x-2 top-full mt-1.5 max-h-[70dvh] overflow-y-auto rounded-xl border border-[#2A2A2A] bg-[#141414] p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
              {ALL_PAGES.map(item => (
                <MenuLink key={item.to} item={item} onNavigate={closeMenu} />
              ))}
              <div className="my-1.5 h-px bg-[#2A2A2A]" />
              <Link
                to="/pricing"
                onClick={closeMenu}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[#E2B340] hover:bg-[#1C1C1C]"
              >
                <Crown className="h-4 w-4" /> Upgrade la Pro
              </Link>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#6B6B6B] hover:bg-[#1C1C1C] hover:text-[#F0F0F0]"
              >
                <LogOut className="h-4 w-4" /> Deconectare
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Liga şi XP — doar pe ecrane mari, ca bara să rămână curată */}
      {profile && league && (
        <span className="hidden text-xs text-[#6B6B6B] xl:block">
          <span className="font-semibold" style={{ color: league.color }}>{league.label}</span>
          {' · '}{profile.xp} XP
        </span>
      )}
      </div>
    </header>
  )
}

function AccountMenu({ open, onToggle, onClose, onSignOut }: {
  open: boolean
  onToggle: () => void
  onClose: () => void
  onSignOut: () => void
}) {
  const { profile } = useAuth()
  const ref = useDismiss(open, onClose)
  const initials = profile?.username.slice(0, 2).toUpperCase() ?? '··'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-label="Contul meu"
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors',
          open ? 'bg-[#E2B340] text-black' : 'bg-[#2A2A2A] text-[#E2B340] hover:bg-[#3A3A3A]'
        )}
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-56 rounded-xl border border-[#2A2A2A] bg-[#141414] p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
          {profile && (
            <div className="px-3 pb-2 pt-1.5">
              <p className="truncate text-sm font-semibold text-[#F0F0F0]">{profile.username}</p>
              <p className="text-xs text-[#6B6B6B]">{profile.xp} XP</p>
            </div>
          )}
          <div className="mb-1.5 h-px bg-[#2A2A2A]" />
          {ACCOUNT_ITEMS.map(item => (
            <MenuLink key={item.to} item={item} onNavigate={onClose} />
          ))}
          <div className="my-1.5 h-px bg-[#2A2A2A]" />
          <Link
            to="/pricing"
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[#E2B340] hover:bg-[rgba(226,179,64,0.1)]"
          >
            <Crown className="h-4 w-4" /> Upgrade la Pro
          </Link>
          <button
            onClick={onSignOut}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#6B6B6B] transition-colors hover:bg-[#1C1C1C] hover:text-[#F0F0F0]"
          >
            <LogOut className="h-4 w-4" /> Deconectare
          </button>
        </div>
      )}
    </div>
  )
}
