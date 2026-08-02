import { Flame, Swords } from 'lucide-react'
import { getLeagueConfig, canChallenge } from '@/lib/utils'
import { levelFromXp } from '@/lib/levels'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useSendChallenge } from '@/hooks/useChallenges'
import { PLAYING_STYLE_LABELS } from '@/types'
import type { PublicProfile } from '@/hooks/useCommunity'

interface PlayerCardProps {
  profile: PublicProfile
}

export function PlayerCard({ profile }: PlayerCardProps) {
  const { profile: me } = useAuth()
  const send = useSendChallenge()
  const leagueConfig = getLeagueConfig(profile.current_league)

  const isMe = me?.id === profile.id
  const eligible = !!me && !isMe && canChallenge(me.current_league, profile.current_league)

  return (
    // Cardul nu mai e un link: ducea la /profile/<id>, o rută care nu există şi
    // care arunca utilizatorul înapoi pe pagina publică.
    <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] p-4 transition-colors hover:border-[#3A3A3A]">
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
          <p className="truncate text-sm font-semibold text-[#F0F0F0]">
            {profile.username}
            {isMe && <span className="ml-1.5 text-xs font-normal text-[#6B6B6B]">(tu)</span>}
          </p>
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
        <div className="rounded-lg bg-[#1C1C1C] px-2.5 py-2">
          <p className="text-[#6B6B6B] mb-0.5">XP total</p>
          <p className="font-semibold text-[#F0F0F0]">{profile.xp.toLocaleString('ro-RO')}</p>
        </div>
        <div className="rounded-lg bg-[#1C1C1C] px-2.5 py-2">
          <p className="text-[#6B6B6B] mb-0.5">Nivel</p>
          <p className="font-semibold text-[#F0F0F0]">{levelFromXp(profile.xp)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
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

        {!isMe && (
          eligible ? (
            <Button
              variant="secondary"
              size="sm"
              disabled={send.isPending}
              onClick={() => send.mutate({ toUser: profile.id, rated: true, minutes: 5, increment: 0 })}
            >
              <Swords className="h-3.5 w-3.5" /> Provoacă
            </Button>
          ) : (
            <span
              className="flex-shrink-0 text-xs text-[#6B6B6B]"
              title="Poți juca doar cu jucători din liga ta, una mai jos sau una mai sus"
            >
              ligă prea depărtată
            </span>
          )
        )}
      </div>
    </div>
  )
}
