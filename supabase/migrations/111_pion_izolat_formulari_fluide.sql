-- ============================================================
-- Slefuire de fraze dupa normalizarea referintelor.
-- ============================================================

update public.middlegame_plans p
   set avoid = replace(
     p.avoid,
     'Într-o poziţie cu pionul izolat de pe d4 de atacat',
     'Într-o poziţie în care ataci pionul izolat de pe d4'
   )
  from public.opening_lines l
  join public.courses c on c.id = l.course_id
 where p.opening_line_id = l.id
   and c.slug = 'nimzo-indian-defense'
   and l.variation_code = 'B';

update public.middlegame_plans p
   set ideas = replace(
     p.ideas::text,
     'Câmpul din faţa pionului izolat de pe d5, d4, e cel mai bun',
     'Câmpul d4, din faţa pionului izolat de pe d5, e cel mai bun'
   )::jsonb
  from public.opening_lines l
  join public.courses c on c.id = l.course_id
 where p.opening_line_id = l.id
   and c.slug = 'catalan-opening'
   and l.variation_code = 'C';
