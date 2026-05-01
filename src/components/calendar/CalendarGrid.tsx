import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Tournament } from '@/types'

const DAY_LABELS = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum']

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  // Convert Sunday=0 to Monday=0
  const startOffset = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return { startOffset, daysInMonth }
}

interface CalendarGridProps {
  tournaments: Tournament[]
  month: Date
  onMonthChange: (delta: number) => void
}

export function CalendarGrid({ tournaments, month, onMonthChange }: CalendarGridProps) {
  const year = month.getFullYear()
  const monthIdx = month.getMonth()
  const { startOffset, daysInMonth } = getMonthDays(year, monthIdx)

  const monthLabel = month.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })

  // Map day → tournaments
  const eventsByDay = new Map<number, Tournament[]>()
  tournaments.forEach(t => {
    const d = new Date(t.starts_at)
    if (d.getFullYear() === year && d.getMonth() === monthIdx) {
      const day = d.getDate()
      if (!eventsByDay.has(day)) eventsByDay.set(day, [])
      eventsByDay.get(day)!.push(t)
    }
  })

  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === monthIdx

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onMonthChange(-1)}
          className="rounded-lg p-1.5 text-[#666] hover:text-[#f0f0f0] hover:bg-[#1a1a1a] transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="font-semibold text-[#f0f0f0] capitalize">{monthLabel}</p>
        <button
          onClick={() => onMonthChange(1)}
          className="rounded-lg p-1.5 text-[#666] hover:text-[#f0f0f0] hover:bg-[#1a1a1a] transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map(d => (
          <div key={d} className="py-1 text-center text-xs font-medium text-[#555]">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-px bg-[#2a2a2a] rounded-xl overflow-hidden border border-[#2a2a2a]">
        {cells.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="bg-[#111] h-16" />
          }
          const events = eventsByDay.get(day) ?? []
          const isToday = isCurrentMonth && day === today.getDate()

          return (
            <div
              key={day}
              className={[
                'bg-[#1a1a1a] h-16 p-1.5 flex flex-col',
                isToday ? 'ring-1 ring-inset ring-[#c8a84b]' : '',
              ].join(' ')}
            >
              <span className={[
                'text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full',
                isToday ? 'bg-[#c8a84b] text-black' : 'text-[#666]',
              ].join(' ')}>
                {day}
              </span>
              <div className="mt-0.5 space-y-0.5 overflow-hidden">
                {events.slice(0, 2).map(e => (
                  <div
                    key={e.id}
                    className={[
                      'truncate rounded px-1 text-[9px] font-medium leading-4',
                      e.type === 'platform'
                        ? 'bg-[rgba(200,168,75,0.2)] text-[#c8a84b]'
                        : 'bg-[rgba(100,200,100,0.15)] text-[#6cd06c]',
                    ].join(' ')}
                    title={e.title}
                  >
                    {e.title}
                  </div>
                ))}
                {events.length > 2 && (
                  <p className="text-[9px] text-[#555] px-1">+{events.length - 2} mai mult</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex gap-4 text-xs text-[#666]">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-[rgba(200,168,75,0.3)]" />
          <span>Platformă</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-[rgba(100,200,100,0.2)]" />
          <span>Extern / Fizic</span>
        </div>
      </div>
    </div>
  )
}
