-- ============================================================
-- Capcanele: scoatem marcajele de îngroşare din explicaţii
-- ============================================================
-- Explicaţiile scrise în 044 conţin `**GREŞEALA!**` şi altele asemenea, adică
-- marcaje de îngroşare în stil Markdown. Antrenorul le afişează însă ca text
-- simplu, la fel ca toate celelalte explicaţii din proiect — deci pe ecran
-- apăreau chiar asteriscurile.
--
-- Nu adăugăm un randator de Markdown pentru două cuvinte: accentul îl duc deja
-- majusculele. Curăţăm textul.
--
-- Se aplică pe toate capcanele, nu doar pe cele trei de acum: dacă mâine cineva
-- scrie iar cu asteriscuri, o rulare a acestei migrări îndreaptă lucrurile.
-- ============================================================

update public.opening_traps
   set move_explanations = replace(move_explanations::text, '**', '')::jsonb
 where move_explanations::text like '%**%';


-- Verificare: trebuie să întoarcă zero rânduri.
--   select order_index, title
--     from public.opening_traps
--    where move_explanations::text like '%**%';
