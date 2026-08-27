-- ============================================================
-- „Tocmai" iese din construcţiile despre mutări
-- ============================================================
-- Migrarea 105 a trecut la prezent mutarea care se petrece acum, dar a păstrat
-- „tocmai" lângă verb: „albul tocmai împinge pionul". Cuvântul nu adaugă nimic —
-- piesa abia s-a aşezat sub ochii elevului, cu săgeata încă pe tablă, deci
-- „acum" se vede, nu trebuie spus. Rămâne „albul împinge pionul".
--
-- Trecutul rămâne unde e povestea partidei de până aici: „albul a împins trei
-- pioni" spune cum s-a ajuns la poziţie, şi acolo e forma potrivită. Ce se
-- schimbă e doar ce se iveşte acum pe tablă.
--
-- Sunt patru locuri, aceleaşi pe care le-a găsit `terminologie.mjs` — după ce i
-- s-a reparat regula: capătul de cuvânt era scris cu `\b`, care în JavaScript se
-- uită doar la litere ASCII, aşa că „mută" urmat de spaţiu nu se potrivea
-- niciodată şi „albul tocmai mută nebunul pe d3" trecea nevăzut.

update public.lessons
set exercises = replace(exercises::text, 'tocmai împinge', 'împinge')::jsonb
where exercises::text like '%tocmai împinge%';

update public.middlegame_plans
set structure = replace(structure, 'tocmai împinge', 'împinge')
where structure like '%tocmai împinge%';

update public.opening_traps
set explanation = replace(explanation, 'tocmai ia ', 'ia ')
where explanation like '%tocmai ia %';

update public.opening_traps
set explanation = replace(explanation, 'tocmai mută', 'mută')
where explanation like '%tocmai mută%';


-- ============================================================
-- Dovada: trebuie să iasă 0, 0, 0, 0
-- ============================================================
-- „Tocmai" lipit de un verb de mutare nu mai apare nicăieri în conţinut — nici
-- la prezent, nici la trecut. Al patrulea rând se uită şi la deschideri, unde
-- n-a fost niciodată, ca să rămână aşa.
select
  (select count(*) from public.lessons
    where coalesce(theory_html, '') || coalesce(exercises::text, '')          ~ tipar)  as "in_lectii",
  (select count(*) from public.middlegame_plans
    where structure || coalesce(avoid, '') || ideas::text
          || coalesce(move_explanations::text, '')                            ~ tipar)  as "in_planuri",
  (select count(*) from public.opening_traps
    where coalesce(explanation, '') || coalesce(move_explanations::text, '')  ~ tipar)  as "in_capcane",
  (select count(*) from public.opening_lines
    where coalesce(move_explanations::text, '')                               ~ tipar)  as "in_deschideri"
from (select 'tocmai ((.i-)?(a|au) )?(mută|împinge|ia |joacă|capturează|mutat|împins|jucat|luat|capturat)' as tipar) t;
