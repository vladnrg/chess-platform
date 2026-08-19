import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { CardJucator } from '@/components/dashboard/CardJucator'
import { GraficXp } from '@/components/dashboard/GraficXp'
import { CursulCurent } from '@/components/dashboard/CursulCurent'
import type { RandJurnal } from '@/lib/xp-istoric'

/**
 * Bârlogul şahistului — pagina de start.
 *
 * Două lucruri, atât: cine eşti (cu XP-ul tău, în timp) şi unde ai rămas.
 *
 * A avut, pe rând, casetă de ligă, hartă cu treisprezece zone, puzzle-uri ale
 * zilei, misiuni şi cursuri recomandate. Toate au plecat. Motivul e acelaşi
 * pentru toate: cine intră prima oară nu are ce face cu treisprezece uşi
 * deschise deodată — le găseşte oricum, din bara de sus, când ajunge la ele.
 * Pagina de start răspunde la o singură întrebare: „ce făceam?"
 */
export function Dashboard() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Redirect la onboarding dacă nu a completat evaluarea
  useEffect(() => {
    if (profile && !profile.assessment_completed) {
      navigate('/onboarding', { replace: true })
    }
  }, [profile, navigate])

  // Toast Stripe checkout success
  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      toast.success('Abonament activat! Bun venit în Pro!')
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  // Jurnalul de XP, pentru grafic. Fără limită de zile în interogare: fereastra
  // se alege în pagină, iar o a doua cerere la fiecare schimbare de săgeată ar
  // face ca butonul să pară că se gândeşte.
  const { data: jurnal } = useQuery({
    queryKey: ['xp-jurnal', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<RandJurnal[]> => {
      const { data } = await supabase
        .from('xp_ledger')
        .select('amount, created_at')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5000)
      return (data ?? []) as RandJurnal[]
    },
  })

  if (!profile) return null

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start">
      <div className="space-y-4">
        <CardJucator profile={profile} />
        <GraficXp jurnal={jurnal ?? []} xpTotal={profile.xp} />
      </div>

      <CursulCurent />
    </div>
  )
}
