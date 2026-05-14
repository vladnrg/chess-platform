import { useState } from 'react'
import { MapPin, Search, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useCommunity, type CommunitySortKey } from '@/hooks/useCommunity'
import { PlayerCard } from '@/components/community/PlayerCard'
import { Spinner } from '@/components/ui/Spinner'

type FilterTab = 'region' | 'all'

export function CommunityPage() {
  const { profile } = useAuth()
  const [tab, setTab] = useState<FilterTab>(profile?.city ? 'region' : 'all')
  const [sort, setSort] = useState<CommunitySortKey>('xp')
  const [search, setSearch] = useState('')

  const { data: players, isLoading } = useCommunity({
    filter: tab,
    sort,
    search,
    userCity: profile?.city,
  })

  const hasLocation = !!profile?.city

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#f0f0f0]">Comunitate</h1>
        <p className="text-[#666] text-sm mt-0.5">Descoperă jucători din comunitatea ta</p>
      </div>

      {/* Banner locație lipsă */}
      {!hasLocation && (
        <div className="flex items-start gap-3 rounded-xl bg-[rgba(200,168,75,0.08)] border border-[rgba(200,168,75,0.25)] p-4">
          <MapPin className="h-5 w-5 text-[#c8a84b] flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#c8a84b]">Setează-ți locația pentru a vedea jucători din zona ta</p>
            <p className="text-xs text-[#666] mt-0.5">Adaugă orașul tău în profil și apare în tabul "Din zona mea".</p>
          </div>
          <Link
            to="/profile"
            className="flex-shrink-0 text-xs font-medium text-[#c8a84b] hover:text-[#d4b860] underline underline-offset-2"
          >
            Profil →
          </Link>
        </div>
      )}

      {/* Tabs + controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] p-1 gap-1 w-fit">
          {([
            { key: 'region' as FilterTab, label: hasLocation ? `Din ${profile?.city}` : 'Din zona mea' },
            { key: 'all' as FilterTab, label: 'Toți jucătorii' },
          ] as { key: FilterTab; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              disabled={key === 'region' && !hasLocation}
              className={[
                'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                tab === key
                  ? 'bg-[#2a2a2a] text-[#f0f0f0]'
                  : 'text-[#666] hover:text-[#a0a0a0] disabled:opacity-40 disabled:cursor-not-allowed',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#555]" />
            <input
              type="text"
              placeholder="Caută jucător..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] pl-8 pr-3 py-2 text-sm text-[#f0f0f0] placeholder-[#555] focus:outline-none focus:border-[#c8a84b]"
            />
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as CommunitySortKey)}
            className="rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-2 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#c8a84b]"
          >
            <option value="xp">XP</option>
            <option value="estimated_elo">Elo</option>
          </select>
        </div>
      </div>

      {/* Grid jucători */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
      ) : !players?.length ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Users className="h-12 w-12 text-[#333] mb-3" />
          {tab === 'region' && !hasLocation ? (
            <p className="text-[#666]">Setează-ți orașul în profil pentru a vedea jucători din zona ta.</p>
          ) : tab === 'region' ? (
            <p className="text-[#666]">Niciun jucător înregistrat din {profile?.city} încă.</p>
          ) : (
            <p className="text-[#666]">Niciun rezultat pentru "{search}".</p>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {players.map(p => (
            <PlayerCard key={p.id} profile={p} />
          ))}
        </div>
      )}
    </div>
  )
}
