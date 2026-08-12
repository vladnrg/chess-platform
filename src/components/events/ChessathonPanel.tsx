import { Users, Zap, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { Spinner } from '@/components/ui/Spinner'
import { useChessathonProgress, useClaimChessathon, useMyCosmetics } from '@/hooks/useEvents'
import { formatXp } from '@/lib/utils'
import type { SeasonalEventDetail } from '@/types'

interface ChessathonPanelProps {
  event: SeasonalEventDetail
}

/**
 * Un chessathon: tot XP-ul strâns în fereastra evenimentului contează, indiferent
 * de unde vine — puzzle-uri, lecţii, partide.
 *
 * Se vede şi totalul comunităţii. Nu e o competiţie: nimeni nu pierde dacă altul
 * strânge mai mult, iar cifra colectivă e acolo tocmai ca să nu pară o cursă.
 */
export function ChessathonPanel({ event }: ChessathonPanelProps) {
  const { data: progress, isLoading } = useChessathonProgress(event.slug)
  const claim = useClaimChessathon(event.slug)
  const { data: owned } = useMyCosmetics()

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner className="h-7 w-7" /></div>
  }
  if (!progress) return null

  const rewardId = typeof event.config.reward_cosmetic === 'string'
    ? event.config.reward_cosmetic
    : null
  const alreadyClaimed = !!rewardId && !!owned?.some(c => c.id === rewardId)
  const pct = progress.target_xp > 0
    ? Math.min(100, Math.round((progress.my_xp / progress.target_xp) * 100))
    : 0

  return (
    <div className="space-y-5">
      {/* Progresul meu */}
      <div className="rounded-2xl border border-[#2A2A2A] bg-[#0F0F0F] p-5">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-sm text-[#6B6B6B]">XP-ul tău în eveniment</span>
          <span className="font-display text-2xl font-bold text-[#E2B340]">
            {progress.my_xp}
            <span className="ml-1 text-sm font-normal text-[#6B6B6B]">
              / {progress.target_xp}
            </span>
          </span>
        </div>

        <Progress
          value={pct}
          barClassName={progress.reached ? 'bg-[#4ade80]' : 'bg-[#E2B340]'}
        />

        <p className="mt-2.5 text-sm text-[#A0A0A0]">
          {progress.reached
            ? 'Ținta e atinsă. Premiul te așteaptă mai jos.'
            : `Îți mai trebuie ${progress.target_xp - progress.my_xp} XP. Contează orice — puzzle-uri, lecții, partide.`}
        </p>
      </div>

      {/* Comunitatea */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-4">
          <div className="flex items-center gap-2 text-[#6B6B6B]">
            <Zap className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider">XP strâns împreună</span>
          </div>
          <p className="mt-1.5 font-display text-2xl font-bold text-[#F0F0F0]">
            {formatXp(progress.community_xp)}
          </p>
        </div>

        <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-4">
          <div className="flex items-center gap-2 text-[#6B6B6B]">
            <Users className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider">Câți participă</span>
          </div>
          <p className="mt-1.5 font-display text-2xl font-bold text-[#F0F0F0]">
            {progress.participants}
          </p>
        </div>
      </div>

      {/* Premiul */}
      {rewardId && (
        alreadyClaimed ? (
          <p className="flex items-center gap-2 rounded-xl border border-[rgba(74,222,128,0.3)] bg-[rgba(74,222,128,0.08)] p-4 text-sm text-[#4ade80]">
            <Trophy className="h-4 w-4 flex-shrink-0" />
            Premiul e al tău. Îl poți echipa din profil.
          </p>
        ) : (
          <Button
            onClick={() => void claim.mutateAsync()}
            disabled={!progress.reached || claim.isPending}
            size="lg"
          >
            <Trophy className="mr-2 h-4 w-4" />
            {claim.isPending
              ? 'Ridic premiul…'
              : progress.reached
                ? 'Ridică premiul'
                : 'Premiul se deblochează la țintă'}
          </Button>
        )
      )}
    </div>
  )
}
