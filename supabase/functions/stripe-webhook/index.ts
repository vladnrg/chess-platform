import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
// Deno n-are modulul `crypto` din Node; fără asta verificarea semnăturii aruncă
// eroare la fiecare eveniment, iar toate ar fi respinse ca „semnătură invalidă".
const cryptoProvider = Stripe.createSubtleCryptoProvider()

function planFromPrice(priceId: string): 'monthly' | 'annual' | null {
  if (priceId === Deno.env.get('STRIPE_MONTHLY_PRICE_ID')) return 'monthly'
  if (priceId === Deno.env.get('STRIPE_ANNUAL_PRICE_ID')) return 'annual'
  return null
}

serve(async (req) => {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret, undefined, cryptoProvider)
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId ?? session.client_reference_id
    const subscriptionId = session.subscription as string

    if (!userId || !subscriptionId) return new Response('Missing metadata', { status: 400 })

    const sub = await stripe.subscriptions.retrieve(subscriptionId)
    const plan = planFromPrice(sub.items.data[0].price.id)
    if (!plan) return new Response('Unknown price', { status: 400 })

    // `onConflict: user_id`: un om are un singur rând de abonament. Fără asta, cine
    // se abonează a doua oară (după o anulare) ar lovi cheia unică şi plata lui
    // n-ar ajunge niciodată în aplicaţie — iar Stripe ar reîncerca zile întregi.
    const { error } = await supabase.from('subscriptions').upsert({
      user_id: userId,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscriptionId,
      plan,
      status: sub.status,
      cancel_at_period_end: sub.cancel_at_period_end,
      current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    }, { onConflict: 'user_id' })

    // Un 500 îl face pe Stripe să trimită evenimentul din nou mai târziu, în loc
    // să-l considere livrat şi să piardă plata.
    if (error) {
      console.error('stripe-webhook upsert', error)
      return new Response('DB error', { status: 500 })
    }
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const plan = planFromPrice(sub.items.data[0]?.price.id ?? '')

    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: sub.status,
        ...(plan ? { plan } : {}),
        cancel_at_period_end: sub.cancel_at_period_end,
        current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      })
      .eq('stripe_subscription_id', sub.id)

    if (error) {
      console.error('stripe-webhook update', error)
      return new Response('DB error', { status: 500 })
    }
  }

  return new Response('OK', { status: 200 })
})
