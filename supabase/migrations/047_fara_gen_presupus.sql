-- ============================================================
-- Nu presupunem genul celui cu care joci
-- ============================================================
-- Textele spuneau „piesele lui", „atacul lui", „avantajul lui de spaţiu".
-- Gramatical, „lui" trimitea la substantivul „albul"; la citit însă sună ca şi
-- cum adversarul ar fi bărbat. Nu ştim asta despre nimeni.
--
-- Peste tot unde e vorba de partea adversă, scriem „albul". E şi mai precis:
-- într-o lecţie plină de piese albe şi negre, „lui" cere un pas de gândire în
-- plus ca să afli despre cine e vorba.
--
-- Rămân neatinse construcţiile în care „lui" sau „el" nu trimit la o persoană:
--   · „împotriva lui 4.h4", „tot rostul lui 4...Nf5" — se referă la o mutare;
--   · „baza lui e d4" — se referă la lanţul de pioni;
--   · „după g4 el trebuie să aibă unde se retrage" — se referă la nebun.
--
-- Înlocuirile au fost testate întâi pe datele reale: JSON-ul rămâne valid şi
-- niciun rând nu se pierde.
-- ============================================================

-- Încheierile capcanelor
update public.opening_traps
   set explanation = replace(explanation, 'piesele lui', 'piesele albului')
 where explanation like '%piesele lui%';

-- Explicaţiile pe semi-mutare ale capcanelor
update public.opening_traps
   set move_explanations = replace(move_explanations::text, 'dama lui', 'dama albă')::jsonb
 where move_explanations::text like '%dama lui%';

-- Planurile de joc de mijloc: structura, ideile şi greşeala tipică
update public.middlegame_plans
   set structure = replace(structure, 'lanţului lui', 'lanţului alb')
 where structure like '%lanţului lui%';

update public.middlegame_plans
   set ideas = replace(
                 replace(
                   replace(ideas::text, 'a lui are', 'a albului are'),
                   'avantajul lui de spaţiu', 'avantajul de spaţiu al albului'),
                 'atacul lui', 'atacul albului')::jsonb
 where ideas::text like '%a lui are%'
    or ideas::text like '%avantajul lui de spaţiu%'
    or ideas::text like '%atacul lui%';

-- Explicaţiile pe semi-mutare ale planurilor
update public.middlegame_plans
   set move_explanations = replace(
                             replace(move_explanations::text, 'atacul lui', 'atacul albului'),
                             'spaţiul lui în plus', 'spaţiul în plus al albului')::jsonb
 where move_explanations::text like '%atacul lui%'
    or move_explanations::text like '%spaţiul lui în plus%';


-- Verificare: trebuie să întoarcă zero rânduri.
--   select 'capcană' as unde, order_index::text as care from public.opening_traps
--    where explanation like '%piesele lui%' or move_explanations::text like '%dama lui%'
--   union all
--   select 'plan', id::text from public.middlegame_plans
--    where structure like '%lanţului lui%'
--       or ideas::text like '%a lui are%' or ideas::text like '%atacul lui%'
--       or move_explanations::text like '%atacul lui%';
