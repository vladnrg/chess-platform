import { useState, useCallback, useEffect, useRef } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { CheckCircle2, XCircle, RefreshCw, X, Lightbulb, Eye, ListVideo, Target } from 'lucide-react'
import toast from 'react-hot-toast'
import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { initPuzzleState, type PuzzleState } from '@/lib/puzzle-utils'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { themeLabel, displayThemes } from '@/lib/puzzle-themes'
import type { Puzzle } from '@/types'

// Obiectivul tacticii, explicat în termeni simpli (comentariu lateral)
const TACTIC_OBJECTIVES: Record<string, string> = {
  fork: 'Atacă două piese deodată cu o singură piesă. Adversarul nu le poate salva pe amândouă — așa câștigi material.',
  pin: 'Țintuiește o piesă în fața uneia mai valoroase (sau a regelui). Cât e „legată", nu se poate mișca, deci o poți ataca în voie.',
  skewer: 'Atacă o piesă valoroasă: când se ferește, capturezi piesa mai slabă rămasă în spatele ei.',
  xRayAttack: 'Ataci „prin" o piesă — când cea din față se mută, lovești ținta din spatele ei.',
  discoveredAttack: 'Mută o piesă ca să dezvălui atacul piesei din spatele ei. Dintr-o singură mutare apar două amenințări.',
  doubleCheck: 'Dă șah cu două piese deodată. Regele e obligat să fugă — nimic altceva nu îl mai salvează.',
  attraction: 'Atrage o piesă adversă (de obicei regele) pe un câmp prost, unde devine vulnerabilă la următoarea lovitură.',
  deflection: 'Forțează o piesă adversă să-și părăsească postul de apărare. Odată plecată, ținta pe care o păzea rămâne descoperită.',
  capturingDefender: 'Elimină piesa care apără un câmp sau o piesă cheie. Fără apărător, atacul tău trece.',
  trappedPiece: 'O piesă adversă a rămas fără scăpare. Închide-i ultimele câmpuri și capturează-o.',
  mateIn1: 'Găsește mutarea care dă mat imediat — regele advers nu mai are nicio scăpare.',
  mateIn2: 'Găsește secvența forțată de mat în două mutări. Calculează fiecare șah până regele e prins.',
  mateIn3: 'Găsește secvența forțată de mat în trei mutări. Fiecare șah îl împinge spre capcană.',
  smotheredMate: 'Dă mat cu calul, când regele e sufocat de propriile piese și nu poate fugi.',
  backRankMate: 'Exploatează rândul de bază: regele e blocat de proprii pioni și matul vine pe ultima linie.',
  defensiveMove: 'Poziția pare pierdută, dar există o singură mutare care te salvează. Găsește resursa defensivă.',
  intermezzo: 'În loc să răspunzi imediat, strecoară o mutare-surpriză (un șah sau o amenințare mai mare) înainte. Schimbă tot calculul.',
  interference: 'Întrerupe legătura dintre două piese adverse, blocând linia dintre ele cu o piesă proprie.',
  sacrifice: 'Dă material intenționat ca să deschizi atacul, să atragi regele sau să forțezi matul. Calculează ce primești în schimb.',
  clearance: 'Eliberează un câmp sau o linie pentru altă piesă a ta, chiar dacă pare că pierzi tempo.',
  quietMove: 'Nu orice lovitură e un șah sau o captură. Uneori o mutare „liniștită" pregătește o amenințare imposibil de parat.',
  zugzwang: 'Pune adversarul în situația în care e obligat să mute, dar orice mutare îi înrăutățește poziția.',
  exposedKing: 'Regele advers e descoperit. Adu piese în atac și exploatează lipsa de apărare.',
  middlegame: 'Găsește combinația tactică ascunsă în această poziție de mijloc de joc.',
  endgame: 'În final fiecare tempo contează. Găsește mutarea precisă care decide partida.',
  crushing: 'Există o lovitură care îți dă un avantaj zdrobitor. Găsește-o.',
  advantage: 'Există o mutare care îți câștigă un avantaj clar. Caut-o.',
  equality: 'Poziția e dificilă — găsește mutarea care îți menține echilibrul.',
}

function getObjective(theme: string, puzzleThemes: string[]): string {
  if (TACTIC_OBJECTIVES[theme]) return TACTIC_OBJECTIVES[theme]
  const match = puzzleThemes.find(t => TACTIC_OBJECTIVES[t])
  if (match) return TACTIC_OBJECTIVES[match]
  return 'Găsește cea mai bună mutare din poziție și exploatează slăbiciunea adversarului.'
}

interface Props {
  theme: string
  onClose: () => void
}

const FREE_LIMIT = 10

export function PuzzleModal({ theme, onClose }: Props) {
  const { user, profile, fetchProfile } = useAuth()
  const { isPro } = useSubscription()

  const [puzzleState, setPuzzleState] = useState<PuzzleState | null>(null)
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null)
  const [loading, setLoading] = useState(false)
  const [todayCount, setTodayCount] = useState(0)

  // Orientare fixată la încărcare (nu se mai rotește când mută adversarul)
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white')
  // Indicii
  const [hintFrom, setHintFrom] = useState<string | null>(null)   // evidențiază piesa de mutat
  const [showMove, setShowMove] = useState(false)                 // evidențiază mutarea (from+to)
  const [revealed, setRevealed] = useState(false)                 // secvența a fost arătată
  const [seqPlaying, setSeqPlaying] = useState(false)
  const seqAbort = useRef(false)

  // Comentariu lateral (obiectivul tacticii) + bifă verde la mutare corectă
  const [showCommentary, setShowCommentary] = useState(true)
  const [flashCheck, setFlashCheck] = useState(false)

  const playerElo = profile?.estimated_elo ?? 800

  function clearHints() {
    setHintFrom(null)
    setShowMove(false)
    setRevealed(false)
    setSeqPlaying(false)
    seqAbort.current = true
  }

  // Count today's attempts
  useQuery({
    queryKey: ['today-attempts-modal', user?.id],
    queryFn: async () => {
      if (!user) return 0
      const today = new Date().toISOString().split('T')[0]
      const { count } = await supabase
        .from('user_puzzle_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('attempted_at', `${today}T00:00:00`)
      setTodayCount(count ?? 0)
      return count
    },
    enabled: !!user,
  })

  const attemptMutation = useMutation({
    mutationFn: async ({ solved, timeSeconds }: { solved: boolean; timeSeconds: number }) => {
      if (!user || !currentPuzzle) return
      await supabase.from('user_puzzle_attempts').insert({
        user_id: user.id,
        puzzle_id: currentPuzzle.id,
        solved,
        time_seconds: timeSeconds,
      })
      if (solved) {
        const xp = currentPuzzle.rating < 1000 ? 10 : currentPuzzle.rating < 1500 ? 20 : 30
        await supabase.rpc('award_xp', { p_user_id: user.id, p_amount: xp })
        await fetchProfile(user.id)
        setTodayCount(c => c + 1)
      }
    },
  })

  function loadPuzzle(puzzle: Puzzle) {
    setCurrentPuzzle(puzzle)
    clearHints()
    seqAbort.current = false
    try {
      const state = initPuzzleState(puzzle.fen, puzzle.moves)
      setPuzzleState(state)
      setPlayerColor(state.game.turn() === 'w' ? 'white' : 'black')
    } catch {
      toast.error('Eroare la încărcarea puzzle-ului.')
    }
  }

  async function fetchNextPuzzle() {
    if (!isPro && todayCount >= FREE_LIMIT) return
    setLoading(true)
    try {
      const minRating = Math.max(400, playerElo - 150)
      const maxRating = playerElo + 300
      const { data } = await supabase.from('puzzles').select('*')
        .gte('rating', minRating)
        .lte('rating', maxRating)
        .contains('themes', [theme])
        .limit(30)
      const pool = (data ?? []) as Puzzle[]

      if (pool.length === 0) {
        toast.error('Nu există puzzle-uri pentru această temă.')
        return
      }

      const p = pool[Math.floor(Math.random() * pool.length)]
      loadPuzzle(p)
    } catch (e) {
      console.error('[PuzzleModal] fetchNextPuzzle error:', e)
      toast.error('Nu am putut încărca un puzzle.')
    } finally {
      setLoading(false)
    }
  }

  // Load first puzzle on mount
  useEffect(() => {
    void fetchNextPuzzle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onPieceDrop = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ sourceSquare: source, targetSquare: target }: any): boolean => {
      if (!puzzleState || puzzleState.status !== 'playing' || puzzleState.waitingOpponent) return false
      if (!currentPuzzle) return false

      const expectedMove = puzzleState.solutionMoves[puzzleState.currentMoveIdx]
      if (!expectedMove) return false

      const myMove = source + target

      try {
        const gameCopy = new Chess(puzzleState.game.fen())
        const moved = gameCopy.move({ from: source, to: target, promotion: 'q' })
        if (!moved) return false   // mutare ilegală → snap-back curat

        const isCorrect = myMove === expectedMove.slice(0, 4)

        if (!isCorrect) {
          // Snap-back curat: NU actualizăm poziția, returnăm false (fără glitch)
          setPuzzleState(s => s ? { ...s, status: 'wrong' } : null)
          const elapsed = Math.round((Date.now() - puzzleState.startTime) / 1000)
          attemptMutation.mutate({ solved: false, timeSeconds: elapsed })
          return false
        }

        clearHints()
        // Bifă verde la fiecare mutare corectă (și intermediară, și finală)
        setFlashCheck(true)
        setTimeout(() => setFlashCheck(false), 850)
        const nextIdx = puzzleState.currentMoveIdx + 1
        const isLast = nextIdx >= puzzleState.solutionMoves.length

        if (isLast) {
          setPuzzleState(s => s ? { ...s, game: gameCopy, status: 'correct', currentMoveIdx: nextIdx } : null)
          const elapsed = Math.round((Date.now() - puzzleState.startTime) / 1000)
          toast.success('Corect!')
          attemptMutation.mutate({ solved: true, timeSeconds: elapsed })
          return true
        }

        const opponentMove = puzzleState.solutionMoves[nextIdx]
        setPuzzleState(s => s ? { ...s, game: gameCopy, currentMoveIdx: nextIdx, waitingOpponent: true } : null)

        setTimeout(() => {
          try {
            const g2 = new Chess(gameCopy.fen())
            g2.move({ from: opponentMove.slice(0, 2), to: opponentMove.slice(2, 4), promotion: opponentMove[4] ?? undefined })
            setPuzzleState(s => s ? { ...s, game: g2, currentMoveIdx: nextIdx + 1, waitingOpponent: false } : null)
          } catch { /* skip */ }
        }, 500)

        return true
      } catch {
        return false
      }
    },
    [puzzleState, currentPuzzle, attemptMutation],
  )

  // Mutarea pe care trebuie să o facă jucătorul acum (UCI)
  const expectedNext = puzzleState && puzzleState.status === 'playing'
    ? puzzleState.solutionMoves[puzzleState.currentMoveIdx]
    : undefined
  const expFrom = expectedNext?.slice(0, 2)
  const expTo = expectedNext?.slice(2, 4)

  // Tactică multi-mutare? (mai rămân cel puțin player+adversar+player)
  const isMultiMove = !!puzzleState && puzzleState.solutionMoves.length - puzzleState.currentMoveIdx >= 3

  // Redă întreaga secvență rămasă, pas cu pas
  async function showSequence() {
    if (!puzzleState) return
    seqAbort.current = false
    setSeqPlaying(true)
    setHintFrom(null)
    setShowMove(false)
    const g = new Chess(puzzleState.game.fen())
    const moves = puzzleState.solutionMoves
    for (let i = puzzleState.currentMoveIdx; i < moves.length; i++) {
      if (seqAbort.current) { setSeqPlaying(false); return }
      const m = moves[i]
      try { g.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m[4] ?? 'q' }) } catch { break }
      const fen = g.fen()
      setPuzzleState(s => s ? { ...s, game: new Chess(fen) } : null)
      await new Promise(r => setTimeout(r, 750))
    }
    setSeqPlaying(false)
    setRevealed(true)
  }

  const squareStyles: Record<string, React.CSSProperties> = {}
  if (hintFrom) squareStyles[hintFrom] = { background: 'rgba(226,179,64,0.55)', boxShadow: 'inset 0 0 0 3px #E2B340' }
  if (showMove && expFrom && expTo) {
    squareStyles[expFrom] = { background: 'rgba(226,179,64,0.45)' }
    squareStyles[expTo] = { background: 'rgba(226,179,64,0.7)' }
  }
  const boardArrows = showMove && expFrom && expTo
    ? [{ startSquare: expFrom, endSquare: expTo, color: '#E2B340' }]
    : []

  const limitReached = !isPro && todayCount >= FREE_LIMIT
  const categoryLabel = themeLabel(theme)
  const objective = getObjective(theme, currentPuzzle?.themes ?? [])

  return (
    <div
      className="fixed inset-0 bg-black/85 z-50 flex flex-col"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full h-full bg-[#141414]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#2A2A2A] shrink-0">
          <div>
            <h2 className="text-base font-semibold text-[#F0F0F0]">Exersează: {categoryLabel}</h2>
            <p className="text-xs text-[#6B6B6B] mt-0.5">
              {isPro ? 'Nelimitat' : `${todayCount} / ${FREE_LIMIT} puzzle-uri azi`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#6B6B6B] hover:text-[#F0F0F0] hover:bg-[#2A2A2A] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
          {limitReached ? (
            <div className="max-w-md mx-auto rounded-xl bg-[rgba(226,179,64,0.08)] border border-[rgba(226,179,64,0.3)] p-6 text-center">
              <p className="text-[#E2B340] font-semibold">Ai atins limita zilnică de {FREE_LIMIT} puzzle-uri</p>
              <p className="text-[#6B6B6B] text-sm mt-1">Upgrade la Pro pentru puzzle-uri nelimitate</p>
              <a href="/pricing" className="mt-3 inline-block">
                <Button size="sm">Upgrade la Pro</Button>
              </a>
            </div>
          ) : loading && !puzzleState ? (
            <div className="flex justify-center py-16">
              <Spinner className="h-7 w-7" />
            </div>
          ) : puzzleState ? (
            <div className="flex flex-col lg:flex-row gap-6 h-full max-w-[1400px] mx-auto">
              {/* Board */}
              <div className="flex-1 flex flex-col items-center gap-3 min-w-0">
                <div className="flex items-center gap-2 text-sm text-[#A0A0A0] self-start lg:self-center">
                  <span>Joci cu</span>
                  <span className={`font-semibold px-2 py-0.5 rounded text-xs ${puzzleState.game.turn() === 'w' ? 'bg-[#F0F0F0] text-black' : 'bg-[#141414] border border-[#3A3A3A] text-[#F0F0F0]'}`}>
                    {puzzleState.game.turn() === 'w' ? '♔ Alb' : '♚ Negru'}
                  </span>
                </div>

                {/* Tablă mare pătrată, încadrată în înălțimea ecranului */}
                <div className="relative w-full" style={{ maxWidth: 'min(72vh, 100%)' }}>
                  <div className="rounded-xl overflow-hidden border border-[#2A2A2A]">
                    <Chessboard
                      options={{
                        position: puzzleState.game.fen(),
                        onPieceDrop,
                        allowDragging: puzzleState.status === 'playing' && !puzzleState.waitingOpponent && !seqPlaying && !revealed,
                        boardOrientation: playerColor,
                        boardStyle: { borderRadius: 0 },
                        darkSquareStyle: { backgroundColor: '#3A3A3A' },
                        lightSquareStyle: { backgroundColor: '#f0d9b5' },
                        squareStyles,
                        arrows: boardArrows,
                      }}
                    />
                  </div>
                  {/* Bifă verde la fiecare mutare corectă */}
                  {flashCheck && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      <CheckCircle2
                        className="text-[#4ade80] drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
                        style={{ width: '38%', height: '38%', animation: 'checkPop 0.85s ease-out forwards' }}
                      />
                    </div>
                  )}
                </div>

                {/* Indicii — doar cât timp e rândul jucătorului */}
                {puzzleState.status === 'playing' && !puzzleState.waitingOpponent && !seqPlaying && !revealed && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button size="sm" variant="secondary" className="gap-1.5"
                      onClick={() => setHintFrom(expFrom ?? null)} disabled={!expFrom}>
                      <Lightbulb className="h-3.5 w-3.5" /> Dă-mi un indiciu
                    </Button>
                    <Button size="sm" variant="secondary" className="gap-1.5"
                      onClick={() => { setShowMove(true); setHintFrom(expFrom ?? null) }} disabled={!expFrom}>
                      <Eye className="h-3.5 w-3.5" /> Arată mutarea
                    </Button>
                    {isMultiMove && (
                      <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => void showSequence()}>
                        <ListVideo className="h-3.5 w-3.5" /> Arată secvența
                      </Button>
                    )}
                  </div>
                )}

                <div className="w-full" style={{ maxWidth: 'min(72vh, 100%)' }}>
                  {seqPlaying && (
                    <p className="text-sm text-[#E2B340] text-center">Se redă secvența...</p>
                  )}
                  {revealed && !seqPlaying && (
                    <div className="flex items-center gap-2 rounded-lg bg-[rgba(226,179,64,0.1)] border border-[rgba(226,179,64,0.3)] p-3">
                      <ListVideo className="h-5 w-5 text-[#E2B340]" />
                      <span className="text-[#E2B340] font-semibold">Aceasta era soluția completă.</span>
                      <Button size="sm" variant="secondary" className="ml-auto" onClick={() => loadPuzzle(currentPuzzle!)}>
                        Reia
                      </Button>
                    </div>
                  )}

                  {puzzleState.status === 'correct' && (
                    <div className="flex items-center gap-2 rounded-lg bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.3)] p-3">
                      <CheckCircle2 className="h-5 w-5 text-[#4ade80]" />
                      <span className="text-[#4ade80] font-semibold">Corect! Excelent!</span>
                      <Button size="sm" className="ml-auto" onClick={() => void fetchNextPuzzle()}>
                        <RefreshCw className="h-3.5 w-3.5" /> Următor
                      </Button>
                    </div>
                  )}
                  {puzzleState.status === 'wrong' && (
                    <div className="flex items-center gap-2 rounded-lg bg-[rgba(251,191,36,0.1)] border border-[rgba(251,191,36,0.35)] p-3">
                      <XCircle className="h-5 w-5 text-[#fbbf24]" />
                      <span className="text-[#fbbf24] font-semibold">Mai gândește-te. Încearcă din nou.</span>
                      <Button size="sm" variant="secondary" className="ml-auto" onClick={() => loadPuzzle(currentPuzzle!)}>
                        Reia
                      </Button>
                    </div>
                  )}
                  {puzzleState.waitingOpponent && (
                    <p className="text-sm text-[#6B6B6B] text-center">Adversarul mută...</p>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="w-full lg:w-[340px] shrink-0 space-y-4">
                {/* Comentariu: obiectivul tacticii (activabil/dezactivabil) */}
                <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#6B6B6B] uppercase tracking-wider flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5 text-[#E2B340]" /> Obiectivul tacticii
                    </p>
                    <button
                      onClick={() => setShowCommentary(v => !v)}
                      className="text-xs font-medium text-[#E2B340] hover:text-[#F0C85A] transition-colors"
                    >
                      {showCommentary ? 'Ascunde' : 'Arată'}
                    </button>
                  </div>
                  {showCommentary && (
                    <p className="text-sm text-[#A0A0A0] leading-relaxed mt-2">{objective}</p>
                  )}
                </div>

                {currentPuzzle && (
                  <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] p-4 space-y-3">
                    <div>
                      <p className="text-xs text-[#6B6B6B] uppercase tracking-wider mb-1">Rating puzzle</p>
                      <p className="text-2xl font-bold text-[#F0F0F0]">{currentPuzzle.rating}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6B6B6B] uppercase tracking-wider mb-2">Teme</p>
                      <div className="flex flex-wrap gap-1.5">
                        {displayThemes(currentPuzzle.themes).map(t => (
                          <Badge key={t} variant="accent">
                            {themeLabel(t)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {currentPuzzle.game_url && (
                      <a
                        href={currentPuzzle.game_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#E2B340] hover:text-[#F0C85A]"
                      >
                        Partida originală pe Lichess →
                      </a>
                    )}
                  </div>
                )}

                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => void fetchNextPuzzle()}
                  disabled={loading || limitReached}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Puzzle următor
                </Button>

                <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] p-4">
                  <p className="text-xs text-[#6B6B6B] uppercase tracking-wider mb-2">Cum funcționează</p>
                  <ol className="space-y-1.5 text-xs text-[#A0A0A0]">
                    <li>1. Ultima mutare a fost a adversarului — acum e rândul tău</li>
                    <li>2. Mută piesa cu drag & drop spre pătratul dorit</li>
                    <li>3. Blocat? „Dă-mi un indiciu" îți arată piesa, „Arată mutarea" îți arată mutarea</li>
                    <li>4. La tacticile cu mai multe mutări, „Arată secvența" redă toată soluția</li>
                  </ol>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-16 text-[#6B6B6B]">Niciun puzzle disponibil.</div>
          )}
        </div>
      </div>
    </div>
  )
}
