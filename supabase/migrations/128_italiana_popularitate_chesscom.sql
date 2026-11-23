-- ============================================================
-- Partida Italiană: popularitatea capitolelor, din baza de maeştri Chess.com
-- ============================================================
-- Utilizatorul, pe 2026-11-23: „putem să luăm procentele de pe Chess.com, nu de
-- pe Lichess?". Migrarea 127 le luase din baza de maeştri Lichess.
--
-- Sursa: exploratorul Chess.com, „Master Games", citit pe 2026-11-23.
-- 82 799 de partide ajung la poziţia de după 1.e4 e5 2.Cf3 Cc6 3.Nc4.
-- Cota fiecărui capitol din ele:
--   Giuoco Piano       4.c3 Cf6 5.d4              5 442  →  7%
--   Giuoco Pianissimo  4.c3 Cf6 5.d3 (11 524)
--                      + 4.d3 (6 975)            18 499  → 22%
--   Gambitul Evans     4.b4                        3 739  →  5%
--   Doi cai, cu d3     3…Cf6 4.d3                 26 950  → 33%
--   Apărarea Ungară    3…Ne7                       2 591  →  3%
-- ============================================================

update public.opening_lines l
   set popularity_pct = v.pop
  from public.courses c,
       (values ('A', 7), ('D', 22), ('E', 5), ('B', 33), ('C', 3)) as v(cod, pop)
 where l.course_id = c.id
   and c.slug = 'italian-game'
   and l.variation_code = v.cod;

do $$
declare
  rez text;
begin
  select string_agg(l.variation_code || '=' || l.popularity_pct::int, ' ' order by l.order_index) into rez
    from public.opening_lines l join public.courses c on c.id = l.course_id
   where c.slug = 'italian-game';
  if rez is distinct from 'A=7 D=22 E=5 B=33 C=3' then
    raise exception 'Popularitatea a ieşit %, trebuia A=7 D=22 E=5 B=33 C=3', rez;
  end if;
  raise notice 'OK: %', rez;
end $$;
