import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, ChevronLeft, ChevronRight, Target } from 'lucide-react'
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
  // Cel mai departe ajuns. „Înapoi" merge oriunde ai fost deja; „înainte" doar
  // până aici, ca să nu se sară peste un exerciţiu nerezolvat.
  const [maxAtins, setMaxAtins] = useState(0)

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
      setExerciseIndex(i => {
        setMaxAtins(m => Math.max(m, i + 1))
        return i + 1
      })
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
      <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
        <Link to="/courses" className="hover:text-[#F0F0F0] transition-colors">Cursuri</Link>
        <span>›</span>
        <Link to={`/courses/${course.slug}`} className="hover:text-[#F0F0F0] transition-colors">{course.title}</Link>
        <span>›</span>
        <span className="text-[#A0A0A0]">{lesson.title}</span>
      </div>

      {/* Header lecție */}
      <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] p-5 space-y-3">
        <h1 className="text-xl font-bold text-[#F0F0F0]">{lesson.title}</h1>

        {/* Teoria e scrisă pentru începutul lecţiei, nu pentru fiecare pas: la
            „Tabla şi setup-ul" explică notaţia pătratelor, ceea ce ajută la
            primul exerciţiu (apasă e4) şi nu mai spune nimic la al doilea.
            De aceea rămâne doar cât timp eşti la primul, iar de acolo încolo îi
            ia locul cerinţa exerciţiului curent. */}
        {lesson.theory_html && exerciseIndex === 0 && !allDone && (
          <div
            className="prose prose-sm prose-invert max-w-none text-[#A0A0A0] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: lesson.theory_html }}
          />
        )}

        {/* Ce ai de făcut ACUM, sus, mare şi colorat.
            Stătea sub numărul exerciţiului, scrisă mic şi gri — adică exact
            lucrul de care are omul nevoie era cel mai greu de găsit din pagină. */}
        {!allDone && currentExercise && (
          <p className="flex items-start gap-2 text-base font-semibold leading-relaxed text-[#F0F0F0]">
            <Target className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#E2B340]" />
            {currentExercise.instruction}
          </p>
        )}

        {/* Progress exerciții */}
        {exercises.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-[#2A2A2A]">
            <div className="flex justify-between text-xs text-[#6B6B6B]">
              <span>Exerciții</span>
              <span>{allDone ? exercises.length : exerciseIndex} / {exercises.length}</span>
            </div>
            <Progress value={progressPct} className="h-1.5" />
          </div>
        )}
      </div>

      {/* Exercițiu curent */}
      {!allDone && currentExercise && (
        <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="rounded-full bg-[rgba(226,179,64,0.15)] px-3 py-1 text-xs font-medium text-[#E2B340]">
              Exercițiu {exerciseIndex + 1} din {exercises.length}
            </span>

            {/* Înapoi la un exerciţiu deja făcut, şi înapoi de unde ai venit.
                Până acum se putea doar înainte, deci cine voia să recitească
                prima poziţie trebuia să reîncarce toată lecţia. */}
            {exercises.length > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setExerciseIndex(i => Math.max(0, i - 1))}
                  disabled={exerciseIndex === 0}
                  aria-label="Exercițiul anterior"
                  title="Exercițiul anterior"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2A2A2A] bg-[#1C1C1C] text-[#A0A0A0] transition-colors hover:border-[#3A3A3A] hover:text-[#F0F0F0] disabled:pointer-events-none disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setExerciseIndex(i => Math.min(maxAtins, i + 1))}
                  disabled={exerciseIndex >= maxAtins}
                  aria-label="Exercițiul următor"
                  title="Exercițiul următor"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2A2A2A] bg-[#1C1C1C] text-[#A0A0A0] transition-colors hover:border-[#3A3A3A] hover:text-[#F0F0F0] disabled:pointer-events-none disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* `key={exerciseIndex}` NU e decorativ, e reparaţia unui blocaj.
              Fiecare exerciţiu îşi ţine starea la el (rezolvat / greşit / pătrate
              colorate, iar la „mută piesa" chiar poziţia de pe tablă). Fără key,
              React refoloseşte aceeaşi componentă când se schimbă exerciţiul,
              deci starea veche rămâne: `status` era încă 'correct', iar prima
              linie din handler e `if (status === 'correct') return` — adică
              tabla nu mai răspundea deloc la clicuri. Se vedea la „Tabla şi
              setup-ul": după e4, întrebarea trecea la d5, dar e4 rămânea verde,
              „Corect! Super!" rămânea pe ecran şi nu se mai putea da click.
              Cu key, componenta se remontează şi porneşte curată. */}
          {currentExercise.type === 'click_square' && (
            <SquareClickExerciseComponent
              key={exerciseIndex}
              exercise={currentExercise}
              onCorrect={handleExerciseCorrect}
            />
          )}
          {currentExercise.type === 'move_piece' && (
            <MovePieceExerciseComponent
              key={exerciseIndex}
              exercise={currentExercise}
              onCorrect={handleExerciseCorrect}
            />
          )}
          {currentExercise.type === 'identify_square' && (
            <IdentifyNotationExerciseComponent
              key={exerciseIndex}
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
          <p className="font-semibold text-[#F0F0F0]">Toate exercițiile rezolvate!</p>
          <p className="text-sm text-[#6B6B6B]">Apasă "Finalizează" pentru a câștiga XP-ul.</p>
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
