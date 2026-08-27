-- ============================================================
-- Repara textul dupa migrarea care a inlocuit "dama" cu "regina".
-- ============================================================

update public.middlegame_plans p
   set structure = replace(
     p.structure,
     'ai rămas cu un pion pe d4, cu regina pe b3',
     'ai rămas cu un pion izolat pe d4 — fără vecini albi pe coloanele c sau e —, cu regina pe b3'
   )
  from public.opening_lines l
  join public.courses c on c.id = l.course_id
 where p.opening_line_id = l.id
   and c.slug = 'italian-game'
   and l.variation_code = 'A';
