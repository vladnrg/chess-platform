import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Aduce motorul de şah din node_modules în `public/`.
 *
 * `public/stockfish.js` e doar încărcătorul, de 20KB; motorul propriu-zis e un
 * fişier `.wasm` de 7MB pe care încărcătorul îl cere la pornire. Lipsea, iar
 * fără el orice folosire a motorului eşua în browser cu
 * „WebAssembly.instantiate(): expected magic word" — cererea pentru .wasm
 * primea index.html, adică nimic.
 *
 * Varianta `lite-single`, nu cea completă: aceea are 107MB şi ar fi de
 * nedescărcat. `single` (un singur fir) nu cere SharedArrayBuffer, deci merge
 * fără antetele COOP/COEP pe care majoritatea găzduirilor statice nu le pun.
 *
 * Fişierul nu se ţine în git — se copiază la instalare şi înainte de build,
 * deci rămâne mereu potrivit cu versiunea din package.json.
 */

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const FILES = [
  {
    from: join(root, 'node_modules/stockfish/bin/stockfish-18-lite-single.js'),
    to: join(root, 'public/stockfish.js'),
  },
  {
    from: join(root, 'node_modules/stockfish/bin/stockfish-18-lite-single.wasm'),
    // Numele e impus de încărcător, care cere exact „stockfish.wasm".
    to: join(root, 'public/stockfish.wasm'),
  },
]

let copied = 0

for (const { from, to } of FILES) {
  if (!existsSync(from)) {
    console.warn(`[motor] lipseşte din node_modules: ${from}`)
    console.warn('[motor] rulează `npm install` şi încearcă din nou.')
    process.exit(0)   // nu oprim build-ul; doar avertizăm
  }

  mkdirSync(dirname(to), { recursive: true })

  // Sărim peste copiere dacă e deja la zi — `npm install` rulează des.
  if (existsSync(to) && statSync(to).size === statSync(from).size) continue

  copyFileSync(from, to)
  copied++
  console.log(`[motor] copiat ${to.replace(root, '.')} (${(statSync(to).size / 1048576).toFixed(1)} MB)`)
}

if (copied === 0) console.log('[motor] deja la zi')
