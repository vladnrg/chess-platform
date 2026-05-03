-- Migration 007: Schema extensions + fundamental course seeds
-- Adds lesson_type/exercises to lessons, is_foundational to courses,
-- fixes level CHECK constraint to include 'fundamental',
-- and seeds 2 fundamental courses + 16 lessons (Piese în Mișcare + Codul Șahului).

-- ============================================================
-- 1. SCHEMA CHANGES
-- ============================================================

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS lesson_type text NOT NULL DEFAULT 'pgn'
    CHECK (lesson_type IN ('pgn', 'rules', 'notation'));

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS exercises jsonb;

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS is_foundational boolean NOT NULL DEFAULT false;

-- Fix level constraint: drop old (beginner/intermediate/advanced only), add new with 'fundamental'
DO $do$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema    = 'public'
      AND table_name      = 'courses'
      AND constraint_name = 'courses_level_check'
  ) THEN
    ALTER TABLE public.courses DROP CONSTRAINT courses_level_check;
  END IF;
END
$do$;

ALTER TABLE public.courses
  ADD CONSTRAINT courses_level_check
    CHECK (level IN ('fundamental', 'beginner', 'intermediate', 'advanced'));

-- ============================================================
-- 2. FUNDAMENTAL COURSES
-- ============================================================

INSERT INTO public.courses
  (title, slug, description, level, opening_family, eco_code, playing_styles,
   is_premium, is_foundational, lesson_count, order_index)
VALUES
(
  'Piese în Mișcare', 'piese-in-miscare',
  'Regulile de bază ale șahului: cum se mișcă fiecare piesă, rocada, en passant și transformarea pionului. Punct de start obligatoriu.',
  'fundamental', NULL, NULL, '{}', false, true, 10, 0
),
(
  'Codul Șahului', 'codul-sahului',
  'Notația algebrică: cum citești și scrii mutările, denumirile pieselor în română și simbolurile speciale.',
  'fundamental', NULL, NULL, '{}', false, true, 6, 0
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 3. LESSONS: Piese în Mișcare (10 lecții, lesson_type = 'rules')
-- ============================================================

INSERT INTO public.lessons
  (course_id, title, order_index, lesson_type, theory_html, exercises, is_premium, duration_minutes)
SELECT c.id, v.title, v.ord, 'rules', v.theory, v.exs::jsonb, false, 5
FROM   public.courses c
CROSS JOIN (VALUES

  (1, 'Tabla și setup-ul',
   '<p>Tabla de șah are 64 de pătrate (8×8). Coloanele sunt notate <strong>a–h</strong> (stânga→dreapta) și rândurile <strong>1–8</strong> (jos→sus). Fiecare pătrat are un nume unic, de exemplu <strong>e4</strong>.</p>',
   '[{"type":"click_square","target":"e4","fen":"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1","instruction":"Click pe pătratul e4 — centrul tablei"},{"type":"click_square","target":"d5","fen":"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1","instruction":"Acum click pe d5"},{"type":"identify_square","square":"h1","options":["g1","h1","h2","g2"],"instruction":"Ce pătrat se află în colțul din dreapta-jos?","fen":"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"}]'
  ),

  (2, 'Pionul',
   '<p>Pionul se mișcă <strong>înainte</strong> cu un pătrat (sau două din poziția de start). Capturează <strong>diagonal</strong>. Este cea mai mică piesă, dar poate deveni Damă la capătul tablei!</p>',
   '[{"type":"move_piece","fen":"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1","correct_move":"e2e4","instruction":"Mută pionul pe e4 — două pătrate din poziția de start"},{"type":"move_piece","fen":"rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2","correct_move":"d2d4","instruction":"Atacă centrul cu d4"},{"type":"move_piece","fen":"rnbqkbnr/ppp2ppp/8/3pp3/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3","correct_move":"e4d5","instruction":"Capturează pionul advers de pe d5 cu pionul de pe e4"}]'
  ),

  (3, 'Turnul',
   '<p>Turnul se mișcă oricâte pătrate pe <strong>orizontală sau verticală</strong>. Nu poate sări peste alte piese. Este o piesă majoră, valorând aproximativ 5 pioni.</p>',
   '[{"type":"move_piece","fen":"8/8/8/8/8/8/8/R7 w - - 0 1","correct_move":"a1h1","instruction":"Mută turnul de la a1 la h1 — traversează orizontal"},{"type":"move_piece","fen":"8/8/8/8/8/8/8/7R w - - 0 1","correct_move":"h1h8","instruction":"Mută turnul pe h8 — traversează vertical"},{"type":"move_piece","fen":"3p4/8/8/8/8/8/8/3R4 w - - 0 1","correct_move":"d1d8","instruction":"Atacă pionul adversarului de pe d8 cu turnul"}]'
  ),

  (4, 'Nebunul',
   '<p>Nebunul se mișcă pe <strong>diagonală</strong> oricâte pătrate. Rămâne mereu pe aceeași culoare pe care a pornit. Fiecare jucător are un nebun pe pătrate deschise și unul pe pătrate închise.</p>',
   '[{"type":"move_piece","fen":"8/8/8/8/8/8/8/2B5 w - - 0 1","correct_move":"c1g5","instruction":"Mută nebunul de pe c1 pe g5 — diagonal"},{"type":"move_piece","fen":"8/8/8/8/8/8/8/5B2 w - - 0 1","correct_move":"f1b5","instruction":"Mută nebunul de pe f1 pe b5"},{"type":"click_square","target":"f4","fen":"8/8/8/8/8/8/8/2B5 w - - 0 1","instruction":"Nebunul de pe c1 se mișcă pe diagonale — click pe f4"}]'
  ),

  (5, 'Calul',
   '<p>Calul se mișcă în formă de <strong>L</strong>: 2 pătrate într-o direcție, apoi 1 pătrat perpendicular. Este singura piesă ce poate <strong>sări</strong> peste altele!</p>',
   '[{"type":"move_piece","fen":"8/8/8/8/8/8/8/1N6 w - - 0 1","correct_move":"b1c3","instruction":"Mută calul de pe b1 pe c3 — salt în formă de L"},{"type":"move_piece","fen":"8/8/8/8/3N4/8/8/8 w - - 0 1","correct_move":"d4f5","instruction":"Mută calul de pe d4 pe f5"},{"type":"move_piece","fen":"7N/8/8/8/8/8/8/8 w - - 0 1","correct_move":"h8f7","instruction":"Mută calul de pe h8 pe f7 — salt valid în L"}]'
  ),

  (6, 'Dama',
   '<p>Dama este cea mai puternică piesă — se mișcă oricâte pătrate pe <strong>orizontală, verticală sau diagonală</strong>. Combină puterea turnului cu cea a nebunului.</p>',
   '[{"type":"move_piece","fen":"8/8/8/8/8/8/8/3Q4 w - - 0 1","correct_move":"d1d8","instruction":"Mută dama de la d1 la d8 — vertical"},{"type":"move_piece","fen":"8/8/8/8/8/8/8/3Q4 w - - 0 1","correct_move":"d1a4","instruction":"Mută dama de la d1 la a4 — diagonal"},{"type":"move_piece","fen":"8/8/8/3p4/8/8/8/3Q4 w - - 0 1","correct_move":"d1d5","instruction":"Atacă pionul de pe d5 cu dama"}]'
  ),

  (7, 'Regele',
   '<p>Regele se mișcă câte <strong>un pătrat</strong> în orice direcție. Nu poate merge pe un pătrat atacat de adversar. Scopul jocului: dă șah-mat regelui advers!</p>',
   '[{"type":"move_piece","fen":"8/8/8/8/8/8/8/4K3 w - - 0 1","correct_move":"e1d1","instruction":"Mută regele un pătrat la stânga — pe d1"},{"type":"move_piece","fen":"8/8/8/8/4K3/8/8/8 w - - 0 1","correct_move":"e4e5","instruction":"Mută regele un pătrat înainte — pe e5"},{"type":"click_square","target":"f5","fen":"8/8/8/8/4K3/8/8/8 w - - 0 1","instruction":"Regele de pe e4 poate merge pe f5 — click pe f5"}]'
  ),

  (8, 'Rocada',
   '<p>Rocada permite regelui să se pună în siguranță: regele se mișcă 2 pătrate spre turn, iar turnul sare de cealaltă parte. Condiție: niciuna din piese nu a fost mutată anterior și calea dintre ele este liberă.</p>',
   '[{"type":"move_piece","fen":"r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1","correct_move":"e1g1","instruction":"Efectuează rocada mică (O-O) — mută regele pe g1"},{"type":"move_piece","fen":"r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R b KQkq - 0 1","correct_move":"e8c8","instruction":"Efectuează rocada mare (O-O-O) cu negrul — mută regele pe c8"},{"type":"identify_square","square":"g1","options":["f1","g1","h1","c1"],"instruction":"După rocada mică, regele alb se mută pe:","fen":"8/8/8/8/8/8/8/R3K2R w KQ - 0 1"}]'
  ),

  (9, 'En passant și transformarea pionului',
   '<p><strong>En passant</strong>: un pion avansat 2 pătrate poate fi capturat ca și cum ar fi avansat doar 1. <strong>Transformare</strong>: un pion ajuns la ultimul rând devine orice piesă (de obicei Damă).</p>',
   '[{"type":"move_piece","fen":"rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3","correct_move":"e5d6","instruction":"En passant! Capturează pionul negru de pe d5 — mută pe d6"},{"type":"move_piece","fen":"8/4P3/8/8/8/8/8/8 w - - 0 1","correct_move":"e7e8q","instruction":"Transformă pionul în damă — mută-l pe e8"},{"type":"identify_square","square":"d6","options":["d5","d6","e5","e6"],"instruction":"La en passant, pionul capturator aterizează pe:","fen":"rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3"}]'
  ),

  (10, 'Șah, șah-mat și remiză',
   '<p><strong>Șah</strong>: regele este atacat. <strong>Șah-mat</strong>: regele atacat nu poate scăpa — jocul se termină. <strong>Remiză</strong>: egalitate (pat, repetare poziție, 50 mutări fără progres).</p>',
   '[{"type":"identify_square","square":"e1","options":["d1","e1","f1","e2"],"instruction":"Regele alb este în șah! Pe ce pătrat se află?","fen":"4k3/8/8/8/8/8/4r3/4K3 w - - 0 1"},{"type":"move_piece","fen":"6k1/6Q1/8/8/8/8/8/6K1 w - - 0 1","correct_move":"g7g8","instruction":"Dă șah-mat! Mută dama pe g8"},{"type":"identify_square","square":"pat","options":["șah","șah-mat","pat","remiză prin repetare"],"instruction":"Regele nu poate muta, dar nu este în șah. Cum se numește aceasta?"}]'
  )

) AS v(ord, title, theory, exs)
WHERE c.slug = 'piese-in-miscare';

-- ============================================================
-- 4. LESSONS: Codul Șahului (6 lecții, lesson_type = 'notation')
-- ============================================================

INSERT INTO public.lessons
  (course_id, title, order_index, lesson_type, theory_html, exercises, is_premium, duration_minutes)
SELECT c.id, v.title, v.ord, 'notation', v.theory, v.exs::jsonb, false, 5
FROM   public.courses c
CROSS JOIN (VALUES

  (1, 'Coordonatele tablei',
   '<p>Fiecare pătrat are un nume unic: <strong>coloana</strong> (literă a–h) + <strong>rândul</strong> (cifră 1–8). Coloanele a–h sunt de la stânga la dreapta; rândurile 1–8 de jos în sus (din perspectiva albului).</p>',
   '[{"type":"click_square","target":"a1","fen":"8/8/8/8/8/8/8/8 w - - 0 1","instruction":"Click pe a1 — colțul din stânga-jos al tablei"},{"type":"click_square","target":"h8","fen":"8/8/8/8/8/8/8/8 w - - 0 1","instruction":"Click pe h8 — colțul din dreapta-sus"},{"type":"click_square","target":"d4","fen":"8/8/8/8/8/8/8/8 w - - 0 1","instruction":"Click pe d4 — aproape de centrul tablei"}]'
  ),

  (2, 'Drill de coordonate',
   '<p>Antrenament rapid: identifică 3 pătrate consecutive. Caută mai întâi coloana (litera), apoi rândul (cifra). Antrenează-ți ochiul până devine reflex!</p>',
   '[{"type":"click_square","target":"c6","fen":"8/8/8/8/8/8/8/8 w - - 0 1","instruction":"Găsește rapid: c6"},{"type":"click_square","target":"f3","fen":"8/8/8/8/8/8/8/8 w - - 0 1","instruction":"Acum: f3"},{"type":"click_square","target":"b7","fen":"8/8/8/8/8/8/8/8 w - - 0 1","instruction":"Și: b7"}]'
  ),

  (3, 'Abrevierile pieselor',
   '<p>Notația română folosește: <strong>R</strong>=Rege, <strong>D</strong>=Damă, <strong>T</strong>=Turn, <strong>C</strong>=Cal, <strong>F</strong>=Nebun (Fil). Pionii nu au abreviere — mutarea lor se notează doar cu pătratul destinație.</p>',
   '[{"type":"identify_square","square":"C","options":["R","D","T","C"],"instruction":"Cum se notează Calul în notația română?"},{"type":"identify_square","square":"F","options":["F","B","N","C"],"instruction":"Cum se notează Nebunul (Fil) în notația română?"},{"type":"identify_square","square":"D","options":["R","D","T","C"],"instruction":"Cum se notează Dama în notația română?"}]'
  ),

  (4, 'Notarea mutărilor simple',
   '<p>O mutare se notează cu <strong>inițiala piesei + pătratul destinație</strong>. Exemplu: <em>Cf3</em> = Calul pe f3. Mutările de pion: doar pătratul (ex: <em>e4</em>).</p>',
   '[{"type":"identify_square","square":"Cf3","options":["Cf3","f3","Nf3","Caf3"],"instruction":"Calul se mută pe f3. Cum se notează această mutare?"},{"type":"identify_square","square":"e4","options":["Pe4","e4","E4","1.e4"],"instruction":"Pionul se mută pe e4. Cum se notează?"},{"type":"identify_square","square":"Dd5","options":["Qd5","Dd5","Dd4","d5"],"instruction":"Dama se mută pe d5. Cum se notează?"}]'
  ),

  (5, 'Capturi, șah și mat',
   '<p>Simboluri speciale: <strong>x</strong> = captură (ex: Cxe4), <strong>+</strong> = șah, <strong>#</strong> = șah-mat. Exemplu complet: <em>Dxf7#</em> = Dama capturează pe f7, șah-mat!</p>',
   '[{"type":"identify_square","square":"Cxe4","options":["Ce4","Cxe4","Cfe4","Cxe4+"],"instruction":"Calul capturează pe e4. Cum se notează?"},{"type":"identify_square","square":"Dc7+","options":["Dc7","Dc7+","Dc7#","c7+"],"instruction":"Dama se mută pe c7 și dă șah. Cum se notează?"},{"type":"identify_square","square":"Dxh7#","options":["Dh7+","Dxh7+","Dxh7#","Dh7#"],"instruction":"Dama capturează pe h7 și dă mat. Cum se notează?"}]'
  ),

  (6, 'Rocada și en passant în notație',
   '<p>Rocada scurtă (spre turnul rege) = <strong>O-O</strong>. Rocada lungă (spre turnul damă) = <strong>O-O-O</strong>. En passant se notează ca o captură de pion, cu sufixul opțional <em>e.p.</em></p>',
   '[{"type":"identify_square","square":"O-O","options":["0-0","O-O","Rg1","O-O-O"],"instruction":"Cum se notează rocada mică?"},{"type":"identify_square","square":"O-O-O","options":["0-0-0","O-O","O-O-O","Rc1"],"instruction":"Cum se notează rocada mare?"},{"type":"identify_square","square":"e.p.","options":["en passant","e.p.","ep","e/p"],"instruction":"Sufixul opțional pentru en passant în notație este:"}]'
  )

) AS v(ord, title, theory, exs)
WHERE c.slug = 'codul-sahului';
