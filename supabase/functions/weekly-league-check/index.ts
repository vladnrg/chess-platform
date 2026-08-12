import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * Aplicarea săptămânală a ligilor.
 *
 * Toată regula stă în `apply_weekly_leagues` (migrarea 038): în fiecare ligă,
 * primii o treime urcă, ultimii o treime coboară, restul rămân.
 *
 * Funcţia asta nu mai decide nimic. Înainte avea propriul tabel de praguri
 * minime şi retrograda singură, în timp ce promovările se făceau în SQL —
 * două jumătăţi de mecanică în limbaje diferite, care puteau ajunge să nu se
 * mai potrivească. Acum e un simplu declanşator.
 */
serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Luni-ul săptămânii curente, în UTC — acelaşi reper ca `date_trunc('week')`
  // din Postgres, care foloseşte tot luni ca prima zi.
  const now = new Date()
  const day = now.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day
  const weekStart = new Date(now)
  weekStart.setUTCDate(now.getUTCDate() + diff)
  weekStart.setUTCHours(0, 0, 0, 0)
  const weekStartStr = weekStart.toISOString().split('T')[0]

  const { data, error } = await supabase.rpc('apply_weekly_leagues', {
    p_week_start: weekStartStr,
  })

  if (error) {
    console.error('apply_weekly_leagues a eşuat:', error.message)
    return new Response(
      JSON.stringify({ error: error.message, week: weekStartStr }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  console.log('Ligi aplicate:', JSON.stringify(data))

  return new Response(
    JSON.stringify(data),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
