-- ============================================================
-- 137 · Variantele capitolului (ca „Variation 1 of 2" pe Chessly)
--
-- Cerut pe 2026-11-25. Jocul de mijloc nu mai e o parte separată: mutările lui
-- se lipesc, în aplicaţie, la capătul variantei principale (middlegame_plans
-- rămâne neatins). În locul lui, capitolul primeşte ramificaţii: poziţii în
-- care adversarul face altă mutare frecventă. Se învaţă câte două, apoi se
-- exersează aceleaşi două.
--
-- `variante` = lista ramificaţiilor (varianta 1 e rândul însuşi), fiecare cu:
--   nume, moves_uci (de la prima mutare), move_explanations (de la locul
--   despărţirii), move_marks, final_text, final_arrows, popularitate_niveluri.
-- ============================================================

alter table public.opening_lines add column if not exists variante jsonb;
