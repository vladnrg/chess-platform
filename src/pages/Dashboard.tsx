import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { BookOpen, Puzzle, ChevronRight, Lock } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { LeagueWidget } from '@/components/dashboard/LeagueWidget'
import { AppMap } from '@/components/dashboard/AppMap'
import { DailyMissions } from '@/components/dashboard/DailyMissions'
import { ActiveEvents } from '@/components/dashboard/ActiveEvents'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Spinner } from '@/components/ui/Spinner'
import { levelProgress, MAX_LEVEL } from '@/lib/levels'
import { formatXp } from '@/lib/utils'
import type { Course } from '@/types'
import { LEVEL_LABELS } from '@/types'

export function Dashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Redirect la onboarding dacă nu a completat evaluarea
  useEffect(() => {
    if (profile && !profile.assessment_completed) {
      navigate('/onboarding', { replace: true })
    }
  }, [profile, navigate])

  // Toast Stripe checkout success
  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      toast.success('Abonament activat! Bun venit în Pro!')
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const { data: recommendedCourses, isLoading } = useQuery({
    queryKey: ['recommended-courses', profile?.playing_style, profile?.estimated_elo],
    queryFn: async () => {
      if (!profile) return []
      const level = profile.estimated_elo < 900 ? 'beginner'
        : profile.estimated_elo < 1400 ? 'intermediate' : 'advanced'

      const { data } = await supabase
        .from('courses')
        .select('*')
        .eq('level', level)
        .contains('playing_styles', [profile.playing_style])
        .order('order_index')
        .limit(3)

      if (!data || data.length < 3) {
        const { data: fallback } = await supabase
          .from('courses')
          .select('*')
          .eq('level', level)
          .order('order_index')
          .limit(3)
        return (fallback ?? []) as Course[]
      }
      return data as Course[]
    },
    enabled: !!profile?.assessment_completed,
  })

  const { data: todayPuzzleCount } = useQuery({
    queryKey: ['today-puzzles', profile?.id],
    queryFn: async () => {
      if (!profile) return 0
      const today = new Date().toISOString().split('T')[0]
      const { count } = await supabase
        .from('user_puzzle_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .gte('attempted_at', `${today}T00:00:00`)
      return count ?? 0
    },
    enabled: !!profile,
  })

  if (!profile) return null

  return (
    <div className="space-y-6">
      {/* Salut — titlul paginii e randat de shell, aici rămâne doar adresarea */}
      <div>
        <h2 className="text-lg font-semibold text-[#F0F0F0]">
          Salut, {profile.username}!
        </h2>
        <p className="text-[#6B6B6B] text-sm mt-0.5">Continuă să înveți și să avansezi.</p>
      </div>

      {/* Grid principal */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* League widget — coloana stângă */}
        <div className="lg:col-span-1">
          <LeagueWidget />
        </div>

        {/* Stats rapide — coloana dreaptă. Streak-ul lipseşte intenţionat: e deja
            în LeagueWidget, alături, şi în bara de sus. */}
        <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
          <StatCard
            icon={<Puzzle className="h-5 w-5 text-[#E2B340]" />}
            label="Puzzle-uri azi"
            value={`${todayPuzzleCount ?? 0}`}
            sub="din 10 gratuite"
          />
          <LevelCard xp={profile.xp} />
        </div>
      </div>

      {/* Misiunile zilei — deocamdată doar înfăţişarea, cu date fixe */}
      <DailyMissions />

      {/* Evenimentele în desfăşurare. Nu randează nimic când nu e niciunul. */}
      <ActiveEvents />

      {/* Harta aplicaţiei */}
      <AppMap />

      {/* Cursuri recomandate */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#F0F0F0]">Recomandat pentru tine</h2>
          <Link to="/courses" className="flex items-center gap-1 text-sm text-[#E2B340] hover:text-[#F0C85A]">
            Toate cursurile <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner className="h-6 w-6" /></div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(recommendedCourses ?? []).map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
            {(!recommendedCourses || recommendedCourses.length === 0) && (
              <p className="text-[#6B6B6B] text-sm col-span-3 text-center py-8">
                Nu există cursuri disponibile momentan.
              </p>
            )}
          </div>
        )}
      </section>

    </div>
  )
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    // `h-full` + centrare pe verticală: altfel conţinutul stă lipit de marginea
    // de sus, iar caseta pare goală lângă vecina ei mai înaltă.
    <Card className="h-full">
      <CardContent className="flex h-full items-center gap-3 p-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#141414] flex-shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-xs text-[#6B6B6B]">{label}</p>
          <p className="text-xl font-bold text-[#F0F0F0]">{value}</p>
          <p className="text-xs text-[#A0A0A0]">{sub}</p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Nivelul jucătorului. A luat locul casetei „Elo estimat", care afişa un număr
 * dintr-un chestionar scurt de la înregistrare — se putea sări peste el, iar
 * rezultatul contrazicea rating-ul din testul serios de puzzle-uri.
 *
 * Nivelul e onest: vine din XP-ul pe care chiar l-ai adunat şi nu scade niciodată.
 */
function LevelCard({ xp }: { xp: number }) {
  const { level, xpToNext, percent, isMax } = levelProgress(xp)

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col justify-center gap-2 p-4">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs text-[#6B6B6B]">Nivelul tău</p>
            <p className="text-xl font-bold text-[#F0F0F0]">
              {level}
              <span className="ml-1 text-xs font-normal text-[#6B6B6B]">din {MAX_LEVEL}</span>
            </p>
          </div>
          <p className="text-xs text-[#6B6B6B]">{formatXp(xp)} XP</p>
        </div>

        <Progress value={percent} barClassName="bg-[#2DD4BF]" />

        <p className="text-xs text-[#A0A0A0]">
          {isMax ? 'Nivel maxim ✦' : `Încă ${xpToNext} XP până la nivelul ${level + 1}`}
        </p>
      </CardContent>
    </Card>
  )
}

function CourseCard({ course }: { course: Course }) {
  const levelVariant = course.level === 'beginner' ? 'beginner' : course.level === 'intermediate' ? 'intermediate' : 'advanced'
  return (
    <Link to={`/courses/${course.slug}`}>
      <Card className="hover:border-[#3A3A3A] transition-all hover:translate-y-[-1px] group h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <Badge variant={levelVariant}>{LEVEL_LABELS[course.level]}</Badge>
            {course.is_premium && <Lock className="h-4 w-4 text-[#E2B340]" />}
          </div>
          <h3 className="font-semibold text-[#F0F0F0] mb-1 group-hover:text-[#E2B340] transition-colors line-clamp-2">
            {course.title}
          </h3>
          <p className="text-xs text-[#6B6B6B] mb-3">{course.opening_family}</p>
          <div className="flex items-center gap-1.5 text-xs text-[#A0A0A0]">
            <BookOpen className="h-3.5 w-3.5" />
            {course.lesson_count} lecții
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
