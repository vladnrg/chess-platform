// Aduce puzzle-uri REALE și DENSE din Lichess (poziții cu multe piese) per temă
// tactică și generează migrația SQL. Rulează: node scripts/seed-tactics.cjs
const { Chess } = require('chess.js')
const fs = require('fs')
const path = require('path')

const THEMES = [
  'fork', 'pin', 'discoveredAttack', 'attraction', 'deflection',
  'removeDefender', 'skewer', 'trappedPiece',
  'mateIn1', 'mateIn2', 'mateIn3',
  'perpetualCheck', 'zwischenzug', 'sacrifice', 'quietMove',
  'zugzwang', 'exposedKing',
]
const DIFFICULTIES = ['harder', 'hardest', 'harder', 'hardest', 'normal']
const PER_THEME_TARGET = 13
const ATTEMPTS_PER_THEME = 30
const MIN_PIECES = 11
const DELAY_MS = 1100

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

function parsePgnSan(pgn) {
  return pgn
    .replace(/\[[^\]]*\]/g, '').replace(/\{[^}]*\}/g, '').replace(/\$\d+/g, '')
    .replace(/[!?]+/g, '').replace(/\d+\.\.\.\s*/g, '').replace(/\d+\.\s*/g, '')
    .replace(/1-0|0-1|1\/2-1\/2|\*/g, '').split(/\s+/).filter(Boolean)
}

function lichessToLocal(lp) {
  try {
    const sans = parsePgnSan(lp.game.pgn)
    const full = new Chess()
    const verbose = []
    for (const san of sans) {
      const r = full.move(san)
      if (!r) return null
      verbose.push({ from: r.from, to: r.to, promotion: r.promotion })
    }
    const ply = lp.puzzle.initialPly
    if (verbose.length <= ply) return null
    const before = new Chess()
    for (let i = 0; i < ply; i++) before.move(verbose[i])
    const fen = before.fen()
    const trig = verbose[ply]
    const triggerUci = trig.from + trig.to + (trig.promotion || '')
    // sanity: prima mutare din soluție trebuie să fie legală după trigger
    const check = new Chess(fen)
    check.move({ from: trig.from, to: trig.to, promotion: trig.promotion })
    const sol0 = lp.puzzle.solution[0]
    const mv = check.move({ from: sol0.slice(0, 2), to: sol0.slice(2, 4), promotion: sol0[4] })
    if (!mv) return null
    return {
      id: lp.puzzle.id, fen,
      moves: [triggerUci, ...lp.puzzle.solution].join(' '),
      rating: lp.puzzle.rating, themes: lp.puzzle.themes,
      game_url: `https://lichess.org/training/${lp.puzzle.id}`,
    }
  } catch { return null }
}

const pieceCount = (fen) => (fen.split(' ')[0].match(/[a-zA-Z]/g) || []).length

async function fetchNext(diff, angle) {
  for (let retry = 0; retry < 3; retry++) {
    try {
      const res = await fetch(`https://lichess.org/api/puzzle/next?difficulty=${diff}&angle=${angle}`)
      if (res.status === 429) { await sleep(6000); continue }
      if (!res.ok) return null
      return await res.json()
    } catch { await sleep(1500) }
  }
  return null
}

async function main() {
  const all = new Map()
  for (const theme of THEMES) {
    let kept = 0, attempts = 0
    while (kept < PER_THEME_TARGET && attempts < ATTEMPTS_PER_THEME) {
      attempts++
      const diff = DIFFICULTIES[attempts % DIFFICULTIES.length]
      const lp = await fetchNext(diff, theme)
      await sleep(DELAY_MS)
      if (!lp || !lp.puzzle || all.has(lp.puzzle.id)) continue
      const local = lichessToLocal(lp)
      if (!local || pieceCount(local.fen) < MIN_PIECES) continue
      all.set(local.id, local)
      kept++
    }
    console.error(`${theme}: ${kept} kept (${attempts} attempts) | total ${all.size}`)
  }

  const rows = [...all.values()]
  const esc = (s) => s.replace(/'/g, "''")
  const values = rows.map(p => {
    const t = `ARRAY[${p.themes.map(x => `'${esc(x)}'`).join(',')}]::text[]`
    return `  ('${esc(p.id)}','${esc(p.fen)}','${esc(p.moves)}',${p.rating},${t},'${esc(p.game_url)}')`
  }).join(',\n')

  const sql = `-- Migration 017: puzzle-uri tactice REALE și dense din Lichess (poziții cu multe piese)
-- Generat din scripts/seed-tactics.cjs (${rows.length} puzzle-uri)

DELETE FROM public.puzzles WHERE id LIKE 'seed_%';

INSERT INTO public.puzzles (id, fen, moves, rating, themes, game_url) VALUES
${values}
ON CONFLICT (id) DO UPDATE SET
  fen = EXCLUDED.fen, moves = EXCLUDED.moves, rating = EXCLUDED.rating,
  themes = EXCLUDED.themes, game_url = EXCLUDED.game_url;
`
  const outPath = path.join(__dirname, '..', 'supabase', 'migrations', '017_real_tactics.sql')
  fs.writeFileSync(outPath, sql)
  console.error(`\nWROTE ${rows.length} puzzles -> ${outPath}`)
}
main()
