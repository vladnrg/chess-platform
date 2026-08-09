import { LEAGUES } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { getLeagueConfig } from '@/lib/utils'
import { useLeagueStanding } from '@/hooks/useLeagueStanding'
import { LeagueBadge } from '@/components/leagues/LeagueBadge'
import { CheckCircle2, Lock, Star, Zap, ChevronRight, TrendingUp } from 'lucide-react'

const LEAGUE_DESCRIPTIONS = [
  'Primii tăi pași în lumea șahului.',
  'Înveți să gândești mai profund.',
  'Tactica începe să devină o armă.',
  'Strategia și finalurile capătă sens.',
  'Jucător complet, amenință în orice fază.',
  'Elita platformei. Rival de temut.',
  'Vârf absolut. Puțini ajung aici.',
]

const SURSE_XP = [
  { label: 'Puzzle ușor rezolvat', xp: '+10 XP' },
  { label: 'Puzzle mediu rezolvat', xp: '+20 XP' },
  { label: 'Puzzle greu rezolvat', xp: '+30 XP' },
  { label: 'Lecție finalizată', xp: '+50 XP' },
  { label: 'Curs complet finalizat', xp: '+200 XP' },
  { label: 'Streak zilnic activ', xp: '+25 XP/zi' },
  { label: 'Evaluare completată', xp: '+100 XP' },
]

/**
 * Ligile, pe două coloane.
 *
 * Stânga poartă ce te priveşte pe tine — liga ta acum şi drumul întreg. Dreapta
 * ţine regulile, care se citesc o dată şi rămân la vedere cât derulezi lista.
 */
export function LeaguesPage() {
  const { profile } = useAuth()

  const currentLeagueConfig = profile ? getLeagueConfig(profile.current_league) : null
  const { data: standing } = useLeagueStanding()

  return (
    <div className="mx-auto max-w-6xl py-2">
      {/* `items-start` nu e decorativ: fără el, coloana din dreapta s-ar întinde
          pe toată înălţimea grilei şi `sticky` n-ar mai avea de ce să se prindă. */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {/* ── Stânga: liga ta, apoi toate ligile ─────────────────────────── */}
        <div className="space-y-6">
          {profile && currentLeagueConfig && (
            <div
              className="rounded-2xl border p-5"
              style={{
                borderColor: currentLeagueConfig.color + '40',
                backgroundColor: currentLeagueConfig.color + '0d',
              }}
            >
              <div className="flex items-center gap-4">
                <LeagueBadge league={currentLeagueConfig} className="h-16 w-16" />
                <div className="min-w-0 flex-1">
                  <span className="text-sm text-[#A0A0A0]">Liga ta curentă</span>
                  <h2 className="mt-0.5 text-xl font-bold" style={{ color: currentLeagueConfig.color }}>
                    {currentLeagueConfig.label}
                  </h2>
                  <p className="mt-0.5 text-sm text-[#A0A0A0]">{profile.xp} XP total</p>
                </div>
                <div className="text-right">
                  {standing ? (
                    <>
                      <p className="text-xs text-[#6B6B6B]">locul săptămâna asta</p>
                      <p className="mt-0.5 text-lg font-bold text-[#F0F0F0]">
                        {standing.rank}
                        <span className="ml-1 text-xs font-normal text-[#6B6B6B]">
                          din {standing.members}
                        </span>
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-semibold" style={{ color: currentLeagueConfig.color }}>
                      —
                    </p>
                  )}
                </div>
              </div>

              {/* Liga se câştigă prin clasament, nu prin praguri de XP total —
                  deci n-are ce căuta aici o bară „cât mai am până la următoarea". */}
              {standing && (
                <p className="mt-4 text-sm text-[#A0A0A0]">
                  {standing.in_promotion_zone ? (
                    <span className="text-[#4ade80]">Ești în zona de promovare. Ține-o tot așa până duminică.</span>
                  ) : standing.in_relegation_zone ? (
                    <span className="text-[#FB7185]">
                      Ești în zona de retrogradare. Treci peste locul{' '}
                      <span className="font-semibold">{standing.members - standing.relegate_slots}</span> ca să scapi.
                    </span>
                  ) : standing.promote_slots > 0 ? (
                    <>Promovează primii <span className="font-semibold text-[#E2B340]">{standing.promote_slots}</span> din ligă. Mai ai timp până duminică.</>
                  ) : (
                    <>Prea puțini jucători în ligă ca să se miște cineva săptămâna asta.</>
                  )}
                </p>
              )}
            </div>
          )}

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#A0A0A0]">
              Toate ligile
            </h3>
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
                    className="relative flex items-center gap-5 overflow-hidden rounded-2xl transition-all duration-300"
                    style={{
                      opacity: isFuture ? 0.55 : 1,
                      background: isCurrent
                        ? `linear-gradient(135deg, ${league.color}18 0%, ${league.color}08 100%)`
                        : isPassed
                        ? `linear-gradient(135deg, ${league.color}10 0%, transparent 100%)`
                        : '#141414',
                      border: `1px solid ${isCurrent ? league.color + '50' : isPassed ? league.color + '30' : league.color + '20'}`,
                      boxShadow: isCurrent ? `0 0 32px ${league.color}20, inset 0 0 60px ${league.color}08` : undefined,
                    }}
                  >
                    <div
                      className="absolute bottom-0 left-0 top-0 w-1 rounded-l-2xl"
                      style={{
                        background: isFuture
                          ? `linear-gradient(to bottom, ${league.color}40, ${league.color}20)`
                          : `linear-gradient(to bottom, ${league.color}, ${league.color}80)`,
                      }}
                    />

                    {isCurrent && (
                      <div
                        className="absolute left-0 right-0 top-0 h-px"
                        style={{ background: `linear-gradient(90deg, transparent, ${league.color}90, transparent)` }}
                      />
                    )}

                    <LeagueBadge
                      league={league}
                      glow={isCurrent}
                      className="my-4 ml-5 h-24 w-24"
                    />

                    <div className="min-w-0 flex-1 py-4">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span
                          className="text-2xl font-black tracking-wide"
                          style={{
                            color: isFuture ? league.color + '70' : league.color,
                            textShadow: isCurrent ? `0 0 20px ${league.color}60` : undefined,
                          }}
                        >
                          {league.label}
                        </span>
                        {isCurrent && (
                          <span
                            className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider"
                            style={{ backgroundColor: league.color + '25', color: league.color, border: `1px solid ${league.color}40` }}
                          >
                            <Star className="h-3.5 w-3.5" /> Tu ești aici
                          </span>
                        )}
                        {isPassed && (
                          <span className="flex items-center gap-1 text-xs font-bold text-[#4ade80]">
                            <CheckCircle2 className="h-4 w-4" /> Atins
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-base" style={{ color: isFuture ? '#3A3A3A' : '#6B6B6B' }}>
                        {LEAGUE_DESCRIPTIONS[idx]}
                      </p>
                    </div>

                    <div className="mr-5 flex-shrink-0">
                      {isFuture ? (
                        <Lock className="h-6 w-6" style={{ color: league.color + '40' }} />
                      ) : (
                        <ChevronRight className="h-6 w-6" style={{ color: league.color + '60' }} />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Dreapta: regulile, la vedere cât derulezi lista ─────────────── */}
        <div className="space-y-4 lg:sticky lg:top-0">
          <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#F0F0F0]">
              <Zap className="h-4 w-4 text-[#E2B340]" />
              Cum câștig XP?
            </h3>
            <div className="space-y-2 text-sm">
              {SURSE_XP.map(({ label, xp }) => (
                <div key={label} className="flex items-center justify-between gap-2">
                  <span className="text-[#A0A0A0]">{label}</span>
                  <span className="whitespace-nowrap font-semibold text-[#E2B340]">{xp}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-5 text-sm text-[#6B6B6B]">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#F0F0F0]">
              <TrendingUp className="h-4 w-4 text-[#E2B340]" />
              Cum avansez la liga următoare?
            </h3>
            <ul className="list-inside list-disc space-y-1.5">
              <li>În fiecare săptămână se face un clasament al ligii tale, după XP-ul strâns în acea săptămână.</li>
              <li><span className="text-[#4ade80]">Promovează prima treime</span> din ligă.</li>
              <li>Treimea de la mijloc rămâne pe loc.</li>
              <li><span className="text-[#FB7185]">Retrogradează ultima treime</span>.</li>
              <li>Într-o ligă de 30 de oameni: 10 promovează, 10 rămân, 10 retrogradează.</li>
              <li>Nu există niciun prag de XP — contează doar locul în clasament.</li>
              <li>Verificarea se face în fiecare duminică la 23:59.</li>
              <li>XP-ul total și nivelul nu se pierd niciodată — doar liga se poate schimba.</li>
              <li>Liga <span className="text-[#8B6914]">Inițiat</span> nu are retrogradare, iar din <span className="text-[#B9F2FF]">Legendar</span> nu se mai promovează.</li>
              <li>Sub 3 jucători într-o ligă nu se mișcă nimeni — n-ai pe cine clasa.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
