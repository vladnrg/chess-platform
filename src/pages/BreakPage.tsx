import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

const BREAK_ACTIVITIES = [
  'Fă 10 genuflexiuni — corpul îți mulțumește!',
  'Bea un pahar cu apă.',
  'Privește pe fereastră timp de 2 minute — ochii au nevoie de pauze.',
  'Hai afară câteva minute dacă poți.',
  'Citește câteva pagini dintr-o carte.',
]

export function BreakPage() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const [canResume, setCanResume] = useState(false)
  const [activity] = useState(() => BREAK_ACTIVITIES[Math.floor(Math.random() * BREAK_ACTIVITIES.length)])

  const sessionId = searchParams.get('sessionId')
  const initialMinutes = parseInt(searchParams.get('minutes') ?? '15')

  useEffect(() => {
    setSecondsLeft(initialMinutes * 60)
  }, [initialMinutes])

  // Countdown
  useEffect(() => {
    if (secondsLeft === null) return
    if (secondsLeft <= 0) {
      setCanResume(true)
      return
    }
    const t = setTimeout(() => setSecondsLeft(s => (s ?? 1) - 1), 1000)
    return () => clearTimeout(t)
  }, [secondsLeft])

  // Reduce break if user was inactive (last_seen gap > 10 min)
  useEffect(() => {
    if (!sessionId || !user) return

    const checkInactivity = async () => {
      const { data } = await supabase
        .from('child_sessions')
        .select('last_seen_at, break_ends_at')
        .eq('id', sessionId)
        .single() as any

      if (!data) return

      const lastSeen = new Date(data.last_seen_at)
      const now = new Date()
      const gapMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / 60000)

      if (gapMinutes >= 10 && data.break_ends_at) {
        const newBreakEnd = new Date(new Date(data.break_ends_at).getTime() - gapMinutes * 60000)
        const minsLeft = Math.max(0, Math.ceil((newBreakEnd.getTime() - now.getTime()) / 60000))
        setSecondsLeft(minsLeft * 60)
        if (minsLeft <= 0) setCanResume(true)
        await supabase.from('child_sessions').update({ break_ends_at: newBreakEnd.toISOString() }).eq('id', sessionId) as any
      }
    }

    checkInactivity()
  }, [sessionId, user])

  const mins = Math.floor((secondsLeft ?? 0) / 60)
  const secs = (secondsLeft ?? 0) % 60

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <div className="text-6xl mb-4">♟</div>
          <h1 className="text-3xl font-bold text-[#F0F0F0] mb-2">Pauză meritată!</h1>
          <p className="text-[#A0A0A0]">
            Ai jucat 60 de minute. Creierul tău are nevoie de o pauză ca să consolideze ce ai învățat.
          </p>
        </div>

        {!canResume ? (
          <div>
            <div className="rounded-full bg-[#141414] border border-[#2A2A2A] w-40 h-40 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl font-mono font-bold text-[#E2B340]">
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </span>
            </div>
            <p className="text-sm text-[#6B6B6B]">până poți relua sesiunea</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.3)] p-4">
              <p className="text-[#4ade80] font-semibold">Pauza s-a terminat!</p>
              <p className="text-sm text-[#A0A0A0] mt-1">Ești gata să continui?</p>
            </div>
            <a href="/dashboard" className="block">
              <button className="w-full rounded-lg bg-[#E2B340] text-black font-semibold py-3 hover:bg-[#F0C85A] transition-colors">
                Reia sesiunea
              </button>
            </a>
          </div>
        )}

        <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] p-4">
          <p className="text-xs text-[#6B6B6B] uppercase tracking-wider mb-2">Sugestie de pauză</p>
          <p className="text-sm text-[#A0A0A0]">{activity}</p>
        </div>
      </div>
    </div>
  )
}
