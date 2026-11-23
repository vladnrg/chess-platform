-- 123_italiana_fara_doua_lucruri.sql
-- Partida Italiană, Giuoco Piano, textul lui Cf3: fraza „Așa arată o mutare bună
-- de deschidere: face două lucruri deodată." se scoate (cerut pe 2026-11-23).
-- Idempotentă.

update public.opening_lines
set move_explanations = jsonb_set(
      move_explanations, '{2}',
      to_jsonb('Acum dezvoltăm o piesă prin Cf3 — pionul de pe e5 se află acum sub atac.'::text))
where id = '6934b8f5-a458-41d5-962e-8d6d7325a503';

do $$
begin
  if exists (
    select 1 from public.opening_lines
    where id = '6934b8f5-a458-41d5-962e-8d6d7325a503'
      and move_explanations ->> '2' like '%două lucruri%'
  ) then
    raise exception 'Fraza „două lucruri" e încă în Giuoco Piano';
  end if;
end $$;
