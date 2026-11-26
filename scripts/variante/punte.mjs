// Punte către exploratorul Chess.com (2026-11-26). Exploratorul cere sesiunea din
// browser, deci pagina din fereastra Playwright întreabă puntea ce are de cerut
// (prin page.route, fără CORS) şi îi trimite răspunsurile. Scripturile din Node
// cheamă `explorer(fen, culoare, [min, max])` ca pe o funcţie obişnuită.
//
// În fereastră se rulează o dată `date/punte-pagina.js` (browser_run_code_unsafe,
// pe o pagină www.chess.com), apoi pagina lucrează singură cât trăieşte.
import http from 'node:http'

const PORT = 7777
const coada = []          // cereri neluate încă de pagină
const asteapta = new Map() // id → resolve
let nr = 0

const server = http.createServer((req, res) => {
  if (req.url === '/next') {
    const job = coada.shift()
    res.writeHead(job ? 200 : 204, { 'content-type': 'application/json' })
    return res.end(job ? JSON.stringify(job) : '')
  }
  if (req.url === '/rezultat' && req.method === 'POST') {
    let corp = ''
    req.on('data', b => { corp += b })
    req.on('end', () => {
      const { id, date } = JSON.parse(corp)
      asteapta.get(id)?.(date)
      asteapta.delete(id)
      res.writeHead(200); res.end('ok')
    })
    return
  }
  res.writeHead(404); res.end()
})
server.listen(PORT, '127.0.0.1')

/** `{ tot, m: [[san, partide]…] }` sau null, pentru treapta [min, max] de pe Chess.com (rapid + blitz). */
export function explorer(fen, culoare, [min, max]) {
  const id = ++nr
  return new Promise(resolve => {
    asteapta.set(id, resolve)
    coada.push({ id, fen, culoare, min, max })
  })
}

export function inchidePuntea() { server.close() }
