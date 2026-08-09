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

-- ------------------------------------------------------------
-- Explicații pe semi-mutare
-- ------------------------------------------------------------
create or replace function public.seed_trap_moves(
  p_slug text, p_ord integer, p_expl jsonb
)
returns void language plpgsql security definer as $$
begin
  update public.opening_traps t
    set move_explanations = p_expl
  from public.courses c
  where t.course_id = c.id and c.slug = p_slug and t.order_index = p_ord;
end;
$$;

revoke execute on function public.seed_trap_moves(text, integer, jsonb) from authenticated;

-- Capcana 1: Matul de pe d6
select public.seed_trap_moves('caro-kann-defense', 1, '{
  "2": "Ocupi centrul.",
  "3": "Negrul răspunde central — o poziție simetrică de pion damă.",
  "4": "Dezvolți și aperi e4. Negrul tocmai amenință pionul e4 cu ...dxe4; Cc3 pregătește reluarea cu Cxe4.",
  "5": "Negrul capturează pionul e4 — evită lanțul închis e5-d4 al Francezei.",
  "6": "Reiei cu calul, o piesă dezvoltată.",
  "7": "Negrul dezvoltă calul pe d7: apără e5 și pregătește Cgf6.",
  "8": "Dama pe e2 — pare natural, dar pregătești capcana.",
  "9": "**GREȘEALA!** Negrul aduce calul de pe g8 pe f6 (pare firesc), dar asta permite Cd6 mat. Mutarea corectă: Cdf6 cu calul de pe d7.",
  "10": "**MAT!** Regele nu are unde să se retragă: pe d7 e calul negrului, d8 dama, e7 pion, f7 pion, f8 nebun. Regele e zidit de propria armată. Pionul e7 ar putea captura calul, dar e țintuit de dama ta de pe e2 (coloana e e deschisă). Nici nebunul f8 nici dama d8 nu ajung la d6: sunt blocate de chiar pionul e7 și calul d7. Și tocmai asta-i esența Caro-Kann-ului: pionul c e pe c6, nu c7, deci nu există cxd6 ca în alte deschideri. Capcana e posibilă pentru că deschiderea în sine ți-o pregătește."
}'::jsonb);

-- Capcana 2: Nebunul închis în cușcă
select public.seed_trap_moves('caro-kann-defense', 2, '{
  "2": "Ocupi centrul.",
  "3": "Negrul răspunde central.",
  "4": "Avansezi pionul — un lanț e5-d4 închis; negrul trebuie să-și scoate nebunul înainte să joace ...e6.",
  "5": "Negrul scoate corect nebunul pe f5 — asta-i mutarea care justifică varianta Avans. Dacă nu-l mută acum, după ...e6 rămâne închis pentru toată partida.",
  "6": "Câștigă spațiu pe flancul regelui și pregătești g4 și h5.",
  "7": "**GREȘEALA!** Negrul blochează centrul prea devreme, fără să fi asigurat nebunului o retragere.",
  "8": "Pionul de pe g4 atacă nebunul pe f5. Nebunul e forțat să se retragă.",
  "9": "Nebunul se retrage pe g6, unde e apărat de propriul pion. Dar acum h7 (singura retragere firească din g6) e blocat de propriul pion de pe h7.",
  "10": "**ATACUL FINAL!** Nebunul pe g6 e atacat din nou. Nu mai are unde să se retragă firesc: f7 are pion, h7 are pion. Mutările cu captura (Nxh5) pierd piesa — albul reia cu Txh5 sau gxh5. Mutările pe diagonala d3–h7 au fiecare propriile probleme: după ...Nf5, albul joacă gxf5; după ...Ne4, nebunul ajunge pe un câmp incomod fără să amenințe nimic; după ...Nd3 și ...Nxc2, piesa cade; după ...Nxh5, piesa cade. Rămâi cu o piesă care se zbate în loc să joace."
}'::jsonb);

-- Capcana 3: Nebunul pe d3
select public.seed_trap_moves('caro-kann-defense', 3, '{
  "2": "Albul ocupă centrul.",
  "3": "Tu răspunzi central.",
  "4": "Albul avansează pionul — lanț e5-d4 închis. Nebunul tău trebuie să iasă acum.",
  "5": "Tu scoți corect nebunul pe f5.",
  "6": "**CAPCANA PENTRU ALB!** Pare firesc, dar schimbă exact piesa de care vrei să scapi, fără nimic în schimb.",
  "7": "Tu accepți — după asta, structura merge în favoarea ta.",
  "8": "Albul reia cu dama.",
  "9": "Tu blochezi centrul și consolidezi structura.",
  "10": "Albul dezvoltă.",
  "11": "**LOVITURA!** Dama ta de pe b6 ține sub observație doi pioni deodată: b2 și d4. Albul nu pierde material — b2 e apărat de nebunul din c1, iar d4 de dama lui de pe d3 — dar de acum înainte trebuie să-i păzească pe amândoi, iar asta îi ține piesele legate."
}'::jsonb);
