-- ============================================================
-- Apărarea Regelui Indian: capcanele
-- ============================================================
-- Căutare sistematică peste toate cele trei variante, dusă şi câteva mutări
-- dincolo de capătul deschiderii, fiindcă acolo stau capcanele adevărate din
-- Regele Indian. Din 555 de mutări care pierdeau peste doi pioni au rămas
-- şapte după filtre, iar din acelea două merită o lecţie.
--
-- Ce a ieşit limpede din căutare e că, în deschiderea asta, aproape toate
-- greşelile albului sunt aceeaşi greşeală: calul de pe c3 ţine pionul de e4, iar
-- la Sämisch ţine şi pionul de d5. Oriunde l-ar muta — pe e2, pe b1, pe a4 —
-- cade ceva. De cinci ori din şapte, asta a fost.
--
-- Trei candidate au fost lăsate afară, şi merită spus de ce, ca să nu pară
-- alegere pe gust:
--   · A/7...Nh3 — nebunul e pur şi simplu atârnat, nu e o cursă;
--   · C/9...Ng4 — e de fapt o mutare bună, pedepsită printr-o subtilitate;
--   · C/11.Cb1 cu Txe4 — pedeapsa cere să dai turnul pe nebun şi doi pioni.
--     Iese bine la evaluare, dar o lecţie în care rămâi cu material în minus şi
--     „e bine aşa" nu se predă la nivelul ăsta.
-- ============================================================


-- ------------------------------------------------------------
-- 1. Calul care pleacă de lângă e4 — cade albul
-- ------------------------------------------------------------
select public.seed_trap('kings-indian-defense', 1,
  'Calul de pe c3, singurul care păzeşte e4', 'theirs',
  'd2d4 g8f6 c2c4 g7g6 b1c3 f8g7 e2e4 d7d6 c3e2 f6e4',
  'Uită-te la pionul alb de pe e4 în poziţia de start a Regelui Indian: îl apără exact o piesă, calul de pe c3. Pionul de pe f2 nu ajunge la el, nebunul de pe f1 e închis de propriul pion, iar dama nu-l vede. Un singur apărător, şi toată lumea îl priveşte ca pe ceva de la sine înţeles. De aceea albul mută calul de acolo mai des decât ţi-ai închipui — pe e2, ca să nu-i stea în drum pionului de pe c, sau înapoi pe b1 ca să-l aducă altfel. Verificat pe poziţie: înainte de mutare e4 e apărat de calul de pe c3; după ea, de nimeni. Iei pionul şi rămâi în plus. Nu e o lovitură spectaculoasă, e o socoteală pe care merită s-o faci la fiecare mutare a adversarului: ce apăra piesa care tocmai a plecat?'
);
select public.seed_trap_link('kings-indian-defense', 1, 'A', 7);
select public.seed_trap_moves('kings-indian-defense', 1, '{
  "7": "d6 — mutarea ta obişnuită din Regele Indian, care pregăteşte e5 sau c5. Nimic special, dar de aici încolo uită-te la pionul lui de pe e4 şi numără cine îl apără. Răspunsul e: unul singur.",
  "8": "GREŞEALA ALBULUI! Cce2. Mutarea are chiar o logică — calul îi stătea în calea pionului de pe c şi vrea să-l ducă pe g3 sau pe f4. Numai că era singurul lucru care ţinea pionul de e4.",
  "9": "Cxe4 — îl iei, pur şi simplu. Nu e nimic de calculat şi nici o continuare de memorat: pionul chiar nu mai e apărat de nimic. Un pion în plus, dintr-o socoteală de două secunde."
}'::jsonb);


-- ------------------------------------------------------------
-- 2. Dezvoltarea firească în mijlocul tensiunii — cade negrul
-- ------------------------------------------------------------
select public.seed_trap('kings-indian-defense', 2,
  'Atacul cu Patru Pioni: dezvoltarea care vine cu o mutare prea târziu', 'ours',
  'd2d4 g8f6 c2c4 g7g6 b1c3 f8g7 e2e4 d7d6 f2f4 e8g8 g1f3 c7c5 d4d5 e7e6 f1e2 b8d7 d5e6 d7b6 e6f7',
  'Ai jucat e6 ca să loveşti pionul înfipt pe d5, iar albul tocmai şi-a scos nebunul pe e2. Pare momentul potrivit pentru încă o mutare de dezvoltare, şi Cbd7 arată cuminte: scoţi ultima piesă din colţ. Numai că în centru e o tensiune care nu aşteaptă. Pionul de pe d5 nu stă acolo blocat — poate lua înainte, pe e6, iar de pe e6 merge mai departe pe f7, cu şah. În loc să te dezvolţi, trebuia să lămureşti centrul cu exd5. Cinstit spus, pedeapsa nu e o piesă câştigată: dacă iei pionul înapoi cu fxe6, materialul rămâne egal, doar că poziţia ta e chiar mai proastă (albul stă la +2,45 în loc de +2,15) — coloana f ţi se deschide spre propriul rege şi rămâi cu un pion slab pe e6. Aşa arată o greşeală de deschidere adevărată: nu pierzi nimic dintr-o dată, pierzi totul încet. Regula: când în centru e tensiune, lămureşte-o întâi şi dezvoltă-te după.'
);
select public.seed_trap_link('kings-indian-defense', 2, 'B', 14);
select public.seed_trap_moves('kings-indian-defense', 2, '{
  "14": "Albul îşi scoate nebunul pe e2. E o mutare liniştită, de dezvoltare, şi tocmai de aceea e periculoasă: te face să crezi că şi tu ai timp pentru una la fel.",
  "15": "GREŞEALA! Cbd7. Ultima piesă iese din colţ şi mutarea arată ireproşabil. Dar în centru pionii tăi de pe e6 şi ai lui de pe d5 stau nas în nas, iar cine loveşte primul are dreptate. Trebuia exd5.",
  "16": "dxe6 — pionul lui ia primul şi ajunge la un pas de regele tău. Nu e apărat de nimic, dar asta nu ajută: e la mutare, nu tu.",
  "17": "Cb6 — cea mai bună dintre variantele proaste. Dacă iei cu fxe6 materialul rămâne egal, dar poziţia e şi mai rea, fiindcă îţi deschizi singur coloana f spre rege.",
  "18": "exf7+ — pionul ajunge până pe f7, cu şah. Iei turnul înapoi şi rămâi cu un pion în minus şi cu regele în curent. Toate astea dintr-o mutare care părea cea mai cuminte de pe tablă."
}'::jsonb);
