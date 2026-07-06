import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, Lock, Search, Flame, Shield, Zap, Scale } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useSubscription } from '@/hooks/useSubscription'
import { Spinner } from '@/components/ui/Spinner'
import type { Course, CourseLevel, PlayingStyle } from '@/types'
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

export function CoursesPage() {
  const { isPro } = useSubscription()
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

      {/* Main grid */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>
      ) : (
        <section>
          {filtered.length === 0 ? (
            <p className="text-center text-[#6B6B6B] py-20">Niciun curs nu corespunde filtrelor selectate.</p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-[#6B6B6B]">{filtered.length} {filtered.length === 1 ? 'curs' : 'cursuri'}</span>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map(course => (
                  <CourseCard key={course.id} course={course} isPro={isPro} />
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </div>
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

function CourseCard({ course, isPro, featured = false }: { course: Course; isPro: boolean; featured?: boolean }) {
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
    : 'border-[#141414] hover:border-[#3A3A3A] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]'

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
          {levelBadge}
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
