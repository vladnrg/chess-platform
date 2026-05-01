import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' })
  const resendKey = Deno.env.get('RESEND_API_KEY')
  const appUrl = Deno.env.get('APP_URL') ?? 'http://localhost:5173'
  const monthlyPriceId = Deno.env.get('STRIPE_MONTHLY_PRICE_ID')!
  const annualPriceId = Deno.env.get('STRIPE_ANNUAL_PRICE_ID')!

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { userId, parentalEmail } = await req.json() as { userId: string; parentalEmail: string }

  // Create two Stripe payment links (monthly + annual) for parent
  const [monthlySession, annualSession] = await Promise.all([
    stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: monthlyPriceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?checkout=success`,
      cancel_url: `${appUrl}/pricing`,
      metadata: { userId },
      customer_email: parentalEmail,
    }),
    stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: annualPriceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?checkout=success`,
      cancel_url: `${appUrl}/pricing`,
      metadata: { userId },
      customer_email: parentalEmail,
    }),
  ])

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .single()

  const childName = (profile as any)?.username ?? 'copilul dumneavoastră'

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
        subject: `Activare Pro pentru ${childName} — ChessVP`,
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
            <h2>Activare abonament Pro pentru ${childName}</h2>
            <p>${childName} v-a rugat să activați abonamentul Pro pe platforma de șah ChessVP.</p>
            <p>Alegeți planul care vi se potrivește:</p>
            <div style="margin:20px 0">
              <a href="${monthlySession.url}" style="display:block;background:#c8a84b;color:#000;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:bold;text-align:center;margin-bottom:10px">
                Pro Lunar — $9.99/lună
              </a>
              <a href="${annualSession.url}" style="display:block;background:#1a1a1a;color:#f0f0f0;border:1px solid #3a3a3a;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:bold;text-align:center">
                Pro Anual — $79.99/an (economisești 2 luni)
              </a>
            </div>
            <p style="color:#999;font-size:12px">Plata e procesată securizat prin Stripe. Linkurile sunt valabile 24h.</p>
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
