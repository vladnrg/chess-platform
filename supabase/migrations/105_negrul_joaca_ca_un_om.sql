-- ============================================================
-- Adversarul joacă mutări de om, iar mutările se scriu la prezent
-- ============================================================
-- Două lucruri, amândouă despre cum se poartă tabla cu elevul.
--
-- 1. CURSA PIONILOR. Exerciţiul 2 din „Promovarea pionului" îşi spunea singur
--    povestea: „amândoi alergaţi spre capăt, dacă pierzi o singură mutare,
--    pionul negru de pe b4 ajunge înaintea ta". Iar negrul... îşi plimba regele.
--    1.g6 Ra7 2.g7 Rb6 — pionul lui n-a plecat niciodată de pe b4. Nu exista
--    nicio cursă: albul câştiga fiindcă adversarul făcea gafă după gafă, şi
--    exact asta învăţa elevul.
--
--    Verificat cu Stockfish la adâncimea 26: în cursa adevărată, 1.g6 b3 2.g7 b2
--    3.g8=D, promovarea vine CU ŞAH pe rândul opt (regele negru stă pe a8), deci
--    negrul trebuie să răspundă la şah şi nu mai apucă să promoveze — dama ia
--    pionul de pe b2 la mutarea următoare. Ăsta e chiar motivul pentru care albul
--    câştigă cursa, şi acum se vede pe tablă. La pasul doi, b3-b2 e şi prima
--    alegere a motorului (mat în −14, faţă de −12 pentru mutările de rege): pionul
--    care aleargă rezistă mai mult decât regele care se plimbă.
--
--    Tot din aceeaşi socoteală, la exerciţiul 1 regele negru merge acum pe f5, nu
--    pe g5: la adâncimea 28 toate mutările sunt mat în −9, deci alegerea e liberă,
--    iar f5 e cea pe care ar face-o un om — merge drept spre pătratul unde apare
--    dama, nu pieziş pe lângă el.
--
-- 2. PREZENTUL. „Negrul tocmai a mutat regele de pe a8 pe b7" pune între elev şi
--    tablă o mutare terminată şi dusă, când el se uită chiar atunci cum se face.
--    Se scrie „negrul tocmai mută". Rândul de deasupra tablei e în cod; aici sunt
--    cele patru locuri din conţinut care spuneau acelaşi lucru la trecut.
--    Restul perfectelor compuse din cursuri rămân: „albul a împins trei pioni"
--    povesteşte cum s-a ajuns la poziţie, şi acolo trecutul e forma potrivită.

-- ------------------------------------------------------------
-- 1. Cursa pionilor: negrul îşi împinge pionul
-- ------------------------------------------------------------
update public.lessons
set exercises = '[
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
          "reply": "g4f5"
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
          "reply": "b4b3",
          "comentariu": "Și pionul lui pleacă la drum. Amândoi mai aveți două împingeri până la capăt — dar tu muți primul, și asta decide cursa."
        },
        {
          "move": "g6g7",
          "instruction": "Împinge-l pe g7.",
          "reply": "b3b2"
        },
        {
          "move": "g7g8q",
          "instruction": "Mută pionul pe g8 și alege dama. Ea apare cu șah pe rândul opt — regele negru e obligat să răspundă, așa că nu mai apucă să-și promoveze pionul."
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


-- ------------------------------------------------------------
-- 2. „Tocmai a mutat" → „tocmai mută", în cele patru locuri
-- ------------------------------------------------------------
-- Căutarea se face cu un punct în locul lui „ş": conţinutul are şi ş cu sedilă,
-- şi ș cu virgulă, iar înlocuirile de mai jos ocolesc litera cu totul.
update public.lessons
set exercises = replace(exercises::text, 'tocmai a împins', 'tocmai împinge')::jsonb
where exercises::text like '%tocmai a împins%';

update public.middlegame_plans
set structure = regexp_replace(structure, 'tocmai .i-a împins', 'tocmai împinge')
where structure ~ 'tocmai .i-a împins';

update public.opening_traps
set explanation = replace(explanation, 'tocmai a luat', 'tocmai ia')
where explanation like '%tocmai a luat%';

update public.opening_traps
set explanation = regexp_replace(explanation, 'tocmai .i-a mutat', 'tocmai mută')
where explanation ~ 'tocmai .i-a mutat';


-- ============================================================
-- Dovada: trebuie să iasă b4b3, b3b2, g4f5, 2 comentarii, 0 trecuturi
-- ============================================================
-- Negrul îşi împinge pionul la amândoi paşii cursei; regele din exerciţiul 1
-- merge pe f5; două dintre cele nouă mutări ale lecţiei au acum un comentariu;
-- iar „tocmai a …" nu mai apare nicăieri în conţinut.
select
  exercises->1->'line'->0->>'reply'                                         as "cursa_pas_1",
  exercises->1->'line'->1->>'reply'                                         as "cursa_pas_2",
  exercises->0->'line'->1->>'reply'                                         as "regele_din_ex_1",
  (select count(*) from jsonb_array_elements(exercises) e,
          jsonb_array_elements(e->'line') p
    where p ? 'comentariu')                                                 as "pasi_cu_comentariu"
from public.lessons
where title = 'Promovarea pionului';

select
  (select count(*) from public.lessons
    where exercises::text ~ 'tocmai (.i-)?(a|au) (mutat|împins|jucat|luat)')    as "in_lectii",
  (select count(*) from public.middlegame_plans
    where structure ~ 'tocmai (.i-)?(a|au) (mutat|împins|jucat|luat)')          as "in_planuri",
  (select count(*) from public.opening_traps
    where explanation ~ 'tocmai (.i-)?(a|au) (mutat|împins|jucat|luat)')        as "in_capcane";
