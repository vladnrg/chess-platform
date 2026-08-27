import { Link } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { AvatarJucator } from '@/components/ui/AvatarJucator'
import { Progress } from '@/components/ui/Progress'
import { levelProgress, MAX_LEVEL } from '@/lib/levels'
import { formatXp } from '@/lib/utils'
import type { Profile } from '@/types'

/**
 * Cine eşti şi cât ai adunat — colţul din stânga sus al Bârlogului.
 *
 * Trei lucruri, în ordinea în care le caută ochiul: poza, nivelul, XP-ul total.
 * Numărul mare e XP-ul din profil, nu suma din jurnalul de XP: jurnalul a
 * apărut mai târziu decât platforma, deci ar arăta mai puţin decât are omul.
 *
 * Poza duce la profil, unde se schimbă. Creionul din colţ e acolo fiindcă
 * altfel nimeni n-ar ghici că se poate apăsa pe ea.
 */
export function CardJucator({ profile }: { profile: Profile }) {
  const { level, percent, xpToNext, isMax } = levelProgress(profile.xp)

  return (
    <div className="rounded-2xl border border-[#2A2A2A] bg-[#141414] p-4">
      <div className="flex items-center gap-4">
        <Link
          to="/profile"
          className="group relative flex-shrink-0"
        >
          <AvatarJucator
            src={profile.avatar_url}
            nume={profile.username}
            marime={72}
            inel="#E2B340"
          />
          <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#141414] bg-[#2A2A2A] text-[#A0A0A0] transition-colors group-hover:bg-[#E2B340] group-hover:text-[#0A0A0A]">
            <Pencil className="h-3 w-3" />
          </span>
        </Link>

        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-bold text-[#F0F0F0]">
            {profile.username}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="rounded-md bg-[#E2B340] px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-[#0A0A0A]">
              Nivel {level}
            </span>
            <span className="text-sm font-semibold text-[#F0F0F0]">
              {formatXp(profile.xp)} XP
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <Progress value={percent} barClassName="bg-[#E2B340]" />
        <p className="text-xs text-[#6B6B6B]">
          {isMax
            ? `Nivelul ${MAX_LEVEL} — mai sus nu se poate ✦`
            : `Încă ${formatXp(xpToNext ?? 0)} XP până la nivelul ${level + 1}`}
        </p>
      </div>
    </div>
  )
}
