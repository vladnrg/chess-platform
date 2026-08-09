import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, Crosshair } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { OpeningBoard } from '@/components/events/OpeningBoard'

interface Trap {
  title: string
  /** 'ours' = cade cel care joacă deschiderea; 'theirs' = cade adversarul. */
  victim: 'ours' | 'theirs'
  moves_uci: string
  explanation: string
}

/**
 * Capcanele deschiderii — în amândouă sensurile.
 *
 * Una în care poţi cădea tu şi una în care poate cădea adversarul sunt lucruri
 * diferite şi se învaţă diferit, de aceea sunt marcate distinct.
 *
 * Aici a stat şi jocul de mijloc, ca tabel cu trei coloane. A plecat: planul
 * fiecărei variante e acum în lecţia ei, lângă tablă, unde chiar îl citeşti.
 * Capcanele rămân pe pagina cursului fiindcă sunt ale deschiderii ca întreg —
 * n-au o variantă a lor în care să se mute.
 */
export function OpeningTraps({ slug }: { slug: string }) {
  const { data } = useQuery({
    queryKey: ['course-traps', slug],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('course_middlegame', { p_slug: slug })
      if (error) throw error
      return (data?.traps ?? []) as Trap[]
    },
    staleTime: 10 * 60_000,
  })

  const [open, setOpen] = useState<number | null>(0)

  // Cursurile fără capcane scrise încă nu arată o secţiune goală.
  if (!data?.length) return null

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
        {data.map((trap, i) => {
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
