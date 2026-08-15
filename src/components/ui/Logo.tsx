/**
 * Marca CleanChess: un pion spălat atât de bine încât luceşte.
 *
 * E desenată, nu randată dintr-o poză, fiindcă trebuie să rămână limpede şi la
 * 16 pixeli în tabul browserului, şi la 144 în filigranul din antetul
 * Cursurilor. O ilustraţie raster s-ar face pată la capătul mic.
 *
 * Două sclipiri, nu trei: la 16 pixeli a treia se lipeşte de celelalte şi marca
 * devine o pată. Laturile lor sunt scobite spre centru, nu drepte — aşa se
 * citeşte „străluceşte", nu „stea".
 *
 * `viewBox` e strâns pe desen, nu 0 0 32 32: măsurat pe silueta randată, ca
 * marca să umple caseta primită în loc să plutească în ea cu margini goale.
 * Rămâne pătrat, ca să nu se deformeze când i se dau lăţime şi înălţime egale.
 *
 * Culoarea vine din `currentColor`, deci merge şi neagră pe pastila aurie din
 * bară, şi aurie pe negru în filigran, fără o a doua variantă.
 */
export function Logo({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="2.6 3.25 25.9 25.9" fill="currentColor" aria-hidden className={className}>
      {/* Pionul. Toate bucăţile sunt centrate pe x = 13.4, verificat prin
          măsurarea siluetei randate: abaterea stânga/dreapta e 0 pe fiecare
          rând. */}
      <circle cx="13.4" cy="8.8" r="4.7" />
      <path d="M9.8 12.7H17l-.8 4.2h-5.6l-.8-4.2Z" />
      <path d="M10.6 16.9h5.6l1.9 7.9H8.7l1.9-7.9Z" />
      <path d="M6.1 25.2h14.6a1.9 1.9 0 0 1 1.9 1.9v1.1a1 1 0 0 1-1 1H5.2a1 1 0 0 1-1-1v-1.1a1.9 1.9 0 0 1 1.9-1.9Z" />
      {/* Sclipirile, lipite de siluetă: prima trecea la peste trei unităţi de
          pion şi părea că pluteşte separat de el. */}
      <path d="M23 2.6Q23 7.2 27.6 7.2 23 7.2 23 11.8 23 7.2 18.4 7.2 23 7.2 23 2.6Z" />
      <path d="M21.6 13.9Q21.6 16.5 24.2 16.5 21.6 16.5 21.6 19.1 21.6 16.5 19 16.5 21.6 16.5 21.6 13.9Z" />
    </svg>
  )
}
