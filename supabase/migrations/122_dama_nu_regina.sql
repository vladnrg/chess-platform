-- 122_dama_nu_regina.sql
-- Piesa se numeşte „dama", nu „regina" (cerut pe 2026-11-21): e termenul oficial
-- în şahul românesc, de unde vine şi litera D din notaţie.
--
-- Înainte de migrare erau ~420 de apariţii: opening_lines 134, middlegame_plans
-- 185, opening_traps 111, lessons 14, courses 2. Genul rămâne feminin, deci
-- articolele şi adjectivele din jur nu se schimbă („regina albă" → „dama albă").
-- Idempotentă.

-- ── 1) Două fraze care nu merg cu o înlocuire simplă ─────────────────────────
-- Lecţia „Abrevierile pieselor" explica litera D prin „damă, cum i se spunea
-- înainte" — acum piesa chiar se numeşte aşa, deci explicaţia cade.
update public.lessons
set theory_html = regexp_replace(
      theory_html,
      'Regină \(litera vine de la .damă., cum i se spunea înainte\)',
      'Damă')
where theory_html ~ 'Regină \(litera vine de la .damă.';

-- Lecţia despre rocadă: „spre tura rege / tura regină" → „tura regelui / damei".
update public.lessons
set theory_html = replace(replace(theory_html,
      'spre tura rege)', 'spre tura regelui)'),
      'spre tura regină)', 'spre tura damei)')
where theory_html like '%spre tura rege%';

-- ── 2) Înlocuirea în tot conţinutul ──────────────────────────────────────────
-- Formele lungi întâi, ca „regine" să nu muşte din „reginele" sau „reginei".
-- Niciun alt cuvânt românesc nu conţine „regin", deci replace simplu e sigur.
create or replace function pg_temp.dama(t text) returns text as $f$
  select replace(replace(replace(replace(replace(replace(
         replace(replace(replace(replace(replace(replace(
           t,
           'Reginelor', 'Damelor'), 'reginelor', 'damelor'),
           'Reginele',  'Damele'),  'reginele',  'damele'),
           'Reginei',   'Damei'),   'reginei',   'damei'),
           'Regină',    'Damă'),    'regină',    'damă'),
           'Regina',    'Dama'),    'regina',    'dama'),
           'Regine',    'Dame'),    'regine',    'dame')
$f$ language sql immutable;

-- Toate coloanele de text (text, varchar, text[], jsonb) din tabelele cu
-- conţinut. Tabelele utilizatorilor (profiles, partide, progres) nu se ating.
do $$
declare
  c record;
  expr text;
begin
  for c in
    select table_name, column_name, data_type, udt_name
    from information_schema.columns
    where table_schema = 'public'
      and table_name in ('courses', 'lessons', 'opening_lines', 'middlegame_plans',
                         'opening_traps', 'opening_questions', 'events', 'event_tasks',
                         'puzzles', 'arena_positions', 'opening_week_schedule',
                         'cosmetics', 'tournaments')
      and (data_type in ('text', 'character varying', 'jsonb')
           or (data_type = 'ARRAY' and udt_name = '_text'))
  loop
    expr := case
      when c.data_type = 'jsonb' then format('pg_temp.dama(%I::text)::jsonb', c.column_name)
      when c.data_type = 'ARRAY' then format('pg_temp.dama(%I::text)::text[]', c.column_name)
      else format('pg_temp.dama(%I)', c.column_name)
    end;
    execute format('update public.%I set %I = %s where %I::text like %L',
                   c.table_name, c.column_name, expr, c.column_name, '%egin%');
  end loop;
end $$;

-- ── Dovada ───────────────────────────────────────────────────────────────────
do $$
declare
  rest int := 0;
  n int;
  t text;
begin
  foreach t in array array['courses', 'lessons', 'opening_lines', 'middlegame_plans', 'opening_traps'] loop
    execute format('select count(*) from public.%I r where r::text ~ %L', t, '[Rr]egin(ă|a|ei|e|ele|elor)')
      into n;
    rest := rest + n;
  end loop;
  if rest > 0 then
    raise exception 'Mai sunt % rânduri cu „regina"', rest;
  end if;

  if exists (select 1 from public.lessons where theory_html like '%cum i se spunea înainte%') then
    raise exception 'Lecţia „Abrevierile pieselor" are încă explicaţia veche';
  end if;

  if not exists (select 1 from public.lessons where title = 'Dama') then
    raise exception 'Lecţia „Regina" nu s-a redenumit';
  end if;
end $$;
