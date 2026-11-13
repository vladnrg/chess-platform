import { defaultPieces } from 'react-chessboard'

/**
 * În ce se poate transforma un pion ajuns la capăt.
 *
 * Toate patru, în ordinea puterii. Regina prima fiindcă e alegerea de nouă ori
 * din zece, dar celelalte sunt acolo — asta e regula, iar dacă programul alege
 * singur regina, regula rămâne o vorbă.
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

/**
 * Alegerea piesei, peste tablă. Se pune într-un părinte `relative` care
 * înconjoară tabla. Acoperă tabla intenţionat: până nu alegi, mutarea nu s-a
 * terminat, iar un panou pe lângă tablă ar fi uşor de ratat exact în momentul în
 * care e singurul lucru de făcut.
 *
 * Folosită în lecţii şi în evaluarea de nivel; înainte, evaluarea transforma
 * pionul în regină fără să întrebe.
 */
export function AlegePromovare({ culoare, onAlege }: {
  /** Culoarea pionului: 'w' sau 'b'. */
  culoare: 'w' | 'b'
  onAlege: (litera: string) => void
}) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-[#0A0A0A]/85 p-4">
      {/* Fără întrebare deasupra: cine joacă şah ştie ce înseamnă cele patru
          piese apărute la promovare, iar regula se învaţă din cursurile gratuite. */}
      <div>
        <div className="flex flex-wrap justify-center gap-2">
          {PIESE_DE_PROMOVARE.map(p => {
            // Chiar desenul folosit pe tablă, cerut de la bibliotecă. Un set
            // propriu ar fi însemnat că piesa aleasă arată altfel decât cea
            // care apare o clipă mai târziu pe pătrat.
            const Deseneaza = defaultPieces[`${culoare}${p.simbol}`]
            return (
              <button
                key={p.litera}
                type="button"
                onClick={() => onAlege(p.litera)}
                aria-label={p.nume}
                // Piesele negre pe fond deschis: pe butonul închis aproape dispăreau.
                className={`flex h-20 w-20 items-center justify-center rounded-xl border-2 p-2 transition-colors hover:border-[#E2B340] ${
                  culoare === 'b'
                    ? 'border-[#C9BFA8] bg-[#EDE6D6] hover:bg-[#F7F1E3]'
                    : 'border-[#2A2A2A] bg-[#161616] hover:bg-[#1C1C1C]'
                }`}
              >
                <Deseneaza />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
