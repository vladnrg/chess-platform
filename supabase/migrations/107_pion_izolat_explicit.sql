-- ============================================================
-- Pionul izolat trebuie numit explicit si explicat pe loc.
-- ============================================================
-- Regula de continut: cand spunem "pion izolat", spunem si patratul, plus faptul
-- ca nu are pioni de aceeasi culoare pe coloanele vecine.

update public.middlegame_plans p
   set structure = replace(
     replace(
       p.structure,
       'ai rămas cu un pion pe d4, cu dama pe b3',
       'ai rămas cu un pion izolat pe d4 — fără vecini albi pe coloanele c sau e —, cu dama pe b3'
     ),
     'Materialul e egal şi nimeni n-are nimic slab; se joacă',
     'Materialul e egal; pionul îţi dă spaţiu acum, dar trebuie susţinut cu piese bune. Se joacă'
   )
  from public.opening_lines l
  join public.courses c on c.id = l.course_id
 where p.opening_line_id = l.id
   and c.slug = 'italian-game'
   and l.variation_code = 'A';

update public.middlegame_plans p
   set structure = replace(
     p.structure,
     'cu pionul de d4 izolat: n-are niciun pion pe coloana c sau pe e care să-l apere.',
     'cu un pion izolat pe d4 — fără vecini albi pe coloanele c sau e care să-l apere.'
   )
  from public.opening_lines l
  join public.courses c on c.id = l.course_id
 where p.opening_line_id = l.id
   and c.slug = 'french-defense'
   and l.variation_code = 'B';

update public.middlegame_plans p
   set structure = replace(
     p.structure,
     'un pion izolat pe d4 — fără niciun pion vecin care să-l apere, nici pe c, nici pe e',
     'un pion izolat pe d4 — fără vecini albi pe coloanele c sau e care să-l apere'
   )
  from public.opening_lines l
  join public.courses c on c.id = l.course_id
 where p.opening_line_id = l.id
   and c.slug = 'nimzo-indian-defense'
   and l.variation_code = 'B';

update public.middlegame_plans p
   set structure = replace(
       p.structure,
       'pionul negru de pe c5, care stă singur, fără vecin pe coloana d.',
       'pionul negru izolat pe c5 — fără vecini negri pe coloanele b sau d care să-l apere.'
     ),
     ideas = replace(
       p.ideas::text,
       'Pionul de pe c5 e pe coloana c. Turnul',
       'Pionul izolat de pe c5 e pe coloana c. Turnul'
     )::jsonb,
     move_explanations = replace(
       p.move_explanations::text,
       'Aşa se câştigă un pion izolat.',
       'Aşa se câştigă un pion izolat pe c5: aduni atacatori până când rămâne fără apărători.'
     )::jsonb
  from public.opening_lines l
  join public.courses c on c.id = l.course_id
 where p.opening_line_id = l.id
   and c.slug = 'english-opening'
   and l.variation_code = 'C';

update public.middlegame_plans p
   set ideas = replace(
       p.ideas::text,
       'el are un pion izolat în mijlocul tablei.',
       'el are un pion avansat pe e4 în mijlocul tablei.'
     )::jsonb,
     move_explanations = replace(
       p.move_explanations::text,
       'reia cu pionul, care ajunge izolat în mijlocul tablei.',
       'reia cu pionul, care ajunge avansat în mijlocul tablei.'
     )::jsonb
  from public.opening_lines l
  join public.courses c on c.id = l.course_id
 where p.opening_line_id = l.id
   and c.slug = 'ruy-lopez'
   and l.variation_code = 'C';

update public.middlegame_plans p
   set structure = replace(
       p.structure,
       'un pion izolat pe d5 care nu se poate mişca de acolo.',
       'un pion izolat pe d5 — fără vecini negri pe coloanele c sau e — care nu se poate mişca de acolo.'
     )
  from public.opening_lines l
  join public.courses c on c.id = l.course_id
 where p.opening_line_id = l.id
   and c.slug = 'catalan-opening'
   and l.variation_code = 'C';

update public.middlegame_plans p
   set move_explanations = replace(
       replace(
         replace(
           p.move_explanations::text,
           'Aşa îi rămâne un pion izolat pe d5 şi îi deschizi coloana d pentru turnul tău.',
           'Aşa îi rămâne un pion fix pe d5 şi îi deschizi coloana d pentru turnul tău.'
         ),
         'Loveşti pionul izolat de pe d5 chiar în clipa',
         'Loveşti pionul fix de pe d5 chiar în clipa'
       ),
       'el are un pion izolat şi un nebun care nu vede nimic.',
       'el are un pion fix pe d5 şi un nebun care nu vede nimic.'
     )::jsonb
  from public.opening_lines l
  join public.courses c on c.id = l.course_id
 where p.opening_line_id = l.id
   and c.slug = 'london-system'
   and l.variation_code = 'C';

update public.opening_lines l
   set move_explanations = replace(
       l.move_explanations::text,
       'Pionul lui de pe d5 e acum izolat: n-are niciun vecin nici pe c, nici pe e, care să-l apere.',
       'Pionul lui de pe d5 e acum izolat: nu are vecini negri pe coloanele c sau e care să-l apere.'
     )::jsonb
  from public.courses c
 where l.course_id = c.id
   and c.slug = 'catalan-opening'
   and l.variation_code = 'C';

update public.opening_lines l
   set move_explanations = replace(
       l.move_explanations::text,
       'pionul izolat de d5',
       'pionul izolat de pe d5'
     )::jsonb
  from public.courses c
 where l.course_id = c.id
   and c.slug = 'catalan-opening'
   and l.variation_code = 'C';
