import { Chess } from 'chess.js'
export function joc(uci) {
  const g = new Chess(); let ult = null
  for (const u of uci) ult = g.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] })
  return { g, ult }
}
// FEN cu câmpul en passant pus după orice pion împins două câmpuri (chess.js îl omite).
export function fenEP(g, ult) {
  const f = g.fen().split(' ')
  if (ult && ult.flags.includes('b')) f[3] = ult.to[0] + (ult.color === 'w' ? '3' : '6')
  return f.join(' ')
}
export const uciDin = m => m.from + m.to + (m.promotion ?? '')
export const culoare = g => g.turn() === 'w' ? 'COLOR_WHITE' : 'COLOR_BLACK'
export const aLui = (ply, culoareTa) => (ply % 2 === 0) === (culoareTa === 'black')
