-- ============================================================
-- Curăţarea întrebărilor duplicate
-- ============================================================
-- Migrarea 034 face un `insert` simplu, fără nicio protecţie la rulare
-- repetată. Rulată de trei ori, a lăsat 180 de rânduri în loc de 60.
--
-- Cele 60 de secvenţe de mutări din 034 sunt distincte între ele (verificat),
-- deci `moves` identifică unic o întrebare şi se poate curăţa după ea.
--
-- Ordinea contează: întâi mutăm sesiunile pe id-urile păstrate, abia apoi
-- ştergem. Invers, o sesiune în desfăşurare ar rămâne cu id-uri moarte şi ar
-- afişa mai puţin de cinci întrebări.
-- ============================================================


-- ------------------------------------------------------------
-- 1. Sesiunile existente trec pe id-urile care rămân
-- ------------------------------------------------------------
-- Nu există cheie străină de la `opening_sessions.question_ids` (e un tablou),
-- deci nimic nu s-ar plânge — sesiunea s-ar strica în tăcere.
with canon as (
  select id, min(id) over (partition by moves) as keep_id
  from public.opening_questions
),
remapped as (
  select
    s.id as session_id,
    array_agg(c.keep_id order by u.ord) as ids
  from public.opening_sessions s
  cross join lateral unnest(s.question_ids) with ordinality as u(qid, ord)
  join canon c on c.id = u.qid
  group by s.id
)
update public.opening_sessions s
set question_ids = r.ids
from remapped r
where s.id = r.session_id
  and s.question_ids is distinct from r.ids;


-- ------------------------------------------------------------
-- 2. Ştergem copiile, păstrând prima
-- ------------------------------------------------------------
delete from public.opening_questions q
where q.id > (
  select min(q2.id) from public.opening_questions q2 where q2.moves = q.moves
);


-- ------------------------------------------------------------
-- 3. Nu se mai poate întâmpla
-- ------------------------------------------------------------
-- Cu constrângerea asta, o nouă rulare a lui 034 dă eroare şi se anulează
-- integral, în loc să dubleze în tăcere. O eroare zgomotoasă e preferabilă
-- unei duplicări pe care o descoperi peste trei săptămâni.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'opening_questions_moves_unique'
  ) then
    alter table public.opening_questions
      add constraint opening_questions_moves_unique unique (moves);
  end if;
end $$;


-- ------------------------------------------------------------
-- 4. Verificare
-- ------------------------------------------------------------
do $$
declare
  v_total integer;
  v_distinct integer;
begin
  select count(*), count(distinct moves)
    into v_total, v_distinct
  from public.opening_questions;

  if v_total <> v_distinct then
    raise exception 'Au rămas duplicate: % rânduri, % secvenţe distincte.',
      v_total, v_distinct;
  end if;

  raise notice 'Banca de întrebări: % (toate distincte).', v_total;
end $$;
