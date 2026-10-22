import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CheckCircle2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { RestrictedPricing } from '@/components/auth/RestrictedPricing'
import { supabase } from '@/lib/supabase'
import { PRET_LUNAR, PRET_ANUAL, ECONOMIE_ANUALA, LUNI_ECONOMISITE, GARANTIE_ZILE, pret } from '@/lib/preturi'

type CheckoutPlan = 'monthly' | 'annual'

// Fiecare rând de aici trebuie să fie adevărat în aplicaţie. Lista veche promitea
// la Pro „Export statistici" (nu există), „Statistici avansate" şi „Recomandări
// personalizate" (le primesc toţi, gratis) şi „Prioritate la suport" (nu există
// încă niciun canal de suport) — exact lucrurile pentru care un client cere
// banii înapoi. Pro dă cantitate: mai multe cursuri, tactici, puzzle-uri, AI.
const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: pret(0),
    period: '',
    features: [
      '6 cursuri complete, dintre care 4 deschideri',
      '10 puzzle-uri pe zi',
      '4 categorii de tactici',
      'Căluțul savant: 3 întrebări pe zi',
      'Ligi, niveluri, evenimente și partide',
    ],
    cta: 'Plan curent',
    highlight: false,
    checkout: null,
  },
  {
    id: 'monthly',
    name: 'Pro Lunar',
    price: pret(PRET_LUNAR),
    period: '/lună',
    features: [
      'Toate cele 20 de deschideri (16 în plus)',
      'Puzzle-uri nelimitate',
      'Toate cele 16 categorii de tactici',
      'Căluțul savant fără limită',
      `Banii înapoi în ${GARANTIE_ZILE} zile, fără întrebări`,
    ],
    cta: 'Alege Pro Lunar',
    highlight: true,
    // Doar numele planului: preţul din Stripe îl alege serverul. Codurile de preţ
    // ţinute aici lipseau din build, iar butonul ajungea să ducă în Bârlog.
    checkout: 'monthly' as CheckoutPlan,
  },
  {
    id: 'annual',
    name: 'Pro Anual',
    price: pret(PRET_ANUAL),
    period: '/an',
    features: [
      'Tot din Pro Lunar',
      `Economisești ${pret(ECONOMIE_ANUALA)}: aproape ${LUNI_ECONOMISITE} luni gratuite`,
      `Banii înapoi în ${GARANTIE_ZILE} zile, fără întrebări`,
    ],
    cta: 'Cel mai bun preț',
    highlight: false,
    checkout: 'annual' as CheckoutPlan,
  },
]

export function PricingPage() {
  const { user, profile } = useAuth()
  const { isPro, subscription } = useSubscription()
  const [pending, setPending] = useState<CheckoutPlan | null>(null)
  const [acord, setAcord] = useState(false)
  const [arataAcord, setArataAcord] = useState(false)

  const birthYear = profile?.birth_year
  const isMinor = birthYear != null && (new Date().getFullYear() - birthYear) < 14
  if (user && isMinor) return <RestrictedPricing />

  async function handleCheckout(plan: CheckoutPlan) {
    // Fără bifă nu pornim plata, dar nici nu ţinem butonul stins: un buton stins
    // nu spune de ce. Apăsat, arată căsuţa care lipseşte.
    if (!acord) {
      setArataAcord(true)
      toast.error('Bifează mai întâi căsuța de deasupra planurilor.')
      return
    }
    setPending(plan)
    // `functions.invoke` trimite sesiunea celui logat; serverul află din ea cine
    // plăteşte, în loc să creadă pe cuvânt un id scris în cerere.
    const { data, error } = await supabase.functions.invoke<{ url?: string }>(
      'create-checkout-session',
      { body: { plan, renuntareRetragere: true } },
    )
    if (data?.url) {
      // assign() în loc de `location.href = ...`: aceeași redirecționare, dar apel de
      // metodă, nu atribuire pe un obiect global — ceea ce React Compiler interzice.
      window.location.assign(data.url)
      return
    }
    // Înainte, orice eşec lăsa butonul să nu facă nimic, fără niciun semn. Dacă
    // serverul a spus de ce („Ai deja un abonament activ."), arătăm motivul lui.
    let message = 'Plata nu a putut fi pornită. Încearcă din nou peste câteva minute.'
    const context: unknown = (error as { context?: unknown } | null)?.context
    if (context instanceof Response) {
      const body = await context.json().catch(() => null) as { error?: string } | null
      if (body?.error) message = body.error
    }
    toast.error(message)
    setPending(null)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4">
          <Link to="/" className="-ml-1 inline-flex items-center gap-1.5 px-1 py-2.5 text-sm text-[#6B6B6B] hover:text-[#F0F0F0] transition-colors">
            <ArrowLeft className="h-4 w-4" /> Înapoi
          </Link>
        </div>
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-[#F0F0F0] mb-3">Prețuri simple și corecte</h1>
          <p className="text-[#A0A0A0] max-w-xl mx-auto">
            Dacă în primele {GARANTIE_ZILE} zile Pro nu te convinge, îți dăm banii înapoi integral, fără întrebări.
          </p>
        </div>

        {/* Renunţarea la dreptul de retragere de 14 zile (OUG 34/2014, art. 16
            lit. m). Pentru conţinut digital, excepţia ţine doar cu acordul expres
            al omului, dat ÎNAINTE de plată, şi cu confirmarea că ştie ce pierde.
            Fără ea, oricine poate cere banii înapoi 14 zile — sau 12 luni, dacă
            n-a fost informat. Garanţia de 7 zile e separată şi rămâne. */}
        {user && !isPro && (
          <label
            className={`mx-auto mb-8 flex max-w-2xl cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition-colors ${
              arataAcord && !acord
                ? 'border-[#E2B340] bg-[rgba(226,179,64,0.08)]'
                : 'border-[#2A2A2A] bg-[#141414]'
            }`}
          >
            <input
              type="checkbox"
              checked={acord}
              onChange={e => setAcord(e.target.checked)}
              className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[#E2B340]"
            />
            <span className="text-[#A0A0A0]">
              Vreau acces la Pro imediat după plată și înțeleg că, astfel, renunț la dreptul legal de retragere
              de 14 zile. Garanția CleanChess de {GARANTIE_ZILE} zile rămâne valabilă.
            </span>
          </label>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`rounded-xl border p-6 flex flex-col ${
                plan.highlight
                  ? 'bg-[rgba(226,179,64,0.06)] border-[rgba(226,179,64,0.5)]'
                  : 'bg-[#141414] border-[#2A2A2A]'
              }`}
            >
              {plan.highlight && (
                <div className="mb-4 w-fit rounded-full bg-[#E2B340] px-3 py-0.5 text-xs font-bold text-black">
                  POPULAR
                </div>
              )}
              <p className="text-sm text-[#6B6B6B] mb-1">{plan.name}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-[#F0F0F0]">{plan.price}</span>
                <span className="text-[#6B6B6B]">{plan.period}</span>
              </div>
              <ul className="flex-1 space-y-2.5 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-[#4ade80] mt-0.5 flex-shrink-0" />
                    <span className="text-[#A0A0A0]">{f}</span>
                  </li>
                ))}
              </ul>

              {plan.checkout ? (
                isPro && subscription?.plan === plan.id ? (
                  <Button variant="secondary" disabled className="w-full">Plan activ</Button>
                ) : user ? (
                  <Button
                    variant={plan.highlight ? 'primary' : 'outline'}
                    className="w-full"
                    loading={pending === plan.checkout}
                    disabled={pending !== null}
                    onClick={() => handleCheckout(plan.checkout)}
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

        <div className="mt-12 text-center text-sm text-[#6B6B6B]">
          <p className="mb-1">
            <span className="text-[#E2B340]">Garanția</span>: în primele {GARANTIE_ZILE} zile de la primul abonament ne scrii
            și primești banii înapoi integral, fără să explici de ce. Reînnoirile nu intră în garanție.
          </p>
          <p>Plăți procesate securizat prin Stripe. Poți anula oricând.</p>
        </div>
      </div>
    </div>
  )
}
