-- ============================================================
-- Ligile se decid pe clasament, nu pe prag
-- ============================================================
-- Regula nouă, într-o singură propoziţie: în fiecare ligă, la finalul
-- săptămânii, primii o treime urcă, ultimii o treime coboară, restul rămân.
-- Într-o ligă de 30 de oameni: 10 promovează, 10 rămân, 10 retrogradează.
--
-- Dispare complet ideea de „minim săptămânal". Până acum retrogradarea se
-- decidea pe un prag absolut (sub N XP cobori, indiferent de locul în
-- clasament), iar pragul trăia în trei locuri diferite: în edge function ca
-- tabel de constante, în `league_weekly_min` şi în textele din interfaţă.
--
-- Şi mai important: decizia se ia acum într-un singur loc, aici. Edge function
-- doar apelează. Înainte retrogradarea era în TypeScript şi promovarea în SQL,
-- deci puteau ajunge să nu se mai potrivească — exact ce s-a şi întâmplat.
-- ============================================================


-- ------------------------------------------------------------
-- Câţi urcă şi câţi coboară dintr-o ligă de `n` oameni
-- ------------------------------------------------------------
-- `floor(n/3)`, nu `round`: la 30 dă exact 10, iar în ligile mici nu mişcă pe
-- nimeni degeaba. Sub 3 oameni nu urcă şi nu coboară nimeni — n-ai pe cine
-- clasa.
create or replace function public.league_move_slots(p_members integer)
returns integer language sql immutable as $$
  select greatest(0, coalesce(p_members, 0) / 3);
$$;

grant execute on function public.league_move_slots(integer) to authenticated;


-- ------------------------------------------------------------
-- Aplicarea săptămânală: promovări şi retrogradări deodată
-- ------------------------------------------------------------
create or replace function public.apply_weekly_leagues(p_week_start date)
returns jsonb language plpgsql security definer as $$
declare
  v_order text[] := array['cherestea','tinichea','bronz','argint','aur','smarald','diamant'];
  v_league text;
  v_idx integer;
  v_up text;
  v_down text;
  v_n integer;
  v_slots integer;
  v_cutoff integer;
  v_promoted integer := 0;
  v_honorary integer := 0;
  v_relegated integer := 0;
  v_shielded integer := 0;
  r record;
begin
  -- Deciziile se strâng întâi şi se aplică la final. Dacă am muta pe măsură ce
  -- parcurgem ligile, cineva promovat din Bronz ar intra în clasamentul
  -- Argintului înainte ca acela să fie calculat.
  create temp table if not exists _league_moves (
    user_id uuid primary key,
    target text not null
  ) on commit drop;
  delete from _league_moves;

  foreach v_league in array v_order loop
    v_idx  := array_position(v_order, v_league);
    v_up   := case when v_league = 'diamant'   then null else v_order[v_idx + 1] end;
    v_down := case when v_league = 'cherestea' then null else v_order[v_idx - 1] end;

    select count(*) into v_n from public.profiles where current_league = v_league;
    v_slots := public.league_move_slots(v_n);
    if v_slots = 0 then continue; end if;

    v_cutoff := null;

    -- Toţi membrii ligii intră în clasament, inclusiv cei cu 0 XP: nu mai
    -- există prag de participare, deci inactivitatea se plăteşte prin locul
    -- ocupat, nu printr-o regulă separată.
    for r in
      with members as (
        select
          p.id, p.xp, p.shields_used, p.honorary_used,
          coalesce(w.xp_earned, 0) as weekly
        from public.profiles p
        left join public.user_weekly_xp w
          on w.user_id = p.id and w.week_start = p_week_start
        where p.current_league = v_league
      )
      select
        m.*,
        row_number() over (order by m.weekly desc, m.id) as rn
      from members m
      order by rn
    loop
      -- Zona de promovare
      if v_up is not null and r.rn <= v_slots then
        insert into _league_moves (user_id, target) values (r.id, v_up)
        on conflict (user_id) do update set target = excluded.target;
        v_promoted := v_promoted + 1;
        if r.rn = v_slots then v_cutoff := r.weekly; end if;
        continue;
      end if;

      -- Exact la egalitate cu ultimul promovat, dar rămas pe dinafară:
      -- „Promovarea onorifică" îl urcă şi pe el, şi se consumă.
      if v_up is not null and v_cutoff is not null and r.weekly = v_cutoff
         and public.honorary_left(r.xp, r.honorary_used) > 0 then
        insert into _league_moves (user_id, target) values (r.id, v_up)
        on conflict (user_id) do update set target = excluded.target;
        update public.profiles
          set honorary_used = coalesce(honorary_used, 0) + 1
        where id = r.id;
        v_honorary := v_honorary + 1;
        continue;
      end if;

      -- Zona de retrogradare
      if v_down is not null and r.rn > v_n - v_slots then
        -- Scutul se consumă şi te ţine pe loc.
        if public.shields_left(r.xp, r.shields_used) > 0 then
          update public.profiles
            set shields_used = coalesce(shields_used, 0) + 1
          where id = r.id;
          v_shielded := v_shielded + 1;
        else
          insert into _league_moves (user_id, target) values (r.id, v_down)
          on conflict (user_id) do update set target = excluded.target;
          v_relegated := v_relegated + 1;
        end if;
      end if;
    end loop;
  end loop;

  update public.profiles p
  set current_league = m.target
  from _league_moves m
  where p.id = m.user_id;

  return jsonb_build_object(
    'promoted', v_promoted,
    'honorary', v_honorary,
    'relegated', v_relegated,
    'shielded', v_shielded,
    'week', p_week_start
  );
end;
$$;

revoke execute on function public.apply_weekly_leagues(date) from authenticated;


-- ------------------------------------------------------------
-- Unde stau în clasamentul ligii mele
-- ------------------------------------------------------------
-- Fără `weekly_min`: nu mai există prag. În loc, cele trei zone.
create or replace function public.my_league_standing(p_week_start date)
returns jsonb language plpgsql security definer stable as $$
declare
  v_me uuid := auth.uid();
  v_league text;
  v_my_xp integer;
  v_rank integer;
  v_n integer;
  v_slots integer;
begin
  if v_me is null then return null; end if;

  select current_league into v_league from public.profiles where id = v_me;

  select coalesce(xp_earned, 0) into v_my_xp
  from public.user_weekly_xp
  where user_id = v_me and week_start = p_week_start;
  v_my_xp := coalesce(v_my_xp, 0);

  select count(*) into v_n from public.profiles where current_league = v_league;
  v_slots := public.league_move_slots(v_n);

  -- Acelaşi criteriu ca la aplicare: XP descrescător, apoi id.
  select count(*) + 1 into v_rank
  from public.profiles p
  left join public.user_weekly_xp w
    on w.user_id = p.id and w.week_start = p_week_start
  where p.current_league = v_league
    and (coalesce(w.xp_earned, 0) > v_my_xp
      or (coalesce(w.xp_earned, 0) = v_my_xp and p.id < v_me));

  return jsonb_build_object(
    'rank', v_rank,
    'weekly_xp', v_my_xp,
    'members', v_n,
    'promote_slots', case when v_league = 'diamant' then 0 else v_slots end,
    'relegate_slots', case when v_league = 'cherestea' then 0 else v_slots end,
    'in_promotion_zone', v_league <> 'diamant' and v_slots > 0 and v_rank <= v_slots,
    'in_relegation_zone', v_league <> 'cherestea' and v_slots > 0 and v_rank > v_n - v_slots,
    'shields_left', (
      select public.shields_left(xp, shields_used) from public.profiles where id = v_me
    )
  );
end;
$$;

grant execute on function public.my_league_standing(date) to authenticated;


-- ------------------------------------------------------------
-- Cine e acum în zona de retrogradare
-- ------------------------------------------------------------
-- Pentru avertismentul de la mijlocul săptămânii. Înainte se calcula în edge
-- function, comparând cu jumătate din prag; fără prag, singurul răspuns e
-- clasamentul, iar el se ia de aici.
create or replace function public.relegation_zone_users(p_week_start date)
returns table (user_id uuid, league text, place integer, members integer)
language sql security definer stable as $$
  with ranked as (
    select
      p.id,
      p.current_league,
      row_number() over (
        partition by p.current_league
        order by coalesce(w.xp_earned, 0) desc, p.id
      )::integer as rn,
      count(*) over (partition by p.current_league)::integer as n
    from public.profiles p
    left join public.user_weekly_xp w
      on w.user_id = p.id and w.week_start = p_week_start
    -- Din prima ligă nu se coboară nicăieri
    where p.current_league <> 'cherestea'
  )
  select id, current_league, rn, n
  from ranked
  where public.league_move_slots(n) > 0
    and rn > n - public.league_move_slots(n);
$$;

revoke execute on function public.relegation_zone_users(date) from authenticated;


-- ------------------------------------------------------------
-- Ce rămâne fără rost
-- ------------------------------------------------------------
-- `apply_weekly_promotions` şi `apply_relegation` erau cele două jumătăţi ale
-- mecanicii vechi. Le ştergem ca să nu rămână cineva (sau o versiune veche a
-- edge function-ului) să le apeleze şi să mute oameni după reguli care nu mai
-- există.
drop function if exists public.apply_weekly_promotions(date);
drop function if exists public.apply_relegation(uuid);

-- `league_weekly_min` rămâne: nu mai decide nimic, dar migrarea 029 o creează
-- şi n-are rost s-o ştergem — o lăsăm nefolosită, ca să nu stricăm nimic ce
-- încă o citeşte.
