-- ============================================================
-- Referintele ulterioare pastreaza patratul pionului izolat.
-- ============================================================

update public.middlegame_plans p
   set ideas = replace(
       replace(
         replace(
           p.ideas::text,
           'Stă chiar în faţa celui izolat',
           'Stă chiar în faţa pionului izolat de pe d4'
         ),
         'pionul izolat contează mai mult',
         'pionul izolat de pe d4 contează mai mult'
       ),
       'Ataci pionul izolat cu un pion',
       'Ataci pionul izolat de pe d4 cu un pion'
     )::jsonb,
     avoid = replace(
       p.avoid,
       'Pionul izolat valorează',
       'Pionul izolat de pe d4 valorează'
     ),
     move_explanations = replace(
       replace(
         p.move_explanations::text,
         'pionul lui izolat n-are',
         'pionul lui izolat de pe d4 n-are'
       ),
       'Ataci pionul izolat cu un pion',
       'Ataci pionul izolat de pe d4 cu un pion'
     )::jsonb
  from public.opening_lines l
  join public.courses c on c.id = l.course_id
 where p.opening_line_id = l.id
   and c.slug = 'french-defense'
   and l.variation_code = 'B';

update public.middlegame_plans p
   set structure = replace(
       p.structure,
       'pionul izolat nu mai are',
       'pionul izolat de pe d4 nu mai are'
     ),
     ideas = replace(
       replace(
         p.ideas::text,
         'Un pion izolat nu se câştigă',
         'Pionul izolat de pe d4 nu se câştigă'
       ),
       'Un pion izolat e periculos',
       'Pionul izolat de pe d4 e periculos'
     )::jsonb,
     avoid = replace(
       p.avoid,
       'un pion izolat de atacat',
       'pionul izolat de pe d4 de atacat'
     )
  from public.opening_lines l
  join public.courses c on c.id = l.course_id
 where p.opening_line_id = l.id
   and c.slug = 'nimzo-indian-defense'
   and l.variation_code = 'B';

update public.middlegame_plans p
   set ideas = replace(
       p.ideas::text,
       'un pion izolat atacat de două ori',
       'pionul izolat de pe c5, când e atacat de două ori,'
     )::jsonb
  from public.opening_lines l
  join public.courses c on c.id = l.course_id
 where p.opening_line_id = l.id
   and c.slug = 'english-opening'
   and l.variation_code = 'C';

update public.middlegame_plans p
   set structure = replace(
       p.structure,
       'Împotriva unui pion izolat nu se caută lovitura',
       'Împotriva pionului izolat de pe d5 nu se caută lovitura'
     ),
     ideas = replace(
       replace(
         p.ideas::text,
         'Câmpul din faţa pionului izolat, d4',
         'Câmpul din faţa pionului izolat de pe d5, d4'
       ),
       'Aşa se dărâmă un pion izolat',
       'Aşa se dărâmă pionul izolat de pe d5'
     )::jsonb,
     move_explanations = replace(
       p.move_explanations::text,
       'îşi împinge pionul izolat înainte',
       'îşi împinge pionul izolat de pe d5 înainte'
     )::jsonb
  from public.opening_lines l
  join public.courses c on c.id = l.course_id
 where p.opening_line_id = l.id
   and c.slug = 'catalan-opening'
   and l.variation_code = 'C';
