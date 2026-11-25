// node migrare.mts <numar> <nume> curs1 curs2 … → supabase/migrations/<numar>_<nume>.sql
// Variantele (ramuri.json + texte-*.mjs), grupul şi procentele pe trepte (Chess.com + Lichess) ale capitolelor.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { Chess } from 'chess.js'
import { translateNotation } from '../../src/lib/chess-translations'
import { INTERZISE } from '../verificari/reguli-text.mjs'

const D = 'scripts/variante/date/'
const [numar, nume, ...cursuri] = process.argv.slice(2)
const R = JSON.parse(readFileSync(D + 'ramuri.json', 'utf8')).filter((r: { curs: string }) => cursuri.includes(r.curs))
const v1 = JSON.parse(readFileSync(D + 'v1.json', 'utf8'))
const grupuri: Record<string, string> = JSON.parse(readFileSync(D + 'grupuri.json', 'utf8'))
const poz: { cheie: string; fen: string; san: string }[] = JSON.parse(readFileSync(D + 'rating-pozitii.json', 'utf8'))
const cc = JSON.parse(readFileSync(D + 'cc-rating.json', 'utf8'))
const li = JSON.parse(readFileSync(D + 'li-rating.json', 'utf8'))
const cand = JSON.parse(readFileSync(D + 'cc-candidati.json', 'utf8'))

const TEXTE: Record<string, { t: string[]; f: string }> = {}
for (const f of readdirSync(D).filter(f => /^texte-.*\.mjs$/.test(f))) Object.assign(TEXTE, (await import(`./date/${f}`)).TEXTE)
const { FINALE } = await import('./date/finale.mjs') as { FINALE: Record<string, [string, string]> }
for (const [id, [t8, f]] of Object.entries(FINALE)) {
  const tx = TEXTE[id]
  if (!tx) throw new Error(`finale fără texte: ${id}`)
  if (tx.t.at(-1) === 'TODO') tx.t[tx.t.length - 1] = t8
  if (tx.f === 'TODO') tx.f = f
}
for (const [id, tx] of Object.entries(TEXTE)) if (tx.t.includes('TODO') || tx.f === 'TODO') throw new Error(`TODO rămas: ${id}`)

const MIN_PARTIDE = 100
function procente(cheie: string) {
  const p = poz.find(x => x.cheie === cheie)
  if (!p) throw new Error(`fără poziţie pentru ${cheie}`)
  const out: Record<string, Record<string, number>> = { chesscom: {}, lichess: {} }
  for (const [b, d] of Object.entries(cc[p.fen] ?? {}) as [string, { tot: number; m: [string, number][] } | null][]) {
    if (!d || d.tot < MIN_PARTIDE) continue
    out.chesscom[b] = Math.round(((d.m.find(x => x[0] === p.san)?.[1] ?? 0) / d.tot) * 1000) / 10
  }
  for (const [b, d] of Object.entries(li[p.fen] ?? {}) as [string, { tot: number; m: Record<string, number> } | null][]) {
    if (!d || d.tot < MIN_PARTIDE) continue
    out.lichess[b] = Math.round(((d.m[p.san] ?? 0) / d.tot) * 1000) / 10
  }
  if (!Object.keys(out.chesscom).length || !Object.keys(out.lichess).length) throw new Error(`procente lipsă: ${cheie}`)
  return out
}

const erori: string[] = []
const peCapitol: Record<string, { cheie: number; v: object }[]> = {}
for (const r of R) {
  const tx = TEXTE[r.id]
  if (!tx) { erori.push(`${r.id}: fără texte`); continue }
  const g = new Chess(); const san: string[] = []
  for (const u of r.uci) san.push(g.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san)
  const dupa = san.slice(r.ply)
  if (tx.t.length !== dupa.length) erori.push(`${r.id}: ${tx.t.length} texte pentru ${dupa.length} mutări`)
  const expl: Record<string, string> = {}
  dupa.forEach((s, i) => {
    const t = tx.t[i] ?? ''
    const ro = translateNotation(s)
    const ok = s.startsWith('O-O') ? t.startsWith('Rocada') : t.startsWith(ro + ' — ')
    if (!ok) erori.push(`${r.id} ply ${r.ply + i}: textul „${t.slice(0, 25)}" nu începe cu ${ro}`)
    expl[String(r.ply + i)] = t
  })
  for (const t of [...tx.t, tx.f]) for (const reg of INTERZISE) {
    reg.ce.lastIndex = 0
    if (reg.ce.test(t)) erori.push(`${r.id}: „${reg.gresit}" în „${t.slice(0, 40)}"`)
  }
  const nr = Math.floor(r.ply / 2) + 1
  const mutare = r.ply % 2 === 0 ? `${nr}.${translateNotation(r.san)}` : `${nr}…${translateNotation(r.san)}`
  const v = {
    nume: r.san === "O-O-O" ? `Dacă adversarul face rocada mare la mutarea ${nr}` : r.san.startsWith("O-O") ? `Dacă adversarul face rocada la mutarea ${nr}` : `Dacă adversarul joacă ${mutare}`,
    moves_uci: r.uci.join(' '),
    move_explanations: expl,
    final_text: tx.f,
    popularitate_pe_rating: procente(r.id),
  }
  // Ordinea: câte partide de 1000–1600 ajung în ramificaţie.
  const d = cand[`${r.curs}|${r.cod}|${r.ply}`]?.['1000']
  const cheie = d ? (d.m.find((x: [string, number]) => x[0] === r.san)?.[1] ?? 0) : 0
  ;(peCapitol[`${r.curs}|${r.cod}`] ??= []).push({ cheie, v })
}
if (erori.length) { console.log(erori.join('\n')); process.exit(1) }

let sql = `-- ============================================================
-- ${numar} · Variantele capitolelor: ${cursuri.join(', ')}
--
-- Ca la Italiana (migrările 138 şi 141), cerut pe 2026-11-25:
--  * variante = ramificaţiile în care adversarul face altă mutare în cel puţin
--    10% din partidele de 1000–1600 (Chess.com, rapid şi blitz), nu sub 4% la
--    400–1000 şi 1600–2300; cel mult 3 pe capitol, după câte partide ajung acolo.
--    Continuarea: adversarul joacă mutarea cea mai frecventă la 1000–1600; tu,
--    cea mai jucată la 1600–2300 dintre cele la cel mult 0,35 de motor
--    (Stockfish, adâncime 18). 7 semi-mutări după despărţire.
--  * grup = mutarea adversarului de la care porneşte capitolul;
--  * popularitate_pe_rating (capitol şi variante): Chess.com 400/700/1000/1300/
--    1600/1900, Lichess 400/1000/1200/1400/1600/1800/2000/2200; trepte cu sub
--    ${MIN_PARTIDE} de partide lăsate goale.
-- ============================================================

`
let nCap = 0
for (const v of v1.filter((x: { curs: string }) => cursuri.includes(x.curs))) {
  const k = `${v.curs}|${v.cod}`
  const lista = (peCapitol[k] ?? []).sort((a, b) => b.cheie - a.cheie).map(x => x.v)
  const json = JSON.stringify(lista)
  if (json.includes('$j$')) throw new Error('delimitator')
  sql += `update public.opening_lines l set grup = '${grupuri[k]}', popularitate_pe_rating = '${JSON.stringify(procente(k))}'::jsonb,
  variante = ${lista.length ? `$j$${json}$j$::jsonb` : 'null'}
  from public.courses c where c.id = l.course_id and c.slug = '${v.curs}' and l.variation_code = '${v.cod}';

`
  nCap++
}
sql += `do $$
declare n int; total int;
begin
  select count(*), coalesce(sum(jsonb_array_length(coalesce(l.variante, '[]'::jsonb))), 0) into n, total
    from public.opening_lines l join public.courses c on c.id = l.course_id
   where c.slug in (${cursuri.map(c => `'${c}'`).join(', ')}) and l.grup is not null and l.popularitate_pe_rating ? 'lichess';
  if n <> ${nCap} or total <> ${R.length} then
    raise exception 'Variante: % capitole, % variante; aşteptat ${nCap} şi ${R.length}', n, total;
  end if;
end $$;
`
writeFileSync(`supabase/migrations/${numar}_${nume}.sql`, sql)
for (const [k, lista] of Object.entries(peCapitol)) console.log(k, grupuri[k], '·', lista.map(x => (x.v as { nume: string }).nume).join(' | '))
