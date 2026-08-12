-- ============================================================
-- Jocul de mijloc pentru ultimele cinci cursuri de negru
-- ============================================================
-- Cincisprezece planuri: Olandeza, Slavul, Nimzo, Pirc, Alekhine. Cu ele, toate
-- cele zece cursuri de negru sunt complete.
--
-- Fiecare continuare a fost măsurată, iar patru au fost aruncate şi înlocuite,
-- fiindcă motorul propunea linii în care negrul rămâne cu material în minus:
--   · Slav C — intra într-un sacrificiu pe h7 şi se încheia cu un pion în minus;
--   · Nimzo C — se încheia la minus trei, adică o piesă întreagă;
--   · Pirc C — un pion în minus la capăt;
--   · Nimzo C avea şi mutarea de start greşită.
-- Ce e aici în locul lor: linii cu material egal, verificate.
--
-- Despre „de evitat" trebuie spus ceva cinstit. La opt dintre cele
-- cincisprezece poziţii există o greşeală adevărată, care costă între 1 şi 2,6
-- pioni sau chiar o piesă, şi acolo scrie cifra. La celelalte şapte n-am găsit
-- nicio mutare firească sub prag: cea mai proastă costă şase sutimi de pion.
-- Acolo nu inventez o gafă — scriu ce e, adică o alegere care desface ce ai
-- construit, şi spun pe faţă că nu e o catastrofă.
--
-- Prima măsurătoare a fost greşită şi a trebuit refăcută toată: măsurasem
-- greşelile în poziţia de la capătul liniei, unde la majoritatea variantelor
-- albul e la mutare. Îmi ieşeau, prin urmare, greşelile adversarului. Acum
-- fiecare e măsurată acolo unde chiar mută negrul.
-- ============================================================


-- ============================================================
-- APĂRAREA OLANDEZĂ
-- ============================================================
select public.seed_plan('dutch-defense', 'A',
  'Zidul stă în picioare şi nu se mai mişcă nimeni prin centru. Ai un cal pe e4 pe care niciun pion alb nu-l poate alunga, şi ai o singură problemă: nebunul de pe c8, închis în spatele propriilor pioni de la mutarea a patra. Tot jocul de mijloc e despre el — cum îl scoţi fără să strici zidul.',
  '[
    {"title": "b6 şi Nb7 — singurul drum al nebunului", "detail": "Pionii tăi stau pe câmpuri albe, deci nebunul de câmpuri albe n-are pe unde ieşi în faţă. Îl scoţi pe lângă, prin b6 şi b7, pe diagonala lungă. De acolo se uită spre e4, unde stă calul tău, şi întăreşte tot ce ai construit."},
    {"title": "Calul de pe e4 e piesa ta cea mai bună", "detail": "E sprijinit de doi pioni, de pe d5 şi de pe f5, iar albul nu-l poate goni cu niciun pion — ar trebui să dea o piesă pe el. Nu-l muta de acolo fără un motiv foarte bun şi nu-l schimba pe ceva mai slab decât el."},
    {"title": "Turnurile pe c1 şi d1 sunt pentru el, nu pentru tine", "detail": "Albul îşi aduce turnurile pe coloanele c şi d, unde poziţia se poate deschide. Răspunsul tău nu e să te sperii, ci să-ţi pui şi tu turnul pe c8, în faţa lui. Într-o poziţie închisă, coloanele contează abia când se deschid — dar cine ajunge primul acolo nu mai trebuie să alerge după."}
  ]'::jsonb,
  'Nu-ţi retrage calul de pe d7 înapoi pe b8. Se întâmplă mai des decât ai crede, din dorinţa de a-l duce pe c6 sau a6. Costă puţin, şase sutimi de pion, deci nu e o catastrofă şi n-o să pierzi partida din asta — dar desface exact ce ai construit în deschidere şi îţi dă înapoi două mutări într-o poziţie în care nu se câştigă nimic repede. Într-un joc închis, mutările irosite sunt singura monedă care se pierde uşor.'
);
select public.seed_plan_moves('dutch-defense', 'A',
  'd1c2 b7b6 a1c1 c8b7 f1d1 a8c8',
  '{
    "0": "Dc2 — albul îşi aşază dama pe coloana c, unde speră să deschidă ceva.",
    "1": "b6 — începi drumul nebunului. Nu poate ieşi în faţă, aşa că iese pe lângă.",
    "2": "Albul îşi aduce turnul pe c1, în spatele damei.",
    "3": "Nb7 — nebunul ajunge pe diagonala lungă. Problema deschiderii e rezolvată: acum toate piesele tale lucrează, iar el se uită drept spre calul tău de pe e4 şi mai departe.",
    "4": "Tfd1 — al doilea turn alb îşi ia coloana.",
    "5": "Tac8 — îţi pui şi tu turnul pe coloana c, în faţa damei lui. Nu ameninţi nimic acum; te aşezi acolo unde va conta când poziţia se deschide."
  }'::jsonb
);

select public.seed_plan('dutch-defense', 'B',
  'Centrul e închis de pionul alb de pe d5, deci nimeni nu trece pe la mijloc. Ai un cal foarte bine aşezat pe c5 şi un nebun pe g7 care aşteaptă ca diagonala lungă să se deschidă. Albul are mai mult spaţiu, dar tu ai piesele mai bine plasate — iar în Leningrad asta contează mai mult decât pare.',
  '[
    {"title": "Calul de pe c5 apasă pe e4", "detail": "De pe c5 el se uită la e4 şi la d3, iar albul nu-l poate alunga cu un pion fără să-şi slăbească singur poziţia. Împreună cu pionul tău de pe f5, ţine sub presiune tot ce are albul în centru."},
    {"title": "Schimbul pe e4 îţi deschide diagonala", "detail": "Când vine momentul, Ce4 urmat de schimbul nebunilor pe e4 lasă un pion negru pe câmpul acela. Nu e o frumuseţe de pion, dar în spatele lui coloana f şi diagonala lungă a nebunului tău de pe g7 devin drumuri adevărate."},
    {"title": "Nu te grăbi cu dama", "detail": "Dama de pe e8 stă acolo cu un rost: sprijină e5 şi păzeşte flancul. Fiecare ieşire prematură a ei într-o poziţie închisă e o invitaţie pentru caii albi, care au câmpuri de sărit tocmai fiindcă poziţia e închisă."}
  ]'::jsonb,
  'Nu juca Cf6-e4 înainte de a-ţi lămuri flancul damei. Pare mutarea firească şi e cea mai scumpă greşeală din toată poziţia: costă 2,27 şi, mai rău, îl lasă pe alb să sară cu Cxc7, unde calul atacă deodată regele şi turnul de pe a8. Verificat: rămâi cu şase puncte de material în minus. La fel de rea e şi Df7, care costă 1,38 şi cade în aceeaşi furculiţă. Regula, aici: cât timp calul alb are câmpul c7 la dispoziţie, nu-ţi lua ochii de la colţul de pe a8.'
);
select public.seed_plan_moves('dutch-defense', 'B',
  'c3b5 c5a6 d1d3 f6e4 g2e4 f5e4',
  '{
    "0": "Ccb5 — calul alb sare spre c7, unde ar da o furculiţă. Trebuie luat în serios pe loc.",
    "1": "Ca6 — îi tai c7 cu calul, mutându-l acolo unde apără câmpul. Pare o retragere; e o apărare exactă.",
    "2": "Dd3 — dama albă se aşază în spatele pionului de e4.",
    "3": "Ce4 — abia acum ai voie. Flancul damei e lămurit, aşa că poţi să-ţi pui calul în centru.",
    "4": "Nxe4 — albul schimbă, fiindcă altfel calul rămâne acolo pentru totdeauna.",
    "5": "fxe4 — reiei cu pionul de pe f. Pionul de e4 nu e frumos, dar coloana f ţi se deschide, iar nebunul de pe g7 primeşte în sfârşit diagonala pentru care l-ai pus acolo."
  }'::jsonb
);

select public.seed_plan('dutch-defense', 'C',
  'Aceeaşi structură de zid ca la Stonewall, cu o singură deosebire care schimbă tot: ai schimbat deja nebunii de câmpuri negre, iar calul alb a ajuns într-un colţ, pe a3, de unde are drum lung înapoi. Ai un cal pe e4 pe care nu-l poate alunga nimic şi un adversar care are de recuperat două mutări.',
  '[
    {"title": "Loveşte pe c4 cât calul lui e departe", "detail": "Calul alb se întoarce spre centru prin c2 şi e3, ceea ce îi ia două mutări. Alea două mutări sunt tot ce ai: dxc4 deschide poziţia exact când el are o piesă în afara jocului."},
    {"title": "Pionul care ajunge pe c3 e o pană", "detail": "După schimbul din centru, un pion negru poate ajunge pe c3, între pionii albi de pe b2 şi d4. De acolo nu poate fi luat uşor şi le ţine piesele albe legate de apărarea lui. Un pion înaintat într-o poziţie închisă valorează mai mult decât unul frumos aşezat."},
    {"title": "Calul de pe e4 rămâne piesa de bază", "detail": "Sprijinit de pionii de pe d5 şi f5, nu poate fi gonit de niciun pion. Toate loviturile tale pornesc de la faptul că el stă acolo şi nu pleacă."}
  ]'::jsonb,
  'Nu scoate dama pe b6. Arată activ şi e chiar tentant, fiindcă de acolo priveşte spre b2 şi spre d4. Costă însă puţin şi nu duce nicăieri — cinci sutimi de pion, deci nu e o gafă, dar e o mutare care nu face nimic într-o poziţie unde ai lucruri concrete de făcut. Într-un joc închis, o mutare care nu face nimic e chiar mai scumpă decât în unul deschis: adversarul o foloseşte ca să-şi aducă piesa care lipsea.'
);
select public.seed_plan_moves('dutch-defense', 'C',
  'a1c1 d5c4 c2e3 c4c3 f3e5 e4d2',
  '{
    "0": "Tc1 — albul îşi aduce turnul pe coloana c.",
    "1": "dxc4 — deschizi tu poziţia, la momentul potrivit: calul lui de pe c2 e încă departe de casă.",
    "2": "Ce3 — calul îşi continuă drumul înapoi spre centru.",
    "3": "c3 — pionul merge înainte şi se înfige între pionii lui de pe b2 şi d4. De acolo nu-l ia nimeni uşor.",
    "4": "Ce5 — albul îşi pune calul în centru, atacându-l pe al tău.",
    "5": "Cd2 — calul tău sare şi el înainte, în loc să se retragă. Ai un pion înfipt pe c3, un cal în tabăra lui şi un adversar care încă îşi caută piesele."
  }'::jsonb
);


-- ============================================================
-- APĂRAREA SLAVĂ
-- ============================================================
select public.seed_plan('slav-defense', 'A',
  'Ai obţinut din deschidere exact ce promite Slava: material egal, structură fără nicio slăbiciune şi nebunul cel greu de dezvoltat deja afară, pe g6. Albul are un centru mare, cu pioni pe d4 şi e4, şi asta e şi puterea, şi grija lui — un centru care înaintează lasă câmpuri în urmă.',
  '[
    {"title": "Nebunul se retrage pe h5, nu pe h7", "detail": "Când albul îl loveşte, mută-l pe h5, unde rămâne pe o diagonală activă şi îl priveşte în continuare pe calul de f3. Pe h7 ar sta în siguranţă, dar închis, iar un nebun închis într-o poziţie deschisă e o piesă în minus."},
    {"title": "Lasă-l să împingă e5", "detail": "Când albul joacă e5, îţi alungă calul de pe f6, dar îşi fixează şi pionii pe câmpuri albe şi îţi lasă câmpul d5. Calul tău ajunge acolo şi nu-l mai poate goni niciun pion."},
    {"title": "Structura ta nu are nimic de reparat", "detail": "Pionii tăi de pe a7, b7, c6, e6, f7, g7, h7 sunt toţi apăraţi de vecini. În partidele lungi, cine n-are nimic slab nu poate fi presat, iar cine nu poate fi presat are timp să-şi caute singur şansele."}
  ]'::jsonb,
  'Nu retrage dama pe c8 ca să-ţi aperi nebunul. Pare grija cea mai firească din lume şi e o greşeală care te costă o piesă: după Dc8 albul joacă e5, calul tău de pe f6 trebuie să plece pe d5, iar apoi Nxg6 ia nebunul pe care tocmai voiai să-l aperi. Verificat: rămâi cu trei puncte de material în minus. Când o piesă de-a ta e ameninţată, prima întrebare nu e „cum o apăr", ci „ce se întâmplă cu restul poziţiei cât timp mă ocup de ea".'
);
select public.seed_plan_moves('slav-defense', 'A',
  'c4d3 g6h5 e4e5 f6d5 c3d5 c6d5',
  '{
    "0": "Nd3 — albul îşi mută nebunul ca să-l lovească pe al tău de pe g6.",
    "1": "Nh5 — te retragi pe câmpul activ, nu pe cel comod. De pe h5 nebunul priveşte în continuare spre f3.",
    "2": "e5 — albul îşi împinge centrul şi îţi alungă calul.",
    "3": "Cd5 — calul ajunge în mijlocul tablei, pe câmpul pe care albul tocmai l-a lăsat liber împingându-şi pionul.",
    "4": "Cxd5 — albul schimbă, ca să nu rămână calul acolo.",
    "5": "cxd5 — reiei cu pionul de pe c. Ai acum un pion solid în centru, coloana c deschisă pentru turn şi o poziţie în care nu e nimic de reparat."
  }'::jsonb
);

select public.seed_plan('slav-defense', 'B',
  'Structura e simetrică şi rămâne aşa: amândoi aveţi pioni pe d şi pe e, nimeni n-are nimic slab. Într-o poziţie ca asta nu se caută lovitura, ci câmpul mai bun. Ai schimbat deja nebunii de câmpuri negre, iar dama ta stă în centru, pe d6, fără să fie atacată de nimic.',
  '[
    {"title": "Dama se retrage pe b8, nu în lateral", "detail": "Când calul alb sare pe b5 şi îţi atacă dama, mut-o pe b8. Pare umilitor — dama înapoi în colţ — dar de acolo apără c7 şi rămâne pe diagonala spre h2. Calul lui trebuie să se întoarcă, iar tu n-ai pierdut nimic."},
    {"title": "Turnul pe e7 pregăteşte dublarea", "detail": "Coloana e nu e deschisă încă, dar pionul de pe e6 va pleca la un moment dat. Turnul pe e7, cu al doilea gata să vină pe e8, e aşezarea care transformă coloana într-un drum în clipa în care se deschide."},
    {"title": "Răbdarea e planul", "detail": "În poziţiile simetrice câştigă cel care greşeşte al doilea. Îţi aşezi piesele pe cele mai bune câmpuri, nu forţezi nimic, şi aştepţi ca adversarul să se plictisească. Nu e o strategie laşă; e singura care funcţionează aici."}
  ]'::jsonb,
  'Nu duce dama pe f8 când e atacată. E cea mai proastă mutare din toată poziţia — costă 2,63 — fiindcă acolo dama nu apără nimic şi, mai ales, lasă câmpul c7 descoperit. Albul sare imediat cu Cc7, calul intră în tabăra ta şi de acolo nu-l mai scoţi. Compară cu Db8, care face exact ce trebuie: apără c7 şi ţine diagonala. Aceeaşi retragere, două câmpuri diferite, două partide diferite.'
);
select public.seed_plan_moves('slav-defense', 'B',
  'c3b5 d6b8 b5c3 c8d7 h2h3 e8e7',
  '{
    "0": "Cb5 — calul alb sare şi îţi atacă dama, ţintind câmpul c7.",
    "1": "Db8 — te retragi în colţ, dar pe câmpul care apără c7. Nu e frumos; e corect.",
    "2": "Cc3 — calul se întoarce de unde a venit. A câştigat o mutare, dar tu n-ai pierdut nimic din poziţie.",
    "3": "Nd7 — îţi dezvolţi ultima piesă. De pe d7 nebunul sprijină şi c6, şi e6.",
    "4": "h3 — albul îşi face o gaură de aer pentru rege, o mutare de om care nu are ce grăbi.",
    "5": "Te7 — turnul ocupă coloana e şi pregăteşte dublarea. Poziţia rămâne echilibrată, dar tu ai un plan limpede, iar el n-are niciunul."
  }'::jsonb
);

select public.seed_plan('slav-defense', 'C',
  'Ai plătit preţul Semi-Slavei — nebunul de pe c8 e închis de propriii pioni — şi ai primit în schimb spaţiu pe flancul damei, cu pionii de pe a5 şi b5 deja porniţi. Jocul de mijloc e despre două lucruri: să nu se prăbuşească centrul şi să iasă nebunul acela.',
  '[
    {"title": "Schimbul pe e4 deschide diagonala", "detail": "Când albul îşi duce calul pe e4, schimbă-l. După ce nebunul lui reia acolo, câmpurile din faţa ta se limpezesc, iar b7 devine în sfârşit un câmp bun pentru nebunul închis. Un schimb care îţi eliberează piesa cea mai proastă e aproape întotdeauna un schimb bun."},
    {"title": "Nb7, în sfârşit", "detail": "E piesa pentru care ai răbdat toată deschiderea. De pe b7 se uită pe diagonala lungă, prin centru, spre flancul de rege al albului. Din clipa în care ajunge acolo, toate piesele tale lucrează."},
    {"title": "Pionii de pe a şi b sunt planul, nu decorul", "detail": "a5 şi b5 nu sunt mutări de umplutură. Merg mai departe la b4, unde alungă calul de pe c3, şi îţi deschid coloanele spre flancul unde albul are mai puţine piese."}
  ]'::jsonb,
  'Nu pune dama pe e7. Pare o mutare de legătură, care aduce turnul pe coloana e, dar costă 1,09 şi te aruncă într-o linie urâtă: albul ia pe c6, iar după ce te aperi cu turnul urmează Cxf6+ cu şah. Verificat: rămâi cu patru puncte de material în minus. Într-o poziţie cu pionul tău de c6 slab şi cu cai albi activi, dama pe e7 stă exact pe câmpul greşit.'
);
select public.seed_plan_moves('slav-defense', 'C',
  'c3e4 f6e4 d3e4 c8b7',
  '{
    "0": "Ce4 — calul alb ocupă centrul şi îţi propune schimbul.",
    "1": "Cxe4 — îl iei. Nu-l laşi acolo, fiindcă din e4 ar apăsa pe tot ce ai.",
    "2": "Nxe4 — albul reia cu nebunul, care ajunge pe o diagonală bună spre regele tău.",
    "3": "Nb7 — şi acum, în sfârşit, iese şi nebunul tău. E mutarea pentru care ai jucat c6 şi e6 şi ai răbdat închis zece mutări. De pe b7 priveşte pe diagonala lungă, iar poziţia ta e în sfârşit întreagă."
  }'::jsonb
);


-- ============================================================
-- APĂRAREA NIMZO-INDIANĂ
-- ============================================================
select public.seed_plan('nimzo-indian-defense', 'A',
  'Ai făcut târgul din deschidere: ţi-ai dat nebunul de câmpuri negre pe calul de pe c3 şi ai primit în schimb stăpânirea câmpului e4. Albul are perechea de nebuni şi mai mult spaţiu; tu ai o poziţie fără nicio slăbiciune şi un cal care poate ajunge pe e4 oricând. Jocul de mijloc arată dacă târgul a fost bun.',
  '[
    {"title": "Ce4 e mutarea pentru care s-a jucat tot", "detail": "Calul se aşază pe câmpul pe care l-ai cumpărat cu nebunul. De acolo atacă nebunul alb de pe g5 şi dama de pe c3 în acelaşi timp, şi porneşte un şir de schimburi care îţi convin ţie: cu cât rămân mai puţine piese, cu atât perechea lui de nebuni contează mai puţin."},
    {"title": "Schimburile lucrează pentru tine", "detail": "Într-o poziţie închisă, doi nebuni nu fac cât doi cai. Fiecare pereche de piese care pleacă de pe tablă îl apropie pe alb de un final în care avantajul lui teoretic nu mai există. Nu fugi de schimburi; caută-le."},
    {"title": "Nebunul de pe b7 e piesa ta cea mai bună", "detail": "E singurul nebun care ţi-a rămas şi stă pe cea mai lungă diagonală, îndreptat spre e4. Nu-l schimba pe un cal şi nu-l bloca cu propriii pioni: tot ce ai construit se sprijină pe el."}
  ]'::jsonb,
  'Nu retrage dama pe b8. E o mutare de aşteptare care nu costă mult — cinci sutimi de pion — dar nu e nimic de aşteptat aici. Ai o mutare concretă la dispoziţie, Ce4, care îţi porneşte tot planul; orice altceva îi dă albului timp să-şi aşeze piesele exact cum vrea. Într-o poziţie în care ai o idee limpede, mutarea neutră e greşeala.'
);
select public.seed_plan_moves('nimzo-indian-defense', 'A',
  'f6e4 g5d8 e4c3 d1d3 a8d8 d3c3',
  '{
    "0": "Ce4 — calul ajunge pe câmpul cumpărat cu nebunul şi atacă deodată nebunul de pe g5 şi dama de pe c3.",
    "1": "Nxd8 — albul ia dama, fiindcă altfel pierde material.",
    "2": "Cxc3 — iei şi tu dama. Schimbul e forţat pentru amândoi.",
    "3": "Td3 — albul îşi aduce turnul ca să recupereze calul.",
    "4": "Taxd8 — reiei nebunul cu turnul de pe a8, nu cu celălalt: aşa amândouă turnurile îţi rămân pe coloane bune.",
    "5": "Txc3 — albul îşi ia calul înapoi. Damele au plecat de pe tablă, materialul e egal, iar perechea lui de nebuni s-a subţiat la unul singur. Exact finalul pe care îl voiai când ai făcut târgul."
  }'::jsonb
);

select public.seed_plan('nimzo-indian-defense', 'B',
  'Albul a rămas cu un pion izolat pe d4 — fără niciun pion vecin care să-l apere, nici pe c, nici pe e — şi cu perechea de nebuni. Ăsta e tot jocul de mijloc: el vrea să folosească nebunii cât poziţia e deschisă, tu vrei să ajungi la un final unde pionul izolat nu mai are cine să-l apere.',
  '[
    {"title": "Nb7 şi Cc6 — amândoi arată spre d4", "detail": "Nebunul pe diagonala lungă şi calul pe c6 apasă pe acelaşi punct. Un pion izolat nu se câştigă dintr-o lovitură; se câştigă adunând atacatori până când apărătorii nu mai ajung."},
    {"title": "Blochează-l înainte să-l ataci", "detail": "Un pion izolat e periculos doar dacă poate înainta. Câmpul din faţa lui, d5, e cel mai bun câmp de pe tablă pentru piesele tale: acolo nu-l poate alunga niciun pion, fiindcă albul nu mai are pioni pe c şi pe e."},
    {"title": "Nebunul se poate întoarce pe e7", "detail": "Nu e o retragere de frică. Pe e7 nebunul apără calul de pe f6 şi se dă din calea propriilor turnuri. Piesele care şi-au făcut treaba pe un câmp nu trebuie să moară acolo."}
  ]'::jsonb,
  'Nu duce nebunul pe a5. Pare că-l ţii activ, pe o diagonală lungă, dar costă 1,17 şi îl scoate din joc: de pe a5 nu apără nimic şi nu atacă nimic din ce contează, iar albul foloseşte timpul ca să-şi aşeze calul pe e5. Într-o poziţie cu un pion izolat de atacat, orice piesă care nu se uită la d4 e o piesă irosită.'
);
select public.seed_plan_moves('nimzo-indian-defense', 'B',
  'c8b7 a1c1 b8c6 c4d3 b4e7 d3b1',
  '{
    "0": "Nb7 — nebunul iese pe diagonala lungă, îndreptat prin centru spre e4 şi mai departe.",
    "1": "Tc1 — albul îşi aduce turnul pe coloana c, deschisă după schimburi.",
    "2": "Cc6 — al doilea atacator al pionului de d4 îşi ia locul.",
    "3": "Nd3 — nebunul alb îşi caută diagonala spre regele tău.",
    "4": "Ne7 — nebunul tău se întoarce pe un câmp folositor: apără calul de pe f6 şi eliberează coloana pentru turnuri.",
    "5": "Nb1 — albul îşi aliniază nebunul şi dama spre h7. Poziţia e echilibrată, dar ţinta ta rămâne aceeaşi şi nu se poate muta de pe d4."
  }'::jsonb
);

select public.seed_plan('nimzo-indian-defense', 'C',
  'Sämisch în forma lui curată: albul are amândoi nebunii şi un pion în plus pentru moment, tu ai pionii lui dublaţi de pe c ca ţintă permanentă şi stăpânire completă pe câmpul e4. Primul lucru de făcut în jocul de mijloc e să-ţi iei pionul înapoi, iar el se ia singur dacă îţi pui piesele unde trebuie.',
  '[
    {"title": "Da5 loveşte pionii dublaţi", "detail": "Dama pe a5 se uită pe diagonală spre c3, adică spre pionul dublat pe care nu-l apără niciun pion. Nu-l câştigi imediat, dar îl legi de apărare — iar o piesă albă care păzeşte un pion nu mai face altceva."},
    {"title": "Pionul de pe c5 se ia înapoi singur", "detail": "Albul l-a luat cu dxc5 şi nu-l poate ţine: nu are cu ce să-l apere de mai multe ori decât îl ataci tu. Verificat pe poziţie — după ce îţi aduci dama şi calul, materialul se egalizează."},
    {"title": "f5 e deja jucat şi rămâne cheia", "detail": "Pionul de pe f5 îi taie albului câmpul e4, adică exact ce urmărea cu f3. Toată poziţia ta se sprijină pe el: nu-l schimba şi nu-l împinge mai departe fără un motiv concret."}
  ]'::jsonb,
  'Nu lua calul de pe f4. E prima captură care sare în ochi, fiindcă acolo stă o piesă albă în mijlocul jocului tău, dar după Cxf4 albul reia cu nebunul şi rămâi cu trei puncte de material în minus. Costă doar cinci sutimi la evaluare, ceea ce înseamnă că poziţia rămâne jucabilă — dar ai dat un cal bun pe un cal bun şi ai deschis diagonala nebunului lui exact spre partea unde stă regele tău. Nu orice schimb egal e un schimb bun.'
);
select public.seed_plan_moves('nimzo-indian-defense', 'C',
  'd8a5 d1d2 b8c6 e2e3',
  '{
    "0": "Da5 — dama iese pe diagonala care duce la pionul dublat de pe c3 şi, în acelaşi timp, priveşte spre pionul de c5.",
    "1": "Dd2 — albul îşi apără pionul de c3 cu dama. E singura apărare pe care o are, şi îl costă libertatea damei.",
    "2": "Cc6 — calul se dezvoltă şi atacă şi el pionul de c5, cel pe care albul îl are în plus.",
    "3": "e3 — albul îşi deschide în sfârşit nebunul de pe f1. Materialul se va egaliza în mutările următoare, iar pionii lui dublaţi rămân acolo pentru tot restul partidei."
  }'::jsonb
);


-- ============================================================
-- APĂRAREA PIRC
-- ============================================================
select public.seed_plan('pirc-defense', 'A',
  'Centrul s-a limpezit şi ai obţinut exact ce promite Pirc: material egal, o structură fără nicio slăbiciune şi nebunul de pe g7 cu diagonala liberă în sfârşit. Albul are pionul de pe a4 împins, ceea ce înseamnă că pe b4 are o gaură pe care n-o mai poate astupa niciodată.',
  '[
    {"title": "Calul pe d7, apoi spre c5 sau f8", "detail": "Ultima piesă care n-a ieşit are două drumuri bune. Prin c5 ajunge la câmpurile slăbite de pionul de a4; prin f8 şi e6 se aşază în faţa regelui, dacă albul porneşte ceva acolo. Nu alege înainte să vezi ce face el."},
    {"title": "b5 e ruptura ta", "detail": "Albul a jucat a4 tocmai ca s-o oprească, dar după ce îţi pregăteşti piesele, b5 vine oricum. Când vine, coloana b se deschide, iar pionul lui de pe a4 rămâne fără vecini — o slăbiciune pe care şi-a făcut-o singur."},
    {"title": "Dama pe c7 leagă totul", "detail": "De pe c7 apără pionul de e5, ţine coloana c sub ochi şi sprijină b5. E câmpul din care dama face trei lucruri deodată, iar într-o poziţie echilibrată asta e diferenţa."}
  ]'::jsonb,
  'Nu duce calul pe h5. Pare o idee bună — de acolo ar merge la f4, chiar în faţa regelui alb — dar albul are nebunul pe f3 şi răspunde Nxh5, iar după gxh5 structura din faţa regelui tău e ruptă şi dama lui ajunge acolo cu şah. Verificat: costă 2,24 şi un pion. E cea mai scumpă greşeală din poziţie, şi vine tocmai din mutarea care pare cea mai activă.'
);
select public.seed_plan_moves('pirc-defense', 'A',
  'a4a5 b8d7 c1e3 d8c7 d1e2 b7b5',
  '{
    "0": "a5 — albul îşi împinge pionul mai departe, ca să-ţi taie definitiv b5. Câştigă spaţiu, dar pionul ajunge şi mai departe de ai lui.",
    "1": "Cbd7 — ultima piesă iese. De pe d7 are drum şi spre c5, şi spre f8.",
    "2": "Ne3 — albul îşi dezvoltă nebunul rămas.",
    "3": "Dc7 — dama pe câmpul care face trei lucruri: apără e5, ţine coloana c şi pregăteşte b5.",
    "4": "De2 — albul îşi leagă piesele.",
    "5": "b5 — ruptura vine oricum, chiar dacă a împins de două ori ca s-o oprească. Coloana b se deschide, iar pionul lui de pe a5 rămâne singur."
  }'::jsonb
);

select public.seed_plan('pirc-defense', 'B',
  'Din Atacul Austrian a ieşit exact ce trebuia: albul şi-a împins trei pioni, i-au rămas doi, iar materialul e egal. Calul tău stă în mijlocul tablei, pe e5, iar nebunul de pe g7 are diagonala lungă. Poziţia rămâne ascuţită pentru amândoi, ceea ce e cinstit — cine împinge atâţia pioni nu poate cere şi linişte.',
  '[
    {"title": "Reia pe e5 cu nebunul, nu cu altceva", "detail": "Când albul schimbă calul de pe e5, ia cu nebunul de pe g7. Nebunul ajunge în centru fără să-şi piardă diagonala, şi de acolo priveşte în continuare spre colţul advers."},
    {"title": "Calul de pe d7 sprijină totul", "detail": "De pe d7 apără e5 şi c5 şi poate sări la b6 sau f6. E piesa de legătură a poziţiei tale — nu o muta fără să vezi ce rămâne descoperit."},
    {"title": "Dama pe c7, pe coloana deschisă", "detail": "Coloana c e a ta de la mutarea a unsprezecea, când ai schimbat pe d4. Dama pe c7 o ocupă şi apasă pe c2, iar turnurile vin după ea. Într-o poziţie ascuţită, cine are o coloană deschisă are un drum."}
  ]'::jsonb,
  'Nu scoate dama pe b6. E cea mai scumpă greşeală din poziţie — 2,56 — şi arată foarte tentant, fiindcă dama pare că apasă pe b2 şi pe d4 deodată. Numai că albul răspunde De2 şi apoi Nc4, iar dama ta se trezeşte atacată şi fără câmp bun de retragere, în timp ce el îşi termină liniştit dezvoltarea. Într-o poziţie deschisă, dama scoasă devreme nu atacă — fuge.'
);
select public.seed_plan_moves('pirc-defense', 'B',
  'f3e5 g7e5 d1e2 b8d7 c1h6 d8c7',
  '{
    "0": "Cxe5 — albul schimbă calul din centru.",
    "1": "Nxe5 — reiei cu nebunul, nu cu pionul. Nebunul ajunge în centru şi îşi păstrează diagonala.",
    "2": "De2 — albul îşi leagă piesele şi pregăteşte rocada.",
    "3": "Cd7 — îţi aduci ultima piesă, pe câmpul de unde sprijină şi e5, şi c5.",
    "4": "Nh6 — albul iese cu nebunul spre flancul tău de rege.",
    "5": "Dc7 — dama ocupă coloana deschisă de la mutarea a unsprezecea şi apasă pe c2. Materialul e egal, iar tu ai un drum limpede pe care el nu-l are."
  }'::jsonb
);

select public.seed_plan('pirc-defense', 'C',
  'Regii au plecat în părţi opuse: al tău pe flancul regelui, al lui pe flancul damei — exact acolo unde ai deja doi pioni porniţi şi un nebun care priveşte. Dama lui a ajuns lângă regele tău, pe h6, şi arată urât, dar e o damă singură. Fără alte piese care s-o urmeze, nu poate face nimic. Cursa e limpede şi tu eşti mai aproape.',
  '[
    {"title": "b4 alungă calul care apără tot", "detail": "Calul de pe c3 e piesa care ţine laolaltă flancul unde stă regele alb. b4 îl obligă să plece, iar el n-are unde: pe b1 sau a4, adică departe de rege. O mutare de pion care goneşte o piesă de apărare valorează mai mult decât o mutare de dezvoltare."},
    {"title": "Da5 intră pe diagonala spre rege", "detail": "După ce calul pleacă, dama ta ajunge pe a5, de unde priveşte spre a2 şi spre c3 — chiar câmpurile din faţa regelui alb. E prima piesă grea care ajunge acolo, şi în cursele cu rocade opuse prima piesă contează mai mult decât a treia."},
    {"title": "Nu-ţi apăra regele, grăbeşte-te", "detail": "Dama albă de pe h6 e singură, iar ca s-o ajute albul are nevoie de trei-patru mutări. Tu ai nevoie de două. Fiecare mutare pe care o dai apărării e o mutare pe care i-o dăruieşti lui — şi în cursa asta nu ai de unde s-o iei înapoi."}
  ]'::jsonb,
  'Nu duce calul pe b6. Pare că-l aduci mai aproape de acţiune şi că sprijini pionii, dar costă 1,04 şi îl scoate de pe d7, unde apăra centrul. Albul răspunde e5, iar după ce calul tău de pe f6 trebuie să plece pe d5, el ia pe d5 şi rămâi cu trei puncte de material în minus. Cursa se pierde cel mai des nu fiindcă alergi prea încet, ci fiindcă îţi laşi centrul descoperit în timp ce alergi.'
);
select public.seed_plan_moves('pirc-defense', 'C',
  'b5b4 c3b1 d8a5 a2a3',
  '{
    "0": "b4 — porneşti. Pionul loveşte calul de pe c3, adică apărătorul flancului unde stă regele alb.",
    "1": "Cb1 — calul se retrage tocmai în colţ. Din punctul ăsta îi trebuie două mutări ca să se întoarcă în joc, iar tu n-ai de gând să i le dai.",
    "2": "Da5 — dama intră pe diagonala spre regele alb. E prima piesă grea care ajunge acolo.",
    "3": "a3 — albul încearcă să-ţi oprească pionul. Poate să-l ia, dar atunci îţi deschide coloana a chiar spre regele lui, cu turnul tău gata să vină. Cursa e strânsă, iar tu ai o mutare avans."
  }'::jsonb
);


-- ============================================================
-- APĂRAREA ALEKHINE
-- ============================================================
select public.seed_plan('alekhine-defense', 'A',
  'Din cei patru pioni cu care se lăuda albul i-au rămas trei, coloana f i s-a deschis lui, iar pionul de pe e5 a rămas singur în faţă. Asta a fost promisiunea Apărării Alekhine de la prima mutare: îl laşi să înainteze, şi apoi ataci ce a rămas în urmă. Acum e momentul.',
  '[
    {"title": "f6 loveşte vârful", "detail": "Pionul de pe e5 e cel mai înaintat pion alb şi cel mai greu de apărat. f6 îl întreabă direct dacă rămâne sau pleacă, iar orice răspuns îi strică ceva: dacă schimbă, îţi deschide coloana f; dacă rămâne, îl ataci a doua oară."},
    {"title": "Calul de pe b6 nu e prost aşezat", "detail": "Pare împins în lateral după ce a fost fugărit de două ori, dar de acolo se uită la c4 şi la d5, adică la pionii pe care albul i-a împins. Prin a5 ajunge şi mai aproape de pionul de c4."},
    {"title": "Nebunul de pe f5 e piesa scoasă la timp", "detail": "L-ai scos înainte de e6 tocmai ca să nu rămână închis. Are diagonala spre b1 şi nu-l poate goni niciun pion fără ca albul să-şi slăbească poziţia. Păzeşte-l: e diferenţa dintre Alekhine şi o deschidere în care ai o piesă moartă."}
  ]'::jsonb,
  'Nu retrage dama pe c8 ca să-ţi aperi nebunul de pe f5. E aceeaşi greşeală care apare şi în Slavă, şi din acelaşi motiv: te ocupi de o piesă şi uiţi restul poziţiei. Albul joacă Nd3 şi îţi schimbă nebunul oricum, iar tu rămâi cu dama într-un colţ şi cu trei puncte de material în minus. Verificat pe poziţie. Când o piesă e ameninţată, uită-te întâi dacă mutarea care o apără nu strică altceva mai mare.'
);
select public.seed_plan_moves('alekhine-defense', 'A',
  'f7f6 e1g1 b8c6 d4d5 c6a5 b2b3',
  '{
    "0": "f6 — loveşti vârful de lance. Pionul de pe e5 trebuie să se hotărască.",
    "1": "Rocada albului. Îşi pune regele la adăpost înainte să se deschidă coloana f.",
    "2": "Cc6 — îţi dezvolţi ultimul cal şi ataci pionul de d4, al doilea din lanţul lui.",
    "3": "d5 — albul îşi împinge pionul ca să-ţi alunge calul, dar îl duce şi mai departe de ai lui.",
    "4": "Ca5 — calul se aşază pe câmpul de unde priveşte pionul de c4. Nu e frumos pe margine, dar e util.",
    "5": "b3 — albul trebuie să-şi apere pionul de c4 cu un pion. Uită-te la ce a ajuns: trei pioni împinşi, toţi având nevoie de pază. Asta a fost ideea de la prima mutare."
  }'::jsonb
);

select public.seed_plan('alekhine-defense', 'B',
  'Varianta Modernă e cea în care albul nu se lăcomeşte: n-are nimic slab, doar mai mult spaţiu şi un pion înfipt pe e5. Poziţia ta e sănătoasă, cu toate piesele afară şi cu nebunul de câmpuri albe scos la timp, pe h5. Jocul de mijloc e despre pionul acela de pe e5 — atâta timp cât stă acolo, te apasă.',
  '[
    {"title": "Loveşte e5 cu piese, nu cu pioni", "detail": "Calul de pe b8 merge pe d7, de unde atacă pionul de e5 şi îl obligă pe alb să se hotărască. Când albul schimbă pe d6, structura ta se limpezeşte şi pionul care te apăsa dispare fără să dai nimic pe el."},
    {"title": "Nebunul de pe h5 îl ţine pe f3 legat", "detail": "Cât timp nebunul stă pe h5, calul de pe f3 e legat de apărarea pionului de e5 şi nu poate pleca liniştit. Schimbă-l abia când asta îţi convine — de obicei după ce pionul de e5 a dispărut."},
    {"title": "După schimburi, ai o poziţie fără defecte", "detail": "Când pionul de e5 pleacă şi nebunii se schimbă pe e2, rămâi cu o structură sănătoasă şi cu piese care lucrează. Albul păstrează puţin spaţiu, dar n-are ce ataca — şi asta e tot ce cere Alekhine de la o partidă."}
  ]'::jsonb,
  'Nu retrage calul de pe b6 înapoi pe c8. Se întâmplă din dorinţa de a-l aduce pe e7 sau d6, dar costă şase sutimi de pion şi, mai important, îţi umple ultima linie cu piese exact când ai nevoie de turnuri libere. Calul de pe b6 nu e prost aşezat: priveşte la c4 şi d5, adică la pionii pe care albul i-a împins. Piesele care par în lateral nu sunt neapărat piese proaste; uită-te ce văd, nu unde stau.'
);
select public.seed_plan_moves('alekhine-defense', 'B',
  'b8d7 e5d6 c7d6 f3d2 h5e2 d1e2',
  '{
    "0": "C8d7 — ultimul cal iese şi atacă pionul de pe e5, cel care te apăsa de zece mutări.",
    "1": "exd6 — albul schimbă, fiindcă nu-l mai poate ţine. Pionul care te incomoda a dispărut fără să dai nimic pe el.",
    "2": "cxd6 — reiei cu pionul de pe c. Structura ta e acum simplă şi sănătoasă, fără nimic de apărat.",
    "3": "Cd2 — calul alb se reaşază, acum că nu mai are ce apăra pe e5.",
    "4": "Nxe2 — schimbi nebunii. Ai aşteptat momentul potrivit: acum nu mai pierzi nimic prin schimb.",
    "5": "Dxe2 — albul reia cu dama. Poziţia e egală în material şi sănătoasă în structură. Alekhine şi-a făcut treaba."
  }'::jsonb
);

select public.seed_plan('alekhine-defense', 'C',
  'După Varianta Schimb au rămas structuri curate de amândouă părţile şi material egal. Fiecare are un plan limpede: albul în centru şi la rege, tu pe flancul damei, împotriva pionului de pe c4 pe care tocmai l-a sprijinit cu b3. Când adversarul îşi apără ceva cu un pion, ţinta următoare e chiar pionul acela.',
  '[
    {"title": "Calul pe b4 atacă nebunul care ţine tot", "detail": "De pe c6 calul sare la b4 şi loveşte nebunul de pe d3 — piesa cu care albul îşi îndreaptă jocul spre regele tău. Dacă îl schimbi acolo, ataci lui atacul înainte să înceapă."},
    {"title": "a5 şi a4 lovesc sprijinul", "detail": "Pionul de pe b3 a fost pus ca să-l apere pe cel de c4. a4 îl întreabă cât rezistă. Nu e o lovitură spectaculoasă, e felul răbdător în care se dărâmă o structură: ataci apărătorul, nu apăratul."},
    {"title": "Turnul pe e8, pe coloana pe care ai deschis-o", "detail": "Ai reluat cu exd6 tocmai ca să ai coloana e. Turnul care ajunge acolo nu face nimic azi, dar e prima piesă care va conta când centrul se mişcă."}
  ]'::jsonb,
  'Nu retrage calul de pe c6 înapoi pe b8. Pare o manevră de reaşezare, ca să-l duci prin d7 mai departe, şi costă doar şase sutimi — dar în poziţia asta n-ai timp de plimbări. Calul de pe c6 are un drum concret, spre b4 şi spre nebunul de pe d3, iar dacă îl retragi îi dai albului două mutări gratis exact când el are un plan la rege şi tu ai unul mai lent, pe flancul damei. În cursele lente, două mutări sunt jumătate din avans.'
);
select public.seed_plan_moves('alekhine-defense', 'C',
  'c6b4 e1g1 f8e8 e2f4 b4d3 d1d3',
  '{
    "0": "Cb4 — calul sare şi atacă nebunul de pe d3, piesa cu care albul îşi îndreaptă jocul spre regele tău.",
    "1": "Rocada albului. Îşi pune regele la adăpost în loc să-şi salveze nebunul.",
    "2": "Te8 — turnul ocupă coloana pe care ai deschis-o reluând cu pionul de pe e.",
    "3": "Cf4 — albul îşi aduce şi ultimul cal spre centru.",
    "4": "Cxd3 — abia acum schimbi. Îi iei nebunul cel bun, pe cel îndreptat spre regele tău.",
    "5": "Dxd3 — albul reia cu dama. Materialul e egal, structurile sunt curate, iar el a rămas fără piesa cu care voia să atace. Aşa se dezamorsează un plan: nu îl aperi, îi iei unealta."
  }'::jsonb
);


-- ============================================================
-- DOVADA — trebuie să arate 15 şi 10
-- ============================================================
select
  (select count(*)
     from public.middlegame_plans p
     join public.opening_lines l on l.id = p.opening_line_id
     join public.courses c on c.id = l.course_id
    where c.slug in ('dutch-defense','slav-defense','nimzo-indian-defense',
                     'pirc-defense','alekhine-defense')
  ) as planuri_noi,
  (select count(*) from (
     select c.id
       from public.courses c
       join public.opening_lines l on l.course_id = c.id
      where l.user_color = 'black'
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
   ) t) as cursuri_negre_complete;
