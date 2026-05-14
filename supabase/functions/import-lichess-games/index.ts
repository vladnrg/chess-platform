import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

interface LichessGame {
  players: {
    white: { userId?: string; user?: { id: string } }
    black: { userId?: string; user?: { id: string } }
  }
  winner?: 'white' | 'black'
  status: string
  opening?: { eco: string; name: string }
  perf?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS })
  }

  try {
    const { lichessUsername, userId } = await req.json() as {
      lichessUsername: string
      userId: string
    }

    if (!lichessUsername || !userId) {
      return new Response(JSON.stringify({ error: 'Parametri lipsă' }), {
        status: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Fetch games from Lichess (NDJSON, public API)
    const lichessUrl = `https://lichess.org/api/games/user/${encodeURIComponent(lichessUsername)}?max=200&opening=true&perfType=rapid,classical,blitz&format=json`
    const lichessRes = await fetch(lichessUrl, {
      headers: { 'Accept': 'application/x-ndjson' },
    })

    if (!lichessRes.ok) {
      if (lichessRes.status === 404) {
        return new Response(JSON.stringify({ error: 'Utilizatorul Lichess nu a fost găsit.' }), {
          status: 404,
          headers: { ...CORS, 'Content-Type': 'application/json' },
        })
      }
      throw new Error(`Lichess API error: ${lichessRes.status}`)
    }

    const rawText = await lichessRes.text()
    const lines = rawText.split('\n').filter(l => l.trim())
    const games: LichessGame[] = []
    for (const line of lines) {
      try { games.push(JSON.parse(line)) } catch { /* skip malformed */ }
    }

    if (games.length === 0) {
      return new Response(JSON.stringify({ error: 'Nicio partidă găsită pentru acest utilizator.' }), {
        status: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    // Aggregate W/D/L per (eco, color)
    const usernameNorm = lichessUsername.toLowerCase()
    const statsMap: Record<string, { eco: string; opening_name: string; color: string; wins: number; draws: number; losses: number }> = {}

    for (const game of games) {
      if (!game.opening) continue

      const whiteId = (game.players.white.userId ?? game.players.white.user?.id ?? '').toLowerCase()
      const color = whiteId === usernameNorm ? 'white' : 'black'
      const { eco, name: opening_name } = game.opening

      const key = `${eco}-${color}`
      if (!statsMap[key]) statsMap[key] = { eco, opening_name, color, wins: 0, draws: 0, losses: 0 }

      if (!game.winner) {
        statsMap[key].draws++
      } else if (game.winner === color) {
        statsMap[key].wins++
      } else {
        statsMap[key].losses++
      }
    }

    const rows = Object.values(statsMap).map(s => ({
      user_id: userId,
      eco: s.eco,
      opening_name: s.opening_name,
      color: s.color,
      wins: s.wins,
      draws: s.draws,
      losses: s.losses,
      last_imported_at: new Date().toISOString(),
    }))

    if (rows.length > 0) {
      const { error } = await supabase
        .from('user_opening_stats')
        .upsert(rows, { onConflict: 'user_id,eco,color' })
      if (error) throw error
    }

    // Save lichess_username to profile
    await supabase
      .from('profiles')
      .update({ lichess_username: lichessUsername })
      .eq('id', userId)

    return new Response(
      JSON.stringify({ gamesProcessed: games.length, openingsFound: rows.length }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('[import-lichess-games]', err)
    return new Response(JSON.stringify({ error: 'Eroare la import. Încearcă din nou.' }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
