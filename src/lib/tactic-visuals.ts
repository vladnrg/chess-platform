// Identitatea vizuală a tacticilor: icon + culoare per categorie și culoare/icon per nivel.
// Sursă unică, refolosită de pagina de ansamblu și de pagina de traseu.
// (fișier .ts — stochează doar referințe la componente lucide; JSX-ul de randare stă în pagini)

import {
  GitFork, Pin, Zap, Magnet, Axe, ArrowLeftRight, Lock, Crown, Shield,
  Shuffle, Flame, Layers, Combine, Sparkles, Target,
  Sprout, Swords,
  type LucideIcon,
} from 'lucide-react'

export interface TacticVisual {
  icon: LucideIcon
  color: string // hex — accentul categoriei (aplicat prin style, nu prin clase Tailwind)
}

export const TACTIC_VISUALS: Record<string, TacticVisual> = {
  fork:              { icon: GitFork,        color: '#2DD4BF' }, // teal
  pin:               { icon: Pin,            color: '#E2B340' }, // amber
  discovered:        { icon: Zap,            color: '#8B5CF6' }, // violet
  attraction:        { icon: Magnet,         color: '#FB7185' }, // coral
  'remove-defender': { icon: Axe,            color: '#F97316' }, // orange
  skewer:            { icon: ArrowLeftRight, color: '#60A5FA' }, // blue
  trapped:           { icon: Lock,           color: '#94A3B8' }, // steel
  mate:              { icon: Crown,          color: '#FFD700' }, // gold
  'forced-draws':    { icon: Shield,         color: '#4ade80' }, // green
  zwischenzug:       { icon: Shuffle,        color: '#A78BFA' }, // light violet
  sacrifice:         { icon: Flame,          color: '#FB7185' }, // coral
  subscribers:       { icon: Layers,         color: '#2DD4BF' }, // teal
  hybrid:            { icon: Combine,        color: '#818CF8' }, // indigo
  'mixed-bonus':     { icon: Sparkles,       color: '#E2B340' }, // amber
}

const FALLBACK: TacticVisual = { icon: Target, color: '#E2B340' }

export function tacticVisual(id: string): TacticVisual {
  return TACTIC_VISUALS[id] ?? FALLBACK
}

/**
 * Scara valorii, împrumutată de la ligi: lemn → argint → aur → diamant.
 *
 * Verde → teal → violet → auriu, cum era înainte, e o progresie doar dacă ţi-o
 * explică cineva; nimeni nu ştie din instinct că violetul valorează mai mult
 * decât tealul. Scara asta se citeşte fără instrucţiuni, şi urcă şi în
 * luminozitate, nu doar în nuanţă — cufărul de lemn e cel mai stins din patru.
 *
 * Culorile sunt aceleaşi cu ale ligilor (vezi LEAGUES în types), ca rândul
 * întreg să spună acelaşi lucru cu cufărul din capul lui.
 */
export const TIER_COLORS: Record<string, string> = {
  incepator: '#A98342',   // lemn — cel mai neremarcabil
  intermediar: '#C0C0C0', // argint, ca liga Bazat
  avansat: '#FFD700',     // aur, ca liga Avansat
  master: '#50C878',      // smarald, ca liga Remarcabil
}

export const TIER_ICONS: Record<string, LucideIcon> = {
  incepator: Sprout,
  intermediar: Swords,
  avansat: Flame,
  master: Crown,
}

export function tierColor(id: string): string {
  return TIER_COLORS[id] ?? '#E2B340'
}
