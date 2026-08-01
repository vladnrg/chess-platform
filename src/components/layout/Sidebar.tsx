import { NavLink, useNavigate } from 'react-router-dom'
import { Crown, LogOut, X, Flame } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getLeagueConfig } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/lib/navigation'

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
      {/* Logo + close — aceeași înălțime ca bara de sus, ca cele două să se alinieze */}
      <div
        className="flex flex-shrink-0 items-center justify-between border-b border-[#2A2A2A] px-5"
        style={{ height: 'var(--app-header)' }}
      >
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E2B340]">
            <span className="text-black font-black text-sm">♟</span>
          </div>
          <span className="font-bold text-[#F0F0F0] text-lg tracking-tight">CleanChess</span>
        </NavLink>
        {onClose && (
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#6B6B6B] hover:text-[#F0F0F0] lg:hidden">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* User info */}
      {profile && (
        <div className="mx-3 mt-3 mb-3 flex-shrink-0 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A] p-3">
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
      <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-3">
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
      <div className="flex-shrink-0 space-y-1 px-3 pb-4 pt-2">
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
