-- Seed puzzles for all 13 tactic themes
-- Format: moves = "trigger solution [continuation...]"
-- moves[0] = opponent's trigger move (auto-played), moves[1] = player's correct move

INSERT INTO public.puzzles (id, fen, moves, rating, themes, game_url) VALUES

-- FORK (Furculița) — knight forks
('seed_fork_1', '4k3/1q4p1/8/8/4N3/8/8/4K3 b - - 0 1',
 'g7g5 e4d6 e8f8 d6b7', 800, ARRAY['fork'], null),

('seed_fork_2', '4k3/8/8/8/8/2n5/8/R3K3 w Q - 0 1',
 'a1a8 c3e2 e1d2 e2g1', 750, ARRAY['fork'], null),

('seed_fork_3', '5k2/8/8/3p4/8/5N2/8/5K2 b - - 0 1',
 'd5d4 f3e5 f8e7 e5c6', 820, ARRAY['fork'], null),

-- PIN (Andocare) — piece pinned against king/queen
('seed_pin_1', '4k3/4r3/8/8/4B3/8/8/4K3 b - - 0 1',
 'e7e6 e4b7 e8d8 b7a6', 900, ARRAY['pin'], null),

('seed_pin_2', 'r3k3/8/8/8/8/8/8/4KB1R w K - 0 1',
 'a8a1 f1b5 e8d8 b5d7', 950, ARRAY['pin'], null),

('seed_pin_3', '4k3/3r4/8/8/8/3B4/8/4K3 b - - 0 1',
 'd7d6 d3b5 e8f8 b5d7', 870, ARRAY['pin'], null),

-- SKEWER (Frigare) — attack piece hiding behind more valuable piece
('seed_skewer_1', '4k3/8/8/8/8/8/8/R3K3 b - - 0 1',
 'e8d8 a1a8 d8c7 a8d8', 800, ARRAY['skewer'], null),

('seed_skewer_2', '4k3/8/8/8/8/8/8/4K2B w - - 0 1',
 'e8f8 h1b7 f8g8 b7a8', 850, ARRAY['skewer'], null),

('seed_skewer_3', '2k5/8/8/8/8/8/8/R3K3 b - - 0 1',
 'c8b8 a1a8 b8c7 a8c8', 780, ARRAY['skewer'], null),

-- DISCOVERED ATTACK (Atac descoperit)
('seed_discovered_1', '4k3/8/8/3b4/8/8/3P4/4K2R b - - 0 1',
 'd5f3 h1h8 e8d7 h8d8', 1000, ARRAY['discoveredAttack'], null),

('seed_discovered_2', '4k3/4p3/8/8/8/8/4P3/R3K3 b - - 0 1',
 'e7e6 a1a8 e8d7 a8e8', 980, ARRAY['discoveredAttack'], null),

('seed_discovered_3', '4k3/8/4p3/8/3B4/8/8/4K3 b - - 0 1',
 'e6e5 d4b6 e8f8 b6d8', 1050, ARRAY['discoveredAttack'], null),

-- DOUBLE CHECK
('seed_doublecheck_1', '4k3/8/8/8/4R3/3B4/8/4K3 b - - 0 1',
 'e8d8 d3b5 d8c8 b5d7', 1100, ARRAY['doubleCheck'], null),

('seed_doublecheck_2', '3k4/8/8/8/8/2B5/8/R3K3 b - - 0 1',
 'd8c8 a1a8 c8b7 a8b8', 1150, ARRAY['doubleCheck'], null),

('seed_doublecheck_3', '4k3/8/8/8/2R5/5B2/8/4K3 b - - 0 1',
 'e8f8 f3d5 f8g8 d5e6', 1080, ARRAY['doubleCheck'], null),

-- SACRIFICE (Sacrificiu)
('seed_sacrifice_1', '4k3/4p3/4P3/8/8/8/8/R3K3 b - - 0 1',
 'e7e5 a1a8 e8d7 a8e8', 1200, ARRAY['sacrifice'], null),

('seed_sacrifice_2', 'r3k3/8/8/8/8/8/8/4KR2 b q - 0 1',
 'a8a1 f1f8 e8d7 f8a8', 1150, ARRAY['sacrifice'], null),

('seed_sacrifice_3', '4k3/4r3/8/8/4B3/8/4P3/4K3 b - - 0 1',
 'e7e6 e4d5 e6d6 d5f7', 1180, ARRAY['sacrifice'], null),

-- ZUGZWANG
('seed_zugzwang_1', '8/8/8/8/8/1k6/8/1K6 b - - 0 1',
 'b3b2 b1b2 b2b3 b2b1', 1300, ARRAY['zugzwang'], null),

('seed_zugzwang_2', '8/8/8/8/8/pk6/8/1K6 b - - 0 1',
 'a3a2 b1a2 b3b2 a2a3', 1250, ARRAY['zugzwang'], null),

('seed_zugzwang_3', '8/8/8/8/8/2k5/8/2K5 b - - 0 1',
 'c3c2 c1c2 c2c3 c2c1', 1280, ARRAY['zugzwang'], null),

-- PROMOTION (Transformare)
('seed_promotion_1', '4k3/4P3/8/8/8/8/8/4K3 b - - 0 1',
 'e8d8 e7e8q d8c7 e8e7', 700, ARRAY['promotion'], null),

('seed_promotion_2', '5k2/4P3/8/8/8/8/8/5K2 b - - 0 1',
 'f8e8 e7e8q e8d7 e8d8', 720, ARRAY['promotion'], null),

('seed_promotion_3', '3k4/2P5/8/8/8/8/8/3K4 b - - 0 1',
 'd8e8 c7c8q e8f7 c8d8', 680, ARRAY['promotion'], null),

-- PERPETUAL CHECK (Șah perpetuu)
('seed_perpetual_1', '6k1/6pp/8/8/8/8/8/4Q1K1 b - - 0 1',
 'g8h8 e1e8 h8g7 e8e7', 1100, ARRAY['perpetualCheck'], null),

('seed_perpetual_2', '7k/5Qpp/8/8/8/8/8/6K1 b - - 0 1',
 'h8g8 f7g7 g8f8 g7f7', 1050, ARRAY['perpetualCheck'], null),

('seed_perpetual_3', '6k1/5ppp/8/8/8/8/8/5QK1 b - - 0 1',
 'g8h8 f1f8 h8g7 f8g7', 1080, ARRAY['perpetualCheck'], null),

-- TRAPPED PIECE (Piesă capturată)
('seed_trapped_1', '4k3/8/8/6b1/8/5P1P/8/4K3 b - - 0 1',
 'g5h4 h3g4 h4g5 f3f4', 900, ARRAY['trappedPiece'], null),

('seed_trapped_2', '4k3/8/8/8/6b1/5P1P/8/4K3 b - - 0 1',
 'g4h5 h3g4 h5g6 f3f4', 880, ARRAY['trappedPiece'], null),

('seed_trapped_3', '4k3/8/1b6/2P5/3P4/8/8/4K3 b - - 0 1',
 'b6a7 c5c6 a7b8 d4d5', 920, ARRAY['trappedPiece'], null),

-- MATE IN 1
('seed_mateIn1_1', '7k/5ppp/8/8/8/8/8/6RK b - - 0 1',
 'f7f5 g1g8', 600, ARRAY['mateIn1'], null),

('seed_mateIn1_2', 'kn6/ppP5/8/8/8/8/8/1R5K b - - 0 1',
 'b8d7 b1b8', 650, ARRAY['mateIn1'], null),

('seed_mateIn1_3', '5rk1/5ppp/8/8/8/8/8/5R1K b - - 0 1',
 'f8f6 f1f8', 620, ARRAY['mateIn1'], null),

-- MATE IN 2
('seed_mateIn2_1', '7k/5ppp/8/6Q1/8/8/8/7K b - - 0 1',
 'h8g8 g5g7 g8h8 g7h7', 1000, ARRAY['mateIn2'], null),

('seed_mateIn2_2', '6k1/5ppp/8/8/8/8/8/5QRK b - - 0 1',
 'g8h8 g1g7 h8h8 f1h1', 1050, ARRAY['mateIn2'], null),

('seed_mateIn2_3', '7k/6pp/5p2/8/8/8/8/R5QK b - - 0 1',
 'h8g8 g1g6 g8h8 g6g7', 1020, ARRAY['mateIn2'], null),

-- MATE IN 3
('seed_mateIn3_1', '7k/6pp/8/8/8/8/8/R4Q1K b - - 0 1',
 'h8g8 f1f7 g8h8 f7h7 h8g8 a1g1', 1300, ARRAY['mateIn3'], null),

('seed_mateIn3_2', '5r1k/5ppp/8/8/8/8/8/4RQ1K b - - 0 1',
 'f8f6 f1f6 h8g8 f6g6 g8h8 e1e8', 1350, ARRAY['mateIn3'], null),

('seed_mateIn3_3', '6k1/5ppp/8/8/4R3/8/8/5QK1 b - - 0 1',
 'g8h8 f1f7 h8g8 e4e8 g8h7 e8h8', 1320, ARRAY['mateIn3'], null)

ON CONFLICT (id) DO NOTHING;
