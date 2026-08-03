import {
  Sparkles, Gift, Zap, Star, Trophy, BookOpen, Egg, CalendarDays,
  type LucideIcon,
} from 'lucide-react'
import {
  DEFAULT_BOARD,
  type BoardPayload, type Cosmetic, type SeasonalEvent, type EventTask,
} from '@/types'

/**
 * Iconul unui eveniment. Baza de date ţine doar numele, fiindcă altfel ar trebui
 * să importăm tot pachetul lucide ca să putem rezolva orice şir — câteva sute de
 * kilobytes pentru zece iconuri folosite.
 */
const EVENT_ICONS: Record<string, LucideIcon> = {
  Sparkles, Gift, Zap, Star, Trophy, BookOpen, Egg, CalendarDays,
}

export function eventIcon(name: string): LucideIcon {
  return EVENT_ICONS[name] ?? Sparkles
}

/** Culorile tablei: ale cosmeticului echipat, altfel cele implicite. */
export function boardColors(cosmetic: Cosmetic | null | undefined): BoardPayload {
  if (!cosmetic || cosmetic.kind !== 'board') return DEFAULT_BOARD
  const p = cosmetic.payload as Partial<BoardPayload>
  if (typeof p.light !== 'string' || typeof p.dark !== 'string') return DEFAULT_BOARD
  return { light: p.light, dark: p.dark }
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Zile întregi rămase până la o dată. Negativ dacă a trecut. */
export function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / DAY_MS)
}

const DATE_FMT = new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'long' })

/**
 * Fereastra evenimentului, pe scurt: „1–25 decembrie" sau „20 iulie" când ţine
 * o singură zi.
 */
export function eventWindow(ev: Pick<SeasonalEvent, 'starts_at' | 'ends_at'>): string {
  const from = new Date(ev.starts_at)
  const to = new Date(ev.ends_at)
  // Sub 36 de ore o tratăm ca pe o singură zi: „20–21 iulie" pentru un eveniment
  // care ţine până la miezul nopţii ar induce în eroare.
  if (to.getTime() - from.getTime() <= 36 * 60 * 60 * 1000) return DATE_FMT.format(from)
  if (from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()) {
    return `${from.getDate()}–${DATE_FMT.format(to)}`
  }
  return `${DATE_FMT.format(from)} – ${DATE_FMT.format(to)}`
}

/** Textul de stare, în funcţie de cât mai e. */
export function eventStatusLabel(ev: SeasonalEvent): string {
  if (ev.status === 'ended') return 'S-a încheiat'
  if (ev.status === 'upcoming') {
    const d = daysUntil(ev.starts_at)
    if (d <= 1) return 'Începe mâine'
    return `Începe în ${d} zile`
  }
  const d = daysUntil(ev.ends_at)
  if (d <= 1) return 'Ultima zi'
  return `Mai sunt ${d} zile`
}

/**
 * Sarcina la care ar trebui să te duci acum: prima deschisă şi nerezolvată.
 * `null` când le-ai terminat pe toate cele disponibile.
 */
export function nextTask(tasks: EventTask[]): EventTask | null {
  return tasks.find(t => t.is_open && !t.done) ?? null
}

/** Câte sarcini sunt rezolvate din cele deschise până acum. */
export function taskProgress(tasks: EventTask[]): { done: number; open: number; total: number } {
  return {
    done: tasks.filter(t => t.done).length,
    open: tasks.filter(t => t.is_open).length,
    total: tasks.length,
  }
}

/**
 * Ziua din decembrie pe care o reprezintă o uşă. Ordinea sarcinii e chiar ziua,
 * aşa cum le populează migrarea 031.
 */
export function doorDay(task: EventTask): number {
  return task.order_index
}
