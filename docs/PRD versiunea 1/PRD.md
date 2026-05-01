# Plan: Platformă de Învățare Șah (Chessly-inspired)

## Context

Utilizatorul vrea o aplicație web de tip SaaS pentru învățare șah, inspirată vizual și structural de chessly.com. Platforma include: autentificare, test de evaluare a nivelului, recomandări de cursuri de openings, sistem de ligi (Wooden → Diamond), statistici vizuale, puzzle-uri, tracking pe stil de joc și monetizare prin Stripe.

**Stack decis:** React + Vite + TypeScript + Tailwind + Supabase + Stripe  
**Content șah:** Lichess API (puzzle-uri open-source) + cursuri curate manual (PGN public domain)  
**Design:** Inspirat de chessly.com — dark theme, sidebar navigație, card layout cursuri

---

## ⚠️ Notă importantă despre conținut

Conținutul de pe chessly.com (analize, texte, videoclipuri) este proprietatea lui Levy Rozman și **nu poate fi extras/copiat**. Soluția:
- **Puzzle-uri**: Lichess API (2M+ puzzle-uri open-source, gratuite, cu tematici și rating)
- **Openings — mișcările (PGN)**: teoria șahului este domeniu public. Vom folosi baze PGN publice.
- **Texte de analiză**: scrise original sau generate cu AI (revizuite)
- **Structura și UX**: poate fi replicată complet (nu e protejată prin copyright)

---

## Arhitectură

```
chess-platform/
├── src/
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   ├── chess/        # Chessboard, PGN player, puzzle UI
│   │   │   ├── SquareClickExercise.tsx    # click pătrat corect cu feedback
│   │   │   ├── MovePieceExercise.tsx      # mișcă piesa, validare move
│   │   │   └── IdentifyNotationExercise.tsx # MCQ notație
│   │   ├── dashboard/    # League widget, stats cards, daily puzzle
│   │   ├── courses/      # Course card, lesson viewer, progress bar
│   │   │   └── FundamentalLessonPage.tsx  # layout lecții reguli/notație
│   │   └── layout/       # Sidebar, Navbar, PageWrapper
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Auth/         # Login.tsx, Register.tsx
│   │   ├── Onboarding/   # AssessmentWizard.tsx (multi-step)
│   │   ├── Dashboard.tsx
│   │   ├── Courses/      # CoursesPage.tsx, CourseDetail.tsx, LessonPage.tsx
│   │   ├── Puzzles.tsx
│   │   ├── Stats.tsx
│   │   ├── Profile.tsx
│   │   ├── Pricing.tsx
│   │   ├── CommunityPage.tsx   # /community — Șahiștii din regiune
│   │   ├── CalendarPage.tsx    # /calendar — Calendar competițional
│   │   └── TacticsChestPage.tsx # /tactics — Cufărul cu tactici
│   ├── data/
│   │   ├── tactics.ts          # tactici statice cu FEN + theme + descriere
│   │   └── famousGames.ts      # jocuri celebre cu metadata
│   ├── hooks/            # useAuth, usePuzzle, useProgress, useSubscription
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── stripe.ts
│   │   ├── lichess.ts    # Lichess API client
│   │   └── chess-utils.ts # chess.js wrapper
│   └── stores/           # Zustand stores (auth, ui)
├── supabase/
│   ├── migrations/       # SQL schema
│   └── functions/        # Edge functions (Stripe webhooks)
└── public/
```

---

## Schema Bază de Date (Supabase/PostgreSQL)

```sql
-- Profiluri utilizatori
profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  username text UNIQUE NOT NULL,
  avatar_url text,
  playing_style text CHECK (playing_style IN ('offensive','balanced','pragmatic','defensive')),
  current_league text DEFAULT 'cherestea' CHECK (current_league IN ('cherestea','tinichea','bronz','argint','aur','smarald','diamant')),
  xp integer DEFAULT 0,
  estimated_elo integer DEFAULT 600,
  assessment_completed boolean DEFAULT false,
  streak_days integer DEFAULT 0,
  last_active_date date,
  created_at timestamptz DEFAULT now()
)

-- Cursuri de openings
courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  level text CHECK (level IN ('fundamental','beginner','intermediate','advanced')),
  opening_family text,        -- e.g. 'Sicilian Defense', 'London System'
  eco_code text,              -- A00-E99
  playing_styles text[],      -- stiluri pentru care e recomandat
  is_premium boolean DEFAULT true,
  is_foundational boolean DEFAULT false,  -- cursuri de baze: reguli + notație; mereu free
  thumbnail_url text,
  lesson_count integer DEFAULT 0,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
)

-- Lecții individuale
lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses ON DELETE CASCADE,
  title text NOT NULL,
  order_index integer NOT NULL,
  lesson_type text DEFAULT 'pgn' CHECK (lesson_type IN ('pgn','rules','notation')),
  pgn text,                   -- notație PGN complet (pentru lesson_type='pgn')
  theory_html text,           -- text HTML formatat
  key_positions jsonb,        -- FEN-uri de poziții cheie cu explicații
  exercises jsonb,            -- exerciții interactive (pentru lesson_type='rules'/'notation')
  is_premium boolean DEFAULT true,
  duration_minutes integer DEFAULT 10
)

-- Structura exercises jsonb (pentru lesson_type='rules' sau 'notation'):
-- [{ type: 'click_square', target: 'e4', fen: '...', instruction: 'Click pe e4' },
--  { type: 'move_piece', fen: '...', correct_move: 'e2e4', instruction: 'Mișcă pionul pe e4' },
--  { type: 'identify_square', square: 'f6', options: ['e6','f6','f7','g6'], instruction: 'Ce pătrat e marcat?' }]

-- Progres cursuri
user_course_progress (
  user_id uuid REFERENCES profiles ON DELETE CASCADE,
  course_id uuid REFERENCES courses ON DELETE CASCADE,
  completed_lesson_ids uuid[] DEFAULT '{}',
  last_lesson_id uuid REFERENCES lessons,
  xp_earned integer DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  PRIMARY KEY (user_id, course_id)
)

-- Puzzle-uri (cache din Lichess)
puzzles (
  id text PRIMARY KEY,         -- lichess puzzle id
  fen text NOT NULL,
  moves text NOT NULL,         -- soluție: "e2e4 d7d5 ..."
  rating integer,
  themes text[],               -- fork, pin, skewer, mateIn2, etc.
  game_url text
)

-- Tentative puzzle
user_puzzle_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE,
  puzzle_id text REFERENCES puzzles,
  solved boolean NOT NULL,
  time_seconds integer,
  attempted_at timestamptz DEFAULT now()
)

-- Abonamente
subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles UNIQUE,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  plan text CHECK (plan IN ('monthly','annual')),
  status text DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
)

-- Locație opțională în profil (pentru Comunitate)
-- Se adaugă în profiles: city text, county text

-- Turnee și competiții (Calendar competițional)
tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text CHECK (type IN ('platform','external')),  -- 'platform'=pe site, 'external'=competiție fizică/external
  category text CHECK (category IN ('online','over_the_board','workshop')),
  city text,                        -- pentru competiții fizice
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  max_participants integer,
  min_league text CHECK (min_league IN ('cherestea','tinichea','bronz','argint','aur','smarald','diamant')),
  is_open_to_minors boolean DEFAULT true,
  registration_url text,            -- URL extern (pentru type='external')
  organizer text,                   -- ex: 'FRȘ', 'CS Șah Cluj'
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
)

tournament_participants (
  tournament_id uuid REFERENCES tournaments ON DELETE CASCADE,
  user_id uuid REFERENCES profiles ON DELETE CASCADE,
  registered_at timestamptz DEFAULT now(),
  PRIMARY KEY (tournament_id, user_id)
)

-- Rezultate evaluare inițială
assessment_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles UNIQUE,
  answers jsonb NOT NULL,
  puzzle_score integer,
  knowledge_score integer,
  estimated_elo integer,
  playing_style text,
  recommended_course_ids uuid[],
  taken_at timestamptz DEFAULT now()
)
```

---

## Sistem Ligi & XP

7 ligi, de la debutant la elite. Toți utilizatorii încep în **Cherestea**.

| # | Ligă | XP total necesar | XP minim săptămânal | Culoare |
|---|---|---|---|---|
| 1 | Cherestea | 0 – 299 | 30 XP | #8B6914 |
| 2 | Tinichea | 300 – 699 | 50 XP | #71797E |
| 3 | Bronz | 700 – 1 299 | 75 XP | #CD7F32 |
| 4 | Argint | 1 300 – 2 199 | 100 XP | #C0C0C0 |
| 5 | Aur | 2 200 – 3 499 | 150 XP | #FFD700 |
| 6 | Smarald | 3 500 – 5 499 | 200 XP | #50C878 |
| 7 | Diamant | 5 500+ | 250 XP | #B9F2FF |

### Promovare
- Utilizatorul avansează automat la liga superioară când atinge pragul de XP total.
- Promovarea este imediată (nu se așteaptă sfârșitul săptămânii).

### Retrogradare
- La fiecare **duminică 23:59** se verifică XP-ul acumulat în săptămâna curentă.
- Dacă XP săptămânal < minimul ligii curente → utilizatorul este retrogradat cu **o ligă**.
- XP-ul total **nu se pierde** — doar liga se modifică (utilizatorul poate repromova rapid).
- Liga **Cherestea** nu are retrogradare (ligă de start, fără penalizare de XP).
- Utilizatorii care nu s-au logat deloc în săptămână sunt tratați ca 0 XP săptămânal.

### Exemplu flux retrogradare
```
Utilizator în Argint (1.400 XP total)
→ Săptămâna: câștigă doar 60 XP (sub minimul de 100)
→ Duminică: retrogradat în Bronz
→ XP total rămâne 1.460 XP, dar liga = Bronz
→ Dacă în săptămâna următoare câștigă 100+ XP → repromovat în Argint
```

### Schema bază de date — XP săptămânal

```sql
-- Tracking XP săptămânal per utilizator
user_weekly_xp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE,
  week_start date NOT NULL,     -- luni din săptămâna respectivă
  xp_earned integer DEFAULT 0,
  league_at_week_start text CHECK (league_at_week_start IN ('cherestea','tinichea','bronz','argint','aur','smarald','diamant')),
  relegation_warning_sent boolean DEFAULT false,  -- avertisment joi
  UNIQUE (user_id, week_start)
)
```

Supabase Edge Function `weekly-league-check` rulează via **pg_cron** în fiecare duminică la 23:59 UTC:
```sql
-- Pseudocod logică retrogradare
FOR fiecare utilizator:
  xp_saptamanal = SUM(xp din user_weekly_xp WHERE week_start = saptamana_curenta)
  minim_liga = get_minimum_xp(current_league)
  IF xp_saptamanal < minim_liga AND current_league != 'cherestea':
    new_league = liga_anterioara(current_league)
    UPDATE profiles SET current_league = new_league
    INSERT notificare retrogradare
```

### Surse XP
- Lecție finalizată: +50 XP
- Curs finalizat: +200 XP bonus
- Puzzle rezolvat easy / medium / hard: +10 / +20 / +30 XP
- Streak zilnic activ (≥1 activitate/zi): +25 XP/zi bonus
- Evaluare inițială completată: +100 XP (o singură dată)

### Notificări
- Promovare → toast + modal celebrare cu badge ligă nouă
- Avertisment joi seara dacă XP săptămânal < 50% din minim → email/notificare in-app
- Retrogradare duminică → email + banner roșu la următorul login

---

## Testul de Evaluare (Onboarding)

**15 întrebări în 3 categorii:**

1. **Tactici (5 puzzle-uri interactive)** — board interactiv cu poziție reală; evaluează: îl rezolvă? în cât timp?
2. **Cunoștințe openings (5 MCQ)** — "Care e cel mai bun răspuns la 1.e4 dacă joci defensiv?" etc.
3. **Stil de joc (5 MCQ situaționale)** — "Ai o poziție solidă dar fără atacuri evidente. Preferi să: a) ataci oricum, b) aștepți greșeala adversarului, c) simplifici la un final avantajos"

**Output evaluare:**
- `estimated_elo`: 400–800 (Wooden/Bronze), 800–1200 (Silver), 1200–1600 (Gold), 1600+ (Platinum/Diamond)
- `playing_style`: offensive / balanced / pragmatic / defensive
- `recommended_courses`: primele 3 cursuri din DB filtrate pe nivel + stil

**Routing post-assessment bazat pe scor:**
| Scor puzzle-uri | Scor cunoștințe | Redirect |
|---|---|---|
| 0–1 / 5 | 0–2 / 5 | → cursul "Piese în Mișcare" (reguli de bază) |
| 2–3 / 5 | 0–3 / 5 | → cursul "Codul Șahului" (notație) |
| 3+ / 5 | orice | → dashboard cu recomandări de openings |

Dashboard-ul afișează cursurile fundamentale în banner separat ("Înainte de orice altceva...") dacă nu sunt completate.

---

## Pagini & UX

### Landing page (`/`)
- Hero: "Devino un jucător mai bun, o mutare pe rând"
- Features: evaluare nivel, cursuri personalizate, puzzle-uri zilnice, statistici
- Pricing section (3 planuri)
- CTA: "Începe gratuit"

### Dashboard (`/dashboard`) — după login
- **Left sidebar**: navigație (Dashboard, Cursuri, Puzzle-uri, Cufărul cu Tactici, Calendar, Comunitate, Statistici, Profil, Upgrade)
- **Main area**:
  - Widget ligă: avatar + ligă curentă + XP progress bar + XP până la liga următoare
  - "Continuă de unde ai rămas" — ultimul curs/lecție
  - Puzzle zilnic (1 puzzle special)
  - "Recomandat pentru tine" — 3 carduri cursuri
  - Mini-statistici: puzzles rezolvate, streak, rata de succes

### Cursuri (`/courses`)
- Grid de carduri (4 coloane desktop, 2 tablet, 1 mobil)
- Filtre: Nivel (All/Beginner/Intermediate/Advanced), Stil (All/Offensive/Balanced/Pragmatic/Defensive), Opening Family
- Card curs: thumbnail, titlu, nivel badge, număr lecții, progres bar (dacă început), lock icon (premium)

### Lecție (`/courses/:slug/lessons/:id`)
- Layout split: stânga = tabla de șah interactivă; dreapta = teorie + butoane nav
- PGN player cu butoane Înapoi/Înainte/Reset
- Highlight mutări cheie
- Butoane: "Lecția anterioară" / "Lecția următoare" / "Marchează ca finalizată"

### Puzzle-uri (`/puzzles`)
- Tablă interactivă full-size
- Indicator temă (Fork, Pin, Mată în 2...)
- Rating puzzle vizibil
- Rezultat: Corect ✓ / Greșit ✗ cu explicație
- Filtre: temă, dificultate

### Statistici (`/stats`)
- Recharts: grafic XP în timp (line chart)
- Puzzle success rate pe teme (bar chart)
- Openings coverage: care au fost studiate, rata de succes (radar/spider chart)
- Puncte slabe identificate automat
- Streak calendar (GitHub-style heatmap)

### Șahiștii din Regiune (`/community`)
- **Tabs**: "Din zona mea" (filtrat după city/county) | "Toți jucătorii" (global, paginat)
- **Player card**: avatar, username, ligă badge colorat, XP, elo estimat, playing style badge
- **Search** by username (debounced, client-side)
- **Sort**: XP descrescător (default) | Elo estimat | Ligă
- **Banner**: "Setează-ți locația" dacă `city` nu e completat → link la `/profile`
- **Fără locație setată**: userul apare doar în tab "Toți jucătorii", nu în "Din zona mea"
- Paginate: 20 players/pagină (infinite scroll sau butoane Prev/Next)

### Calendar Competițional (`/calendar`)
- **Două tipuri de events**:
  - `type: 'platform'` — turnee create în aplicație, cu înregistrare prin cont
  - `type: 'external'` — competiții fizice (FRȘ, club local), adăugate de admin cu link extern
- **Views**: Listă "Upcoming" (default, sortate cronologic) | Grilă lunară simplă (fără librărie externă)
- **Event card**: titlu, dată start/end, tip badge (Online / Fizic), oraș (pt fizice), CTA
  - Platform tournament: buton "Înregistrează-te" (dacă user logat + locuri disponibile)
  - External: buton "Detalii →" (link extern, `target="_blank"`)
- **Filtru**: Toate | Online | Fizic
- **Admin**: events externe se adaugă direct în Supabase (fără UI admin în MVP)

### Cufărul cu Tactici (`/tactics`)
Static — nicio nevoie de DB.

**Structură pagină:**
- Hero: "Cufărul cu Tactici" + subtitlu playful
- **Secțiunea 1 — Tactici de Bază** (6 cards):
  | Tactic | Lichess theme | Dificultate |
  |---|---|---|
  | Furculița | `fork` | Beginner |
  | Acul | `pin` | Beginner |
  | Traversarea | `skewer` | Beginner |
  | Descoperirea | `discoveredAttack` | Intermediate |
  | Dubla amenințare | `doubleCheck` | Intermediate |
  | Sacrificiul | `sacrifice` | Intermediate |
- **Secțiunea 2 — Tactici Avansate** (4 cards): `zugzwang`, `promotion`, `perpetualCheck`, `trappedPiece`
- **Secțiunea 3 — Mate în N mutări** (3 cards): `mateIn1`, `mateIn2`, `mateIn3`
- **Secțiunea 4 — Jocuri Celebre** (5-8 fișe): Immortal Game (Anderssen 1851), Opera Game (Morphy 1858), Evergreen Game, Deep Blue vs Kasparov 1997, Magnus Carlsen best games — fiecare cu scurtă descriere + link lichess.org/game/...
- **Secțiunea 5 — PDF-uri & Resurse** (linkuri externe gratuite): FIDE basic rules PDF, Chess Kids worksheets, etc.

**Fiecare TacticCard conține:**
- Nume tactic, scurtă descriere (1 frază), difficulty badge
- Diagramă SVG simplă sau FEN preview static (react-chessboard `arePiecesDraggable={false}`)
- Buton **"Exersează →"** → navighează la `/puzzles?theme=fork` (refolosește PuzzlePage cu filtru presetat)

---

## Monetizare (Stripe)

**Planuri:**
| Plan | Preț | Acces |
|---|---|---|
| Free | Gratuit | Cursuri fundamentale (mereu), 3 cursuri openings, 10 puzzle-uri/zi, ligi, streak |
| Pro Monthly | $9.99/lună | Acces complet: toate cursurile, puzzle-uri nelimitate, Opening Lab, statistici avansate |
| Pro Annual | $79.99/an | Idem Pro + 2 luni gratuite |

**Ce e mereu Free (indiferent de plan):**
- Paginile de comunitate, calendar și Cufărul cu Tactici — **100% free, nicio restricție**
- Cursurile fundamentale "Piese în Mișcare" + "Codul Șahului" (`is_foundational: true`)
- Testul de plasament + profil stil de joc ("Style DNA" card sharable)
- Sistemul de ligi complet (toate cele 7 ligi accesibile prin XP)
- Streak + XP basic
- Puzzle zilnic (1/zi, același pentru toți — efect de comunitate)
- 3 cursuri openings (beginner, selectate manual)
- 10 puzzle-uri/zi

**Exclusiv Pro:**
- Toate cele 20+ cursuri openings (intermediate + advanced)
- Cursuri middlegame & endgame (adăugate în faze viitoare)
- Cursuri tematice lunare ("Luna Sicilianei") — crează FOMO
- Puzzle-uri nelimitate + filtre temă/dificultate/rating
- **Opening Lab** — construiește propriul repertoriu, export PGN
- **Path to [Elo]** — plan personalizat spre un target de rating
- **Duel de repertoriu** — provocare 1v1 pe un opening (Free poate primi, Pro inițiază)
- Statistici avansate: puncte slabe, success rate per temă, raport săptămânal
- Badge-uri exclusive pe profil (flex în clasament)
- Acces prioritar la turnee cu premii

**Politica de refund:** Eligibil după 60 zile de utilizare activă dacă statisticile nu arată progres. Implementat manual (admin flow) — nu automat Stripe.

**Implementare:**
- Stripe Checkout Session (hosted by Stripe)
- Supabase Edge Function pentru webhook-uri Stripe (`customer.subscription.updated`, `invoice.payment_failed`)
- `useSubscription()` hook care verifică `subscriptions` table
- Gate pe conținut premium: `is_premium && !hasActiveSubscription → ShowUpgradePrompt`

---

## Conținut de seed (cursuri inițiale)

### Cursuri fundamentale (2) — mereu FREE, `is_foundational: true`

**Curs F1: "Piese în Mișcare"** — regulile șahului
`slug: piese-in-miscare` | `level: fundamental` | 10 lecții | `lesson_type: 'rules'`

| # | Lecție | Exercițiu interactiv |
|---|---|---|
| 1 | Tabla și setup-ul | drag & drop ghidat — plasează piesele |
| 2 | Pionul | mișcă pionul în 3 poziții date |
| 3 | Turnul | atacă 3 piese cu turnul |
| 4 | Nebunul | demonstrație: de ce rămâne pe aceeași culoare |
| 5 | Calul | "Calul de pe h1 ajunge vreodată pe h2?" |
| 6 | Dama | exercițiu de acoperire a tablei |
| 7 | Regele | click pe pătratele valide din 5 poziții |
| 8 | Rocada | când poți / nu poți — click_square exercise |
| 9 | En passant & transformare | mini-puzzle câte unul |
| 10 | Șah, șah-mat, remiză | identifică situația din 5 poziții |

**Curs F2: "Codul Șahului"** — notația algebrică
`slug: codul-sahului` | `level: fundamental` | 6 lecții | `lesson_type: 'notation'`

| # | Lecție | Exercițiu interactiv |
|---|---|---|
| 1 | Coordonatele tablei (a-h, 1-8) | click pe pătratul anunțat: "Unde e e4?" |
| 2 | Drill de coordonate | 20 pătrate în timp limitat (gamified) |
| 3 | Abrevierile pieselor (R, D, T, N, C) | MCQ cu imagine piesă |
| 4 | Notarea mutărilor simple | "Ce mutare e asta?" pe tablă |
| 5 | Capturi, șah, mat (×, +, #) | completează notația din 5 poziții |
| 6 | Rocada și en passant în notație | O-O, O-O-O, e.p. — quiz final |

---

### Cursuri openings (20) — `is_foundational: false`

20 cursuri de opening populare cu PGN public:

**White openings (10):**
1. London System (beginner, pragmatic)
2. Italian Game (beginner, balanced)
3. King's Gambit (beginner, offensive)
4. Queen's Gambit (intermediate, balanced)
5. Catalan Opening (intermediate, pragmatic)
6. Ruy Lopez (intermediate, balanced)
7. English Opening (intermediate, pragmatic)
8. King's Indian Attack (intermediate, offensive)
9. Colle System (beginner, defensive)
10. Vienna Game (beginner, offensive)

**Black openings (10):**
11. Sicilian Defense (intermediate, offensive)
12. French Defense (intermediate, defensive)
13. Caro-Kann Defense (intermediate, defensive)
14. King's Indian Defense (intermediate, offensive)
15. Nimzo-Indian Defense (advanced, balanced)
16. Dutch Defense (intermediate, offensive)
17. Slav Defense (intermediate, pragmatic)
18. Pirc Defense (intermediate, defensive)
19. Scandinavian Defense (beginner, pragmatic)
20. Alekhine Defense (intermediate, offensive)

---

## Implementare în Faze

### Faza 1 — Foundation (2-3 zile)
- [ ] `npm create vite@latest chess-platform -- --template react-ts`
- [ ] Tailwind CSS + shadcn/ui setup
- [ ] Supabase project creat + migrations rulate
- [ ] React Router v6 setup
- [ ] Zustand store (auth)
- [ ] `lib/supabase.ts` client

### Faza 2 — Autentificare (1 zi)
- [ ] `useAuth` hook (login, register, logout, session)
- [ ] Landing page cu hero + pricing statice + CTA
- [ ] `/login` și `/register` pages cu Supabase Auth
- [ ] Protected routes (PrivateRoute component)
- [ ] Redirect la `/onboarding` pentru useri noi

### Faza 3 — Onboarding & Evaluare (2 zile)
- [ ] `AssessmentWizard.tsx` (multi-step cu progress bar)
- [ ] Step 1: 5 puzzle-uri tactice interactive (react-chessboard + chess.js)
- [ ] Step 2: 5 MCQ openings
- [ ] Step 3: 5 MCQ stil de joc
- [ ] `calculateResults()` → estimated_elo + playing_style + league
- [ ] Salvare în `assessment_results` + update `profiles`
- [ ] Redirect la `/dashboard`

### Faza 4 — Dashboard (2 zile)
- [ ] Layout cu sidebar fix (desktop) / drawer (mobile)
- [ ] `LeagueWidget.tsx` — avatar, ligă, XP progress
- [ ] `DailyPuzzle.tsx` — puzzle din Lichess API
- [ ] `RecommendedCourses.tsx` — query pe nivel + stil
- [ ] `MiniStats.tsx` — streak, puzzles azi, rata succes

### Faza 5 — Cursuri Fundamentale & Openings (4 zile)

**5a — Cursuri fundamentale (1.5 zile)**
- [ ] Seed script: 2 cursuri fundamentale (Piese în Mișcare + Codul Șahului) cu lecțiile lor
- [ ] `SquareClickExercise.tsx` — tablă, pătrat-țintă, validare click, feedback imediat + XP mic per exercițiu
- [ ] `MovePieceExercise.tsx` — react-chessboard cu validare mutare corectă
- [ ] `IdentifyNotationExercise.tsx` — MCQ cu feedback
- [ ] `FundamentalLessonPage.tsx` — layout diferit față de PGN player: exerciții secvențiale cu progress bar în lecție
- [ ] Routing post-assessment → redirect spre cursul potrivit bazat pe scor
- [ ] Banner în dashboard "Înainte de orice altceva..." dacă fundamentale necompletate

**5b — Cursuri openings (2.5 zile)**
- [ ] Seed script: 20 cursuri openings + câte 5 lecții PGN per curs
- [ ] `CoursesPage.tsx` cu filtre (Nivel include acum: Fundamental / Beginner / Intermediate / Advanced)
- [ ] `CourseDetail.tsx` — overview + lessons list
- [ ] `LessonPage.tsx` — split layout board + teorie (pentru `lesson_type: 'pgn'`)
- [ ] PGN player (butoane nav + highlight moves)
- [ ] Salvare progres în `user_course_progress`
- [ ] XP acordat la finalizare lecție/curs

### Faza 6 — Puzzle Trainer (2 zile)
- [ ] `lib/lichess.ts` — fetch puzzle by rating range + theme
- [ ] Cache puzzle-uri în Supabase `puzzles` table
- [ ] `PuzzlePage.tsx` — board interactiv cu validare soluție
- [ ] Salvare tentativă în `user_puzzle_attempts`
- [ ] Free tier limit: 10 puzzle-uri/zi (verificat server-side în edge function sau client-side cu Supabase)

### Faza 7 — Statistici (2 zile)
- [ ] `StatsPage.tsx` cu Recharts
- [ ] XP progression (line chart)
- [ ] Puzzle success rate per temă (bar chart)
- [ ] Opening coverage radar chart
- [ ] Streak calendar (heatmap simplu)
- [ ] "Puncte slabe" — query pe temele cu cel mai mic success rate

### Faza 8 — Stripe & Monetizare (2 zile)
- [ ] Supabase Edge Function: `create-checkout-session`
- [ ] Supabase Edge Function: `stripe-webhook` (sync subscription status)
- [ ] `PricingPage.tsx` cu 3 planuri
- [ ] `useSubscription()` hook
- [ ] Gate conținut premium cu `<PremiumGate>` component
- [ ] `UpgradePrompt.tsx` modal inline

### Faza 8b — Sistem Ligi & Retrogradare (1-2 zile)
- [ ] Migrare `user_weekly_xp` table + trigger automat la acordarea de XP
- [ ] `lib/league-utils.ts`: `getLeagueForXp()`, `getPreviousLeague()`, `getWeeklyMinimum()`
- [ ] `useWeeklyXp()` hook — afișează XP săptămânal curent vs. minim ligă
- [ ] Supabase Edge Function `weekly-league-check` (pg_cron duminică 23:59 UTC)
- [ ] Supabase Edge Function `weekly-warning` (pg_cron joi 20:00 UTC) — trimite avertisment dacă XP < 50% minim
- [ ] `LeagueWidget.tsx` — afișează: ligă curentă, XP total, XP săptămânal / minim săptămânal, progres spre promovare
- [ ] Modal `LeagueChangeModal.tsx` — folosit atât la promovare (celebrare) cât și la retrogradare (avertisment)
- [ ] Banner in-app la login dacă utilizatorul a fost retrogradat în noaptea precedentă

### Faza 8c — Comunitate, Calendar, Cufărul cu Tactici (2-3 zile)

**Migrație DB (`002_community_calendar.sql`):**
- [ ] `ALTER TABLE profiles ADD COLUMN city text, ADD COLUMN county text`
- [ ] Tabel `tournaments` (type, category, city, starts_at, ends_at, max_participants, min_league, registration_url, organizer, is_published)
- [ ] Tabel `tournament_participants`
- [ ] RLS: toți pot citi turnee publicate (`is_published = true`); înregistrare doar utilizatori autentificați

**Comunitate (`/community`):**
- [ ] `CommunityPage.tsx` — tabs "Din zona mea" / "Toți jucătorii", search, sort
- [ ] `PlayerCard.tsx` — avatar, username, ligă badge, XP, elo, playing style
- [ ] Hook `useCommunity(filter)` — query `profiles` cu filtre city/county + paginare
- [ ] Banner "Setează-ți locația" dacă `profile.city` e null → link `/profile`
- [ ] `ProfilePage.tsx` — adaugă câmpuri city + county (select sau text input)

**Calendar (`/calendar`):**
- [ ] `CalendarPage.tsx` — listă Upcoming (default) + grilă lunară
- [ ] `EventCard.tsx` — titlu, dată, tip badge, CTA (înregistrare / link extern)
- [ ] `CalendarGrid.tsx` — grilă lunară simplă (CSS grid, 7 coloane, fără librărie externă)
- [ ] Hook `useCalendar(month?)` — query `tournaments WHERE is_published = true AND starts_at >= now()`
- [ ] Seed: 3-5 events de test (2 platform online + 2 external fizice)

**Cufărul cu Tactici (`/tactics`):**
- [ ] `TacticsChestPage.tsx` — layout cu 5 secțiuni
- [ ] `TacticCard.tsx` — FEN preview static (`react-chessboard arePiecesDraggable={false}`) + buton "Exersează →" cu query param `?theme=fork`
- [ ] `FamousGameCard.tsx` — titlu, protagoniști, an, descriere scurtă, link lichess
- [ ] Date statice în `src/data/tactics.ts` — array de tactici cu FEN, theme, descriere
- [ ] Date statice în `src/data/famousGames.ts` — jocuri celebre cu metadata
- [ ] `PuzzlesPage.tsx` — acceptă `?theme=fork` ca query param pentru filtru inițial

### Faza 9 — Polish & Deploy (1-2 zile)
- [ ] Responsive design verificat (mobile sidebar drawer)
- [ ] Loading skeletons pe toate paginile
- [ ] Toast notifications (react-hot-toast)
- [ ] Error boundaries
- [ ] Deploy: Vercel (frontend) + Supabase hosted

---

## Dependințe principale

```json
{
  "react": "^18",
  "react-router-dom": "^6",
  "@supabase/supabase-js": "^2",
  "react-chessboard": "^4",
  "chess.js": "^1",
  "zustand": "^4",
  "recharts": "^2",
  "@tanstack/react-query": "^5",
  "stripe": "^14",
  "tailwindcss": "^3",
  "react-hot-toast": "^2"
}
```

shadcn/ui components: Button, Card, Badge, Progress, Dialog, Tabs, Select, Skeleton

---

## Verificare finală

1. Register → onboarding complet → dashboard afișat cu liga Cherestea
2. Curs deschis → lecție completată → XP crescut + progres salvat
3. Puzzle rezolvat → attempt salvat → statistici actualizate
4. User free → încearcă curs premium → UpgradePrompt afișat
5. Checkout Stripe → subscription activă → conținut deblocat
6. `/stats` → grafice populate cu date reale

---

## Spec: Conturi Copii (10–13 ani) cu Supraveghere Parentală

### Utilizatori

- **Copil (sub 14 ani)**: poate accesa cursuri, puzzle-uri, ligi, clasament public, chat, turnee. **Nu** poate accesa pagina de plată (apare restricționată). Sesiuni limitate la 60 min cu pauze progresive.
- **Părinte/Tutor (fără cont)**: confirmă sau respinge crearea contului copilului via email cu link magic. Vede statistici copilului via link magic unic (fără autentificare). Primește raport săptămânal detaliat. Nu poate dezactiva contul.
- **Platforma**: șterge automat conturile neconfirmate după 30 zile. Tranziție automată la cont normal la împlinirea a 14 ani.

---

### Sistemul de sesiuni — regula pauzelor progresive

```
Sesiune 1: 60 min activ → Pauză 1: 15 min
Sesiune 2: 60 min activ → Pauză 2: 30 min
Sesiune 3: 60 min activ → Pauză 3: 60 min
Sesiune N: 60 min activ → Pauză N: (pauza anterioară × 2)
```

**Avertisment:** la 10 minute înainte de expirarea sesiunii → banner non-intruziv.
**La expirare:** redirect automat la `/break` cu countdown până la reluare.
**Browser închis în pauză:** dacă inactiv ≥ 10 min → se scad minutele inactive din pauza rămasă (ex: 15 min pauză – 10 min inactiv = 5 min rămas).
**Anti-bypass:** timpul se contorizează **per cont** (server-side), nu per dispozitiv. Logat simultan pe 2 dispozitive = același contor.
**Progres salvat automat** la expirarea sesiunii — reia exact din același punct.

---

### Flow principal

**Înregistrare copil:**
1. Copilul introduce vârsta (sau an naștere) la signup
2. Sistem detectează < 14 ani → pas suplimentar: "Email părinte/tutore"
3. Cont creat cu status `frozen = true`
4. Email trimis părintelui: prezentare platformă, beneficii, riscuri, butoane **Confirm** / **Respinge**
5a. Părinte confirmă → link magic → cont activat → copil poate intra
5b. Părinte respinge → copil primește mesaj explicativ și încurajare să revină
5c. Nicio acțiune 30 zile → cont șters automat

**Sesiune activă (copil logat):**
1. La login: sistem verifică `is_minor = true` → activează session tracker
2. Dacă e în pauză: redirect la `/break` cu countdown rămas
3. Sesiune activă: timer server-side incrementat la fiecare minut
4. La 50 min: banner "Mai ai 10 minute în această sesiune"
5. La 60 min: progres salvat → redirect la `/break?duration=15` (sau durata pauzei curente)
6. `/break`: countdown vizual + mesaj motivațional + ce poate face în pauză (offline)
7. La expirarea pauzei: buton "Reia sesiunea" activ

**Browser închis:**
1. Sesiunea rămâne activă server-side cu timestamp `last_seen`
2. La revenire pe site: modal "Reia de unde ai rămas" / "Închide sesiunea aici"
3. Dacă `last_seen` > 10 min în pauză → reduce pauza cu minutele inactive

**Plată pentru cont minor:**
1. Copilul accesează `/pricing` → pagina apare restricționată cu mesaj: "Plata se face de către un părinte sau tutore"
2. Buton: "Trimite link de plată părintelui" → email cu Stripe Checkout link către parental_email
3. Părintele plătește via link → webhook activează Pro pe contul copilului

**Raport săptămânal (duminică):**
- Email către `parental_email` cu link magic unic (expiră în 7 zile)
- Conținut: timp petrecut, lecții studiate, puzzle-uri rezolvate, ligă curentă, progres XP, mesaje chat (sumar), turnee participante

**Tranziție la 14 ani:**
- Cron zilnic verifică `birth_year` → la zi de naștere: `is_minor = false`, sesiuni nelimitate, `/pricing` accesibil
- Notificare in-app: "Cont actualizat — bun venit în comunitatea completă!"

---

### Edge cases

| Situație | Rezolvare |
|---|---|
| Copil logat pe 2 dispozitive simultan | Contor unic server-side — ambele dispozitive văd același timp rămas |
| Browser închis în mijlocul sesiunii | `last_seen` timestamp; la revenire modal restore/close |
| Inactiv ≥10 min în pauză | Pauza se reduce cu minutele inactive |
| Accesare directă URL `/pricing` | Pagină restricționată cu mesaj + opțiune email părinte |
| Email parental invalid/bounce | Cont rămâne frozen; copilul poate reintroduce emailul |
| Nicio confirmare în 30 zile | Cont șters automat via cron |
| Copil împlinește 14 ani | Cron zilnic → tranziție automată la cont normal |
| Copil în mijlocul unui turneu când expiră sesiunea | Progres salvat; la revenire după pauză reia din același punct |

---

### Schema bază de date — modificări

```sql
-- Extindere profiles
ALTER TABLE public.profiles ADD COLUMN
  birth_year smallint,
  is_minor boolean GENERATED ALWAYS AS (
    birth_year IS NOT NULL AND
    (EXTRACT(YEAR FROM now())::int - birth_year) < 14
  ) STORED,
  parental_email text,
  parental_consent_token uuid DEFAULT gen_random_uuid(),
  parental_consent_given boolean DEFAULT false,
  parental_consent_expires_at timestamptz,
  account_frozen boolean DEFAULT false,
  account_frozen_reason text; -- 'awaiting_parental_consent' | 'rejected'

-- Sesiuni copii (tracker timp)
CREATE TABLE public.child_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles ON DELETE CASCADE,
  session_number integer NOT NULL DEFAULT 1,  -- incrementat la fiecare sesiune nouă
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,            -- started_at + 60 min
  ended_at timestamptz,
  break_duration_minutes integer NOT NULL,    -- 15, 30, 60, 120...
  break_starts_at timestamptz,
  break_ends_at timestamptz,
  last_seen_at timestamptz,
  warning_sent boolean DEFAULT false
);

-- Link-uri magice părinte
CREATE TABLE public.parental_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles ON DELETE CASCADE,
  token uuid UNIQUE DEFAULT gen_random_uuid(),
  type text CHECK (type IN ('confirm','reject','stats','payment')),
  expires_at timestamptz NOT NULL,
  used_at timestamptz
);

-- Turnee (feature nou)
CREATE TABLE public.tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text CHECK (type IN ('online','over_the_board')),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  max_participants integer,
  min_league text,
  is_open_to_minors boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.tournament_participants (
  tournament_id uuid REFERENCES public.tournaments ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles ON DELETE CASCADE,
  registered_at timestamptz DEFAULT now(),
  PRIMARY KEY (tournament_id, user_id)
);
```

---

### Componente noi

| Componentă | Descriere |
|---|---|
| `BreakPage.tsx` | Pagina de pauză cu countdown, mesaj motivațional, sugestii activități offline |
| `SessionTimer.tsx` | Banner discret cu timp rămas (apare doar în ultimele 10 min) |
| `AgeGateStep.tsx` | Pas suplimentar în Register dacă vârsta < 14 |
| `ParentalConfirmPage.tsx` | Pagina magic link pentru confirmare/respingere (fără auth) |
| `ParentalStatsPage.tsx` | Dashboard statistici copil via magic link (fără auth) |
| `RestrictedPage.tsx` | Overlay pe `/pricing` pentru conturi minor |
| `useChildSession.ts` | Hook: gestionează timer sesiune, trimitere warning, redirect la break |
| `useParentalLink.ts` | Hook: generare + trimitere email magic link |

---

### Edge Function noi

| Funcție | Trigger | Acțiune |
|---|---|---|
| `session-tick` | Apelată client-side la fiecare minut (heartbeat) | Incrementează `child_sessions`, verifică expirare |
| `check-minor-transitions` | pg_cron zilnic 00:01 UTC | Verifică `birth_year` → tranziție automată la 14 ani |
| `cleanup-frozen-accounts` | pg_cron zilnic 03:00 UTC | Șterge conturi cu `parental_consent_expires_at` < now() |
| `weekly-parental-report` | pg_cron duminică 08:00 UTC | Generează + trimite raport detaliat pe `parental_email` |
| `send-parental-payment-link` | Apelată la cerere | Generează Stripe link + trimite pe `parental_email` |

---

### Verificare finală — conturi copii

1. Register cu vârstă < 14 → cont frozen → email parental trimis
2. Părinte confirmă via magic link → cont activat → copil se poate loga
3. Copil logat → sesiune 60 min → banner la 50 min → redirect `/break` la 60 min
4. `/break` countdown → sesiunea se reia după pauză
5. Browser închis în pauză 8 min → la revenire pauza afișează 7 min (15-8)
6. Copil accesează `/pricing` → pagină restricționată → trimite email plată la părinte
7. Cron zilnic → la ziua de 14 ani → cont normal, sesiuni nelimitate
8. Duminică → email raport săptămânal cu link magic stats → link expiră în 7 zile
