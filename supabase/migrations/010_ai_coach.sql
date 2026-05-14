-- AI Coach usage tracking for rate limiting
CREATE TABLE public.ai_coach_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  count integer NOT NULL DEFAULT 0,
  UNIQUE (user_id, date)
);

ALTER TABLE public.ai_coach_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own ai usage" ON public.ai_coach_usage
  FOR ALL USING (auth.uid() = user_id);

-- Atomic increment function (returns new count)
CREATE OR REPLACE FUNCTION public.increment_ai_usage(p_user_id uuid)
RETURNS integer
LANGUAGE sql
AS $$
  INSERT INTO public.ai_coach_usage (user_id, date, count)
  VALUES (p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET count = ai_coach_usage.count + 1
  RETURNING count;
$$;
