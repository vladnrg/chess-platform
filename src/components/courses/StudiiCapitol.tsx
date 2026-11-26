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
 * Chessly. Pe ecran lat, harta unui studiu deschis are cât loc rămâne până jos
 * când e singurul deschis, şi tot atât păstrează când mai deschizi unul: cele
 * deschise nu-şi împart locul (micşorându-se), ci se derulează unul sub altul
 * (cerut pe 2026-11-26).
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
  const lista = useRef<HTMLDivElement>(null)
  const locHarta = useLocHarta(lista, compact, studii.length)
  // Toate hărţile la aceeaşi mărime, cea care încape pentru cel mai lung studiu
  // (de obicei primul): un studiu mai scurt nu-şi umflă nodurile ca să umple
  // caseta (cerut pe 2026-11-26).
  const naturalMaxim = Math.max(0, ...studii.map(st => inaltimeaTraseuluiCompact(st.noduri)))

  // Fără derulare automată la deschidere: studiul se desface în jos, pe loc,
  // iar derularea o face omul (cerut pe 2026-11-26, după ce saltul la studiul
  // deschis s-a dovedit deranjant).
  const comuta = (s: number) => setDeschise(v => { const n = new Set(v); if (!n.delete(s)) n.add(s); return n })

  const casete = studii.map((st, s) => {
    const deschis = deschise.has(s)
    const gata = terminat(st)
    return (
      <div key={s} data-studiu={s} className="flex-shrink-0 overflow-hidden rounded-xl border border-[#E2B340]/30 bg-[#16140F]">
        <button
          type="button"
          onClick={() => comuta(s)}
          aria-expanded={deschis}
          data-cap-studiu
          className="flex w-full items-center gap-2.5 bg-[#E2B340]/[0.12] px-3 py-2 text-left transition-colors hover:bg-[#E2B340]/[0.18]"
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
            ? <HartaIncadrata noduri={st.noduri} eticheta={eticheta} blocatTot={blocat(s)} inaltime={locHarta ?? INALTIME} naturalMaxim={naturalMaxim} />
            : <ChapterPath nodes={st.noduri} eticheta={eticheta} blocatTot={blocat(s)} />
        )}
      </div>
    )
  })

  if (!compact) return <div className="space-y-2">{casete}</div>

  // Pe ecran lat lista stă aşezată absolut în locul rămas: ce e înăuntru nu
  // poate lungi caseta, doar se derulează în ea.
  return (
    <div className="lg:relative lg:min-h-[20rem] lg:flex-1">
      <div ref={lista} className="flex flex-col lg:absolute lg:inset-0 lg:overflow-y-auto" style={{ gap: GOL }}>
        {casete}
      </div>
    </div>
  )
}

/** Spaţiul dintre studii, în pixeli. */
const GOL = 8
const REZERVA = 4

/**
 * Cât loc are harta unui studiu deschis pe ecran lat: înălţimea listei minus
 * barele de titlu ale tuturor studiilor, spaţiile dintre ele şi chenarele —
 * adică exact cât ar avea dacă ar fi singurul deschis. `null` pe ecran îngust,
 * unde harta stă în caseta ei fixă.
 */
function useLocHarta(lista: React.RefObject<HTMLDivElement | null>, activ: boolean, cate: number) {
  const [loc, setLoc] = useState<number | null>(null)
  useLayoutEffect(() => {
    const l = lista.current
    if (!activ || !l) return
    const lat = window.matchMedia('(min-width: 1024px)')
    const masoara = () => {
      if (!lat.matches) return setLoc(null)
      const bare = [...l.querySelectorAll<HTMLElement>('[data-cap-studiu]')].reduce((s, b) => s + b.offsetHeight, 0)
      // + REZERVA: `offsetHeight` rotunjeşte bara în jos (36,45 → 36), iar fără
      // cei câţiva pixeli în plus lista ar derula degeaba, cu un singur studiu.
      setLoc(Math.max(240, l.clientHeight - bare - (cate - 1) * GOL - 2 * cate - REZERVA))
    }
    masoara()
    const ro = new ResizeObserver(masoara)
    ro.observe(l)
    lat.addEventListener('change', masoara)
    return () => { ro.disconnect(); lat.removeEventListener('change', masoara) }
  }, [lista, activ, cate])
  return loc
}

/**
 * Cât loc are harta pe Bârlog. Pe telefon, o casetă fixă de 300 de pixeli (un
 * studiu de 10 variante, cu nodurile suprapuse, încape în ea). Pe ecran lat,
 * caseta primeşte locul rămas până jos (`useLocHarta`), iar harta se măreşte
 * cât s-o umple, până la SCARA_MAX — peste atât nodurile ar arăta umflate.
 */
const INALTIME = 300
const SCARA_MIN = 0.5
const SCARA_MAX = 1.5
/** Umbra şi lacătul ultimului nod ies cu ~14px sub înălţimea calculată (măsurat). */
const SUB_ULTIMUL = 16

function HartaIncadrata({ noduri, eticheta, blocatTot, inaltime, naturalMaxim }: {
  noduri: Studiu['noduri']
  eticheta?: { nodId: string; text: string } | null
  blocatTot: boolean
  inaltime: number
  /** Înălţimea naturală a celui mai lung studiu din capitol: dă scara comună. */
  naturalMaxim: number
}) {
  const cutie = useRef<HTMLDivElement>(null)
  const loc = inaltime

  const natural = inaltimeaTraseuluiCompact(noduri)
  const scara = Math.max(SCARA_MIN, Math.min(SCARA_MAX, loc / (Math.max(natural, naturalMaxim) + SUB_ULTIMUL)))
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
    <div className="relative" style={{ height: inaltime }}>
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
