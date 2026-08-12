-- ============================================================
-- Provocarea deschiderilor: calupuri de 5, din două în două zile
-- ============================================================
-- Ce se schimbă faţă de 031–032:
--
--  1. Un singur răspuns, definitiv. Înainte puteai reîncerca — dar odată ce
--     vedeai răspunsul corect şi explicaţia, „încearcă din nou" nu mai însemna
--     nimic. Acum răspunsul se înregistrează cum e dat.
--  2. Calupuri de 5 întrebări, luni / miercuri / vineri / duminică. Douăzeci
--     deodată sunt prea multe pentru un copil.
--  3. Săptămâna următoare se împart alte întrebări, din altă parte a băncii.
--  4. XP-ul vine la finalul calupului, după câte ai nimerit. Se poate şi
--     pierde — mai blând decât la puzzle-uri sau la partide.
--
-- Cele 20 de sarcini din 031 dispar: sunt înlocuite de banca de mai jos.
-- ============================================================


-- ============================================================
-- 1. Banca de întrebări
-- ============================================================
create table if not exists public.opening_questions (
  id serial primary key,
  /** Mutările în notaţie UCI — clientul construieşte poziţia din ele. */
  moves text not null,
  title text not null,
  prompt text not null default 'Ce deschidere e pe tablă?',
  options text[] not null,
  /** Indexul variantei corecte, de la 0. */
  answer integer not null,
  explanation text not null,
  /** 1 = primele mutări, 2 = deschideri mai rare, 3 = variante cu nume. */
  difficulty integer not null default 1,
  constraint opening_questions_answer_in_range
    check (answer >= 0 and answer < array_length(options, 1))
);

alter table public.opening_questions enable row level security;
-- Fără politică de citire: `options` e inofensiv, dar `answer` şi `explanation`
-- stau în acelaşi rând. Se citesc doar prin funcţiile de mai jos, care le taie
-- până răspunzi.


-- ============================================================
-- 2. Sesiunile
-- ============================================================
create table if not exists public.opening_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  /** Ziua calupului, ora României. O sesiune pe zi. */
  session_date date not null,
  question_ids integer[] not null,
  /** Răspunsurile date, în ordine. Se adaugă la coadă, deci nu se poate sări. */
  answers integer[] not null default '{}',
  correct_count integer,
  xp_awarded integer,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  unique (user_id, session_date)
);

alter table public.opening_sessions enable row level security;

create policy "opening_sessions_read_own" on public.opening_sessions
  for select using (auth.uid() = user_id);
-- Fără insert/update direct: altfel oricine şi-ar putea scrie 5 din 5.


-- ============================================================
-- 3. Zilele de provocare
-- ============================================================
-- Luni, miercuri, vineri, duminică. Postgres numără duminica cu 0, iar
-- `date_trunc('week')` porneşte de luni — deci toate patru cad în aceeaşi
-- săptămână calendaristică, cu duminica la sfârşit.
create or replace function public.opening_challenge_slot(p_date date)
returns integer language sql immutable as $$
  select case extract(dow from p_date)::integer
    when 1 then 0   -- luni
    when 3 then 1   -- miercuri
    when 5 then 2   -- vineri
    when 0 then 3   -- duminică
    else null
  end;
$$;

create or replace function public.next_challenge_day(p_from date)
returns date language sql stable as $$
  select d::date
  from generate_series(p_from + 1, p_from + 7, interval '1 day') d
  where public.opening_challenge_slot(d::date) is not null
  order by d
  limit 1;
$$;

grant execute on function public.opening_challenge_slot(date) to authenticated;
grant execute on function public.next_challenge_day(date) to authenticated;


-- ============================================================
-- 4. Împărţirea întrebărilor pe săptămână
-- ============================================================
-- Douăzeci de întrebări pe săptămână, în patru calupuri de câte cinci.
-- Ordinea e dată de un hash pe (utilizator, săptămână, întrebare): stabilă cât
-- ţine săptămâna, deci reîncărcarea nu schimbă nimic, dar complet altfel
-- săptămâna viitoare. Şi doi oameni primesc lucruri diferite în aceeaşi zi.
create or replace function public.deal_week_questions(p_user uuid, p_week date)
returns integer[] language sql stable as $$
  select array_agg(id order by ord)
  from (
    select id, row_number() over (
      order by md5(p_user::text || p_week::text || id::text)
    ) as ord
    from public.opening_questions
  ) q
  where ord <= 20;
$$;


-- ============================================================
-- 5. XP-ul unui calup
-- ============================================================
-- Corect +8, greşit −3, plus 15 dacă le nimereşti pe toate.
-- Deci: 5/5 → +55, 4/5 → +29, 3/5 → +18, 2/5 → +7, 1/5 → −4, 0/5 → −15.
--
-- Pierderea e intenţionat blândă. La puzzle-uri greşeala îţi mişcă rating-ul,
-- la partide pierzi o partidă întreagă — aici, dacă eşti atent măcar pe
-- jumătate, ieşi în plus.
create or replace function public.opening_session_xp(p_correct integer, p_total integer)
returns integer language sql immutable as $$
  select p_correct * 8
       - (p_total - p_correct) * 3
       + case when p_correct = p_total and p_total > 0 then 15 else 0 end;
$$;

grant execute on function public.opening_session_xp(integer, integer) to authenticated;


-- ============================================================
-- 6. award_xp acceptă sume negative
-- ============================================================
-- `profiles.xp` are `check (xp >= 0)`, iar `user_weekly_xp` intră în
-- calculul promovării. O sumă negativă trebuie să se oprească la zero în
-- amândouă, altfel prima greşeală ar strica inserarea.
create or replace function public.award_xp(
  p_user_id uuid, p_amount integer, p_source text default null
)
returns void language plpgsql security definer as $$
declare
  v_week_start date;
begin
  update public.profiles
    set xp = greatest(0, xp + p_amount)
  where id = p_user_id;

  v_week_start := (date_trunc('week', now()))::date;

  insert into public.user_weekly_xp (user_id, week_start, xp_earned, league_at_week_start)
  values (p_user_id, v_week_start, greatest(0, p_amount),
    (select current_league from public.profiles where id = p_user_id))
  on conflict (user_id, week_start)
  do update set xp_earned = greatest(0, user_weekly_xp.xp_earned + p_amount);

  insert into public.xp_ledger (user_id, amount, source)
  values (p_user_id, p_amount, p_source);
end;
$$;


-- ============================================================
-- 7. Starea unei sesiuni
-- ============================================================
-- Întrebările la care n-ai răspuns încă vin fără `answer` şi fără explicaţie.
create or replace function public.opening_session_state(p_session_id uuid)
returns jsonb language plpgsql security definer stable as $$
declare
  v_me uuid := auth.uid();
  v_s public.opening_sessions%rowtype;
  v_answered integer;
  v_qs jsonb;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;

  select * into v_s from public.opening_sessions
  where id = p_session_id and user_id = v_me;
  if not found then return null; end if;

  v_answered := coalesce(array_length(v_s.answers, 1), 0);

  select coalesce(jsonb_agg(x.payload order by x.ord), '[]'::jsonb) into v_qs
  from (
    select
      i as ord,
      jsonb_build_object(
        'index', i - 1,
        'moves', q.moves,
        'title', q.title,
        'prompt', q.prompt,
        'options', to_jsonb(q.options),
        'my_answer', case when v_answered >= i then v_s.answers[i] else null end,
        'answer',    case when v_answered >= i then q.answer else null end,
        'explanation', case when v_answered >= i then q.explanation else null end
      ) as payload
    from generate_subscripts(v_s.question_ids, 1) as i
    join public.opening_questions q on q.id = v_s.question_ids[i]
  ) x;

  return jsonb_build_object(
    'id', v_s.id,
    'session_date', v_s.session_date,
    'total', array_length(v_s.question_ids, 1),
    'answered', v_answered,
    'correct_count', v_s.correct_count,
    'xp_awarded', v_s.xp_awarded,
    'finished', v_s.finished_at is not null,
    'questions', v_qs
  );
end;
$$;

grant execute on function public.opening_session_state(uuid) to authenticated;


-- ============================================================
-- 8. Pornirea calupului de azi
-- ============================================================
create or replace function public.start_opening_session()
returns jsonb language plpgsql security definer as $$
declare
  v_me uuid := auth.uid();
  v_today date := (now() at time zone 'Europe/Bucharest')::date;
  v_slot integer;
  v_week date;
  v_all integer[];
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

  if coalesce(array_length(v_all, 1), 0) < (v_slot + 1) * 5 then
    raise exception 'not_enough_questions';
  end if;

  v_five := v_all[v_slot * 5 + 1 : v_slot * 5 + 5];

  insert into public.opening_sessions (user_id, session_date, question_ids)
  values (v_me, v_today, v_five)
  returning id into v_id;

  return public.opening_session_state(v_id);
end;
$$;

grant execute on function public.start_opening_session() to authenticated;


-- ============================================================
-- 9. Un răspuns — definitiv
-- ============================================================
-- Nu primeşte index: răspunzi mereu la următoarea nerezolvată. Aşa nu se poate
-- sări peste una grea şi nici răspunde de două ori la aceeaşi.
create or replace function public.answer_opening_question(
  p_session_id uuid, p_answer integer
)
returns jsonb language plpgsql security definer as $$
declare
  v_me uuid := auth.uid();
  v_s public.opening_sessions%rowtype;
  v_idx integer;
  v_total integer;
  v_q public.opening_questions%rowtype;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;

  select * into v_s from public.opening_sessions
  where id = p_session_id and user_id = v_me
  for update;
  if not found then raise exception 'session_not_found'; end if;
  if v_s.finished_at is not null then raise exception 'session_finished'; end if;

  v_total := array_length(v_s.question_ids, 1);
  v_idx := coalesce(array_length(v_s.answers, 1), 0) + 1;
  if v_idx > v_total then raise exception 'session_complete'; end if;

  select * into v_q from public.opening_questions
  where id = v_s.question_ids[v_idx];

  update public.opening_sessions
    set answers = array_append(answers, p_answer)
  where id = p_session_id;

  return jsonb_build_object(
    'index', v_idx - 1,
    'correct', p_answer = v_q.answer,
    'answer', v_q.answer,
    'explanation', v_q.explanation,
    'is_last', v_idx = v_total
  );
end;
$$;

grant execute on function public.answer_opening_question(uuid, integer) to authenticated;


-- ============================================================
-- 10. Închiderea calupului şi XP-ul
-- ============================================================
create or replace function public.finish_opening_session(p_session_id uuid)
returns jsonb language plpgsql security definer as $$
declare
  v_me uuid := auth.uid();
  v_s public.opening_sessions%rowtype;
  v_total integer;
  v_correct integer := 0;
  v_xp integer;
  i integer;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;

  select * into v_s from public.opening_sessions
  where id = p_session_id and user_id = v_me
  for update;
  if not found then raise exception 'session_not_found'; end if;

  v_total := array_length(v_s.question_ids, 1);

  -- Deja închisă: întoarcem acelaşi rezultat, fără să mai dăm XP o dată.
  if v_s.finished_at is not null then
    return jsonb_build_object(
      'correct', v_s.correct_count, 'total', v_total,
      'xp', v_s.xp_awarded, 'already', true
    );
  end if;

  if coalesce(array_length(v_s.answers, 1), 0) < v_total then
    raise exception 'session_incomplete';
  end if;

  for i in 1..v_total loop
    if v_s.answers[i] = (
      select answer from public.opening_questions where id = v_s.question_ids[i]
    ) then
      v_correct := v_correct + 1;
    end if;
  end loop;

  v_xp := public.opening_session_xp(v_correct, v_total);

  update public.opening_sessions
    set correct_count = v_correct, xp_awarded = v_xp, finished_at = now()
  where id = p_session_id;

  if v_xp <> 0 then
    perform public.award_xp(v_me, v_xp, 'opening-challenge');
  end if;

  return jsonb_build_object('correct', v_correct, 'total', v_total, 'xp', v_xp);
end;
$$;

grant execute on function public.finish_opening_session(uuid) to authenticated;


-- ============================================================
-- 11. Starea provocării, pentru butonul din Bârlog
-- ============================================================
create or replace function public.opening_challenge_status()
returns jsonb language plpgsql security definer stable as $$
declare
  v_me uuid := auth.uid();
  v_today date := (now() at time zone 'Europe/Bucharest')::date;
  v_slot integer;
  v_s public.opening_sessions%rowtype;
begin
  if v_me is null then return null; end if;

  v_slot := public.opening_challenge_slot(v_today);

  select * into v_s from public.opening_sessions
  where user_id = v_me and session_date = v_today;

  return jsonb_build_object(
    'is_challenge_day', v_slot is not null,
    'today', v_today,
    'next_day', public.next_challenge_day(v_today),
    'session_id', v_s.id,
    'answered', coalesce(array_length(v_s.answers, 1), 0),
    'total', coalesce(array_length(v_s.question_ids, 1), 5),
    'finished', v_s.finished_at is not null,
    'correct_count', v_s.correct_count,
    'xp_awarded', v_s.xp_awarded
  );
end;
$$;

grant execute on function public.opening_challenge_status() to authenticated;


-- ============================================================
-- 12. Quiz-urile de eveniment nu mai dezvăluie răspunsul la greşeală
-- ============================================================
-- Aceeaşi inconsecvenţă exista şi la uşile calendarului de Crăciun: îţi arătam
-- răspunsul corect şi explicaţia, apoi îţi ofeream „încearcă din nou". Acolo
-- reîncercarea e potrivită — e un calendar cu daruri, nu un examen — dar atunci
-- soluţia nu trebuie arătată.
--
-- Restul funcţiei e neschimbat faţă de 030.
create or replace function public.complete_event_task(
  p_task_id uuid, p_answer integer default null
)
returns jsonb language plpgsql security definer as $$
declare
  v_me uuid := auth.uid();
  v_t public.event_tasks%rowtype;
  v_ev public.events%rowtype;
  v_correct boolean := true;
  v_expected integer;
  v_cosmetic_new boolean := false;
  v_xp integer := 0;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;

  select * into v_t from public.event_tasks where id = p_task_id;
  if not found then raise exception 'task_not_found'; end if;

  select * into v_ev from public.events where id = v_t.event_id and is_published;
  if not found then raise exception 'event_not_found'; end if;

  if now() < v_ev.starts_at or now() > v_ev.ends_at then
    raise exception 'event_closed';
  end if;

  if v_t.available_at is not null and now() < v_t.available_at then
    raise exception 'task_not_open';
  end if;

  if exists (
    select 1 from public.user_event_tasks
    where user_id = v_me and task_id = p_task_id
  ) then
    return jsonb_build_object('already_done', true, 'xp', 0, 'correct', true);
  end if;

  if v_t.task_type = 'quiz' then
    v_expected := (v_t.payload->>'answer')::integer;
    v_correct := p_answer is not null and p_answer = v_expected;
  end if;

  -- Greşit: doar atât. Fără răspuns, fără explicaţie — altfel „încearcă din
  -- nou" n-ar mai însemna nimic.
  if not v_correct then
    return jsonb_build_object('correct', false, 'xp', 0);
  end if;

  insert into public.user_event_tasks (user_id, task_id, correct)
  values (v_me, p_task_id, true);

  if v_t.xp_reward > 0 then
    perform public.award_xp(v_me, v_t.xp_reward, 'event:' || v_ev.slug);
    v_xp := v_t.xp_reward;
  end if;

  if v_t.cosmetic_reward is not null then
    v_cosmetic_new := public.grant_cosmetic(v_me, v_t.cosmetic_reward, v_ev.slug);
  end if;

  return jsonb_build_object(
    'correct', true,
    'xp', v_xp,
    'cosmetic', v_t.cosmetic_reward,
    'cosmetic_is_new', v_cosmetic_new,
    'answer', (v_t.payload->>'answer')::integer,
    'explanation', v_t.payload->>'explanation'
  );
end;
$$;


-- ============================================================
-- 13. Evenimentul îşi schimbă regulile
-- ============================================================
-- Sarcinile vechi dispar (cascadează şi în user_event_tasks): sunt înlocuite
-- de banca de întrebări.
delete from public.event_tasks
where event_id = (select id from public.events where slug = 'numeste-deschiderea');

update public.events set
  tagline = 'Cinci întrebări, din două în două zile.',
  description =
    'Luni, miercuri, vineri şi duminică primeşti cinci poziţii de deschidere. '
    'Le vezi pe tablă şi spui cum se cheamă. Ai o singură şansă la fiecare — '
    'răspunsul rămâne cum l-ai dat. La final primeşti XP după câte ai nimerit: '
    '+8 pentru fiecare corect, −3 pentru fiecare greşit, şi încă 15 dacă le iei '
    'pe toate cinci. Săptămâna următoare primeşti alte deschideri.'
where slug = 'numeste-deschiderea';
