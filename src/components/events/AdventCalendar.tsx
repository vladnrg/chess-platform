import { useState } from 'react'
import { Check, Lock, Gift } from 'lucide-react'
import { TaskPanel } from './TaskPanel'
import { taskProgress } from '@/lib/events'
import type { EventTask, SeasonalEventDetail } from '@/types'

interface AdventCalendarProps {
  event: SeasonalEventDetail
}

/** O uşă din calendar. */
function Door({
  task, selected, onSelect,
}: { task: EventTask; selected: boolean; onSelect: () => void }) {
  const day = task.order_index
  const hasReward = !!task.cosmetic_reward

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!task.is_open}
      aria-label={`Ușa ${day}${task.done ? ', deschisă' : task.is_open ? '' : ', încă închisă'}`}
      className={[
        'relative flex aspect-square flex-col items-center justify-center rounded-xl border-2 transition-all',
        task.is_open ? 'cursor-pointer' : 'cursor-not-allowed',
        selected ? 'ring-2 ring-[#4ade80] ring-offset-2 ring-offset-[#0A0A0A]' : '',
        task.done
          ? 'border-[#4ade80] bg-[rgba(74,222,128,0.12)]'
          : task.is_open
            ? 'border-[#E2B340] bg-[rgba(226,179,64,0.08)] hover:-translate-y-0.5 hover:bg-[rgba(226,179,64,0.16)]'
            : 'border-[#2A2A2A] bg-[#141414] opacity-60',
      ].join(' ')}
    >
      <span
        className={[
          'font-display text-2xl font-bold',
          task.done ? 'text-[#4ade80]' : task.is_open ? 'text-[#E2B340]' : 'text-[#3A3A3A]',
        ].join(' ')}
      >
        {day}
      </span>

      {task.done ? (
        <Check className="mt-0.5 h-4 w-4 text-[#4ade80]" />
      ) : task.is_open ? (
        hasReward ? <Gift className="mt-0.5 h-4 w-4 text-[#E2B340]" /> : null
      ) : (
        <Lock className="mt-0.5 h-3.5 w-3.5 text-[#3A3A3A]" />
      )}

      {/* Uşile cu premiu se văd din prima, ca să se ştie unde merită să ajungi */}
      {hasReward && !task.done && task.is_open && (
        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#E2B340]" />
      )}
    </button>
  )
}

/**
 * Calendarul de Crăciun: 24 de uşi, câte una pe zi.
 *
 * Uşa se deschide la data ei — verificarea e pe server (`available_at`), aici
 * doar o arătăm. Uşile trecute rămân deschise: cine intră pe 15 decembrie poate
 * recupera tot ce a ratat, altfel o zi pierdută ar strica toată luna.
 */
export function AdventCalendar({ event }: AdventCalendarProps) {
  const tasks = event.tasks
  const progress = taskProgress(tasks)

  // Deschidem implicit prima uşă nerezolvată — de obicei exact ziua curentă.
  const [selectedId, setSelectedId] = useState<string | null>(
    () => tasks.find(t => t.is_open && !t.done)?.id ?? null
  )
  const selected = tasks.find(t => t.id === selectedId) ?? null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-[#A0A0A0]">
          <span className="font-semibold text-[#4ade80]">{progress.done}</span>
          {' '}din {progress.total} uși deschise
        </p>
        <p className="text-sm text-[#6B6B6B]">
          {progress.open - progress.done > 0
            ? `${progress.open - progress.done} te așteaptă acum`
            : 'Le-ai deschis pe toate cele disponibile'}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6 lg:grid-cols-8">
        {tasks.map(task => (
          <Door
            key={task.id}
            task={task}
            selected={selectedId === task.id}
            onSelect={() => setSelectedId(task.id)}
          />
        ))}
      </div>

      {selected && (
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#0F0F0F] p-5">
          <h3 className="mb-4 font-display text-xl font-bold text-[#F0F0F0]">
            {selected.title}
          </h3>
          <TaskPanel task={selected} slug={event.slug} />
        </div>
      )}
    </div>
  )
}
