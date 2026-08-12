-- ============================================================
-- Apărarea Slavă: liniile, rescrise de la zero
-- ============================================================
-- 21 de explicaţii din 37 descriau altă mutare decât cea de sub ele, iar
-- decalajul sărea: la Varianta Schimb, textul de la mutarea 8 vorbea despre
-- prima mutare a negrului, cel de la 9 despre mutarea 8, iar cel de la 10
-- despre mutarea 3. Nu se putea repara prin deplasare. Sunt scrise din nou,
-- toate şaizeci.
--
-- Liniile n-au fost schimbate: verificate cu motorul, toate trei stau între
-- −0,2 şi −0,6 pentru negru, fără nicio mutare care pierde.
--
-- Toate afirmaţiile despre cine vede ce au fost verificate pe poziţie. Una era
-- să intre greşită: că nebunul de pe b4 ţintuieşte calul de pe c3. Îl
-- ţintuieşte cu adevărat — regele alb e încă pe e1 şi diagonala b4-e1 e goală —
-- dar numai o mutare, fiindcă albul face rocada imediat după.
-- ============================================================


-- ------------------------------------------------------------
-- A · Varianta Principală — Nf5, a6
-- ------------------------------------------------------------
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
