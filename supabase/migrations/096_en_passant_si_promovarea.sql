-- ============================================================
-- Două lecţii în locul uneia: „En passant" şi „Promovarea pionului"
-- ============================================================
-- Lecţia „En passant şi transformarea pionului" preda două reguli fără legătură
-- între ele, în trei exerciţii: două despre en passant, unul despre promovare.
-- Se numea şi „transformare", deşi termenul e promovare.
--
-- Acum sunt două lecţii. Cea de en passant are toate cele trei exerciţii despre
-- en passant, iar promovarea îşi primeşte lecţia ei, cu poziţii care se
-- îngreunează pas cu pas.
--
-- Toate poziţiile de mai jos au fost trecute prin chess.js înainte de scris:
-- fiecare e legală, iar mutarea cerută e chiar printre cele posibile.


-- ============================================================
-- 1. „En passant" — numai en passant
-- ============================================================
-- Exerciţiul de promovare pleacă de aici şi îi ia locul aceeaşi regulă văzută
-- din cealaltă parte a tablei: de data asta capturează negrul. Tabla se întoarce
-- singură spre cine e la mutare, deci pionul negru vine în faţa jucătorului.
update public.lessons
set
  title = 'En passant',
  theory_html = '<p><strong>En passant</strong> înseamnă „în trecere". Când adversarul împinge un pion cu două pătrate şi ajunge exact lângă pionul tău, îl poţi captura ca şi cum ar fi avansat doar unul — pionul tău trece diagonal, iar al lui dispare.</p><p>Se poate <strong>doar imediat</strong>, la mutarea următoare. Dacă joci altceva, dreptul se pierde.</p>',
  exercises = '[
    {
      "fen": "rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3",
      "type": "move_piece",
      "instruction": "En passant! Capturează pionul negru de pe d5 — mută pe d6",
      "correct_move": "e5d6"
    },
    {
      "fen": "rnbqkbnr/ppp1pppp/8/8/3pP3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 3",
      "type": "move_piece",
      "instruction": "Acum capturează negrul: albul tocmai a împins pionul pe e4 — ia-l en passant, pe e3",
      "correct_move": "d4e3"
    },
    {
      "fen": "rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3",
      "type": "identify_square",
      "square": "d6",
      "options": ["d5", "d6", "e5", "e6"],
      "instruction": "La en passant, pionul capturator aterizează pe:"
    }
  ]'::jsonb
where title = 'En passant și transformarea pionului';


-- ============================================================
-- 2. „Promovarea pionului" — lecţie nouă
-- ============================================================
-- Trei poziţii, tot mai încărcate:
--   1. un pion singur pe tablă — se învaţă că alegerea există;
--   2. doi pioni, dar unul e blocat de un turn — se caută pionul potrivit;
--   3. o poziţie în care regina nu ajută la nimic, iar calul dă şah şi atacă
--      regina neagră. Aici alegerea chiar contează, deci doar calul e primit
--      (`any_promotion` lipseşte). La primele două e bună orice piesă.
--
-- Lecţia intră între „Rocada" (8) şi „Şah, şah-mat şi remiză", care coboară cu
-- un loc. Ordinea se schimbă întâi, ca poziţia 10 să fie liberă.
update public.lessons
set order_index = 11
where course_id = (select id from public.courses where slug = 'piese-in-miscare')
  and title = 'Șah, șah-mat și remiză';

insert into public.lessons
  (course_id, title, order_index, lesson_type, is_premium, duration_minutes, theory_html, exercises)
select
  c.id,
  'Promovarea pionului',
  10,
  'rules',
  false,
  5,
  '<p>Pionul ajuns pe ultimul rând nu se opreşte acolo: <strong>se promovează</strong>. Alegi tu ce devine — regină, tură, nebun sau cal — şi nu contează ce piese ai pierdut până atunci. Poţi ajunge cu două regine pe tablă.</p><p>De obicei se alege regina, fiindcă e cea mai puternică. Dar nu întotdeauna: uneori un cal, care sare altfel decât toate, face exact ce nu poate face regina.</p>',
  '[
    {
      "fen": "8/4P3/8/8/8/8/8/8 w - - 0 1",
      "type": "move_piece",
      "instruction": "Promovează pionul — mută-l pe e8, apoi alege ce piesă devine",
      "correct_move": "e7e8q",
      "any_promotion": true
    },
    {
      "fen": "1r6/1P4P1/8/8/7k/8/8/7K w - - 0 1",
      "type": "move_piece",
      "instruction": "Doar unul dintre pioni poate ajunge la capăt — celălalt e blocat de turn. Promovează-l pe cel liber",
      "correct_move": "g7g8q",
      "any_promotion": true
    },
    {
      "fen": "8/2k1P1q1/8/8/8/8/8/7K w - - 0 1",
      "type": "move_piece",
      "instruction": "Aici o regină în plus nu schimbă nimic. Promovează pe e8 în piesa care dă şah regelui negru şi atacă în acelaşi timp regina lui",
      "correct_move": "e7e8n"
    }
  ]'::jsonb
from public.courses c
where c.slug = 'piese-in-miscare'
  and not exists (
    select 1 from public.lessons l
    where l.course_id = c.id and l.title = 'Promovarea pionului'
  );

-- Numărul de lecţii se ia din lecţii, nu se scrie de mână: aşa nu poate rămâne
-- în urmă dacă se mai adaugă vreuna.
update public.courses c
set lesson_count = (select count(*) from public.lessons l where l.course_id = c.id)
where c.slug = 'piese-in-miscare';


-- ============================================================
-- Dovada
-- ============================================================
select l.order_index, l.title, jsonb_array_length(l.exercises) as exercitii
from public.lessons l
join public.courses c on c.id = l.course_id
where c.slug = 'piese-in-miscare'
order by l.order_index;
