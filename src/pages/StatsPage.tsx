import { useQuery } from '@tanstack/react-query'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { getLeagueConfig } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/Card'

const TOOLTIP_STYLE = {
  backgroundColor: '#1e1e1e',
  border: '1px solid #2a2a2a',
  borderRadius: 8,
  color: '#f0f0f0',
  fontSize: 12,
}

function getHeatColor(count: number): string {
  if (count === 0) return '#1a1a1a'
  if (count <= 2) return '#7a6228'
  if (count <= 5) return '#a8872e'
  return '#c8a84b'
}

export function StatsPage() {
  const { profile, user } = useAuth()

  const { data: xpHistory } = useQuery({
    queryKey: ['xp-history', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_weekly_xp')
        .select('week_start, xp_earned')
        .eq('user_id', user!.id)
        .order('week_start')
        .limit(12)
      return (data ?? []).map((row: Record<string, unknown>) => ({
        week: new Date(row['week_start'] as string).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' }),
        xp: row['xp_earned'] as number,
      }))
    },
    enabled: !!user,
  })

  const { data: puzzleStats } = useQuery({
    queryKey: ['puzzle-stats', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_puzzle_attempts')
        .select('solved, puzzles(themes)')
        .eq('user_id', user!.id)
        .limit(200)

      const themeStats: Record<string, { total: number; solved: number }> = {}
      ;(data ?? []).forEach((attempt: Record<string, unknown>) => {
        const puzzle = attempt.puzzles as { themes?: string[] } | null
        ;(puzzle?.themes ?? []).slice(0, 3).forEach(theme => {
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

  const { data: puzzleCounts } = useQuery({
    queryKey: ['puzzle-counts', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_puzzle_attempts')
        .select('solved')
        .eq('user_id', user!.id)
      const total = data?.length ?? 0
      const solved = (data ?? []).filter((r: Record<string, unknown>) => r.solved).length
      return { total, solved }
    },
    enabled: !!user,
  })

  const { data: ratingHistory } = useQuery({
    queryKey: ['puzzle-rating-history', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('puzzle_rating_history')
        .select('rating, created_at')
        .eq('user_id', user!.id)
        .order('created_at')
        .limit(300)
      return (data ?? []).map((row: Record<string, unknown>, i: number) => ({
        idx: i + 1,
        rating: row['rating'] as number,
        date: new Date(row['created_at'] as string).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' }),
      }))
    },
    enabled: !!user,
  })

  const { data: courseStats } = useQuery({
    queryKey: ['course-stats', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_course_progress')
        .select('xp_earned, courses(title, level)')
        .eq('user_id', user!.id)

      return (data ?? [])
        .map((row: Record<string, unknown>) => {
          const course = row.courses as { title?: string; level?: string } | null
          return {
            curs: course?.title?.split(' ').slice(0, 2).join(' ') ?? 'Necunoscut',
            xp: row.xp_earned as number,
          }
        })
        .filter((c: { curs: string; xp: number }) => c.xp > 0)
    },
    enabled: !!user,
  })

  const { data: activityCounts } = useQuery({
    queryKey: ['activity-heatmap', user?.id],
    queryFn: async () => {
      const since = new Date()
      since.setDate(since.getDate() - 83)
      const { data } = await supabase
        .from('user_puzzle_attempts')
        .select('attempted_at')
        .eq('user_id', user!.id)
        .gte('attempted_at', since.toISOString())

      const counts: Record<string, number> = {}
      ;(data ?? []).forEach((row: Record<string, unknown>) => {
        const day = (row.attempted_at as string).slice(0, 10)
        counts[day] = (counts[day] ?? 0) + 1
      })
      return counts
    },
    enabled: !!user,
  })

  const { data: openingCoverage } = useQuery({
    queryKey: ['opening-coverage', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_course_progress')
        .select('completed_lesson_ids, courses(opening_family, lesson_count)')
        .eq('user_id', user!.id)

      return (data ?? [])
        .filter((row: Record<string, unknown>) => {
          const c = row.courses as { opening_family?: string | null } | null
          return c?.opening_family
        })
        .map((row: Record<string, unknown>) => {
          const c = row.courses as { opening_family: string; lesson_count: number }
          const completed = ((row.completed_lesson_ids as string[] | null) ?? []).length
          const total = c.lesson_count || 1
          return {
            family: c.opening_family,
            label: c.opening_family
              .replace(' Defense', '')
              .replace(' System', '')
              .replace(' Game', ''),
            completare: Math.round((completed / total) * 100),
          }
        })
    },
    enabled: !!user,
  })

  if (!profile) return null

  const leagueConfig = getLeagueConfig(profile.current_league)
  const avgSuccess = puzzleStats?.length
    ? Math.round(puzzleStats.reduce((a, s) => a + s['Rată succes'], 0) / puzzleStats.length)
    : 0
  const weakThemes = puzzleStats?.filter(s => s['Rată succes'] < 60).slice(0, 5) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f0f0f0]">Statistici personale</h1>
        <p className="text-[#666] text-sm mt-0.5">Progresul tău în timp</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="XP Total"
          value={profile.xp.toLocaleString('ro-RO')}
          sub="puncte de experiență"
        />
        <StatCard
          label="Liga curentă"
          value={leagueConfig.label}
          sub={`${profile.xp.toLocaleString('ro-RO')} XP acumulat`}
          color={leagueConfig.color}
        />
        <StatCard
          label="Streak curent"
          value={`${profile.streak_days} zile`}
          sub="activitate consecutivă"
        />
        <StatCard
          label="Rating puzzle"
          value={profile.puzzle_rating != null ? profile.puzzle_rating.toString() : 'Neplasat'}
          sub={
            puzzleCounts
              ? `${puzzleCounts.solved} din ${puzzleCounts.total} puzzle-uri rezolvate`
              : 'fă testul de plasament'
          }
          color="#c8a84b"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Evoluția rating-ului de puzzle */}
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#f0f0f0]">Rating de puzzle în timp</h2>
              {profile.puzzle_rating != null && (
                <span className="text-sm font-bold text-[#c8a84b] tabular-nums">{profile.puzzle_rating}</span>
              )}
            </div>
            {ratingHistory && ratingHistory.length >= 2 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={ratingHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="idx" tick={{ fill: '#666', fontSize: 11 }} tickFormatter={() => ''} />
                  <YAxis
                    domain={['dataMin - 30', 'dataMax + 30']}
                    tick={{ fill: '#666', fontSize: 11 }}
                    width={44}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    labelFormatter={(_, payload) => (payload?.[0]?.payload?.date as string) ?? ''}
                    formatter={(v) => [v, 'Rating']}
                  />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#c8a84b"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState text="Rezolvă câteva puzzle-uri ca să apară evoluția rating-ului." />
            )}
          </CardContent>
        </Card>

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
                  <Line
                    type="monotone"
                    dataKey="xp"
                    stroke="#c8a84b"
                    strokeWidth={2}
                    dot={{ fill: '#c8a84b', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState text="Nu există date săptămânale încă." />
            )}
          </CardContent>
        </Card>

        {/* Heatmap activitate */}
        <Card>
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold text-[#f0f0f0] mb-4">
              Activitate — ultimele 12 săptămâni
            </h2>
            <ActivityHeatmap counts={activityCounts ?? {}} />
            {avgSuccess > 0 && (
              <p className="text-[11px] text-[#555] mt-3">
                Rată medie succes puzzle: <span className="text-[#c8a84b]">{avgSuccess}%</span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Rată succes puzzle */}
        <Card>
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold text-[#f0f0f0] mb-4">Rată succes pe teme puzzle</h2>
            {puzzleStats && puzzleStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={puzzleStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fill: '#666', fontSize: 11 }}
                    tickFormatter={v => `${v}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="theme"
                    tick={{ fill: '#a0a0a0', fontSize: 10 }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(v) => [`${v}%`, 'Succes']}
                  />
                  <Bar dataKey="Rată succes" fill="#c8a84b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState text="Rezolvă cel puțin 3 puzzle-uri per temă pentru statistici." />
            )}
          </CardContent>
        </Card>

        {/* Acoperire openings */}
        <Card>
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold text-[#f0f0f0] mb-4">Acoperire openings studiate</h2>
            {openingCoverage && openingCoverage.length >= 3 ? (
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={openingCoverage} cx="50%" cy="50%" outerRadius={72}>
                  <PolarGrid stroke="#2a2a2a" />
                  <PolarAngleAxis dataKey="label" tick={{ fill: '#a0a0a0', fontSize: 10 }} />
                  <Radar
                    dataKey="completare"
                    stroke="#c8a84b"
                    fill="#c8a84b"
                    fillOpacity={0.25}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(v) => [`${v}%`, 'Completat']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : openingCoverage && openingCoverage.length > 0 ? (
              <div className="space-y-2 pt-2">
                {openingCoverage.map((o: { family: string; completare: number }) => (
                  <div key={o.family} className="flex items-center justify-between rounded-lg bg-[#111] p-2.5">
                    <span className="text-sm text-[#a0a0a0]">{o.family}</span>
                    <span className="text-sm font-semibold text-[#c8a84b]">{o.completare}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState text="Începe un curs de opening pentru a vedea acoperirea." />
            )}
          </CardContent>
        </Card>

        {/* Cursuri studiate */}
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
                  <Bar dataKey="xp" name="XP" fill="#50C878" radius={[4, 4, 0, 0]} />
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
                {weakThemes.map(s => (
                  <div
                    key={s.theme}
                    className="flex items-center justify-between rounded-lg bg-[#111] p-2.5"
                  >
                    <span className="text-sm text-[#a0a0a0]">{s.theme}</span>
                    <span className="text-sm font-semibold text-[#f87171]">{s['Rată succes']}%</span>
                  </div>
                ))}
                {weakThemes.length === 0 && (
                  <p className="text-sm text-[#4ade80] text-center py-4">
                    Nu ai puncte slabe evidente. Continuă!
                  </p>
                )}
              </div>
            ) : (
              <EmptyState text="Rezolvă mai multe puzzle-uri pentru a detecta punctele slabe." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string
  value: string
  sub: string
  color?: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-[#666] uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold" style={{ color: color ?? '#f0f0f0' }}>
          {value}
        </p>
        <p className="text-xs text-[#a0a0a0] mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  )
}

function ActivityHeatmap({ counts }: { counts: Record<string, number> }) {
  const today = new Date()
  const days: string[] = []
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }

  // 7 rows (day-of-week) × 12 columns (weeks)
  const rows = Array.from({ length: 7 }, (_, row) =>
    Array.from({ length: 12 }, (_, col) => days[col * 7 + row] ?? null)
  )

  const DAY_LABELS = ['Lu', '', 'Mi', '', 'Vi', '', 'Du']

  return (
    <div>
      <div className="flex gap-1">
        <div className="flex flex-col gap-[3px] mr-1">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="h-3 flex items-center text-[9px] text-[#444] leading-none w-3">
              {label}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-[3px]">
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-[3px]">
              {row.map((day, colIdx) => {
                const count = day ? (counts[day] ?? 0) : 0
                return (
                  <div
                    key={colIdx}
                    title={day ? `${day}: ${count} puzzle${count !== 1 ? '-uri' : ''}` : ''}
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: day ? getHeatColor(count) : 'transparent' }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-3 text-[10px] text-[#444]">
        <span>Mai puțin</span>
        {[0, 2, 5, 8].map(n => (
          <div key={n} className="w-3 h-3 rounded-sm" style={{ backgroundColor: getHeatColor(n) }} />
        ))}
        <span>Mai mult</span>
      </div>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-sm text-[#666] text-center py-8">{text}</p>
}
