import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Trimite părintelui emailul de acord. Atât.
//
// Înainte, funcţia bloca ea contul şi lua adresa părintelui din cerere — oricine
// putea deci bloca orice cont şi pune propria adresă drept „părinte", apoi să-l
// confirme singur. Acum blocarea o face baza de date la crearea contului
// (migrarea 115), iar aici se citeşte doar ce e deja salvat: emailul pleacă
// numai spre adresa din profil şi numai pentru un cont care aşteaptă acordul.
//
// Se poate apela fără sesiune, fiindcă la înregistrarea cu email copilul n-are
// încă sesiune (trebuie întâi să-şi confirme adresa). Cel mai rău lucru pe care
// îl poate face cineva cu un id străin e să retrimită emailul aceluiaşi părinte —
// iar asta se întâmplă cel mult o dată la 10 minute.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
}
const VALABIL_ZILE = 30
const PAUZA_RETRIMITERE_MIN = 10

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const resendKey = Deno.env.get('RESEND_API_KEY')
  const from = Deno.env.get('EMAIL_FROM') ?? 'CleanChess <onboarding@resend.dev>'
  const appUrl = Deno.env.get('APP_URL') ?? 'http://localhost:5173'

  const { userId } = await req.json().catch(() => ({})) as { userId?: string }
  if (!userId) return json({ ok: false, motiv: 'cerere_invalida' }, 400)

  const { data: profil } = await supabase
    .from('profiles')
    .select('username, parental_email, account_frozen, account_frozen_reason')
    .eq('id', userId)
    .maybeSingle()

  if (!profil?.parental_email || !profil.account_frozen || profil.account_frozen_reason !== 'awaiting_parental_consent') {
    return json({ ok: false, motiv: 'nu_asteapta_acord' }, 409)
  }

  // Tabelul n-are dată de creare; o deducem din expirare (creare + 30 de zile).
  const pragRecent = new Date(Date.now() + (VALABIL_ZILE * 24 * 60 - PAUZA_RETRIMITERE_MIN) * 60_000).toISOString()
  const { count: recente } = await supabase
    .from('parental_links')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('type', 'confirm')
    .is('used_at', null)
    .gt('expires_at', pragRecent)
  if ((recente ?? 0) > 0) return json({ ok: false, motiv: 'trimis_recent' }, 429)

  if (!resendKey) return json({ ok: false, motiv: 'email_neconfigurat' }, 503)

  const expiresAt = new Date(Date.now() + VALABIL_ZILE * 24 * 60 * 60 * 1000).toISOString()
  const [{ data: confirmLink }, { data: rejectLink }] = await Promise.all([
    supabase.from('parental_links').insert({ user_id: userId, type: 'confirm', expires_at: expiresAt }).select('token').single(),
    supabase.from('parental_links').insert({ user_id: userId, type: 'reject', expires_at: expiresAt }).select('token').single(),
  ])
  if (!confirmLink?.token || !rejectLink?.token) return json({ ok: false, motiv: 'eroare_baza' }, 500)

  const confirmUrl = `${appUrl}/parental/confirm?token=${confirmLink.token}&action=confirm`
  const rejectUrl = `${appUrl}/parental/confirm?token=${rejectLink.token}&action=reject`
  const nume = escapeHtml(profil.username ?? 'Copilul dumneavoastră')

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: profil.parental_email,
      subject: `${profil.username ?? 'Copilul dumneavoastră'} vrea să învețe șah pe CleanChess`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#0f0f0f;color:#f0f0f0;padding:32px;border-radius:12px">
          <h2 style="color:#E2B340;margin:0 0 20px;text-align:center">CleanChess</h2>
          <h3 style="color:#f0f0f0">${nume} vrea să înceapă să învețe șah</h3>
          <p style="color:#a0a0a0">Copilul dumneavoastră și-a creat un cont pe CleanChess, o platformă de învățat șah
          în limba română. Pentru că are sub 16 ani, legea cere acordul dumneavoastră înainte ca platforma să-i
          folosească datele. Până atunci, contul rămâne blocat.</p>
          <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:16px;margin:20px 0">
            <p style="color:#a0a0a0;margin:0 0 12px"><strong style="color:#E2B340">Ce primește copilul:</strong></p>
            <ul style="color:#a0a0a0;margin:0;padding-left:20px;line-height:1.8">
              <li>Cursuri interactive de deschideri, tactică și jocul de mijloc</li>
              <li>Puzzle-uri pe nivelul lui</li>
              <li>Ca să nu stea prea mult în fața ecranului, sub 14 ani sesiunile au pauze obligatorii</li>
              <li>Copiii nu pot plăti nimic singuri: orice abonament trece pe la dumneavoastră</li>
            </ul>
          </div>
          <p style="margin:24px 0 8px">
            <a href="${confirmUrl}" style="display:block;background:#E2B340;color:#000;padding:14px;border-radius:8px;text-decoration:none;font-weight:bold;text-align:center">Sunt de acord, activați contul</a>
          </p>
          <p style="margin:0">
            <a href="${rejectUrl}" style="display:block;background:#1a1a1a;color:#f87171;border:1px solid #f87171;padding:14px;border-radius:8px;text-decoration:none;font-weight:bold;text-align:center">Nu sunt de acord</a>
          </p>
          <p style="color:#666;font-size:12px;margin-top:20px;text-align:center">
            Linkurile sunt valabile ${VALABIL_ZILE} de zile. Dacă nu știți nimic despre acest cont, ignorați emailul: fără acordul dumneavoastră contul rămâne blocat.
          </p>
        </div>
      `,
    }),
  })

  if (!res.ok) {
    console.error('request-parental-consent resend', res.status, await res.text())
    return json({ ok: false, motiv: 'email_esuat' }, 502)
  }
  return json({ ok: true })
})

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}
