-- 120_nebunul_cu_n.sql
-- Nebunul se notează cu N, peste tot (decis pe 2026-11-19).
--
-- Migrarea 021 a trecut deja F → N în deschideri şi descrieri de curs, dar n-a
-- atins lecţiile. A rămas lecţia „Abrevierile pieselor", care învăţa F=Nebun (Fil)
-- şi cerea F ca răspuns corect — exact pe dos faţă de restul aplicaţiei, unde
-- Nebunul e N (Nf4, Nd3 în cursurile de deschideri).

UPDATE public.lessons
SET
  theory_html = replace(
    theory_html,
    '<strong>F</strong>=Nebun (Fil)',
    '<strong>N</strong>=Nebun'
  ),
  -- Al doilea exerciţiu: răspunsul corect devine N. Variantele greşite sunt T şi
  -- C (alte piese) şi B (litera din engleză, confuzia cea mai des întâlnită).
  exercises = jsonb_set(
    exercises,
    '{1}',
    jsonb_build_object(
      'type', 'identify_square',
      'square', 'N',
      'options', jsonb_build_array('T', 'B', 'N', 'C'),
      'instruction', 'Cum se notează Nebunul în notația română?'
    )
  )
WHERE id = '1a25f2ed-8932-4c26-8a1f-102b95be0766'
  AND exercises -> 1 ->> 'square' = 'F';

-- Dovada: nicio lecţie nu mai conţine F ca notaţie a Nebunului.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.lessons
    WHERE theory_html LIKE '%<strong>F</strong>%'
       OR theory_html LIKE '%(Fil)%'
       OR exercises::text LIKE '%"square": "F"%'
       OR exercises::text LIKE '%(Fil)%'
  ) THEN
    RAISE EXCEPTION 'Încă există lecţii cu F pentru Nebun';
  END IF;
END $$;
