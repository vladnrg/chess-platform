import { useState } from 'react'
import { CalendarDays, List } from 'lucide-react'
import { useCalendar } from '@/hooks/useCalendar'
import { EventCard } from '@/components/calendar/EventCard'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { Spinner } from '@/components/ui/Spinner'
import type { Tournament } from '@/types'

type ViewMode = 'list' | 'grid'
type FilterType = 'all' | 'platform' | 'external'

const FILTER_LABELS: Record<FilterType, string> = {
  all: 'Toate',
  platform: 'Online',
  external: 'Fizic & Workshop',
}

export function CalendarPage() {
  const [view, setView] = useState<ViewMode>('list')
  const [filter, setFilter] = useState<FilterType>('all')
  const [gridMonth, setGridMonth] = useState(new Date())

  const { data: tournaments = [], isLoading } = useCalendar()

  const filtered: Tournament[] = filter === 'all'
    ? tournaments
    : tournaments.filter(t =>
        filter === 'platform' ? t.type === 'platform' : t.type === 'external'
      )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f0f0f0]">Calendar competițional</h1>
          <p className="text-[#666] text-sm mt-0.5">Turnee și competiții — pe platformă și în comunitate</p>
        </div>

        {/* View toggle */}
        <div className="flex rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] p-1 gap-1 w-fit">
          <button
            onClick={() => setView('list')}
            className={[
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              view === 'list' ? 'bg-[#2a2a2a] text-[#f0f0f0]' : 'text-[#666] hover:text-[#a0a0a0]',
            ].join(' ')}
          >
            <List className="h-3.5 w-3.5" />
            Listă
          </button>
          <button
            onClick={() => setView('grid')}
            className={[
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              view === 'grid' ? 'bg-[#2a2a2a] text-[#f0f0f0]' : 'text-[#666] hover:text-[#a0a0a0]',
            ].join(' ')}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            Lunar
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(Object.entries(FILTER_LABELS) as [FilterType, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={[
              'rounded-full px-4 py-1.5 text-sm font-medium border transition-colors',
              filter === key
                ? 'bg-[#c8a84b] text-black border-[#c8a84b]'
                : 'bg-transparent text-[#666] border-[#2a2a2a] hover:border-[#3a3a3a] hover:text-[#a0a0a0]',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
      ) : view === 'list' ? (
        filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <CalendarDays className="h-12 w-12 text-[#333] mb-3" />
            <p className="text-[#666]">Niciun eveniment viitor în această categorie.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map(t => (
              <EventCard key={t.id} tournament={t} />
            ))}
          </div>
        )
      ) : (
        <CalendarGrid
          tournaments={tournaments}
          month={gridMonth}
          onMonthChange={delta => {
            setGridMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
          }}
        />
      )}
    </div>
  )
}
