import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, CheckCircle2, Lock, Target } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useSubscription } from '@/hooks/useSubscription'
import { useAuth } from '@/hooks/useAuth'
import { TACTIC_CATEGORIES } from '@/data/tactics'
import { TACTIC_TIERS, pickPath } from '@/lib/tactics-path'
import { PuzzleModal } from '@/components/chess/PuzzleModal'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { Spinner } from '@/components/ui/Spinner'
import type { Puzzle } from '@/types'

export function TacticsCategoryPage() {
  const { categoryId, tier: tierId } = useParams<{ categoryId: string; tier: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isPro } = useSubscription()
  const { user } = useAuth()

  // Indexul nodului deschis în modal (null = închis)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const category = TACTIC_CATEGORIES.find(c => c.id === categoryId)
  const tier = TACTIC_TIERS.find(t => t.id === tierId)
  const locked = !!category?.isPro && !isPro

  // Traseul fix: puzzle-urile categoriei din intervalul nivelului, sortate după id → primele 12.
  const { data: nodes, isLoading } = useQuery({
    queryKey: ['tactic-path', categoryId, tierId],
    queryFn: async () => {
      if (!category || !tier || locked) return [] as Puzzle[]
      const { data } = await supabase
        .from('puzzles')
        .select('id, fen, rating, themes, moves, game_url, title')
        .overlaps('themes', category.lichessThemes)
        .gte('rating', tier.floor)
        .lt('rating', tier.ceil)
      return pickPath((data ?? []) as Puzzle[], category, tier)
    },
    enabled: !!category && !!tier && !locked,
  })

  const nodeList = nodes ?? []
  const nodeIds = nodeList.map(n => n.id)

  // Care noduri sunt rezolvate (verzi)
  const { data: solvedSet } = useQuery({
    queryKey: ['tactic-path-solved', user?.id, categoryId, tierId, nodeIds.join(',')],
    queryFn: async () => {
      if (!user || nodeIds.length === 0) return new Set<string>()
      const { data } = await supabase
        .from('user_puzzle_attempts')
        .select('puzzle_id')
        .eq('user_id', user.id)
        .eq('solved', true)
        .in('puzzle_id', nodeIds)
      return new Set((data ?? []).map((r: { puzzle_id: string }) => r.puzzle_id))
    },
    enabled: !!user && nodeIds.length > 0,
  })

  const solved = solvedSet ?? new Set<string>()
  const doneCount = nodeList.filter(n => solved.has(n.id)).length
  const total = nodeList.length
  const pct = total ? Math.round((doneCount / total) * 100) : 0
  // Primul nod nerezolvat = „ești aici"; dacă toate sunt gata → -1
  const firstUnsolved = nodeList.findIndex(n => !solved.has(n.id))
  const resumeIndex = firstUnsolved === -1 ? 0 : firstUnsolved

  function refreshSolved() {
    void queryClient.invalidateQueries({ queryKey: ['tactic-path-solved'] })
    void queryClient.invalidateQueries({ queryKey: ['tactics-solved'] })
  }

  // Categorie inexistentă
  if (!category || !tier) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-[#6B6B6B]">Traseul nu a fost găsit.</p>
        <Button variant="secondary" size="sm" onClick={() => navigate('/tactics')}>
          ← Înapoi la Cufărul cu tactici
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <button
        onClick={() => navigate('/tactics')}
        className="flex items-center gap-1.5 text-sm text-[#A0A0A0] hover:text-[#F0F0F0] transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Cufărul cu tactici
      </button>

      {/* Header */}
      <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] p-6">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold text-[#E2B340] bg-[rgba(226,179,64,0.12)] rounded-full px-2.5 py-1">
                {tier.label} · ELO {tier.floor}–{tier.ceil}
              </span>
              {category.isPro && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#E2B340]/15 text-[#E2B340] border border-[#E2B340]/30 rounded px-1.5 py-0.5">
                  Pro
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-[#F0F0F0]">{category.title}</h1>
            <p className="text-[#A0A0A0] text-sm mt-1.5 leading-relaxed border-l-2 border-[#E2B340] pl-3">
              {category.description}
            </p>
          </div>
        </div>

        {!locked && total > 0 && (
          <>
            <div className="flex justify-between text-xs text-[#6B6B6B] mt-4 mb-1.5">
              <span>Progres</span>
              <span className={pct === 100 ? 'text-[#4ade80]' : 'text-[#E2B340]'}>
                {doneCount}/{total} {pct === 100 ? '· ✓ Complet' : `· ${pct}%`}
              </span>
            </div>
            <Progress value={pct} barClassName={pct === 100 ? 'bg-[#4ade80]' : 'bg-[#E2B340]'} />

            <Button size="lg" className="w-full mt-4" onClick={() => setActiveIndex(resumeIndex)}>
              {doneCount === 0 ? 'Începe traseul' : pct === 100 ? 'Reia de la început' : 'Continuă de unde ai rămas'}
            </Button>
          </>
        )}
      </div>

      {/* Corp */}
      {locked ? (
        <div className="rounded-xl bg-[rgba(226,179,64,0.08)] border border-[rgba(226,179,64,0.3)] p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-[#E2B340]/15 p-4">
              <Lock className="h-8 w-8 text-[#E2B340]" />
            </div>
          </div>
          <p className="text-[#E2B340] font-semibold text-lg">Conținut exclusiv Pro</p>
          <p className="text-[#6B6B6B] text-sm mt-2 max-w-sm mx-auto">
            Această categorie include exerciții avansate disponibile doar cu abonament Pro.
          </p>
          <a href="/pricing" className="mt-4 inline-block">
            <Button size="sm">Upgrade la Pro</Button>
          </a>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-7 w-7" />
        </div>
      ) : total === 0 ? (
        <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] p-8 text-center">
          <p className="text-[#6B6B6B]">Nu există exerciții pentru această tactică la acest nivel momentan.</p>
          <p className="text-[#6B6B6B] text-xs mt-2">Baza de date va fi populată în curând.</p>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-semibold text-[#F0F0F0] mb-1">Traseul de exerciții</h2>
          <p className="text-xs text-[#6B6B6B] mb-4">{doneCount} din {total} rezolvate</p>

          <div className="max-w-md mx-auto">
            {nodeList.map((node, i) => {
              const done = solved.has(node.id)
              const current = !done && i === firstUnsolved
              return (
                <div key={node.id}>
                  <button
                    onClick={() => setActiveIndex(i)}
                    className={`w-full flex items-center gap-3 rounded-2xl border bg-[#141414] p-3 text-left transition-all hover:-translate-y-0.5 ${
                      current
                        ? 'border-[rgba(226,179,64,0.55)] shadow-[0_0_18px_rgba(226,179,64,0.15)]'
                        : done
                        ? 'border-[rgba(74,222,128,0.35)]'
                        : 'border-[#2A2A2A] hover:border-[#3A3A3A]'
                    }`}
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl shrink-0 font-display font-bold ${
                      done
                        ? 'bg-[#4ade80] text-black'
                        : current
                        ? 'bg-[#E2B340] text-black'
                        : 'bg-[#1C1C1C] text-[#6B6B6B]'
                    }`}>
                      {done ? <CheckCircle2 className="h-6 w-6" /> : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-display font-semibold text-sm ${done ? 'text-[#A0A0A0]' : 'text-[#F0F0F0]'}`}>
                        {node.title ? node.title : `Exercițiul ${i + 1}`}
                      </p>
                      <p className={`text-xs ${current ? 'text-[#E2B340] font-semibold' : done ? 'text-[#4ade80]' : 'text-[#6B6B6B]'}`}>
                        {current ? 'Ești aici' : done ? 'Rezolvat' : `ELO ${node.rating}`}
                      </p>
                    </div>
                    {done
                      ? <CheckCircle2 className="h-4 w-4 text-[#4ade80] shrink-0" />
                      : <ChevronRight className="h-4 w-4 text-[#6B6B6B] shrink-0" />}
                  </button>

                  {/* Linie șerpuită între noduri */}
                  {i < nodeList.length - 1 && (
                    <svg width="240" height="38" viewBox="0 0 240 38" fill="none" className="mx-auto block">
                      <path
                        d={i % 2 === 0 ? 'M120 2 C120 15, 66 24, 120 36' : 'M120 2 C120 15, 174 24, 120 36'}
                        stroke="rgba(226,179,64,0.4)" strokeWidth="2.5" strokeDasharray="2 8" strokeLinecap="round"
                      />
                    </svg>
                  )}
                </div>
              )
            })}
          </div>

          {/* Legendă mică */}
          <div className="flex items-center justify-center gap-4 text-xs text-[#6B6B6B] mt-6">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-[#4ade80]" /> Rezolvat</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-[#E2B340]" /> Ești aici</span>
            <span className="flex items-center gap-1.5"><Target className="h-3.5 w-3.5" /> De rezolvat</span>
          </div>
        </div>
      )}

      {activeIndex !== null && nodeList[activeIndex] && (
        <PuzzleModal
          key={activeIndex}
          theme={nodeList[activeIndex].themes[0] ?? category.lichessThemes[0]}
          initialPuzzle={nodeList[activeIndex]}
          onSolved={refreshSolved}
          onNext={() => {
            const next = activeIndex + 1
            if (next < nodeList.length) setActiveIndex(next)
            else setActiveIndex(null)
          }}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </div>
  )
}
