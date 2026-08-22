-- ============================================================
-- Cerinţele nu mai repetă ce se vede acum pe tablă
-- ============================================================
-- Ultima mutare a adversarului se arată de acum pe tabla exerciţiului: pătratul
-- de plecare şi cel de sosire colorate, o săgeată între ele şi un rând scris
-- deasupra tablei — „Albul tocmai a împins pionul de pe h2 pe h4".
--
-- Trei cerinţe începeau exact cu propoziţia aia, fiindcă până acum era singurul
-- loc din care se putea afla. Aşa, omul o citeşte de două ori la rând, cuvânt cu
-- cuvânt, la un centimetru distanţă. Rămâne doar ce are el de făcut.
--
-- Nu se pierde nimic: informaţia nu dispare, îşi schimbă locul — din text, pe
-- tablă, unde oricum trebuia să se uite.

update public.lessons
set exercises = (
  replace(replace(replace(
    exercises::text,
    'Albul tocmai a împins pionul de pe h2 pe h4 — mută pionul tău de pe g4 pe h3',
      'Mută pionul tău de pe g4 pe h3'),
    'Negrul tocmai a împins pionul de pe f7 pe f5 — mută pionul tău de pe g5 pe f6',
      'Mută pionul tău de pe g5 pe f6'),
    'Albul tocmai a împins pionul de pe b2 pe b4. Pionul negru de pe c4 îl ia en passant — pe ce pătrat ajunge?',
      'Pionul negru de pe c4 îl ia en passant — pe ce pătrat ajunge?')
)::jsonb
where title = 'En passant';


-- ============================================================
-- Dovada: trebuie să arate 4, 4, 0
-- ============================================================
-- Patru exerciţii; toate patru au încă în FEN câmpul de en passant, din care se
-- deduce mutarea arătată pe tablă; niciuna dintre cerinţe n-o mai repetă.
select
  jsonb_array_length(exercises)                                          as "cate_exercitii",
  (select count(*) from jsonb_array_elements(exercises) e
     where split_part(e->>'fen', ' ', 4) <> '-')                         as "cu_ultima_mutare",
  (select count(*) from jsonb_array_elements(exercises) e
     where e->>'instruction' like '%tocmai a împins%')                   as "cerinte_care_repeta"
from public.lessons
where title = 'En passant';
