-- 125_reguli_culori_control.sql
-- Regulile de culoare pentru cursurile de deschideri (utilizatorul, 2026-11-23):
--   1. câmp ţintit → roz (`squares`, deja din migrarea 124);
--   2. câmp al cărui control se discută → `control`; aplicaţia îl colorează după
--      ce stă pe el după mutarea ta: piesa adversarului verde închis, piesa ta
--      roşu închis, gol albastru;
--   3. săgeţi pentru mutări posibile: ale tale verde deschis, ale adversarului
--      roşu deschis (doar culoarea din aplicaţie; datele erau deja aşa).
--
-- Aici: cele 13 locuri în care un text vorbeşte despre controlul unui câmp
-- numit („păzeşte e4", „ţii câmpul e5 sub control", „stăpânirea pe e4").
-- „Controlul centrului" fără un câmp anume a rămas nemarcat.
-- În Giuoco Piano, d4 trece din roz (ţintit) în control: e un câmp gol pe care
-- c3 îl pregăteşte, nu unul ţintit — deci albastru.
-- Idempotentă.

update public.opening_lines
set move_marks = jsonb_set(move_marks, '{6,squares}', '["f2"]'::jsonb)
where id = '6934b8f5-a458-41d5-962e-8d6d7325a503';

update public.opening_lines set move_marks = coalesce(move_marks, '{}'::jsonb) || jsonb_build_object('13', coalesce(move_marks -> '13', '{}'::jsonb) || '{"control":["d5"]}'::jsonb) where id = '5b266987-3697-45b7-b0e8-fe1a6f094e14';
update public.opening_lines set move_marks = coalesce(move_marks, '{}'::jsonb) || jsonb_build_object('3', coalesce(move_marks -> '3', '{}'::jsonb) || '{"control":["e4"]}'::jsonb) where id = '6b730897-0f0b-4dce-b616-16ffdba8a9e6';
update public.opening_lines set move_marks = coalesce(move_marks, '{}'::jsonb) || jsonb_build_object('5', coalesce(move_marks -> '5', '{}'::jsonb) || '{"control":["e4"]}'::jsonb) where id = '9b342dbf-a480-4b73-9c4a-3e8651f94971';
update public.opening_lines set move_marks = coalesce(move_marks, '{}'::jsonb) || jsonb_build_object('13', coalesce(move_marks -> '13', '{}'::jsonb) || '{"control":["c4"]}'::jsonb) where id = 'f058053d-1f18-4f16-937b-68c50d006d41';
update public.opening_lines set move_marks = coalesce(move_marks, '{}'::jsonb) || jsonb_build_object('5', coalesce(move_marks -> '5', '{}'::jsonb) || '{"control":["e4"]}'::jsonb) where id = '3b0518b3-6946-4fa9-bc86-dc0d77ff7567';
update public.opening_lines set move_marks = coalesce(move_marks, '{}'::jsonb) || jsonb_build_object('5', coalesce(move_marks -> '5', '{}'::jsonb) || '{"control":["e4"]}'::jsonb) where id = '0b1ab8a9-3ffb-4927-b8c7-8c9b787acd61';
update public.opening_lines set move_marks = coalesce(move_marks, '{}'::jsonb) || jsonb_build_object('6', coalesce(move_marks -> '6', '{}'::jsonb) || '{"control":["d4"]}'::jsonb) where id = '6934b8f5-a458-41d5-962e-8d6d7325a503';
update public.opening_lines set move_marks = coalesce(move_marks, '{}'::jsonb) || jsonb_build_object('3', coalesce(move_marks -> '3', '{}'::jsonb) || '{"control":["e4"]}'::jsonb) where id = '2f936ee8-e9b8-42ba-8583-2809aab2f268';
update public.opening_lines set move_marks = coalesce(move_marks, '{}'::jsonb) || jsonb_build_object('3', coalesce(move_marks -> '3', '{}'::jsonb) || '{"control":["e4"]}'::jsonb) where id = '4bdfb2a3-83e3-4f7b-9cd7-0dc83ea8baee';
update public.opening_lines set move_marks = coalesce(move_marks, '{}'::jsonb) || jsonb_build_object('1', coalesce(move_marks -> '1', '{}'::jsonb) || '{"control":["e4"]}'::jsonb) where id = '308290bb-fbb2-4b22-b0ba-797ad4d18fd3';
update public.opening_lines set move_marks = coalesce(move_marks, '{}'::jsonb) || jsonb_build_object('5', coalesce(move_marks -> '5', '{}'::jsonb) || '{"control":["e4"]}'::jsonb) where id = '308290bb-fbb2-4b22-b0ba-797ad4d18fd3';
update public.opening_lines set move_marks = coalesce(move_marks, '{}'::jsonb) || jsonb_build_object('3', coalesce(move_marks -> '3', '{}'::jsonb) || '{"control":["e5"]}'::jsonb) where id = '8eac1248-86b5-48ba-9267-451885085fb4';
update public.opening_traps set move_marks = coalesce(move_marks, '{}'::jsonb) || jsonb_build_object('18', coalesce(move_marks -> '18', '{}'::jsonb) || '{"control":["d5"]}'::jsonb) where id = '82e8f33a-c61d-4d27-9859-c9f302dc3cc1';

do $$
declare n int;
begin
  select (select count(*) from public.opening_lines where move_marks::text like '%"control"%')
       + (select count(*) from public.opening_traps where move_marks::text like '%"control"%')
  into n;
  if n < 12 then
    raise exception 'Doar % rânduri au câmpuri de control, se aşteptau 12', n;
  end if;
  if not exists (
    select 1 from public.opening_lines
    where id = '6934b8f5-a458-41d5-962e-8d6d7325a503'
      and move_marks -> '6' = '{"squares":["f2"],"control":["d4"]}'::jsonb
  ) then
    raise exception 'Giuoco Piano: d4 nu a trecut la control';
  end if;
  if not exists (select 1 from public.opening_traps where id::text like '82e8f33a%'
                 and move_marks -> '18' -> 'squares' ? 'c3' and move_marks -> '18' -> 'control' ? 'd5') then
    raise exception 'Capcana Dragon şi-a pierdut marcajul vechi';
  end if;
end $$;
