import { ArrowUp, Flame, Shield } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getLeagueConfig, getLeagueProgress, getNextLeague, formatXp } from '@/lib/utils'
import { Progress } from '@/components/ui/Progress'
import { useWeeklyXp } from '@/hooks/useWeeklyXp'
import { useLeagueStanding } from '@/hooks/useLeagueStanding'
import { levelFromXp } from '@/lib/levels'
import { shieldsEarnedBy, honoraryEarnedBy } from '@/lib/unlocks'
import type { LeagueConfig } from '@/types'

export function LeagueWidget() {
  const { profile } = useAuth()
  const { weeklyXp, loading: weeklyLoading } = useWeeklyXp()
  const { data: standing } = useLeagueStanding()
  if (!profile) return null

  const leagueConfig: LeagueConfig = getLeagueConfig(profile.current_league)
  const progress = getLeagueProgress(profile.xp, profile.current_league)
  const nextLeague = getNextLeague(profile.current_league)
  const weeklyMin = leagueConfig.weeklyMinXp
  const weeklyPct = weeklyLoading ? 0 : Math.min(100, Math.round((weeklyXp / weeklyMin) * 100))
  const weeklyShort = !weeklyLoading && weeklyXp < weeklyMin
  // Scuturile rămase: câte a câştigat prin nivel, minus câte a consumat deja.
  const shields = Math.max(0, shieldsEarnedBy(levelFromXp(profile.xp)) - (profile.shields_used ?? 0))
  const honorary = Math.max(0, honoraryEarnedBy(levelFromXp(profile.xp)) - (profile.honorary_used ?? 0))

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

      {/* Poziţia în competiţia săptămânală.
          Aici scria „încă N XP până la liga următoare", ceea ce era adevărat cât
          promovarea se făcea pe prag de XP total. De la migrarea 029 liga se
          câştigă prin clasament, deci ce contează e pe ce loc eşti. */}
      <div className="mb-3">
        {nextLeague ? (
          <>
            <div className="mb-1.5 flex items-baseline justify-between text-xs">
              <span className="text-[#6B6B6B]">Locul în ligă</span>
              <span className={`font-semibold ${standing?.in_promotion_zone ? 'text-[#4ade80]' : 'text-[#A0A0A0]'}`}>
                {standing ? `${standing.rank} din ${Math.max(standing.eligible, standing.rank)}` : '—'}
              </span>
            </div>
            <Progress
              value={standing?.in_promotion_zone ? 100 : progress}
              barClassName={standing?.in_promotion_zone ? 'bg-[#4ade80]' : 'bg-[#E2B340]'}
            />
            <p className="mt-1.5 text-xs text-[#6B6B6B]">
              {standing?.in_promotion_zone ? (
                <>
                  Ești în zona de promovare spre{' '}
                  <span className="font-semibold" style={{ color: getLeagueConfig(nextLeague).color }}>
                    {getLeagueConfig(nextLeague).label}
                  </span>
                </>
              ) : standing && standing.promote_slots > 0 ? (
                <>Urcă primii {standing.promote_slots} la finalul săptămânii.</>
              ) : (
                <>Strânge cel puțin {weeklyMin} XP ca să intri în competiție.</>
              )}
            </p>
          </>
        ) : (
          <>
            <Progress value={100} barClassName="bg-[#E2B340]" />
            <p className="mt-1.5 text-xs text-[#E2B340]">Ești în liga supremă ✦</p>
          </>
        )}
      </div>

      {/* XP săptămânal. Nu e un plafon — e pragul minim sub care retrogradezi.
          Vechiul „470 / 100" arăta exact ca o bară către un maxim, deşi XP-ul
          săptămânal e nelimitat. Acum cifra stă singură, iar pragul e explicat. */}
      <div className={`rounded-lg p-3 ${weeklyShort ? 'bg-[rgba(251,113,133,0.08)] border border-[rgba(251,113,133,0.2)]' : 'bg-[#141414] border border-[#2A2A2A]'}`}>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-[#6B6B6B]">XP săptămâna aceasta</span>
          <span className={`font-semibold ${weeklyShort ? 'text-[#FB7185]' : 'text-[#4ade80]'}`}>
            {weeklyLoading ? '...' : weeklyXp}
          </span>
        </div>
        <Progress
          value={weeklyPct}
          barClassName={weeklyShort ? 'bg-[#FB7185]' : 'bg-[#4ade80]'}
        />
        <p className={`text-xs mt-1.5 ${weeklyShort ? 'text-[#FB7185]' : 'text-[#6B6B6B]'}`}>
          {weeklyLoading
            ? ' '
            : weeklyShort
              ? shields > 0
                ? `Îți mai trebuie ${weeklyMin - weeklyXp} XP. Dacă nu ajungi, un scut te salvează.`
                : `Îți mai trebuie ${weeklyMin - weeklyXp} XP până duminică, ca să nu retrogradezi.`
              : `Minimul de ${weeklyMin} XP e atins — nu retrogradezi ✓`}
        </p>
      </div>

      {/* Scuturi de retrogradare */}
      {shields > 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-sm text-[#2DD4BF]">
          <Shield className="h-4 w-4" />
          <span className="font-semibold">{shields}</span>
          <span className="text-[#6B6B6B]">
            {shields === 1 ? 'scut de retrogradare' : 'scuturi de retrogradare'}
          </span>
        </div>
      )}

      {/* Promovări onorifice */}
      {honorary > 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-sm text-[#8B5CF6]">
          <ArrowUp className="h-4 w-4" />
          <span className="font-semibold">{honorary}</span>
          <span className="text-[#6B6B6B]">
            {honorary === 1 ? 'promovare onorifică' : 'promovări onorifice'}
          </span>
        </div>
      )}

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
