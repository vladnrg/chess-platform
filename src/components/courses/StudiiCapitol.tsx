import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { BookOpen, CheckCircle2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChapterPath } from './ChapterPath'
import { inaltimeaTraseuluiCompact } from './geometrie-traseu'
import type { Studiu } from '@/lib/capitole-curs'

/**
 * Studiile unui capitol, ca la Chessly (cerut pe 2026-11-26): fiecare cu bara
 * lui de titlu, uşor de văzut, şi harta lui dedesubt.
 *
 * `compact` (Bârlogul): doar studiul în care eşti stă deschis, celelalte sunt
 * strânse pe un rând şi se deschid la apăsare; nodurile se suprapun, ca la
 * Chessly, ca studiul să încapă întreg fără derulare. Pe ecran lat, studiul
 * deschis ia tot locul rămas până jos (cerut pe 2026-11-26), iar harta lui se
 * măreşte cât să-l umple.
 */
export function StudiiCapitol({ studii, eticheta, compact = false }: {
  studii: Studiu[]
  eticheta?: { nodId: string; text: string } | null
  compact?: boolean
}) {
  const terminat = (st: Studiu) => st.noduri.filter(n => n.href).every(n => n.done)
  const blocat = (s: number) => studii.slice(0, s).some(prev => prev.noduri.some(n => n.href && !n.done))
  const curent = Math.max(0, studii.findIndex(st => !terminat(st)))
  const [deschise, setDeschise] = useState<Set<number>>(() => new Set(compact ? [curent] : studii.map((_, s) => s)))
  const comuta = (s: number) => setDeschise(v => { const n = new Set(v); if (!n.delete(s)) n.add(s); return n })

  return (
    <div className={compact ? 'flex flex-col gap-2 lg:min-h-0 lg:flex-1' : 'space-y-2'}>
      {studii.map((st, s) => {
        const deschis = deschise.has(s)
        const gata = terminat(st)
        return (
          <div
            key={s}
            className={cn(
              'overflow-hidden rounded-xl border border-[#E2B340]/30 bg-[#16140F]',
              compact && 'flex flex-shrink-0 flex-col',
              compact && deschis && 'lg:min-h-0 lg:flex-1 lg:flex-shrink',
            )}
          >
            <button
              type="button"
              onClick={() => comuta(s)}
              aria-expanded={deschis}
              className="flex w-full flex-shrink-0 items-center gap-2.5 bg-[#E2B340]/[0.12] px-3 py-2 text-left transition-colors hover:bg-[#E2B340]/[0.18]"
            >
              <span className="flex flex-shrink-0 items-center gap-1 rounded-md bg-[#E2B340] px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
                <BookOpen className="h-3 w-3" /> Studiul {s + 1}
              </span>
              <span className="min-w-0 flex-1 text-sm font-semibold text-[#F0F0F0]">{st.titlu}</span>
              {gata
                ? <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#4ade80]" />
                : <ChevronDown className={cn('h-4 w-4 flex-shrink-0 text-[#A0A0A0] transition-transform', deschis && 'rotate-180')} />}
            </button>
            {deschis && (
              compact
                ? <HartaIncadrata noduri={st.noduri} eticheta={eticheta} blocatTot={blocat(s)} />
                : <ChapterPath nodes={st.noduri} eticheta={eticheta} blocatTot={blocat(s)} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Cât loc are harta pe Bârlog. Pe telefon, o casetă fixă de 300 de pixeli (un
 * studiu de 10 variante, cu nodurile suprapuse, încape în ea). Pe ecran lat,
 * caseta ia tot locul rămas până jos, iar harta se măreşte cât s-o umple, până
 * la SCARA_MAX — peste atât nodurile ar arăta umflate.
 */
const INALTIME = 300
const SCARA_MIN = 0.5
const SCARA_MAX = 1.5
/** Umbra şi lacătul ultimului nod ies cu ~14px sub înălţimea calculată (măsurat). */
const SUB_ULTIMUL = 16

function HartaIncadrata({ noduri, eticheta, blocatTot }: {
  noduri: Studiu['noduri']
  eticheta?: { nodId: string; text: string } | null
  blocatTot: boolean
}) {
  const cutie = useRef<HTMLDivElement>(null)
  const [loc, setLoc] = useState(INALTIME)

  // Locul se măsoară, nu se presupune: depinde de ecran şi de câte studii sunt.
  useLayoutEffect(() => {
    const c = cutie.current
    if (!c) return
    const masoara = () => setLoc(c.clientHeight || INALTIME)
    masoara()
    const ro = new ResizeObserver(masoara)
    ro.observe(c)
    return () => ro.disconnect()
  }, [])

  const natural = inaltimeaTraseuluiCompact(noduri)
  const scara = Math.max(SCARA_MIN, Math.min(SCARA_MAX, loc / (natural + SUB_ULTIMUL)))
  const inalt = Math.ceil(natural * scara)
  // Când harta a ajuns la mărimea maximă şi tot rămâne loc, stă la mijloc.
  const sus = Math.max(0, Math.floor((loc - inalt - SUB_ULTIMUL * scara) / 2))

  // Dacă harta e mai lungă decât caseta, pasul curent se aduce în vedere.
  useEffect(() => {
    const c = cutie.current
    const nod = c?.querySelector<HTMLElement>('[data-nod-curent]')
    if (!c || !nod || inalt <= loc) return
    const top = nod.getBoundingClientRect().top - c.getBoundingClientRect().top + c.scrollTop
    c.scrollTop = Math.max(0, top - loc / 3)
  }, [inalt, loc])

  return (
    // Harta stă aşezată absolut în casetă, ca să nu-i poată cere mai mult loc:
    // altfel caseta creştea după hartă, harta după casetă, şi tot aşa.
    <div className="relative h-[300px] lg:h-auto lg:min-h-[240px] lg:flex-1">
      <div ref={cutie} className="absolute inset-0 overflow-y-auto overflow-x-hidden">
        <div className="relative" style={{ height: inalt, marginTop: sus }}>
          <div
            className="absolute inset-x-0 top-0"
            style={{ height: natural, transform: `scale(${scara})`, transformOrigin: 'top center' }}
          >
            <ChapterPath nodes={noduri} eticheta={eticheta} blocatTot={blocatTot} compact />
          </div>
        </div>
      </div>
    </div>
  )
}
