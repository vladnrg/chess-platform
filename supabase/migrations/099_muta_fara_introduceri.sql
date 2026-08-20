-- ============================================================
-- Cerinţele: „mută", nu „trage". Şi fără decor înainte.
-- ============================================================
-- „Trage pionul" descria gestul cu mouse-ul, nu mutarea de şah — şi suna ciudat
-- citit cu voce tare. Verbul e „mută", peste tot.
--
-- Iar două cerinţe începeau cu o descriere a tablei: „Final de partidă, doar cu
-- pioni și regi" şi „Tablă plină, aceeași regulă". Ce se vede pe tablă se vede
-- oricum, uitându-te la ea. Ce nu se vede — că adversarul tocmai a împins un
-- pion cu două pătrate — rămâne, fiindcă exact asta face captura posibilă.

update public.lessons
set exercises = (
  replace(replace(replace(
    exercises::text,
    'Trage pionul tău de pe e5 pe d6',
      'Mută pionul tău de pe e5 pe d6'),
    'Final de partidă, doar cu pioni și regi. Albul tocmai a împins pionul de pe h2 pe h4 — trage pionul tău de pe g4 pe h3',
      'Albul tocmai a împins pionul de pe h2 pe h4 — mută pionul tău de pe g4 pe h3'),
    'Tablă plină, aceeași regulă: negrul tocmai a împins pionul de pe f7 pe f5 — trage pionul tău de pe g5 pe f6',
      'Negrul tocmai a împins pionul de pe f7 pe f5 — mută pionul tău de pe g5 pe f6')
)::jsonb
where exercises::text like '%rage pionul%';


-- ============================================================
-- Dovada: prima cifră 0, a doua 3
-- ============================================================
select
  (select count(*) from public.lessons where exercises::text ~ '[Tt]rage ')       as "mai_scrie_trage",
  (select count(*) from jsonb_array_elements(
     (select exercises from public.lessons where title = 'En passant')) e
     where e->>'instruction' like '%ută pionul tău%')                             as "cerinte_cu_muta";
