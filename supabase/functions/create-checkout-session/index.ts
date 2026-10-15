import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Versiunea API fixată aici e aceeaşi cu cea a webhook-ului din Stripe: câmpurile
// de perioadă (`current_period_end`) stau pe abonament doar în versiunile vechi.
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})
const APP_URL = Deno.env.get('APP_URL') ?? 'http://localhost:5173'

// Preţul îl alege serverul, din numele planului. Dacă l-ar trimite pagina, oricine
// ar putea cere orice preţ din cont — inclusiv unul de probă, de un cent.
const PRICES: Record<string, string | undefined> = {
  monthly: Deno.env.get('STRIPE_MONTHLY_PRICE_ID'),
  annual: Deno.env.get('STRIPE_ANNUAL_PRICE_ID'),
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  try {
    // Cine plăteşte se află din sesiunea lui, nu din ce scrie în cerere. Altfel
    // oricine ar putea porni o plată în numele altui cont.
    const token = req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return json({ error: 'Trebuie să fii autentificat.' }, 401)

    const { plan } = await req.json() as { plan?: string }
    const priceId = plan ? PRICES[plan] : undefined
    if (!priceId) return json({ error: 'Plan necunoscut.' }, 400)

    const { data: existing } = await supabase
      .from('subscriptions')
      .select('status, stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing?.status === 'active' || existing?.status === 'trialing') {
      return json({ error: 'Ai deja un abonament activ.' }, 409)
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      // Cine a mai fost client îşi păstrează fişa din Stripe (carduri, facturi);
      // cine vine prima dată primeşte una nouă, cu emailul contului completat.
      ...(existing?.stripe_customer_id
        ? { customer: existing.stripe_customer_id }
        : { customer_email: user.email }),
      client_reference_id: user.id,
      success_url: `${APP_URL}/dashboard?checkout=success`,
      cancel_url: `${APP_URL}/pricing`,
      metadata: { userId: user.id },
      subscription_data: { metadata: { userId: user.id } },
      locale: 'ro',
    })

    return json({ url: session.url })
  } catch (err) {
    console.error('create-checkout-session', err)
    return json({ error: 'Plata nu a putut fi pornită.' }, 500)
  }
})
