import { ArrowUp, Flame, Shield } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getLeagueConfig, getNextLeague, formatXp } from '@/lib/utils'
import { Progress } from '@/components/ui/Progress'
import { useWeeklyXp } from '@/hooks/useWeeklyXp'
import { useLeagueStanding } from '@/hooks/useLeagueStanding'
import { levelFromXp } from '@/lib/levels'
import { shieldsEarnedBy, honoraryEarnedBy } from '@/lib/unlocks'
import type { LeagueConfig } from '@/types'

/**
 * Liga ta, pe Bârlog.
 *
 * De la migrarea 038 liga se decide numai pe clasament: în fiecare ligă, primii
 * o treime urcă, ultimii o treime coboară, restul rămân. Nu mai există niciun
 * prag de XP — de aceea widget-ul nu mai arată bare către un „minim", ci locul
 * şi zona în care te afli.
 */
export function LeagueWidget() {
  const { profile } = useAuth()
  const { weeklyXp, loading: weeklyLoading } = useWeeklyXp()
  const { data: standing } = useLeagueStanding()
  if (!profile) return null

  const leagueConfig: LeagueConfig = getLeagueConfig(profile.current_league)
  const nextLeague = getNextLeague(profile.current_league)

  // Cât de sus eşti în ligă: 100% pe primul loc, 0% pe ultimul.
  const zonePct = standing && standing.members > 1
    ? Math.round(((standing.members - standing.rank) / (standing.members - 1)) * 100)
    : 100

  // Scuturile şi promovările rămase: câte a câştigat prin nivel, minus consumul.
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

      {/* Locul în ligă — singurul lucru care decide unde ajungi duminică */}
      <div className="mb-3">
        <div className="mb-1.5 flex items-baseline justify-between text-xs">
          <span className="text-[#6B6B6B]">Locul în ligă</span>
          <span
            className={`font-semibold ${
              standing?.in_promotion_zone ? 'text-[#4ade80]'
                : standing?.in_relegation_zone ? 'text-[#FB7185]'
                  : 'text-[#A0A0A0]'
            }`}
          >
            {standing ? `${standing.rank} din ${standing.members}` : '—'}
          </span>
        </div>

        <Progress
          value={zonePct}
          barClassName={
            standing?.in_promotion_zone ? 'bg-[#4ade80]'
              : standing?.in_relegation_zone ? 'bg-[#FB7185]'
                : 'bg-[#E2B340]'
          }
        />

        <p className="mt-1.5 text-xs text-[#6B6B6B]">
          {!standing ? ' '
            : standing.in_promotion_zone && nextLeague ? (
              <span className="text-[#4ade80]">
                Urci în{' '}
                <span className="font-semibold" style={{ color: getLeagueConfig(nextLeague).color }}>
                  {getLeagueConfig(nextLeague).label}
                </span>
                {' '}dacă rămâi aici până duminică.
              </span>
            ) : standing.in_relegation_zone ? (
              shields > 0 ? (
                <span className="text-[#FB7185]">
                  Ești în zona de retrogradare, dar un scut te salvează.
                </span>
              ) : (
                <span className="text-[#FB7185]">
                  Ești în zona de retrogradare. Treci peste locul {standing.members - standing.relegate_slots}.
                </span>
              )
            ) : standing.promote_slots > 0 ? (
              <>Urcă primii {standing.promote_slots} — mai ai {standing.rank - standing.promote_slots} locuri.</>
            ) : !nextLeague ? (
              <span className="text-[#E2B340]">Ești în liga supremă ✦</span>
            ) : (
              <>Prea puțini jucători în ligă ca să se miște cineva.</>
            )}
        </p>
      </div>

      {/* XP-ul săptămânii, ca simplă cifră. Avea o bară către un „minim de N XP",
          prag care nu mai există: o bară fără destinaţie n-ar arăta nimic. */}
      <div className="flex items-baseline justify-between rounded-lg border border-[#2A2A2A] bg-[#141414] p-3">
        <span className="text-xs text-[#6B6B6B]">XP săptămâna aceasta</span>
        <span className="font-display text-lg font-bold text-[#4ade80]">
          {weeklyLoading ? '…' : weeklyXp}
        </span>
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
