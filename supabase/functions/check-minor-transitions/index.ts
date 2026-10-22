import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Runs daily via pg_cron at 00:01 UTC
// Cine împlineşte 16 ani anul acesta nu mai are nevoie de acordul părintelui
// (vârsta consimţământului digital în România, GDPR art. 8): dacă încă îl
// aştepta, contul se deschide. Pragul e acelaşi ca în migrarea 115.
serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const currentDay = new Date().getDate()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, birth_year')
    .eq('birth_year', currentYear - 16)

  if (!profiles || profiles.length === 0) {
    return new Response('No transitions today', { status: 200 })
  }

  let transitioned = 0

  for (const profile of profiles) {
    await supabase
      .from('profiles')
      .update({ account_frozen: false, account_frozen_reason: null })
      .eq('id', profile.id)
      .eq('account_frozen_reason', 'awaiting_parental_consent')

    console.log(`Transitioned user ${profile.username} (born ${profile.birth_year}) to adult account`)
    transitioned++
  }

  return new Response(
    JSON.stringify({ transitioned, date: `${currentYear}-${currentMonth}-${currentDay}` }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
