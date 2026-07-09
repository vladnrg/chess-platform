-- 022_fix_rook_terminology.sql
-- Corectează denumirea turei: "turn/turnul" (masculin) -> "tura/tură" (feminin),
-- terminologia corectă în șahul modern românesc.
--
-- Se tratează și genul (turnul tău -> tura ta) și cazurile flexionate:
--   turnul -> tura · turnului -> turei · turnuri -> ture · turnurile -> turele · turn -> tură
-- Cuvintele turneu/turnee și "return" NU se ating (word boundary + forme exacte).
-- Rulează ultima, deci corectează atât datele live, cât și instalările noi.

CREATE OR REPLACE FUNCTION pg_temp.fix_rook(t text) RETURNS text AS $f$
  SELECT regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(
         regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(
           regexp_replace(t, '\mturnul tău\M', 'tura ta', 'g'),
           '\mTurnul\M', 'Tura', 'g'),
         '\mturnul\M', 'tura', 'g'),
         '\mTurnului\M', 'Turei', 'g'),
         '\mturnului\M', 'turei', 'g'),
       '\mTurnurile\M', 'Turele', 'g'),
       '\mturnurile\M', 'turele', 'g'),
     '\mTurnuri\M', 'Ture', 'g'),
     '\mturnuri\M', 'ture', 'g'),
   '\mTurn\M', 'Tură', 'g'),
   '\mturn\M', 'tură', 'g')
$f$ LANGUAGE sql IMMUTABLE;

-- Liniile de deschidere
UPDATE public.opening_lines
SET variation_name = pg_temp.fix_rook(variation_name),
    move_explanations = pg_temp.fix_rook(move_explanations::text)::jsonb;

-- Descrierile de curs
UPDATE public.courses
SET description = pg_temp.fix_rook(description)
WHERE description IS NOT NULL;

-- Lecțiile (titlu, teorie, exerciții, poziții-cheie)
UPDATE public.lessons
SET title = pg_temp.fix_rook(title),
    theory_html = pg_temp.fix_rook(theory_html),
    exercises = pg_temp.fix_rook(exercises::text)::jsonb,
    key_positions = pg_temp.fix_rook(key_positions::text)::jsonb;
