import { useEffect, useState } from 'react'
import { Chessboard, defaultPieces, type PieceDropHandlerArgs } from 'react-chessboard'
import type { MovePieceExerciseData } from '@/types'
import { aplicaMutarea } from '@/lib/mutare-pe-tabla'
import { citesteUltimaMutare, OPTIUNI_SAGEATA, sagetileUltimeiMutari, stilulUltimeiMutari } from '@/lib/ultima-mutare'
import { RamaTablei } from './rama-tablei'
import { EtichetaUltimeiMutari } from './eticheta-ultimei-mutari'
import { CULORI_TABLA, orientareaTablei } from './culori-tabla'

interface Props {
  exercise: MovePieceExerciseData
  onCorrect: () => void
  /**
   * Cerinţa pasului la care s-a ajuns, ca s-o poată arăta pagina sus, mare.
   *
   * La un exerciţiu dintr-o singură mutare nu se cheamă niciodată: acolo
   * cerinţa exerciţiului e şi cerinţa pasului.
   */
  onCerinta?: (text: string | null) => void
}

type Status = 'idle' | 'correct' | 'wrong' | 'alta-culoare' | 'alta-piesa'

/** Cât stă verdele pe tablă înainte să răspundă adversarul. */
const PAUZA_INAINTE_DE_RASPUNS = 950

/**
 * În ce se poate transforma un pion ajuns la capăt.
 *
 * Toate patru, în ordinea puterii. Regina prima fiindcă e alegerea de nouă ori
 * din zece, dar celelalte sunt acolo — asta e chiar regula pe care o predă
 * lecţia, iar dacă programul alege singur regina, regula rămâne o vorbă.
 *
 * `litera` e cea din notaţia mutării (`e7e8q`), `simbol` e cheia sub care
 * react-chessboard ţine desenul piesei.
 */
const PIESE_DE_PROMOVARE = [
  { litera: 'q', nume: 'regină', simbol: 'Q' },
  { litera: 'r', nume: 'tură', simbol: 'R' },
  { litera: 'b', nume: 'nebun', simbol: 'B' },
  { litera: 'n', nume: 'cal', simbol: 'N' },
] as const

export function MovePieceExerciseComponent({ exercise, onCorrect, onCerinta }: Props) {
  /**
   * Paşii, când exerciţiul ţine mai mult de o mutare.
   *
   * Un pion care porneşte de la mijlocul tablei nu poate fi predat într-o
   * singură mutare, iar dacă îl aşezi pe rândul şapte ca să încapă într-una,
   * poziţia iese aranjată — şi de obicei şi greşită. Aşa că omul împinge pionul
   * de câte ori e nevoie, iar între împingeri răspunde adversarul.
   */
  const pasi = exercise.line
  const [pas, setPas] = useState(0)

  const [status, setStatus] = useState<Status>('idle')
  /** Poziţia de la care porneşte pasul curent — aici se revine după o greşeală. */
  const [fenPas, setFenPas] = useState(exercise.fen)
  /** Ce se vede pe tablă acum. */
  const [fen, setFen] = useState(exercise.fen)
  const [highlight, setHighlight] = useState<Record<string, React.CSSProperties>>({})
  /** Mutarea care aşteaptă să se aleagă piesa. */
  const [deAles, setDeAles] = useState<{ de: string; la: string } | null>(null)

  /**
   * Ce a mutat adversarul înainte să vină rândul meu.
   *
   * La început vine din poziţie (câmpul de en passant al FEN-ului, sau
   * `last_move`); după fiecare pas, e chiar răspunsul pe care tocmai l-a dat.
   * La en passant e cheia exerciţiului, iar la cursa pionilor arată de ce
   * regele advers nu mai ajunge.
   */
  const [ultima, setUltima] = useState(() => citesteUltimaMutare(exercise.fen, exercise.last_move))
  const aratamUltima = status !== 'correct'

  /** Mutarea aşteptată acum. */
  const asteptata = pasi ? pasi[pas].move : exercise.correct_move ?? ''

  /** Cine e la mutare, după poziţia pasului curent. Alb, dacă nu scrie altfel. */
  const laMutare = fenPas.split(' ')[1] === 'b' ? 'b' : 'w'

  // Cerinţa pasului urcă la pagină, ca să stea sus şi mare. Textul introductiv
  // al exerciţiului nu mai e valabil de la al doilea pas încolo.
  useEffect(() => {
    if (pasi) onCerinta?.(pasi[pas].instruction)
  }, [pasi, pas, onCerinta])
  useEffect(() => () => onCerinta?.(null), [onCerinta])

  /**
   * Ce se întâmplă după ce s-a ales piesa.
   *
   * La exerciţiile unde se învaţă că *poţi* alege, orice piesă e bună. La cel
   * unde alegerea chiar contează — tura care nu face pat — o damă în plus nu
   * rezolvă nimic, deci răspunsul se cere exact.
   */
  function alege(piesa: string) {
    if (!deAles) return
    const ceruta = asteptata.slice(4) || 'q'
    if (!exercise.any_promotion && piesa !== ceruta) {
      setDeAles(null)
      setStatus('alta-piesa')
      setTimeout(() => setStatus('idle'), 2200)
      return
    }
    primeste(deAles.de, deAles.la, piesa)
    setDeAles(null)
  }

  /** Mutarea e bună: arătăm poziţia de după, apoi răspunde adversarul. */
  function primeste(de: string, la: string, promovare: string) {
    // Lecţia şi-a declarat mutarea aşteptată, iar ea e cea făcută: răspunsul e
    // bun, indiferent ce iese mai jos. Dacă poziţia de după nu poate fi
    // calculată, rămâne tabla dinainte — nu se transformă într-un „ai greşit".
    const dupaMine = aplicaMutarea(fenPas, de, la, promovare) ?? fenPas
    setFen(dupaMine)
    setStatus('correct')
    setHighlight({
      [de]: { background: 'rgba(74, 222, 128, 0.35)' },
      [la]: { background: 'rgba(74, 222, 128, 0.5)' },
    })

    const raspuns = pasi?.[pas].reply
    if (!raspuns) {
      setTimeout(() => onCorrect(), 700)
      return
    }

    // Răspunsul lui vine după o clipă, nu odată cu mutarea mea: altfel se văd
    // două mutări deodată şi nu se înţelege care a fost a cui.
    setTimeout(() => {
      const dupaEl = aplicaMutarea(dupaMine, raspuns.slice(0, 2), raspuns.slice(2, 4), raspuns.slice(4) || 'q')
      if (!dupaEl) {
        onCorrect()
        return
      }
      setFen(dupaEl)
      setFenPas(dupaEl)
      setUltima(citesteUltimaMutare(dupaEl, raspuns))
      setHighlight({})
      setStatus('idle')
      setPas(p => p + 1)
    }, PAUZA_INAINTE_DE_RASPUNS)
  }

  function onDrop({ piece, sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean {
    if (status === 'correct' || deAles) return false
    // targetSquare e null când piesa e lăsată în afara tablei — nu e o încercare greșită
    if (!targetSquare) return false

    const expectedFrom = asteptata.slice(0, 2)
    const expectedTo = asteptata.slice(2, 4)
    // „e7e8q" — ultima literă spune în ce se transforma pionul, când alegea programul
    const promovare = asteptata.slice(4) || 'q'

    if (sourceSquare === expectedFrom && targetSquare === expectedTo) {
      // Pion ajuns pe ultimul rând: alegerea e a lui, nu a noastră.
      const ePion = piece.pieceType[1]?.toLowerCase() === 'p'
      const laCapat = targetSquare[1] === (piece.pieceType[0] === 'w' ? '8' : '1')
      if (ePion && laCapat) {
        setDeAles({ de: sourceSquare, la: targetSquare })
        return false
      }
      primeste(sourceSquare, targetSquare, promovare)
      return true
    }

    // A mutat o piesă a celeilalte tabere. Se întâmplă cel mai des la rocada cu
    // negrul, unde exerciţiul dinainte cerea rocada cu albul: omul ia regele pe
    // care tocmai l-a mutat. „Nu e mutarea potrivită" nu-i spune nimic — poate
    // fi chiar mutarea potrivită, făcută cu piesa greşită.
    const eAltaCuloare = piece.pieceType[0] !== laMutare
    setStatus(eAltaCuloare ? 'alta-culoare' : 'wrong')
    setHighlight({
      [sourceSquare]: { background: 'rgba(251,113,133, 0.4)' },
      [targetSquare]: { background: 'rgba(251,113,133, 0.4)' },
    })
    setTimeout(() => {
      setStatus('idle')
      setHighlight({})
      setFen(fenPas)
    }, 1000)
    return false
  }

  return (
    <div className="space-y-3">
      {pasi && pasi.length > 1 && (
        <p className="text-xs font-medium text-[#6B6B6B]">
          Pasul {pas + 1} din {pasi.length}
        </p>
      )}

      <EtichetaUltimeiMutari mutare={ultima} />

      <div className="relative">
        <RamaTablei>
          <Chessboard
            options={{
              position: fen,
              allowDragging: status !== 'correct' && !deAles,
              onPieceDrop: onDrop,
              squareStyles: aratamUltima ? { ...stilulUltimeiMutari(ultima), ...highlight } : highlight,
              arrows: aratamUltima ? sagetileUltimeiMutari(ultima) : [],
              arrowOptions: OPTIUNI_SAGEATA,
              boardStyle: { borderRadius: 0 },
              boardOrientation: orientareaTablei(exercise.fen),
              ...CULORI_TABLA,
            }}
          />
        </RamaTablei>

        {/* Alegerea piesei, peste tablă. Acoperă tabla intenţionat: până nu
            alegi, mutarea nu s-a terminat, iar un panou pe lângă tablă ar fi
            uşor de ratat exact în momentul în care e singurul lucru de făcut. */}
        {deAles && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-[#0A0A0A]/85 p-4">
            <div className="flex flex-wrap justify-center gap-2">
              {PIESE_DE_PROMOVARE.map(p => {
                // Chiar desenul folosit pe tablă, cerut de la bibliotecă. Un set
                // propriu ar fi însemnat că piesa aleasă arată altfel decât cea
                // care apare o clipă mai târziu pe pătrat.
                const Deseneaza = defaultPieces[`${laMutare}${p.simbol}`]
                return (
                  <button
                    key={p.litera}
                    type="button"
                    onClick={() => alege(p.litera)}
                    aria-label={p.nume}
                    title={p.nume}
                    className="flex h-16 w-16 items-center justify-center rounded-xl border border-[#2A2A2A] bg-[#161616] p-1.5 transition-colors hover:border-[#E2B340] hover:bg-[#1C1C1C]"
                  >
                    <Deseneaza />
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {status === 'correct' && (
        <p className="text-sm font-medium text-[#4ade80]">Mutare corectă!</p>
      )}
      {status === 'wrong' && (
        <p className="text-sm font-medium text-[#FB7185]">Nu e mutarea potrivită. Încearcă din nou!</p>
      )}
      {status === 'alta-piesa' && (
        <p className="text-sm font-medium text-[#FB7185]">
          Mutarea e bună, dar nu piesa. Aici doar una dintre cele patru face treaba
          — citește încă o dată ce ți se cere.
        </p>
      )}
      {status === 'alta-culoare' && (
        <p className="text-sm font-medium text-[#FB7185]">
          Aici mută {laMutare === 'b' ? 'negrul' : 'albul'} — piesele lui sunt cele
          {laMutare === 'b' ? ' închise' : ' deschise'} la culoare.
        </p>
      )}
    </div>
  )
}
