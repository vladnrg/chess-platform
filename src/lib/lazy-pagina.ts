import { lazy } from 'react'

const CHEIE = 'cleanchess:ultima-reincarcare-dupa-publicare'
/** Cât timp după o reîncărcare automată nu se mai încearcă alta. */
const PAUZA_MS = 10_000

/**
 * `React.lazy`, plus drumul de întoarcere după o publicare nouă.
 *
 * Fiecare pagină e un fişier separat, adus abia când e nevoie de ea. La fiecare
 * publicare pe Vercel fişierele primesc nume noi, iar cele vechi dispar. Cine
 * avea site-ul deschis de dinainte şi dădea clic spre o pagină neîncărcată încă
 * cerea un fişier care nu mai există — şi rămânea cu ecranul negru, fără niciun
 * mesaj. (Văzut pe 2026-11-09, după testul de plasament.)
 *
 * Acum, la o astfel de greşeală, pagina se reîncarcă singură şi aduce versiunea
 * nouă. Dar cel mult o dată la 10 secunde: dacă fişierul lipseşte şi după
 * reîncărcare, eroarea merge mai departe, la `EroarePagina`, care arată un mesaj.
 *
 * Semnul e momentul ultimei reîncărcări şi nu se şterge la succes. Prima versiune
 * îl ştergea când se încărca bine orice altă pagină — iar atunci pagina lipsă
 * credea din nou că e prima încercare: 51 de reîncărcări în 8 secunde, prinse la
 * test înainte de publicare.
 */
// Acelaşi fel de funcţie de încărcare pe care îl primeşte `lazy`, ca paginile cu
// proprietăţi (antrenorul are `mode` şi `stage`) să-şi păstreze tipurile.
type Incarcare = Parameters<typeof lazy>[0]

export function lazyPagina<F extends Incarcare>(incarca: F) {
  return lazy<Awaited<ReturnType<F>>['default']>(async () => {
    try {
      return await incarca()
    } catch (eroare) {
      let reincarc = false
      try {
        const ultima = Number(sessionStorage.getItem(CHEIE) ?? 0)
        if (Date.now() - ultima > PAUZA_MS) {
          sessionStorage.setItem(CHEIE, String(Date.now()))
          reincarc = true
        }
      } catch { /* fără stocare nu putem ţine socoteala, deci nu riscăm o buclă */ }
      if (!reincarc) throw eroare
      window.location.reload()
      // Până se reîncarcă, pagina aşteaptă, în loc să arate eroarea o clipă.
      return new Promise<never>(() => {})
    }
  })
}
