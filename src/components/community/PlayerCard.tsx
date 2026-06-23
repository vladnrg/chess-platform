import { Link } from 'react-router-dom'
import { Flame } from 'lucide-react'
import { getLeagueConfig } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { PLAYING_STYLE_LABELS } from '@/types'
import type { PublicProfile } from '@/hooks/useCommunity'

interface PlayerCardProps {
  profile: PublicProfile
}

export function PlayerCard({ profile }: PlayerCardProps) {
  const leagueConfig = getLeagueConfig(profile.current_league)

  return (
    <Link
      to={`/profile/${profile.id}`}
      className="block rounded-xl bg-[#141414] border border-[#2A2A2A] p-4 hover:border-[#3A3A3A] hover:bg-[#1C1C1C] transition-colors"
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
          style={{
            backgroundColor: `${leagueConfig.color}20`,
            border: `2px solid ${leagueConfig.color}`,
            color: leagueConfig.color,
          }}
        >
          {profile.username.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#F0F0F0]">{profile.username}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs font-medium" style={{ color: leagueConfig.color }}>
              {leagueConfig.label}
            </span>
            {profile.city && (
              <span className="text-xs text-[#6B6B6B]">· {profile.city}</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="rounded-lg bg-[#141414] px-2.5 py-2">
          <p className="text-[#6B6B6B] mb-0.5">XP Total</p>
          <p className="font-semibold text-[#F0F0F0]">{profile.xp.toLocaleString('ro-RO')}</p>
        </div>
        <div className="rounded-lg bg-[#141414] px-2.5 py-2">
          <p className="text-[#6B6B6B] mb-0.5">Elo estimat</p>
          <p className="font-semibold text-[#F0F0F0]">~{profile.estimated_elo}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {profile.playing_style && (
          <Badge variant="accent" className="text-xs">
            {PLAYING_STYLE_LABELS[profile.playing_style]}
          </Badge>
        )}
        {profile.streak_days > 0 && (
          <div className="flex items-center gap-1 text-xs text-[#fbbf24]">
            <Flame className="h-3 w-3" />
            <span>{profile.streak_days}z</span>
          </div>
        )}
      </div>
    </Link>
  )
}
