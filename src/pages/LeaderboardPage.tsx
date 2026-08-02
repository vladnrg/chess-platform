import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Flame, MapPin, Search, Star, Trophy, Users } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  useWeeklyLeaderboard, useTotalLeaderboard, hoursUntilWeekEnd, type RankedPlayer,
} from '@/hooks/useLeaderboard'
import { useCommunity, type CommunitySortKey } from '@/hooks/useCommunity'
import { PlayerCard } from '@/components/community/PlayerCard'
import { Spinner } from '@/components/ui/Spinner'
import { getLeagueConfig, formatXp, cn } from '@/lib/utils'

type Tab = 'weekly' | 'total' | 'players'

export function LeaderboardPage() {
  const { profile } = useAuth()
  const [tab, setTab] = useState<Tab>('weekly')

  const league = profile ? getLeagueConfig(profile.current_league) : null

  return (
    <div className="space-y-6">
      <p className="text-sm text-[#6B6B6B]">
        {league
          ? <>Cum stai față de ceilalți jucători din liga <span className="font-semibold" style={{ color: league.color }}>{league.label}</span>.</>
          : 'Cum stai față de ceilalți jucători.'}
      </p>

      <div className="flex w-fit flex-wrap gap-1 rounded-lg border border-[#2A2A2A] bg-[#141414] p-1">
        {([
          { key: 'weekly' as Tab, label: 'Săptămâna aceasta', icon: Trophy },
          { key: 'total' as Tab, label: 'XP total', icon: Star },
          { key: 'players' as Tab, label: 'Caută jucători', icon: Users },
        ]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              tab === key ? 'bg-[#2A2A2A] text-[#F0F0F0]' : 'text-[#6B6B6B] hover:text-[#A0A0A0]'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'weekly' && <WeeklyTable />}
      {tab === 'total' && <TotalTable />}
      {tab === 'players' && <PlayerBrowser />}
    </div>
  )
}

function WeeklyTable() {
  const { profile } = useAuth()
  const { data: players, isLoading } = useWeeklyLeaderboard(profile?.current_league)
  const hoursLeft = hoursUntilWeekEnd()
  const league = profile ? getLeagueConfig(profile.current_league) : null

  if (isLoading) return <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>

  const me = players?.find(p => p.id === profile?.id)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[#A0A0A0]">
          {me
            ? <>Ești pe locul <span className="font-semibold text-[#E2B340]">{me.rank}</span> din {players!.length}.</>
            : 'Încă n-ai strâns XP săptămâna asta.'}
          {league && (
            <span className="text-[#6B6B6B]">
              {' '}Minimul ca să nu retrogradezi: {league.weeklyMinXp} XP.
            </span>
          )}
        </p>
        <p className="flex items-center gap-1.5 text-sm text-[#6B6B6B]">
          <Clock className="h-4 w-4" />
          Se resetează în {hoursLeft}h
        </p>
      </div>

      {!players?.length ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Trophy className="mb-3 h-12 w-12 text-[#2A2A2A]" />
          <p className="text-[#6B6B6B]">Nimeni din liga ta n-a strâns XP săptămâna asta încă.</p>
          <p className="mt-1 text-sm text-[#6B6B6B]">Fii primul — orice puzzle rezolvat contează.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#2A2A2A]">
          {players.map((player, i) => (
            <PlayerRow
              key={player.id}
              player={player}
              isMe={player.id === profile?.id}
              isLast={i === players.length - 1 && !!me}
            />
          ))}

          {/* Dacă n-ai XP săptămâna asta, n-ai rând în tabelă — te arătăm oricum,
              la coadă, ca să-ți vezi situația. */}
          {!me && profile && (
            <PlayerRow
              player={{
                rank: players.length + 1,
                id: profile.id,
                username: profile.username,
                xp: 0,
                streak_days: profile.streak_days,
                playing_style: profile.playing_style,
                city: profile.city,
              }}
              isMe
              isLast
            />
          )}
        </div>
      )}
    </div>
  )
}

function TotalTable() {
  const { profile } = useAuth()
  const { data: players, isLoading } = useTotalLeaderboard(profile?.current_league)

  if (isLoading) return <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>

  if (!players?.length) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <Trophy className="mb-3 h-12 w-12 text-[#2A2A2A]" />
        <p className="text-[#6B6B6B]">Încă nu e nimeni în liga ta. Ești primul.</p>
      </div>
    )
  }

  const myRank = players.find(p => p.id === profile?.id)?.rank

  return (
    <div className="space-y-3">
      {myRank && (
        <p className="text-sm text-[#A0A0A0]">
          Ești pe locul <span className="font-semibold text-[#E2B340]">{myRank}</span> din {players.length}.
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-[#2A2A2A]">
        {players.map((player, i) => (
          <PlayerRow
            key={player.id}
            player={player}
            isMe={player.id === profile?.id}
            isLast={i === players.length - 1}
          />
        ))}
      </div>
    </div>
  )
}

/** Culoarea medaliei pentru primele trei locuri; `null` în rest. */
function medalColor(rank: number): string | null {
  if (rank === 1) return '#FFD700'
  if (rank === 2) return '#C0C0C0'
  if (rank === 3) return '#CD7F32'
  return null
}

function PlayerRow({ player, isMe, isLast }: { player: RankedPlayer; isMe: boolean; isLast: boolean }) {
  const medal = medalColor(player.rank)

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 transition-colors',
        !isLast && 'border-b border-[#2A2A2A]',
        isMe ? 'bg-[rgba(226,179,64,0.08)]' : 'hover:bg-[#141414]'
      )}
    >
      <span
        className="w-7 flex-shrink-0 text-center text-sm font-bold tabular-nums"
        style={{ color: medal ?? (isMe ? '#E2B340' : '#6B6B6B') }}
      >
        {player.rank}
      </span>

      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#2A2A2A] text-xs font-bold text-[#E2B340]">
        {player.username.slice(0, 2).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-sm font-medium', isMe ? 'text-[#E2B340]' : 'text-[#F0F0F0]')}>
          {player.username}
          {isMe && <span className="ml-2 text-xs font-normal text-[#6B6B6B]">(tu)</span>}
        </p>
        {player.city && (
          <p className="truncate text-xs text-[#6B6B6B]">{player.city}</p>
        )}
      </div>

      {player.streak_days > 0 && (
        <span className="hidden flex-shrink-0 items-center gap-1 text-xs text-[#fbbf24] sm:flex">
          <Flame className="h-3.5 w-3.5" />
          {player.streak_days}
        </span>
      )}

      <span className="w-16 flex-shrink-0 text-right text-sm font-semibold tabular-nums text-[#F0F0F0]">
        {formatXp(player.xp)}
        <span className="ml-1 text-xs font-normal text-[#6B6B6B]">XP</span>
      </span>
    </div>
  )
}

/** Răsfoirea tuturor jucătorilor — ce era înainte pagina „Comunitate". */
function PlayerBrowser() {
  const { profile } = useAuth()
  const [filter, setFilter] = useState<'region' | 'all'>(profile?.city ? 'region' : 'all')
  const [sort, setSort] = useState<CommunitySortKey>('xp')
  const [search, setSearch] = useState('')

  const { data: players, isLoading } = useCommunity({
    filter,
    sort,
    search,
    userCity: profile?.city,
  })

  const hasLocation = !!profile?.city

  return (
    <div className="space-y-4">
      {!hasLocation && (
        <div className="flex items-start gap-3 rounded-xl border border-[rgba(226,179,64,0.25)] bg-[rgba(226,179,64,0.08)] p-4">
          <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#E2B340]" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#E2B340]">Setează-ți locația ca să vezi jucători din zona ta</p>
            <p className="mt-0.5 text-xs text-[#6B6B6B]">Adaugă orașul tău în profil.</p>
          </div>
          <Link to="/profile" className="flex-shrink-0 text-xs font-medium text-[#E2B340] underline underline-offset-2 hover:text-[#F0C85A]">
            Profil →
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-fit gap-1 rounded-lg border border-[#2A2A2A] bg-[#141414] p-1">
          {([
            { key: 'region' as const, label: hasLocation ? `Din ${profile?.city}` : 'Din zona mea' },
            { key: 'all' as const, label: 'Toți jucătorii' },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              disabled={key === 'region' && !hasLocation}
              className={cn(
                'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                filter === key
                  ? 'bg-[#2A2A2A] text-[#F0F0F0]'
                  : 'text-[#6B6B6B] hover:text-[#A0A0A0] disabled:cursor-not-allowed disabled:opacity-40'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6B6B6B]" />
            <input
              type="text"
              placeholder="Caută jucător..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[#2A2A2A] bg-[#141414] py-2 pl-8 pr-3 text-sm text-[#F0F0F0] placeholder-[#6B6B6B] focus:border-[#E2B340] focus:outline-none"
            />
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as CommunitySortKey)}
            className="rounded-lg border border-[#2A2A2A] bg-[#141414] px-3 py-2 text-sm text-[#F0F0F0] focus:border-[#E2B340] focus:outline-none"
          >
            <option value="xp">XP</option>
            <option value="estimated_elo">Elo</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
      ) : !players?.length ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Users className="mb-3 h-12 w-12 text-[#2A2A2A]" />
          <p className="text-[#6B6B6B]">
            {filter === 'region' && hasLocation
              ? `Niciun jucător înregistrat din ${profile?.city} încă.`
              : search
                ? `Niciun rezultat pentru „${search}".`
                : 'Niciun jucător încă.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {players.map(p => <PlayerCard key={p.id} profile={p} />)}
        </div>
      )}
    </div>
  )
}
