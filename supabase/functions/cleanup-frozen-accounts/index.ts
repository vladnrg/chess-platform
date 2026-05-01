import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Runs daily at 03:00 UTC via pg_cron
// Deletes accounts frozen for awaiting parental consent that expired 30+ days ago
serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // Find expired frozen accounts
  const { data: expiredAccounts } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('account_frozen', true)
    .eq('account_frozen_reason', 'awaiting_parental_consent')
    .lt('parental_consent_expires_at', thirtyDaysAgo)

  if (!expiredAccounts || expiredAccounts.length === 0) {
    return new Response('No expired accounts', { status: 200 })
  }

  let deleted = 0
  for (const account of expiredAccounts) {
    // Delete auth user (cascades to profile via FK)
    const { error } = await supabase.auth.admin.deleteUser(account.id)
    if (!error) {
      deleted++
      console.log(`Deleted expired frozen account: ${account.username}`)
    }
  }

  return new Response(
    JSON.stringify({ deleted, checked: expiredAccounts.length }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
