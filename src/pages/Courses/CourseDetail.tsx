import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, CheckCircle2, Lock, ChevronLeft, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Spinner } from '@/components/ui/Spinner'
import type { Course, Lesson, UserCourseProgress } from '@/types'
import { LEVEL_LABELS, PLAYING_STYLE_LABELS } from '@/types'

export function CourseDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const { isPro } = useSubscription()

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', slug],
    queryFn: async () => {
      const { data } = await supabase.from('courses').select('*').eq('slug', slug!).single()
      return data as Course
    },
    enabled: !!slug,
  })

  const { data: lessons } = useQuery({
    queryKey: ['lessons', course?.id],
    queryFn: async () => {
      const { data } = await supabase.from('lessons').select('*').eq('course_id', course!.id).order('order_index')
      return (data ?? []) as Lesson[]
    },
    enabled: !!course?.id,
  })

  const { data: progress } = useQuery({
    queryKey: ['course-progress', user?.id, course?.id],
    queryFn: async () => {
      const { data } = await supabase
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

  const completedIds = progress?.completed_lesson_ids ?? []
  const pct = lessons?.length ? Math.round((completedIds.length / lessons.length) * 100) : 0
  const firstLesson = lessons?.[0]
  const lastLesson = progress?.last_lesson_id ? lessons?.find(l => l.id === progress.last_lesson_id) : null
  const resumeLesson = lastLesson ?? firstLesson

  return (
    <div className="max-w-3xl space-y-6">
      <Link to="/courses" className="flex items-center gap-1.5 text-sm text-[#a0a0a0] hover:text-[#f0f0f0] transition-colors">
        <ChevronLeft className="h-4 w-4" />
        Toate cursurile
      </Link>

      {/* Header curs */}
      <div className="rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant={course.level === 'beginner' ? 'beginner' : course.level === 'intermediate' ? 'intermediate' : 'advanced'}>
                {LEVEL_LABELS[course.level]}
              </Badge>
              <span className="text-xs text-[#666]">{course.eco_code}</span>
              {course.playing_styles.map(s => (
                <Badge key={s} variant="default">{PLAYING_STYLE_LABELS[s]}</Badge>
              ))}
            </div>
            <h1 className="text-2xl font-bold text-[#f0f0f0] mb-2">{course.title}</h1>
            <p className="text-[#a0a0a0] text-sm">{course.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-[#666] mb-4">
          <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> {course.lesson_count} lecții</span>
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> ~{(course.lesson_count ?? 0) * 10} minute</span>
          {course.is_premium && !isPro && <Badge variant="premium">Pro</Badge>}
        </div>

        {pct > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-[#666] mb-1.5">
              <span>Progres</span><span className="text-[#4ade80]">{pct}% complet</span>
            </div>
            <Progress value={pct} barClassName="bg-[#4ade80]" />
          </div>
        )}

        {course.is_premium && !isPro ? (
          <Link to="/pricing">
            <Button variant="outline" size="lg" className="w-full">
              <Lock className="h-4 w-4" /> Deblochează cu Pro
            </Button>
          </Link>
        ) : resumeLesson ? (
          <Link to={`/courses/${course.slug}/lessons/${resumeLesson.id}`}>
            <Button size="lg" className="w-full">
              {pct > 0 ? 'Continuă cursul' : 'Începe cursul'}
            </Button>
          </Link>
        ) : null}
      </div>

      {/* Lista lecții */}
      <div>
        <h2 className="text-lg font-semibold text-[#f0f0f0] mb-3">Lecții ({lessons?.length ?? 0})</h2>
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
    </div>
  )
}
