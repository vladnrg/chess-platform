-- ============================================================
-- En passant: capturi care câştigă, nu capturi care pierd
-- ============================================================
-- Găsite cu verificarea nouă `scripts/verificari/mutari-cu-motorul.mjs`, care
-- trece fiecare mutare cerută de o lecţie prin Stockfish. Două din cele trei
-- capturi en passant din lecţie schimbau rezultatul partidei în rău:
--
--   „8/1p6/8/3kp2p/4p1pP/4K1P1/PP4P1/8 b - h3" — cerinţa: g4xh3.
--      Înainte de mutare negrul stă +1,83; după captură, −4,61. Cea mai bună
--      mutare era b7-b5, care câştigă. Copilul făcea mutarea cerută şi pierdea.
--
--   „6k1/1r2r2p/1p2p1p1/p1p2pPq/2Pp1PR1/P5Q1/1P1K3P/7R w - f6" — cerinţa: g5xf6.
--      +3,14 înainte, −0,65 după. Un câştig dat pe o poziţie egală.
--
-- Poziţiile au venit din migrarea 098, care căutase în banca de puzzle-uri
-- locuri unde en passant e *posibil*. Asta nu e acelaşi lucru cu *bun*. Aceeaşi
-- bancă, aceeaşi căutare, dar cu motorul pus să spună şi dacă mutarea e bună,
-- a scos exact două poziţii care trec proba — şi sunt mai bune decât ce era:
--
--   „8/8/5ppp/1kpP4/p2K1PPP/P7/8/8 w - c6" — d5xc6 e.p. e SINGURA mutare care
--      câştigă: +4,32, iar orice altceva e 0,00. Final numai de pioni, doişpe
--      piese pe tablă, se citeşte dintr-o privire.
--
--   „5rk1/2p3b1/3p4/P3qrB1/1PP1pPQ1/7P/7K/2R2R2 b - f3" — e4xf3 e.p. dă +5,65,
--      iar celelalte mutări sunt −3,48 şi mai rău. Aici captura nu e o
--      curiozitate, e diferenţa dintre a câştiga şi a pierde.
--
-- Verificat la adâncime 22. Exerciţiul 1 (poziţia de deschidere) şi cel cu
-- întrebarea rămân — la amândouă captura en passant e mutarea cea mai bună.

update public.lessons
set exercises = '[
  {
    "fen": "rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3",
    "type": "move_piece",
    "instruction": "Mută pionul tău de pe e5 pe d6",
    "correct_move": "e5d6"
  },
  {
    "fen": "8/8/5ppp/1kpP4/p2K1PPP/P7/8/8 w - c6 0 41",
    "type": "move_piece",
    "instruction": "Final numai de pioni. Aici en passant nu e o curiozitate: e singura mutare care câștigă partida — orice altceva se termină remiză. Mută pionul tău de pe d5 pe c6",
    "correct_move": "d5c6"
  },
  {
    "fen": "5rk1/2p3b1/3p4/P3qrB1/1PP1pPQ1/7P/7K/2R2R2 b - f3 0 37",
    "type": "move_piece",
    "instruction": "Tablă plină, aceeași regulă. Albul tocmai a împins pionul cu două pătrate ca să scape de al tău — dar exact asta îi permite lui să fie luat. Mută pionul tău de pe e4 pe f3",
    "correct_move": "e4f3"
  },
  {
    "fen": "8/5pk1/8/4p2P/1Pp5/2P5/K7/8 b - b3 0 38",
    "type": "identify_square",
    "square": "b3",
    "options": ["a3", "b3", "b4", "c3"],
    "instruction": "Pionul negru de pe c4 îl ia en passant — pe ce pătrat ajunge?"
  }
]'::jsonb
where title = 'En passant';


-- ============================================================
-- Dovada: trebuie să iasă 4, 4, 0
-- ============================================================
-- Patru exerciţii; toate patru au încă în FEN câmpul de en passant, din care se
-- deduce mutarea arătată pe tablă; şi niciuna dintre cele două poziţii scoase
-- nu mai e acolo.
select
  jsonb_array_length(exercises)                                          as "cate_exercitii",
  (select count(*) from jsonb_array_elements(exercises) e
     where split_part(e->>'fen', ' ', 4) <> '-')                         as "cu_ultima_mutare",
  (select count(*) from jsonb_array_elements(exercises) e
     where e->>'fen' like '8/1p6/8/3kp2p%' or e->>'fen' like '6k1/1r2r2p%')
                                                                         as "pozitiile_scoase"
from public.lessons
where title = 'En passant';
