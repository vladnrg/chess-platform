import { useState } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import type { MovePieceExerciseData } from '@/types'

interface Props {
  exercise: MovePieceExerciseData
  onCorrect: () => void
}

type Status = 'idle' | 'correct' | 'wrong'

export function MovePieceExerciseComponent({ exercise, onCorrect }: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [fen, setFen] = useState(exercise.fen)
  const [highlight, setHighlight] = useState<Record<string, React.CSSProperties>>({})

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onDrop({ sourceSquare, targetSquare }: any): boolean {
    if (status === 'correct') return false

    const expectedFrom = exercise.correct_move.slice(0, 2)
    const expectedTo = exercise.correct_move.slice(2, 4)

    if (sourceSquare === expectedFrom && targetSquare === expectedTo) {
      try {
        const g = new Chess(exercise.fen)
        const result = g.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
        if (result) {
          setFen(g.fen())
          setStatus('correct')
          setHighlight({
            [sourceSquare]: { background: 'rgba(74, 222, 128, 0.35)' },
            [targetSquare]: { background: 'rgba(74, 222, 128, 0.5)' },
          })
          setTimeout(() => onCorrect(), 700)
          return true
        }
      } catch {
        // invalid position
      }
    }

    setStatus('wrong')
    setHighlight({
      [sourceSquare]: { background: 'rgba(251,113,133, 0.4)' },
      [targetSquare]: { background: 'rgba(251,113,133, 0.4)' },
    })
    setTimeout(() => {
      setStatus('idle')
      setHighlight({})
      setFen(exercise.fen)
    }, 1000)
    return false
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-[#A0A0A0] leading-relaxed">{exercise.instruction}</p>

      <div className="rounded-xl overflow-hidden border border-[#2A2A2A]">
        <Chessboard
          options={{
            position: fen,
            allowDragging: status !== 'correct',
            onPieceDrop: onDrop,
            squareStyles: highlight,
            boardStyle: { borderRadius: 0 },
            darkSquareStyle: { backgroundColor: '#3A3A3A' },
            lightSquareStyle: { backgroundColor: '#f0d9b5' },
          }}
        />
      </div>

      {status === 'correct' && (
        <p className="text-sm font-medium text-[#4ade80]">Mutare corectă!</p>
      )}
      {status === 'wrong' && (
        <p className="text-sm font-medium text-[#FB7185]">Nu e mutarea potrivită. Încearcă din nou!</p>
      )}
    </div>
  )
}
