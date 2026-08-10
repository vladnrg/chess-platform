-- ============================================================
-- Fiecare variantă apărea de două ori
-- ============================================================
-- Cincisprezece cursuri aveau şase rânduri în `opening_lines`, dar numai trei
-- variante adevărate: fiecare era înregistrată de două ori. Pe pagina cursului
-- se vedeau şase capitole, dintre care al doilea, al patrulea şi al şaselea
-- repetau cuvânt cu cuvânt pe cele dinaintea lor.
--
-- Verificat înainte de ştergere, pe datele reale:
--   · cele 45 de rânduri în plus sunt copii identice — nu diferă prin niciun
--     câmp, nici măcar prin explicaţiile pe semi-mutare;
--   · niciunul nu are plan de joc de mijloc sau capcană legată de el;
--   · niciunul nu apare în progresul vreunui utilizator.
-- Deci ştergerea nu pierde nimic şi nu rupe nicio legătură.
--
-- Copiile poartă acelaşi `order_index` ca originalele, deci după ştergere
-- numerotarea rămâne 1-2-3, fără goluri de umplut.
--
-- Se păstrează rândul cu `id`-ul cel mai mic din fiecare grup. Alegerea nu
-- contează — rândurile sunt identice — dar trebuie să fie una singură şi
-- repetabilă, ca migrarea să dea acelaşi rezultat oriunde ar fi rulată.
-- ============================================================

delete from public.opening_lines l
 where exists (
   select 1
     from public.opening_lines k
    where k.course_id = l.course_id
      and k.variation_code = l.variation_code
      and k.id < l.id
 );


-- ------------------------------------------------------------
-- Ca să nu se mai întâmple
-- ------------------------------------------------------------
-- Duplicatele au apărut fiindcă nimic nu le oprea: un curs putea avea de
-- oricâte ori aceeaşi variantă. Regula lipsea din schemă, deşi era limpede în
-- capul tuturor. Acum e scrisă.
alter table public.opening_lines
  add constraint opening_lines_curs_varianta_unic
  unique (course_id, variation_code);


-- Verificare, după rulare: trebuie să întoarcă zero rânduri.
--   select c.slug, l.variation_code, count(*)
--     from public.opening_lines l
--     join public.courses c on c.id = l.course_id
--    group by c.slug, l.variation_code
--   having count(*) > 1;
