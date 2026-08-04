import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Target, ChevronDown, Crosshair } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { OpeningBoard } from '@/components/events/OpeningBoard'

/** O variantă a cursului, cu planul ei de joc de mijloc. */
interface VariationPlan {
  line_id: string
  variation_name: string
  variation_code: string
  popularity_pct: number
  moves_uci: string
  structure: string | null
  ideas: { title: string; detail: string }[]
  avoid: string | null
}

interface Trap {
  title: string
  /** 'ours' = cade cel care joacă deschiderea; 'theirs' = cade adversarul. */
  victim: 'ours' | 'theirs'
  moves_uci: string
  explanation: string
}

interface CourseMiddlegame {
  variations: VariationPlan[]
  traps: Trap[]
}

/**
 * Jocul de mijloc al unui curs de deschidere.
 *
 * Un curs de deschidere te lasă la mutarea 10–15 cu o poziţie corectă şi niciun
 * plan. Aici fiecare variantă îşi primeşte coloana ei: structura care rezultă,
 * ideile de urmat şi greşeala tipică. Coloane, nu o listă, fiindcă variantele
 * duc la structuri diferite şi trebuie văzute una lângă alta.
 */
export function MiddlegameSection({ slug }: { slug: string }) {
  const { data } = useQuery({
    queryKey: ['course-middlegame', slug],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('course_middlegame', { p_slug: slug })
      if (error) throw error
      return data as CourseMiddlegame | null
    },
    staleTime: 10 * 60_000,
  })

  // Cursurile fără plan scris încă nu arată o secţiune goală.
  const withPlan = (data?.variations ?? []).filter(v => v.structure)
  if (withPlan.length === 0 && (data?.traps.length ?? 0) === 0) return null

  return (
    <div className="space-y-8">
      {withPlan.length > 0 && (
        <section>
          <div className="mb-1 flex items-center gap-2">
            <Target className="h-4 w-4 text-[#2DD4BF]" />
            <h2 className="font-display text-lg font-bold text-[#F0F0F0]">Jocul de mijloc</h2>
          </div>
          <p className="mb-4 text-sm text-[#6B6B6B]">
            Ce faci după ce se termină teoria. Fiecare variantă duce la altă structură,
            deci la alt plan.
          </p>

          <div className="grid gap-4 lg:grid-cols-3">
            {withPlan.map(v => <PlanColumn key={v.line_id} plan={v} />)}
          </div>
        </section>
      )}

      {(data?.traps.length ?? 0) > 0 && (
        <TrapsSection traps={data!.traps} />
      )}
    </div>
  )
}

function PlanColumn({ plan }: { plan: VariationPlan }) {
  return (
    <Card className="flex flex-col p-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h3 className="font-display font-bold leading-tight text-[#F0F0F0]">
          {plan.variation_name}
        </h3>
        <span className="flex-shrink-0 text-xs tabular-nums text-[#6B6B6B]">
          {plan.popularity_pct}%
        </span>
      </div>

      {plan.structure && (
        <p className="mb-4 border-l-2 border-[#2DD4BF] pl-3 text-sm leading-relaxed text-[#A0A0A0]">
          {plan.structure}
        </p>
      )}

      <ol className="flex-1 space-y-3">
        {plan.ideas.map((idea, i) => (
          <li key={i} className="flex gap-2.5">
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(45,212,191,0.15)] text-[11px] font-bold text-[#2DD4BF]">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#F0F0F0]">{idea.title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-[#6B6B6B]">{idea.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      {plan.avoid && (
        <div className="mt-4 flex gap-2.5 rounded-lg border border-[rgba(251,113,133,0.25)] bg-[rgba(251,113,133,0.06)] p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#FB7185]" />
          <p className="text-sm leading-relaxed text-[#A0A0A0]">{plan.avoid}</p>
        </div>
      )}
    </Card>
  )
}

/**
 * Capcanele deschiderii — în amândouă sensurile.
 *
 * Una în care poţi cădea tu şi una în care poate cădea adversarul sunt lucruri
 * diferite şi se învaţă diferit, de aceea sunt marcate distinct.
 */
function TrapsSection({ traps }: { traps: Trap[] }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section>
      <div className="mb-1 flex items-center gap-2">
        <Crosshair className="h-4 w-4 text-[#E2B340]" />
        <h2 className="font-display text-lg font-bold text-[#F0F0F0]">Capcane uzuale</h2>
      </div>
      <p className="mb-4 text-sm text-[#6B6B6B]">
        În care poți cădea tu, și în care poate cădea adversarul dacă joci precis.
      </p>

      <div className="space-y-2.5">
        {traps.map((trap, i) => {
          const isOpen = open === i
          const mine = trap.victim === 'ours'

          return (
            <Card key={i} className="overflow-hidden p-0">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <span
                  className={[
                    'flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider',
                    mine
                      ? 'bg-[rgba(251,113,133,0.15)] text-[#FB7185]'
                      : 'bg-[rgba(74,222,128,0.15)] text-[#4ade80]',
                  ].join(' ')}
                >
                  {mine ? 'Ai grijă' : 'Urmărește'}
                </span>

                <span className="min-w-0 flex-1 font-semibold text-[#F0F0F0]">
                  {trap.title}
                </span>

                <ChevronDown
                  className={`h-4 w-4 flex-shrink-0 text-[#6B6B6B] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isOpen && (
                <div className="space-y-4 border-t border-[#2A2A2A] p-4">
                  <OpeningBoard moves={trap.moves_uci} />
                  <p className="text-sm leading-relaxed text-[#A0A0A0]">
                    {trap.explanation}
                  </p>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </section>
  )
}
