/**
 * Marca CleanChess: un pion spălat atât de bine încât luceşte.
 *
 * E desenată, nu randată dintr-o poză, fiindcă trebuie să rămână limpede şi la
 * 16 pixeli în tabul browserului, şi la 32 în bara de sus. O ilustraţie raster
 * s-ar face pată la mărimile alea.
 *
 * Două sclipiri, nu trei: la 16 pixeli a treia se lipeşte de celelalte şi
 * marca devine o pată. Laturile lor sunt scobite (curbe spre centru), nu
 * drepte — aşa se citeşte „străluceşte", nu „stea".
 *
 * Culoarea vine din `currentColor`, deci marca se aşază pe orice fundal fără
 * să fie nevoie de o a doua variantă.
 */
export function Logo({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden className={className}>
      {/* Pionul. Toate bucăţile sunt centrate pe x = 13.4, verificat prin
          măsurarea siluetei randate: abaterea stânga/dreapta e 0 pe fiecare
          rând. Înainte talpa era centrată pe 13.2, iar restul pe 13.4 —
          suficient cât să se vadă că e strâmb, prea puţin cât să-ţi dai seama
          de ce. */}
      <circle cx="13.4" cy="8.8" r="4.7" />
      {/* Gulerul, un trapez simplu. Varianta dinainte ieşea cu 2.4 unităţi de
          fiecare parte faţă de cap şi făcea un prag sub el; acum iese cu 1. */}
      <path d="M9.8 12.7H17l-.8 4.2h-5.6l-.8-4.2Z" />
      <path d="M10.6 16.9h5.6l1.9 7.9H8.7l1.9-7.9Z" />
      <path d="M6.1 25.2h14.6a1.9 1.9 0 0 1 1.9 1.9v1.1a1 1 0 0 1-1 1H5.2a1 1 0 0 1-1-1v-1.1a1.9 1.9 0 0 1 1.9-1.9Z" />
      {/* Sclipirile */}
      <path d="M26 1.8Q26 7 31.2 7 26 7 26 12.2 26 7 20.8 7 26 7 26 1.8Z" />
      <path d="M27.6 14.8Q27.6 17.6 30.4 17.6 27.6 17.6 27.6 20.4 27.6 17.6 24.8 17.6 27.6 17.6 27.6 14.8Z" />
    </svg>
  )
}
