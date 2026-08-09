# Capcanele ca al patrulea capitol — plan de implementare

> **Pentru cine execută:** folosește `superpowers:subagent-driven-development` sau `superpowers:executing-plans`. Pașii au casete (`- [ ]`) ca să se poată bifa.

**Scop:** cele trei capcane ale cursului Caro-Kann devin un capitol al traseului, cu o parcurgere ghidată și un exercițiu pentru fiecare, jucate din partea celui care întinde cursa.

**Arhitectură:** antrenorul existent capătă o a treia etapă, `trap`, iar încărcarea liniei iese din pagină într-un modul propriu, cu o funcție per etapă. Capcanele își iau din baza de date varianta din care răsar, explicațiile pe semi-mutare și punctul de la care se armează cursa. Capitolul se construiește în `CourseChapters`, lângă cele trei variante.

**Unelte:** React 19 + TypeScript, react-router, TanStack Query, Supabase (PostgreSQL), chess.js, react-chessboard, Tailwind.

**Specificația:** `docs/superpowers/specs/2026-08-09-capcane-ca-si-capitol-design.md`

## Constrângeri globale

- **Limba:** română cu diacritice corecte, atât în text vizibil, cât și în comentarii și mesaje de commit.
- **Verificarea tipurilor:** `node_modules/.bin/tsc -b --noEmit`. **NU** `tsc --noEmit` fără `-b` — `tsconfig.json` din rădăcină are `"files": []` și iese cu 0 fără să verifice nimic.
- **Lint:** `node_modules/.bin/eslint src/`.
- **Proiectul n-are teste automate.** Verificarea fiecărei etape e: tipuri, lint, interogare SQL de control, verificare în aplicația care rulează pe `http://localhost:5173`.
- **Migrările se rulează MANUAL** de utilizator, în SQL Editor din Supabase. Nu există `supabase db push` și nimic nu ține evidența a ce s-a aplicat. Nu presupune că o migrare din `supabase/migrations/` e în schemă.
- **Conținutul didactic se confirmă cu utilizatorul** înainte să intre în migrare. Nu se seedează explicații de șah neaprobate.
- **Commit doar când cere utilizatorul.** Pașii de commit din plan se pregătesc, dar se execută la cererea lui.
- Migrarea `043_proba_de_foc.sql` (Arena) există în fișiere, dar **nu e rulată**. Numerotarea continuă de la 044.

## Structura fișierelor

| Fișier | Răspunde de |
|---|---|
| `supabase/migrations/044_capcane_capitol.sql` (nou) | coloanele noi, legăturile, punctele de armare, explicațiile, RPC-ul extins |
| `src/lib/supabase.ts` (modificat) | tipurile rândului `opening_traps` și ale RPC-ului |
| `src/lib/trainer-line.ts` (nou) | încărcarea liniei de antrenat, o funcție per etapă |
| `src/pages/Courses/OpeningTrainerPage.tsx` (modificat) | etapa `trap`: o singură parte, rândurile de context, legăturile corecte |
| `src/App.tsx` (modificat) | cele două rute noi |
| `src/components/courses/CourseChapters.tsx` (modificat) | al patrulea capitol |
| `src/pages/Courses/CourseDetail.tsx` (modificat) | scoate acordeonul |
| `src/components/courses/OpeningTraps.tsx` (șters) | — |

---

### Task 1: Schema, legăturile și tipurile

Coloanele noi, legarea celor trei capcane de variantele lor, punctele de armare și RPC-ul extins. **Fără explicații de șah** — acelea vin în Task 2, după confirmare.

**Fișiere:**
- Creează: `supabase/migrations/044_capcane_capitol.sql`
- Modifică: `src/lib/supabase.ts` (interfața `OpeningTrapRow`, tipul de întors al lui `course_middlegame`)

**Interfețe produse:**
- Coloanele `opening_traps.opening_line_id uuid null`, `opening_traps.move_explanations jsonb not null default '{}'`, `opening_traps.spring_ply integer null`
- `course_middlegame(p_slug text)` întoarce în `traps` și câmpurile `id`, `opening_line_id`, `variation_name`, `spring_ply`
- `OpeningTrapRow` capătă `id`, `opening_line_id: string | null`, `move_explanations: Record<string, string>`, `spring_ply: number | null`

- [ ] **Pasul 1: Scrie migrarea**

Creează `supabase/migrations/044_capcane_capitol.sql`:

```sql
-- ============================================================
-- Capcanele devin capitol, nu anexă
-- ============================================================
-- Stăteau într-un acordeon sub curs: de citit, nu de exersat. Acum intră în
-- traseu, cu o parcurgere ghidată şi un exerciţiu pentru fiecare.
--
-- Trei lucruri le lipseau ca să poată fi jucate:
--   · din ce variantă răsar — ca să ştie omul unde le va întâlni, şi ca să
--     ştim cu ce culoare îl punem să joace;
--   · explicaţii pe semi-mutare, ca la teorie;
--   · de unde începe exerciţiul — nu de la 1.e4, ci din poziţia în care se
--     armează cursa.
-- ============================================================

alter table public.opening_traps
  /** Varianta din care răsare capcana. `null` = neatribuită; atunci capcana
      nu apare în traseu, fiindcă nu s-ar şti cu ce culoare se joacă. */
  add column if not exists opening_line_id uuid
    references public.opening_lines on delete set null,

  /** Explicaţii pe semi-mutare, indexate de la 0 — aceeaşi convenţie ca la
      `opening_lines.move_explanations`. */
  add column if not exists move_explanations jsonb not null default '{}'::jsonb,

  /** De la a câta semi-mutare porneşte exerciţiul. Semi-mutările dinainte se
      rejoacă pentru poziţia de plecare; nu se cer de la utilizator. */
  add column if not exists spring_ply integer;


-- Legarea capcanelor de variante, după codul variantei.
create or replace function public.seed_trap_link(
  p_slug text, p_ord integer, p_code text, p_spring integer
)
returns void language plpgsql security definer as $$
begin
  update public.opening_traps t
    set opening_line_id = l.id, spring_ply = p_spring
  from public.opening_lines l
  join public.courses c on c.id = l.course_id
  where t.course_id = c.id
    and c.slug = p_slug
    and l.variation_code = p_code
    and t.order_index = p_ord;
end;
$$;

revoke execute on function public.seed_trap_link(text, integer, text, integer) from authenticated;


-- CARO-KANN
-- 1. Matul de pe d6 — din Clasică. Cursa se armează la 5.De2 (semi-mutarea 8).
select public.seed_trap_link('caro-kann-defense', 1, 'A', 8);
-- 2. Nebunul închis în cuşcă — din Avans. Cursa se armează la 5.g4 (8).
select public.seed_trap_link('caro-kann-defense', 2, 'B', 8);
-- 3. Nebunul pe d3 — din Avans. Negrul pedepseşte începând cu 4...Nxd3 (7).
select public.seed_trap_link('caro-kann-defense', 3, 'B', 7);


-- ------------------------------------------------------------
-- RPC-ul, cu ce-i trebuie capitolului
-- ------------------------------------------------------------
create or replace function public.course_middlegame(p_slug text)
returns jsonb language sql security definer stable as $$
  with c as (
    select id from public.courses where slug = p_slug
  ),
  coloane as (
    select coalesce(jsonb_agg(x order by x_ord), '[]'::jsonb) as v
    from (
      select
        l.order_index as x_ord,
        jsonb_build_object(
          'line_id', l.id,
          'variation_name', l.variation_name,
          'variation_code', l.variation_code,
          'popularity_pct', l.popularity_pct,
          'moves_uci', l.moves_uci,
          'structure', p.structure,
          'ideas', coalesce(p.ideas, '[]'::jsonb),
          'avoid', p.avoid
        ) as x
      from public.opening_lines l
      left join public.middlegame_plans p on p.opening_line_id = l.id
      where l.course_id = (select id from c)
      order by l.order_index
    ) s
  ),
  capcane as (
    select coalesce(jsonb_agg(y order by y_ord), '[]'::jsonb) as v
    from (
      select
        t.order_index as y_ord,
        jsonb_build_object(
          'id', t.id,
          'title', t.title,
          'victim', t.victim,
          'moves_uci', t.moves_uci,
          'explanation', t.explanation,
          'opening_line_id', t.opening_line_id,
          'variation_name', l.variation_name,
          'spring_ply', t.spring_ply
        ) as y
      from public.opening_traps t
      left join public.opening_lines l on l.id = t.opening_line_id
      where t.course_id = (select id from c)
      order by t.order_index
    ) s
  )
  select jsonb_build_object(
    'variations', (select v from coloane),
    'traps', (select v from capcane)
  );
$$;

grant execute on function public.course_middlegame(text) to authenticated;
```

- [ ] **Pasul 2: Actualizează rândul din tipuri**

În `src/lib/supabase.ts`, interfața `OpeningTrapRow` (în jurul rândului 238) capătă trei câmpuri. Formă finală:

```ts
export interface OpeningTrapRow {
  id: string
  course_id: string
  order_index: number
  title: string
  victim: 'ours' | 'theirs'
  moves_uci: string
  explanation: string
  /** Varianta din care răsare. `null` = neatribuită, deci nu intră în traseu. */
  opening_line_id: string | null
  /** Explicaţii pe semi-mutare, indexate de la 0. */
  move_explanations: Record<string, string>
  /** De la a câta semi-mutare porneşte exerciţiul. */
  spring_ply: number | null
  created_at: string
}
```

Verifică întâi câmpurile existente cu `Read` — păstrează-le exact cum sunt, adaugă-le doar pe cele trei noi. Actualizează și lista de coloane opţionale la inserare:

```ts
opening_traps: TableDef<OpeningTrapRow, 'id' | 'opening_line_id' | 'move_explanations' | 'spring_ply'>
```

- [ ] **Pasul 3: Actualizează tipul RPC-ului**

Tot în `src/lib/supabase.ts`, în `Functions.course_middlegame.Returns`, blocul `traps` devine:

```ts
traps: {
  id: string
  title: string
  victim: 'ours' | 'theirs'
  moves_uci: string
  explanation: string
  opening_line_id: string | null
  variation_name: string | null
  spring_ply: number | null
}[]
```

- [ ] **Pasul 4: Verifică tipurile și lintul**

```bash
node_modules/.bin/tsc -b --noEmit && node_modules/.bin/eslint src/
```

Se aşteaptă: ambele ies cu 0. Dacă `OpeningTraps.tsx` se plânge că lipsesc câmpuri, e în regulă — el va fi şters în Task 6; adaugă câmpurile în interfaţa lui locală ca să treacă până atunci.

- [ ] **Pasul 5: Pregătește commit-ul (execută-l când cere utilizatorul)**

```bash
git add supabase/migrations/044_capcane_capitol.sql src/lib/supabase.ts
git commit -m "$(cat <<'EOF'
capcane: schema pentru capcanele din traseu

Trei coloane noi pe opening_traps: varianta din care răsar, explicaţiile pe
semi-mutare şi punctul de la care se armează cursa. Fără ele, o capcană nu
poate fi jucată: nu se ştie cu ce culoare, nu se ştie de unde.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Explicațiile pe semi-mutare

Conținut didactic nou. **Se scrie, se prezintă utilizatorului, și abia după confirmare intră în migrare.**

**Fișiere:**
- Modifică: `supabase/migrations/044_capcane_capitol.sql`

**Interfețe produse:** `opening_traps.move_explanations` populat pentru cele trei capcane Caro-Kann.

- [ ] **Pasul 1: Rejoacă mutările și notează pozițiile**

Rulează scriptul de mai jos ca să ai lista de semi-mutări în notaţie citibilă, cu numerotarea corectă. Nu scrie explicaţii din memorie — scrie-le uitându-te la poziţie.

```bash
node -e "
const {Chess}=require('chess.js');
const capcane=[
 ['Matul de pe d6','e2e4 c7c6 d2d4 d7d5 b1c3 d5e4 c3e4 b8d7 d1e2 g8f6 e4d6'],
 ['Nebunul inchis in cusca','e2e4 c7c6 d2d4 d7d5 e4e5 c8f5 h2h4 e7e6 g2g4 f5g6 h4h5'],
 ['Nebunul pe d3','e2e4 c7c6 d2d4 d7d5 e4e5 c8f5 f1d3 f5d3 d1d3 e7e6 b1c3 d8b6'],
];
for(const [nume,linie] of capcane){
  console.log('\n=== '+nume+' ===');
  const g=new Chess();
  linie.split(' ').forEach((u,i)=>{
    const m=g.move({from:u.slice(0,2),to:u.slice(2,4),promotion:u[4]||'q'});
    console.log(String(i).padStart(2),m.color==='w'?'alb ':'negru',m.san.padEnd(6),g.fen().split(' ')[0]);
  });
}
"
```

- [ ] **Pasul 2: Scrie explicațiile**

O propoziţie–două pe semi-mutare. Regulile de ton, luate din explicaţiile care există deja la jocul de mijloc:

- se spune **de ce**, nu ce se vede pe tablă („Cd7 pare firesc: apără e5 şi pregăteşte Cgf6" — nu „calul merge pe d7")
- la mutarea greşită se spune de ce e ispititoare, nu doar că e greşită
- fără jargon nedefinit; utilizatorul e intermediar, nu maestru
- la lovitura finală se spune ce face imposibilă apărarea

Nu inventa evaluări pe care nu le poţi susţine. Dacă nu eşti sigur pe o afirmaţie, scrie mai puţin.

- [ ] **Pasul 3: Prezintă-le utilizatorului și așteaptă confirmarea**

Arată-i-le în chat, capcană cu capcană, cu numărul semi-mutării şi mutarea în notaţie românească. **Nu trece la pasul următor fără „da".** Dacă cere schimbări, schimbă şi arată din nou.

- [ ] **Pasul 4: Adaugă-le în migrare**

În `044_capcane_capitol.sql`, după blocul cu `seed_trap_link`, adaugă funcţia şi apelurile:

```sql
create or replace function public.seed_trap_moves(
  p_slug text, p_ord integer, p_expl jsonb
)
returns void language plpgsql security definer as $$
begin
  update public.opening_traps t
    set move_explanations = p_expl
  from public.courses c
  where t.course_id = c.id and c.slug = p_slug and t.order_index = p_ord;
end;
$$;

revoke execute on function public.seed_trap_moves(text, integer, jsonb) from authenticated;

select public.seed_trap_moves('caro-kann-defense', 1, '{ ... }'::jsonb);
select public.seed_trap_moves('caro-kann-defense', 2, '{ ... }'::jsonb);
select public.seed_trap_moves('caro-kann-defense', 3, '{ ... }'::jsonb);
```

Înlocuieşte `{ ... }` cu textul confirmat la Pasul 3, cheile fiind indicii semi-mutărilor ca şiruri (`"0"`, `"1"`, …).

- [ ] **Pasul 5: Cere utilizatorului să ruleze migrarea**

Migrarea se rulează manual. Spune-i exact:

> Deschide SQL Editor în Supabase, lipeşte tot conţinutul lui `supabase/migrations/044_capcane_capitol.sql` şi rulează-l. E singura migrare restantă în afară de 043 (Arena), care e independentă.

- [ ] **Pasul 6: Verifică în baza de date**

După ce confirmă că a rulat:

```bash
node -e "
const fs=require('fs');
const env=Object.fromEntries(fs.readFileSync('.env','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(), l.slice(i+1).trim()]}));
const {VITE_SUPABASE_URL:url, VITE_SUPABASE_ANON_KEY:key}=env;
(async()=>{
  const r=await fetch(url+'/rest/v1/rpc/course_middlegame',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({p_slug:'caro-kann-defense'})});
  const d=await r.json();
  d.traps.forEach(t=>console.log(t.order_index??'', t.title,'| varianta:',t.variation_name,'| armare:',t.spring_ply,'| id:',t.id?'da':'LIPSA'));
})();
"
```

Se aşteaptă: trei rânduri, fiecare cu nume de variantă (Clasică, Avans, Avans), `spring_ply` 8, 8, 7 şi `id` prezent.

- [ ] **Pasul 7: Pregătește commit-ul**

```bash
git add supabase/migrations/044_capcane_capitol.sql
git commit -m "$(cat <<'EOF'
capcane: explicaţii pe fiecare semi-mutare

Ca la teorie: la fiecare mutare se spune de ce, nu ce. Textele au fost
verificate cu poziţia în faţă şi confirmate înainte de a intra în migrare.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Încărcarea liniei iese din pagină

Refacere fără schimbare de comportament. `OpeningTrainerPage` are ~700 de rânduri, iar etapa `trap` i-ar adăuga a treia ramură de încărcare înfiptă într-un `useQuery` din mijlocul componentei.

**Fișiere:**
- Creează: `src/lib/trainer-line.ts`
- Modifică: `src/pages/Courses/OpeningTrainerPage.tsx` (importurile, `interface MiddlegamePlan`, `type TrainerLine`, `queryFn`-ul)

**Interfețe produse:**

```ts
export type TrainerStage = 'opening' | 'middlegame' | 'trap'
export interface MiddlegamePlan { structure: string | null; ideas: { title: string; detail: string }[]; avoid: string | null }
export type TrainerLine = OpeningLine & { start_fen?: string; plan?: MiddlegamePlan }
export async function incarcaLinie(stage: TrainerStage, mode: 'guided' | 'practice', id: string): Promise<TrainerLine | null>
```

- [ ] **Pasul 1: Creează modulul cu ce există azi**

`src/lib/trainer-line.ts`. Mută în el, **fără să schimbi logica**, cele două ramuri din `queryFn`-ul actual (`OpeningTrainerPage.tsx`, în jurul rândurilor 120–170). La această etapă `incarcaLinie` tratează doar `'opening'` şi `'middlegame'`; ramura `'trap'` întoarce `null` şi primeşte trup în Task 4.

```ts
import { Chess } from 'chess.js'
import { supabase } from '@/lib/supabase'
import type { OpeningLine } from '@/types'

export type TrainerStage = 'opening' | 'middlegame' | 'trap'

/** Planul din spatele mutărilor: structura, ideile şi greşeala tipică. */
export interface MiddlegamePlan {
  structure: string | null
  ideas: { title: string; detail: string }[]
  avoid: string | null
}

/**
 * Linia antrenată, oricare ar fi etapa.
 *
 * Jocul de mijloc şi capcanele pornesc din poziţii deja jucate, deci nu mai e
 * adevărat că semi-mutarea 0 e a albului — de aceea `start_fen`.
 */
export type TrainerLine = OpeningLine & {
  /** Poziţia de plecare. Lipsă = poziţia iniţială a partidei. */
  start_fen?: string
  /** Doar la etapa de joc de mijloc. */
  plan?: MiddlegamePlan
}

/** Poziţia după primele `pana` semi-mutări dintr-o listă UCI. */
function fenDupa(moves: string, pana: number, dela?: string): string {
  const game = new Chess(dela)
  moves.split(' ').slice(0, pana).forEach(m => {
    try { game.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m[4] ?? 'q' }) }
    catch { /* mutare imposibilă în datele semănate — ne oprim aici */ }
  })
  return game.fen()
}

async function linieDeschidere(lineId: string): Promise<TrainerLine | null> {
  const { data } = await supabase.from('opening_lines').select('*').eq('id', lineId).single()
  return (data as OpeningLine | null) ?? null
}

async function linieJocDeMijloc(lineId: string): Promise<TrainerLine | null> {
  const opening = await linieDeschidere(lineId)
  if (!opening) return null

  const { data: plan } = await supabase
    .from('middlegame_plans')
    .select('moves_uci, move_explanations, structure, ideas, avoid')
    .eq('opening_line_id', opening.id)
    .single()
  if (!plan?.moves_uci) return null

  return {
    ...opening,
    moves_uci: plan.moves_uci,
    move_explanations: (plan.move_explanations ?? {}) as Record<string, string>,
    // Poziţia de la capătul deschiderii, reconstruită — ca să nu ţinem un FEN
    // duplicat în baza de date.
    start_fen: fenDupa(opening.moves_uci, opening.moves_uci.split(' ').length),
    plan: {
      structure: plan.structure,
      ideas: plan.ideas ?? [],
      avoid: plan.avoid,
    },
  }
}

export async function incarcaLinie(
  stage: TrainerStage,
  mode: 'guided' | 'practice',
  id: string,
): Promise<TrainerLine | null> {
  if (stage === 'middlegame') return linieJocDeMijloc(id)
  if (stage === 'trap') return null // primeşte trup în etapa următoare
  return linieDeschidere(id)
}
```

- [ ] **Pasul 2: Subțiază pagina**

În `OpeningTrainerPage.tsx`:
- şterge `interface MiddlegamePlan` şi `type TrainerLine` locale; importă-le din `@/lib/trainer-line`
- înlocuieşte tot corpul lui `queryFn` cu `() => incarcaLinie(stage, mode, lineId!)`
- păstrează `queryKey: ['trainer-line', lineId, stage]` şi adaugă `mode` în cheie: `['trainer-line', lineId, stage, mode]` — la capcane, modul schimbă mutările încărcate
- scoate importul `Chess` dacă nu mai e folosit în pagină (atenţie: e folosit şi în `handlePieceDrop` şi în efectul de auto-play — cel mai probabil rămâne)
- exportă în continuare `TrainerLine` din pagină doar dacă îl importă altcineva; verifică cu `Grep` şi, dacă nu, nu-l reexporta

- [ ] **Pasul 3: Verifică tipurile și lintul**

```bash
node_modules/.bin/tsc -b --noEmit && node_modules/.bin/eslint src/
```

- [ ] **Pasul 4: Verifică în aplicație că n-ai stricat nimic**

Serverul rulează pe `http://localhost:5173`. Deschide, în ordine:
1. `/courses/caro-kann-defense/guided/<id-variantă>` — teoria porneşte, pătratul auriu arată mutarea, explicaţiile apar
2. `/courses/caro-kann-defense/middlegame/<id-variantă>` — porneşte din poziţia de după deschidere, panoul „Planul variantei" e deschis
3. `/courses/caro-kann-defense/middlegame-practice/<id-variantă>` — panoul e strâns

ID-urile variantelor se iau din interogarea de la Task 2, Pasul 6.

Atenţie la verificare: layout-ul are derulare interioară, deci o captură `fullPage` iese neagră sub primul ecran. Verifică textul din pagină, nu poza.

- [ ] **Pasul 5: Pregătește commit-ul**

```bash
git add src/lib/trainer-line.ts src/pages/Courses/OpeningTrainerPage.tsx
git commit -m "$(cat <<'EOF'
antrenor: încărcarea liniei iese din pagină

Pagina avea 700 de rânduri şi două ramuri de încărcare înfipte într-un
useQuery. Acum fiecare etapă îşi spune singură de unde îşi ia datele, iar
pagina primeşte o linie şi nu mai ştie de unde vine. Fără schimbare de
comportament.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Etapa `trap` în antrenor

**Fișiere:**
- Modifică: `src/lib/trainer-line.ts` (funcţia `linieCapcana`)
- Modifică: `src/pages/Courses/OpeningTrainerPage.tsx` (o singură parte, rândurile de context, legăturile)
- Modifică: `src/App.tsx` (rutele)

**Interfețe consumate:** `incarcaLinie(stage, mode, id)` din Task 3; coloanele din Task 1.

**Interfețe produse:** `TrainerLine` capătă trei câmpuri opţionale, folosite numai la capcane:

```ts
/** Din ce variantă răsare capcana. */
fromVariation?: string
/** Paragraful de încheiere, arătat la capătul liniei. */
conclusion?: string
/** Linia nu se rupe în părţi (capcanele au 11–12 semi-mutări). */
singlePart?: boolean
```

- [ ] **Pasul 1: Scrie încărcarea capcanei**

În `src/lib/trainer-line.ts`, adaugă câmpurile de mai sus în `TrainerLine`, apoi funcţia:

```ts
/**
 * O capcană, modelată ca linie de antrenat.
 *
 * Culoarea nu se scrie de mână, se deduce: dacă victima e cel care ţine
 * deschiderea, tu joci cu cealaltă culoare — fiindcă tu eşti cel care întinde
 * cursa. De aceea capcana are nevoie de varianta din care răsare: de acolo vine
 * `user_color`.
 */
async function linieCapcana(trapId: string, mode: 'guided' | 'practice'): Promise<TrainerLine | null> {
  const { data: trap } = await supabase
    .from('opening_traps')
    .select('*')
    .eq('id', trapId)
    .single()
  if (!trap?.opening_line_id) return null

  const { data: linie } = await supabase
    .from('opening_lines')
    .select('*')
    .eq('id', trap.opening_line_id)
    .single()
  if (!linie) return null

  const alTau = trap.victim === 'ours'
    ? (linie.user_color === 'white' ? 'black' : 'white')
    : linie.user_color

  const exerseaza = mode === 'practice' && trap.spring_ply != null && trap.spring_ply > 0
  const toate = trap.moves_uci.split(' ')

  return {
    ...linie,
    id: trap.id,
    variation_name: trap.title,
    user_color: alTau,
    moves_uci: exerseaza ? toate.slice(trap.spring_ply!).join(' ') : trap.moves_uci,
    // La exerciţiu nu se arată explicaţii, deci nu are rost să le reindexăm.
    move_explanations: exerseaza ? {} : (trap.move_explanations ?? {}),
    start_fen: exerseaza ? fenDupa(trap.moves_uci, trap.spring_ply!) : undefined,
    fromVariation: linie.variation_name,
    conclusion: trap.explanation,
    singlePart: true,
  }
}
```

Şi în `incarcaLinie`, înlocuieşte rândul-cioată:

```ts
if (stage === 'trap') return linieCapcana(id, mode)
```

- [ ] **Pasul 2: O singură parte la capcane**

În `OpeningTrainerPage.tsx`, `getPartEnd` şi `getTotalParts` rup linia la semi-mutările 10 şi 16. O capcană are 11–12, deci ar apărea „Partea 1 din 2" şi butonul „eşti gata de faza următoare?" în mijlocul unei curse de şase mutări.

Adaugă parametrul şi foloseşte-l peste tot unde se cheamă cele două funcţii (`buildInitialState`, `buildResumedState`, corpul componentei, `advancePart`):

```ts
function getPartEnd(totalPlies: number, part: number, singlePart = false): number {
  if (singlePart) return totalPlies
  if (part === 1) return Math.min(PART_ENDS[0], totalPlies)
  if (part === 2) return Math.min(PART_ENDS[1], totalPlies)
  return totalPlies
}

function getTotalParts(totalPlies: number, singlePart = false): number {
  if (singlePart) return 1
  if (totalPlies > PART_ENDS[1]) return 3
  if (totalPlies > PART_ENDS[0]) return 2
  return 1
}
```

Iar eticheta părţii, azi `PART_LABELS[i]`, devine:

```ts
const etichetaParte = (i: number) => line.singlePart ? 'Capcana, de la cap la coadă' : PART_LABELS[i]
```

- [ ] **Pasul 3: Rândurile de context**

Sub titlu (în jurul rândului 375, unde scrie `{isGuided ? 'Mod ghidat' : 'Pe cont propriu'}`), la etapa `trap` se adaugă din ce variantă vine şi de ce joci culoarea aia:

```tsx
{isTrap && line.fromVariation && (
  <p className="mt-1 text-sm text-[#6B6B6B]">
    Din <span className="text-[#A0A0A0]">{line.fromVariation}</span> · {line.user_color === 'white'
      ? 'joci cu albul — tu întinzi cursa'
      : 'joci cu negrul — tu pedepseşti greşeala'}
  </p>
)}
```

unde `const isTrap = stage === 'trap'`.

- [ ] **Pasul 4: Încheierea și legăturile**

Trei locuri din pagină presupun azi că există doar deschidere şi joc de mijloc:

1. Textul de la capătul liniei — `isMiddlegame ? 'Planul dus până la capăt!' : 'Opening parcurs cu succes!'` devine:

```tsx
{isTrap ? 'Capcana, ştiută pe de rost!' : isMiddlegame ? 'Planul dus până la capăt!' : 'Opening parcurs cu succes!'}
```

2. Legătura „Parcurge ideile din jocul de mijloc" apare azi când `!isMiddlegame`, deci ar apărea şi la capcane. Condiţia devine `stage === 'opening'`.

3. Comutatorul de mod trebuie să ducă la rutele de capcană:

```tsx
const ruta = (ghidat: boolean) =>
  isTrap
    ? `/courses/${slug}/${ghidat ? 'trap' : 'trap-practice'}/${lineId}`
    : isMiddlegame
      ? `/courses/${slug}/${ghidat ? 'middlegame' : 'middlegame-practice'}/${lineId}`
      : `/courses/${slug}/${ghidat ? 'guided' : 'practice'}/${lineId}`
```

Adaugă şi paragraful de încheiere sub textul de succes, când linia s-a terminat:

```tsx
{isTrap && line.conclusion && state.status === 'line-done' && (
  <p className="mt-2 text-sm leading-relaxed text-[#A0A0A0]">{line.conclusion}</p>
)}
```

- [ ] **Pasul 5: Rutele**

În `src/App.tsx`, după rândul cu `middlegame-practice` (în jurul rândului 104):

```tsx
<Route path="/courses/:slug/trap/:lineId" element={<OpeningTrainerPage mode="guided" stage="trap" />} />
<Route path="/courses/:slug/trap-practice/:lineId" element={<OpeningTrainerPage mode="practice" stage="trap" />} />
```

Numele parametrului rămâne `:lineId`, nu `:trapId` — pagina îl citeşte din `useParams` sub numele ăsta şi n-are rost să-l schimbi în trei locuri pentru o etichetă.

Tipul `stage` din `Props` devine `'opening' | 'middlegame' | 'trap'`.

- [ ] **Pasul 6: Verifică tipurile și lintul**

```bash
node_modules/.bin/tsc -b --noEmit && node_modules/.bin/eslint src/
```

- [ ] **Pasul 7: Verifică în aplicație**

Ia `id`-urile capcanelor din interogarea de la Task 2, Pasul 6. Apoi:

1. `/courses/caro-kann-defense/trap/<id-capcana-1>` — joci cu **albul**, sub titlu scrie „Din Varianta Clasică (Nf5) · joci cu albul — tu întinzi cursa", apare explicaţie la fiecare mutare, iar progresul arată o singură parte
2. Dus până la capăt: scrie „Capcana, ştiută pe de rost!", apare paragraful de încheiere, **nu** apare legătura către jocul de mijloc
3. `/courses/caro-kann-defense/trap-practice/<id-capcana-1>` — porneşte din poziţia de după 4...Cd7 (calul negru pe d7, dama albă încă pe d1), nu de la poziţia iniţială
4. `/courses/caro-kann-defense/trap/<id-capcana-3>` — joci cu **negrul**, textul spune „pedepseşti greşeala"
5. Comutatorul „Ghidat / Pe cont propriu" duce la rutele de capcană, nu la teorie
6. Panoul „Planul variantei" **nu** apare la capcane. N-ar trebui să fie nevoie de nicio schimbare — condiţia lui e `isMiddlegame && line.plan`, iar `linieCapcana` nu pune `plan` — dar confirmă cu ochii, nu prin raţionament

- [ ] **Pasul 8: Pregătește commit-ul**

```bash
git add src/lib/trainer-line.ts src/pages/Courses/OpeningTrainerPage.tsx src/App.tsx
git commit -m "$(cat <<'EOF'
capcane: se joacă, nu se citesc

Antrenorul capătă etapa `trap`. Culoarea se deduce din cine cade în cursă:
dacă victima e cel care ţine deschiderea, joci cu cealaltă culoare, fiindcă
tu eşti cel care o întinde. Exerciţiul porneşte din poziţia în care se armează
cursa, nu de la 1.e4 — primele patru mutări se ştiu.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Al patrulea capitol

**Fișiere:**
- Modifică: `src/components/courses/CourseChapters.tsx`

**Interfețe consumate:** RPC-ul extins din Task 1; rutele din Task 4.

- [ ] **Pasul 1: Ia capcanele din aceeași interogare**

`CourseChapters` cheamă azi `course_middlegame` şi păstrează doar mulţimea de variante cu plan. Schimbă `queryFn` ca să păstreze şi capcanele:

```ts
const { data: dinCurs } = useQuery({
  queryKey: ['course-middlegame', slug],
  queryFn: async () => {
    const { data } = await supabase.rpc('course_middlegame', { p_slug: slug })
    return {
      cuPlan: new Set((data?.variations ?? []).filter(v => v.structure).map(v => v.line_id)),
      capcane: (data?.traps ?? []).filter(t => t.opening_line_id),
    }
  },
})
```

Foloseşte aceeaşi `queryKey` ca `OpeningTraps` folosea (`['course-middlegame', slug]`), ca interogarea să fie una singură.

Înlocuieşte folosirea de azi, `cuPlan?.has(line.id)`, cu `dinCurs?.cuPlan.has(line.id)`.

- [ ] **Pasul 2: Construiește capitolul**

După `const capitole: Capitol[] = lines.map(...)`, adaugă:

```ts
// Capcanele nu ţin de o variantă anume, ci de deschidere ca întreg — de aceea
// capitol separat, nu noduri împrăştiate prin celelalte. Fiecare îşi poartă
// eticheta variantei din care răsare, pe pagina ei.
const capcane = dinCurs?.capcane ?? []
if (capcane.length > 0) {
  const variante = [...new Set(capcane.map(c => c.variation_name).filter(Boolean))]
  capitole.push({
    lineId: 'capcane',
    titlu: 'Capcane uzuale',
    subtitlu: `${capcane.length} capcane · din ${variante.join(' şi ')}`,
    terminat: capcane.every(c => completedIds.includes(c.id)),
    noduri: capcane.flatMap(c => [
      {
        id: `${c.id}-lectie`,
        kind: 'lectie' as const,
        title: `${c.title} — pas cu pas`,
        href: `/courses/${slug}/trap/${c.id}`,
        done: completedIds.includes(c.id),
      },
      // Fără punct de armare n-am de unde porni exerciţiul, deci nodul lipseşte.
      ...(c.spring_ply != null ? [{
        id: `${c.id}-exercitiu`,
        kind: 'exercitiu' as const,
        title: `${c.title} — pe cont propriu`,
        href: `/courses/${slug}/trap-practice/${c.id}`,
      }] : []),
    ]),
  })
}
```

Fără nod de verificare: întrebările de capitol nu există nicăieri încă.

- [ ] **Pasul 3: Verifică deschiderea implicită**

`useState` alege azi capitolul la care ai rămas: `capitole.find(c => !c.terminat)`. Cu capcanele adăugate la coadă, comportamentul rămâne corect — se deschide prima variantă neterminată, iar capcanele doar dacă tot restul e gata. Nu schimba nimic, dar citeşte rândul şi confirmă că `capitole` e complet **înainte** de `useState`.

- [ ] **Pasul 4: Verifică tipurile și lintul**

```bash
node_modules/.bin/tsc -b --noEmit && node_modules/.bin/eslint src/
```

- [ ] **Pasul 5: Verifică în aplicație**

Pe `/courses/caro-kann-defense`:
1. apare „CAPITOLUL 4 · Capcane uzuale", cu subtitlul „3 capcane · din Varianta Clasică (Nf5) şi Varianta Avans"
2. deschis, are 6 noduri: carte, gantere, carte, gantere, carte, gantere
3. primul nod duce la parcurgerea capcanei 1; al doilea e închis până termini primul
4. celelalte trei capitole au rămas neatinse, cu 5 noduri fiecare
5. **Progresul:** du prima capcană până la capăt în mod ghidat, apoi reîncarcă pagina cursului. Nodul-lecţie e verde cu bifă, nodul-exerciţiu s-a descuiat, a apărut „+30 XP", iar contorul de sus scrie tot „x din 3 variante parcurse" — capcanele nu trebuie să-l umfle

- [ ] **Pasul 6: Pregătește commit-ul**

```bash
git add src/components/courses/CourseChapters.tsx
git commit -m "$(cat <<'EOF'
capcane: al patrulea capitol în traseu

Capcanele ţin de deschidere ca întreg, nu de o variantă anume — de aceea
capitol separat, cu eticheta variantei pe pagina fiecăreia.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Acordeonul iese de sub curs

**Fișiere:**
- Modifică: `src/pages/Courses/CourseDetail.tsx`
- Șterge: `src/components/courses/OpeningTraps.tsx`

- [ ] **Pasul 1: Scoate componenta din pagină**

În `CourseDetail.tsx`: şterge importul lui `OpeningTraps` şi blocul `{slug && <OpeningTraps slug={slug} />}` de la finalul componentei, împreună cu comentariul lui.

- [ ] **Pasul 2: Șterge fișierul**

```bash
rm src/components/courses/OpeningTraps.tsx
```

- [ ] **Pasul 3: Verifică tipurile și lintul**

```bash
node_modules/.bin/tsc -b --noEmit && node_modules/.bin/eslint src/
```

Se aşteaptă 0 la amândouă. Dacă `OpeningBoard` nu mai e folosit nicăieri, **lasă-l** — e folosit şi de evenimente; verifică întâi cu `Grep`.

- [ ] **Pasul 4: Verifică în aplicație**

Pe `/courses/caro-kann-defense`, sub capitole nu mai apare nimic. Capcanele se ajung doar prin capitolul 4.

- [ ] **Pasul 5: Pregătește commit-ul**

```bash
git add -A src/pages/Courses/CourseDetail.tsx src/components/courses/OpeningTraps.tsx
git commit -m "$(cat <<'EOF'
capcane: acordeonul de sub curs dispare

Acelaşi conţinut în două locuri e o dublură care se desincronizează.
Capcanele au acum o singură casă: capitolul din traseu.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Verificarea finală

- [ ] `node_modules/.bin/tsc -b --noEmit` iese cu 0
- [ ] `node_modules/.bin/eslint src/` iese cu 0
- [ ] Migrarea 044 e rulată, iar interogarea de control întoarce trei capcane cu variantă, punct de armare şi explicaţii
- [ ] Capitolul 4 are 6 noduri şi se deschide
- [ ] Capcana 1 se joacă din partea albului, capcana 3 din a negrului
- [ ] Exerciţiul capcanei 1 porneşte din poziţia de după 4...Cd7
- [ ] Acordeonul a dispărut de sub curs
- [ ] Traseele celorlalte trei capitole n-au fost atinse

## Ce urmează, în afara acestui plan

Utilizatorul a cerut aceeaşi schemă pentru celelalte cursuri de negru, unul câte unul. Aceea e muncă de conţinut peste structura construită aici: pentru fiecare curs, planurile de joc de mijloc, mutările lor, capcanele şi explicaţiile. Se face după ce Caro-Kann e complet şi verificat, ca să existe un model de urmat.
