import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

const SESSION_MINUTES = 60
const WARNING_AT_MINUTES = 50

interface ChildSession {
  id: string
  session_number: number
  started_at: string
  expires_at: string
  break_duration_minutes: number
  break_starts_at: string | null
  break_ends_at: string | null
  last_seen_at: string
  warning_sent: boolean
}

export function useChildSession() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [session, setSession] = useState<ChildSession | null>(null)
  const [minutesLeft, setMinutesLeft] = useState<number | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isMinor = profile && (profile as any).is_minor === true

  const loadOrCreateSession = useCallback(async () => {
    if (!user || !isMinor) return

    // Check if currently in a break
    const { data: existingSessions } = await supabase
      .from('child_sessions')
      .select('*')
      .eq('user_id', user.id)
      .is('ended_at', null)
      .order('started_at', { ascending: false })
      .limit(1) as any

    const existing = existingSessions?.[0] as ChildSession | undefined

    if (existing) {
      const now = new Date()
      const breakEndsAt = existing.break_ends_at ? new Date(existing.break_ends_at) : null

      // Still in break
      if (breakEndsAt && now < breakEndsAt) {
        const breakMinsLeft = Math.ceil((breakEndsAt.getTime() - now.getTime()) / 60000)
        navigate(`/break?minutes=${breakMinsLeft}&sessionId=${existing.id}`)
        return
      }

      // Session expired → start break
      const expiresAt = new Date(existing.expires_at)
      if (now >= expiresAt && !existing.break_starts_at) {
        const breakMins = calcBreakDuration(existing.session_number)
        const breakStart = now
        const breakEnd = new Date(now.getTime() + breakMins * 60000)

        await supabase.from('child_sessions').update({
          break_duration_minutes: breakMins,
          break_starts_at: breakStart.toISOString(),
          break_ends_at: breakEnd.toISOString(),
        }).eq('id', existing.id) as any

        navigate(`/break?minutes=${breakMins}&sessionId=${existing.id}`)
        return
      }

      setSession(existing)
    } else {
      // Create new session
      const { data: lastSession } = await supabase
        .from('child_sessions')
        .select('session_number')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(1) as any

      const nextNumber = (lastSession?.[0]?.session_number ?? 0) + 1
      const now = new Date()
      const expiresAt = new Date(now.getTime() + SESSION_MINUTES * 60000)

      const { data: newSession } = await supabase
        .from('child_sessions')
        .insert({
          user_id: user.id,
          session_number: nextNumber,
          expires_at: expiresAt.toISOString(),
          break_duration_minutes: calcBreakDuration(nextNumber),
        })
        .select()
        .single() as any

      setSession(newSession)
    }
  }, [user, isMinor, navigate])

  // Heartbeat every 60s
  useEffect(() => {
    if (!user || !isMinor || !session) return

    const tick = async () => {
      const now = new Date()
      const expiresAt = new Date(session.expires_at)
      const minsLeft = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / 60000))

      setMinutesLeft(minsLeft)

      // Update last_seen
      await supabase.from('child_sessions').update({ last_seen_at: now.toISOString() }).eq('id', session.id) as any

      // Warning at 10 min left
      if (minsLeft <= SESSION_MINUTES - WARNING_AT_MINUTES && !session.warning_sent) {
        setShowWarning(true)
        await supabase.from('child_sessions').update({ warning_sent: true }).eq('id', session.id) as any
        setSession(s => s ? { ...s, warning_sent: true } : s)
      }

      // Session expired
      if (now >= expiresAt) {
        if (heartbeatRef.current) clearInterval(heartbeatRef.current)
        const breakMins = calcBreakDuration(session.session_number)
        const breakEnd = new Date(now.getTime() + breakMins * 60000)

        await supabase.from('child_sessions').update({
          break_duration_minutes: breakMins,
          break_starts_at: now.toISOString(),
          break_ends_at: breakEnd.toISOString(),
        }).eq('id', session.id) as any

        navigate(`/break?minutes=${breakMins}&sessionId=${session.id}`)
      }
    }

    tick()
    heartbeatRef.current = setInterval(tick, 60000)
    return () => { if (heartbeatRef.current) clearInterval(heartbeatRef.current) }
  }, [user, isMinor, session, navigate])

  useEffect(() => {
    loadOrCreateSession()
  }, [loadOrCreateSession])

  return { minutesLeft, showWarning, dismissWarning: () => setShowWarning(false), isMinor }
}

function calcBreakDuration(sessionNumber: number): number {
  // Session 1 → 15min, Session 2 → 30min, Session 3 → 60min, etc.
  return Math.min(15 * Math.pow(2, sessionNumber - 1), 480)
}
