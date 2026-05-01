-- Migration 003: Child accounts with parental supervision

-- Extend profiles with child-account fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birth_year smallint,
  ADD COLUMN IF NOT EXISTS parental_email text,
  ADD COLUMN IF NOT EXISTS parental_consent_token uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS parental_consent_given boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS parental_consent_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS account_frozen boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS account_frozen_reason text; -- 'awaiting_parental_consent' | 'rejected'

-- is_minor is computed in application code from birth_year

-- Child session tracker
CREATE TABLE IF NOT EXISTS public.child_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_number integer NOT NULL DEFAULT 1,
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  ended_at timestamptz,
  break_duration_minutes integer NOT NULL DEFAULT 15,
  break_starts_at timestamptz,
  break_ends_at timestamptz,
  last_seen_at timestamptz DEFAULT now(),
  warning_sent boolean DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_child_sessions_user_id ON public.child_sessions(user_id);

-- Parental magic links
CREATE TABLE IF NOT EXISTS public.parental_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token uuid UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('confirm', 'reject', 'stats', 'payment')),
  expires_at timestamptz NOT NULL,
  used_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_parental_links_token ON public.parental_links(token);

-- RLS for child_sessions
ALTER TABLE public.child_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own child sessions"
  ON public.child_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own child sessions"
  ON public.child_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own child sessions"
  ON public.child_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS for parental_links (public read by token — no auth required for parental pages)
ALTER TABLE public.parental_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parental links readable by anyone with token"
  ON public.parental_links FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage parental links"
  ON public.parental_links FOR ALL
  USING (auth.role() = 'service_role');
