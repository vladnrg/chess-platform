/**
 * XP-ul strâns în timp, pregătit pentru grafic.
 *
 * Datele vin din `xp_ledger` — jurnalul în care `award_xp` scrie fiecare
 * câştig, cu ora lui. E singurul loc care ştie *când* ai luat XP; `profiles.xp`
 * ştie doar cât ai acum.
 *
 * Cele două nu se potrivesc, şi asta e important: jurnalul a apărut la migrarea
 * 030, deci XP-ul de dinainte n-are nicio zi în el. De aceea totalul afişat
 * vine întotdeauna din profil, iar curba „de la început" porneşte de la
 * diferenţa dintre ele. Altfel graficul ar contrazice numărul de deasupra lui.
 */

export interface RandJurnal {
  amount: number
  created_at: string
}

export interface PunctGrafic {
  /** Ziua, în forma `2026-08-18` — cheia după care se grupează. */
  zi: string
  /** Ce scrie sub punct pe axă: ziua din lună. */
  eticheta: string
  /** Ziua întreagă, pentru bulina de la trecerea cu mouse-ul. */
  numeIntreg: string
  xp: number
}

/** Cele patru priviri asupra aceloraşi date. */
export type Fereastra = '7z' | '14z' | '30z' | 'tot'

/** Ordinea în care le parcurg săgeţile — de la aproape la departe. */
export const FERESTRE: Fereastra[] = ['7z', '14z', '30z', 'tot']

/** Fereastra cu care se deschide pagina. */
export const FEREASTRA_INITIALA: Fereastra = '30z'

export const TITLURI: Record<Fereastra, string> = {
  '7z': 'XP în ultimele 7 zile',
  '14z': 'XP în ultimele 14 zile',
  '30z': 'XP în ultimele 30 de zile',
  tot: 'XP adunat de la început',
}

const ZILE: Record<Exclude<Fereastra, 'tot'>, number> = { '7z': 7, '14z': 14, '30z': 30 }

const ZI_MS = 24 * 60 * 60 * 1000

const LUNI = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'noi', 'dec']

/** `2026-08-18` din data locală — nu `toISOString()`, care trece prin UTC şi mută ziua. */
function cheiaZilei(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function numeZi(d: Date): string {
  return `${d.getDate()} ${LUNI[d.getMonth()]}`
}

export interface Serie {
  puncte: PunctGrafic[]
  /** Cât scrie în colţul din dreapta: câştigul din fereastră, sau totalul la „tot". */
  totalFereastra: number
  /** Curbă crescătoare (totalul de până atunci) sau câştigul fiecărei zile? */
  cumulativ: boolean
}

/**
 * Punctele pentru o fereastră.
 *
 * Zilele fără nimic rămân în serie, cu zero: fără ele, o pauză de o săptămână
 * s-ar vedea ca o linie dreaptă între două vârfuri, adică exact pe dos.
 *
 * @param xpTotal  XP-ul din profil — adevărul despre cât are omul acum.
 */
export function serieXp(
  jurnal: RandJurnal[],
  fereastra: Fereastra,
  xpTotal: number,
  acum: Date = new Date(),
): Serie {
  const peZi = new Map<string, number>()
  for (const rand of jurnal) {
    const zi = cheiaZilei(new Date(rand.created_at))
    peZi.set(zi, (peZi.get(zi) ?? 0) + rand.amount)
  }

  if (fereastra === 'tot') return serieCumulativa(jurnal, peZi, xpTotal, acum)

  const cateZile = ZILE[fereastra]
  const puncte: PunctGrafic[] = []
  let total = 0
  // Ziua de azi e ultima din dreapta; numărăm înapoi de la ea.
  const azi = new Date(acum.getFullYear(), acum.getMonth(), acum.getDate())
  for (let i = cateZile - 1; i >= 0; i--) {
    const d = new Date(azi.getTime() - i * ZI_MS)
    const zi = cheiaZilei(d)
    const xp = peZi.get(zi) ?? 0
    total += xp
    puncte.push({ zi, eticheta: String(d.getDate()), numeIntreg: numeZi(d), xp })
  }

  return { puncte, totalFereastra: total, cumulativ: false }
}

/**
 * Curba „de la început": cât aveai în total la sfârşitul fiecărei zile.
 *
 * Porneşte de la XP-ul care nu are zile în jurnal — cel strâns înainte să existe
 * jurnalul. Fără el, curba s-ar termina sub numărul scris deasupra ei, şi n-ar
 * fi nimic în ecran care să explice de ce.
 */
function serieCumulativa(
  jurnal: RandJurnal[],
  peZi: Map<string, number>,
  xpTotal: number,
  acum: Date,
): Serie {
  const dinJurnal = jurnal.reduce((s, r) => s + r.amount, 0)
  const inainteDeJurnal = Math.max(0, xpTotal - dinJurnal)

  const zile = [...peZi.keys()].sort()
  if (zile.length === 0) {
    const azi = cheiaZilei(acum)
    return {
      puncte: [{ zi: azi, eticheta: String(acum.getDate()), numeIntreg: numeZi(acum), xp: xpTotal }],
      totalFereastra: xpTotal,
      cumulativ: true,
    }
  }

  const puncte: PunctGrafic[] = []
  let acumulat = inainteDeJurnal
  const prima = new Date(zile[0])
  const ultima = new Date(cheiaZilei(acum))

  // Şi aici trecem prin fiecare zi, nu doar prin cele cu câştig: altfel o pauză
  // de-o lună ar ocupa pe axă cât o zi.
  for (let d = prima; d <= ultima; d = new Date(d.getTime() + ZI_MS)) {
    const zi = cheiaZilei(d)
    acumulat += peZi.get(zi) ?? 0
    puncte.push({ zi, eticheta: String(d.getDate()), numeIntreg: numeZi(d), xp: acumulat })
  }

  return { puncte, totalFereastra: xpTotal, cumulativ: true }
}
