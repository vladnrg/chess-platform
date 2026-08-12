import { cn } from '@/lib/utils'
import type { LeagueConfig } from '@/types'

/**
 * Cât de tare se vede culoarea ligii în spatele siglei.
 *
 * `38` în hexazecimal = 22% opacitate. La 100% culorile deschise — aurul şi
 * bleul de la Legendar — ies ţipătoare şi înghit emblema; sub 12% nu se mai
 * distinge care ligă e care. E un singur număr de schimbat dacă se vrea altfel.
 */
const OPACITATE_FUNDAL = '38'

/** Conturul, ceva mai stins decât fundalul, ca sigla să aibă o margine clară. */
const OPACITATE_CONTUR = '33'

/**
 * Sigla unei ligi, aşezată pe culoarea ligii respective.
 *
 * Emblemele sunt decupate din fundalul lor alb şi tăiate la conturul propriu
 * (`scripts/league-logos.mjs`), deci umplu chenarul indiferent că sunt scut sau
 * medalion rotund. Culoarea vine de aici, nu din imagine: e singurul loc unde
 * se decide cum arată fundalul unei ligi. Înainte fiecare PNG îşi purta propriul
 * dreptunghi alb, care ieşea ca un bec pe cardurile întunecate.
 */
export function LeagueBadge({
  league,
  className,
  glow = false,
  dimmed = false,
}: {
  league: LeagueConfig
  /** Dimensiunea se dă de afară: `h-16 w-16`, `h-28 w-28`… */
  className?: string
  /** Aureolă în culoarea ligii — pentru liga în care eşti acum. */
  glow?: boolean
  /** Ligile încă blocate se sting, ca să se vadă că nu sunt ale tale. */
  dimmed?: boolean
}) {
  return (
    <div
      className={cn(
        // Emblemele nu sunt pătrate, deci culoarea se vede oricum prin colţuri.
        // `p-1` doar le ţine să nu atingă chenarul.
        'flex flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border p-1',
        className,
      )}
      style={{
        backgroundColor: league.color + OPACITATE_FUNDAL,
        borderColor: league.color + OPACITATE_CONTUR,
        opacity: dimmed ? 0.55 : undefined,
      }}
    >
      <img
        src={`/leagues/${league.name}.png`}
        alt={league.label}
        className="h-full w-full object-contain"
        style={{ filter: glow ? `drop-shadow(0 0 16px ${league.color}90)` : undefined }}
      />
    </div>
  )
}
