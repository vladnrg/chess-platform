-- ============================================================
-- „Dama" devine „regina". Instrucţiunile nu mai spun în ce direcţie.
-- ============================================================
-- Trei schimbări de limbă, peste tot unde există text de curs:
--
--   1. piesa se numeşte regină, nu damă — cuvântul pe care copiii îl ştiu deja;
--   2. instrucţiunile nu mai adaugă „— diagonal", „— vertical", „— salt în L":
--      mutarea trebuie văzută pe tablă, nu citită;
--   3. pătratele se spun cu „de pe … pe …", nu „de la … la …" — o piesă stă PE
--      un pătrat, nu la el.
--
-- Notaţia rămâne D. E litera oficială, vine de la numele vechi al piesei, iar
-- lecţia de abrevieri o spune acum explicit — altfel „D = Regina" ar arăta a
-- greşeală de tipar.


-- ============================================================
-- 1. Instrucţiunile din lecţii, rescrise întregi
-- ============================================================
-- Explicit, nu prin regulă: fiecare şi-a pierdut altceva. Unele aveau indicaţia
-- după linie („— diagonal"), altele o purtau chiar în mijlocul frazei („un
-- pătrat la stânga — pe d1"), iar la nebun era ascunsă în subiect.
update public.lessons
set exercises = (
  replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(
    exercises::text,
    'Mută calul de pe b1 pe c3 — salt în formă de L', 'Mută calul de pe b1 pe c3'),
    'Mută calul de pe h8 pe f7 — salt valid în L',    'Mută calul de pe h8 pe f7'),
    'Mută nebunul de pe c1 pe g5 — diagonal',         'Mută nebunul de pe c1 pe g5'),
    'Mută dama de la d1 la d8 — vertical',            'Mută regina de pe d1 pe d8'),
    'Mută dama de la d1 la a4 — diagonal',            'Mută regina de pe d1 pe a4'),
    'Mută tura de la a1 la h1 — traversează orizontal', 'Mută tura de pe a1 pe h1'),
    'Mută tura pe h8 — traversează vertical',         'Mută tura pe h8'),
    'Mută regele un pătrat la stânga — pe d1',        'Mută regele pe d1'),
    'Mută regele un pătrat înainte — pe e5',          'Mută regele pe e5'),
    'Nebunul de pe c1 se mișcă pe diagonale — click pe f4',
      'Click pe f4, unde poate ajunge nebunul de pe c1')
)::jsonb
where exercises is not null;


-- ============================================================
-- 2. Damă → regină, cu toate formele cuvântului
-- ============================================================
-- `\m` şi `\M` sunt începutul şi sfârşitul de cuvânt în Postgres. Fără ele,
-- orice cuvânt care conţine „dama" ar fi ciopârţit pe dinăuntru.
--
-- Formele lungi se schimbă primele: altfel „damelor" ar rămâne pe jumătate,
-- după ce „dame" i-ar fi mâncat începutul.
create or replace function public.__dama_in_regina(t text) returns text
language sql immutable as $fn$
  select regexp_replace(regexp_replace(regexp_replace(regexp_replace(
         regexp_replace(regexp_replace(regexp_replace(regexp_replace(
         regexp_replace(regexp_replace(regexp_replace(regexp_replace(
           t,
           '\mDamelor\M', 'Reginelor', 'g'), '\mdamelor\M', 'reginelor', 'g'),
           '\mDamele\M',  'Reginele',  'g'), '\mdamele\M',  'reginele',  'g'),
           '\mDamei\M',   'Reginei',   'g'), '\mdamei\M',   'reginei',   'g'),
           '\mDamă\M',    'Regină',    'g'), '\mdamă\M',    'regină',    'g'),
           '\mDama\M',    'Regina',    'g'), '\mdama\M',    'regina',    'g'),
           '\mDame\M',    'Regine',    'g'), '\mdame\M',    'regine',    'g')
$fn$;

update public.lessons set
  title         = public.__dama_in_regina(title),
  theory_html   = public.__dama_in_regina(theory_html),
  exercises     = public.__dama_in_regina(exercises::text)::jsonb,
  key_positions = public.__dama_in_regina(key_positions::text)::jsonb;

update public.courses set
  title       = public.__dama_in_regina(title),
  description = public.__dama_in_regina(description);

update public.opening_lines set
  variation_name    = public.__dama_in_regina(variation_name),
  move_explanations = public.__dama_in_regina(move_explanations::text)::jsonb;

update public.opening_traps set
  title             = public.__dama_in_regina(title),
  explanation       = public.__dama_in_regina(explanation),
  move_explanations = public.__dama_in_regina(move_explanations::text)::jsonb;

update public.middlegame_plans set
  structure         = public.__dama_in_regina(structure),
  avoid             = public.__dama_in_regina(avoid),
  ideas             = public.__dama_in_regina(ideas::text)::jsonb,
  move_explanations = public.__dama_in_regina(move_explanations::text)::jsonb;


-- ============================================================
-- 3. „de la e4" devine „de pe e4"
-- ============================================================
-- Doar înaintea unui pătrat, şi doar când nu urmează „până la": „diagonala de
-- la d8 până la e1" e un interval, nu locul unei piese, şi rămâne cum e.
create or replace function public.__de_la_in_de_pe(t text) returns text
language sql immutable as $fn$
  select regexp_replace(t, 'de la ([a-h][1-8])(?! până)', 'de pe \1', 'g')
$fn$;

update public.lessons set
  theory_html   = public.__de_la_in_de_pe(theory_html),
  exercises     = public.__de_la_in_de_pe(exercises::text)::jsonb,
  key_positions = public.__de_la_in_de_pe(key_positions::text)::jsonb;

update public.courses set description = public.__de_la_in_de_pe(description);

update public.opening_lines set
  move_explanations = public.__de_la_in_de_pe(move_explanations::text)::jsonb;

update public.opening_traps set
  explanation       = public.__de_la_in_de_pe(explanation),
  move_explanations = public.__de_la_in_de_pe(move_explanations::text)::jsonb;

update public.middlegame_plans set
  structure         = public.__de_la_in_de_pe(structure),
  avoid             = public.__de_la_in_de_pe(avoid),
  ideas             = public.__de_la_in_de_pe(ideas::text)::jsonb,
  move_explanations = public.__de_la_in_de_pe(move_explanations::text)::jsonb;


-- ============================================================
-- 4. De ce regina se scrie tot D
-- ============================================================
-- După redenumire, lecţia ar fi spus „D = Regina" fără niciun motiv. Litera e
-- cea oficială şi nu se schimbă; se schimbă doar explicaţia din jurul ei.
update public.lessons
set theory_html = replace(
      theory_html,
      '<strong>D</strong>=Regina',
      '<strong>D</strong>=Regina (litera vine de la „damă", cum i se spunea înainte)')
where theory_html like '%<strong>D</strong>=Regina%';


drop function if exists public.__dama_in_regina(text);
drop function if exists public.__de_la_in_de_pe(text);


-- ============================================================
-- Dovada: toate cifrele de mai jos trebuie să fie 0
-- ============================================================
select
  (select count(*) from public.lessons
     where exercises::text ~ '\m[Dd]am')                    as "lectii_cu_dama",
  (select count(*) from public.opening_traps
     where explanation ~ '\m[Dd]am')                        as "capcane_cu_dama",
  (select count(*) from public.middlegame_plans
     where move_explanations::text ~ '\m[Dd]am')            as "planuri_cu_dama",
  (select count(*) from public.opening_lines
     where move_explanations::text ~ '\m[Dd]am')            as "variante_cu_dama",
  (select count(*) from public.lessons
     where exercises::text ~ '— (diagonal|vertical|salt|traversează)') as "indicatii_ramase",
  (select count(*) from public.lessons
     where exercises::text ~ 'de la [a-h][1-8]')            as "de_la_patrat_ramase";
