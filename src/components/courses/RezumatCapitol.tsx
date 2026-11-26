import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Clock, RotateCcw, Target, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatDurata, type RezultatCapitol } from '@/lib/rezultat-capitol'

/** Verdele exersărilor perfecte şi gradientul celor greşite (portocaliu → galben). */
const VERDE = '#6CC24A'

/**
 * Inelul: verde cât din exersări au fost perfecte, portocaliu-galben restul.
 * Două arce pe acelaşi cerc, desenate cu `stroke-dasharray`.
 */
function Inel({ perfecte, total }: { perfecte: number; total: number }) {
  const r = 52
  const lung = 2 * Math.PI * r
  const verde = total > 0 ? (perfecte / total) * lung : 0
  return (
    <svg viewBox="0 0 140 140" className="h-40 w-40 -rotate-90" aria-hidden="true">
      <defs>
        <linearGradient id="inel-gresite" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#FDE047" />
        </linearGradient>
      </defs>
      <circle cx="70" cy="70" r={r} fill="none" stroke="url(#inel-gresite)" strokeWidth="18" />
      {verde > 0 && (
        <circle
          cx="70" cy="70" r={r} fill="none" stroke={VERDE} strokeWidth="18"
          strokeDasharray={`${verde} ${lung}`}
        />
      )}
    </svg>
  )
}

/**
 * Fereastra de la finalul capitolului, după ultima exersare (cerută pe
 * 2026-11-25, după Chessly): câte exersări au ieşit perfecte, câte variante
 * ai exersat şi cât a durat, apoi „Continuă învăţarea" sau „Refă exersările
 * greşite".
 */
/**
 * Mesajul ferestrei, după câte exersări au ieşit perfecte (textele cerute pe
 * 2026-11-26): toate; peste 75%; 50–75%; sub 50%.
 */
function mesajRezultat(rata: number): { titlu: string; text: string } {
  if (rata >= 1) return { titlu: 'Bravo!', text: 'Eşti deja un maestru al variantelor studiate.' }
  if (rata > 0.75) return { titlu: 'Pare că stăpâneşti bine variantele, dar încă nu la perfecţie.', text: 'Sau poate că doar ţi-a alunecat mouse-ul...' }
  if (rata >= 0.5) return { titlu: 'Nu e rău!', text: 'Ai rezolvat corect peste jumătate din variante. Ţine-o tot aşa!' }
  return { titlu: 'Sigur poţi mai bine de atât.', text: 'Parcurge din nou studiile pentru o rată de succes mai mare.' }
}

export function RezumatCapitol({
  parti, rezultate, continuaHref, onRefa, onInchide,
}: {
  /** Variantele capitolului (indexurile lor), în ordine. */
  parti: number[]
  rezultate: RezultatCapitol
  continuaHref: string
  /** Prima parte greşită, sau null dacă toate au fost perfecte. */
  onRefa: (() => void) | null
  onInchide: () => void
}) {
  const facute = parti.filter(p => rezultate[String(p)])
  const perfecte = facute.filter(p => rezultate[String(p)]!.perfect).length
  const ms = facute.reduce((suma, p) => suma + rezultate[String(p)]!.ms, 0)
  const mesaj = mesajRezultat(facute.length > 0 ? perfecte / facute.length : 0)

  useEffect(() => {
    function laTasta(e: KeyboardEvent) {
      if (e.key === 'Escape') onInchide()
    }
    window.addEventListener('keydown', laTasta)
    return () => window.removeEventListener('keydown', laTasta)
  }, [onInchide])

  return (
      <div
        role="region"
        aria-label="Rezultatul exersărilor"
        className="relative w-full rounded-2xl border border-[#2A2A2A] bg-[#161616] px-6 pb-6 pt-8 text-center"
      >
        <button
          type="button"
          onClick={onInchide}
          aria-label="Închide şi priveşte tabla"
          className="absolute right-3 top-3 text-[#6B6B6B] transition-colors hover:text-[#F0F0F0]"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative mx-auto h-40 w-40">
          <Inel perfecte={perfecte} total={facute.length} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="flex items-center gap-1.5 font-display text-2xl font-bold text-[#F0F0F0]">
              <Target className="h-5 w-5 text-[#E2B340]" /> {perfecte}
            </span>
            <span className="mt-0.5 text-[10px] font-semibold uppercase leading-tight tracking-wider text-[#A0A0A0]">
              {perfecte === 1 ? 'Exersare' : 'Exersări'}<br />perfect{perfecte === 1 ? 'ă' : 'e'}
            </span>
          </div>
        </div>

        <h2 className="mt-5 font-display text-xl font-semibold text-[#F0F0F0]">{mesaj.titlu}</h2>
        <p className="mt-1 text-sm text-[#A0A0A0]">{mesaj.text}</p>

        <div className="mt-5 flex justify-center gap-2">
          {([
            ['Variante', BookOpen, String(facute.length)],
            ['Timp', Clock, formatDurata(ms)],
          ] as const).map(([eticheta, Icoana, valoare]) => (
            <div key={eticheta} className="w-24 overflow-hidden rounded-lg border border-[rgba(108,194,74,0.6)]">
              <div className="bg-[rgba(108,194,74,0.85)] py-1 text-[10px] font-bold uppercase tracking-wider text-[#0A0A0A]">
                {eticheta}
              </div>
              <div className="flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-[#F0F0F0]">
                <Icoana className="h-4 w-4 text-[#6CC24A]" /> {valoare}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2">
          <Link to={continuaHref} className="block">
            <Button className="w-full">
              <BookOpen className="h-4 w-4" /> Continuă învăţarea
            </Button>
          </Link>
          {onRefa && (
            <Button variant="secondary" className="w-full" onClick={onRefa}>
              <RotateCcw className="h-4 w-4" /> Refă exersările greşite
            </Button>
          )}
        </div>
      </div>
  )
}
