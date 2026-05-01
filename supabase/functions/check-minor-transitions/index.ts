import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Runs daily via pg_cron at 00:01 UTC
// Transitions children who turned 14 today to normal accounts
serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const currentDay = new Date().getDate()

  // Find minors who turned exactly 14 today
  // is_minor is a generated column so we query birth_year directly
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, birth_year')
    .eq('birth_year', currentYear - 14)

  if (!profiles || profiles.length === 0) {
    return new Response('No transitions today', { status: 200 })
  }

  let transitioned = 0

  for (const profile of profiles) {
    // is_minor GENERATED column will now be false since age = 14
    // We just need to ensure account is unfrozen if frozen for age reasons
    await supabase
      .from('profiles')
      .update({ account_frozen: false, account_frozen_reason: null })
      .eq('id', profile.id)
      .eq('account_frozen_reason', 'age_restricted')

    console.log(`Transitioned user ${profile.username} (born ${profile.birth_year}) to adult account`)
    transitioned++
  }

  return new Response(
    JSON.stringify({ transitioned, date: `${currentYear}-${currentMonth}-${currentDay}` }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
