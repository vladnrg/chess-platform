import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Target } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useLaturaTablei, LATIME_PANOU, SPATIU_TABLA_PANOU } from '@/hooks/useLaturaTablei'
import { Button } from '@/components/ui/Button'
import { SquareClickExerciseComponent } from '@/components/chess/exercises/SquareClickExercise'
import { MovePieceExerciseComponent } from '@/components/chess/exercises/MovePieceExercise'
import { IdentifyNotationExerciseComponent } from '@/components/chess/exercises/IdentifyNotationExercise'
import type { Lesson, Course, Exercise } from '@/types'

interface Props {
  lesson: Lesson
  course: Course
  // `prevLesson` nu se mai foloseşte: „Înapoi" merge prin exerciţiile lecţiei,
  // iar de la primul iese la pagina de start, nu în lecţia vecină.
  nextLesson: { id: string; title: string } | null
}

export function FundamentalLessonPage({ lesson, course, nextLesson }: Props) {
  const { user, fetchProfile } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const exercises: Exercise[] = useMemo(() => lesson.exercises ?? [], [lesson.exercises])
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [allDone, setAllDone] = useState(exercises.length === 0)
  // Cel mai departe ajuns. „Înapoi" merge oriunde ai fost deja; „înainte" doar
  // până aici, ca să nu se sară peste un exerciţiu nerezolvat.
  const [maxAtins, setMaxAtins] = useState(0)
  /**
   * Cerinţa pasului curent, când exerciţiul ţine mai mult de o mutare.
   *
   * Ea ia locul cerinţei exerciţiului în rândul de sus: „împinge pionul pe e6"
   * nu mai spune nimic după ce pionul a ajuns pe e6. Exerciţiul o trimite de
   * fiecare dată când trece la pasul următor, şi o şterge când pleacă de tot.
   */
  const [cerintaPasului, setCerintaPasului] = useState<string | null>(null)
  // Rândul cu tabla şi panoul (din el se calculează latura tablei) şi locul din
  // panou unde exerciţiul curent îşi pune mesajele şi butoanele.
  const [randTabla, setRandTabla] = useState<HTMLDivElement | null>(null)
  const [slotPanou, setSlotPanou] = useState<HTMLDivElement | null>(null)
  const latura = useLaturaTablei(randTabla)
  // Creşte când „Înapoi" redeschide ultimul exerciţiu după final: exerciţiul
  // porneşte curat, altfel rămânea „rezolvat" şi nu mai putea fi terminat.
  const [reluare, setReluare] = useState(0)

  /**
   * Toate cerinţele care pot apărea în lecţie: ale exerciţiilor şi ale paşilor.
   *
   * Nu ca să fie citite, ci ca să ţină locul. Rândul cerinţei îşi ia înălţimea
   * de la cea mai lungă dintre ele şi n-o mai schimbă niciodată — altfel
   * „Împinge pionul pe e7" ocupă un rând, cerinţa următoare ocupă trei, iar
   * ce e dedesubt sare exact când omul se uită la el.
   */
  const cerinteleLectiei = useMemo(
    () =>
      exercises.flatMap(ex => [
        ex.instruction,
        ...('line' in ex ? (ex.line ?? []).map(pas => pas.instruction) : []),
      ]),
    [exercises],
  )

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
          last_activity_at: new Date().toISOString(),
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
  // Ultimul exerciţiu rămâne pe tablă şi după ce s-a terminat lecţia, ca locul
  // din stânga să nu rămână gol; mesajele lui nu se mai pun (vezi `panou`).
  const exercitiulDePeTabla = currentExercise ?? exercises[exercises.length - 1]
  const panouExercitiu = allDone ? null : slotPanou
  const facute = allDone ? exercises.length : exerciseIndex

  return (
    // Aceeaşi aşezare ca la cursurile de deschideri (OpeningTrainerPage): pagina
    // umple ecranul, tabla şi panoul formează un bloc centrat, iar antetul are
    // exact lăţimea blocului. Înainte, lecţia era o coloană îngustă, cu tabla
    // între două carduri şi butoanele sub ea, adesea în afara ecranului.
    <div className="flex flex-col gap-3 lg:h-[var(--app-page-h)]">
      <div
        className="flex flex-shrink-0 flex-col gap-3 lg:mx-auto lg:max-w-full"
        style={latura ? { width: latura + SPATIU_TABLA_PANOU + LATIME_PANOU } : undefined}
      >
        {/* Antetul: cursul şi lecţia */}
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to={`/courses/${course.slug}`}
            aria-label="Înapoi la curs"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#141414] text-[#A0A0A0] transition-colors hover:text-[#F0F0F0]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-[#F0F0F0]">{course.title}</p>
            <p className="truncate text-sm text-[#A0A0A0]">{lesson.title}</p>
          </div>
        </div>

        {/* Exerciţiul în care eşti, cu săgeţile lui. Înapoi merge oriunde ai
            fost deja; înainte doar până la cel mai departe ajuns. */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 rounded-lg border border-[#2A2A2A] bg-[#141414] px-3 py-2">
            <BookOpen className="h-4 w-4 flex-shrink-0 text-[#E2B340]" />
            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-[#E2B340]">
              {allDone
                ? 'Toate exercițiile rezolvate'
                : `Exercițiul ${exerciseIndex + 1} din ${exercises.length}`}
            </p>
            {exercises.length > 1 && !allDone && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setExerciseIndex(i => Math.max(0, i - 1))}
                  disabled={exerciseIndex === 0}
                  aria-label="Exercițiul anterior"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-[#A0A0A0] transition-colors hover:bg-[#1C1C1C] hover:text-[#F0F0F0] disabled:pointer-events-none disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setExerciseIndex(i => Math.min(maxAtins, i + 1))}
                  disabled={exerciseIndex >= maxAtins}
                  aria-label="Exercițiul următor"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-[#A0A0A0] transition-colors hover:bg-[#1C1C1C] hover:text-[#F0F0F0] disabled:pointer-events-none disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Câte o liniuţă pe exerciţiu, ca segmentele de la deschideri. */}
          {exercises.length > 0 && (
            <div className="flex gap-1.5">
              {exercises.map((_, i) => (
                <div key={i} className="flex-1 py-1.5">
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#2A2A2A]">
                    <div
                      className="h-full rounded-full bg-[#E2B340] transition-all duration-500"
                      style={{ width: i < facute ? '100%' : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* `lg:pb-24`: acelaşi spaţiu negru sub tablă ca la deschideri. */}
      <div ref={setRandTabla} className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:justify-center lg:gap-4 lg:pb-24">
        {exercitiulDePeTabla && (
          <div className={`flex min-h-0 min-w-0 justify-center ${latura ? 'lg:items-start' : 'flex-1 items-center'}`}>
            <div className="w-full max-w-full" style={latura ? { width: latura, height: latura } : undefined}>
              {/* `key={exerciseIndex}` NU e decorativ, e reparaţia unui blocaj.
                  Fiecare exerciţiu îşi ţine starea la el (rezolvat / greşit /
                  pătrate colorate, iar la „mută piesa" chiar poziţia de pe tablă).
                  Fără key, React refoloseşte aceeaşi componentă când se schimbă
                  exerciţiul, deci starea veche rămâne: `status` era încă
                  'correct', iar prima linie din handler e
                  `if (status === 'correct') return` — adică tabla nu mai
                  răspundea deloc la clicuri. Cu key, componenta se remontează şi
                  porneşte curată. */}
              {exercitiulDePeTabla.type === 'click_square' && (
                <SquareClickExerciseComponent
                  key={`${exerciseIndex}-${reluare}`}
                  exercise={exercitiulDePeTabla}
                  onCorrect={handleExerciseCorrect}
                  panou={panouExercitiu}
                />
              )}
              {exercitiulDePeTabla.type === 'move_piece' && (
                <MovePieceExerciseComponent
                  key={`${exerciseIndex}-${reluare}`}
                  exercise={exercitiulDePeTabla}
                  onCorrect={handleExerciseCorrect}
                  onCerinta={setCerintaPasului}
                  panou={panouExercitiu}
                />
              )}
              {exercitiulDePeTabla.type === 'identify_square' && (
                <IdentifyNotationExerciseComponent
                  key={`${exerciseIndex}-${reluare}`}
                  exercise={exercitiulDePeTabla}
                  onCorrect={handleExerciseCorrect}
                  panou={panouExercitiu}
                />
              )}
            </div>
          </div>
        )}

        {/* Coloana dreaptă: cerinţa, teoria, ce spune exerciţiul, butoanele. */}
        <div className="min-h-0 shrink-0 space-y-3 overflow-y-auto lg:w-[21rem]">
          {/* Ce ai de făcut ACUM, sus, mare şi colorat.
              Stătea sub numărul exerciţiului, scrisă mic şi gri — adică exact
              lucrul de care are omul nevoie era cel mai greu de găsit din pagină. */}
          {!allDone && currentExercise && (
            <div className="grid rounded-xl border border-[#2A2A2A] bg-[#141414] p-4">
              {/* Toate cerinţele lecţiei, una peste alta în aceeaşi celulă şi
                  nevăzute: celula rămâne cât cea mai înaltă dintre ele, deci nu
                  se mai umflă şi nu se mai strânge de la un pas la altul. */}
              {cerinteleLectiei.map((text, i) => (
                <p
                  key={i}
                  aria-hidden
                  className="invisible col-start-1 row-start-1 flex items-start gap-2 text-base font-semibold leading-relaxed text-[#F0F0F0]"
                >
                  <Target className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#E2B340]" />
                  {text}
                </p>
              ))}
              <p className="col-start-1 row-start-1 flex items-start gap-2 text-base font-semibold leading-relaxed text-[#F0F0F0]">
                <Target className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#E2B340]" />
                {cerintaPasului ?? currentExercise.instruction}
              </p>
            </div>
          )}

          {/* Teoria e scrisă pentru începutul lecţiei, nu pentru fiecare pas: la
              „Tabla şi setup-ul" explică notaţia pătratelor, ceea ce ajută la
              primul exerciţiu (apasă e4) şi nu mai spune nimic la al doilea.
              De aceea rămâne doar cât timp eşti la primul. */}
          {lesson.theory_html && exerciseIndex === 0 && !allDone && (
            <div
              className="prose prose-sm prose-invert max-w-none rounded-xl border border-[#2A2A2A] bg-[#141414] p-4 leading-relaxed text-[#A0A0A0]"
              dangerouslySetInnerHTML={{ __html: lesson.theory_html }}
            />
          )}

          {/* Aici îşi pune exerciţiul curent mesajele şi butoanele. */}
          <div ref={setSlotPanou} />

          {allDone && (
            <div className="space-y-3 rounded-xl border border-[rgba(74,222,128,0.2)] bg-[rgba(74,222,128,0.08)] p-5 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-[#4ade80]" />
              <p className="font-semibold text-[#F0F0F0]">Toate exercițiile rezolvate!</p>
              <p className="text-sm text-[#6B6B6B]">
                Apasă „{nextLesson ? 'Finalizează' : 'Gata!'}" pentru a câștiga XP-ul.
              </p>
            </div>
          )}

          {/* Navigare — una sub alta: panoul e prea îngust pentru trei butoane
              pe un rând. */}
          <div className="flex flex-col gap-2">
            <Button
              disabled={!allDone}
              onClick={() => completeMutation.mutate()}
              loading={completeMutation.isPending}
            >
              <CheckCircle2 className="h-4 w-4" />
              {nextLesson ? 'Finalizează' : 'Gata!'}
            </Button>
            {nextLesson && allDone && (
              <Link to={`/courses/${course.slug}/lessons/${nextLesson.id}`}>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => completeMutation.mutate()}
                >
                  Următoarea <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
            {/* „Înapoi" înseamnă un pas înapoi, nu o lecţie înapoi. De la primul
                exerciţiu nu mai duce în lecţia vecină: cine apasă „înapoi" acolo
                vrea să iasă, nu să nimerească într-o lecţie pe care n-a cerut-o.
                Îl scoate la pagina de start, şi o spune pe faţă. */}
            {/* După ultimul exerciţiu, „Înapoi" redeschide ultimul exerciţiu; altfel
                pagina rămânea pe „rezolvate" cu tabla altui exerciţiu. */}
            {exerciseIndex > 0 || allDone ? (
              <Button
                variant="secondary"
                onClick={() => {
                  if (allDone) {
                    setAllDone(false)
                    setReluare(r => r + 1)
                  } else {
                    setExerciseIndex(i => Math.max(0, i - 1))
                  }
                }}
              >
                <ChevronLeft className="h-4 w-4" /> Înapoi
              </Button>
            ) : (
              <Link to="/dashboard">
                <Button variant="secondary" className="w-full">
                  <ChevronLeft className="h-4 w-4" /> Înapoi la pagina principală
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
