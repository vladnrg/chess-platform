-- ============================================================
-- Patru capcane găsite prin căutare sistematică
-- ============================================================
-- Capcanele de până acum — Caro-Kann, Franceza, Siciliana — au fost alese pe
-- ghicite: mă gândeam la ce greşeală ar face un jucător şi verificam candidatul.
-- La Scandinavă s-a văzut că metoda ratează lucruri evidente: căutarea pe
-- ghicite zicea că deschiderea n-are nicio cursă în care să cadă negrul, iar
-- căutarea sistematică a scos 5...De5+, care pierde dama pe loc.
--
-- Aşa că am reluat şi cursurile terminate, de data asta cum trebuie: la fiecare
-- poziţie din fiecare variantă, motorul a evaluat TOATE mutările legale
-- (MultiPV 60). Din 1018 mutări care pierdeau peste doi pioni au rămas patru,
-- după trei filtre:
--
--   · afară gafele simple — cele unde răspunsul e „îţi iau piesa pe care tocmai
--     ai mutat-o". Aia nu-i capcană, e neatenţie (766 aruncate);
--   · afară poziţiile unde pierd multe mutări deodată la acelaşi răspuns. Acolo
--     lovitura vine oricum, nu e o cursă întinsă de cineva (230 aruncate);
--   · din cele 22 rămase, afară ce dubla o capcană existentă — Franceza avea
--     deja „Nebunul pleacă de pe c1 şi b2 rămâne singur", iar 6.Nd2 Dxb2 e
--     aceeaşi lecţie pe alt câmp — şi afară cele unde câştigul era sub o piesă.
--     O capcană care aduce jumătate de pion nu merită o lecţie.
--
-- Fiecare dintre cele patru a fost verificată la adâncime 20: mutarea greşită
-- nu intră nici măcar în primele şase, iar materialul de la capătul liniei a
-- fost numărat, nu presupus.
-- ============================================================


-- ------------------------------------------------------------
-- Caro-Kann 4. Dama pe d6 — singurul câmp de pe care nu se poate repara
-- ------------------------------------------------------------
-- Perechea cu capcana 5: acelaşi motiv tactic, o dată în defavoarea ta, o dată
-- în favoarea ta. Merită parcurse una după alta.
select public.seed_trap('caro-kann-defense', 4,
  'Dama pe d6 — câmpul de pe care nu mai poţi repara nimic', 'ours',
  'e2e4 c7c6 d2d4 d7d5 b1c3 d5e4 c3e4 c8f5 e4g3 d8d6 g3f5',
  'După 5.Cg3 nebunul tău de pe f5 e atacat şi nu-l apără nimeni. Lucrul surprinzător e că nu eşti obligat să-l muţi. Dacă joci 5...Cf6 şi albul ia cu 6.Cxf5, ai 6...Da5+ — dama dă şah pe diagonala spre e1 şi loveşte, pe linia a cincea, chiar calul de pe f5; îţi iei piesa înapoi. Dacă joci 5...Dd7 sau 5...Dc8, dama vede f5 şi reia acolo. Toate merg. Singura care nu merge e 5...Dd6: de pe d6 dama nu vede f5 şi nu poate ajunge la a5. E singurul câmp din care pleacă amândouă soluţiile deodată, şi de aceea nebunul chiar se pierde — verificat, rămâi cu o piesă în minus şi fără nimic în schimb. Lecţia nu e „mută nebunul atacat", ci una mai bună: când o piesă de-a ta e atacată, întreabă-te nu doar cum o salvezi, ci şi ce ai rămâne să faci dacă adversarul o ia.'
);
select public.seed_trap_link('caro-kann-defense', 4, 'A', 8);
select public.seed_trap_moves('caro-kann-defense', 4, '{
  "7": "Nf5 — scoţi nebunul afară înainte să-l închizi cu e6. E chiar ideea Variantei Clasice, mutarea bună.",
  "8": "Cg3 — calul se retrage din atacul nebunului tău şi, în aceeaşi mişcare, îl atacă. Aici se cere atenţie: nebunul e pe f5 şi nu-l apără nimeni.",
  "9": "GREŞEALA! Dd6. Arată ca o dezvoltare cuminte, dama iese pe un câmp central şi priveşte spre d4. Numai că e singurul câmp de unde nu vede f5 şi de unde nu mai poate ajunge la a5.",
  "10": "Cxf5 — albul ia nebunul, pur şi simplu. Uită-te acum ce ai: Dxf5 nu e legal, Da5+ nu e legal. De pe d7 sau d8 ai fi avut una din ele. De pe d6, niciuna."
}'::jsonb);


-- ------------------------------------------------------------
-- Caro-Kann 5. Calul pe h5 şi dama de pe a5 — aceeaşi idee, în favoarea ta
-- ------------------------------------------------------------
select public.seed_trap('caro-kann-defense', 5,
  'Calul pe h5, luat de dama care dă şah', 'theirs',
  'e2e4 c7c6 d2d4 d7d5 b1c3 d5e4 c3e4 c8f5 e4g3 f5g6 h2h4 h7h6 g3h5 d8a5 c1d2 a5h5',
  'Aceeaşi idee ca la capcana dinainte, doar că acum lucrează pentru tine. Albul a pornit cu h4 vânătoarea nebunului tău şi, ameţit de atac, pune calul pe h5. Câmpul e nesprijinit, şi mai ales e pe linia a cincea. Dama ta de pe d8 ajunge la a5 cu şah — diagonala a5-e1 e liberă, fiindcă pionul tău de pe d5 a plecat demult la e4 — iar de pe a5 vede tot rândul până la h5. Albul are cinci feluri de a para şahul şi niciunul nu apără calul: după orice ar juca, urmează Dxh5 şi rămâi cu o piesă în plus. Reţine forma: dama pe a5 dă şah pe diagonală şi loveşte pe orizontală în acelaşi timp.'
);
select public.seed_trap_link('caro-kann-defense', 5, 'A', 11);
select public.seed_trap_moves('caro-kann-defense', 5, '{
  "10": "h4 — albul porneşte după nebunul tău de pe g6. Mutarea e bună şi face parte din teorie; grija ta e să nu-l laşi prins.",
  "11": "h6 — îi tai h5 pionului. De aici încolo, dacă albul mai vrea pe h5, trebuie să pună o piesă.",
  "12": "GREŞEALA ALBULUI! Ch5. Pare că apasă în continuare, doar că pe h5 calul nu e apărat de nimic — iar h5 e pe aceeaşi linie cu a5.",
  "13": "Da5+ — şah pe diagonala a5-e1, care e liberă de când pionul tău de pe d5 a luat pe e4. Şi, în acelaşi timp, dama se uită de-a lungul liniei a cincea la calul de pe h5.",
  "14": "Albul trebuie să pareze şahul. Are cinci mutări şi niciuna nu apucă să apere şi calul.",
  "15": "Dxh5 — iei calul. O piesă în plus, dintr-o damă care a lucrat pe două direcţii deodată."
}'::jsonb);


-- ------------------------------------------------------------
-- Siciliana 4. Dragon: dama pe b6, în bătaia unui nebun încă acoperit
-- ------------------------------------------------------------
select public.seed_trap('sicilian-defense', 4,
  'Dragon: dama pe b6, în bătaia unui nebun încă acoperit', 'ours',
  'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 g7g6 c1e3 f8g7 d1d2 d8b6 f1b5 c8d7 d4f5 b6a5 f5g7',
  'În multe variante ale Sicilienei, dama pe b6 e o mutare bună: bate spre b2 şi apasă pe d4. Aici e pierzătoare, dintr-un motiv care se vede greu — nebunul alb de pe e3 se uită deja spre b6 pe diagonala e3-d4-c5-b6, numai că drumul îi e închis de propriul cal de pe d4. Atâta timp cât calul stă acolo, dama ta pare în siguranţă. Apoi albul joacă Cf5, iar calul face două lucruri într-o mutare: pleacă de pe d4 şi descoperă nebunul asupra damei tale, şi atacă nebunul tău de pe g7. Nu poţi rezolva amândouă. Iei calul cu 9...gxf5 şi urmează 10.Nxb6, pierzi dama; muţi dama cu 9...Da5 şi urmează 10.Cxg7+, pierzi nebunul. Verificat în ambele direcţii. Lecţia: înainte să pui dama pe o diagonală, uită-te ce stă la capătul ei chiar şi atunci când drumul pare blocat — mai ales dacă e blocat de o piesă a adversarului, fiindcă aceea poate pleca oricând.'
);
select public.seed_trap_link('sicilian-defense', 4, 'C', 12);
select public.seed_trap_moves('sicilian-defense', 4, '{
  "11": "Ng7 — îţi termini fianchetto-ul. Nebunul ăsta e piesa cea mai bună pe care o ai în Dragon.",
  "12": "Dd2 — albul leagă piesele şi pregăteşte rocada lungă. Poziţia e normală, teoretică.",
  "13": "GREŞEALA! Db6. Dama iese activ, bate spre b2 şi apasă pe calul de pe d4. Pare exact ce se joacă în alte Siciliene. Uită-te însă pe diagonala e3-b6: nebunul alb e deja acolo, doar că propriul cal îi stă în drum.",
  "14": "Nb5+ — un şah intermediar, care te obligă să acoperi şi îţi ia o mutare din care ai fi putut repara ceva.",
  "15": "Nd7 — parezi şahul; e cea mai bună apărare pe care o ai, dar poziţia e deja pierdută.",
  "16": "Cf5!! — calul pleacă de pe d4 şi descoperă nebunul de pe e3 asupra damei tale, iar el atacă nebunul de pe g7. Două ameninţări dintr-o mutare.",
  "17": "Da5 — muţi dama de sub nebun. Alternativa, 9...gxf5, ia calul dar pierde dama după 10.Nxb6.",
  "18": "Cxg7+ — nebunul de fianchetto cade, şi încă cu şah, aşa că n-ai timp să faci nimic altceva. Regele are două câmpuri. Pe f8 ar ataca într-adevăr calul, dar e rândul albului şi calul pleacă liniştit; pe d8 rămâi cu regele blocat în centru. În ambele cazuri eşti cu o piesă în minus şi fără nebunul care ţinea toată poziţia."
}'::jsonb);


-- ------------------------------------------------------------
-- Siciliana 5. Najdorf: nebunul pe f4, alungat de pionul care loveşte două piese
-- ------------------------------------------------------------
select public.seed_trap('sicilian-defense', 5,
  'Najdorf: nebunul pe f4 şi pionul care loveşte două piese', 'theirs',
  'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 a7a6 c1f4 e7e5 f4g3 e5d4 d1d4 b8c6',
  'Nebunul pe f4 arată firesc: se dezvoltă, ocupă o diagonală bună şi apasă pe pionul de d6. Numai că în Najdorf pionul de pe e7 are exact un pas de făcut, iar e5 loveşte deodată nebunul de pe f4 şi calul de pe d4 — sunt pe aceeaşi linie oblică din faţa pionului. Albul nu le poate salva pe amândouă, şi asta a fost verificată pe toate variantele: 7.Ng3 sau 7.Ne3 salvează nebunul şi pierde calul după exd4; 7.Cb3, 7.Cf3 sau 7.Cf5 salvează calul şi pierd nebunul după exf4. În fiecare caz rămâi cu o piesă întreagă în plus pentru un pion. De asta în Najdorf albul îşi pune nebunul pe e3 sau pe g5, nu pe f4: pe e3 e apărat de dama care vine pe d2, iar pionul de e5 nu-l atinge.'
);
select public.seed_trap_link('sicilian-defense', 5, 'A', 9);
select public.seed_trap_moves('sicilian-defense', 5, '{
  "8": "Cc3 — albul îşi termină dezvoltarea din centru. Poziţia e Siciliana deschisă, obişnuită.",
  "9": "a6 — mutarea care dă numele Najdorfului. Ia b5 pieselor albe şi pregăteşte e5 sau e6.",
  "10": "GREŞEALA ALBULUI! Nf4. Nebunul iese pe o diagonală bună şi se uită la pionul tău de d6. Ce n-a socotit e că nebunul şi calul lui de pe d4 stau acum pe aceeaşi oblică, chiar în faţa pionului tău de e7.",
  "11": "e5! — un singur pas de pion, două piese atacate. Nu e o furculiţă de cal, e una de pion, şi funcţionează la fel.",
  "12": "Albul îşi salvează nebunul cu Ng3. Dacă ar fi salvat calul, ai fi luat nebunul cu exf4 — acelaşi rezultat.",
  "13": "exd4 — iei calul.",
  "14": "Albul reia pionul cu dama, ca să nu rămână cu piesă în minus pe faţă. Tot cu o piesă în minus rămâne, doar că a recuperat un pion.",
  "15": "Cc6 — ataci dama şi te dezvolţi în acelaşi timp. Ai un cal în plus pentru un pion, iar albul e la mutare cu dama sub atac."
}'::jsonb);
