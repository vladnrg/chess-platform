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

  // Analysis mode: get centipawn eval (+ mate) + best move for a position (full strength)
  const evalPosition = useCallback((fen: string, depth = 14): Promise<{ cp: number; mate?: number; best: string }> => {
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

  return { getBestMove, evalPosition, getLine, analyze, analyzePositions }
}
