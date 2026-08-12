import { useMemo } from 'react'
import { useAuth } from './useAuth'
import { useMyCosmetics } from './useEvents'
import { boardColors } from '@/lib/events'
import type { BoardPayload } from '@/types'

/**
 * Culorile tablei pentru utilizatorul curent.
 *
 * Întoarce şi stilurile gata de dat lui `react-chessboard`, ca fiecare tablă din
 * aplicaţie să nu-şi rescrie singură conversia. Cât timp cosmeticele nu s-au
 * încărcat, se folosesc culorile implicite — o tablă cu culori greşite pentru o
 * clipă e mai bună decât una care apare târziu.
 */
export function useBoardTheme(): {
  colors: BoardPayload
  lightSquareStyle: { backgroundColor: string }
  darkSquareStyle: { backgroundColor: string }
} {
  const { profile } = useAuth()
  const { data: owned } = useMyCosmetics()

  const equipped = profile?.equipped_board ?? null

  return useMemo(() => {
    const cosmetic = equipped ? owned?.find(c => c.id === equipped) ?? null : null
    const colors = boardColors(cosmetic)
    return {
      colors,
      lightSquareStyle: { backgroundColor: colors.light },
      darkSquareStyle: { backgroundColor: colors.dark },
    }
  }, [equipped, owned])
}
