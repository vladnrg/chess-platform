-- ============================================================
-- Partide între jucători
-- ============================================================
-- Prima parte a aplicaţiei în care doi oameni interacţionează direct. Principiul
-- de bază: clientul nu are voie să scrie nimic în aceste tabele. Toate scrierile
-- trec prin funcţiile de mai jos (security definer) sau prin edge function-ul de
-- validare a mutărilor. Altfel, oricine ar putea să-şi declare victorii şi să-şi
-- fabrice XP.
-- ============================================================

-- Ordinea ligilor, ca număr — ca să putem verifica „aceeaşi ligă, una sub sau
-- una peste". Fără asta, comparaţia s-ar face pe text, ceea ce n-are sens.
create or replace function public.league_rank(p_league text)
returns integer language sql immutable as $$
  select case p_league
    when 'cherestea' then 1
    when 'tinichea'  then 2
    when 'bronz'     then 3
    when 'argint'    then 4
    when 'aur'       then 5
    when 'smarald'   then 6
    when 'diamant'   then 7
    else null
  end;
$$;

-- ============================================================
-- PROVOCĂRI
-- ============================================================
create table if not exists public.match_challenges (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references public.profiles on delete cascade,
  to_user   uuid not null references public.profiles on delete cascade,
  rated boolean not null default true,
  minutes integer not null default 5 check (minutes in (3, 5, 10)),
  increment_seconds integer not null default 0 check (increment_seconds between 0 and 10),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'cancelled', 'expired')),
  match_id uuid,
  created_at timestamptz not null default now(),
  -- O provocare nefolosită nu trebuie să rămână agăţată la nesfârşit
  expires_at timestamptz not null default now() + interval '10 minutes',
  check (from_user <> to_user)
);

create index if not exists idx_challenges_to on public.match_challenges (to_user, status, expires_at);
create index if not exists idx_challenges_from on public.match_challenges (from_user, status);

alter table public.match_challenges enable row level security;

create policy "challenges_own_read" on public.match_challenges
  for select using (auth.uid() = from_user or auth.uid() = to_user);

-- ============================================================
-- PARTIDE
-- ============================================================
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  white_id uuid not null references public.profiles on delete cascade,
  black_id uuid not null references public.profiles on delete cascade,
  rated boolean not null default true,

  -- Ligile de la începutul partidei. Îngheţate aici pentru că XP-ul se calculează
  -- din diferenţa dintre ele, iar liga se poate schimba până la finalul partidei.
  white_league text not null,
  black_league text not null,

  minutes integer not null,
  increment_seconds integer not null default 0,

  -- Starea jocului. `moves` e lista de mutări în notaţie UCI, separate prin spaţiu.
  fen text not null default 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  moves text not null default '',
  turn text not null default 'w' check (turn in ('w', 'b')),

  -- Ceasul, în milisecunde. Serverul e arbitrul: scade timpul scurs de la
  -- `last_move_at`, deci un client nu poate să-şi „îngheţe" ceasul.
  white_time_ms integer not null,
  black_time_ms integer not null,
  last_move_at timestamptz not null default now(),

  draw_offer_by uuid references public.profiles,

  status text not null default 'active' check (status in ('active', 'finished', 'aborted')),
  result text check (result in ('white', 'black', 'draw')),
  result_reason text check (result_reason in
    ('checkmate', 'resign', 'timeout', 'stalemate', 'insufficient', 'repetition', 'fifty', 'agreement', 'abandon')),
  -- Câştigătorul, separat de `result`, ca interogările de clasament să fie simple
  winner_id uuid references public.profiles,

  xp_awarded integer not null default 0,
  started_at timestamptz not null default now(),
  finished_at timestamptz,

  check (white_id <> black_id)
);

create index if not exists idx_matches_players on public.matches (white_id, black_id, status);
create index if not exists idx_matches_active_white on public.matches (white_id) where status = 'active';
create index if not exists idx_matches_active_black on public.matches (black_id) where status = 'active';
-- Clasamentele de victorii: all-time şi pe săptămâna curentă
create index if not exists idx_matches_winner on public.matches (winner_id, finished_at)
  where status = 'finished' and winner_id is not null;

alter table public.matches enable row level security;

-- Partidele terminate sunt publice (arhivă + clasamente), cele active se văd doar
-- de către cei doi jucători — altfel oricine ar putea urmări şi ajuta din afară.
create policy "matches_read" on public.matches
  for select using (
    status = 'finished'
    or auth.uid() = white_id
    or auth.uid() = black_id
  );

-- ============================================================
-- FUNCŢIE: trimite o provocare
-- ============================================================
create or replace function public.create_challenge(
  p_to_user uuid, p_rated boolean, p_minutes integer, p_increment integer
)
returns uuid language plpgsql security definer as $$
declare
  v_from uuid := auth.uid();
  v_from_league text;
  v_to_league text;
  v_id uuid;
begin
  if v_from is null then raise exception 'not_authenticated'; end if;
  if v_from = p_to_user then raise exception 'cannot_challenge_self'; end if;

  select current_league into v_from_league from public.profiles where id = v_from;
  select current_league into v_to_league   from public.profiles where id = p_to_user;
  if v_to_league is null then raise exception 'opponent_not_found'; end if;

  -- Regula ligilor: doar aceeaşi ligă, una sub sau una peste
  if abs(public.league_rank(v_from_league) - public.league_rank(v_to_league)) > 1 then
    raise exception 'league_too_far';
  end if;

  -- O singură provocare activă către acelaşi jucător
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

-- ============================================================
-- FUNCŢIE: răspunde la o provocare (creează partida la acceptare)
-- ============================================================
create or replace function public.respond_challenge(p_challenge_id uuid, p_accept boolean)
returns uuid language plpgsql security definer as $$
declare
  v_me uuid := auth.uid();
  v_ch public.match_challenges%rowtype;
  v_white uuid;
  v_black uuid;
  v_match_id uuid;
  v_ms integer;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;

  select * into v_ch from public.match_challenges where id = p_challenge_id;
  if not found then raise exception 'challenge_not_found'; end if;
  if v_ch.to_user <> v_me then raise exception 'not_your_challenge'; end if;
  if v_ch.status <> 'pending' then raise exception 'challenge_not_pending'; end if;
  if v_ch.expires_at < now() then
    update public.match_challenges set status = 'expired' where id = p_challenge_id;
    raise exception 'challenge_expired';
  end if;

  if not p_accept then
    update public.match_challenges set status = 'declined' where id = p_challenge_id;
    return null;
  end if;

  -- Culorile se trag la sorţi, ca la şahul adevărat
  if random() < 0.5 then
    v_white := v_ch.from_user; v_black := v_ch.to_user;
  else
    v_white := v_ch.to_user;   v_black := v_ch.from_user;
  end if;

  v_ms := v_ch.minutes * 60 * 1000;

  insert into public.matches (
    white_id, black_id, rated,
    white_league, black_league,
    minutes, increment_seconds,
    white_time_ms, black_time_ms
  )
  values (
    v_white, v_black, v_ch.rated,
    (select current_league from public.profiles where id = v_white),
    (select current_league from public.profiles where id = v_black),
    v_ch.minutes, v_ch.increment_seconds,
    v_ms, v_ms
  )
  returning id into v_match_id;

  update public.match_challenges
    set status = 'accepted', match_id = v_match_id
    where id = p_challenge_id;

  return v_match_id;
end;
$$;

-- ============================================================
-- FUNCŢIE: încheie partida şi acordă XP
-- ============================================================
-- Apelată doar de edge function-ul de validare (cu service role) sau de
-- funcţiile de abandon/remiză de mai jos. Niciodată direct de client.
--
-- XP-ul urmează modelul de la puzzle-uri: mai mult dacă adversarul era într-o
-- ligă superioară, mai puţin dacă era inferioară.
--
-- Înfrângerea NU ia XP. XP-ul e sursa nivelului, iar nivelul nu scade niciodată.
-- Presiunea de a nu pierde vine din pragul săptămânal de retrogradare.
create or replace function public.finish_match(
  p_match_id uuid, p_result text, p_reason text
)
returns void language plpgsql security definer as $$
declare
  v_m public.matches%rowtype;
  v_winner uuid;
  v_loser uuid;
  v_winner_league text;
  v_loser_league text;
  v_diff integer;
  v_xp integer := 0;
  v_recent integer;
begin
  select * into v_m from public.matches where id = p_match_id for update;
  if not found then raise exception 'match_not_found'; end if;
  if v_m.status <> 'active' then return; end if;  -- deja încheiată, nimic de făcut

  if p_result = 'white' then
    v_winner := v_m.white_id; v_loser := v_m.black_id;
    v_winner_league := v_m.white_league; v_loser_league := v_m.black_league;
  elsif p_result = 'black' then
    v_winner := v_m.black_id; v_loser := v_m.white_id;
    v_winner_league := v_m.black_league; v_loser_league := v_m.white_league;
  end if;

  -- Anti-fabricare: XP doar pentru primele 3 partide clasate pe zi cu acelaşi
  -- adversar. Peste asta se joacă în continuare, dar fără XP.
  select count(*) into v_recent
  from public.matches
  where status = 'finished' and rated
    and finished_at >= date_trunc('day', now())
    and ((white_id = v_m.white_id and black_id = v_m.black_id)
      or (white_id = v_m.black_id and black_id = v_m.white_id));

  if v_m.rated and v_recent < 3 then
    if p_result = 'draw' then
      -- Remiza: jumătate din XP-ul unei victorii, după aceeaşi regulă de ligi
      v_diff := public.league_rank(v_m.white_league) - public.league_rank(v_m.black_league);
      v_xp := 10;
      perform public.award_xp(v_m.white_id, case when v_diff < 0 then 20 when v_diff > 0 then 5 else 10 end);
      perform public.award_xp(v_m.black_id, case when v_diff > 0 then 20 when v_diff < 0 then 5 else 10 end);
    elsif v_winner is not null then
      v_diff := public.league_rank(v_loser_league) - public.league_rank(v_winner_league);
      v_xp := case
        when v_diff > 0 then 40   -- adversar dintr-o ligă superioară
        when v_diff < 0 then 15   -- adversar dintr-o ligă inferioară
        else 25                   -- aceeaşi ligă
      end;
      perform public.award_xp(v_winner, v_xp);
    end if;
  end if;

  update public.matches set
    status = 'finished',
    result = p_result,
    result_reason = p_reason,
    winner_id = v_winner,
    xp_awarded = v_xp,
    finished_at = now()
  where id = p_match_id;
end;
$$;

-- ============================================================
-- FUNCŢII pe care le poate apela clientul în siguranţă
-- ============================================================
-- Abandon: doar unul dintre jucători, doar pe propria partidă activă.
create or replace function public.resign_match(p_match_id uuid)
returns void language plpgsql security definer as $$
declare
  v_me uuid := auth.uid();
  v_m public.matches%rowtype;
begin
  select * into v_m from public.matches where id = p_match_id;
  if not found then raise exception 'match_not_found'; end if;
  if v_me <> v_m.white_id and v_me <> v_m.black_id then raise exception 'not_your_match'; end if;

  perform public.finish_match(
    p_match_id,
    case when v_me = v_m.white_id then 'black' else 'white' end,
    'resign'
  );
end;
$$;

-- Remiză: primul apel o propune, al doilea (de la celălalt jucător) o acceptă.
create or replace function public.offer_or_accept_draw(p_match_id uuid)
returns text language plpgsql security definer as $$
declare
  v_me uuid := auth.uid();
  v_m public.matches%rowtype;
begin
  select * into v_m from public.matches where id = p_match_id for update;
  if not found then raise exception 'match_not_found'; end if;
  if v_m.status <> 'active' then raise exception 'match_not_active'; end if;
  if v_me <> v_m.white_id and v_me <> v_m.black_id then raise exception 'not_your_match'; end if;

  if v_m.draw_offer_by is not null and v_m.draw_offer_by <> v_me then
    perform public.finish_match(p_match_id, 'draw', 'agreement');
    return 'accepted';
  end if;

  update public.matches set draw_offer_by = v_me where id = p_match_id;
  return 'offered';
end;
$$;

-- Revendicarea timpului expirat. Fără ea, o partidă în care adversarul pur şi
-- simplu pleacă ar rămâne activă la nesfârşit: edge function-ul verifică ceasul
-- doar când cineva încearcă să mute.
--
-- Serverul recalculează el timpul rămas; clientul spune doar „cred că a expirat".
create or replace function public.claim_timeout(p_match_id uuid)
returns void language plpgsql security definer as $$
declare
  v_me uuid := auth.uid();
  v_m public.matches%rowtype;
  v_elapsed_ms bigint;
  v_left_ms bigint;
begin
  select * into v_m from public.matches where id = p_match_id;
  if not found then raise exception 'match_not_found'; end if;
  if v_m.status <> 'active' then return; end if;
  if v_me <> v_m.white_id and v_me <> v_m.black_id then raise exception 'not_your_match'; end if;

  v_elapsed_ms := extract(epoch from (now() - v_m.last_move_at)) * 1000;
  v_left_ms := (case when v_m.turn = 'w' then v_m.white_time_ms else v_m.black_time_ms end) - v_elapsed_ms;

  if v_left_ms > 0 then raise exception 'time_not_expired'; end if;

  perform public.finish_match(
    p_match_id,
    case when v_m.turn = 'w' then 'black' else 'white' end,
    'timeout'
  );
end;
$$;

grant execute on function public.create_challenge(uuid, boolean, integer, integer) to authenticated;
grant execute on function public.claim_timeout(uuid) to authenticated;
grant execute on function public.respond_challenge(uuid, boolean) to authenticated;
grant execute on function public.resign_match(uuid) to authenticated;
grant execute on function public.offer_or_accept_draw(uuid) to authenticated;
grant execute on function public.league_rank(text) to authenticated;

-- finish_match NU se acordă clientului: doar edge function-ul (service role) şi
-- funcţiile de mai sus, care verifică cine eşti, au voie s-o apeleze.
revoke execute on function public.finish_match(uuid, text, text) from authenticated;

-- ============================================================
-- Realtime: clienţii se abonează la schimbările propriei partide
-- ============================================================
alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.match_challenges;
