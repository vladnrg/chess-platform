import { useMemo, useState } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { ChevronLeft, ChevronRight, SkipBack, SkipForward } from 'lucide-react'
import { translateNotation } from '@/lib/chess-translations'
import { useBoardTheme } from '@/hooks/useBoardTheme'

interface OpeningBoardProps {
  /** Mutările în notaţie UCI, separate prin spaţiu: „e2e4 e7e5 g1f3". */
  moves: string
}

/** Culoarea de evidenţiere a ultimei mutări — aceeaşi cu accentul aplicaţiei. */
const LAST_MOVE_TINT = 'rgba(226, 179, 64, 0.35)'

interface Step {
  fen: string
  /** Mutarea care a dus aici, în SAN englezesc. `null` la poziţia iniţială. */
  san: string | null
  from: string | null
  to: string | null
}

/**
 * Poziţia unei deschideri, arătată pe tablă.
 *
 * Notaţia singură („1.e4 e5 2.Cf3 Cc6 3.Nb5") nu spune nimic cuiva care încă
 * n-o citeşte din cap — adică exact începătorilor şi intermediarilor pentru care
 * e făcut exerciţiul. De aici tabla, plus posibilitatea de a merge mutare cu
 * mutare: se vede cum se ajunge la poziţie, nu doar unde s-a ajuns.
 */
export function OpeningBoard({ moves }: OpeningBoardProps) {
  const { lightSquareStyle, darkSquareStyle } = useBoardTheme()

  const steps = useMemo<Step[]>(() => {
    const game = new Chess()
    const out: Step[] = [{ fen: game.fen(), san: null, from: null, to: null }]

    for (const uci of moves.split(' ').filter(Boolean)) {
      const move = game.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci.length > 4 ? uci[4] : undefined,
      })
      // O mutare invalidă în date opreşte replay-ul aici, în loc să arunce:
      // mai bine o deschidere pe jumătate decât un ecran gol.
      if (!move) break
      out.push({ fen: game.fen(), san: move.san, from: move.from, to: move.to })
    }

    return out
  }, [moves])

  const last = steps.length - 1
  // `null` = „la final". Aşa nu trebuie resetat nimic când se schimbă mutările:
  // trecerea la altă întrebare arată din nou poziţia completă.
  const [picked, setPicked] = useState<number | null>(null)
  const ply = Math.min(picked ?? last, last)
  const step = steps[ply]

  const squareStyles = useMemo(() => {
    if (!step.from || !step.to) return {}
    return {
      [step.from]: { backgroundColor: LAST_MOVE_TINT },
      [step.to]: { backgroundColor: LAST_MOVE_TINT },
    }
  }, [step])

  /** Mutările grupate pe rânduri: [numărul, albul, negrul]. */
  const rows = useMemo(() => {
    const out: { no: number; white: { san: string; ply: number } | null; black: { san: string; ply: number } | null }[] = []
    for (let i = 1; i < steps.length; i++) {
      const san = steps[i].san
      if (!san) continue
      const isWhite = i % 2 === 1
      const no = Math.ceil(i / 2)
      if (isWhite) {
        out.push({ no, white: { san, ply: i }, black: null })
      } else {
        const row = out[out.length - 1]
        if (row) row.black = { san, ply: i }
        else out.push({ no, white: null, black: { san, ply: i } })
      }
    }
    return out
  }, [steps])

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <div className="mx-auto w-full min-w-0 max-w-[22rem] sm:mx-0">
        <div className="overflow-hidden rounded-xl border border-[#2A2A2A]">
          <Chessboard
            options={{
              position: step.fen,
              allowDragging: false,
              boardStyle: { borderRadius: 0 },
              lightSquareStyle,
              darkSquareStyle,
              squareStyles,
            }}
          />
        </div>

        {/* Navigarea prin mutări */}
        <div className="mt-2 flex items-center justify-center gap-1">
          <button
            type="button"
            aria-label="La poziția inițială"
            onClick={() => setPicked(0)}
            disabled={ply === 0}
            className="rounded-lg p-2 text-[#6B6B6B] transition-colors hover:bg-[#1F1F1F] hover:text-[#F0F0F0] disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Mutarea anterioară"
            onClick={() => setPicked(Math.max(0, ply - 1))}
            disabled={ply === 0}
            className="rounded-lg p-2 text-[#6B6B6B] transition-colors hover:bg-[#1F1F1F] hover:text-[#F0F0F0] disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="min-w-16 text-center text-xs tabular-nums text-[#6B6B6B]">
            {ply} / {last}
          </span>

          <button
            type="button"
            aria-label="Mutarea următoare"
            onClick={() => setPicked(Math.min(last, ply + 1))}
            disabled={ply === last}
            className="rounded-lg p-2 text-[#6B6B6B] transition-colors hover:bg-[#1F1F1F] hover:text-[#F0F0F0] disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="La poziția finală"
            onClick={() => setPicked(last)}
            disabled={ply === last}
            className="rounded-lg p-2 text-[#6B6B6B] transition-colors hover:bg-[#1F1F1F] hover:text-[#F0F0F0] disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Notaţia, tot acolo — cine o citeşte deja n-o pierde, cine nu, o învaţă
          urmărind tabla în paralel. */}
      <div className="min-w-0 flex-1 rounded-xl border border-[#2A2A2A] bg-[#141414] p-3.5">
        <p className="mb-2 text-xs uppercase tracking-wider text-[#6B6B6B]">Mutările</p>

        <div className="space-y-0.5 font-mono text-sm">
          {rows.map(row => (
            <div key={row.no} className="flex items-baseline gap-2">
              <span className="w-6 flex-shrink-0 text-right text-xs text-[#4A4A4A]">
                {row.no}.
              </span>
              {([row.white, row.black] as const).map((half, i) =>
                half ? (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPicked(half.ply)}
                    className={[
                      'min-w-14 rounded px-1.5 py-0.5 text-left transition-colors',
                      half.ply === ply
                        ? 'bg-[rgba(226,179,64,0.18)] text-[#E2B340]'
                        : 'text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#F0F0F0]',
                    ].join(' ')}
                  >
                    {translateNotation(half.san)}
                  </button>
                ) : (
                  <span key={i} className="min-w-14" />
                )
              )}
            </div>
          ))}
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[#6B6B6B]">
          Apasă pe o mutare sau pe săgeți ca să vezi cum s-a ajuns aici.
        </p>
      </div>
    </div>
  )
}
