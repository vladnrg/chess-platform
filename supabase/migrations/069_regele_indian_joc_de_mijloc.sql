-- ============================================================
-- Apărarea Regelui Indian: jocul de mijloc
-- ============================================================
-- Structura, ideile şi greşeala tipică pentru fiecare variantă, plus o
-- continuare jucabilă din poziţia în care se opreşte deschiderea.
--
-- Două lucruri le-am scris întâi greşit şi le-am corectat după ce le-am
-- măsurat, nu după ce mi-au sunat bine:
--
-- · La Sämisch voiam să scriu „nu te apăra, aleargă". E fals. La poziţia din
--   lecţie motorul pune h5 — o mutare pur defensivă — pe primul loc, iar b5 pe
--   al doilea, la cinci sutimi diferenţă. Alergarea nu e obligatorie, e o
--   alegere. Ce e cu adevărat greşit acolo e altceva: Cf6-h5, care pierde 1,26.
--
-- · La Varianta Clasică voiam să scriu că f4 e mutarea obligatorie. Nu e:
--   motorul preferă a5, b6 sau c5, iar f4 costă o zecime de pion. Continuarea
--   arătată e planul omenesc, cel pentru care s-a jucat toată deschiderea, şi
--   preţul lui e mic — dar nu-l dau drept singurul drum.
--
-- Fiecare „de evitat" e o mutare măsurată, nu una închipuită: Cxd5 pierde 2,75,
-- Dxd6 pierde dama, Ch5 pierde 1,26 şi două tempouri.
-- ============================================================


-- ============================================================
-- A · VARIANTA CLASICĂ
-- ============================================================
select public.seed_plan('kings-indian-defense', 'A',
  'Centrul e încuiat: pionii albi stau pe c4, d5 şi e4, ai tăi pe d6 şi e5, şi niciunul nu mai poate trece prin celălalt. Când centrul nu se mişcă, jocul se mută în părţi, iar tabla se împarte în două: albul are mai mult spaţiu pe flancul damei şi va împinge acolo cu c5, tu ai pionii liberi pe flancul regelui şi mergi cu ei peste regele lui. Nu e o poziţie în care se face echilibru, e una în care se numără mutările.',
  '[
    {"title": "f4, apoi g5 — pionii merg înainte, nu la schimb", "detail": "După f5, pasul următor firesc e f4, iar apoi g5-g4. Ideea nu e să câştigi un pion, ci să ajungi cu ei până la regele lui. Verificat: f4 costă o zecime de pion faţă de cea mai bună mutare a motorului, adică aproape nimic, în timp ce fxe4 costă o jumătate. Dacă schimbi în centru, îţi desfaci singur lanţul care îi ţine piesele departe."},
    {"title": "Calul se întoarce pe f6", "detail": "L-ai retras pe d7 ca să eliberezi pionul de pe f. Odată ce acela a plecat, calul nu mai are ce căuta acolo: pe f6 sprijină g4 şi h5, adică exact înaintarea ta. O piesă care şi-a făcut treaba se mută înapoi în joc, nu rămâne unde a fost utilă cândva."},
    {"title": "Lasă-l să atace pe flancul damei", "detail": "Albul va juca c5 şi va sparge acolo. E în regulă. Amândoi ştiţi ce aveţi de făcut; întrebarea e cine ajunge primul. Nu-ţi lua piese de la atacul tău ca să apuci să aperi de partea cealaltă — dacă faci asta, rămâi şi fără atac, şi cu apărarea prea subţire."}
  ]'::jsonb,
  'Nu lua pionul de pe d5 cu calul. Arată singur şi înaintat, dar e apărat de pionul de pe c4, iar după 11...Cxd5 12.cxd5 rămâi cu o piesă dată pe un pion — evaluarea cade cu 2,75. E cea mai scumpă greşeală din toată poziţia şi vine tocmai din mutarea care pare cea mai tentantă.'
);

select public.seed_plan_moves('kings-indian-defense', 'A',
  'f2f3 f5f4 c1d2 g6g5 c4c5 d7f6',
  '{
    "0": "f3 — albul îşi sprijină pionul de e4 cu unul ieftin, ca să nu fie nevoit să ţină acolo o piesă.",
    "1": "f4 — treci mai departe, în loc să schimbi. Acum lanţul tău de pioni arată spre regele lui, iar centrul rămâne închis, ceea ce e tocmai ce vrei: piesele albe nu se pot întoarce repede de pe cealaltă parte.",
    "2": "Albul îşi scoate nebunul pe d2 şi se pregăteşte să împingă pe flancul damei.",
    "3": "g5 — al doilea pion porneşte la drum. De aici încolo ameninţi g4, iar dacă albul deschide coloana f, turnul tău e deja pe ea.",
    "4": "c5 — albul îşi începe atacul. Nu e o greşeală şi nu e nimic de reparat; aşa se joacă poziţia asta, fiecare pe partea lui.",
    "5": "Cf6 — calul se întoarce în joc. De pe d7 nu mai avea ce face; de pe f6 sprijină g4 şi h5 şi intră şi el în înaintare."
  }'::jsonb
);


-- ============================================================
-- B · ATACUL CU PATRU PIONI
-- ============================================================
select public.seed_plan('kings-indian-defense', 'B',
  'Zidul de patru pioni s-a subţiat la doi, iar aceştia au ajuns adânc, pe d5 şi e5. Arată ameninţător şi chiar sunt, dar au o slăbiciune: pioni împinşi atât de departe nu mai au cine să-i apere din spate. Albul va încerca să-i împingă până capăt şi să-ţi spargă poziţia din faţa regelui; tu îi opreşti luându-i unul câte unul, şi rămâi cu un pion în plus.',
  '[
    {"title": "Ia pionii, nu fugi de ei", "detail": "Albul îi împinge tocmai ca să te sperie. Când e6 vine peste pionul tău de pe f7, iei cu pionul: îţi deschizi coloana f pentru turn şi îl laşi pe alb fără vârful de lance. Verificat: după schimburi rămâi cu un pion în plus şi cu poziţia egală la evaluare."},
    {"title": "Turnul se întoarce pe f8", "detail": "L-ai adus pe e8 ca să apeşi pe coloana e. După ce pionii se schimbă în centru, coloana care contează devine f — cea pe care tocmai ai deschis-o luând cu pionul. Mutările înapoi nu sunt pierdere de timp dacă poziţia s-a schimbat sub ele."},
    {"title": "Db6 loveşte în două locuri", "detail": "Dama de pe b6 se uită pe diagonala spre f2, adică spre punctul cel mai slab al albului cât timp regele lui n-a plecat din centru, şi în acelaşi timp priveşte pionul de pe b2. Într-o poziţie deschisă, o piesă care apasă pe două direcţii face muncă dublă."}
  ]'::jsonb,
  'Nu lua pionul de pe d6 cu dama. Stă acolo singur, înfipt în poziţia ta, şi e cel mai enervant pion de pe tablă — dar dama albă e pe d1, coloana d e goală până sus, iar 13...Dxd6 14.Dxd6 înseamnă pur şi simplu că ţi-ai dat dama pe un pion. Verificat: din plus un pion ajungi minus şapte. Înainte să iei ceva care pare uitat, uită-te în sus pe coloana pe care stă.'
);

select public.seed_plan_moves('kings-indian-defense', 'B',
  'e5e6 f7e6 d5d6 e8f8 c1g5 d8b6',
  '{
    "0": "e6 — albul îşi împinge pionul peste pionul tău de pe f7. Vrea să-ţi spargă adăpostul regelui înainte să apuci să te aşezi.",
    "1": "fxe6 — iei cu pionul, nu cu altceva. Aşa coloana f se deschide pentru turnul tău, iar albul rămâne fără pionul care ajunsese cel mai departe.",
    "2": "d6 — al doilea pion trece mai departe. Ajunge adânc, dar acolo e singur şi nu are cine să-l apere.",
    "3": "Tf8 — turnul se mută pe coloana care tocmai s-a deschis. Pe e8 îşi făcuse treaba; acum treaba e pe f.",
    "4": "Albul îşi scoate nebunul pe g5, îndreptat spre dama ta.",
    "5": "Db6 — dama iese şi apasă pe două direcţii deodată: pe diagonala spre f2 şi pe pionul de b2. Ai un pion în plus şi o poziţie în care ai ce face."
  }'::jsonb
);


-- ============================================================
-- C · VARIANTA SÄMISCH
-- ============================================================
select public.seed_plan('kings-indian-defense', 'C',
  'Centrul e blocat de pionul alb de pe d5 şi de al tău de pe c5, deci nimeni nu mai trece pe la mijloc. Albul îşi împinge pionii de pe h peste regele tău, tu îi împingi pe ai tăi de pe b peste al lui. Ce contează aici nu e cine are poziţia mai frumoasă, ci cine ajunge cu o mutare mai devreme — şi de aceea fiecare mutare irosită se simte imediat.',
  '[
    {"title": "b5 şi b4 — drumul tău e scurt", "detail": "Calul de pe a6 pare prost aşezat, dar de pe c7 sprijină exact înaintarea b5. Iar b4 loveşte calul de pe c3. Nu-l câştigi cu asta, îl pui doar în mişcare — şi atât e destul, fiindcă el e unul dintre cei trei apărători ai pionului de d5, iar pe acela caii tăi de pe c7 şi f6 îl ţintesc deja de două ori. Împingerea ta nu e doar rapidă, e şi îndreptată spre ceva."},
    {"title": "Apărarea nu e ruşinoasă", "detail": "Aici e locul unde greşesc mulţi, şi eu era să scriu la fel. Nu e adevărat că trebuie să alergi orbeşte: la poziţia din lecţie, h5 — o mutare pur defensivă, care îi opreşte pionul — e prima alegere a motorului, iar b5 vine imediat după, la cinci sutimi. Alegi în funcţie de cât de aproape e el, nu după o regulă."},
    {"title": "Nu-ţi da nebunul de pe g7", "detail": "E piesa pentru care ai jucat toată deschiderea şi singura care ţine diagonala lungă. E şi cel care apără câmpurile negre din faţa regelui tău, iar pionii albi vin exact peste ele. Un schimb care pare curat pe hârtie îţi lasă regele fără paznic tocmai în clipa în care ai cea mai mare nevoie de el."}
  ]'::jsonb,
  'Nu duce calul pe h5. Pare firesc — de acolo ar merge la f4, chiar în faţa regelui alb — dar albul răspunde g4 şi calul n-are unde să stea; se întoarce pe f6 de unde a plecat. Verificat: mutarea costă 1,26 şi două mutări întregi, iar într-o poziţie în care câştigă cine ajunge primul, două mutări sunt exact diferenţa dintre a ajunge şi a nu ajunge.'
);

select public.seed_plan_moves('kings-indian-defense', 'C',
  'h2h4 b7b5 e2g3 a6c7 h4h5 b5b4',
  '{
    "0": "h4 — albul îşi porneşte pionul spre regele tău. De aici încolo se numără mutările.",
    "1": "b5 — porneşti şi tu, pe partea ta. Nu te uiţi la ce face el, îţi faci treaba.",
    "2": "Cg3 — calul alb se aşază unde sprijină înaintarea h5 şi de unde poate sări pe f5.",
    "3": "Cc7 — calul de pe margine intră în joc pe drumul cel mai scurt şi sprijină înaintarea următoare.",
    "4": "h5 — pionul alb ajunge lângă poziţia regelui tău.",
    "5": "b4 — loveşti calul de pe c3 şi îl obligi să se hotărască. El ţine pionul de d5 împreună cu pionul de e4 şi cu dama; dacă pleacă, rămân doi apărători contra celor doi cai ai tăi, de pe c7 şi f6. Cursa e strânsă, dar tu ai o ţintă limpede, iar el încă mai are de spart un zid."
  }'::jsonb
);
