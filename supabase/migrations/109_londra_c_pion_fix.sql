-- ============================================================
-- Londra C: pionul de pe d5 nu este izolat aici, ci fix.
-- ============================================================

update public.middlegame_plans p
   set move_explanations = replace(
     p.move_explanations::text,
     'Aşa îi rămâne un pion izolat pe d5 şi îi deschizi coloana d pentru tura ta.',
     'Aşa îi rămâne un pion fix pe d5 şi îi deschizi coloana d pentru tura ta.'
   )::jsonb
  from public.opening_lines l
  join public.courses c on c.id = l.course_id
 where p.opening_line_id = l.id
   and c.slug = 'london-system'
   and l.variation_code = 'C';
