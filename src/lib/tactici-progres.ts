// Ce ştim despre jucător din încercările lui, calculat din date, nu din
// presupuneri. Trei lucruri: cât de bun e la fiecare temă, ce are de repetat
// azi, şi care e tema zilei.
//
// Totul se derivă din `user_puzzle_attempts` (rezolvat / nerezolvat / când) şi
// din ratingul puzzle-ului. Fără tabele noi.

import type { TacticCategory } from '@/data/tactics'
import { matchesCategory } from '@/lib/tactics-path'

export interface Incercare {
  puzzle_id: string
  solved: boolean
  attempted_at: string
}

interface PuzzleLike {
  id: string
  rating: number
  themes: string[]
}

/** Sub atâtea încercări pe o temă, o cifră ar fi zgomot, nu măsură. */
export const MINIM_PENTRU_NIVEL = 8

/**
 * Amortizor pentru puţine date.
 *
 * Formula de performanţă mută nivelul cu până la 400 de puncte, ceea ce la opt
 * încercări e o săritură absurdă: cine ia 8 din 8 ar ieşi cu 400 peste media
 * poziţiilor. Împărţind la `n + AMORTIZOR`, corecţia creşte pe măsură ce se
 * strâng date — la 8 încercări mişcă vreo 130 de puncte, la 40 aproape 400.
 */
const AMORTIZOR = 8

export interface NivelTema {
  categorie: TacticCategory
  incercari: number
  rezolvate: number
  /** Rating estimat pe tema asta, sau `null` dacă încă sunt prea puţine date. */
  nivel: number | null
  procentReusita: number
}

/**
 * Nivelul pe fiecare temă, după formula de performanţă folosită şi la turnee:
 * media adversarilor plus 400 × (câştigate − pierdute) / jucate.
 *
 * „Adversarul" e ratingul poziţiei. O poziţie de 1500 rezolvată trage nivelul în
 * sus, una de 1500 ratată îl trage în jos — exact cât trebuie, şi fără să
 * inventăm o formulă proprie.
 */
export function niveluriPeTeme(
  incercari: Incercare[],
  puzzles: PuzzleLike[],
  categorii: TacticCategory[],
): NivelTema[] {
  const dupaId = new Map(puzzles.map(p => [p.id, p]))
  return categorii
    .filter(c => !c.fel) // probele şi formatele nu sunt teme, deci n-au nivel propriu
    .map(categorie => {
      let n = 0
      let rezolvate = 0
      let sumaRating = 0
      for (const i of incercari) {
        const p = dupaId.get(i.puzzle_id)
        if (!p || !matchesCategory(p.themes, categorie)) continue
        n++
        sumaRating += p.rating
        if (i.solved) rezolvate++
      }
      const nivel = n >= MINIM_PENTRU_NIVEL
        ? Math.round(sumaRating / n + (400 * (rezolvate - (n - rezolvate))) / (n + AMORTIZOR))
        : null
      return {
        categorie,
        incercari: n,
        rezolvate,
        nivel,
        procentReusita: n ? Math.round((100 * rezolvate) / n) : 0,
      }
    })
}

/**
 * Tema cea mai slabă: cea cu nivelul cel mai mic dintre cele măsurabile.
 *
 * Dacă încă nu sunt destule date nicăieri, întoarce `null` — mai bine nimic
 * decât un sfat scos din patru încercări.
 */
export function temaSlaba(niveluri: NivelTema[]): NivelTema | null {
  const masurabile = niveluri.filter(n => n.nivel !== null)
  if (masurabile.length < 2) return null
  return masurabile.reduce((a, b) => (a.nivel! <= b.nivel! ? a : b))
}

const ZI = 24 * 60 * 60 * 1000

/** După câte zile se întoarce o poziţie ratată: întâi peste 3, apoi 10, apoi 30. */
export const PASI_REPETITIE = [3, 10, 30]

/**
 * Poziţiile de repetat azi.
 *
 * O poziţie intră la repetat dacă ultima încercare a fost o ratare şi de atunci
 * a trecut destul timp. Intervalul creşte cu fiecare ratare: 3 zile, apoi 10,
 * apoi 30 — cine greşeşte des o revede des.
 *
 * O rezolvare o scoate din listă: se uită după ULTIMA încercare, nu după toate.
 */
export function deRepetat(incercari: Incercare[], acum: number = Date.now()): string[] {
  const ultima = new Map<string, { solved: boolean; cand: number; ratari: number }>()
  for (const i of incercari) {
    const cand = new Date(i.attempted_at).getTime()
    const e = ultima.get(i.puzzle_id)
    const ratari = (e?.ratari ?? 0) + (i.solved ? 0 : 1)
    if (!e || cand >= e.cand) ultima.set(i.puzzle_id, { solved: i.solved, cand, ratari })
    else ultima.set(i.puzzle_id, { ...e, ratari })
  }
  const dedus: string[] = []
  for (const [id, e] of ultima) {
    if (e.solved) continue
    const pas = PASI_REPETITIE[Math.min(e.ratari - 1, PASI_REPETITIE.length - 1)]
    if (acum - e.cand >= pas * ZI) dedus.push(id)
  }
  return dedus.sort()
}

/**
 * Tema zilei — aceeaşi pentru toată lumea, alta în fiecare zi.
 *
 * Se alege din dată, nu la întâmplare: aşa doi copii care se compară văd acelaşi
 * lucru, iar cine intră de două ori pe zi nu primeşte două teme diferite.
 */
export function temaZilei(categorii: TacticCategory[], azi: Date = new Date()): TacticCategory | null {
  const teme = categorii.filter(c => !c.fel && !c.isPro)
  if (teme.length === 0) return null
  const zile = Math.floor(
    Date.UTC(azi.getFullYear(), azi.getMonth(), azi.getDate()) / (24 * 60 * 60 * 1000),
  )
  return teme[zile % teme.length]
}

/** Cât XP dă o poziţie, cu bonusul temei zilei aplicat. */
export function xpPentru(ratingPuzzle: number, eTemaZilei: boolean): number {
  const baza = ratingPuzzle < 1000 ? 10 : ratingPuzzle < 1500 ? 20 : 30
  return eTemaZilei ? baza * 2 : baza
}
