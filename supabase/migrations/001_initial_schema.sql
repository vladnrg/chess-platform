-- Enable extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  avatar_url text,
  playing_style text check (playing_style in ('offensive','balanced','pragmatic','defensive')),
  current_league text not null default 'cherestea'
    check (current_league in ('cherestea','tinichea','bronz','argint','aur','smarald','diamant')),
  xp integer not null default 0 check (xp >= 0),
  estimated_elo integer not null default 600,
  assessment_completed boolean not null default false,
  streak_days integer not null default 0,
  last_active_date date,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "Utilizatorul vede propriul profil" on public.profiles
  for select using (auth.uid() = id);
create policy "Utilizatorul actualizează propriul profil" on public.profiles
  for update using (auth.uid() = id);

-- Creare automată profil la înregistrare
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- COURSES
-- ============================================================
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  level text check (level in ('beginner','intermediate','advanced')),
  opening_family text,
  eco_code text,
  playing_styles text[] default '{}',
  is_premium boolean not null default true,
  thumbnail_url text,
  lesson_count integer not null default 0,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.courses enable row level security;
create policy "Toți pot citi cursurile" on public.courses for select using (true);

-- ============================================================
-- LESSONS
-- ============================================================
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses on delete cascade,
  title text not null,
  order_index integer not null,
  pgn text,
  theory_html text,
  key_positions jsonb,
  is_premium boolean not null default true,
  duration_minutes integer not null default 10
);

alter table public.lessons enable row level security;
create policy "Toți pot citi lecțiile" on public.lessons for select using (true);

-- ============================================================
-- USER COURSE PROGRESS
-- ============================================================
create table public.user_course_progress (
  user_id uuid not null references public.profiles on delete cascade,
  course_id uuid not null references public.courses on delete cascade,
  completed_lesson_ids uuid[] not null default '{}',
  last_lesson_id uuid references public.lessons,
  xp_earned integer not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  primary key (user_id, course_id)
);

alter table public.user_course_progress enable row level security;
create policy "Utilizatorul vede propriul progres" on public.user_course_progress
  for all using (auth.uid() = user_id);

-- ============================================================
-- PUZZLES (cache lichess)
-- ============================================================
create table public.puzzles (
  id text primary key,
  fen text not null,
  moves text not null,
  rating integer,
  themes text[] default '{}',
  game_url text
);

alter table public.puzzles enable row level security;
create policy "Toți pot citi puzzle-urile" on public.puzzles for select using (true);

-- ============================================================
-- USER PUZZLE ATTEMPTS
-- ============================================================
create table public.user_puzzle_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  puzzle_id text not null references public.puzzles,
  solved boolean not null,
  time_seconds integer,
  attempted_at timestamptz not null default now()
);

alter table public.user_puzzle_attempts enable row level security;
create policy "Utilizatorul vede propriile tentative" on public.user_puzzle_attempts
  for all using (auth.uid() = user_id);

-- Index pentru query-uri frecvente
create index idx_attempts_user_date on public.user_puzzle_attempts (user_id, attempted_at);
create index idx_attempts_user_puzzle on public.user_puzzle_attempts (user_id, puzzle_id);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.profiles on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan text check (plan in ('monthly','annual')),
  status text not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;
create policy "Utilizatorul vede propriul abonament" on public.subscriptions
  for select using (auth.uid() = user_id);

-- ============================================================
-- ASSESSMENT RESULTS
-- ============================================================
create table public.assessment_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.profiles on delete cascade,
  answers jsonb not null,
  puzzle_score integer not null default 0,
  knowledge_score integer not null default 0,
  estimated_elo integer not null default 600,
  playing_style text check (playing_style in ('offensive','balanced','pragmatic','defensive')),
  recommended_course_ids uuid[] default '{}',
  taken_at timestamptz not null default now()
);

alter table public.assessment_results enable row level security;
create policy "Utilizatorul vede propria evaluare" on public.assessment_results
  for all using (auth.uid() = user_id);

-- ============================================================
-- USER WEEKLY XP (sistem retrogradare)
-- ============================================================
create table public.user_weekly_xp (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  week_start date not null,
  xp_earned integer not null default 0,
  league_at_week_start text check (league_at_week_start in ('cherestea','tinichea','bronz','argint','aur','smarald','diamant')),
  relegation_warning_sent boolean not null default false,
  unique (user_id, week_start)
);

alter table public.user_weekly_xp enable row level security;
create policy "Utilizatorul vede propriul XP săptămânal" on public.user_weekly_xp
  for select using (auth.uid() = user_id);

-- ============================================================
-- FUNCȚIE: acordare XP + update săptămânal
-- ============================================================
create or replace function public.award_xp(p_user_id uuid, p_amount integer)
returns void language plpgsql security definer as $$
declare
  v_week_start date;
  v_new_xp integer;
  v_new_league text;
begin
  v_week_start := date_trunc('week', current_date)::date;

  -- Update XP total pe profil
  update public.profiles
  set xp = xp + p_amount,
      last_active_date = current_date
  where id = p_user_id
  returning xp into v_new_xp;

  -- Calculează liga nouă pe baza XP total
  v_new_league := case
    when v_new_xp >= 5500 then 'diamant'
    when v_new_xp >= 3500 then 'smarald'
    when v_new_xp >= 2200 then 'aur'
    when v_new_xp >= 1300 then 'argint'
    when v_new_xp >= 700  then 'bronz'
    when v_new_xp >= 300  then 'tinichea'
    else 'cherestea'
  end;

  -- Promovare automată (nu retrogradare — asta e gestionată de cron)
  update public.profiles
  set current_league = v_new_league
  where id = p_user_id
    and current_league != v_new_league
    and (
      -- permitem promovare oricând
      case v_new_league
        when 'diamant'  then v_new_xp >= 5500
        when 'smarald'  then v_new_xp >= 3500
        when 'aur'      then v_new_xp >= 2200
        when 'argint'   then v_new_xp >= 1300
        when 'bronz'    then v_new_xp >= 700
        when 'tinichea' then v_new_xp >= 300
        else true
      end
    );

  -- Upsert XP săptămânal
  insert into public.user_weekly_xp (user_id, week_start, xp_earned, league_at_week_start)
  values (p_user_id, v_week_start, p_amount,
    (select current_league from public.profiles where id = p_user_id))
  on conflict (user_id, week_start)
  do update set xp_earned = user_weekly_xp.xp_earned + p_amount;

  -- Update streak
  update public.profiles
  set streak_days = case
    when last_active_date = current_date - 1 then streak_days + 1
    when last_active_date = current_date then streak_days
    else 1
  end
  where id = p_user_id;
end;
$$;
