-- ============================================================
-- Două clişee care nu ţin, în cursuri deja „terminate"
-- ============================================================
-- După ce Scandinava a scos la iveală trei afirmaţii false despre cine ce vede
-- pe tablă, am trecut aceeaşi verificare peste toate cursurile de negru gata
-- făcute. A găsit două, amândouă propoziţii care sună a manual şi de aceea
-- n-au fost puse la îndoială de nimeni.
--
--  · Siciliana / Dragon, 6...Ng7 — „pe g7 apasă direct pe d4". Nu apasă:
--    propriul cal de pe f6 stă chiar pe diagonală. Nebunul ajunge la d4 abia
--    după ce pleacă acel cal. Aceeaşi afirmaţie fusese deja refuzată la
--    scrierea planului de joc de mijloc pentru acelaşi curs — dar rămăsese în
--    lecţia de teorie, unde nu ne uitasem.
--
--  · Caro-Kann / Avans, 8.Ca3 — „calul vizează c2 pentru a apăra indirect b2
--    şi d4". Un cal aşezat pe c2 apără b4, d4, a1, a3, e1 şi e3. Nu şi b2.
--    Jumătate din afirmaţie era corectă.
--
-- Verificarea care le-a prins compară fiecare pereche de câmpuri pomenite
-- într-un text cu ce se poate ajunge efectiv pe tablă în poziţia de acolo.
-- Evaluările şi legalitatea mutărilor nu spun nimic despre asemenea afirmaţii:
-- poziţia rămâne bună chiar dacă explicaţia de sub ea e greşită.
-- ============================================================

update public.opening_lines l
   set move_explanations = jsonb_set(l.move_explanations, '{11}',
         to_jsonb('Ng7 — nebunul Dragon, pus pe diagonala care contează. Deocamdată nu vede până la d4: propriul tău cal de pe f6 îi stă în drum. De aceea, în Dragon, mutarea calului de pe f6 nu e doar o mutare de cal — e clipa în care nebunul începe să existe.'::text))
  from public.courses c
 where l.course_id = c.id and c.slug = 'sicilian-defense' and l.variation_code = 'C';

update public.opening_lines l
   set move_explanations = jsonb_set(l.move_explanations, '{14}',
         to_jsonb('Adversarul joacă Ca3 — Planul Sveshnikov. Calul pare împins la margine, dar are drum spre c2, de unde ar apăra pionul de d4. Pe b2 nu ajunge din c2, deşi pare aproape: un cal nu apără câmpul de lângă el.'::text))
  from public.courses c
 where l.course_id = c.id and c.slug = 'caro-kann-defense' and l.variation_code = 'B';


-- Verificare, după rulare: trebuie să întoarcă zero rânduri.
--   select c.slug, l.variation_code from public.opening_lines l
--     join public.courses c on c.id = l.course_id
--    where move_explanations::text like '%apasă direct pe d4%'
--       or move_explanations::text like '%apăra indirect b2%';
