import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { ChapterPath, type PathNode } from './ChapterPath'
import type { OpeningLine } from '@/types'

interface Capitol {
  lineId: string
  titlu: string
  subtitlu: string
  noduri: PathNode[]
  terminat: boolean
}

/**
 * Cuprinsul cursului: fiecare variantă e un capitol care se deschide într-un
 * traseu.
 *
 * Înainte, cele trei variante erau trei casete una sub alta şi atât. Arătau ca
 * un cuprins, nu ca un drum — iar drumul e tot rostul: fiecare variantă are în
 * spate teorie, joc de mijloc şi o verificare, adică patru-cinci paşi pe care
 * omul îi face în ordine. Aşezate în traseu, se vede cât ai făcut şi cât mai e.
 */
export function CourseChapters({
  slug, lines, completedIds,
}: {
  slug: string
  lines: OpeningLine[]
  /** Variantele deja parcurse, din progresul utilizatorului. */
  completedIds: string[]
}) {
  // Ce variante au plan de joc de mijloc. Fără asta, am pune pe traseu paşi
  // care duc într-o pagină goală.
  const { data: cuPlan } = useQuery({
    queryKey: ['middlegame-lines', slug],
    queryFn: async () => {
      const { data } = await supabase.rpc('course_middlegame', { p_slug: slug })
      return new Set((data?.variations ?? []).filter(v => v.structure).map(v => v.line_id))
    },
  })

  const capitole: Capitol[] = lines.map(line => {
    const arePlan = cuPlan?.has(line.id) ?? false
    const teorieGata = completedIds.includes(line.id)

    const noduri: PathNode[] = [
      {
        id: `${line.id}-teorie`,
        kind: 'lectie',
        title: 'Teoria, pas cu pas',
        href: `/courses/${slug}/guided/${line.id}`,
        done: teorieGata,
      },
      {
        id: `${line.id}-exersare`,
        kind: 'exercitiu',
        title: 'Varianta pe cont propriu',
        href: `/courses/${slug}/practice/${line.id}`,
      },
      ...(arePlan ? [
        {
          id: `${line.id}-mijloc`,
          kind: 'lectie' as const,
          title: 'Planul de joc de mijloc',
          href: `/courses/${slug}/middlegame/${line.id}`,
        },
        {
          id: `${line.id}-mijloc-singur`,
          kind: 'exercitiu' as const,
          title: 'Jocul de mijloc, singur',
          href: `/courses/${slug}/middlegame-practice/${line.id}`,
        },
      ] : []),
      {
        // Fără `href`: nodul există în traseu fiindcă face parte din el, dar
        // întrebările încă nu sunt construite. Mai bine un pas care spune „în
        // curând" decât un traseu care se termină brusc.
        id: `${line.id}-test`,
        kind: 'test',
        title: 'Verificare de capitol',
      },
    ]

    return {
      lineId: line.id,
      titlu: line.variation_name,
      subtitlu: `${line.popularity_pct}% popularitate`,
      noduri,
      terminat: teorieGata,
    }
  })

  // Se deschide capitolul la care ai rămas. Calculat o singură dată, la montare:
  // dacă s-ar recalcula, ţi-ar închide sub degete capitolul deschis manual.
  const [deschis, setDeschis] = useState<string | null>(
    () => capitole.find(c => !c.terminat)?.lineId ?? capitole[0]?.lineId ?? null,
  )

  if (capitole.length === 0) return null

  return (
    <div className="space-y-3">
      {capitole.map((cap, i) => {
        const esteDeschis = deschis === cap.lineId
        return (
          <div
            key={cap.lineId}
            className="overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#141414]"
          >
            <button
              onClick={() => setDeschis(esteDeschis ? null : cap.lineId)}
              aria-expanded={esteDeschis}
              className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[#1A1A1A]"
            >
              <span className="flex-shrink-0 rounded-md bg-[#2A2A2A] px-2 py-1 text-xs font-bold uppercase tracking-wider text-[#A0A0A0]">
                Capitolul {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display font-semibold text-[#F0F0F0]">
                  {cap.titlu}
                </span>
                <span className="block text-xs text-[#6B6B6B]">{cap.subtitlu}</span>
              </span>
              {cap.terminat && <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-[#4ade80]" />}
              <ChevronDown
                className={cn(
                  'h-5 w-5 flex-shrink-0 text-[#6B6B6B] transition-transform',
                  esteDeschis && 'rotate-180',
                )}
              />
            </button>

            {esteDeschis && (
              <div className="border-t border-[#2A2A2A] bg-[#0F0F0F]">
                <ChapterPath nodes={cap.noduri} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
