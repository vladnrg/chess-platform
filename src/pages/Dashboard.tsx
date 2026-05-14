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
import { cn } from '@/lib/utils'
import { getLeagueConfig, getXpToNextLeague, getNextLeague } from '@/lib/utils'
import type { Course } from '@/types'
import { LEVEL_LABELS, LEAGUES } from '@/types'

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

  const xpToNext = getXpToNextLeague(profile.xp, profile.current_league)
  const nextLeague = getNextLeague(profile.current_league)
  const nextLeagueConfig = nextLeague ? getLeagueConfig(nextLeague) : null
  const currentLeagueConfig = getLeagueConfig(profile.current_league)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs text-[#555] uppercase tracking-widest mb-1">Barlogul Șahistului</p>
        <h1 className="text-2xl font-bold text-[#f0f0f0]">
          Salut, {profile.username}!
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

      {/* Ligile platformei */}
      <section>
        <h2 className="text-lg font-semibold text-[#f0f0f0] mb-4">Ligile platformei</h2>

        {/* Liga curentă + mesaj avansare */}
        <div
          className="rounded-xl border-2 p-4 mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{ borderColor: currentLeagueConfig.color, backgroundColor: `${currentLeagueConfig.color}12` }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: currentLeagueConfig.color }} />
              <span className="font-bold text-lg" style={{ color: currentLeagueConfig.color }}>
                {currentLeagueConfig.label}
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${currentLeagueConfig.color}25`, color: currentLeagueConfig.color }}>
                Liga ta
              </span>
            </div>
            {xpToNext !== null && nextLeagueConfig ? (
              <p className="text-sm text-[#a0a0a0]">
                Câștigă încă{' '}
                <span className="text-[#c8a84b] font-semibold">{xpToNext} XP</span>
                {' '}pentru a avansa în liga{' '}
                <span className="font-semibold" style={{ color: nextLeagueConfig.color }}>{nextLeagueConfig.label}</span>
              </p>
            ) : (
              <p className="text-sm text-[#c8a84b] font-medium">Ești în liga supremă ✦</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#f0f0f0]">{profile.xp}</p>
            <p className="text-xs text-[#666]">XP total</p>
          </div>
        </div>

        {/* Lista tuturor ligilor */}
        <div className="rounded-xl border border-[#2a2a2a] overflow-hidden">
          {LEAGUES.map((league, idx) => {
            const isCurrent = league.name === profile.current_league
            const isPassed = profile.xp >= league.minXp
            return (
              <div
                key={league.name}
                className={cn(
                  'flex items-center justify-between px-4 py-3 transition-colors',
                  idx !== LEAGUES.length - 1 && 'border-b border-[#2a2a2a]',
                  isCurrent ? 'bg-[#1e1e1e]' : 'bg-transparent'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: isPassed ? league.color : '#333' }}
                  />
                  <span className={cn('font-medium text-sm', isCurrent ? 'text-[#f0f0f0]' : isPassed ? 'text-[#a0a0a0]' : 'text-[#444]')}>
                    {league.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: `${league.color}20`, color: league.color }}>
                      ← ești aici
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-6 text-xs text-[#555]">
                  <span>{league.minXp} – {league.maxXp !== null ? league.maxXp : '∞'} XP</span>
                  <span className="hidden sm:block w-20 text-right">{league.weeklyMinXp} XP/săpt.</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

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
