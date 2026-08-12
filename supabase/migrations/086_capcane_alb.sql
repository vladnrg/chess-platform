-- ============================================================
-- Capcanele pentru cursurile de alb
-- ============================================================
-- Ultima bucată din catalog. Căutare sistematică peste toate cele 30 de
-- variante de alb: la fiecare poziţie, motorul a evaluat toate mutările legale,
-- iar din ce a ieşit au trecut trei filtre — afară gafele simple, afară
-- poziţiile unde pierd multe mutări deodată la acelaşi răspuns, afară ce nu
-- ajunge la o pierdere de material limpede.
--
-- Zece capcane, câte una de fiecare curs, în afară de Gambitul Damei, care are
-- două, şi de Atacul Regelui Indian, care n-are niciuna.
--
-- Despre KIA merită spus de ce, în loc să caut ceva cu orice preţ. Din 162 de
-- mutări cercetate, după filtre n-a rămas nicio capcană. Nu e o scăpare a
-- căutării — e felul deschiderii: pionii stau pe d3 şi e4, centrul rămâne
-- închis zece mutări, iar într-o poziţie închisă nu există curse, doar mutări
-- mai bune şi mai proaste. Când cursul va avea o variantă mai ascuţită, se
-- adaugă şi acolo.
--
-- Şapte din cele zece sunt greşeli ale ALBULUI, adică ale cursantului. La
-- cursurile de negru raportul era invers. Nu e o alegere, e ce a ieşit din
-- căutare, şi are o explicaţie: cine deschide are mai multe mutări în care
-- poate strica ceva.
-- ============================================================


-- ------------------------------------------------------------
-- CATALANA — nebunul care ia un pion şi se pierde pe el
-- ------------------------------------------------------------
select public.seed_trap('catalan-opening', 1,
  'Nebunul care ia pionul de pe d5 şi nu se mai întoarce', 'ours',
  'd2d4 g8f6 c2c4 e7e6 g2g3 d7d5 f1g2 d5c4 g2d5 e6d5 b1c3 f6e4 f2f3 e4c3',
  'Adversarul tocmai a luat pionul de pe c4 şi, pentru o clipă, pare că îţi datorează ceva. Nebunul tău de pe g2 se uită drept la pionul de pe d5, care arată neapărat. Nu e. Nebunul de pe g2 e piesa pentru care ai jucat toată Catalana, iar d5 e apărat de pionul de pe e6 — un pion pe care nu-l vezi fiindcă e în spate. După 5.Nxd5 exd5 rămâi cu un nebun dat pe un pion, iar de acolo lucrurile se înrăutăţesc: calul negru ajunge pe e4, iar când îl alungi cu f3, el ia pe c3 şi îţi rupe şi pionii. Verificat: şapte puncte de material în minus. Lecţia nu e despre Catalană, ci despre socoteala cea mai simplă din şah — înainte să iei ceva, numără câţi îl apără, inclusiv pionii care nu se văd.'
);
select public.seed_trap_link('catalan-opening', 1, 'A', 7);
select public.seed_trap_moves('catalan-opening', 1, '{
  "7": "dxc4 — adversarul îţi ia pionul. Nu-l poate ţine, şi tu ştii asta; nu te grăbi să-l recuperezi cu orice preţ.",
  "8": "GREŞEALA! Nxd5. Nebunul ia un pion care pare liber, iar diagonala pe care ai construit toată deschiderea se termină aici.",
  "9": "exd5 — pionul de pe e6 reia. Era acolo de la mutarea a doua; doar că se uita în altă parte.",
  "10": "Cc3 — încerci să repari, atacând pionul.",
  "11": "Ce4 — calul negru sare în centru şi apasă pe calul tău.",
  "12": "f3 — îl alungi, dar îţi slăbeşti şi mai tare poziţia.",
  "13": "Cxc3 — calul ia şi îţi rupe pionii. Un nebun dat pe un pion, plus structura stricată: şapte puncte în minus."
}'::jsonb);


-- ------------------------------------------------------------
-- SISTEMUL COLLE — nebunul ieşit pe b5, unde îl aşteaptă un şah
-- ------------------------------------------------------------
select public.seed_trap('colle-system', 1,
  'Nebunul pe b5 şi şahul de pe a5', 'ours',
  'd2d4 d7d5 g1f3 g8f6 e2e3 e7e6 f1d3 c7c5 b2b3 b8c6 d3b5 d8a5 b1c3 a5c3 c1d2 c3b2',
  'Adversarul tocmai şi-a dezvoltat calul pe c6, iar nebunul tău de pe d3 pare că are o mutare mai bună: pe b5, unde ţintuieşte calul. Într-o Spaniolă ar fi chiar bună. Aici nu, şi motivul e o piesă pe care ai mutat-o cu o mutare înainte: pionul de pe b3. El a golit câmpul b2 şi a scos nebunul de pe c1 din apărarea diagonalei a5-e1. După 6.Nb5 Da5+ ai un şah la care nu poţi răspunde bine: calul de pe c3 e singura acoperire, iar dama neagră îl ia pe loc. Verificat: trei puncte de material în minus. Regula: înainte să scoţi o piesă, uită-te ce diagonale au rămas descoperite de mutările tale dinainte.'
);
select public.seed_trap_link('colle-system', 1, 'A', 9);
select public.seed_trap_moves('colle-system', 1, '{
  "9": "Cc6 — adversarul îşi dezvoltă calul şi apasă pe pionul de d4. Mutare firească, fără nicio cursă pusă dinadins.",
  "10": "GREŞEALA! Nb5. Nebunul iese şi ţintuieşte calul. Arată activ, dar diagonala a5-e1 e goală de când ai jucat b3.",
  "11": "Da5+ — şahul care lămureşte totul. Nu-l poţi para cu pionul, fiindcă nu ai unul acolo.",
  "12": "Cc3 — singura acoperire pe care o ai.",
  "13": "Dxc3+ — dama ia calul cu şah. Nu e o lovitură complicată; e o consecinţă directă.",
  "14": "Nd2 — parezi, dar prea târziu.",
  "15": "Dxb2 — dama mai ia un pion pe drum. Trei puncte în minus, dintr-o mutare care părea că activează o piesă."
}'::jsonb);


-- ------------------------------------------------------------
-- DESCHIDEREA ENGLEZĂ — calul care pleacă de pe f3 şi deschide diagonala
-- ------------------------------------------------------------
select public.seed_trap('english-opening', 1,
  'Ariciul: calul pleacă de pe f3 şi diagonala se deschide', 'ours',
  'c2c4 c7c5 g1f3 g8f6 g2g3 b7b6 f1g2 c8b7 e1g1 e7e6 b1c3 f8e7 f3d4 b7g2 d4e6 d7e6 g1g2 d8d7',
  'Nebunul negru de pe b7 stă pe diagonala lungă de la mutarea a patra şi se uită drept spre nebunul tău de pe g2. Cât timp calul tău e pe f3, nu se întâmplă nimic. Dar în clipa în care îl muţi — pe d4, pe e5, oriunde — diagonala se deschide, iar Nxg2 vine imediat. Nu e o lovitură pe care s-o vezi greu; e o lovitură pe care o uiţi. Verificat: după 7.Cd4 Nxg2 rămâi cu două puncte în minus, chiar dacă recuperezi ceva cu Cxe6. Împotriva Ariciului, calul de pe f3 nu e doar o piesă dezvoltată — e paznicul unei diagonale. Înainte să-l muţi, uită-te ce rămâne în urma lui.'
);
select public.seed_trap_link('english-opening', 1, 'B', 11);
select public.seed_trap_moves('english-opening', 1, '{
  "11": "Ne7 — adversarul îşi aşază şi ultimul nebun, tot modest, pe rândul al şaptelea. Ariciul e aproape gata.",
  "12": "GREŞEALA! Cd4. Calul pleacă spre un câmp central şi pare mutarea firească. Uită-te însă ce apăra el: nimic direct, dar stătea pe diagonala dintre nebunul lui de pe b7 şi al tău de pe g2.",
  "13": "Nxg2 — nebunul ia imediat. Ai un nebun în minus şi un cal în centru care nu compensează.",
  "14": "Cxe6 — încerci să recuperezi, luând pe e6 cu şah la damă.",
  "15": "fxe6 — adversarul reia cu pionul.",
  "16": "Rxg2 — îţi iei nebunul înapoi cu regele.",
  "17": "Dd7 — adversarul îşi leagă piesele. Socoteala finală: două puncte în minus şi o structură mai proastă, dintr-o mutare de cal care părea liniştită."
}'::jsonb);


-- ------------------------------------------------------------
-- JOCUL VIENEZ — nebunul pe c4, cu calul de pe c3 rămas fără apărare
-- ------------------------------------------------------------
select public.seed_trap('vienna-game', 1,
  'Gambitul Vienez: nebunul pe c4 şi calul rămas singur', 'ours',
  'e2e4 e7e5 b1c3 g8f6 f2f4 d7d5 f4e5 f6e4 g1f3 f8e7 d2d4 e8g8 f1c4 e4c3 b2c3 d5c4 e1g1 b8c6',
  'Adversarul tocmai a făcut rocada şi ai o mulţime de câmpuri bune pentru nebun. Cel mai tentant e c4, unde priveşte spre f7. Numai că pe c4 nebunul se aşază chiar în bătaia pionului negru de pe d5 — pionul pe care el l-a împins la mutarea a treia şi care a rămas acolo. Şi mai e ceva: calul tău de pe c3 e atacat de calul lui de pe e4, iar tu tocmai ai mutat altundeva. După 7.Nc4 Cxc3 8.bxc3 dxc4 pierzi un nebun întreg şi rămâi şi cu pionii dublaţi. Verificat: trei puncte în minus. Într-o poziţie deschisă, o piesă pusă pe un câmp atacat de un pion nu e activă — e pierdută.'
);
select public.seed_trap_link('vienna-game', 1, 'A', 11);
select public.seed_trap_moves('vienna-game', 1, '{
  "11": "Rocada adversarului. Îşi pune regele la adăpost, iar tu ai de ales unde pui nebunul.",
  "12": "GREŞEALA! Nc4. Diagonala spre f7 e tentantă, dar pionul negru de pe d5 se uită chiar la câmpul acela — şi calul tău de pe c3 e atacat.",
  "13": "Cxc3 — adversarul ia calul întâi. Ordinea contează şi pentru el.",
  "14": "bxc3 — reiei, rămânând cu pionii de pe c dublaţi.",
  "15": "dxc4 — şi acum ia şi nebunul. Un nebun pe un pion, plus structura stricată: trei puncte în minus.",
  "16": "Rocada. Îţi pui regele la adăpost, dar poziţia e deja pierdută material.",
  "17": "Cc6 — adversarul îşi dezvoltă liniştit ultima piesă, cu o piesă în plus."
}'::jsonb);


-- ------------------------------------------------------------
-- GAMBITUL DAMEI — nebunul pe b5, care se ia cu pionul
-- ------------------------------------------------------------
select public.seed_trap('queens-gambit', 1,
  'Slava: nebunul pe b5, luat de pionul de pe c6', 'ours',
  'd2d4 d7d5 c2c4 c7c6 g1f3 g8f6 b1c3 d5c4 a2a4 c8f5 e2e3 e7e6 f1c4 f8b4 e1g1 e8g8 d1e2 b8d7 c4b5 c6b5 e3e4 f5g4 a4b5 f8e8',
  'Nebunul tău de pe c4 pare că are un câmp mai bun pe b5, de unde ar ţintui calul de pe d7 şi ar apăsa pe flancul damei. Ce uiţi e că adversarul joacă Apărarea Slavă, iar prima lui mutare a fost c6. Pionul acela e încă acolo şi se uită drept la b5. După 10.Nb5 cxb5 pierzi un nebun pe un pion, iar pionul tău de pe a4 nu recuperează destul: după 11.axb5 rămâi cu două puncte în minus. Lecţia: numele deschiderii îţi spune unde sunt pionii adversarului. Într-o Slavă, câmpul b5 e păzit de la prima mutare a negrului până la sfârşitul partidei.'
);
select public.seed_trap_link('queens-gambit', 1, 'C', 17);
select public.seed_trap_moves('queens-gambit', 1, '{
  "17": "Cbd7 — adversarul îşi aduce ultimul cal. Nimic special; doar dezvoltare.",
  "18": "GREŞEALA! Nb5. Nebunul iese ţintind calul de pe d7. Uită-te însă la pionul de pe c6, care e acolo de la a doua mutare a negrului.",
  "19": "cxb5 — pionul îl ia pur şi simplu.",
  "20": "e4 — încerci să deschizi poziţia ca să recuperezi ceva.",
  "21": "Ng4 — adversarul îşi retrage nebunul pe un câmp bun şi rămâne cu piesa în plus.",
  "22": "axb5 — îţi iei pionul înapoi cu pionul de pe a. Tot cu două puncte în minus rămâi.",
  "23": "Te8 — adversarul îşi aduce turnul. Are o piesă pentru doi pioni şi o poziţie limpede."
}'::jsonb);

select public.seed_trap('queens-gambit', 2,
  'Ortodoxa: calul pe c5, luat de pionul de pe d4', 'theirs',
  'd2d4 d7d5 c2c4 e7e6 b1c3 g8f6 c1g5 f8e7 e2e3 e8g8 g1f3 b8d7 a1c1 c7c6 f1d3 d5c4 d3c4 d7c5 d4c5 d8d1 e1d1 f8d8 d1e2',
  'După ce îţi iei pionul înapoi pe c4, adversarul are o mulţime de mutări bune — a6, Cd5, h6 — şi una care pare la fel de bună şi nu e. Calul de pe d7 vrea pe c5, un câmp central de unde ar ataca nebunul tău. Numai că pe c5 îl aşteaptă pionul tău de pe d4, iar el nu are cu ce să reia: pionul de pe b7 e prea departe, iar cel de pe d6 nu există, fiindcă a jucat e6 la mutarea a doua. Iei calul pe loc. Urmează un şir de schimburi forţate — dama pe d1, turnul pe d8, regele pe e2 — dar la capăt rămâi cu o piesă întreagă în plus. Verificat: trei puncte. Merită ştiut fiindcă e greşeala pe care o face adversarul, nu tu: recunoşti câmpul c5 ca fiind păzit şi aştepţi.'
);
select public.seed_trap_link('queens-gambit', 2, 'A', 16);
select public.seed_trap_moves('queens-gambit', 2, '{
  "16": "Nxc4 — îţi iei pionul înapoi cu nebunul, care ajunge pe diagonala spre f7.",
  "17": "GREŞEALA ADVERSARULUI! Cc5. Calul iese spre centru şi îţi atacă nebunul. Pare firesc — dar pe c5 îl aşteaptă pionul tău de pe d4, iar el n-are cu ce să reia.",
  "18": "dxc5 — iei calul. Simplu, fără nicio combinaţie.",
  "19": "Dxd1+ — adversarul schimbă damele cu şah, ca să-şi uşureze poziţia.",
  "20": "Rxd1 — reiei cu regele, singura mutare.",
  "21": "Td8+ — încă un şah, tot de nevoie.",
  "22": "Re2 — regele se mută şi şirul se opreşte. Ai o piesă întreagă în plus şi un final limpede."
}'::jsonb);


-- ------------------------------------------------------------
-- GAMBITUL REGELUI — pionul greşit luat, şi şahul care urmează
-- ------------------------------------------------------------
select public.seed_trap('kings-gambit', 1,
  'Contragambitul Falkbeer: pionul greşit luat', 'ours',
  'e2e4 e7e5 f2f4 d7d5 f4e5 d8h4 g2g3 h4e4 g1e2 e4h1',
  'E cea mai veche cursă din şah şi se întinde la mutarea a treia. Adversarul răspunde la Gambitul Regelui cu d5, oferindu-ţi un pion în schimb. Ai două capturi la îndemână şi arată la fel: fxe5 şi exd5. Una e corectă, cealaltă pierde partida. Dacă iei pe e5, deschizi diagonala d8-h4 chiar spre regele tău, iar dama neagră ajunge pe h4 cu şah. Nu ai cu ce s-o pareze: pionul de pe g trebuie să înainteze, dama ia pe e4 cu al doilea şah, şi de acolo mătură turnul din colţ. Verificat: cinci puncte de material în minus, în cinci mutări. Regula pe care o predă e cea mai simplă cu putinţă: când ai două capturi care arată la fel, uită-te care dintre ele deschide un drum spre regele tău.'
);
select public.seed_trap_link('kings-gambit', 1, 'C', 3);
select public.seed_trap_moves('kings-gambit', 1, '{
  "3": "d5 — Contragambitul Falkbeer. Adversarul refuză pionul şi îţi oferă unul. Acum ai de ales între două capturi.",
  "4": "GREŞEALA! fxe5. Ai luat pionul greşit. Uită-te ce s-a deschis: diagonala de la d8 până la e1, chiar prin câmpul din faţa regelui tău. Corect era exd5.",
  "5": "Dh4+ — şahul vine imediat. Nu ai piesă cu care să-l acoperi şi nu poţi face rocada.",
  "6": "g3 — singura pară, dar îţi slăbeşte şi mai tare poziţia.",
  "7": "Dxe4+ — al doilea şah, cu un pion luat pe drum.",
  "8": "Ce2 — acoperi cu calul, ultima piesă pe care o ai la îndemână.",
  "9": "Dxh1 — dama mătură turnul din colţ. Cinci puncte în minus, la mutarea a cincea."
}'::jsonb);


-- ------------------------------------------------------------
-- SISTEMUL LONDRA — dama care intră pe diagonala nebunului
-- ------------------------------------------------------------
select public.seed_trap('london-system', 1,
  'Dama neagră care se aşază chiar în faţa nebunului de pe f4', 'theirs',
  'd2d4 d7d5 g1f3 g8f6 c1f4 e7e6 e2e3 f8e7 h2h3 d8d6 f4d6 c7d6 f1e2 f6e4 b1c3',
  'Aici e răsplata pentru mutarea care dă numele Londrei. Ţi-ai scos nebunul pe f4 înainte de e3, iar el stă acolo, pe diagonala b8-h2, de la mutarea a treia. Adversarii care nu cunosc sistemul îşi scot dama pe d6 — un câmp firesc, central, de unde apasă pe d4 şi pregăteşte rocada lungă. Numai că d6 e chiar pe diagonala nebunului tău. Nxd6 ia dama, iar el reia cu pionul. Verificat: şase puncte de material în plus, adică o damă pentru un nebun. Nu e o combinaţie şi nu cere calcul; cere doar să ştii unde stă propriul tău nebun. De asta e Londra bună pentru cine nu vrea să înveţe teorie: greşelile adversarului vin la tine.'
);
select public.seed_trap_link('london-system', 1, 'A', 8);
select public.seed_trap_moves('london-system', 1, '{
  "8": "h3 — o mutare mică din sistem, care îi taie câmpul g4. Nu ameninţă nimic şi tocmai de aceea adversarul se relaxează.",
  "9": "GREŞEALA ADVERSARULUI! Dd6. Dama iese pe un câmp central şi apasă pe d4. Uită-te unde s-a aşezat: pe diagonala nebunului tău de pe f4, care stă acolo de la mutarea a treia.",
  "10": "Nxd6 — iei dama. Atât.",
  "11": "cxd6 — adversarul reia cu pionul şi rămâne cu pionii dublaţi pe coloana d.",
  "12": "Ne2 — îţi termini liniştit dezvoltarea, cu o damă în plus pentru un nebun.",
  "13": "Ce4 — adversarul încearcă să facă ceva activ.",
  "14": "Cc3 — îl schimbi şi te îndrepţi spre un final în care ai şase puncte de material în plus."
}'::jsonb);


-- ------------------------------------------------------------
-- PARTIDA ITALIANĂ — reluarea cu regele în loc de cal
-- ------------------------------------------------------------
select public.seed_trap('italian-game', 1,
  'Reluarea cu regele, care pierde pionul de e4', 'ours',
  'e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 c2c3 g8f6 d2d4 e5d4 c3d4 c5b4 c1d2 b4d2 e1d2 f6e4 d2e2 d7d5 c4b3 c8g4',
  'Adversarul îţi dă şah cu nebunul pe b4, tu acoperi cu nebunul pe d2, iar el schimbă. Acum ai trei feluri de a relua: cu calul de pe b1, cu dama, sau cu regele. Regele pare cel mai simplu — nu-ţi mută nicio piesă din loc — şi e singurul care pierde. Motivul e că pionul tău de pe e4 era apărat exact de o piesă: calul de pe b1, prin d2. Iei cu regele, calul nu ajunge niciodată acolo, iar Cxe4+ vine cu şah, adică nu poţi nici măcar să-ţi aperi pionul după. Verificat: 2,28 pierdute şi un pion în minus. Reluarea corectă e Cbxd2, care apără e4 şi dezvoltă o piesă în aceeaşi mutare.'
);
select public.seed_trap_link('italian-game', 1, 'A', 13);
select public.seed_trap_moves('italian-game', 1, '{
  "13": "Nxd2+ — adversarul schimbă nebunii, cu şah. Acum trebuie să reiei, şi ai trei feluri de a o face.",
  "14": "GREŞEALA! Rxd2. Regele reia şi pare cea mai economică alegere. Numai că pionul tău de pe e4 era apărat de calul de pe b1, prin d2 — iar acum calul acela nu mai ajunge niciodată acolo.",
  "15": "Cxe4+ — calul ia pionul cu şah. Şahul e partea rea: nu apuci să-ţi aperi nimic.",
  "16": "Re2 — regele se dă la o parte, tot fără rocadă.",
  "17": "d5 — adversarul îţi alungă nebunul şi îşi ia centrul.",
  "18": "Nb3 — nebunul se retrage.",
  "19": "Ng4 — adversarul îşi dezvoltă ultima piesă cu tempo. Un pion în minus, regele în centru fără rocadă, şi toate astea dintr-o reluare aleasă din comoditate."
}'::jsonb);


-- ------------------------------------------------------------
-- RUY LOPEZ — calul pe h4, care lasă nebunul de pe b3 singur
-- ------------------------------------------------------------
select public.seed_trap('ruy-lopez', 1,
  'Spaniola Închisă: calul pe h4 şi nebunul rămas fără paznic', 'ours',
  'e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 g8f6 e1g1 f8e7 f1e1 b7b5 a4b3 d7d6 c2c3 e8g8 h2h3 c6a5 f3h4 a5b3 a2b3 f6e4 h4f3 f7f5',
  'Calul negru tocmai a venit pe a5, după nebunul tău de pe b3. Mutarea corectă e Nc2, retragerea pregătită de la mutarea a opta cu c3. În loc de asta, mulţi joacă Ch4, ca să ducă calul spre f5. Sună bine şi e greşit din două motive deodată: nebunul de pe b3 rămâne fără nicio apărare, iar calul de pe f3 era singurul care păzea pionul de e4. Adversarul ia întâi nebunul, tu reiei cu pionul şi rămâi cu pionii dublaţi, iar apoi îţi ia şi pionul de pe e4. Verificat: un pion în minus şi structura stricată. Lecţia e despre ordine: când o piesă de-a ta e atacată şi ai pregătit deja retragerea, foloseşte-o. Mutările „active" jucate în locul celor pregătite costă de obicei exact ce ai pregătit.'
);
select public.seed_trap_link('ruy-lopez', 1, 'B', 17);
select public.seed_trap_moves('ruy-lopez', 1, '{
  "17": "Ca5 — calul negru vine după nebunul tău de pe b3. Ai pregătit retragerea pe c2 încă de la mutarea a opta, când ai jucat c3.",
  "18": "GREŞEALA! Ch4. Calul porneşte spre f5 şi pare că îţi începi atacul. Numai că nebunul de pe b3 rămâne singur, iar calul de pe f3 era singurul apărător al pionului de e4.",
  "19": "Cxb3 — adversarul ia nebunul imediat.",
  "20": "axb3 — reiei cu pionul de pe a, rămânând cu pionii dublaţi pe coloana b.",
  "21": "Cxe4 — şi acum îţi ia şi pionul de pe e4, cel rămas fără paznic.",
  "22": "Cf3 — îţi aduci calul înapoi, dar paguba e făcută.",
  "23": "f5 — adversarul îşi întăreşte calul din centru cu un pion. Un pion în minus, pionii dublaţi şi calul întors de unde a plecat."
}'::jsonb);


-- ============================================================
-- DOVADA — trebuie să arate 10, 9, 20
-- ============================================================
select
  (select count(*)
     from public.opening_traps t
     join public.courses c on c.id = t.course_id
     join public.opening_lines l on l.course_id = c.id and l.variation_code = 'A'
    where l.user_color = 'white')                                    as capcane_de_alb,
  (select count(distinct c.id)
     from public.courses c
     join public.opening_traps t on t.course_id = c.id
     join public.opening_lines l on l.course_id = c.id and l.variation_code = 'A'
    where l.user_color = 'white')                                    as cursuri_de_alb_cu_capcane,
  (select count(*) from (
     select c.id
       from public.courses c
       join public.opening_lines l on l.course_id = c.id
      group by c.id
     having count(*) = 3
        and count(*) filter (
              where array_length(string_to_array(l.moves_uci, ' '), 1)
                    = (select count(*) from jsonb_object_keys(l.move_explanations))
            ) = 3
        and count(*) filter (
              where exists (select 1 from public.middlegame_plans p
                             where p.opening_line_id = l.id)
            ) = 3
   ) t)                                                              as cursuri_complete;
