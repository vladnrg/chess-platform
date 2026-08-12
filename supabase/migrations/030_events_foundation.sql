-- ============================================================
-- Temelia evenimentelor sezoniere + recompense cosmetice
-- ============================================================
-- Chessathon-uri de sărbători, zile ale marilor jucători, „Numește deschiderea",
-- Calendar de Crăciun, promoții de Paști — toate au aceeași formă: un interval
-- de timp, o listă de sarcini care se deschid pe rând, recompense la final.
-- Deci o singură temelie, nu cinci sisteme paralele.
--
-- Trei lucruri noi în bază:
--   1. jurnalul de XP  — ca să putem măsura „cât ai strâns între 20 și 27 decembrie"
--   2. cosmeticele     — badge-uri de profil şi teme de tablă; până acum nu exista
--                        nimic de dăruit, iar calendarul de Crăciun exact asta cere
--   3. evenimentele    — definiţia, sarcinile şi progresul fiecărui utilizator
--
-- Conţinutul propriu-zis (ușile calendarului, întrebările, zilele jucătorilor)
-- stă în migrarea 031. Aici e doar mecanismul.
-- ============================================================


-- ============================================================
-- 1. Jurnalul de XP
-- ============================================================
-- Până acum XP-ul se aduna în `profiles.xp` şi, agregat pe săptămână, în
-- `user_weekly_xp`. Niciuna nu poate răspunde la „cât ai strâns în intervalul
-- 20–27 decembrie", fiindcă un chessathon nu respectă graniţele săptămânii.
-- Un rând per acordare rezolvă asta şi deschide şi graficele de activitate.
create table if not exists public.xp_ledger (
  id bigserial primary key,
  user_id uuid not null references public.profiles on delete cascade,
  amount integer not null,
  -- de unde a venit: 'puzzle', 'lesson', 'match', 'event', 'streak'...
  source text,
  created_at timestamptz not null default now()
);

create index if not exists xp_ledger_user_time
  on public.xp_ledger (user_id, created_at desc);

alter table public.xp_ledger enable row level security;

create policy "xp_ledger_read_own" on public.xp_ledger
  for select using (auth.uid() = user_id);
-- Scrierea se face doar prin award_xp (security definer). Nicio politică de
-- insert pentru `authenticated` — altfel oricine şi-ar putea fabrica istoricul.


-- ============================================================
-- 2. Cosmetice
-- ============================================================
-- Două feluri, deocamdată: `badge` (apare lângă nume) şi `board` (culorile
-- tablei). Amândouă sunt pur vizuale — nu dau niciun avantaj în joc. Asta e
-- intenţionat: recompensele de eveniment nu trebuie să creeze două categorii
-- de jucători, ca la sistemul de niveluri unde nimic din ce ţine de învăţat nu
-- stă după o poartă.
create table if not exists public.cosmetics (
  id text primary key,
  kind text not null check (kind in ('badge', 'board')),
  name text not null,
  description text,
  rarity text not null default 'common'
    check (rarity in ('common', 'rare', 'epic', 'legendary')),
  -- badge → {"emoji": "🎄", "color": "#4ade80"}
  -- board → {"light": "#EDE4D3", "dark": "#4A6B52"}
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.cosmetics enable row level security;

-- Catalogul e public: vrem ca oamenii să vadă ce se poate câştiga, chiar dacă
-- încă n-au câştigat nimic. Un premiu invizibil nu motivează pe nimeni.
create policy "cosmetics_public_read" on public.cosmetics
  for select using (true);


create table if not exists public.user_cosmetics (
  user_id uuid not null references public.profiles on delete cascade,
  cosmetic_id text not null references public.cosmetics on delete cascade,
  earned_at timestamptz not null default now(),
  -- slug-ul evenimentului din care a venit, pentru „câştigat la Crăciun 2026"
  source text,
  primary key (user_id, cosmetic_id)
);

alter table public.user_cosmetics enable row level security;

-- Se citesc şi ale altora: badge-ul se vede lângă nume în clasamente şi în
-- cardul de jucător, deci trebuie să fie vizibil pentru toţi.
create policy "user_cosmetics_read_all" on public.user_cosmetics
  for select using (auth.role() = 'authenticated');
-- Fără politică de insert: cosmeticele se acordă doar prin funcţiile de mai jos.


-- Ce are echipat fiecare. Referinţele se anulează dacă un cosmetic dispare din
-- catalog, ca să nu rămână profilul cu o cheie moartă.
alter table public.profiles
  add column if not exists equipped_badge text references public.cosmetics on delete set null,
  add column if not exists equipped_board text references public.cosmetics on delete set null;


-- ============================================================
-- 3. Evenimente
-- ============================================================
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  kind text not null check (kind in
    ('chessathon', 'player_day', 'name_opening', 'advent', 'promo')),
  title text not null,
  tagline text,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  -- specific pe tip: ţinta unui chessathon, procentul unei promoţii etc.
  config jsonb not null default '{}'::jsonb,
  accent_color text not null default '#E2B340',
  -- numele unui icon lucide-react, rezolvat în client
  icon text not null default 'Sparkles',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  constraint events_interval_valid check (ends_at > starts_at)
);

create index if not exists events_window on public.events (starts_at, ends_at)
  where is_published;

alter table public.events enable row level security;

create policy "events_published_read" on public.events
  for select using (is_published = true);


-- Sarcinile dintr-un eveniment: cele 24 de uşi ale calendarului, întrebările de
-- „Numește deschiderea", puzzle-ul zilei unui jucător.
create table if not exists public.event_tasks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events on delete cascade,
  order_index integer not null,
  -- când se deschide sarcina; null = odată cu evenimentul.
  -- Aşa o uşă de calendar nu se poate deschide mai devreme.
  available_at timestamptz,
  title text not null,
  prompt text,
  task_type text not null default 'info'
    check (task_type in ('puzzle', 'quiz', 'info')),
  -- Pentru 'puzzle': null înseamnă „un puzzle pe măsura ta", ales la deschidere
  -- după rating. Preferabil unui id fix, care ar da acelaşi exerciţiu tuturor.
  puzzle_id text references public.puzzles on delete set null,
  -- Pentru 'quiz': {"options": [...], "answer": 2, "explanation": "..."}
  payload jsonb not null default '{}'::jsonb,
  xp_reward integer not null default 0,
  cosmetic_reward text references public.cosmetics on delete set null,
  unique (event_id, order_index)
);

alter table public.event_tasks enable row level security;
-- ATENŢIE: nicio politică de select. `payload` conţine răspunsul corect, iar o
-- politică de citire l-ar livra clientului înainte de a răspunde — adică quiz-ul
-- s-ar putea rezolva din consola browserului. Sarcinile se citesc exclusiv prin
-- `event_detail()`, care taie răspunsurile.


create table if not exists public.user_event_tasks (
  user_id uuid not null references public.profiles on delete cascade,
  task_id uuid not null references public.event_tasks on delete cascade,
  completed_at timestamptz not null default now(),
  correct boolean not null default true,
  primary key (user_id, task_id)
);

alter table public.user_event_tasks enable row level security;

create policy "user_event_tasks_read_own" on public.user_event_tasks
  for select using (auth.uid() = user_id);
-- Fără insert direct: altfel oricine ar putea marca uşa 24 ca deschisă.


-- ============================================================
-- 4. award_xp scrie şi în jurnal
-- ============================================================
-- Aceeaşi funcţie ca în 029 (fără promovare automată), plus rândul din jurnal.
create or replace function public.award_xp(
  p_user_id uuid, p_amount integer, p_source text default null
)
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

  insert into public.xp_ledger (user_id, amount, source)
  values (p_user_id, p_amount, p_source);
end;
$$;

-- Apelurile vechi, cu două argumente, rămân valide: `p_source` are default.
-- Postgres păstrează însă şi vechea semnătură cu exact 2 parametri dacă a fost
-- creată separat, iar atunci apelul ar fi ambiguu. O ştergem explicit.
drop function if exists public.award_xp(uuid, integer);


-- ============================================================
-- 5. Cosmeticele: acordare şi echipare
-- ============================================================
create or replace function public.grant_cosmetic(
  p_user_id uuid, p_cosmetic_id text, p_source text default null
)
returns boolean language plpgsql security definer as $$
declare
  v_rows integer;
begin
  if p_cosmetic_id is null then return false; end if;

  insert into public.user_cosmetics (user_id, cosmetic_id, source)
  values (p_user_id, p_cosmetic_id, p_source)
  on conflict (user_id, cosmetic_id) do nothing;

  -- `row_count` e întreg, nu boolean — de aici trece prin variabila asta.
  get diagnostics v_rows = row_count;
  return v_rows > 0;   -- true doar dacă e prima dată
end;
$$;

revoke execute on function public.grant_cosmetic(uuid, text, text) from authenticated;


-- Echiparea verifică proprietatea şi felul, ca să nu ajungă o temă de tablă în
-- locul badge-ului.
create or replace function public.equip_cosmetic(p_cosmetic_id text)
returns void language plpgsql security definer as $$
declare
  v_me uuid := auth.uid();
  v_kind text;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;

  -- null dezechipează, indiferent de fel — dar trebuie să ştim care fel.
  if p_cosmetic_id is null then
    raise exception 'use_unequip_cosmetic';
  end if;

  select kind into v_kind from public.cosmetics where id = p_cosmetic_id;
  if v_kind is null then raise exception 'unknown_cosmetic'; end if;

  if not exists (
    select 1 from public.user_cosmetics
    where user_id = v_me and cosmetic_id = p_cosmetic_id
  ) then
    raise exception 'cosmetic_not_owned';
  end if;

  if v_kind = 'badge' then
    update public.profiles set equipped_badge = p_cosmetic_id where id = v_me;
  else
    update public.profiles set equipped_board = p_cosmetic_id where id = v_me;
  end if;
end;
$$;

grant execute on function public.equip_cosmetic(text) to authenticated;


create or replace function public.unequip_cosmetic(p_kind text)
returns void language plpgsql security definer as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null then raise exception 'not_authenticated'; end if;

  if p_kind = 'badge' then
    update public.profiles set equipped_badge = null where id = v_me;
  elsif p_kind = 'board' then
    update public.profiles set equipped_board = null where id = v_me;
  else
    raise exception 'unknown_kind';
  end if;
end;
$$;

grant execute on function public.unequip_cosmetic(text) to authenticated;


-- ============================================================
-- 6. Citirea evenimentelor
-- ============================================================
-- Evenimentele vizibile acum, cu progresul meu. Cele viitoare apar şi ele, ca
-- să se vadă ce urmează — dar fără sarcini.
create or replace function public.list_events()
returns jsonb language sql security definer stable as $$
  select coalesce(jsonb_agg(s.payload order by s.sort_key), '[]'::jsonb)
  from (
    select ev.starts_at as sort_key, jsonb_build_object(
      'slug', ev.slug,
      'kind', ev.kind,
      'title', ev.title,
      'tagline', ev.tagline,
      'description', ev.description,
      'starts_at', ev.starts_at,
      'ends_at', ev.ends_at,
      'config', ev.config,
      'accent_color', ev.accent_color,
      'icon', ev.icon,
      'status', case
        when now() < ev.starts_at then 'upcoming'
        when now() > ev.ends_at then 'ended'
        else 'live'
      end,
      'total_tasks', (
        select count(*) from public.event_tasks t where t.event_id = ev.id
      ),
      'done_tasks', (
        select count(*)
        from public.event_tasks t
        join public.user_event_tasks u on u.task_id = t.id
        where t.event_id = ev.id and u.user_id = auth.uid() and u.correct
      )
    ) as payload
    from public.events ev
    where ev.is_published
      and ev.ends_at > now() - interval '14 days'   -- cele încheiate recent rămân vizibile
  ) s;
$$;

grant execute on function public.list_events() to authenticated;


-- Un eveniment cu sarcinile lui. Aici se face cenzura: pentru o sarcină la care
-- nu am răspuns încă, `payload` pleacă fără cheia `answer`.
create or replace function public.event_detail(p_slug text)
returns jsonb language plpgsql security definer stable as $$
declare
  v_me uuid := auth.uid();
  v_ev public.events%rowtype;
  v_tasks jsonb;
begin
  select * into v_ev from public.events
  where slug = p_slug and is_published;
  if not found then return null; end if;

  select coalesce(jsonb_agg(s.payload order by s.sort_key), '[]'::jsonb) into v_tasks
  from (
    select
      t.order_index as sort_key,
      jsonb_build_object(
        'id', t.id,
        'order_index', t.order_index,
        'title', t.title,
        'prompt', t.prompt,
        'task_type', t.task_type,
        'puzzle_id', t.puzzle_id,
        'xp_reward', t.xp_reward,
        'cosmetic_reward', t.cosmetic_reward,
        'available_at', t.available_at,
        'is_open', ((t.available_at is null or now() >= t.available_at)
                    and now() >= v_ev.starts_at),
        'done', (u.task_id is not null),
        'payload', case
          -- răspunsul se dezvăluie doar după ce ai răspuns
          when u.task_id is not null then t.payload
          else t.payload - 'answer' - 'explanation'
        end
      ) as payload
    from public.event_tasks t
    left join public.user_event_tasks u
      on u.task_id = t.id and u.user_id = v_me
    where t.event_id = v_ev.id
  ) s;

  return jsonb_build_object(
    'slug', v_ev.slug,
    'kind', v_ev.kind,
    'title', v_ev.title,
    'tagline', v_ev.tagline,
    'description', v_ev.description,
    'starts_at', v_ev.starts_at,
    'ends_at', v_ev.ends_at,
    'config', v_ev.config,
    'accent_color', v_ev.accent_color,
    'icon', v_ev.icon,
    'status', case
      when now() < v_ev.starts_at then 'upcoming'
      when now() > v_ev.ends_at then 'ended'
      else 'live'
    end,
    'tasks', v_tasks
  );
end;
$$;

grant execute on function public.event_detail(text) to authenticated;


-- ============================================================
-- 7. Rezolvarea unei sarcini
-- ============================================================
-- Verificarea răspunsului se face aici, nu în client. Întoarce ce s-a câştigat,
-- ca interfaţa să poată arăta „+40 XP" şi cosmeticul nou.
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

  -- Fereastra evenimentului
  if now() < v_ev.starts_at or now() > v_ev.ends_at then
    raise exception 'event_closed';
  end if;

  -- Uşa nu se deschide mai devreme
  if v_t.available_at is not null and now() < v_t.available_at then
    raise exception 'task_not_open';
  end if;

  -- Deja rezolvată: nu se acordă a doua oară
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

  -- Răspunsul greşit nu se înregistrează: quiz-urile de eveniment sunt de
  -- învăţat, nu de pedepsit. Poţi reîncerca, dar XP-ul vine o singură dată.
  if not v_correct then
    return jsonb_build_object(
      'correct', false, 'xp', 0,
      'answer', v_expected,
      'explanation', v_t.payload->>'explanation'
    );
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

grant execute on function public.complete_event_task(uuid, integer) to authenticated;


-- ============================================================
-- 8. Chessathon: cât am strâns în fereastra evenimentului
-- ============================================================
-- Aici se vede de ce era nevoie de jurnal: intervalul unui chessathon
-- (ex. 20–27 decembrie) taie prin mijlocul săptămânilor.
create or replace function public.chessathon_progress(p_slug text)
returns jsonb language plpgsql security definer stable as $$
declare
  v_me uuid := auth.uid();
  v_ev public.events%rowtype;
  v_target integer;
  v_mine integer;
  v_community bigint;
  v_participants bigint;
begin
  select * into v_ev from public.events
  where slug = p_slug and is_published and kind = 'chessathon';
  if not found then return null; end if;

  v_target := coalesce((v_ev.config->>'target_xp')::integer, 0);

  select coalesce(sum(amount), 0) into v_mine
  from public.xp_ledger
  where user_id = v_me
    and created_at >= v_ev.starts_at
    and created_at <= v_ev.ends_at;

  select coalesce(sum(amount), 0), count(distinct user_id)
    into v_community, v_participants
  from public.xp_ledger
  where created_at >= v_ev.starts_at
    and created_at <= v_ev.ends_at;

  return jsonb_build_object(
    'target_xp', v_target,
    'my_xp', v_mine,
    'community_xp', v_community,
    'participants', v_participants,
    'reached', v_target > 0 and v_mine >= v_target
  );
end;
$$;

grant execute on function public.chessathon_progress(text) to authenticated;


-- Premiul de chessathon se ridică o dată, la atingerea ţintei.
create or replace function public.claim_chessathon_reward(p_slug text)
returns jsonb language plpgsql security definer as $$
declare
  v_me uuid := auth.uid();
  v_ev public.events%rowtype;
  v_target integer;
  v_mine integer;
  v_cosmetic text;
  v_new boolean;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;

  select * into v_ev from public.events
  where slug = p_slug and is_published and kind = 'chessathon';
  if not found then raise exception 'event_not_found'; end if;

  if now() < v_ev.starts_at or now() > v_ev.ends_at then
    raise exception 'event_closed';
  end if;

  v_target := coalesce((v_ev.config->>'target_xp')::integer, 0);
  v_cosmetic := v_ev.config->>'reward_cosmetic';

  select coalesce(sum(amount), 0) into v_mine
  from public.xp_ledger
  where user_id = v_me
    and created_at >= v_ev.starts_at
    and created_at <= v_ev.ends_at;

  if v_target = 0 or v_mine < v_target then
    raise exception 'target_not_reached';
  end if;

  v_new := public.grant_cosmetic(v_me, v_cosmetic, v_ev.slug);

  return jsonb_build_object('cosmetic', v_cosmetic, 'cosmetic_is_new', v_new);
end;
$$;

grant execute on function public.claim_chessathon_reward(text) to authenticated;


-- ============================================================
-- 9. Cosmeticele mele
-- ============================================================
create or replace function public.my_cosmetics()
returns jsonb language sql security definer stable as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', c.id,
    'kind', c.kind,
    'name', c.name,
    'description', c.description,
    'rarity', c.rarity,
    'payload', c.payload,
    'earned_at', uc.earned_at,
    'source', uc.source
  ) order by uc.earned_at desc), '[]'::jsonb)
  from public.user_cosmetics uc
  join public.cosmetics c on c.id = uc.cosmetic_id
  where uc.user_id = auth.uid();
$$;

grant execute on function public.my_cosmetics() to authenticated;


-- ============================================================
-- 10. Puzzle-ul unei sarcini
-- ============================================================
-- O sarcină de tip `puzzle` fără `puzzle_id` înseamnă „unul pe măsura ta".
-- Alegerea trebuie să fie stabilă: dacă reîncarci pagina şi primeşti alt
-- exerciţiu, poţi încerca la nesfârşit până nimereşti unul uşor. De aici
-- hash-ul pe (utilizator, sarcină) — acelaşi om primeşte mereu acelaşi puzzle
-- la aceeaşi uşă, dar doi oameni primesc lucruri diferite.
create or replace function public.event_task_puzzle(p_task_id uuid)
returns jsonb language plpgsql security definer stable as $$
declare
  v_me uuid := auth.uid();
  v_t public.event_tasks%rowtype;
  v_rating integer;
  v_lo integer;
  v_hi integer;
  v_count bigint;
  v_pick bigint;
  v_p public.puzzles%rowtype;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;

  select * into v_t from public.event_tasks where id = p_task_id;
  if not found then raise exception 'task_not_found'; end if;

  if v_t.puzzle_id is not null then
    select * into v_p from public.puzzles where id = v_t.puzzle_id;
  else
    select coalesce(puzzle_rating, estimated_elo, 800) into v_rating
    from public.profiles where id = v_me;

    v_lo := v_rating - 250;
    v_hi := v_rating + 250;

    select count(*) into v_count
    from public.puzzles where rating between v_lo and v_hi;

    -- Banda goală (rating foarte mic sau foarte mare): cădem pe tot setul,
    -- ca uşa să nu rămână fără conţinut.
    if v_count = 0 then
      v_lo := 0;
      v_hi := 4000;
      select count(*) into v_count
      from public.puzzles where rating between v_lo and v_hi;
    end if;

    if v_count = 0 then return null; end if;

    v_pick := mod(abs(hashtextextended(v_me::text || p_task_id::text, 0)), v_count);

    select * into v_p from public.puzzles
    where rating between v_lo and v_hi
    order by id
    offset v_pick limit 1;
  end if;

  if v_p.id is null then return null; end if;

  return jsonb_build_object(
    'id', v_p.id, 'fen', v_p.fen, 'moves', v_p.moves,
    'rating', v_p.rating, 'themes', v_p.themes,
    'game_url', v_p.game_url, 'title', v_p.title
  );
end;
$$;

grant execute on function public.event_task_puzzle(uuid) to authenticated;
