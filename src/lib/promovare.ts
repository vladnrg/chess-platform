/**
 * Un pion care, mutat pe pătratul `la`, ajunge pe ultimul rând — deci trebuie
 * întrebat în ce se transformă. `tipPiesa` e cel din react-chessboard („wP", „bP").
 */
export function ePromovare(tipPiesa: string, la: string): boolean {
  const ePion = tipPiesa[1]?.toLowerCase() === 'p'
  return ePion && la[1] === (tipPiesa[0] === 'w' ? '8' : '1')
}
