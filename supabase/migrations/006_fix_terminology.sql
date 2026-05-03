-- Migration 006: Fix opening variation terminology
-- Corrects: Romanian piece notation (B→F for Bishop, N→C for Knight),
-- inaccurate opening names (Benoni, Two Knights), and missing attack names (Keres).

-- ============================================================
-- LONDON SYSTEM
-- ============================================================

-- A: Nf6 → Cf6 (Cal = Knight in Romanian notation)
UPDATE public.opening_lines
SET variation_name = 'Linia Clasică (vs d5, Cf6)'
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'london-system')
  AND variation_code = 'A';

-- C: "Varianta Benoni" is incorrect — Benoni requires 1.d4 Nf6 2.c4 c5 3.d5.
-- After 1.d4 c5 2.c3 d5, this is London Anti-Benoni, not a true Benoni structure.
UPDATE public.opening_lines
SET variation_name = 'Anti-Benoni London (vs c5)'
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'london-system')
  AND variation_code = 'C';

-- Also fix the explanation text for line C (nested jsonb_set for multiple keys)
UPDATE public.opening_lines
SET move_explanations = jsonb_set(
  jsonb_set(
    move_explanations,
    '{1}',
    '"Adversarul joacă c5 imediat — atac agresiv al centrului. White răspunde cu c3, Anti-Benoni London."'
  ),
  '{5}',
  '"Adversarul joacă d5 — structura London clasică se instaurează, indiferent de ordinea mutărilor."'
)
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'london-system')
  AND variation_code = 'C';

-- ============================================================
-- ITALIAN GAME
-- ============================================================

-- A: Bc5 → Fc5 (F = Nebun/Fil = Bishop in Romanian chess notation)
UPDATE public.opening_lines
SET variation_name = 'Giuoco Piano (vs Fc5)'
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'italian-game')
  AND variation_code = 'A';

-- B: "Two Knights" with 4.d3 is specifically Giuoco Pianissimo (ECO C50).
-- The aggressive Two Knights lines use 4.Ng5; 4.d3 = positional/slow Italian.
UPDATE public.opening_lines
SET variation_name = 'Giuoco Pianissimo (vs Cf6)'
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'italian-game')
  AND variation_code = 'B';

-- C: Be7 → Fe7
UPDATE public.opening_lines
SET variation_name = 'Apărarea Ungară (vs Fe7)'
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'italian-game')
  AND variation_code = 'C';

-- ============================================================
-- SICILIAN DEFENSE
-- ============================================================

-- B: White's 6.g4 in the Scheveningen is specifically the Keres Attack (ECO B81),
-- named after Paul Keres who played it in 1943. Must be named explicitly.
UPDATE public.opening_lines
SET variation_name = 'Scheveningen — Atacul Keres (g4)'
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'sicilian-defense')
  AND variation_code = 'B';

-- C: Add "Varianta" prefix for consistency with other naming conventions
UPDATE public.opening_lines
SET variation_name = 'Varianta Dragon (g6)'
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'sicilian-defense')
  AND variation_code = 'C';

-- ============================================================
-- CARO-KANN DEFENSE
-- ============================================================

-- B (moves): fix invalid move g3f1 (no piece on g3) → b1a3 (Na3, Sveshnikov plan)
UPDATE public.opening_lines
SET moves_uci = 'e2e4 c7c6 d2d4 d7d5 e4e5 c8f5 g1f3 e7e6 f1e2 c6c5 e1g1 b8c6 c2c3 d8b6 b1a3 c5c4 f3e1 f5e4'
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'caro-kann-defense')
  AND variation_code = 'B';

-- B (explanations): add missing ply 14, fix ply 17 (no pawn on e4 to capture)
UPDATE public.opening_lines
SET move_explanations = move_explanations || jsonb_build_object(
  '14', 'Adversarul joacă Ca3! — Planul Sveshnikov. Calul vizează c2 pentru a apăra indirect b2 și d4.',
  '15', 'c4 — câștigai spațiu și blochezi centrul advers! Pionul pe c4 e greu de eliminat.',
  '16', 'Adversarul retrage Ce1 — eliberează câmpul f3 și pregătește reorganizarea centrală.',
  '17', 'Fe4! — nebunul activ pe e4, presiune centrală crescândă. Contra-joc solid.'
)
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'caro-kann-defense')
  AND variation_code = 'B';

-- A: Bf5 → Ff5; add "Varianta" prefix for consistency
UPDATE public.opening_lines
SET variation_name = 'Varianta Clasică (Ff5)'
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'caro-kann-defense')
  AND variation_code = 'A';

-- B: "(vs e5)" is confusing — White advances e5 (Advance Variation).
-- The qualifier implied Black plays vs e5, which is backwards.
UPDATE public.opening_lines
SET variation_name = 'Varianta Avans'
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'caro-kann-defense')
  AND variation_code = 'B';

-- ============================================================
-- FRENCH DEFENSE
-- ============================================================

-- A: Bb4 → Fb4
UPDATE public.opening_lines
SET variation_name = 'Winawer (Fb4)'
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'french-defense')
  AND variation_code = 'A';

-- Also fix "pawnii" → "pionii" in explanation text
UPDATE public.opening_lines
SET move_explanations = jsonb_set(
  move_explanations,
  '{5}',
  '"Fb4! — Varianta Winawer! Fixezi calul de pe c3 și ameninți să schimbi, slăbind pionii adversarului."'
)
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'french-defense')
  AND variation_code = 'A';

-- B: Nf6 → Cf6
UPDATE public.opening_lines
SET variation_name = 'Tarrasch (Cf6)'
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'french-defense')
  AND variation_code = 'B';

-- Also fix "dezvlotarea" → "dezvoltarea" typo in explanation text
UPDATE public.opening_lines
SET move_explanations = jsonb_set(
  move_explanations,
  '{5}',
  '"Cf6 — atacă e4 și pregătești dezvoltarea."'
)
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'french-defense')
  AND variation_code = 'B';

-- C: "devreme" → "timpuriu" (standard chess Romanian)
UPDATE public.opening_lines
SET variation_name = 'Varianta Avans — c5 timpuriu'
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'french-defense')
  AND variation_code = 'C';
