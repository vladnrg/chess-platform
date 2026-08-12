import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui/Card'
import { getLeagueConfig } from '@/lib/utils'
import { levelFromXp } from '@/lib/levels'
import { MAP_ZONES, type NavLeaf } from '@/lib/navigation'
import type { Profile } from '@/types'

/** Linia de stare a unui card: un text scurt, opţional colorat. */
interface ZoneState {
  text: string
  color?: string
}

/**
 * Starea personală per zonă.
 *
 * Regula: afişăm o cifră doar când e gratuită. Cinci zone îşi iau starea din
 * `profile`, una dintr-o singură interogare de tip `count`, iar restul rămân doar
 * cu descrierea — mai bine fără cifră decât cu o cerere în plus la server pentru ea.
 */
function stateFor(zone: NavLeaf, profile: Profile, coursesStarted: number | null): ZoneState | null {
  switch (zone.to) {
    case '/courses':
      return coursesStarted === null
        ? null
        : coursesStarted > 0
          ? { text: `${coursesStarted} ${coursesStarted === 1 ? 'curs început' : 'cursuri începute'}` }
          : { text: '3 cursuri gratuite' }

    case '/puzzles':
      return profile.puzzle_rating != null
        ? { text: `rating ${profile.puzzle_rating}`, color: '#E2B340' }
        : { text: 'începe cu testul de plasament' }

    case '/leagues': {
      const league = getLeagueConfig(profile.current_league)
      return { text: league.label, color: league.color }
    }

    case '/stats':
      return { text: `nivelul ${levelFromXp(profile.xp)}`, color: '#2DD4BF' }

    case '/repertoire':
      return profile.lichess_username
        ? { text: `Lichess: ${profile.lichess_username}`, color: '#4ade80' }
        : { text: 'conectează-ți contul Lichess' }

    default:
      return null
  }
}

/**
 * Harta aplicaţiei — ce zone există şi ce faci în fiecare.
 *
 * Există fiindcă navigarea stă acum în bara de sus, grupată: şapte pagini sunt
 * ascunse în meniuri derulante şi n-ar fi descoperite altfel.
 */
export function AppMap() {
  const { profile } = useAuth()

  const { data: coursesStarted } = useQuery({
    queryKey: ['courses-started', profile?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('user_course_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile!.id)
      if (error) throw error
      return count ?? 0
    },
    enabled: !!profile,
  })

  if (!profile) return null

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[#F0F0F0]">Ce găsești aici</h2>
        <p className="text-sm text-[#6B6B6B] mt-0.5">
          Fiecare zonă antrenează altceva. Începe de unde ai chef.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {MAP_ZONES.map(zone => {
          const Icon = zone.icon
          const state = stateFor(zone, profile, coursesStarted ?? null)

          return (
            <Link key={zone.to} to={zone.to} className="group block">
              <Card interactive className="flex h-full flex-col gap-2 p-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[rgba(226,179,64,0.12)]">
                    <Icon className="h-4 w-4 text-[#E2B340]" />
                  </div>
                  <h3 className="min-w-0 flex-1 truncate font-display text-sm font-semibold text-[#F0F0F0]">
                    {zone.label}
                  </h3>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-[#3A3A3A] transition-colors group-hover:text-[#E2B340]" />
                </div>

                <p className="text-sm leading-relaxed text-[#A0A0A0]">{zone.description}</p>

                {/* Starea neutră e #A0A0A0, nu #6B6B6B: pe fundalul cardului
                    al doilea are un contrast de ~3.2:1, sub pragul de lizibilitate
                    pentru text mic. Ierarhia o dau dimensiunea şi grosimea. */}
                {state && (
                  <p
                    className="mt-auto pt-1 text-xs font-semibold"
                    style={{ color: state.color ?? '#A0A0A0' }}
                  >
                    {state.text}
                  </p>
                )}
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
