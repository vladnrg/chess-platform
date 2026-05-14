import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, RefreshCw, BookOpen, Target } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Card, CardContent } from '@/components/ui/Card'

// ECO prefix → course slug mapping
const ECO_TO_COURSE: Record<string, string> = {
  A: 'london-system',          // A00-A39 various, A40+ Queen's
  B: 'sicilian-defense',       // B00-B99 Sicilian + others
  C: 'italian-game',           // C00-C99 French, Ruy Lopez, Italian
  D: 'queens-gambit',          // D00-D99 Queen's Gambit, Slav
  E: 'nimzo-indian-defense',   // E00-E99 Indian defenses
}

// ECO prefix → puzzle theme hint
const ECO_TO_THEME: Record<string, string> = {
  A: 'pin',
  B: 'fork',
  C: 'discoveredAttack',
  D: 'skewer',
  E: 'sacrifice',
}

interface OpeningStat {
  id: string
  eco: string
  opening_name: string
  color: 'white' | 'black'
  wins: number
  draws: number
  losses: number
  last_imported_at: string
}

function scorePercent(stat: OpeningStat) {
  const total = stat.wins + stat.draws + stat.losses
  if (total === 0) return 0
  return Math.round(((stat.wins + stat.draws * 0.5) / total) * 100)
}

function ScoreDots({ score }: { score: number }) {
  const filled = Math.round(score / 20)
  return (
    <span className="flex gap-0.5">
      {[0, 1, 2, 3, 4].map(i => (
        <span
          key={i}
          className={`inline-block h-2 w-2 rounded-full ${
            i < filled
              ? score >= 60 ? 'bg-[#4ade80]' : score >= 45 ? 'bg-[#c8a84b]' : 'bg-[#f87171]'
              : 'bg-[#2a2a2a]'
          }`}
        />
      ))}
    </span>
  )
}

export function RepertoirePage() {
  const { user, profile, fetchProfile } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [lichessInput, setLichessInput] = useState((profile as any)?.lichess_username ?? '')
  const [colorFilter, setColorFilter] = useState<'white' | 'black' | 'all'>('all')

  const { data: stats, isLoading } = useQuery({
    queryKey: ['opening-stats', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data } = await supabase
        .from('user_opening_stats')
        .select('*')
        .eq('user_id', user.id)
        .order('wins', { ascending: false })
      return (data ?? []) as OpeningStat[]
    },
    enabled: !!user,
  })

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!user || !lichessInput.trim()) return
      const { data, error } = await supabase.functions.invoke('import-lichess-games', {
        body: { lichessUsername: lichessInput.trim(), userId: user.id },
      })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      return data as { gamesProcessed: number; openingsFound: number }
    },
    onSuccess: (data) => {
      toast.success(`Import complet: ${data?.gamesProcessed} partide, ${data?.openingsFound} deschideri`)
      void qc.invalidateQueries({ queryKey: ['opening-stats', user?.id] })
      if (user) void fetchProfile(user.id)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const filtered = (stats ?? []).filter(s => colorFilter === 'all' || s.color === colorFilter)
  const total = filtered.reduce((acc, s) => acc + s.wins + s.draws + s.losses, 0)
  const weak = filtered.filter(s => scorePercent(s) < 45 && (s.wins + s.draws + s.losses) >= 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#f0f0f0]">Arhivă</h1>
        <p className="text-[#666] text-sm mt-1 max-w-xl">
          Conectează-ți contul Lichess pentru a vedea cum performezi cu fiecare deschidere și ce trebuie să antrenezi.
        </p>
      </div>

      {/* Import panel */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <h2 className="font-semibold text-[#f0f0f0] text-sm">Conectează cont Lichess</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={lichessInput}
              onChange={e => setLichessInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') importMutation.mutate() }}
              placeholder="Username Lichess..."
              className="flex-1 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-2 text-sm text-[#f0f0f0] placeholder:text-[#444] focus:outline-none focus:border-[#c8a84b]"
            />
            <Button
              size="sm"
              onClick={() => importMutation.mutate()}
              disabled={importMutation.isPending || !lichessInput.trim()}
            >
              {importMutation.isPending ? (
                <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Importez...</>
              ) : (
                <><RefreshCw className="h-3.5 w-3.5" /> Importă 200 partide</>
              )}
            </Button>
          </div>
          {stats && stats.length > 0 && (
            <p className="text-xs text-[#555]">
              {total} partide analizate · {filtered.length} deschideri
              {(stats[0] as any)?.last_imported_at &&
                ` · Ultima import: ${new Date(stats[0].last_imported_at).toLocaleDateString('ro-RO')}`}
            </p>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
      ) : !stats || stats.length === 0 ? (
        <div className="rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] p-8 text-center">
          <Target className="h-10 w-10 text-[#333] mx-auto mb-3" />
          <p className="text-[#666]">Nicio dată importată încă.</p>
          <p className="text-[#444] text-sm mt-1">Introdu username-ul Lichess și apasă "Importă".</p>
        </div>
      ) : (
        <>
          {/* Weak openings alert */}
          {weak.length > 0 && (
            <div className="rounded-xl bg-[rgba(248,113,113,0.07)] border border-[rgba(248,113,113,0.25)] p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[#f87171]" />
                <p className="text-sm font-semibold text-[#f87171]">Puncte slabe identificate</p>
              </div>
              {weak.slice(0, 3).map(s => {
                const total = s.wins + s.draws + s.losses
                const ecoPrefix = s.eco[0]
                const courseSlug = ECO_TO_COURSE[ecoPrefix]
                const puzzleTheme = ECO_TO_THEME[ecoPrefix]
                return (
                  <div key={s.id} className="flex items-start justify-between gap-3 bg-[#111] rounded-lg p-3">
                    <div>
                      <p className="text-sm font-medium text-[#f0f0f0]">{s.opening_name}</p>
                      <p className="text-xs text-[#666] mt-0.5">
                        Cu {s.color === 'white' ? 'Albul' : 'Negrul'} · {scorePercent(s)}% scor · {total} partide
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {courseSlug && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/courses/${courseSlug}`)}
                        >
                          <BookOpen className="h-3 w-3" /> Curs
                        </Button>
                      )}
                      {puzzleTheme && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/puzzles?theme=${puzzleTheme}`)}
                        >
                          <Target className="h-3 w-3" /> Tactici
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Filter tabs */}
          <div className="flex gap-2">
            {(['all', 'white', 'black'] as const).map(f => (
              <button
                key={f}
                onClick={() => setColorFilter(f)}
                className={[
                  'rounded-full px-3 py-1 text-xs font-medium border transition-colors',
                  colorFilter === f
                    ? 'bg-[#c8a84b] text-black border-[#c8a84b]'
                    : 'bg-transparent text-[#666] border-[#2a2a2a] hover:border-[#3a3a3a] hover:text-[#a0a0a0]',
                ].join(' ')}
              >
                {f === 'all' ? 'Toate' : f === 'white' ? 'Cu Albul' : 'Cu Negrul'}
              </button>
            ))}
          </div>

          {/* Opening table */}
          <div className="rounded-xl border border-[#2a2a2a] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a2a] bg-[#1a1a1a]">
                  <th className="text-left px-4 py-3 text-xs text-[#666] font-medium">Deschidere</th>
                  <th className="text-center px-3 py-3 text-xs text-[#666] font-medium">Culoare</th>
                  <th className="text-center px-3 py-3 text-xs text-[#666] font-medium">Partide</th>
                  <th className="text-center px-3 py-3 text-xs text-[#666] font-medium hidden sm:table-cell">V / R / P</th>
                  <th className="text-center px-3 py-3 text-xs text-[#666] font-medium">Scor</th>
                </tr>
              </thead>
              <tbody>
                {filtered.sort((a, b) => (b.wins + b.draws + b.losses) - (a.wins + a.draws + a.losses)).map((s, i) => {
                  const tot = s.wins + s.draws + s.losses
                  const score = scorePercent(s)
                  const isWeak = score < 45 && tot >= 5
                  return (
                    <tr
                      key={s.id}
                      className={[
                        'border-b border-[#1a1a1a] transition-colors',
                        i % 2 === 0 ? 'bg-[#111]' : 'bg-[#131313]',
                        isWeak ? 'border-l-2 border-l-[#f87171]' : '',
                      ].join(' ')}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isWeak && <AlertTriangle className="h-3 w-3 text-[#f87171] flex-shrink-0" />}
                          <div>
                            <p className="text-[#f0f0f0] font-medium truncate max-w-[200px]">{s.opening_name}</p>
                            <p className="text-[#555] text-xs">{s.eco}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${s.color === 'white' ? 'bg-[#f0f0f0]/10 text-[#f0f0f0]' : 'bg-[#1a1a1a] border border-[#333] text-[#a0a0a0]'}`}>
                          {s.color === 'white' ? '♔' : '♚'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center text-[#a0a0a0]">{tot}</td>
                      <td className="px-3 py-3 text-center text-[#666] text-xs hidden sm:table-cell">
                        <span className="text-[#4ade80]">{s.wins}</span>
                        {' / '}
                        <span className="text-[#a0a0a0]">{s.draws}</span>
                        {' / '}
                        <span className="text-[#f87171]">{s.losses}</span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <ScoreDots score={score} />
                          <span className={`text-xs font-semibold ${score >= 60 ? 'text-[#4ade80]' : score >= 45 ? 'text-[#c8a84b]' : 'text-[#f87171]'}`}>
                            {score}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
