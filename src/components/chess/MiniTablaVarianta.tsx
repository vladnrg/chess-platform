import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Pause, Play, X } from 'lucide-react'
import { useBoardTheme } from '@/hooks/useBoardTheme'
import { translateNotation } from '@/lib/chess-translations'

/** Cât stă o mutare pe mini-tablă, şi cât stă poziţia finală înainte de reluare. */
const PAS_MS = 1000
const PAUZA_FINAL_MS = 2500

/** Poziţia după fiecare semi-mutare (index 0 = poziţia de start) şi mutările scrise. */
function pozitii(mutari: string[]) {
  const joc = new Chess()
  const fen = [joc.fen()]
  const san: string[] = []
  for (const u of mutari) {
    const m = joc.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] })
    fen.push(joc.fen())
    san.push(translateNotation(m.san))
  }
  return { fen, san }
}

/** Câmpurile ultimei mutări, colorate discret, ca în antrenor. */
function stilUltima(mutari: string[], pas: number) {
  const u = pas > 0 ? mutari[pas - 1] : null
  if (!u) return {}
  return {
    [u.slice(0, 2)]: { backgroundColor: 'rgba(226,179,64,0.25)' },
    [u.slice(2, 4)]: { backgroundColor: 'rgba(226,179,64,0.45)' },
  }
}

/**
 * Mini-tabla de lângă textul de început al capitolului: joacă singură mutările
 * comune capitolului, se opreşte la final, apoi o ia de la capăt. La click se
 * deschide mărită, cu mutările scrise şi butoane de derulare.
 */
export function MiniTablaVarianta({
  mutari, orientare, titlu,
}: {
  mutari: string[]
  orientare: 'white' | 'black'
  titlu: string
}) {
  const { lightSquareStyle, darkSquareStyle } = useBoardTheme()
  const { fen } = useMemo(() => pozitii(mutari), [mutari])
  const [pas, setPas] = useState(0)
  const [deschisa, setDeschisa] = useState(false)

  // Rulează singură cât fereastra mare e închisă; la final aşteaptă mai mult.
  useEffect(() => {
    if (deschisa || mutari.length === 0) return
    const laFinal = pas >= mutari.length
    const t = setTimeout(() => setPas(laFinal ? 0 : pas + 1), laFinal ? PAUZA_FINAL_MS : PAS_MS)
    return () => clearTimeout(t)
  }, [pas, deschisa, mutari.length])

  return (
    <>
      <button
        type="button"
        onClick={() => setDeschisa(true)}
        aria-label="Măreşte tabla cu mutările capitolului"
        title="Click ca să vezi mutările mai clar"
        className="float-right mb-2 ml-3 block w-40 cursor-zoom-in overflow-hidden rounded-md border border-[#2A2A2A] transition-colors hover:border-[#E2B340]"
      >
        <Chessboard
          options={{
            id: 'mini-tabla-capitol',
            position: fen[Math.min(pas, fen.length - 1)],
            allowDragging: false,
            boardOrientation: orientare,
            showNotation: false,
            animationDurationInMs: 300,
            squareStyles: stilUltima(mutari, pas),
            lightSquareStyle,
            darkSquareStyle,
            boardStyle: { borderRadius: 0 },
          }}
        />
      </button>
      {deschisa && (
        <FereastraVarianta mutari={mutari} orientare={orientare} titlu={titlu} onInchide={() => setDeschisa(false)} />
      )}
    </>
  )
}

/**
 * Fereastra mărită: tabla mare, mutările scrise dedesubt, derulare cu butoane
 * sau cu săgeţile de la tastatură, plus redare automată.
 *
 * Ascultă tastele în faza de captură şi le opreşte acolo: altfel săgeţile ar
 * răsfoi în acelaşi timp şi partida din antrenorul de sub fereastră.
 */
function FereastraVarianta({
  mutari, orientare, titlu, onInchide,
}: {
  mutari: string[]
  orientare: 'white' | 'black'
  titlu: string
  onInchide: () => void
}) {
  const { lightSquareStyle, darkSquareStyle } = useBoardTheme()
  const { fen, san } = useMemo(() => pozitii(mutari), [mutari])
  const [pas, setPas] = useState(0)
  const [ruleaza, setRuleaza] = useState(true)

  useEffect(() => {
    if (!ruleaza) return
    if (pas >= mutari.length) {
      const t = setTimeout(() => setRuleaza(false), 0)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setPas(p => p + 1), PAS_MS)
    return () => clearTimeout(t)
  }, [ruleaza, pas, mutari.length])

  useEffect(() => {
    function laTasta(e: KeyboardEvent) {
      if (e.key === 'Escape') onInchide()
      else if (e.key === 'ArrowLeft') { setRuleaza(false); setPas(p => Math.max(0, p - 1)) }
      else if (e.key === 'ArrowRight') { setRuleaza(false); setPas(p => Math.min(mutari.length, p + 1)) }
      else return
      e.preventDefault()
      e.stopPropagation()
    }
    window.addEventListener('keydown', laTasta, true)
    return () => window.removeEventListener('keydown', laTasta, true)
  }, [onInchide, mutari.length])

  const buton = 'flex h-9 w-10 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#1C1C1C] text-[#A0A0A0] transition-colors hover:border-[#3A3A3A] hover:text-[#F0F0F0] disabled:pointer-events-none disabled:opacity-30'
  const reda = () => {
    if (pas >= mutari.length) setPas(0)
    setRuleaza(r => !r || pas >= mutari.length)
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onInchide}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Mutările capitolului ${titlu}`}
        className="w-full max-w-[34rem] rounded-2xl border border-[#2A2A2A] bg-[#141414] p-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">Mutările capitolului</p>
            <h2 className="truncate font-display font-semibold text-[#F0F0F0]">{titlu}</h2>
          </div>
          <button type="button" onClick={onInchide} aria-label="Închide" className="text-[#6B6B6B] transition-colors hover:text-[#F0F0F0]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mx-auto w-full max-w-[min(32rem,60vh)] overflow-hidden rounded-lg border border-[#2A2A2A]">
          <Chessboard
            options={{
              id: 'tabla-capitol-marita',
              position: fen[pas],
              allowDragging: false,
              boardOrientation: orientare,
              animationDurationInMs: 300,
              squareStyles: stilUltima(mutari, pas),
              lightSquareStyle,
              darkSquareStyle,
              boardStyle: { borderRadius: 0 },
            }}
          />
        </div>

        {/* Mutările scrise; cea de pe tablă e luminată, iar oricare se poate apăsa. */}
        <p className="mt-3 flex flex-wrap gap-x-1.5 gap-y-1 text-sm leading-relaxed text-[#A0A0A0]">
          {san.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setRuleaza(false); setPas(i + 1) }}
              className={i + 1 === pas ? 'rounded bg-[rgba(226,179,64,0.18)] px-1 font-semibold text-[#E2B340]' : 'rounded px-1 hover:text-[#F0F0F0]'}
            >
              {i % 2 === 0 ? `${i / 2 + 1}.` : ''}{s}
            </button>
          ))}
        </p>

        <div className="mt-3 flex items-center justify-center gap-1.5">
          <button type="button" className={buton} aria-label="La început" disabled={pas === 0} onClick={() => { setRuleaza(false); setPas(0) }}><ChevronsLeft className="h-4 w-4" /></button>
          <button type="button" className={buton} aria-label="Înapoi" disabled={pas === 0} onClick={() => { setRuleaza(false); setPas(p => p - 1) }}><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" className={buton} aria-label={ruleaza ? 'Opreşte' : 'Porneşte'} onClick={reda}>
            {ruleaza ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button type="button" className={buton} aria-label="Înainte" disabled={pas >= mutari.length} onClick={() => { setRuleaza(false); setPas(p => p + 1) }}><ChevronRight className="h-4 w-4" /></button>
          <button type="button" className={buton} aria-label="La final" disabled={pas >= mutari.length} onClick={() => { setRuleaza(false); setPas(mutari.length) }}><ChevronsRight className="h-4 w-4" /></button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
