import { levelFromXp, MAX_LEVEL } from './levels'

/**
 * Ce se deblochează la ce nivel.
 *
 * Două reguli de conţinut, ca sistemul să nu intre în conflict cu abonamentul:
 *  - Pro dă **cantitate** (câte cursuri, câte puzzle-uri pe zi)
 *  - nivelul dă **capabilităţi şi identitate** (analiză, titluri, scuturi)
 * Un curs nu se deblochează niciodată prin nivel — acela e produsul vândut.
 *
 * Şi o regulă de fond: nimic din ce ţine de învăţat nu stă după o poartă.
 * Puzzle-urile, tacticile şi cursurile sunt accesibile de la nivelul 1. Ce se
 * deblochează aici sunt adaosuri.
 *
 * Nivelurile terminate în 5 sunt încurajări (un titlu nou), cele terminate în 0
 * dau ceva ce schimbă ce poţi face. 50 şi 100 sunt praguri de prestigiu.
 */

export type UnlockKind = 'title' | 'shield' | 'feature' | 'prestige'

export interface Unlock {
  level: number
  kind: UnlockKind
  label: string
  description: string
  /** Cheie stabilă pentru capabilităţile verificate în cod. */
  key?: FeatureKey
}

/** Capabilităţile care se verifică undeva în aplicaţie. */
export type FeatureKey = 'analysis' | 'wide-challenge' | 'experienced' | 'hall-of-fame'

/** La ce nivel se deblochează fiecare capabilitate. Sursa adevărului. */
export const FEATURE_LEVELS: Record<FeatureKey, number> = {
  analysis: 10,
  'wide-challenge': 40,
  /**
   * „Jucător experimentat": 5 partide clasate pe zi cu acelaşi adversar îţi dau
   * XP, în loc de 3. Limita se aplică în baza de date (`daily_xp_limit`), fiindcă
   * acolo se acordă XP-ul — clientul n-are ce verifica.
   */
  experienced: 50,
  'hall-of-fame': 100,
}

/**
 * Titlurile care se pot afişa lângă nume. Cheia e ce se salvează în profil;
 * eticheta e ce se vede.
 */
export const TITLES: { level: number; label: string }[] = [
  { level: 5, label: 'Curios' },
  { level: 15, label: 'Tenace' },
  { level: 25, label: 'Calculat' },
  { level: 35, label: 'Neclintit' },
  { level: 45, label: 'Vulpe bătrână' },
  { level: 50, label: 'Maestru al platformei' },
  { level: 55, label: 'Ochi de vultur' },
  { level: 65, label: 'Mână de fier' },
  { level: 75, label: 'Strateg' },
  { level: 85, label: 'Neînduplecat' },
  { level: 95, label: 'Aproape de vârf' },
  { level: 100, label: 'Legendă' },
]

export const UNLOCKS: Unlock[] = [
  { level: 5, kind: 'title', label: 'Titlul „Curios"', description: 'Primul titlu care apare lângă numele tău.' },
  { level: 10, kind: 'feature', key: 'analysis', label: 'Analiza partidei', description: 'După fiecare partidă, motorul îți arată unde ai greșit.' },
  { level: 15, kind: 'title', label: 'Titlul „Tenace"', description: 'Ai revenit destule zile la rând ca să-l meriți.' },
  { level: 20, kind: 'shield', label: 'Scut de retrogradare', description: 'Te salvează o dată dacă ratezi minimul săptămânal.' },
  { level: 25, kind: 'title', label: 'Titlul „Calculat"', description: 'Un titlu nou pentru profil.' },
  { level: 30, kind: 'shield', label: 'Al doilea scut', description: 'Încă o săptămână în care poți lipsi fără să cobori.' },
  { level: 35, kind: 'title', label: 'Titlul „Neclintit"', description: 'Un titlu nou pentru profil.' },
  { level: 40, kind: 'feature', key: 'wide-challenge', label: 'Provocări mai departe', description: 'Poți provoca jucători până la două ligi distanță.' },
  { level: 45, kind: 'title', label: 'Titlul „Vulpe bătrână"', description: 'Un titlu nou pentru profil.' },
  { level: 50, kind: 'prestige', key: 'experienced', label: 'Maestru al platformei', description: 'Titlu de prestigiu, al treilea scut și „Jucător experimentat": 5 partide pe zi cu același adversar îți dau XP, în loc de 3.' },
  { level: 55, kind: 'title', label: 'Titlul „Ochi de vultur"', description: 'Un titlu nou pentru profil.' },
  { level: 60, kind: 'shield', label: 'Al patrulea scut', description: 'Încă o plasă de siguranță.' },
  { level: 65, kind: 'title', label: 'Titlul „Mână de fier"', description: 'Un titlu nou pentru profil.' },
  { level: 70, kind: 'shield', label: 'Al cincilea scut', description: 'Încă o plasă de siguranță.' },
  { level: 75, kind: 'title', label: 'Titlul „Strateg"', description: 'Un titlu nou pentru profil.' },
  { level: 80, kind: 'shield', label: 'Al șaselea scut', description: 'Încă o plasă de siguranță.' },
  { level: 85, kind: 'title', label: 'Titlul „Neînduplecat"', description: 'Un titlu nou pentru profil.' },
  { level: 90, kind: 'shield', label: 'Al șaptelea scut', description: 'Încă o plasă de siguranță.' },
  { level: 95, kind: 'title', label: 'Titlul „Aproape de vârf"', description: 'Ultimul titlu dinaintea vârfului.' },
  { level: 100, kind: 'prestige', label: 'Legendă', description: 'Titlul suprem și un loc permanent în Sala Faimei.' },
]

/** Câte scuturi ar fi trebuit să primească cineva până la nivelul dat. */
export function shieldsEarnedBy(level: number): number {
  return UNLOCKS.filter(u => u.level <= level && (u.kind === 'shield' || u.level === 50)).length
}

export function hasFeature(xp: number, key: FeatureKey): boolean {
  return levelFromXp(xp) >= FEATURE_LEVELS[key]
}

/** Titlurile pe care le-a deblocat cineva, în ordinea obţinerii. */
export function unlockedTitles(xp: number): string[] {
  const level = levelFromXp(xp)
  return TITLES.filter(t => t.level <= level).map(t => t.label)
}

/** Următoarea recompensă, pentru bara de progres. `null` la nivelul maxim. */
export function nextUnlock(xp: number): Unlock | null {
  const level = levelFromXp(xp)
  if (level >= MAX_LEVEL) return null
  return UNLOCKS.find(u => u.level > level) ?? null
}

/** Ce s-a deblocat exact la nivelul dat — pentru mesajul de avansare. */
export function unlocksAtLevel(level: number): Unlock[] {
  return UNLOCKS.filter(u => u.level === level)
}
