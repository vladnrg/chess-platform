import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  const { isPro } = useSubscription()
  const { profile } = useAuth()

  const [page, setPage] = useState(0)
  const [activeTheme, setActiveTheme] = useState<string | null>(null)

  const category = TACTIC_CATEGORIES.find(c => c.id === categoryId)

  const locked = category?.isPro && !isPro

  const { data: exercises, isLoading } = useQuery({
    queryKey: ['tactic-exercises', categoryId, page],
    queryFn: async () => {
      if (!category || locked) return [] as Puzzle[]
      const from = page * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      const { data } = await supabase
        .from('puzzles')
        .select('id, fen, rating, themes, moves, game_url')
        .overlaps('themes', category.lichessThemes)
        .order('rating', { ascending: true })
        .range(from, to)
      return (data ?? []) as Puzzle[]
    },
    enabled: !!category && !locked,
  })

  const { data: totalCount } = useQuery({
    queryKey: ['tactic-count', categoryId],
    queryFn: async () => {
      if (!category) return 0
      const { count } = await supabase
        .from('puzzles')
        .select('*', { count: 'exact', head: true })
        .overlaps('themes', category.lichessThemes)
      return count ?? 0
    },
    enabled: !!category,
  })

  const playerElo = profile?.estimated_elo ?? 800

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-[#666]">Categoria nu a fost găsită.</p>
        <Button variant="secondary" size="sm" onClick={() => navigate('/tactics')}>
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
          onClick={() => navigate('/tactics')}
          className="flex items-center gap-1.5 text-sm text-[#666] hover:text-[#f0f0f0] transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Înapoi la Tactici
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#f0f0f0]">{category.title}</h1>
            <p className="text-[#666] text-sm mt-1 max-w-2xl">{category.description}</p>
          </div>
          {category.isPro && (
            <span className="flex-shrink-0 text-xs font-bold uppercase tracking-wider bg-[#c8a84b]/15 text-[#c8a84b] border border-[#c8a84b]/30 rounded px-2 py-1">
              Pro
            </span>
          )}
        </div>
        {totalCount !== undefined && totalCount > 0 && (
          <p className="text-xs text-[#555] mt-2">
            {totalCount} exerciții disponibile · ELO estimat: {playerElo}
          </p>
        )}
      </div>

      {/* Pro gate */}
      {locked ? (
        <div className="rounded-xl bg-[rgba(200,168,75,0.08)] border border-[rgba(200,168,75,0.3)] p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-[#c8a84b]/15 p-4">
              <Lock className="h-8 w-8 text-[#c8a84b]" />
            </div>
          </div>
          <p className="text-[#c8a84b] font-semibold text-lg">Conținut exclusiv Pro</p>
          <p className="text-[#666] text-sm mt-2 max-w-sm mx-auto">
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
        <div className="rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] p-8 text-center">
          <p className="text-[#666]">Nu există exerciții disponibile pentru această categorie momentan.</p>
          <p className="text-[#555] text-xs mt-2">Baza de date va fi populată în curând.</p>
        </div>
      ) : (
        <>
          {/* Exercise grid */}
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {exercises.map(ex => (
              <ExerciseCard
                key={ex.id}
                puzzle={ex}
                onSolve={() => setActiveTheme(category.lichessThemes[0])}
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
            <span className="text-xs text-[#555]">
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

      {activeTheme && (
        <PuzzleModal theme={activeTheme} onClose={() => setActiveTheme(null)} />
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
      className="group rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] overflow-hidden flex flex-col text-left hover:border-[#c8a84b] transition-colors"
    >
      <div className="aspect-square w-full pointer-events-none select-none">
        <Chessboard
          options={{
            position: puzzle.fen,
            allowDragging: false,
            boardStyle: { borderRadius: 0 },
            darkSquareStyle: { backgroundColor: '#3d3d3d' },
            lightSquareStyle: { backgroundColor: '#f0d9b5' },
          }}
        />
      </div>
      <div className="px-3 py-2">
        <span className="text-sm font-semibold text-[#f0f0f0]">{puzzle.rating}</span>
      </div>
    </button>
  )
}
