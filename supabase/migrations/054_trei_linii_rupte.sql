-- ============================================================
-- Încă trei lecţii care se opreau la jumătate
-- ============================================================
-- Spre deosebire de cele reparate în 052, aici mutarea scrisă nu era doar
-- prost tastată — era imposibilă în principiu, deci trebuia hotărât ce se
-- joacă în locul ei. Cozile sunt înlocuite cu linii verificate cu Stockfish
-- la adâncime 18.
--
--   Gambitul Regelui / C   se rupea la semi-mutarea 13: „Cf6" cu calul de pe
--                          e4, care era însă ţintuit de dama albă de pe e2.
--                          Mutarea nu doar că era proastă — era ilegală.
--   Apărarea Pirc / B      se rupea la 16: calul voia pe e2, unde stătea deja
--                          nebunul alb. Textul spunea „calul se retrage", iar
--                          retragerea aleasă acum e Ca4.
--   Nimzo-Indian / C       se rupea la 14: un pion de pe c3 voia să ia pe d4,
--                          unde stătea propriul pion alb. Textul de acolo
--                          descria o mutare a negrului, deşi era rândul albului.
--
-- Evaluările după reparare, din perspectiva celui care învaţă cursul:
--   Gambitul Regelui / C   +0,44 pentru alb — linie sănătoasă
--   Apărarea Pirc / B      +2,21 pentru negru
--   Nimzo-Indian / C       −0,38 pentru negru — normal pentru Nimzo
--
-- Despre Pirc: +2,21 e mult, şi vine din faptul că albul joacă în linia asta
-- slab încă dinainte de ruptură. Nu e o greşeală care să strice ceva pentru
-- cel care învaţă, dar e o linie care îl arată pe adversar mai neajutorat
-- decât e. Merită revăzută separat, când ajungem la conţinutul cursului.
-- ============================================================

-- ------------------------------------------------------------
-- Gambitul Regelui / C — Falkbeer
-- ------------------------------------------------------------
select public.repara_linie('kings-gambit', 'C',
  'e2e4 e7e5 f2f4 d7d5 e4d5 e5e4 d2d3 g8f6 d3e4 f6e4 g1f3 f8c5 d1e2 c8f5 b1c3 d8e7 c1e3 c5e3 e2e3');

update public.opening_lines l
   set move_explanations = l.move_explanations || '{
  "12": "De2 — dama pe e2 ţintuieşte calul negru de pe e4. De acum înainte, calul acela nu mai poate pleca de acolo.",
  "13": "Negrul îşi scoate nebunul pe f5, ca să-şi mai apere o dată calul ţintuit.",
  "14": "Cc3 — ataci calul a treia oară. Negrul e legat de apărarea lui şi nu apucă să facă altceva.",
  "15": "Negrul îşi aduce dama pe e7, ca să iasă din ţintuire.",
  "16": "Ne3 — îţi termini dezvoltarea şi propui schimbul nebunilor.",
  "17": "Negrul acceptă schimbul.",
  "18": "Dxe3 — reiei cu dama. Ai dezvoltarea terminată, regele negru încă în centru, şi un pion în plus pe d5."
}'::jsonb
  from public.courses c
 where l.course_id = c.id and c.slug = 'kings-gambit' and l.variation_code = 'C';


-- ------------------------------------------------------------
-- Apărarea Pirc / B — Atacul Austrian
-- ------------------------------------------------------------
select public.repara_linie('pirc-defense', 'B',
  'e2e4 d7d6 d2d4 g8f6 b1c3 g7g6 f2f4 f8g7 g1f3 e8g8 f1e2 c7c5 d4d5 b7b5 c1e3 b5b4 c3a4 d8a5 a4c5 d6c5');

update public.opening_lines l
   set move_explanations = l.move_explanations || '{
  "16": "Calul alb nu poate merge pe e2, unde stă deja nebunul lui, deci se duce pe a4 — la marginea tablei, unde face mult mai puţin.",
  "17": "Da5 — dama iese cu şah pe diagonală şi loveşte calul rămas singur pe a4. Ai câştigat un tempo şi ai pus o piesă în pericol.",
  "18": "Albul ia pe c5, singura cale de a-şi salva calul.",
  "19": "dxc5 — reiei. Ai flancul damei deschis, doi pioni legaţi în centru şi nebunul de g7 care priveşte de-a lungul diagonalei lungi."
}'::jsonb
  from public.courses c
 where l.course_id = c.id and c.slug = 'pirc-defense' and l.variation_code = 'B';


-- ------------------------------------------------------------
-- Nimzo-Indian / C — Sämisch
-- ------------------------------------------------------------
select public.repara_linie('nimzo-indian-defense', 'C',
  'd2d4 g8f6 c2c4 e7e6 b1c3 f8b4 a2a3 b4c3 b2c3 c7c5 f2f3 d7d5 c4d5 f6d5 d4c5 f7f5 g1h3 e8g8 h3f4');

update public.opening_lines l
   set move_explanations = l.move_explanations || '{
  "14": "Albul ia pe c5 şi îţi lasă un pion în plus pe flancul damei — dar şi pionii lui dublaţi de pe coloana c, care rămân acolo toată partida.",
  "15": "f5 — îi tai pionului de e4 câmpul pe care se pregătea de trei mutări. Toată ideea albului cu f3 a fost să joace e4; acum n-o mai poate face.",
  "16": "Albul îşi dezvoltă calul pe margine, fiindcă f3 e ocupat de propriul pion.",
  "17": "Rocada. Regele la adăpost, iar tu ai un plan limpede: presiune pe pionii dublaţi de pe c.",
  "18": "Albul îşi aduce calul de pe h3 în joc, prin f4."
}'::jsonb
  from public.courses c
 where l.course_id = c.id and c.slug = 'nimzo-indian-defense' and l.variation_code = 'C';


-- Verificare, după rulare: toate trei liniile trebuie să se joace până la
-- ultima semi-mutare, fără nicio mutare imposibilă.
