-- ============================================================
-- Capcanele devin capitol, nu anexă
-- ============================================================
-- Stăteau într-un acordeon sub curs: de citit, nu de exersat. Acum intră în
-- traseu, cu o parcurgere ghidată şi un exerciţiu pentru fiecare.
--
-- Trei lucruri le lipseau ca să poată fi jucate:
--   · din ce variantă răsar — ca să ştie omul unde le va întâlni, şi ca să
--     ştim cu ce culoare îl punem să joace;
--   · explicaţii pe semi-mutare, ca la teorie;
--   · de unde începe exerciţiul — nu de la 1.e4, ci din poziţia în care se
--     armează cursa.
-- ============================================================

alter table public.opening_traps
  /** Varianta din care răsare capcana. `null` = neatribuită; atunci capcana
      nu apare în traseu, fiindcă nu s-ar şti cu ce culoare se joacă. */
  add column if not exists opening_line_id uuid
    references public.opening_lines on delete set null,

  /** Explicaţii pe semi-mutare, indexate de la 0 — aceeaşi convenţie ca la
      `opening_lines.move_explanations`. */
  add column if not exists move_explanations jsonb not null default '{}'::jsonb,

  /** De la a câta semi-mutare porneşte exerciţiul. Semi-mutările dinainte se
      rejoacă pentru poziţia de plecare; nu se cer de la utilizator. */
  add column if not exists spring_ply integer;


-- Legarea capcanelor de variante, după codul variantei.
create or replace function public.seed_trap_link(
  p_slug text, p_ord integer, p_code text, p_spring integer
)
returns void language plpgsql security definer as $$
begin
  update public.opening_traps t
    set opening_line_id = l.id, spring_ply = p_spring
  from public.opening_lines l
  join public.courses c on c.id = l.course_id
  where t.course_id = c.id
    and c.slug = p_slug
    and l.variation_code = p_code
    and t.order_index = p_ord;
end;
$$;

revoke execute on function public.seed_trap_link(text, integer, text, integer) from authenticated;


-- CARO-KANN
-- 1. Matul de pe d6 — din Clasică. Cursa se armează la 5.De2 (semi-mutarea 8).
select public.seed_trap_link('caro-kann-defense', 1, 'A', 8);
-- 2. Nebunul închis în cuşcă — din Avans. Cursa se armează la 5.g4 (8).
select public.seed_trap_link('caro-kann-defense', 2, 'B', 8);
-- 3. Nebunul pe d3 — din Avans. Negrul pedepseşte începând cu 4...Nxd3 (7).
select public.seed_trap_link('caro-kann-defense', 3, 'B', 7);


-- ------------------------------------------------------------
-- RPC-ul, cu ce-i trebuie capitolului
-- ------------------------------------------------------------
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
          'id', t.id,
          'title', t.title,
          'victim', t.victim,
          'moves_uci', t.moves_uci,
          'explanation', t.explanation,
          'opening_line_id', t.opening_line_id,
          'variation_name', l.variation_name,
          'spring_ply', t.spring_ply
        ) as y
      from public.opening_traps t
      left join public.opening_lines l on l.id = t.opening_line_id
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
