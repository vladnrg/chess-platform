-- 124_campuri_tintite.sql
-- Câmpul pe care îl „ţinteşte" o piesă se colorează pe tablă, în toate cursurile
-- (cerut pe 2026-11-23). Găsite cu o căutare după „ţinteşte / ţintind / vizează"
-- în textele care se văd în balon; „ţintuire" (piesa legată) e altceva şi a
-- rămas pe dinafară, la fel ca „o ţintă" fără un câmp numit.
--
-- Fiecare câmp a fost verificat pe poziţia reală de la acea mutare. Cheia este
-- semi-mutarea ta la care apare textul: dacă textul e al mutării adversarului,
-- e mutarea ta de imediat după.
--
-- Corectură: în Gambitul Regelui (clasica cu 3...g5, jocul de mijloc) textul
-- spunea că De7 „ţinteşte pionul de e4" — dar pe e4 nu mai e niciun pion. Dama
-- se uită pe coloana e deschisă spre nebunul de pe e2, cu regele în spatele lui.
-- Idempotentă.

alter table public.opening_traps add column if not exists move_marks jsonb;

update public.middlegame_plans
set move_explanations = jsonb_set(move_explanations, '{2}',
      to_jsonb('De7 — dama lui se aşază pe coloana e, acum deschisă, şi îţi ţinteşte nebunul de pe e2, cu regele tău chiar în spatele lui.'::text))
where id::text like '9a89d0cd%'
  and move_explanations ->> '2' like '%pionul de e4%';

update public.opening_lines set move_marks = coalesce(move_marks, '{}'::jsonb) || '{"4":{"squares":["c6"]}}'::jsonb where id = 'bb9e81a3-ffae-46a5-ae3e-7bab12174d9e';
update public.opening_lines set move_marks = coalesce(move_marks, '{}'::jsonb) || '{"18":{"squares":["f6","d6"]}}'::jsonb where id = '7f3c6a1b-0d00-4a52-9ded-a19341f06c49';
update public.opening_lines set move_marks = coalesce(move_marks, '{}'::jsonb) || '{"13":{"squares":["f6"]}}'::jsonb where id = '9b342dbf-a480-4b73-9c4a-3e8651f94971';
update public.opening_lines set move_marks = coalesce(move_marks, '{}'::jsonb) || '{"13":{"squares":["f3"]}}'::jsonb where id = '3b0518b3-6946-4fa9-bc86-dc0d77ff7567';
update public.opening_lines set move_marks = coalesce(move_marks, '{}'::jsonb) || '{"12":{"squares":["f2"]}}'::jsonb where id = '591d8d80-04c7-4a9c-a74f-2b4ec279f423';
update public.opening_lines set move_marks = coalesce(move_marks, '{}'::jsonb) || '{"9":{"squares":["h6"]}}'::jsonb where id = '3f3424a5-2bcf-44d7-98d1-88c8f304a558';
update public.opening_lines set move_marks = coalesce(move_marks, '{}'::jsonb) || '{"18":{"squares":["c2","d3"]}}'::jsonb where id = '50eb2fb8-dd83-4d80-8404-ce62e62d6329';
update public.opening_lines set move_marks = coalesce(move_marks, '{}'::jsonb) || '{"7":{"squares":["f3"]}}'::jsonb where id = '33368253-af12-4e48-a7d6-4b0d729883ee';
update public.opening_lines set move_marks = coalesce(move_marks, '{}'::jsonb) || '{"6":{"squares":["f2"]}}'::jsonb where id = '96f1dfe8-f215-4a8a-8f60-bf7eade644e0';
update public.opening_lines set move_marks = coalesce(move_marks, '{}'::jsonb) || '{"10":{"squares":["h7"]}}'::jsonb where id = 'ff6881b7-305f-4fc7-865f-525e321c0ac5';
update public.opening_lines set move_marks = coalesce(move_marks, '{}'::jsonb) || '{"19":{"squares":["e2"]}}'::jsonb where id = '2f936ee8-e9b8-42ba-8583-2809aab2f268';
update public.opening_lines set move_marks = coalesce(move_marks, '{}'::jsonb) || '{"18":{"squares":["d5","b7"]}}'::jsonb where id = '6934b8f5-a458-41d5-962e-8d6d7325a503';
update public.opening_lines set move_marks = coalesce(move_marks, '{}'::jsonb) || '{"18":{"squares":["f6"]}}'::jsonb where id = '53cb0cea-aa46-4f83-acb3-8303e8c9ecdb';
update public.opening_lines set move_marks = coalesce(move_marks, '{}'::jsonb) || '{"16":{"squares":["c4"]}}'::jsonb where id = 'e016a9f3-c2d0-46ca-9f7c-25fe06c94eed';
update public.opening_lines set move_marks = coalesce(move_marks, '{}'::jsonb) || '{"16":{"squares":["f2"]}}'::jsonb where id = '15cb1e33-b0b8-4282-b77b-d9daf86866f0';
update public.middlegame_plans set move_marks = coalesce(move_marks, '{}'::jsonb) || '{"5":{"squares":["f6"]}}'::jsonb where id = '27b62e87-d90b-4123-84a2-1c3edf650f30';
update public.middlegame_plans set move_marks = coalesce(move_marks, '{}'::jsonb) || '{"3":{"squares":["e2"]}}'::jsonb where id = '9a89d0cd-c49d-40b0-8674-80d4f54005ee';
update public.middlegame_plans set move_marks = coalesce(move_marks, '{}'::jsonb) || '{"1":{"squares":["c7"]}}'::jsonb where id = '27d6ce0e-48dd-4835-9d0c-df11536c18e1';
update public.middlegame_plans set move_marks = coalesce(move_marks, '{}'::jsonb) || '{"1":{"squares":["h2"]}}'::jsonb where id = 'fbcf56b2-48c1-4a22-afb8-12f290befdb5';
update public.opening_traps set move_marks = coalesce(move_marks, '{}'::jsonb) || '{"18":{"squares":["c3"]}}'::jsonb where id = '82e8f33a-c61d-4d27-9859-c9f302dc3cc1';
update public.opening_traps set move_marks = coalesce(move_marks, '{}'::jsonb) || '{"19":{"squares":["d7"]}}'::jsonb where id = '7a6ebd2f-2c3f-40f5-8e5c-b5b32525b92e';
update public.opening_traps set move_marks = coalesce(move_marks, '{}'::jsonb) || '{"13":{"squares":["f3"]}}'::jsonb where id = '7161ab04-9fda-49e2-b05c-e225cf276744';

do $$
declare n int;
begin
  select (select count(*) from public.opening_lines where move_marks is not null)
       + (select count(*) from public.middlegame_plans where move_marks is not null)
       + (select count(*) from public.opening_traps where move_marks is not null)
  into n;
  if n < 22 then
    raise exception 'Doar % rânduri au marcaje, se aşteptau cel puţin 22', n;
  end if;
  if exists (select 1 from public.middlegame_plans where move_explanations ->> '2' like '%De7%pionul de e4%') then
    raise exception 'Textul greşit cu De7 a rămas';
  end if;
end $$;
