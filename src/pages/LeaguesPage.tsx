import { LEAGUES } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { getLeagueConfig, getLeagueProgress, getXpToNextLeague } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Trophy, Shield, Star, Zap } from 'lucide-react'

const LEAGUE_ICONS = ['🪵', '⚙️', '🥉', '🥈', '🥇', '✦', '◈']
const ELITE_LEAGUES = ['smarald', 'diamant']

export function LeaguesPage() {
  const { profile } = useAuth()

  const currentLeagueConfig = profile ? getLeagueConfig(profile.current_league) : null
  const progress = profile ? getLeagueProgress(profile.xp, profile.current_league) : 0
  const xpToNext = profile ? getXpToNextLeague(profile.xp, profile.current_league) : null

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-2">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#f0f0f0]">Sistemul de ligi</h1>
        <p className="text-[#666] mt-1 text-sm">
          Acumulează XP rezolvând puzzle-uri și parcurgând cursuri pentru a avansa în ligi.
        </p>
      </div>

      {/* Current league card */}
      {profile && currentLeagueConfig && (
        <div
          className="rounded-2xl border p-5"
          style={{
            borderColor: currentLeagueConfig.color + '40',
            backgroundColor: currentLeagueConfig.color + '0d',
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
              style={{ backgroundColor: currentLeagueConfig.color + '20' }}
            >
              {LEAGUE_ICONS[LEAGUES.findIndex(l => l.name === profile.current_league)]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#888]">Liga ta curentă</span>
              </div>
              <h2 className="text-xl font-bold mt-0.5" style={{ color: currentLeagueConfig.color }}>
                {currentLeagueConfig.label}
              </h2>
              <p className="text-sm text-[#888] mt-0.5">{profile.xp} XP total</p>
            </div>
            <div className="text-right">
              {xpToNext !== null ? (
                <>
                  <p className="text-xs text-[#666]">până la liga următoare</p>
                  <p className="text-lg font-bold text-[#f0f0f0] mt-0.5">{xpToNext} XP</p>
                </>
              ) : (
                <p className="text-sm font-semibold" style={{ color: currentLeagueConfig.color }}>
                  Ligă maximă
                </p>
              )}
            </div>
          </div>

          {xpToNext !== null && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-[#666] mb-1.5">
                <span>{currentLeagueConfig.minXp} XP</span>
                <span>{currentLeagueConfig.maxXp} XP</span>
              </div>
              <div className="h-2 rounded-full bg-[#1e1e1e] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, backgroundColor: currentLeagueConfig.color }}
                />
              </div>
              <p className="text-xs text-[#666] mt-1.5 text-right">{Math.round(progress)}% completat</p>
            </div>
          )}
        </div>
      )}

      {/* XP sources */}
      <div className="rounded-xl border border-[#1e1e1e] bg-[#111] p-5">
        <h3 className="text-sm font-semibold text-[#f0f0f0] mb-4 flex items-center gap-2">
          <Zap className="h-4 w-4 text-[#c8a84b]" />
          Cum câștig XP?
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: 'Puzzle ușor rezolvat', xp: '+10 XP' },
            { label: 'Puzzle mediu rezolvat', xp: '+20 XP' },
            { label: 'Puzzle greu rezolvat', xp: '+30 XP' },
            { label: 'Lecție finalizată', xp: '+50 XP' },
            { label: 'Curs complet finalizat', xp: '+200 XP' },
            { label: 'Streak zilnic activ', xp: '+25 XP/zi' },
            { label: 'Evaluare completată', xp: '+100 XP' },
          ].map(({ label, xp }) => (
            <div key={label} className="flex items-center justify-between gap-2 rounded-lg bg-[#1a1a1a] px-3 py-2">
              <span className="text-[#a0a0a0]">{label}</span>
              <span className="font-semibold text-[#c8a84b] whitespace-nowrap">{xp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* All leagues */}
      <div>
        <h3 className="text-sm font-semibold text-[#888] uppercase tracking-wider mb-4">Toate ligile</h3>
        <div className="space-y-2">
          {LEAGUES.map((league, idx) => {
            const isCurrent = profile?.current_league === league.name
            const isPassed = profile
              ? LEAGUES.findIndex(l => l.name === profile.current_league) > idx
              : false
            const isElite = ELITE_LEAGUES.includes(league.name)

            return (
              <div
                key={league.name}
                className="flex items-center gap-4 rounded-xl border p-4 transition-all relative overflow-hidden"
                style={{
                  borderColor: isCurrent
                    ? league.color + '60'
                    : isElite
                    ? league.color + '35'
                    : league.color + '22',
                  backgroundColor: isCurrent
                    ? league.color + '12'
                    : isElite
                    ? league.color + '08'
                    : league.color + '05',
                  boxShadow: isCurrent
                    ? `0 0 24px ${league.color}22`
                    : isElite
                    ? `0 0 16px ${league.color}18`
                    : undefined,
                }}
              >
                {/* Shimmer line for elite */}
                {isElite && (
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${league.color}80, transparent)` }}
                  />
                )}

                {/* Icon */}
                <div
                  className={cn(
                    'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl font-bold',
                    isElite ? 'text-2xl' : 'text-xl'
                  )}
                  style={{
                    backgroundColor: league.color + '20',
                    boxShadow: isElite ? `0 0 12px ${league.color}40` : undefined,
                    color: league.color,
                  }}
                >
                  {LEAGUE_ICONS[idx]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn('font-semibold text-sm', isElite && 'text-base')}
                      style={{ color: isCurrent || isPassed || isElite ? league.color : '#a0a0a0' }}
                    >
                      {league.label}
                    </span>
                    {isCurrent && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: league.color + '20', color: league.color }}
                      >
                        Tu ești aici
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#555] mt-0.5">
                    {league.maxXp !== null
                      ? `${league.minXp} – ${league.maxXp} XP total`
                      : `${league.minXp}+ XP total`}
                    {' · '}minim {league.weeklyMinXp} XP/săptămână
                  </p>
                </div>

                {/* Status icon */}
                <div className="flex-shrink-0">
                  {isPassed && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a1a1a]">
                      <Shield className="h-3.5 w-3.5" style={{ color: league.color }} />
                    </div>
                  )}
                  {isCurrent && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: league.color + '20' }}>
                      <Star className="h-3.5 w-3.5" style={{ color: league.color }} />
                    </div>
                  )}
                  {!isCurrent && !isPassed && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a1a1a]">
                      <Trophy className="h-3.5 w-3.5 text-[#333]" />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Relegation rules */}
      <div className="rounded-xl border border-[#1e1e1e] bg-[#111] p-5 text-sm text-[#666]">
        <h3 className="text-[#888] font-semibold mb-3">Reguli retrogradare</h3>
        <ul className="space-y-1.5 list-disc list-inside">
          <li>Dacă acumulezi mai puțin XP decât minimul săptămânal, ești retrogradat o ligă.</li>
          <li>Verificarea se face în fiecare duminică la 23:59.</li>
          <li>XP-ul total nu se pierde — poți repromova rapid.</li>
          <li>Liga <span className="text-[#8B6914]">Cherestea</span> nu are retrogradare.</li>
        </ul>
      </div>
    </div>
  )
}
