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

    const { plan, renuntareRetragere } = await req.json() as { plan?: string; renuntareRetragere?: boolean }
    const priceId = plan ? PRICES[plan] : undefined
    if (!priceId) return json({ error: 'Plan necunoscut.' }, 400)

    // Acordul expres pentru acces imediat = renunţarea la retragerea de 14 zile
    // (OUG 34/2014, art. 16 lit. m). Fără el, excepţia nu se aplică.
    if (renuntareRetragere !== true) {
      return json({ error: 'Bifează căsuța de acord înainte de plată.' }, 400)
    }
    // Momentul acordului rămâne pe sesiune şi pe abonament, în Stripe: e dovada,
    // dacă plata e vreodată contestată la bancă.
    const acord = { userId: user.id, withdrawal_waiver_at: new Date().toISOString() }

    // Pagina de preţuri ascunde plata sub 14 ani, dar o cerere trimisă direct
    // ar fi trecut. Aceleaşi reguli, şi aici: sub 14 ani plăteşte părintele
    // (Codul civil), iar un cont blocat nu cumpără nimic până nu e deschis.
    const { data: profil } = await supabase
      .from('profiles')
      .select('birth_year, account_frozen')
      .eq('id', user.id)
      .maybeSingle()
    if (profil?.account_frozen) {
      return json({ error: 'Contul tău așteaptă acordul unui părinte, deci încă nu poate face plăți.' }, 403)
    }
    if (profil?.birth_year != null && new Date().getFullYear() - profil.birth_year < 14) {
      return json({ error: 'Sub 14 ani, abonamentul îl plătește un părinte.' }, 403)
    }

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
      metadata: acord,
      subscription_data: { metadata: acord },
      locale: 'ro',
      custom_text: {
        submit: {
          message: 'Accesul la Pro începe imediat după plată, iar dreptul de retragere de 14 zile nu se mai aplică. ' +
            'Garanția CleanChess rămâne: în primele 7 zile de la primul abonament primești banii înapoi integral, la cerere.',
        },
      },
    })

    return json({ url: session.url })
  } catch (err) {
    console.error('create-checkout-session', err)
    return json({ error: 'Plata nu a putut fi pornită.' }, 500)
  }
})
