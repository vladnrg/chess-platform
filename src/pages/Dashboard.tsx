import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { BookOpen, Puzzle, ChevronRight, Lock } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { LeagueWidget } from '@/components/dashboard/LeagueWidget'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
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

  const greeting = new Date().getHours() < 12 ? 'Bună dimineața' : new Date().getHours() < 18 ? 'Bună ziua' : 'Bună seara'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#f0f0f0]">
          {greeting}, {profile.username}!
        </h1>
        <p className="text-[#666] text-sm mt-0.5">Continuă să înveți și să avansezi.</p>
      </div>

      {/* Grid principal */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* League widget — coloana stângă */}
        <div className="lg:col-span-1">
          <LeagueWidget />
        </div>

        {/* Stats rapide — coloana dreaptă */}
        <div className="lg:col-span-2 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={<Puzzle className="h-5 w-5 text-[#c8a84b]" />}
            label="Puzzle-uri azi"
            value={`${todayPuzzleCount ?? 0}`}
            sub="din 10 gratuite"
          />
          <StatCard
            icon={<span className="text-xl">🔥</span>}
            label="Streak"
            value={`${profile.streak_days}`}
            sub="zile consecutive"
          />
          <StatCard
            icon={<span className="text-xl">📊</span>}
            label="Elo estimat"
            value={`~${profile.estimated_elo}`}
            sub="după evaluare"
          />
        </div>
      </div>

      {/* Cursuri recomandate */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#f0f0f0]">Recomandat pentru tine</h2>
          <Link to="/courses" className="flex items-center gap-1 text-sm text-[#c8a84b] hover:text-[#d4b860]">
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
              <p className="text-[#666] text-sm col-span-3 text-center py-8">
                Nu există cursuri disponibile momentan.
              </p>
            )}
          </div>
        )}
      </section>

      {/* CTA puzzle zilnic */}
      <section>
        <Card className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(200,168,75,0.12)] text-2xl">
              ♟
            </div>
            <div>
              <h3 className="font-semibold text-[#f0f0f0]">Puzzle zilnic Lichess</h3>
              <p className="text-sm text-[#666]">Antrenează-ți abilitățile tactice zilnic</p>
            </div>
          </div>
          <Link to="/puzzles">
            <Button variant="outline">Rezolvă puzzle-ul <ChevronRight className="h-4 w-4" /></Button>
          </Link>
        </Card>
      </section>
    </div>
  )
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#111] flex-shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-xs text-[#666]">{label}</p>
          <p className="text-xl font-bold text-[#f0f0f0]">{value}</p>
          <p className="text-xs text-[#a0a0a0]">{sub}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function CourseCard({ course }: { course: Course }) {
  const levelVariant = course.level === 'beginner' ? 'beginner' : course.level === 'intermediate' ? 'intermediate' : 'advanced'
  return (
    <Link to={`/courses/${course.slug}`}>
      <Card className="hover:border-[#3a3a3a] transition-all hover:translate-y-[-1px] group h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <Badge variant={levelVariant}>{LEVEL_LABELS[course.level]}</Badge>
            {course.is_premium && <Lock className="h-4 w-4 text-[#c8a84b]" />}
          </div>
          <h3 className="font-semibold text-[#f0f0f0] mb-1 group-hover:text-[#c8a84b] transition-colors line-clamp-2">
            {course.title}
          </h3>
          <p className="text-xs text-[#666] mb-3">{course.opening_family}</p>
          <div className="flex items-center gap-1.5 text-xs text-[#a0a0a0]">
            <BookOpen className="h-3.5 w-3.5" />
            {course.lesson_count} lecții
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
