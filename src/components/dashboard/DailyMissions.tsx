import { Puzzle, Sword, BookOpen, RefreshCw, Check, Clock, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'

/**
 * Misiunile zilei — deocamdată doar înfăţişarea, cu date fixe.
 *
 * Nimic nu e conectat: nu se citeşte şi nu se scrie nimic în baza de date, iar
 * butoanele nu fac nimic. Scopul e să vedem cum arată şi cum se simte înainte de
 * a construi partea grea (generarea zilnică, urmărirea progresului, cooldown-ul).
 *
 * Regulile stabilite, de respectat la implementarea reală:
 *  - maximum 3 misiuni pe zi
 *  - 15 XP per misiune, +25 XP bonus dacă le termini pe toate trei
 *  - XP-ul se primeşte per misiune terminată, nu doar dacă le faci pe toate
 *  - o misiune poate fi schimbată („refresh"), dar apoi acel loc intră într-o
 *    pauză de 4 ore
 *  - o misiune nu poate cere parcurgerea mai multor cursuri într-o zi (i-ar
 *    împrăştia pe copii), dar poate cere mai multe părţi din acelaşi curs
 */

export const MISSION_XP = 15
export const MISSION_ALL_BONUS = 25
export const MISSION_SLOTS = 3
export const MISSION_REFRESH_COOLDOWN_H = 4

type MissionStatus = 'active' | 'done' | 'cooldown'

interface Mission {
  id: string
  icon: LucideIcon
  text: string
  done: number
  total: number
  status: MissionStatus
  /** Ore rămase din pauza de după schimbare; doar pentru `status: 'cooldown'`. */
  cooldownLeft?: number
}

/** Date fixe, alese ca să arate toate cele trei stări deodată. */
const SAMPLE_MISSIONS: Mission[] = [
  { id: 'm1', icon: Puzzle, text: 'Rezolvă 5 puzzle-uri', done: 3, total: 5, status: 'active' },
  { id: 'm2', icon: Sword, text: 'Termină 3 exerciții din Cuferele cu tactici', done: 3, total: 3, status: 'done' },
  { id: 'm3', icon: BookOpen, text: 'Parcurge Deschiderea și Jocul de mijloc dintr-un curs', done: 0, total: 2, status: 'cooldown', cooldownLeft: 4 },
]

export function DailyMissions() {
  const completed = SAMPLE_MISSIONS.filter(m => m.status === 'done').length
  const earned = completed * MISSION_XP + (completed === MISSION_SLOTS ? MISSION_ALL_BONUS : 0)
  const maxPossible = MISSION_SLOTS * MISSION_XP + MISSION_ALL_BONUS

  return (
    <section>
      {/* Numele şi explicaţia le dă pagina care ţine componenta — aici erau a
          doua oară, unul sub altul. */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        {/* Cifrele de mai jos sunt inventate, iar XP-ul nu se acordă. Cât timp e
            aşa, scrie pe ecran: altfel cineva chiar crede că a strâns 15 XP azi
            şi se întreabă de ce nu-i apar nicăieri. */}
        <span className="rounded-full border border-[rgba(226,179,64,0.3)] bg-[rgba(226,179,64,0.08)] px-2.5 py-1 text-xs text-[#E2B340]">
          În lucru — misiunile şi cifrele de mai jos sunt de probă
        </span>
        <p className="text-sm text-[#6B6B6B]">
          <span className="font-semibold text-[#E2B340]">{earned}</span> din {maxPossible} XP azi
        </p>
      </div>

      {/* Pe orizontală, nu în listă: cele trei misiuni se văd dintr-o privire,
          fără scroll. Pe ecrane înguste revin una sub alta. */}
      <div className="grid gap-3 md:grid-cols-3">
        {SAMPLE_MISSIONS.map(mission => (
          <MissionCard key={mission.id} mission={mission} />
        ))}
      </div>

      {/* Bonusul pentru toate trei */}
      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-[#2A2A2A] bg-[#141414] px-4 py-2.5">
        <p className="text-sm text-[#A0A0A0]">
          Termină toate trei și primești un bonus de{' '}
          <span className="font-semibold text-[#E2B340]">{MISSION_ALL_BONUS} XP</span>
        </p>
        <p className="flex-shrink-0 text-xs font-semibold text-[#6B6B6B]">
          {completed} / {MISSION_SLOTS}
        </p>
      </div>
    </section>
  )
}

function MissionCard({ mission }: { mission: Mission }) {
  const Icon = mission.icon
  const isDone = mission.status === 'done'
  const isCooling = mission.status === 'cooldown'
  const pct = mission.total > 0 ? Math.round((mission.done / mission.total) * 100) : 0

  return (
    <Card className={`flex h-full flex-col gap-3 p-4 ${isDone ? 'border-[rgba(74,222,128,0.35)]' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
            isDone ? 'bg-[rgba(74,222,128,0.15)]' : 'bg-[#1C1C1C]'
          }`}
        >
          {isDone
            ? <Check className="h-5 w-5 text-[#4ade80]" />
            : <Icon className={`h-4 w-4 ${isCooling ? 'text-[#3A3A3A]' : 'text-[#E2B340]'}`} />}
        </div>

        <div className="flex flex-shrink-0 items-center gap-1">
          <span className={`text-xs font-semibold ${isDone ? 'text-[#4ade80]' : 'text-[#6B6B6B]'}`}>
            {isDone ? `+${MISSION_XP} XP` : `${MISSION_XP} XP`}
          </span>
          {/* Schimbarea misiunii — dezactivată cât e în pauză sau deja terminată */}
          <button
            type="button"
            disabled={isDone || isCooling}
            title={isCooling ? `Disponibil peste ${mission.cooldownLeft}h` : 'Schimbă misiunea'}
            aria-label={isCooling ? `Disponibil peste ${mission.cooldownLeft} ore` : 'Schimbă misiunea'}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6B6B6B] transition-colors enabled:hover:bg-[#1C1C1C] enabled:hover:text-[#F0F0F0] disabled:opacity-30"
          >
            {isCooling ? <Clock className="h-3.5 w-3.5" /> : <RefreshCw className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminată = bifă, nu text tăiat: tăierea sugerează „anulat", nu „reușit" */}
      <p className={`text-sm leading-snug ${isDone ? 'text-[#A0A0A0]' : isCooling ? 'text-[#6B6B6B]' : 'text-[#F0F0F0]'}`}>
        {mission.text}
      </p>

      <div className="mt-auto">
        {isDone && <p className="text-xs font-semibold text-[#4ade80]">Terminată</p>}
        {isCooling && (
          <p className="text-xs text-[#6B6B6B]">
            Schimbată — din nou peste {mission.cooldownLeft}h
          </p>
        )}
        {!isDone && !isCooling && (
          <div className="flex items-center gap-2">
            <Progress value={pct} className="h-1" barClassName="bg-[#E2B340]" />
            <span className="flex-shrink-0 text-xs text-[#6B6B6B]">{mission.done}/{mission.total}</span>
          </div>
        )}
      </div>
    </Card>
  )
}
