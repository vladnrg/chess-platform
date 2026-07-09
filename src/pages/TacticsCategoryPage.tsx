import { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Chessboard } from 'react-chessboard'
import { ArrowLeft, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useSubscription } from '@/hooks/useSubscription'
import { useAuth } from '@/hooks/useAuth'
import { TACTIC_CATEGORIES } from '@/data/tactics'
import { PuzzleModal } from '@/components/chess/PuzzleModal'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { Puzzle } from '@/types'

const PAGE_SIZE = 20

export function TacticsCategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isPro } = useSubscription()
  const { profile } = useAuth()

  const [page, setPage] = useState(0)
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null)

  // Interval de ELO (venit din pagina de intervale): "floor-ceil"
  const eloParam = searchParams.get('elo')
  const [eloFloor, eloCeil] = eloParam ? eloParam.split('-').map(Number) : [null, null]
  const backPath = `/tactics${eloParam ? `?elo=${eloParam}` : ''}`

  const category = TACTIC_CATEGORIES.find(c => c.id === categoryId)

  const locked = category?.isPro && !isPro

  const { data: exercises, isLoading } = useQuery({
    queryKey: ['tactic-exercises', categoryId, eloParam, page],
    queryFn: async () => {
      if (!category || locked) return [] as Puzzle[]
      const from = page * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      let q = supabase
        .from('puzzles')
        .select('id, fen, rating, themes, moves, game_url, title')
        .overlaps('themes', category.lichessThemes)
      if (eloFloor != null && eloCeil != null) q = q.gte('rating', eloFloor).lt('rating', eloCeil)
      const { data } = await q.order('rating', { ascending: true }).range(from, to)
      return (data ?? []) as Puzzle[]
    },
    enabled: !!category && !locked,
  })

  const { data: totalCount } = useQuery({
    queryKey: ['tactic-count', categoryId, eloParam],
    queryFn: async () => {
      if (!category) return 0
      let q = supabase
        .from('puzzles')
        .select('*', { count: 'exact', head: true })
        .overlaps('themes', category.lichessThemes)
      if (eloFloor != null && eloCeil != null) q = q.gte('rating', eloFloor).lt('rating', eloCeil)
      const { count } = await q
      return count ?? 0
    },
    enabled: !!category,
  })

  const playerElo = profile?.estimated_elo ?? 800

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-[#6B6B6B]">Categoria nu a fost găsită.</p>
        <Button variant="secondary" size="sm" onClick={() => navigate(backPath)}>
          ← Înapoi la Tactici
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(backPath)}
          className="flex items-center gap-1.5 text-sm text-[#6B6B6B] hover:text-[#F0F0F0] transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Înapoi la Tactici
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#F0F0F0]">{category.title}</h1>
            <p className="text-[#6B6B6B] text-sm mt-1 max-w-2xl">{category.description}</p>
          </div>
          {category.isPro && (
            <span className="flex-shrink-0 text-xs font-bold uppercase tracking-wider bg-[#E2B340]/15 text-[#E2B340] border border-[#E2B340]/30 rounded px-2 py-1">
              Pro
            </span>
          )}
        </div>
        {totalCount !== undefined && totalCount > 0 && (
          <p className="text-xs text-[#6B6B6B] mt-2">
            {totalCount} exerciții{eloParam ? ` · interval ELO ${eloParam}` : ''} · nivelul tău ~{playerElo}
          </p>
        )}
      </div>

      {/* Pro gate */}
      {locked ? (
        <div className="rounded-xl bg-[rgba(226,179,64,0.08)] border border-[rgba(226,179,64,0.3)] p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-[#E2B340]/15 p-4">
              <Lock className="h-8 w-8 text-[#E2B340]" />
            </div>
          </div>
          <p className="text-[#E2B340] font-semibold text-lg">Conținut exclusiv Pro</p>
          <p className="text-[#6B6B6B] text-sm mt-2 max-w-sm mx-auto">
            Această categorie include exerciții avansate disponibile doar cu abonament Pro.
          </p>
          <a href="/pricing" className="mt-4 inline-block">
            <Button size="sm">Upgrade la Pro</Button>
          </a>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-7 w-7" />
        </div>
      ) : !exercises || exercises.length === 0 ? (
        <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] p-8 text-center">
          <p className="text-[#6B6B6B]">Nu există exerciții disponibile pentru această categorie momentan.</p>
          <p className="text-[#6B6B6B] text-xs mt-2">Baza de date va fi populată în curând.</p>
        </div>
      ) : (
        <>
          {/* Exercise grid */}
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {exercises.map(ex => (
              <ExerciseCard
                key={ex.id}
                puzzle={ex}
                onSolve={() => setActivePuzzle(ex)}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              ← Pagina anterioară
            </Button>
            <span className="text-xs text-[#6B6B6B]">
              Pagina {page + 1}
              {totalCount ? ` · ${Math.ceil(totalCount / PAGE_SIZE)} total` : ''}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={!exercises || exercises.length < PAGE_SIZE}
            >
              Pagina următoare →
            </Button>
          </div>
        </>
      )}

      {activePuzzle && (
        <PuzzleModal
          theme={activePuzzle.themes[0] ?? category.lichessThemes[0]}
          initialPuzzle={activePuzzle}
          onClose={() => setActivePuzzle(null)}
        />
      )}
    </div>
  )
}

interface ExerciseCardProps {
  puzzle: Puzzle
  onSolve: () => void
}

function ExerciseCard({ puzzle, onSolve }: ExerciseCardProps) {
  return (
    <button
      onClick={onSolve}
      className="group rounded-xl bg-[#141414] border border-[#2A2A2A] overflow-hidden flex flex-col text-left hover:border-[#E2B340] transition-colors"
    >
      <div className="aspect-square w-full pointer-events-none select-none relative">
        <Chessboard
          options={{
            position: puzzle.fen,
            allowDragging: false,
            boardStyle: { borderRadius: 0 },
            darkSquareStyle: { backgroundColor: '#3A3A3A' },
            lightSquareStyle: { backgroundColor: '#f0d9b5' },
          }}
        />
        {puzzle.title && (
          <span className="absolute top-1.5 left-1.5 rounded-full bg-[#E2B340] text-black text-[9px] font-black px-2 py-0.5 shadow-lg">
            ★ ISTORICĂ
          </span>
        )}
      </div>
      <div className="px-3 py-2">
        {puzzle.title && (
          <p className="text-[11px] font-semibold text-[#E2B340] leading-tight line-clamp-2 mb-1">{puzzle.title}</p>
        )}
        <span className="text-xs text-[#6B6B6B]">ELO {puzzle.rating}</span>
      </div>
    </button>
  )
}
