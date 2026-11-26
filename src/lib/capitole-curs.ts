/**
 * Din ce e făcut un curs: capitole, iar fiecare capitol un traseu de paşi.
 *
 * Stă separat fiindcă îl citesc două pagini — cuprinsul cursului şi Bârlogul,
 * care arată capitolul la care ai rămas. Când construcţia era înăuntrul
 * cuprinsului, a doua pagină ar fi trebuit s-o refacă de la zero, iar cele două
 * ar fi început să spună lucruri diferite despre acelaşi curs. S-a mai
 * întâmplat, cu mărimea tablei din lecţii.
 *
 * Cursurile sunt de două feluri şi se citesc la fel de aici:
 *   - de deschideri — fiecare variantă e un capitol, plus unul cu capcanele;
 *   - fundamentale  — un singur capitol, cu lecţiile lui în ordine.
 */
import type { PathNode } from '@/components/courses/ChapterPath'
import type { Lesson, OpeningLine, Profile } from '@/types'

/**
 * Treapta mare a cursantului (400–1000 / 1000–1600 / 1600–2300, pe scara
 * Chess.com), cerută pe 2026-11-23. Rămâne pentru cursurile încă nemăsurate pe
 * trepte de rating (`popularitate_niveluri`).
 */
export type Nivel = 'incepator' | 'intermediar' | 'avansat'
export type SursaRating = 'chesscom' | 'lichess'

/**
 * Cum e încadrat cursantul pentru procentele din cursuri (cerut pe 2026-11-25):
 * contul legat — Lichess sau Chess.com, cu ratingul de acolo —, altfel nivelul
 * din testul de plasament, pe scara Chess.com. Cine n-a dat nici testul e pus
 * la 1300, în mijlocul treptei intermediare.
 */
export interface Incadrare {
  sursa: SursaRating
  rating: number
  nivel: Nivel
}

type ProfilPentruIncadrare = Pick<Profile, 'estimated_elo' | 'assessment_completed'>
  & Partial<Pick<Profile, 'sursa_rating' | 'chesscom_rating' | 'lichess_rating'>>

function treaptaMare(ratingChesscom: number): Nivel {
  if (ratingChesscom < 1000) return 'incepator'
  if (ratingChesscom < 1600) return 'intermediar'
  return 'avansat'
}

export function incadrareDin(profil: ProfilPentruIncadrare | null | undefined): Incadrare {
  if (profil?.sursa_rating === 'lichess' && profil.lichess_rating) {
    // Treapta mare se foloseşte doar la cursurile încă nemăsurate pe Lichess;
    // acolo, ratingul de Lichess se coboară cu ~300 spre scara Chess.com.
    return { sursa: 'lichess', rating: profil.lichess_rating, nivel: treaptaMare(profil.lichess_rating - 300) }
  }
  if (profil?.sursa_rating === 'chesscom' && profil.chesscom_rating) {
    return { sursa: 'chesscom', rating: profil.chesscom_rating, nivel: treaptaMare(profil.chesscom_rating) }
  }
  const rating = profil?.assessment_completed ? profil.estimated_elo : 1300
  return { sursa: 'chesscom', rating, nivel: treaptaMare(rating) }
}

type CuPopularitate = Pick<OpeningLine, 'popularitate_niveluri' | 'popularitate_pe_rating'>

/** Procentul din treapta de rating în care cade cursantul, dacă e măsurat. */
export function procentMasurat(linie: Partial<CuPopularitate>, inc: Incadrare): number | undefined {
  const trepte = linie.popularitate_pe_rating?.[inc.sursa]
  if (trepte) {
    const limite = Object.keys(trepte).map(Number).filter(n => !Number.isNaN(n)).sort((a, b) => a - b)
    if (limite.length > 0) {
      let aleasa = limite[0]
      for (const l of limite) if (inc.rating >= l) aleasa = l
      return Number(trepte[String(aleasa)])
    }
  }
  const peNivel = linie.popularitate_niveluri?.[inc.nivel]
  return peNivel == null ? undefined : Number(peNivel)
}

/** Procentul afişat al unui capitol: al treptei tale, dacă există măsurat. */
export function procentPeNivel(
  linie: Pick<OpeningLine, 'popularity_pct'> & Partial<CuPopularitate>,
  inc: Incadrare,
): number {
  return procentMasurat(linie, inc) ?? Number(linie.popularity_pct)
}

/** Are cursul cifre pe niveluri sau pe trepte? Dacă nu, ordinea rămâne cea de învăţare. */
function areProcente(l: Partial<CuPopularitate>): boolean {
  return !!(l.popularitate_niveluri || l.popularitate_pe_rating)
}

/**
 * Capitolele în ordinea în care le vei întâlni: întâi cele la care adversarul
 * te duce cel mai des, la treapta ta.
 *
 * Se ordonează după mutarea adversarului (`grup`), nu după capitol: Giuoco
 * Piano, Pianissimo şi Gambitul Evans răspund toate la 3…Nc5 şi stau împreună,
 * între ele în ordinea de învăţare (`order_index`). Un curs fără cifre îşi
 * păstrează ordinea de acum. Ordinea e stabilă, deci aplicată de două ori dă
 * acelaşi rezultat.
 */
export function ordoneazaPeNivel<T extends Pick<OpeningLine, 'order_index' | 'grup'> & Partial<CuPopularitate>>(
  linii: T[],
  inc: Incadrare,
): T[] {
  if (!linii.some(areProcente)) return linii
  const cheie = (l: T) => l.grup ?? `#${l.order_index}`
  const procentGrup = new Map<string, number>()
  const primulInGrup = new Map<string, number>()
  for (const l of linii) {
    const k = cheie(l)
    const p = procentMasurat(l, inc) ?? -1
    procentGrup.set(k, Math.max(procentGrup.get(k) ?? -1, p))
    primulInGrup.set(k, Math.min(primulInGrup.get(k) ?? Infinity, l.order_index))
  }
  return [...linii].sort((a, b) => {
    const ka = cheie(a), kb = cheie(b)
    if (ka !== kb) {
      return (procentGrup.get(kb)! - procentGrup.get(ka)!) || (primulInGrup.get(ka)! - primulInGrup.get(kb)!)
    }
    return a.order_index - b.order_index
  })
}

/**
 * Eticheta de popularitate a unui capitol. Procentele vin din partidele de
 * rapid şi blitz de pe Chess.com, iar acolo unele
 * variante se joacă rar: sub 1% s-ar rotunji la „0%" sau ar apărea cu zecimale
 * fără rost. Chess.com scrie în locul lor „<1%"; aici, „sub 1%".
 */
export function popularitate(procent: number): string {
  // `Number`: coloana e `numeric`, iar PostgREST o poate trimite şi ca text.
  const p = Number(procent)
  return p < 1 ? 'sub 1% popularitate' : `${Math.round(p)}% popularitate`
}

/**
 * Sub atât, o linie de teorie se întâlneşte rar la nivelul cursanţilor şi o
 * spunem pe faţă. Utilizatorul, pe 2026-11-23: „aş putea menţiona în dreptul
 * variantei jucate de mari maeştri că este puţin probabil ca adversarii userilor
 * să joace asta, dar totuşi să le ofer secvenţa de mutări".
 */
export const PRAG_RAR = 5

/**
 * Eticheta de sub titlul unui capitol de deschidere.
 *
 * Unde capitolul are un `grup`, procentul e al mutării adversarului, iar eticheta
 * o numeşte: la Giuoco Piano, Pianissimo şi Evans scrie de trei ori „3…Nc5",
 * ca să se vadă că e aceeaşi cifră, nu trei întâmplări diferite.
 */
export function subtitluCapitol(
  linie: Pick<OpeningLine, 'popularity_pct' | 'tip' | 'grup' | 'popularitate_niveluri' | 'popularitate_pe_rating'>,
  inc: Incadrare = incadrareDin(null),
): string {
  const p = procentPeNivel(linie, inc)
  if (linie.tip === 'practica') {
    return p < 1 ? 'sub 1% din partidele de la nivelul tău' : `${Math.round(p)}% din partidele de la nivelul tău`
  }
  const eticheta = linie.grup && areProcente(linie)
    ? `${linie.grup} · ${p < 1 ? 'sub 1%' : `${Math.round(p)}%`} din partidele de la nivelul tău`
    : popularitate(p)
  return p < PRAG_RAR ? `${eticheta} · rar la nivelul tău` : eticheta
}

export interface Capitol {
  /** Id-ul variantei, `capcane`, sau `lectii` la cursurile fundamentale. */
  id: string
  titlu: string
  subtitlu: string
  noduri: PathNode[]
  terminat: boolean
  /**
   * Sub ce titlu stă capitolul în cuprins: teoria „ca la carte", ce joacă de
   * fapt adversarii (`practica`), sau capcanele. Lipsă la cursurile fundamentale.
   */
  grupa?: 'teorie' | 'practica' | 'capcane'
}

/** Ce ştie baza despre capcanele unui curs (RPC `course_middlegame`). */
export interface DateDeCurs {
  capcane: {
    id: string
    title: string
    opening_line_id: string | null
    variation_name: string | null
    spring_ply: number | null
  }[]
}

/**
 * Numele etapei unei variante în `noduri_parcurse`. Prima variantă păstrează
 * numele de dinainte (`-teorie`, `-exersare`), ca progresul vechi să rămână.
 */
export function nodVarianta(lineId: string, varianta: number, fel: 'teorie' | 'exersare'): string {
  return varianta === 0 ? `${lineId}-${fel}` : `${lineId}-${fel}-${varianta}`
}

/** Capitolele unui curs de deschideri. */
export function capitoleDeDeschidere(
  slug: string,
  linii: OpeningLine[],
  parcurse: string[],
  date: DateDeCurs | undefined,
  inc: Incadrare = incadrareDin(null),
  /** Paşii terminaţi şi când (`user_course_progress.noduri_parcurse`, migrarea 139). */
  noduriParcurse: Record<string, string> = {},
): Capitol[] {
  // Un pas e făcut dacă e în `noduriParcurse`. Studiul primului pas se mai ştie
  // şi din `parcurse` (progresul de dinainte de 2026-11-25), fără dată.
  const nod = <T extends PathNode>(n: T, gataDinainte = false): T => ({
    ...n,
    done: gataDinainte || !!noduriParcurse[n.id],
    cand: noduriParcurse[n.id],
  })
  const capitole: Capitol[] = ordoneazaPeNivel(linii, inc).map(linie => {
    // Etapele capitolului (cerut pe 2026-11-26): fiecare variantă, pe rând,
    // studiată şi apoi exersată. Jocul de mijloc nu mai e un pas separat.
    const nrVariante = 1 + (linie.variante?.length ?? 0)

    const noduri: PathNode[] = [
        ...Array.from({ length: nrVariante }, (_, v) => [
          nod({
            id: nodVarianta(linie.id, v, 'teorie'),
            kind: 'lectie' as const,
            title: `Studiu: varianta ${v + 1}`,
            href: `/courses/${slug}/guided/${linie.id}?v=${v}`,
          }, v === 0 && parcurse.includes(linie.id)),
          nod({
            id: nodVarianta(linie.id, v, 'exersare'),
            kind: 'exercitiu' as const,
            title: `Exersare: varianta ${v + 1}`,
            href: `/courses/${slug}/practice/${linie.id}?v=${v}`,
          }),
        ]).flat(),
        {
          // Fără `href`: nodul există în traseu fiindcă face parte din el, dar
          // întrebările încă nu sunt construite. Mai bine un pas care spune „în
          // curând" decât un traseu care se termină brusc.
          id: `${linie.id}-test`,
          kind: 'test',
          title: 'Verificare de capitol',
        },
    ]

    return {
      id: linie.id,
      titlu: linie.variation_name,
      subtitlu: subtitluCapitol(linie, inc),
      // Terminat = toţi paşii care duc undeva sunt făcuţi (testul încă n-are pagină).
      terminat: noduri.filter(n => n.href).every(n => n.done),
      grupa: linie.tip === 'practica' ? 'practica' : 'teorie',
      noduri,
    }
  })

  // Capcanele nu ţin de o variantă anume, ci de deschidere ca întreg — de aceea
  // capitol separat, nu noduri împrăştiate prin celelalte. Fiecare îşi poartă
  // eticheta variantei din care răsare, pe pagina ei.
  const capcane = date?.capcane ?? []
  if (capcane.length > 0) {
    const variante = [...new Set(capcane.map(c => c.variation_name).filter(Boolean))]
    capitole.push({
      id: 'capcane',
      titlu: 'Capcane uzuale',
      grupa: 'capcane',
      subtitlu: `${capcane.length} ${capcane.length === 1 ? 'capcană' : 'capcane'} · din ${variante.join(' şi ')}`,
      terminat: capcane.every(c => parcurse.includes(c.id)),
      noduri: capcane.flatMap(c => [
        nod({
          id: `${c.id}-lectie`,
          kind: 'lectie' as const,
          title: `${c.title} — pas cu pas`,
          href: `/courses/${slug}/trap/${c.id}`,
        }, parcurse.includes(c.id)),
        // Fără punct de armare n-am de unde porni exerciţiul, deci nodul lipseşte.
        ...(c.spring_ply != null ? [nod({
          id: `${c.id}-exercitiu`,
          kind: 'exercitiu' as const,
          title: `${c.title} — pe cont propriu`,
          href: `/courses/${slug}/trap-practice/${c.id}`,
        })] : []),
      ]),
    })
  }

  return capitole
}

/**
 * Capitolul unui curs fundamental: lecţiile lui, în ordine.
 *
 * Unul singur, nu câte unul de lecţie. „Regulile jocului" e un drum de la cap la
 * coadă, nu şapte cursuri mici puse unul lângă altul.
 */
export function capitolDeLectii(
  slug: string,
  lectii: Lesson[],
  parcurse: string[],
): Capitol[] {
  if (lectii.length === 0) return []
  const gata = lectii.filter(l => parcurse.includes(l.id)).length

  return [{
    id: 'lectii',
    titlu: 'Lecţiile cursului',
    subtitlu: `${gata} din ${lectii.length} parcurse`,
    terminat: gata === lectii.length,
    noduri: lectii.map(lectie => ({
      id: lectie.id,
      kind: 'lectie' as const,
      title: lectie.title,
      href: `/courses/${slug}/lessons/${lectie.id}`,
      done: parcurse.includes(lectie.id),
    })),
  }]
}

/**
 * Cursul e dus până la capăt?
 *
 * Stă aici, lângă construcţia capitolelor, fiindcă e acelaşi lucru spus mai pe
 * scurt: un curs e gata când toate capitolele lui sunt gata. Bârlogul nu-şi
 * poate permite să construiască tot cuprinsul fiecărui curs început doar ca să
 * afle asta — ar însemna, pentru fiecare, lecţiile, variantele, planurile şi
 * capcanele — deci întreabă direct, cu id-urile pe care le are.
 *
 * Regula e copiată din cele două funcţii de deasupra, ca să nu ajungă cele două
 * pagini să spună lucruri diferite despre acelaşi curs:
 *   - la deschideri, un capitol de variantă e terminat când teoria ei e
 *     parcursă, iar capitolul de capcane când toate capcanele sunt;
 *   - la cursurile fundamentale, când toate lecţiile sunt parcurse.
 *
 * Un curs fără niciun conţinut nu e „terminat", e gol — altfel ar dispărea din
 * Bârlog tocmai cursurile la care încă nu s-a scris nimic.
 */
export function cursTerminat(
  parcurse: string[],
  continut: { lectii: string[]; linii: string[]; capcane: string[] },
): boolean {
  const gata = new Set(parcurse)

  if (continut.linii.length > 0) {
    return [...continut.linii, ...continut.capcane].every(id => gata.has(id))
  }
  return continut.lectii.length > 0 && continut.lectii.every(id => gata.has(id))
}

/**
 * Capitolul la care a rămas omul: primul neterminat, sau ultimul dacă a
 * terminat tot. Nu întoarce niciodată `undefined` pe o listă nevidă — pagina
 * care îl arată n-ar avea ce pune în loc.
 */
export function capitolulCurent(capitole: Capitol[]): number {
  const eticheta = etichetaTraseu(capitole)
  if (eticheta) {
    const i = capitole.findIndex(c => c.noduri.some(n => n.id === eticheta.nodId))
    if (i >= 0) return i
  }
  if (capitole.length === 0) return -1
  const i = capitole.findIndex(c => !c.terminat)
  return i === -1 ? capitole.length - 1 : i
}

/**
 * Mesajul de lângă un nod, ca pe Chessly (cerut pe 2026-11-25): „Te afli aici"
 * pe pasul la care ai ajuns, iar la un curs terminat „Ultimul studiu completat"
 * pe pasul terminat cel mai recent — oricare ar fi, dacă te întorci şi refaci
 * unul mai vechi.
 *
 * „Aici" = pasul următor din capitolul la care ai lucrat ultima dată; dacă acela
 * e gata, primul pas nefăcut din primul capitol neterminat.
 */
export function etichetaTraseu(capitole: Capitol[]): { nodId: string; text: string } | null {
  const toate = capitole.flatMap(c => c.noduri.filter(n => n.href).map(n => ({ n, c })))
  if (toate.length === 0) return null
  const ultimul = toate
    .filter(x => x.n.done && x.n.cand)
    .sort((a, b) => (b.n.cand! > a.n.cand! ? 1 : -1))[0]

  if (toate.every(x => x.n.done)) {
    const n = ultimul?.n ?? toate[toate.length - 1].n
    return { nodId: n.id, text: 'Ultimul studiu completat' }
  }
  const urmatorul = (c: Capitol) => c.noduri.find(n => n.href && !n.done)
  const dinUltimul = ultimul ? urmatorul(ultimul.c) : undefined
  const aici = dinUltimul ?? capitole.map(urmatorul).find(Boolean)
  return aici ? { nodId: aici.id, text: 'Te afli aici' } : null
}
