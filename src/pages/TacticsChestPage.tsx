import { useNavigate } from 'react-router-dom'
import { Lock, ArrowRight, ExternalLink, FileText } from 'lucide-react'
import { Chessboard } from 'react-chessboard'
import { useSubscription } from '@/hooks/useSubscription'
import { TACTIC_CATEGORIES } from '@/data/tactics'
import { FAMOUS_GAMES, PDF_RESOURCES } from '@/data/famousGames'
import { FamousGameCard } from '@/components/tactics/FamousGameCard'

export function TacticsChestPage() {
  const navigate = useNavigate()
  const { isPro } = useSubscription()

  const freeCategories = TACTIC_CATEGORIES.filter(c => !c.isPro)
  const proCategories = TACTIC_CATEGORIES.filter(c => c.isPro)

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div>
        <h1 className="text-2xl font-bold text-[#F0F0F0]">Cufărul cu tactici</h1>
        <p className="text-[#6B6B6B] text-sm mt-1 max-w-xl">
          Studiază modelele tactice fundamentale. Fiecare categorie conține sute de exerciții interactive
          din partide reale, organizate după tipul tactic.
        </p>
      </div>

      {/* Free categories */}
      <section>
        <h2 className="text-lg font-semibold text-[#F0F0F0] mb-4">Tactici gratuite</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {freeCategories.map(cat => (
            <CategoryCard key={cat.id} category={cat} isPro={isPro} onNavigate={() => navigate(`/tactics/${cat.id}`)} />
          ))}
        </div>
      </section>

      {/* Pro categories */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[#F0F0F0]">Tactici Pro</h2>
          <p className="text-sm text-[#6B6B6B] mt-0.5">
            Disponibile cu abonament Pro — include 11 categorii avansate cu sute de exerciții fiecare.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {proCategories.map(cat => (
            <CategoryCard key={cat.id} category={cat} isPro={isPro} onNavigate={() => navigate(`/tactics/${cat.id}`)} />
          ))}
        </div>
      </section>

      {/* Famous games */}
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

      {/* PDF resources */}
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
    </div>
  )
}

interface CategoryCardProps {
  category: (typeof TACTIC_CATEGORIES)[number]
  isPro: boolean
  onNavigate: () => void
}

function CategoryCard({ category, isPro, onNavigate }: CategoryCardProps) {
  const locked = category.isPro && !isPro

  return (
    <div
      className={[
        'rounded-xl border overflow-hidden flex flex-col cursor-pointer transition-colors',
        locked
          ? 'bg-[#141414] border-[#1C1C1C] opacity-70'
          : 'bg-[#141414] border-[#2A2A2A] hover:border-[#E2B340]',
      ].join(' ')}
      onClick={onNavigate}
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
          ) : (
            <span className="text-xs text-[#6B6B6B]">Exerciții interactive</span>
          )}
          <ArrowRight className="h-3.5 w-3.5 text-[#3A3A3A]" />
        </div>
      </div>
    </div>
  )
}
