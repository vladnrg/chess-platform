-- Seed turnee online (platform + externe)
INSERT INTO public.tournaments
  (title, description, type, category, starts_at, ends_at, max_participants, min_league, is_open_to_minors, registration_url, organizer, is_published)
VALUES

-- Turnee pe platformă (Online)
(
  'Turneul Lunii — Iunie 2026',
  'Turneu rapid pe ChessUp. Format: sistem elvețian, 5 runde, 10+5 minute/jucător. Premiați top 3 cu XP bonus.',
  'platform', 'online',
  '2026-06-07 15:00:00+03', '2026-06-07 18:00:00+03',
  32, 'cherestea', true,
  null, 'ChessUp', true
),
(
  'Cupa ChessUp — Vară 2026',
  'Turneul sezonier al platformei. Toți jucătorii sunt invitați, indiferent de nivel. XP dublu pentru câștigătorii etapelor.',
  'platform', 'online',
  '2026-07-12 14:00:00+03', '2026-07-12 17:30:00+03',
  64, 'cherestea', true,
  null, 'ChessUp', true
),
(
  'Duel de Openings — Siciliana vs. Italiana',
  'Turneu tematic: ambii jucători trebuie să joace exclusiv Siciliană sau Italiană. Format: 6 runde, 7+3 minute.',
  'platform', 'online',
  '2026-06-21 16:00:00+03', '2026-06-21 18:30:00+03',
  16, 'bronz', true,
  null, 'ChessUp', true
),
(
  'Liga Diamant — Invitațional',
  'Turneu exclusiv pentru jucătorii din liga Diamant. Format: round-robin, 7+3 minute, comentat live.',
  'platform', 'online',
  '2026-08-02 17:00:00+03', '2026-08-02 20:00:00+03',
  8, 'diamant', false,
  null, 'ChessUp', true
),

-- Turnee externe (Online)
(
  'Lichess Arena — Weekend Românesc',
  'Turneu open pe Lichess.org organizat de comunitatea română. Format: arenă 90 minute, bullet 2+1.',
  'external', 'online',
  '2026-06-14 20:00:00+03', '2026-06-14 21:30:00+03',
  null, 'cherestea', true,
  'https://lichess.org/tournament', 'Comunitatea Română de Șah', true
),
(
  'Chess.com Daily Arena — România',
  'Turneu zilnic pe Chess.com dedicat jucătorilor români. Blitz 5+0, top 10 câștigă trofeu digital.',
  'external', 'online',
  '2026-06-28 19:00:00+03', '2026-06-28 20:00:00+03',
  null, 'tinichea', true,
  'https://www.chess.com/play/arena', 'Chess.com România', true
),
(
  'Campionatul Național Online — Juniori U18',
  'Organizat de Federația Română de Șah. Calificare pentru campionatul european. Blitz 3+2, 9 runde.',
  'external', 'online',
  '2026-07-05 10:00:00+03', '2026-07-06 18:00:00+03',
  null, 'argint', true,
  'https://frsonline.ro', 'Federația Română de Șah', true
),

-- Workshop-uri
(
  'Workshop: Atacul Regelui cu GM Petrescu',
  'Sesiune live de 2 ore cu un maestru internațional. Analiza poziților clasice de atac la rege. Sesiune înregistrată disponibilă după.',
  'external', 'workshop',
  '2026-06-18 18:00:00+03', '2026-06-18 20:00:00+03',
  null, 'cherestea', true,
  'https://forms.gle/example', 'Școala Națională de Șah', true
),
(
  'Masterclass: Finaluri de Tură — Tehnica Philidor',
  'Workshop online dedicat finalurilor. Tehnica Philidor explicată pas cu pas, exerciții interactive, Q&A.',
  'platform', 'workshop',
  '2026-07-19 17:00:00+03', '2026-07-19 19:00:00+03',
  40, 'bronz', true,
  null, 'ChessUp', true
);
