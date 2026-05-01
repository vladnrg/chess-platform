import { useState, useCallback, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { OpeningLine } from '@/types'

// Part boundaries (ply indices): Part1 = 0-9, Part2 = 10-15, Part3 = 16+
const PART_ENDS = [10, 16]

function getPartEnd(totalPlies: number, part: number): number {
  if (part === 1) return Math.min(PART_ENDS[0], totalPlies)
  if (part === 2) return Math.min(PART_ENDS[1], totalPlies)
  return totalPlies
}

function getTotalParts(totalPlies: number): number {
  if (totalPlies > PART_ENDS[1]) return 3
  if (totalPlies > PART_ENDS[0]) return 2
  return 1
}

function isUserPly(plyIdx: number, userColor: 'white' | 'black'): boolean {
  return userColor === 'white' ? plyIdx % 2 === 0 : plyIdx % 2 === 1
}

type TrainerStatus =
  | 'user-turn'
  | 'computer-thinking'
  | 'wrong'
  | 'part-done'
  | 'line-done'

interface TrainerState {
  game: Chess
  plyIdx: number
  part: number
  partEnd: number
  status: TrainerStatus
  wrongFrom: string | null
  wrongTo: string | null
}

function buildInitialState(line: OpeningLine): TrainerState {
  const moves = line.moves_uci.split(' ')
  const partEnd = getPartEnd(moves.length, 1)
  return {
    game: new Chess(),
    plyIdx: 0,
    part: 1,
    partEnd,
    status: isUserPly(0, line.user_color) ? 'user-turn' : 'computer-thinking',
    wrongFrom: null,
    wrongTo: null,
  }
}

const PART_LABELS = ['Primele 5 mutări', 'Următoarele 5 mutări', 'Pre-Middlegame']

interface Props {
  mode: 'guided' | 'practice'
}

export function OpeningTrainerPage({ mode }: Props) {
  const { slug, lineId } = useParams<{ slug: string; lineId: string }>()
  const isGuided = mode === 'guided'

  const { data: line, isLoading } = useQuery({
    queryKey: ['opening-line', lineId],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('opening_lines')
        .select('*')
        .eq('id', lineId!)
        .single()
      return data as OpeningLine
    },
    enabled: !!lineId,
  })

  const [state, setState] = useState<TrainerState | null>(null)

  useEffect(() => {
    if (!line) return
    setState(buildInitialState(line))
  }, [line])

  // Auto-play computer moves
  useEffect(() => {
    if (!state || !line || state.status !== 'computer-thinking') return
    const moves = line.moves_uci.split(' ')
    if (state.plyIdx >= state.partEnd || state.plyIdx >= moves.length) return

    const timer = setTimeout(() => {
      const uciMove = moves[state.plyIdx]
      const gameCopy = new Chess(state.game.fen())
      try {
        gameCopy.move({
          from: uciMove.slice(0, 2),
          to: uciMove.slice(2, 4),
          promotion: uciMove[4] ?? undefined,
        })
        const nextPly = state.plyIdx + 1
        let nextStatus: TrainerStatus
        if (nextPly >= state.partEnd) {
          nextStatus = state.partEnd >= moves.length ? 'line-done' : 'part-done'
        } else {
          nextStatus = isUserPly(nextPly, line.user_color) ? 'user-turn' : 'computer-thinking'
        }
        setState(s => s ? { ...s, game: gameCopy, plyIdx: nextPly, status: nextStatus } : null)
      } catch {
        // invalid move in seed data — skip silently
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [state?.status, state?.plyIdx, line])

  // Auto-clear wrong feedback after 1.2s in practice mode
  useEffect(() => {
    if (!state || state.status !== 'wrong') return
    const timer = setTimeout(() => {
      setState(s => s ? { ...s, status: 'user-turn', wrongFrom: null, wrongTo: null } : null)
    }, 1200)
    return () => clearTimeout(timer)
  }, [state?.status])

  const handlePieceDrop = useCallback(
    ({ sourceSquare: from, targetSquare: to }: any): boolean => {
      if (!state || !line || state.status !== 'user-turn') return false
      const moves = line.moves_uci.split(' ')
      const expected = moves[state.plyIdx]
      if (!expected) return false

      const myMove = from + to

      if (myMove !== expected.slice(0, 4)) {
        if (!isGuided) {
          setState(s => s ? { ...s, status: 'wrong', wrongFrom: from, wrongTo: to } : null)
        }
        return false
      }

      const gameCopy = new Chess(state.game.fen())
      try {
        gameCopy.move({ from, to, promotion: expected[4] ?? 'q' })
      } catch {
        return false
      }

      const nextPly = state.plyIdx + 1
      let nextStatus: TrainerStatus
      if (nextPly >= state.partEnd) {
        nextStatus = state.partEnd >= moves.length ? 'line-done' : 'part-done'
      } else {
        nextStatus = isUserPly(nextPly, line.user_color) ? 'user-turn' : 'computer-thinking'
      }

      setState(s => s
        ? { ...s, game: gameCopy, plyIdx: nextPly, status: nextStatus, wrongFrom: null, wrongTo: null }
        : null)
      return true
    },
    [state, line, isGuided]
  )

  function advancePart() {
    if (!state || !line) return
    const moves = line.moves_uci.split(' ')
    const nextPart = state.part + 1
    const nextPartEnd = getPartEnd(moves.length, nextPart)
    const nextPly = state.plyIdx
    const nextStatus: TrainerStatus = isUserPly(nextPly, line.user_color) ? 'user-turn' : 'computer-thinking'
    setState(s => s
      ? { ...s, part: nextPart, partEnd: nextPartEnd, status: nextStatus, wrongFrom: null, wrongTo: null }
      : null)
  }

  function resetLine() {
    if (!line) return
    setState(buildInitialState(line))
  }

  function handleMiddlegame() {
    toast('Analizele de Middlegame sunt în pregătire — revino curând!', { icon: '🔥' })
  }

  if (isLoading || !state) {
    return <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
  }
  if (!line) {
    return <p className="text-[#666]">Varianta nu a fost găsită.</p>
  }

  const moves = line.moves_uci.split(' ')
  const totalParts = getTotalParts(moves.length)
  const progressPct = moves.length > 0 ? (state.plyIdx / moves.length) * 100 : 0

  // Current explanation (for whichever ply is being played now)
  const explanation = line.move_explanations?.[String(state.plyIdx)] ?? ''

  // Square highlights
  const squareStyles: Record<string, React.CSSProperties> = {}
  if (state.status === 'user-turn') {
    const nextMove = moves[state.plyIdx]
    if (isGuided && nextMove) {
      squareStyles[nextMove.slice(0, 2)] = { backgroundColor: 'rgba(200,168,75,0.65)' }
      squareStyles[nextMove.slice(2, 4)] = { backgroundColor: 'rgba(200,168,75,0.35)' }
    }
  }
  if (state.wrongFrom) {
    squareStyles[state.wrongFrom] = { backgroundColor: 'rgba(248,113,113,0.55)' }
  }
  if (state.wrongTo) {
    squareStyles[state.wrongTo] = { backgroundColor: 'rgba(248,113,113,0.30)' }
  }

  const isPlaying = state.status === 'user-turn' || state.status === 'computer-thinking' || state.status === 'wrong'

  return (
    <div className="max-w-4xl space-y-4">
      {/* Back */}
      <Link
        to={`/courses/${slug}`}
        className="flex items-center gap-1.5 text-sm text-[#a0a0a0] hover:text-[#f0f0f0] transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Înapoi la curs
      </Link>

      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#f0f0f0]">{line.variation_name}</h1>
          <p className="text-sm text-[#666] mt-0.5">
            {isGuided ? 'Mod ghidat' : 'Pe cont propriu'}
            {isPlaying && (
              <> · <span className="text-[#a0a0a0]">Partea {state.part} din {totalParts}</span></>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs font-medium px-2 py-1 rounded-full border ${
            line.user_color === 'white'
              ? 'bg-[#f0f0f0] text-black border-[#f0f0f0]'
              : 'bg-[#1a1a1a] text-[#f0f0f0] border-[#444]'
          }`}>
            {line.user_color === 'white' ? '♔ Alb' : '♚ Negru'}
          </span>
          <button
            onClick={resetLine}
            title="Reia de la început"
            className="p-1.5 text-[#444] hover:text-[#a0a0a0] transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#c8a84b] rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Board — always visible */}
        <div className="lg:col-span-2">
          <div className="rounded-xl overflow-hidden border border-[#2a2a2a]">
            <Chessboard
              options={{
                position: state.game.fen(),
                onPieceDrop: handlePieceDrop,
                allowDragging: state.status === 'user-turn',
                boardOrientation: line.user_color === 'white' ? 'white' : 'black',
                squareStyles,
                boardStyle: { borderRadius: 0 },
                darkSquareStyle: { backgroundColor: '#3d3d3d' },
                lightSquareStyle: { backgroundColor: '#f0d9b5' },
              }}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Status + explanation card */}
          <div className="rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] p-4">
            {state.status === 'user-turn' && (
              <div>
                <p className="text-xs font-semibold text-[#c8a84b] uppercase tracking-wider mb-2">
                  Mutarea ta
                </p>
                {isGuided ? (
                  <p className="text-sm text-[#a0a0a0]">
                    Mută piesa de pe pătratul auriu pe destinație.
                  </p>
                ) : (
                  <p className="text-sm text-[#a0a0a0]">
                    Gândește-te la teoria opening-ului și mută.
                  </p>
                )}
                {isGuided && explanation && (
                  <div className="mt-3 pt-3 border-t border-[#2a2a2a]">
                    <p className="text-xs text-[#888] leading-relaxed">{explanation}</p>
                  </div>
                )}
              </div>
            )}
            {state.status === 'computer-thinking' && (
              <div>
                <p className="text-xs font-semibold text-[#666] uppercase tracking-wider mb-2">
                  Adversarul mută
                </p>
                <p className="text-sm text-[#a0a0a0]">Calculez răspunsul teoretic...</p>
                {isGuided && explanation && (
                  <div className="mt-3 pt-3 border-t border-[#2a2a2a]">
                    <p className="text-xs text-[#888] leading-relaxed">{explanation}</p>
                  </div>
                )}
              </div>
            )}
            {state.status === 'wrong' && (
              <div>
                <p className="text-xs font-semibold text-[#f87171] uppercase tracking-wider mb-2">
                  Mutare greșită
                </p>
                <p className="text-sm text-[#a0a0a0]">
                  Aceasta nu este mutarea din teorie. Gândește-te din nou.
                </p>
              </div>
            )}
            {(state.status === 'part-done' || state.status === 'line-done') && (
              <div>
                <p className="text-xs font-semibold text-[#4ade80] uppercase tracking-wider mb-2">
                  {state.status === 'line-done' ? 'Variantă completă' : 'Fază completă'}
                </p>
                <p className="text-sm text-[#a0a0a0]">
                  {state.status === 'line-done'
                    ? 'Ai parcurs toate mutările din această variantă.'
                    : 'Excelent! Ai finalizat această parte a opening-ului.'}
                </p>
              </div>
            )}
          </div>

          {/* Parts tracker */}
          <div className="rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] p-4">
            <p className="text-xs text-[#666] uppercase tracking-wider mb-3">Progres Variație</p>
            <div className="space-y-2.5">
              {Array.from({ length: totalParts }).map((_, i) => {
                const partNum = i + 1
                const isDone = state.part > partNum || state.status === 'line-done'
                const isCurrent = state.part === partNum && state.status !== 'line-done'
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-2.5 text-sm ${
                      isDone ? 'text-[#4ade80]' : isCurrent ? 'text-[#f0f0f0]' : 'text-[#3a3a3a]'
                    }`}
                  >
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isDone
                        ? 'bg-[#4ade80] text-black'
                        : isCurrent
                        ? 'bg-[#c8a84b] text-black'
                        : 'bg-[#222] text-[#3a3a3a]'
                    }`}>
                      {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : partNum}
                    </div>
                    <span>{PART_LABELS[i]}</span>
                  </div>
                )
              })}
            </div>

            {/* Part-done CTA — inline, not fullscreen */}
            {state.status === 'part-done' && (
              <button
                onClick={advancePart}
                className="mt-4 w-full flex items-center justify-between gap-2 rounded-lg border border-[rgba(200,168,75,0.3)] bg-[rgba(200,168,75,0.08)] px-3 py-2.5 text-sm text-[#c8a84b] hover:bg-[rgba(200,168,75,0.14)] transition-colors"
              >
                <span>Ești gata de următoarea fază a opening-ului?</span>
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              </button>
            )}

            {/* Line-done CTAs */}
            {state.status === 'line-done' && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-[#4ade80] font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  Opening parcurs cu succes!
                </div>
                <button
                  onClick={handleMiddlegame}
                  className="w-full flex items-center justify-between gap-2 rounded-lg border border-[rgba(200,168,75,0.3)] bg-[rgba(200,168,75,0.08)] px-3 py-2.5 text-sm text-[#c8a84b] hover:bg-[rgba(200,168,75,0.14)] transition-colors"
                >
                  <span>Parcurge ideile din Middlegame</span>
                  <ChevronRight className="h-4 w-4 flex-shrink-0" />
                </button>
                <div className="flex gap-2 pt-1">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={resetLine}>
                    Repetă
                  </Button>
                  {isGuided && (
                    <Link to={`/courses/${slug}/practice/${lineId}`} className="flex-1">
                      <Button size="sm" className="w-full">Pe cont propriu</Button>
                    </Link>
                  )}
                  {!isGuided && (
                    <Link to={`/courses/${slug}`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full">Alte variante</Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mode switcher */}
          <div className="rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] p-4">
            <p className="text-xs text-[#666] uppercase tracking-wider mb-2">Antrenează-te</p>
            <div className="space-y-1">
              <Link
                to={`/courses/${slug}/guided/${lineId}`}
                className={`block text-sm px-3 py-2 rounded-lg transition-colors ${
                  isGuided
                    ? 'bg-[rgba(200,168,75,0.15)] text-[#c8a84b]'
                    : 'text-[#666] hover:text-[#a0a0a0] hover:bg-[#222]'
                }`}
              >
                Ghidat — vreau indicații vizuale
              </Link>
              <Link
                to={`/courses/${slug}/practice/${lineId}`}
                className={`block text-sm px-3 py-2 rounded-lg transition-colors ${
                  !isGuided
                    ? 'bg-[rgba(200,168,75,0.15)] text-[#c8a84b]'
                    : 'text-[#666] hover:text-[#a0a0a0] hover:bg-[#222]'
                }`}
              >
                Pe cont propriu — vreau să mă testez
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
