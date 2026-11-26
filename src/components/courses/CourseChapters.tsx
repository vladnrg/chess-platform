import { Fragment, useState } from 'react'
import { ChevronDown, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChapterPath } from './ChapterPath'
import { StudiiCapitol } from './StudiiCapitol'
import { capitoleDeDeschidere, capitolulCurent, etichetaTraseu, incadrareDin, type Capitol } from '@/lib/capitole-curs'
import { useDateDeCurs } from '@/hooks/useDateDeCurs'
import { useAuth } from '@/hooks/useAuth'
import type { OpeningLine } from '@/types'

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
  slug, lines, completedIds, noduriParcurse,
}: {
  slug: string
  lines: OpeningLine[]
  /** Variantele deja parcurse, din progresul utilizatorului. */
  completedIds: string[]
  /** Paşii terminaţi şi când (migrarea 139). */
  noduriParcurse?: Record<string, string> | null
}) {
  // Ce variante au plan de joc de mijloc şi capcanele deschiderii.
  // Fără asta, am pune pe traseu paşi care duc într-o pagină goală.
  const { data: dinCurs } = useDateDeCurs(slug)
  const { profile } = useAuth()

  // Ordinea capitolelor depinde de nivelul tău (din testul de plasament).
  const capitole = capitoleDeDeschidere(slug, lines, completedIds, dinCurs, incadrareDin(profile), noduriParcurse ?? {})
  const eticheta = etichetaTraseu(capitole)

  // Capitolele se ţin deschise câte vrei, nu unul singur. Cine compară două
  // variante — şi asta face oricine îşi alege un repertoriu — vrea traseele
  // una sub alta, nu să închidă una ca s-o vadă pe cealaltă.
  //
  // La montare se deschide capitolul la care ai rămas. Calculat o singură dată:
  // dacă s-ar recalcula, ţi-ar închide sub degete ce ai deschis manual.
  const [deschise, setDeschise] = useState<Set<string>>(() => {
    const primul = capitole[capitolulCurent(capitole)]?.id
    return new Set(primul ? [primul] : [])
  })

  const comuta = (capitolId: string) => setDeschise(vechi => {
    const nou = new Set(vechi)
    if (!nou.delete(capitolId)) nou.add(capitolId)
    return nou
  })

  if (capitole.length === 0) return null

  // Titlurile de grupă apar doar unde există capitole de practică: un curs care
  // are numai teorie nu câştigă nimic dintr-un titlu deasupra tuturor capitolelor.
  // Nici la cursurile ordonate pe nivel: acolo teoria şi practica se amestecă,
  // după cât de des le întâlneşti, iar titlurile s-ar repeta printre capitole.
  const cuGrupe = capitole.some(c => c.grupa === 'practica') && !lines.some(l => l.popularitate_niveluri)

  return (
    <div className="space-y-3">
      {capitole.map((cap, i) => {
        const esteDeschis = deschise.has(cap.id)
        const grupaNoua = cuGrupe && cap.grupa && cap.grupa !== capitole[i - 1]?.grupa
        return (
          <Fragment key={cap.id}>
          {grupaNoua && cap.grupa && <TitluGrupa grupa={cap.grupa} prima={i === 0} />}
          <div
            className="overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#141414]"
          >
            <button
              onClick={() => comuta(cap.id)}
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
                {cap.studii && cap.studii.length > 0 ? (
                  // Ca la Chessly (cerut pe 2026-11-26): fiecare studiu cu bara
                  // lui de titlu şi harta lui; capitolul creşte cu câte studii are.
                  <div className="p-3">
                    <StudiiCapitol studii={cap.studii} eticheta={eticheta} />
                  </div>
                ) : (
                  <ChapterPath nodes={cap.noduri} eticheta={eticheta} />
                )}
              </div>
            )}
          </div>
          </Fragment>
        )
      })}
    </div>
  )
}

const GRUPE: Record<NonNullable<Capitol['grupa']>, { titlu: string; text: string }> = {
  teorie: {
    titlu: 'Teoria, ca la carte',
    text: 'Liniile jucate de maeştri. Unele apar rar la nivelul tău — eticheta îţi spune care.',
  },
  practica: {
    titlu: 'Când adversarul nu joacă la carte',
    text: 'Ce joacă de fapt adversarii de la nivelul tău şi cum profiţi de greşelile lor.',
  },
  capcane: {
    titlu: 'Capcane',
    text: 'Greşelile tipice din deschidere, ale tale şi ale adversarului.',
  },
}

function TitluGrupa({ grupa, prima }: { grupa: NonNullable<Capitol['grupa']>; prima: boolean }) {
  const { titlu, text } = GRUPE[grupa]
  return (
    <div className={cn('px-1', !prima && 'pt-4')}>
      <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[#E2B340]">{titlu}</h3>
      <p className="mt-0.5 text-xs text-[#6B6B6B]">{text}</p>
    </div>
  )
}
