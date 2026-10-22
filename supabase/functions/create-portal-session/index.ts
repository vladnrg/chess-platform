import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Duce abonatul în pagina Stripe unde îşi anulează abonamentul, îşi schimbă
// cardul şi îşi vede facturile. Până acum aplicaţia n-avea niciun drum spre
// anulare: cine plătea nu putea renunţa singur.
//
// Ce are voie clientul acolo se setează în configurarea portalului din Stripe
// (anulare la sfârşitul perioadei plătite, fără bani înapoi pe zilele rămase —
// banii înapoi îi dă garanţia, la cerere). Anularea ajunge înapoi în aplicaţie
// prin `stripe-webhook`, ca orice altă schimbare de abonament.

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})
const APP_URL = Deno.env.get('APP_URL') ?? 'http://localhost:5173'
const CONFIGURARE = Deno.env.get('STRIPE_PORTAL_CONFIG_ID')

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return json({ error: 'Trebuie să fii autentificat.' }, 401)

    const { data: abonament } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    // Un abonament acordat de mână (contul creatorului) n-are fişă în Stripe.
    if (!abonament?.stripe_customer_id) {
      return json({ error: 'Abonamentul tău nu e plătit prin Stripe, deci nu are ce gestiona aici.' }, 404)
    }

    const sesiune = await stripe.billingPortal.sessions.create({
      customer: abonament.stripe_customer_id,
      return_url: `${APP_URL}/profile`,
      locale: 'ro',
      ...(CONFIGURARE ? { configuration: CONFIGURARE } : {}),
    })

    return json({ url: sesiune.url })
  } catch (err) {
    console.error('create-portal-session', err)
    return json({ error: 'Pagina abonamentului nu a putut fi deschisă. Încearcă din nou peste câteva minute.' }, 500)
  }
})
