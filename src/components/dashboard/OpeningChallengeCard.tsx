import { Link } from 'react-router-dom'
import { BookOpen, CalendarClock, Check, ArrowRight } from 'lucide-react'
import { Progress } from '@/components/ui/Progress'
import { useChallengeStatus } from '@/hooks/useOpeningChallenge'
import { dayLabel } from '@/lib/events'

const TO = '/evenimente/numeste-deschiderea'

/**
 * Provocarea deschiderilor, pe Bârlog.
 *
 * Cardul îşi schimbă complet mesajul după starea zilei — de început, de
 * continuat, gata pe azi, sau nu e zi de provocare. Un singur card care spune
 * mereu acelaşi lucru ar fi doar încă un link.
 */
export function OpeningChallengeCard() {
  const { data: status } = useChallengeStatus()

  if (!status) return null

  const remaining = status.total - status.answered

  // Zi liberă: rămâne pe ecran, dar discret şi fără buton.
  if (!status.is_challenge_day) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-[#1F1F1F] bg-[#101010] p-4">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#141414]">
          <CalendarClock className="h-4 w-4 text-[#4A4A4A]" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#6B6B6B]">Provocarea deschiderilor</p>
          <p className="text-xs text-[#4A4A4A]">
            Următorul calup: {dayLabel(status.next_day)}
          </p>
        </div>
      </div>
    )
  }

  // Terminat azi
  if (status.finished) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-[rgba(74,222,128,0.25)] bg-[rgba(74,222,128,0.06)] p-4">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[rgba(74,222,128,0.12)]">
          <Check className="h-4 w-4 text-[#4ade80]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#F0F0F0]">
            {status.correct_count} din {status.total} corecte
          </p>
          <p className="text-xs text-[#6B6B6B]">
            {(status.xp_awarded ?? 0) >= 0 ? '+' : ''}{status.xp_awarded} XP ·
            {' '}revino {dayLabel(status.next_day)}
          </p>
        </div>
      </div>
    )
  }

  const started = status.answered > 0

  return (
    <Link
      to={TO}
      className="group flex items-center gap-3 rounded-xl border border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.06)] p-4 transition-all duration-200 hover:-translate-y-0.5"
    >
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.12)]">
        <BookOpen className="h-4 w-4 text-[#8B5CF6]" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#F0F0F0]">
          {started ? 'Continuă provocarea' : 'Provocarea deschiderilor'}
        </p>
        <p className="text-xs text-[#A0A0A0]">
          {started
            ? `Mai ai ${remaining} ${remaining === 1 ? 'întrebare' : 'întrebări'}`
            : `${status.total} poziții de recunoscut`}
        </p>

        {started && (
          <Progress
            value={(status.answered / status.total) * 100}
            barClassName="bg-[#8B5CF6]"
            className="mt-2"
          />
        )}
      </div>

      <ArrowRight className="h-4 w-4 flex-shrink-0 text-[#8B5CF6]" />
    </Link>
  )
}
