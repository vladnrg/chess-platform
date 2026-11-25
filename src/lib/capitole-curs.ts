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
 * Nivelul cursantului, pentru procentele şi ordinea capitolelor.
 *
 * Cerut pe 2026-11-23: trei niveluri, nu un singur interval 1000–2000, fiindcă
 * platforma e pentru 400–2300 şi un începător întâlneşte alte mutări decât un
 * avansat. Nivelul vine din testul de plasament (`estimated_elo`); cine nu l-a
 * dat vede nivelul intermediar, cel mai apropiat de majoritate.
 */
export type Nivel = 'incepator' | 'intermediar' | 'avansat'

export function nivelDin(profil: Pick<Profile, 'estimated_elo' | 'assessment_completed'> | null | undefined): Nivel {
  if (!profil?.assessment_completed) return 'intermediar'
  if (profil.estimated_elo < 1000) return 'incepator'
  if (profil.estimated_elo < 1600) return 'intermediar'
  return 'avansat'
}

/** Procentul afişat al unui capitol: al nivelului tău, dacă există măsurat. */
export function procentPeNivel(
  linie: Pick<OpeningLine, 'popularity_pct' | 'popularitate_niveluri'>,
  nivel: Nivel,
): number {
  const peNivel = linie.popularitate_niveluri?.[nivel]
  return Number(peNivel ?? linie.popularity_pct)
}

/**
 * Capitolele în ordinea în care le vei întâlni: întâi cele la care adversarul
 * te duce cel mai des, la nivelul tău.
 *
 * Se ordonează după mutarea adversarului (`grup`), nu după capitol: Giuoco
 * Piano, Pianissimo şi Gambitul Evans răspund toate la 3…Nc5 şi stau împreună,
 * între ele în ordinea de învăţare (`order_index`). Un curs fără cifre pe
 * niveluri îşi păstrează ordinea de acum. Ordinea e stabilă, deci aplicată de
 * două ori dă acelaşi rezultat.
 */
export function ordoneazaPeNivel<T extends Pick<OpeningLine, 'order_index' | 'grup' | 'popularitate_niveluri'>>(
  linii: T[],
  nivel: Nivel,
): T[] {
  if (!linii.some(l => l.popularitate_niveluri)) return linii
  const cheie = (l: T) => l.grup ?? `#${l.order_index}`
  const procentGrup = new Map<string, number>()
  const primulInGrup = new Map<string, number>()
  for (const l of linii) {
    const k = cheie(l)
    const p = Number(l.popularitate_niveluri?.[nivel] ?? -1)
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
  linie: Pick<OpeningLine, 'popularity_pct' | 'tip' | 'grup' | 'popularitate_niveluri'>,
  nivel: Nivel = 'intermediar',
): string {
  const p = procentPeNivel(linie, nivel)
  if (linie.tip === 'practica') {
    return p < 1 ? 'sub 1% din partidele de la nivelul tău' : `${Math.round(p)}% din partidele de la nivelul tău`
  }
  const eticheta = linie.grup && linie.popularitate_niveluri
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

/** Capitolele unui curs de deschideri. */
export function capitoleDeDeschidere(
  slug: string,
  linii: OpeningLine[],
  parcurse: string[],
  date: DateDeCurs | undefined,
  nivel: Nivel = 'intermediar',
): Capitol[] {
  const capitole: Capitol[] = ordoneazaPeNivel(linii, nivel).map(linie => {
    // Paşii capitolului (cerut pe 2026-11-25, ca la Chessly): variantele 1–2,
    // apoi 3–4 (sau doar 3). Jocul de mijloc nu mai e un pas separat.
    const nrVariante = 1 + (linie.variante?.length ?? 0)
    const despre = (de: number, pana: number) => pana > de ? `variantele ${de}–${pana}` : `varianta ${de}`
    const teorieGata = parcurse.includes(linie.id)

    return {
      id: linie.id,
      titlu: linie.variation_name,
      subtitlu: subtitluCapitol(linie, nivel),
      terminat: teorieGata,
      grupa: linie.tip === 'practica' ? 'practica' : 'teorie',
      noduri: [
        {
          id: `${linie.id}-teorie`,
          kind: 'lectie',
          title: `Studiu: ${despre(1, Math.min(2, nrVariante))}`,
          href: `/courses/${slug}/guided/${linie.id}`,
          done: teorieGata,
        },
        {
          id: `${linie.id}-exersare`,
          kind: 'exercitiu',
          title: `Exersare: ${despre(1, Math.min(2, nrVariante))}`,
          href: `/courses/${slug}/practice/${linie.id}`,
        },
        // Adresele pasului al doilea au rămas cele vechi ale jocului de mijloc.
        ...(nrVariante > 2 ? [
          {
            id: `${linie.id}-mijloc`,
            kind: 'lectie' as const,
            title: `Studiu: ${despre(3, Math.min(4, nrVariante))}`,
            href: `/courses/${slug}/middlegame/${linie.id}`,
          },
          {
            id: `${linie.id}-mijloc-singur`,
            kind: 'exercitiu' as const,
            title: `Exersare: ${despre(3, Math.min(4, nrVariante))}`,
            href: `/courses/${slug}/middlegame-practice/${linie.id}`,
          },
        ] : []),
        {
          // Fără `href`: nodul există în traseu fiindcă face parte din el, dar
          // întrebările încă nu sunt construite. Mai bine un pas care spune „în
          // curând" decât un traseu care se termină brusc.
          id: `${linie.id}-test`,
          kind: 'test',
          title: 'Verificare de capitol',
        },
      ],
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
        {
          id: `${c.id}-lectie`,
          kind: 'lectie' as const,
          title: `${c.title} — pas cu pas`,
          href: `/courses/${slug}/trap/${c.id}`,
          done: parcurse.includes(c.id),
        },
        // Fără punct de armare n-am de unde porni exerciţiul, deci nodul lipseşte.
        ...(c.spring_ply != null ? [{
          id: `${c.id}-exercitiu`,
          kind: 'exercitiu' as const,
          title: `${c.title} — pe cont propriu`,
          href: `/courses/${slug}/trap-practice/${c.id}`,
        }] : []),
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
  if (capitole.length === 0) return -1
  const i = capitole.findIndex(c => !c.terminat)
  return i === -1 ? capitole.length - 1 : i
}
