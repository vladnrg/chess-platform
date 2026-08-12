import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { LeagueWidget } from '@/components/dashboard/LeagueWidget'
import { AppMap } from '@/components/dashboard/AppMap'
import { Card, CardContent } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { levelProgress, MAX_LEVEL } from '@/lib/levels'
import { formatXp } from '@/lib/utils'

/**
 * Bârlogul şahistului — pagina de start.
 *
 * Spune trei lucruri şi atât: unde eşti în ligă, ce nivel ai şi ce găseşti pe
 * site. Restul a plecat, fiindcă ocupa spaţiu fără să ajute pe nimeni:
 *
 *  - „Puzzle-uri azi": cine vrea puzzle-uri se duce direct pe pagina lor
 *  - misiunile zilei: au acum pagina lor, sub Antrenament
 *  - provocarea deschiderilor: e un eveniment, deci stă în Evenimente
 *  - cursurile recomandate: erau o a doua listă de cursuri, la un click de
 *    pagina care le are pe toate
 */
export function Dashboard() {
  const { profile } = useAuth()
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

  if (!profile) return null

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LeagueWidget />
        </div>
        <div className="lg:col-span-1">
          <LevelCard xp={profile.xp} />
        </div>
      </div>

      <AppMap />
    </div>
  )
}

/**
 * Nivelul jucătorului. A luat locul casetei „Elo estimat", care afişa un număr
 * dintr-un chestionar scurt de la înregistrare — se putea sări peste el, iar
 * rezultatul contrazicea rating-ul din testul serios de puzzle-uri.
 *
 * Nivelul e onest: vine din XP-ul pe care chiar l-ai adunat şi nu scade niciodată.
 */
function LevelCard({ xp }: { xp: number }) {
  const { level, xpToNext, percent, isMax } = levelProgress(xp)

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col justify-center gap-2 p-4">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs text-[#6B6B6B]">Nivelul tău</p>
            <p className="text-xl font-bold text-[#F0F0F0]">
              {level}
              <span className="ml-1 text-xs font-normal text-[#6B6B6B]">din {MAX_LEVEL}</span>
            </p>
          </div>
          <p className="text-xs text-[#6B6B6B]">{formatXp(xp)} XP</p>
        </div>

        <Progress value={percent} barClassName="bg-[#2DD4BF]" />

        <p className="text-xs text-[#A0A0A0]">
          {isMax ? 'Nivel maxim ✦' : `Încă ${xpToNext} XP până la nivelul ${level + 1}`}
        </p>
      </CardContent>
    </Card>
  )
}
