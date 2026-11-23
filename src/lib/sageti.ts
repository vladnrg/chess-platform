import { defaultArrowOptions } from 'react-chessboard'

/**
 * Cum arată săgeţile pe toate tablele din aplicaţie.
 *
 * Cerut pe 2026-11-23, după capturi Chessly: săgeţile implicite ale bibliotecii
 * erau late cât o cincime de câmp şi porneau din mijlocul piesei, peste ea. Acum
 * sunt mai subţiri şi pleacă de la marginea piesei (0,35 dintr-un câmp faţă de
 * centru, cât recomandă chiar biblioteca pentru un aspect „chess.com”), ca piesa
 * să se vadă întreagă.
 */
export const OPTIUNI_SAGETI = {
  ...defaultArrowOptions,
  arrowWidthDenominator: 7,
  arrowStartOffset: 0.35,
  opacity: 0.85,
}

/**
 * Verde şi roşu calde, care ies din tablă.
 *
 * Cele vechi erau pastel (verde mentă, roz) şi, cu transparenţa săgeţii peste
 * ele, se pierdeau pe câmpurile deschise. Verdele trage spre galben, roşul spre
 * portocaliu; roşul rămâne destul de departe de auriul mutării de jucat
 * (#E2B340) ca să nu fie confundate.
 */
export const CULORI_SAGETI = {
  green: '#6CC24A',
  red: '#EE4B36',
} as const
