import type { ReactNode } from 'react'

/**
 * Rama şi culorile tablei dintr-un exerciţiu de lecţie, într-un singur loc.
 *
 * Există fiindcă cele trei exerciţii şi-au construit fiecare rama lui, iar una
 * a luat-o razna: „ce pătrat e în colţ" avea `max-w-xs` pe ea, deci tabla sărea
 * de la lăţimea cardului la 320px între exerciţiul 2 şi 3, în aceeaşi lecţie.
 * Copiii nu văd un motiv pentru asta — văd că s-a stricat ceva.
 *
 * Cât timp toate trei trec pe aici, nu mai pot să se depărteze una de alta.
 * Culorile pătratelor stau în `culori-tabla.ts`, din acelaşi motiv.
 */

export function RamaTablei({ children, inerta }: {
  children: ReactNode
  /** Tablă doar de privit, fără clic — la exerciţiile cu variante de răspuns. */
  inerta?: boolean
}) {
  return (
    <div
      className={`select-none overflow-hidden rounded-xl border border-[#2A2A2A]${
        inerta ? ' pointer-events-none' : ''
      }`}
    >
      {children}
    </div>
  )
}
