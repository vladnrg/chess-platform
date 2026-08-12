-- ============================================================
-- Puzzle-urile nu se mai repetă
-- ============================================================
-- Nu din lipsă de conţinut: banca are 565 de puzzle-uri, dintre care 65 numai
-- în banda 1600–1800. Trei cauze de mecanism, care se adunau:
--
--  1. Selecţia nu ţinea cont de ce ai rezolvat deja. `user_puzzle_attempts`
--     înregistra fiecare încercare, dar nimic nu o citea la alegere. Cu 40 de
--     candidaţi şi alegere pur aleatoare, o repetiţie în primele opt puzzle-uri
--     e mai probabilă decât nu.
--  2. Clientul lua `limit(40)` fără nicio ordonare, deci PostgREST întorcea de
--     fiecare dată aceleaşi rânduri — primele din bandă, în ordinea inserării.
--     Cu ~12 puzzle-uri într-o bandă, alea 12 se roteau la nesfârşit.
--  3. Completarea de la Lichess se declanşa doar când banda era complet goală,
--     ceea ce nu se întâmpla niciodată. Şi chiar dacă s-ar fi declanşat, n-avea
--     cum să salveze: `puzzles` are politică de citire, dar niciuna de scriere,
--     deci `upsert`-ul din client era respins în tăcere.
-- ============================================================


-- ------------------------------------------------------------
-- 1. Următorul puzzle: unul pe care nu l-ai mai văzut
-- ------------------------------------------------------------
-- Întoarce şi câte au mai rămas nevăzute în bandă, ca pagina să ştie când e
-- momentul să aducă altele de la Lichess — înainte să se termine, nu după.
create or replace function public.next_puzzle_for(p_floor integer, p_ceil integer)
returns jsonb language plpgsql security definer stable as $$
declare
  v_me uuid := auth.uid();
  v_p public.puzzles%rowtype;
  v_unseen integer;
  v_total integer;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;

  select count(*) into v_total
  from public.puzzles
  where rating >= p_floor and rating < p_ceil;

  select count(*) into v_unseen
  from public.puzzles p
  where p.rating >= p_floor and p.rating < p_ceil
    and not exists (
      select 1 from public.user_puzzle_attempts a
      where a.user_id = v_me and a.puzzle_id = p.id
    );

  -- Preferăm unul nevăzut, ales la întâmplare pe server.
  select * into v_p
  from public.puzzles p
  where p.rating >= p_floor and p.rating < p_ceil
    and not exists (
      select 1 from public.user_puzzle_attempts a
      where a.user_id = v_me and a.puzzle_id = p.id
    )
  order by random()
  limit 1;

  -- Le-ai văzut pe toate din bandă. Atunci întâi cele pe care nu le-ai rezolvat
  -- niciodată — alea chiar merită revăzute — şi între ele, cele atinse cel mai
  -- demult. `user_puzzle_attempts` reţine şi eşecurile, deci ştim care sunt.
  if v_p.id is null then
    select p.* into v_p
    from public.puzzles p
    join public.user_puzzle_attempts a
      on a.puzzle_id = p.id and a.user_id = v_me
    where p.rating >= p_floor and p.rating < p_ceil
    group by p.id
    order by bool_or(a.solved) asc, max(a.attempted_at) asc, random()
    limit 1;
  end if;

  if v_p.id is null then
    return jsonb_build_object(
      'puzzle', null, 'unseen_left', 0, 'band_total', v_total
    );
  end if;

  return jsonb_build_object(
    'puzzle', jsonb_build_object(
      'id', v_p.id, 'fen', v_p.fen, 'moves', v_p.moves,
      'rating', v_p.rating, 'themes', v_p.themes,
      'game_url', v_p.game_url, 'title', v_p.title
    ),
    'unseen_left', v_unseen,
    'band_total', v_total
  );
end;
$$;

grant execute on function public.next_puzzle_for(integer, integer) to authenticated;


-- ------------------------------------------------------------
-- 2. Salvarea unui puzzle adus de la Lichess
-- ------------------------------------------------------------
-- Nu deschidem `puzzles` la insert pentru toată lumea: e un tabel comun, iar o
-- politică largă ar lăsa pe oricine să bage poziţii inventate pentru toţi
-- ceilalţi. Trece prin funcţia asta, care verifică forma şi nu suprascrie
-- niciodată un puzzle existent.
create or replace function public.store_lichess_puzzle(
  p_id text, p_fen text, p_moves text, p_rating integer,
  p_themes text[], p_game_url text
)
returns void language plpgsql security definer as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;

  -- Id de Lichess: alfanumeric, scurt
  if p_id is null or p_id !~ '^[A-Za-z0-9]{4,10}$' then
    raise exception 'bad_id';
  end if;

  if p_rating is null or p_rating < 300 or p_rating > 3200 then
    raise exception 'bad_rating';
  end if;

  -- Un FEN plauzibil: câmpuri, culoare la mutare, rocade
  if p_fen is null or p_fen !~ '^[1-8pnbrqkPNBRQK/]+ [wb] ' then
    raise exception 'bad_fen';
  end if;

  -- Mutări UCI separate prin spaţiu, cu promovare opţională
  if p_moves is null or p_moves !~ '^([a-h][1-8][a-h][1-8][qrbn]?)( [a-h][1-8][a-h][1-8][qrbn]?)*$' then
    raise exception 'bad_moves';
  end if;

  insert into public.puzzles (id, fen, moves, rating, themes, game_url)
  values (p_id, p_fen, p_moves, p_rating, coalesce(p_themes, '{}'), p_game_url)
  on conflict (id) do nothing;
end;
$$;

grant execute on function public.store_lichess_puzzle(
  text, text, text, integer, text[], text) to authenticated;


-- ------------------------------------------------------------
-- 3. Câte puzzle-uri sunt pe fiecare bandă
-- ------------------------------------------------------------
-- Util ca să vezi dintr-o privire unde e subţire conţinutul.
create or replace function public.puzzle_band_counts()
returns table (floor_rating integer, total bigint)
language sql security definer stable as $$
  select (rating / 200) * 200 as floor_rating, count(*)
  from public.puzzles
  where rating is not null
  group by 1
  order by 1;
$$;

grant execute on function public.puzzle_band_counts() to authenticated;
