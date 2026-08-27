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
import type { Lesson, OpeningLine } from '@/types'

export interface Capitol {
  /** Id-ul variantei, `capcane`, sau `lectii` la cursurile fundamentale. */
  id: string
  titlu: string
  subtitlu: string
  noduri: PathNode[]
  terminat: boolean
}

/** Ce ştie baza despre planurile şi capcanele unui curs (RPC `course_middlegame`). */
export interface DateDeCurs {
  /** Variantele care chiar au un plan de joc de mijloc scris. */
  cuPlan: Set<string>
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
): Capitol[] {
  const capitole: Capitol[] = linii.map(linie => {
    const arePlan = date?.cuPlan.has(linie.id) ?? false
    const teorieGata = parcurse.includes(linie.id)

    return {
      id: linie.id,
      titlu: linie.variation_name,
      subtitlu: `${linie.popularity_pct}% popularitate`,
      terminat: teorieGata,
      noduri: [
        {
          id: `${linie.id}-teorie`,
          kind: 'lectie',
          title: 'Teoria, pas cu pas',
          href: `/courses/${slug}/guided/${linie.id}`,
          done: teorieGata,
        },
        {
          id: `${linie.id}-exersare`,
          kind: 'exercitiu',
          title: 'Varianta pe cont propriu',
          href: `/courses/${slug}/practice/${linie.id}`,
        },
        ...(arePlan ? [
          {
            id: `${linie.id}-mijloc`,
            kind: 'lectie' as const,
            title: 'Planul de joc de mijloc',
            href: `/courses/${slug}/middlegame/${linie.id}`,
          },
          {
            id: `${linie.id}-mijloc-singur`,
            kind: 'exercitiu' as const,
            title: 'Jocul de mijloc, singur',
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
