import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useSubscription } from '@/hooks/useSubscription'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

const PLAN: Record<string, string> = { monthly: 'Pro Lunar', annual: 'Pro Anual' }

function data(iso: string | null | undefined) {
  return iso ? new Date(iso).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
}

/**
 * Abonamentul, în profil: ce ai, până când, şi drumul spre anulare.
 *
 * Anularea, cardul şi facturile se fac în pagina Stripe (portalul clientului),
 * nu aici. Anularea păstrează Pro până la capătul perioadei plătite; vestea vine
 * înapoi prin webhook şi apare aici ca „se încheie pe…".
 */
export function Abonament() {
  const { subscription, isPro, loading } = useSubscription()
  const [deschid, setDeschid] = useState(false)

  if (loading) return null

  async function gestioneaza() {
    setDeschid(true)
    const { data: rezultat, error } = await supabase.functions.invoke<{ url?: string }>('create-portal-session')
    if (rezultat?.url) {
      window.location.assign(rezultat.url)
      return
    }
    let mesaj = 'Pagina abonamentului nu a putut fi deschisă. Încearcă din nou peste câteva minute.'
    const context: unknown = (error as { context?: unknown } | null)?.context
    if (context instanceof Response) {
      const body = await context.json().catch(() => null) as { error?: string } | null
      if (body?.error) mesaj = body.error
    }
    toast.error(mesaj)
    setDeschid(false)
  }

  const prinStripe = !!subscription?.stripe_customer_id
  const restanta = subscription?.status === 'past_due' || subscription?.status === 'unpaid'

  let titlu = 'Plan gratuit'
  let detaliu = 'Ai 6 cursuri complete, 10 puzzle-uri pe zi și 4 categorii de tactici.'
  if (isPro && !prinStripe) {
    titlu = 'Pro, acordat de echipă'
    detaliu = 'Abonamentul tău nu se plătește, deci nu ai nimic de gestionat.'
  } else if (isPro) {
    titlu = PLAN[subscription?.plan ?? ''] ?? 'Pro'
    detaliu = subscription?.cancel_at_period_end
      ? `Abonamentul e anulat. Ai Pro până pe ${data(subscription.current_period_end)}, apoi treci pe planul gratuit.`
      : `Se reînnoiește automat pe ${data(subscription?.current_period_end)}.`
  } else if (restanta) {
    titlu = 'Plata nu a trecut'
    detaliu = 'Ultima plată a fost refuzată, așa că Pro e oprit. Actualizează cardul și îl reiei.'
  }

  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <h2 className="font-semibold text-[#F0F0F0]">Abonament</h2>
        <div>
          <p className="font-semibold text-[#E2B340]">{titlu}</p>
          <p className="text-sm text-[#A0A0A0]">{detaliu}</p>
        </div>
        {prinStripe && (isPro || restanta) && (
          <>
            <Button variant="outline" onClick={() => void gestioneaza()} loading={deschid}>
              {restanta ? 'Actualizează cardul' : 'Gestionează abonamentul'}
            </Button>
            <p className="text-xs text-[#6B6B6B]">Anulare, schimbarea cardului și facturile, pe pagina securizată Stripe.</p>
          </>
        )}
        {/* Şi pentru cine a fost abonat şi a anulat: drumul înapoi spre Pro. */}
        {!isPro && !restanta && (
          <Link to="/pricing">
            <Button variant="outline">Vezi ce primești cu Pro</Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
