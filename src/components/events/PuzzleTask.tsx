import { useCallback, useMemo, useState } from 'react'
import { Chess } from 'chess.js'
import { Chessboard, type PieceDropHandlerArgs } from 'react-chessboard'
import { CheckCircle2, Sparkles, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { initPuzzleState, type PuzzleState } from '@/lib/puzzle-utils'
import { themeLabel, displayThemes } from '@/lib/puzzle-themes'
import { useTaskPuzzle, useCompleteTask } from '@/hooks/useEvents'
import { useBoardTheme } from '@/hooks/useBoardTheme'
import type { EventTask, TaskResult } from '@/types'

interface PuzzleTaskProps {
  task: EventTask
  slug: string
  onSolved?: (result: TaskResult) => void
}

/** Cât aşteptăm înainte să jucăm răspunsul adversarului, ca mutarea să se vadă. */
const OPPONENT_DELAY_MS = 420

/**
 * Un puzzle dintr-o sarcină de eveniment.
 *
 * Faţă de `PuzzleModal` (care e antrenamentul propriu-zis, cu indicii, rating şi
 * analiză) aici e varianta scurtă: rezolvi sau reîncerci, fără să-ţi mişte
 * rating-ul de puzzle-uri. Recompensa vine din eveniment, nu din exerciţiu.
 */
export function PuzzleTask({ task, slug, onSolved }: PuzzleTaskProps) {
  const { data: puzzle, isLoading } = useTaskPuzzle(task.id)
  const complete = useCompleteTask(slug)
  const { lightSquareStyle, darkSquareStyle } = useBoardTheme()

  const [result, setResult] = useState<TaskResult | null>(null)
  const [wrongFlash, setWrongFlash] = useState(false)
  // Creşte la „ia-o de la capăt" şi resetează poziţia, fără efect.
  const [attempt, setAttempt] = useState(0)

  // Poziţia de start e o funcţie pură de puzzle — deci se calculează, nu se
  // ţine în stare. Aşa dispare şi efectul care o seta la sosirea datelor.
  //
  // `attempt` nu intră aici: obiectul ăsta nu se mută niciodată (fiecare mutare
  // construieşte un `Chess` nou din FEN), deci rămâne poziţia curată. Reluarea
  // se face prin cheia sesiunii de mai jos.
  const initial = useMemo<PuzzleState | null>(() => {
    if (!puzzle) return null
    try {
      return initPuzzleState(puzzle.fen, puzzle.moves)
    } catch {
      // FEN sau soluţie invalidă în bază: mai bine fără tablă decât cu una stricată.
      return null
    }
  }, [puzzle])

  // Progresul poartă cheia poziţiei din care a pornit. Când se schimbă puzzle-ul
  // sau reiei, cheia nu mai corespunde şi revenim automat la poziţia de start —
  // fără să trebuiască să golim ceva.
  const sessionKey = puzzle ? `${puzzle.id}:${attempt}` : ''
  const [progress, setProgress] = useState<{ key: string; state: PuzzleState } | null>(null)
  const state = progress?.key === sessionKey ? progress.state : initial

  const restart = useCallback(() => {
    setAttempt(a => a + 1)
    setResult(null)
  }, [])

  const onPieceDrop = useCallback(({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
    // `targetSquare` e null când piesa e lăsată în afara tablei.
    if (!state || !targetSquare || state.status !== 'playing' || state.waitingOpponent) return false

    const expected = state.solutionMoves[state.currentMoveIdx]
    if (!expected) return false

    const played = sourceSquare + targetSquare
    // Promovarea: comparăm doar cele patru caractere de poziţie, apoi lăsăm
    // chess.js să pună regina (soluţiile de puzzle promovează în regină).
    if (!expected.startsWith(played)) {
      setWrongFlash(true)
      window.setTimeout(() => setWrongFlash(false), 600)
      return false
    }

    const next = new Chess(state.game.fen())
    const moved = next.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: expected.length > 4 ? expected[4] : undefined,
    })
    if (!moved) return false

    const idxAfterPlayer = state.currentMoveIdx + 1
    const opponentMove = state.solutionMoves[idxAfterPlayer]

    if (!opponentMove) {
      // Ultima mutare din soluţie — puzzle rezolvat.
      setProgress({
        key: sessionKey,
        state: { ...state, game: next, currentMoveIdx: idxAfterPlayer, status: 'correct' },
      })
      void complete.mutateAsync({ taskId: task.id }).then(r => {
        setResult(r)
        if (r.correct) onSolved?.(r)
      })
      return true
    }

    setProgress({
      key: sessionKey,
      state: { ...state, game: next, currentMoveIdx: idxAfterPlayer, waitingOpponent: true },
    })

    window.setTimeout(() => {
      setProgress(prev => {
        // Ai reluat sau ai plecat între timp — răspunsul adversarului nu mai are
        // unde să cadă.
        if (!prev || prev.key !== sessionKey) return prev
        const after = new Chess(prev.state.game.fen())
        after.move({
          from: opponentMove.slice(0, 2),
          to: opponentMove.slice(2, 4),
          promotion: opponentMove.length > 4 ? opponentMove[4] : undefined,
        })
        return {
          key: sessionKey,
          state: {
            ...prev.state, game: after,
            currentMoveIdx: idxAfterPlayer + 1, waitingOpponent: false,
          },
        }
      })
    }, OPPONENT_DELAY_MS)

    return true
  }, [state, sessionKey, task.id, complete, onSolved])

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner className="h-7 w-7" /></div>
  }

  if (!puzzle || !state) {
    return (
      <p className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-4 text-sm text-[#6B6B6B]">
        Nu am putut încărca un exercițiu pentru ușa asta. Încearcă mai târziu.
      </p>
    )
  }

  const solved = state.status === 'correct' || task.done
  const playerColor = state.game.turn() === 'w' ? 'white' : 'black'

  return (
    <div className="space-y-4">
      {task.prompt && <p className="text-[#A0A0A0]">{task.prompt}</p>}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        {/* Aceeaşi latură ca oriunde altundeva — vezi --board-max */}
        <div
          className="relative mx-auto w-full min-w-0"
          style={{ maxWidth: 'min(var(--board-max), 100%)' }}
        >
          <div
            className={[
              'overflow-hidden rounded-xl border-2 transition-colors',
              wrongFlash ? 'border-[#FB7185]' : solved ? 'border-[#4ade80]' : 'border-[#2A2A2A]',
            ].join(' ')}
          >
            <Chessboard
              options={{
                position: state.game.fen(),
                onPieceDrop,
                allowDragging: !solved && state.status === 'playing' && !state.waitingOpponent,
                boardOrientation: playerColor,
                boardStyle: { borderRadius: 0 },
                lightSquareStyle,
                darkSquareStyle,
              }}
            />
          </div>

          {solved && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <CheckCircle2
                className="text-[#4ade80] drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
                style={{ width: '32%', height: '32%' }}
              />
            </div>
          )}
        </div>

        <div className="w-full space-y-3 lg:w-64">
          <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-4">
            <p className="text-xs uppercase tracking-wider text-[#6B6B6B]">
              {playerColor === 'white' ? 'Albul' : 'Negrul'} mută
            </p>
            <p className="mt-1 text-sm text-[#A0A0A0]">
              {solved
                ? 'Rezolvat. Ai găsit toată secvența.'
                : 'Găsește cea mai bună mutare. Greșeala nu costă nimic.'}
            </p>

            {puzzle.themes.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {displayThemes(puzzle.themes).slice(0, 3).map(t => (
                  <Badge key={t} variant="default">{themeLabel(t)}</Badge>
                ))}
              </div>
            )}
          </div>

          {solved && result && result.xp > 0 && (
            <p className="flex items-center gap-2 text-sm font-semibold text-[#E2B340]">
              <Sparkles className="h-4 w-4" />
              +{result.xp} XP
            </p>
          )}

          {!solved && (
            <Button variant="secondary" onClick={restart} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Ia-o de la capăt
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
