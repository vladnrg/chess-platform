import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useEvents } from '@/hooks/useEvents'
import { EventIcon } from '@/components/events/EventIcon'
import { eventStatusLabel } from '@/lib/events'
import type { SeasonalEvent } from '@/types'

/** Câte arătăm pe Bârlog. Restul stau pe pagina de evenimente. */
const MAX_SHOWN = 3

function EventStrip({ event }: { event: SeasonalEvent }) {
  const color = event.accent_color
  const remaining = event.total_tasks - event.done_tasks

  return (
    <Link
      to={`/evenimente/${event.slug}`}
      className="flex items-center gap-3 rounded-xl border p-3.5 transition-all duration-200 hover:-translate-y-0.5"
      style={{ borderColor: `${color}40`, backgroundColor: `${color}0a` }}
    >
      <span
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${color}1f`, border: `1px solid ${color}40` }}
      >
        <EventIcon name={event.icon} className="h-4 w-4" style={{ color }} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#F0F0F0]">{event.title}</p>
        <p className="truncate text-xs text-[#6B6B6B]">
          {event.total_tasks > 0 && remaining > 0
            ? `${remaining} de rezolvat · ${eventStatusLabel(event)}`
            : eventStatusLabel(event)}
        </p>
      </div>

      <ChevronRight className="h-4 w-4 flex-shrink-0 text-[#6B6B6B]" />
    </Link>
  )
}

/**
 * Evenimentele care se întâmplă chiar acum, pe Bârlog.
 *
 * Nu randează nimic când nu e nimic în desfăşurare: o secţiune goală cu „niciun
 * eveniment" ar ocupa spaţiu ca să spună că nu e nimic de făcut.
 */
export function ActiveEvents() {
  const { data: events = [] } = useEvents()
  const live = events.filter(e => e.status === 'live').slice(0, MAX_SHOWN)

  if (live.length === 0) return null

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-lg font-bold text-[#F0F0F0]">Se întâmplă acum</h2>
        <Link to="/evenimente" className="text-sm text-[#6B6B6B] transition-colors hover:text-[#A0A0A0]">
          Toate
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {live.map(e => <EventStrip key={e.slug} event={e} />)}
      </div>
    </section>
  )
}
