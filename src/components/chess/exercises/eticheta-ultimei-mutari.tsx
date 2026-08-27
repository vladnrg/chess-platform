import { History } from 'lucide-react'
import { descrieUltimaMutare, type UltimaMutare } from '@/lib/ultima-mutare'

/** Spaţiu „tare": ţine rândul de text deschis când eticheta e doar loc păstrat. */
const SPATIU_CARE_TINE_RANDUL = '\u00A0'

/**
 * Ce a mutat adversarul, scris deasupra tablei.
 *
 * Pătratele colorate şi săgeata se pot rata — mai ales pe o tablă plină, unde
 * ochiul unui copil caută întâi piesele. Rândul ăsta nu se poate rata, şi e
 * singurul loc din care se află că mutarea *tocmai* s-a întâmplat: pe tablă se
 * vede unde stă pionul, nu de când stă acolo. Iar la en passant asta e toată
 * regula.
 *
 * Rămâne pe ecran şi după ce exerciţiul e rezolvat, ca tabla să nu sară în sus
 * exact în clipa în care omul se uită la ea.
 */
export function EtichetaUltimeiMutari({
  mutare,
  tineLocul = false,
}: {
  mutare: UltimaMutare | null
  /**
   * Rândul îşi păstrează locul şi când n-are ce scrie.
   *
   * Fără asta, la exerciţiile în mai mulţi paşi rândul apărea şi dispărea
   * între mutări, iar tabla de dedesubt cobora şi urca de fiecare dată cu
   * înălţimea lui. Un loc gol e mai bun decât tabla care sare sub degete.
   */
  tineLocul?: boolean
}) {
  if (!mutare && !tineLocul) return null

  return (
    <p
      aria-hidden={!mutare}
      className={`flex items-center gap-2 rounded-lg border border-[rgba(226,179,64,0.2)] bg-[rgba(226,179,64,0.08)] px-3 py-2 text-sm font-medium text-[#E2B340] ${mutare ? '' : 'invisible'}`}
    >
      <History className="h-4 w-4 flex-shrink-0" />
      <span>{mutare ? descrieUltimaMutare(mutare) : SPATIU_CARE_TINE_RANDUL}</span>
    </p>
  )
}
