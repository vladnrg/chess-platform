-- ============================================================
-- Promovarea pionului: teoria de sus iese, explicaţia vine la momentul ei
-- ============================================================
-- Lecţia începea cu două paragrafe care spuneau tot: că alegi ce devine pionul,
-- că de obicei se alege regina, că trebuie să ajungi la timp şi că pătratul de
-- promovare trebuie să fie apărat. Adică toată poanta celor trei exerciţii,
-- scrisă înainte ca omul să vadă prima poziţie. Iar cerinţele paşilor spun
-- oricum aceleaşi lucruri, la locul lor: „alege ce devine" chiar când pionul
-- ajunge pe e8, „nimeni nu apără g8" chiar când regele negru stă lângă pătrat.
-- Deci textul de sus nu adăuga nimic — doar dubla ce urma, şi împingea tabla în
-- jos.
--
-- În locul lui rămâne o singură propoziţie, şi nu la început: apare abia după
-- ce botul mută regele, fiindcă abia atunci înseamnă ceva. Vine cu un
-- dreptunghi galben pe tablă, c6:g8 — pătratul din faţa pionului de pe e6.
-- Regele negru ajunge pe g4, adică în afara lui, şi de-acolo nu mai are cum
-- să prindă pionul, oricât ar alerga. Regula asta se învaţă numărând pătrate,
-- iar un copil nu numără din proprie iniţiativă; desenată, se vede.
--
-- Poziţiile şi mutările rămân neatinse — sunt cele verificate cu Stockfish la
-- migrarea 102. Se schimbă doar textele: teoria dispare, introducerea primului
-- exerciţiu nu mai spune dinainte că regele e prea departe (asta e chiar
-- lucrul de descoperit), iar pasul întâi capătă comentariul şi zona.
--
-- Din aceeaşi socoteală, cerinţa pasului doi rămâne doar „împinge pionul pe e7":
-- „regele aleargă după el, dar nu ajunge la timp" stătea deasupra unei table sub
-- care scrie acum acelaşi lucru, spus mai exact. Cerinţa cere, comentariul
-- explică — fiecare face un singur lucru.

update public.lessons
set
  theory_html = null,
  exercises = '[
    {
      "fen": "8/8/8/4P3/8/7k/1K6/8 w - - 0 1",
      "type": "move_piece",
      "instruction": "Pionul tău e la mijlocul tablei, iar regele negru pleacă după el. Du-l până la capăt.",
      "line": [
        {
          "move": "e5e6",
          "instruction": "Împinge pionul pe e6.",
          "reply": "h3g4",
          "comentariu": "Regele încearcă să îl prindă din urmă, dar nu are nicio șansă să îl ajungă, fiindcă nu se află în locul potrivit.",
          "zona": "c6:g8"
        },
        {
          "move": "e6e7",
          "instruction": "Împinge pionul pe e7.",
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
-- Dovada: trebuie să iasă gol, 1, c6:g8, 3
-- ============================================================
-- Teoria de sus nu mai există; un singur pas din toată lecţia are comentariu, şi
-- e cel de după care botul mută regele pe g4; dreptunghiul lui e c6:g8; iar cele
-- trei exerciţii au rămas neatinse, tot cu trei paşi fiecare.
select
  coalesce(theory_html, '(gol)')                                           as "teoria_de_sus",
  (select count(*) from jsonb_array_elements(exercises) e,
          jsonb_array_elements(e->'line') p
     where p ? 'comentariu')                                               as "pasi_cu_comentariu",
  (select string_agg(p->>'zona', ', ') from jsonb_array_elements(exercises) e,
          jsonb_array_elements(e->'line') p
     where p ? 'zona')                                                     as "zona_aratata",
  (select count(*) from jsonb_array_elements(exercises) e
     where jsonb_array_length(e->'line') = 3)                              as "exercitii_cu_trei_pasi"
from public.lessons
where title = 'Promovarea pionului';
