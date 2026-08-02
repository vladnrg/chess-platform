import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { type League, type LeagueConfig, LEAGUES } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLeagueConfig(league: League): LeagueConfig {
  return LEAGUES.find(l => l.name === league) ?? LEAGUES[0]
}

export function getLeagueForXp(xp: number): League {
  for (let i = LEAGUES.length - 1; i >= 0; i--) {
    if (xp >= LEAGUES[i].minXp) return LEAGUES[i].name
  }
  return 'cherestea'
}

export function getPreviousLeague(league: League): League {
  const idx = LEAGUES.findIndex(l => l.name === league)
  return idx > 0 ? LEAGUES[idx - 1].name : 'cherestea'
}

export function getNextLeague(league: League): League | null {
  const idx = LEAGUES.findIndex(l => l.name === league)
  return idx < LEAGUES.length - 1 ? LEAGUES[idx + 1].name : null
}

export function getXpToNextLeague(xp: number, league: League): number | null {
  const config = getLeagueConfig(league)
  if (config.maxXp === null) return null
  return config.maxXp + 1 - xp
}

export function getLeagueProgress(xp: number, league: League): number {
  const config = getLeagueConfig(league)
  if (config.maxXp === null) return 100
  const range = config.maxXp - config.minXp + 1
  const earned = xp - config.minXp
  return Math.min(100, Math.round((earned / range) * 100))
}

/**
 * Poţi juca doar cu cineva din liga ta, una mai jos sau una mai sus.
 *
 * Regula e impusă pe server (funcţia `create_challenge`); aici o repetăm doar ca
 * să nu arătăm un buton care oricum ar fi refuzat.
 */
export function canChallenge(mine: League, theirs: League): boolean {
  const a = LEAGUES.findIndex(l => l.name === mine)
  const b = LEAGUES.findIndex(l => l.name === theirs)
  if (a < 0 || b < 0) return false
  return Math.abs(a - b) <= 1
}

export function getCurrentWeekStart(): Date {
  const now = new Date()
  const day = now.getUTCDay()
  const diff = (day === 0 ? -6 : 1 - day)
  const monday = new Date(now)
  monday.setUTCDate(now.getUTCDate() + diff)
  monday.setUTCHours(0, 0, 0, 0)
  return monday
}

export function formatXp(xp: number): string {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`
  return `${xp}`
}

/**
 * „Zgomot" determinist în [0, 1) pornind de la un seed întreg.
 *
 * Folosit în animații pentru a da variație vizuală (poziții, întârzieri, rotații)
 * fără `Math.random()`. Random-ul real în corpul unei componente se re-evaluează
 * la fiecare render și face elementele să sară în timpul animației; funcția asta
 * întoarce mereu aceeași valoare pentru același seed, deci animația e stabilă.
 */
export function noise(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}
