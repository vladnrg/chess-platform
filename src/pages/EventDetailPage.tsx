import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarClock, Tag } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'
import { AdventCalendar } from '@/components/events/AdventCalendar'
import { ChessathonPanel } from '@/components/events/ChessathonPanel'
import { TaskList } from '@/components/events/TaskList'
import { useEventDetail } from '@/hooks/useEvents'
import { EventIcon } from '@/components/events/EventIcon'
import { eventWindow, eventStatusLabel } from '@/lib/events'
import { EVENT_KIND_LABELS, type SeasonalEventDetail } from '@/types'

/** Fiecare fel de eveniment are forma lui vizuală. */
function EventBody({ event }: { event: SeasonalEventDetail }) {
  if (event.status === 'upcoming') {
    return (
      <p className="rounded-2xl border border-[#2A2A2A] bg-[#141414] p-5 text-[#A0A0A0]">
        Evenimentul n-a început încă. Revino la data de start — găsești totul aici.
      </p>
    )
  }

  switch (event.kind) {
    case 'advent':
      return <AdventCalendar event={event} />
    case 'chessathon':
      return <ChessathonPanel event={event} />
    default:
      return <TaskList event={event} />
  }
}

/** Detaliile promoţiei, când evenimentul aduce şi o reducere. */
function PromoNote({ config }: { config: Record<string, unknown> }) {
  const pct = typeof config.discount_pct === 'number' ? config.discount_pct : null
  const note = typeof config.discount_note === 'string' ? config.discount_note : null
  if (pct === null) return null

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[rgba(226,179,64,0.3)] bg-[rgba(226,179,64,0.06)] p-5">
      <Tag className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#E2B340]" />
      <div>
        <p className="font-semibold text-[#F0F0F0]">
          −{pct}% la cursuri, pentru cine termină evenimentul
        </p>
        {note && <p className="mt-1 text-sm text-[#A0A0A0]">{note}</p>}
      </div>
    </div>
  )
}

export function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: event, isLoading } = useEventDetail(slug)

  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
  }

  if (!event) {
    return (
      <div className="py-16 text-center">
        <p className="text-[#6B6B6B]">Evenimentul nu există sau nu mai e publicat.</p>
        <Link to="/evenimente" className="mt-3 inline-block text-sm text-[#E2B340] hover:underline">
          Înapoi la evenimente
        </Link>
      </div>
    )
  }

  const color = event.accent_color

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        to="/evenimente"
        className="inline-flex items-center gap-1.5 text-sm text-[#6B6B6B] transition-colors hover:text-[#A0A0A0]"
      >
        <ArrowLeft className="h-4 w-4" />
        Toate evenimentele
      </Link>

      {/* Antet */}
      <header
        className="rounded-2xl border p-6"
        style={{ borderColor: `${color}45`, backgroundColor: `${color}0a` }}
      >
        <div className="flex items-start gap-4">
          <span
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${color}1f`, border: `1px solid ${color}40` }}
          >
            <EventIcon name={event.icon} className="h-6 w-6" style={{ color }} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-wider text-[#6B6B6B]">
              {EVENT_KIND_LABELS[event.kind]}
            </p>
            <h1 className="mt-0.5 font-display text-2xl font-bold text-[#F0F0F0] sm:text-3xl">
              {event.title}
            </h1>
            {event.tagline && (
              <p className="mt-1.5 text-[#A0A0A0]">{event.tagline}</p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
              <span className="flex items-center gap-1.5 text-[#6B6B6B]">
                <CalendarClock className="h-3.5 w-3.5" />
                {eventWindow(event)}
              </span>
              <span className="font-semibold" style={{ color }}>
                {eventStatusLabel({ ...event, total_tasks: 0, done_tasks: 0 })}
              </span>
            </div>
          </div>
        </div>

        {event.description && (
          <p className="mt-5 leading-relaxed text-[#A0A0A0]">{event.description}</p>
        )}
      </header>

      <PromoNote config={event.config} />

      <EventBody event={event} />
    </div>
  )
}
