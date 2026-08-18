import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Lock, ChevronLeft, ChevronRight, ArrowRight, X, Dumbbell, Check, TrendingUp, Gauge, Target, RotateCcw, Flame, type LucideIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useSubscription } from '@/hooks/useSubscription'
import { useAuth } from '@/hooks/useAuth'
import { TACTIC_CATEGORIES, type TacticCategory } from '@/data/tactics'
import { TACTIC_TIERS, type TacticTier, pickPathIds, pickTrial, categoryInTier } from '@/lib/tactics-path'
import { tierColor, TIER_ICONS } from '@/lib/tactic-visuals'
import { CalutulOmniscient } from '@/components/ui/CalutulOmniscient'
import { TacticTile } from '@/components/chess/TacticTile'
import { niveluriPeTeme, temaSlaba, deRepetat, temaZilei, type Incercare } from '@/lib/tactici-progres'
import { PuzzleModal } from '@/components/chess/PuzzleModal'
import type { Puzzle } from '@/types'

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
const NO_INCERCARI: Incercare[] = []

export function TacticsChestPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isPro } = useSubscription()
  const { user, profile } = useAuth()

  // Index ușor (id + rating + teme) — o singură interogare pentru toate traseele.
  //
  // Cerut pe pagini, nu dintr-o dată: PostgREST întoarce cel mult 1000 de rânduri
  // şi nu spune nicăieri că a tăiat restul. Cu 1298 de puzzle-uri în bancă,
  // pagina primea 1000, iar tacticile ale căror puzzle-uri cădeau în coadă
  // arătau „0/2 rezolvate" în loc de „0/20" — traseul părea gol, deşi era plin.
  const { data: rows } = useQuery({
    queryKey: ['tactics-index'],
    queryFn: async () => {
      const PAGINA = 1000
      const tot: PuzzleIndexRow[] = []
      for (let deLa = 0; ; deLa += PAGINA) {
        const { data, error } = await supabase
          .from('puzzles')
          .select('id, rating, themes')
          .order('id')
          .range(deLa, deLa + PAGINA - 1)
        if (error || !data?.length) break
        tot.push(...(data as PuzzleIndexRow[]))
        if (data.length < PAGINA) break
      }
      return tot
    },
  })

  // Toate încercările, nu doar cele reuşite: din ratări ies harta punctelor
  // slabe şi lista de repetat. Se cer o singură dată, tot pe pagini.
  const { data: incercariRaw } = useQuery({
    queryKey: ['tactics-attempts', user?.id],
    queryFn: async () => {
      if (!user) return [] as Incercare[]
      const PAGINA = 1000
      const tot: Incercare[] = []
      for (let deLa = 0; ; deLa += PAGINA) {
        const { data, error } = await supabase
          .from('user_puzzle_attempts')
          .select('puzzle_id, solved, attempted_at')
          .eq('user_id', user.id)
          .order('attempted_at')
          .range(deLa, deLa + PAGINA - 1)
        if (error || !data?.length) break
        tot.push(...(data as Incercare[]))
        if (data.length < PAGINA) break
      }
      return tot
    },
    enabled: !!user,
  })

  const puzzles = rows ?? NO_ROWS
  const incercari = incercariRaw ?? NO_INCERCARI
  const solved: ReadonlySet<string> = useMemo(
    () => new Set(incercari.filter(i => i.solved).map(i => i.puzzle_id)),
    [incercari],
  )

  // Harta punctelor slabe, ce e de repetat azi şi tema zilei — toate din aceleaşi
  // încercări, fără nicio interogare în plus.
  const niveluri = useMemo(
    () => niveluriPeTeme(incercari, puzzles, TACTIC_CATEGORIES),
    [incercari, puzzles],
  )
  const slaba = useMemo(() => temaSlaba(niveluri), [niveluri])
  const deRepetatAzi = useMemo(() => deRepetat(incercari), [incercari])
  const temaDeAzi = useMemo(() => temaZilei(TACTIC_CATEGORIES), [])

  // Traseele + progresul, calculate o singură dată și partajate cu rândurile și hero-ul.
  const tierData = useMemo(() => {
    return TACTIC_TIERS.map(tier => {
      const cards: CardData[] = TACTIC_CATEGORIES
        // Fiecare cufăr arată doar tacticile de la nivelul lui în sus.
        .filter(cat => categoryInTier(cat, tier))
        .map(cat => {
          // Proba are zece poziţii luate pe rând din temele cufărului, nu primele
          // douăzeci ale unei singure teme.
          const ids = cat.fel === 'proba'
            ? pickTrial(puzzles, TACTIC_CATEGORIES, tier).map(p => p.id)
            : pickPathIds(puzzles, cat, tier)
          return { cat, total: ids.length, solvedCount: ids.filter(id => solved.has(id)).length }
        })
        .filter(c => c.total > 0 || (c.cat.isPro && !isPro))
      return { tier, cards }
    })
  }, [puzzles, solved, isPro])

  const stats = useMemo(() => {
    let solvedCount = 0
    let complete = 0
    let paths = 0
    for (const { cards } of tierData) {
      for (const c of cards) {
        if (c.total === 0) continue
        paths++
        solvedCount += c.solvedCount
        if (c.solvedCount === c.total) complete++
      }
    }
    return { solvedCount, complete, paths }
  }, [tierData])

  const playerElo = profile?.estimated_elo

  // La ce cufăr trimitem pe cineva pentru o temă: cel care-i cuprinde nivelul,
  // dar nu sub pragul temei — n-are rost să-l trimiţi la un cufăr unde tema nici
  // nu apare.
  function cufarulPotrivit(cat: TacticCategory): TacticTier {
    const dupaElo = TACTIC_TIERS.find(t => (playerElo ?? 600) >= t.floor && (playerElo ?? 600) < t.ceil)
    const candidat = dupaElo ?? TACTIC_TIERS[0]
    return categoryInTier(cat, candidat)
      ? candidat
      : (TACTIC_TIERS.find(t => categoryInTier(cat, t)) ?? TACTIC_TIERS[0])
  }

  // Poziţiile de repetat, deschise una după alta în fereastra de puzzle.
  const [repetitie, setRepetitie] = useState<Puzzle[] | null>(null)
  const [indexRepetitie, setIndexRepetitie] = useState(0)
  async function pornesteRepetitia() {
    const { data } = await supabase
      .from('puzzles')
      .select('id, fen, rating, themes, moves, game_url, title')
      .in('id', deRepetatAzi.slice(0, 10))
    if (data?.length) {
      setRepetitie(data as Puzzle[])
      setIndexRepetitie(0)
    }
  }

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
          <CalutulOmniscient size={132} mood="happy" />
        </div>
        <div className="relative mx-auto max-w-[44rem] px-6 py-7 text-center">
          {/* Titlul stă în bara shell-ului; hero-ul păstrează doar descrierea şi statisticile */}
          <p className="text-sm text-[#A0A0A0]">
            Găsește mutarea cea mai potrivită în poziții variate, pe diverse grade de dificultate.
          </p>
          {/* Trei cifre: pe telefon intră două pe rând, deci a treia rămânea
              singură şi dezechilibra antetul. În grilă, ultima se întinde pe
              toată lăţimea şi arată intenţionat. */}
          <div className="mt-5 grid grid-cols-2 justify-items-center gap-x-4 gap-y-5 sm:flex sm:flex-wrap sm:justify-center sm:gap-6 [&>*:last-child:nth-child(odd)]:col-span-2">
            <HeroStat
              icon={Dumbbell}
              bifa
              value={stats.solvedCount}
              label="exerciții rezolvate"
              color="#4ade80"
            />
            <HeroStat
              icon={TrendingUp}
              value={`${stats.complete}/${stats.paths}`}
              label="tactici complete"
              color="#E2B340"
            />
            {playerElo != null && (
              <HeroStat icon={Gauge} value={`~${playerElo}`} label="ELO estimat" color="#2DD4BF" />
            )}
          </div>
        </div>
      </div>

      {/* Banda de antrenor: ce ştim despre tine din ce ai rezolvat până acum.
          Apare doar când chiar avem ce spune — fără date, ar fi trei casete goale
          care ocupă locul cuferelor. */}
      {(slaba || deRepetatAzi.length > 0 || temaDeAzi) && (
        <div className="grid gap-3 sm:grid-cols-3">
          {slaba && (
            <FisaAntrenor
              icon={Target}
              culoare="#FB7185"
              eticheta="Punctul tău slab"
              titlu={slaba.categorie.title}
              detaliu={`nivel ~${slaba.nivel} · ${slaba.procentReusita}% reușite din ${slaba.incercari}`}
              actiune="Antrenează asta"
              onClick={() => navigate(`/tactics/${slaba.categorie.id}/${cufarulPotrivit(slaba.categorie).id}`)}
            />
          )}
          {deRepetatAzi.length > 0 && (
            <FisaAntrenor
              icon={RotateCcw}
              culoare="#E2B340"
              eticheta="De repetat azi"
              titlu={`${deRepetatAzi.length} ${deRepetatAzi.length === 1 ? 'poziție' : 'poziții'}`}
              detaliu="Le-ai ratat mai demult. Se întorc până le vezi."
              actiune="Repetă acum"
              onClick={() => void pornesteRepetitia()}
            />
          )}
          {temaDeAzi && (
            <FisaAntrenor
              icon={Flame}
              culoare="#4ade80"
              eticheta="Tema zilei · XP dublu"
              titlu={temaDeAzi.title}
              detaliu="Azi, fiecare poziție din tema asta valorează dublu."
              actiune="Începe"
              onClick={() => navigate(`/tactics/${temaDeAzi.id}/${cufarulPotrivit(temaDeAzi).id}`)}
            />
          )}
        </div>
      )}

      {repetitie && (
        <PuzzleModal
          theme="mixed"
          initialPuzzle={repetitie[indexRepetitie]}
          onClose={() => setRepetitie(null)}
          onSolved={() => void queryClient.invalidateQueries({ queryKey: ['tactics-attempts'] })}
          onNext={indexRepetitie < repetitie.length - 1
            ? () => setIndexRepetitie(i => i + 1)
            : undefined}
        />
      )}

      {/* Cuferele, unul lângă altul. Închise, pagina nu arată decât scara
          materialelor — lemn, argint, aur, smarald. Eticheta, numărătoarea şi
          tacticile apar abia după ce deschizi unul, ca să nu se reverse tot
          conţinutul din prima. */}
      {/* 2×2 pe telefon, un rând pe ecran lat. Cu `flex-wrap`, patru cufere de
          112px pe un ecran de 390 se rupeau 3+1 — un rând plin şi unul cu un
          singur cufăr rătăcit sub el. */}
      <div className="grid grid-cols-2 place-items-center gap-x-2 gap-y-5 sm:flex sm:flex-wrap sm:items-end sm:justify-center sm:gap-6">
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
        <TacticsModal
          // `key` remontează fereastra la fiecare cufăr: altfel React ar
          // refolosi nodurile şi animaţia cardurilor n-ar mai porni.
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
 * Un cufăr închis, ca buton, cu intervalul lui de ELO deasupra.
 *
 * Numele treptei rămâne doar în `title` şi `aria-label`: intervalul spune deja
 * pentru cine e cufărul, iar patru nume scrise sub patru cifre ar fi umplut
 * rândul cu text — exact ce s-a scos din pagină.
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
      className="group flex w-full max-w-[9.5rem] flex-col items-center gap-2 rounded-2xl p-1 transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 sm:w-48 sm:max-w-none"
      style={{ outlineColor: color }}
    >
      <span
        className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap transition-colors duration-200"
        style={{
          backgroundColor: `${color}${open ? '33' : '1A'}`,
          color,
          border: `1px solid ${color}${open ? '55' : '2A'}`,
        }}
      >
        ELO {tier.floor}–{tier.ceil}
      </span>

      <span className="relative flex aspect-square w-full items-center justify-center">
        {/* Aura din spate. Se aprinde când cufărul e deschis — singurul semn de
            care e nevoie, fiindcă lista apare oricum într-o fereastră. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at 50% 52%, ${color}${open ? '3D' : '1A'}, transparent 68%)`,
          }}
        />
        {areImagine ? (
          <img
            src={`/tactics/${tier.id}.png`}
            alt=""
            onError={() => setAreImagine(false)}
            className={`relative h-full w-full object-contain transition-transform duration-200 group-hover:scale-105 ${open ? 'scale-105' : ''}`}
          />
        ) : (
          <span
            className="relative flex h-10 w-10 items-center justify-center rounded-xl sm:h-14 sm:w-14"
            style={{ backgroundColor: `${color}1F`, color }}
          >
            <Icon className="h-5 w-5 sm:h-7 sm:w-7" />
          </span>
        )}
      </span>
    </button>
  )
}

/**
 * O cifră din antet, cu semnul ei.
 *
 * Iconiţa nu e decor: la o privire rapidă se vede ce fel de cifră e, fără să
 * citeşti eticheta. Gantera pentru repetiţie, săgeata de trend pentru cât ai
 * dus până la capăt, cadranul pentru o măsurătoare aproximativă — de aceea
 * ELO-ul estimat are cadran, nu trofeu: e o citire, nu o realizare.
 */
function HeroStat({ icon: Icon, value, label, color, bifa = false }: {
  icon: LucideIcon
  value: number | string
  label: string
  color: string
  /** Bifa mică din colţ — doar la exerciţiile rezolvate. */
  bifa?: boolean
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}1A`, color }}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
        {bifa && (
          <span
            className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#141414]"
            style={{ backgroundColor: color }}
          >
            <Check className="h-2.5 w-2.5 text-[#0A0A0A]" strokeWidth={4} />
          </span>
        )}
      </span>
      <div>
        <p className="text-2xl font-black leading-none" style={{ color }}>{value}</p>
        <p className="mt-1 text-xs text-[#6B6B6B]">{label}</p>
      </div>
    </div>
  )
}

/**
 * Tacticile unei trepte, într-o fereastră separată.
 *
 * Cufărul rămâne la vedere în antetul ferestrei — el e ce ai deschis, deci
 * n-are ce căuta în spatele unui văl. Restul paginii, inclusiv celelalte trei
 * cufere, trece sub fundalul întunecat.
 */
function TacticsModal({ tier, cards, isPro, onClose }: {
  tier: TacticTier
  cards: CardData[]
  isPro: boolean
  onClose: () => void
}) {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const scroll = (dir: number) => scrollRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })

  // Când tacticile încap toate în fereastră nu e nimic de derulat, deci nici
  // săgeţile şi nici linia de deasupra lor n-au ce căuta acolo. Se măsoară, nu
  // se ghiceşte din numărul de carduri: acelaşi număr încape sau nu, după cât
  // de lat e ecranul.
  const [poateDerula, setPoateDerula] = useState(false)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const masoara = () => setPoateDerula(el.scrollWidth > el.clientWidth + 1)
    masoara()
    const ro = new ResizeObserver(masoara)
    ro.observe(el)
    return () => ro.disconnect()
  }, [cards.length])

  // Escape închide, iar pagina de dedesubt nu mai derulează cât e fereastra
  // deschisă. Scroll-ul nu e pe `body`, ci pe `<main>` — vezi AppLayout.
  useEffect(() => {
    const laTasta = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', laTasta)
    const zona = document.querySelector('main')
    const inainte = zona?.style.overflowY
    if (zona) zona.style.overflowY = 'hidden'
    return () => {
      document.removeEventListener('keydown', laTasta)
      if (zona) zona.style.overflowY = inainte ?? ''
    }
  }, [onClose])

  const color = tierColor(tier.id)
  const started = cards.filter(c => c.solvedCount > 0).length

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Tactici ${tier.label}`}
        onClick={e => e.stopPropagation()}
        className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#141414] shadow-[0_24px_80px_rgba(0,0,0,0.7)]"
        // Aceeaşi lăţime cu a conţinutului paginii (`--app-max`), minus
        // marginile ferestrei. Legată de token, nu de o cifră scrisă aici:
        // altfel, pe ecrane mari fereastra rămânea mai îngustă decât antetul
        // din spatele ei şi arăta ca o casetă pierdută în mijloc.
        style={{ maxWidth: 'calc(var(--app-max) - 2 * var(--app-pad))', animation: 'pop-in 0.28s ease-out' }}
      >
        {/* Antetul: cufărul, ca să se vadă în continuare ce ai deschis */}
        <div className="relative flex flex-shrink-0 items-center gap-4 border-b border-[#2A2A2A] p-4 sm:gap-5 sm:p-5">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-72"
            style={{ background: `radial-gradient(ellipse 62% 74% at 30% 50%, ${color}24, transparent 70%)` }}
          />
          <img
            src={`/tactics/${tier.id}.png`}
            alt=""
            className="relative h-24 w-24 flex-shrink-0 object-contain sm:h-36 sm:w-36"
          />
          <div className="relative min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
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
          <button
            onClick={onClose}
            aria-label="Închide"
            className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#2A2A2A] bg-[#1C1C1C] text-[#A0A0A0] transition-colors hover:border-[#3A3A3A] hover:text-[#F0F0F0]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Corpul: săgețile și caruselul */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {poateDerula && (
            <div className="mb-3 flex items-center justify-between">
              <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${color}66, transparent)` }} />
              <div className="ml-4 flex flex-shrink-0 gap-1.5">
                {[-1, 1].map(dir => (
                  <button
                    key={dir}
                    onClick={() => scroll(dir)}
                    aria-label={dir < 0 ? 'Înapoi' : 'Înainte'}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2A2A2A] bg-[#1C1C1C] text-[#A0A0A0] transition-colors hover:border-[#3A3A3A] hover:text-[#F0F0F0]"
                  >
                    {dir < 0 ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Două rânduri care derulează împreună, nu unul singur: fereastra e
              lată acum, iar un singur rând ar lăsa jumătate din ea goală. Cu
              grid pe coloane, săgeţile duc tot orizontal, deci rămân utile.
              Sub şapte tactici trece pe un rând, ca să nu iasă o coloană
              singuratică lângă un gol.

              Coloanele sunt `minmax(...,1fr)`, nu lăţime fixă: cu lăţime fixă,
              cinci carduri de 16rem cereau 1344px pe 1229 disponibili, deci
              ultimul rămânea tăiat de marginea ferestrei degeaba. Aşa, când
              încap, se întind până în capăt; când nu încap, se opresc la minim
              şi carusélul îşi face treaba. */}
          <div
            ref={scrollRef}
            className={`grid ${cards.length > 6 ? 'grid-rows-2' : 'grid-rows-1'} auto-cols-[minmax(13rem,1fr)] grid-flow-col gap-4 overflow-x-auto pb-2 snap-x scroll-smooth sm:auto-cols-[minmax(14rem,1fr)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
          >
            {cards.map(({ cat, total, solvedCount }, i) => (
              <div
                key={cat.id}
                className="snap-start"
                // Se aşază pe rând, stânga→dreapta. Întârzierea se opreşte după
                // al optulea: cu paisprezece tactici, ultimele ar fi apărut la
                // peste o secundă, adică o aşteptare, nu o animaţie.
                style={{
                  animation: 'iese-din-cufar 0.38s ease-out both',
                  animationDelay: `${0.08 + Math.min(i, 7) * 0.045}s`,
                }}
              >
                <TacticCard
                  category={cat}
                  total={total}
                  solvedCount={solvedCount}
                  culoareTreapta={color}
                  locked={cat.isPro && !isPro}
                  onClick={() => navigate(cat.isPro && !isPro ? '/pricing' : `/tactics/${cat.id}/${tier.id}`)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


// Cardul unui tip de tactică: ICON + CULOARE proprie + progres Duolingo.
function TacticCard({ category, total, solvedCount, culoareTreapta, locked, onClick }: {
  category: TacticCategory
  total: number
  solvedCount: number
  /** Culoarea materialului din care e cufărul: lemn, argint, aur, smarald. */
  culoareTreapta: string
  locked: boolean
  onClick: () => void
}) {
  // Două culori, fiecare cu rolul ei — nu paisprezece, câte una per tactică.
  //
  // `color` e galbenul aplicaţiei: îndemnul la acţiune, „Începe →".
  // `culoareTreapta` e materialul cufărului — lemn, argint, aur, smarald — şi
  // ţine progresul: cât ai făcut în cufărul ăsta se vede în culoarea lui.
  // Verdele rămâne doar pentru traseele terminate.
  const color = '#E2B340'
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
        <TacticTile id={category.id} size="h-24 w-24" iconSize="h-8 w-8" />
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
                <span className="font-semibold" style={{ color: culoareTreapta }}>{pct}%</span>
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
              style={{ width: `${locked ? 0 : pct}%`, backgroundColor: done ? '#4ade80' : culoareTreapta }}
            />
          </div>
        </div>
      </div>
    </button>
  )
}

/**
 * O fişă din banda de antrenor: ce ştim despre tine şi ce poţi face cu asta.
 *
 * Trei bucăţi, mereu în aceeaşi ordine: eticheta (ce fel de sfat e), lucrul
 * despre care e vorba, şi o cifră care spune de ce ţi-l dăm. Fără cifră ar fi
 * doar o părere.
 */
function FisaAntrenor({ icon: Icon, culoare, eticheta, titlu, detaliu, actiune, onClick }: {
  icon: LucideIcon
  culoare: string
  eticheta: string
  titlu: string
  detaliu: string
  actiune: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-start gap-3 rounded-xl border border-[#2A2A2A] bg-[#141414] p-4 text-left transition-colors hover:border-[#3A3A3A]"
    >
      <span
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${culoare}1A`, color: culoare }}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: culoare }}>
          {eticheta}
        </span>
        <span className="mt-0.5 block truncate font-display text-sm font-bold text-[#F0F0F0]">{titlu}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-[#6B6B6B]">{detaliu}</span>
        <span className="mt-1.5 flex items-center gap-1 text-xs font-semibold" style={{ color: culoare }}>
          {actiune} <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </span>
    </button>
  )
}
