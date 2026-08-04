import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import {
  effectiveStreak, streakMessage, weekdayInitial, localToday,
  type StreakDay,
} from '@/lib/streak'

/**
 * Insigna de streak din bara de sus.
 *
 * Arată câte zile la rând ai câştigat XP. Click pe ea deschide săptămâna:
 * care zile le-ai bifat şi care nu.
 *
 * Simbolul e piesa din siglă, aceeaşi ca la logo. Când sigla nouă e gata, se
 * schimbă doar aici — de asta stă într-o componentă separată şi nu împrăştiat
 * prin bară.
 */
export function StreakBadge() {
  const { profile, user } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const streak = effectiveStreak(profile?.streak_days, profile?.last_active_date)

  // Săptămâna se cere doar când deschizi panoul: nu are rost o interogare la
  // fiecare încărcare de pagină pentru ceva ce poate nu se uită nimeni.
  const { data: week = [] } = useQuery({
    queryKey: ['streak-week', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('my_streak_week')
      if (error) throw error
      return (data ?? []) as StreakDay[]
    },
    enabled: !!user && open,
    staleTime: 5 * 60_000,
  })

  // Închidere la click în afară — sistem extern (documentul), deci efect.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  if (!profile) return null

  const today = localToday()
  const activ = streak > 0

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        title={activ ? `${streak} zile la rând` : 'Niciun șir pornit'}
        className={[
          'flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 transition-colors',
          activ
            ? 'bg-[rgba(226,179,64,0.12)] hover:bg-[rgba(226,179,64,0.2)]'
            : 'bg-[#1C1C1C] hover:bg-[#242424]',
        ].join(' ')}
      >
        <StreakMark active={activ} />
        <span className={`text-sm font-bold tabular-nums ${activ ? 'text-[#E2B340]' : 'text-[#6B6B6B]'}`}>
          {streak}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-64 rounded-xl border border-[#2A2A2A] bg-[#141414] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="font-display text-lg font-bold text-[#F0F0F0]">
              {streak} {streak === 1 ? 'zi' : 'zile'} la rând
            </p>
            <StreakMark active={activ} />
          </div>

          <p className="mb-3 text-sm leading-relaxed text-[#A0A0A0]">
            {streakMessage(streak)}
          </p>

          <div className="flex justify-between">
            {week.map(d => {
              const azi = d.day === today
              return (
                <div key={d.day} className="flex flex-col items-center gap-1">
                  <span className={`text-[10px] ${azi ? 'font-bold text-[#F0F0F0]' : 'text-[#6B6B6B]'}`}>
                    {weekdayInitial(d.day)}
                  </span>
                  <span
                    className={[
                      'flex h-6 w-6 items-center justify-center rounded-full text-[11px]',
                      d.earned
                        ? 'bg-[rgba(226,179,64,0.18)] text-[#E2B340]'
                        : azi
                          ? 'border border-dashed border-[#3A3A3A] text-[#4A4A4A]'
                          : 'bg-[#1C1C1C] text-[#3A3A3A]',
                    ].join(' ')}
                  >
                    {d.earned ? '♟' : '·'}
                  </span>
                </div>
              )
            })}
          </div>

          <p className="mt-3 border-t border-[#2A2A2A] pt-2.5 text-xs leading-relaxed text-[#6B6B6B]">
            Ziua se bifează când strângi XP — un puzzle, o lecție, o victorie.
            Doar intrarea în aplicație nu contează.
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Semnul de streak — piesa din siglă.
 *
 * Aici se schimbă înfăţişarea când sigla nouă e gata: e singurul loc care o
 * desenează.
 */
function StreakMark({ active }: { active: boolean }) {
  return (
    <span
      className={[
        'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-black transition-colors',
        active
          ? 'bg-[#E2B340] text-black shadow-[0_0_12px_rgba(226,179,64,0.45)]'
          : 'bg-[#2A2A2A] text-[#6B6B6B]',
      ].join(' ')}
    >
      ♟
    </span>
  )
}
