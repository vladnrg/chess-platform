-- Migration 004: Opening lines for guided course system

CREATE TABLE IF NOT EXISTS public.opening_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  variation_name text NOT NULL,
  variation_code text NOT NULL DEFAULT 'A',
  popularity_pct numeric(5,1) NOT NULL DEFAULT 0,
  order_index integer NOT NULL DEFAULT 0,
  user_color text NOT NULL DEFAULT 'white' CHECK (user_color IN ('white', 'black')),
  -- Full interleaved UCI move sequence (both sides), space-separated
  -- e.g. "d2d4 d7d5 g1f3 g8f6 c1f4 e7e6"
  moves_uci text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_opening_lines_course_id ON public.opening_lines(course_id);

ALTER TABLE public.opening_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Opening lines readable by all" ON public.opening_lines FOR SELECT USING (true);

-- Seed: London System (3 variations)
INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Linia Clasică (vs d5, Cf6)', 'A', 40.0, 1, 'white',
  'd2d4 d7d5 g1f3 g8f6 c1f4 e7e6 e2e3 f8e7 h2h3 e8g8 f1d3 b8d7 e1g1 c7c5 c2c3 d8b6 d1e2 c5c4 d3c2'
FROM public.courses WHERE slug = 'london-system';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Varianta Fianchetto (vs g6)', 'B', 8.0, 2, 'white',
  'd2d4 g7g6 g1f3 f8g7 c1f4 d7d6 e2e3 g8f6 h2h3 e8g8 f1d3 b8d7 e1g1 c7c5 c2c3 d8b6 d1e2 c5d4 e3d4'
FROM public.courses WHERE slug = 'london-system';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Anti-Benoni London (vs c5)', 'C', 10.0, 3, 'white',
  'd2d4 c7c5 c2c3 g8f6 g1f3 d7d5 c1f4 e7e6 e2e3 f8d6 f4d6 d8d6 f1d3 b8c6 e1g1 e8g8 b1d2 b7b6 d1e2'
FROM public.courses WHERE slug = 'london-system';

-- Seed: Italian Game (3 variations)
INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Giuoco Piano (vs Fc5)', 'A', 45.0, 1, 'white',
  'e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 c2c3 g8f6 d2d4 e5d4 c3d4 c5b4 b1c3 f6e4 e1g1 b4c3 b2c3 d7d5 e4d5'
FROM public.courses WHERE slug = 'italian-game';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Giuoco Pianissimo (vs Cf6)', 'B', 35.0, 2, 'white',
  'e2e4 e7e5 g1f3 b8c6 f1c4 g8f6 d2d3 f8c5 c2c3 d7d6 b1d2 a7a6 b2b4 c5a7 a2a4 e8g8 e1g1 h7h6 d1e2'
FROM public.courses WHERE slug = 'italian-game';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Apărarea Ungară (vs Fe7)', 'C', 8.0, 3, 'white',
  'e2e4 e7e5 g1f3 b8c6 f1c4 f8e7 d2d3 d7d6 c2c3 g8f6 b1d2 e8g8 e1g1 a7a5 d1e2 b7b5 c4b3 a5a4 b3c2'
FROM public.courses WHERE slug = 'italian-game';

-- Seed: Sicilian Defense (3 variations, user = Black)
INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Najdorf (a6)', 'A', 28.0, 1, 'black',
  'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 a7a6 c1e3 e7e5 d4b3 f8e7 f2f3 e8g8 d1d2 b8c6 e1c1'
FROM public.courses WHERE slug = 'sicilian-defense';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Scheveningen — Atacul Keres (g4)', 'B', 18.0, 2, 'black',
  'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 e7e6 g2g4 h7h6 g4g5 h6g5 h1g1 g5g4 d1g4 e6e5 d4f5'
FROM public.courses WHERE slug = 'sicilian-defense';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Varianta Dragon (g6)', 'C', 12.0, 3, 'black',
  'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 g7g6 c1e3 f8g7 d1d2 e8g8 e1c1 b8c6 f2f3 d6d5 d4c6'
FROM public.courses WHERE slug = 'sicilian-defense';

-- Seed: Caro-Kann Defense (3 variations, user = Black)
INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Varianta Clasică (Ff5)', 'A', 35.0, 1, 'black',
  'e2e4 c7c6 d2d4 d7d5 b1c3 d5e4 c3e4 c8f5 e4g3 f5g6 h2h4 h7h6 g1f3 b8d7 h4h5 g6h7 f1d3 h7d3 d1d3'
FROM public.courses WHERE slug = 'caro-kann-defense';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Varianta Avans', 'B', 30.0, 2, 'black',
  'e2e4 c7c6 d2d4 d7d5 e4e5 c8f5 g1f3 e7e6 f1e2 c6c5 e1g1 b8c6 c2c3 d8b6 b1a3 c5c4 f3e1 f5e4'
FROM public.courses WHERE slug = 'caro-kann-defense';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Varianta Schimb (exd5)', 'C', 20.0, 3, 'black',
  'e2e4 c7c6 d2d4 d7d5 e4d5 c6d5 c2c4 g8f6 b1c3 e7e6 g1f3 f8e7 f1d3 e8g8 e1g1 b8c6 a2a3 c6a5 c4c5'
FROM public.courses WHERE slug = 'caro-kann-defense';

-- Seed: French Defense (3 variations, user = Black)
INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Winawer (Fb4)', 'A', 25.0, 1, 'black',
  'e2e4 e7e6 d2d4 d7d5 b1c3 f8b4 e4e5 c7c5 a2a3 b4c3 b2c3 g8e7 d1g4 d8c7 g4g7 h8g8 g7h7 c5d4 g1e2'
FROM public.courses WHERE slug = 'french-defense';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Tarrasch (Cf6)', 'B', 20.0, 2, 'black',
  'e2e4 e7e6 d2d4 d7d5 b1d2 g8f6 e4e5 f6d7 c2c3 c7c5 f1d3 b8c6 g1e2 c5d4 c3d4 f7f6 e5f6 d7f6 e1g1'
FROM public.courses WHERE slug = 'french-defense';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Varianta Avans — c5 timpuriu', 'C', 20.0, 3, 'black',
  'e2e4 e7e6 d2d4 d7d5 e4e5 c7c5 c2c3 b8c6 g1f3 d8b6 a2a3 c5d4 c3d4 c6a5 b2b4 a5c4 f1c4 b6b4 b1d2'
FROM public.courses WHERE slug = 'french-defense';
