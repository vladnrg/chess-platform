import { useState } from 'react'
import { Chessboard, type PieceDropHandlerArgs } from 'react-chessboard'
import type { MovePieceExerciseData } from '@/types'
import { aplicaMutarea } from '@/lib/mutare-pe-tabla'
import { RamaTablei } from './rama-tablei'
import { CULORI_TABLA } from './culori-tabla'

interface Props {
  exercise: MovePieceExerciseData
  onCorrect: () => void
}

type Status = 'idle' | 'correct' | 'wrong'

export function MovePieceExerciseComponent({ exercise, onCorrect }: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [fen, setFen] = useState(exercise.fen)
  const [highlight, setHighlight] = useState<Record<string, React.CSSProperties>>({})

  function onDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean {
    if (status === 'correct') return false
    // targetSquare e null când piesa e lăsată în afara tablei — nu e o încercare greșită
    if (!targetSquare) return false

    const expectedFrom = exercise.correct_move.slice(0, 2)
    const expectedTo = exercise.correct_move.slice(2, 4)
    // „e7e8q" — ultima literă spune în ce se transformă pionul
    const promovare = exercise.correct_move.slice(4) || 'q'

    if (sourceSquare === expectedFrom && targetSquare === expectedTo) {
      // Lecţia şi-a declarat mutarea aşteptată, iar ea e cea făcută: răspunsul e
      // bun, indiferent ce iese mai jos. Dacă poziţia de după nu poate fi
      // calculată, rămâne tabla dinainte — nu se transformă într-un „ai greşit".
      setFen(aplicaMutarea(exercise.fen, sourceSquare, targetSquare, promovare) ?? exercise.fen)
      setStatus('correct')
      setHighlight({
        [sourceSquare]: { background: 'rgba(74, 222, 128, 0.35)' },
        [targetSquare]: { background: 'rgba(74, 222, 128, 0.5)' },
      })
      setTimeout(() => onCorrect(), 700)
      return true
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
      <RamaTablei>
        <Chessboard
          options={{
            position: fen,
            allowDragging: status !== 'correct',
            onPieceDrop: onDrop,
            squareStyles: highlight,
            boardStyle: { borderRadius: 0 },
            ...CULORI_TABLA,
          }}
        />
      </RamaTablei>

      {status === 'correct' && (
        <p className="text-sm font-medium text-[#4ade80]">Mutare corectă!</p>
      )}
      {status === 'wrong' && (
        <p className="text-sm font-medium text-[#FB7185]">Nu e mutarea potrivită. Încearcă din nou!</p>
      )}
    </div>
  )
}
