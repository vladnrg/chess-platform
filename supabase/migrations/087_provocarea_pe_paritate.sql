-- ============================================================
-- „Numește deschiderea": zilele se aleg la prima vizită din săptămână
-- ============================================================
-- Până acum zilele erau fixe pentru toată lumea: luni, miercuri, vineri,
-- duminică. Acum fiecare om îşi primeşte propriul set, decis de ziua în care
-- intră prima oară pe pagina de evenimente în săptămâna respectivă:
--
--   intri într-o zi IMPARĂ (luni, miercuri, vineri, duminică)
--     → provocarea îţi apare în zilele impare, toată săptămâna
--   intri într-o zi PARĂ (marţi, joi, sâmbătă)
--     → provocarea îţi apare doar în zilele pare
--
-- Alegerea se face o singură dată pe săptămână şi nu se mai schimbă până
-- luni. Săptămâna următoare se decide din nou, la fel.
--
-- Numărătoarea e ISO (luni = 1 … duminică = 7), nu `dow` (duminică = 0) —
-- altfel duminica ar ieşi pară, iar utilizatorul o vrea printre impare. ISO
-- se potriveşte şi cu `date_trunc('week')`, care porneşte tot de luni, deci
-- duminica rămâne la capătul aceleiaşi săptămâni, nu la începutul celei
-- următoare.
--
-- ASIMETRIE ASUMATĂ: setul impar are patru zile, cel par doar trei. Cine
-- prinde paritatea pară joacă trei calupuri în loc de patru în acea
-- săptămână. Nu există a patra zi pară într-o săptămână, deci nu se poate
-- echilibra fără a strica regula cerută.
-- ============================================================


-- ============================================================
-- 1. Paritatea săptămânii, per om
-- ============================================================
create table if not exists public.opening_week_schedule (
  user_id    uuid not null references auth.users(id) on delete cascade,
  week_start date not null,                                  -- luni, din date_trunc
  parity     smallint not null check (parity in (0, 1)),     -- 1 = impar, 0 = par
  created_at timestamptz not null default now(),
  primary key (user_id, week_start)
);

alter table public.opening_week_schedule enable row level security;

drop policy if exists "opening_week_schedule_read_own" on public.opening_week_schedule;
create policy "opening_week_schedule_read_own" on public.opening_week_schedule
  for select using (auth.uid() = user_id);
-- Fără insert/update direct: paritatea se scrie doar prin funcţia de mai jos,
-- altfel oricine şi-ar putea alege zilele care îi convin.


-- ============================================================
-- 2. Slotul unei zile, pentru o paritate dată
-- ============================================================
-- Întoarce 0–3 (calupul din săptămână) sau null dacă ziua nu e a ta.
--   impar: luni 0, miercuri 1, vineri 2, duminică 3
--   par:   marţi 0, joi 1, sâmbătă 2
create or replace function public.opening_challenge_slot(p_date date, p_parity smallint)
returns integer language sql immutable as $$
  select case
    when p_parity = 1 then case extract(isodow from p_date)::integer
      when 1 then 0 when 3 then 1 when 5 then 2 when 7 then 3 else null end
    when p_parity = 0 then case extract(isodow from p_date)::integer
      when 2 then 0 when 4 then 1 when 6 then 2 else null end
  end;
$$;

create or replace function public.next_challenge_day(p_from date, p_parity smallint)
returns date language sql stable as $$
  select d::date
  from generate_series(p_from + 1, p_from + 7, interval '1 day') d
  where public.opening_challenge_slot(d::date, p_parity) is not null
  order by d
  limit 1;
$$;

grant execute on function public.opening_challenge_slot(date, smallint) to authenticated;
grant execute on function public.next_challenge_day(date, smallint) to authenticated;


-- ============================================================
-- 3. Fixarea parităţii la prima vizită
-- ============================================================
-- Se apelează când se deschide pagina de evenimente. Prima oară într-o
-- săptămână scrie paritatea zilei curente; după aceea doar o citeşte.
create or replace function public.ensure_opening_week()
returns jsonb language plpgsql security definer as $$
declare
  v_me     uuid := auth.uid();
  v_today  date := (now() at time zone 'Europe/Bucharest')::date;
  v_week   date := date_trunc('week', v_today)::date;
  v_parity smallint;
begin
  if v_me is null then return null; end if;

  select parity into v_parity
  from public.opening_week_schedule
  where user_id = v_me and week_start = v_week;

  if not found then
    -- `on conflict do nothing` + recitire: dacă două file se deschid deodată,
    -- amândouă ar insera, iar a doua ar cădea pe cheia primară.
    insert into public.opening_week_schedule (user_id, week_start, parity)
    values (v_me, v_week, (extract(isodow from v_today)::integer % 2)::smallint)
    on conflict (user_id, week_start) do nothing;

    select parity into v_parity
    from public.opening_week_schedule
    where user_id = v_me and week_start = v_week;
  end if;

  return jsonb_build_object(
    'week_start', v_week,
    'parity', v_parity,
    'is_challenge_day', public.opening_challenge_slot(v_today, v_parity) is not null
  );
end;
$$;

grant execute on function public.ensure_opening_week() to authenticated;


-- ============================================================
-- 4. Paritatea în vigoare, fără a o fixa
-- ============================================================
-- Cât timp nu s-a decis nimic pentru săptămâna asta, valabilă e paritatea
-- zilei de azi — fiindcă exact asta s-ar scrie dacă omul ar intra acum pe
-- pagină. Aşa, înainte de prima vizită, orice zi arată ca zi de provocare,
-- ceea ce e adevărat: în oricare ai apărea, aia îţi porneşte seria.
create or replace function public.opening_week_parity(p_user uuid, p_date date)
returns smallint language sql stable as $$
  select coalesce(
    (select parity from public.opening_week_schedule
      where user_id = p_user and week_start = date_trunc('week', p_date)::date),
    (extract(isodow from p_date)::integer % 2)::smallint
  );
$$;

grant execute on function public.opening_week_parity(uuid, date) to authenticated;


-- ============================================================
-- 5. Starea provocării — acum după paritatea ta
-- ============================================================
create or replace function public.opening_challenge_status()
returns jsonb language plpgsql security definer stable as $$
declare
  v_me     uuid := auth.uid();
  v_today  date := (now() at time zone 'Europe/Bucharest')::date;
  v_parity smallint;
  v_slot   integer;
  v_locked boolean;
  v_s      public.opening_sessions%rowtype;
begin
  if v_me is null then return null; end if;

  v_parity := public.opening_week_parity(v_me, v_today);
  v_slot   := public.opening_challenge_slot(v_today, v_parity);

  select exists (
    select 1 from public.opening_week_schedule
    where user_id = v_me and week_start = date_trunc('week', v_today)::date
  ) into v_locked;

  select * into v_s from public.opening_sessions
  where user_id = v_me and session_date = v_today;

  return jsonb_build_object(
    'is_challenge_day', v_slot is not null,
    'today', v_today,
    'next_day', public.next_challenge_day(v_today, v_parity),
    'parity', v_parity,
    'schedule_locked', v_locked,
    'session_id', v_s.id,
    'answered', coalesce(array_length(v_s.answers, 1), 0),
    'total', coalesce(array_length(v_s.question_ids, 1), 5),
    'finished', v_s.finished_at is not null,
    'correct_count', v_s.correct_count,
    'xp_awarded', v_s.xp_awarded
  );
end;
$$;


-- ============================================================
-- 6. Pornirea calupului — fixează paritatea, dacă nu era fixată
-- ============================================================
-- Plasa de siguranţă: cine ajunge la provocare pe altă cale decât pagina de
-- evenimente îşi fixează seria tot acum, nu rămâne nedecis.
create or replace function public.start_opening_session()
returns jsonb language plpgsql security definer as $$
declare
  v_me     uuid := auth.uid();
  v_today  date := (now() at time zone 'Europe/Bucharest')::date;
  v_parity smallint;
  v_slot   integer;
  v_week   date;
  v_all    integer[];
  v_n      integer;
  v_five   integer[];
  v_id     uuid;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;

  perform public.ensure_opening_week();
  v_parity := public.opening_week_parity(v_me, v_today);
  v_slot   := public.opening_challenge_slot(v_today, v_parity);
  if v_slot is null then raise exception 'not_a_challenge_day'; end if;

  -- Sesiunea de azi există deja: o continuăm de unde a rămas.
  select id into v_id from public.opening_sessions
  where user_id = v_me and session_date = v_today;
  if found then return public.opening_session_state(v_id); end if;

  v_week := date_trunc('week', v_today)::date;
  v_all := public.deal_week_questions(v_me, v_week);
  v_n := coalesce(array_length(v_all, 1), 0);

  if v_n < 5 then raise exception 'question_bank_empty'; end if;

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


-- ============================================================
-- 7. Curăţenie: vechile funcţii pe o singură zi
-- ============================================================
-- Nu le mai cheamă nimeni, iar lăsate acolo ar fi a doua sursă de adevăr
-- pentru „ce zi e de provocare" — exact felul de dublură care se desincronizează.
drop function if exists public.opening_challenge_slot(date);
drop function if exists public.next_challenge_day(date);


-- ============================================================
-- DOVADĂ — aşteptat: 4, 3, 1, 0, 0
-- ============================================================
select
  (select count(*) from generate_series(
     date '2026-08-17', date '2026-08-23', interval '1 day') d          -- o săptămână luni→duminică
   where public.opening_challenge_slot(d::date, 1::smallint) is not null)  as zile_impare,
  (select count(*) from generate_series(
     date '2026-08-17', date '2026-08-23', interval '1 day') d
   where public.opening_challenge_slot(d::date, 0::smallint) is not null)  as zile_pare,
  (select count(*) from pg_proc where proname = 'ensure_opening_week')      as functia_noua,
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'opening_challenge_slot'
     and p.pronargs = 1)                                                    as slot_vechi_ramas,
  (select count(*) from public.opening_week_schedule)                       as randuri_deja_scrise;
