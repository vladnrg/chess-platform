import { useCallback, useState } from 'react'
import { Chess, type Square } from 'chess.js'
import type { PieceDropHandlerArgs } from 'react-chessboard'
import { AlegePromovare } from '@/components/chess/AlegePromovare'
import { ePromovare } from '@/lib/promovare'

/**
 * Alegerea piesei la promovare, pentru orice tablă pe care se mută.
 *
 * Tabla îşi dă propria mutare (`muta(de, la, promovare)`) şi primeşte înapoi:
 *  - `laDrop`, de pus în `onPieceDrop`;
 *  - `mutaCuAlegere(de, la)`, pentru mutările făcute altfel (clic pe pătrate);
 *  - `alegere`, de pus într-un părinte `relative` al tablei — butoanele peste ea;
 *  - `asteapta`, cât timp se aşteaptă alegerea (tabla nu mai lasă alte mutări).
 *
 * O mutare obişnuită merge direct mai departe; un pion ajuns pe ultimul rând
 * aşteaptă alegerea, iar mutarea se face abia după ea.
 *
 * Înainte, şase table transformau pionul în regină fără să întrebe — în partide
 * şi pe tabla de analiză asta e chiar împotriva regulilor.
 */
export function usePromovare(
  /** Poziţia de pe tablă: din ea se ştie ce piesă mută şi dacă mutarea e legală. */
  fen: string,
  muta: (de: string, la: string, promovare?: string) => boolean,
) {
  const [deAles, setDeAles] = useState<{ de: string; la: string; culoare: 'w' | 'b' } | null>(null)

  /**
   * Face mutarea, sau deschide alegerea dacă e o promovare. Întoarce `'alege'`
   * când aşteaptă alegerea, `false` când mutarea e ilegală, altfel ce întoarce
   * `muta`. Aşa o tablă cu mutare prin clic nu tratează alegerea ca pe o greşeală.
   */
  const mutaCuAlegere = useCallback((de: string, la: string): boolean | 'alege' => {
    let piesa
    try {
      piesa = new Chess(fen).get(de as Square)
    } catch {
      return false
    }
    if (piesa && ePromovare(`${piesa.color}${piesa.type.toUpperCase()}`, la)) {
      try {
        new Chess(fen).move({ from: de, to: la, promotion: 'q' })
      } catch {
        return false // ilegală: piesa se întoarce, fără întrebare
      }
      setDeAles({ de, la, culoare: piesa.color })
      return 'alege'
    }
    return muta(de, la)
  }, [fen, muta])

  // La tras piesa, cât aşteaptă alegerea, piesa se întoarce pe loc: mutarea se
  // face abia după alegere.
  const laDrop = useCallback(({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean =>
    targetSquare ? mutaCuAlegere(sourceSquare, targetSquare) === true : false, // în afara tablei: înapoi
  [mutaCuAlegere])

  const alegere = deAles ? (
    <AlegePromovare
      culoare={deAles.culoare}
      onAlege={litera => {
        setDeAles(null)
        muta(deAles.de, deAles.la, litera)
      }}
    />
  ) : null

  return { laDrop, mutaCuAlegere, alegere, asteapta: deAles !== null }
}
