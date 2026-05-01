import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )
  const resendKey = Deno.env.get('RESEND_API_KEY')
  const appUrl = Deno.env.get('APP_URL') ?? 'http://localhost:5173'

  const { userId, parentalEmail, childUsername } = await req.json() as {
    userId: string
    parentalEmail: string
    childUsername: string
  }

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  // Freeze account and store parental info
  await supabase.from('profiles').update({
    parental_email: parentalEmail,
    account_frozen: true,
    account_frozen_reason: 'awaiting_parental_consent',
    parental_consent_given: false,
    parental_consent_expires_at: expiresAt,
  }).eq('id', userId)

  // Create confirm + reject links
  const [{ data: confirmLink }, { data: rejectLink }] = await Promise.all([
    supabase.from('parental_links').insert({ user_id: userId, type: 'confirm', expires_at: expiresAt }).select('token').single(),
    supabase.from('parental_links').insert({ user_id: userId, type: 'reject', expires_at: expiresAt }).select('token').single(),
  ])

  const confirmUrl = `${appUrl}/parental/confirm?token=${(confirmLink as any)?.token}&action=confirm`
  const rejectUrl = `${appUrl}/parental/confirm?token=${(rejectLink as any)?.token}&action=reject`

  if (resendKey) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ChessVP <noreply@chessvp.ro>',
        to: parentalEmail,
        subject: `Cerere cont — ${childUsername} vrea să învețe șah`,
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#0f0f0f;color:#f0f0f0;padding:32px;border-radius:12px">
            <div style="text-align:center;margin-bottom:24px">
              <span style="font-size:40px">♟</span>
              <h2 style="color:#f0f0f0;margin:8px 0">ChessVP</h2>
            </div>
            <h3 style="color:#f0f0f0">${childUsername} vrea să înceapă să învețe șah</h3>
            <p style="color:#a0a0a0">Copilul dumneavoastră a creat un cont pe ChessVP, o platformă educațională de șah.
            Deoarece are sub 14 ani, avem nevoie de acordul dvs. pentru a activa contul.</p>

            <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:16px;margin:20px 0">
              <p style="color:#a0a0a0;margin:0 0 12px"><strong style="color:#c8a84b">Ce oferă platforma:</strong></p>
              <ul style="color:#a0a0a0;margin:0;padding-left:20px;line-height:1.8">
                <li>Cursuri interactive de șah</li>
                <li>Puzzle-uri tactice cu progres vizibil</li>
                <li>Sesiuni limitate la <strong style="color:#c8a84b">60 de minute</strong> cu pauze obligatorii</li>
                <li>Raport săptămânal pentru dvs.</li>
              </ul>
            </div>

            <div style="display:flex;gap:12px;margin-top:24px">
              <a href="${confirmUrl}" style="flex:1;background:#c8a84b;color:#000;padding:14px;border-radius:8px;text-decoration:none;font-weight:bold;text-align:center;display:block">
                ✓ Confirm contul
              </a>
              <a href="${rejectUrl}" style="flex:1;background:#1a1a1a;color:#f87171;border:1px solid #f87171;padding:14px;border-radius:8px;text-decoration:none;font-weight:bold;text-align:center;display:block">
                ✗ Resping cererea
              </a>
            </div>

            <p style="color:#666;font-size:12px;margin-top:20px;text-align:center">
              Linkurile expiră în 30 de zile. Dacă nu acționați, contul este șters automat.
            </p>
          </div>
        `,
      }),
    })
  }

  return new Response(
    JSON.stringify({ ok: true }),
    { headers: { ...CORS, 'Content-Type': 'application/json' } },
  )
})
