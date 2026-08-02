-- ============================================================
-- Deblocări pe niveluri: titluri şi scuturi de retrogradare
-- ============================================================
-- Nivelul se calculează din XP, deci nu se stochează. Se stochează doar ce
-- decide sau consumă utilizatorul: titlul ales şi scuturile rămase.
-- ============================================================

alter table public.profiles
  add column if not exists title text,
  -- Câte scuturi a folosit deja. Câte a câştigat se deduce din nivel, deci
  -- rămase = câştigate − folosite. Aşa nu trebuie ţinut nimic sincron când
  -- utilizatorul urcă în nivel.
  add column if not exists shields_used integer not null default 0;

-- ============================================================
-- Nivelul, calculat în baza de date
-- ============================================================
-- Aceeaşi formulă ca în src/lib/levels.ts. Dacă se schimbă acolo, se schimbă
-- şi aici — altfel aplicaţia şi serverul ar fi de păreri diferite despre ce
-- nivel are cineva.
--   nivel = floor((xp / 5) ^ (1 / 2.2)) + 1, limitat între 1 şi 100
create or replace function public.player_level(p_xp integer)
returns integer language sql immutable as $$
  select greatest(1, least(100,
    floor(power(greatest(0, p_xp)::numeric / 5, 1::numeric / 2.2))::integer + 1
  ));
$$;

-- Câte scuturi a câştigat cineva până la nivelul lui: cele de la 20, 30, 50, 60,
-- 70, 80, 90. Trebuie să corespundă cu UNLOCKS din src/lib/unlocks.ts.
create or replace function public.shields_earned(p_xp integer)
returns integer language sql immutable as $$
  select count(*)::integer
  from unnest(array[20, 30, 50, 60, 70, 80, 90]) as lvl
  where lvl <= public.player_level(p_xp);
$$;

create or replace function public.shields_left(p_xp integer, p_used integer)
returns integer language sql immutable as $$
  select greatest(0, public.shields_earned(p_xp) - coalesce(p_used, 0));
$$;

grant execute on function public.player_level(integer) to authenticated;
grant execute on function public.shields_earned(integer) to authenticated;
grant execute on function public.shields_left(integer, integer) to authenticated;

-- ============================================================
-- Titlul: doar unul deblocat, sau niciunul
-- ============================================================
-- Verificarea se face aici, nu în client: altfel oricine şi-ar putea pune
-- „Legendă" editând cererea.
create or replace function public.set_title(p_title text)
returns void language plpgsql security definer as $$
declare
  v_me uuid := auth.uid();
  v_xp integer;
  v_level integer;
  v_required integer;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;

  if p_title is null then
    update public.profiles set title = null where id = v_me;
    return;
  end if;

  select xp into v_xp from public.profiles where id = v_me;
  v_level := public.player_level(v_xp);

  -- Aceleaşi praguri ca TITLES din src/lib/unlocks.ts
  v_required := case p_title
    when 'Curios' then 5
    when 'Tenace' then 15
    when 'Calculat' then 25
    when 'Neclintit' then 35
    when 'Vulpe bătrână' then 45
    when 'Maestru al platformei' then 50
    when 'Ochi de vultur' then 55
    when 'Mână de fier' then 65
    when 'Strateg' then 75
    when 'Neînduplecat' then 85
    when 'Aproape de vârf' then 95
    when 'Legendă' then 100
    else null
  end;

  if v_required is null then raise exception 'unknown_title'; end if;
  if v_level < v_required then raise exception 'title_locked'; end if;

  update public.profiles set title = p_title where id = v_me;
end;
$$;

grant execute on function public.set_title(text) to authenticated;

-- ============================================================
-- Provocări mai departe, de la nivelul 40
-- ============================================================
-- Înlocuieşte versiunea din migrarea 026: distanţa permisă între ligi creşte
-- de la una la două, odată cu nivelul.
create or replace function public.create_challenge(
  p_to_user uuid, p_rated boolean, p_minutes integer, p_increment integer
)
returns uuid language plpgsql security definer as $$
declare
  v_from uuid := auth.uid();
  v_from_league text;
  v_to_league text;
  v_xp integer;
  v_reach integer;
  v_id uuid;
begin
  if v_from is null then raise exception 'not_authenticated'; end if;
  if v_from = p_to_user then raise exception 'cannot_challenge_self'; end if;

  select current_league, xp into v_from_league, v_xp from public.profiles where id = v_from;
  select current_league into v_to_league from public.profiles where id = p_to_user;
  if v_to_league is null then raise exception 'opponent_not_found'; end if;

  -- De la nivelul 40, poţi provoca până la două ligi distanţă
  v_reach := case when public.player_level(v_xp) >= 40 then 2 else 1 end;

  if abs(public.league_rank(v_from_league) - public.league_rank(v_to_league)) > v_reach then
    raise exception 'league_too_far';
  end if;

  update public.match_challenges
    set status = 'expired'
    where from_user = v_from and to_user = p_to_user
      and status = 'pending' and expires_at < now();

  if exists (
    select 1 from public.match_challenges
    where from_user = v_from and to_user = p_to_user
      and status = 'pending' and expires_at >= now()
  ) then
    raise exception 'challenge_already_pending';
  end if;

  insert into public.match_challenges (from_user, to_user, rated, minutes, increment_seconds)
  values (v_from, p_to_user, p_rated, p_minutes, p_increment)
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.create_challenge(uuid, boolean, integer, integer) to authenticated;

-- ============================================================
-- Retrogradarea consumă întâi un scut
-- ============================================================
-- Apelată de funcţia programată săptămânal. Întoarce ce s-a întâmplat, ca
-- aceasta să poată număra şi raporta.
create or replace function public.apply_relegation(p_user_id uuid)
returns text language plpgsql security definer as $$
declare
  v_league text;
  v_xp integer;
  v_used integer;
  v_idx integer;
  v_order text[] := array['cherestea','tinichea','bronz','argint','aur','smarald','diamant'];
begin
  select current_league, xp, shields_used into v_league, v_xp, v_used
  from public.profiles where id = p_user_id for update;

  if v_league is null or v_league = 'cherestea' then return 'skipped'; end if;

  -- Scutul se consumă înaintea retrogradării
  if public.shields_left(v_xp, v_used) > 0 then
    update public.profiles set shields_used = coalesce(shields_used, 0) + 1
    where id = p_user_id;
    return 'shielded';
  end if;

  v_idx := array_position(v_order, v_league);
  update public.profiles
    set current_league = v_order[greatest(1, v_idx - 1)]
  where id = p_user_id;

  return 'relegated';
end;
$$;

revoke execute on function public.apply_relegation(uuid) from authenticated;
