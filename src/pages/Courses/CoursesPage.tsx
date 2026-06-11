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
    case 'C': return { from: '#1f0a0a', to: '#6b1515', accent: '#d44a4a', piece: '♞' }  // e4 e5 - red
    case 'D': return { from: '#0a1a0f', to: '#145c20', accent: '#4ade80', piece: '♛' }  // d4 closed - green
    case 'E': return { from: '#1f1200', to: '#6b3d00', accent: '#c8a84b', piece: '♜' }  // Indian - amber
    default:  return { from: '#111111', to: '#2a2219', accent: '#c8a84b', piece: '♟' }  // Fundamental
  }
}

const STYLE_ICONS: Record<PlayingStyle, React.ReactNode> = {
  offensive: <Flame className="h-3 w-3" />,
  balanced: <Scale className="h-3 w-3" />,
  pragmatic: <Zap className="h-3 w-3" />,
  defensive: <Shield className="h-3 w-3" />,
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
      <div className="relative rounded-2xl overflow-hidden border border-[#2a2a2a]"
        style={{ background: 'linear-gradient(135deg, #0d0d0d 0%, #1a150a 50%, #0d0d0d 100%)' }}>
        <div className="absolute inset-0 opacity-5 text-[200px] flex items-center justify-end pr-8 select-none pointer-events-none leading-none">
          ♛
        </div>
        <div className="relative px-6 py-8">
          <h1 className="text-3xl font-black text-[#f0f0f0] tracking-tight">Cursuri interactive</h1>
          <p className="text-[#888] mt-2 text-sm max-w-md">
            Stăpânește deschiderile preferate. Fiecare curs îți construiește repertoriul cu poziții reale și explicații clare.
          </p>
          <div className="flex gap-6 mt-5">
            <div>
              <p className="text-2xl font-black text-[#c8a84b]">{totalCourses}</p>
              <p className="text-xs text-[#555]">cursuri disponibile</p>
            </div>
            {completedCourses > 0 && (
              <div>
                <p className="text-2xl font-black text-[#4ade80]">{completedCourses}</p>
                <p className="text-xs text-[#555]">finalizate</p>
              </div>
            )}
            <div>
              <p className="text-2xl font-black text-[#f0f0f0]">{isPro ? '∞' : '3'}</p>
              <p className="text-xs text-[#555]">acces {isPro ? 'complet' : 'gratuit'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#555]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Caută deschidere..."
            className="h-9 rounded-lg border border-[#2a2a2a] bg-[#111] pl-9 pr-3 text-sm text-[#f0f0f0] placeholder-[#555] focus:outline-none focus:border-[#c8a84b] w-48 transition-colors"
          />
        </div>
        <div className="h-5 w-px bg-[#2a2a2a]" />
        <div className="flex gap-1.5">
          {LEVELS.map(l => (
            <button
              key={l.value}
              onClick={() => setLevelFilter(levelFilter === l.value ? 'all' : l.value)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                levelFilter === l.value
                  ? 'bg-[#c8a84b] text-black shadow-[0_0_12px_rgba(200,168,75,0.4)]'
                  : 'bg-[#111] border border-[#2a2a2a] text-[#666] hover:text-[#a0a0a0] hover:border-[#3a3a3a]'
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
            <div className="h-px flex-1 bg-[#1e1e1e]" />
            <span className="text-xs font-bold text-[#c8a84b] uppercase tracking-widest">Înainte de orice altceva — Gratuit</span>
            <div className="h-px flex-1 bg-[#1e1e1e]" />
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
            <p className="text-center text-[#555] py-20">Niciun curs nu corespunde filtrelor selectate.</p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-[#555]">{filtered.length} {filtered.length === 1 ? 'curs' : 'cursuri'}</span>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

function CourseCard({ course, isPro, featured = false }: { course: Course; isPro: boolean; featured?: boolean }) {
  const locked = course.is_premium && !isPro
  const completedLessons = course.progress?.completed_lesson_ids.length ?? 0
  const pct = course.lesson_count > 0 ? Math.round((completedLessons / course.lesson_count) * 100) : 0
  const theme = getEcoTheme(course.eco_code)
  const thumbH = featured ? 'h-44' : 'h-40'

  return (
    <Link to={locked ? '/pricing' : `/courses/${course.slug}`} className="group block">
      <div className={`rounded-2xl border bg-[#111] transition-all duration-200 h-full flex flex-col overflow-hidden ${
        locked
          ? 'border-[#222] hover:border-[#2a2a2a]'
          : 'border-[#1e1e1e] hover:border-[#3a3a3a] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
      }`}>

        {/* Thumbnail — imagine tematică a deschiderii */}
        <div className={`relative ${thumbH} overflow-hidden`}
          style={{ background: `linear-gradient(135deg, ${theme.from} 0%, ${theme.to} 100%)` }}>

          {/* Imaginea cursului */}
          <img
            src={`/openings/${course.slug}.png`}
            alt={course.title}
            loading="lazy"
            onError={e => { e.currentTarget.style.display = 'none' }}
            className={`absolute inset-0 h-full w-full object-cover object-center transition-transform duration-200 group-hover:scale-105 ${locked ? 'opacity-70' : ''}`}
          />

          {/* Level badge top-right */}
          <div className="absolute top-3 right-3 z-10">
            {locked ? (
              <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded bg-[rgba(200,168,75,0.9)] text-black">
                <Lock className="h-2.5 w-2.5" /> PRO
              </span>
            ) : course.level === 'fundamental' ? (
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#4ade80]/90 text-black">GRATUIT</span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/50 text-[#a0a0a0] border border-[#333]">
                {LEVEL_LABELS[course.level]}
              </span>
            )}
          </div>

          {/* Title overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pt-8 pb-3"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }}>
            <h3 className={`font-black text-white leading-tight group-hover:text-[${theme.accent}] transition-colors ${featured ? 'text-base' : 'text-sm'}`}
              style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}>
              {course.title}
            </h3>
          </div>

          {/* Dimmer on locked */}
          {locked && <div className="absolute inset-0 bg-black/30" />}
        </div>

        {/* Card body */}
        <div className="px-4 py-3 flex flex-col flex-1 gap-2">
          {/* Opening family */}
          {course.opening_family && (
            <p className="text-xs text-[#555] truncate">{course.opening_family}</p>
          )}

          {/* Playing styles */}
          {course.playing_styles.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {course.playing_styles.map(style => (
                <span key={style}
                  className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-[#666]">
                  {STYLE_ICONS[style]}
                  {PLAYING_STYLE_LABELS[style]}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto pt-1">
            <div className="flex items-center justify-between text-xs text-[#555] mb-1.5">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {course.lesson_count} {course.lesson_count === 1 ? 'lecție' : 'lecții'}
              </span>
              {completedLessons > 0 && (
                <span className={pct === 100 ? 'text-[#4ade80] font-semibold' : 'text-[#c8a84b]'}>
                  {pct === 100 ? '✓ Complet' : `${pct}%`}
                </span>
              )}
            </div>
            {completedLessons > 0 && (
              <div className="h-1 rounded-full bg-[#1a1a1a] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#4ade80' : theme.accent }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
