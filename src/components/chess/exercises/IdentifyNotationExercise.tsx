import { useState } from 'react'
import { Chessboard } from 'react-chessboard'
import type { IdentifySquareExercise } from '@/types'

interface Props {
  exercise: IdentifySquareExercise
  onCorrect: () => void
}

export function IdentifyNotationExerciseComponent({ exercise, onCorrect }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [locked, setLocked] = useState(false)

  function handleSelect(option: string) {
    if (locked) return
    setSelected(option)
    setLocked(true)

    if (option === exercise.square) {
      setTimeout(() => onCorrect(), 700)
    } else {
      setTimeout(() => {
        setSelected(null)
        setLocked(false)
      }, 1200)
    }
  }

  function getOptionClass(option: string) {
    const base = 'rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors text-left'
    if (!selected) {
      return `${base} border-[#2A2A2A] bg-[#141414] text-[#A0A0A0] hover:border-[#E2B340] hover:text-[#F0F0F0] cursor-pointer`
    }
    if (option === exercise.square) {
      return `${base} border-[#4ade80] bg-[rgba(74,222,128,0.15)] text-[#4ade80] cursor-default`
    }
    if (option === selected && option !== exercise.square) {
      return `${base} border-[#FB7185] bg-[rgba(251,113,133,0.15)] text-[#FB7185] cursor-default`
    }
    return `${base} border-[#2A2A2A] bg-[#141414] text-[#6B6B6B] cursor-default`
  }

  const highlight = exercise.fen
    ? { [exercise.square]: { background: 'rgba(226,179,64,0.5)' } }
    : undefined

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#A0A0A0] leading-relaxed">{exercise.instruction}</p>

      {exercise.fen && (
        <div className="rounded-xl overflow-hidden border border-[#2A2A2A] pointer-events-none select-none max-w-xs">
          <Chessboard
            options={{
              position: exercise.fen,
              allowDragging: false,
              squareStyles: highlight,
              boardStyle: { borderRadius: 0 },
              darkSquareStyle: { backgroundColor: '#3A3A3A' },
              lightSquareStyle: { backgroundColor: '#f0d9b5' },
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {exercise.options.map(opt => (
          <button key={opt} className={getOptionClass(opt)} onClick={() => handleSelect(opt)}>
            {opt}
          </button>
        ))}
      </div>

      {selected && selected === exercise.square && (
        <p className="text-sm font-medium text-[#4ade80]">Corect!</p>
      )}
      {selected && selected !== exercise.square && (
        <p className="text-sm font-medium text-[#FB7185]">
          Nu chiar — răspunsul corect e <span className="font-bold">{exercise.square}</span>
        </p>
      )}
    </div>
  )
}
