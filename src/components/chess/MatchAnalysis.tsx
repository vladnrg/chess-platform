import { useCallback, useState } from 'react'
import { Chess } from 'chess.js'
import { Link } from 'react-router-dom'
import { Lock, Sparkles } from 'lucide-react'
import { useStockfish, type PositionEval } from '@/hooks/useStockfish'
import { useAuth } from '@/hooks/useAuth'
import { levelFromXp } from '@/lib/levels'
import { FEATURE_LEVELS, hasFeature } from '@/lib/unlocks'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'

/**
 * Analiza partidei jucate, deblocată la nivelul 10.
 *
 * Reutilizează motorul din `useStockfish`, dar nu şi interfaţa din
 * GameAnalysisModal: aceea e legată de forma partidelor importate din Lichess
 * (jucători, deschidere, tip de joc). Aici avem deja partida pe ecran, deci
 * rezultatul se aşază direct peste lista de mutări.
 */

interface Props {
  /** Mutările partidei, în notaţie UCI, separate prin spaţiu. */
  moves: string
  onResult: (evals: PositionEval[]) => void
  hasResult: boolean
}

export function MatchAnalysis({ moves, onResult, hasResult }: Props) {
  const { profile } = useAuth()
  const { analyzePositions } = useStockfish()
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)

  const unlocked = !!profile && hasFeature(profile.xp, 'analysis')
  const level = profile ? levelFromXp(profile.xp) : 1

  const run = useCallback(async () => {
    setRunning(true)
    setProgress(0)

    // Reconstruim poziţiile din mutări: motorul evaluează poziţia dinaintea
    // fiecărei mutări, ca să vadă cât s-a pierdut jucând-o pe cea aleasă.
    const game = new Chess()
    const positions: { fen: string; played: string }[] = []

    for (const uci of moves.split(' ').filter(Boolean)) {
      positions.push({ fen: game.fen(), played: uci })
      try {
        game.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] ?? 'q' })
      } catch {
        break
      }
    }

    const evals = await analyzePositions(positions, setProgress)
    onResult(evals)
    setRunning(false)
  }, [moves, analyzePositions, onResult])

  if (!moves) return null

  if (!unlocked) {
    return (
      <Card className="p-4 text-center">
        <Lock className="mx-auto mb-2 h-5 w-5 text-[#3A3A3A]" />
        <p className="text-sm font-medium text-[#A0A0A0]">Analiza partidei</p>
        <p className="mt-1 text-xs text-[#6B6B6B]">
          Se deblochează la nivelul {FEATURE_LEVELS.analysis}. Ești la {level}.
        </p>
        <Link to="/profile" className="mt-2 inline-block text-xs text-[#E2B340] hover:text-[#F0C85A]">
          Vezi ce mai poți debloca →
        </Link>
      </Card>
    )
  }

  if (hasResult) return null

  return (
    <Card className="p-4">
      {running ? (
        <>
          <p className="mb-2 text-sm text-[#A0A0A0]">Motorul analizează partida...</p>
          <Progress value={progress} barClassName="bg-[#2DD4BF]" />
        </>
      ) : (
        <Button variant="secondary" size="sm" className="w-full" onClick={() => void run()}>
          <Sparkles className="h-4 w-4" /> Analizează partida
        </Button>
      )}
    </Card>
  )
}
