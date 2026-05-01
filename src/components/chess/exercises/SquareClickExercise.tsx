import { useState } from 'react'
import { Chessboard } from 'react-chessboard'
import type { ClickSquareExercise } from '@/types'

interface Props {
  exercise: ClickSquareExercise
  onCorrect: () => void
}

type Status = 'idle' | 'correct' | 'wrong'

export function SquareClickExerciseComponent({ exercise, onCorrect }: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [highlighted, setHighlighted] = useState<Record<string, React.CSSProperties>>({})

  function handleSquareClick({ square }: { square: string }) {
    if (status === 'correct') return

    if (square === exercise.target) {
      setStatus('correct')
      setHighlighted({ [square]: { background: 'rgba(74, 222, 128, 0.5)' } })
      setTimeout(() => onCorrect(), 700)
    } else {
      setStatus('wrong')
      setHighlighted({
        [square]: { background: 'rgba(248, 113, 113, 0.5)' },
        [exercise.target]: { background: 'rgba(74, 222, 128, 0.3)' },
      })
      setTimeout(() => {
        setStatus('idle')
        setHighlighted({})
      }, 1200)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-[#a0a0a0] leading-relaxed">{exercise.instruction}</p>

      <div className="rounded-xl overflow-hidden border border-[#2a2a2a] select-none">
        <Chessboard
          options={{
            position: exercise.fen,
            allowDragging: false,
            onSquareClick: handleSquareClick,
            squareStyles: highlighted,
            boardStyle: { borderRadius: 0, cursor: 'pointer' },
            darkSquareStyle: { backgroundColor: '#3d3d3d' },
            lightSquareStyle: { backgroundColor: '#f0d9b5' },
          }}
        />
      </div>

      {status === 'correct' && (
        <p className="text-sm font-medium text-[#4ade80]">Corect! Super!</p>
      )}
      {status === 'wrong' && (
        <p className="text-sm font-medium text-[#f87171]">Încearcă din nou — uite unde e!</p>
      )}
    </div>
  )
}
