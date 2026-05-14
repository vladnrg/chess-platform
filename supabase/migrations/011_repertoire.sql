-- Lichess username on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS lichess_username text;

-- Opening performance stats per user
CREATE TABLE public.user_opening_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles ON DELETE CASCADE,
  eco text NOT NULL,
  opening_name text NOT NULL,
  color text NOT NULL CHECK (color IN ('white', 'black')),
  wins integer NOT NULL DEFAULT 0,
  draws integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  last_imported_at timestamptz DEFAULT now(),
  UNIQUE (user_id, eco, color)
);

CREATE INDEX idx_opening_stats_user ON public.user_opening_stats(user_id);

ALTER TABLE public.user_opening_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own opening stats" ON public.user_opening_stats
  FOR ALL USING (auth.uid() = user_id);
