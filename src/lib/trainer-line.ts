import { Chess } from 'chess.js'
import { supabase } from '@/lib/supabase'
import type { MarcajeMutari, OpeningLine } from '@/types'

export type TrainerStage = 'opening' | 'middlegame' | 'trap'

/**
 * Linia antrenată, oricare ar fi etapa.
 *
 * Jocul de mijloc şi capcanele pornesc din poziţii deja jucate, deci nu mai e
 * adevărat că semi-mutarea 0 e a albului — de aceea `start_fen`.
 */
export type TrainerLine = OpeningLine & {
  /** Poziţia de plecare. Lipsă = poziţia iniţială a partidei. */
  start_fen?: string
  /** A câta variantă a capitolului e (0 = cea principală) şi câte are capitolul. */
  variantaIndex?: number
  nrVariante?: number
  /** Numele ramificaţiei, la variantele 2–4. */
  numeVarianta?: string
  /** Din ce variantă răsare capcana. */
  fromVariation?: string
  /** Paragraful de încheiere, arătat la capătul liniei. */
  conclusion?: string
  /** Linia nu se rupe în părţi (capcanele au 11–12 semi-mutări). */
  singlePart?: boolean
}

/** Poziţia după primele `pana` semi-mutări dintr-o listă UCI. */
function fenDupa(moves: string, pana: number, dela?: string): string {
  const game = new Chess(dela)
  const lista = moves.split(' ').slice(0, pana)
  for (const m of lista) {
    try {
      game.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m[4] ?? 'q' })
    } catch {
      // Mutare imposibilă în datele semănate: ne oprim aici şi întoarcem poziţia
      // de până acum, exact ca varianta din care a fost mutată funcţia.
      break
    }
  }
  return game.fen()
}

async function linieDeschidere(lineId: string): Promise<TrainerLine | null> {
  const { data } = await supabase.from('opening_lines').select('*').eq('id', lineId).single()
  return (data as OpeningLine | null) ?? null
}

/** Cheile unui obiect pe semi-mutări, mutate cu `cu` poziţii mai încolo. */
function decaleaza<T>(obj: Record<string, T> | null | undefined, cu: number): Record<string, T> {
  const rez: Record<string, T> = {}
  for (const [k, v] of Object.entries(obj ?? {})) rez[String(Number(k) + cu)] = v
  return rez
}

/** Doar cheile (semi-mutările) dinaintea lui `pana`. */
function panaLa<T>(obj: Record<string, T> | null | undefined, pana: number): Record<string, T> {
  const rez: Record<string, T> = {}
  for (const [k, v] of Object.entries(obj ?? {})) if (Number(k) < pana) rez[k] = v
  return rez
}

/**
 * Varianta principală a capitolului: deschiderea şi, lipite la capătul ei,
 * mutările fostului „joc de mijloc", cu explicaţiile lor.
 *
 * Cerut pe 2026-11-25: jocul de mijloc nu mai e o parte separată. Erau doar
 * câteva mutări în plus, prezentate ca „variaţii" care nu erau variaţii.
 * Lipirea se face aici, la încărcare, nu în baza de date: `middlegame_plans`
 * rămâne neatins, deci schimbarea se poate întoarce.
 */
async function variantaPrincipala(opening: OpeningLine): Promise<TrainerLine> {
  const { data: plan } = await supabase
    .from('middlegame_plans')
    .select('moves_uci, move_explanations, move_comments, move_hints, final_text, final_arrows, move_marks')
    .eq('opening_line_id', opening.id)
    .maybeSingle() // nu orice capitol are continuare
  if (!plan?.moves_uci) return opening

  const n = opening.moves_uci.split(' ').filter(Boolean).length
  return {
    ...opening,
    moves_uci: `${opening.moves_uci} ${plan.moves_uci}`,
    move_explanations: { ...opening.move_explanations, ...decaleaza(plan.move_explanations as Record<string, string> | null, n) },
    move_comments: { ...(opening.move_comments ?? {}), ...decaleaza(plan.move_comments as Record<string, string> | null, n) },
    move_hints: { ...(opening.move_hints ?? {}), ...decaleaza(plan.move_hints as Record<string, string> | null, n) },
    move_marks: { ...(opening.move_marks ?? {}), ...decaleaza(plan.move_marks as MarcajeMutari | null, n) },
    // Încheierea e a capătului nou al variantei, adică a fostului joc de mijloc.
    final_text: plan.final_text ?? opening.final_text ?? null,
    final_arrows: (plan.final_arrows as { from: string; to: string }[] | null) ?? opening.final_arrows ?? null,
  }
}

/**
 * Varianta `index` a capitolului: 0 = cea principală, 1–3 = ramificaţiile din
 * `opening_lines.variante`. O ramificaţie se joacă de la prima mutare; până la
 * locul despărţirii ia textele şi marcajele variantei principale, de acolo
 * încolo pe ale ei — nimic de după despărţire nu se moşteneşte.
 */
async function variantaCapitol(lineId: string, index: number): Promise<TrainerLine | null> {
  const opening = await linieDeschidere(lineId)
  if (!opening) return null
  const ramificatii = opening.variante ?? []
  const nrVariante = 1 + ramificatii.length
  const principala = await variantaPrincipala(opening)
  const ramura = index > 0 ? ramificatii[index - 1] : undefined
  if (!ramura) return { ...principala, variantaIndex: 0, nrVariante }

  const a = principala.moves_uci.split(' ')
  const b = ramura.moves_uci.split(' ').filter(Boolean)
  let desp = 0
  while (desp < a.length && desp < b.length && a[desp] === b[desp]) desp++

  return {
    ...principala,
    moves_uci: b.join(' '),
    move_explanations: { ...panaLa(principala.move_explanations, desp), ...ramura.move_explanations },
    move_comments: panaLa(principala.move_comments, desp),
    move_hints: panaLa(principala.move_hints, desp),
    move_marks: { ...panaLa(principala.move_marks, desp), ...(ramura.move_marks ?? {}) },
    final_text: ramura.final_text ?? null,
    final_arrows: ramura.final_arrows ?? null,
    variantaIndex: index,
    nrVariante,
    numeVarianta: ramura.nume,
  }
}

/**
 * O capcană, modelată ca linie de antrenat.
 *
 * Culoarea nu se scrie de mână, se deduce: dacă victima e cel care ţine
 * deschiderea, tu joci cu cealaltă culoare — fiindcă tu eşti cel care întinde
 * cursa. De aceea capcana are nevoie de varianta din care răsare: de acolo vine
 * `user_color`.
 */
async function linieCapcana(trapId: string, mode: 'guided' | 'practice'): Promise<TrainerLine | null> {
  const { data: trap } = await supabase
    .from('opening_traps')
    .select('*')
    .eq('id', trapId)
    .single()
  if (!trap?.opening_line_id) return null

  const { data: linie } = await supabase
    .from('opening_lines')
    .select('*')
    .eq('id', trap.opening_line_id)
    .single()
  if (!linie) return null

  const alTau = trap.victim === 'ours'
    ? (linie.user_color === 'white' ? 'black' : 'white')
    : linie.user_color

  const exerseaza = mode === 'practice' && trap.spring_ply != null && trap.spring_ply > 0
  const toate = trap.moves_uci.split(' ')

  return {
    ...linie,
    id: trap.id,
    variation_name: trap.title,
    user_color: alTau,
    moves_uci: exerseaza ? toate.slice(trap.spring_ply!).join(' ') : trap.moves_uci,
    // La exerciţiu nu se arată explicaţii, deci nu are rost să le reindexăm.
    move_explanations: exerseaza ? {} : (trap.move_explanations ?? {}),
    // Capcanele n-au încă textele noi; nu moştenesc nimic de la variantă.
    intro: null, move_comments: null, move_hints: null, final_text: null, final_arrows: null,
    // Marcajele stau pe semi-mutările capcanei întregi; la exerciţiu nu se văd.
    move_marks: exerseaza ? null : ((trap.move_marks ?? null) as MarcajeMutari | null),
    start_fen: exerseaza ? fenDupa(trap.moves_uci, trap.spring_ply!) : undefined,
    fromVariation: linie.variation_name,
    conclusion: trap.explanation,
    singlePart: true,
  }
}

/**
 * `stage` 'opening' şi 'middlegame' sunt acum primul şi al doilea pas al
 * capitolului (variantele 1–2 şi 3–4); adresele vechi au rămas, ca să nu se
 * rupă legăturile salvate. `varianta` = indexul variantei, de la 0.
 */
export async function incarcaLinie(
  stage: TrainerStage,
  mode: 'guided' | 'practice',
  id: string,
  varianta = 0,
): Promise<TrainerLine | null> {
  if (stage === 'trap') return linieCapcana(id, mode)
  return variantaCapitol(id, varianta)
}
