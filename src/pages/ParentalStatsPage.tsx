import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

interface ChildStats {
  username: string
  current_league: string
  xp: number
  streak_days: number
  birth_year: number
}

interface WeekStat {
  week_start: string
  xp_earned: number
}

export function ParentalStatsPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [stats, setStats] = useState<ChildStats | null>(null)
  const [weeklyXp, setWeeklyXp] = useState<WeekStat[]>([])
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading')

  useEffect(() => {
    if (!token) { setState('error'); return }

    const load = async () => {
      const { data: link } = await supabase
        .from('parental_links')
        .select('user_id, expires_at, type')
        .eq('token', token)
        .single() as any

      if (!link || link.type !== 'stats' || new Date(link.expires_at) < new Date()) {
        setState('error')
        return
      }

      const [profileRes, xpRes] = await Promise.all([
        supabase.from('profiles').select('username, current_league, xp, streak_days, birth_year').eq('id', link.user_id).single() as any,
        supabase.from('user_weekly_xp').select('week_start, xp_earned').eq('user_id', link.user_id).order('week_start', { ascending: false }).limit(8) as any,
      ])

      if (!profileRes.data) { setState('error'); return }

      setStats(profileRes.data)
      setWeeklyXp(xpRes.data ?? [])
      setState('loaded')
    }

    load()
  }, [token])

  if (state === 'loading') {
    return <Screen><p className="text-[#6B6B6B]">Se încarcă statisticile...</p></Screen>
  }

  if (state === 'error' || !stats) {
    return (
      <Screen>
        <div className="text-center space-y-3">
          <p className="text-3xl">⌛</p>
          <p className="text-[#F0F0F0] font-semibold">Link invalid sau expirat</p>
          <p className="text-sm text-[#6B6B6B]">Linkul de statistici expiră după 7 zile. Verifică emailul pentru un link nou.</p>
        </div>
      </Screen>
    )
  }

  const totalXpThisMonth = weeklyXp.slice(0, 4).reduce((a, w) => a + w.xp_earned, 0)

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-10">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-3">♟</div>
          <h1 className="text-2xl font-bold text-[#F0F0F0]">Progresul lui {stats.username}</h1>
          <p className="text-sm text-[#6B6B6B] mt-1">Raport parental — ultimele 8 săptămâni</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="XP Total" value={stats.xp.toLocaleString('ro-RO')} />
          <StatCard label="Liga curentă" value={stats.current_league.charAt(0).toUpperCase() + stats.current_league.slice(1)} />
          <StatCard label="Streak activ" value={`${stats.streak_days} zile`} />
          <StatCard label="XP luna aceasta" value={totalXpThisMonth.toLocaleString('ro-RO')} />
        </div>

        <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] p-5">
          <h2 className="text-sm font-semibold text-[#F0F0F0] mb-4">XP pe săptămâni</h2>
          <div className="space-y-2">
            {weeklyXp.map(w => {
              const date = new Date(w.week_start).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })
              const pct = Math.min(100, Math.round((w.xp_earned / 300) * 100))
              return (
                <div key={w.week_start}>
                  <div className="flex justify-between text-xs text-[#6B6B6B] mb-0.5">
                    <span>{date}</span><span className="text-[#E2B340]">{w.xp_earned} XP</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#2A2A2A]">
                    <div className="h-1.5 rounded-full bg-[#E2B340]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
            {weeklyXp.length === 0 && <p className="text-xs text-[#6B6B6B] text-center py-4">Nicio activitate înregistrată încă.</p>}
          </div>
        </div>

        <p className="text-xs text-[#6B6B6B] text-center">
          Acest raport e disponibil 7 zile. Un nou raport e trimis în fiecare duminică.
        </p>
      </div>
    </div>
  )
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="max-w-sm w-full">{children}</div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] p-4">
      <p className="text-xs text-[#6B6B6B] uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-bold text-[#F0F0F0]">{value}</p>
    </div>
  )
}
