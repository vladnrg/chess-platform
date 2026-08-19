/**
 * Culorile pătratelor de pe tablele din exerciţiile de lecţie.
 *
 * Stau aici, nu lângă componentă, fiindcă un fişier care exportă şi o
 * componentă şi o constantă rupe reîncărcarea la cald (`react-refresh`).
 * Aceleaşi la toate exerciţiile — tabla trebuie să arate la fel de la un pas la
 * altul, altfel pare că s-a stricat ceva.
 */
export const CULORI_TABLA = {
  darkSquareStyle: { backgroundColor: '#3A3A3A' },
  lightSquareStyle: { backgroundColor: '#f0d9b5' },
} as const

/**
 * Din a cui parte se vede tabla.
 *
 * Dintotdeauna era albul jos, la toate exerciţiile. La „Efectuează rocada mare
 * cu negrul" asta însemna că cerinţa spune „mută regele pe c8", iar regele din
 * faţa omului era cel alb, de pe e1 — la un pas de degetul lui, după ce tocmai
 * făcuse rocada cu albul la exerciţiul dinainte. A luat regele pe care îl vedea
 * şi a primit „nu e mutarea potrivită", fără să afle de ce.
 *
 * Aşa că tabla se întoarce după cine e la mutare. Ca la orice partidă: piesele
 * tale sunt în faţa ta.
 */
export function orientareaTablei(fen: string | undefined): 'white' | 'black' {
  return fen?.split(' ')[1] === 'b' ? 'black' : 'white'
}
