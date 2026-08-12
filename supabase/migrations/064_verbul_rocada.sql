-- ============================================================
-- „A se castela" şi „a rocheza" nu există. Plus şase texte greşite.
-- ============================================================
-- Pornind de la o corectură de limbă — verbul corect e „a face rocada" —
-- căutarea a scos la iveală douăsprezece texte cu forme inventate: „se
-- rochează", „rocheazete", „se rocheazete".
--
-- Şase dintre ele erau doar greşeli de limbă, pe mutări care chiar sunt rocade.
--
-- Celelalte şase descriau o rocadă acolo unde se joacă cu totul altceva:
--   Nimzo / A, mutarea 8    — se joacă a3
--   Nimzo / B, mutarea 8    — se joacă Nd3
--   Nimzo / B, mutarea 13   — se joacă cxd4
--   Olandeza / B, mutarea 7 — se joacă Ng7
--   Slav / C, mutarea 12    — se joacă Nd3
--   Slav / B, mutarea 19    — se joacă Te8
-- Acelea sunt rescrise după mutarea adevărată, verificată pe poziţie.
--
-- Cursurile astea — Nimzo, Olandeza, Slav, Pirc, Alekhine, Regele Indian — n-au
-- fost încă trecute prin verificarea cu motorul. Textele de aici sunt reparate
-- fiindcă erau limpede greşite, dar cursurile rămân neverificate în rest.
-- ============================================================

-- ------------------------------------------------------------
-- Cele şase unde se joacă chiar rocada: doar verbul
-- ------------------------------------------------------------
update public.opening_lines l set move_explanations = jsonb_set(l.move_explanations, '{10}',
       to_jsonb('Albul face rocada.'::text))
  from public.courses c where l.course_id = c.id and c.slug = 'alekhine-defense' and l.variation_code = 'B';

update public.opening_lines l set move_explanations = jsonb_set(l.move_explanations, '{9}',
       to_jsonb('Faci rocada fără să amâni. Regele intră la adăpost înainte să înceapă contra-jocul.'::text))
  from public.courses c where l.course_id = c.id and c.slug = 'kings-indian-defense' and l.variation_code = 'B';

update public.opening_lines l set move_explanations = jsonb_set(l.move_explanations, '{13}',
       to_jsonb('Faci rocada.'::text))
  from public.courses c where l.course_id = c.id and c.slug = 'slav-defense' and l.variation_code = 'C';

update public.opening_lines l set move_explanations = jsonb_set(l.move_explanations, '{14}',
       to_jsonb('Albul face rocada.'::text))
  from public.courses c where l.course_id = c.id and c.slug = 'slav-defense' and l.variation_code = 'A';

update public.opening_lines l set move_explanations = jsonb_set(l.move_explanations, '{15}',
       to_jsonb('Faci şi tu rocada, iar regele intră la adăpost.'::text))
  from public.courses c where l.course_id = c.id and c.slug = 'slav-defense' and l.variation_code = 'A';

update public.opening_lines l set move_explanations = jsonb_set(l.move_explanations, '{9}',
       to_jsonb('Faci rocada. Regele la adăpost.'::text))
  from public.courses c where l.course_id = c.id and c.slug = 'pirc-defense' and l.variation_code = 'A';


-- ------------------------------------------------------------
-- Cele şase care descriau altă mutare decât cea de sub ele
-- ------------------------------------------------------------
update public.opening_lines l set move_explanations = jsonb_set(l.move_explanations, '{8}',
       to_jsonb('Adversarul joacă a3 şi te obligă să te hotărăşti cu nebunul de pe b4: îl schimbi pe cal sau îl retragi.'::text))
  from public.courses c where l.course_id = c.id and c.slug = 'nimzo-indian-defense' and l.variation_code = 'A';

update public.opening_lines l set move_explanations = jsonb_set(l.move_explanations, '{8}',
       to_jsonb('Adversarul îşi dezvoltă nebunul pe d3, îndreptat spre flancul tău de rege.'::text))
  from public.courses c where l.course_id = c.id and c.slug = 'nimzo-indian-defense' and l.variation_code = 'B';

update public.opening_lines l set move_explanations = jsonb_set(l.move_explanations, '{13}',
       to_jsonb('cxd4 — schimbi în centru. Pionul tău de pe c pleacă, iar coloana c ţi se deschide pentru turn.'::text))
  from public.courses c where l.course_id = c.id and c.slug = 'nimzo-indian-defense' and l.variation_code = 'B';

update public.opening_lines l set move_explanations = jsonb_set(l.move_explanations, '{7}',
       to_jsonb('Ng7 — nebunul intră în fianchetto, pe diagonala lungă. Rocada vine după el.'::text))
  from public.courses c where l.course_id = c.id and c.slug = 'dutch-defense' and l.variation_code = 'B';

update public.opening_lines l set move_explanations = jsonb_set(l.move_explanations, '{12}',
       to_jsonb('Adversarul îşi dezvoltă nebunul pe d3.'::text))
  from public.courses c where l.course_id = c.id and c.slug = 'slav-defense' and l.variation_code = 'C';

update public.opening_lines l set move_explanations = jsonb_set(l.move_explanations, '{19}',
       to_jsonb('Te8 — aduci şi turnul în joc, pe coloana e.'::text))
  from public.courses c where l.course_id = c.id and c.slug = 'slav-defense' and l.variation_code = 'B';


-- ------------------------------------------------------------
-- Dovada
-- ------------------------------------------------------------
select
  count(*) filter (where l.move_explanations::text ~* 'rocheaz|se roch') as forme_inventate_ramase,
  count(*) filter (where l.move_explanations::text ~* 'castel') as castelari_ramase
from public.opening_lines l;
