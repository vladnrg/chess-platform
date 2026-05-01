import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const WEEKLY_MINIMUMS: Record<string, number> = {
  cherestea: 30, tinichea: 50, bronz: 75, argint: 100, aur: 150, smarald: 200, diamant: 250,
}

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

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, current_league, username')
    .neq('current_league', 'cherestea')

  if (!profiles) return new Response('No profiles', { status: 500 })

  let warned = 0

  for (const profile of profiles) {
    const minimum = WEEKLY_MINIMUMS[profile.current_league] ?? 0
    const halfMinimum = Math.floor(minimum / 2)

    const { data: weeklyData } = await supabase
      .from('user_weekly_xp')
      .select('xp_earned, relegation_warning_sent')
      .eq('user_id', profile.id)
      .eq('week_start', weekStartStr)
      .single()

    const weeklyXp = weeklyData?.xp_earned ?? 0
    const alreadySent = weeklyData?.relegation_warning_sent ?? false

    if (weeklyXp < halfMinimum && !alreadySent) {
      // Marchează avertismentul ca trimis (in-app notification la next login)
      await supabase
        .from('user_weekly_xp')
        .upsert({
          user_id: profile.id,
          week_start: weekStartStr,
          xp_earned: weeklyXp,
          league_at_week_start: profile.current_league,
          relegation_warning_sent: true,
        })

      warned++
      console.log(`Avertisment: ${profile.username} — ${weeklyXp}/${minimum} XP (sub 50%)`)
    }
  }

  return new Response(
    JSON.stringify({ warned }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
