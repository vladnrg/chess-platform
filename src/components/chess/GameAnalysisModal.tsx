import { useState, useCallback, useRef } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { X, ChevronLeft, ChevronRight, Zap, Brain, ArrowLeft, Loader2 } from 'lucide-react'
import { useStockfish, type PositionEval } from '@/hooks/useStockfish'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import type { LichessGame } from './GameListModal'

interface Props {
  game: LichessGame
  lichessUsername: string
  playerColor: 'white' | 'black'
  onClose: () => void
  onBack: () => void
}

type MoveQuality = 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder'

function getQuality(drop: number): MoveQuality {
  if (drop < 20) return 'best'
  if (drop < 50) return 'good'
  if (drop < 100) return 'inaccuracy'
  if (drop < 200) return 'mistake'
  return 'blunder'
}

const QUALITY_COLOR: Record<MoveQuality, string> = {
  best: '#4ade80',
  good: '#a0a0a0',
  inaccuracy: '#fbbf24',
  mistake: '#f97316',
  blunder: '#f87171',
}

const QUALITY_LABEL: Record<MoveQuality, string> = {
  best: 'Mutare bună',
  good: 'OK',
  inaccuracy: 'Imprecizie',
  mistake: 'Greșeală',
  blunder: 'Gafă',
}

function cpToBar(cp: number): number {
  // Map centipawns to 0-100 for eval bar (50 = equal)
  const clamped = Math.max(-1000, Math.min(1000, cp))
  return 50 + (clamped / 1000) * 45
}

export function GameAnalysisModal({ game, lichessUsername, playerColor, onClose, onBack }: Props) {
  const { user } = useAuth()
  const { analyzePositions } = useStockfish()

  // Parse game moves
  const sanMoves = (game.moves ?? '').split(' ').filter(Boolean)
  const positions = (() => {
    const g = new Chess()
    const fens: string[] = [g.fen()]
    const ucis: string[] = []
    for (const san of sanMoves) {
      try {
        const r = g.move(san)
        if (!r) break
        fens.push(g.fen())
        ucis.push(r.from + r.to + (r.promotion ?? ''))
      } catch { break }
    }
    return { fens, ucis, sans: sanMoves.slice(0, ucis.length) }
  })()

  const [cursor, setCursor] = useState(positions.fens.length - 1)
  const [evals, setEvals] = useState<PositionEval[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeProgress, setAnalyzeProgress] = useState(0)
  const [aiExplanations, setAiExplanations] = useState<Record<number, string>>({})
  const [loadingExplanation, setLoadingExplanation] = useState<number | null>(null)
  const moveListRef = useRef<HTMLDivElement>(null)

  const currentFen = positions.fens[cursor]
  const isPlayerMove = (idx: number) => {
    const isWhiteMove = idx % 2 === 0
    return playerColor === 'white' ? isWhiteMove : !isWhiteMove
  }

  // Last move highlight
  const squareStyles: Record<string, React.CSSProperties> = {}
  if (cursor > 0) {
    const g = new Chess(positions.fens[cursor - 1])
    const r = g.move(positions.sans[cursor - 1])
    if (r) {
      squareStyles[r.from] = { backgroundColor: 'rgba(200,168,75,0.25)' }
      squareStyles[r.to] = { backgroundColor: 'rgba(200,168,75,0.4)' }
    }
  }

  // Mark worst mistake square
  if (evals.length > 0 && cursor > 0 && cursor <= evals.length) {
    const ev = evals[cursor - 1]
    const quality = getQuality(ev.drop)
    if (quality !== 'best' && quality !== 'good') {
      const g = new Chess(positions.fens[cursor - 1])
      const r = g.move(positions.sans[cursor - 1])
      if (r) {
        squareStyles[r.to] = {
          backgroundColor: QUALITY_COLOR[quality] + '40',
          boxShadow: `inset 0 0 0 3px ${QUALITY_COLOR[quality]}`,
        }
      }
    }
  }

  const runAnalysis = useCallback(async () => {
    setAnalyzing(true)
    setAnalyzeProgress(0)
    const pairs = positions.fens.slice(0, -1).map((fen, i) => ({
      fen,
      played: positions.ucis[i],
    }))
    const results = await analyzePositions(pairs, setAnalyzeProgress)
    setEvals(results)
    setAnalyzing(false)
  }, [analyzePositions, positions])

  const askExplanation = useCallback(async (moveIdx: number) => {
    if (!user || loadingExplanation !== null) return
    const ev = evals[moveIdx]
    if (!ev) return
    setLoadingExplanation(moveIdx)
    try {
      const played = positions.sans[moveIdx] ?? '?'
      const g = new Chess(ev.fen)
      let bestSan = ev.best
      try {
        const r = g.move({ from: ev.best.slice(0, 2), to: ev.best.slice(2, 4), promotion: ev.best[4] })
        if (r) bestSan = r.san
      } catch { /* keep uci */ }

      const { data } = await supabase.functions.invoke('ai-coach', {
        body: {
          fen: ev.fen,
          question: `Jucătorul a jucat ${played}. Evaluarea a scăzut cu ${ev.drop} centipawni. Mutarea mai bună era ${bestSan}. De ce este ${played} o greșeală și cum ar fi trebuit jucătorul să gândească în această poziție?`,
          context: `Analiza partidei. Jucătorul conduce cu ${playerColor === 'white' ? 'Albul' : 'Negrul'}.`,
          userId: user.id,
        },
      })
      if (data?.answer) {
        setAiExplanations(prev => ({ ...prev, [moveIdx]: data.answer }))
      }
    } finally {
      setLoadingExplanation(null)
    }
  }, [user, evals, positions, playerColor, loadingExplanation])

  const evalBar = evals[cursor - 1]?.cp ?? 0
  const barPct = cpToBar(evalBar)

  const opponentName =
    playerColor === 'white'
      ? (game.players.black.userId ?? '?')
      : (game.players.white.userId ?? '?')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 md:p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-5xl max-h-[96vh] rounded-2xl bg-[#111] border border-[#2a2a2a] shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e1e1e] flex-shrink-0">
          <button onClick={onBack} className="text-[#555] hover:text-[#f0f0f0] transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#f0f0f0] truncate">
              {lichessUsername} vs {opponentName}
            </p>
            <p className="text-xs text-[#555]">
              {game.opening?.name ?? 'Unknown'} · {game.perf}
            </p>
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-[#f0f0f0] transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main layout */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Eval bar + board */}
          <div className="flex flex-shrink-0">
            {/* Eval bar */}
            {evals.length > 0 && (
              <div className="w-4 flex flex-col bg-[#0d0d0d] relative">
                <div
                  className="absolute left-0 right-0 top-0 bg-[#f0f0f0] transition-all duration-300"
                  style={{ height: `${100 - barPct}%` }}
                />
                <div
                  className="absolute left-0 right-0 bottom-0 bg-[#1a1a1a] transition-all duration-300"
                  style={{ height: `${barPct}%` }}
                />
                <div className="absolute inset-x-0 top-1/2 h-px bg-[#333]" />
              </div>
            )}
            {/* Board */}
            <div className="w-[340px] md:w-[420px] flex-shrink-0">
              <Chessboard
                options={{
                  position: currentFen,
                  boardOrientation: playerColor,
                  allowDragging: false,
                  squareStyles,
                  darkSquareStyle: { backgroundColor: '#3d5c3a' },
                  lightSquareStyle: { backgroundColor: '#c8e6c0' },
                }}
              />
            </div>
          </div>

          {/* Right panel */}
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            {/* Navigation controls */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e1e1e] flex-shrink-0">
              <button
                onClick={() => setCursor(0)}
                disabled={cursor === 0}
                className="text-[#555] hover:text-[#f0f0f0] disabled:opacity-30 transition-colors p-1"
              >
                |◀
              </button>
              <button
                onClick={() => setCursor(c => Math.max(0, c - 1))}
                disabled={cursor === 0}
                className="text-[#555] hover:text-[#f0f0f0] disabled:opacity-30 transition-colors p-1"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-[#555] flex-1 text-center">
                {cursor === 0 ? 'Start' : `Mutarea ${cursor}`}
              </span>
              <button
                onClick={() => setCursor(c => Math.min(positions.fens.length - 1, c + 1))}
                disabled={cursor === positions.fens.length - 1}
                className="text-[#555] hover:text-[#f0f0f0] disabled:opacity-30 transition-colors p-1"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCursor(positions.fens.length - 1)}
                disabled={cursor === positions.fens.length - 1}
                className="text-[#555] hover:text-[#f0f0f0] disabled:opacity-30 transition-colors p-1"
              >
                ▶|
              </button>
            </div>

            {/* Analyze button */}
            <div className="px-4 py-3 border-b border-[#1e1e1e] flex-shrink-0">
              {!analyzing && evals.length === 0 ? (
                <button
                  onClick={runAnalysis}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-[rgba(200,168,75,0.1)] border border-[rgba(200,168,75,0.3)] px-4 py-2.5 text-sm font-semibold text-[#c8a84b] hover:bg-[rgba(200,168,75,0.2)] transition-colors"
                >
                  <Zap className="h-4 w-4" />
                  Analizează greșelile cu Dl. En Passant
                </button>
              ) : analyzing ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-[#555]">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Analizez poziția {Math.round(analyzeProgress * positions.fens.length / 100)}/{positions.fens.length - 1}...
                    </span>
                    <span>{analyzeProgress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#1e1e1e] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#c8a84b] transition-all duration-200"
                      style={{ width: `${analyzeProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#4ade80]">Analiză completă</span>
                  <span className="text-[#555]">
                    {evals.filter(e => getQuality(e.drop) === 'blunder').length} gafe ·{' '}
                    {evals.filter(e => getQuality(e.drop) === 'mistake').length} greșeli ·{' '}
                    {evals.filter(e => getQuality(e.drop) === 'inaccuracy').length} imprecizii
                  </span>
                </div>
              )}
            </div>

            {/* Move list */}
            <div ref={moveListRef} className="flex-1 overflow-y-auto p-3 space-y-0.5">
              {positions.sans.map((san, i) => {
                const ev = evals[i]
                const quality = ev ? getQuality(ev.drop) : null
                const isActive = cursor === i + 1
                const isPlayerTurn = isPlayerMove(i)
                const hasExplanation = !!aiExplanations[i]
                const isLoadingThis = loadingExplanation === i

                return (
                  <div key={i}>
                    <div className="flex items-center gap-1">
                      {i % 2 === 0 && (
                        <span className="text-xs text-[#444] w-6 flex-shrink-0 font-mono">
                          {Math.floor(i / 2) + 1}.
                        </span>
                      )}
                      <button
                        onClick={() => setCursor(i + 1)}
                        className={cn(
                          'flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-mono transition-colors flex-1',
                          isActive
                            ? 'bg-[#c8a84b] text-black font-bold'
                            : 'hover:bg-[#1a1a1a] text-[#a0a0a0]'
                        )}
                      >
                        {quality && quality !== 'best' && quality !== 'good' && (
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: QUALITY_COLOR[quality] }}
                            title={QUALITY_LABEL[quality]}
                          />
                        )}
                        <span>{san}</span>
                        {quality && quality !== 'best' && quality !== 'good' && isPlayerTurn && (
                          <span
                            className="text-[10px] ml-auto"
                            style={{ color: QUALITY_COLOR[quality] }}
                          >
                            {QUALITY_LABEL[quality]}
                          </span>
                        )}
                      </button>

                      {/* Ask Dl. En Passant button for player's mistakes */}
                      {ev && isPlayerTurn && (quality === 'mistake' || quality === 'blunder' || quality === 'inaccuracy') && (
                        <button
                          onClick={() => void askExplanation(i)}
                          disabled={isLoadingThis || loadingExplanation !== null}
                          className="flex-shrink-0 rounded-md p-1 text-[#c8a84b] hover:bg-[rgba(200,168,75,0.1)] disabled:opacity-40 transition-colors"
                          title="Explică Dl. En Passant"
                        >
                          {isLoadingThis
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <Brain className="h-3 w-3" />
                          }
                        </button>
                      )}
                    </div>

                    {/* AI explanation */}
                    {hasExplanation && (
                      <div className="mx-1 mb-1 rounded-lg bg-[rgba(200,168,75,0.07)] border border-[rgba(200,168,75,0.2)] p-3 text-xs text-[#c0a060] leading-relaxed">
                        <div className="flex items-center gap-1.5 mb-1.5 text-[#c8a84b] font-semibold">
                          <Brain className="h-3 w-3" />
                          Dl. En Passant
                        </div>
                        {aiExplanations[i]}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
