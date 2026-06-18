-- Migration 018: rating de puzzle (stil chess.com)
-- Benzi de 200 ELO (400–2600), test de plasament, anti-sandbagging (5 corecte la rând → promovare).
-- Toată logica de puncte/benzi e server-side ca să nu poată fi păcălită din client.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS puzzle_rating integer,
  ADD COLUMN IF NOT EXISTS puzzle_win_streak integer NOT NULL DEFAULT 0;

-- ============================================================
-- Plasament: setează rating-ul inițial (DOAR dacă încă nu e plasat)
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_puzzle_placement(p_user_id uuid, p_rating integer)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_rating integer;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  v_rating := greatest(400, least(2600, p_rating));

  UPDATE public.profiles
  SET puzzle_rating = v_rating, puzzle_win_streak = 0
  WHERE id = p_user_id AND puzzle_rating IS NULL;

  RETURN (SELECT puzzle_rating FROM public.profiles WHERE id = p_user_id);
END;
$$;

-- ============================================================
-- Rezultat puzzle: derivă banda din rating-ul REAL al puzzle-ului,
-- validează fereastra de ±1 bandă, aplică delta, gestionează streak + promovare.
-- ============================================================
CREATE OR REPLACE FUNCTION public.apply_puzzle_result(
  p_user_id uuid, p_puzzle_id text, p_solved boolean
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_rating integer;
  v_streak integer;
  v_puzzle_rating integer;
  v_user_band integer;
  v_puzzle_band integer;
  v_offset integer;
  v_delta integer;
  v_promoted boolean := false;
  v_new_rating integer;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT puzzle_rating, puzzle_win_streak INTO v_rating, v_streak
  FROM public.profiles WHERE id = p_user_id;

  IF v_rating IS NULL THEN
    RETURN jsonb_build_object('error', 'not_placed');
  END IF;

  SELECT rating INTO v_puzzle_rating FROM public.puzzles WHERE id = p_puzzle_id;
  IF v_puzzle_rating IS NULL THEN
    RETURN jsonb_build_object('error', 'puzzle_not_found');
  END IF;

  -- bandă = câte intervale de 200 peste 400 (0..10)
  v_user_band   := least(10, greatest(0, floor((greatest(400, least(2600, v_rating))        - 400)::numeric / 200)::int));
  v_puzzle_band := least(10, greatest(0, floor((greatest(400, least(2600, v_puzzle_rating)) - 400)::numeric / 200)::int));
  v_offset := v_puzzle_band - v_user_band;

  -- Doar inferioară / curentă / superioară
  IF v_offset < -1 OR v_offset > 1 THEN
    RETURN jsonb_build_object('error', 'out_of_range', 'offset', v_offset);
  END IF;

  -- Delta de puncte
  IF p_solved THEN
    v_delta := CASE v_offset WHEN -1 THEN 3  WHEN 0 THEN 5  WHEN 1 THEN 7  END;
  ELSE
    v_delta := CASE v_offset WHEN -1 THEN -7 WHEN 0 THEN -5 WHEN 1 THEN -3 END;
  END IF;

  v_new_rating := greatest(400, least(2600, v_rating + v_delta));

  -- Streak
  IF p_solved THEN
    v_streak := v_streak + 1;
  ELSE
    v_streak := 0;
  END IF;

  -- Anti-sandbagging: 5 corecte la rând → sare la podeaua benzii superioare
  IF v_streak >= 5 AND v_user_band < 10 THEN
    v_new_rating := greatest(v_new_rating, (v_user_band + 1) * 200 + 400);
    v_streak := 0;
    v_promoted := true;
  END IF;

  UPDATE public.profiles
  SET puzzle_rating = v_new_rating, puzzle_win_streak = v_streak
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'rating',   v_new_rating,
    'delta',    v_new_rating - v_rating,
    'promoted', v_promoted,
    'streak',   v_streak,
    'offset',   v_offset
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_puzzle_placement(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_puzzle_result(uuid, text, boolean) TO authenticated;
