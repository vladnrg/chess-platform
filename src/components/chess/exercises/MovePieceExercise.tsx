import { useState } from 'react'
import { Chessboard, type PieceDropHandlerArgs } from 'react-chessboard'
import type { MovePieceExerciseData } from '@/types'
import { aplicaMutarea } from '@/lib/mutare-pe-tabla'
import { RamaTablei } from './rama-tablei'
import { CULORI_TABLA, orientareaTablei } from './culori-tabla'

interface Props {
  exercise: MovePieceExerciseData
  onCorrect: () => void
}

type Status = 'idle' | 'correct' | 'wrong' | 'alta-culoare'

/**
 * În ce se poate transforma un pion ajuns la capăt.
 *
 * Toate patru, în ordinea puterii. Regina prima fiindcă e alegerea de nouă ori
 * din zece, dar celelalte sunt acolo — asta e chiar regula pe care o predă
 * lecţia, iar dacă programul alege singur regina, regula rămâne o vorbă.
 */
const PIESE_DE_PROMOVARE = [
  { litera: 'q', nume: 'Regină', semn: '♛' },
  { litera: 'r', nume: 'Tură', semn: '♜' },
  { litera: 'b', nume: 'Nebun', semn: '♝' },
  { litera: 'n', nume: 'Cal', semn: '♞' },
] as const

export function MovePieceExerciseComponent({ exercise, onCorrect }: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [fen, setFen] = useState(exercise.fen)
  const [highlight, setHighlight] = useState<Record<string, React.CSSProperties>>({})
  /** Mutarea care aşteaptă să se aleagă piesa. */
  const [deAles, setDeAles] = useState<{ de: string; la: string } | null>(null)

  /** Cine e la mutare, după FEN. Alb, dacă nu scrie altfel. */
  const laMutare = exercise.fen.split(' ')[1] === 'b' ? 'b' : 'w'

  /** Mutarea e bună: arătăm poziţia de după şi trecem mai departe. */
  function primeste(de: string, la: string, promovare: string) {
    // Lecţia şi-a declarat mutarea aşteptată, iar ea e cea făcută: răspunsul e
    // bun, indiferent ce iese mai jos. Dacă poziţia de după nu poate fi
    // calculată, rămâne tabla dinainte — nu se transformă într-un „ai greşit".
    setFen(aplicaMutarea(exercise.fen, de, la, promovare) ?? exercise.fen)
    setStatus('correct')
    setHighlight({
      [de]: { background: 'rgba(74, 222, 128, 0.35)' },
      [la]: { background: 'rgba(74, 222, 128, 0.5)' },
    })
    setTimeout(() => onCorrect(), 700)
  }

  function onDrop({ piece, sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean {
    if (status === 'correct' || deAles) return false
    // targetSquare e null când piesa e lăsată în afara tablei — nu e o încercare greșită
    if (!targetSquare) return false

    const expectedFrom = exercise.correct_move.slice(0, 2)
    const expectedTo = exercise.correct_move.slice(2, 4)
    // „e7e8q" — ultima literă spune în ce se transforma pionul, când alegea programul
    const promovare = exercise.correct_move.slice(4) || 'q'

    if (sourceSquare === expectedFrom && targetSquare === expectedTo) {
      // Pion ajuns pe ultimul rând: alegerea e a lui, nu a noastră.
      const ePion = piece.pieceType[1]?.toLowerCase() === 'p'
      const laCapat = targetSquare[1] === (piece.pieceType[0] === 'w' ? '8' : '1')
      if (ePion && laCapat) {
        setDeAles({ de: sourceSquare, la: targetSquare })
        return false
      }
      primeste(sourceSquare, targetSquare, promovare)
      return true
    }

    // A mutat o piesă a celeilalte tabere. Se întâmplă cel mai des la rocada cu
    // negrul, unde exerciţiul dinainte cerea rocada cu albul: omul ia regele pe
    // care tocmai l-a mutat. „Nu e mutarea potrivită" nu-i spune nimic — poate
    // fi chiar mutarea potrivită, făcută cu piesa greşită.
    const eAltaCuloare = piece.pieceType[0] !== laMutare
    setStatus(eAltaCuloare ? 'alta-culoare' : 'wrong')
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
      <div className="relative">
        <RamaTablei>
          <Chessboard
            options={{
              position: fen,
              allowDragging: status !== 'correct' && !deAles,
              onPieceDrop: onDrop,
              squareStyles: highlight,
              boardStyle: { borderRadius: 0 },
              boardOrientation: orientareaTablei(exercise.fen),
              ...CULORI_TABLA,
            }}
          />
        </RamaTablei>

        {/* Alegerea piesei, peste tablă. Acoperă tabla intenţionat: până nu
            alegi, mutarea nu s-a terminat, iar un panou pe lângă tablă ar fi
            uşor de ratat exact în momentul în care e singurul lucru de făcut. */}
        {deAles && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-[#0A0A0A]/85 p-4">
            <p className="text-center text-sm font-semibold text-[#F0F0F0]">
              În ce transformi pionul?
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {PIESE_DE_PROMOVARE.map(p => (
                <button
                  key={p.litera}
                  type="button"
                  onClick={() => { primeste(deAles.de, deAles.la, p.litera); setDeAles(null) }}
                  className="flex w-20 flex-col items-center gap-1 rounded-xl border border-[#2A2A2A] bg-[#161616] px-2 py-3 transition-colors hover:border-[#E2B340] hover:bg-[#1C1C1C]"
                >
                  <span
                    className="text-3xl leading-none"
                    style={{ color: laMutare === 'b' ? '#1A1A1A' : '#F0F0F0',
                             textShadow: laMutare === 'b' ? '0 0 2px #6B6B6B' : undefined }}
                    aria-hidden
                  >
                    {p.semn}
                  </span>
                  <span className="text-xs text-[#A0A0A0]">{p.nume}</span>
                </button>
              ))}
            </div>
            <p className="max-w-xs text-center text-xs text-[#6B6B6B]">
              De obicei se alege regina, dar poţi lua oricare.
            </p>
          </div>
        )}
      </div>

      {status === 'correct' && (
        <p className="text-sm font-medium text-[#4ade80]">Mutare corectă!</p>
      )}
      {status === 'wrong' && (
        <p className="text-sm font-medium text-[#FB7185]">Nu e mutarea potrivită. Încearcă din nou!</p>
      )}
      {status === 'alta-culoare' && (
        <p className="text-sm font-medium text-[#FB7185]">
          Aici mută {laMutare === 'b' ? 'negrul' : 'albul'} — piesele lui sunt cele
          {laMutare === 'b' ? ' închise' : ' deschise'} la culoare.
        </p>
      )}
    </div>
  )
}
