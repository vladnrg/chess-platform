-- 021_fix_piece_notation.sql
-- Uniformizează notația pieselor la standardul românesc modern:
--   Nebun = N, Cal = C, Damă = D, Tură = T, Rege = R.
--
-- Datele au acum un amestec: nebunul e scris mai ales cu F (Fil), plus rămășițe
-- englezești B; calul e C, cu rămășițe englezești N. Convertim, în ordinea care
-- evită coliziunea literelor:
--   1) N (cal englezesc) → C   (toate "N" curente sunt cai)
--   2) F (nebun/Fil)     → N
--   3) B (nebun englez)  → N
--
-- Un "N/F/B" e tratat ca mutare DOAR dacă e urmat de coordonată (ex. Fc5, Bxe5,
-- Nbd7) — deci cuvintele (Nimzo, Bird, Fără), FEN-urile și UCI-ul rămân neatinse.

CREATE OR REPLACE FUNCTION pg_temp.fix_notation(t text) RETURNS text AS $func$
  SELECT regexp_replace(
           regexp_replace(
             regexp_replace(t, '\mN([a-h1-8]?x?[a-h][1-8][+#]?)', 'C\1', 'g'),
             '\mF([a-h1-8]?x?[a-h][1-8][+#]?)', 'N\1', 'g'),
           '\mB([a-h1-8]?x?[a-h][1-8][+#]?)', 'N\1', 'g')
$func$ LANGUAGE sql IMMUTABLE;

-- Liniile de deschidere: numele variantei + explicațiile mutărilor (jsonb)
UPDATE public.opening_lines
SET variation_name = pg_temp.fix_notation(variation_name),
    move_explanations = pg_temp.fix_notation(move_explanations::text)::jsonb;

-- Descrierile de curs (conțin secvențe de mutări)
UPDATE public.courses
SET description = pg_temp.fix_notation(description)
WHERE description IS NOT NULL;
