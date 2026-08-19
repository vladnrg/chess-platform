-- ============================================================
-- En passant: patru poziţii diferite, nu aceeaşi de trei ori
-- ============================================================
-- Toate trei exerciţiile porneau din aceeaşi imagine: cele 32 de piese aşezate
-- ca la începutul partidei, cu doi pioni mutaţi. Chiar dacă a doua era altceva
-- (captura negrului), ochiul vedea de fiecare dată acelaşi tablou, iar regula
-- părea legată de deschidere.
--
-- Cele trei poziţii noi vin din banca de puzzle-uri a platformei, adică din
-- partide jucate pe Lichess. Le-am găsit trecând fiecare puzzle prin chess.js,
-- mutare cu mutare, şi păstrând poziţiile în care o captură en passant era
-- posibilă. Din şase găsite, sunt alese cele mai deosebite între ele.
--
-- În fiecare, en passant e SINGURA captură de felul ăsta posibilă — deci nu se
-- poate nimeri altceva din greşeală.

update public.lessons
set exercises = '[
  {
    "fen": "rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3",
    "type": "move_piece",
    "instruction": "Trage pionul tău de pe e5 pe d6",
    "correct_move": "e5d6"
  },
  {
    "fen": "8/1p6/8/3kp2p/4p1pP/4K1P1/PP4P1/8 b - h3 0 36",
    "type": "move_piece",
    "instruction": "Final de partidă, doar cu pioni și regi. Albul tocmai a împins pionul de pe h2 pe h4 — trage pionul tău de pe g4 pe h3",
    "correct_move": "g4h3"
  },
  {
    "fen": "6k1/1r2r2p/1p2p1p1/p1p2pPq/2Pp1PR1/P5Q1/1P1K3P/7R w - f6 0 29",
    "type": "move_piece",
    "instruction": "Tablă plină, aceeași regulă: negrul tocmai a împins pionul de pe f7 pe f5 — trage pionul tău de pe g5 pe f6",
    "correct_move": "g5f6"
  },
  {
    "fen": "8/5pk1/8/4p2P/1Pp5/2P5/K7/8 b - b3 0 38",
    "type": "identify_square",
    "square": "b3",
    "options": ["a3", "b3", "b4", "c3"],
    "instruction": "Albul tocmai a împins pionul de pe b2 pe b4. Pionul negru de pe c4 îl ia en passant — pe ce pătrat ajunge?"
  }
]'::jsonb
where title = 'En passant';


-- ============================================================
-- Dovada
-- ============================================================
-- Patru exerciţii, patru poziţii distincte, şi niciuna nu mai e cea de deschidere
-- în afară de prima.
select
  jsonb_array_length(exercises)                                              as "cate_exercitii",
  (select count(distinct e->>'fen') from jsonb_array_elements(exercises) e)  as "pozitii_distincte",
  (select count(*) from jsonb_array_elements(exercises) e
     where e->>'fen' like 'rnbqkbnr%')                                       as "din_pozitia_de_start"
from public.lessons
where title = 'En passant';
