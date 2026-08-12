import { createElement, type CSSProperties } from 'react'
import { eventIcon } from '@/lib/events'

interface EventIconProps {
  /** Numele iconului aşa cum e stocat în `events.icon`. */
  name: string
  className?: string
  style?: CSSProperties
}

/**
 * Iconul unui eveniment, rezolvat din numele stocat în bază.
 *
 * Trece prin `createElement` în loc de JSX intenţionat: `const Icon = eventIcon(x)`
 * urmat de `<Icon />` e semnalat de regula `react-hooks/static-components`, care
 * vede o componentă construită în timpul randării şi avertizează că şi-ar pierde
 * starea. Iconurile lucide n-au stare, dar regula n-are cum să ştie asta.
 */
export function EventIcon({ name, className, style }: EventIconProps) {
  return createElement(eventIcon(name), { className, style })
}
