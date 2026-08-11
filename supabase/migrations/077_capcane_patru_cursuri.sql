-- ============================================================
-- Capcane: Olandeza, Slavul, Pirc, Alekhine
-- ============================================================
-- Căutare sistematică peste toate variantele celor cinci cursuri rămase. Din
-- 1415 mutări care pierdeau peste doi pioni au rămas 29 după filtre, iar din
-- ele patru merită o lecţie.
--
-- Nimzo-Indiana n-a primit nicio capcană şi merită spus de ce, ca să nu pară
-- că am uitat-o. Cei şapte candidaţi ai ei erau toţi de acelaşi fel: Nh6 jucat
-- din senin, care pur şi simplu atârnă nebunul, sau 5.Nd2 în Sämisch, unde
-- albul uită să reia pe c3 şi rămâne cu o piesă în minus înainte ca lecţia să
-- înceapă. O capcană în care elevul e deja cu o piesă în plus la prima mutare
-- nu e o capcană. Când voi găsi ceva adevărat, se adaugă.
--
-- Două dintre cele patru sunt aceeaşi idee în deschideri diferite — împingerea
-- c4-c5, care loveşte nebunul de pe d6 în clipa în care negrul şi-a luat ochii
-- de pe el. Le-am păstrat pe amândouă tocmai fiindcă se repetă: un tipar văzut
-- de două ori se ţine minte altfel decât unul văzut o dată.
-- ============================================================


-- ------------------------------------------------------------
-- Olandeza 1. Dama pe b6, iar pionul vine peste nebun — cade negrul
-- ------------------------------------------------------------
select public.seed_trap('dutch-defense', 1,
  'Stonewall: dama iese, iar c5 vine peste nebun', 'ours',
  'd2d4 f7f5 g2g3 g8f6 f1g2 e7e6 g1f3 d7d5 e1g1 f8d6 c2c4 c7c6 b2b3 d8b6 c4c5 d6c5 d4c5 b6c5 c1a3',
  'Zidul de pioni din Stonewall te face să te simţi în siguranţă, şi asta e problema: începi să joci mutări care „arată bine" fără să le socoteşti. Db6 arată foarte bine — dama iese activ, apasă pe b3 şi pe d4, şi pare că grăbeşte lucrurile. Numai că albul răspunde c5, iar pionul acela loveşte nebunul tău de pe d6, singura piesă care îţi păzea câmpurile negre. Nu-l poţi lăsa şi nu-l poţi salva cu folos: după 8.c5 Nxc5 9.dxc5 Dxc5 ai luat doi pioni pentru un nebun, iar 10.Na3 îţi mai şi goneşte dama. Rămâi cu un pion în minus şi fără piesa care ţinea poziţia. Lecţia nu e „nu juca Db6", ci una mai largă: într-o poziţie închisă, înainte să scoţi dama, uită-te dacă adversarul poate deschide ceva cu un pion.'
);
select public.seed_trap_link('dutch-defense', 1, 'A', 12);
select public.seed_trap_moves('dutch-defense', 1, '{
  "12": "b3 — albul îşi pregăteşte nebunul pentru a3. Mutarea pare fără grabă, dar priveşte unde se va uita nebunul acela: exact spre nebunul tău de pe d6.",
  "13": "GREŞEALA! Db6. Dama iese activ, apasă pe b3 şi pe d4, şi pare că faci ceva. Ce n-ai socotit e că ţi-ai luat ochii de pe nebunul de pe d6.",
  "14": "c5! — pionul îl loveşte. Nebunul e singura ta piesă care păzeşte câmpurile negre, şi acum trebuie să se hotărască.",
  "15": "Nxc5 — iei pionul, cea mai bună dintre variantele proaste. Retragerea nebunului ar fi şi mai rea.",
  "16": "dxc5 — albul îţi ia nebunul cu pionul.",
  "17": "Dxc5 — reiei şi tu al doilea pion. Socoteala: doi pioni pentru un nebun, adică un pion în minus.",
  "18": "Na3 — şi acum vine partea neplăcută. Nebunul iese cu tempo, atacându-ţi dama, şi ocupă chiar diagonala pe care nebunul tău o păzea până acum. Ai pierdut un pion, piesa şi timpul."
}'::jsonb);


-- ------------------------------------------------------------
-- Slavul 1. Acelaşi c5, în Semi-Slavă — cade negrul
-- ------------------------------------------------------------
select public.seed_trap('slav-defense', 1,
  'Semi-Slavă: calul pe b6, iar c5 vine peste nebun', 'ours',
  'd2d4 d7d5 c2c4 c7c6 g1f3 g8f6 b1c3 e7e6 e2e3 b8d7 d1c2 f8d6 f1d3 d7b6 c4c5 d6c5 d4c5',
  'Aceeaşi lovitură ca la Olandeză, într-o deschidere cu totul diferită, şi tocmai de aceea merită văzută de două ori. Calul de pe d7 pare prost aşezat şi Cb6 pare mutarea firească: îl duci pe un câmp mai bun şi ataci pionul de c4. Numai că pionul acela nu stă să fie atacat — merge înainte, la c5, unde loveşte nebunul tău de pe d6. Iar între timp calul tău a plecat de pe d7, adică tocmai de pe câmpul de unde ar fi putut reveni ca să ajute. După 8.c5 Nxc5 9.dxc5 rămâi cu un nebun dat pe un pion. Recuperezi unul mai târziu cu calul, dar rămâi în minus. Regula, aceeaşi în amândouă deschiderile: când ai un nebun pe d6 şi adversarul are pionul pe c4, împingerea c5 e mereu în aer.'
);
select public.seed_trap_link('slav-defense', 1, 'C', 12);
select public.seed_trap_moves('slav-defense', 1, '{
  "12": "Nd3 — albul îşi scoate nebunul. Mutare obişnuită, dar priveşte pionul lui de pe c4: e liber să meargă înainte oricând.",
  "13": "GREŞEALA! Cb6. Calul pleacă de pe d7 şi atacă pionul de c4. Pare o mutare care câştigă timp; e o mutare care pierde piesa. Corect era rocada sau dxc4.",
  "14": "c5! — pionul nu se apără, merge înainte peste nebunul tău de pe d6.",
  "15": "Nxc5 — iei pionul. Nu ai ceva mai bun.",
  "16": "dxc5 — albul îţi ia nebunul. Rămâi cu o piesă dată pe un pion; calul tău de pe b6 va recupera unul mai târziu, dar socoteala rămâne în minus. Iar calul acela e chiar cel care, dacă rămânea pe d7, ar fi putut apăra."
}'::jsonb);


-- ------------------------------------------------------------
-- Pirc 1. Calul sare pe e5 şi nu se mai întoarce — cade albul
-- ------------------------------------------------------------
select public.seed_trap('pirc-defense', 1,
  'Calul care sare pe e5 fără să numere', 'theirs',
  'e2e4 d7d6 d2d4 g8f6 b1c3 g7g6 g1f3 f8g7 f1e2 e8g8 e1g1 c7c6 a2a4 c8g4 f3e5 g4e2 d1e2 d6e5 d4e5 f6d7',
  'Ţi-ai scos nebunul pe g4, ţintind calul de pe f3. Reacţia obişnuită a albului e h3, care te pune să te hotărăşti. Reacţia greşită, şi tentantă, e Ce5: calul sare în centru, se dă la o parte din ţintuire şi pare că atacă ceva. Uită-te însă ce se întâmplă când numeri. Tu iei întâi nebunul de pe e2 — el trebuie să reia, deci nu apucă să facă altceva — şi abia apoi iei calul de pe e5 cu pionul. Ordinea e tot: dacă ai lua calul întâi, el ar lua nebunul cu tempo. Verificat: rămâi cu doi pioni în plus. Regula pe care o predă e despre ordinea capturilor, nu despre Pirc: când ai două capturi de făcut, începe cu cea la care adversarul e obligat să răspundă.'
);
select public.seed_trap_link('pirc-defense', 1, 'A', 13);
select public.seed_trap_moves('pirc-defense', 1, '{
  "13": "Ng4 — îţi scoţi nebunul şi ţinteşti calul de pe f3, cel care apără pionul de d4. Nu ataci pionul, ataci apărătorul.",
  "14": "GREŞEALA ALBULUI! Ce5. Calul iese din ţintuire sărind înainte şi pare că face şi ceva activ. În realitate se aşază pe un câmp de unde nu mai poate pleca.",
  "15": "Nxe2! — prima captură, şi cea care contează. Îi iei nebunul, iar el e obligat să reia; nu are timp să-şi salveze calul.",
  "16": "Dxe2 — albul reia, cum trebuie.",
  "17": "dxe5 — abia acum iei calul. Dacă ai fi luat în ordinea inversă, el ar fi luat nebunul cu tempo şi n-ai fi câştigat nimic.",
  "18": "dxe5 — albul reia şi el un pion, ca să nu rămână cu totul descoperit.",
  "19": "Cfd7 — îţi retragi calul din faţa pionului lui. Numărătoarea finală: doi pioni în plus pentru tine, dintr-o mutare care albului i s-a părut activă."
}'::jsonb);


-- ------------------------------------------------------------
-- Alekhine 1. Calul pe h4, rămas fără apărător — cade albul
-- ------------------------------------------------------------
select public.seed_trap('alekhine-defense', 1,
  'Calul pe h4, care rămâne singur după schimb', 'theirs',
  'e2e4 g8f6 e4e5 f6d5 d2d4 d7d6 g1f3 c8g4 f1e2 e7e6 f3h4 g4e2 d1e2 d8h4',
  'Nebunul tău de pe g4 ţintuieşte calul de pe f3. Albul vrea să scape de ţintuire şi găseşte o soluţie care pare isteaţă: mută calul pe h4, unde nu mai e legat de nimic şi de unde ameninţă să sară pe f5 sau să ia nebunul. Numai că pe h4 calul nu e apărat de nimeni. Tu schimbi nebunii pe e2 — o captură la care albul e obligat să răspundă — iar când reia cu dama, calul de pe h4 rămâne singur pe tablă, iar dama ta îl ia pe aceeaşi coloană pe care a stat toată partida. O piesă întreagă, în trei mutări. Ideea de reţinut: o piesă care fuge dintr-o ţintuire trebuie să fugă pe un câmp apărat, altfel schimbă o problemă mică pe una mare.'
);
select public.seed_trap_link('alekhine-defense', 1, 'B', 9);
select public.seed_trap_moves('alekhine-defense', 1, '{
  "9": "e6 — pionul face pasul, îţi deschide nebunul de pe f8 şi îţi întăreşte calul de pe d5. Nebunul de pe g4 ţine în continuare calul alb legat de apărarea pionului de e5.",
  "10": "GREŞEALA ALBULUI! Ch4. Calul iese din ţintuire şi pare că ameninţă ceva. Numără însă cine îl apără pe h4: nimeni.",
  "11": "Nxe2 — schimbi nebunii. Nu e o mutare care câştigă ceva prin ea însăşi, dar e una la care albul e obligat să răspundă, şi asta e tot ce-ţi trebuie.",
  "12": "Dxe2 — albul reia cu dama, singura reluare care nu-l lasă mai rău.",
  "13": "Dxh4 — iei calul. A rămas singur pe tablă cât timp voi doi schimbaţi nebunii, iar dama ta a ajuns la el pe coloana d, apoi pe diagonală. O piesă în plus, dintr-o mutare care i s-a părut că rezolvă o problemă."
}'::jsonb);
