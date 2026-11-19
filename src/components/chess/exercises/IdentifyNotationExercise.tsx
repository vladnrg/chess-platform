import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Chessboard } from 'react-chessboard'
import type { IdentifySquareExercise } from '@/types'
import { citesteUltimaMutare, OPTIUNI_SAGEATA, sagetileUltimeiMutari, stilulUltimeiMutari } from '@/lib/ultima-mutare'
import { RamaTablei } from './rama-tablei'
import { EtichetaUltimeiMutari } from './eticheta-ultimei-mutari'
import { CULORI_TABLA, orientareaTablei } from './culori-tabla'

interface Props {
  exercise: IdentifySquareExercise
  onCorrect: () => void
  /**
   * Panoul din dreapta tablei, unde se pun cerinţa pasului, mesajele şi
   * butoanele. Tabla rămâne pe loc, în stânga; restul ajunge aici. `null` cât
   * panoul nu e încă pe pagină, sau după ultimul exerciţiu — atunci nu se pune nimic.
   */
  panou: HTMLElement | null
}

export function IdentifyNotationExerciseComponent({ exercise, onCorrect, panou }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [locked, setLocked] = useState(false)

  function handleSelect(option: string) {
    if (locked) return
    setSelected(option)
    setLocked(true)

    if (option === exercise.square) {
      setTimeout(() => onCorrect(), 700)
    } else {
      setTimeout(() => {
        setSelected(null)
        setLocked(false)
      }, 1200)
    }
  }

  /** `mari`: plăcile care iau locul tablei, la întrebările fără poziţie. */
  function getOptionClass(option: string, mari = false) {
    const base = mari
      ? 'flex items-center justify-center rounded-xl border px-4 text-center text-3xl font-bold transition-colors'
      : 'rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors text-left'
    if (!selected) {
      return `${base} border-[#2A2A2A] bg-[#141414] text-[#A0A0A0] hover:border-[#E2B340] hover:text-[#F0F0F0] cursor-pointer`
    }
    if (option === exercise.square) {
      return `${base} border-[#4ade80] bg-[rgba(74,222,128,0.15)] text-[#4ade80] cursor-default`
    }
    if (option === selected && option !== exercise.square) {
      return `${base} border-[#FB7185] bg-[rgba(251,113,133,0.15)] text-[#FB7185] cursor-default`
    }
    return `${base} border-[#2A2A2A] bg-[#141414] text-[#6B6B6B] cursor-default`
  }

  /**
   * Pătratul cu răspunsul se colorează abia DUPĂ ce omul a ales.
   *
   * Înainte era colorat de la bun început, adică întrebarea „pe ce pătrat se
   * mută regele?" venea cu pătratul acela galben pe tablă. Nu era o întrebare,
   * era o citire — patru lecţii aveau aceeaşi problemă.
   *
   * După răspuns e altceva: acolo culoarea chiar învaţă pe cineva ceva, fiindcă
   * leagă numele pătratului de locul lui.
   */
  const highlight = exercise.fen && selected
    ? {
        [exercise.square]: {
          background: selected === exercise.square
            ? 'rgba(74,222,128,0.45)'   // ai nimerit
            : 'rgba(226,179,64,0.5)',   // n-ai nimerit: uite unde era
        },
      }
    : undefined

  /**
   * Ce a mutat adversarul, arătat cât timp întrebarea e încă deschisă.
   *
   * „Pionul negru de pe c4 îl ia en passant — pe ce pătrat ajunge?" se sprijină
   * pe o mutare care nu se mai vede: împingerea b2-b4. Fără ea, întrebarea cere
   * ghicit.
   *
   * De pe TABLĂ dispare după răspuns: acolo galbenul înseamnă atunci altceva —
   * „aici era răspunsul" — şi două galbenuri cu înţelesuri diferite în acelaşi
   * timp nu lămuresc pe nimeni. Rândul scris de deasupra rămâne, ca tabla să nu
   * sară în sus exact în clipa în care omul se uită la ea.
   */
  const ultima = exercise.fen ? citesteUltimaMutare(exercise.fen, exercise.last_move) : null
  const aratamUltima = !selected

  const variante = (
    <div className="grid grid-cols-2 gap-2">
      {exercise.options.map(opt => (
        <button key={opt} className={getOptionClass(opt)} onClick={() => handleSelect(opt)}>
          {opt}
        </button>
      ))}
    </div>
  )

  const mesaje = (
    <>
      {selected && selected === exercise.square && (
        <p className="text-sm font-medium text-[#4ade80]">Corect!</p>
      )}
      {selected && selected !== exercise.square && (
        <p className="text-sm font-medium text-[#FB7185]">
          Nu chiar — răspunsul corect e <span className="font-bold">{exercise.square}</span>
        </p>
      )}
    </>
  )

  // Întrebările fără poziţie („Cum se notează rocada mică?") n-au ce arăta pe
  // tablă: variantele de răspuns iau locul tablei, ca patru plăci mari care umplu
  // pătratul, iar panoul păstrează doar mesajul. Puse mici, în locul tablei,
  // lăsau un gol negru mare deasupra lor.
  if (!exercise.fen) {
    return (
      <>
        <div className="grid aspect-square w-full grid-cols-2 grid-rows-2 gap-3">
          {exercise.options.map(opt => (
            <button key={opt} className={getOptionClass(opt, true)} onClick={() => handleSelect(opt)}>
              {opt}
            </button>
          ))}
        </div>
        {panou && createPortal(<div className="space-y-3">{mesaje}</div>, panou)}
      </>
    )
  }

  return (
    <>
      <RamaTablei inerta>
        <Chessboard
          options={{
            position: exercise.fen,
            allowDragging: false,
            squareStyles: aratamUltima ? stilulUltimeiMutari(ultima) : highlight,
            arrows: aratamUltima ? sagetileUltimeiMutari(ultima) : [],
            arrowOptions: OPTIUNI_SAGEATA,
            boardStyle: { borderRadius: 0 },
            boardOrientation: orientareaTablei(exercise.fen),
            ...CULORI_TABLA,
          }}
        />
      </RamaTablei>
      {panou && createPortal(
        <div className="space-y-3">
          <EtichetaUltimeiMutari mutare={ultima} />
          {variante}
          {mesaje}
        </div>,
        panou,
      )}
    </>
  )
}
