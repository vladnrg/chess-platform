import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { CheckCircle2, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { fetchLichessPuzzleNext, eloToDifficulty } from '@/lib/lichess'
import { initPuzzleState, lichessPuzzleToLocal, type PuzzleState } from '@/lib/puzzle-utils'
import {
  placementTargets, computePlacementRating, placementToStoredRating,
  bandForRating, type PlacementResult,
} from '@/lib/puzzle-rating'
import { Progress } from '@/components/ui/Progress'
import { Spinner } from '@/components/ui/Spinner'
import type { Puzzle } from '@/types'

// Alege 20 de puzzle-uri progresiv mai grele, cât mai aproape de țintele 450→2550.
async function buildPlacementSet(): Promise<Puzzle[]> {
  const targets = placementTargets()
  const { data } = await supabase.from('puzzles').select('*').gte('rating', 350).lte('rating', 2650)
  const pool = (data ?? []) as Puzzle[]

  const used = new Set<string>()
  const chosen: Puzzle[] = []

  for (const t of targets) {
    let best: Puzzle | null = null
    let bestD = Infinity
    for (const p of pool) {
      if (used.has(p.id)) continue
      const d = Math.abs(p.rating - t)
      if (d < bestD) { bestD = d; best = p }
    }
    if (best && bestD <= 200) {
      used.add(best.id)
      chosen.push(best)
      continue
    }
    // Lacună în baza locală → completăm de la Lichess
    try {
      const lp = await fetchLichessPuzzleNext(eloToDifficulty(t))
      const pz = lichessPuzzleToLocal(lp)
      if (!used.has(pz.id)) {
        await supabase.from('puzzles').upsert(
          { id: pz.id, fen: pz.fen, moves: pz.moves, rating: pz.rating, themes: pz.themes, game_url: pz.game_url },
          { onConflict: 'id' },
        )
        used.add(pz.id)
        chosen.push(pz)
      }
    } catch { /* sărim ținta */ }
  }
  return chosen
}

export function PuzzlePlacement() {
  const navigate = useNavigate()
  const { user, profile, fetchProfile } = useAuth()

  const [puzzles, setPuzzles] = useState<Puzzle[] | null>(null)
  const [idx, setIdx] = useState(0)
  const [state, setState] = useState<PuzzleState | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const resultsRef = useRef<PlacementResult[]>([])

  // Dacă e deja plasat, nu mai repetăm testul.
  useEffect(() => {
    if (profile && profile.puzzle_rating != null) navigate('/puzzles', { replace: true })
  }, [profile, navigate])

  // Construiește setul de plasament o singură dată.
  useEffect(() => {
    let cancelled = false
    void (async () => {
      const set = await buildPlacementSet()
      if (cancelled) return
      setPuzzles(set)
    })()
    return () => { cancelled = true }
  }, [])

  // Inițializează tabla pentru puzzle-ul curent.
  useEffect(() => {
    if (!puzzles || idx >= puzzles.length) return
    try {
      setState(initPuzzleState(puzzles[idx].fen, puzzles[idx].moves))
      setFeedback(null)
    } catch {
      // puzzle invalid → îl tratăm ca nerezolvat și mergem mai departe
      advance(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzles, idx])

  const total = puzzles?.length ?? 0
  const playerColor: 'white' | 'black' = state?.game.turn() === 'w' ? 'white' : 'black'

  function advance(solved: boolean) {
    if (!puzzles) return
    resultsRef.current.push({ rating: puzzles[idx].rating, solved })
    if (idx + 1 < puzzles.length) {
      setIdx(i => i + 1)
    } else {
      void finish()
    }
  }

  function handleDrop(source: string, target: string): boolean {
    if (!state || !puzzles || feedback) return false
    const expected = state.solutionMoves[state.currentMoveIdx]
    if (!expected) return false
    try {
      const copy = new Chess(state.game.fen())
      const moved = copy.move({ from: source, to: target, promotion: 'q' })
      if (!moved) return false
      const correct = source + target === expected.slice(0, 4)
      setState(s => s ? { ...s, game: copy } : null)
      setFeedback(correct ? 'correct' : 'wrong')
      setTimeout(() => advance(correct), 900)
      return true
    } catch {
      return false
    }
  }

  async function finish() {
    if (!user) return
    setSubmitting(true)
    const raw = computePlacementRating(resultsRef.current)
    const stored = placementToStoredRating(raw)
    const { error } = await supabase.rpc('set_puzzle_placement', { p_user_id: user.id, p_rating: stored })
    if (error) {
      toast.error('Nu am putut salva rezultatul plasamentului.')
      setSubmitting(false)
      return
    }
    await fetchProfile(user.id)
    toast.success(`Plasat la rating ${stored} (${bandForRating(stored).label})`)
    navigate('/puzzles', { replace: true })
  }

  // ---- UI ----
  if (!puzzles) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center gap-3">
        <Spinner className="h-7 w-7" />
        <p className="text-[#888] text-sm">Pregătim testul de plasament...</p>
      </div>
    )
  }

  if (submitting || idx >= puzzles.length) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center gap-3">
        <Spinner className="h-7 w-7" />
        <p className="text-[#888] text-sm">Îți calculăm rating-ul...</p>
      </div>
    )
  }

  const pct = Math.round((idx / total) * 100)

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#f0f0f0] mb-1">Test de plasament</h1>
          <p className="text-[#a0a0a0] text-sm">
            Puzzle-ul {idx + 1} din {total} — devin progresiv mai grele. Găsește cea mai bună mutare.
          </p>
        </div>

        <Progress value={pct} className="mb-6 h-2" />

        <div className="rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] p-5">
          <div className="flex items-center justify-between mb-3 text-sm">
            <span className="text-[#a0a0a0]">
              Joci cu{' '}
              <span className={`font-semibold px-1.5 py-0.5 rounded text-xs ${playerColor === 'white' ? 'bg-[#f0f0f0] text-black' : 'bg-[#2a2a2a] border border-[#444] text-[#f0f0f0]'}`}>
                {playerColor === 'white' ? '♔ Alb' : '♚ Negru'}
              </span>
            </span>
            {feedback === 'correct' && <span className="flex items-center gap-1 text-[#4ade80] font-semibold"><CheckCircle2 className="h-4 w-4" /> Corect</span>}
            {feedback === 'wrong' && <span className="flex items-center gap-1 text-[#fbbf24] font-semibold"><XCircle className="h-4 w-4" /> Greșit</span>}
          </div>

          {state && (
            <div className="mx-auto" style={{ maxWidth: 420 }}>
              <Chessboard
                options={{
                  position: state.game.fen(),
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onPieceDrop: ({ sourceSquare, targetSquare }: any) => handleDrop(sourceSquare, targetSquare),
                  allowDragging: !feedback,
                  boardOrientation: playerColor,
                  boardStyle: { borderRadius: 8 },
                  darkSquareStyle: { backgroundColor: '#3d3d3d' },
                  lightSquareStyle: { backgroundColor: '#f0d9b5' },
                }}
              />
            </div>
          )}

          {!feedback && (
            <button
              onClick={() => advance(false)}
              className="mt-4 w-full text-sm text-[#666] hover:text-[#a0a0a0] transition-colors"
            >
              Nu știu — treci mai departe
            </button>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-[#666]">
          Rezultatul stabilește intervalul tău de rating. Joacă cinstit — oricum, 5 corecte la rând te promovează automat.
        </p>
      </div>
    </div>
  )
}
