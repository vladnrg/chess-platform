import { useEffect, useRef, useCallback } from 'react'

export function useStockfish() {
  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
    const worker = new Worker('/stockfish.js')
    workerRef.current = worker
    worker.postMessage('uci')
    return () => worker.terminate()
  }, [])

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

  return { getBestMove }
}
