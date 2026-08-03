import { DailyMissions } from '@/components/dashboard/DailyMissions'

/**
 * Misiunile zilei, pagina lor.
 *
 * Stăteau pe Bârlog, unde erau al treilea bloc dintr-o pagină deja aglomerată.
 * Aici au loc să crească — generarea zilnică, progresul, pauza de după schimbare —
 * fără să împingă în jos lucrurile pe care le cauţi când deschizi aplicaţia.
 */
export function MissionsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      {/* Titlul stă în bara shell-ului; aici rămâne doar subtitlul */}
      <p className="text-sm text-[#6B6B6B]">
        Trei obiective mici în fiecare zi. Fiecare aduce XP, iar dacă le termini
        pe toate trei primești un bonus.
      </p>

      <DailyMissions />
    </div>
  )
}
