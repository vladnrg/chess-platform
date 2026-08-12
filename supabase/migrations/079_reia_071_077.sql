-- ============================================================
-- Reia migrările 071-077 într-un singur fişier
-- ============================================================
-- Migrările 071-077 au fost date drept rulate, dar baza spune altceva:
-- Olandeza are încă 24 de explicaţii decalate, Slavul 21, Nimzo 15, Pirc 10,
-- Alekhine 4; Pirc B joacă în continuare 8.Ne3, mutarea care sare la +2,21
-- pentru negru; iar capcanele lipsesc din toate cinci cursurile.
--
-- În acelaşi timp 078 a intrat curat, ca şi 068, 069 şi 070 înainte. Se vede
-- un tipar, şi nu e unul tehnic: migrările date una câte una au ajuns în bază,
-- cele date ca listă de şapte, nu. La fel s-a întâmplat cu 064-066.
--
-- Deci nu mai caut o cauză în SQL. Fişierul ăsta le pune pe toate şapte la un
-- loc, se poate rula de câte ori vrei fără să strice nimic, şi se termină cu o
-- interogare care spune singură dacă a mers.
--
-- Conţinutul e copiat mecanic din cele şapte fişiere, fără nicio schimbare.
-- Fiecare a fost verificat separat înainte: linii legale, câte o explicaţie
-- pentru fiecare semimutare, potrivită cu mutarea ei, notaţie românească.
-- ============================================================



-- ############################################################
-- 071_regele_indian_capcane.sql
-- ############################################################

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


-- ############################################################
-- 072_olandeza_linii.sql
-- ############################################################

select public.seed_line_text('dutch-defense', 'A',
  'd2d4 f7f5 g2g3 g8f6 f1g2 e7e6 g1f3 d7d5 e1g1 f8d6 c2c4 c7c6 b2b3 e8g8 c1a3 f6e4 a3d6 d8d6 b1d2 b8d7',
  '{
  "0": "Adversarul deschide cu d4 şi ocupă centrul.",
  "1": "f5 — Apărarea Olandeză. Răspunzi în oglindă, dar de partea cealaltă: pionul tău ţine e4, câmpul pe care albul şi-ar dori al doilea pion. E o mutare curajoasă, fiindcă slăbeşte puţin adăpostul regelui tău, şi tot restul deschiderii ţine cont de asta.",
  "2": "g3 — albul îşi pregăteşte nebunul pentru g2, adică exact spre diagonala pe care ai lăsat-o mai slabă.",
  "3": "Cf6 — te dezvolţi şi întăreşti încă o dată stăpânirea pe e4. Calul şi pionul păzesc acum acelaşi câmp.",
  "4": "Ng2 — nebunul se aşază pe diagonala lungă, îndreptat spre colţul tău.",
  "5": "e6 — pionul iese cuminte. Nu e spectaculos, dar sprijină d5, mutarea care urmează, şi face loc nebunului de pe f8.",
  "6": "Cf3 — albul îşi termină dezvoltarea şi ţine sub ochi e5.",
  "7": "d5 — aici se naşte Stonewall-ul, adică zidul de piatră. Trei pioni — d5, e6 şi f5 — stau deja unul lângă altul, toţi pe câmpuri albe, iar al patrulea, c6, vine peste două mutări. Împreună fac un bloc pe care nimeni nu-l poate sparge din faţă. Preţul e cinstit şi trebuie ştiut de la început: nebunul tău de pe c8 rămâne închis în spatele lor, iar câmpurile negre din faţa ta, mai ales e5, rămân fără niciun pion care să le păzească.",
  "8": "Rocada albului. Regele intră la adăpost.",
  "9": "Nd6 — nebunul se aşază exact pe câmpul de care ai nevoie: de pe d6 apără e5, adică tocmai câmpul pe care zidul tău de pioni îl lasă descoperit. În alte variante ale Stonewall-ului nebunul ăsta priveşte de pe d6 până în colţ, la h2, şi de acolo vine atacul. Aici nu: pionul alb de pe g3 taie diagonala, şi ăsta e chiar rostul pentru care albul şi-a jucat fianchetto-ul. Bine de ştiut din vreme, ca să nu aştepţi un atac care nu vine.",
  "10": "c4 — albul îţi loveşte zidul în punctul de jos, la d5.",
  "11": "c6 — îl sprijini cu al patrulea pion. Zidul e complet: c6, d5, e6, f5. De acum nu se mai dărâmă uşor, dar nici nu se mai mişcă — iar asta înseamnă că jocul se va da pe piese, nu pe pioni.",
  "12": "b3 — albul pregăteşte nebunul pentru a3 sau b2.",
  "13": "Rocada. Regele tău intră la adăpost, iar turnul ajunge pe f8, chiar în spatele pionului de pe f5.",
  "14": "Na3 — albul vine după nebunul tău de pe d6. Ştie şi el că acela e piesa care îţi ţine câmpurile negre, şi vrea să-l schimbe.",
  "15": "Ce4 — nu-l aperi, îl ignori şi îţi pui calul unde vrei tu. Pe e4 el e sprijinit de doi pioni, de pe d5 şi de pe f5, iar de acolo nu-l poate alunga nimic. Un cal pe care adversarul nu-l poate goni valorează mai mult decât un nebun pe care poate să-l schimbe.",
  "16": "Nxd6 — albul îşi face schimbul.",
  "17": "Dxd6 — reiei cu dama, şi ea ajunge pe câmpul de unde tocmai a plecat nebunul, preluându-i treaba: de pe d6 apără e5. Nu e o consolare mică. Ai pierdut piesa care păzea câmpurile negre, dar dama stă acum exact în locul ei, iar pionul de pe d5 al tău e apărat în plus.",
  "18": "Cbd2 — albul îşi aduce ultimul cal, ţintind calul tău de pe e4.",
  "19": "Cd7 — îţi aduci şi tu ultima piesă. De pe d7 calul merge spre f6, ca să-l sprijine pe cel de pe e4, sau spre b6 dacă poziţia se deschide pe flancul damei. Deschiderea s-a încheiat: ai un zid care nu cade, un cal care nu poate fi alungat şi o damă bine aşezată."
}'::jsonb);


-- ------------------------------------------------------------
-- B · Varianta Leningrad — fianchetto
-- ------------------------------------------------------------
select public.seed_line_text('dutch-defense', 'B',
  'd2d4 f7f5 g2g3 g8f6 f1g2 g7g6 g1f3 f8g7 e1g1 e8g8 c2c4 d7d6 b1c3 d8e8 d4d5 b8a6 f3d4 a6c5 b2b3 a7a5',
  '{
  "0": "Adversarul deschide cu d4.",
  "1": "f5 — Olandeza. Ţii e4 din prima mutare.",
  "2": "g3 — albul îşi pregăteşte fianchetto-ul.",
  "3": "Cf6 — te dezvolţi şi păzeşti e4 a doua oară.",
  "4": "Ng2 — nebunul alb pe diagonala lungă.",
  "5": "g6 — aici Leningradul se desparte de Stonewall. În loc să ridici un zid de pioni, îţi pui nebunul pe g7 şi joci pe piese. Poziţia iese mai deschisă şi mai ascuţită, dar nebunul tău de câmpuri negre nu rămâne închis nicăieri.",
  "6": "Cf3 — albul îşi termină dezvoltarea.",
  "7": "Ng7 — nebunul intră în fianchetto, pe aceeaşi diagonală lungă ca al lui, doar că din partea cealaltă. Cei doi se privesc drept în faţă, iar cine reuşeşte să deschidă diagonala în folosul lui are un avantaj real.",
  "8": "Rocada albului.",
  "9": "Rocada ta. Amândoi regii sunt la adăpost, aşa că de aici încolo se joacă pentru centru.",
  "10": "c4 — albul îşi ia spaţiu pe flancul damei.",
  "11": "d6 — sprijini viitorul e5, mutarea către care se îndreaptă tot jocul tău. În Leningrad, e5 e ceea ce e f5 pentru alb: ruptura care dă sens poziţiei.",
  "12": "Cc3 — ultima piesă uşoară a albului îşi ia locul.",
  "13": "De8 — mutarea care arată cel mai ciudat din toată deschiderea şi care e, de fapt, cheia. Dama se dă la o parte de pe coloana d, unde stătea în calea propriului pion, şi se aşază în spatele pionului de pe e7. Deocamdată nu face nimic; dar în clipa în care acela sare la e5, dama îl apără de la distanţă — verificat pe poziţie: după e5, pionul e sprijinit şi de damă, şi de pionul de pe d6. Are şi un al doilea rost: de pe e8 poate ieşi pe h5 sau g6 dacă jocul se mută la regele alb.",
  "14": "d5 — albul închide centrul înainte să apuci tu să-l deschizi. Îţi taie e5 pentru moment, dar plăteşte cu asta: un centru închis înseamnă că se joacă pe flancuri.",
  "15": "Ca6 — calul pe margine, ceea ce de obicei e o greşeală, dar aici e drumul cel mai scurt: de pe a6 ajunge la c5, unde stă bine şi apasă pe e4.",
  "16": "Cd4 — calul alb ocupă centrul rămas liber.",
  "17": "Cc5 — calul tău ajunge unde voia. De pe c5 se uită la e4 şi la d3, iar albul nu-l poate alunga cu un pion fără să-şi slăbească singur poziţia.",
  "18": "b3 — albul îşi pregăteşte împingerea b4, ca să-ţi gonească totuşi calul.",
  "19": "a5 — îi tai planul dintr-o mutare. Cu pionul pe a5, b4 nu mai vine gratis, iar calul tău rămâne pe c5. O mutare de pion pusă la timp ţine în loc o piesă mai bună decât ea."
}'::jsonb);


-- ------------------------------------------------------------
-- C · Varianta Clasică — Ne7
-- ------------------------------------------------------------
select public.seed_line_text('dutch-defense', 'C',
  'd2d4 f7f5 g1f3 g8f6 g2g3 e7e6 f1g2 f8e7 e1g1 e8g8 c2c4 d7d5 b2b3 c7c6 c1a3 e7a3 b1a3 f6e4 a3c2 b8d7',
  '{
  "0": "Adversarul deschide cu d4.",
  "1": "f5 — Olandeza.",
  "2": "Cf3 — albul iese cu calul întâi, nu cu pionul de pe g.",
  "3": "Cf6 — te dezvolţi şi păzeşti e4.",
  "4": "g3 — tot spre fianchetto se îndreaptă.",
  "5": "e6 — pregăteşti d5 şi eliberezi nebunul de pe f8.",
  "6": "Ng2 — nebunul alb îşi ia locul.",
  "7": "Ne7 — aici se desparte Varianta Clasică de Stonewall. Nebunul se aşază modest pe e7, nu pe d6. Nu ţinteşte nimic, dar nici nu se expune, şi îţi lasă deschisă alegerea: poţi juca d5 şi să intri în zid, sau d6 şi e5 şi să deschizi jocul.",
  "8": "Rocada albului.",
  "9": "Rocada ta. Turnul ajunge pe f8, în spatele pionului de f5.",
  "10": "c4 — albul îşi ia spaţiu.",
  "11": "d5 — alegi zidul. Pionii tăi ajung pe câmpuri albe — d5, e6, f5 — şi ţin centrul strâns.",
  "12": "b3 — albul pregăteşte nebunul pentru a3.",
  "13": "c6 — al patrulea pion intră în zid. Structura ta e acum aceeaşi ca la Stonewall, doar că nebunul tău stă pe e7, nu pe d6.",
  "14": "Na3 — albul propune schimbul nebunilor de câmpuri negre. Pentru el e o afacere bună: după schimb, câmpurile negre din faţa ta rămân fără paznic.",
  "15": "Nxa3 — schimbi. Nu e o bucurie, dar alternativa — să-ţi retragi nebunul şi să pierzi timp — e mai rea, iar în schimb îi strici albului aşezarea pieselor de pe flancul damei.",
  "16": "Cxa3 — albul reia cu calul, care ajunge într-un colţ din care are drum lung înapoi. Asta e plata lui pentru schimb.",
  "17": "Ce4 — îţi pui calul pe câmpul cel mai bun de pe tablă. E sprijinit de pionii de pe d5 şi f5 şi nu poate fi alungat de niciun pion alb.",
  "18": "Cc2 — calul alb începe drumul de întoarcere spre centru, prin c2 şi e3.",
  "19": "Cd7 — îţi aduci şi ultima piesă. De pe d7 merge spre f6, ca să-l sprijine pe cel de pe e4, sau spre b6 dacă se deschide flancul damei. Deschiderea s-a terminat: ai zidul, ai calul de neclintit, iar el are un cal care încă se întoarce acasă."
}'::jsonb);


-- ############################################################
-- 073_slav_linii.sql
-- ############################################################

select public.seed_line_text('slav-defense', 'A',
  'd2d4 d7d5 c2c4 c7c6 g1f3 g8f6 b1c3 d5c4 a2a4 c8f5 e2e3 e7e6 f1c4 f8b4 e1g1 e8g8 d1e2 b8d7 e3e4 f5g6',
  '{
  "0": "Adversarul deschide cu d4.",
  "1": "d5 — răspunzi în oglindă şi îţi ocupi partea ta de centru. Deocamdată perfect simetric.",
  "2": "c4 — Gambitul Damei. Albul îţi oferă un pion lateral ca să te scoată din centru: dacă iei cu d5xc4, el ia centrul.",
  "3": "c6 — aici începe Apărarea Slavă, şi aici stă toată ideea ei. Îţi sprijini pionul de pe d5 cu pionul de pe c, nu cu cel de pe e. Diferenţa pare mică şi e uriaşă: dacă ai fi jucat e6, ţi-ai fi închis singur nebunul de pe c8 în spatele propriilor pioni. Aşa, el rămâne liber să iasă.",
  "4": "Cf3 — albul se dezvoltă şi ţine sub ochi e5.",
  "5": "Cf6 — te dezvolţi şi îţi aperi pionul de pe d5 încă o dată.",
  "6": "Cc3 — ultimul cal alb îşi ia locul, tot cu ochii pe d5.",
  "7": "dxc4 — abia acum iei pionul, după ce ţi-ai scos caii. Nu-l poţi ţine — albul îl ia oricând înapoi — dar l-ai luat cu un rost: acum coloana d ţi se deschide şi, mai ales, drumul nebunului de pe c8 e liber.",
  "8": "a4 — albul te opreşte să ţii pionul cu b5. E o mutare bună, dar are un preţ pe care îl vei simţi mai târziu: pionul de pe b4 rămâne pentru totdeauna o gaură în poziţia lui.",
  "9": "Nf5 — mutarea pentru care s-a jucat tot. Nebunul iese afară, în faţa lanţului de pioni, exact ce n-ai putea face în Franceză sau în Gambitul Damei clasic. De acum poţi juca e6 liniştit: nu mai închizi pe nimeni.",
  "10": "e3 — albul îşi deschide drumul nebunului de pe f1, ca să-şi ia pionul înapoi.",
  "11": "e6 — abia acum pionul face pasul. Nebunul e deja afară, deci mutarea asta nu mai închide nimic; doar întăreşte d5 şi eliberează nebunul de pe f8.",
  "12": "Nxc4 — albul îşi ia pionul înapoi, cum era de aşteptat. Materialul e din nou egal.",
  "13": "Nb4 — nebunul iese cu folos: ţintuieşte calul de pe c3, fiindcă regele alb e încă pe e1 şi diagonala b4-e1 e goală. Ţintuirea ţine doar o mutare, până face el rocada, dar o mutare e destul ca să-l grăbeşti.",
  "14": "Rocada albului. Îşi scoate regele din ţintuire şi din centru deodată.",
  "15": "Rocada ta. Şi tu îţi pui regele la adăpost, iar turnul ajunge pe f8.",
  "16": "De2 — dama albă se aşază în spatele pionului de pe e3 şi pregăteşte e4.",
  "17": "Cbd7 — îţi aduci şi ultimul cal. De pe d7 sprijină e5 şi c5, cele două rupturi cu care vei încerca să deschizi poziţia.",
  "18": "e4 — albul îşi ia centrul mare şi, în aceeaşi mutare, îţi loveşte nebunul de pe f5.",
  "19": "Ng6 — nebunul se retrage, dar nu departe şi nu în gol. De pe g6 stă în siguranţă, priveşte în continuare spre e4 şi nu blochează pe nimeni. Deschiderea s-a încheiat cu ce ţi-ai dorit: material egal, nebunul cel greu de dezvoltat deja afară şi o poziţie fără slăbiciuni."
}'::jsonb);


-- ------------------------------------------------------------
-- B · Varianta Schimb — cxd5
-- ------------------------------------------------------------
select public.seed_line_text('slav-defense', 'B',
  'd2d4 d7d5 c2c4 c7c6 b1c3 g8f6 c4d5 c6d5 c1f4 b8c6 e2e3 e7e6 g1f3 f8d6 f4d6 d8d6 f1d3 e8g8 e1g1 f8e8',
  '{
  "0": "Adversarul deschide cu d4.",
  "1": "d5 — îţi ocupi centrul.",
  "2": "c4 — Gambitul Damei.",
  "3": "c6 — Apărarea Slavă. Sprijini d5 cu pionul de pe c şi îţi laşi nebunul de pe c8 liber.",
  "4": "Cc3 — albul se dezvoltă.",
  "5": "Cf6 — te dezvolţi şi aperi d5 a doua oară.",
  "6": "cxd5 — Varianta Schimb. Albul rupe tensiunea din centru şi cere remiză, într-un fel: după schimb, structura de pioni e perfect simetrică, iar poziţiile simetrice sunt greu de câştigat. Are şi o veste bună pentru tine, dacă joci pe câştig: cine se plictiseşte primul greşeşte primul.",
  "7": "cxd5 — reiei cu pionul de pe c, singura reluare firească. Structura e acum oglindă curată: amândoi aveţi pioni pe d şi pe e, nimeni n-are nimic slab.",
  "8": "Nf4 — albul îşi scoate nebunul în afara lanţului de pioni, înainte să-l închidă cu e3. Face exact ce faci şi tu în Slavă.",
  "9": "Cc6 — te dezvolţi şi ataci pionul de d4. Într-o poziţie simetrică, cine mută primul cu folos ia iniţiativa.",
  "10": "e3 — albul îşi sprijină pionul de d4 şi deschide drumul nebunului de pe f1.",
  "11": "e6 — la fel şi tu. Simetria continuă, iar asta e în ordine: nu ai de ce să te grăbeşti într-o poziţie fără slăbiciuni.",
  "12": "Cf3 — ultima piesă uşoară a albului iese.",
  "13": "Nd6 — îţi propui singur schimbul nebunilor. Poate părea o mutare de om care vrea remiză, dar are un rost: nebunul lui de pe f4 e mai activ decât al tău, şi de obicei schimbi piesa adversarului care lucrează mai mult decât a ta.",
  "14": "Nxd6 — albul acceptă schimbul.",
  "15": "Dxd6 — reiei cu dama. De pe d6 ea stă bine, în centru şi fără să fie atacată de nimic, iar coloana c ţi se deschide pentru turnuri.",
  "16": "Nd3 — nebunul alb ocupă diagonala spre flancul tău de rege.",
  "17": "Rocada. Regele la adăpost.",
  "18": "Rocada albului. Amândoi sunteţi aşezaţi.",
  "19": "Te8 — turnul ocupă coloana e. Deocamdată nu e deschisă, dar pionul de pe e6 va pleca la un moment dat, iar turnul e deja pregătit. Aşa se joacă poziţiile simetrice: nu cauţi lovitura, îţi aşezi piesele pe câmpurile care vor conta când poziţia se schimbă."
}'::jsonb);


-- ------------------------------------------------------------
-- C · Semi-Slavă — e6 şi c6 deodată
-- ------------------------------------------------------------
select public.seed_line_text('slav-defense', 'C',
  'd2d4 d7d5 c2c4 c7c6 g1f3 g8f6 b1c3 e7e6 e2e3 b8d7 d1c2 f8d6 f1d3 e8g8 e1g1 d5c4 d3c4 b7b5 c4d3 a7a5',
  '{
  "0": "Adversarul deschide cu d4.",
  "1": "d5 — îţi ocupi centrul.",
  "2": "c4 — Gambitul Damei.",
  "3": "c6 — sprijini d5 cu pionul de pe c.",
  "4": "Cf3 — albul se dezvoltă.",
  "5": "Cf6 — te dezvolţi.",
  "6": "Cc3 — al doilea cal alb.",
  "7": "e6 — aici Semi-Slava se desparte de Slava obişnuită, şi merită înţeles de ce. Joci acum şi c6, şi e6, ceea ce înseamnă că îţi închizi singur nebunul de pe c8 — exact lucrul pe care Slava îl evită. În schimb primeşti cel mai solid centru din tot şahul: doi pioni care se apără unul pe altul şi pe care nu-i clinteşte nimeni. E un târg conştient, nu o scăpare.",
  "8": "e3 — albul îşi deschide nebunul de pe f1.",
  "9": "Cbd7 — calul iese pe d7, nu pe c6, fiindcă acolo ar sta în calea pionului tău de pe c6. De pe d7 sprijină şi e5, şi c5.",
  "10": "Dc2 — dama albă se aşază pe coloana c şi pe diagonala spre h7.",
  "11": "Nd6 — nebunul iese activ, îndreptat spre h2. E o mutare de om care vrea joc, nu doar siguranţă.",
  "12": "Nd3 — nebunul alb îşi ia şi el diagonala.",
  "13": "Rocada. Regele la adăpost înainte să înceapă treaba.",
  "14": "Rocada albului.",
  "15": "dxc4 — abia acum iei pionul, la momentul potrivit: albul tocmai şi-a pus nebunul pe d3, aşa că va trebui să-l mute din nou ca să-l ia înapoi. Îl pui să piardă un tempo.",
  "16": "Nxc4 — albul îşi ia pionul, cu nebunul mutat a doua oară.",
  "17": "b5 — aici e răsplata. Îi alungi nebunul şi îţi iei spaţiu pe flancul damei, unde pionii tăi de pe a, b şi c pornesc la drum. Planul ăsta are un nume, Meran, şi e motivul pentru care se joacă toată varianta.",
  "18": "Nd3 — nebunul se retrage a treia oară. Trei mutări cu aceeaşi piesă, în timp ce tu ţi-ai împins pionii.",
  "19": "a5 — al doilea pion porneşte. Pregăteşti b4, care alungă calul de pe c3, şi îţi faci loc pentru nebunul de pe c8: după b4 şi c5, el iese în sfârşit pe b7, pe diagonala lungă. Aşa se plăteşte, cu răbdare, preţul pe care l-ai acceptat la mutarea a patra."
}'::jsonb);


-- ############################################################
-- 074_nimzo_linii.sql
-- ############################################################

select public.seed_line_text('nimzo-indian-defense', 'A',
  'd2d4 g8f6 c2c4 e7e6 b1c3 f8b4 d1c2 e8g8 a2a3 b4c3 c2c3 b7b6 c1g5 c8b7 e2e3 d7d6 g1f3 b8d7 a1d1',
  '{
  "0": "Adversarul deschide cu d4.",
  "1": "Cf6 — calul iese primul şi ţine sub ochi e4, câmpul pe care albul l-ar vrea pentru al doilea pion central.",
  "2": "c4 — albul îşi ia spaţiu pe lat.",
  "3": "e6 — un pion modest, care face loc nebunului de pe f8. Ceea ce urmează e mutarea care dă numele deschiderii.",
  "4": "Cc3 — calul apără c4 şi, mai important, e piesa care păzeşte e4. Aici e toată socoteala: fără el, albul nu poate juca e4.",
  "5": "Nb4 — Apărarea Nimzo-Indiană. Nebunul iese şi ţintuieşte calul de pe c3, legându-l de regele alb de pe e1 pe diagonala b4-e1. Uită-te ce înseamnă asta în cifre: calul rămâne cu zero mutări legale. Iar de aici vine tot: dacă albul joacă totuşi e4, tu iei cu Cxe4, şi calul lui de pe c3 nu poate relua, fiindcă n-are voie să se mişte. Aşa se opreşte o împingere de pion fără să pui niciun pion în faţa ei. Preţul e că, mai devreme sau mai târziu, îţi vei da nebunul pe calul acela — o piesă mai bună pe una mai proastă, în schimbul stăpânirii unui singur câmp.",
  "6": "Dc2 — cea mai populară alegere a albului. Dama se aşază astfel încât, dacă îi iei calul, să poată relua cu ea şi să nu rămână cu pioni dublaţi pe coloana c. E răspunsul cel mai cuminte la Nimzo.",
  "7": "Rocada. Regele intră la adăpost înainte să se lămurească nimic.",
  "8": "a3 — albul te pune să te hotărăşti. Nebunul trebuie ori să ia pe c3, ori să se retragă, pierzând timpul cu care a venit.",
  "9": "Nxc3+ — iei. Retragerea ar însemna că toată ideea deschiderii a fost degeaba. Şahul e doar un amănunt care îl obligă să reia într-un anume fel.",
  "10": "Dxc3 — albul reia cu dama, exact cum a plănuit la mutarea a patra. Pionii lui rămân întregi, dar a plătit altfel: dama a mutat de două ori, iar tu ai o piesă în plus dezvoltată.",
  "11": "b6 — pregăteşti nebunul pentru b7. Ai dat nebunul de câmpuri negre; cel care ţi-a rămas trebuie folosit bine, iar diagonala lungă e cel mai bun drum pe care i-l poţi da.",
  "12": "Ng5 — albul îşi scoate nebunul şi ţinteşte calul de pe f6, unul dintre puţinii apărători ai câmpului e4.",
  "13": "Nb7 — nebunul ajunge pe diagonala lungă, îndreptat drept spre e4. Aici e răsplata pentru schimbul de la mutarea a cincea: albul a scăpat de ţintuire, dar câmpul e4 e în continuare al tău, acum păzit de nebun şi de cal.",
  "14": "e3 — albul îşi deschide drumul nebunului de pe f1. Modest, dar sigur.",
  "15": "d6 — pionul face un singur pas, nu doi. Aşa ţii poziţia închisă, iar într-o poziţie închisă nebunii albi — cei doi pe care i-a păstrat — valorează mai puţin decât caii tăi.",
  "16": "Cf3 — albul îşi termină dezvoltarea.",
  "17": "Cbd7 — ultimul cal iese pe d7, de unde sprijină e5 şi c5, rupturile cu care vei încerca să deschizi poziţia atunci când îţi convine ţie.",
  "18": "Td1 — albul îşi aduce turnul pe coloana damei şi îşi termină aşezarea. Deschiderea s-a încheiat: el are perechea de nebuni şi mai mult spaţiu, tu ai stăpânire pe câmpurile albe din centru şi o poziţie fără nicio slăbiciune. Aşa arată un târg cinstit."
}'::jsonb);


-- ------------------------------------------------------------
-- B · Varianta e3 — Rubinstein
-- ------------------------------------------------------------
select public.seed_line_text('nimzo-indian-defense', 'B',
  'd2d4 g8f6 c2c4 e7e6 b1c3 f8b4 e2e3 e8g8 f1d3 d7d5 g1f3 c7c5 e1g1 c5d4 e3d4 d5c4 d3c4 b7b6 c1g5',
  '{
  "0": "Adversarul deschide cu d4.",
  "1": "Cf6 — calul iese şi păzeşte e4.",
  "2": "c4 — albul îşi ia spaţiu.",
  "3": "e6 — faci loc nebunului.",
  "4": "Cc3 — calul care păzeşte e4 îşi ia locul.",
  "5": "Nb4 — Nimzo-Indiana. Ţintuieşti calul de pe c3 şi îi tai albului împingerea e4.",
  "6": "e3 — Varianta Rubinstein, cea mai solidă de pe listă. Albul nu se grăbeşte să lămurească nimic: îşi deschide nebunul de pe f1, face rocada şi lasă întrebarea cu nebunul tău pentru mai târziu.",
  "7": "Rocada. Regele la adăpost.",
  "8": "Nd3 — nebunul alb se aşază pe diagonala îndreptată spre h7, adică spre regele tău.",
  "9": "d5 — îţi construieşti centrul şi opreşti e4 cu un pion, nu doar cu ţintuirea. De acum, chiar dacă nebunul tău pleacă de pe b4, e4 rămâne greu de jucat.",
  "10": "Cf3 — albul îşi termină dezvoltarea.",
  "11": "c5 — a doua lovitură, de partea cealaltă. Ataci pionul de d4, adică temelia centrului alb. În Nimzo nu ţii poziţia închisă la nesfârşit: o deschizi în clipa în care piesele tale sunt gata.",
  "12": "Rocada albului.",
  "13": "cxd4 — schimbi în centru.",
  "14": "exd4 — albul reia cu pionul de pe e. Coloana e i s-a golit, iar pionul de d4 a rămas fără vecinul din stânga. Mai are unul, pe c4; peste o mutare nu-l va mai avea nici pe acela.",
  "15": "dxc4 — al doilea schimb, şi cel care încheie socoteala. Acum albul n-are niciun pion nici pe coloana c, nici pe e, iar cel de pe d4 rămâne singur: nu-l poate apăra niciun pion, oricât ar vrea. E ce se numeşte un pion izolat, şi va fi ţinta ta pentru tot restul partidei. Îl mai şi obligi să mute nebunul a doua oară.",
  "16": "Nxc4 — albul reia cu nebunul. A mutat cu el de două ori, iar tu între timp ţi-ai făcut treaba în centru.",
  "17": "b6 — pregăteşti nebunul pentru b7, pe diagonala lungă. De acolo va apăsa pe e4 şi pe pionul izolat de d4, la capătul liniei.",
  "18": "Ng5 — albul îşi scoate şi ultimul nebun, ţintind calul de pe f6. Deschiderea s-a terminat: el are piese active şi perechea de nebuni, tu ai o ţintă limpede — pionul de d4, care nu are cine să-l apere cu un pion şi care nu se poate mişca de acolo."
}'::jsonb);


-- ------------------------------------------------------------
-- C · Varianta a3 — Sämisch
-- ------------------------------------------------------------
select public.seed_line_text('nimzo-indian-defense', 'C',
  'd2d4 g8f6 c2c4 e7e6 b1c3 f8b4 a2a3 b4c3 b2c3 c7c5 f2f3 d7d5 c4d5 f6d5 d4c5 f7f5 g1h3 e8g8 h3f4',
  '{
  "0": "Adversarul deschide cu d4.",
  "1": "Cf6 — calul iese.",
  "2": "c4 — albul îşi ia spaţiu.",
  "3": "e6 — faci loc nebunului.",
  "4": "Cc3 — calul care ţine e4.",
  "5": "Nb4 — Nimzo-Indiana.",
  "6": "a3 — Varianta Sämisch, cea mai directă dintre toate. Albul îţi cere nebunul imediat şi e gata să plătească scump pentru el.",
  "7": "Nxc3+ — iei, fiindcă asta ai vrut de la început.",
  "8": "bxc3 — şi aici e diferenţa faţă de celelalte variante: albul reia cu pionul de pe b, nu cu dama. Rămâne cu doi pioni unul peste altul pe coloana c, c3 şi c4, care nu se pot apăra unul pe altul şi nu pot avansa ca lumea. În schimb are amândoi nebunii şi un centru mare. E cel mai clar târg din tot şahul: structură stricată contra putere de foc.",
  "9": "c5 — loveşti imediat, înainte ca el să apuce să-şi aşeze piesele. Într-o poziţie în care adversarul are nebunii, nu-l laşi să deschidă tabla în ritmul lui.",
  "10": "f3 — albul îşi sprijină viitorul e4 cu un pion. Mutarea e încet, dar necesară: fără ea, centrul lui nu se ridică.",
  "11": "d5 — al doilea pion intră în centru. Nu-i laşi loc.",
  "12": "cxd5 — albul schimbă.",
  "13": "Cxd5 — reiei cu calul, nu cu pionul. Aşa calul ajunge în mijlocul tablei şi, mai ales, atacă pionul dublat de pe c3 — cel care nu are cine să-l apere.",
  "14": "dxc5 — albul îşi ia un pion înapoi şi îţi desface centrul.",
  "15": "f5 — mutarea care încheie socoteala din deschidere. Îi tai definitiv câmpul e4, adică exact ce urmărea el cu f3. Toată munca lui de trei mutări rămâne fără rost.",
  "16": "Ch3 — un cal pe margine, ceea ce arată prost, dar albul n-are încotro: pe f3 e propriul pion. Încă un preţ al variantei.",
  "17": "Rocada. Îţi pui regele la adăpost, cu poziţia deja aşezată.",
  "18": "Cf4 — calul alb îşi caută drumul spre centru prin f4. Deschiderea s-a încheiat: el are perechea de nebuni şi un pion în plus pentru moment, tu ai pionii lui dublaţi de pe c ca ţintă permanentă şi stăpânire completă pe câmpul e4."
}'::jsonb);


-- ############################################################
-- 075_pirc_linii.sql
-- ############################################################

select public.seed_line_text('pirc-defense', 'A',
  'e2e4 d7d6 d2d4 g8f6 b1c3 g7g6 g1f3 f8g7 f1e2 e8g8 e1g1 c7c6 a2a4 c8g4 h2h3 g4f3 e2f3 e7e5 d4e5 d6e5',
  '{
  "0": "Adversarul deschide cu e4.",
  "1": "d6 — un pion mic, care nu cere nimic şi nu promite nimic. Apărarea Pirc porneşte de la o idee care sună greşit: îl laşi pe alb să-şi ia tot centrul, fiindcă un centru mare e şi o ţintă mare. Nu-l împiedici, îl aştepţi.",
  "2": "d4 — albul îşi ia al doilea pion central. Exact ce ai vrut.",
  "3": "Cf6 — calul iese şi loveşte pionul de e4, punându-l pe alb să-l apere.",
  "4": "Cc3 — îl apără cu calul. Ţine minte piesa asta: e singurul lucru care păzeşte e4.",
  "5": "g6 — pregăteşti nebunul pentru g7, pe diagonala lungă. De acolo el va apăsa pe centrul alb de la distanţă, fără să se expună.",
  "6": "Cf3 — albul îşi termină dezvoltarea liniştit. Varianta Clasică e cea în care el nu se grăbeşte să atace.",
  "7": "Ng7 — nebunul intră în fianchetto. Priveşte prin d4 până în colţul advers şi e piesa în jurul căreia se învârte toată apărarea ta.",
  "8": "Ne2 — nebunul alb se aşază modest, pregătind rocada.",
  "9": "Rocada. Regele la adăpost, iar turnul ajunge pe f8.",
  "10": "Rocada albului. Amândoi sunteţi aşezaţi, deci începe jocul adevărat.",
  "11": "c6 — un pion mic cu două rosturi: ţine câmpurile b5 şi d5 departe de piesele albe şi pregăteşte b5, dacă vei vrea să joci pe flancul damei.",
  "12": "a4 — albul îţi taie b5 înainte să apuci. Are dreptate să se grăbească, dar plăteşte cu asta: pionul de pe b4 rămâne o gaură permanentă în poziţia lui.",
  "13": "Ng4 — nebunul iese şi ţinteşte calul de pe f3, care e apărătorul pionului de d4. Nu ataci pionul, ataci pe cel care îl ţine.",
  "14": "h3 — albul îţi cere să te hotărăşti: iei calul sau te retragi.",
  "15": "Nxf3 — iei. Dai nebunul pe cal, ceea ce în general nu e o afacere, dar aici e: scapi de apărătorul lui d4 şi îţi pregăteşti lovitura din centru.",
  "16": "Nxf3 — albul reia cu nebunul. Piesa e bună, dar nu mai apără d4 aşa cum o făcea calul.",
  "17": "e5 — lovitura pentru care ai făcut schimbul. Ataci d4 exact când i-a plecat apărătorul, iar nebunul tău de pe g7 se uită prin acelaşi câmp.",
  "18": "dxe5 — albul schimbă în centru.",
  "19": "dxe5 — reiei cu pionul de pe d şi centrul se limpezeşte. Uită-te la ce ai obţinut: material egal, o structură fără nicio slăbiciune, nebunul de pe g7 în sfârşit cu diagonala liberă şi coloana d deschisă pentru turnuri. Asta e Pirc: nu iei nimic la început, ca să iei totul la mijloc."
}'::jsonb);


-- ------------------------------------------------------------
-- B · Atacul Austrian — mutarea 8 corectată
-- ------------------------------------------------------------
select public.seed_line_text('pirc-defense', 'B',
  'e2e4 d7d6 d2d4 g8f6 b1c3 g7g6 f2f4 f8g7 g1f3 e8g8 f1e2 c7c5 d4d5 b7b5 e4e5 d6e5 f4e5 f6g4 e2b5 g4e5',
  '{
  "0": "Adversarul deschide cu e4.",
  "1": "d6 — Pirc. Îi laşi centrul.",
  "2": "d4 — al doilea pion central.",
  "3": "Cf6 — calul loveşte e4.",
  "4": "Cc3 — albul îl apără.",
  "5": "g6 — pregăteşti fianchetto-ul.",
  "6": "f4 — Atacul Austrian, cel mai agresiv răspuns la Pirc. Albul pune al treilea pion în centru şi nu-şi ascunde intenţia: vrea e5, vrea să-ţi spargă poziţia înainte să apuci să te aşezi. Împotriva unei asemenea porniri nu te aperi stând pe loc, ci loveşti în temelie.",
  "7": "Ng7 — nebunul intră în fianchetto, ca de obicei. E cu atât mai important acum: cu cât albul împinge mai mulţi pioni, cu atât diagonala lungă se deschide mai repede.",
  "8": "Cf3 — albul îşi termină dezvoltarea.",
  "9": "Rocada. Regele la adăpost înainte de furtună.",
  "10": "Ne2 — ultimul nebun alb iese, pregătind rocada.",
  "11": "c5 — loveşti d4, temelia centrului. Nu aştepţi atacul, îl întrerupi.",
  "12": "d5 — albul împinge în loc să schimbe. Câştigă spaţiu şi îşi ţine centrul, dar pionul de pe d5 e acum înfipt adânc şi va avea nevoie de pază.",
  "13": "b5 — un pion oferit, şi oferit cu socoteală. Dacă albul îl ia, îşi ia şi o piesă de pe drumul spre centru, iar tu deschizi coloana b şi diagonala nebunului. Aici e cotitura variantei.",
  "14": "e5 — albul nu ia pionul, ci merge înainte cu planul lui. E singura mutare care îi ţine poziţia; oricare alta îl lasă mai prost. Împinge ca să-ţi alunge calul de pe f6 şi să-ţi deschidă poziţia regelui.",
  "15": "dxe5 — iei imediat. Nu-l laşi să treacă mai departe.",
  "16": "fxe5 — albul reia. Are acum doi pioni înfipţi, pe d5 şi pe e5, şi coloana f deschisă spre regele tău.",
  "17": "Cg4 — calul nu se retrage, sare înainte. De pe g4 loveşte pionul de e5 şi îl obligă pe alb să-l apere, în loc să atace.",
  "18": "Nxb5 — abia acum albul îşi ia pionul oferit, cu nebunul.",
  "19": "Cxe5 — şi tu ţi-l iei pe al lui. Materialul e din nou egal, centrul alb s-a subţiat la un singur pion, iar calul tău stă în mijlocul tablei. Poziţia rămâne ascuţită pentru amândoi, ceea ce e cinstit: cine împinge trei pioni în şase mutări nu poate cere şi linişte."
}'::jsonb);


-- ------------------------------------------------------------
-- C · Atacul 150 — Ne3, Dd2, f3
-- ------------------------------------------------------------
select public.seed_line_text('pirc-defense', 'C',
  'e2e4 d7d6 d2d4 g8f6 b1c3 g7g6 c1e3 f8g7 d1d2 c7c6 f2f3 b7b5 g1e2 b8d7 e3h6 g7h6 d2h6 c8b7 e1c1',
  '{
  "0": "Adversarul deschide cu e4.",
  "1": "d6 — Pirc.",
  "2": "d4 — al doilea pion central.",
  "3": "Cf6 — calul loveşte e4.",
  "4": "Cc3 — albul îl apără.",
  "5": "g6 — pregăteşti fianchetto-ul.",
  "6": "Ne3 — începe Atacul 150, aşa numit fiindcă e reţeta pe care o poate juca oricine fără să înveţe teorie. Are trei mutări şi un scop: nebunul pe e3, dama pe d2, pionul pe f3, apoi rocada lungă şi pionii peste regele tău.",
  "7": "Ng7 — îţi pui nebunul pe diagonala lungă. Ştii deja că albul va încerca să-l schimbe, fiindcă e piesa care îţi apără regele.",
  "8": "Dd2 — dama se aşază în spatele nebunului. Cele două piese ţintesc împreună câmpul h6, unde nebunul alb vrea să ajungă.",
  "9": "c6 — pregăteşti b5 şi ţii piesele albe departe de b5 şi d5. În Pirc nu ai loc de manevră, aşa că îţi câştigi spaţiu unde poţi: pe flancul damei.",
  "10": "f3 — albul îşi sprijină pionul de e4 cu unul ieftin şi pregăteşte g4 şi h4.",
  "11": "b5 — porneşti. De aici încolo e o cursă limpede: el vine cu pionii peste regele tău, tu vii cu ai tăi peste al lui. Cine ajunge primul are dreptate.",
  "12": "Cge2 — calul iese pe e2, nu pe f3, unde stă propriul pion. E preţul pe care albul îl plăteşte pentru reţeta lui simplă.",
  "13": "Cbd7 — îţi aduci ultimul cal, de unde sprijină şi b6, şi c5, şi e5.",
  "14": "Nh6 — albul îşi face schimbul plănuit de la mutarea a patra. Vrea nebunul tău de pe g7, fiindcă fără el câmpurile negre din faţa regelui tău rămân fără paznic.",
  "15": "Nxh6 — schimbi. A refuza ar însemna să-ţi retragi nebunul şi să pierzi timpul într-o cursă în care timpul e tot.",
  "16": "Dxh6 — dama albă ajunge lângă regele tău. Arată urât, dar e doar o damă singură: fără alte piese care s-o urmeze, nu poate face nimic.",
  "17": "Nb7 — îţi pui nebunul rămas pe diagonala lungă, îndreptat spre e4 şi mai departe. E piesa ta cea mai bună acum şi e aşezată exact spre partea unde va sta regele alb.",
  "18": "Rocada lungă a albului. Şi-a dus regele acolo unde tu ai deja doi pioni porniţi şi un nebun care priveşte. Deschiderea s-a încheiat: el are dama lângă regele tău, tu ai atacul care vine mai repede."
}'::jsonb);


-- ############################################################
-- 076_alekhine_linii.sql
-- ############################################################

select public.seed_line_text('alekhine-defense', 'A',
  'e2e4 g8f6 e4e5 f6d5 d2d4 d7d6 c2c4 d5b6 f2f4 c8f5 c1e3 e7e6 b1c3 f8e7 g1f3 e8g8 f1e2 d6e5 f4e5',
  '{
  "0": "Adversarul deschide cu e4.",
  "1": "Cf6 — Apărarea Alekhine, şi cea mai obraznică primă mutare din şah. Ataci pionul de e4 cu singura piesă ieşită, ştiind foarte bine că va fi alungată. Toată ideea e asta: îl inviţi să te fugărească cu pionii, fiindcă fiecare pion care înaintează lasă în urmă un câmp pe care nu-l mai poate apăra nimeni.",
  "2": "e5 — albul acceptă invitaţia şi îţi alungă calul.",
  "3": "Cd5 — calul se retrage în centru, nu înapoi acasă. De pe d5 stă bine şi îl obligă pe alb să se hotărască din nou.",
  "4": "d4 — al doilea pion înaintează şi sprijină vârful de pe e5.",
  "5": "d6 — loveşti vârful lanţului de dedesubt. Nu-l poţi ataca cu piese fără să le expui, dar un pion îl întreabă direct: rămâi sau pleci?",
  "6": "c4 — albul îţi alungă calul a doua oară şi ridică Atacul cu Patru Pioni, cea mai ambiţioasă variantă a lui.",
  "7": "Cb6 — calul se dă la o parte pe câmpul de unde încă mai priveşte c4 şi d5. Ai pierdut trei mutări cu el; albul a împins trei pioni. Socoteala e cinstită deocamdată.",
  "8": "f4 — al patrulea pion. Albul are acum c4, d4, e5 şi f4, adică cel mai mare centru pe care îl poate avea cineva. Arată copleşitor şi asta e capcana: patru pioni împinşi nu se mai pot întoarce.",
  "9": "Nf5 — îţi scoţi nebunul afară înainte să-l închizi cu e6. E aceeaşi grijă ca în Caro-Kann sau în Slavă: nebunul de câmpuri albe iese primul, ca să nu rămână închis în spatele propriilor pioni.",
  "10": "Ne3 — albul îşi apără pionul de d4 şi îşi termină dezvoltarea.",
  "11": "e6 — abia acum pionul face pasul. Nebunul e deja afară, aşa că nu închide nimic.",
  "12": "Cc3 — albul îşi aduce ultimul cal.",
  "13": "Ne7 — nebunul iese modest, dar cu rost: pregăteşte rocada, iar de pe e7 stă în afara oricărei lovituri.",
  "14": "Cf3 — albul îşi termină dezvoltarea şi sprijină pionul de e5.",
  "15": "Rocada. Regele la adăpost.",
  "16": "Ne2 — ultimul nebun alb îşi ia locul, pregătind şi el rocada.",
  "17": "dxe5 — abia acum loveşti. Ai aşteptat până ţi-ai scos toate piesele, şi asta e regula întregii deschideri: nu ataci centrul până nu eşti gata să foloseşti ce se deschide.",
  "18": "fxe5 — albul reia cu pionul de pe f. Din cei patru pioni cu care se lăuda i-au rămas trei, coloana f i s-a deschis lui, iar pionul de pe e5 a rămas singur în faţă. Deschiderea s-a încheiat exact cum promitea Alekhine: el are spaţiu, tu ai ţinte."
}'::jsonb);


-- ------------------------------------------------------------
-- B · Varianta Modernă — d4, Cf3
-- ------------------------------------------------------------
select public.seed_line_text('alekhine-defense', 'B',
  'e2e4 g8f6 e4e5 f6d5 d2d4 d7d6 g1f3 c8g4 f1e2 e7e6 e1g1 f8e7 h2h3 g4h5 c2c4 d5b6 b1c3 e8g8 c1e3',
  '{
  "0": "Adversarul deschide cu e4.",
  "1": "Cf6 — Alekhine. Ataci pionul cu calul şi ceri să fii fugărit.",
  "2": "e5 — albul îţi alungă calul.",
  "3": "Cd5 — calul se retrage în centru.",
  "4": "d4 — al doilea pion sprijină vârful.",
  "5": "d6 — loveşti lanţul de dedesubt.",
  "6": "Cf3 — Varianta Modernă, cea mai jucată azi. Albul nu se mai lăcomeşte la pioni; îşi dezvoltă piesele şi păstrează avantajul de spaţiu pe care îl are deja. E răspunsul cel mai neplăcut pentru negru, tocmai fiindcă nu-ţi dă nimic de atacat.",
  "7": "Ng4 — nebunul iese afară şi ţinteşte calul de pe f3, care sprijină pionul de e5. Iarăşi aceeaşi grijă: nebunul de câmpuri albe iese înainte de e6.",
  "8": "Ne2 — albul îşi rupe ţintuirea aşezând nebunul între cal şi dama ta.",
  "9": "e6 — pionul face pasul acum, când nu mai închide pe nimeni.",
  "10": "Rocada albului.",
  "11": "Ne7 — îţi pregăteşti rocada.",
  "12": "h3 — albul îţi cere să te hotărăşti cu nebunul: îl schimbi sau îl retragi.",
  "13": "Nh5 — îl retragi, păstrând ţintuirea. Nebunul rămâne pe diagonală şi calul de pe f3 rămâne legat de apărarea pionului de e5.",
  "14": "c4 — albul îţi alungă calul de pe d5 a doua oară şi îşi lărgeşte centrul.",
  "15": "Cb6 — calul se dă la o parte, tot pe câmpul de unde priveşte înapoi spre c4 şi d5.",
  "16": "Cc3 — albul îşi aduce ultimul cal.",
  "17": "Rocada. Regele la adăpost, iar deschiderea se apropie de sfârşit.",
  "18": "Ne3 — albul îşi termină dezvoltarea şi îşi apără pionul de d4. Poziţia finală e cinstită faţă de ce promite Alekhine: el are mai mult spaţiu şi un pion înfipt pe e5, tu ai toate piesele afară, nebunul de câmpuri albe scos la timp şi doi pioni avansaţi de-ai lui pe care îi vei lovi cu c5 sau f6."
}'::jsonb);


-- ------------------------------------------------------------
-- C · Varianta Schimb — exd6
-- ------------------------------------------------------------
select public.seed_line_text('alekhine-defense', 'C',
  'e2e4 g8f6 e4e5 f6d5 d2d4 d7d6 c2c4 d5b6 e5d6 e7d6 b1c3 b8c6 c1e3 f8e7 f1d3 e8g8 b2b3 a7a5 g1e2',
  '{
  "0": "Adversarul deschide cu e4.",
  "1": "Cf6 — Alekhine.",
  "2": "e5 — calul e alungat.",
  "3": "Cd5 — se retrage în centru.",
  "4": "d4 — albul îşi lărgeşte centrul.",
  "5": "d6 — loveşti vârful lanţului.",
  "6": "c4 — calul e alungat a doua oară.",
  "7": "Cb6 — se dă la o parte, tot cu ochii pe c4 şi d5.",
  "8": "exd6 — Varianta Schimb. Albul rupe tensiunea şi renunţă la pionul înfipt pe e5, adică la piesa lui cea mai avansată. Câştigă linişte, dar renunţă la ce te apăsa cel mai tare.",
  "9": "exd6 — reiei cu pionul de pe e, nu cu cel de pe c. E o alegere, nu o obligaţie, şi merită înţeleasă: aşa îţi deschizi coloana e pentru turn şi îi dai drum nebunului de pe f8. Cealaltă reluare ţi-ar fi dat coloana c, dar ţi-ar fi stricat pionii de pe flancul damei.",
  "10": "Cc3 — albul se dezvoltă.",
  "11": "Cc6 — te dezvolţi şi ataci pionul de d4, care acum e cel mai înaintat pion alb şi singurul cu adevărat atacabil.",
  "12": "Ne3 — albul îşi apără pionul.",
  "13": "Ne7 — nebunul iese pe coloana pe care tocmai ai deschis-o şi pregăteşte rocada.",
  "14": "Nd3 — nebunul alb îşi ia diagonala spre flancul tău de rege.",
  "15": "Rocada. Regele la adăpost, turnul pe f8.",
  "16": "b3 — albul îşi sprijină pionul de c4, care după schimb a rămas cel mai expus.",
  "17": "a5 — porneşti pe flancul damei. Pionul merge spre a4, unde loveşte tocmai sprijinul pe care albul tocmai l-a construit. Când adversarul îşi apără ceva cu un pion, mutarea următoare e să ataci pionul acela.",
  "18": "Cge2 — albul îşi aduce şi ultimul cal, pe e2 fiindcă f3 e nevoie să rămână liber. Deschiderea s-a încheiat: material egal, structuri sănătoase de amândouă părţile, şi un plan limpede pentru fiecare — el în centru şi la rege, tu pe flancul damei, împotriva pionului de c4."
}'::jsonb);


-- ############################################################
-- 077_capcane_patru_cursuri.sql
-- ############################################################

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


-- ============================================================
-- DOVADA — primele două cifre trebuie să fie 0, ultimele două 2 şi 4
-- ============================================================
select
  (select count(*)
     from public.opening_lines l
     join public.courses c on c.id = l.course_id
    where c.slug in ('dutch-defense','slav-defense','nimzo-indian-defense',
                     'pirc-defense','alekhine-defense')
      and array_length(string_to_array(l.moves_uci, ' '), 1)
          <> (select count(*) from jsonb_object_keys(l.move_explanations))
  ) as linii_incomplete,
  (select count(*)
     from public.opening_lines l
     join public.courses c on c.id = l.course_id
    where c.slug = 'pirc-defense' and l.variation_code = 'B'
      and l.moves_uci not like '%e4e5%'
  ) as pirc_b_nereparat,
  (select count(*)
     from public.opening_traps t
     join public.courses c on c.id = t.course_id
    where c.slug = 'kings-indian-defense'
  ) as capcane_regele_indian,
  (select count(*)
     from public.opening_traps t
     join public.courses c on c.id = t.course_id
    where c.slug in ('dutch-defense','slav-defense','pirc-defense','alekhine-defense')
  ) as capcane_celelalte;
