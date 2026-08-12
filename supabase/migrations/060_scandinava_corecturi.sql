-- ============================================================
-- Scandinava: trei afirmaţii ale mele care nu stăteau în picioare
-- ============================================================
-- Migrarea 059 a înlocuit toate cele 59 de explicaţii ale cursului. La auditul
-- de după, trei dintre textele NOI s-au dovedit greşite — scrise de mine, nu
-- moştenite. Le corectez aici, cu ce arată poziţia.
--
--  · A, 3...Da5 — „priveşte spre e1". Diagonala a5-b4-c3-d2-e1 e blocată de
--    calul alb de pe c3 şi de pionul de pe d2. Dama nu vede e1. Ce e adevărat:
--    de pe a5 apasă pe calul de pe c3, fiindcă b4 e liber.
--
--  · B, 3...Cxd5 — „calul nu poate fi alungat cu un tempo". Albul are c4, Cc3
--    şi Nc4 la dispoziţie, iar c4 chiar se joacă patru mutări mai încolo, în
--    chiar linia asta. Ce e adevărat: alungarea costă o mutare de pion, nu una
--    de dezvoltare — spre deosebire de Cc3 împotriva damei.
--
--  · C, 8.Dc2 — „atacă amândoi caii din centru". Negrul are cai pe e4 şi b8.
--    Doar unul e în centru, iar dama nu-l atinge pe celălalt.
--
-- Plus o formulare vagă strânsă la A, mutarea 10...Nxe6.
--
-- Nota de metodă: greşelile astea au trecut de prima verificare fiindcă am
-- măsurat mutările şi evaluările, dar nu şi afirmaţiile despre cine ce vede pe
-- tablă. Sunt exact clasa de propoziţie care sună a manual şi nu se verifică
-- singură.
-- ============================================================

update public.opening_lines l
   set move_explanations =
         jsonb_set(
           jsonb_set(l.move_explanations, '{5}',
             to_jsonb('Da5 — ai ştiut de la mutarea a treia că aici ajunge. Pe a5 dama nu poate fi alungată de niciun pion, iar de acolo apasă chiar pe calul de pe c3: câmpul b4 dintre ele e liber.'::text)),
           '{19}',
           to_jsonb('Nxe6 — reiei cu nebunul. Materialul e egal, iar nebunul ajunge pe e6, unde nu-l mai blochează niciun pion de-al tău: cei de pe d şi e s-au schimbat deja.'::text))
  from public.courses c
 where l.course_id = c.id and c.slug = 'scandinavian-defense' and l.variation_code = 'A';

update public.opening_lines l
   set move_explanations = jsonb_set(l.move_explanations, '{5}',
         to_jsonb('Cxd5 — îl iei cu calul, nu cu dama. Deosebirea se vede peste două mutări: împotriva damei, albul juca Cc3 şi ataca dezvoltându-se în acelaşi timp. Aici, dacă joacă Cc3, tu schimbi pur şi simplu. Alungarea calului tău vine mai târziu, cu c4 — dar aceea e o mutare de pion, nu una care îi scoate o piesă.'::text))
  from public.courses c
 where l.course_id = c.id and c.slug = 'scandinavian-defense' and l.variation_code = 'B';

update public.opening_lines l
   set move_explanations = jsonb_set(l.move_explanations, '{14}',
         to_jsonb('Adversarul îşi mută dama pe c2, de unde apasă pe calul tău din centru, cel de pe e4.'::text))
  from public.courses c
 where l.course_id = c.id and c.slug = 'scandinavian-defense' and l.variation_code = 'C';


-- Verificare, după rulare: niciunul dintre textele vechi nu mai trebuie să existe.
--   select variation_code from public.opening_lines l
--     join public.courses c on c.id = l.course_id
--    where c.slug = 'scandinavian-defense'
--      and (move_explanations::text like '%priveşte spre e1%'
--        or move_explanations::text like '%alungat cu un tempo%'
--        or move_explanations::text like '%amândoi caii din centru%');
