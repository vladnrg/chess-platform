-- 023_famous_tactic_positions.sql
-- Poziții tactice din partide istorice, adăugate ca exerciții în Cufărul cu tactici.
-- Fiecare a fost verificat programatic (chess.js) că e MAT FORȚAT — soluția e garantată.
-- Se încadrează automat pe categorii (prin teme) și pe intervale de ELO (prin rating).

ALTER TABLE public.puzzles ADD COLUMN IF NOT EXISTS title text;

INSERT INTO public.puzzles (id, fen, moves, rating, themes, game_url, title) VALUES
  ('hist_opera',
   '4kb1r/p2B1ppp/4qn2/4p1B1/4P3/1Q6/PPP2PPP/2KR4 b k - 0 15',
   'f6d7 b3b8 d7b8 d1d8', 1300,
   ARRAY['mateIn2','backRankMate','sacrifice'],
   'https://www.chessgames.com/perl/chessgame?gid=1233404',
   'Poziție din partida istorică „Partida de la Operă" (Morphy, 1858)'),
  ('hist_immortal',
   'r1b1k1nr/p2p1pNp/n2B4/1p1NP2P/6P1/3P1Q2/P1P1K3/q5b1 b kq - 0 21',
   'e8d8 f3f6 g8f6 d6e7', 1700,
   ARRAY['mateIn2','sacrifice'],
   'https://www.chessgames.com/perl/chessgame?gid=1018910',
   'Poziție din partida istorică „Partida Nemuritoare" (Anderssen, 1851)'),
  ('hist_reti_tartakower',
   'rnb1kb1r/pp3ppp/2p2n2/4q3/4N3/3Q4/PPPB1PPP/2KR1BNR b kq - 1 8',
   'f6e4 d3d8 e8d8 d2g5 d8e8 d1d8', 1600,
   ARRAY['mateIn3','doubleCheck','discoveredAttack','sacrifice'],
   'https://www.chessgames.com/perl/chessgame?gid=1119679',
   'Poziție din partida istorică Réti–Tartakower (Viena, 1910)')
ON CONFLICT (id) DO UPDATE SET
  fen = EXCLUDED.fen, moves = EXCLUDED.moves, rating = EXCLUDED.rating,
  themes = EXCLUDED.themes, game_url = EXCLUDED.game_url, title = EXCLUDED.title;
