import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { SquareClickExerciseComponent } from '@/components/chess/exercises/SquareClickExercise'
import { MovePieceExerciseComponent } from '@/components/chess/exercises/MovePieceExercise'
import { IdentifyNotationExerciseComponent } from '@/components/chess/exercises/IdentifyNotationExercise'
import type { Lesson, Course, Exercise } from '@/types'

interface Props {
  lesson: Lesson
  course: Course
  prevLesson: { id: string; title: string } | null
  nextLesson: { id: string; title: string } | null
}

export function FundamentalLessonPage({ lesson, course, prevLesson, nextLesson }: Props) {
  const { user, fetchProfile } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const exercises: Exercise[] = lesson.exercises ?? []
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [allDone, setAllDone] = useState(exercises.length === 0)

  const completeMutation = useMutation({
    mutationFn: async () => {
      if (!user || !lesson || !course) return

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
        toast.success('+50 XP — Lecție completată!')
      }

      qc.invalidateQueries({ queryKey: ['course-progress'] })
    },
    onSuccess: () => {
      if (nextLesson) {
        navigate(`/courses/${course.slug}/lessons/${nextLesson.id}`)
      } else {
        navigate(`/courses/${course.slug}`)
      }
    },
  })

  function handleExerciseCorrect() {
    if (exerciseIndex < exercises.length - 1) {
      setExerciseIndex(i => i + 1)
    } else {
      setAllDone(true)
    }
  }

  const currentExercise = exercises[exerciseIndex]
  const progressPct = exercises.length > 0
    ? Math.round(((allDone ? exercises.length : exerciseIndex) / exercises.length) * 100)
    : 100

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#666]">
        <Link to="/courses" className="hover:text-[#f0f0f0] transition-colors">Cursuri</Link>
        <span>›</span>
        <Link to={`/courses/${course.slug}`} className="hover:text-[#f0f0f0] transition-colors">{course.title}</Link>
        <span>›</span>
        <span className="text-[#a0a0a0]">{lesson.title}</span>
      </div>

      {/* Header lecție */}
      <div className="rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] p-5 space-y-3">
        <h1 className="text-xl font-bold text-[#f0f0f0]">{lesson.title}</h1>

        {/* Teorie */}
        {lesson.theory_html && (
          <div
            className="prose prose-sm prose-invert max-w-none text-[#a0a0a0] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: lesson.theory_html }}
          />
        )}

        {/* Progress exerciții */}
        {exercises.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-[#2a2a2a]">
            <div className="flex justify-between text-xs text-[#666]">
              <span>Exerciții</span>
              <span>{allDone ? exercises.length : exerciseIndex} / {exercises.length}</span>
            </div>
            <Progress value={progressPct} className="h-1.5" />
          </div>
        )}
      </div>

      {/* Exercițiu curent */}
      {!allDone && currentExercise && (
        <div className="rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-[#c8a84b] bg-[rgba(200,168,75,0.15)] rounded-full px-3 py-1">
              Exercițiu {exerciseIndex + 1} din {exercises.length}
            </span>
          </div>

          {currentExercise.type === 'click_square' && (
            <SquareClickExerciseComponent
              exercise={currentExercise}
              onCorrect={handleExerciseCorrect}
            />
          )}
          {currentExercise.type === 'move_piece' && (
            <MovePieceExerciseComponent
              exercise={currentExercise}
              onCorrect={handleExerciseCorrect}
            />
          )}
          {currentExercise.type === 'identify_square' && (
            <IdentifyNotationExerciseComponent
              exercise={currentExercise}
              onCorrect={handleExerciseCorrect}
            />
          )}
        </div>
      )}

      {/* Toate exercițiile completate */}
      {allDone && (
        <div className="rounded-xl bg-[rgba(74,222,128,0.08)] border border-[rgba(74,222,128,0.2)] p-5 text-center space-y-3">
          <CheckCircle2 className="h-10 w-10 text-[#4ade80] mx-auto" />
          <p className="font-semibold text-[#f0f0f0]">Toate exercițiile rezolvate!</p>
          <p className="text-sm text-[#666]">Apasă "Finalizează" pentru a câștiga XP-ul.</p>
        </div>
      )}

      {/* Navigare */}
      <div className="flex items-center gap-3">
        {prevLesson && (
          <Link to={`/courses/${course.slug}/lessons/${prevLesson.id}`} className="flex-1">
            <Button variant="secondary" className="w-full">
              <ChevronLeft className="h-4 w-4" /> Anterioară
            </Button>
          </Link>
        )}
        <Button
          className="flex-1"
          disabled={!allDone}
          onClick={() => completeMutation.mutate()}
          loading={completeMutation.isPending}
        >
          <CheckCircle2 className="h-4 w-4" />
          {nextLesson ? 'Finalizează' : 'Gata!'}
        </Button>
        {nextLesson && allDone && (
          <Link to={`/courses/${course.slug}/lessons/${nextLesson.id}`} className="flex-1">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => completeMutation.mutate()}
            >
              Următoarea <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
