-- ============================================================
-- Streak-ul: zile la rând în care ai câştigat XP
-- ============================================================
-- Nu „zile în care te-ai logat". Ca să conteze ziua, trebuie să fi făcut
-- ceva: un puzzle, o tactică, o lecţie, o victorie. Logarea singură nu e o
-- realizare şi n-are ce să răsplătească.
--
-- Coloana `streak_days` există din migrarea 001 şi e afişată în şase locuri,
-- dar nu o scria nimeni:
--
--  - versiunea originală a lui `award_xp` o actualiza, dar nu seta niciodată
--    `last_active_date`. Aceea rămânea NULL, deci condiţia cădea mereu pe
--    ramura „ia-o de la capăt" şi streak-ul nu trecea de 1.
--  - apoi `award_xp` a fost rescrisă de trei ori (029, 030, 033) şi bucata cu
--    streak-ul a dispărut cu totul.
--
-- Rezultat: era 0 pentru toată lumea, dintotdeauna.
-- ============================================================


-- ------------------------------------------------------------
-- Ziua, aşa cum o simte utilizatorul
-- ------------------------------------------------------------
-- `current_date` din Postgres e în UTC. Pentru cineva din România care rezolvă
-- un puzzle marţi la 01:30, UTC spune încă luni — şi ziua s-ar număra greşit.
create or replace function public.local_today()
returns date language sql stable as $$
  select (now() at time zone 'Europe/Bucharest')::date;
$$;

grant execute on function public.local_today() to authenticated;


-- ------------------------------------------------------------
-- award_xp ţine şi streak-ul
-- ------------------------------------------------------------
-- Restul funcţiei e neschimbat faţă de 033: XP-ul se opreşte la zero, intră în
-- XP-ul săptămânal şi lasă un rând în jurnal.
create or replace function public.award_xp(
  p_user_id uuid, p_amount integer, p_source text default null
)
returns void language plpgsql security definer as $$
declare
  v_week_start date;
  v_today date := public.local_today();
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

  -- Doar XP-ul câştigat ţine streak-ul. O pierdere (răspuns greşit la
  -- provocarea deschiderilor) nu strică ziua, dar nici n-o aprinde.
  if p_amount > 0 then
    update public.profiles
      set
        streak_days = case
          when last_active_date = v_today then streak_days       -- deja numărată azi
          when last_active_date = v_today - 1 then streak_days + 1
          else 1                                                  -- prima zi, sau după o pauză
        end,
        last_active_date = v_today
    where id = p_user_id;
  end if;
end;
$$;


-- ------------------------------------------------------------
-- Streak-ul real, ţinând cont de zilele trecute
-- ------------------------------------------------------------
-- `streak_days` e o fotografie de la ultima zi cu XP. Dacă de atunci au trecut
-- două zile, cifra e învechită: streak-ul s-a rupt, dar nimeni n-a trecut pe
-- acolo să scrie 0. De aceea afişarea trece mereu prin funcţia asta.
--
-- Ziua de azi încă nu contează ca ruptură: ai timp până la miezul nopţii.
create or replace function public.effective_streak(p_streak integer, p_last date)
returns integer language sql immutable as $$
  select case
    when p_last is null then 0
    when p_last >= (now() at time zone 'Europe/Bucharest')::date - 1 then coalesce(p_streak, 0)
    else 0
  end;
$$;

grant execute on function public.effective_streak(integer, date) to authenticated;


-- ------------------------------------------------------------
-- Ultimele şapte zile, pentru panoul din bară
-- ------------------------------------------------------------
-- Se citeşte din jurnalul de XP, nu din `streak_days`: acolo scrie ce s-a
-- întâmplat în fiecare zi, nu doar câte au fost la rând.
create or replace function public.my_streak_week()
returns jsonb language sql security definer stable as $$
  with zile as (
    select d::date as zi
    from generate_series(
      public.local_today() - 6,
      public.local_today(),
      interval '1 day'
    ) d
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'day', z.zi,
        'earned', exists (
          select 1 from public.xp_ledger l
          where l.user_id = auth.uid()
            and l.amount > 0
            and (l.created_at at time zone 'Europe/Bucharest')::date = z.zi
        )
      )
      order by z.zi
    ),
    '[]'::jsonb
  )
  from zile z;
$$;

grant execute on function public.my_streak_week() to authenticated;


-- ------------------------------------------------------------
-- Recuperarea streak-urilor din jurnal
-- ------------------------------------------------------------
-- Jurnalul de XP există din migrarea 030, deci pentru cine a strâns XP de
-- atunci putem reconstrui streak-ul în loc să pornim toată lumea de la zero.
-- Activitatea de dinainte de 030 nu e recuperabilă — nu s-a înregistrat nicăieri
-- pe zile.
do $$
declare
  r record;
  v_zi date;
  v_streak integer;
  v_prev date;
begin
  for r in select distinct user_id from public.xp_ledger where amount > 0 loop
    v_streak := 0;
    v_prev := null;

    -- Zilele cu XP, de la cea mai recentă înapoi. Ne oprim la prima ruptură.
    for v_zi in
      select distinct (created_at at time zone 'Europe/Bucharest')::date as zi
      from public.xp_ledger
      where user_id = r.user_id and amount > 0
      order by zi desc
    loop
      if v_prev is null then
        -- Prima zi găsită trebuie să fie azi sau ieri, altfel streak-ul e rupt.
        if v_zi < public.local_today() - 1 then exit; end if;
        v_streak := 1;
      elsif v_zi = v_prev - 1 then
        v_streak := v_streak + 1;
      else
        exit;
      end if;
      v_prev := v_zi;
    end loop;

    if v_streak > 0 then
      update public.profiles
        set streak_days = v_streak, last_active_date = v_prev + (v_streak - 1)
      where id = r.user_id;
    end if;
  end loop;
end $$;
