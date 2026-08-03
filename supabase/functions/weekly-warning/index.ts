import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * Avertismentul de la mijlocul săptămânii, pentru cine e în zona de
 * retrogradare.
 *
 * Înainte compara XP-ul cu jumătate din pragul ligii. Pragurile au dispărut
 * odată cu migrarea 038 — liga se decide numai pe clasament — deci singurul
 * răspuns la „cine riscă să coboare" e chiar clasamentul, iar el se calculează
 * în baza de date (`relegation_zone_users`), unde stă şi regula.
 */
serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const now = new Date()
  const day = now.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day
  const weekStart = new Date(now)
  weekStart.setUTCDate(now.getUTCDate() + diff)
  weekStart.setUTCHours(0, 0, 0, 0)
  const weekStartStr = weekStart.toISOString().split('T')[0]

  const { data: atRisk, error } = await supabase.rpc('relegation_zone_users', {
    p_week_start: weekStartStr,
  })

  if (error) {
    console.error('relegation_zone_users a eşuat:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  let warned = 0

  for (const row of atRisk ?? []) {
    // Doar o dată pe săptămână, per om
    const { data: existing } = await supabase
      .from('user_weekly_xp')
      .select('xp_earned, relegation_warning_sent')
      .eq('user_id', row.user_id)
      .eq('week_start', weekStartStr)
      .single()

    if (existing?.relegation_warning_sent) continue

    await supabase
      .from('user_weekly_xp')
      .upsert({
        user_id: row.user_id,
        week_start: weekStartStr,
        xp_earned: existing?.xp_earned ?? 0,
        league_at_week_start: row.league,
        relegation_warning_sent: true,
      })

    warned++
    console.log(`Avertisment: ${row.user_id} — locul ${row.place} din ${row.members} (${row.league})`)
  }

  return new Response(
    JSON.stringify({ warned, at_risk: atRisk?.length ?? 0, week: weekStartStr }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
