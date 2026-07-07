import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, Lock, Search, Flame, Shield, Zap, Scale, ChevronLeft, ChevronRight, Star, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useSubscription } from '@/hooks/useSubscription'
import { useAuth } from '@/hooks/useAuth'
import { Spinner } from '@/components/ui/Spinner'
import type { Course, CourseLevel, PlayingStyle, Profile } from '@/types'
import { LEVEL_LABELS, PLAYING_STYLE_LABELS } from '@/types'

// Color palette per ECO family
function getEcoTheme(eco?: string | null) {
  const prefix = eco?.[0]?.toUpperCase()
  switch (prefix) {
    case 'A': return { from: '#0f1729', to: '#1a2d6b', accent: '#4a7fd4', piece: '♟' }  // Flank/English - blue
    case 'B': return { from: '#1a0f2e', to: '#3d1260', accent: '#9b59d4', piece: '♝' }  // Semi-open - purple
    case 'C': return { from: '#1f0a0a', to: '#6b1515', accent: '#FB7185', piece: '♞' }  // e4 e5 - red
    case 'D': return { from: '#0a1a0f', to: '#145c20', accent: '#4ade80', piece: '♛' }  // d4 closed - green
    case 'E': return { from: '#1f1200', to: '#6b3d00', accent: '#E2B340', piece: '♜' }  // Indian - amber
    default:  return { from: '#141414', to: '#1C1C1C', accent: '#E2B340', piece: '♟' }  // Fundamental
  }
}

const STYLE_ICONS: Record<PlayingStyle, React.ReactNode> = {
  offensive: <Flame className="h-3.5 w-3.5" />,
  balanced: <Scale className="h-3.5 w-3.5" />,
  pragmatic: <Zap className="h-3.5 w-3.5" />,
  defensive: <Shield className="h-3.5 w-3.5" />,
}

// Subtitlul familiei deschiderii, în română (per slug)
const FAMILY_RO: Record<string, string> = {
  'london-system': 'Sistemul Londra',
  'italian-game': 'Partida Italiană',
  'kings-gambit': 'Gambitul Regelui',
  'queens-gambit': 'Gambitul Damei',
  'catalan-opening': 'Deschiderea Catalană',
  'ruy-lopez': 'Partida Spaniolă',
  'english-opening': 'Deschiderea Engleză',
  'kings-indian-attack': 'Atacul Regelui Indian',
  'colle-system': 'Sistemul Colle',
  'vienna-game': 'Jocul Vienez',
  'sicilian-defense': 'Apărarea Siciliană',
  'french-defense': 'Apărarea Franceză',
  'caro-kann-defense': 'Apărarea Caro-Kann',
  'kings-indian-defense': 'Apărarea Regelui Indian',
  'nimzo-indian-defense': 'Apărarea Nimzo-Indiană',
  'dutch-defense': 'Apărarea Olandeză',
  'slav-defense': 'Apărarea Slavă',
  'pirc-defense': 'Apărarea Pirc',
  'scandinavian-defense': 'Apărarea Scandinavă',
  'alekhine-defense': 'Apărarea Alekhine',
}

const LEVELS: { value: CourseLevel | 'all'; label: string }[] = [
  { value: 'beginner', label: 'Începător' },
  { value: 'intermediate', label: 'Mediu' },
  { value: 'advanced', label: 'Avansat' },
]

// Clasificare culoare: apărările (slug cu "-defense") sunt pentru negru, restul pentru alb.
function courseColor(course: Course): 'white' | 'black' {
  return course.slug.includes('defense') ? 'black' : 'white'
}

// Nivelul de curs derivat din rating-ul testului de plasament.
function ratingToLevel(rating: number): CourseLevel {
  if (rating < 1000) return 'beginner'
  if (rating < 1600) return 'intermediate'
  return 'advanced'
}

// Un curs e "Recomandat" doar dacă utilizatorul a făcut testul de plasament și cursul
// se potrivește nivelului lui (+ stilului de joc, dacă acesta e setat).
function isRecommended(course: Course, profile: Profile | null): boolean {
  if (!profile?.puzzle_rating) return false          // fără test de plasament → nimic
  if (course.level === 'fundamental') return false
  if (course.level !== ratingToLevel(profile.puzzle_rating)) return false
  if (profile.playing_style) return course.playing_styles.includes(profile.playing_style)
  return true
}

export function CoursesPage() {
  const { isPro } = useSubscription()
  const { profile } = useAuth()
  const [levelFilter, setLevelFilter] = useState<CourseLevel | 'all'>('all')
  const [search, setSearch] = useState('')

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data } = await supabase.from('courses').select('*').order('order_index')
      return (data ?? []) as Course[]
    },
  })

  const fundamentals = (courses ?? []).filter(c => c.level === 'fundamental')

  const filtered = (courses ?? []).filter(c => {
    if (c.level === 'fundamental') return false
    if (levelFilter !== 'all' && c.level !== levelFilter) return false
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !(c.opening_family ?? '').toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Ordine: recomandatele primele, apoi pe nivel (începător → avansat).
  const levelRank: Record<CourseLevel, number> = { fundamental: 0, beginner: 1, intermediate: 2, advanced: 3 }
  const sortCourses = (list: Course[]) => [...list].sort((a, b) => {
    const ra = isRecommended(a, profile) ? 0 : 1
    const rb = isRecommended(b, profile) ? 0 : 1
    if (ra !== rb) return ra - rb
    return levelRank[a.level] - levelRank[b.level]
  })
  const whiteCourses = sortCourses(filtered.filter(c => courseColor(c) === 'white'))
  const blackCourses = sortCourses(filtered.filter(c => courseColor(c) === 'black'))
  const hasPlacement = !!profile?.puzzle_rating

  const totalCourses = courses?.length ?? 0
  const completedCourses = (courses ?? []).filter(c => {
    const pct = c.lesson_count > 0 ? (c.progress?.completed_lesson_ids.length ?? 0) / c.lesson_count : 0
    return pct === 1
  }).length

  return (
    <div className="space-y-8">

      {/* Hero header */}
      <div className="relative rounded-2xl overflow-hidden border border-[#2A2A2A]"
        style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #1C1C1C 50%, #0A0A0A 100%)' }}>
        <div className="absolute inset-0 opacity-5 text-[200px] flex items-center justify-end pr-8 select-none pointer-events-none leading-none">
          ♛
        </div>
        <div className="relative px-6 py-8">
          <h1 className="text-3xl font-black text-[#F0F0F0] tracking-tight">Cursuri interactive</h1>
          <p className="text-[#A0A0A0] mt-2 text-sm max-w-md">
            Stăpânește deschiderile preferate. Fiecare curs îți construiește repertoriul cu poziții reale și explicații clare.
          </p>
          <div className="flex gap-6 mt-5">
            <div>
              <p className="text-2xl font-black text-[#E2B340]">{totalCourses}</p>
              <p className="text-xs text-[#6B6B6B]">cursuri disponibile</p>
            </div>
            {completedCourses > 0 && (
              <div>
                <p className="text-2xl font-black text-[#4ade80]">{completedCourses}</p>
                <p className="text-xs text-[#6B6B6B]">finalizate</p>
              </div>
            )}
            <div>
              <p className="text-2xl font-black text-[#F0F0F0]">{isPro ? '∞' : '3'}</p>
              <p className="text-xs text-[#6B6B6B]">acces {isPro ? 'complet' : 'gratuit'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6B6B6B]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Caută deschidere..."
            className="h-9 rounded-lg border border-[#2A2A2A] bg-[#141414] pl-9 pr-3 text-sm text-[#F0F0F0] placeholder-[#6B6B6B] focus:outline-none focus:border-[#E2B340] w-48 transition-colors"
          />
        </div>
        <div className="h-5 w-px bg-[#2A2A2A]" />
        <div className="flex gap-1.5">
          {LEVELS.map(l => (
            <button
              key={l.value}
              onClick={() => setLevelFilter(levelFilter === l.value ? 'all' : l.value)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                levelFilter === l.value
                  ? 'bg-[#E2B340] text-black shadow-[0_0_12px_rgba(226,179,64,0.4)]'
                  : 'bg-[#141414] border border-[#2A2A2A] text-[#6B6B6B] hover:text-[#A0A0A0] hover:border-[#3A3A3A]'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fundamentals — special wide cards */}
      {!isLoading && fundamentals.length > 0 && levelFilter === 'all' && !search && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-[#141414]" />
            <span className="text-xs font-bold text-[#E2B340] uppercase tracking-widest">Înainte de orice altceva — Gratuit</span>
            <div className="h-px flex-1 bg-[#141414]" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {fundamentals.map(course => (
              <CourseCard key={course.id} course={course} isPro={isPro} featured />
            ))}
          </div>
        </section>
      )}

      {/* Carusele pe culoare */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-[#6B6B6B] py-20">Niciun curs nu corespunde filtrelor selectate.</p>
      ) : (
        <div className="space-y-8">
          {/* Hint: fă testul de plasament pentru recomandări */}
          {!hasPlacement && (
            <Link
              to="/puzzles/placement"
              className="flex items-center gap-3 rounded-xl border border-[rgba(226,179,64,0.3)] bg-[rgba(226,179,64,0.08)] px-4 py-3 text-sm hover:bg-[rgba(226,179,64,0.14)] transition-colors"
            >
              <Sparkles className="h-4 w-4 text-[#E2B340] flex-shrink-0" />
              <span className="text-[#F0F0F0]">
                Fă <span className="font-semibold text-[#E2B340]">testul de plasament</span> ca să primești cursuri recomandate pentru nivelul și stilul tău.
              </span>
              <ChevronRight className="h-4 w-4 text-[#E2B340] ml-auto flex-shrink-0" />
            </Link>
          )}

          {whiteCourses.length > 0 && (
            <CourseCarousel title="Deschideri cu Albul" courses={whiteCourses} isPro={isPro} profile={profile} />
          )}
          {blackCourses.length > 0 && (
            <CourseCarousel title="Deschideri cu Negrul" courses={blackCourses} isPro={isPro} profile={profile} />
          )}
        </div>
      )}
    </div>
  )
}

// Carusel orizontal cu derulare prin săgeți (stil Chessly).
function CourseCarousel({ title, courses, isPro, profile }: {
  title: string; courses: Course[]; isPro: boolean; profile: Profile | null
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const scroll = (dir: number) => scrollRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#F0F0F0] uppercase tracking-wider flex items-center gap-2">
          {title}
          <span className="text-xs text-[#6B6B6B] font-normal normal-case">· {courses.length}</span>
        </h3>
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
        {courses.map(course => (
          <div key={course.id} className="w-64 sm:w-72 shrink-0 snap-start">
            <CourseCard course={course} isPro={isPro} recommended={isRecommended(course, profile)} />
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── STANDARD LOGO DE CURS (sursă unică de adevăr) ──────────────────────────
// Dimensiunea/poziția/încadrarea logo-urilor de curs. Reglează AICI ca să
// ajustezi TOATE logo-urile deodată. Poziția = colțul stânga-sus al cardului;
// încadrarea (object-cover + zoom) e standardizată în helper-ul `tokenIcon`.
const LOGO_SIZE = 'h-36 w-36'              // grilă: 144px (egal cu fundamentalele)
const LOGO_SIZE_FEATURED = 'h-36 w-36'     // featured: 144px
const LOGO_RADIUS = 'rounded-xl'           // colțuri logo
const LOGO_SCALE = 'scale-100'             // fără zoom — rama cu romburi ajunge fix la margine
const LOGO_SCALE_HOVER = 'group-hover:scale-[1.08]'

function CourseCard({ course, isPro, featured = false, recommended = false }: { course: Course; isPro: boolean; featured?: boolean; recommended?: boolean }) {
  const locked = course.is_premium && !isPro
  const completedLessons = course.progress?.completed_lesson_ids.length ?? 0
  const pct = course.lesson_count > 0 ? Math.round((completedLessons / course.lesson_count) * 100) : 0
  const theme = getEcoTheme(course.eco_code)
  const familyName = FAMILY_RO[course.slug] ?? course.opening_family ?? course.title

  // Eticheta de nivel/acces (reutilizată în ambele layout-uri)
  const levelBadge = locked ? (
    <span className="flex items-center gap-1 text-xs font-black px-3 py-1.5 rounded-full bg-[#E2B340] text-black">
      <Lock className="h-3 w-3" /> PRO
    </span>
  ) : course.level === 'fundamental' ? (
    <span className="text-xs font-black px-3 py-1.5 rounded-full bg-[rgba(74,222,128,0.15)] text-[#4ade80]">GRATUIT</span>
  ) : (
    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#1C1C1C] text-[#A0A0A0]">
      {LEVEL_LABELS[course.level]}
    </span>
  )

  // Iconul cursului — tile pătrat decupat curat (object-cover + zoom ușor care taie
  // marginea transparentă / haloul exterior), colțuri rotunjite ca pe Chessly
  const tokenIcon = (sizeClass: string) => (
    <div className={`relative ${sizeClass} ${LOGO_RADIUS} overflow-hidden shrink-0 bg-[#141414] shadow-[0_2px_10px_rgba(0,0,0,0.45)]`}>
      <img
        src={`/openings/${course.slug}.png`}
        alt={course.title}
        loading="lazy"
        onError={e => { e.currentTarget.style.display = 'none' }}
        className={`h-full w-full object-cover ${LOGO_SCALE} ${LOGO_SCALE_HOVER} transition-transform duration-200 ${locked ? 'opacity-60' : ''}`}
      />
      {locked && <div className="absolute inset-0 bg-black/30" />}
    </div>
  )

  // Footer: număr de lecții + progres (reutilizat)
  const metaFooter = (
    <div className="mt-auto pt-1.5">
      <div className="flex items-center justify-between text-sm text-[#6B6B6B] mb-2">
        <span className="flex items-center gap-1.5">
          <BookOpen className="h-4 w-4" />
          {course.lesson_count} {course.lesson_count === 1 ? 'lecție' : 'lecții'}
        </span>
        {completedLessons > 0 && (
          <span className={pct === 100 ? 'text-[#4ade80] font-semibold' : 'text-[#E2B340]'}>
            {pct === 100 ? '✓ Complet' : `${pct}%`}
          </span>
        )}
      </div>
      {completedLessons > 0 && (
        <div className="h-1.5 rounded-full bg-[#1C1C1C] overflow-hidden">
          <div className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#4ade80' : theme.accent }} />
        </div>
      )}
    </div>
  )

  const styleTags = course.playing_styles.length > 0 && (
    <div className="flex gap-2 flex-wrap">
      {course.playing_styles.map(style => (
        <span key={style}
          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#1C1C1C] border border-[#2A2A2A] text-[#6B6B6B]">
          {STYLE_ICONS[style]}
          {PLAYING_STYLE_LABELS[style]}
        </span>
      ))}
    </div>
  )

  const cardShell = locked
    ? 'border-[#1C1C1C] hover:border-[#2A2A2A]'
    : recommended
    ? 'border-[rgba(226,179,64,0.55)] shadow-[0_0_22px_rgba(226,179,64,0.15)] hover:border-[#E2B340] hover:-translate-y-1'
    : 'border-[#141414] hover:border-[#3A3A3A] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]'

  const recBadge = recommended ? (
    <span className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-[#E2B340] text-black shadow-[0_0_12px_rgba(226,179,64,0.5)]">
      <Star className="h-2.5 w-2.5 fill-black" /> RECOMANDAT
    </span>
  ) : null

  // Layout orizontal pentru cardurile featured (icon stânga + conținut dreapta), stil Chessly
  if (featured) {
    return (
      <Link to={locked ? '/pricing' : `/courses/${course.slug}`} className="group block">
        <div className={`rounded-2xl border bg-[#141414] transition-all duration-200 h-full flex gap-5 p-5 ${cardShell}`}>
          {tokenIcon(LOGO_SIZE_FEATURED)}
          <div className="flex flex-col flex-1 min-w-0 gap-2.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-bold text-[#F0F0F0] leading-tight truncate group-hover:text-[#E2B340] transition-colors">
                {familyName}
              </h3>
              {levelBadge}
            </div>
            {course.description && (
              <p className="text-sm text-[#A0A0A0] leading-relaxed line-clamp-2">{course.description}</p>
            )}
            {styleTags}
            {metaFooter}
          </div>
        </div>
      </Link>
    )
  }

  // Layout vertical (grila principală) — icon sus-stânga, descriere dedesubt
  return (
    <Link to={locked ? '/pricing' : `/courses/${course.slug}`} className="group block">
      <div className={`rounded-2xl border bg-[#141414] transition-all duration-200 h-full flex flex-col gap-4 p-5 ${cardShell}`}>
        <div className="flex items-start justify-between gap-2">
          {tokenIcon(LOGO_SIZE)}
          <div className="flex flex-col items-end gap-1.5">
            {recBadge}
            {levelBadge}
          </div>
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-lg text-[#F0F0F0] leading-tight truncate group-hover:text-[#E2B340] transition-colors">
            {familyName}
          </h3>
          {course.description && (
            <p className="mt-1.5 text-sm text-[#A0A0A0] leading-relaxed line-clamp-2">{course.description}</p>
          )}
        </div>
        {styleTags}
        {metaFooter}
      </div>
    </Link>
  )
}
