import { History } from 'lucide-react'
import { descrieUltimaMutare, type UltimaMutare } from '@/lib/ultima-mutare'

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
export function EtichetaUltimeiMutari({ mutare }: { mutare: UltimaMutare | null }) {
  if (!mutare) return null

  return (
    <p className="flex items-center gap-2 rounded-lg border border-[rgba(226,179,64,0.2)] bg-[rgba(226,179,64,0.08)] px-3 py-2 text-sm font-medium text-[#E2B340]">
      <History className="h-4 w-4 flex-shrink-0" />
      <span>{descrieUltimaMutare(mutare)}</span>
    </p>
  )
}
