import { Link } from 'react-router-dom'
import { CheckCircle2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { RestrictedPricing } from '@/components/auth/RestrictedPricing'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '0',
    period: '',
    features: ['3 cursuri complete', '10 puzzle-uri/zi', 'Evaluare nivel', 'Dashboard de bază', 'Sistem de ligi'],
    cta: 'Plan curent',
    highlight: false,
    priceId: null,
  },
  {
    id: 'monthly',
    name: 'Pro Lunar',
    price: '9.99',
    period: '/lună',
    features: [
      'Toate cursurile (20+)',
      'Puzzle-uri nelimitate',
      'Statistici avansate',
      'Recomandări personalizate',
      'Export statistici',
      'Refund după 60 de zile dacă nu progresezi',
    ],
    cta: 'Alege Pro Lunar',
    highlight: true,
    priceId: import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID as string,
  },
  {
    id: 'annual',
    name: 'Pro Anual',
    price: '79.99',
    period: '/an',
    features: [
      'Tot din Pro Lunar',
      'Economisești ~2 luni ($39.89)',
      'Prioritate la suport',
      'Refund după 60 de zile dacă nu progresezi',
    ],
    cta: 'Cel mai bun preț',
    highlight: false,
    priceId: import.meta.env.VITE_STRIPE_ANNUAL_PRICE_ID as string,
  },
]

export function PricingPage() {
  const { user, profile } = useAuth()
  const { isPro, subscription } = useSubscription()

  const birthYear = (profile as any)?.birth_year as number | null | undefined
  const isMinor = birthYear != null && (new Date().getFullYear() - birthYear) < 14
  if (user && isMinor) return <RestrictedPricing />

  async function handleCheckout(priceId: string | null) {
    if (!priceId || !user) return
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ priceId, userId: user.id }),
    })
    const { url } = await res.json() as { url: string }
    if (url) window.location.href = url
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4">
          <Link to="/" className="flex items-center gap-1.5 text-sm text-[#666] hover:text-[#f0f0f0] transition-colors">
            <ArrowLeft className="h-4 w-4" /> Înapoi
          </Link>
        </div>
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-[#f0f0f0] mb-3">Prețuri simple și corecte</h1>
          <p className="text-[#a0a0a0] max-w-xl mx-auto">
            Refund garantat după 60 de zile de utilizare activă dacă nu observi progres real în partide.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`rounded-xl border p-6 flex flex-col ${
                plan.highlight
                  ? 'bg-[rgba(200,168,75,0.06)] border-[rgba(200,168,75,0.5)]'
                  : 'bg-[#1a1a1a] border-[#2a2a2a]'
              }`}
            >
              {plan.highlight && (
                <div className="mb-4 w-fit rounded-full bg-[#c8a84b] px-3 py-0.5 text-xs font-bold text-black">
                  POPULAR
                </div>
              )}
              <p className="text-sm text-[#666] mb-1">{plan.name}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-[#f0f0f0]">${plan.price}</span>
                <span className="text-[#666]">{plan.period}</span>
              </div>
              <ul className="flex-1 space-y-2.5 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-[#4ade80] mt-0.5 flex-shrink-0" />
                    <span className="text-[#a0a0a0]">{f}</span>
                  </li>
                ))}
              </ul>

              {plan.priceId ? (
                isPro && subscription?.plan === plan.id ? (
                  <Button variant="secondary" disabled className="w-full">Plan activ</Button>
                ) : user ? (
                  <Button
                    variant={plan.highlight ? 'primary' : 'outline'}
                    className="w-full"
                    onClick={() => handleCheckout(plan.priceId)}
                  >
                    {plan.cta}
                  </Button>
                ) : (
                  <Link to="/register">
                    <Button variant={plan.highlight ? 'primary' : 'outline'} className="w-full">
                      Înregistrează-te
                    </Button>
                  </Link>
                )
              ) : (
                <Link to={user ? '/dashboard' : '/register'}>
                  <Button variant="secondary" className="w-full">{plan.cta}</Button>
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-[#666]">
          <p className="mb-1">
            <span className="text-[#c8a84b]">Politica de refund</span> — Dacă după 60 de zile de utilizare activă nu observi progres real
            (măsurat prin statisticile din aplicație), oferi un refund complet.
          </p>
          <p>Plăți procesate securizat prin Stripe. Poți anula oricând.</p>
        </div>
      </div>
    </div>
  )
}
