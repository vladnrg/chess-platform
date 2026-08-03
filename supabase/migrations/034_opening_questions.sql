-- ============================================================
-- Banca de întrebări: 60 de deschideri
-- ============================================================
-- Douăzeci pe săptămână (patru calupuri de câte cinci), deci 60 înseamnă trei
-- săptămâni fără nicio repetiţie. Din a patra, o poziţie revine — ceea ce e mai
-- degrabă bine: dacă ai uitat-o, o reînveţi.
--
-- Se adaugă altele oricând, cu un simplu insert. Rotaţia se lăţeşte singură.
--
-- Toate cele 60 de secvenţe au fost verificate programatic cu chess.js: fiecare
-- e legală de la prima până la ultima mutare şi produce exact deschiderea
-- numită. O mutare invalidă ar fi tăiat tabla în tăcere.
-- ============================================================

insert into public.opening_questions (moves, title, options, answer, explanation, difficulty) values

-- ---------- Nivelul 1: primele mutări ----------
('e2e4 e7e5 g1f3 b8c6 f1b5', 'Nebunul iese pe b5',
 array['Partida Italiană','Partida Spaniolă (Ruy López)','Partida Scoţiană','Gambitul Regelui'], 1,
 'Nebunul pe b5 atacă exact calul care apără pionul e5. Asta e semnătura Spaniolei — nebunul pe c4 ar fi fost Italiana.', 1),

('e2e4 c7c5', 'Cel mai popular răspuns la 1.e4',
 array['Apărarea Franceză','Apărarea Caro-Kann','Apărarea Siciliană','Apărarea Scandinavă'], 2,
 'Siciliana. Negrul nu ia centrul simetric, ci îl atacă din lateral — de aici jocul ascuţit.', 1),

('e2e4 e7e6', 'Un pion mic, o idee mare',
 array['Caro-Kann','Franceză','Siciliana','Pirc'], 1,
 'Franceza. Pregăteşte d5, dar închide drumul nebunului de c8 — problema centrală a deschiderii.', 1),

('e2e4 c7c6', 'Aceeaşi idee, alt pion',
 array['Apărarea Franceză','Apărarea Caro-Kann','Apărarea Alehin','Apărarea Modernă'], 1,
 'Caro-Kann. Pregăteşte tot d5, dar cu c6 în loc de e6 — aşa nebunul de c8 iese înainte să se închidă lanţul.', 1),

('d2d4 d7d5 c2c4', 'Un pion oferit',
 array['Gambitul Damei','Gambitul Regelui','Gambitul Evans','Gambitul Budapesta'], 0,
 'Gambitul Damei. „Gambit" doar cu numele: pionul de c4 se recuperează aproape întotdeauna.', 1),

('e2e4 e7e5 g1f3 b8c6 f1c4', 'Nebunul ţinteşte f7',
 array['Partida Spaniolă','Partida Italiană','Partida Vienei','Apărarea celor doi cai'], 1,
 'Italiana. Nebunul pe c4 loveşte f7, cel mai slab câmp din tabăra neagră la început de partidă.', 1),

('e2e4 d7d5', 'Contra din prima',
 array['Apărarea Scandinavă','Apărarea Alehin','Gambitul Damei','Apărarea Pirc'], 0,
 'Scandinava. După 2.exd5 Dxd5 dama iese devreme şi va fi atacată — dar teoria arată că negrul stă bine.', 1),

('e2e4 e7e5 f2f4', 'Romantism pur',
 array['Gambitul Damei','Gambitul Regelui','Partida Vienei','Gambitul Leton'], 1,
 'Gambitul Regelui. Albul dă un pion pentru centru şi atac. Aproape dispărut la vârf, încă letal sub 2000.', 1),

('e2e4 g8f6', 'Calul provoacă pionii',
 array['Apărarea Alehin','Apărarea Pirc','Apărarea Modernă','Apărarea Nimzowitsch'], 0,
 'Alehin. Calul se lasă fugărit ca albul să-şi întindă pionii prea mult, apoi îi ia la ţintă.', 1),

('d2d4 f7f5', 'Pionul f, imediat',
 array['Apărarea Olandeză','Apărarea Benoni','Gambitul Budapesta','Apărarea Modernă'], 0,
 'Olandeza. Negrul joacă pentru atac pe flancul regelui, cu preţul unei slăbiri în jurul propriului rege.', 1),

('c2c4', 'Fără pion în centru, deocamdată',
 array['Deschiderea Engleză','Deschiderea Réti','Deschiderea Bird','Atacul Grob'], 0,
 'Engleza. Flexibilă până la capăt: poate transpune în aproape orice, de aceea e greu de pregătit împotriva ei.', 1),

('g1f3', 'Calul înaintea pionilor',
 array['Deschiderea Engleză','Deschiderea Réti','Deschiderea Bird','Sistemul Londra'], 1,
 'Réti. Controlează centrul de la distanţă, fără să se angajeze cu pionii.', 1),

('d2d4 g8f6 c2c4 e7e6 b1c3 f8b4', 'Ţintuire pe calul de c3',
 array['Apărarea Indiană a Damei','Apărarea Nimzo-Indiană','Apărarea Bogo-Indiană','Apărarea Grünfeld'], 1,
 'Nimzo-Indiana. Nebunul ţintuieşte calul şi de obicei se schimbă pe el, stricând structura de pioni a albului.', 1),

('d2d4 g8f6 c2c4 g7g6 b1c3 f8g7 e2e4 d7d6', 'Centrul se cedează, apoi se atacă',
 array['Apărarea Indiană a Regelui','Apărarea Grünfeld','Apărarea Nimzo-Indiană','Apărarea Olandeză'], 0,
 'Indiana Regelui. Negrul lasă albul să ia centrul, apoi îl sparge cu e5 sau c5. Arma lui Kasparov şi Fischer.', 1),

('d2d4 g8f6 c2c4 g7g6 b1c3 d7d5', 'Lovitura în centru vine mai devreme',
 array['Apărarea Indiană a Regelui','Apărarea Grünfeld','Apărarea Benoni','Apărarea Slavă'], 1,
 'Grünfeld. Spre deosebire de Indiana Regelui, negrul loveşte centrul imediat cu d5, apoi îl demolează cu piese.', 1),

('d2d4 d7d5 c2c4 c7c6', 'Apără d5 fără să închidă nebunul',
 array['Apărarea Slavă','Gambitul Damei acceptat','Apărarea Ortodoxă','Apărarea Tarrasch'], 0,
 'Slava. Apără d5 cu c6 în loc de e6, exact ca să nu blocheze nebunul de c8.', 1),

('e2e4 e7e5 g1f3 g8f6', 'Simetrie perfectă',
 array['Apărarea celor doi cai','Apărarea Rusă (Petrov)','Partida Vienei','Partida celor patru cai'], 1,
 'Apărarea Rusă. Negrul nu apără e5, ci contraatacă e4. Reputaţie de deschidere „de remiză" la vârf.', 1),

('e2e4 e7e5 g1f3 b8c6 d2d4', 'Centrul se deschide din mutarea a treia',
 array['Partida Italiană','Partida Scoţiană','Partida Ponziani','Gambitul Nordic'], 1,
 'Scoţiana. Deschide jocul imediat. Kasparov a reînviat-o în anii ''90 ca alternativă la Spaniolă.', 1),

('d2d4 g8f6 c2c4 e7e6 g2g3', 'Nebunul alb în fianchetto',
 array['Sistemul Londra','Deschiderea Catalană','Deschiderea Engleză','Sistemul Colle'], 1,
 'Catalana. Presiune lungă pe diagonala mare, fără riscuri. Kramnik a readus-o la modă la cel mai înalt nivel.', 1),

('e2e4 e7e5 g1f3 b8c6 f1b5 g8f6', 'Meciul din 2000',
 array['Varianta Berlin','Varianta Deschisă','Apărarea Marshall','Varianta Schimbului'], 0,
 'Berlin. Arma cu care Kramnik i-a luat titlul lui Kasparov la Londra, în 2000 — Kasparov n-a câştigat nicio partidă cu albul în acel meci.', 1),

-- ---------- Nivelul 2: deschideri mai rare ----------
('e2e4 d7d6 d2d4 g8f6 b1c3 g7g6', 'Fianchetto după ce centrul e cedat',
 array['Apărarea Pirc','Apărarea Modernă','Apărarea Alehin','Apărarea Indiană a Regelui'], 0,
 'Pirc. Negrul cedează centrul şi îl atacă din flanc — aceeaşi idee ca Indiana Regelui, dar împotriva lui 1.e4.', 2),

('e2e4 g7g6', 'Fianchetto din prima mutare',
 array['Apărarea Pirc','Apărarea Modernă','Apărarea Alehin','Apărarea Olandeză'], 1,
 'Moderna. Ca Pirc, dar fără să se grăbească cu Cf6 — negrul îşi ţine opţiunile deschise cât mai mult.', 2),

('d2d4 g8f6 c2c4 e7e6 g1f3 b7b6', 'Nebunul spre diagonala mare',
 array['Apărarea Indiană a Damei','Apărarea Nimzo-Indiană','Apărarea Bogo-Indiană','Deschiderea Catalană'], 0,
 'Indiana Damei. Nebunul pe b7 ţinteşte e4 şi luptă pentru centru de la distanţă. Foarte solidă.', 2),

('d2d4 d7d5 c2c4 d5c4', 'Pionul chiar se ia',
 array['Gambitul Damei acceptat','Apărarea Slavă','Apărarea Ortodoxă','Contra-gambitul Albin'], 0,
 'Gambitul Damei acceptat. Negrul ia pionul, dar nu poate să-l ţină — în schimb câştigă timp pentru dezvoltare.', 2),

('d2d4 d7d5 c2c4 e7e6', 'Pionul se refuză politicos',
 array['Gambitul Damei acceptat','Gambitul Damei refuzat','Apărarea Slavă','Apărarea Tarrasch'], 1,
 'Gambitul Damei refuzat. Cea mai solidă apărare împotriva lui 1.d4 — cu preţul nebunului de c8, rămas închis.', 2),

('d2d4 g8f6 c2c4 c7c5 d4d5 e7e6', 'Contra-joc pe flancul damei',
 array['Apărarea Benoni modernă','Gambitul Benko','Gambitul Budapesta','Apărarea Olandeză'], 0,
 'Benoni modernă. Negrul acceptă o structură asimetrică şi joacă pentru contraatac. Riscantă, dar plină de viaţă.', 2),

('d2d4 e7e5', 'Un pion aruncat din prima',
 array['Gambitul Englund','Gambitul Budapesta','Contra-gambitul Albin','Apărarea Benoni'], 0,
 'Gambitul Englund. Dubios din punct de vedere teoretic, dar surprinzător de neplăcut dacă albul nu-l cunoaşte.', 2),

('d2d4 g8f6 c2c4 e7e5', 'Pionul se oferă mai târziu',
 array['Gambitul Englund','Gambitul Budapesta','Contra-gambitul Albin','Gambitul Benko'], 1,
 'Gambitul Budapesta. Negrul dă pionul e5 şi îl recuperează cu piese active. Rar la vârf, popular la club.', 2),

('d2d4 d7d5 c2c4 e7e5', 'Contra imediată în centru',
 array['Gambitul Budapesta','Contra-gambitul Albin','Gambitul Englund','Apărarea Marshall'], 1,
 'Contra-gambitul Albin. Negrul răspunde unui gambit cu alt gambit. Capcanele din deschidere sunt faimoase.', 2),

('f2f4', 'Pionul f, la alb',
 array['Deschiderea Bird','Deschiderea Réti','Deschiderea Engleză','Atacul Grob'], 0,
 'Bird. E Olandeza jucată cu o mutare în plus — dar tempo-ul în plus schimbă mai puţin decât ai crede.', 2),

('b2b3', 'Nebunul înaintea pionilor centrali',
 array['Deschiderea Réti','Atacul Nimzowitsch-Larsen','Deschiderea Bird','Deschiderea Sokolski'], 1,
 'Nimzowitsch-Larsen. Nebunul de b2 ţinteşte diagonala lungă înainte ca centrul să fie decis.', 2),

('e2e4 e7e5 b1c3', 'Calul, nu nebunul',
 array['Partida Vienei','Partida celor patru cai','Deschiderea Nebunului','Partida Ponziani'], 0,
 'Viena. Pregăteşte f4 în condiţii mai bune decât Gambitul Regelui direct.', 2),

('e2e4 e7e5 f1c4', 'Nebunul, înaintea calului',
 array['Partida Italiană','Deschiderea Nebunului','Partida Vienei','Partida Spaniolă'], 1,
 'Deschiderea Nebunului. Poate transpune în Italiană sau Viena, dar păstrează opţiunea f4.', 2),

('e2e4 e7e5 g1f3 d7d6', 'Apără pionul cu pionul',
 array['Apărarea Philidor','Apărarea Rusă','Apărarea celor doi cai','Apărarea Maghiară'], 0,
 'Philidor. Solidă dar pasivă — negrul îşi blochează singur nebunul de f8.', 2),

('e2e4 e7e5 g1f3 b8c6 f1c4 g8f6', 'Contraatac în loc de apărare',
 array['Italiana clasică','Apărarea celor doi cai','Apărarea Maghiară','Gambitul Evans'], 1,
 'Apărarea celor doi cai. Negrul ignoră ameninţarea asupra lui f7 şi atacă e4 — de aici complicaţiile.', 2),

('e2e4 e7e5 g1f3 b8c6 b1c3 g8f6', 'Toţi caii pe tablă',
 array['Partida celor trei cai','Partida celor patru cai','Partida Vienei','Apărarea Rusă'], 1,
 'Patru cai. Simetrică şi liniştită — dintre cele mai bune deschideri pentru cine învaţă principiile.', 2),

('e2e4 e7e5 g1f3 b8c6 c2c3', 'Pregăteşte d4 cu pionul',
 array['Partida Italiană','Partida Scoţiană','Partida Ponziani','Partida Spaniolă'], 2,
 'Ponziani. Vrea un centru mare cu d4, dar pierde timp — negrul are răspunsuri bune imediate.', 2),

('d2d4 d7d5 g1f3 g8f6 c1f4', 'Nebunul iese înaintea pionului e',
 array['Sistemul Londra','Sistemul Colle','Atacul Torre','Atacul Trompowsky'], 0,
 'Sistemul Londra. Aceeaşi aşezare împotriva a aproape orice — de aceea e atât de populară la începători.', 2),

('d2d4 g8f6 c1g5', 'Ţintuire din mutarea a doua',
 array['Atacul Torre','Atacul Trompowsky','Sistemul Londra','Sistemul Rapport-Jobava'], 1,
 'Trompowsky. Evită toată teoria indiană din mutarea a doua.', 2),

('e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 b2b4', 'Un pion oferit pe flanc',
 array['Gambitul Evans','Gambitul Regelui','Italiana clasică','Gambitul Nordic'], 0,
 'Gambitul Evans. Albul dă un pion ca să câştige timp şi centru. Favoritul lui Kasparov când voia sânge.', 2),

-- ---------- Nivelul 3: variante cu nume ----------
('e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 a7a6', 'Cea mai analizată variantă din şah',
 array['Varianta Dragonului','Varianta Najdorf','Varianta Sveshnikov','Varianta Scheveningen'], 1,
 'Najdorf. Mutarea 5...a6 pare modestă, dar deschide una dintre cele mai adânci teorii din şah. Arma lui Fischer şi a lui Kasparov.', 3),

('e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 g7g6', 'Fianchetto în Siciliană',
 array['Varianta Najdorf','Varianta Dragonului','Dragonul accelerat','Varianta Clasică'], 1,
 'Dragonul. Nebunul de g7 loveşte diagonala lungă; ambele părţi atacă regele advers, adesea în cursă contra cronometru.', 3),

('e2e4 c7c5 g1f3 b8c6 d2d4 c5d4 f3d4 g8f6 b1c3 e7e5', 'Pionul înaintează, câmpul d5 se slăbeşte',
 array['Varianta Sveshnikov','Varianta Najdorf','Varianta Taimanov','Varianta Kan'], 0,
 'Sveshnikov. Negrul acceptă o slăbiciune permanentă pe d5 în schimbul unui joc de piese foarte activ. Carlsen a folosit-o în meciul mondial din 2018.', 3),

('e2e4 c7c5 g1f3 e7e6 d2d4 c5d4 f3d4 g8f6 b1c3 d7d6', 'Centru mic, dar solid',
 array['Varianta Najdorf','Varianta Scheveningen','Varianta Dragonului','Varianta Sveshnikov'], 1,
 'Scheveningen. Pionii pe d6 şi e6 formează „centrul mic" — modest la vedere, foarte greu de spart.', 3),

('e2e4 c7c5 c2c3', 'Fără teorie siciliană',
 array['Varianta Alapin','Gambitul Smith-Morra','Siciliana închisă','Varianta Rossolimo'], 0,
 'Alapin. Albul pregăteşte d4 cu pionul şi ocoleşte toată teoria ascuţită a Sicilienei deschise.', 3),

('e2e4 c7c5 g1f3 b8c6 f1b5', 'Nebunul pe b5, împotriva calului',
 array['Varianta Rossolimo','Varianta Moscova','Varianta Alapin','Siciliana închisă'], 0,
 'Rossolimo. Foarte populară la vârf tocmai fiindcă evită miile de pagini de teorie de după 3.d4.', 3),

('e2e4 c7c5 g1f3 d7d6 f1b5', 'Şah din nebun, în Siciliană',
 array['Varianta Rossolimo','Varianta Moscova','Varianta Alapin','Siciliana închisă'], 1,
 'Moscova. Sora Rossolimo, jucată când negrul a ales d6 în loc de Cc6.', 3),

('e2e4 c7c5 d2d4 c5d4 c2c3', 'Un pion pentru dezvoltare rapidă',
 array['Varianta Alapin','Gambitul Smith-Morra','Gambitul Wing','Siciliana închisă'], 1,
 'Smith-Morra. Albul dă un pion pentru două linii deschise şi avans de dezvoltare. Periculos dacă negrul nu ştie ce face.', 3),

('e2e4 e7e6 d2d4 d7d5 e4e5', 'Centrul se închide',
 array['Varianta Avansului','Varianta Schimbului','Varianta Tarrasch','Varianta Winawer'], 0,
 'Varianta Avansului din Franceză. Lanţul de pioni decide planurile: negrul loveşte baza cu c5, albul apără şi atacă pe flancul regelui.', 3),

('e2e4 e7e6 d2d4 d7d5 b1c3 f8b4', 'Ţintuire în Franceză',
 array['Varianta Winawer','Varianta Clasică','Varianta Rubinstein','Varianta Tarrasch'], 0,
 'Winawer. Negrul dă perechea de nebuni ca să strice structura albului. Una dintre cele mai ascuţite linii din Franceză.', 3),

('e2e4 e7e6 d2d4 d7d5 b1d2', 'Calul pe d2, nu pe c3',
 array['Varianta Winawer','Varianta Tarrasch','Varianta Avansului','Varianta Schimbului'], 1,
 'Tarrasch. Calul pe d2 blochează nebunul pentru moment, dar evită complet ţintuirea din Winawer.', 3),

('e2e4 c7c6 d2d4 d7d5 e4e5', 'Acelaşi plan, altă apărare',
 array['Varianta Avansului','Varianta Schimbului','Atacul Panov-Botvinnik','Varianta Clasică'], 0,
 'Varianta Avansului din Caro-Kann. Spre deosebire de Franceză, nebunul negru apucă să iasă pe f5 înainte să fie închis.', 3),

('e2e4 c7c6 d2d4 d7d5 e4d5 c6d5 c2c4', 'Structură de pion izolat',
 array['Atacul Panov-Botvinnik','Varianta Avansului','Varianta Schimbului','Varianta Clasică'], 0,
 'Panov-Botvinnik. Duce la structuri de pion damă izolat — mai degrabă poziţii de Gambit al Damei decât de Caro-Kann.', 3),

('e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 g8f6 e1g1 f8e7', 'Linia principală a Spaniolei',
 array['Varianta Berlin','Varianta Închisă','Varianta Deschisă','Varianta Schimbului'], 1,
 'Spaniola închisă. Cea mai jucată linie din istoria şahului la nivel înalt — manevrare lentă, planuri lungi.', 3),

('e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5c6', 'Nebunul ia calul',
 array['Varianta Schimbului','Varianta Închisă','Varianta Deschisă','Apărarea Marshall'], 0,
 'Varianta Schimbului. Albul strică structura neagră şi joacă pentru final. Fischer a folosit-o cu mare succes.', 3),

('e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 g8f6 e1g1 f6e4', 'Calul ia pionul central',
 array['Varianta Berlin','Varianta Deschisă','Apărarea Marshall','Varianta Închisă'], 1,
 'Spaniola deschisă. Negrul câştigă un pion temporar şi obţine joc activ de piese, în loc de manevrarea lentă.', 3),

('e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 g8f6 e1g1 f8e7 f1e1 b7b5 a4b3 e8g8 c2c3 d7d5', 'Un pion pentru atac permanent',
 array['Apărarea Marshall','Varianta Închisă','Varianta Deschisă','Varianta Berlin'], 0,
 'Atacul Marshall. Negrul dă un pion pentru iniţiativă durabilă pe flancul regelui. Atât de temut încât mulţi jucători cu albul îl ocolesc complet.', 3),

('d2d4 g8f6 c2c4 e7e6 b1c3 f8b4 e2e3', 'Răspunsul liniştit la Nimzo',
 array['Varianta Rubinstein','Varianta Clasică','Varianta Sämisch','Varianta Leningrad'], 0,
 'Rubinstein. Cea mai solidă linie împotriva Nimzo-Indienei: albul se dezvoltă simplu şi păstrează flexibilitatea.', 3),

('d2d4 d7d5 c2c4 e7e6 b1c3 c7c5', 'Pion izolat, în schimbul activităţii',
 array['Apărarea Slavă','Apărarea Tarrasch','Apărarea Ortodoxă','Apărarea Semi-Slavă'], 1,
 'Tarrasch. Negrul acceptă un pion damă izolat pentru piese active. Kasparov a folosit-o la începutul carierei.', 3),

('d2d4 d7d5 c2c4 c7c6 g1f3 g8f6 b1c3 e7e6', 'Şi c6, şi e6',
 array['Apărarea Slavă','Apărarea Semi-Slavă','Apărarea Ortodoxă','Apărarea Tarrasch'], 1,
 'Semi-Slava. Combină ideile din Slavă şi din Gambitul Damei refuzat. Duce la unele dintre cele mai complicate poziţii din şah.', 3);
