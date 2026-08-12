-- ============================================================
-- Promovare competitivă + perk-ul „Promovare onorifică"
-- ============================================================
-- Până acum promovarea era pe prag: treceai de 1300 XP total, erai în Bazat.
-- Automat, indiferent de ceilalţi. Într-un asemenea sistem, doi jucători la
-- egalitate de XP nu se influenţează deloc — deci un perk pentru egalităţi
-- n-avea ce să facă.
--
-- Acum liga e o competiţie săptămânală: primii din clasamentul ligii urcă.
-- Retrogradarea rămâne pe prag absolut (sub minimul săptămânal), cu scuturile
-- de la migrarea 027 — aşa cine e activ nu coboară niciodată, indiferent de
-- cât de tare e concurenţa.
-- ============================================================

alter table public.profiles
  -- Ca la scuturi: se stochează doar câte s-au consumat. Câte are cineva se
  -- deduce din nivel, deci nu trebuie ţinut nimic sincron la avansare.
  add column if not exists honorary_used integer not null default 0;

-- Minimul săptămânal per ligă. Era scris doar în client şi în edge function;
-- acum îl foloseşte şi promovarea, deci are nevoie de o singură sursă.
create or replace function public.league_weekly_min(p_league text)
returns integer language sql immutable as $$
  select case p_league
    when 'cherestea' then 30
    when 'tinichea'  then 50
    when 'bronz'     then 75
    when 'argint'    then 100
    when 'aur'       then 150
    when 'smarald'   then 200
    when 'diamant'   then 250
    else 0
  end;
$$;

-- Nivelurile care dau „Promovare onorifică". Trebuie să corespundă cu
-- HONORARY_LEVELS din src/lib/unlocks.ts.
create or replace function public.honorary_earned(p_xp integer)
returns integer language sql immutable as $$
  select count(*)::integer
  from unnest(array[25, 45, 65, 85]) as lvl
  where lvl <= public.player_level(p_xp);
$$;

create or replace function public.honorary_left(p_xp integer, p_used integer)
returns integer language sql immutable as $$
  select greatest(0, public.honorary_earned(p_xp) - coalesce(p_used, 0));
$$;

grant execute on function public.league_weekly_min(text) to authenticated;
grant execute on function public.honorary_earned(integer) to authenticated;
grant execute on function public.honorary_left(integer, integer) to authenticated;

-- ============================================================
-- award_xp nu mai promovează
-- ============================================================
-- Aceeaşi funcţie ca în 001, fără blocul care schimba liga la trecerea pragului.
-- Liga se decide acum o dată pe săptămână, prin competiţie.
create or replace function public.award_xp(p_user_id uuid, p_amount integer)
returns void language plpgsql security definer as $$
declare
  v_week_start date;
begin
  update public.profiles
    set xp = xp + p_amount
  where id = p_user_id;

  v_week_start := (date_trunc('week', now()))::date;

  insert into public.user_weekly_xp (user_id, week_start, xp_earned, league_at_week_start)
  values (p_user_id, v_week_start, p_amount,
    (select current_league from public.profiles where id = p_user_id))
  on conflict (user_id, week_start)
  do update set xp_earned = user_weekly_xp.xp_earned + p_amount;
end;
$$;

-- ============================================================
-- Promovarea săptămânală
-- ============================================================
-- Regula: urcă primii 20% din ligă, minimum o persoană, dar numai cei care au
-- strâns măcar minimul săptămânal. Fără condiţia asta, într-o ligă cu trei
-- oameni inactivi ar promova cineva cu 0 XP.
--
-- Egalitatea la ultimul loc: cine are exact acelaşi XP săptămânal ca ultimul
-- promovat, dar a rămas pe dinafară, urcă şi el dacă are o „Promovare
-- onorifică" — care se consumă. Ăsta e momentul pentru care există perk-ul.
create or replace function public.apply_weekly_promotions(p_week_start date)
returns jsonb language plpgsql security definer as $$
declare
  v_order text[] := array['cherestea','tinichea','bronz','argint','aur','smarald','diamant'];
  v_league text;
  v_idx integer;
  v_next text;
  v_min integer;
  v_eligible integer;
  v_slots integer;
  v_cutoff integer;
  v_promoted integer := 0;
  v_honorary integer := 0;
  r record;
begin
  foreach v_league in array v_order loop
    -- Din liga supremă nu se promovează nicăieri
    if v_league = 'diamant' then continue; end if;

    v_idx := array_position(v_order, v_league);
    v_next := v_order[v_idx + 1];
    v_min := public.league_weekly_min(v_league);

    -- Câţi au dreptul: membri ai ligii care au atins minimul săptămânal
    select count(*) into v_eligible
    from public.user_weekly_xp w
    join public.profiles p on p.id = w.user_id
    where w.week_start = p_week_start
      and p.current_league = v_league
      and w.xp_earned >= v_min;

    if v_eligible = 0 then continue; end if;

    -- Primii 20%, dar cel puţin unul
    v_slots := greatest(1, ceil(v_eligible * 0.2)::integer);

    -- XP-ul ultimului loc promovabil — pragul la care apar egalităţile
    select w.xp_earned into v_cutoff
    from public.user_weekly_xp w
    join public.profiles p on p.id = w.user_id
    where w.week_start = p_week_start
      and p.current_league = v_league
      and w.xp_earned >= v_min
    order by w.xp_earned desc
    limit 1 offset v_slots - 1;

    -- Promovările propriu-zise, în ordine
    for r in
      select w.user_id, w.xp_earned
      from public.user_weekly_xp w
      join public.profiles p on p.id = w.user_id
      where w.week_start = p_week_start
        and p.current_league = v_league
        and w.xp_earned >= v_min
      order by w.xp_earned desc, w.user_id
      limit v_slots
    loop
      update public.profiles set current_league = v_next where id = r.user_id;
      v_promoted := v_promoted + 1;
    end loop;

    -- Egalii rămaşi pe dinafară, care au perk-ul
    for r in
      select w.user_id, p.xp, p.honorary_used
      from public.user_weekly_xp w
      join public.profiles p on p.id = w.user_id
      where w.week_start = p_week_start
        and p.current_league = v_league
        and w.xp_earned = v_cutoff
      order by w.xp_earned desc, w.user_id
      offset v_slots
    loop
      if public.honorary_left(r.xp, r.honorary_used) > 0 then
        update public.profiles
          set current_league = v_next,
              honorary_used = coalesce(honorary_used, 0) + 1
        where id = r.user_id;
        v_honorary := v_honorary + 1;
      end if;
    end loop;
  end loop;

  return jsonb_build_object('promoted', v_promoted, 'honorary', v_honorary);
end;
$$;

revoke execute on function public.apply_weekly_promotions(date) from authenticated;

-- ============================================================
-- Poziţia mea în clasamentul ligii, pentru afişare
-- ============================================================
-- Widget-ul nu mai poate arăta „încă N XP până la liga următoare": liga nu mai
-- depinde de XP-ul total. Arată în schimb pe ce loc eşti şi câţi urcă.
create or replace function public.my_league_standing(p_week_start date)
returns jsonb language plpgsql security definer as $$
declare
  v_me uuid := auth.uid();
  v_league text;
  v_min integer;
  v_my_xp integer;
  v_rank integer;
  v_eligible integer;
  v_slots integer;
begin
  if v_me is null then return null; end if;

  select current_league into v_league from public.profiles where id = v_me;
  v_min := public.league_weekly_min(v_league);

  select coalesce(xp_earned, 0) into v_my_xp
  from public.user_weekly_xp
  where user_id = v_me and week_start = p_week_start;
  v_my_xp := coalesce(v_my_xp, 0);

  select count(*) + 1 into v_rank
  from public.user_weekly_xp w
  join public.profiles p on p.id = w.user_id
  where w.week_start = p_week_start
    and p.current_league = v_league
    and w.xp_earned > v_my_xp;

  select count(*) into v_eligible
  from public.user_weekly_xp w
  join public.profiles p on p.id = w.user_id
  where w.week_start = p_week_start
    and p.current_league = v_league
    and w.xp_earned >= v_min;

  v_slots := case when v_eligible = 0 then 0 else greatest(1, ceil(v_eligible * 0.2)::integer) end;

  return jsonb_build_object(
    'rank', v_rank,
    'weekly_xp', v_my_xp,
    'weekly_min', v_min,
    'promote_slots', v_slots,
    'eligible', v_eligible,
    'in_promotion_zone', v_my_xp >= v_min and v_rank <= v_slots
  );
end;
$$;

grant execute on function public.my_league_standing(date) to authenticated;
