import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, Lock, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useSubscription } from '@/hooks/useSubscription'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Progress } from '@/components/ui/Progress'
import type { Course, CourseLevel, PlayingStyle } from '@/types'
import { LEVEL_LABELS, PLAYING_STYLE_LABELS } from '@/types'

const LEVELS: { value: CourseLevel | 'all'; label: string }[] = [
  { value: 'all', label: 'Toate' },
  { value: 'fundamental', label: 'Baze' },
  { value: 'beginner', label: 'Începător' },
  { value: 'intermediate', label: 'Intermediar' },
  { value: 'advanced', label: 'Avansat' },
]

const STYLES: { value: PlayingStyle | 'all'; label: string }[] = [
  { value: 'all', label: 'Toate stilurile' },
  { value: 'offensive', label: 'Ofensiv' },
  { value: 'balanced', label: 'Echilibrat' },
  { value: 'pragmatic', label: 'Pragmatic' },
  { value: 'defensive', label: 'Defensiv' },
]

export function CoursesPage() {
  const { isPro } = useSubscription()
  const [levelFilter, setLevelFilter] = useState<CourseLevel | 'all'>('all')
  const [styleFilter, setStyleFilter] = useState<PlayingStyle | 'all'>('all')
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
    if (c.level === 'fundamental') return false  // shown separately above
    if (levelFilter !== 'all' && c.level !== levelFilter) return false
    if (styleFilter !== 'all' && !c.playing_styles.includes(styleFilter)) return false
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !(c.opening_family ?? '').toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f0f0f0]">Cursuri interactive</h1>
        <p className="text-[#666] text-sm mt-0.5">{courses?.length ?? 0} cursuri disponibile</p>
      </div>

      {/* Filtre */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Caută deschidere..."
            className="h-9 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] pl-9 pr-3 text-sm text-[#f0f0f0] placeholder-[#666] focus:outline-none focus:border-[#c8a84b] w-48"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {LEVELS.map(l => (
            <button
              key={l.value}
              onClick={() => setLevelFilter(l.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                levelFilter === l.value
                  ? 'bg-[#c8a84b] text-black'
                  : 'bg-[#1a1a1a] border border-[#2a2a2a] text-[#a0a0a0] hover:border-[#3a3a3a]'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STYLES.map(s => (
            <button
              key={s.value}
              onClick={() => setStyleFilter(s.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                styleFilter === s.value
                  ? 'bg-[rgba(200,168,75,0.2)] border border-[#c8a84b] text-[#c8a84b]'
                  : 'bg-[#1a1a1a] border border-[#2a2a2a] text-[#a0a0a0] hover:border-[#3a3a3a]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cursuri fundamentale — banner separat */}
      {!isLoading && fundamentals.length > 0 && levelFilter === 'all' && !search && (
        <div className="rounded-xl border border-[rgba(200,168,75,0.3)] bg-[rgba(200,168,75,0.05)] p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-[#c8a84b]">Înainte de orice altceva...</p>
            <p className="text-xs text-[#666] mt-0.5">Aceste cursuri pun bazele. Sunt 100% gratuite.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {fundamentals.map(course => (
              <CourseCard key={course.id} course={course} isPro={isPro} />
            ))}
          </div>
        </div>
      )}

      {/* Grid openings */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(course => (
            <CourseCard key={course.id} course={course} isPro={isPro} />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-[#666] py-16">
              Niciun curs nu corespunde filtrelor selectate.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function CourseCard({ course, isPro }: { course: Course; isPro: boolean }) {
  const locked = course.is_premium && !isPro
  const completedLessons = course.progress?.completed_lesson_ids.length ?? 0
  const pct = course.lesson_count > 0 ? Math.round((completedLessons / course.lesson_count) * 100) : 0

  return (
    <Link to={locked ? '/pricing' : `/courses/${course.slug}`} className="group block">
      <div className={`rounded-xl border bg-[#1a1a1a] transition-all h-full flex flex-col ${
        locked
          ? 'border-[#2a2a2a] opacity-80 hover:opacity-100'
          : 'border-[#2a2a2a] hover:border-[#3a3a3a] hover:translate-y-[-1px]'
      }`}>
        {/* Thumbnail */}
        <div className="relative h-32 rounded-t-xl bg-gradient-to-br from-[#1e1e1e] to-[#2a2a2a] flex items-center justify-center overflow-hidden">
          <span className="text-5xl opacity-30 group-hover:scale-110 transition-transform">♟</span>
          {locked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="flex items-center gap-1.5 rounded-full bg-[rgba(200,168,75,0.9)] px-3 py-1 text-xs font-bold text-black">
                <Lock className="h-3 w-3" /> Pro
              </div>
            </div>
          )}
          <div className="absolute top-2 left-2">
            <Badge variant={
              course.level === 'fundamental' ? 'default' :
              course.level === 'beginner' ? 'beginner' :
              course.level === 'intermediate' ? 'intermediate' : 'advanced'
            }>
              {LEVEL_LABELS[course.level]}
            </Badge>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-semibold text-[#f0f0f0] mb-1 group-hover:text-[#c8a84b] transition-colors line-clamp-2 text-sm">
            {course.title}
          </h3>
          {(course.eco_code || course.opening_family) && (
            <p className="text-xs text-[#666] mb-2">
              {[course.eco_code, course.opening_family].filter(Boolean).join(' · ')}
            </p>
          )}

          <div className="flex flex-wrap gap-1 mb-3">
            {course.playing_styles.map(style => (
              <span key={style} className="text-xs rounded-full px-2 py-0.5 bg-[#2a2a2a] text-[#666]">
                {PLAYING_STYLE_LABELS[style]}
              </span>
            ))}
          </div>

          <div className="mt-auto">
            <div className="flex items-center justify-between text-xs text-[#666] mb-1.5">
              <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {course.lesson_count} lecții</span>
              {completedLessons > 0 && <span className="text-[#4ade80]">{pct}% complet</span>}
            </div>
            {completedLessons > 0 && <Progress value={pct} className="h-1" />}
          </div>
        </div>
      </div>
    </Link>
  )
}
