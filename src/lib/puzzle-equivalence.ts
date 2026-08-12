/**
 * Când e o mutare „la fel de bună" ca soluţia puzzle-ului.
 *
 * Verificarea de dinainte compara şirurile: `myMove === expectedMove`. Orice
 * altă mutare era greşită, oricât de bună ar fi fost — inclusiv un mat dat cu
 * altă piesă decât cea din soluţie. Un mat rămâne mat, indiferent cine îl dă.
 *
 * Aici stă doar regula de comparare, fără nimic din interfaţă sau din motor,
 * ca să poată fi verificată separat.
 */

/**
 * Cât de proastă poate fi o mutare faţă de soluţie şi tot să treacă, în sutimi
 * de pion.
 *
 * 30 e cam o treime de pion: sub atât, diferenţa nu se vede în joc şi ar fi
 * nedrept să pice cineva pentru ea. Peste, mutarea chiar e mai slabă şi merită
 * arătat de ce.
 */
export const EQUIVALENCE_MARGIN_CP = 30

/** Ce întoarce motorul pentru o poziţie: din perspectiva celui aflat la mutare. */
export interface EngineScore {
  cp?: number
  mate?: number
}

/**
 * Traduce scorul motorului într-un număr comparabil, din perspectiva NOASTRĂ.
 *
 * Motorul evaluează poziţia de după mutarea noastră, deci vorbeşte în numele
 * adversarului: `cp = -500` înseamnă că adversarul stă cu cinci pioni mai
 * prost, adică noi stăm bine. La fel, `mate = -2` înseamnă că adversarul e
 * mătuit în două — tot în favoarea noastră.
 *
 * Matul dat de noi bate orice evaluare materială, iar unul mai scurt bate unul
 * mai lung. De aici treptele de 100000.
 */
export function scoreFromOurSide({ cp, mate }: EngineScore): number {
  if (mate !== undefined) {
    // mate < 0 → adversarul e mătuit, deci noi câştigăm
    const weMate = mate < 0
    const distance = Math.abs(mate)
    // Pasul de 1000 pe mutare e intenţionat mai mare decât marja de toleranţă:
    // altfel un mat în 2 ar trece drept egal cu unul în 1, deşi puzzle-ul cerea
    // exact matul scurt. Un mat mai lung e o soluţie mai proastă.
    const magnitude = 100_000 - distance * 1_000
    return weMate ? magnitude : -magnitude
  }
  // `cp` e din perspectiva adversarului; îl întoarcem
  return -(cp ?? 0)
}

/**
 * E mutarea jucătorului cel puţin la fel de bună ca cea din soluţie?
 *
 * Ambele scoruri vin din evaluarea poziţiei REZULTATE, deci amândouă din
 * perspectiva adversarului. Le trecem prin `scoreFromOurSide` şi comparăm.
 */
export function isAtLeastAsGood(played: EngineScore, expected: EngineScore): boolean {
  return scoreFromOurSide(played) >= scoreFromOurSide(expected) - EQUIVALENCE_MARGIN_CP
}

/** Textul arătat când mutarea jucătorului e acceptată ca alternativă. */
export function acceptanceMessage(kind: 'mate' | 'equal', expectedSan: string): string {
  if (kind === 'mate') {
    return `Mat e mat. Soluţia dădea ${expectedSan}, dar rezultatul e acelaşi — partida s-a terminat.`
  }
  return `La fel de bună ca ${expectedSan}. Motorul nu face diferenţa între ele.`
}
