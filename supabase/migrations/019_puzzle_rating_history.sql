-- Migration 019: istoricul rating-ului de puzzle (pentru graficul de evoluție).
-- Logăm fiecare schimbare de rating (plasament + fiecare puzzle) într-o tabelă dedicată.

CREATE TABLE IF NOT EXISTS public.puzzle_rating_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
  rating integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prh_user ON public.puzzle_rating_history(user_id, created_at);

ALTER TABLE public.puzzle_rating_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own rating history" ON public.puzzle_rating_history;
CREATE POLICY "own rating history" ON public.puzzle_rating_history
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- set_puzzle_placement: setează rating-ul + loghează în istoric
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
  WHERE id = p_user_id;

  INSERT INTO public.puzzle_rating_history (user_id, rating) VALUES (p_user_id, v_rating);

  RETURN v_rating;
END;
$$;

-- ============================================================
-- apply_puzzle_result: aplică delta + loghează rating-ul nou în istoric
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

  v_user_band   := least(10, greatest(0, floor((greatest(400, least(2600, v_rating))        - 400)::numeric / 200)::int));
  v_puzzle_band := least(10, greatest(0, floor((greatest(400, least(2600, v_puzzle_rating)) - 400)::numeric / 200)::int));
  v_offset := v_puzzle_band - v_user_band;

  IF v_offset < -1 OR v_offset > 1 THEN
    RETURN jsonb_build_object('error', 'out_of_range', 'offset', v_offset);
  END IF;

  IF p_solved THEN
    v_delta := CASE v_offset WHEN -1 THEN 3  WHEN 0 THEN 5  WHEN 1 THEN 7  END;
  ELSE
    v_delta := CASE v_offset WHEN -1 THEN -7 WHEN 0 THEN -5 WHEN 1 THEN -3 END;
  END IF;

  v_new_rating := greatest(400, least(2600, v_rating + v_delta));

  IF p_solved THEN
    v_streak := v_streak + 1;
  ELSE
    v_streak := 0;
  END IF;

  IF v_streak >= 5 AND v_user_band < 10 THEN
    v_new_rating := greatest(v_new_rating, (v_user_band + 1) * 200 + 400);
    v_streak := 0;
    v_promoted := true;
  END IF;

  UPDATE public.profiles
  SET puzzle_rating = v_new_rating, puzzle_win_streak = v_streak
  WHERE id = p_user_id;

  INSERT INTO public.puzzle_rating_history (user_id, rating) VALUES (p_user_id, v_new_rating);

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
