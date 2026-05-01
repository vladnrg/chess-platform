import { useQuery } from '@tanstack/react-query'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { getLeagueConfig } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'


const TOOLTIP_STYLE = {
  backgroundColor: '#1e1e1e',
  border: '1px solid #2a2a2a',
  borderRadius: 8,
  color: '#f0f0f0',
  fontSize: 12,
}

export function StatsPage() {
  const { profile, user } = useAuth()

  const { data: xpHistory, isLoading } = useQuery({
    queryKey: ['xp-history', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_weekly_xp')
        .select('week_start, xp_earned, league_at_week_start')
        .eq('user_id', user!.id)
        .order('week_start')
        .limit(12)
      return (data ?? []).map((row: Record<string, unknown>) => ({
        week: new Date(row['week_start'] as string).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' }),
        xp: row['xp_earned'] as number,
        liga: row['league_at_week_start'] as string,
      }))
    },
    enabled: !!user,
  })

  const { data: puzzleStats } = useQuery({
    queryKey: ['puzzle-stats', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_puzzle_attempts')
        .select('solved, puzzle_id, puzzles(themes)')
        .eq('user_id', user!.id)
        .limit(200)

      const themeStats: Record<string, { total: number; solved: number }> = {}
      ;(data ?? []).forEach((attempt: Record<string, unknown>) => {
        const puzzle = attempt.puzzles as { themes?: string[] } | null
        const themes = puzzle?.themes ?? []
        themes.slice(0, 3).forEach(theme => {
          if (!themeStats[theme]) themeStats[theme] = { total: 0, solved: 0 }
          themeStats[theme].total++
          if (attempt.solved) themeStats[theme].solved++
        })
      })

      return Object.entries(themeStats)
        .map(([theme, { total, solved }]) => ({
          theme,
          'Rată succes': Math.round((solved / total) * 100),
          total,
        }))
        .filter(s => s.total >= 3)
        .sort((a, b) => b['Rată succes'] - a['Rată succes'])
        .slice(0, 8)
    },
    enabled: !!user,
  })

  const { data: courseStats } = useQuery({
    queryKey: ['course-stats', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_course_progress')
        .select('*, courses(title, level)')
        .eq('user_id', user!.id)

      return (data ?? []).map((row: Record<string, unknown>) => {
        const course = row.courses as { title?: string; level?: string } | null
        return {
          curs: course?.title?.split(' ').slice(0, 2).join(' ') ?? 'Necunoscut',
          completat: row.xp_earned as number,
          nivel: course?.level ?? '',
        }
      })
    },
    enabled: !!user,
  })

  if (!profile) return null

  const leagueConfig = getLeagueConfig(profile.current_league)
  const totalPuzzlesSolved = puzzleStats?.reduce((acc, s) => acc + s.total, 0) ?? 0
  const avgSuccess = puzzleStats?.length
    ? Math.round(puzzleStats.reduce((a, s) => a + s['Rată succes'], 0) / puzzleStats.length)
    : 0


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f0f0f0]">Statistici</h1>
        <p className="text-[#666] text-sm mt-0.5">Progresul tău în timp</p>
      </div>

      {/* Cards rezumat */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="XP Total" value={profile.xp.toLocaleString('ro-RO')} sub="puncte de experiență" />
        <StatCard label="Liga curentă" value={leagueConfig.label} sub="din 7 ligi" color={leagueConfig.color} />
        <StatCard label="Puzzle-uri" value={totalPuzzlesSolved.toString()} sub="tentative totale" />
        <StatCard label="Rată medie succes" value={`${avgSuccess}%`} sub="la puzzle-uri" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner className="h-6 w-6" /></div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* XP săptămânal */}
          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-[#f0f0f0] mb-4">XP câștigat săptămânal</h2>
              {xpHistory && xpHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={xpHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="week" tick={{ fill: '#666', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#666', fontSize: 11 }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Line type="monotone" dataKey="xp" stroke="#c8a84b" strokeWidth={2} dot={{ fill: '#c8a84b', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState text="Nu există date săptămânale încă." />
              )}
            </CardContent>
          </Card>

          {/* Puzzle success rate */}
          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-[#f0f0f0] mb-4">Rată succes pe teme puzzle</h2>
              {puzzleStats && puzzleStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={puzzleStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: '#666', fontSize: 11 }} tickFormatter={v => `${v}%`} />
                    <YAxis type="category" dataKey="theme" tick={{ fill: '#a0a0a0', fontSize: 10 }} width={80} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Succes']} />
                    <Bar dataKey="Rată succes" fill="#c8a84b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState text="Rezolvă cel puțin 3 puzzle-uri per temă pentru statistici." />
              )}
            </CardContent>
          </Card>

          {/* Cursuri în progres */}
          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-[#f0f0f0] mb-4">Cursuri studiate — XP câștigat</h2>
              {courseStats && courseStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={courseStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="curs" tick={{ fill: '#666', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#666', fontSize: 11 }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="completat" name="XP" fill="#50C878" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState text="Începe un curs pentru a vedea progresul." />
              )}
            </CardContent>
          </Card>

          {/* Puncte slabe */}
          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-[#f0f0f0] mb-4">Puncte slabe identificate</h2>
              {puzzleStats && puzzleStats.length > 0 ? (
                <div className="space-y-2">
                  {puzzleStats
                    .filter(s => s['Rată succes'] < 60)
                    .slice(0, 5)
                    .map(s => (
                      <div key={s.theme} className="flex items-center justify-between rounded-lg bg-[#111] p-2.5">
                        <span className="text-sm text-[#a0a0a0]">{s.theme}</span>
                        <span className="text-sm font-semibold text-[#f87171]">{s['Rată succes']}%</span>
                      </div>
                    ))
                  }
                  {puzzleStats.filter(s => s['Rată succes'] < 60).length === 0 && (
                    <p className="text-sm text-[#4ade80] text-center py-4">Nu ai puncte slabe evidente. Continuă!</p>
                  )}
                </div>
              ) : (
                <EmptyState text="Rezolvă mai multe puzzle-uri pentru a detecta punctele slabe." />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-[#666] uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold" style={{ color: color ?? '#f0f0f0' }}>{value}</p>
        <p className="text-xs text-[#a0a0a0] mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  )
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-sm text-[#666] text-center py-8">{text}</p>
}
