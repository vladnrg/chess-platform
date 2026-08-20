import { Target } from 'lucide-react'
import { DailyMissions } from '@/components/dashboard/DailyMissions'
import { ProbaDeFoc } from './ProbaDeFoc'

/**
 * Speciale — ce se schimbă de la o zi la alta.
 *
 * Misiunile zilei şi Proba de foc aveau fiecare pagina ei în meniu, deşi
 * niciuna n-avea destul cât să umple una: misiunile erau trei rânduri şi un
 * subtitlu. Erau şi două intrări din şase în „Antrenament", pentru două lucruri
 * care seamănă între ele mai mult decât cu restul — nu le exersezi când vrei
 * tu, ci când vin.
 *
 * Aici stau împreună, în ordinea în care le faci: întâi ce ai de bifat azi,
 * apoi proba, care e mai lungă şi cere linişte.
 */
export function SpecialePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <section className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#2DD4BF]/10">
            <Target className="h-6 w-6 text-[#2DD4BF]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-[#F0F0F0]">Misiunile zilei</h2>
            <p className="mt-1 text-sm leading-relaxed text-[#A0A0A0]">
              Trei obiective mici în fiecare zi. Fiecare aduce XP, iar dacă le termini
              pe toate trei primești un bonus.
            </p>
          </div>
        </div>

        <DailyMissions />
      </section>

      {/* Linia desparte două lucruri care n-au legătură între ele, dincolo de
          faptul că amândouă se schimbă de la o zi la alta. */}
      <div className="h-px bg-[#2A2A2A]" />

      <section>
        <ProbaDeFoc />
      </section>
    </div>
  )
}
