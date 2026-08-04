-- ============================================================
-- Jocul de mijloc: ce faci după ce s-a terminat teoria
-- ============================================================
-- Un curs de deschidere te lasă la mutarea 10–15 cu o poziţie corectă şi
-- niciun plan. Aici se leagă fiecare variantă de ce urmează din ea: structura
-- care rezultă, ideile de urmat şi greşeala tipică.
--
-- Planul atârnă de `opening_lines`, nu de curs: fiecare variantă duce la altă
-- structură, iar un plan comun pe tot cursul n-ar spune nimic. Varianta
-- Avans din Caro-Kann şi cea de Schimb cer lucruri opuse.
--
-- Capcanele atârnă de curs: sunt ale deschiderii ca întreg, nu ale unei
-- singure linii.
-- ============================================================


-- ------------------------------------------------------------
-- Planul unei variante
-- ------------------------------------------------------------
create table if not exists public.middlegame_plans (
  id uuid primary key default gen_random_uuid(),
  opening_line_id uuid not null unique
    references public.opening_lines on delete cascade,

  /** Structura rezultată, într-o propoziţie: de aici pleacă tot restul. */
  structure text not null,

  /** Ideile, în ordinea în care se pun în practică.
      [{ "title": "...", "detail": "..." }] */
  ideas jsonb not null default '[]'::jsonb,

  /** Greşeala tipică în structura asta. Una singură, cea care costă cel mai des. */
  avoid text,

  created_at timestamptz not null default now()
);

alter table public.middlegame_plans enable row level security;

create policy "middlegame_plans_public_read" on public.middlegame_plans
  for select using (true);


-- ------------------------------------------------------------
-- Capcanele unei deschideri
-- ------------------------------------------------------------
create table if not exists public.opening_traps (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses on delete cascade,
  order_index integer not null,
  title text not null,

  /** Cine cade în ea:
      'ours'   — cel care joacă deschiderea (deci: fii atent)
      'theirs' — adversarul, dacă joci precis (deci: ştii ce să urmăreşti) */
  victim text not null check (victim in ('ours', 'theirs')),

  /** Mutările, în notaţie UCI, de la poziţia iniţială. */
  moves_uci text not null,

  /** Ce s-a întâmplat şi de ce. */
  explanation text not null,

  unique (course_id, order_index)
);

alter table public.opening_traps enable row level security;

create policy "opening_traps_public_read" on public.opening_traps
  for select using (true);

create index if not exists opening_traps_course on public.opening_traps (course_id, order_index);


-- ------------------------------------------------------------
-- Tot ce ţine de jocul de mijloc al unui curs, într-o singură cerere
-- ------------------------------------------------------------
-- Pagina de curs are nevoie de variante + planurile lor + capcane. Trei
-- interogări separate ar însemna trei drumuri; aici e unul.
create or replace function public.course_middlegame(p_slug text)
returns jsonb language sql security definer stable as $$
  with c as (
    select id from public.courses where slug = p_slug
  ),
  coloane as (
    select coalesce(jsonb_agg(x order by x_ord), '[]'::jsonb) as v
    from (
      select
        l.order_index as x_ord,
        jsonb_build_object(
          'line_id', l.id,
          'variation_name', l.variation_name,
          'variation_code', l.variation_code,
          'popularity_pct', l.popularity_pct,
          'moves_uci', l.moves_uci,
          'structure', p.structure,
          'ideas', coalesce(p.ideas, '[]'::jsonb),
          'avoid', p.avoid
        ) as x
      from public.opening_lines l
      left join public.middlegame_plans p on p.opening_line_id = l.id
      where l.course_id = (select id from c)
      order by l.order_index
    ) s
  ),
  capcane as (
    select coalesce(jsonb_agg(y order by y_ord), '[]'::jsonb) as v
    from (
      select
        t.order_index as y_ord,
        jsonb_build_object(
          'title', t.title,
          'victim', t.victim,
          'moves_uci', t.moves_uci,
          'explanation', t.explanation
        ) as y
      from public.opening_traps t
      where t.course_id = (select id from c)
      order by t.order_index
    ) s
  )
  select jsonb_build_object(
    'variations', (select v from coloane),
    'traps', (select v from capcane)
  );
$$;

grant execute on function public.course_middlegame(text) to authenticated;
