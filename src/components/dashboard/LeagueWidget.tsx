import { Flame } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getLeagueConfig, getLeagueProgress, getXpToNextLeague, getNextLeague, formatXp } from '@/lib/utils'
import { Progress } from '@/components/ui/Progress'
import { useWeeklyXp } from '@/hooks/useWeeklyXp'
import type { LeagueConfig } from '@/types'

export function LeagueWidget() {
  const { profile } = useAuth()
  const { weeklyXp, loading: weeklyLoading } = useWeeklyXp()
  if (!profile) return null

  const leagueConfig: LeagueConfig = getLeagueConfig(profile.current_league)
  const progress = getLeagueProgress(profile.xp, profile.current_league)
  const xpToNext = getXpToNextLeague(profile.xp, profile.current_league)
  const nextLeague = getNextLeague(profile.current_league)
  const weeklyMin = leagueConfig.weeklyMinXp
  const weeklyPct = weeklyLoading ? 0 : Math.min(100, Math.round((weeklyXp / weeklyMin) * 100))
  const weeklyShort = !weeklyLoading && weeklyXp < weeklyMin

  return (
    <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-2xl"
            style={{ backgroundColor: `${leagueConfig.color}20`, border: `2px solid ${leagueConfig.color}` }}
          >
            ♟
          </div>
          <div>
            <p className="text-xs text-[#6B6B6B] uppercase tracking-wider">Liga ta</p>
            <p className="text-xl font-bold" style={{ color: leagueConfig.color }}>
              {leagueConfig.label}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[#F0F0F0]">{formatXp(profile.xp)}</p>
          <p className="text-xs text-[#6B6B6B]">XP total</p>
        </div>
      </div>

      {/* Progres spre liga următoare */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-[#6B6B6B] mb-1.5">
          <span>{leagueConfig.label}</span>
          {nextLeague ? (
            <span>{getLeagueConfig(nextLeague).label} în {xpToNext} XP</span>
          ) : (
            <span className="text-[#E2B340]">Ligă maximă ✦</span>
          )}
        </div>
        <Progress value={progress} barClassName="bg-[#E2B340]" />
      </div>

      {/* XP săptămânal */}
      <div className={`rounded-lg p-3 ${weeklyShort ? 'bg-[rgba(251,113,133,0.08)] border border-[rgba(251,113,133,0.2)]' : 'bg-[#141414] border border-[#2A2A2A]'}`}>
        <div className="flex justify-between text-xs mb-1.5">
          <span className={weeklyShort ? 'text-[#FB7185]' : 'text-[#6B6B6B]'}>
            {weeklyShort ? '⚠ XP săptămânal insuficient' : 'XP săptămâna aceasta'}
          </span>
          <span className={weeklyShort ? 'text-[#FB7185]' : 'text-[#A0A0A0]'}>
            {weeklyLoading ? '...' : `${weeklyXp} / ${weeklyMin}`}
          </span>
        </div>
        <Progress
          value={weeklyPct}
          barClassName={weeklyShort ? 'bg-[#FB7185]' : 'bg-[#4ade80]'}
        />
        {weeklyShort && (
          <p className="text-xs text-[#FB7185] mt-1.5">
            Fă cel puțin {weeklyMin - weeklyXp} XP până duminică pentru a nu retrograda.
          </p>
        )}
      </div>

      {/* Streak */}
      {profile.streak_days > 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-sm text-[#fbbf24]">
          <Flame className="h-4 w-4" />
          <span className="font-semibold">{profile.streak_days} zile</span>
          <span className="text-[#6B6B6B]">streak activ</span>
        </div>
      )}
    </div>
  )
}
