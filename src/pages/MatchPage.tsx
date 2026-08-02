import { useCallback, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Chessboard, type PieceDropHandlerArgs } from 'react-chessboard'
import { Chess } from 'chess.js'
import { ChevronLeft, Flag, Handshake, Trophy } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase, type Match } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useMatch, formatClock, timeLeft, useTicker } from '@/hooks/useMatch'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'

const MOVE_ERRORS: Record<string, string> = {
  not_your_turn: 'Nu e rândul tău.',
  illegal_move: 'Mutarea nu e legală.',
  match_not_active: 'Partida s-a încheiat.',
  timeout: 'Ți-a expirat timpul.',
  network: 'Conexiune pierdută. Încearcă din nou.',
}

export function MatchPage() {
  const { matchId } = useParams<{ matchId: string }>()
  const { user } = useAuth()
  const { match, isLoading, myColor, isMyTurn, playMove } = useMatch(matchId)

  // Poziţia arătată imediat după mutarea proprie, până confirmă serverul. Fără ea,
  // piesa ar sări înapoi pentru câteva sute de milisecunde la fiecare mutare.
  //
  // Reţine şi poziţia de la care a pornit: când serverul confirmă, `match.fen` se
  // schimbă, potrivirea cade şi poziţia provizorie e ignorată. Aşa nu mai e nevoie
  // de un efect care s-o şteargă după fiecare actualizare.
  // Fereastra de final se poate închide ca să vezi tabla. Reţine partida pentru
  // care s-a închis, ca să reapară dacă intri în alta.
  const [dismissedFor, setDismissedFor] = useState<string | null>(null)
  const [optimistic, setOptimistic] = useState<{ fen: string; basedOn: string } | null>(null)
  const optimisticFen = optimistic && optimistic.basedOn === match?.fen ? optimistic.fen : null

  const onPieceDrop = useCallback(({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
    if (!targetSquare || !match || !isMyTurn) return false

    // Verificăm local întâi, ca o mutare evident greşită să nu mai facă drumul
    // până la server. Arbitrul o verifică oricum din nou.
    const probe = new Chess(match.fen)
    let ok
    try {
      ok = probe.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
    } catch {
      ok = null
    }
    if (!ok) return false

    setOptimistic({ fen: probe.fen(), basedOn: match.fen })
    void playMove(sourceSquare, targetSquare, 'q').then(err => {
      if (err) {
        setOptimistic(null)
        toast.error(MOVE_ERRORS[err] ?? 'Mutarea n-a putut fi trimisă.')
      }
    })
    return true
  }, [match, isMyTurn, playMove])

  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
  }

  if (!match || !myColor) {
    return (
      <div className="py-16 text-center">
        <p className="text-[#6B6B6B]">Partida nu a fost găsită sau nu e a ta.</p>
        <Link to="/clasament" className="mt-3 inline-block text-sm text-[#E2B340] hover:text-[#F0C85A]">
          Înapoi la clasament
        </Link>
      </div>
    )
  }

  const opponentId = myColor === 'w' ? match.black_id : match.white_id
  const oppColor: 'w' | 'b' = myColor === 'w' ? 'b' : 'w'
  const isOver = match.status !== 'active'

  return (
    <div className="flex flex-col gap-4" style={{ height: 'var(--app-page-h)' }}>
      <TimeoutWatcher match={match} />

      {isOver && dismissedFor !== match.id && (
        <ResultOverlay match={match} meId={user?.id} onClose={() => setDismissedFor(match.id)} />
      )}

      <Link
        to="/clasament"
        className="flex flex-shrink-0 items-center gap-1.5 text-sm text-[#A0A0A0] transition-colors hover:text-[#F0F0F0]"
      >
        <ChevronLeft className="h-4 w-4" />
        Înapoi la clasament
      </Link>

      <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
        {/* Tabla — pătrată, dimensionată din înălţimea rămasă */}
        <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center">
          <div className="aspect-square h-full max-h-full max-w-full overflow-hidden rounded-xl border border-[#2A2A2A]">
            <Chessboard
              options={{
                position: optimisticFen ?? match.fen,
                onPieceDrop,
                allowDragging: isMyTurn && !isOver,
                boardOrientation: myColor === 'w' ? 'white' : 'black',
                boardStyle: { borderRadius: 0 },
                darkSquareStyle: { backgroundColor: '#3A3A3A' },
                lightSquareStyle: { backgroundColor: '#f0d9b5' },
              }}
            />
          </div>
        </div>

        <div className="min-h-0 shrink-0 space-y-3 overflow-y-auto lg:w-[var(--app-rail)]">
          <PlayerClock userId={opponentId} match={match} color={oppColor} />

          {isOver ? (
            <MatchOutcome
              result={match.result}
              reason={match.result_reason}
              iWon={match.winner_id === user?.id}
              isDraw={match.result === 'draw'}
              xp={match.xp_awarded}
            />
          ) : (
            <Card className="p-4">
              <p className="text-xs uppercase tracking-wider text-[#6B6B6B]">
                {isMyTurn ? 'E rândul tău' : 'Adversarul se gândește'}
              </p>
              {match.draw_offer_by && match.draw_offer_by !== user?.id && (
                <p className="mt-2 text-sm text-[#E2B340]">
                  Adversarul îți propune remiză.
                </p>
              )}
              <p className="mt-2 text-xs text-[#6B6B6B]">
                {match.rated ? 'Partidă clasată — contează pentru XP.' : 'Partidă amicală — fără XP.'}
              </p>
            </Card>
          )}

          <PlayerClock userId={user?.id} match={match} color={myColor} isMe />

          {!isOver && <MatchActions matchId={match.id} drawOfferedByMe={match.draw_offer_by === user?.id} />}

          <MoveList moves={match.moves} />
        </div>
      </div>
    </div>
  )
}

/**
 * Ceasul unui jucător. Îşi porneşte propriul ticker, ca actualizarea lui de zece
 * ori pe secundă să nu redeseneze şi tabla.
 */
function PlayerClock({ userId, match, color, isMe }: {
  userId: string | undefined
  match: Match
  color: 'w' | 'b'
  isMe?: boolean
}) {
  const [name, setName] = useState<string>('—')
  const running = match.status === 'active' && match.turn === color
  const now = useTicker(running)
  const ms = timeLeft(match, color, now)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    void supabase.from('profiles').select('username').eq('id', userId).maybeSingle()
      .then(({ data }) => { if (!cancelled && data) setName(data.username) })
    return () => { cancelled = true }
  }, [userId])

  const low = ms < 30000

  return (
    <Card className={cn('flex items-center justify-between p-3', running && 'border-[rgba(226,179,64,0.5)]')}>
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#2A2A2A] text-xs font-bold text-[#E2B340]">
          {name.slice(0, 2).toUpperCase()}
        </div>
        <p className="truncate text-sm font-medium text-[#F0F0F0]">
          {name}{isMe && <span className="ml-1.5 text-xs font-normal text-[#6B6B6B]">(tu)</span>}
        </p>
      </div>
      <p className={cn(
        'flex-shrink-0 font-display text-xl font-bold tabular-nums',
        low && running ? 'text-[#FB7185]' : running ? 'text-[#F0F0F0]' : 'text-[#6B6B6B]'
      )}>
        {formatClock(ms)}
      </p>
    </Card>
  )
}

/**
 * Când cade steagul, cineva trebuie să spună serverului — altfel partida rămâne
 * activă la nesfârşit. Serverul verifică singur dacă timpul chiar a expirat, deci
 * nu se poate revendica din greşeală.
 *
 * Componentă separată, care nu randează nimic: aşa tick-ul ei nu redesenează tabla.
 */
function TimeoutWatcher({ match }: { match: Match }) {
  const active = match.status === 'active'
  const now = useTicker(active, 1000)
  const expired = active && (timeLeft(match, match.turn, now) <= 0)

  useEffect(() => {
    if (!expired) return
    void supabase.rpc('claim_timeout', { p_match_id: match.id })
  }, [expired, match.id])

  return null
}

/** Fereastra de final — în mijlocul ecranului, nu într-un colţ. */
function ResultOverlay({ match, meId, onClose }: {
  match: Match
  meId: string | undefined
  onClose: () => void
}) {
  const isDraw = match.result === 'draw'
  const iWon = match.winner_id === meId
  const title = isDraw ? 'Remiză' : iWon ? 'Ai câștigat!' : 'Ai pierdut'
  const color = isDraw ? '#A0A0A0' : iWon ? '#4ade80' : '#FB7185'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        className="w-full max-w-sm rounded-2xl border bg-[#141414] p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
        style={{ borderColor: `${color}66`, animation: 'pop-in 0.35s ease-out' }}
      >
        <Trophy className="mx-auto mb-3 h-12 w-12" style={{ color }} />
        <p className="font-display text-3xl font-black" style={{ color }}>{title}</p>
        {match.result_reason && (
          <p className="mt-1 text-sm text-[#A0A0A0]">prin {REASONS[match.result_reason] ?? match.result_reason}</p>
        )}

        {match.xp_awarded > 0 && (iWon || isDraw) && (
          <p className="mt-4 text-xl font-bold text-[#E2B340]">+{match.xp_awarded} XP</p>
        )}
        {match.rated && match.xp_awarded === 0 && iWon && (
          <p className="mt-4 text-xs text-[#6B6B6B]">
            Fără XP — ai jucat deja 3 partide clasate cu acest adversar azi.
          </p>
        )}

        <div className="mt-6 flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Vezi tabla
          </Button>
          <Link to="/clasament" className="flex-1">
            <Button className="w-full">Clasament</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function MatchActions({ matchId, drawOfferedByMe }: { matchId: string; drawOfferedByMe: boolean }) {
  const [busy, setBusy] = useState(false)

  async function resign() {
    if (!window.confirm('Sigur abandonezi partida?')) return
    setBusy(true)
    const { error } = await supabase.rpc('resign_match', { p_match_id: matchId })
    setBusy(false)
    if (error) toast.error('Nu am putut înregistra abandonul.')
  }

  async function draw() {
    setBusy(true)
    const { data, error } = await supabase.rpc('offer_or_accept_draw', { p_match_id: matchId })
    setBusy(false)
    if (error) return toast.error('Nu am putut trimite propunerea.')
    toast.success(data === 'accepted' ? 'Remiză!' : 'Propunere trimisă.')
  }

  return (
    <div className="flex gap-2">
      <Button variant="secondary" size="sm" className="flex-1" onClick={draw} disabled={busy || drawOfferedByMe}>
        <Handshake className="h-4 w-4" />
        {drawOfferedByMe ? 'Propus' : 'Remiză'}
      </Button>
      <Button variant="secondary" size="sm" className="flex-1" onClick={resign} disabled={busy}>
        <Flag className="h-4 w-4" /> Abandon
      </Button>
    </div>
  )
}

const REASONS: Record<string, string> = {
  checkmate: 'mat', resign: 'abandon', timeout: 'timp expirat',
  stalemate: 'pat', insufficient: 'material insuficient',
  repetition: 'repetiție', fifty: 'regula celor 50 de mutări',
  agreement: 'înțelegere', abandon: 'părăsire',
}

function MatchOutcome({ result, reason, iWon, isDraw, xp }: {
  result: string | null
  reason: string | null
  iWon: boolean
  isDraw: boolean
  xp: number
}) {
  const title = isDraw ? 'Remiză' : iWon ? 'Ai câștigat!' : 'Ai pierdut'
  const color = isDraw ? '#A0A0A0' : iWon ? '#4ade80' : '#FB7185'

  return (
    <Card className="p-4 text-center" style={{ borderColor: `${color}55` }}>
      <Trophy className="mx-auto mb-2 h-6 w-6" style={{ color }} />
      <p className="font-display text-lg font-bold" style={{ color }}>{title}</p>
      {reason && <p className="mt-0.5 text-xs text-[#6B6B6B]">prin {REASONS[reason] ?? reason}</p>}
      {xp > 0 && iWon && (
        <p className="mt-2 text-sm font-semibold text-[#E2B340]">+{xp} XP</p>
      )}
      {result && xp === 0 && !isDraw && iWon && (
        <p className="mt-2 text-xs text-[#6B6B6B]">
          Fără XP — ai jucat deja 3 partide clasate cu acest adversar azi.
        </p>
      )}
    </Card>
  )
}

/** Mutările, în perechi alb/negru. */
function MoveList({ moves }: { moves: string }) {
  const list = moves ? moves.split(' ') : []
  if (!list.length) return null

  const pairs: string[][] = []
  for (let i = 0; i < list.length; i += 2) pairs.push(list.slice(i, i + 2))

  return (
    <Card className="p-3">
      <p className="mb-2 text-xs uppercase tracking-wider text-[#6B6B6B]">Mutări</p>
      <div className="max-h-48 space-y-0.5 overflow-y-auto text-sm">
        {pairs.map((pair, i) => (
          <div key={i} className="flex gap-3 text-[#A0A0A0]">
            <span className="w-6 flex-shrink-0 text-right text-[#6B6B6B]">{i + 1}.</span>
            <span className="w-16">{pair[0]}</span>
            {pair[1] && <span className="w-16">{pair[1]}</span>}
          </div>
        ))}
      </div>
    </Card>
  )
}
