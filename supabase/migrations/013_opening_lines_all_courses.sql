-- Migration 013: Opening lines + move explanations for remaining 15 courses

-- ============================================================
-- RUY LOPEZ
-- ============================================================
INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Varianta Berlin — Finalul Berlin', 'A', 35.0, 1, 'white',
  'e2e4 e7e5 g1f3 b8c6 f1b5 g8f6 e1g1 f6e4 d2d4 e4d6 b5c6 d7c6 d4e5 d6f5 d1d8 e8d8 b1c3 h7h6 h2h3 c8d7'
FROM public.courses WHERE slug = 'ruy-lopez';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Varianta Închisă — a6, d6, b5', 'B', 40.0, 2, 'white',
  'e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 g8f6 e1g1 f8e7 f1e1 b7b5 a4b3 d7d6 c2c3 e8g8 h2h3 b8a5 b3c2 c7c5'
FROM public.courses WHERE slug = 'ruy-lopez';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Varianta Deschisă — exd4, d5', 'C', 15.0, 3, 'white',
  'e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 g8f6 e1g1 f6e4 d2d4 b7b5 a4b3 d7d5 d4e5 c8e6 c2c3 f8e7 c1e3'
FROM public.courses WHERE slug = 'ruy-lopez';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'e4 — deschiderea centrală clasică, cea mai jucată primă mutare în lume.',
  '2', 'Cf3 — atacă e5 și dezvoltă calul pe cel mai bun câmp.',
  '4', 'Fb5 — Ruy Lopez! Nebunul pune presiune pe calul de pe c6 care apără e5.',
  '6', 'Rocadă — regele la adăpost. Acum ameninți să câștigi e5 după Fxc6 și Cxe5.',
  '8', 'd4 — centrul explodează! Alb câștigă spațiu și deschide jocul.',
  '10', 'Fxc6 — schimbi nebunul pe cal, dublând pionii adversarului pe coloana c.',
  '12', 'dxe5 — câștigă un pion central. Finalul Berlin e favorabil albului pe termen lung.',
  '14', 'Dxd8+ — schimbi damele, intri în finalul Berlin. Piesele grele dispar!',
  '16', 'Cc3 — centrul este activ, avantajul structural este clar.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'ruy-lopez') AND variation_code = 'A';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'e4 — deschidere deschisă. Spaniolă se remarcă prin profunzime strategică.',
  '4', 'Fb5 — Ruy Lopez. Presiune indirectă pe e5 prin atacul apărătorului său, Cc6.',
  '5', 'a6 — varianta Morphy! Black cere explicit intenția albului cu nebunul.',
  '6', 'Fa4 — nebunul se retrage, menținând presiunea. Dacă Fxc6 acum, negrul recaptează confortabil.',
  '8', 'Rocadă — regele la adăpost. Planul clasic în varianta închisă.',
  '10', 'Te1 — turnul susține pionul de pe e4 care va fi atacat în continuare.',
  '12', 'Fb3 — nebunul se retrage pe o diagonală mai sigură, vizând f7.',
  '14', 'c3 — pregătești d4 pentru a construi un centru puternic.',
  '16', 'h3 — previi Cg4 care ar da schimb pe nebunul din f3.',
  '18', 'Fc2 — nebunul revine activ. Planul clasic: d4, Cbd2, Cf1-e3.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'ruy-lopez') AND variation_code = 'B';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'e4 — centrul deschis favorizează jocul combinativ spaniol.',
  '9', 'Cxe4 — varianta deschisă! Negrul capturează pionul sacrificat de alb.',
  '10', 'd4 — centrul alb devine activ imediat.',
  '11', 'b5 — negrul câștigă spațiu pe flancul damei, împingând nebunul înapoi.',
  '12', 'Fb3 — nebunul se retrage, menținând controlul pe f7.',
  '13', 'd5 — negrul contraatacă în centru! Joc complicat și dinamic.',
  '14', 'dxe5 — alb câștigă un pion dar trebuie să fie atent la contra-jocul negrul.',
  '16', 'c3 — pregătești d4 pentru a consolida centrul.',
  '18', 'Fe3 — nebunul ocupă o diagonală activă, vizând d4 și b6.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'ruy-lopez') AND variation_code = 'C';

-- ============================================================
-- GAMBITUL DAMEI
-- ============================================================
INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Gambitul Damei Respins — Ortodox (e6)', 'A', 45.0, 1, 'white',
  'd2d4 d7d5 c2c4 e7e6 b1c3 g8f6 c1g5 f8e7 e2e3 e8g8 g1f3 b8d7 a1c1 c7c6 f1d3 d5c4 d3c4 f6d5 c4e7 d8e7'
FROM public.courses WHERE slug = 'queens-gambit';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Gambitul Damei Acceptat (dxc4)', 'B', 30.0, 2, 'white',
  'd2d4 d7d5 c2c4 d5c4 g1f3 g8f6 e2e3 e7e6 f1c4 c7c5 e1g1 a7a6 c4b3 b8c6 b1c3 b7b5 d4d5 c6e5 f3e5'
FROM public.courses WHERE slug = 'queens-gambit';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Apărarea Slavă (c6, dxc4)', 'C', 25.0, 3, 'white',
  'd2d4 d7d5 c2c4 c7c6 g1f3 g8f6 b1c3 d5c4 a2a4 c8f5 e2e3 e7e6 f1c4 f8b4 e1g1 e8g8 d1e2 b8d7 e3e4'
FROM public.courses WHERE slug = 'queens-gambit';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'd4 — controlezi centrul cu pionul damei. Gambitul Damei este cea mai solidă deschidere cu 1.d4.',
  '2', 'c4 — gambitul! Oferi un pion pentru avantaj de dezvoltare și centru.',
  '3', 'e6 — negrul refuză gambitul și construiește o structură solidă.',
  '6', 'Fg5 — pin pe calul de pe f6 care apăra d5. Presiune psihologică și tactică.',
  '8', 'e3 — susții centrul, deschizi drumul pentru Fd3.',
  '10', 'Cf3 — cal dezvoltat, se pregătesc turnurile.',
  '12', 'Tc1 — turnul pe coloana c, presiune latentă pe c6.',
  '14', 'Fd3 — nebunul vizează h7 după rocada adversă.',
  '16', 'dxc4 — negrul schimbă în centru. Alb recapturează cu nebunul.',
  '18', 'Fxc4 — recuperezi pionul cu nebunul activ pe c4. Structura clasică QGD.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'queens-gambit') AND variation_code = 'A';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'd4 — centrul damei.',
  '3', 'dxc4 — negrul acceptă gambitul! Preia pionul, dar cedează centrul.',
  '4', 'Cf3 — dezvoltare rapidă, presiune pe centru.',
  '6', 'e3 — deschizi drumul pentru Fxc4 și recuperezi pionul.',
  '8', 'Fxc4 — nebunul recuperează pionul, vizând f7.',
  '9', 'c5 — negrul contraatacă imediat centrul.',
  '10', 'Rocadă — regele la adăpost, pregătire pentru joc central.',
  '12', 'Fb3 — nebunul se retrage, menținând presiunea pe d5.',
  '14', 'Cc3 — centrul este activ cu ambii cai dezvoltați.',
  '16', 'd5 — înaintare centrală decisivă! Alb câștigă spațiu major.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'queens-gambit') AND variation_code = 'B';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'd4 — deschidere clasică cu pionul damei.',
  '3', 'c6 — Apărarea Slavă! Negrul susține d5 cu pionul c, fără a bloca nebunul de pe c8.',
  '6', 'dxc4 — negrul acceptă gambitul în varianta slavă.',
  '7', 'a4 — previi b5 care ar apăra pionul de pe c4. Mutare cheie în slavă!',
  '8', 'Ff5 — nebunul iese liber înainte de e6. Asta este forța apărării slave!',
  '10', 'e3 — consolidezi centrul și deschizi Fc4.',
  '12', 'Fc4 — recuperezi pionul, nebunul activ pe c4.',
  '13', 'Fb4 — pin pe calul de pe c3! Negrul creează complicații.',
  '16', 'De2 — pregătești e4 central. Jocul devine dinamic.',
  '18', 'e4 — centrul explodează! Alb câștigă spațiu decisiv.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'queens-gambit') AND variation_code = 'C';

-- ============================================================
-- DESCHIDEREA CATALANĂ
-- ============================================================
INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Catalană Deschisă — dxc4', 'A', 40.0, 1, 'white',
  'd2d4 g8f6 c2c4 e7e6 g2g3 d7d5 f1g2 d5c4 g1f3 a7a6 e1g1 b8c6 d1a4 c8d7 a4c4 b7b5 c4d3 f8b4 c1g5'
FROM public.courses WHERE slug = 'catalan-opening';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Catalană Închisă — Fe7, rocadă', 'B', 35.0, 2, 'white',
  'd2d4 g8f6 c2c4 e7e6 g2g3 d7d5 f1g2 f8e7 g1f3 e8g8 e1g1 b8d7 d1c2 c7c6 b1d2 b7b6 e2e4 d5e4 d2e4'
FROM public.courses WHERE slug = 'catalan-opening';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Catalană vs c5 — gambit de centru', 'C', 20.0, 3, 'white',
  'd2d4 g8f6 c2c4 e7e6 g2g3 c7c5 f1g2 c5d4 g1f3 b8c6 e1g1 d7d5 c4d5 e6d5 f3d4 f8c5 d4b3 c5b6 b1c3'
FROM public.courses WHERE slug = 'catalan-opening';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'd4 — controlezi centrul.',
  '2', 'c4 — gambitul catalan: pion + fianchetto nebun g2 = presiune pe diagonala lungă.',
  '4', 'g3 — pregătești fianchetto-ul. Aceasta este esența sistemului catalan.',
  '6', 'Fg2 — nebunul pe g2 vizează diagonala a8-h1, centrul și flancul damei.',
  '8', 'dxc4 — negrul acceptă gambitul! Cedează centrul pentru un pion.',
  '10', 'Cf3 — presiune pe d4 și e5.',
  '12', 'Rocadă — regele la adăpost, Fg2 devine activ imediat.',
  '14', 'Da4 — ataci calul de pe c6 și respecți câștigarea pionului de pe c4.',
  '16', 'Dxc4 — recuperezi pionul. Fg2 rămâne o armă puternică pe diagonala lungă.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'catalan-opening') AND variation_code = 'A';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'd4 — deschidere cu pionul damei.',
  '4', 'g3 — fianchetto! Sistemul catalan este flexibil și pozițional.',
  '6', 'Fg2 — nebunul pe g2, piesa cheie a catalanei.',
  '8', 'Fe7 — negrul adoptă setup-ul solid clasic, fără să accepte pionul.',
  '10', 'Cf3 — calul pe f3, susține centrul și controlează e5.',
  '12', 'Rocadă — regele la adăpost, turnul de pe f1 susține pionul de pe e4 viitor.',
  '14', 'Dc2 — dama pregătește e4 și controlează centrul.',
  '16', 'Cd2 — al doilea cal iese, pregătind e4 cu sprijin.',
  '18', 'e4 — explozia centrală! Fg2 devine activ, jocul se deschide în favoarea albului.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'catalan-opening') AND variation_code = 'B';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'd4 — centrul damei.',
  '5', 'c5 — negrul atacă imediat centrul. Joc complicat și dinamic.',
  '6', 'Fg2 — fianchetto, pregătești presiunea pe diagonala lungă.',
  '7', 'cxd4 — negrul schimbă în centru, simplificând.',
  '8', 'Cf3 — recâștigi pionul de pe d4 cu calul.',
  '10', 'Rocadă — regele la adăpost.',
  '11', 'd5 — negrul contraatacă în centru! Joc deschis.',
  '12', 'cxd5 exd5 — schimburi în centru, pionii negri devin izolaț sau uniți pe coloana d.',
  '14', 'Fxc5 — nebunul activ pe c5, atacând pionii negri.',
  '16', 'Cb3 — calul atacă nebunul, câștigând tempo.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'catalan-opening') AND variation_code = 'C';

-- ============================================================
-- GAMBITUL REGELUI
-- ============================================================
INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Gambitul Regelui Acceptat — Bishop''s Gambit', 'A', 35.0, 1, 'white',
  'e2e4 e7e5 f2f4 e5f4 f1c4 g8f6 b1c3 c7c6 d2d4 d7d5 e4d5 c6d5 c4b5 b8c6 g1e2 c8g4 e1g1 g4e2 d1e2'
FROM public.courses WHERE slug = 'kings-gambit';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Gambitul Regelui Acceptat — Cunningham', 'B', 20.0, 2, 'white',
  'e2e4 e7e5 f2f4 e5f4 g1f3 f8e7 f1c4 e7h4 e1f1 d7d6 d2d4 b8c6 b1c3 c8g4 c1f4 g8f6 h2h3 g4h5 g2g4'
FROM public.courses WHERE slug = 'kings-gambit';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Gambitul Regelui Respins — Falkbeer', 'C', 25.0, 3, 'white',
  'e2e4 e7e5 f2f4 d7d5 e4d5 e5e4 d2d3 g8f6 d3e4 f6e4 g1f3 f8c5 d1e2 e4f6 b1c3 e8g8 c1e3 f8e8 e1c1'
FROM public.courses WHERE slug = 'kings-gambit';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'e4 — centrul regal.',
  '2', 'f4 — GAMBITUL REGELUI! Oferi un pion pentru a deschide coloana f și a obține inițiativă fulminantă.',
  '3', 'exf4 — negrul acceptă! Acum alb trebuie să atace rapid, altfel extra-pionul negru contează.',
  '4', 'Fc4 — Bishop''s Gambit. Nebunul pe c4 vizează f7, amenință mat după Dh5.',
  '6', 'Cc3 — presiune pe centru și flancul regelui negru.',
  '8', 'd4 — centrul devine puternic. Acum ai doi pioni în centru și inițiativă.',
  '10', 'dxe5 exd5 — schimburi forțate în centru.',
  '14', 'Ce2 — calul se pregătește să susțină atacul pe flancul regelui.',
  '16', 'Rocadă — regele la adăpost, turnul de pe f1 devine activ pe coloana f.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'kings-gambit') AND variation_code = 'A';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'e4 — gambitul regelui: pion pentru inițiativă și atac.',
  '2', 'f4 — gambitul! Deschizi coloana f pentru turnul tău.',
  '3', 'exf4 — acceptat!',
  '4', 'Cf3 — mai solid decât Fc4. Controlezi centrul și te dezvolți rapid.',
  '5', 'Fe7 — Cunningham! Negrul pregătește Fh4+, o mișcare agresivă.',
  '6', 'Fc4 — nebunul pe c4, presiune pe f7.',
  '7', 'Fh4+ — negrul dă șah! Regele alb trebuie să mute.',
  '8', 'Rf1 — regele pe f1, ocolind șahul. Regele rămâne în centru temporar.',
  '10', 'd4 — centrul devine activ chiar cu regele pe f1!',
  '14', 'Ff4 — nebunul activ, aperi pionul de pe f4 și atacă centrul negru.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'kings-gambit') AND variation_code = 'B';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'e4 — gambitul regelui.',
  '2', 'f4 — gambitul! Oferi pionul de pe e5 pentru inițiativă.',
  '3', 'd5 — Contra-Gambitul Falkbeer! Negrul ignoră pionul și contraatacă central.',
  '4', 'exd5 — alb acceptă schimbul. Pionul înaintat pe d5.',
  '5', 'e4 — negrul înaintează! Pionul de pe e4 creează probleme imediate albului.',
  '6', 'd3 — alb atacă pionul de pe e4.',
  '7', 'Cf6 — negrul continuă să se dezvolte, ignorând pionul de pe d3.',
  '8', 'dxe4 — alb capturează, dar pionul de pe e4 dispare și negrul rămâne cu inițiativă.',
  '10', 'Cf3 — alb se dezvoltă rapid.',
  '16', 'Fe3 — nebunul activ, susține centrul.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'kings-gambit') AND variation_code = 'C';

-- ============================================================
-- DESCHIDEREA ENGLEZĂ
-- ============================================================
INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Varianta Simetrică (c5 negru)', 'A', 40.0, 1, 'white',
  'c2c4 c7c5 g1f3 b8c6 b1c3 g8f6 g2g3 d7d5 c4d5 f6d5 f1g2 d5c7 e1g1 e7e5 d2d3 f8e7 a2a3 e8g8 b2b4'
FROM public.courses WHERE slug = 'english-opening';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Setup Hedgehog (b6, Fb7)', 'B', 30.0, 2, 'white',
  'c2c4 c7c5 g1f3 g8f6 g2g3 b7b6 f1g2 c8b7 e1g1 e7e6 b1c3 f8e7 d2d4 c5d4 d1d4 d7d6 f1d1 a7a6 b2b3'
FROM public.courses WHERE slug = 'english-opening';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Engleză vs Indiană a Regelui', 'C', 25.0, 3, 'white',
  'c2c4 g7g6 b1c3 f8g7 g2g3 g8f6 f1g2 e8g8 g1f3 d7d6 e1g1 c7c5 d2d4 b8c6 d4c5 d6c5 c1e3 c8e6 d1d6'
FROM public.courses WHERE slug = 'english-opening';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'c4 — Deschiderea Engleză! Controlezi d5 fără a avansa pionul e, flexibilitate maximă.',
  '3', 'c5 — negrul răspunde simetric. Varianta cea mai principală.',
  '4', 'Cf3 — cal activ pe f3, susține d5 și e4 viitor.',
  '6', 'Cc3 — ambii cai dezvoltați, centrul controlat indirect.',
  '8', 'g3 — fianchetto! Nebunul pe g2 va controla diagonala lungă.',
  '9', 'd5 — negrul atacă centrul. Alb face schimb.',
  '10', 'cxd5 — schimbul în centru, deschide jocul.',
  '12', 'Fg2 — nebunul activ, vizează c6 și d5.',
  '14', 'Rocadă — regele la adăpost, structura engleză completă.',
  '18', 'a3 — pregătești b4 pentru a câștiga spațiu pe flancul damei.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'english-opening') AND variation_code = 'A';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'c4 — Engleză. Flexibilă, profundă, pozițională.',
  '4', 'Cf3 — calul activ susține e4 și d5.',
  '5', 'b6 — negrul pregătește Hedgehog-ul! Structura cu pionii pe a6,b6,d6,e6.',
  '6', 'g3 — fianchetto pentru nebunul de pe g2.',
  '7', 'Fb7 — nebunul pe b7 vizează diagonala lungă. Hedgehog complet.',
  '10', 'Cc3 — caii controlează centrul fără a împinge pionii.',
  '12', 'd4 — explozia centrală! Alb câștigă spațiu imediat.',
  '14', 'Dxd4 — recuperezi pionul cu dama activă.',
  '16', 'Td1 — turnul pe coloana d deschisă, presiune pe d6.',
  '18', 'b3 — pregătești Fb2 pentru a activa nebunul pe diagonala lungă.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'english-opening') AND variation_code = 'B';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'c4 — Engleză vs setup King''s Indian. Joc pozițional complex.',
  '4', 'g3 — fianchetto împotriva fianchetto-ului negru. Luptă pe diagonala lungă.',
  '6', 'Fg2 — nebunul pe g2. Cine va câștiga diagonala a1-h8?',
  '8', 'Cf3 — cal activ, susține d5 și e4.',
  '10', 'Rocadă — regele la adăpost.',
  '12', 'd4 — centrul devine activ. Alb câștigă spațiu.',
  '14', 'Cc3 — al doilea cal iese.',
  '16', 'dxc5 — alb schimbă în centru, deschide coloana d.',
  '18', 'Fe3 — nebunul activ pe e3, susținând centrul.',
  '19', 'Dd6 — dama activă vizează d6, câștigând tempo.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'english-opening') AND variation_code = 'C';

-- ============================================================
-- ATACUL INDIAN AL REGELUI
-- ============================================================
INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'vs Setup Francez (d5, e6)', 'A', 35.0, 1, 'white',
  'g1f3 d7d5 g2g3 c7c5 f1g2 b8c6 e1g1 e7e6 d2d3 g8f6 b1d2 f8e7 e2e4 e8g8 f1e1 b7b5 e4e5 f6d7 h2h4'
FROM public.courses WHERE slug = 'kings-indian-attack';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'vs Setup Sicilian (c5, Cc6)', 'B', 30.0, 2, 'white',
  'g1f3 c7c5 g2g3 b8c6 f1g2 d7d6 e1g1 g7g6 d2d3 f8g7 b1d2 g8f6 e2e4 e8g8 c2c3 a7a6 f1e1 a8b8 a2a4'
FROM public.courses WHERE slug = 'kings-indian-attack';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'vs Caro-Kann (d5, c6)', 'C', 25.0, 3, 'white',
  'g1f3 d7d5 g2g3 c7c6 f1g2 c8g4 e1g1 b8d7 d2d3 e7e6 b1d2 g8f6 e2e4 d5e4 d3e4 f8c5 d1e2 e8g8 h2h3'
FROM public.courses WHERE slug = 'kings-indian-attack';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'Cf3 — Atacul Indian al Regelui (KIA) începe cu calul, fără a angaja pionii central.',
  '2', 'g3 — pregătești fianchetto-ul. KIA se bazează pe Fg2 ca piesă centrală.',
  '4', 'Fg2 — nebunul pe g2. Vizează diagonala lungă și d5.',
  '6', 'Rocadă — regele la adăpost, structura KIA este pregătită.',
  '8', 'd3 — pion de suport, nu de atac. KIA este un sistem pozițional.',
  '10', 'Cd2 — calul pe d2, flexibil. Poate merge pe f1-e3 sau f1-g3.',
  '12', 'e4 — momentul cheie! Avansezi e4 după ce toată armata este pregătită.',
  '14', 'Te1 — turnul susține e4-e5 înaintarea centrală.',
  '16', 'e5 — înaintare! Calul de pe f6 este atacat, negrul trebuie să se retragă.',
  '18', 'h4 — atac pe flancul regelui! Planul KIA clasic.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'kings-indian-attack') AND variation_code = 'A';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'Cf3 — KIA: flexibil împotriva oricărui setup adversar.',
  '3', 'c5 — negrul joacă Siciliana dar alb răspunde cu KIA în loc de 1.e4.',
  '4', 'g3 — fianchetto împotriva Sicilianei.',
  '6', 'Fg2 — nebunul activ pe diagonala lungă.',
  '8', 'Rocadă — structura KIA completă.',
  '10', 'd3 — suport solid pentru e4.',
  '12', 'Cd2 — calul pe d2, pregătit pentru Cf1-e3 sau g3.',
  '14', 'e4 — centrul devine activ!',
  '16', 'c3 — susții d4 și pregătești d4 înaintare.',
  '18', 'Te1 — turnul susține e4-e5 înaintarea viitoare.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'kings-indian-attack') AND variation_code = 'B';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'Cf3 — KIA vs Caro-Kann. Negrul joacă c6+d5, alb răspunde cu KIA.',
  '2', 'g3 — fianchetto vs structura solidă Caro-Kann.',
  '5', 'Fg4 — negrul scoate nebunul înaintea e6. Avantajul Caro-Kann față de Franceză.',
  '6', 'Rocadă — regele la adăpost.',
  '8', 'd3 — suport central solid.',
  '10', 'Cd2 — cal flexibil.',
  '12', 'e4 — atacul central! Negrul are d5 solid, alb trebuie să fie activ.',
  '13', 'dxe4 — negrul schimbă, simplificând centrul.',
  '14', 'dxe4 — alb recapturează, centrul deschis.',
  '15', 'Fc5 — nebunul activ pe c5, vizând f2.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'kings-indian-attack') AND variation_code = 'C';

-- ============================================================
-- SISTEMUL COLLE
-- ============================================================
INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Colle-Zukertort (b3, Fb2)', 'A', 40.0, 1, 'white',
  'd2d4 d7d5 g1f3 g8f6 e2e3 e7e6 f1d3 c7c5 b2b3 b8c6 e1g1 f8d6 c1b2 e8g8 b1d2 b7b6 d2e5 c8b7 f2f4'
FROM public.courses WHERE slug = 'colle-system';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Colle-Koltanowski (c3, Cc3)', 'B', 35.0, 2, 'white',
  'd2d4 d7d5 g1f3 g8f6 e2e3 e7e6 f1d3 c7c5 c2c3 b8c6 b1d2 f8d6 e1g1 e8g8 d4c5 d6c5 e3e4 d5e4 d2e4'
FROM public.courses WHERE slug = 'colle-system';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Colle vs Indian (g6, Fg7)', 'C', 20.0, 3, 'white',
  'd2d4 g8f6 g1f3 g7g6 e2e3 f8g7 f1d3 e8g8 e1g1 d7d6 b1d2 b8d7 c2c3 e7e5 d4e5 d6e5 e3e4 c7c6 d1e2'
FROM public.courses WHERE slug = 'colle-system';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'd4 — Sistemul Colle: simplu, solid, eficient pentru alb.',
  '2', 'Cf3 — calul pe f3, susține centrul.',
  '4', 'e3 — pionul de pe e3 nu blochează nebunul de pe c1 intenționat — va ieși pe b2!',
  '6', 'Fd3 — nebunul pe d3, vizând h7 după rocadă.',
  '7', 'c5 — negrul atacă centrul. Alb nu se grăbește.',
  '8', 'b3 — pregătești Fb2! Aceasta este diferența față de Colle clasic: nebunul iese pe b2.',
  '10', 'Rocadă — structura completă.',
  '12', 'Fb2 — nebunul pe b2 vizează diagonala lungă și e5.',
  '14', 'Cd2 — al doilea cal iese, planul e4 devine posibil.',
  '18', 'f4 — atac pe flancul regelui! Planul clasic Colle-Zukertort.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'colle-system') AND variation_code = 'A';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'd4 — Colle clasic cu c3 în loc de b3.',
  '2', 'Cf3 — cal central.',
  '4', 'e3 — soliditate. Sistemul Colle nu riscă niciodată devreme.',
  '6', 'Fd3 — nebunul pe d3, pregătit pentru atacul pe rege.',
  '8', 'c3 — Colle-Koltanowski! Varianta cu c3 susține centrul diferit față de b3.',
  '10', 'Cd2 — calul pe d2 susține e4 și pregătește Cf1-e3.',
  '12', 'Rocadă — structura completă.',
  '14', 'dxc5 — alb schimbă în centru la momentul potrivit.',
  '16', 'e4 — explozia centrală! Fd3 vizează brusc h7.',
  '18', 'Cxe4 — calul activ în centru, atacul pe rege se declanșează.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'colle-system') AND variation_code = 'B';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'd4 — Colle vs Indian. Sistemul funcționează împotriva oricărei deschideri.',
  '2', 'Cf3 — dezvoltare clasică.',
  '4', 'e3 — solid.',
  '6', 'Fd3 — nebunul pe d3.',
  '8', 'Rocadă — regele la adăpost.',
  '9', 'd6 — negrul joacă Pirc/Indian setup.',
  '10', 'Cd2 — cal flexibil.',
  '12', 'c3 — susții centrul.',
  '13', 'e5 — negrul contraatacă! Jocul devine dinamic.',
  '14', 'dxe5 — schimb în centru, coloana d se deschide.',
  '16', 'e4 — centrul alb activ, negrul trebuie să fie atent.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'colle-system') AND variation_code = 'C';

-- ============================================================
-- JOCUL VIENEZ
-- ============================================================
INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Viena cu f4 — Gambitul Vienez', 'A', 35.0, 1, 'white',
  'e2e4 e7e5 b1c3 g8f6 f2f4 d7d5 f4e5 f6e4 d2d4 e4c3 b2c3 d5e4 d1h5 f7f5 e5f6 f8d6 f1c4 d8f6 h5f3'
FROM public.courses WHERE slug = 'vienna-game';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Viena Clasică — Cc3, Fc4', 'B', 40.0, 2, 'white',
  'e2e4 e7e5 b1c3 b8c6 f1c4 f8c5 d1g4 g7g6 g1f3 g8f6 c3d5 f6d5 c4d5 c6e7 d5f7 e8f7 f3g5 e8g8 g4f3'
FROM public.courses WHERE slug = 'vienna-game';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Viena vs Caro-Kann — Cc3, d4', 'C', 20.0, 3, 'white',
  'e2e4 e7e5 b1c3 g8f6 f2f4 d7d5 e4d5 f6d5 c3d5 d8d5 d2d4 e5e4 f1c4 d5e6 g1e2 f8b4 c1e3 b4e7 e1g1'
FROM public.courses WHERE slug = 'vienna-game';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'e4 — centrul regal.',
  '2', 'Cc3 — Jocul Vienez! Calul pe c3 este mai flexibil decât Cf3 imediat.',
  '4', 'f4 — Gambitul Vienez! Agresiv, similar cu Gambitul Regelui dar mai solid.',
  '5', 'd5 — negrul contraatacă în centru.',
  '6', 'fxe5 — alb capturează, câștigând spațiu.',
  '7', 'Cxe4 — negrul intră în centru cu calul.',
  '8', 'd4 — centrul alb devine puternic.',
  '9', 'Cxc3 — negrul schimbă cal pe cal.',
  '10', 'bxc3 — alb recapturează cu pionul, centru puternic.',
  '12', 'Dh5 — atac pe rege! Dama amenință f7.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'vienna-game') AND variation_code = 'A';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'e4 — Viena clasică.',
  '2', 'Cc3 — calul pe c3, cel mai flexibil.',
  '3', 'Cc6 — negrul apără e5 cu calul.',
  '4', 'Fc4 — nebunul pe c4, vizând f7. Setup similar cu Italiana.',
  '5', 'Fc5 — negrul dezvoltă simetric.',
  '6', 'Dg4 — Dama atacă g7! Ameninți să câștigi material.',
  '8', 'Cf3 — cal activ, mai multă presiune.',
  '10', 'Cd5 — caval fork! Ameninți Cxf6 sau Cxc7.',
  '12', 'Fd5 — capturezi calul de pe d5.',
  '14', 'Fxf7+ — sacrificiu pe f7! Regele negru este expus.',
  '16', 'Cg5+ — șah! Continuarea atacului.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'vienna-game') AND variation_code = 'B';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'e4 — Viena vs Cf6.',
  '2', 'Cc3 — Viena solidă.',
  '4', 'f4 — Gambitul Vienez împotriva Cf6.',
  '5', 'd5 — negrul contraatacă imediat cu d5.',
  '6', 'exd5 — alb capturează.',
  '7', 'Cxd5 — negrul recuperează pionul cu calul.',
  '8', 'Cxd5 — alb schimbă calii.',
  '9', 'Dxd5 — dama neagră activă în centru.',
  '10', 'd4 — centrul alb devine puternic.',
  '12', 'Fc4 — nebunul activ pe c4, vizând d5 și f7.',
  '16', 'Ce2 — calul se dezvoltă, pregătind rocada.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'vienna-game') AND variation_code = 'C';

-- ============================================================
-- APĂRAREA REGELUI INDIAN (Black)
-- ============================================================
INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Varianta Clasică — Ce1, Cd3', 'A', 40.0, 1, 'black',
  'd2d4 g8f6 c2c4 g7g6 b1c3 f8g7 e2e4 d7d6 g1f3 e8g8 f1e2 e7e5 e1g1 b8c6 d4d5 c6e7 f3e1 f6d7 e1d3 f7f5'
FROM public.courses WHERE slug = 'kings-indian-defense';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Atacul cu Patru Pioni (f4)', 'B', 25.0, 2, 'black',
  'd2d4 g8f6 c2c4 g7g6 b1c3 f8g7 e2e4 d7d6 f2f4 e8g8 g1f3 c7c5 d4d5 e7e6 f1d3 e6d5 c4d5 f8e8 e4e5'
FROM public.courses WHERE slug = 'kings-indian-defense';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Varianta Sämisch (f3, Fe3)', 'C', 25.0, 3, 'black',
  'd2d4 g8f6 c2c4 g7g6 b1c3 f8g7 e2e4 d7d6 f2f3 e8g8 c1e3 c7c5 d4d5 e7e6 d1d2 e6d5 c4d5 f8e8 g1e2 b8a6'
FROM public.courses WHERE slug = 'kings-indian-defense';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'd4 — Alb controlează centrul.',
  '1', 'Cf6 — cal activ pe f6, apără e4 viitor și controlează d5.',
  '2', 'c4 — alb construiește un centru mare.',
  '3', 'g6 — pregătești fianchetto-ul! Fb7... wait Fg7. KID se bazează pe Fg7.',
  '4', 'Fg7 — nebunul pe g7 vizează diagonala lungă și centrul.',
  '5', 'e4 — alb construiește centrul masiv: c4+d4+e4.',
  '6', 'd6 — negrul susține e5 și lăsă centrul alb să avanseze.',
  '8', 'e5 — explozia centrală neagră! Contraatac pe flancul regelui.',
  '9', 'Rocadă — regele la adăpost, gata de atac.',
  '10', 'd5 — alb avansează, negrul trebuie să creeze contra-joc pe flancul regelui.',
  '14', 'Cd3 — cal activ pe d3, pregătit să meargă pe f4 sau e1.',
  '19', 'f5 — ATACUL PE FLANCUL REGELUI! Aceasta este esența KID.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'kings-indian-defense') AND variation_code = 'A';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'd4 — alb joacă Atacul cu Patru Pioni.',
  '3', 'g6 — negrul pregătește KID indiferent de varianta albului.',
  '6', 'e4 — al treilea pion central! Masă impresionantă.',
  '8', 'f4 — AL PATRULEA PION! Centrul alb este copleșitor.',
  '9', 'Rocadă — negrul se rochează imediat, pregătit pentru contra-joc.',
  '10', 'Cf3 — calul alb iese.',
  '11', 'c5 — contra-joc imediat! Negrul atacă d4.',
  '12', 'd5 — alb avansează, blocher central.',
  '13', 'e6 — negrul deschide jocul pe flancul damei!',
  '15', 'exd5 — schimb în centru, jocul se deschide.',
  '16', 'cxd5 — pionul de pe d5 avansat este puternic.',
  '17', 'Te8 — negrul atacă e4, presiune crescândă.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'kings-indian-defense') AND variation_code = 'B';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'd4 — Sämisch: Alb joacă f3 în loc de Cf3.',
  '7', 'f3 — Varianta Sämisch! Previi Cg4 și pregătești g4-h4-h5 atac.',
  '8', 'Fe3 — nebunul pe e3 susține centrul.',
  '9', 'c5 — contra-joc imediat! Negrul atacă d4 din prima mișcare.',
  '10', 'd5 — blocaj central, joc închis.',
  '11', 'e6 — negrul deschide flancul damei.',
  '13', 'exd5 — schimb în centru.',
  '14', 'cxd5 — pionul de pe d5 avansat.',
  '15', 'Te8 — negrul susține e7 și pregătește e5.',
  '16', 'Ce2 — calul pe e2, mai sigur decât f3 unde era atacat.',
  '19', 'Ca6 — calul pe a6, pregătit să meargă pe c5 sau b4.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'kings-indian-defense') AND variation_code = 'C';

-- ============================================================
-- APĂRAREA NIMZO-INDIANĂ (Black)
-- ============================================================
INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Varianta Dc2 — Classică', 'A', 35.0, 1, 'black',
  'd2d4 g8f6 c2c4 e7e6 b1c3 f8b4 d1c2 e8g8 a2a3 b4c3 c2c3 b7b6 c1g5 c8b7 e2e3 d7d6 g1f3 b8d7 a1d1'
FROM public.courses WHERE slug = 'nimzo-indian-defense';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Varianta e3 — Rubinstein', 'B', 35.0, 2, 'black',
  'd2d4 g8f6 c2c4 e7e6 b1c3 f8b4 e2e3 e8g8 f1d3 d7d5 g1f3 c7c5 e1g1 c5d4 e3d4 d5c4 d3c4 b7b6 c1g5'
FROM public.courses WHERE slug = 'nimzo-indian-defense';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Varianta a3 — Sämisch Nimzo', 'C', 20.0, 3, 'black',
  'd2d4 g8f6 c2c4 e7e6 b1c3 f8b4 a2a3 b4c3 b2c3 c7c5 f2f3 d7d5 c4d5 f6d5 c3d4 c5d4 d1d4 d8a5 c1d2'
FROM public.courses WHERE slug = 'nimzo-indian-defense';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'd4 — deschidere cu pionul damei.',
  '1', 'Cf6 — cal activ.',
  '3', 'e6 — negrul pregătește Fb4.',
  '5', 'Fb4 — NIMZO-INDIANĂ! Negrul pinuiește calul de pe c3 care apăra d4/e5.',
  '6', 'Dc2 — varianta Capablanca. Dama pe c2 pregătește să recaptureze pe c3 cu dama.',
  '8', 'Rocadă — negrul se rochează.',
  '9', 'a3 — alb forțează schimbul nebunului.',
  '10', 'Fxc3+ — negrul schimbă nebunul pe cal, dând alb pioni dubli!',
  '11', 'Dxc3 — alb recuperează cu dama. Pionii c dubli sunt o slăbiciune pe termen lung.',
  '12', 'b6 — negrul pregătește Fb7 pe diagonala lungă.',
  '14', 'Fb7 — nebunul pe b7 vizează diagonala mare.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'nimzo-indian-defense') AND variation_code = 'A';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'd4 — Nimzo-Indiana: cea mai solida apărare la d4.',
  '5', 'Fb4 — pin pe Cc3! Nimzo-Indiana pune imediat presiune pe structura albului.',
  '6', 'e3 — Varianta Rubinstein. Solid, pregătește Fd3.',
  '8', 'Rocadă — negrul se rochează imediat.',
  '9', 'Fd3 — nebunul alb activ pe d3.',
  '10', 'd5 — centrul negru se extinde.',
  '11', 'Cf3 — calul alb pe f3.',
  '12', 'c5 — contra-joc pe flancul damei.',
  '13', 'Rocadă — alb rocheazete.',
  '14', 'cxd4 — negrul simplifica centrul.',
  '15', 'exd4 — alb recapturează cu pionul e.',
  '16', 'dxc4 — negrul câștigă pionul de pe c4!'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'nimzo-indian-defense') AND variation_code = 'B';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'd4 — Nimzo vs Sämisch.',
  '5', 'Fb4 — Nimzo clasic.',
  '6', 'a3 — Sämisch! Alb forțează imediat schimbul nebunului.',
  '7', 'Fxc3+ — negrul schimbă, dând pioni dubli.',
  '8', 'bxc3 — alb recapturează cu b, centru consolidat.',
  '9', 'c5 — negrul atacă centrul imediat!',
  '10', 'f3 — alb construiește un centru masiv cu e4.',
  '11', 'd5 — contra-joc în centru.',
  '12', 'cxd5 — alb schimbă.',
  '13', 'Cxd5 — negrul recuperează cu calul activ în centru.',
  '14', 'cxd4 — centrul se deschide.',
  '15', 'Cxd4 — cal central puternic.',
  '16', 'Da5+ — șah cu dama! Negrul câștigă tempo.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'nimzo-indian-defense') AND variation_code = 'C';

-- ============================================================
-- APĂRAREA OLANDEZĂ (Black)
-- ============================================================
INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Varianta Stonewall — d5, e6, f5', 'A', 30.0, 1, 'black',
  'd2d4 f7f5 g2g3 g8f6 f1g2 e7e6 g1f3 d7d5 e1g1 f8d6 c2c4 c7c6 b2b3 e8g8 c1a3 f6e4 a3d6 d8d6 b1d2 b8d7'
FROM public.courses WHERE slug = 'dutch-defense';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Varianta Leningrad — g6, Fg7', 'B', 40.0, 2, 'black',
  'd2d4 f7f5 g2g3 g8f6 f1g2 g7g6 g1f3 f8g7 e1g1 e8g8 c2c4 d7d6 b1c3 d8e8 d4d5 b8a6 f3d4 a6c5 b2b3 a7a5'
FROM public.courses WHERE slug = 'dutch-defense';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Varianta Clasică — Fe7, rocadă', 'C', 25.0, 3, 'black',
  'd2d4 f7f5 g1f3 g8f6 g2g3 e7e6 f1g2 f8e7 e1g1 e8g8 c2c4 d7d5 b2b3 c7c6 c1a3 e7a3 b1a3 f6e4 b1c2 b8d7'
FROM public.courses WHERE slug = 'dutch-defense';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'd4 — alb controlează centrul.',
  '1', 'f5 — OLANDEZĂ! Negrul controlează e4 și pregătește un atac pe flancul regelui. Foarte agresiv!',
  '4', 'Cf6 — calul activ, susține e4.',
  '5', 'e6 — Stonewall-ul se construiește: e6+f5+d5+c6.',
  '6', 'Fd3 — nebunul activ.',
  '7', 'd5 — STONEWALL! Structura de piatră: d5-e6-f5. Solidă dar puțin pasivă.',
  '10', 'Fd6 — nebunul pe d6 susține structura și vizează h2.',
  '14', 'Ce4 — cal puternic pe e4! Centrul negru este dominant.',
  '15', 'Fxd6 — alb schimbă nebunul activ.',
  '16', 'Dxd6 — dama pe d6, activă și centralizată.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'dutch-defense') AND variation_code = 'A';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'd4 — Olandeză: Leningrad vs Stonewall.',
  '1', 'f5 — Olandeză! Controlezi e4.',
  '3', 'g6 — Varianta Leningrad! Mai dinamică decât Stonewall, cu fianchetto.',
  '4', 'Fg7 — nebunul pe g7, diagonala lungă.',
  '6', 'Rocadă — regele la adăpost.',
  '7', 'Rocadă — alb rocheazete și el.',
  '8', 'd6 — structura Leningrad: f5+g6+Fg7+d6.',
  '9', 'De8 — dama se mută pe e8 pentru a pregăti e5!',
  '10', 'd5 — alb avansează, blocher central.',
  '11', 'Ca6 — calul pe a6, merge spre c5.',
  '12', 'Cd4 — cal alb activ pe d4.',
  '13', 'Cc5 — cal negru pe c5, presiune pe d3 și b3.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'dutch-defense') AND variation_code = 'B';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'd4 — Olandeză clasică.',
  '1', 'f5 — Olandeză! Setup clasic.',
  '4', 'e6 — varianta clasică, mai solidă decât Leningrad.',
  '5', 'Fe7 — nebunul pe e7, solid.',
  '6', 'Rocadă — regele la adăpost.',
  '8', 'd5 — Stonewall light cu Fe7 în loc de Fd6.',
  '10', 'b3 — alb pregătește Fb2.',
  '11', 'c6 — negrul consolidează structura.',
  '12', 'Fa3 — alb schimbă nebunul bun al negrul!',
  '13', 'Fxa3 — negrul este forțat să schimbe.',
  '14', 'Cxa3 — alb recapturează, calul pe a3 temporar pasiv.',
  '15', 'Ce4 — calul negru pe e4, piesă dominantă!'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'dutch-defense') AND variation_code = 'C';

-- ============================================================
-- APĂRAREA SLAVĂ (Black)
-- ============================================================
INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Varianta Principală — Ff5, a6', 'A', 35.0, 1, 'black',
  'd2d4 d7d5 c2c4 c7c6 g1f3 g8f6 b1c3 d5c4 a2a4 c8f5 e2e3 e7e6 f1c4 f8b4 e1g1 e8g8 d1e2 b8d7 e3e4 f5g6'
FROM public.courses WHERE slug = 'slav-defense';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Varianta Schimb (cxd5)', 'B', 25.0, 2, 'black',
  'd2d4 d7d5 c2c4 c7c6 b1c3 g8f6 c4d5 c6d5 c1f4 b8c6 e2e3 e7e6 g1f3 f8d6 f4d6 d8d6 f1d3 e8g8 e1g1 f8e8'
FROM public.courses WHERE slug = 'slav-defense';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Semi-Slavă — e6, Cd7', 'C', 35.0, 3, 'black',
  'd2d4 d7d5 c2c4 c7c6 g1f3 g8f6 b1c3 e7e6 e2e3 b8d7 d1c2 f8d6 f1d3 e8g8 e1g1 d5c4 d3c4 b7b5 c4d3 a7a5'
FROM public.courses WHERE slug = 'slav-defense';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'd4 — alb deschide cu pionul damei.',
  '1', 'd5 — negrul controlează centrul simetric.',
  '3', 'c6 — SLAVA! Pionul c susține d5 fără a bloca nebunul de pe c8. Aceasta este superioritatea față de QGD.',
  '6', 'dxc4 — negrul acceptă gambitul în Slavă.',
  '7', 'a4 — alb previi b5 care ar apăra c4.',
  '8', 'Ff5 — MARELE AVANTAJ AL SLAVEI! Negrul poate juca Ff5 înainte de e6, ceva imposibil în QGD.',
  '12', 'Fc4 — alb recuperează pionul.',
  '13', 'Fb4 — negrul pinuiește calul de pe c3.',
  '14', 'Rocadă — alb rocheazete.',
  '15', 'Rocadă — negrul se rocheazete.',
  '18', 'e4 — centrul explodează! Negrul trebuie să reacționeze.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'slav-defense') AND variation_code = 'A';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'd4 — Slavă: varianta schimb.',
  '3', 'c6 — Slavă!',
  '7', 'cxd5 — Varianta Schimb! Alb schimbă în centru.',
  '8', 'cxd5 — negrul recaptureaza cu pionul, structura simetrică.',
  '9', 'Ff4 — nebunul alb activ.',
  '10', 'Cc6 — calul negru activ.',
  '12', 'e3 — alb consolideaza.',
  '13', 'e6 — negrul consolidează.',
  '14', 'Cf3 — cal activ.',
  '15', 'Fd6 — nebunul negru activ.',
  '16', 'Fxd6 — schimb de nebuni.',
  '17', 'Dxd6 — dama neagră activă pe d6.',
  '18', 'Fd3 — nebunul alb activ, vizând h7.',
  '19', 'Rocadă — negrul se rocheazete.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'slav-defense') AND variation_code = 'B';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'd4 — Semi-Slavă: combinație slavă + franceză.',
  '3', 'c6 — slavă.',
  '5', 'e6 — SEMI-SLAVĂ! Negrul joacă atât c6 cât și e6. Solid și flexibil.',
  '7', 'Cd7 — calul pe d7, flexibil. Nu blochează Ff8.',
  '8', 'Dc2 — dama albă pe c2.',
  '9', 'Fd6 — nebunul negru activ.',
  '10', 'Fd3 — nebunul alb pe d3, vizând h7.',
  '12', 'Rocadă — alb rocheazete.',
  '13', 'Rocadă — negrul rocheazete.',
  '14', 'dxc4 — negrul simplifica centrul.',
  '15', 'Fxc4 — alb recupereaza cu nebunul activ.',
  '16', 'b5 — negrul câștigă spațiu pe flancul damei!'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'slav-defense') AND variation_code = 'C';

-- ============================================================
-- APĂRAREA PIRC (Black)
-- ============================================================
INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Varianta Clasică — Fe2, rocadă', 'A', 35.0, 1, 'black',
  'e2e4 d7d6 d2d4 g8f6 b1c3 g7g6 g1f3 f8g7 f1e2 e8g8 e1g1 c7c6 a2a4 c8g4 h2h3 g4f3 e2f3 e7e5 d4e5 d6e5'
FROM public.courses WHERE slug = 'pirc-defense';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Atacul Austrian — f4, Cf3', 'B', 30.0, 2, 'black',
  'e2e4 d7d6 d2d4 g8f6 b1c3 g7g6 f2f4 f8g7 g1f3 e8g8 f1e2 c7c5 d4d5 b7b5 c1e3 b5b4 c3e2 e7e6 d5e6 f7e6'
FROM public.courses WHERE slug = 'pirc-defense';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Atacul 150 — Fe3, Dd2, f3', 'C', 25.0, 3, 'black',
  'e2e4 d7d6 d2d4 g8f6 b1c3 g7g6 c1e3 f8g7 d1d2 c7c6 f2f3 b7b5 g1e2 b8d7 e3h6 g7h6 d2h6 c8b7 e1c1'
FROM public.courses WHERE slug = 'pirc-defense';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'e4 — alb ocupa centrul.',
  '1', 'd6 — PIRC! Negrul lăsă centrul albului și îl contraatacă ulterior.',
  '2', 'd4 — centrul masiv: e4+d4.',
  '3', 'Cf6 — calul pe f6, atacă e4.',
  '4', 'Cc3 — cal alb pe c3.',
  '5', 'g6 — fianchetto! Fg7 va fi principala armă neagră.',
  '6', 'Fg7 — nebunul pe g7, vizează c3 și d4.',
  '8', 'Fe2 — alb se dezvoltă solid.',
  '9', 'Rocadă — negrul se rocheazete.',
  '11', 'c6 — negrul pregătește d5 sau contraatac.',
  '13', 'Fg4 — negrul schimbă nebunul pe calul de pe f3, slăbind centrul alb.',
  '15', 'Fxf3 — schimb forțat.',
  '17', 'e5 — contra-joc central!'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'pirc-defense') AND variation_code = 'A';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'e4 — Pirc vs Atac Austrian.',
  '1', 'd6 — Pirc!',
  '7', 'f4 — ATACUL AUSTRIAN! Alb construiește centrul cu e4+d4+f4. Agresiv!',
  '8', 'Fg7 — negrul completează fianchetto-ul.',
  '9', 'Cf3 — cal pe f3.',
  '10', 'Rocadă — regele la adăpost.',
  '11', 'c5 — contra-joc imediat pe c5!',
  '12', 'd5 — alb avansează, blocher.',
  '13', 'b5 — contra-joc pe flancul damei! Dinamism maxim.',
  '14', 'Fe3 — nebunul alb activ.',
  '15', 'b4 — negrul atacă cc3.',
  '16', 'Ce2 — calul se retrage pentru a nu fi capturat.',
  '17', 'e6 — negrul deschide flancul damei.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'pirc-defense') AND variation_code = 'B';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'e4 — Pirc vs 150 Attack.',
  '5', 'g6 — fianchetto.',
  '6', 'Fe3 — nebunul pe e3: planul este Dd2, f3, g4-g5 atac!',
  '7', 'Fg7 — negrul completează fianchetto-ul.',
  '8', 'Dd2 — dama pe d2, conectând turnurile și pregătind h6.',
  '9', 'c6 — negrul pregătește d5.',
  '10', 'f3 — alb construiește linia f3+g4+h4 atac.',
  '11', 'b5 — contra-joc pe flancul damei.',
  '12', 'Ce2 — calul pe e2, nu f3 unde ar bloca atacul g4.',
  '13', 'Cd7 — negrul pregătește Cc5.',
  '14', 'Fh6 — alb schimbă nebunul dragon al negrul!',
  '15', 'Fxh6 — negrul trebuie să schimbe.',
  '16', 'Dxh6 — alb câștigă nebunul dragon, slăbind apărarea regelui negru.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'pirc-defense') AND variation_code = 'C';

-- ============================================================
-- APĂRAREA SCANDINAVĂ (Black)
-- ============================================================
INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Varianta Principală — Dxd5, Da5', 'A', 40.0, 1, 'black',
  'e2e4 d7d5 e4d5 d8d5 b1c3 d5a5 d2d4 g8f6 g1f3 c8f5 f1c4 e7e6 c1d2 a5b6 c3d5 f6d5 c4d5 c7c6 d5b3'
FROM public.courses WHERE slug = 'scandinavian-defense';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Varianta Modernă — 2...Cf6', 'B', 35.0, 2, 'black',
  'e2e4 d7d5 e4d5 g8f6 d2d4 f6d5 g1f3 g7g6 f1e2 f8g7 e1g1 e8g8 c2c4 d5b6 h2h3 b8c6 b1c3 c8g4 c1e3'
FROM public.courses WHERE slug = 'scandinavian-defense';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Gambitul Icelandic — 3.c4 e6', 'C', 15.0, 3, 'black',
  'e2e4 d7d5 e4d5 g8f6 c2c4 e7e6 d5e6 c8e6 d2d4 f8b4 b1c3 e8g8 g1f3 b8c6 f1e2 f8e8 e1g1 b4c3 b2c3'
FROM public.courses WHERE slug = 'scandinavian-defense';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'e4 — centrul regal.',
  '1', 'd5 — SCANDINAVĂ! Negrul atacă e4 direct din prima mutare. Surprinzător și agresiv!',
  '2', 'exd5 — alb capturează.',
  '3', 'Dxd5 — negrul recuperează pionul cu dama. Dama iese devreme, e vulnerabilă.',
  '4', 'Cc3 — cal cu tempo pe c3, atacă dama.',
  '5', 'Da5 — dama se retrage pe a5, bine poziționată.',
  '6', 'd4 — alb consolidează centrul.',
  '7', 'Cf6 — calul activ pe f6.',
  '8', 'Cf3 — calul alb pe f3.',
  '9', 'Ff5 — nebunul negru activ pe f5!',
  '14', 'Cd5 — fork! Alb amenință simultan dama și calul.',
  '16', 'Fxd5 — alb câștigă calul de pe d5.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'scandinavian-defense') AND variation_code = 'A';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'e4 — Scandinavă modernă.',
  '1', 'd5 — Scandinavă!',
  '3', 'Cf6 — varianta modernă! Negrul recuperează pionul cu calul, nu cu dama.',
  '4', 'd4 — alb construiește centrul.',
  '5', 'Cxd5 — calul pe d5, central și activ.',
  '6', 'Cf3 — calul alb pe f3.',
  '7', 'g6 — negrul pregătește fianchetto. Setup Indian!',
  '8', 'Fe2 — alb se dezvoltă solid.',
  '9', 'Fg7 — nebunul pe g7 vizează diagonala lungă.',
  '10', 'Rocadă — regele la adăpost.',
  '11', 'Rocadă — negrul rocheazete.',
  '12', 'c4 — alb atacă calul de pe d5.',
  '13', 'Cb6 — calul se retrage pe b6, mai puțin central dar solid.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'scandinavian-defense') AND variation_code = 'B';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'e4 — Gambitul Icelandic!',
  '1', 'd5 — Scandinavă.',
  '3', 'Cf6 — modernă.',
  '4', 'c4 — alb ignoră calul și construiește centrul cu c4.',
  '5', 'e6 — GAMBITUL ICELANDIC! Negrul sacrifică un pion pentru inițiativă puternică.',
  '6', 'dxe6 — alb acceptă.',
  '7', 'Fxe6 — negrul recuperează cu nebunul activ.',
  '8', 'd4 — alb construieste centrul.',
  '9', 'Fb4+ — șah! Negrul câștigă tempo.',
  '10', 'Cc3 — alb blochează șahul.',
  '11', 'Rocadă — negrul rocheazete rapid.',
  '12', 'Cc6 — cal activ în centru.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'scandinavian-defense') AND variation_code = 'C';

-- ============================================================
-- APĂRAREA ALEKHINE (Black)
-- ============================================================
INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Atacul cu Patru Pioni — c4, f4', 'A', 30.0, 1, 'black',
  'e2e4 g8f6 e4e5 f6d5 d2d4 d7d6 c2c4 d5b6 f2f4 f8f5 c1e3 e7e6 b1c3 f8e7 g1f3 e8g8 f1e2 d6e5 f4e5'
FROM public.courses WHERE slug = 'alekhine-defense';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Varianta Modernă — d4, Cf3', 'B', 40.0, 2, 'black',
  'e2e4 g8f6 e4e5 f6d5 d2d4 d7d6 g1f3 c8g4 f1e2 e7e6 e1g1 f8e7 h2h3 g4h5 c2c4 d5b6 b1c3 e8g8 c1e3'
FROM public.courses WHERE slug = 'alekhine-defense';

INSERT INTO public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
SELECT id, 'Varianta Schimb — exd6', 'C', 25.0, 3, 'black',
  'e2e4 g8f6 e4e5 f6d5 e5d6 e7d6 d2d4 g8f6 b1c3 d7d5 g1f3 f8e7 f1d3 e8g8 e1g1 c8g4 h2h3 g4h5 f1e1'
FROM public.courses WHERE slug = 'alekhine-defense';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'e4 — centrul regal.',
  '1', 'Cf6 — ALEKHINE! Negrul atacă e4 cu calul, invitând alb să avanseze și să supra-extindă.',
  '2', 'e5 — alb acceptă provocarea, câștigând spațiu.',
  '3', 'Cd5 — calul se retrage cu tempo, amenință c3 și b4.',
  '4', 'd4 — alb construiește centrul masiv.',
  '5', 'd6 — negrul atacă centrul supraextins al albului.',
  '6', 'c4 — alb extinde și mai mult. Periculos dacă negrul găsește contra-joc!',
  '7', 'Cb6 — calul se retrage.',
  '8', 'f4 — AL PATRULEA PION! Centrul alb este impresionant dar vulnerabil.',
  '9', 'Ff5 — nebunul negru activ, atacă e6.',
  '10', 'Fe3 — nebunul alb susținând centrul.',
  '16', 'dxe5 — negrul demolează centrul alb!'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'alekhine-defense') AND variation_code = 'A';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'e4 — Alekhine modernă.',
  '1', 'Cf6 — Alekhine! Cal pe f6, atacă e4.',
  '2', 'e5 — alb acceptă.',
  '3', 'Cd5 — cal central, flexibil.',
  '4', 'd4 — centrul alb.',
  '5', 'd6 — negrul atacă imediat.',
  '6', 'Cf3 — varianta modernă! Mai solidă decât c4.',
  '7', 'Fg4 — negrul pinuiește calul de pe f3! Pin important.',
  '8', 'Fe2 — alb întrerupe pinul cu Fe2.',
  '9', 'e6 — negrul consolideaza.',
  '10', 'Rocadă — alb rocheazete.',
  '11', 'Fe7 — nebunul negru solid.',
  '12', 'h3 — alb forțează Fh5.',
  '13', 'Fh5 — nebunul se retrage dar rămâne activ.',
  '14', 'c4 — alb câștigă spațiu.',
  '15', 'Cb6 — calul se retrage.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'alekhine-defense') AND variation_code = 'B';

UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'e4 — Alekhine: varianta schimb.',
  '1', 'Cf6 — Alekhine!',
  '2', 'e5 — alb avansează.',
  '3', 'Cd5 — cal central.',
  '4', 'exd6 — VARIANTA SCHIMB! Alb schimbă pionul, simplificând.',
  '5', 'exd6 — negrul recapturează. Acum are doi pioni centrali pe d6 și d5.',
  '6', 'd4 — alb construiește centrul.',
  '7', 'Cf6 — calul negru reactivat pe f6.',
  '8', 'Cc3 — cal alb central.',
  '9', 'd5 — negrul avansează în centru.',
  '12', 'Fd3 — nebunul alb activ pe d3.',
  '14', 'Fg4 — negrul pinuieste Cf3.',
  '16', 'Fh5 — nebunul se retrage.',
  '18', 'Te1 — turnul pe coloana e, susținând e4 viitor.'
) WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'alekhine-defense') AND variation_code = 'C';
