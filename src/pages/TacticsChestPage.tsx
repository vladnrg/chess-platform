import { useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Chessboard } from 'react-chessboard'
import { Lock, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useSubscription } from '@/hooks/useSubscription'
import { useAuth } from '@/hooks/useAuth'
import { TACTIC_CATEGORIES, type TacticCategory } from '@/data/tactics'
import { TACTIC_TIERS, type TacticTier, pickPathIds } from '@/lib/tactics-path'

interface PuzzleIndexRow {
  id: string
  rating: number
  themes: string[]
}

export function TacticsChestPage() {
  const { isPro } = useSubscription()
  const { user } = useAuth()

  // Index ușor (id + rating + teme) pentru a compune traseele și progresul, dintr-o singură interogare.
  const { data: rows } = useQuery({
    queryKey: ['tactics-index'],
    queryFn: async () => {
      const { data } = await supabase.from('puzzles').select('id, rating, themes')
      return (data ?? []) as PuzzleIndexRow[]
    },
  })

  // Puzzle-urile rezolvate de utilizator (o singură interogare pentru tot ansamblul).
  const { data: solvedIds } = useQuery({
    queryKey: ['tactics-solved', user?.id],
    queryFn: async () => {
      if (!user) return new Set<string>()
      const { data } = await supabase
        .from('user_puzzle_attempts')
        .select('puzzle_id')
        .eq('user_id', user.id)
        .eq('solved', true)
      return new Set((data ?? []).map((r: { puzzle_id: string }) => r.puzzle_id))
    },
    enabled: !!user,
  })

  const puzzles = rows ?? []
  const solved = solvedIds ?? new Set<string>()

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div>
        <h1 className="text-2xl font-bold text-[#F0F0F0]">Cufărul cu tactici</h1>
        <p className="text-[#6B6B6B] text-sm mt-1 max-w-xl">
          Antrenează-te pe niveluri — de la începător la maestru. Alege un tip de tactică și parcurge
          traseul de exerciții, exact ca la cursuri.
        </p>
      </div>

      {TACTIC_TIERS.map(tier => (
        <TacticTierRow key={tier.id} tier={tier} puzzles={puzzles} solved={solved} isPro={isPro} />
      ))}
    </div>
  )
}

// Un rând = nivel de ELO + carusel orizontal cu tipuri de tactică (stil „Cursuri interactive").
function TacticTierRow({ tier, puzzles, solved, isPro }: {
  tier: TacticTier
  puzzles: PuzzleIndexRow[]
  solved: Set<string>
  isPro: boolean
}) {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const scroll = (dir: number) => scrollRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })

  // Carduri: categoriile cu exerciții pe acest nivel (plus cele Pro pentru non-Pro, cu lacăt).
  const cards = useMemo(() => {
    return TACTIC_CATEGORIES
      .map(cat => {
        const ids = pickPathIds(puzzles, cat, tier)
        return { cat, total: ids.length, solvedCount: ids.filter(id => solved.has(id)).length }
      })
      .filter(c => c.total > 0 || (c.cat.isPro && !isPro))
  }, [puzzles, solved, tier, isPro])

  if (cards.length === 0) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-[#F0F0F0]">{tier.label}</h2>
          <span className="text-xs font-semibold text-[#E2B340] bg-[rgba(226,179,64,0.12)] rounded-full px-2.5 py-1">
            ELO {tier.floor}–{tier.ceil}
          </span>
        </div>
        <div className="flex gap-1.5">
          {[-1, 1].map(dir => (
            <button
              key={dir}
              onClick={() => scroll(dir)}
              aria-label={dir < 0 ? 'Înapoi' : 'Înainte'}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#141414] border border-[#2A2A2A] text-[#A0A0A0] hover:text-[#F0F0F0] hover:border-[#3A3A3A] hover:bg-[#1C1C1C] transition-colors"
            >
              {dir < 0 ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 snap-x scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {cards.map(({ cat, total, solvedCount }) => (
          <div key={cat.id} className="w-64 sm:w-72 shrink-0 snap-start">
            <TacticCard
              category={cat}
              total={total}
              solvedCount={solvedCount}
              locked={cat.isPro && !isPro}
              onClick={() => navigate(cat.isPro && !isPro ? '/pricing' : `/tactics/${cat.id}/${tier.id}`)}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

// Cardul unui tip de tactică: poziție (coverFen) + progres Duolingo (bară + X/total).
function TacticCard({ category, total, solvedCount, locked, onClick }: {
  category: TacticCategory
  total: number
  solvedCount: number
  locked: boolean
  onClick: () => void
}) {
  const pct = total > 0 ? Math.round((solvedCount / total) * 100) : 0

  return (
    <button
      onClick={onClick}
      className={`group w-full rounded-2xl border bg-[#141414] overflow-hidden flex flex-col text-left transition-all duration-200 ${
        locked
          ? 'border-[#1C1C1C] hover:border-[#2A2A2A]'
          : 'border-[#2A2A2A] hover:border-[#E2B340] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
      }`}
    >
      {/* Board preview */}
      <div className="aspect-square w-full pointer-events-none select-none relative">
        <Chessboard
          options={{
            position: category.coverFen,
            allowDragging: false,
            boardStyle: { borderRadius: 0 },
            darkSquareStyle: { backgroundColor: '#3A3A3A' },
            lightSquareStyle: { backgroundColor: '#f0d9b5' },
          }}
        />
        {locked && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="rounded-full bg-[#E2B340]/90 p-3">
              <Lock className="h-5 w-5 text-black" />
            </div>
          </div>
        )}
      </div>

      {/* Info + progres */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[#F0F0F0] text-sm leading-snug group-hover:text-[#E2B340] transition-colors">
            {category.title}
          </h3>
          {category.isPro && (
            <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider bg-[#E2B340]/15 text-[#E2B340] border border-[#E2B340]/30 rounded px-1.5 py-0.5">
              Pro
            </span>
          )}
        </div>

        {locked ? (
          <span className="text-xs text-[#6B6B6B] mt-auto">Necesită Pro</span>
        ) : (
          <div className="mt-auto pt-1">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[#6B6B6B]">{solvedCount}/{total} rezolvate</span>
              {solvedCount > 0 && (
                <span className={pct === 100 ? 'text-[#4ade80] font-semibold' : 'text-[#E2B340] font-semibold'}>
                  {pct === 100 ? '✓ Complet' : `${pct}%`}
                </span>
              )}
            </div>
            <div className="h-1.5 rounded-full bg-[#1C1C1C] overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#4ade80' : '#E2B340' }}
              />
            </div>
          </div>
        )}
      </div>
    </button>
  )
}
