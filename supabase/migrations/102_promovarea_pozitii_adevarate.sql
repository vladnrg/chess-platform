-- ============================================================
-- Promovarea pionului: trei poziţii în care promovarea chiar câştigă
-- ============================================================
-- Toate cele trei exerciţii de dinainte aveau pionul deja pe rândul şapte, la o
-- singură mutare de capăt. Poziţia iese aşezată cu mâna, nu jucată — şi la două
-- din trei ieşea şi greşită. Verificat cu Stockfish, la adâncime 24:
--
--   1. „8/4P3/8/8/8/8/8/8" — o tablă fără regi. Nu e o poziţie de şah, e un
--      desen; motorul nici n-o primeşte.
--
--   2. „1r6/1P4P1/8/8/7k/8/8/7K" — cerinţa era „promovează-l pe cel liber".
--      Evaluarea poziţiei: −4,23 pentru alb, iar cea mai bună mutare nici măcar
--      nu e promovarea. După g8=D urmează Txg8: tura de pe b8 ţine tot rândul
--      opt, deci amândouă pătratele de promovare. Copilul făcea exact mutarea
--      cerută şi dădea dama pe degeaba.
--
--   3. „8/2k1P1q1/8/8/8/8/8/7K" — promovarea în cal dă şah şi atacă regina, dar
--      după ce o câştigă rămâne rege şi cal contra rege, adică remiză. Motorul:
--      0,00 şi cu dama, şi cu calul. „Alegerea contează" nu se vedea nicăieri.
--
-- Cele trei poziţii noi pornesc cu pionul de la mijlocul tablei şi se joacă în
-- câte trei mutări, cu răspunsurile negrului între ele — chiar cele pe care le
-- dă motorul, nu unele alese să iasă bine.
--
--   1. „8/8/8/4P3/8/7k/1K6/8"  1.e6! mat în 11. Regele negru aleargă degeaba.
--   2. „k7/8/8/6P1/1p6/8/7K/8" 1.g6! +7,70 — şi e singura mutare care câştigă:
--      orice altceva e 0,00, fiindcă atunci pionul negru de pe b4 ajunge primul.
--   3. „6k1/8/5KP1/8/8/8/8/8"  1.g7! mat în 5, iar la mutarea a doua promovarea
--      e o greşeală: pătratul g8 nu e apărat de nimeni, iar regele negru de pe
--      h7 ia noua piesă. Verificat: g8=D, g8=T, g8=C şi g8=N dau toate 0,00.
--      Întâi 2.Rf7, care apără g8, şi abia apoi dama.

update public.lessons
set
  theory_html = '<p>Pionul ajuns pe ultimul rând nu se oprește acolo: <strong>se promovează</strong>. Alegi tu ce devine — regină, tură, nebun sau cal — și nu contează ce piese ai pierdut până atunci. Poți ajunge cu două regine pe tablă.</p><p>De obicei se alege regina, fiindcă e cea mai puternică. Dar nu e de ajuns să alegi bine: trebuie să și <strong>ajungi acolo la timp</strong>, iar pătratul pe care apare noua piesă trebuie să fie <strong>apărat</strong> — altfel regele advers o ia pe loc și ai împins pionul degeaba.</p>',
  exercises = '[
    {
      "fen": "8/8/8/4P3/8/7k/1K6/8 w - - 0 1",
      "type": "move_piece",
      "instruction": "Pionul tău e la mijlocul tablei, iar regele negru e prea departe ca să-l prindă. Du-l până la capăt.",
      "line": [
        {
          "move": "e5e6",
          "instruction": "Împinge pionul pe e6.",
          "reply": "h3g4"
        },
        {
          "move": "e6e7",
          "instruction": "Regele negru aleargă după el, dar nu ajunge la timp. Împinge pionul pe e7.",
          "reply": "g4g5"
        },
        {
          "move": "e7e8q",
          "instruction": "Ultimul pas: mută pionul pe e8. Când ajunge, alege ce devine — aici alege dama."
        }
      ]
    },
    {
      "fen": "k7/8/8/6P1/1p6/8/7K/8 w - - 0 1",
      "type": "move_piece",
      "instruction": "Amândoi aveți câte un pion și amândoi alergați spre capăt. Tu muți primul — dacă pierzi o singură mutare, pionul negru de pe b4 ajunge înaintea ta.",
      "line": [
        {
          "move": "g5g6",
          "instruction": "Nu muta regele, nu ai timp de pierdut. Împinge pionul pe g6.",
          "reply": "a8b7"
        },
        {
          "move": "g6g7",
          "instruction": "Regele negru vine spre pionul tău, dar a plecat prea târziu. Împinge-l pe g7.",
          "reply": "b7b6"
        },
        {
          "move": "g7g8q",
          "instruction": "Mută pionul pe g8 și alege dama — cu ea vei opri și pionul lui."
        }
      ]
    },
    {
      "fen": "6k1/8/5KP1/8/8/8/8/8 w - - 0 1",
      "type": "move_piece",
      "instruction": "Aici pionul ajunge sigur la capăt. Greu e să alegi momentul: pătratul pe care apare dama trebuie să fie apărat.",
      "line": [
        {
          "move": "g6g7",
          "instruction": "Împinge pionul pe g7.",
          "reply": "g8h7"
        },
        {
          "move": "f6f7",
          "instruction": "Dacă promovezi acum, regele negru ia noua piesă de pe g8 — nimeni nu apără pătratul acela. Mută întâi regele pe f7.",
          "reply": "h7h6"
        },
        {
          "move": "g7g8q",
          "instruction": "Acum g8 e apărat de regele tău. Mută pionul pe g8 și alege dama."
        }
      ]
    }
  ]'::jsonb
where title = 'Promovarea pionului';


-- ============================================================
-- Dovada: trebuie să iasă 3, 3, 0, 3
-- ============================================================
-- Trei exerciţii; toate trei se joacă în mai multe mutări; niciunul nu mai are
-- pionul pornit de pe rândul şapte; şi toate trei se termină cu o promovare.
select
  jsonb_array_length(exercises)                                            as "cate_exercitii",
  (select count(*) from jsonb_array_elements(exercises) e
     where jsonb_array_length(e->'line') = 3)                              as "cu_trei_pasi",
  (select count(*) from jsonb_array_elements(exercises) e
     where split_part(e->>'fen', '/', 2) like '%P%')                       as "pion_pe_randul_sapte",
  (select count(*) from jsonb_array_elements(exercises) e
     where e->'line'->-1->>'move' ~ '8q$')                                 as "se_termina_cu_dama"
from public.lessons
where title = 'Promovarea pionului';
