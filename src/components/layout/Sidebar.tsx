import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, Puzzle, BarChart2,
  User, Crown, LogOut, X, Flame, Sword, Calendar, Users, Library, Trophy,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getLeagueConfig } from '@/lib/utils'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Bârlogul șahistului' },
  { to: '/courses', icon: BookOpen, label: 'Cursuri interactive' },
  { to: '/puzzles', icon: Puzzle, label: 'Puzzle-uri' },
  { to: '/tactics', icon: Sword, label: 'Cufărul cu tactici' },
  { to: '/calendar', icon: Calendar, label: 'Calendar competițional' },
  { to: '/community', icon: Users, label: 'Comunitate' },
  { to: '/leagues', icon: Trophy, label: 'Ligi' },
  { to: '/stats', icon: BarChart2, label: 'Statistici personale' },
  { to: '/repertoire', icon: Library, label: 'Studiază-ți partidele' },
  { to: '/profile', icon: User, label: 'Profil' },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const leagueConfig = profile ? getLeagueConfig(profile.current_league) : null

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex h-full flex-col bg-[#141414] border-r border-[#2A2A2A]">
      {/* Logo + close */}
      <div className="flex items-center justify-between px-5 py-5">
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E2B340]">
            <span className="text-black font-black text-sm">♟</span>
          </div>
          <span className="font-bold text-[#F0F0F0] text-lg tracking-tight">ChessUp</span>
        </NavLink>
        {onClose && (
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#6B6B6B] hover:text-[#F0F0F0] lg:hidden">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* User info */}
      {profile && (
        <div className="mx-3 mb-3 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2A2A2A] text-sm font-bold text-[#E2B340]">
              {profile.username.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#F0F0F0]">{profile.username}</p>
              {leagueConfig && (
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-xs font-medium" style={{ color: leagueConfig.color }}>
                    {leagueConfig.label}
                  </span>
                  <span className="text-xs text-[#6B6B6B]">· {profile.xp} XP</span>
                </div>
              )}
            </div>
          </div>
          {profile.streak_days > 0 && (
            <div className="mt-2 flex items-center gap-1 text-xs text-[#fbbf24]">
              <Flame className="h-3 w-3" />
              <span>{profile.streak_days} zile streak</span>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) => cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-[rgba(226,179,64,0.12)] text-[#E2B340]'
                : 'text-[#A0A0A0] hover:bg-[#1C1C1C] hover:text-[#F0F0F0]'
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="space-y-1 px-3 pb-4">
        <NavLink
          to="/pricing"
          onClick={onClose}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium bg-[rgba(226,179,64,0.08)] text-[#E2B340] border border-[rgba(226,179,64,0.2)] hover:bg-[rgba(226,179,64,0.15)] transition-colors"
        >
          <Crown className="h-4 w-4" />
          Upgrade la Pro
        </NavLink>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#6B6B6B] hover:bg-[#1C1C1C] hover:text-[#F0F0F0] transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Deconectare
        </button>
      </div>
    </div>
  )
}
