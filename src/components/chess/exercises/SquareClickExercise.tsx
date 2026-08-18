import { useState } from 'react'
import { Chessboard } from 'react-chessboard'
import type { ClickSquareExercise } from '@/types'
import { RamaTablei } from './rama-tablei'
import { CULORI_TABLA } from './culori-tabla'

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
        [square]: { background: 'rgba(251,113,133, 0.5)' },
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
      <RamaTablei>
        <Chessboard
          options={{
            position: exercise.fen,
            allowDragging: false,
            onSquareClick: handleSquareClick,
            squareStyles: highlighted,
            boardStyle: { borderRadius: 0, cursor: 'pointer' },
            ...CULORI_TABLA,
          }}
        />
      </RamaTablei>

      {status === 'correct' && (
        <p className="text-sm font-medium text-[#4ade80]">Corect! Super!</p>
      )}
      {status === 'wrong' && (
        <p className="text-sm font-medium text-[#FB7185]">Încearcă din nou — uite unde e!</p>
      )}
    </div>
  )
}
