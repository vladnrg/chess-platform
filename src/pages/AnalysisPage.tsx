import { useCallback, useEffect, useMemo, useState } from 'react'
import { Chess } from 'chess.js'
import { Chessboard, type PieceDropHandlerArgs } from 'react-chessboard'
import {
  SkipBack, SkipForward, ChevronLeft, ChevronRight,
  RotateCcw, FlipVertical2, Cpu,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useStockfish, type EngineLine } from '@/hooks/useStockfish'
import { useBoardTheme } from '@/hooks/useBoardTheme'
import { translateNotation } from '@/lib/chess-translations'

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
const MULTI_PV = 3
const DEPTH = 20

interface Ply {
  san: string
  from: string
  to: string
  /** Poziţia rezultată după această semi-mutare. */
  fen: string
}

/**
 * Evaluarea, mereu din perspectiva albului — ca la orice tablă de analiză.
 *
 * Motorul o dă din perspectiva celui la mutare, deci se inversează când e
 * rândul negrului. Fără asta, aceeaşi poziţie ar arăta „+2" într-o mutare şi
 * „−2" în următoarea, fără să se fi schimbat nimic.
 */
function formatEval(line: EngineLine | undefined, whiteToMove: boolean): string {
  if (!line) return '…'
  if (line.mate !== undefined) {
    const m = whiteToMove ? line.mate : -line.mate
    return `M${Math.abs(m)}${m < 0 ? '−' : ''}`
  }
  if (line.cp === undefined) return '…'
  const cp = (whiteToMove ? line.cp : -line.cp) / 100
  return `${cp > 0 ? '+' : cp < 0 ? '−' : ''}${Math.abs(cp).toFixed(1)}`
}

function evalColor(line: EngineLine | undefined, whiteToMove: boolean): string {
  if (!line) return '#6B6B6B'
  const raw = line.mate !== undefined
    ? (line.mate > 0 ? 1 : -1)
    : (line.cp ?? 0) / 100
  const forWhite = whiteToMove ? raw : -raw
  if (forWhite > 0.5) return '#4ade80'
  if (forWhite < -0.5) return '#FB7185'
  return '#A0A0A0'
}

/** Variaţia motorului, tradusă în notaţie românească, din poziţia dată. */
function lineToSan(fen: string, uciMoves: string[], max = 6): string[] {
  const game = new Chess(fen)
  const out: string[] = []
  for (const uci of uciMoves.slice(0, max)) {
    const mv = game.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: uci.length > 4 ? uci[4] : undefined,
    })
    if (!mv) break
    out.push(translateNotation(mv.san))
  }
  return out
}

/**
 * Tabla de analiză.
 *
 * Muţi liber, pentru ambele culori, iar motorul evaluează în timp real şi arată
 * primele trei continuări. E locul unde poţi verifica „dar dacă jucam aici?"
 * fără să pierzi o partidă ca să afli.
 *
 * Motorul rulează în browserul tău, nu pe server: nu costă nimic şi nu are
 * limită zilnică.
 */
export function AnalysisPage() {
  const { analyze } = useStockfish()
  const { lightSquareStyle, darkSquareStyle } = useBoardTheme()

  const [plies, setPlies] = useState<Ply[]>([])
  const [cursor, setCursor] = useState(0)          // 0 = poziţia iniţială
  const [flipped, setFlipped] = useState(false)
  const [engineOn, setEngineOn] = useState(true)
  // Rezultatele poartă poziţia din care au ieşit. Aşa cele de la poziţia
  // anterioară se ignoră singure, fără să trebuiască golite la fiecare mutare —
  // golirea ar fi însemnat `setState` sincron în efect, adică o randare în plus
  // la fiecare pas.
  const [engine, setEngine] = useState<{ fen: string; lines: EngineLine[]; depth: number }>({
    fen: '', lines: [], depth: 0,
  })

  const currentFen = cursor === 0 ? START_FEN : plies[cursor - 1].fen
  const whiteToMove = currentFen.includes(' w ')

  const fresh = engine.fen === currentFen
  const lines = fresh ? engine.lines : []
  const depth = fresh ? engine.depth : 0

  // Motorul e un sistem extern: pornim la schimbarea poziţiei şi oprim la
  // curăţare. `setState` se cheamă din callback-ul lui, nu în corpul efectului.
  useEffect(() => {
    if (!engineOn) return
    return analyze(currentFen, { multiPv: MULTI_PV, depth: DEPTH }, (ls, d) => {
      setEngine({ fen: currentFen, lines: ls, depth: d })
    })
  }, [currentFen, engineOn, analyze])

  const play = useCallback((from: string, to: string): boolean => {
    const game = new Chess(currentFen)
    let mv
    try {
      mv = game.move({ from, to, promotion: 'q' })
    } catch {
      return false
    }
    if (!mv) return false

    setPlies(prev => [
      // O mutare nouă dintr-o poziţie din trecut taie ce urma. Fără asta ar
      // rămâne în listă mutări care nu mai au legătură cu poziţia de pe tablă.
      ...prev.slice(0, cursor),
      { san: mv.san, from: mv.from, to: mv.to, fen: game.fen() },
    ])
    setCursor(c => c + 1)
    return true
  }, [currentFen, cursor])

  const onPieceDrop = useCallback(({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
    if (!targetSquare) return false     // lăsat în afara tablei
    return play(sourceSquare, targetSquare)
  }, [play])

  const squareStyles = useMemo(() => {
    if (cursor === 0) return {}
    const p = plies[cursor - 1]
    return {
      [p.from]: { backgroundColor: 'rgba(226,179,64,0.35)' },
      [p.to]: { backgroundColor: 'rgba(226,179,64,0.6)' },
    }
  }, [cursor, plies])

  /** Mutările grupate pe rânduri: [număr, alb, negru]. */
  const rows = useMemo(() => {
    const out: { no: number; white?: { san: string; ply: number }; black?: { san: string; ply: number } }[] = []
    plies.forEach((p, i) => {
      const no = Math.floor(i / 2) + 1
      if (i % 2 === 0) out.push({ no, white: { san: p.san, ply: i + 1 } })
      else {
        const row = out[out.length - 1]
        if (row) row.black = { san: p.san, ply: i + 1 }
      }
    })
    return out
  }, [plies])

  function reset() {
    setPlies([])
    setCursor(0)
  }

  const best = lines[0]

  return (
    <div className="space-y-4">
      {/* Titlul stă în bara shell-ului; aici rămâne doar subtitlul */}
      <p className="text-sm text-[#6B6B6B]">
        Mută liber, pentru ambele culori. Motorul evaluează pe loc și îți arată
        primele trei continuări — poți verifica „dar dacă jucam aici?" fără să
        pierzi o partidă ca să afli.
      </p>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        {/* Tabla */}
        <div
          className="mx-auto w-full min-w-0 xl:mx-0"
          style={{ maxWidth: 'min(var(--board-max), 100%)' }}
        >
          <div className="overflow-hidden rounded-xl border border-[#2A2A2A]">
            <Chessboard
              options={{
                position: currentFen,
                onPieceDrop,
                boardOrientation: flipped ? 'black' : 'white',
                boardStyle: { borderRadius: 0 },
                lightSquareStyle,
                darkSquareStyle,
                squareStyles,
              }}
            />
          </div>

          {/* Navigare */}
          <div className="mt-2 flex items-center gap-1">
            <NavBtn label="La început" onClick={() => setCursor(0)} disabled={cursor === 0}>
              <SkipBack className="h-4 w-4" />
            </NavBtn>
            <NavBtn label="Înapoi" onClick={() => setCursor(c => Math.max(0, c - 1))} disabled={cursor === 0}>
              <ChevronLeft className="h-4 w-4" />
            </NavBtn>
            <NavBtn label="Înainte" onClick={() => setCursor(c => Math.min(plies.length, c + 1))} disabled={cursor >= plies.length}>
              <ChevronRight className="h-4 w-4" />
            </NavBtn>
            <NavBtn label="La final" onClick={() => setCursor(plies.length)} disabled={cursor >= plies.length}>
              <SkipForward className="h-4 w-4" />
            </NavBtn>

            <span className="ml-2 text-xs tabular-nums text-[#6B6B6B]">
              {cursor} / {plies.length}
            </span>

            <div className="ml-auto flex items-center gap-1">
              <NavBtn label="Întoarce tabla" onClick={() => setFlipped(f => !f)}>
                <FlipVertical2 className="h-4 w-4" />
              </NavBtn>
              <NavBtn label="De la capăt" onClick={reset} disabled={plies.length === 0}>
                <RotateCcw className="h-4 w-4" />
              </NavBtn>
            </div>
          </div>
        </div>

        {/* Motorul */}
        <div className="w-full space-y-3 xl:w-80 xl:flex-shrink-0">
          <Card className="p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-[#6B6B6B]">
                  {whiteToMove ? 'Albul mută' : 'Negrul mută'}
                </p>
                <p
                  className="font-display text-3xl font-bold tabular-nums"
                  style={{ color: evalColor(best, whiteToMove) }}
                >
                  {engineOn ? formatEval(best, whiteToMove) : '—'}
                </p>
              </div>

              <button
                onClick={() => setEngineOn(v => !v)}
                title={engineOn ? 'Oprește motorul' : 'Pornește motorul'}
                className={[
                  'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors',
                  engineOn
                    ? 'border-[rgba(45,212,191,0.4)] bg-[rgba(45,212,191,0.1)] text-[#2DD4BF]'
                    : 'border-[#2A2A2A] text-[#6B6B6B] hover:text-[#A0A0A0]',
                ].join(' ')}
              >
                <Cpu className="h-3.5 w-3.5" />
                {engineOn ? 'Pornit' : 'Oprit'}
              </button>
            </div>

            {engineOn && (
              <p className="mb-3 text-xs text-[#6B6B6B]">
                Stockfish 18 · adâncime {depth || '…'}
              </p>
            )}

            {engineOn ? (
              <div className="space-y-1.5">
                <p className="text-xs uppercase tracking-wider text-[#6B6B6B]">
                  Cele mai bune continuări
                </p>
                {lines.length === 0 ? (
                  <p className="text-sm text-[#6B6B6B]">Se calculează…</p>
                ) : (
                  lines.map(line => {
                    const san = lineToSan(currentFen, line.pv)
                    if (san.length === 0) return null
                    return (
                      <button
                        key={line.multipv}
                        onClick={() => {
                          const uci = line.pv[0]
                          if (uci) play(uci.slice(0, 2), uci.slice(2, 4))
                        }}
                        title="Joacă prima mutare din variantă"
                        className="flex w-full items-baseline gap-2 rounded-lg border border-[#2A2A2A] bg-[#141414] px-2.5 py-2 text-left transition-colors hover:border-[#3A3A3A]"
                      >
                        <span
                          className="flex-shrink-0 rounded px-1.5 py-0.5 font-mono text-xs font-bold"
                          style={{
                            color: evalColor(line, whiteToMove),
                            backgroundColor: '#1A1A1A',
                          }}
                        >
                          {formatEval(line, whiteToMove)}
                        </span>
                        <span className="min-w-0 truncate font-mono text-sm text-[#A0A0A0]">
                          {san.join(' ')}
                        </span>
                      </button>
                    )
                  })
                )}
              </div>
            ) : (
              <p className="text-sm text-[#6B6B6B]">
                Motorul e oprit. Pornește-l ca să vezi evaluarea.
              </p>
            )}
          </Card>

          {/* Lista de mutări */}
          <Card className="p-4">
            <p className="mb-2 text-xs uppercase tracking-wider text-[#6B6B6B]">Mutările</p>
            {plies.length === 0 ? (
              <p className="text-sm text-[#6B6B6B]">
                Mută o piesă ca să începi.
              </p>
            ) : (
              <div className="max-h-64 space-y-0.5 overflow-y-auto font-mono text-sm">
                {rows.map(row => (
                  <div key={row.no} className="flex items-baseline gap-2">
                    <span className="w-7 flex-shrink-0 text-right text-xs text-[#4A4A4A]">
                      {row.no}.
                    </span>
                    {([row.white, row.black] as const).map((half, i) =>
                      half ? (
                        <button
                          key={i}
                          onClick={() => setCursor(half.ply)}
                          className={[
                            'min-w-16 rounded px-1.5 py-0.5 text-left transition-colors',
                            cursor === half.ply
                              ? 'bg-[rgba(226,179,64,0.18)] text-[#E2B340]'
                              : 'text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#F0F0F0]',
                          ].join(' ')}
                        >
                          {translateNotation(half.san)}
                        </button>
                      ) : (
                        <span key={i} className="min-w-16" />
                      )
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function NavBtn({
  children, label, onClick, disabled,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg border border-[#2A2A2A] bg-[#141414] p-2 text-[#A0A0A0] transition-colors hover:border-[#3A3A3A] hover:text-[#F0F0F0] disabled:opacity-30 disabled:hover:border-[#2A2A2A]"
    >
      {children}
    </button>
  )
}
