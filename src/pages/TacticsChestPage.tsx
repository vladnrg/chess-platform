import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Lock, ChevronLeft, ChevronRight, ArrowRight, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useSubscription } from '@/hooks/useSubscription'
import { useAuth } from '@/hooks/useAuth'
import { TACTIC_CATEGORIES, type TacticCategory } from '@/data/tactics'
import { TACTIC_TIERS, type TacticTier, pickPathIds } from '@/lib/tactics-path'
import { tacticVisual, tierColor, TIER_ICONS } from '@/lib/tactic-visuals'
import { MascotEnPassant } from '@/components/ui/MascotEnPassant'

interface PuzzleIndexRow {
  id: string
  rating: number
  themes: string[]
}

interface CardData {
  cat: TacticCategory
  total: number
  solvedCount: number
}

// Valori implicite stabile: `?? []` / `?? new Set()` în corpul componentei ar crea
// referințe noi la fiecare render și ar anula memoizarea de mai jos.
const NO_ROWS: PuzzleIndexRow[] = []
const NO_SOLVED: ReadonlySet<string> = new Set()

export function TacticsChestPage() {
  const { isPro } = useSubscription()
  const { user, profile } = useAuth()

  // Index ușor (id + rating + teme) — o singură interogare pentru toate traseele.
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

  const puzzles = rows ?? NO_ROWS
  const solved: ReadonlySet<string> = solvedIds ?? NO_SOLVED

  // Traseele + progresul, calculate o singură dată și partajate cu rândurile și hero-ul.
  const tierData = useMemo(() => {
    return TACTIC_TIERS.map(tier => {
      const cards: CardData[] = TACTIC_CATEGORIES
        .map(cat => {
          const ids = pickPathIds(puzzles, cat, tier)
          return { cat, total: ids.length, solvedCount: ids.filter(id => solved.has(id)).length }
        })
        .filter(c => c.total > 0 || (c.cat.isPro && !isPro))
      return { tier, cards }
    })
  }, [puzzles, solved, isPro])

  const stats = useMemo(() => {
    let solvedCount = 0
    let complete = 0
    for (const { cards } of tierData) {
      for (const c of cards) {
        if (c.total === 0) continue
        solvedCount += c.solvedCount
        if (c.solvedCount === c.total) complete++
      }
    }
    return { solvedCount, complete }
  }, [tierData])

  const playerElo = profile?.estimated_elo

  // Niciun cufăr deschis la intrare: pagina porneşte curată, cu patru cufere.
  const [openTier, setOpenTier] = useState<string | null>(null)
  const open = tierData.find(t => t.tier.id === openTier && t.cards.length > 0)

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-2xl border border-[#2A2A2A]"
        style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #1C1C1C 55%, #0A0A0A 100%)' }}
      >
        {/* Mascota decorativă */}
        <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 opacity-95 pointer-events-none select-none hidden sm:block">
          <MascotEnPassant size={132} mood="happy" />
        </div>
        <div className="relative px-6 py-7 max-w-[36rem]">
          {/* Titlul stă în bara shell-ului; hero-ul păstrează doar descrierea şi statisticile */}
          <p className="text-[#A0A0A0] text-sm">
            Antrenează-te pe niveluri — de la începător la maestru. Alege un tip de tactică
            și parcurge traseul de exerciții, exact ca la cursuri.
          </p>
          <div className="flex gap-6 mt-5">
            <HeroStat value={stats.solvedCount} label="exerciții rezolvate" color="#4ade80" />
            <HeroStat value={stats.complete} label="tactici complete" color="#E2B340" />
            {playerElo != null && <HeroStat value={`~${playerElo}`} label="nivelul tău" color="#2DD4BF" />}
          </div>
        </div>
      </div>

      {/* Cuferele, unul lângă altul. Închise, pagina nu arată decât scara
          materialelor — lemn, argint, aur, smarald. Eticheta, numărătoarea şi
          tacticile apar abia după ce deschizi unul, ca să nu se reverse tot
          conţinutul din prima. */}
      <div className="flex flex-wrap items-end justify-center gap-2 sm:gap-6">
        {tierData.map(({ tier, cards }) => cards.length > 0 && (
          <ChestButton
            key={tier.id}
            tier={tier}
            open={openTier === tier.id}
            onClick={() => setOpenTier(id => (id === tier.id ? null : tier.id))}
          />
        ))}
      </div>

      {open && (
        <TacticTierRow
          // `key` remontează secţiunea la fiecare cufăr: altfel React ar
          // refolosi nodurile şi animaţia de ieşire n-ar mai porni.
          key={open.tier.id}
          tier={open.tier}
          cards={open.cards}
          isPro={isPro}
          onClose={() => setOpenTier(null)}
        />
      )}
    </div>
  )
}

/**
 * Un cufăr închis, ca buton. Nu poartă etichetă: materialul spune treapta,
 * iar numele apare la hover şi pentru cititoarele de ecran.
 */
function ChestButton({ tier, open, onClick }: { tier: TacticTier; open: boolean; onClick: () => void }) {
  const color = tierColor(tier.id)
  const Icon = TIER_ICONS[tier.id]
  const [areImagine, setAreImagine] = useState(true)

  return (
    <button
      type="button"
      onClick={onClick}
      title={`${tier.label} · ELO ${tier.floor}–${tier.ceil}`}
      aria-label={`${tier.label}, ELO ${tier.floor}–${tier.ceil}`}
      aria-expanded={open}
      className="group relative flex w-28 items-center justify-center rounded-2xl p-1 transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 sm:w-48"
      style={{ outlineColor: color }}
    >
      {/* Aura din spate. Se aprinde când cufărul e deschis — singurul semn de
          care e nevoie, fiindcă lista apare oricum dedesubt. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at 50% 52%, ${color}${open ? '3D' : '1A'}, transparent 68%)`,
        }}
      />
      <span className="relative flex aspect-square w-full items-center justify-center">
        {areImagine ? (
          <img
            src={`/tactics/${tier.id}.png`}
            alt=""
            onError={() => setAreImagine(false)}
            className={`h-full w-full object-contain transition-transform duration-200 group-hover:scale-105 ${open ? 'scale-105' : ''}`}
          />
        ) : (
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl sm:h-14 sm:w-14"
            style={{ backgroundColor: `${color}1F`, color }}
          >
            <Icon className="h-5 w-5 sm:h-7 sm:w-7" />
          </span>
        )}
      </span>
    </button>
  )
}

function HeroStat({ value, label, color }: { value: number | string; label: string; color: string }) {
  return (
    <div>
      <p className="text-2xl font-black" style={{ color }}>{value}</p>
      <p className="text-xs text-[#6B6B6B]">{label}</p>
    </div>
  )
}

/** Ce se revarsă dintr-un cufăr deschis: antetul treptei şi caruselul ei. */
function TacticTierRow({ tier, cards, isPro, onClose }: {
  tier: TacticTier
  cards: CardData[]
  isPro: boolean
  onClose: () => void
}) {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const scroll = (dir: number) => scrollRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })

  if (cards.length === 0) return null

  const color = tierColor(tier.id)
  const started = cards.filter(c => c.solvedCount > 0).length

  return (
    <section className="relative">
      {/* Lumina scursă din cufărul de deasupra. Stă peste carduri, nu sub ele:
          au fundal opac, deci dedesubt n-ar vedea-o nimeni. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-6 z-10 h-40"
        style={{
          background: `radial-gradient(ellipse 42% 100% at 50% 0%, ${color}2B, ${color}0D 45%, transparent 72%)`,
        }}
      />

      <div
        className="mb-2 flex items-center justify-between"
        style={{ animation: 'se-desface 0.25s ease-out both' }}
      >
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-bold text-[#F0F0F0]">{tier.label}</h2>
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
              style={{ backgroundColor: `${color}1F`, color }}
            >
              ELO {tier.floor}–{tier.ceil}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[#6B6B6B]">{started}/{cards.length} tactici începute</p>
        </div>
        <div className="flex gap-1.5">
          {[-1, 1].map(dir => (
            <button
              key={dir}
              onClick={() => scroll(dir)}
              aria-label={dir < 0 ? 'Înapoi' : 'Înainte'}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2A2A2A] bg-[#141414] text-[#A0A0A0] transition-colors hover:border-[#3A3A3A] hover:bg-[#1C1C1C] hover:text-[#F0F0F0]"
            >
              {dir < 0 ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ))}
          <button
            onClick={onClose}
            aria-label="Închide cufărul"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2A2A2A] bg-[#141414] text-[#6B6B6B] transition-colors hover:border-[#3A3A3A] hover:bg-[#1C1C1C] hover:text-[#F0F0F0]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Linie subțire colorată sub antet */}
      <div
        className="mb-4 h-px w-full"
        style={{
          background: `linear-gradient(90deg, ${color}66, transparent)`,
          animation: 'se-desface 0.25s ease-out both',
        }}
      />

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 snap-x scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {cards.map(({ cat, total, solvedCount }, i) => (
          <div
            key={cat.id}
            className="w-60 shrink-0 snap-start sm:w-64"
            // Se aşază pe rând, stânga→dreapta. Întârzierea se opreşte după al
            // optulea: cu paisprezece tactici, ultimele ar fi apărut la peste
            // o secundă, adică o aşteptare, nu o animaţie.
            style={{
              animation: 'iese-din-cufar 0.38s ease-out both',
              animationDelay: `${0.06 + Math.min(i, 7) * 0.045}s`,
            }}
          >
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


// Cardul unui tip de tactică: ICON + CULOARE proprie + progres Duolingo.
function TacticCard({ category, total, solvedCount, locked, onClick }: {
  category: TacticCategory
  total: number
  solvedCount: number
  locked: boolean
  onClick: () => void
}) {
  const { icon: Icon, color } = tacticVisual(category.id)
  const pct = total > 0 ? Math.round((solvedCount / total) * 100) : 0
  const done = pct === 100

  return (
    <button
      onClick={onClick}
      className="tactic-card group w-full h-full rounded-2xl border border-[#2A2A2A] bg-[#141414] overflow-hidden flex flex-col text-left hover:-translate-y-1"
      style={{ ['--tc' as string]: color }}
    >
      {/* Zona icon — glow din culoarea categoriei */}
      <div
        className="relative h-28 flex items-center justify-center"
        style={{ background: `radial-gradient(circle at 50% 42%, ${color}22, transparent 72%)` }}
      >
        <span
          className="flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-110"
          style={{ backgroundColor: `${color}1A`, color, boxShadow: `0 8px 26px ${color}22` }}
        >
          <Icon className="h-8 w-8" strokeWidth={2} />
        </span>
        {locked && (
          <span className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-[#E2B340]">
            <Lock className="h-3 w-3" /> PRO
          </span>
        )}
      </div>

      {/* Info + progres */}
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <h3 className="font-display font-bold text-[#F0F0F0] text-sm leading-snug">{category.title}</h3>
        <p className="text-xs text-[#6B6B6B] leading-relaxed line-clamp-2 flex-1">{category.description}</p>

        <div className="pt-1.5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[#6B6B6B]">
              {locked ? 'Necesită Pro' : `${solvedCount}/${total} rezolvate`}
            </span>
            {!locked && (
              done ? (
                <span className="font-semibold text-[#4ade80]">✓ Complet</span>
              ) : solvedCount > 0 ? (
                <span className="font-semibold" style={{ color }}>{pct}%</span>
              ) : (
                <span className="flex items-center gap-0.5 font-semibold" style={{ color }}>
                  Începe <ArrowRight className="h-3 w-3" />
                </span>
              )
            )}
          </div>
          <div className="h-1.5 rounded-full bg-[#1C1C1C] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${locked ? 0 : pct}%`, backgroundColor: done ? '#4ade80' : color }}
            />
          </div>
        </div>
      </div>
    </button>
  )
}
