import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, CheckCircle2, Lock, ChevronLeft, ChevronRight, Clock, TrendingUp, Dumbbell } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Spinner } from '@/components/ui/Spinner'
import type { Course, Lesson, UserCourseProgress, OpeningLine } from '@/types'
import { LEVEL_LABELS, PLAYING_STYLE_LABELS } from '@/types'

interface PathStep {
  id: string
  title: string
  sub: string
  href: string
  premium: boolean
}

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
  if (!course) return <p className="text-[#6B6B6B]">Cursul nu a fost găsit.</p>

  const hasOpeningLines = openingLines && openingLines.length > 0
  const completedIds = progress?.completed_lesson_ids ?? []
  const isLocked = course.is_premium && !isPro
  const firstLine = openingLines?.[0]

  // Pașii traseului (noduri): variante pentru deschideri, lecții pentru fundamentale.
  const steps: PathStep[] = hasOpeningLines
    ? (openingLines ?? []).map(l => ({
        id: l.id, title: l.variation_name, sub: l.variation_code,
        href: `/courses/${slug}/guided/${l.id}`, premium: false,
      }))
    : (lessons ?? []).map(l => ({
        id: l.id, title: l.title, sub: `${l.duration_minutes} min`,
        href: `/courses/${slug}/lessons/${l.id}`, premium: l.is_premium,
      }))

  const totalSteps = steps.length
  const doneCount = steps.filter(s => completedIds.includes(s.id)).length
  const pct = totalSteps ? Math.round((doneCount / totalSteps) * 100) : 0
  // Reluare: ultima variantă începută și neterminată; altfel prima neparcursă.
  const lastId = progress?.last_lesson_id
  const resumeId = lastId && !completedIds.includes(lastId) && steps.some(s => s.id === lastId)
    ? lastId
    : (steps.find(s => !completedIds.includes(s.id))?.id ?? steps[0]?.id)
  const resumeStep = steps.find(s => s.id === resumeId)

  return (
    <div className="max-w-3xl space-y-6">
      <Link to="/courses" className="flex items-center gap-1.5 text-sm text-[#A0A0A0] hover:text-[#F0F0F0] transition-colors">
        <ChevronLeft className="h-4 w-4" />
        Toate cursurile
      </Link>

      {/* Header — iconiță + titlu + descriere */}
      <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] p-6">
        <div className="flex items-start gap-4 mb-4">
          <img
            src={`/openings/${course.slug}.png`}
            alt={course.title}
            onError={e => { e.currentTarget.style.display = 'none' }}
            className="h-20 w-20 rounded-xl object-cover shrink-0 bg-[#141414] shadow-[0_2px_10px_rgba(0,0,0,0.45)]"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant={
                course.level === 'beginner' ? 'beginner'
                  : course.level === 'intermediate' ? 'intermediate'
                  : course.level === 'advanced' ? 'advanced'
                  : 'default'
              }>
                {LEVEL_LABELS[course.level]}
              </Badge>
              {course.eco_code && <span className="text-xs text-[#6B6B6B]">{course.eco_code}</span>}
              {(course.playing_styles ?? []).map((s: string) => (
                <Badge key={s} variant="default">{PLAYING_STYLE_LABELS[s as keyof typeof PLAYING_STYLE_LABELS]}</Badge>
              ))}
              {isLocked && <Badge variant="premium">Pro</Badge>}
            </div>
            <h1 className="text-2xl font-bold text-[#F0F0F0] mb-2">{course.title}</h1>
            {course.description && (
              <p className="text-[#A0A0A0] text-sm leading-relaxed border-l-2 border-[#E2B340] pl-3">
                {course.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-[#6B6B6B] mb-4 flex-wrap">
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

        {pct > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-[#6B6B6B] mb-1.5">
              <span>Progres</span>
              <span className="text-[#4ade80]">{pct}% complet</span>
            </div>
            <Progress value={pct} barClassName="bg-[#4ade80]" />
          </div>
        )}

        {isLocked ? (
          <Link to="/pricing">
            <Button variant="outline" size="lg" className="w-full">
              <Lock className="h-4 w-4" /> Deblochează cu Pro
            </Button>
          </Link>
        ) : resumeStep ? (
          <div className="flex gap-2">
            <Link to={resumeStep.href} className="flex-1">
              <Button size="lg" className="w-full">
                {pct > 0 ? 'Continuă de unde ai rămas' : 'Începe cursul'}
              </Button>
            </Link>
            {hasOpeningLines && firstLine && (
              <Link to={`/courses/${course.slug}/practice/${firstLine.id}`}>
                <Button variant="secondary" size="lg">
                  <Dumbbell className="h-4 w-4" /> Practică
                </Button>
              </Link>
            )}
          </div>
        ) : null}
      </div>

      {/* Conținutul cursului — traseu stil Duolingo */}
      {steps.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold text-[#F0F0F0] mb-1">Conținutul cursului</h2>
          <p className="text-xs text-[#6B6B6B] mb-4">{doneCount} din {totalSteps} parcurse</p>

          <div className="max-w-md mx-auto">
            {steps.map((step, i) => {
              const done = completedIds.includes(step.id)
              const current = !done && step.id === resumeId
              const locked = isLocked || (step.premium && !isPro)
              return (
                <div key={step.id}>
                  {/* Caseta cursului — titlu lizibil în interior */}
                  <Link
                    to={locked ? '/pricing' : step.href}
                    title={step.title}
                    className={`flex items-center gap-3 rounded-2xl border bg-[#141414] p-3 transition-all hover:-translate-y-0.5 ${
                      current
                        ? 'border-[rgba(226,179,64,0.55)] shadow-[0_0_18px_rgba(226,179,64,0.15)]'
                        : done
                        ? 'border-[rgba(74,222,128,0.35)]'
                        : 'border-[#2A2A2A] hover:border-[#3A3A3A]'
                    }`}
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl shrink-0 ${
                      done ? 'bg-[#4ade80] text-black'
                        : current ? 'bg-[#E2B340] text-black'
                        : 'bg-[#1C1C1C] text-[#6B6B6B]'
                    }`}>
                      {done ? <CheckCircle2 className="h-6 w-6" />
                        : locked ? <Lock className="h-5 w-5" />
                        : <BookOpen className="h-6 w-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-display font-semibold text-sm truncate ${done ? 'text-[#A0A0A0]' : 'text-[#F0F0F0]'}`}>
                        {step.title}
                      </p>
                      <p className={`text-xs ${current ? 'text-[#E2B340] font-semibold' : done ? 'text-[#4ade80]' : 'text-[#6B6B6B]'}`}>
                        {current ? 'Ești aici' : done ? 'Terminat' : step.sub}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#6B6B6B] shrink-0" />
                  </Link>

                  {/* Linie discontinuă șerpuită între casete (în gol, nu peste titluri) */}
                  {i < steps.length - 1 && (
                    <svg width="240" height="38" viewBox="0 0 240 38" fill="none" className="mx-auto block">
                      <path
                        d={i % 2 === 0 ? 'M120 2 C120 15, 66 24, 120 36' : 'M120 2 C120 15, 174 24, 120 36'}
                        stroke="rgba(226,179,64,0.4)" strokeWidth="2.5" strokeDasharray="2 8" strokeLinecap="round"
                      />
                    </svg>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <p className="text-[#6B6B6B] text-sm text-center py-8">Conținutul e în curs de pregătire.</p>
      )}
    </div>
  )
}
