-- Migration 005: Add move explanations for guided opening trainer
-- Each opening line stores a JSON object: ply_index -> explanation string
ALTER TABLE public.opening_lines ADD COLUMN IF NOT EXISTS move_explanations jsonb DEFAULT '{}'::jsonb;

-- ============================================================
-- LONDON SYSTEM
-- ============================================================

-- Linia A: Clasică (vs d5 Nf6) — user = white
-- moves: d2d4 d7d5 g1f3 g8f6 c1f4 e7e6 e2e3 f8e7 h2h3 e8g8 f1d3 b8d7 e1g1 c7c5 c2c3 d8b6 d1e2 c5c4 d3c2
UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'd4 — controlezi centrul cu pionul damei. Fundația întregului sistem London.',
  '1', 'Adversarul joacă d5 simetric — cel mai solid și frecvent răspuns.',
  '2', 'Cf3 — cal dezvoltat natural. Susține d4 și limitează înaintarea e5 adversă.',
  '3', 'Adversarul joacă Cf6 — atacă e4 viitor și se pregătește de rocadă.',
  '4', 'Ff4 — mutarea care definește sistemul London! Ieșit înainte de e3, altfel este imposibil.',
  '5', 'Adversarul joacă e6 — structură solidă, dar închide nebunul de câmp negru. Avantaj pe termen lung.',
  '6', 'e3 — susții d4 și deschizi drumul pentru Fd3. Ordinea f4 înainte de e3 este esențială în London!',
  '7', 'Adversarul joacă Fe7 — pregătire de rocadă scurtă.',
  '8', 'h3 — previi Cg4 care ar amenința să schimbe nebunul tău activ de pe f4. Mișcare preventivă cheie.',
  '9', 'Adversarul face rocadă scurtă — regele la adăpost.',
  '10', 'Fd3 — nebunul vizează diagonala spre h7. Piesa centrală a planului London după rocadă.',
  '11', 'Adversarul joacă Cd7 — apărare solidă dar piesele rămân pasive.',
  '12', 'Rocadă! Regele în siguranță, turnuri conectate. Structura London este completă.',
  '13', 'c5 — adversarul atacă centrul. Cel mai frecvent contra-joc în structuri London.',
  '14', 'c3 — susții centrul și previi cxd4. Pion de bază în structura London.',
  '15', 'Db6 — presiune duală pe b2 și d4 simultan. Fii pregătit să aperi!',
  '16', 'De2 — aperi indirect b2 și pregătești e4 pentru activarea centrului.',
  '17', 'c4 — adversarul câștigă spațiu pe flancul damei.',
  '18', 'Fc2 — nebunul se retrage în siguranță, menținând presiunea latentă pe h7.'
)
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'london-system') AND variation_code = 'A';

-- Linia B: Fianchetto (vs g6) — user = white
-- moves: d2d4 g7g6 g1f3 f8g7 c1f4 d7d6 e2e3 g8f6 h2h3 e8g8 f1d3 b8d7 e1g1 c7c5 c2c3 d8b6 d1e2 c5d4 e3d4
UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'd4 — controlezi centrul. Sistemul London funcționează împotriva oricărui setup al adversarului.',
  '1', 'Adversarul joacă g6 — pregătire de fianchetto. Setup King''s Indian sau Modern.',
  '2', 'Cf3 — dezvoltare flexibilă, aștepți intenția adversarului înainte de alte decizii.',
  '3', 'Adversarul plasează nebunul pe g7 — diagonala lungă, presiune pe centru.',
  '4', 'Ff4 — aplici planul London standard indiferent de structura adversarului. Sistemul este robust!',
  '5', 'Adversarul joacă d6 — centru mai pasiv, un pas înapoi față de d5.',
  '6', 'e3 — completezi centrul și pregătești Fd3.',
  '8', 'h3 — previi Cg4. Aceeași mișcare preventivă ca în varianta clasică.',
  '10', 'Fd3 — nebunul pe d3, planul London identic indiferent de răspunsul adversarului.',
  '12', 'Rocadă — structura London completă. Acum poți planifica e4 sau atacul pe flanc.',
  '13', 'c5 — contra-joc tipic. Adversarul atacă centrul.',
  '14', 'c3 — susții centrul solid.',
  '16', 'De2 — pregatești e4 sau alte planuri centrale.',
  '17', 'cxd4 — adversarul simplifică, deschide coloana c.',
  '18', 'exd4 — retragi cu pionul. Centrul tău d4 rămâne stabil și puternic.'
)
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'london-system') AND variation_code = 'B';

-- Linia C: Anti-Benoni London (vs c5) — user = white
-- moves: d2d4 c7c5 c2c3 g8f6 g1f3 d7d5 c1f4 e7e6 e2e3 f8d6 f4d6 d8d6 f1d3 b8c6 e1g1 e8g8 b1d2 b7b6 d1e2
UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'd4 — prima mutare London.',
  '1', 'Adversarul joacă c5 imediat — atac agresiv al centrului. White răspunde cu c3, Anti-Benoni London.',
  '2', 'c3 — răspunsul solid la c5! Susții d4 fără a crea slăbiciuni. Anti-Benoni London.',
  '3', 'Adversarul joacă Cf6 — continuă dezvoltarea.',
  '4', 'Cf3 — pregătești structura London clasică.',
  '5', 'Adversarul joacă d5 — structura London clasică se instaurează, indiferent de ordinea mutărilor.',
  '6', 'Ff4 — planul London standard. Sistemul funcționează și după ordinea Benoni.',
  '8', 'e3 — completezi fundația centrală.',
  '9', 'Adversarul atacă nebunul cu Fd6. Forțat să răspunzi!',
  '10', 'Fxd6 — schimbi nebunii! Elimini o piesă activă adversă. Structura rămâne solidă.',
  '12', 'Fd3 — nebunul pe d3, planul London.',
  '14', 'Rocadă — regele la adăpost.',
  '16', 'Cd2 — calul pe d2, flexibil. Susține e4 și pregătește f4 sau Cf1-e3.',
  '17', 'Adversarul joacă b6 — pregătește Fb7 și presiune pe diagonala lungă.',
  '18', 'De2 — pregătești e4. Centrul devine activ.'
)
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'london-system') AND variation_code = 'C';

-- ============================================================
-- ITALIAN GAME
-- ============================================================

-- Linia A: Giuoco Piano (vs Bc5) — user = white
-- moves: e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 c2c3 g8f6 d2d4 e5d4 c3d4 c5b4 b1c3 f6e4 e1g1 b4c3 b2c3 d7d5 e4d5
UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'e4 — deschidere deschisă! Controlezi centrul și eliberezi piesele. Joc activ de ambele părți.',
  '1', 'Adversarul joacă e5 — simetrie. Lupta directă pentru centru începe.',
  '2', 'Cf3 — atacă e5 și se dezvoltă optim. Cea mai naturală mutare.',
  '3', 'Adversarul joacă Cc6 — apără e5 cu calul. Cel mai frecvent răspuns.',
  '4', 'Fc4 — nebunul italian! Vizează câmpul slab f7, cel mai vulnerabil punct advers.',
  '5', 'Adversarul joacă Fc5 — Giuoco Piano (Jocul Liniștit). Ambele tabere au nebuni activi.',
  '6', 'c3 — pregătești d4 pentru a lupta direct pentru centru. Planul principal în Giuoco Piano.',
  '7', 'Adversarul joacă Cf6 — atacă e4. Presiune pe centrul tău.',
  '8', 'd4 — atac central! Deschizi pozitia pentru piesele tale active. Momentul crucial!',
  '9', 'Adversarul ia pe d4 — forțat sau cedează centrul.',
  '10', 'cxd4 — retrai cu pionul. Centru solid, nebunul de pe c4 rămâne activ.',
  '11', 'Adversarul fixează calul cu Fb4. Presiune pe c3.',
  '12', 'Cc3 — atacă centrul și crești presiunea pe e4.',
  '13', 'Adversarul capturează pe e4 — sacrificiu tactic frecvent în Giuoco Piano.',
  '14', 'Rocadă! Regele la adăpost, te pregătești pentru complicații tactice.',
  '16', 'bxc3 — retrai cu pionul, centru dublu pe c3/d4. Vei juca d5 sau f4.',
  '17', 'Adversarul joacă d5 — eliberare centrală. Pozitie critică!',
  '18', 'exd5 — iei pe d5. Centru puternic cu posibilitate de atac.'
)
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'italian-game') AND variation_code = 'A';

-- Linia B: Giuoco Pianissimo (vs Cf6) — user = white (4.d3 system, ECO C50)
-- moves: e2e4 e7e5 g1f3 b8c6 f1c4 g8f6 d2d3 f8c5 c2c3 d7d6 b1d2 a7a6 b2b4 c5a7 a2a4 e8g8 e1g1 h7h6 d1e2
UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'e4 — deschidere regală clasică.',
  '1', 'Adversarul joacă e5 — simetrie, lupta pentru centru.',
  '2', 'Cf3 — presiune pe e5.',
  '3', 'Adversarul joacă Cc6.',
  '4', 'Fc4 — nebunul italian, vizează f7.',
  '5', 'Adversarul joacă Cf6 — Two Knights! Atacă e4 imediat în loc să dezvolte nebunul.',
  '6', 'd3 — sistem giuoco pianissimo. Joc pozițional lent, eviți complicațiile din 4.Cg5.',
  '7', 'Adversarul joacă Fc5 — setup simetric, pregătire de rocadă.',
  '8', 'c3 — pregătești d4 sau întărești centrul.',
  '9', 'Adversarul joacă d6 — structură solidă, susține e5.',
  '10', 'Cd2 — cal flexibil pe d2. Lasă c3 disponibil și pregătește Cf1-e3.',
  '11', 'Adversarul joacă a6 — pregătește b5 pentru a ataca nebunul tău de pe c4.',
  '12', 'b4! — atac de flanc preventiv. Câștigi spațiu și blochezi b5 advers.',
  '13', 'Adversarul retrage nebunul la a7 — în siguranță dar pasiv.',
  '14', 'a4 — continui expansiunea pe flancul damei. Blochezi b5 definitiv.',
  '15', 'Adversarul face rocadă.',
  '16', 'Rocadă — te pregătești pentru atac pe flancul regelui.',
  '17', 'Adversarul joacă h6 — previne Cg5.',
  '18', 'De2 — pregătești reorganizarea. Planuri posibile: e5, f4, sau Cf1-e3.'
)
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'italian-game') AND variation_code = 'B';

-- Linia C: Apărarea Ungară (vs Be7) — user = white
-- moves: e2e4 e7e5 g1f3 b8c6 f1c4 f8e7 d2d3 d7d6 c2c3 g8f6 b1d2 e8g8 e1g1 a7a5 d1e2 b7b5 c4b3 a5a4 b3c2
UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'e4 — deschidere activă.',
  '2', 'Cf3 — presiune pe e5.',
  '4', 'Fc4 — nebunul italian.',
  '5', 'Adversarul joacă Fe7 — Apărarea Ungară. Renunță la agresivitate pentru o structură solidă.',
  '6', 'd3 — joc pozițional, giuoco pianissimo. Adversarul nu amenință nimic acut.',
  '8', 'c3 — pregătești d4 pe termen lung.',
  '10', 'Cd2 — cal flexibil, pregătit pentru Cf1-e3 sau g4.',
  '11', 'Adversarul face rocadă — regele în siguranță.',
  '12', 'Rocadă — te pregătești pentru atac.',
  '13', 'Adversarul joacă a5 — contra-joc pe flancul damei.',
  '14', 'De2 — pregătești f4 și atacul pe flancul regelui.',
  '15', 'Adversarul joacă b5 — atacă nebunul de pe c4!',
  '16', 'Fb3 — retrage nebunul pe b3. Sigur și menține presiunea pe f7.',
  '17', 'Adversarul avansează cu a4 — presiune continuă.',
  '18', 'Fc2 — nebunul la c2. Sigur și menține influența pe diagonala b1-h7.'
)
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'italian-game') AND variation_code = 'C';

-- ============================================================
-- SICILIAN DEFENSE (user = black, plies 1,3,5,7,9,11,13,15,17)
-- ============================================================

-- Linia A: Najdorf (a6) — user = black
-- moves: e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 a7a6 c1e3 e7e5 d4b3 f8e7 f2f3 e8g8 d1d2 b8c6 e1c1
UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'Adversarul deschide cu e4 — deschidere regală, control central.',
  '1', 'c5 — Apărarea Siciliană! Creezi dezechilibru imediat. Nu imiti, contraataci!',
  '2', 'Adversarul joacă Cf3 — pregătește d4.',
  '3', 'd6 — pregătești Cf6 și susții viitorul e5. Structura de bază Najdorf.',
  '4', 'Adversarul joacă d4 — deschide centrul. Trebuie să răspunzi.',
  '5', 'cxd4 — schimbi pe d4! Elimini pionul central advers și câștigi spațiu.',
  '6', 'Adversarul recapturează cu calul pe d4 — cal centrat, puternic.',
  '7', 'Cf6 — atacă e4 și pregătești rocada. Cea mai activă mutare.',
  '8', 'Adversarul joacă Cc3 — susține e4.',
  '9', 'a6 — mutarea Najdorf! Previi Cb5 și pregătești b5 sau e5. Extremă flexibilitate.',
  '10', 'Adversarul joacă Fe3 — English Attack. Planul agresiv cu f3 și g4 urmează.',
  '11', 'e5! — câștigai spațiu și elimini calul de pe d4 din centru. Contra-joc puternic.',
  '12', 'Adversarul retrage calul la b3 — menține presiunea pe d5 și c5.',
  '13', 'Fe7 — pregătire de rocadă scurtă. Important să adăpostești regele.',
  '14', 'Adversarul joacă f3 — baza English Attack. Urmează g4 și g5.',
  '15', 'Rocadă! Regele la adăpost înainte ca adversarul să înceapă atacul pe flanc.',
  '16', 'Adversarul pregătește Dd2 și rocadă lungă — atac de ambele parți urmează.',
  '17', 'Cc6 — cal activ pe c6, presiune pe d4. Îmbunătățești coordonarea.',
  '18', 'Adversarul face rocadă lungă — atac pe flancul regelui tău va urma!'
)
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'sicilian-defense') AND variation_code = 'A';

-- Linia B: Scheveningen — Atacul Keres (g4) — user = black (ECO B81)
-- moves: e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 e7e6 g2g4 h7h6 g4g5 h6g5 h1g1 g5g4 d1g4 e6e5 d4f5
UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'Adversarul deschide cu e4.',
  '1', 'c5 — Siciliana! Dezechilibru imediat.',
  '3', 'd6 — structura Scheveningen, flexibilă.',
  '5', 'cxd4 — schimbi pe d4.',
  '7', 'Cf6 — ataci e4.',
  '9', 'e6 — Scheveningen! Spre deosebire de Najdorf (d6+a6), aici joci e6. Mai solid, vizezi d5 mai târziu.',
  '10', 'Adversarul joacă g4! — English Attack agresiv. Atacul pe flancul tău va fi rapid.',
  '11', 'h6 — previi g5 care ar alunga calul de pe f6. Câștigai un tempo important.',
  '12', 'Adversarul avansează g5 oricum — sacrificiu de pion?',
  '13', 'hxg5! — capturezi pionul. Ia ce îți oferă adversarul liber!',
  '14', 'Adversarul activează turnul pe coloana g — presiune crește.',
  '15', 'gxg4! — iei și al doilea pion! Trebuie să fii curajos în Siciliană.',
  '16', 'Adversarul recapturează cu dama pe g4.',
  '17', 'e5 — câștigai spațiu central și elimini calul de pe d4 care era amenințare.',
  '18', 'Adversarul mută calul la f5 — amenință Cd6+ sau Cxg7. Fii atent la tactici!'
)
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'sicilian-defense') AND variation_code = 'B';

-- Linia C: Dragon (g6) — user = black
-- moves: e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 g7g6 c1e3 f8g7 d1d2 e8g8 e1c1 b8c6 f2f3 d6d5 d4c6
UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'Adversarul deschide cu e4.',
  '1', 'c5 — Siciliana Dragon, una dintre cele mai tactice variante din șah!',
  '3', 'd6 — pregătești g6 și Fg7. Dragon setup.',
  '5', 'cxd4 — schimbi pe d4.',
  '7', 'Cf6 — atacă e4.',
  '9', 'g6 — fianchetto! Nebunul Dragon pe g7 va apăsa pe marea diagonală. Ideea centrală a Dragon-ului.',
  '10', 'Adversarul joacă Fe3 — Yugoslav Attack! Cel mai agresiv și teoretic răspuns la Dragon.',
  '11', 'Fg7 — nebunul Dragon! Pe g7 apasă direct pe d4 și controlează diagonala lungă.',
  '12', 'Adversarul pregătește Dd2 și rocadă lungă — atac masiv urmează.',
  '13', 'Rocadă scurtă! Regele la adăpost. Dacă întârzii rocada, adversarul atacă rapid.',
  '14', 'Adversarul face rocadă lungă — ambele tabere atacă în direcții opuse. Viteză maximă!',
  '15', 'Cc6 — cal activ, presiune pe d4. Pregătești contra-jocul cu d5.',
  '16', 'Adversarul joacă f3 — susține e4 și pregătește g4-g5.',
  '17', 'd5! — contra-jocul central caracteristic Dragon-ului! Explodezi centrul.',
  '18', 'Adversarul schimbă pe c6 — elimină apărătorul, deschide coloana d.'
)
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'sicilian-defense') AND variation_code = 'C';

-- ============================================================
-- CARO-KANN DEFENSE (user = black, plies 1,3,5,7,9,11,13,15,17)
-- ============================================================

-- Linia A: Varianta Clasică (Ff5) — user = black (ECO B18)
-- moves: e2e4 c7c6 d2d4 d7d5 b1c3 d5e4 c3e4 c8f5 e4g3 f5g6 h2h4 h7h6 g1f3 b8d7 h4h5 g6h7 f1d3 h7d3 d1d3
UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'Adversarul deschide cu e4.',
  '1', 'c6 — Caro-Kann! Muți pionul c pentru a susține d5 cu structură. Mai solid decât e5, mai activ decât e6.',
  '2', 'Adversarul construiește centru cu d4.',
  '3', 'd5 — atacul direct al centrului! Scopul Caro-Kann. c6 a pregătit exact această mutare.',
  '4', 'Adversarul apără e4 cu calul.',
  '5', 'dxe4 — schimbi pe e4! Varianta Clasică Caro-Kann — simplifici centrul.',
  '6', 'Adversarul recapturează cu calul pe e4 — centrat și agresiv.',
  '7', 'Ff5! — mutarea definitorie a variantei clasice! Nebunul iese activ ÎNAINTE de e6. Raritate valoroasă.',
  '8', 'Adversarul atacă nebunul cu Cg3 — forțat să te retragi.',
  '9', 'Fg6 — nebunul pe g6, în siguranță și activ.',
  '10', 'Adversarul joacă h4 — încearcă să câștige teren și să prindă nebunul cu h5.',
  '11', 'h6! — previi h5. Menții nebunul pe g6, nu te lași prins.',
  '12', 'Adversarul continuă dezvoltarea cu Cf3.',
  '13', 'Cd7 — development solid. Pregătești Cgf6.',
  '14', 'Adversarul avansează h5 oricum.',
  '15', 'Fh7 — nebunul pe h7. Pasiv dar în siguranță.',
  '16', 'Adversarul vrea să schimbe nebunii cu Fd3.',
  '17', 'Fxd3 — schimbi! Simplifici și elimini o piesă activă adversă. Egalitate bună.',
  '18', 'Adversarul recapturează cu dama. Ai o structură solidă, joaca de la egal.'
)
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'caro-kann-defense') AND variation_code = 'A';

-- Linia B: Varianta Avans — user = black (ECO B12)
-- moves: e2e4 c7c6 d2d4 d7d5 e4e5 c8f5 g1f3 e7e6 f1e2 c6c5 e1g1 b8c6 c2c3 d8b6 g3f1 c5c4 f3e1 f5e4
UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'Adversarul deschide cu e4.',
  '1', 'c6 — Caro-Kann! Soliditate și structură.',
  '2', 'Adversarul construiește cu d4.',
  '3', 'd5 — atacul centrului.',
  '4', 'Adversarul înaintează e5 — Varianta Avans. Nu mai schimbi, pionul advers avansează.',
  '5', 'Ff5! — nebunul iese înainte de e6! Aceeași idee ca în varianta clasică, adaptată la avans.',
  '6', 'Adversarul joacă Cf3.',
  '7', 'e6 — susții d5 și pregătești nebunul de câmp regal să iasă.',
  '8', 'Adversarul joacă Fe2 — pregătire de rocadă.',
  '9', 'c5 — contra-joc pe flancul damei! Atacă d4 și deschizi jocul în favoarea ta.',
  '10', 'Adversarul face rocadă.',
  '11', 'Cc6 — cal activ, presiune pe d4 și e5.',
  '12', 'Adversarul joacă c3 — susține centrul.',
  '13', 'Db6 — presiune pe b2 și d4 simultan! Dama activă pe b6.',
  '14', 'Adversarul joacă Ca3! — Planul Sveshnikov. Calul vizează c2 pentru a apăra indirect b2 și d4.',
  '15', 'c4 — câștigai spațiu și blochezi centrul advers! Pionul pe c4 e greu de eliminat.',
  '16', 'Adversarul retrage Ce1 — eliberează câmpul f3 și pregătește reorganizarea centrală.',
  '17', 'Fe4! — nebunul activ pe e4, presiune centrală crescândă. Contra-joc solid.'
)
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'caro-kann-defense') AND variation_code = 'B';

-- Linia C: Varianta Schimb (exd5) — user = black
-- moves: e2e4 c7c6 d2d4 d7d5 e4d5 c6d5 c2c4 g8f6 b1c3 e7e6 g1f3 f8e7 f1d3 e8g8 e1g1 b8c6 a2a3 c6a5 c4c5
UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'Adversarul deschide cu e4.',
  '1', 'c6 — Caro-Kann.',
  '2', 'Adversarul joacă d4.',
  '3', 'd5 — atacul centrului.',
  '4', 'Adversarul schimbă exd5 — Varianta Schimb. Pozitie mai simetrică, mai puțin dinamică.',
  '5', 'cxd5 — recapturezi cu pionul c. Structura devine simetrică, joc de manevra.',
  '6', 'Adversarul joacă c4 — atacă d5.',
  '7', 'Cf6 — cal activ, apără d5 și pregătești e6.',
  '8', 'Adversarul joacă Cc3.',
  '9', 'e6 — susții d5 și pregătești Fd6 sau Fe7.',
  '10', 'Adversarul joacă Cf3.',
  '11', 'Fe7 — pregătire de rocadă. Simplu și solid.',
  '12', 'Adversarul joacă Fd3.',
  '13', 'Rocadă — regele la adăpost.',
  '14', 'Adversarul face rocadă.',
  '15', 'Cc6 — cal activ, presiune pe d4.',
  '16', 'Adversarul joacă a3 — previne Cb4.',
  '17', 'Ca5 — calul atacă c4! Câștigai tempo și spațiu pe flancul damei.',
  '18', 'Adversarul avansează c5 — încearcă să câștige spațiu.'
)
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'caro-kann-defense') AND variation_code = 'C';

-- ============================================================
-- FRENCH DEFENSE (user = black, plies 1,3,5,7,9,11,13,15,17)
-- ============================================================

-- Linia A: Winawer (Fb4) — user = black (ECO C18)
-- moves: e2e4 e7e6 d2d4 d7d5 b1c3 f8b4 e4e5 c7c5 a2a3 b4c3 b2c3 g8e7 d1g4 d8c7 g4g7 h8g8 g7h7 c5d4 g1e2
UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'Adversarul deschide cu e4.',
  '1', 'e6 — Apărarea Franceză! Solid, pregătești d5. Sacrifici ușor coloana f.',
  '2', 'Adversarul joacă d4 — centru puternic.',
  '3', 'd5 — atacul centrului! Scopul Francezie.',
  '4', 'Adversarul joacă Cc3 — susține e4.',
  '5', 'Fb4! — Varianta Winawer! Fixezi calul de pe c3 și ameninți să schimbi, slăbind pionii adversarului.',
  '6', 'Adversarul avansează e5 — închide centrul, joc pe flanc urmează.',
  '7', 'c5! — contra-joc imediat pe flancul damei. Atacă centrul advers înainte să fie prea târziu.',
  '8', 'Adversarul joacă a3 — forțează decizia cu nebunul.',
  '9', 'Fxc3! — schimbi pe c3! Dublezi pionii adversarului. Sacrificii structural în schimbul inițiativei.',
  '10', 'Adversarul recapturează cu pionul — pionii dublați pe c sunt slăbiciune pe termen lung.',
  '11', 'Ce7 — cal pe e7, pregătit pentru Cf5 sau Cg6.',
  '12', 'Adversarul joacă Dg4 — atacă g7 și e6!',
  '13', 'Dc7! — aperi g7 indirect. Dama activă pe c7.',
  '14', 'Adversarul ia pe g7 — sacrificiu de pion agresiv.',
  '15', 'Tg8 — aperi g7 cu turnul, ameninți să prinzi dama adversă!',
  '16', 'Adversarul mută dama la h7 — scapă cu greu.',
  '17', 'cxd4 — iei pe d4! Material egal, dar pozitia ta este mai activă.'
)
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'french-defense') AND variation_code = 'A';

-- Linia B: Tarrasch (Cf6) — user = black (ECO C05)
-- moves: e2e4 e7e6 d2d4 d7d5 b1d2 g8f6 e4e5 f6d7 c2c3 c7c5 f1d3 b8c6 g1e2 c5d4 c3d4 f7f6 e5f6 d7f6 e1g1
UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'Adversarul deschide cu e4.',
  '1', 'e6 — Franceză.',
  '2', 'Adversarul joacă d4.',
  '3', 'd5 — atacul centrului.',
  '4', 'Adversarul joacă Cd2 — Varianta Tarrasch. Mai puțin agresivă decât Cc3, menține flexibilitate.',
  '5', 'Cf6 — atacă e4 și pregătești dezvoltarea.',
  '6', 'Adversarul înaintează e5 — lanț de pioni tipic Francez.',
  '7', 'Cd7 — calul se retrage, dar pregătesc c5 și eliberez pozitia.',
  '8', 'Adversarul joacă c3 — susține centrul.',
  '9', 'c5! — contra-joc imediat! Atacul principal în Franceză — luptă pentru d4.',
  '10', 'Adversarul joacă Fd3.',
  '11', 'Cc6 — cal activ, presiune pe d4.',
  '12', 'Adversarul joacă Ce2.',
  '13', 'cxd4 — schimbi pe d4! Deschizi jocul.',
  '14', 'Adversarul recapturează cu pionul.',
  '15', 'f6! — ataci lanțul de pioni al adversarului! Specific Francez.',
  '16', 'Adversarul ia pe f6.',
  '17', 'Cxf6 — calul revine activ pe f6. Presezi pe e4.',
  '18', 'Adversarul face rocadă.'
)
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'french-defense') AND variation_code = 'B';

-- Linia C: Varianta Avans — c5 timpuriu — user = black (ECO C02)
-- moves: e2e4 e7e6 d2d4 d7d5 e4e5 c7c5 c2c3 b8c6 g1f3 d8b6 a2a3 c5d4 c3d4 c6a5 b2b4 a5c4 f1c4 b6b4 b1d2
UPDATE public.opening_lines SET move_explanations = jsonb_build_object(
  '0', 'Adversarul deschide cu e4.',
  '1', 'e6 — Franceză, solid.',
  '2', 'Adversarul joacă d4.',
  '3', 'd5 — atacul centrului.',
  '4', 'Adversarul înaintează e5 — Varianta Avans. Centru închis, joc pozițional de flanc.',
  '5', 'c5! — contra-joc imediat! Atacă centrul înainte ca adversarul să consolideze.',
  '6', 'Adversarul joacă c3 — susține centrul.',
  '7', 'Cc6 — cal activ, presiune pe d4 și e5.',
  '8', 'Adversarul joacă Cf3.',
  '9', 'Db6 — dama pe b6, presiune pe b2 și d4. Dama este activa devreme în Francez!',
  '10', 'Adversarul joacă a3 — pregătitor.',
  '11', 'cxd4 — schimbi pe d4! Deschizi jocul.',
  '12', 'Adversarul recapturează.',
  '13', 'Ca5 — calul atacă c4 și b3! Câștigai activitate pe flancul damei.',
  '14', 'Adversarul joacă b4 — atacă calul.',
  '15', 'Cc4! — capturezi pionul b4? Nu, calul sare pe c4, captureaza pionul advers!',
  '16', 'Adversarul recapturează cu Fxc4.',
  '17', 'Dxb4 — capturezi pionul! Câștigai material. Pionul b4 era atârnat.',
  '18', 'Adversarul joacă Cd2 — încearcă să se reorganizeze.'
)
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'french-defense') AND variation_code = 'C';
