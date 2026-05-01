-- Add location to profiles (for community page)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS county text;

-- Allow authenticated users to read all profiles (community leaderboard)
CREATE POLICY "profiles_authenticated_read" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Tournaments table (calendar)
CREATE TABLE IF NOT EXISTS public.tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'platform' CHECK (type IN ('platform', 'external')),
  category text CHECK (category IN ('online', 'over_the_board', 'workshop')),
  city text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  max_participants integer,
  min_league text CHECK (min_league IN ('cherestea','tinichea','bronz','argint','aur','smarald','diamant')),
  is_open_to_minors boolean DEFAULT true,
  registration_url text,
  organizer text,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tournaments_public_read" ON public.tournaments
  FOR SELECT USING (is_published = true);

-- Tournament participants
CREATE TABLE IF NOT EXISTS public.tournament_participants (
  tournament_id uuid REFERENCES public.tournaments ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles ON DELETE CASCADE,
  registered_at timestamptz DEFAULT now(),
  PRIMARY KEY (tournament_id, user_id)
);

ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "participants_read_own" ON public.tournament_participants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "participants_insert_own" ON public.tournament_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "participants_delete_own" ON public.tournament_participants
  FOR DELETE USING (auth.uid() = user_id);

-- Count participants per tournament (safe read for everyone)
CREATE POLICY "participants_count_read" ON public.tournament_participants
  FOR SELECT USING (true);

-- Seed: sample tournaments
INSERT INTO public.tournaments (title, description, type, category, city, starts_at, ends_at, max_participants, organizer, is_published) VALUES
  (
    'Turneu Online de Duminică',
    'Turneul săptămânal al platformei. Format: Swiss, 5 runde. Deschis tuturor nivelurilor.',
    'platform', 'online', NULL,
    '2026-05-05 15:00:00+00', '2026-05-05 18:00:00+00',
    32, 'ChessUp Platform', true
  ),
  (
    'Campionatul Județean de Șah Cluj 2026',
    'Competiția anuală pentru tineret, organizată de Clubul Sportiv de Șah Cluj. Sistem elvețian, 7 runde.',
    'external', 'over_the_board', 'Cluj-Napoca',
    '2026-05-15 10:00:00+00', '2026-05-17 18:00:00+00',
    64, 'CS Șah Cluj', true
  ),
  (
    'Blitz Fest — Rapid & Blitz',
    'Turneu de blitz pentru toți membrii platformei. Control de timp: 3 minute + 2 secunde increment.',
    'platform', 'online', NULL,
    '2026-05-12 18:00:00+00', '2026-05-12 21:00:00+00',
    16, 'ChessUp Platform', true
  ),
  (
    'Cupa Primăverii — Timișoara',
    'Competiție deschisă tuturor categoriilor de vârstă. Organizată de FRȘ filiala Timiș.',
    'external', 'over_the_board', 'Timișoara',
    '2026-06-01 09:00:00+00', '2026-06-02 17:00:00+00',
    80, 'FRȘ Timiș', true
  ),
  (
    'Workshop: Deschideri pentru Începători',
    'Sesiune educativă live cu un instructor certificat FIDE. Maxim 20 participanți.',
    'platform', 'workshop', NULL,
    '2026-05-20 17:00:00+00', '2026-05-20 19:00:00+00',
    20, 'ChessUp Platform', true
  );
