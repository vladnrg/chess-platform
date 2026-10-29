-- 118_texte_antrenor.sql
-- Locurile pentru textele antrenorului în stilul Chessly (docs/antrenor-stil-chessly.md).
--
-- Contractul dintre panou şi flota de cursuri, scris în baza de date. Panoul le
-- citeşte când există şi cade pe textele vechi (`move_explanations`) când lipsesc,
-- deci se pot umple curs cu curs, fără ca vreun curs să rămână gol între timp.
--
--   intro          introducerea variantei, la poziţia de start
--   move_comments  { ply: text } — câte unul pe fiecare mutare a ta: ce a jucat
--                  adversarul, ce răspunzi şi de ce. Cheia e semi-mutarea ta.
--   move_hints     { ply: text } — indiciul de la a treia greşeală, la exersare:
--                  piesa de mutat, fără pătratul ţintă
--   final_text     planul de după ultima mutare
--   final_arrows   [{ "from": "e2", "to": "e4" }] — săgeţile ideilor din plan
--
-- Aceleaşi coloane şi pe jocul de mijloc, care e tot o variantă de antrenat.
-- Idempotentă.

alter table public.opening_lines
  add column if not exists intro text,
  add column if not exists move_comments jsonb,
  add column if not exists move_hints jsonb,
  add column if not exists final_text text,
  add column if not exists final_arrows jsonb;

alter table public.middlegame_plans
  add column if not exists intro text,
  add column if not exists move_comments jsonb,
  add column if not exists move_hints jsonb,
  add column if not exists final_text text,
  add column if not exists final_arrows jsonb;

-- Dovadă (trebuie să iasă: 5 | 5)
select
  (select count(*) from information_schema.columns where table_schema = 'public' and table_name = 'opening_lines'
     and column_name in ('intro', 'move_comments', 'move_hints', 'final_text', 'final_arrows')) as opening_lines,
  (select count(*) from information_schema.columns where table_schema = 'public' and table_name = 'middlegame_plans'
     and column_name in ('intro', 'move_comments', 'move_hints', 'final_text', 'final_arrows')) as middlegame_plans;
