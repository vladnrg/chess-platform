-- ============================================================
-- 134 · Numele capitolului în fraza de început (Italiana)
--
-- Cerut pe 2026-11-24: „În cele ce urmează, ne vom concentra pe studiul
-- Apărării celor doi cai. Această variantă apare după mutările standard …"
-- Fraza vrea numele scurt şi la genitiv, nu titlul întreg al capitolului
-- („Apărarea celor doi cai (varianta liniştită cu d3)"). Genitivul nu se poate
-- calcula sigur din titlu, aşa că se scrie aici, pe capitol. Unde lipseşte,
-- aplicaţia rămâne la „capitolul „X"".
--
-- Forma pentru B e a utilizatorului; celelalte sunt propunerile mele, după
-- acelaşi model.
-- ============================================================

alter table public.opening_lines add column if not exists nume_in_fraza text;

update public.opening_lines l
   set nume_in_fraza = v.nume
  from public.courses c,
       (values
         ('A',  'variantei Giuoco Piano'),
         ('B',  'Apărării celor doi cai'),
         ('C',  'Apărării Ungare'),
         ('D',  'variantei Giuoco Pianissimo'),
         ('E',  'Gambitului Evans'),
         ('P1', 'răspunsului 3…h6'),
         ('P2', 'răspunsului 3…d6'),
         ('P3', 'capcanei Blackburne Shilling (3…Cd4)')
       ) as v(cod, nume)
 where c.id = l.course_id
   and c.slug = 'italian-game'
   and l.variation_code = v.cod;

do $$
declare n int;
begin
  select count(*) into n
    from public.opening_lines l join public.courses c on c.id = l.course_id
   where c.slug = 'italian-game' and l.nume_in_fraza is not null;
  if n <> 8 then
    raise exception 'Italiana: % capitole cu nume_in_fraza, aşteptat 8', n;
  end if;
end $$;
