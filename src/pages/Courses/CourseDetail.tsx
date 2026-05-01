import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, CheckCircle2, Lock, ChevronLeft, Clock, TrendingUp, Dumbbell } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Spinner } from '@/components/ui/Spinner'
import type { Course, Lesson, UserCourseProgress, OpeningLine } from '@/types'
import { LEVEL_LABELS, PLAYING_STYLE_LABELS } from '@/types'

export function CourseDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const { isPro } = useSubscription()

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', slug],
    queryFn: async () => {
      const { data } = await (supabase as any).from('courses').select('*').eq('slug', slug!).single()
      return data as Course
    },
    enabled: !!slug,
  })

  const { data: openingLines } = useQuery({
    queryKey: ['opening-lines', course?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('opening_lines')
        .select('*')
        .eq('course_id', course!.id)
        .order('order_index')
      return (data ?? []) as OpeningLine[]
    },
    enabled: !!course?.id,
  })

  const { data: lessons } = useQuery({
    queryKey: ['lessons', course?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('lessons')
        .select('*')
        .eq('course_id', course!.id)
        .order('order_index')
      return (data ?? []) as Lesson[]
    },
    enabled: !!course?.id && (!openingLines || openingLines.length === 0),
  })

  const { data: progress } = useQuery({
    queryKey: ['course-progress', user?.id, course?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('user_course_progress')
        .select('*')
        .eq('user_id', user!.id)
        .eq('course_id', course!.id)
        .single()
      return data as UserCourseProgress | null
    },
    enabled: !!user && !!course?.id,
  })

  if (isLoading) return <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
  if (!course) return <p className="text-[#666]">Cursul nu a fost găsit.</p>

  const hasOpeningLines = openingLines && openingLines.length > 0

  // For lesson-based courses
  const completedIds = progress?.completed_lesson_ids ?? []
  const lessonPct = lessons?.length ? Math.round((completedIds.length / lessons.length) * 100) : 0
  const firstLesson = lessons?.[0]
  const lastLesson = progress?.last_lesson_id ? lessons?.find(l => l.id === progress.last_lesson_id) : null
  const resumeLesson = lastLesson ?? firstLesson

  // For opening courses — CTA goes to first line guided mode
  const firstLine = openingLines?.[0]

  const isLocked = course.is_premium && !isPro

  return (
    <div className="max-w-3xl space-y-6">
      <Link to="/courses" className="flex items-center gap-1.5 text-sm text-[#a0a0a0] hover:text-[#f0f0f0] transition-colors">
        <ChevronLeft className="h-4 w-4" />
        Toate cursurile
      </Link>

      {/* Header */}
      <div className="rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant={
                course.level === 'beginner' ? 'beginner'
                  : course.level === 'intermediate' ? 'intermediate'
                  : course.level === 'advanced' ? 'advanced'
                  : 'default'
              }>
                {LEVEL_LABELS[course.level]}
              </Badge>
              {course.eco_code && <span className="text-xs text-[#666]">{course.eco_code}</span>}
              {(course.playing_styles ?? []).map((s: string) => (
                <Badge key={s} variant="default">{PLAYING_STYLE_LABELS[s as keyof typeof PLAYING_STYLE_LABELS]}</Badge>
              ))}
              {isLocked && <Badge variant="premium">Pro</Badge>}
            </div>
            <h1 className="text-2xl font-bold text-[#f0f0f0] mb-2">{course.title}</h1>
            <p className="text-[#a0a0a0] text-sm">{course.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-[#666] mb-4 flex-wrap">
          {hasOpeningLines ? (
            <span className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" />
              {openingLines.length} variante de studiat
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              {course.lesson_count} lecții
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            ~{hasOpeningLines ? openingLines.length * 15 : (course.lesson_count ?? 0) * 10} minute
          </span>
        </div>

        {!hasOpeningLines && lessonPct > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-[#666] mb-1.5">
              <span>Progres</span>
              <span className="text-[#4ade80]">{lessonPct}% complet</span>
            </div>
            <Progress value={lessonPct} barClassName="bg-[#4ade80]" />
          </div>
        )}

        {isLocked ? (
          <Link to="/pricing">
            <Button variant="outline" size="lg" className="w-full">
              <Lock className="h-4 w-4" /> Deblochează cu Pro
            </Button>
          </Link>
        ) : hasOpeningLines && firstLine ? (
          <Link to={`/courses/${course.slug}/guided/${firstLine.id}`}>
            <Button size="lg" className="w-full">
              Începe cu prima variantă
            </Button>
          </Link>
        ) : resumeLesson ? (
          <Link to={`/courses/${course.slug}/lessons/${resumeLesson.id}`}>
            <Button size="lg" className="w-full">
              {lessonPct > 0 ? 'Continuă cursul' : 'Începe cursul'}
            </Button>
          </Link>
        ) : null}
      </div>

      {/* Opening lines section */}
      {hasOpeningLines && (
        <div>
          <h2 className="text-lg font-semibold text-[#f0f0f0] mb-3">
            Variante ({openingLines.length})
          </h2>
          <div className="space-y-3">
            {openingLines.map((line) => (
              <div
                key={line.id}
                className="rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] p-4 hover:border-[#3a3a3a] transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-[#666] border border-[#333] rounded px-1.5 py-0.5">
                        {line.variation_code}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        line.user_color === 'white'
                          ? 'bg-[#f0f0f0] text-black'
                          : 'bg-[#2a2a2a] text-[#f0f0f0] border border-[#444]'
                      }`}>
                        {line.user_color === 'white' ? '♔ Alb' : '♚ Negru'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-[#f0f0f0] text-sm leading-snug">
                      {line.variation_name}
                    </h3>
                  </div>
                  {/* Popularity */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-[#c8a84b]">{line.popularity_pct}%</p>
                    <p className="text-[10px] text-[#555] uppercase tracking-wide">popularitate</p>
                  </div>
                </div>

                {/* Popularity bar */}
                <div className="h-1 bg-[#2a2a2a] rounded-full mb-3 overflow-hidden">
                  <div
                    className="h-full bg-[#c8a84b] rounded-full"
                    style={{ width: `${Math.min(line.popularity_pct * 2, 100)}%` }}
                  />
                </div>

                {/* CTA buttons */}
                {isLocked ? (
                  <Link to="/pricing">
                    <Button variant="outline" size="sm" className="w-full">
                      <Lock className="h-3.5 w-3.5" /> Deblochează cu Pro
                    </Button>
                  </Link>
                ) : (
                  <div className="flex gap-2">
                    <Link to={`/courses/${slug}/guided/${line.id}`} className="flex-1">
                      <Button size="sm" className="w-full">
                        <BookOpen className="h-3.5 w-3.5" />
                        Mod ghidat
                      </Button>
                    </Link>
                    <Link to={`/courses/${slug}/practice/${line.id}`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full">
                        <Dumbbell className="h-3.5 w-3.5" />
                        Practică liberă
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lessons section (for fundamental courses) */}
      {!hasOpeningLines && (
        <div>
          <h2 className="text-lg font-semibold text-[#f0f0f0] mb-3">
            Lecții ({lessons?.length ?? 0})
          </h2>
          <div className="space-y-2">
            {(lessons ?? []).map((lesson, idx) => {
              const done = completedIds.includes(lesson.id)
              const locked = lesson.is_premium && !isPro
              return (
                <Link
                  key={lesson.id}
                  to={locked ? '/pricing' : `/courses/${slug}/lessons/${lesson.id}`}
                  className="flex items-center gap-4 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] p-4 hover:border-[#3a3a3a] transition-all group"
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold flex-shrink-0 ${
                    done ? 'bg-[#4ade80] text-black' : 'bg-[#2a2a2a] text-[#666]'
                  }`}>
                    {done ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium group-hover:text-[#c8a84b] transition-colors ${done ? 'text-[#4ade80]' : 'text-[#f0f0f0]'}`}>
                      {lesson.title}
                    </p>
                    <p className="text-xs text-[#666]">{lesson.duration_minutes} min</p>
                  </div>
                  {locked && <Lock className="h-4 w-4 text-[#c8a84b] flex-shrink-0" />}
                </Link>
              )
            })}
            {(!lessons || lessons.length === 0) && (
              <p className="text-[#666] text-sm text-center py-8">Lecțiile sunt în curs de pregătire.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
