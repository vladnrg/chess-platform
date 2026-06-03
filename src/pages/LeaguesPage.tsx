import { LEAGUES } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { getLeagueConfig, getLeagueProgress, getXpToNextLeague } from '@/lib/utils'
import { CheckCircle2, Lock, Star, Zap, ChevronRight } from 'lucide-react'

const LEAGUE_ICONS = ['🪵', '⚙️', '🥉', '🥈', '🥇', '✦', '◈']
const LEAGUE_DESCRIPTIONS = [
  'Primii tăi pași în lumea șahului.',
  'Înveți să gândești mai profund.',
  'Tactica începe să devină o armă.',
  'Strategia și finalurile capătă sens.',
  'Jucător complet, amenință în orice fază.',
  'Elita platformei. Rival de temut.',
  'Vârf absolut. Puțini ajung aici.',
]

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
        <div className="space-y-3">
          {LEAGUES.map((league, idx) => {
            const isCurrent = profile?.current_league === league.name
            const isPassed = profile
              ? LEAGUES.findIndex(l => l.name === profile.current_league) > idx
              : false
            const isFuture = !isCurrent && !isPassed

            return (
              <div
                key={league.name}
                className="relative flex items-center gap-4 rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  opacity: isFuture ? 0.55 : 1,
                  background: isCurrent
                    ? `linear-gradient(135deg, ${league.color}18 0%, ${league.color}08 100%)`
                    : isPassed
                    ? `linear-gradient(135deg, ${league.color}10 0%, transparent 100%)`
                    : '#111',
                  border: `1px solid ${isCurrent ? league.color + '50' : isPassed ? league.color + '30' : league.color + '20'}`,
                  boxShadow: isCurrent ? `0 0 32px ${league.color}20, inset 0 0 60px ${league.color}08` : undefined,
                }}
              >
                {/* Colored left stripe */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                  style={{
                    background: isFuture
                      ? `linear-gradient(to bottom, ${league.color}40, ${league.color}20)`
                      : `linear-gradient(to bottom, ${league.color}, ${league.color}80)`,
                  }}
                />

                {/* Top shimmer line for current */}
                {isCurrent && (
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${league.color}90, transparent)` }}
                  />
                )}

                {/* Icon */}
                <div className="ml-5 flex-shrink-0 my-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                    style={{
                      background: isFuture
                        ? `radial-gradient(circle, ${league.color}15, transparent)`
                        : `radial-gradient(circle, ${league.color}30, ${league.color}10)`,
                      boxShadow: isCurrent ? `0 0 20px ${league.color}50` : undefined,
                    }}
                  >
                    {LEAGUE_ICONS[idx]}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 py-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="font-black text-base tracking-wide"
                      style={{
                        color: isFuture ? league.color + '70' : league.color,
                        textShadow: isCurrent ? `0 0 20px ${league.color}60` : undefined,
                      }}
                    >
                      {league.label}
                    </span>
                    {isCurrent && (
                      <span
                        className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                        style={{ backgroundColor: league.color + '25', color: league.color, border: `1px solid ${league.color}40` }}
                      >
                        <Star className="h-2.5 w-2.5" /> Tu ești aici
                      </span>
                    )}
                    {isPassed && (
                      <span className="text-[10px] font-bold text-[#4ade80] flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Atins
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: isFuture ? '#444' : '#666' }}>
                    {LEAGUE_DESCRIPTIONS[idx]}
                  </p>
                  <p className="text-xs mt-1.5 font-mono" style={{ color: isFuture ? '#333' : '#555' }}>
                    {league.maxXp !== null ? `${league.minXp} – ${league.maxXp} XP` : `${league.minXp}+ XP`}
                    <span className="mx-1.5 opacity-40">·</span>
                    {league.weeklyMinXp} XP/săpt.
                  </p>
                </div>

                {/* Right arrow / lock */}
                <div className="mr-4 flex-shrink-0">
                  {isFuture ? (
                    <Lock className="h-4 w-4" style={{ color: league.color + '40' }} />
                  ) : (
                    <ChevronRight className="h-4 w-4" style={{ color: league.color + '60' }} />
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
