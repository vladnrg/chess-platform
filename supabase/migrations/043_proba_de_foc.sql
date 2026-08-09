-- ============================================================
-- Proba de foc: repertoriul tău, sub rezistenţă
-- ============================================================
-- Cele trei idei discutate (avantaj după deschidere / serie forţată pe timp /
-- recuperare dintr-un dezavantaj) sunt aici o singură mecanică, fiindcă
-- împărtăşesc exact aceeaşi regulă de punctare:
--
--   porneşti dintr-o poziţie, joci N semimutări contra motorului, iar scorul e
--   CÂT AI ÎMBUNĂTĂŢIT evaluarea faţă de momentul plecării.
--
-- Regula nu se uită la cât de bună era poziţia de start. De-aici vine
-- unificarea: o rundă care porneşte de la egalitate măsoară „cât construieşti",
-- una care porneşte de la −1.2 măsoară „cât recuperezi", şi sunt acelaşi lucru
-- din punctul de vedere al scorului. Tot de-aici vine şi corectitudinea între
-- culori: negrul nu mai e dezavantajat din construcţie, fiindcă nu contează
-- valoarea absolută, ci diferenţa.
--
-- O probă = 3 runde, câte una dintr-un curs pe care l-ai parcurs, trase la
-- sorţi. Un singur ceas pentru toată proba. Un singur clasament.
--
-- CE NU FACE MIGRAREA ASTA: nu conţine poziţii scrise de mână. Poziţiile de
-- plecare ies din `opening_lines` — variantele pe care utilizatorul chiar
-- le-a studiat — iar cele de dezavantaj sunt produse la rulare, în browser,
-- punând motorul să joace o greşeală plauzibilă în locul tău. Tabelul
-- `arena_positions` există pentru poziţii alese de om, mai târziu, când vor fi
-- verificate una câte una.
-- ============================================================


-- ------------------------------------------------------------
-- Poziţii alese de om (deocamdată gol, intenţionat)
-- ------------------------------------------------------------
create table if not exists public.arena_positions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses on delete cascade,
  -- Varianta din care provine, când provine din una. Doar pentru context în
  -- interfaţă; poziţia e dată de `fen`, nu dedusă.
  opening_line_id uuid references public.opening_lines on delete set null,
  kind text not null default 'dezavantaj' check (kind in ('deschidere', 'dezavantaj')),
  fen text not null,
  user_color text not null check (user_color in ('white', 'black')),
  label text not null,
  -- Câte semimutări ţine runda. 16 = 8 mutări de fiecare parte.
  plies integer not null default 16 check (plies between 4 and 40),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_arena_positions_course on public.arena_positions(course_id) where active;

alter table public.arena_positions enable row level security;
drop policy if exists "Poziţiile probei se citesc de oricine" on public.arena_positions;
create policy "Poziţiile probei se citesc de oricine"
  on public.arena_positions for select using (true);


-- ------------------------------------------------------------
-- Probele şi rundele lor
-- ------------------------------------------------------------
create table if not exists public.arena_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  -- Forţa cerută motorului în proba asta. Se păstrează ca să se poată vedea mai
  -- târziu dacă un scor mare vine din joc bun sau din adversar slab.
  target_elo integer not null,
  score_cp integer not null default 0,
  rounds_played integer not null default 0,
  duration_ms integer not null default 0,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists idx_arena_runs_user on public.arena_runs(user_id, finished_at desc);
create index if not exists idx_arena_runs_board on public.arena_runs(finished_at desc, score_cp desc)
  where finished_at is not null;

alter table public.arena_runs enable row level security;
drop policy if exists "Îţi vezi propriile probe" on public.arena_runs;
create policy "Îţi vezi propriile probe" on public.arena_runs
  for select using (auth.uid() = user_id);

create table if not exists public.arena_rounds (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.arena_runs on delete cascade,
  idx integer not null,
  course_id uuid references public.courses on delete set null,
  label text not null,
  kind text not null,
  start_fen text not null,
  base_cp integer not null,
  final_cp integer not null,
  gain_cp integer not null,
  -- Mutările, ca să poată fi refăcută runda. Singura apărare pe care o avem
  -- împotriva unui scor inventat: scorul se calculează în browser, deci un
  -- utilizator hotărât îl poate falsifica. Lista de mutări face rezultatul
  -- verificabil după fapt.
  moves_uci text not null default '',
  unique (run_id, idx)
);

alter table public.arena_rounds enable row level security;
drop policy if exists "Îţi vezi propriile runde" on public.arena_rounds;
create policy "Îţi vezi propriile runde" on public.arena_rounds
  for select using (
    exists (
      select 1 from public.arena_runs r
      where r.id = public.arena_rounds.run_id and r.user_id = auth.uid()
    )
  );


-- ------------------------------------------------------------
-- Cursurile care te califică
-- ------------------------------------------------------------
-- „Parcurs" = ai terminat măcar o lecţie din el. Praguri mai mari ar face proba
-- inaccesibilă exact utilizatorilor noi, care au cea mai mare nevoie de un
-- motiv să revină.
create or replace function public.arena_eligible_courses(p_user uuid)
returns setof uuid
language sql stable security definer
set search_path = public, pg_temp
as $$
  select ucp.course_id
  from public.user_course_progress ucp
  where ucp.user_id = p_user
    and coalesce(array_length(ucp.completed_lesson_ids, 1), 0) >= 1;
$$;

grant execute on function public.arena_eligible_courses(uuid) to authenticated;


-- ------------------------------------------------------------
-- Tragerea la sorţi a unei probe
-- ------------------------------------------------------------
-- Un curs = o rundă, ca să nu pice de trei ori aceeaşi deschidere. În fiecare
-- curs se alege la întâmplare dintre variantele lui şi poziţiile curate, dacă
-- există.
create or replace function public.arena_draw(p_rounds integer default 3)
returns table (
  slot integer,
  source text,
  ref_id uuid,
  course_slug text,
  course_title text,
  label text,
  kind text,
  user_color text,
  moves_uci text,
  fen text,
  plies integer
)
-- Volatilă, nu stabilă: `random()` înăuntru înseamnă că două apeluri în aceeaşi
-- interogare trebuie să dea rezultate diferite.
language plpgsql volatile security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_n integer := greatest(1, least(5, coalesce(p_rounds, 3)));
  -- Exact o rundă din probă porneşte dintr-un dezavantaj. Fără asta, toate ar fi
  -- de tip „construieşte avantaj", fiindcă poziţiile alese de om încă nu există
  -- — iar jumătatea de mecanică pentru recuperare n-ar porni niciodată.
  v_deficit integer := 1 + floor(random() * v_n)::integer;
begin
  if v_user is null then
    raise exception 'Nu eşti autentificat.';
  end if;

  return query
  with parcurse as (
    select c.id as course_id
    from public.courses c
    where c.id in (select * from public.arena_eligible_courses(v_user))
    order by random()
    limit v_n
  ),
  optiuni as (
    -- Variantele studiate: runda porneşte de la capătul deschiderii.
    select
      p.course_id,
      'linie'::text  as source,
      ol.id          as ref_id,
      ol.variation_name as label,
      'deschidere'::text as kind,
      ol.user_color  as user_color,
      ol.moves_uci   as moves_uci,
      null::text     as fen,
      16             as plies
    from parcurse p
    join public.opening_lines ol on ol.course_id = p.course_id
    union all
    -- Poziţii alese de om, când vor exista.
    select
      p.course_id, 'pozitie'::text, ap.id, ap.label, ap.kind,
      ap.user_color, null::text, ap.fen, ap.plies
    from parcurse p
    join public.arena_positions ap on ap.course_id = p.course_id and ap.active
  ),
  aleasa as (
    select distinct on (o.course_id) o.*
    from optiuni o
    order by o.course_id, random()
  ),
  numerotate as (
    select a.*, (row_number() over (order by random()))::integer as slot
    from aleasa a
  )
  select
    n.slot,
    n.source, n.ref_id, c.slug, c.title, n.label,
    -- Poziţiile alese de om îşi păstrează tipul; doar rundele construite din
    -- variante pot fi transformate în runde de recuperare.
    case
      when n.source = 'linie' and n.slot = v_deficit then 'dezavantaj'
      else n.kind
    end,
    n.user_color, n.moves_uci, n.fen, n.plies
  from numerotate n
  join public.courses c on c.id = n.course_id;
end;
$$;

grant execute on function public.arena_draw(integer) to authenticated;


-- ------------------------------------------------------------
-- Închiderea unei probe
-- ------------------------------------------------------------
-- Scorul vine din browser, fiindcă acolo rulează motorul. Nu putem verifica
-- aici evaluările — ar cere Stockfish în bază de date. Ce putem face, şi facem:
-- plafonăm câştigul pe rundă, refuzăm probele imposibil de scurte şi ţinem
-- mutările, ca un scor suspect să poată fi refăcut mutare cu mutare.
create or replace function public.arena_submit(
  p_target_elo integer,
  p_duration_ms integer,
  p_rounds jsonb
)
returns jsonb
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  v_user  uuid := auth.uid();
  v_run   uuid;
  v_total integer := 0;
  v_gain  integer;
  v_r     jsonb;
  v_idx   integer := 0;
  v_xp    integer;
  v_recent integer;
begin
  if v_user is null then
    raise exception 'Nu eşti autentificat.';
  end if;

  if p_rounds is null or jsonb_typeof(p_rounds) <> 'array' then
    raise exception 'Probă fără runde valide.';
  end if;

  if jsonb_array_length(p_rounds) < 1 or jsonb_array_length(p_rounds) > 5 then
    raise exception 'Număr de runde neverosimil.';
  end if;

  -- O probă de 3 runde a 16 semimutări nu se poate juca în 20 de secunde nici
  -- de un motor. Sub pragul ăsta e clar automatizare.
  if coalesce(p_duration_ms, 0) < 20000 then
    raise exception 'Probă prea scurtă ca să fie reală.';
  end if;

  select count(*) into v_recent
  from public.arena_runs ar
  where ar.user_id = v_user
    and ar.finished_at is not null
    and ar.finished_at > now() - interval '45 seconds';

  if v_recent > 0 then
    raise exception 'Ai încheiat o probă chiar acum. Mai aşteaptă puţin.';
  end if;

  insert into public.arena_runs (user_id, target_elo, duration_ms, finished_at)
  values (
    v_user,
    greatest(600, least(3200, coalesce(p_target_elo, 1200))),
    least(p_duration_ms, 3600000),
    now()
  )
  returning id into v_run;

  for v_r in select * from jsonb_array_elements(p_rounds)
  loop
    v_idx := v_idx + 1;

    -- Plafon de ±20 pioni pe rundă: acoperă orice partidă reală, inclusiv un
    -- mat (pe care browserul îl trimite ca ±1000), şi taie valorile inventate.
    v_gain := greatest(-2000, least(2000,
      coalesce((v_r->>'final_cp')::integer, 0) - coalesce((v_r->>'base_cp')::integer, 0)
    ));

    insert into public.arena_rounds (
      run_id, idx, course_id, label, kind, start_fen, base_cp, final_cp, gain_cp, moves_uci
    ) values (
      v_run,
      v_idx,
      (select c.id from public.courses c where c.slug = v_r->>'course_slug'),
      left(coalesce(v_r->>'label', 'Rundă'), 120),
      case when v_r->>'kind' = 'dezavantaj' then 'dezavantaj' else 'deschidere' end,
      left(coalesce(v_r->>'start_fen', ''), 120),
      coalesce((v_r->>'base_cp')::integer, 0),
      coalesce((v_r->>'final_cp')::integer, 0),
      v_gain,
      left(coalesce(v_r->>'moves_uci', ''), 2000)
    );

    v_total := v_total + v_gain;
  end loop;

  update public.arena_runs
     set score_cp = v_total, rounds_played = v_idx
   where id = v_run;

  -- XP: 10 pentru că ai dus proba la capăt, plus până la 60 pentru rezultat.
  -- Nu se pierde XP aici — proba e grea prin construcţie, iar pedeapsa pentru
  -- că ai încercat ar învăţa exact lucrul greşit.
  v_xp := 10 + least(60, greatest(0, v_total / 20));
  perform public.award_xp(v_user, v_xp, 'proba-de-foc');

  return jsonb_build_object(
    'run_id', v_run,
    'score_cp', v_total,
    'rounds', v_idx,
    'xp', v_xp
  );
end;
$$;

grant execute on function public.arena_submit(integer, integer, jsonb) to authenticated;


-- ------------------------------------------------------------
-- Clasamentul
-- ------------------------------------------------------------
-- Pe cel mai bun rezultat, nu pe sumă: altfel ar câştiga cine joacă cel mai
-- mult, nu cine joacă cel mai bine.
create or replace function public.arena_leaderboard(
  p_period text default 'week',
  p_limit integer default 50
)
returns table (
  user_id uuid,
  username text,
  avatar_url text,
  best_cp integer,
  runs integer,
  rank integer
)
language sql stable security definer
set search_path = public, pg_temp
as $$
  with filtrate as (
    select ar.user_id as uid, ar.score_cp as cp
    from public.arena_runs ar
    where ar.finished_at is not null
      and (p_period <> 'week' or ar.finished_at >= date_trunc('week', now()))
  ),
  agregat as (
    select f.uid, max(f.cp)::integer as best_cp, count(*)::integer as runs
    from filtrate f
    group by f.uid
  )
  select
    a.uid,
    p.username,
    p.avatar_url,
    a.best_cp,
    a.runs,
    (row_number() over (order by a.best_cp desc, a.runs asc))::integer
  from agregat a
  join public.profiles p on p.id = a.uid
  order by a.best_cp desc, a.runs asc
  limit greatest(1, least(200, coalesce(p_limit, 50)));
$$;

grant execute on function public.arena_leaderboard(text, integer) to authenticated;


-- ------------------------------------------------------------
-- Starea ta: eşti pregătit? cât ai făcut până acum?
-- ------------------------------------------------------------
create or replace function public.my_arena_stats()
returns jsonb
language sql stable security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'eligible_courses', (select count(*) from public.arena_eligible_courses(auth.uid())),
    'runs',             coalesce((select count(*) from public.arena_runs ar
                                   where ar.user_id = auth.uid() and ar.finished_at is not null), 0),
    'best_cp',          (select max(ar.score_cp) from public.arena_runs ar
                          where ar.user_id = auth.uid() and ar.finished_at is not null),
    'best_week_cp',     (select max(ar.score_cp) from public.arena_runs ar
                          where ar.user_id = auth.uid() and ar.finished_at is not null
                            and ar.finished_at >= date_trunc('week', now())),
    'last_at',          (select max(ar.finished_at) from public.arena_runs ar
                          where ar.user_id = auth.uid() and ar.finished_at is not null)
  );
$$;

grant execute on function public.my_arena_stats() to authenticated;
