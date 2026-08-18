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
