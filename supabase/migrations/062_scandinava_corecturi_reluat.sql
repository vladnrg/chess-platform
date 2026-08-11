-- ============================================================
-- Scandinava: corecturile din 060, reluate — de data asta cu dovadă
-- ============================================================
-- Migrarea 060 conţinea aceste trei corecturi şi a fost rulată de două ori,
-- fără să aibă efect. Am verificat fişierul: instrucţiunile sunt echilibrate,
-- apostrofurile pereche, fără caractere neobişnuite — iar 061, scris exact la
-- fel, a intrat din prima. Nu ştiu de ce a eşuat.
--
-- De aceea fişierul ăsta e scris altfel: fiecare instrucţiune e simplă, fără
-- apeluri imbricate, iar la sfârşit e o interogare care afişează rezultatul.
-- Dacă la rulare vezi trei rânduri cu „corectat", a mers. Dacă vezi „ÎNCĂ
-- VECHI", n-a mers, şi ştim asta pe loc, nu peste o zi.
--
-- Cele trei afirmaţii greşite, toate scrise de mine în 059:
--   A, 3...Da5   — „priveşte spre e1", deşi diagonala e blocată de calul de pe
--                  c3 şi de pionul de pe d2.
--   B, 3...Cxd5  — „nu poate fi alungat cu un tempo", deşi c4 face exact asta
--                  patru mutări mai încolo, în chiar linia noastră.
--   C, 8.Dc2     — „atacă amândoi caii din centru", deşi negrul are un singur
--                  cal acolo; celălalt e pe b8.
-- ============================================================

update public.opening_lines l
   set move_explanations = jsonb_set(l.move_explanations, '{5}',
         to_jsonb('Da5 — ai ştiut de la mutarea a treia că aici ajunge. Pe a5 dama nu poate fi alungată de niciun pion, iar de acolo apasă chiar pe calul de pe c3: câmpul b4 dintre ele e liber.'::text))
  from public.courses c
 where l.course_id = c.id and c.slug = 'scandinavian-defense' and l.variation_code = 'A';

update public.opening_lines l
   set move_explanations = jsonb_set(l.move_explanations, '{19}',
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


-- ------------------------------------------------------------
-- Dovada. Rulată odată cu migrarea, afişează ce s-a întâmplat.
-- ------------------------------------------------------------
select
  l.variation_code as varianta,
  case
    when l.variation_code = 'A' and l.move_explanations->>'5' like '%priveşte spre e1%' then 'ÎNCĂ VECHI'
    when l.variation_code = 'B' and l.move_explanations->>'5' like '%alungat cu un tempo%' then 'ÎNCĂ VECHI'
    when l.variation_code = 'C' and l.move_explanations->>'14' like '%amândoi caii%' then 'ÎNCĂ VECHI'
    else 'corectat'
  end as stare
from public.opening_lines l
join public.courses c on c.id = l.course_id
where c.slug = 'scandinavian-defense'
order by l.variation_code;
