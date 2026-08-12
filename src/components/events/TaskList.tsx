import { useState } from 'react'
import { Check, ChevronDown, Lock } from 'lucide-react'
import { TaskPanel } from './TaskPanel'
import { taskProgress } from '@/lib/events'
import { Progress } from '@/components/ui/Progress'
import type { SeasonalEventDetail } from '@/types'

interface TaskListProps {
  event: SeasonalEventDetail
}

/**
 * Lista de sarcini a unui eveniment, ca acordeon. Se foloseşte pentru zilele
 * jucătorilor, „Numește deschiderea" şi vânătoarea de ouă — orice eveniment care
 * nu are o formă vizuală proprie, ca un calendar sau un chessathon.
 */
export function TaskList({ event }: TaskListProps) {
  const tasks = event.tasks
  const progress = taskProgress(tasks)
  const [openId, setOpenId] = useState<string | null>(
    () => tasks.find(t => t.is_open && !t.done)?.id ?? tasks[0]?.id ?? null
  )

  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-1.5 flex items-baseline justify-between text-sm">
          <span className="text-[#6B6B6B]">Progres</span>
          <span className="font-semibold text-[#A0A0A0]">
            {progress.done} din {progress.total}
          </span>
        </div>
        <Progress value={pct} barClassName={pct === 100 ? 'bg-[#4ade80]' : 'bg-[#E2B340]'} />
      </div>

      <div className="space-y-2.5">
        {tasks.map(task => {
          const isOpen = openId === task.id

          return (
            <div
              key={task.id}
              className={[
                'overflow-hidden rounded-xl border transition-colors',
                task.done
                  ? 'border-[rgba(74,222,128,0.3)] bg-[rgba(74,222,128,0.05)]'
                  : task.is_open
                    ? 'border-[#2A2A2A] bg-[#141414]'
                    : 'border-[#1F1F1F] bg-[#101010]',
              ].join(' ')}
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : task.id)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
              >
                <span
                  className={[
                    'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    task.done
                      ? 'bg-[#4ade80] text-[#0A0A0A]'
                      : task.is_open
                        ? 'border border-[#E2B340] text-[#E2B340]'
                        : 'border border-[#2A2A2A] text-[#3A3A3A]',
                  ].join(' ')}
                >
                  {task.done ? <Check className="h-4 w-4" />
                    : task.is_open ? task.order_index
                      : <Lock className="h-3 w-3" />}
                </span>

                <span className="min-w-0 flex-1">
                  <span className={`block text-sm font-semibold ${task.is_open ? 'text-[#F0F0F0]' : 'text-[#4A4A4A]'}`}>
                    {task.title}
                  </span>
                  {task.xp_reward > 0 && (
                    <span className="text-xs text-[#6B6B6B]">+{task.xp_reward} XP</span>
                  )}
                </span>

                <ChevronDown
                  className={`h-4 w-4 flex-shrink-0 text-[#6B6B6B] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isOpen && (
                <div className="border-t border-[#2A2A2A] p-4">
                  <TaskPanel task={task} slug={event.slug} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
