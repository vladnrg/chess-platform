-- 020_fix_piece_phrasing.sql
-- Uniformizează formularea pozițiilor pieselor: "calul c6" -> "calul de pe c6".
--
-- Doar Forma 1 (piesă articulată/genitiv urmată DIRECT de pătrat). Forma 2
-- ("calul pe f3") rămâne neatinsă intenționat — acolo "pe" înseamnă deseori
-- destinația unei mutări, iar "de pe" ar inversa sensul.
--
-- Idempotent: după conversie, piesa nu mai e urmată direct de pătrat ("calul de pe c6"),
-- deci o rulare repetată nu mai potrivește nimic. Sigur pentru Forma 2 fiindcă după
-- piesă urmează "pe" (iar [a-h] nu prinde litera 'p').

DO $$
DECLARE
  pat text := '\m(calul|calului|caii|cailor|nebunul|nebunului|nebunii|nebunilor|turnul|turnului|tura|turele|dama|damei|regele|regelui|pionul|pionului|pionii|pionilor)\s+([a-h][1-8])\M';
BEGIN
  -- Explicațiile de mutări (jsonb) din liniile de deschidere
  UPDATE public.opening_lines
  SET move_explanations = regexp_replace(move_explanations::text, pat, '\1 de pe \2', 'gi')::jsonb
  WHERE move_explanations IS NOT NULL
    AND move_explanations::text ~* pat;

  -- Descrierile de curs
  UPDATE public.courses
  SET description = regexp_replace(description, pat, '\1 de pe \2', 'gi')
  WHERE description IS NOT NULL
    AND description ~* pat;
END $$;
