-- ============================================================
-- „Gambitul Icelandic" → „Gambitul islandez"
-- ============================================================
-- Numele englezesc rămăsese netradus, inclusiv în numele variantei, care se
-- vede pe pagina cursului şi în capul fiecărei lecţii.
--
-- Înlocuirea se face cu `replace` peste toate câmpurile de text ale cursului,
-- nu prin scrierea fiecărei propoziţii din nou: aşa prinde şi apariţiile pe
-- care nu le-am numărat.
-- ============================================================

update public.opening_lines l
   set variation_name = replace(l.variation_name, 'Icelandic', 'islandez'),
       move_explanations = replace(l.move_explanations::text, 'Icelandic', 'islandez')::jsonb
  from public.courses c
 where l.course_id = c.id
   and (l.variation_name like '%Icelandic%' or l.move_explanations::text like '%Icelandic%');

update public.middlegame_plans p
   set structure = replace(p.structure, 'Icelandic', 'islandez'),
       ideas = replace(p.ideas::text, 'Icelandic', 'islandez')::jsonb,
       avoid = replace(p.avoid, 'Icelandic', 'islandez'),
       move_explanations = replace(p.move_explanations::text, 'Icelandic', 'islandez')::jsonb
 where p.structure like '%Icelandic%'
    or p.ideas::text like '%Icelandic%'
    or p.avoid like '%Icelandic%'
    or p.move_explanations::text like '%Icelandic%';

update public.opening_traps t
   set title = replace(t.title, 'Icelandic', 'islandez'),
       explanation = replace(t.explanation, 'Icelandic', 'islandez'),
       move_explanations = replace(t.move_explanations::text, 'Icelandic', 'islandez')::jsonb
 where t.title like '%Icelandic%'
    or t.explanation like '%Icelandic%'
    or t.move_explanations::text like '%Icelandic%';


-- ------------------------------------------------------------
-- Dovada
-- ------------------------------------------------------------
select
  (select count(*) from public.opening_lines
    where variation_name like '%Icelandic%' or move_explanations::text like '%Icelandic%') as linii_ramase,
  (select count(*) from public.middlegame_plans
    where structure like '%Icelandic%' or ideas::text like '%Icelandic%'
       or avoid like '%Icelandic%' or move_explanations::text like '%Icelandic%') as planuri_ramase,
  (select variation_name from public.opening_lines l
     join public.courses c on c.id = l.course_id
    where c.slug = 'scandinavian-defense' and l.variation_code = 'C') as numele_acum;
