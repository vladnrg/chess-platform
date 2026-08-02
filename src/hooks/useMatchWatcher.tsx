import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase, type Match } from '@/lib/supabase'
import { matchMessage, materialBalance } from '@/lib/match-messages'
import { useAuth } from './useAuth'

/**
 * Supraveghetorul partidelor mele, montat în shell — deci activ oriunde eşti în
 * aplicaţie, nu doar pe pagina de partidă.
 *
 * Rezolvă două lipsuri descoperite la primele meciuri reale:
 *
 * 1. Ceasul era verificat doar de pagina de partidă. Dacă ieşeai de acolo, nimeni
 *    nu mai revendica timpul expirat şi partida rămânea „activă" la nesfârşit —
 *    până se întorcea cineva şi încerca să mute.
 *
 * 2. Dacă partida se încheia cât erai în altă parte (adversarul a abandonat, i-a
 *    expirat timpul), nu aflai nimic.
 */
export function useMatchWatcher() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Partidele mele active, cu tot ce trebuie ca să pot calcula ceasul local.
  const { data: active } = useQuery({
    queryKey: ['watched-matches', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('id, turn, status, white_time_ms, black_time_ms, last_move_at')
        .eq('status', 'active')
        .or(`white_id.eq.${user!.id},black_id.eq.${user!.id}`)
      if (error) throw error
      return data
    },
    enabled: !!user,
    staleTime: 30_000,
  })

  // ── Revendicarea timpului expirat ─────────────────────────────────────────
  // Verificarea e locală, din `last_move_at`: cât nimeni nu mută, datele nu se
  // schimbă, deci nu e nevoie să întrebăm serverul în buclă. Doar când chiar a
  // expirat trimitem cererea, iar serverul recalculează el timpul.
  useEffect(() => {
    if (!active?.length) return

    const check = () => {
      const now = Date.now()
      for (const m of active) {
        const stored = m.turn === 'w' ? m.white_time_ms : m.black_time_ms
        const elapsed = now - new Date(m.last_move_at).getTime()
        if (stored - elapsed <= 0) {
          void supabase.rpc('claim_timeout', { p_match_id: m.id })
        }
      }
    }

    check()
    const id = setInterval(check, 3000)
    return () => clearInterval(id)
  }, [active])

  // ── Vestea că s-a încheiat o partidă ──────────────────────────────────────
  useEffect(() => {
    if (!user) return

    const onUpdate = (payload: { new: Record<string, unknown> }) => {
      const m = payload.new as unknown as Match
      if (m.status !== 'finished') return

      void qc.invalidateQueries({ queryKey: ['watched-matches', user.id] })
      void qc.invalidateQueries({ queryKey: ['active-matches', user.id] })

      // Pe pagina partidei apare deja fereastra de final — n-are rost şi un mesaj.
      if (pathname === `/partida/${m.id}`) return

      const isDraw = m.result === 'draw'
      const iWon = m.winner_id === user.id
      const iAmWhite = m.white_id === user.id
      const material = materialBalance(m.fen)

      const { label, text } = matchMessage({
        outcome: isDraw ? 'draw' : iWon ? 'win' : 'loss',
        reason: m.result_reason,
        materialDiff: iAmWhite
          ? material.white - material.black
          : material.black - material.white,
        timeLeftMs: iAmWhite ? m.white_time_ms : m.black_time_ms,
        initialMs: m.minutes * 60 * 1000,
      }, m.id)

      toast(
        t => (
          <span
            className="cursor-pointer"
            onClick={() => { toast.dismiss(t.id); navigate(`/partida/${m.id}`) }}
          >
            <strong>{label}</strong> — {text}
          </span>
        ),
        { duration: 8000, icon: isDraw ? '🤝' : iWon ? '🏆' : '♟' }
      )
    }

    // Filtrul de Realtime acceptă o singură coloană, iar eu pot fi oricare din cei
    // doi jucători — de aceea două abonări pe acelaşi canal.
    const channel = supabase
      .channel(`my-matches:${user.id}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'matches', filter: `white_id=eq.${user.id}` },
        onUpdate)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'matches', filter: `black_id=eq.${user.id}` },
        onUpdate)
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [user, qc, navigate, pathname])
}
