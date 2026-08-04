/**
 * Streak-ul: zile la rând în care ai câştigat XP.
 *
 * Nu zile în care te-ai logat. Ca să conteze ziua trebuie să fi făcut ceva —
 * un puzzle, o tactică, o lecţie, o victorie. Logarea nu e o realizare.
 */

/** O zi din panoul cu ultimele şapte. */
export interface StreakDay {
  /** `YYYY-MM-DD`, ora României. */
  day: string
  earned: boolean
}

/**
 * Streak-ul real, pornind de la cel stocat.
 *
 * `profiles.streak_days` e o fotografie de la ultima zi cu XP. Dacă de atunci
 * au trecut două zile, cifra e învechită — streak-ul s-a rupt, dar nimeni n-a
 * trecut pe acolo să scrie 0. Toate afişările trec prin funcţia asta.
 *
 * Ziua de azi nu rupe nimic: ai timp până la miezul nopţii.
 */
export function effectiveStreak(
  streakDays: number | null | undefined,
  lastActiveDate: string | null | undefined,
  today = localToday(),
): number {
  if (!lastActiveDate || !streakDays) return 0
  const diff = daysBetween(lastActiveDate, today)
  // 0 = a strâns XP azi, 1 = ieri. Mai mult înseamnă rupt.
  return diff <= 1 ? streakDays : 0
}

/** Ziua curentă în România, ca `YYYY-MM-DD`. */
export function localToday(): string {
  // `en-CA` fiindcă dă exact formatul ISO, iar `timeZone` face conversia.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Bucharest',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

/** Câte zile întregi sunt între două date `YYYY-MM-DD`. */
export function daysBetween(from: string, to: string): number {
  const a = Date.UTC(+from.slice(0, 4), +from.slice(5, 7) - 1, +from.slice(8, 10))
  const b = Date.UTC(+to.slice(0, 4), +to.slice(5, 7) - 1, +to.slice(8, 10))
  return Math.round((b - a) / 86_400_000)
}

/** Iniţiala zilei săptămânii pentru o dată `YYYY-MM-DD`: L, M, M, J, V, S, D. */
const WEEKDAY_INITIALS = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

export function weekdayInitial(day: string): string {
  const d = new Date(
    +day.slice(0, 4), +day.slice(5, 7) - 1, +day.slice(8, 10)
  )
  return WEEKDAY_INITIALS[d.getDay()]
}

/**
 * Mesajul de sub numărul de zile.
 *
 * Fără exclamaţii şi fără „ești pe val": tonul aplicaţiei e de partener de joc,
 * nu de aplicaţie care te bate pe umăr. Pragurile sunt alese ca fiecare să
 * spună ceva ce nu se vede deja din cifră.
 */
export function streakMessage(days: number): string {
  if (days === 0) return 'Strânge XP azi și pornești un șir nou.'
  if (days === 1) return 'Prima zi. Mâine se vede dacă ține.'
  if (days < 5) return 'Încă puțin și devine obicei.'
  if (days < 14) return 'A devenit obicei. Nu-l rupe acum.'
  if (days < 30) return 'Două săptămâni fără pauză. Puțini ajung aici.'
  if (days < 100) return 'O lună întreagă. Ăsta nu mai e noroc.'
  return 'Peste o sută de zile. Ești în altă categorie.'
}
