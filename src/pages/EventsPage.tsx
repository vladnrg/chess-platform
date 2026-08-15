import { Link } from 'react-router-dom'
import { CalendarClock, Sparkles } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'
import { Progress } from '@/components/ui/Progress'
import { useEnsureOpeningWeek } from '@/hooks/useOpeningChallenge'
import { useEvents } from '@/hooks/useEvents'
import { EventIcon } from '@/components/events/EventIcon'
import { eventWindow, eventStatusLabel } from '@/lib/events'
import { EVENT_KIND_LABELS, type SeasonalEvent } from '@/types'

function EventCard({ event }: { event: SeasonalEvent }) {
  const color = event.accent_color
  const ended = event.status === 'ended'
  const upcoming = event.status === 'upcoming'
  const pct = event.total_tasks > 0
    ? Math.round((event.done_tasks / event.total_tasks) * 100)
    : 0

  return (
    <Link
      to={`/evenimente/${event.slug}`}
      className="group flex flex-col rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        borderColor: ended ? '#2A2A2A' : `${color}45`,
        backgroundColor: ended ? '#101010' : `${color}0a`,
        opacity: ended ? 0.6 : 1,
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}1f`, border: `1px solid ${color}40` }}
        >
          <EventIcon name={event.icon} className="h-5 w-5" style={{ color }} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wider text-[#6B6B6B]">
            {EVENT_KIND_LABELS[event.kind]}
          </p>
          <h3 className="mt-0.5 font-display text-lg font-bold leading-tight text-[#F0F0F0]">
            {event.title}
          </h3>
        </div>
      </div>

      {event.tagline && (
        <p className="mt-3 flex-1 text-sm leading-relaxed text-[#A0A0A0]">{event.tagline}</p>
      )}

      <div className="mt-4 space-y-2.5">
        {/* Progresul are sens doar la evenimentele cu sarcini şi începute */}
        {event.total_tasks > 0 && !upcoming && (
          <>
            <Progress value={pct} barClassName={pct === 100 ? 'bg-[#4ade80]' : 'bg-[#E2B340]'} />
            <p className="text-xs text-[#6B6B6B]">
              {event.done_tasks} din {event.total_tasks} rezolvate
            </p>
          </>
        )}

        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-[#6B6B6B]">
            <CalendarClock className="h-3.5 w-3.5" />
            {eventWindow(event)}
          </span>
          <span
            className="font-semibold"
            style={{ color: ended ? '#6B6B6B' : upcoming ? '#A0A0A0' : color }}
          >
            {eventStatusLabel(event)}
          </span>
        </div>
      </div>
    </Link>
  )
}

/**
 * Hub-ul de evenimente: ce se întâmplă acum, ce urmează, ce s-a încheiat.
 *
 * Evenimentele încheiate rămân vizibile două săptămâni (filtrul e în
 * `list_events`), ca să se vadă ce s-a ratat — altfel nimeni n-ar afla că
 * există până nu nimereşte din întâmplare peste unul.
 */
export function EventsPage() {
  const { data: events = [], isLoading } = useEvents()

  // Prima deschidere din saptamana fixeaza zilele provocarii „Numeste
  // deschiderea": ziua in care intri decide daca joci in zilele impare sau
  // in cele pare. Sta aici, nu in componenta provocarii, fiindca aceea se
  // monteaza abia dupa ce intri in evenimentul respectiv.
  useEnsureOpeningWeek()

  const live = events.filter(e => e.status === 'live')
  const upcoming = events.filter(e => e.status === 'upcoming')
  const ended = events.filter(e => e.status === 'ended')

  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
  }

  return (
    <div className="space-y-8">
      {/* Titlul stă în bara shell-ului; aici rămâne doar subtitlul */}
      <p className="text-sm text-[#6B6B6B]">
        Sărbători, zile ale marilor jucători și provocări cu termen. Fiecare aduce XP,
        insigne sau teme de tablă.
      </p>

      {events.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <Sparkles className="mb-3 h-12 w-12 text-[#2A2A2A]" />
          <p className="text-[#6B6B6B]">Niciun eveniment deocamdată. Revino în curând.</p>
        </div>
      )}

      {live.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#A0A0A0]">
            Acum
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {live.map(e => <EventCard key={e.slug} event={e} />)}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#A0A0A0]">
            Ce urmează
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {upcoming.map(e => <EventCard key={e.slug} event={e} />)}
          </div>
        </section>
      )}

      {ended.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#6B6B6B]">
            S-au încheiat
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ended.map(e => <EventCard key={e.slug} event={e} />)}
          </div>
        </section>
      )}
    </div>
  )
}
