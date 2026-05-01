import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const LEAGUE_ORDER = ['cherestea', 'tinichea', 'bronz', 'argint', 'aur', 'smarald', 'diamant']
const WEEKLY_MINIMUMS: Record<string, number> = {
  cherestea: 30, tinichea: 50, bronz: 75, argint: 100, aur: 150, smarald: 200, diamant: 250,
}

serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Calculează data de start a săptămânii curente (luni)
  const now = new Date()
  const day = now.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day
  const weekStart = new Date(now)
  weekStart.setUTCDate(now.getUTCDate() + diff)
  weekStart.setUTCHours(0, 0, 0, 0)
  const weekStartStr = weekStart.toISOString().split('T')[0]

  // Ia toți utilizatorii cu liga actuală
  const { data: profiles, error: profilesErr } = await supabase
    .from('profiles')
    .select('id, current_league, username')

  if (profilesErr || !profiles) {
    return new Response(JSON.stringify({ error: 'Could not fetch profiles' }), { status: 500 })
  }

  let relegated = 0
  let checked = 0

  for (const profile of profiles) {
    if (profile.current_league === 'cherestea') continue // No relegation from bottom

    const { data: weeklyData } = await supabase
      .from('user_weekly_xp')
      .select('xp_earned')
      .eq('user_id', profile.id)
      .eq('week_start', weekStartStr)
      .single()

    const weeklyXp = weeklyData?.xp_earned ?? 0
    const minimum = WEEKLY_MINIMUMS[profile.current_league] ?? 0

    checked++

    if (weeklyXp < minimum) {
      // Retrogradare
      const currentIdx = LEAGUE_ORDER.indexOf(profile.current_league)
      const newLeague = currentIdx > 0 ? LEAGUE_ORDER[currentIdx - 1] : 'cherestea'

      await supabase
        .from('profiles')
        .update({ current_league: newLeague })
        .eq('id', profile.id)

      relegated++
      console.log(`Retrogradat: ${profile.username} din ${profile.current_league} → ${newLeague} (${weeklyXp}/${minimum} XP)`)
    }
  }

  return new Response(
    JSON.stringify({ checked, relegated, week: weekStartStr }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
