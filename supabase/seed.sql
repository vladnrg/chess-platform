-- Seed cursuri de opening (20 cursuri reprezentative)
-- PGN-urile conțin teoria principală din domeniu public (ECO standard)

INSERT INTO public.courses (title, slug, description, level, opening_family, eco_code, playing_styles, is_premium, lesson_count, order_index) VALUES

-- ============= WHITE OPENINGS =============
(
  'Sistemul London',
  'london-system',
  'Una dintre cele mai solide și practice deschideri pentru alb. Ideală pentru jucătorii pragmatici care vor o structură clară fără a memora multe linii.',
  'beginner', 'London System', 'D02', ARRAY['pragmatic','defensive'], false, 5, 1
),
(
  'Partida Italiană',
  'italian-game',
  'Clasica 1.e4 e5 2.Cf3 Cc6 3.Bc4 — controlul centrului și presiunea pe f7. Perfectă pentru a învăța principiile deschiderii.',
  'beginner', 'Italian Game', 'C50', ARRAY['balanced','offensive'], false, 5, 2
),
(
  'Gambitul Regelui',
  'kings-gambit',
  'Cea mai agresivă deschidere clasică. 1.e4 e5 2.f4 — alb sacrifică un pion pentru joc rapid și atac pe centru.',
  'beginner', 'King''s Gambit', 'C30', ARRAY['offensive'], true, 5, 3
),
(
  'Gambitul Damei',
  'queens-gambit',
  '1.d4 d5 2.c4 — presiune pe centru și joc pozițional. Favorita campionilor mondiali.',
  'intermediate', 'Queen''s Gambit', 'D06', ARRAY['balanced','pragmatic'], true, 6, 4
),
(
  'Deschiderea Catalană',
  'catalan-opening',
  '1.d4 Cf6 2.c4 e6 3.g3 — combinație de Opening Englez și Gambit al Damei cu fianchetarea nebunului.',
  'intermediate', 'Catalan Opening', 'E00', ARRAY['pragmatic','balanced'], true, 5, 5
),
(
  'Ruy Lopez (Spaniola)',
  'ruy-lopez',
  '1.e4 e5 2.Cf3 Cc6 3.Bb5 — cea mai studiată deschidere din istorie. Presiune pe calul c6.',
  'intermediate', 'Ruy Lopez', 'C60', ARRAY['balanced','offensive'], true, 7, 6
),
(
  'Deschiderea Engleză',
  'english-opening',
  '1.c4 — control flexibil al centrului. Permite transpuneri în multiple structuri.',
  'intermediate', 'English Opening', 'A10', ARRAY['pragmatic','balanced'], true, 5, 7
),
(
  'Atacul Regelui Indian (KIA)',
  'kings-indian-attack',
  'Setup cu g3, Bg2, d3, Nf3, Nc3 — sistem flexibil pentru alb, potrivit împotriva oricărei deschideri negre.',
  'intermediate', 'King''s Indian Attack', 'A07', ARRAY['offensive','balanced'], true, 5, 8
),
(
  'Sistemul Colle',
  'colle-system',
  'Setup solid cu d4, Nf3, e3, Bd3 — pregătire pentru atacul e4 în centru. Ușor de învățat.',
  'beginner', 'Colle System', 'D05', ARRAY['defensive','pragmatic'], false, 4, 9
),
(
  'Jocul Vienez',
  'vienna-game',
  '1.e4 e5 2.Cc3 — alternativă la Partida Spaniolă cu intenții agresive (Gambitul Vienez: 3.f4).',
  'beginner', 'Vienna Game', 'C25', ARRAY['offensive'], true, 4, 10
),

-- ============= BLACK OPENINGS =============
(
  'Apărarea Siciliană',
  'sicilian-defense',
  '1.e4 c5 — cea mai populară apărare împotriva 1.e4. Dezechilibru și contra-joc asimetric.',
  'intermediate', 'Sicilian Defense', 'B20', ARRAY['offensive','balanced'], true, 7, 11
),
(
  'Apărarea Franceză',
  'french-defense',
  '1.e4 e6 — structură solidă cu contra-joc pe flancul damei. Ideal pentru jucătorii defensivi.',
  'intermediate', 'French Defense', 'C00', ARRAY['defensive','balanced'], true, 6, 12
),
(
  'Apărarea Caro-Kann',
  'caro-kann-defense',
  '1.e4 c6 — cea mai solidă apărare împotriva 1.e4. Structură de pioni sănătoasă.',
  'intermediate', 'Caro-Kann Defense', 'B10', ARRAY['defensive','pragmatic'], true, 5, 13
),
(
  'Apărarea Regelui Indian',
  'kings-indian-defense',
  '1.d4 Cf6 2.c4 g6 — contra-atac pe flancul regelui. Partide complicate și dinamice.',
  'intermediate', 'King''s Indian Defense', 'E60', ARRAY['offensive'], true, 6, 14
),
(
  'Apărarea Nimzo-Indian',
  'nimzo-indian-defense',
  '1.d4 Cf6 2.c4 e6 3.Cc3 Bb4 — pin pe calul c3, structuri complexe. Favorita marilor maeștri.',
  'advanced', 'Nimzo-Indian Defense', 'E20', ARRAY['balanced','offensive'], true, 6, 15
),
(
  'Apărarea Olandeză',
  'dutch-defense',
  '1.d4 f5 — atac agresiv pe flancul regelui chiar din primele mutări. Dezechilibru maxim.',
  'intermediate', 'Dutch Defense', 'A80', ARRAY['offensive'], true, 5, 16
),
(
  'Apărarea Slav',
  'slav-defense',
  '1.d4 d5 2.c4 c6 — solidă și practică. Menține structura de pioni cu c6 înainte de e6.',
  'intermediate', 'Slav Defense', 'D10', ARRAY['pragmatic','defensive'], true, 5, 17
),
(
  'Apărarea Pirc',
  'pirc-defense',
  '1.e4 d6 — hipermodernă. Negrul lasă albul să ocupe centrul și îl atacă ulterior.',
  'intermediate', 'Pirc Defense', 'B07', ARRAY['defensive','balanced'], true, 5, 18
),
(
  'Apărarea Scandinavă',
  'scandinavian-defense',
  '1.e4 d5 — contra-atac imediat în centru. Simplă și directă, bună pentru începători.',
  'beginner', 'Scandinavian Defense', 'B01', ARRAY['pragmatic'], false, 4, 19
),
(
  'Apărarea Alekhine',
  'alekhine-defense',
  '1.e4 Cf6 — hipermodernă provocatoare. Negrul invită albul să avanseze pionii centrali.',
  'intermediate', 'Alekhine''s Defense', 'B02', ARRAY['offensive','balanced'], true, 5, 20
);

-- Actualizare lesson_count (cursuri fără lecții reale — seed de bază)
-- Lecțiile vor fi adăugate separat pentru fiecare curs

-- Seed puzzle-uri de test (din Lichess format)
INSERT INTO public.puzzles (id, fen, moves, rating, themes, game_url) VALUES
(
  'lch001',
  'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
  'f3e5 d8g5 e5f3 g5g2 h1g1 g2h3',
  1200,
  ARRAY['fork','middlegame'],
  'https://lichess.org/training/lch001'
),
(
  'lch002',
  '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
  'e1e8',
  800,
  ARRAY['mateIn1','endgame'],
  'https://lichess.org/training/lch002'
),
(
  'lch003',
  'r2qkb1r/ppp2ppp/2np1n2/4p1B1/2B1P3/3P1N2/PPP2PPP/RN1QK2R b KQkq - 1 6',
  'f6e4 d1d8 e8d8 g5e7 d8e7',
  1400,
  ARRAY['pin','fork'],
  'https://lichess.org/training/lch003'
);
