-- ============================================================
-- Italiana A: pagina a doua din descrierea pozitiei.
-- ============================================================

update public.middlegame_plans p
   set structure = replace(
     p.structure,
     'Materialul e egal; pionul îţi dă spaţiu acum, dar trebuie susţinut cu piese bune. Se joacă pe cine îşi aşază piesele mai bine.',
     'Materialul e egal; pionul îţi dă spaţiu acum, dar trebuie susţinut bine cu celelalte piese. Scopul tău este să asiguri regele şi, până când negrul dezvăluie pe ce parte vrea să facă rocada, să îţi activezi turele, aşezându-le pe coloanele libere.'
   )
  from public.opening_lines l
  join public.courses c on c.id = l.course_id
 where p.opening_line_id = l.id
   and c.slug = 'italian-game'
   and l.variation_code = 'A';
