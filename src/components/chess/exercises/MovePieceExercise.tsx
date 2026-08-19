import { useState } from 'react'
import { Chessboard, defaultPieces, type PieceDropHandlerArgs } from 'react-chessboard'
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
 *
 * `litera` e cea din notaţia mutării (`e7e8q`), `simbol` e cheia sub care
 * react-chessboard ţine desenul piesei.
 */
const PIESE_DE_PROMOVARE = [
  { litera: 'q', nume: 'regină', simbol: 'Q' },
  { litera: 'r', nume: 'tură', simbol: 'R' },
  { litera: 'b', nume: 'nebun', simbol: 'B' },
  { litera: 'n', nume: 'cal', simbol: 'N' },
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
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-[#0A0A0A]/85 p-4">
            <div className="flex flex-wrap justify-center gap-2">
              {PIESE_DE_PROMOVARE.map(p => {
                // Chiar desenul folosit pe tablă, cerut de la bibliotecă. Un set
                // propriu ar fi însemnat că piesa aleasă arată altfel decât cea
                // care apare o clipă mai târziu pe pătrat.
                const Deseneaza = defaultPieces[`${laMutare}${p.simbol}`]
                return (
                  <button
                    key={p.litera}
                    type="button"
                    onClick={() => { primeste(deAles.de, deAles.la, p.litera); setDeAles(null) }}
                    aria-label={p.nume}
                    title={p.nume}
                    className="flex h-16 w-16 items-center justify-center rounded-xl border border-[#2A2A2A] bg-[#161616] p-1.5 transition-colors hover:border-[#E2B340] hover:bg-[#1C1C1C]"
                  >
                    <Deseneaza />
                  </button>
                )
              })}
            </div>
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
