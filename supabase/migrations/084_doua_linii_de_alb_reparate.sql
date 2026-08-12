-- ============================================================
-- Două linii de alb care predau împotriva unei gafe
-- ============================================================
-- Auditul meu de la început a avut un defect de care mi-am dat seama abia când
-- am calculat planurile de joc de mijloc: la cursurile de alb am semnalat doar
-- liniile care se termină prea PROST pentru alb, nu şi pe cele care se termină
-- nerealist de BINE. Or, o linie care se încheie la +3,9 pentru alb nu e o
-- lecţie bună — înseamnă că adversarul a făcut o gafă, iar cursantul învaţă o
-- variantă pe care n-o va vedea niciodată la masă.
--
-- Am reluat verificarea pe toate cele 30 de variante de alb, de data asta în
-- ambele direcţii. Au ieşit două:
--
-- · Gambitul Damei B se încheia la +3,93 cu albul o piesă în plus, fiindcă
--   9...Ce5 pur şi simplu atârnă calul: nimic nu-l poate relua pe e5. Linia
--   nouă joacă 9...Cb4, a doua ca valoare la motor şi o mutare adevărată, iar
--   linia se încheie la +0,45 — un avantaj normal de alb.
--
-- · Gambitul Regelui B se încheia la +2,56, fiindcă 9...Nh5 lăsa nebunul să fie
--   prins cu 10.g4. Aici reparaţia a fost mai grea şi merită spus de ce.
--
-- Am încercat şase variante ale Apărării Cunningham şi niciuna nu-l duce pe alb
-- măcar la egalitate: cea mai bună dă −0,99. Am încercat apoi alte apărări —
-- 3...d5 dă −1,86, 3...Cf6 dă −4,21. Adevărul e simplu şi n-are rost ascuns:
-- Gambitul Regelui e obiectiv prost pentru alb după apărarea corectă. Cea mai
-- bună variantă găsită e clasica 3...g5, la −0,70 cu un pion în minus — adică
-- o poziţie de gambit adevărată, cu compensaţie, nu una pur şi simplu proastă.
-- Varianta B devine linia clasică, iar lecţia spune pe faţă ce arată motorul.
-- ============================================================


-- ------------------------------------------------------------
-- GAMBITUL DAMEI · B — cu 9...Cb4 în loc de calul atârnat
-- ------------------------------------------------------------
select public.seed_line_text('queens-gambit', 'B',
  'd2d4 d7d5 c2c4 d5c4 g1f3 g8f6 e2e3 e7e6 f1c4 c7c5 e1g1 a7a6 c4b3 b8c6 b1c3 b7b5 d4d5 c6b4 e3e4',
  '{
  "0": "d4 — deschizi cu pionul de damă.",
  "1": "d5 — răspuns în centru.",
  "2": "c4 — Gambitul Damei.",
  "3": "dxc4 — Gambitul Damei Acceptat. Adversarul chiar ia pionul. Nu-l poate ţine — ai să ţi-l iei înapoi — dar în schimb ţi-a cedat centrul, şi asta e tot ce ai vrut.",
  "4": "Cf3 — te dezvolţi şi, mai important, îi tai câmpul e5 şi împingerea b5 care ar sprijini pionul furat.",
  "5": "Cf6 — adversarul se dezvoltă.",
  "6": "e3 — deschizi drumul nebunului de pe f1, cel care îşi va lua pionul înapoi.",
  "7": "e6 — adversarul îşi eliberează şi el nebunul de pe f8.",
  "8": "Nxc4 — abia acum îţi iei pionul, cu nebunul care ajunge pe cea mai bună diagonală de pe tablă, spre f7. Ai un centru mare şi o piesă activă; el are un tempo pierdut cu pionul plimbat.",
  "9": "c5 — adversarul loveşte pionul de d4, singurul fel în care poate scăpa de presiune.",
  "10": "Rocada. Regele la adăpost înainte să se deschidă centrul.",
  "11": "a6 — adversarul pregăteşte b5, ca să-ţi alunge nebunul.",
  "12": "Nb3 — îl retragi din vreme, pe câmpul unde va sta în siguranţă şi va privi în continuare spre f7.",
  "13": "Cc6 — adversarul îşi aduce calul, atacând a doua oară pionul de d4.",
  "14": "Cc3 — îţi termini dezvoltarea şi ţii d5 sub ochi.",
  "15": "b5 — adversarul îşi ia spaţiu pe flancul damei.",
  "16": "d5! — mutarea care lămureşte totul. Împingi pionul înainte în loc să-l aperi, îi tai calului de pe c6 câmpul şi îţi deschizi nebunul de pe b3 spre f7.",
  "17": "Cb4 — calul se dă la o parte spre b4, de unde ţinteşte câmpurile c2 şi d3. E cea mai bună retragere pe care o are; alta, spre e5, ar fi pur şi simplu pierdut piesa, fiindcă acolo nu-l apără nimic.",
  "18": "e4 — îţi construieşti centrul mare, cu pioni pe d5 şi e4, şi îi tai calului de pe b4 orice speranţă de a se întoarce prin d5. Deschiderea s-a încheiat cu albul un pic mai bine: centru puternic, nebunul îndreptat spre f7 şi un cal advers rătăcit pe marginea tablei."
}'::jsonb);


-- ------------------------------------------------------------
-- GAMBITUL REGELUI · B — clasica cu 3...g5, în locul Cunningham-ului
-- ------------------------------------------------------------
select public.seed_line_text('kings-gambit', 'B',
  'e2e4 e7e5 f2f4 e5f4 g1f3 g7g5 h2h4 g5g4 f3e5 g8f6 d2d4 d7d6 e5d3 f6e4 c1f4 f8g7 b1c3 e4c3 b2c3',
  '{
  "0": "e4 — deschizi cu pionul de rege.",
  "1": "e5 — adversarul răspunde simetric.",
  "2": "f4 — Gambitul Regelui. Îi oferi un pion ca să-i scoţi pionul de e5 din centru şi ca să-ţi deschizi coloana f.",
  "3": "exf4 — adversarul acceptă.",
  "4": "Cf3 — te dezvolţi şi, mai ales, îi tai damei drumul spre h4, de unde ar da şah şi ţi-ar strica poziţia din prima.",
  "5": "g5 — apărarea clasică, şi cea mai directă. Adversarul îşi apără pionul de pe f4 cu al doilea pion, în loc să se dezvolte. Arată provocator şi chiar e: îşi slăbeşte singur regele, dar ţine materialul.",
  "6": "h4 — loveşti lanţul lui de pioni de la capăt. Nu-l laşi să se aşeze cu g5 şi h6.",
  "7": "g4 — pionul trece mai departe şi îţi atacă calul de pe f3.",
  "8": "Ce5 — Gambitul Kieseritzky. Calul sare înainte în loc să se retragă. De pe e5 stă în mijlocul tablei şi priveşte spre g4, f7 şi d7.",
  "9": "Cf6 — adversarul se dezvoltă şi îţi atacă pionul de e4.",
  "10": "d4 — îţi construieşti centrul şi îţi deschizi nebunul de pe c1 spre pionul de f4.",
  "11": "d6 — adversarul îţi alungă calul din centru.",
  "12": "Cd3 — calul se retrage pe d3, nu pe f3 sau g4. De acolo apără pionul de f4 pe care vrei să-l recuperezi şi nu stă în calea nimănui.",
  "13": "Cxe4 — adversarul îşi ia pionul. Are acum doi pioni în plus, ceea ce sună mult, dar unul dintre ei — cel de pe g4 — e departe de tot şi greu de apărat.",
  "14": "Nxf4 — îţi iei pionul înapoi cu nebunul, care ajunge exact pe câmpul pentru care ai jucat toată deschiderea.",
  "15": "Ng7 — adversarul îşi scoate nebunul pe diagonala lungă.",
  "16": "Cc3 — ataci calul lui de pe e4 şi îţi termini dezvoltarea.",
  "17": "Cxc3 — adversarul schimbă.",
  "18": "bxc3 — reiei cu pionul de pe b. Şi acum, socoteala cinstită. Ai un pion în minus şi pionii de pe c dublaţi; în schimb ai centrul, doi nebuni buni şi coloana f deschisă. Motorul îl pune pe negru puţin mai bine, la 0,7, şi merită ştiut de la început: Gambitul Regelui nu e o deschidere care câştigă prin sine. E o deschidere care scoate partida din cărţi şi o duce într-un loc unde câştigă cine calculează mai bine. Dacă vrei avantaj sigur din deschidere, joci altceva; dacă vrei o partidă în care nimeni nu ştie teoria pe de rost, e alegerea potrivită."
}'::jsonb);


-- ------------------------------------------------------------
-- Numele variantei B, care nu mai e Cunningham
-- ------------------------------------------------------------
update public.opening_lines l
   set variation_name = 'Gambitul Regelui Acceptat — clasica cu 3...g5'
  from public.courses c
 where l.course_id = c.id and c.slug = 'kings-gambit' and l.variation_code = 'B';


-- ============================================================
-- DOVADA — toate cifrele trebuie să fie 0
-- ============================================================
select
  (select count(*) from public.opening_lines l join public.courses c on c.id = l.course_id
    where c.slug = 'queens-gambit' and l.variation_code = 'B'
      and l.moves_uci not like '%c6b4%')                                        as damei_b_nereparat,
  (select count(*) from public.opening_lines l join public.courses c on c.id = l.course_id
    where c.slug = 'kings-gambit' and l.variation_code = 'B'
      and l.moves_uci not like '%g7g5%')                                        as regelui_b_nereparat,
  (select count(*) from public.opening_lines l join public.courses c on c.id = l.course_id
    where c.slug = 'kings-gambit' and l.variation_code = 'B'
      and l.variation_name ilike '%Cunningham%')                                as nume_vechi_ramas,
  (select count(*) from public.opening_lines l join public.courses c on c.id = l.course_id
    where l.user_color = 'white'
      and array_length(string_to_array(l.moves_uci, ' '), 1)
          <> (select count(*) from jsonb_object_keys(l.move_explanations)))     as albul_incomplet;
