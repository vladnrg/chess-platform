import { useEffect, useRef, useCallback } from 'react'

/** O variantă întoarsă de motor în timpul analizei continue. */
export interface EngineLine {
  /** Al câtelea loc în clasamentul variantelor (1 = cea mai bună). */
  multipv: number
  depth: number
  /** Evaluare în sutimi de pion, din perspectiva celui la mutare. */
  cp?: number
  /** Mat în N mutări; când e prezent, `cp` nu contează. */
  mate?: number
  pv: string[]
}

export interface PositionEval {
  fen: string
  cp: number       // centipawns from White's perspective
  best: string     // best UCI move
  played: string   // UCI move actually played
  drop: number     // eval drop for the side to move (positive = bad)
}

export function useStockfish() {
  const workerRef = useRef<Worker | null>(null)
  /** Motorul are o căutare în desfăşurare? Un singur motor, o singură căutare. */
  const searchingRef = useRef(false)

  useEffect(() => {
    const worker = new Worker('/stockfish.js')
    workerRef.current = worker
    worker.postMessage('uci')
    return () => worker.terminate()
  }, [])

  /**
   * Opreşte căutarea curentă şi aşteaptă confirmarea motorului.
   *
   * Protocolul UCI cere ca după `stop` să aştepţi `bestmove` înainte de a
   * trimite altă poziţie. Trimiterea imediată lasă motorul să scoată în
   * continuare linii din căutarea veche — care ajung la ascultătorul noii
   * poziţii şi conţin mutări ilegale acolo.
   */
  const stopSearch = useCallback((worker: Worker): Promise<void> => {
    if (!searchingRef.current) return Promise.resolve()

    return new Promise(resolve => {
      const finish = () => {
        worker.removeEventListener('message', onMessage)
        clearTimeout(timer)
        searchingRef.current = false
        resolve()
      }
      const onMessage = (e: MessageEvent<string>) => {
        const msg = typeof e.data === 'string' ? e.data : String(e.data)
        if (msg.startsWith('bestmove')) finish()
      }
      // Plasă de siguranţă: dacă motorul nu confirmă, mergem mai departe după o
      // secundă. Mai bine o căutare pornită peste alta decât o pagină blocată.
      const timer = setTimeout(finish, 1000)

      worker.addEventListener('message', onMessage)
      worker.postMessage('stop')
    })
  }, [])

  // Play mode: get best move at a given ELO strength
  const getBestMove = useCallback((fen: string, elo: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const worker = workerRef.current
      if (!worker) { reject(new Error('Engine not ready')); return }

      const timeout = setTimeout(() => reject(new Error('Engine timeout')), 10000)
      const handler = (e: MessageEvent<string>) => {
        const msg = typeof e.data === 'string' ? e.data : String(e.data)
        if (msg.startsWith('bestmove')) {
          clearTimeout(timeout)
          worker.removeEventListener('message', handler)
          const move = msg.split(' ')[1]
          if (move && move !== '(none)') resolve(move)
          else reject(new Error('No move'))
        }
      }
      worker.addEventListener('message', handler)
      worker.postMessage('ucinewgame')
      worker.postMessage('setoption name UCI_LimitStrength value true')
      worker.postMessage(`setoption name UCI_Elo value ${elo}`)
      worker.postMessage(`position fen ${fen}`)
      worker.postMessage('go movetime 1000')
    })
  }, [])

  /**
   * Evaluarea unei poziţii, la putere maximă.
   *
   * `fresh` goleşte tabela de transpoziţii înainte de măsurătoare. Fără ea,
   * aceeaşi poziţie evaluată de două ori dă rezultate care diferă cu până la 8
   * sutimi de pion, fiindcă motorul se foloseşte de ce a calculat înainte
   * (măsurat pe motorul din proiect). Pentru tabla de analiză n-are importanţă
   * şi ar încetini; pentru Proba de foc are, fiindcă acolo scorul e diferenţa
   * dintre două evaluări, iar zgomotul lor s-ar aduna.
   */
  const evalPosition = useCallback((
    fen: string, depth = 14, fresh = false,
  ): Promise<{ cp: number; mate?: number; best: string }> => {
    return new Promise((resolve, reject) => {
      const worker = workerRef.current
      if (!worker) { reject(new Error('Engine not ready')); return }

      const timeout = setTimeout(() => reject(new Error('Eval timeout')), 8000)
      let lastCp = 0
      let lastMate: number | undefined
      let lastBest = ''

      const handler = (e: MessageEvent<string>) => {
        const msg = typeof e.data === 'string' ? e.data : String(e.data)

        if (msg.includes('score cp')) {
          const m = msg.match(/score cp (-?\d+)/)
          if (m) { lastCp = parseInt(m[1]); lastMate = undefined }
          const bm = msg.match(/\spv\s(\S+)/)
          if (bm) lastBest = bm[1]
        } else if (msg.includes('score mate')) {
          const m = msg.match(/score mate (-?\d+)/)
          if (m) { lastMate = parseInt(m[1]); lastCp = lastMate > 0 ? 30000 : -30000 }
          const bm = msg.match(/\spv\s(\S+)/)
          if (bm) lastBest = bm[1]
        }

        if (msg.startsWith('bestmove')) {
          clearTimeout(timeout)
          worker.removeEventListener('message', handler)
          const bm = msg.split(' ')[1]
          resolve({ cp: lastCp, mate: lastMate, best: lastBest || bm || '' })
        }
      }

      worker.addEventListener('message', handler)
      if (fresh) worker.postMessage('ucinewgame')
      worker.postMessage('setoption name Skill Level value 20')
      worker.postMessage('setoption name UCI_LimitStrength value false')
      worker.postMessage(`position fen ${fen}`)
      worker.postMessage(`go depth ${depth}`)
    })
  }, [])

  /**
   * Linia principală completă dintr-o poziţie, nu doar prima mutare.
   *
   * `evalPosition` întoarce un singur `best`, ceea ce ar însemna un apel la motor
   * pentru fiecare semi-mutare — câteva secunde bucata. Motorul trimite însă
   * toată variaţia în linia `info ... pv ...`, aşa că o citim dintr-o singură
   * căutare: de aici vine refutarea arătată după o mutare greşită.
   */
  const getLine = useCallback((
    fen: string, depth = 14, maxPlies = 6,
  ): Promise<{ cp: number; mate?: number; pv: string[] }> => {
    return new Promise((resolve, reject) => {
      const worker = workerRef.current
      if (!worker) { reject(new Error('Engine not ready')); return }

      const timeout = setTimeout(() => reject(new Error('Line timeout')), 10000)
      let lastCp = 0
      let lastMate: number | undefined
      let lastPv: string[] = []

      const handler = (e: MessageEvent<string>) => {
        const msg = typeof e.data === 'string' ? e.data : String(e.data)

        if (msg.startsWith('info') && msg.includes(' pv ')) {
          const cp = msg.match(/score cp (-?\d+)/)
          const mate = msg.match(/score mate (-?\d+)/)
          if (mate) {
            lastMate = parseInt(mate[1])
            lastCp = lastMate > 0 ? 30000 : -30000
          } else if (cp) {
            lastCp = parseInt(cp[1])
            lastMate = undefined
          }
          // Tot ce urmează după „ pv " e variaţia, mutare cu mutare.
          const pv = msg.split(' pv ')[1]
          if (pv) lastPv = pv.trim().split(/\s+/).slice(0, maxPlies)
        }

        if (msg.startsWith('bestmove')) {
          clearTimeout(timeout)
          worker.removeEventListener('message', handler)
          const bm = msg.split(' ')[1]
          resolve({
            cp: lastCp,
            mate: lastMate,
            pv: lastPv.length ? lastPv : (bm && bm !== '(none)' ? [bm] : []),
          })
        }
      }

      worker.addEventListener('message', handler)
      worker.postMessage('setoption name Skill Level value 20')
      worker.postMessage('setoption name UCI_LimitStrength value false')
      worker.postMessage(`position fen ${fen}`)
      worker.postMessage(`go depth ${depth}`)
    })
  }, [])

  /**
   * Analiză continuă a unei poziţii, cu mai multe variante deodată.
   *
   * Spre deosebire de `evalPosition`, care întoarce un rezultat şi se opreşte,
   * asta trimite rezultate pe măsură ce motorul coboară în adâncime — exact ce
   * are nevoie o tablă de analiză, unde vrei să vezi evaluarea mişcându-se, nu
   * să aştepţi cu ecranul gol.
   *
   * Întoarce o funcţie de oprire. Cine o foloseşte trebuie s-o apeleze la
   * schimbarea poziţiei, altfel două căutări ar scrie una peste alta.
   */
  const analyze = useCallback((
    fen: string,
    opts: { multiPv?: number; depth?: number },
    onUpdate: (lines: EngineLine[], depth: number) => void,
  ): (() => void) => {
    const worker = workerRef.current
    if (!worker) return () => {}

    const multiPv = opts.multiPv ?? 3
    const depth = opts.depth ?? 16
    const lines = new Map<number, EngineLine>()
    let stopped = false

    const handler = (e: MessageEvent<string>) => {
      if (stopped) return
      const msg = typeof e.data === 'string' ? e.data : String(e.data)

      if (msg.startsWith('bestmove')) { searchingRef.current = false; return }
      if (!msg.startsWith('info') || !msg.includes(' pv ')) return

      const d = msg.match(/ depth (\d+)/)
      const idx = msg.match(/ multipv (\d+)/)
      const cp = msg.match(/score cp (-?\d+)/)
      const mate = msg.match(/score mate (-?\d+)/)
      const pv = msg.split(' pv ')[1]
      if (!pv) return

      const line: EngineLine = {
        multipv: idx ? parseInt(idx[1]) : 1,
        depth: d ? parseInt(d[1]) : 0,
        cp: cp ? parseInt(cp[1]) : undefined,
        mate: mate ? parseInt(mate[1]) : undefined,
        pv: pv.trim().split(/\s+/).slice(0, 12),
      }
      lines.set(line.multipv, line)

      onUpdate(
        [...lines.values()].sort((a, b) => a.multipv - b.multipv),
        line.depth,
      )
    }

    // Aşteptăm ca o eventuală căutare anterioară să se închidă de tot, apoi
    // pornim.
    //
    // Fără aşteptarea asta, `stop` era trimis şi imediat după el noua poziţie —
    // dar motorul mai avea de scos câteva linii din căutarea veche, iar acelea
    // ajungeau la ascultătorul nou. Rezultatul: variante care nu sunt legale în
    // poziţia curentă, chess.js arunca eroare în timpul randării şi pagina
    // rămânea neagră după una-două mutări.
    void stopSearch(worker).then(() => {
      if (stopped) return
      worker.addEventListener('message', handler)
      searchingRef.current = true
      worker.postMessage('setoption name Skill Level value 20')
      worker.postMessage('setoption name UCI_LimitStrength value false')
      worker.postMessage(`setoption name MultiPV value ${multiPv}`)
      worker.postMessage(`position fen ${fen}`)
      worker.postMessage(`go depth ${depth}`)
    })

    return () => {
      stopped = true
      worker.removeEventListener('message', handler)
      worker.postMessage('stop')
      // MultiPV rămâne setat pentru cine vine după, deci îl punem la loc.
      worker.postMessage('setoption name MultiPV value 1')
    }
  }, [stopSearch])

  /**
   * Mai multe mutări candidate dintr-o poziţie, cu evaluarea fiecăreia.
   *
   * `analyze` trimite rezultate în flux şi nu se termină singură; asta o
   * împachetează într-o promisiune care se închide la prima atingere a
   * adâncimii cerute. De aici ia Proba de foc „greşeala plauzibilă" cu care
   * porneşte o rundă de dezavantaj: a doua sau a treia variantă, nu prima.
   */
  const getCandidates = useCallback((
    fen: string, count = 4, depth = 12,
  ): Promise<EngineLine[]> => {
    return new Promise(resolve => {
      const stopRef = { current: null as null | (() => void) }
      let settled = false
      let latest: EngineLine[] = []

      const finish = (lines: EngineLine[]) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        stopRef.current?.()
        resolve(lines)
      }

      // Dacă motorul nu duce toate variantele la adâncimea cerută, mergem cu ce
      // avem — mai bine variante puţin mai puţin adânci decât nimic.
      const timer = setTimeout(() => finish(latest), 8000)

      stopRef.current = analyze(fen, { multiPv: count, depth }, lines => {
        latest = lines
        // Aşteptăm ca TOATE variantele să ajungă la adâncimea cerută, nu doar
        // prima. Altfel slot-urile rămase în urmă poartă rezultate mai vechi,
        // iar printre ele apar duplicate: aceeaşi mutare şi pe locul 1, şi pe 2.
        if (lines.length > 0 && lines.every(l => l.depth >= depth)) finish(lines)
      })
    })
  }, [analyze])

  // Analyze a sequence of (fen, playedUci) pairs, return per-position evaluations
  const analyzePositions = useCallback(
    async (
      positions: { fen: string; played: string }[],
      onProgress?: (pct: number) => void,
    ): Promise<PositionEval[]> => {
      const results: PositionEval[] = []
      for (let i = 0; i < positions.length; i++) {
        const { fen, played } = positions[i]
        try {
          const { cp, best } = await evalPosition(fen)
          const prevCp = i > 0 ? results[i - 1].cp : 0
          // Drop = how much the eval worsened for the side to move
          const isWhiteTurn = fen.includes(' w ')
          const drop = isWhiteTurn
            ? Math.max(0, prevCp - cp)   // white wants higher
            : Math.max(0, cp - prevCp)   // black wants lower
          results.push({ fen, cp, best, played, drop })
        } catch {
          results.push({ fen, cp: 0, best: '', played, drop: 0 })
        }
        onProgress?.(Math.round(((i + 1) / positions.length) * 100))
      }
      return results
    },
    [evalPosition],
  )

  /**
   * Mutarea motorului la o forţă anume, pentru Proba de foc.
   *
   * Spre deosebire de `getBestMove`, nu presupune că `UCI_Elo` e butonul de
   * forţă: motorul refuză valori sub 1320 (le înlocuieşte tăcut cu 1320), aşa
   * că sub pragul ăsta singurul care mai slăbeşte jocul e `Skill Level`.
   */
  const getMoveAtStrength = useCallback((
    fen: string,
    s: { skill: number; limitStrength: boolean; elo: number; movetime: number },
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const worker = workerRef.current
      if (!worker) { reject(new Error('Motorul nu e pornit')); return }

      const timeout = setTimeout(() => {
        worker.removeEventListener('message', handler)
        reject(new Error('Motorul nu a răspuns'))
      }, 10000)

      const handler = (e: MessageEvent<string>) => {
        const msg = typeof e.data === 'string' ? e.data : String(e.data)
        if (!msg.startsWith('bestmove')) return
        clearTimeout(timeout)
        worker.removeEventListener('message', handler)
        const move = msg.split(' ')[1]
        if (move && move !== '(none)') resolve(move)
        else reject(new Error('Fără mutare'))
      }

      worker.addEventListener('message', handler)
      worker.postMessage(`setoption name Skill Level value ${s.skill}`)
      worker.postMessage(`setoption name UCI_LimitStrength value ${s.limitStrength}`)
      if (s.limitStrength) worker.postMessage(`setoption name UCI_Elo value ${s.elo}`)
      worker.postMessage(`position fen ${fen}`)
      worker.postMessage(`go movetime ${s.movetime}`)
    })
  }, [])

  /** Readuce motorul la putere maximă, după ce a fost slăbit pentru joc. */
  const resetStrength = useCallback(() => {
    const worker = workerRef.current
    if (!worker) return
    worker.postMessage('setoption name Skill Level value 20')
    worker.postMessage('setoption name Skill Level value 20')
      worker.postMessage('setoption name UCI_LimitStrength value false')
  }, [])

  return {
    getBestMove, evalPosition, getLine, analyze, analyzePositions,
    getCandidates, getMoveAtStrength, resetStrength,
  }
}
