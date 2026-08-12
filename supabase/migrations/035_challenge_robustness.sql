-- ============================================================
-- Provocarea nu mai cade când banca e mai mică decât 20
-- ============================================================
-- `start_opening_session` cerea 20 de întrebări în bancă chiar şi pentru primul
-- calup, care are nevoie de cinci. Cu banca goală (migrarea 034 nerulată) sau
-- cu una mică, arunca „not_enough_questions" — un mesaj care sună a lipsă de
-- conţinut, deşi cauza reală era alta.
--
-- Două schimbări:
--   1. Împărţirea se face circular. Cu 60 de întrebări e exact ca înainte; cu
--      mai puţine, calupurile se rotesc peste ce există în loc să eşueze.
--   2. Singura eroare rămasă e `question_bank_empty`, ridicată doar când chiar
--      nu sunt nici cinci întrebări — caz în care mesajul spune ce e de făcut.
-- ============================================================

-- Întoarce câte întrebări sunt disponibile pentru săptămâna asta: până la 20,
-- sau toate, dacă banca e mai mică.
create or replace function public.deal_week_questions(p_user uuid, p_week date)
returns integer[] language sql stable as $$
  with pool as (
    select
      id,
      row_number() over (
        order by md5(p_user::text || p_week::text || id::text)
      ) as ord,
      count(*) over () as n
    from public.opening_questions
  )
  select array_agg(id order by ord)
  from pool
  where ord <= least(20, n);
$$;


create or replace function public.start_opening_session()
returns jsonb language plpgsql security definer as $$
declare
  v_me uuid := auth.uid();
  v_today date := (now() at time zone 'Europe/Bucharest')::date;
  v_slot integer;
  v_week date;
  v_all integer[];
  v_n integer;
  v_five integer[];
  v_id uuid;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;

  v_slot := public.opening_challenge_slot(v_today);
  if v_slot is null then raise exception 'not_a_challenge_day'; end if;

  -- Sesiunea de azi există deja: o continuăm de unde a rămas.
  select id into v_id from public.opening_sessions
  where user_id = v_me and session_date = v_today;
  if found then return public.opening_session_state(v_id); end if;

  v_week := date_trunc('week', v_today)::date;
  v_all := public.deal_week_questions(v_me, v_week);
  v_n := coalesce(array_length(v_all, 1), 0);

  -- Sub cinci întrebări nu se poate face un calup. Asta înseamnă aproape sigur
  -- că seed-ul din 034 n-a fost rulat.
  if v_n < 5 then raise exception 'question_bank_empty'; end if;

  -- Circular: cu banca plină (≥20) e exact felia obişnuită a calupului; cu una
  -- mai mică, se roteşte peste ce există, fără repetiţii în acelaşi calup.
  select array_agg(v_all[((v_slot * 5 + i - 1) % v_n) + 1] order by i)
    into v_five
  from generate_series(1, 5) as i;

  insert into public.opening_sessions (user_id, session_date, question_ids)
  values (v_me, v_today, v_five)
  returning id into v_id;

  return public.opening_session_state(v_id);
end;
$$;

grant execute on function public.start_opening_session() to authenticated;


-- Câte întrebări sunt în bancă — ca pagina să poată spune limpede ce lipseşte,
-- în loc să arunce o eroare generică.
create or replace function public.opening_bank_size()
returns integer language sql security definer stable as $$
  select count(*)::integer from public.opening_questions;
$$;

grant execute on function public.opening_bank_size() to authenticated;
