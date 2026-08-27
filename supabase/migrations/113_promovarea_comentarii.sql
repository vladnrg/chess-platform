-- ============================================================
-- Promovarea pionului: comentariile mutărilor negrului.
--
-- Rândul de deasupra tablei spunea „negrul mută regele de pe h3 pe g4" după
-- fiecare mutare — coordonate, la fiecare pas, despre o partidă în care singurul
-- lucru care contează e dacă regele a intrat sau nu în pătratul pionului.
-- Comentariile de aici îi iau locul: unde există unul scris, rândul cu
-- coordonate tace.
--
-- Zona „e6:g8" e chiar pătratul pionului de pe e6: două mutări până la capăt,
-- deci trei coloane şi trei rânduri. Regele negru ajunge pe g4 — sub el, cu un
-- rând. De aceea nu-l mai prinde, şi de aceea se desenează.
-- ============================================================

update public.lessons
   set exercises = jsonb_set(
         jsonb_set(
           jsonb_set(
             jsonb_set(
               exercises,
               '{0,line,0,comentariu}',
               to_jsonb('Regele negru se apropie, dar cursa este deja pierdută. Fiindcă regele nu se află în interiorul pătratului la finalul mutării negrului, pionul nu poate fi oprit din a promova.'::text)
             ),
             '{0,line,0,zona}',
             to_jsonb('e6:g8'::text)
           ),
           '{0,line,1,comentariu}',
           to_jsonb('Regele negru se apropie de pionul alb, sperând la o minune.'::text)
         ),
         '{0,line,2,comentariu}',
         to_jsonb('Albul promovează, iar matul se va da în câteva mutări. Planul e să limitezi mutările regelui negru cu dama şi să te apropii cu regele tău, asigurând victoria într-unul din colţurile tablei.'::text)
       )
 where title = 'Promovarea pionului'
   and exercises -> 0 -> 'line' -> 2 is not null;

-- Dovada: trebuie să iasă 3 comentarii şi o zonă, la lecţia „Promovarea pionului".
select
  count(*) filter (where pas ->> 'comentariu' is not null) as "comentarii (astept 3)",
  count(*) filter (where pas ->> 'zona' is not null)       as "zone (astept 1)"
from public.lessons l
cross join lateral jsonb_array_elements(l.exercises -> 0 -> 'line') as pas
where l.title = 'Promovarea pionului';
