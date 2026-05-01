import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Runs every Sunday at 08:00 UTC via pg_cron
// Sends weekly stats report to parents of minor accounts
serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )
  const resendKey = Deno.env.get('RESEND_API_KEY')
  const appUrl = Deno.env.get('APP_URL') ?? 'http://localhost:5173'

  // Get all active minor accounts with parental email
  const currentYear = new Date().getFullYear()
  const maxBirthYear = currentYear - 1   // at least 1 year old
  const minBirthYear = currentYear - 13  // strictly under 14

  const { data: minors } = await supabase
    .from('profiles')
    .select('id, username, xp, current_league, streak_days, parental_email')
    .not('birth_year', 'is', null)
    .gte('birth_year', minBirthYear)
    .lte('birth_year', maxBirthYear)
    .eq('account_frozen', false)
    .not('parental_email', 'is', null)

  if (!minors || minors.length === 0) {
    return new Response('No minors to report', { status: 200 })
  }

  let sent = 0
  const weekExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  for (const minor of minors) {
    // Create stats magic link
    const { data: link } = await supabase
      .from('parental_links')
      .insert({
        user_id: minor.id,
        type: 'stats',
        expires_at: weekExpiry,
      })
      .select('token')
      .single()

    if (!link) continue

    const statsUrl = `${appUrl}/parental/stats?token=${link.token}`

    if (resendKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'ChessVP <noreply@chessvp.ro>',
          to: minor.parental_email,
          subject: `Raport săptămânal — ${minor.username}`,
          html: `
            <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
              <h2>Progresul lui ${minor.username} săptămâna aceasta</h2>
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:8px 0;color:#666">XP Total</td><td style="font-weight:bold">${minor.xp}</td></tr>
                <tr><td style="padding:8px 0;color:#666">Liga curentă</td><td style="font-weight:bold">${minor.current_league}</td></tr>
                <tr><td style="padding:8px 0;color:#666">Streak activ</td><td style="font-weight:bold">${minor.streak_days} zile</td></tr>
              </table>
              <a href="${statsUrl}" style="display:inline-block;margin-top:16px;background:#c8a84b;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
                Vezi raportul complet →
              </a>
              <p style="color:#999;font-size:12px;margin-top:16px">Linkul expiră în 7 zile.</p>
            </div>
          `,
        }),
      })
      sent++
    }
  }

  return new Response(
    JSON.stringify({ processed: minors.length, sent }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
