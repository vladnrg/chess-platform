import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Chessboard } from 'react-chessboard'
import { Lock, ArrowRight, ExternalLink, FileText, ChevronLeft, ChevronRight, Target } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useSubscription } from '@/hooks/useSubscription'
import { TACTIC_CATEGORIES } from '@/data/tactics'
import { PUZZLE_BANDS, bandIndex } from '@/lib/puzzle-rating'
import { FAMOUS_GAMES, PDF_RESOURCES } from '@/data/famousGames'
import { FamousGameCard } from '@/components/tactics/FamousGameCard'

// Etichetă de dificultate pentru un interval de ELO
function bandTier(floor: number): string {
  if (floor < 800) return 'Începător'
  if (floor < 1200) return 'Ușor'
  if (floor < 1600) return 'Mediu'
  if (floor < 2000) return 'Greu'
  return 'Expert'
}

export function TacticsChestPage() {
  const navigate = useNavigate()
  const { isPro } = useSubscription()
  const [searchParams, setSearchParams] = useSearchParams()
  const eloParam = searchParams.get('elo')

  // Index ușor (rating + teme) pentru a calcula câte exerciții sunt pe interval / categorie
  const { data: rows } = useQuery({
    queryKey: ['tactics-index'],
    queryFn: async () => {
      const { data } = await supabase.from('puzzles').select('rating, themes')
      return (data ?? []) as { rating: number; themes: string[] }[]
    },
  })

  const bandCounts = useMemo(() => {
    const counts = new Array(PUZZLE_BANDS.length).fill(0) as number[]
    for (const r of rows ?? []) counts[bandIndex(r.rating)]++
    return counts
  }, [rows])

  const selectedBand = eloParam
    ? PUZZLE_BANDS.find(b => `${b.floor}-${b.ceil}` === eloParam) ?? null
    : null

  // Câte exerciții are fiecare categorie în intervalul selectat
  const catCounts = useMemo(() => {
    const m: Record<string, number> = {}
    if (!selectedBand) return m
    for (const r of rows ?? []) {
      if (r.rating < selectedBand.floor || r.rating >= selectedBand.ceil) continue
      for (const cat of TACTIC_CATEGORIES) {
        if (cat.lichessThemes.some(t => r.themes?.includes(t))) m[cat.id] = (m[cat.id] ?? 0) + 1
      }
    }
    return m
  }, [rows, selectedBand])

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div>
        <h1 className="text-2xl font-bold text-[#F0F0F0]">Cufărul cu tactici</h1>
        <p className="text-[#6B6B6B] text-sm mt-1 max-w-xl">
          Alege întâi un interval de ELO, apoi tipul de tactică — furculiță, legare, atac descoperit și altele.
          Exerciții interactive din partide reale, potrivite nivelului tău.
        </p>
      </div>

      {!selectedBand ? (
        <>
          {/* Nivel 1 — intervale de ELO */}
          <section>
            <h2 className="text-lg font-semibold text-[#F0F0F0] mb-4">Alege un interval de ELO</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PUZZLE_BANDS.map((band, i) => bandCounts[i] > 0 && (
                <button
                  key={band.floor}
                  onClick={() => setSearchParams({ elo: `${band.floor}-${band.ceil}` })}
                  className="group flex items-center gap-4 rounded-2xl border border-[#2A2A2A] bg-[#141414] p-4 text-left hover:border-[#E2B340] hover:-translate-y-0.5 transition-all"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(226,179,64,0.12)] text-[#E2B340]">
                    <Target className="h-6 w-6" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-lg text-[#F0F0F0]">ELO {band.label}</p>
                    <p className="text-xs text-[#6B6B6B]">{bandTier(band.floor)} · {bandCounts[i]} exerciții</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[#3A3A3A] group-hover:text-[#E2B340] transition-colors" />
                </button>
              ))}
            </div>
          </section>

          {/* Partide celebre */}
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-[#F0F0F0]">Partide Celebre</h2>
              <p className="text-sm text-[#6B6B6B] mt-0.5">
                Partide care au intrat în istoria șahului. Fiecare are o lecție tactică sau strategică majoră.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {FAMOUS_GAMES.map(game => (
                <FamousGameCard key={game.id} game={game} />
              ))}
            </div>
          </section>

          {/* Resurse PDF */}
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-[#F0F0F0]">Resurse & PDF-uri</h2>
              <p className="text-sm text-[#6B6B6B] mt-0.5">Materiale gratuite pentru studiu offline.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PDF_RESOURCES.map(res => (
                <a
                  key={res.id}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 rounded-xl bg-[#141414] border border-[#2A2A2A] p-4 hover:border-[#E2B340] transition-colors"
                >
                  <FileText className="h-5 w-5 text-[#E2B340] flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[#F0F0F0] group-hover:text-[#E2B340] transition-colors">
                        {res.title}
                      </p>
                      <span className="text-xs text-[#6B6B6B] border border-[#2A2A2A] rounded px-1">
                        {res.language}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">{res.description}</p>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-[#6B6B6B] flex-shrink-0 mt-0.5 group-hover:text-[#E2B340] transition-colors" />
                </a>
              ))}
            </div>
          </section>
        </>
      ) : (
        /* Nivel 2 — categorii tactice din intervalul ales */
        <section>
          <button
            onClick={() => setSearchParams({})}
            className="flex items-center gap-1.5 text-sm text-[#A0A0A0] hover:text-[#F0F0F0] transition-colors mb-4"
          >
            <ChevronLeft className="h-4 w-4" /> Toate intervalele
          </button>
          <h2 className="text-lg font-semibold text-[#F0F0F0] mb-1">Tactici · ELO {selectedBand.label}</h2>
          <p className="text-sm text-[#6B6B6B] mb-4">Alege tipul de tactică.</p>
          {(() => {
            const visible = TACTIC_CATEGORIES.filter(
              cat => (catCounts[cat.id] ?? 0) > 0 || (cat.isPro && !isPro)
            )
            if (visible.length === 0) {
              return <p className="text-sm text-[#6B6B6B] py-10 text-center">Nu există tactici în acest interval de ELO.</p>
            }
            return (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map(cat => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    isPro={isPro}
                    count={catCounts[cat.id] ?? 0}
                    onNavigate={() => navigate(`/tactics/${cat.id}?elo=${eloParam}`)}
                  />
                ))}
              </div>
            )
          })()}
        </section>
      )}
    </div>
  )
}

interface CategoryCardProps {
  category: (typeof TACTIC_CATEGORIES)[number]
  isPro: boolean
  count: number
  onNavigate: () => void
}

function CategoryCard({ category, isPro, count, onNavigate }: CategoryCardProps) {
  const locked = category.isPro && !isPro
  const empty = !locked && count === 0

  return (
    <div
      className={[
        'rounded-xl border overflow-hidden flex flex-col transition-colors',
        locked
          ? 'bg-[#141414] border-[#1C1C1C] opacity-70 cursor-pointer'
          : empty
          ? 'bg-[#141414] border-[#1C1C1C] opacity-60 cursor-default'
          : 'bg-[#141414] border-[#2A2A2A] hover:border-[#E2B340] cursor-pointer',
      ].join(' ')}
      onClick={locked || !empty ? onNavigate : undefined}
    >
      {/* Board thumbnail */}
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

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[#F0F0F0] text-sm leading-snug">{category.title}</h3>
          {category.isPro && (
            <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider bg-[#E2B340]/15 text-[#E2B340] border border-[#E2B340]/30 rounded px-1.5 py-0.5">
              Pro
            </span>
          )}
        </div>
        <p className="text-xs text-[#A0A0A0] leading-relaxed flex-1">{category.description}</p>
        <div className="flex items-center justify-between mt-1">
          {locked ? (
            <span className="text-xs text-[#6B6B6B]">Necesită Pro</span>
          ) : empty ? (
            <span className="text-xs text-[#6B6B6B]">Momentan fără exerciții</span>
          ) : (
            <span className="text-xs text-[#E2B340] font-semibold">{count} exerciții</span>
          )}
          <ArrowRight className="h-3.5 w-3.5 text-[#3A3A3A]" />
        </div>
      </div>
    </div>
  )
}
