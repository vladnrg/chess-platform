import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Chess } from 'https://esm.sh/chess.js@1.4.0'

/**
 * Arbitrul partidelor între jucători.
 *
 * Fiecare mutare trece pe aici. Motivul: partidele clasate dau XP, iar dacă
 * clientul ar scrie direct în baza de date, oricine şi-ar putea declara victorii
 * sau muta ilegal. Aici se verifică, cu aceleaşi reguli de şah ca în aplicaţie:
 *   - e rândul tău?
 *   - mutarea e legală în poziţia curentă?
 *   - ţi-a expirat timpul?
 *
 * Tot aici curge şi ceasul. Timpul se scade din diferenţa dintre momentul
 * serverului şi `last_move_at`, nu din ce raportează clientul — altfel un jucător
 * şi-ar putea îngheţa ceasul.
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Cine e cel care mută — luat din token, nu din corpul cererii
  const authHeader = req.headers.get('Authorization') ?? ''
  const { data: userData } = await admin.auth.getUser(authHeader.replace('Bearer ', ''))
  const userId = userData?.user?.id
  if (!userId) return json({ error: 'not_authenticated' }, 401)

  const { matchId, from, to, promotion } = await req.json().catch(() => ({}))
  if (!matchId || !from || !to) return json({ error: 'bad_request' }, 400)

  const { data: match, error: loadError } = await admin
    .from('matches').select('*').eq('id', matchId).single()

  if (loadError || !match) return json({ error: 'match_not_found' }, 404)
  if (match.status !== 'active') return json({ error: 'match_not_active' }, 409)

  const isWhite = match.white_id === userId
  const isBlack = match.black_id === userId
  if (!isWhite && !isBlack) return json({ error: 'not_your_match' }, 403)

  const myColor = isWhite ? 'w' : 'b'
  if (match.turn !== myColor) return json({ error: 'not_your_turn' }, 409)

  // ── Ceasul ────────────────────────────────────────────────────────────────
  const elapsed = Date.now() - new Date(match.last_move_at).getTime()
  const myTimeBefore = isWhite ? match.white_time_ms : match.black_time_ms
  const myTimeLeft = myTimeBefore - elapsed

  if (myTimeLeft <= 0) {
    // Timpul a expirat înainte de mutare: pierde cel care era la mutare
    await admin.rpc('finish_match', {
      p_match_id: matchId,
      p_result: isWhite ? 'black' : 'white',
      p_reason: 'timeout',
    })
    return json({ error: 'timeout', result: isWhite ? 'black' : 'white' }, 409)
  }

  // ── Legalitatea mutării ───────────────────────────────────────────────────
  const game = new Chess(match.fen)
  let moved
  try {
    moved = game.move({ from, to, promotion: promotion ?? 'q' })
  } catch {
    moved = null
  }
  if (!moved) return json({ error: 'illegal_move' }, 409)

  // Incrementul se adaugă după ce ai mutat, ca la ceasul de şah
  const newMyTime = myTimeLeft + match.increment_seconds * 1000

  // ── Sfârşitul partidei ────────────────────────────────────────────────────
  let result: string | null = null
  let reason: string | null = null

  if (game.isCheckmate()) {
    result = myColor === 'w' ? 'white' : 'black'
    reason = 'checkmate'
  } else if (game.isStalemate()) {
    result = 'draw'; reason = 'stalemate'
  } else if (game.isInsufficientMaterial()) {
    result = 'draw'; reason = 'insufficient'
  } else if (game.isThreefoldRepetition()) {
    result = 'draw'; reason = 'repetition'
  } else if (game.isDraw()) {
    result = 'draw'; reason = 'fifty'
  }

  const uci = from + to + (moved.promotion ?? '')

  const { error: updateError } = await admin
    .from('matches')
    .update({
      fen: game.fen(),
      moves: match.moves ? `${match.moves} ${uci}` : uci,
      turn: game.turn(),
      white_time_ms: isWhite ? newMyTime : match.white_time_ms,
      black_time_ms: isBlack ? newMyTime : match.black_time_ms,
      last_move_at: new Date().toISOString(),
      // Orice mutare anulează o propunere de remiză nesoluţionată
      draw_offer_by: null,
    })
    .eq('id', matchId)
    // Protecţie împotriva a două cereri simultane: dacă între timp s-a mutat
    // deja, condiţia pe `turn` nu mai e adevărată şi actualizarea nu se aplică.
    .eq('turn', myColor)

  if (updateError) return json({ error: 'update_failed' }, 500)

  if (result) {
    await admin.rpc('finish_match', { p_match_id: matchId, p_result: result, p_reason: reason })
  }

  return json({ ok: true, fen: game.fen(), san: moved.san, result, reason })
})
