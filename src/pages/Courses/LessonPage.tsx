import { useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { FundamentalLessonPage } from './FundamentalLessonPage'
import type { Lesson, Course } from '@/types'

function parsePgn(pgn: string): string[] {
  if (!pgn) return []
  try {
    const g = new Chess()
    g.loadPgn(pgn)
    return g.history({ verbose: false })
  } catch {
    return []
  }
}

export function LessonPage() {
  const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>()
  const { user, fetchProfile } = useAuth()
  const qc = useQueryClient()

  const [moveIndex, setMoveIndex] = useState(0)

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const { data } = await supabase.from('lessons').select('*').eq('id', lessonId).single()
      return data as Lesson
    },
    enabled: !!lessonId,
  })

  const { data: course } = useQuery({
    queryKey: ['course', slug],
    queryFn: async () => {
      const { data } = await supabase.from('courses').select('*').eq('slug', slug).single()
      return data as Course
    },
    enabled: !!slug,
  })

  const { data: siblings } = useQuery({
    queryKey: ['lessons', course?.id],
    queryFn: async () => {
      const { data } = await supabase.from('lessons').select('id,order_index,title').eq('course_id', course!.id).order('order_index')
      return data as Pick<Lesson, 'id' | 'order_index' | 'title'>[]
    },
    enabled: !!course?.id,
  })

  const completeMutation = useMutation({
    mutationFn: async () => {
      if (!user || !lesson || !course) return

      // Upsert progres
      const { data: existing } = await supabase
        .from('user_course_progress')
        .select('completed_lesson_ids, xp_earned')
        .eq('user_id', user.id)
        .eq('course_id', course.id)
        .single()

      const prev = existing?.completed_lesson_ids ?? []
      const alreadyDone = prev.includes(lesson.id)

      if (!alreadyDone) {
        await supabase.from('user_course_progress').upsert({
          user_id: user.id,
          course_id: course.id,
          completed_lesson_ids: [...prev, lesson.id],
          last_lesson_id: lesson.id,
          xp_earned: (existing?.xp_earned ?? 0) + 50,
        })

        await supabase.rpc('award_xp', { p_user_id: user.id, p_amount: 50 })
        await fetchProfile(user.id)
        toast.success('+50 XP — Lecție finalizată!')
      }

      qc.invalidateQueries({ queryKey: ['course-progress'] })
    },
  })

  const moves = lesson?.pgn ? parsePgn(lesson.pgn) : []

  const getCurrentFen = useCallback(() => {
    if (!lesson?.pgn || moves.length === 0) return 'start'
    try {
      const g = new Chess()
      for (let i = 0; i < moveIndex; i++) {
        g.move(moves[i])
      }
      return g.fen()
    } catch {
      return 'start'
    }
  }, [lesson?.pgn, moves, moveIndex])

  function goBack() { setMoveIndex(i => Math.max(0, i - 1)) }
  function goForward() { setMoveIndex(i => Math.min(moves.length, i + 1)) }
  function reset() { setMoveIndex(0) }

  const myIdx = siblings?.findIndex(l => l.id === lessonId) ?? -1
  const prevLesson = myIdx > 0 ? siblings?.[myIdx - 1] : null
  const nextLesson = myIdx >= 0 && myIdx < (siblings?.length ?? 0) - 1 ? siblings?.[myIdx + 1] : null

  if (isLoading) return <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
  if (!lesson) return <p className="text-[#666]">Lecția nu a fost găsită.</p>

  if (lesson.lesson_type === 'rules' || lesson.lesson_type === 'notation') {
    return (
      <FundamentalLessonPage
        lesson={lesson}
        course={course!}
        prevLesson={prevLesson ? { id: prevLesson.id, title: prevLesson.title } : null}
        nextLesson={nextLesson ? { id: nextLesson.id, title: nextLesson.title } : null}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#666]">
        <Link to="/courses" className="hover:text-[#f0f0f0] transition-colors">Cursuri</Link>
        <span>›</span>
        <Link to={`/courses/${slug}`} className="hover:text-[#f0f0f0] transition-colors">{course?.title}</Link>
        <span>›</span>
        <span className="text-[#a0a0a0]">{lesson.title}</span>
      </div>

      {/* Layout split */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stânga: tabla */}
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden border border-[#2a2a2a]">
            <Chessboard
              options={{
                position: getCurrentFen(),
                allowDragging: false,
                boardStyle: { borderRadius: 0 },
                darkSquareStyle: { backgroundColor: '#3d3d3d' },
                lightSquareStyle: { backgroundColor: '#f0d9b5' },
              }}
            />
          </div>

          {/* Controale PGN */}
          <div className="flex items-center justify-between rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] p-3">
            <Button variant="ghost" size="icon" onClick={reset} title="Reset">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={goBack} disabled={moveIndex === 0}>
                <ChevronLeft className="h-4 w-4" /> Înapoi
              </Button>
              <span className="text-xs text-[#666] min-w-[60px] text-center">
                {moveIndex} / {moves.length}
              </span>
              <Button variant="secondary" size="sm" onClick={goForward} disabled={moveIndex >= moves.length}>
                Înainte <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="w-9" />
          </div>

          {/* Mutări */}
          {moves.length > 0 && (
            <div className="rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] p-3 max-h-32 overflow-y-auto">
              <div className="flex flex-wrap gap-1">
                {moves.map((move, i) => (
                  <button
                    key={i}
                    onClick={() => setMoveIndex(i + 1)}
                    className={`text-xs rounded px-1.5 py-0.5 transition-colors ${
                      i + 1 === moveIndex
                        ? 'bg-[#c8a84b] text-black font-bold'
                        : 'text-[#a0a0a0] hover:text-[#f0f0f0]'
                    }`}
                  >
                    {i % 2 === 0 && <span className="text-[#666] mr-0.5">{Math.floor(i / 2) + 1}.</span>}
                    {move}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dreapta: teorie */}
        <div className="space-y-4">
          <div className="rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] p-5">
            <h1 className="text-xl font-bold text-[#f0f0f0] mb-4">{lesson.title}</h1>
            {lesson.theory_html ? (
              <div
                className="prose prose-sm prose-invert max-w-none text-[#a0a0a0] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: lesson.theory_html }}
              />
            ) : (
              <p className="text-[#666] text-sm">Teoria pentru această lecție este în curs de pregătire.</p>
            )}
          </div>

          {/* Navigare */}
          <div className="flex items-center gap-3">
            {prevLesson && (
              <Link to={`/courses/${slug}/lessons/${prevLesson.id}`} className="flex-1">
                <Button variant="secondary" className="w-full" onClick={() => setMoveIndex(0)}>
                  <ChevronLeft className="h-4 w-4" /> Anterioară
                </Button>
              </Link>
            )}
            <Button
              className="flex-1"
              onClick={() => completeMutation.mutate()}
              loading={completeMutation.isPending}
            >
              <CheckCircle2 className="h-4 w-4" />
              {nextLesson ? 'Finalizează' : 'Complet'}
            </Button>
            {nextLesson && (
              <Link to={`/courses/${slug}/lessons/${nextLesson.id}`} className="flex-1">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => { setMoveIndex(0); completeMutation.mutate() }}
                >
                  Următoarea <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>

          {!nextLesson && (
            <Link to={`/courses/${slug}`}>
              <Button variant="ghost" className="w-full">
                Înapoi la curs
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
