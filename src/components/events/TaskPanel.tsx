import { Gift, Lock } from 'lucide-react'
import { QuizTask } from './QuizTask'
import { PuzzleTask } from './PuzzleTask'
import { useCosmeticCatalog } from '@/hooks/useEvents'
import { COSMETIC_RARITY_COLORS, COSMETIC_RARITY_LABELS } from '@/types'
import type { EventTask, TaskResult, BadgePayload } from '@/types'

interface TaskPanelProps {
  task: EventTask
  slug: string
  onSolved?: (result: TaskResult) => void
}

/** Ce se câştigă la sarcina asta, dacă e ceva în afară de XP. */
function RewardNote({ cosmeticId }: { cosmeticId: string }) {
  const { data: catalog } = useCosmeticCatalog()
  const cosmetic = catalog?.find(c => c.id === cosmeticId)
  if (!cosmetic) return null

  const color = COSMETIC_RARITY_COLORS[cosmetic.rarity]
  const emoji = cosmetic.kind === 'badge' ? (cosmetic.payload as BadgePayload).emoji : null

  return (
    <div
      className="flex items-center gap-3 rounded-xl border p-3"
      style={{ borderColor: `${color}55`, backgroundColor: `${color}0d` }}
    >
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#141414] text-lg">
        {emoji ?? <Gift className="h-4 w-4" style={{ color }} />}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#F0F0F0]">{cosmetic.name}</p>
        <p className="text-xs" style={{ color }}>
          {COSMETIC_RARITY_LABELS[cosmetic.rarity]}
          {cosmetic.kind === 'board' ? ' · temă de tablă' : ' · insignă de profil'}
        </p>
      </div>
    </div>
  )
}

/** Randează sarcina după tipul ei. Sarcinile închise nu-şi arată conţinutul. */
export function TaskPanel({ task, slug, onSolved }: TaskPanelProps) {
  if (!task.is_open) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-[#2A2A2A] bg-[#141414] p-5 text-[#6B6B6B]">
        <Lock className="h-5 w-5 flex-shrink-0" />
        <p className="text-sm">
          Încă nu s-a deschis.
          {task.available_at && (
            <> Revino pe {new Intl.DateTimeFormat('ro-RO', {
              day: 'numeric', month: 'long',
            }).format(new Date(task.available_at))}.</>
          )}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {task.task_type === 'quiz' && <QuizTask task={task} slug={slug} onSolved={onSolved} />}
      {task.task_type === 'puzzle' && <PuzzleTask task={task} slug={slug} onSolved={onSolved} />}
      {task.task_type === 'info' && task.prompt && (
        <p className="leading-relaxed text-[#A0A0A0]">{task.prompt}</p>
      )}

      {task.cosmetic_reward && <RewardNote cosmeticId={task.cosmetic_reward} />}
    </div>
  )
}
