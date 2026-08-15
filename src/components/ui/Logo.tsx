/**
 * Marca CleanChess: un făraş care mătură piesele de pe tablă.
 *
 * E desenată, nu randată dintr-o poză, fiindcă trebuie să rămână limpede şi la
 * 16 pixeli în tabul browserului, şi la 32 în bara de sus. O ilustraţie raster
 * s-ar face pată la mărimile alea.
 *
 * Forma e asimetrică intenţionat — buza subţire care mătură în stânga, peretele
 * înalt şi coada în dreapta. Simetric, arăta a coş, nu a făraş.
 *
 * Culoarea vine din `currentColor`, deci marca se aşază pe orice fundal fără să
 * fie nevoie de o a doua variantă.
 */
export function Logo({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden className={className}>
      {/* Pionul măturat, chiar la buza făraşului */}
      <path d="M5.6 11.4a3 3 0 1 1 3.8.1 4.5 4.5 0 0 1 1.9 3.2H3.7a4.5 4.5 0 0 1 1.9-3.3Z" />
      {/* Buza subţire, ieşită spre stânga */}
      <path d="M.5 21.8 12 19.4v4.6H2.2a1.7 1.7 0 0 1-1.7-2.2Z" />
      {/* Cădiţa */}
      <path d="M9.5 15.9h18.2l-2.2 7.8a3 3 0 0 1-2.9 2.4H12.4a3 3 0 0 1-2.9-2.4L9.5 15.9Z" />
      {/* Coada */}
      <path d="M24.9 17 27.9 9.6a2.1 2.1 0 0 1 2.8-1.1 2.1 2.1 0 0 1 1.1 2.8L28.6 18Z" />
    </svg>
  )
}
