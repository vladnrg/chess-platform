-- ============================================================
-- Siciliana: capcanele
-- ============================================================
-- Trei curse, fiecare măsurată cu Stockfish la adâncime 18. Două în care poţi
-- cădea tu, una în care cade albul.
--
-- Primele două sunt aceeaşi lăcomie — luarea pionului de e4 cu calul — dar
-- refutate în două feluri diferite, şi tocmai asta le face să merite predate
-- împreună:
--   · în trunchiul comun, după 6...d5 albul are trei şahuri la dispoziţie şi
--     îşi salvează calul cu tempo;
--   · în Dragon, albul reia pur şi simplu cu pionul, iar ...d5 nici nu mai
--     există ca idee, fiindcă nebunul lui de pe c4 acoperă chiar câmpul d5.
-- Aceeaşi mutare, două motive de eşec. Cine le vede pe amândouă nu mai ia
-- pionul din reflex.
--
-- A treia e cea mai simplă din tot cursul, şi o spunem ca atare: albul ia un
-- pion apărat de două ori. Nu e subtilă; e ce se întâmplă când numeri
-- materialul fără să numeri apărătorii.
--
-- Siciliana n-a produs a doua capcană pentru alb care să treacă pragul. Am
-- căutat: ...Cxe4 după rocada lungă a albului, în loc de Nc4, nu duce nicăieri
-- (cel mai mare salt: 0,25). Nu se pune umplutură ca să iasă simetric.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Pionul de e4 — cade negrul
-- ------------------------------------------------------------
select public.seed_trap('sicilian-defense', 1,
  'Pionul de e4, care nu e liber', 'ours',
  'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 f6e4 c3e4 d6d5 f1b5',
  'Se întâmplă în trunchiul comun al oricărei Siciliene deschise, înainte ca variantele să se despartă. După 5.Cc3, pionul de e4 pare apărat o singură dată, iar calul negru de pe f6 îl atacă. Socoteala pare bună, iar dacă albul reia, negrul are ...d5 — o furculiţă pe cal. Numai că furculiţa vine cu o mutare prea târziu: albul are trei şahuri la dispoziţie în poziţia aceea (Cd6+, Cf6+, Nb5+), joacă unul dintre ele, îşi salvează calul cu tempo şi rămâne cu piesa în plus. Evaluarea trece de la +0,50 la +3,37. Regula pe care o predă: când plănuieşti o furculiţă la mutarea următoare, întreabă-te întâi dacă adversarul are un şah.'
);
select public.seed_trap_link('sicilian-defense', 1, 'A', 8);
select public.seed_trap_moves('sicilian-defense', 1, '{
  "7": "Negrul îşi dezvoltă calul pe f6 şi atacă pionul de e4.",
  "8": "Cc3 — îţi aperi pionul. Acum e atacat o dată şi apărat o dată, iar poziţia arată paşnic.",
  "9": "GREŞEALA! Negrul ia oricum. A numărat corect atacatorii şi apărătorii, dar se bazează pe ce urmează, nu pe ce e acum.",
  "10": "Reiei cu calul. Până aici totul e după socoteala lui.",
  "11": "d5 — furculiţa pe care se bizuia: pionul atacă un cal care n-are unde fugi în siguranţă.",
  "12": "Nb5+! Aici se rupe socoteala. Şahul vine înaintea furculiţei: negrul trebuie să se ocupe de rege, iar calul tău pleacă liniştit la mutarea următoare. Rămâi cu un cal în plus."
}'::jsonb);


-- ------------------------------------------------------------
-- 2. Aceeaşi lăcomie în Dragon — cade negrul
-- ------------------------------------------------------------
select public.seed_trap('sicilian-defense', 2,
  'Dragon: acelaşi pion, alt motiv să nu-l iei', 'ours',
  'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 g7g6 c1e3 f8g7 f2f3 e8g8 d1d2 b8c6 f1c4 f6e4 f3e4',
  'În Dragon, luarea pionului de e4 e şi mai ispititoare: nebunul de pe g7 priveşte spre calul de pe c3, deci pare că ai o ţintuire care ţine totul. Numai că albul nu reia cu calul — reia cu pionul de pe f3. Iar ideea de rezervă din cealaltă capcană, ...d5, nu mai există aici: nebunul alb de pe c4 acoperă exact câmpul d5. Evaluarea trece de la +0,62 la +3,29, iar tu rămâi cu o piesă în minus. Merită pusă alături de capcana dinainte: aceeaşi mutare, două motive complet diferite pentru care nu merge.'
);
select public.seed_trap_link('sicilian-defense', 2, 'C', 16);
select public.seed_trap_moves('sicilian-defense', 2, '{
  "15": "Negrul îşi aduce calul pe c6 şi pare că totul e la locul lui.",
  "16": "Nc4 — aici se armează cursa. Nebunul iese spre f7, dar treaba lui adevărată e alta: de pe c4 acoperă câmpul d5.",
  "17": "GREŞEALA! Negrul ia pionul. Se bizuie pe nebunul de pe g7, care ţinteşte calul de pe c3 — dar ţintuirea nu contează dacă nu e nevoie de calul acela.",
  "18": "fxe4 — reiei cu pionul, nu cu calul. Calul de pe c3 rămâne unde e, ţintuirea rămâne fără obiect, iar ...d5 nu se poate juca: nebunul tău de pe c4 păzeşte câmpul. Un cal în plus, fără nicio complicaţie."
}'::jsonb);


-- ------------------------------------------------------------
-- 3. Pionul de d6 — cade albul
-- ------------------------------------------------------------
select public.seed_trap('sicilian-defense', 3,
  'Pionul de d6, apărat de două ori', 'theirs',
  'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 a7a6 c1e3 e7e5 d4b3 f8e7 d1d2 e8g8 e1c1 b7b5 d2d6 d8d6 d1d6 e7d6',
  'Cea mai simplă capcană din curs, şi merită spus limpede: nu e subtilă. În Najdorf, pionul de d6 rămâne mereu puţin în urmă şi arată slab, mai ales după ce joci b5 şi pare că te-ai întins pe flancul damei. Albul se lacomeşte şi îl ia cu dama. Dar d6 e apărat de două ori — de dama ta de pe d8, pe coloană, şi de nebunul de pe e7, pe diagonală. După 10...Dxd6 11.Txd6 Nxd6 ieşi cu turn şi nebun contra damă, adică material în plus. Evaluarea cade de la +0,42 la −4,85 într-o singură mutare. E ce se întâmplă când numeri materialul fără să numeri apărătorii.'
);
select public.seed_trap_link('sicilian-defense', 3, 'A', 17);
select public.seed_trap_moves('sicilian-defense', 3, '{
  "16": "Albul face rocada lungă şi îşi aduce turnul pe coloana d, drept spre pionul tău de d6.",
  "17": "b5 — îţi începi contra-jocul pe flancul damei. Arată de parcă ai lăsat d6 în urmă, şi tocmai asta e momeala.",
  "18": "GREŞEALA ALBULUI! Ia pionul cu dama. A văzut că turnul de pe d1 o sprijină şi a socotit că iese pe plus.",
  "19": "Dxd6 — iei dama cu dama ta. Era acolo tot timpul, pe aceeaşi coloană.",
  "20": "Albul reia cu turnul, singurul lucru care i-a mai rămas de făcut.",
  "21": "Nxd6 — iei şi turnul, cu nebunul de pe e7. Al doilea apărător, cel pe care albul nu l-a numărat. Ieşi cu turn şi nebun contra damă."
}'::jsonb);
