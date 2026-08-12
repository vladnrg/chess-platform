-- ============================================================
-- Jocul de mijloc pentru toate cele zece cursuri de alb
-- ============================================================
-- Treizeci de planuri. Cu ele, toate cele douăzeci de cursuri din catalog —
-- zece de negru şi zece de alb — au linii complete şi planuri de joc de mijloc.
--
-- La cursurile de alb cursantul joacă cu albul, deci „de evitat" înseamnă
-- greşeala LUI, iar aceea se măsoară în poziţiile unde albul e la mutare, nu la
-- capătul liniei, unde de obicei mută negrul. E aceeaşi greşeală de metodă pe
-- care am făcut-o prima dată la cursurile de negru; aici măsurătoarea a fost
-- făcută direct cum trebuie.
--
-- Şase continuări propuse de motor au fost respinse şi refăcute:
--   · Italiana A — Ca5 Da4+ Cc6 Db3 Ca5 Da4+, adică o repetiţie de mutări.
--     Remiză prin dans, nu plan;
--   · Gambitul Regelui B — continuarea de şase semimutări îl ducea pe alb de la
--     −0,67 la −3,76; scurtată la patru, cu ce urmează scris pe faţă;
--   · Gambitul Regelui C — continuarea îl arăta pe alb pierzând chiar pionul în
--     plus pe care textul spunea să-l păstreze;
--   · Gambitul Damei C şi Londra B — se opreau în mijlocul unui schimb, cu
--     albul aparent în plus şi cu negrul urmând să reia. Un plan care se
--     opreşte înainte de reluare minte;
--   · Gambitul Damei B şi Gambitul Regelui B — liniile lor s-au schimbat în
--     migrarea 084, deci planurile au fost recalculate pe poziţiile noi.
--
-- La opt planuri n-am găsit nicio greşeală măsurabilă: cea mai proastă mutare
-- firească a albului costă sub jumătate de pion, fiindcă poziţiile sunt închise
-- sau simetrice şi iartă. Acolo scrie exact asta, în loc de o gafă inventată.
--
-- Cea mai instructivă greşeală din tot lotul e la Atacul Regelui Indian, A:
-- mutarea de evitat e Cf1 — chiar mutarea pe care planul o face două semimutări
-- mai târziu. Jucată prea devreme costă un pion, fiindcă lasă pionul de e5 fără
-- apărător. Într-un sistem, ordinea mutărilor nu e amănunt de stil.
-- ============================================================


-- ############################################################
-- Deschiderile cu e4: Italiana, Engleza, Ruy Lopez, Gambitul Regelui, Vienez
-- ############################################################

select public.seed_plan('italian-game', 'A',
  'Ai schimbat nebunii de câmpuri negre şi ai rămas cu un pion pe d4, cu dama pe b3 şi cu nebunul de pe c4 — două piese îndreptate spre f7, punctul pe care îl ţinteşti de la mutarea a treia. Materialul e egal şi nimeni n-are nimic slab; se joacă pe cine îşi aşază piesele mai bine.',
  '[
    {"title": "Dama şi nebunul lucrează pe aceeaşi diagonală", "detail": "Db3 şi Nc4 privesc amândouă spre f7. Nu vei da mat acolo, dar adversarul trebuie să ţină minte în fiecare mutare că sunt acolo — iar o piesă care păzeşte nu atacă. Ăsta e câştigul: nu o lovitură, ci o grijă permanentă pe care i-o dai."},
    {"title": "Calul de pe d2 merge la e4", "detail": "Prin e4 ajunge în mijlocul tablei, unde nu-l poate alunga niciun pion negru, fiindcă pionii lui de pe d şi f au plecat. Manevra asta e cea mai valoroasă mutare liniştită din poziţie."},
    {"title": "Turnul pe e1, pe coloana deschisă", "detail": "Coloana e s-a golit după schimburile din centru. Turnul care ajunge acolo apasă pe tot ce trece prin ea şi pregăteşte împingerea d5, când va veni momentul."}
  ]'::jsonb,
  'Aici n-am găsit nicio greşeală adevărată de semnalat, şi e cinstit s-o spun aşa: la poziţia din lecţie, cea mai proastă mutare firească a albului costă sub o jumătate de pion. Poziţia e sănătoasă şi iartă. Ce trebuie evitat e altceva, care nu se măsoară în pioni: să muţi de dragul mutării. Ai trei piese care încă nu şi-au luat locul cel mai bun — calul spre e4, turnul spre e1, celălalt turn spre d1. Fă-le pe alea înainte să cauţi ceva mai deştept.'
);
select public.seed_plan_moves('italian-game', 'A',
  'c6e7 e1g1 a7a5 f1e1 e8g8 d2e4',
  '{
    "0": "Cce7 — adversarul îşi retrage calul din faţa damei tale şi îl duce spre g6.",
    "1": "Rocada. Regele la adăpost, turnul ajunge pe f1.",
    "2": "a5 — adversarul îşi câştigă spaţiu pe flancul damei.",
    "3": "Tfe1 — turnul ocupă coloana e, cea deschisă după schimburile din centru.",
    "4": "Rocada adversarului.",
    "5": "Ce4 — calul ajunge în mijlocul tablei. Uită-te de ce nu poate fi alungat: pionii negri de pe d şi f au plecat amândoi în schimburi, deci niciun pion nu ajunge la e4. O piesă pe care adversarul n-o poate goni valorează mai mult decât una pe care o poate."
  }'::jsonb
);

select public.seed_plan('italian-game', 'B',
  'Centrul e încuiat şi nu se mişcă nimeni prin el. Ai spaţiu pe flancul damei, cu pionii de pe a4 şi b4 deja împinşi, şi o manevră lungă de făcut cu calul: d2-f1-g3. Pianissimo înseamnă „foarte încet", şi asta şi e — dar cine ştie unde merge fiecare piesă are un avantaj real faţă de cine doar aşteaptă.',
  '[
    {"title": "Cd2-f1-g3, manevra care dă numele variantei", "detail": "Calul face trei mutări ca să ajungă pe g3, de unde priveşte spre f5 şi h5, adică spre regele advers. Într-o poziţie închisă ai timp pentru asemenea plimbări; într-una deschisă n-ai avea."},
    {"title": "Nebunul de pe c1 iese pe e3 sau g5", "detail": "E ultima piesă neaşezată. Pe e3 apără pionii de pe flancul damei şi priveşte spre a7; pe g5 ţinteşte calul de pe f6. Alege în funcţie de ce a făcut adversarul, nu dinainte."},
    {"title": "Pionii de pe flancul damei sunt deja porniţi", "detail": "a4 şi b4 nu se împing mai departe fără rost. Stau acolo şi îi iau adversarului câmpurile b5 şi c5; când vei fi gata cu piesele, atunci vine şi împingerea."}
  ]'::jsonb,
  'Nu duce calul de pe f3 înapoi pe e1. Se face din dorinţa de a-l trimite spre d3 sau g3 pe alt drum, şi costă puţin — cinci sutimi şi jumătate de pion — dar strică ordinea. Calul de pe f3 apără d4 şi e5; cel care trebuie să plece în manevră e celălalt, cel de pe d2, care nu apără nimic. Într-o poziţie închisă, greşelile nu sunt gafe, sunt mutări făcute cu piesa greşită.'
);
select public.seed_plan_moves('italian-game', 'B',
  'c6e7 f1e1 e7g6 d2f1 a6a5 c1e3',
  '{
    "0": "Ce7 — calul advers se retrage şi porneşte spre g6.",
    "1": "Te1 — turnul ocupă coloana e, în spatele pionului.",
    "2": "Cg6 — calul lui ajunge unde voia.",
    "3": "Cf1 — începe manevra. Calul de pe d2 pleacă spre f1, de unde va merge la g3.",
    "4": "a5 — adversarul îţi loveşte lanţul de pioni de pe flancul damei.",
    "5": "Ne3 — ultima piesă îşi ia locul. Poziţia e închisă, tu ai spaţiu şi un plan limpede, iar el are de aşteptat."
  }'::jsonb
);

select public.seed_plan('italian-game', 'C',
  'Împotriva Apărării Ungare ai obţinut exact ce se putea obţine: mai mult spaţiu, un centru solid şi un adversar care s-a aşezat pasiv şi şi-a împins pionii prea departe pe flancul damei. Nu ai o lovitură; ai o poziţie mai bună şi timp să o foloseşti.',
  '[
    {"title": "Calul pe g5 întreabă, nu ameninţă", "detail": "De pe g5 calul se uită la f7 şi la e6. Adversarul trebuie să răspundă cumva, iar fiecare mutare pe care o face ca să te liniştească e o mutare pe care n-o face pentru el."},
    {"title": "Turnul pe e1 pregăteşte d4", "detail": "Coloana e nu e deschisă încă, dar centrul se va deschide la un moment dat cu d4. Turnul care e deja acolo nu va trebui să alerge după."},
    {"title": "Nu-i strica pionii înaintaţi", "detail": "Adversarul are pionii pe a4 şi b4, împinşi mai departe decât e sănătos. Nu-i schimba: cât timp stau acolo, sunt slabi şi trebuie păziţi. Un pion advers înaintat e o ţintă doar dacă rămâne pe tablă."}
  ]'::jsonb,
  'Nici aici nu există o gafă de semnalat — cea mai proastă mutare firească din poziţie costă sub jumătate de pion, fiindcă poziţia e închisă şi iartă. Ce se pierde uşor e altceva: răbdarea. Împotriva unei apărări pasive, tentaţia e să forţezi ceva ca să se întâmple în sfârşit ceva. Nu forţa. Adversarul care s-a aşezat pasiv are un singur plan — să aştepte — iar tu ai zece.'
);
select public.seed_plan_moves('italian-game', 'C',
  'f8e8 f3g5 e8f8 f1e1 h7h6 g5f3',
  '{
    "0": "Te8 — adversarul îşi aduce turnul pe coloana e.",
    "1": "Cg5 — calul iese şi se uită la f7. Nu ameninţă mat, îl obligă doar să se ocupe de tine.",
    "2": "Tf8 — turnul se întoarce ca să apere f7. O mutare pierdută pentru el, câştigată pentru tine.",
    "3": "Te1 — abia acum îţi pui şi tu turnul pe coloana e, fără grabă.",
    "4": "h6 — adversarul îţi alungă calul.",
    "5": "Cgf3 — calul se întoarce liniştit. Nu ai pierdut nimic: el a mutat turnul de două ori şi a slăbit câmpul g6, tu ai câştigat coloana e."
  }'::jsonb
);


-- ============================================================
-- DESCHIDEREA ENGLEZĂ
-- ============================================================
select public.seed_plan('english-opening', 'A',
  'Poziţia e aproape simetrică şi aproape egală, ceea ce e cinstit pentru o Engleză Simetrică. Ce ai în plus e coloana c, deschisă după schimbul din centru, şi un cal negru rătăcit pe c7, care are drum lung înapoi în joc. Din diferenţe mici ca astea se construieşte un avantaj.',
  '[
    {"title": "Turnul pe c1, imediat", "detail": "Coloana c e singurul lucru concret pe care îl ai. Turnul care ajunge primul acolo o ţine, iar adversarul va trebui să-şi cheltuiască o mutare ca să ţi-o dispute."},
    {"title": "Calul spre c4, prin d2", "detail": "De pe c4 calul apasă pe pionul lui de b6 şi pe câmpul d6. E cel mai bun câmp de pe tablă pentru el, şi drumul într-acolo trece prin d2, nu prin altă parte."},
    {"title": "Nebunul de pe g2 e piesa de fond", "detail": "Priveşte pe diagonala lungă de zece mutări şi va continua să privească. Nu-l schimba şi nu-i bloca diagonala cu propriii pioni: într-o poziţie simetrică, o piesă care lucrează în tăcere e diferenţa."}
  ]'::jsonb,
  'La poziţia asta n-am găsit nicio mutare firească a albului care să coste măcar jumătate de pion. Poziţia e simetrică şi solidă, iar simetria iartă. Ce trebuie evitat nu e o mutare, ci o atitudine: să încerci să câştigi cu forţa. În poziţiile simetrice câştigă cine greşeşte al doilea. Îţi aşezi piesele, îţi iei coloana, şi laşi adversarul să se plictisească primul.'
);
select public.seed_plan_moves('english-opening', 'A',
  'c8d7 a1c1 a8c8 d2c4 b7b5 c4d2',
  '{
    "0": "Nd7 — adversarul îşi dezvoltă ultima piesă uşoară.",
    "1": "Tc1 — îţi iei coloana c, singurul lucru concret din poziţie.",
    "2": "Tc8 — adversarul ţi-o dispută.",
    "3": "Cc4 — calul îşi ia câmpul cel mai bun, de unde apasă pe b6 şi d6.",
    "4": "b5 — adversarul îl alungă imediat.",
    "5": "Cd2 — calul se întoarce. Nu e o înfrângere: l-ai obligat să-şi împingă pionul de pe b, iar acum câmpul c5 e o gaură permanentă în poziţia lui."
  }'::jsonb
);

select public.seed_plan('english-opening', 'B',
  'Împotriva Ariciului ai mai mult spaţiu, toate coloanele bune şi dama aşezată în centru pe d4. El are o poziţie strânsă, fără nicio slăbiciune, şi aşteaptă. Toată partida se dă pe o singură întrebare: apucă el să joace b5 şi d5, sau îl ţii legat până se sufocă?',
  '[
    {"title": "Nebunul pe b2 completează bateria", "detail": "Cu nebunul pe b2 şi dama pe d4, ai două piese pe aceeaşi diagonală lungă, îndreptate spre calul lui de pe f6 şi spre colţul din spatele lui. Într-o poziţie strânsă, presiunea pe diagonală face treaba pe care în alte poziţii o fac coloanele."},
    {"title": "e4 la momentul potrivit", "detail": "Împingerea îţi ia şi mai mult spaţiu şi îi taie definitiv câmpul d5. Vine abia după ce ţi-ai aşezat piesele; jucată devreme, i-ar da câmpuri pe care acum nu le are."},
    {"title": "Nu-l lăsa să joace b5", "detail": "Ariciul are exact două rupturi, b5 şi d5, şi trăieşte din ele. Fiecare piesă pe care o pui pe coloana d sau pe diagonala lungă e o piesă care îi întârzie una din ele. Nu ataci — îl asfixiezi."}
  ]'::jsonb,
  'Nici aici nu există o gafă măsurabilă: poziţia e închisă şi nicio mutare firească nu costă peste jumătate de pion. Ce trebuie evitat e groapa în care cad mulţi împotriva Ariciului — să schimbi piese ca să „simplifici". Fiecare pereche de piese care pleacă de pe tablă îi dă adversarului aer în poziţia lui strâmtă, iar spaţiul tău valorează exact atât cât ai piese cu care să-l foloseşti.'
);
select public.seed_plan_moves('english-opening', 'B',
  'b8d7 c1b2 d8b8 e2e4 e8g8 d4e3',
  '{
    "0": "Cbd7 — adversarul îşi aduce ultimul cal, tot pe rândul din spate.",
    "1": "Nb2 — nebunul îşi ia locul pe diagonala lungă, în spatele damei.",
    "2": "Db8 — dama lui se aşază în colţ, de unde pregăteşte b5. Aşa arată Ariciul: totul pare inofensiv până nu mai e.",
    "3": "e4 — îţi iei şi mai mult spaţiu şi îi tai câmpul d5.",
    "4": "Rocada adversarului.",
    "5": "De3 — dama se dă la o parte de pe diagonala lungă, ca să-i lase drum liber nebunului de pe b2. Două piese pe aceeaşi linie nu trebuie să stea una în faţa celeilalte."
  }'::jsonb
);

select public.seed_plan('english-opening', 'C',
  'Ai deschis centrul la momentul potrivit şi ai rămas cu o ţintă limpede: pionul negru de pe c5, care stă singur, fără vecin pe coloana d. Nebunul tău de pe e3 apasă deja pe el, dama de pe a4 lucrează pe două direcţii, iar poziţia e mai bună pentru tine.',
  '[
    {"title": "Turnul pe c1, în spatele ţintei", "detail": "Pionul de pe c5 e pe coloana c. Turnul care ajunge acolo îl atacă a doua oară, iar un pion izolat atacat de două ori are nevoie de doi apărători — adică de două piese scoase din joc."},
    {"title": "Dama lucrează pe diagonala a4-e8", "detail": "De pe a4 priveşte spre calul de pe c6 şi mai departe. Nu ameninţă nimic imediat, dar îl obligă să ţină calul apărat, iar asta îi îngheaţă flancul damei."},
    {"title": "Nu te grăbi să iei pe c5", "detail": "Pionul acela nu fuge nicăieri. Cât timp stă pe tablă e o slăbiciune permanentă; luat prea devreme, dispare şi cu el şi avantajul tău. Adună atacatori până când el nu mai are apărători."}
  ]'::jsonb,
  'Nu duce calul pe e5. Pare mutarea firească — un cal în mijlocul tablei, atacând şi apărând — dar costă cinci sutimi şi jumătate de pion şi, mai important, îi dă adversarului tempoul de care avea nevoie: răspunde Db6 cu atac dublu, iar tu trebuie să-ţi retragi calul pe d3. Într-o poziţie unde ai o ţintă fixă, orice mutare care îi dă adversarului ceva de atacat e o mutare în minus.'
);
select public.seed_plan_moves('english-opening', 'C',
  'c6d4 a1c1 a7a6 a4a3 e6c4 a3c5',
  '{
    "0": "Cd4 — adversarul îşi pune calul în centru, ca să scape de presiune prin schimburi.",
    "1": "Tac1 — îţi aduci turnul pe coloana c, în spatele pionului de c5.",
    "2": "a6 — adversarul îşi ia câmpul b5.",
    "3": "Da3 — dama se mută pe diagonala care duce drept la pionul de c5. Acum îl ataci de două ori.",
    "4": "Nxc4 — adversarul schimbă nebunii, ca să scape de un atacator.",
    "5": "Dxc5 — iei pionul. Nu prin lovitură, ci fiindcă apărătorii lui s-au terminat înaintea atacatorilor tăi. Aşa se câştigă un pion izolat."
  }'::jsonb
);


-- ============================================================
-- RUY LOPEZ (SPANIOLA)
-- ============================================================
select public.seed_plan('ruy-lopez', 'A',
  'Finalul Berlinez, poziţia cea mai studiată din şahul modern. Damele au plecat de pe tablă, regele negru a rămas în centru fără drept de rocadă, iar pionii lui de pe c sunt dublaţi. În schimb el are perechea de nebuni. Nu se câştigă repede şi de multe ori nu se câştigă deloc — dar toate şansele sunt de partea ta.',
  '[
    {"title": "Turnurile pe coloanele d şi e", "detail": "Regele lui e pe d8 şi nu se poate ascunde nicăieri. Fiecare turn pe care îl aduci pe una din coloanele centrale îl ţine acolo. Nu ataci regele — îl împiedici să-şi conecteze turnurile."},
    {"title": "Nebunul pe b2, pe diagonala lungă", "detail": "Prin b3 şi Nb2 nebunul ajunge să privească spre e5 şi mai departe, chiar prin poziţia lui. E cea mai bună diagonală din poziţie şi singura pe care el n-o poate închide."},
    {"title": "Pionii dublaţi de pe c nu se atacă direct", "detail": "Nu-i vei câştiga cu piese, fiindcă sunt uşor de apărat. Valoarea lor e alta: adversarul are opt pioni pe şapte coloane, adică într-un final de pioni pierde. Fiecare schimb de piese te apropie de finalul acela."}
  ]'::jsonb,
  'Nu duce calul pe a4. Pare că îl trimiţi spre c5, un câmp bun, dar costă şapte sutimi de pion şi îl scoate din centru exact când adversarul îşi aşază piesele. Calul tău de pe c3 face acum două lucruri — ţine d5 şi e4 — iar de pe a4 nu face niciunul. Într-un final, o piesă mutată pe marginea tablei e o piesă care lipseşte din partea unde se joacă.'
);
select public.seed_plan_moves('ruy-lopez', 'A',
  'f1d1 d8c8 b2b3 c6c5 c1b2 f5e7',
  '{
    "0": "Td1 — turnul ocupă coloana damei, chiar în faţa regelui advers.",
    "1": "Rc8 — regele negru se dă la o parte, dar tot n-are unde să se ascundă.",
    "2": "b3 — pregăteşti nebunul pentru b2.",
    "3": "c5 — adversarul îşi câştigă spaţiu şi încearcă să-şi rezolve pionii dublaţi.",
    "4": "Nb2 — nebunul ajunge pe diagonala lungă, privind prin toată poziţia lui.",
    "5": "Ce7 — calul lui se retrage spre centru. Poziţia rămâne echilibrată la evaluare, dar toate întrebările grele sunt de partea lui: unde pune regele, ce face cu pionii de pe c, cum îşi leagă turnurile."
  }'::jsonb
);

select public.seed_plan('ruy-lopez', 'B',
  'Spaniola Închisă, şi cea mai bogată poziţie de manevră din şah. Ai nebunul aşezat pe c2, unde nu-l atinge nimeni şi de unde priveşte spre h7, un centru gata să se închidă cu d4-d5, şi zeci de mutări liniştite înainte. Aici nu se caută lovitura; se caută câmpul.',
  '[
    {"title": "d4 şi apoi d5 — închizi centrul când îţi convine", "detail": "Împingerea d4 vine acum, iar d5 imediat după. Un centru închis îţi dă timp pentru manevre lungi, iar tu eşti cel care are unde manevra: el are calul rătăcit pe a5, tu ai toate piesele pe câmpuri bune."},
    {"title": "Calul lui de pe a5 e cea mai proastă piesă de pe tablă", "detail": "A plecat acolo ca să-ţi ia nebunul şi n-a reuşit. Acum are drum lung înapoi — prin c4 sau b7 — şi fiecare mutare pe care o face cu el e o mutare pe care n-o face în centru."},
    {"title": "a4 loveşte lanţul de pe flancul damei", "detail": "Pionii lui de pe a6 şi b5 par solizi, dar stau pe un singur sprijin. a4 îi întreabă cât rezistă şi, dacă schimbă, îţi deschide coloana a chiar spre turnul tău."}
  ]'::jsonb,
  'Nu pune dama pe e2. E câmpul care pare firesc — dama în spatele pionului, turnurile legate — dar aici costă şase sutimi şi jumătate de pion şi, mai rău, blochează nebunul de pe f1 dacă va trebui să se întoarcă. În Spaniola Închisă dama stă mai bine pe d3 sau, mai târziu, pe e1 şi apoi pe flancul regelui. Ordinea mutărilor contează mai mult decât mutările.'
);
select public.seed_plan_moves('ruy-lopez', 'B',
  'd2d4 d8c7 d4d5 a5c4 a2a4 c4b6',
  '{
    "0": "d4 — împingerea pentru care ai jucat c3 la mutarea a noua. Centrul se ridică.",
    "1": "Dc7 — adversarul îşi aşază dama şi îşi apără pionul de e5.",
    "2": "d5 — închizi centrul. De acum tabla se împarte în două, iar tu ai mai multe piese bine plasate.",
    "3": "Cc4 — calul lui începe drumul lung înapoi din colţul de pe a5.",
    "4": "a4 — loveşti lanţul de pioni de pe flancul damei, chiar când piesele lui sunt cel mai prost aşezate.",
    "5": "Cb6 — calul continuă manevra. A folosit trei mutări ca să ajungă de pe c6 pe b6, iar tu ai împins doi pioni şi ai deschis un flanc."
  }'::jsonb
);

select public.seed_plan('ruy-lopez', 'C',
  'Varianta Deschisă e cea în care Spaniola devine tactică. Adversarul are un cal foarte bine plasat pe e4, sprijinit de pionul de pe d5; tu ai pionul înfipt pe e5, mai mult spaţiu şi o poziţie în care fiecare mutare cere socoteală. Materialul e egal şi nimic nu e liniştit.',
  '[
    {"title": "Calul de pe d2 ţinteşte e4", "detail": "Piesa cea mai bună a adversarului stă pe e4. Calul care ajunge pe d2 o atacă, iar când o schimbi acolo, pionul lui de pe d5 rămâne să reia — şi de acolo încolo el are un pion izolat în mijlocul tablei."},
    {"title": "Dama pe d5 după schimburi", "detail": "Când calul de pe e4 dispare şi pionul reia, dama ta poate ajunge pe d5, în mijlocul tablei, atacând deodată pionul de e4 şi turnul din colţ. E răsplata pentru schimbul făcut la momentul potrivit."},
    {"title": "Pionul de pe e5 e temelia", "detail": "El îi taie calului de pe f6 câmpul şi îi ţine poziţia strânsă. Nu-l da pe nimic mai puţin decât o piesă: fără el, toată presiunea ta dispare."}
  ]'::jsonb,
  'Nu duce nebunul pe f4. Arată activ — nebunul iese, apasă pe pionii lui — dar costă cinci sutimi şi jumătate de pion şi îi dă adversarului exact tempoul care îi lipsea: răspunde Cc5, îţi atacă nebunul de pe b3, iar tu trebuie să-l retragi pe c2. Într-o poziţie tactică, o mutare care „arată activ" dar poate fi atacată cu tempo e o mutare care pierde iniţiativa.'
);
select public.seed_plan_moves('ruy-lopez', 'C',
  'e8g8 b1d2 e6g4 d2e4 d5e4 d1d5',
  '{
    "0": "Rocada adversarului. Îşi pune în sfârşit regele la adăpost.",
    "1": "Cbd2 — calul porneşte spre e4, unde stă piesa lui cea mai bună.",
    "2": "Ng4 — adversarul îşi ţintuieşte calul de pe f3, ca să câştige timp.",
    "3": "Cxe4 — schimbi calul de pe e4. Momentul e ales: toate piesele tale sunt aşezate, ale lui nu.",
    "4": "dxe4 — reia cu pionul, care ajunge izolat în mijlocul tablei.",
    "5": "Dd5 — dama intră în centru şi atacă deodată pionul de e4 şi turnul de pe a8. Aşa se converteşte un schimb bine ales într-un avantaj concret."
  }'::jsonb
);


-- ============================================================
-- GAMBITUL REGELUI
-- ============================================================
select public.seed_plan('kings-gambit', 'A',
  'Ţi-ai luat pionul înapoi cu turnul pe f4, materialul e egal, iar regele tău stă pe g1 după o rocadă întârziată. Coloana f e a ta, cu turnul deja pe ea, şi adversarul are regele încă în centru. Într-un Gambit al Regelui, asta e tot ce ceri de la deschidere.',
  '[
    {"title": "Turnul de pe f4 e piesa neobişnuită", "detail": "Un turn pe rândul al patrulea arată ciudat şi e chiar bun: apără pionul de e4, poate aluneca spre h4 sau b4, şi ţine coloana f. Nu-l retrage din reflex."},
    {"title": "Dama pe f2, în spatele turnului", "detail": "Cu dama pe f2 şi turnul pe f4 ai două piese grele pe aceeaşi coloană, îndreptate spre f7. Adversarul nu poate face rocada scurtă liniştit cât timp stau acolo."},
    {"title": "Nebunul se retrage pe d3, nu se schimbă", "detail": "Nebunul de pe b5 şi-a făcut treaba dând şah. Acum locul lui e pe d3, îndreptat spre h7. Schimbat pe calul de pe c6, i-ar întări adversarului centrul şi ţi-ar lua piesa cu care ataci."}
  ]'::jsonb,
  'Nu schimba nebunul pe c6. Pare tentant — îi strici structura, îi dublezi pionii — dar costă şase sutimi şi două zecimi de pion, iar socoteala e proastă: după bxc6 el îşi întăreşte centrul cu pionul, iar tu rămâi fără nebunul de câmpuri albe într-o poziţie unde tocmai pe câmpurile albe ataci. Nu orice stricare de structură merită piesa care o face.'
);
select public.seed_plan_moves('kings-gambit', 'A',
  'f8e7 f1f4 a7a6 b5d3 d8b6 e2f2',
  '{
    "0": "Ne7 — adversarul îşi dezvoltă nebunul şi pregăteşte rocada.",
    "1": "Txf4 — îţi iei pionul înapoi cu turnul. Materialul e egal, iar turnul ajunge pe un câmp neobişnuit şi util.",
    "2": "a6 — adversarul îţi alungă nebunul.",
    "3": "Nd3 — nebunul se retrage pe diagonala spre h7, nu se schimbă pe cal.",
    "4": "Db6 — dama lui iese şi apasă pe b2 şi pe f2.",
    "5": "Df2 — îţi aşezi dama în spatele turnului. Două piese grele pe coloana f, îndreptate spre f7, şi un adversar care încă nu şi-a rezolvat regele."
  }'::jsonb
);

select public.seed_plan('kings-gambit', 'B',
  'Aici trebuie spus limpede ce arată tabla: eşti cu un pion în minus, ai pionii de pe c dublaţi, iar motorul îl pune pe adversar mai bine cu aproape un pion. În schimb ai centrul, doi nebuni buni şi coloana f deschisă. Gambitul Regelui nu promite avantaj — promite o partidă în care nimeni nu ştie teoria pe de rost şi câştigă cine calculează mai bine.',
  '[
    {"title": "Nebunul pe e2 apără şi atacă", "detail": "De pe e2 nebunul ţine pionul de g4, cel mai avansat pion al adversarului şi cel mai greu de apărat de către el. În acelaşi timp îţi pregăteşte rocada, care în varianta asta întârzie mereu."},
    {"title": "Pionul lui de pe g4 e ţinta", "detail": "E departe de restul pionilor lui şi greu de sprijinit. Fiecare piesă pe care o îndrepţi spre el îl obligă să cheltuiască o mutare de apărare — iar tu ai nevoie exact de mutări."},
    {"title": "Nu forţa cu dama", "detail": "Într-o poziţie unde eşti material în minus, tentaţia e să cauţi imediat o lovitură. Aici nu există. Ce există e o poziţie complicată în care adversarul poate greşi, şi singura ta obligaţie e să nu greşeşti tu primul."}
  ]'::jsonb,
  'Nu duce calul de pe d3 înapoi pe c1. Se face din dorinţa de a-l readuce prin e2 spre centru şi costă cinci sutimi şi jumătate de pion, dar problema adevărată e alta: calul de pe d3 e singura piesă care apără pionul de f4, iar acela e chiar pionul pentru care ai jucat toată deschiderea. Şi încă un lucru, mai important decât orice mutare: continuarea arătată aici se opreşte după patru semimutări dinadins. Dacă o duci mai departe cu cele mai bune mutări ale motorului, albul ajunge de la −0,67 la −3,76. Poziţia se ţine, dar nu se ţine singură.'
);
select public.seed_plan_moves('kings-gambit', 'B',
  'e8g8 f1e2 d8e7 e1g1',
  '{
    "0": "Rocada adversarului. Îşi pune regele la adăpost, cu doi pioni în plus pe flancul unde tu ataci.",
    "1": "Ne2 — nebunul iese şi apasă pe pionul de g4, cel mai slab lucru din poziţia lui.",
    "2": "De7 — dama lui se aşază pe coloana e şi îţi ţinteşte pionul de e4.",
    "3": "Rocada. Îţi pui în sfârşit regele la adăpost, iar turnul ajunge pe f1, pe coloana deschisă. De aici încolo se joacă pe cine calculează mai bine — şi asta e tot ce cere Gambitul Regelui de la tine."
  }'::jsonb
);

select public.seed_plan('kings-gambit', 'C',
  'Ai dezamorsat Contragambitul Falkbeer şi ai rămas cu un pion în plus, cu damele schimbate şi cu o poziţie curată. Nu mai e nimic ascuţit pe tablă; e o partidă de tehnică, în care ai un pion şi trebuie doar să nu-l pierzi.',
  '[
    {"title": "Regele merge spre centru", "detail": "Fără dame pe tablă, regele nu mai e o ţintă, e o piesă. Rd2 îl aduce în joc, îl leagă turnurile şi îi dă un rol. Într-un final, regele care ajunge primul în centru face cât o piesă în plus."},
    {"title": "Pionul de pe d5 e câştigul tău", "detail": "L-ai luat la mutarea a treia şi nu l-ai dat înapoi. E un pion trecut în centru şi tot restul partidei se învârte în jurul lui: îl aperi, îl împingi, şi obligi adversarul să-şi aducă piese ca să-l oprească."},
    {"title": "Schimbă piese, nu pioni", "detail": "Cu un pion în plus, fiecare pereche de piese care pleacă de pe tablă lucrează pentru tine. Cu pionii e invers: fiecare pereche de pioni schimbată îţi apropie avantajul de un final în care un pion nu mai ajunge."}
  ]'::jsonb,
  'Nu duce calul pe e5. E cea mai scumpă greşeală din poziţie — costă trei pioni şi jumătate — fiindcă adversarul răspunde Cxd5 şi, după ce dama ta trebuie să se ocupe de el, calul de pe e5 rămâne fără sprijin. Verificat: rămâi cu un pion în minus în loc de unul în plus. Într-un final tehnic, o mutare care „pare activă" şi lasă o piesă neapărată răstoarnă toată partida.'
);
select public.seed_plan_moves('kings-gambit', 'C',
  'e4c3 e3e7 e8e7 b2c3',
  '{
    "0": "Cxc3 — adversarul schimbă calul, ca să-şi uşureze poziţia.",
    "1": "Dxe7+ — schimbi damele cu şah. Cu un pion în plus, schimbul de dame e prietenul tău.",
    "2": "Rxe7 — regele lui reia şi rămâne în centru, fără drept de rocadă.",
    "3": "bxc3 — reiei calul cu pionul de pe b. Aici se opreşte continuarea, şi dinadins: eşti cu un pion în plus, damele au plecat, iar de aici încolo totul e tehnică. Următorul lucru de făcut e să-ţi duci regele spre centru cu Rd2 — fără dame pe tablă, regele nu mai e o ţintă, e o piesă. Ai grijă la nebunul lui de pe f5, care se uită la pionul tău de pe c2: dacă îl laşi să-l ia, avantajul pentru care ai jucat toată deschiderea dispare."
  }'::jsonb
);


-- ============================================================
-- JOCUL VIENEZ
-- ============================================================
select public.seed_plan('vienna-game', 'A',
  'Din Gambitul Vienez a ieşit o poziţie deschisă cu material egal. Ai turnul pe coloana f, deschisă de la mutarea a treia, nebunul pe diagonala spre h7 şi un cal advers ieşit în faţă, pe e4, fără sprijin de pion. Poziţia e echilibrată la evaluare, dar ai lucruri limpezi de făcut, iar el are de rezolvat o piesă.',
  '[
    {"title": "Nebunul pe b5 leagă calul de pe c6", "detail": "Mutat pe b5, nebunul ţintuieşte calul de apărarea a ceea ce e în spatele lui. Nu câştigi material, dar îi îngheţi o piesă, iar într-o poziţie deschisă o piesă îngheţată e o piesă în minus."},
    {"title": "Schimbă nebunii pe d7", "detail": "Dacă adversarul acoperă cu nebunul, schimbul de pe d7 îl obligă să reia cu dama şi îi ia piesa cu care şi-ar fi rezolvat flancul damei. Un schimb care îl lasă cu piesa mai proastă e un schimb bun, chiar dacă pare neutru."},
    {"title": "Calul de pe e2 merge spre f4 sau g3", "detail": "L-ai retras de pe c3 tocmai ca să nu fie schimbat. Acum are două câmpuri bune, amândouă îndreptate spre regele advers, şi drum liber fiindcă pionul de pe f a plecat demult."}
  ]'::jsonb,
  'Nu duce calul înapoi pe c3. Pare o reaşezare firească şi e cea mai scumpă greşeală din poziţie: costă cinci sutimi şi jumătate la evaluare, dar consecinţa e mult mai mare decât atât — după Nf5 şi Ce5, rămâi cu trei puncte de material în minus. Calul de pe e2 are un rost precis, spre f4 şi g3. Piesele retrase fără motiv în poziţii deschise se plătesc imediat.'
);
select public.seed_plan_moves('vienna-game', 'A',
  'c6b4 d3b5 c8d7 b5d7 d8d7 c2c3',
  '{
    "0": "Cb4 — calul advers sare spre c2, unde ar da o furculiţă. Trebuie luat în serios.",
    "1": "Nb5 — nebunul iese cu tempo şi ţintuieşte calul, oprindu-i saltul.",
    "2": "Nd7 — adversarul acoperă.",
    "3": "Nxd7 — schimbi. Îl obligi să reia cu dama şi îl laşi fără nebunul de câmpuri albe.",
    "4": "Dxd7 — reia, cum trebuie.",
    "5": "c3 — pionul mic care îi taie calului de pe b4 tot ce avea de făcut. Trebuie să se retragă, iar tu ai câştigat două mutări şi o piesă adversă schimbată în condiţiile tale."
  }'::jsonb
);

select public.seed_plan('vienna-game', 'B',
  'Cea mai bună poziţie de alb din tot cursul: coloana f deschisă cu turnul pe ea, perechea de nebuni, centrul şi un plan limpede la regele advers. Preţul — pionii dublaţi de pe c — e mic şi l-ai plătit cu ochii deschişi la mutarea a unsprezecea.',
  '[
    {"title": "d4 completează centrul", "detail": "Cu pioni pe c3, d4 şi e4 ai cel mai mare centru pe care îl poţi avea, iar pionii dublaţi îşi găsesc în sfârşit un rost: cel de pe c3 sprijină d4. O slăbiciune care apără ceva nu mai e chiar slăbiciune."},
    {"title": "Calul spre g3, apoi f5", "detail": "De pe e2 calul are drumul deschis spre g3 şi de acolo spre f5 sau h5, adică drept spre regele advers. E piesa care transformă avantajul de poziţie în atac."},
    {"title": "Nebunul de pe c4 se retrage pe b3, nu se schimbă", "detail": "Când adversarul îţi propune schimbul pe e6, nu-l accepta din comoditate. Perechea de nebuni e jumătate din compensaţia pentru pionii dublaţi; dai unul dintre ei şi rămâi doar cu structura stricată."}
  ]'::jsonb,
  'Nu duce calul pe g3 prea devreme. Sună ciudat, fiindcă g3 e chiar câmpul pe care îl vrei — dar înainte de a-ţi retrage nebunul pe b3, mutarea costă un pion şi şase sutimi: adversarul răspunde Nxc4, tu trebuie să reiei cu pionul de pe d, iar centrul pentru care ai plătit cu pionii dublaţi se destramă. Ordinea contează: întâi nebunul pe b3, apoi calul pe g3.'
);
select public.seed_plan_moves('vienna-game', 'B',
  'c8e6 c4b3 f6d7 d3d4 e7g6 e2g3',
  '{
    "0": "Ne6 — adversarul îţi propune schimbul nebunilor de câmpuri albe.",
    "1": "Nb3 — refuzi schimbul şi te retragi pe câmpul bun. Perechea de nebuni face parte din plată.",
    "2": "Cd7 — calul lui se retrage ca să-şi apere poziţia.",
    "3": "d4 — completezi centrul. Pionul dublat de pe c3 sprijină acum d4, deci îşi găseşte în sfârşit un rost.",
    "4": "Cg6 — adversarul îşi aduce şi el calul spre flancul regelui, ca să apere.",
    "5": "Cg3 — abia acum calul merge unde voia. De pe g3 priveşte spre f5 şi h5, iar drumul îi e liber fiindcă pionul de pe f a plecat la mutarea a paisprezecea."
  }'::jsonb
);

select public.seed_plan('vienna-game', 'C',
  'Din varianta cea mai liniştită a Vienei a ieşit exact ce trebuia: ai împins f4 la mutarea a zecea în loc de a treia, dar cu regele deja la adăpost, cu turnul pe coloana f şi cu toate piesele aşezate. Adversarul tocmai a lovit în centru cu d5, aşa că poziţia se deschide — şi se deschide în favoarea celui mai bine pregătit.',
  '[
    {"title": "Schimbă în centru şi deschide coloana f", "detail": "Când pionii se schimbă pe f4, coloana f devine drum liber pentru turnul tău. E singura coloană deschisă din poziţie şi duce direct spre f7."},
    {"title": "Calul de pe c3 se retrage pe d2, nu se schimbă", "detail": "Împins de pionul negru de pe d4, calul are două drumuri: b1 şi apoi d2, sau e2. Prin d2 ajunge la c4 sau f3, amândouă câmpuri bune. Nu-l lăsa schimbat pe un pion împins."},
    {"title": "Nebunul de pe g2 aşteaptă deschiderea", "detail": "Stă pe diagonala lungă de la mutarea a patra fără să fi făcut nimic. În clipa în care centrul se lămureşte, el e piesa care apasă cel mai departe. Nu-i bloca diagonala cu propriii pioni."}
  ]'::jsonb,
  'Nu lua pe e5 cu pionul de pe f. Pare mutarea firească — schimbi în centru, deschizi coloana — dar costă opt sutimi de pion şi te lasă cu un pion în minus după Cxe5, fiindcă piesa care reia acolo e apărată şi a ta nu. Ordinea corectă e invers: îl laşi pe el să ia primul pe f4, iar tu reiei cu pionul de pe g. Aşa coloana f se deschide oricum, dar în condiţiile tale.'
);
select public.seed_plan_moves('vienna-game', 'C',
  'd5d4 c3b1 e5f4 g3f4 f6h5 b1d2',
  '{
    "0": "d4 — adversarul îşi împinge pionul şi îţi alungă calul de pe c3.",
    "1": "Cb1 — calul se retrage tocmai acasă. Arată urât şi e drumul cel mai scurt spre d2, de unde va ajunge la c4 sau f3.",
    "2": "exf4 — adversarul ia primul pe f4, cum voiai.",
    "3": "gxf4 — reiei cu pionul de pe g. Coloana f se deschide pentru turnul tău, iar centrul de pioni ţi se întăreşte.",
    "4": "Ch5 — calul lui atacă pionul de pe f4.",
    "5": "Cd2 — calul tău îşi continuă drumul înapoi spre centru. Poziţia e uşor în favoarea albului, cu coloana f deschisă şi cu toate piesele aşezate — exact ce promitea varianta liniştită."
  }'::jsonb
);


-- ############################################################
-- Deschiderile cu d4: Gambitul Damei, KIA, Catalana, Colle, Londra
-- ############################################################

select public.seed_plan('queens-gambit', 'A',
  'Ai schimbat nebunii de câmpuri negre, ai coloana c cu turnul deja pe ea şi mai mult spaţiu. Adversarul stă solid şi n-are nicio slăbiciune, dar are o problemă veche de zece mutări: nebunul de pe c8 n-a mutat încă niciodată, închis în spatele propriilor pioni. Toată partida se dă pe cât de repede reuşeşte să-l scoată.',
  '[
    {"title": "Nu-l lăsa să joace b6 şi Nb7 liniştit", "detail": "E singurul drum al nebunului închis. Fiecare mutare care îi întârzie manevra — presiune pe coloana c, o piesă pe e5 — valorează mai mult decât pare, fiindcă îl ţine cu o piesă în minus în joc."},
    {"title": "Calul de pe c3 poate sări la d5", "detail": "După schimbul de pe d5 rămâne un câmp de care adversarul nu scapă uşor. Nu sări acolo devreme; sari când nu mai are cu ce să reia decât cu o piesă bună."},
    {"title": "Nebunul se retrage pe d3, spre h7", "detail": "Nebunul de pe c4 şi-a făcut treaba luându-şi pionul înapoi. Diagonala lui adevărată e cea spre h7, iar de acolo, împreună cu dama pe c2, formează bateria clasică din Gambitul Damei."}
  ]'::jsonb,
  'La poziţia din lecţie n-am găsit nicio mutare firească a albului care să coste măcar jumătate de pion — poziţia e solidă şi iartă. Ce trebuie evitat e altceva şi nu se măsoară: să schimbi piese fără motiv. Ai mai mult spaţiu, iar spaţiul valorează exact atât cât ai piese cu care să-l foloseşti. Fiecare schimb propus de adversar dintr-o poziţie strâmtă e un schimb care îl ajută pe el.'
);
select public.seed_plan_moves('queens-gambit', 'A',
  'e1g1 b7b6 c4d3 c8b7 c3d5 e6d5',
  '{
    "0": "Rocada. Regele la adăpost, iar turnul de pe f1 se leagă cu celălalt.",
    "1": "b6 — adversarul începe manevra prin care vrea să-şi scoată nebunul închis.",
    "2": "Nd3 — îţi muţi nebunul pe diagonala adevărată, cea spre h7. Şi-a luat pionul înapoi de pe c4; acum îşi caută rostul.",
    "3": "Nb7 — nebunul lui iese în sfârşit, după zece mutări de aşteptare.",
    "4": "Cxd5 — schimbi calul în centru, exact când nebunul lui tocmai a ajuns pe diagonala lungă.",
    "5": "exd5 — reia cu pionul de pe e, fiindcă altfel îşi strică structura şi mai rău. Uită-te la ce a rămas: nebunul lui de pe b7, abia ieşit, priveşte drept în propriul pion de pe d5. Piesa pentru care a jucat zece mutări e blocată de o mutare a lui."
  }'::jsonb
);

select public.seed_plan('queens-gambit', 'B',
  'Ai un centru mare cu pioni pe d5 şi e4, nebunul îndreptat spre f7 şi un cal advers rătăcit pe b4, care are drum lung înapoi în joc. Materialul e egal şi poziţia e a ta: din deschiderea acceptată a ieşit exact ce promitea, spaţiu în schimbul unui pion împrumutat.',
  '[
    {"title": "Pionul de pe d5 e vârful şi trebuie sprijinit", "detail": "E cel mai avansat pion al tău şi cel care îi taie calului de pe b4 drumul înapoi prin d5 sau c6. Fiecare piesă care îl apără e o piesă bine folosită; fiecare mutare prin care îl pierzi îi redă adversarului poziţia."},
    {"title": "Calul de pe b4 nu trebuie alungat, trebuie ignorat", "detail": "Ameninţă c2 şi d3, dar cu a3 îl obligi să se hotărască şi rămâne fără câmpuri bune. Nu-ţi cheltui piesele ca să-l goneşti — pionii fac treaba mai ieftin."},
    {"title": "Deschide poziţia când el încă nu e gata", "detail": "Ai toate piesele afară; el are un cal pe margine şi regele încă în centru. Într-o poziţie în care eşti mai bine dezvoltat, orice deschidere de linii lucrează pentru tine."}
  ]'::jsonb,
  'Nu lua pe e6 cu pionul de pe d5. Pare firesc — deschizi coloana, îi strici structura — dar e cea mai scumpă greşeală din poziţie: după dxe6 Nxe6 nebunul tău de pe b3 e atacat, iar când îl retragi pe c2 urmează Dxd1 şi rămâi fără dama. Verificat: pierzi zece puncte de material. Vârful de lance de pe d5 nu se schimbă din reflex; se schimbă atunci când ai socotit ce rămâne după.'
);
select public.seed_plan_moves('queens-gambit', 'B',
  'c5c4 a2a3 b4d5 e4d5 c4b3 d5e6',
  '{
    "0": "c4 — adversarul îţi atacă nebunul de pe b3 cu pionul.",
    "1": "a3 — nu te ocupi de nebun; îi ceri calului de pe b4 să se hotărască. Într-o poziţie unde eşti mai bine dezvoltat, tempoul valorează mai mult decât o piesă mutată în siguranţă.",
    "2": "Cxd5 — calul lui ia pionul înaintat, singura încercare pe care o are.",
    "3": "exd5 — reiei cu pionul de pe e. Ai din nou un pion pe d5 şi coloana e deschisă pentru turn.",
    "4": "cxb3 — adversarul îţi ia nebunul.",
    "5": "dxe6 — şi acum, abia acum, iei pe e6. Ordinea a contat: ai făcut-o după ce s-au lămurit schimburile, nu înainte, iar pionul tău ajunge la un pas de regele lui."
  }'::jsonb
);

select public.seed_plan('queens-gambit', 'C',
  'Împotriva Apărării Slave ai obţinut centrul mare, cu pioni pe d4 şi e4, şi iniţiativa. Preţul l-ai plătit la mutarea a cincea cu a4: câmpul b4 a rămas o gaură permanentă, iar nebunul lui stă chiar acolo. E un târg pe care l-ai făcut ştiind ce dai.',
  '[
    {"title": "e5 alungă calul şi îţi ia spaţiu", "detail": "Pionul împins mai departe îi taie calului de pe f6 câmpul şi îţi deschide diagonala nebunului. Vine după e4, nu odată cu el: întâi construieşti centrul, apoi îl foloseşti."},
    {"title": "Nebunul lui de pe f5 e ţinta", "detail": "L-a scos afară la mutarea a cincea şi acolo a rămas. Cu e4 şi apoi Nd3 îl întrebi ce face, iar fiecare retragere a lui e o mutare pe care n-o pune în joc."},
    {"title": "Gaura de pe b4 nu se astupă, se ocoleşte", "detail": "Pionul de pe a4 nu se mai poate întoarce, deci b4 rămâne al adversarului. Nu-ţi cheltui piesele ca să-l aperi; joacă în centru şi pe flancul regelui, unde ai mai mult."}
  ]'::jsonb,
  'Nu duce calul pe e5 înainte de a-ţi lămuri centrul. Pare puternic — un cal în mijlocul tablei, sprijinit — dar costă cinci sutimi şi jumătate de pion şi îi dă adversarului tempoul cu Db6, atac dublu pe b2 şi pe calul tău. Într-o poziţie unde ai deja avantajul de spaţiu, mutările care par active dar pot fi atacate cu tempo îţi predau iniţiativa gratis.'
);
select public.seed_plan_moves('queens-gambit', 'C',
  'f5g6 c4d3 g6h5 e4e5',
  '{
    "0": "Ng6 — nebunul advers se retrage din bătaia pionului de e4.",
    "1": "Nd3 — îţi muţi nebunul pe diagonala spre h7 şi îl întrebi din nou pe al lui ce face.",
    "2": "Nh5 — nebunul lui se retrage a doua oară, tot mai departe de centru.",
    "3": "e5 — pionul trece mai departe şi îi alungă calul de pe f6. Aici se opreşte continuarea: ai centrul mare, nebunul lui plimbat de trei ori şi iniţiativa. Ce urmează e Cd5, dar numai după ce ţi-ai adus turnurile — un cal în centru fără sprijin se schimbă, iar tu vrei să-l ţii."
  }'::jsonb
);


-- ============================================================
-- ATACUL REGELUI INDIAN
-- ============================================================
select public.seed_plan('kings-indian-attack', 'A',
  'Aşezarea e completă şi atacul urmează. Ai pionul înfipt pe e5, care îi taie adversarului legăturile dintre flancuri, turnul pe coloana e şi pionul de pe h pornit. El are spaţiu pe flancul damei, dar piesele lui sunt acolo, iar regele e aici. Ce contează acum e ordinea în care faci lucrurile.',
  '[
    {"title": "Dama pe e2 înaintea calului pe f1", "detail": "Manevra Cd2-f1-g3 e semnătura sistemului, dar nu se începe oricând. Calul de pe d2 apără pionul de e5; plecat prea devreme, îl lasă singur. Dama pe e2 preia paza, şi abia atunci calul are voie să plece."},
    {"title": "Pionul de pe e5 e temelia", "detail": "El îi taie calului de pe f6 câmpul, îi desparte flancurile şi îi ia adversarului orice apărare rapidă a regelui. O mutare care îl lasă neapărat pune în pericol tot planul, nu doar un pion."},
    {"title": "Lasă-l să înainteze pe flancul damei", "detail": "Va juca a5 şi va câştiga spaţiu acolo. Îl laşi. Fiecare piesă pe care ai retrage-o ca să aperi ar lipsi din atac, iar atacul tău ajunge primul tocmai fiindcă el şi-a mutat piesele în partea cealaltă."}
  ]'::jsonb,
  'Nu juca Cf1 înainte de De2. E cea mai instructivă greşeală din tot cursul, fiindcă mutarea în sine e bună — e chiar mutarea pe care planul o face două semimutări mai târziu. Problema e momentul: calul de pe d2 e singura piesă care apără pionul de e5, iar dacă pleacă înainte ca dama să preia paza, adversarul joacă Cdxe5 şi rămâi cu un pion în minus. Costă un pion întreg. Într-un sistem, ordinea mutărilor nu e amănunt de stil — e jumătate din sistem.'
);
select public.seed_plan_moves('kings-indian-attack', 'A',
  'd8c7 d1e2 a7a5 d2f1 f8d8 f1h2',
  '{
    "0": "Dc7 — adversarul îşi aşază dama şi apasă pe pionul de e5.",
    "1": "De2 — dama ta preia paza pionului de e5. Abia acum calul de pe d2 are voie să plece în manevră; înainte, n-avea.",
    "2": "a5 — adversarul îşi începe înaintarea pe flancul damei, unde are mai mult spaţiu.",
    "3": "Cf1 — începe manevra. Aceeaşi mutare care, jucată cu două semimutări mai devreme, ar fi costat un pion.",
    "4": "Td8 — adversarul îşi aduce turnul pe coloana damei.",
    "5": "C1h2 — calul îşi continuă drumul spre g4 sau f3, de unde va sprijini înaintarea pionilor. Ai pionul de e5 apărat, atacul pregătit şi un adversar care câştigă spaţiu unde nu-l va folosi la nimic."
  }'::jsonb
);

select public.seed_plan('kings-indian-attack', 'B',
  'Aici adversarul are aceleaşi planuri ca tine, doar pe partea cealaltă a tablei — şi-a făcut fianchetto, a jucat a6 şi Tb8, şi vrea b5. Poziţia e aproape simetrică şi aproape egală. Diferenţa o face cine îl opreşte primul pe celălalt.',
  '[
    {"title": "a4 îi taie b5", "detail": "Singura ruptură pe care o are e b5. Cu pionul pe a4 nu mai poate juca gratis, iar dacă o face oricum, îi deschizi coloana a spre turnul lui. O mutare de pion care opreşte un plan întreg valorează cât o piesă bine pusă."},
    {"title": "Calul de pe d2 aşteaptă", "detail": "Manevra spre f1 şi g3 e valabilă şi aici, dar nu te grăbi cu ea. Într-o poziţie simetrică, piesa care pleacă prima în manevră e cea care lipseşte prima când adversarul loveşte."},
    {"title": "Centrul rămâne închis, deci ai timp", "detail": "Cu pioni pe e4 şi d3 contra e5 şi d6, nimeni nu trece pe la mijloc. Asta înseamnă că mutările liniştite nu se pedepsesc, iar cine îşi aşază piesele pe câmpurile mai bune câştigă încet."}
  ]'::jsonb,
  'La poziţia asta n-am găsit nicio greşeală care să coste măcar jumătate de pion: simetria iartă aproape orice. Ce trebuie evitat e o singură idee — să porneşti atacul pe flancul regelui înainte de a-l opri pe el pe flancul damei. În variantele unde adversarul stă pasiv, ataci direct. Aici nu stă pasiv; are exact planul tău, în oglindă, şi cine porneşte primul fără să se uite la celălalt ajunge al doilea.'
);
select public.seed_plan_moves('kings-indian-attack', 'B',
  'e7e5 d2f1 b7b5 a4b5 a6b5 c1g5',
  '{
    "0": "e5 — adversarul îşi ia spaţiu în centru, unde poziţia e închisă şi nu riscă nimic.",
    "1": "Cf1 — începi manevra spre g3. Aici o poţi face fără grijă: centrul e închis, deci pionul de e4 n-are nevoie de calul acela.",
    "2": "b5 — adversarul împinge oricum, deşi l-ai oprit cu a4.",
    "3": "axb5 — schimbi imediat. Nu-l laşi să-şi ţină lanţul de pioni întreg.",
    "4": "axb5 — reia cu pionul de pe a, iar coloana a rămâne deschisă pentru amândoi.",
    "5": "Ng5 — îţi dezvolţi ultimul nebun şi ţinteşti calul de pe f6. Poziţia e echilibrată, dar tu ai manevra pornită şi el are doi pioni de apărat, pe b5 şi c5."
  }'::jsonb
);

select public.seed_plan('kings-indian-attack', 'C',
  'Împotriva unui adversar care şi-a scos nebunul afară la timp, sistemul nu-ţi dă avantaj — îţi dă o poziţie pe care o cunoşti bine. Centrul s-a deschis, materialul e egal, iar nebunul lui de pe g4 îţi ţintuieşte calul de pe f3. Nu e nimic de forţat; e de jucat curat.',
  '[
    {"title": "h3 rezolvă ţintuirea", "detail": "Cât timp nebunul stă pe g4, calul tău de pe f3 nu poate pleca. h3 îl obligă să se hotărască: îl schimbă, şi atunci rămâi cu perechea de nebuni, sau se retrage pe h5, şi atunci g4 îl ţine ocupat mai târziu."},
    {"title": "Pionul de pe e4 e centrul tău", "detail": "L-ai obţinut prin schimbul din centru şi e sprijinit de piese, nu de pioni. Fiecare mutare care îi adaugă un apărător e o mutare bună; fiecare care îl lasă singur invită o lovitură."},
    {"title": "Coloana d e deschisă pentru amândoi", "detail": "S-a deschis când ai reluat cu pionul de pe d. Turnul care ajunge primul acolo n-o câştigă, dar îl obligă pe celălalt să răspundă — iar într-o poziţie egală, cine dictează are avantajul."}
  ]'::jsonb,
  'Nu schimba nebunul de pe g2 fără motiv. E cea mai bună piesă pe care o ai şi singura care lucrează pe diagonala lungă, prin toată poziţia lui. Într-un sistem în care celelalte piese se aşază după reţetă, el e piesa care face diferenţa. Aici n-am găsit o gafă măsurabilă — poziţia e egală şi solidă — dar greşeala pe care o fac mulţi în KIA e să dea nebunul acela pe un cal, ca să „simplifice". Simplifici direct într-o poziţie fără şanse.'
);
select public.seed_plan_moves('kings-indian-attack', 'C',
  'g4f3 d2f3 e6e5 g1h2 f8e8 a2a4',
  '{
    "0": "Nxf3 — adversarul schimbă nebunul pe calul tău, rezolvând ţintuirea în felul lui.",
    "1": "Cxf3 — reiei cu calul de pe d2, nu cu pionul: aşa îţi păstrezi structura curată şi calul ajunge pe un câmp bun.",
    "2": "e5 — adversarul îşi ia spaţiu în centru.",
    "3": "Rh2 — regele se dă din calea coloanei f şi de pe diagonala lungă.",
    "4": "Te8 — adversarul îşi aduce turnul.",
    "5": "a4 — îţi câştigi spaţiu pe flancul damei şi îi tai b5. Poziţia e egală, dar acum tu ai două lucruri de făcut şi el niciunul."
  }'::jsonb
);


-- ============================================================
-- DESCHIDEREA CATALANĂ
-- ============================================================
select public.seed_plan('catalan-opening', 'A',
  'Ţi-ai luat pionul înapoi, materialul e egal, iar nebunul de pe g2 apasă pe diagonala lungă de zece mutări fără să fi făcut altceva. Adversarul are pionii de pe flancul damei împinşi, pe a6 şi b5, şi un nebun pe b4 care va trebui să se hotărască. Poziţia e a ta.',
  '[
    {"title": "Nebunul de pe g2 e toată deschiderea", "detail": "Nu l-ai mutat decât o dată, la mutarea a şasea, şi de atunci lucrează. Priveşte prin c6 până în colţul advers, iar fiecare schimb din centru îi deschide şi mai mult drumul. Nu-l bloca niciodată cu propriii pioni."},
    {"title": "Ng5 ţinteşte apărătorul câmpului e4", "detail": "Calul de pe f6 e piesa care ţine e4 şi d5. Ţintuit sau schimbat, câmpurile albe din centru rămân ale tale — şi tocmai pe ele lucrează nebunul de pe g2."},
    {"title": "Pionii lui de pe a6 şi b5 sunt slabi pe termen lung", "detail": "I-a împins ca să-ţi alunge dama şi să-şi ţină pionul furat. Acum nu se mai pot întoarce. Nu-i ataca imediat; ţine-i minte pentru final, când vor conta."}
  ]'::jsonb,
  'Nu pune dama pe c2. Pare câmpul firesc — pe coloana c, aliniată cu turnul — dar aici costă cinci sutimi şi jumătate de pion, fiindcă adversarul câştigă timp cu h6 şi te obligă să schimbi pe f6 în condiţiile lui, nu ale tale. Dama pe d3 stă mai bine: acoperă şi centrul, şi diagonala spre h7. În Catalană piesele grele se aşază după ce nebunul de pe g2 şi-a lămurit diagonala, nu înainte.'
);
select public.seed_plan_moves('catalan-opening', 'A',
  'b4d6 b1d2 h7h6 g5f6 d8f6 d3c3',
  '{
    "0": "Nd6 — nebunul advers se retrage pe un câmp mai util, ţintind h2.",
    "1": "Cbd2 — îţi aduci ultimul cal, pe câmpul de unde poate sări la e4 sau c4.",
    "2": "h6 — adversarul îţi cere să te hotărăşti cu nebunul de pe g5.",
    "3": "Nxf6 — schimbi. Îi iei apărătorul câmpurilor albe din centru, exact cele pe care lucrează nebunul tău de pe g2.",
    "4": "Dxf6 — reia cu dama, singura reluare pe care o are.",
    "5": "Dc3 — îţi aşezi dama pe diagonala lungă, în spatele nebunului. Două piese pe aceeaşi linie, îndreptate spre colţul advers: asta e Catalana când funcţionează."
  }'::jsonb
);

select public.seed_plan('catalan-opening', 'B',
  'Ai deschis centrul exact la timp, înainte ca nebunul advers să apuce să iasă pe b7, şi ai rămas cu un cal în mijlocul tablei şi cu diagonala nebunului de pe g2 în sfârşit liberă. Adversarul stă solid, dar piesa pentru care a jucat toată deschiderea încă n-a mutat.',
  '[
    {"title": "Calul de pe e4 e piesa activă", "detail": "Stă în mijlocul tablei, sprijinit, şi nu-l poate alunga niciun pion negru fără ca adversarul să-şi rupă structura. De acolo ţinteşte c5, d6 şi f6."},
    {"title": "Turnurile pe c1 şi d1", "detail": "Sunt coloanele pe care se va juca. Pe c apeşi pe pionul lui de c6; pe d, chiar prin centrul deschis. Aduce-le înainte să ai nevoie de ele."},
    {"title": "Nebunul de pe c8 e slăbiciunea permanentă", "detail": "Adversarul a jucat e6 şi c6, deci nebunul de câmpuri albe e închis între pionii lui. Fiecare mutare care ţine centrul închis pentru el, dar deschis pentru tine, măreşte diferenţa asta."}
  ]'::jsonb,
  'Nu duce nebunul pe f4. Arată bine — a doua piesă activată, diagonala spre c7 — dar e cea mai scumpă greşeală din poziţie: costă trei pioni şi două zecimi, fiindcă adversarul răspunde f5 şi calul tău de pe e4 rămâne fără câmp de retragere bun. O piesă în mijlocul tablei nu e puternică prin ea însăşi; e puternică atâta timp cât are unde să se retragă.'
);
select public.seed_plan_moves('catalan-opening', 'B',
  'f6e4 c2e4 c8b7 f1e1 f8e8 e4c2',
  '{
    "0": "Cxe4 — adversarul schimbă calul din centru, ca să scape de presiune.",
    "1": "Dxe4 — reiei cu dama, care ajunge în mijlocul tablei fără să poată fi gonită.",
    "2": "Nb7 — nebunul închis iese în sfârşit, dar prea târziu: centrul e deja deschis în favoarea ta.",
    "3": "Te1 — turnul ocupă coloana e, deschisă după schimburi.",
    "4": "Te8 — adversarul ţi-o dispută.",
    "5": "Dc2 — dama se retrage de pe linia turnurilor şi se aşază pe diagonala spre h7. Ai piesele mai bine plasate şi o poziţie în care nu ai nimic de reparat."
  }'::jsonb
);

select public.seed_plan('catalan-opening', 'C',
  'Adversarul a lovit devreme în centru cu c5, iar rezultatul e un pion izolat pe d5 care nu se poate mişca de acolo. Ai nebunul de pe g2 îndreptat drept spre el şi material egal. Împotriva unui pion izolat nu se caută lovitura — se adună atacatori până când apărătorii se termină.',
  '[
    {"title": "Blochează întâi, atacă după", "detail": "Câmpul din faţa pionului izolat, d4, e cel mai bun câmp de pe tablă pentru piesele tale: acolo nu le poate alunga niciun pion, fiindcă adversarul nu mai are pioni nici pe c, nici pe e."},
    {"title": "Nebunul de pe g2 e primul atacator", "detail": "Priveşte drept la d5 de la mutarea a şasea, fără să fi făcut nimic. E cel mai ieftin atacator pe care îl poţi avea: nu trebuie mutat, nu poate fi alungat, şi nu-l poţi pierde din neatenţie."},
    {"title": "Ng5 aduce al doilea atacator", "detail": "Ţintuind calul de pe f6, îi iei pionului de d5 unul dintre apărători. Aşa se dărâmă un pion izolat: nu-l ataci mai tare, ci îi iei pe rând pe cei care îl ţin."}
  ]'::jsonb,
  'Nu duce calul pe b5. Pare că îl trimiţi spre un câmp bun, c7 sau d6, dar costă şase sutimi şi o zecime de pion şi îi dă adversarului tempoul cu a6: îl alungi singur şi, dacă iei pe c6, îi întăreşti chiar pionul pe care voiai să-l ataci. Într-o poziţie cu o ţintă fixă, orice piesă care se depărtează de ea lucrează pentru adversar.'
);
select public.seed_plan_moves('catalan-opening', 'C',
  'd5d4 c3a4 e8g8 c1g5 f8e8 f1e1',
  '{
    "0": "d4 — adversarul îşi împinge pionul izolat înainte, ca să scape de el.",
    "1": "Ca4 — calul se dă la o parte şi porneşte spre c5 sau b6, câmpurile rămase slabe după înaintarea pionului.",
    "2": "Rocada adversarului.",
    "3": "Ng5 — al doilea atacator, ţintuind calul care apără centrul.",
    "4": "Te8 — adversarul îşi aduce turnul.",
    "5": "Te1 — îţi pui şi tu turnul pe coloana e. Ai toate piesele îndreptate spre centru, iar pionul lui înaintat pe d4 are acum nevoie de tot mai mulţi apărători."
  }'::jsonb
);


-- ============================================================
-- SISTEMUL COLLE
-- ============================================================
select public.seed_plan('colle-system', 'A',
  'Zukertort în forma lui completă: doi nebuni pe diagonale lungi, unul spre h7 şi altul spre h8, un cal înfipt pe e5 sprijinit de pionul de pe f4, şi nicio variantă învăţată pe de rost ca să ajungi aici. Poziţia e echilibrată la evaluare, dar toate piesele tale arată în aceeaşi direcţie.',
  '[
    {"title": "Calul de pe e5 e centrul planului", "detail": "Sprijinit de pionul de pe f4 şi de nebunul de pe b2 din spate, nu poate fi alungat de niciun pion negru fără ca adversarul să-şi rupă poziţia. Tot atacul se construieşte în jurul lui."},
    {"title": "Turnul vine pe f3 şi apoi h3", "detail": "Manevra clasică din Zukertort. Turnul iese prin f3 — coloana pe care ai deschis-o cu f4 — şi ajunge pe h3, lângă regele advers, fără să treacă prin niciun câmp periculos."},
    {"title": "Nu împinge f5 devreme", "detail": "Pionul de pe f4 sprijină calul de pe e5. Împins la f5, îl lasă fără sprijin şi îi deschide adversarului câmpul e5 pentru propriile piese. Împingerea vine abia când ai piese destule ca să profiţi."}
  ]'::jsonb,
  'Nu duce nebunul înapoi pe c3. Se face din dorinţa de a-l aduce pe o diagonală mai scurtă şi mai sigură, şi costă cinci sutimi şi jumătate de pion — puţin, dar exact în locul greşit. Nebunul de pe b2 e piesa care sprijină calul de pe e5 de la distanţă; pe c3 nu mai sprijină nimic şi îşi taie singur drumul cu propriul pion. Într-un sistem, fiecare piesă are un câmp şi un rost; mutată de pe el, sistemul nu mai e sistem.'
);
select public.seed_plan_moves('colle-system', 'A',
  'c6b4 d3b5 a8c8 a2a3 a7a6 b5e2',
  '{
    "0": "Cb4 — calul advers sare şi îţi atacă nebunul de pe d3, piesa cu care ataci.",
    "1": "Nb5 — nebunul se retrage înainte, nu înapoi, şi ţintuieşte de pe b5.",
    "2": "Tc8 — adversarul îşi aduce turnul pe coloana c.",
    "3": "a3 — îi ceri calului de pe b4 să se hotărască.",
    "4": "a6 — adversarul îţi alungă nebunul.",
    "5": "Ne2 — nebunul se retrage pe un câmp din care poate reveni pe d3 sau merge la h5. Ai pierdut două mutări cu el, dar l-ai obligat pe adversar să-şi împingă pionii de pe flancul damei, iar calul lui de pe b4 tot va trebui să plece."
  }'::jsonb
);

select public.seed_plan('colle-system', 'B',
  'Koltanowski: zece mutări liniştite şi apoi e4, împingerea pentru care s-a construit tot. Centrul s-a deschis exact când ai vrut tu, cu nebunul pe d3 îndreptat spre h7 şi calul ajuns pe e4. Poziţia e uşor în favoarea ta şi, mai important, e una pe care o cunoşti pe de rost.',
  '[
    {"title": "Calul de pe e4 ţinteşte f6 şi d6", "detail": "Ambele câmpuri sunt în faţa regelui advers sau lângă el. Schimbat pe calul de pe f6, îi strică structura din faţa regelui; lăsat acolo, îl ţine legat."},
    {"title": "Nebunul de pe d3 e piesa de atac", "detail": "Priveşte spre h7 de la mutarea a patra. Împreună cu dama pe c2 formează bateria clasică, iar dacă adversarul îşi mută calul de pe f6, câmpul h7 rămâne apărat doar de rege."},
    {"title": "Schimbă damele doar dacă rămâi cu structura mai bună", "detail": "Într-o poziţie unde ai iniţiativa, schimbul de dame o stinge. Îl accepţi doar când primeşti ceva concret în loc — o coloană, un pion mai bun, un final mai limpede."}
  ]'::jsonb,
  'Nu pune dama pe c2 înainte de a-ţi lămuri calul de pe e4. Pare mutarea firească — bateria cu nebunul, îndreptată spre h7 — dar în ordinea greşită e cea mai scumpă greşeală din poziţie: costă trei pioni şi patru zecimi, fiindcă adversarul răspunde Cf6 şi îţi atacă piesa cea mai bună exact când dama nu mai apără nimic din centru. Ordinea contează mai mult decât mutarea.'
);
select public.seed_plan_moves('colle-system', 'B',
  'f6e4 d3e4 d8d1 f1d1 f8d8 c1f4',
  '{
    "0": "Cxe4 — adversarul schimbă calul din centru.",
    "1": "Nxe4 — reiei cu nebunul, care ajunge pe o diagonală şi mai lungă, prin centru.",
    "2": "Dxd1 — adversarul propune schimbul damelor, ca să-ţi stingă iniţiativa.",
    "3": "Txd1 — reiei cu turnul, care ocupă astfel coloana d fără să fi mutat de două ori.",
    "4": "Td8 — adversarul ţi-o dispută.",
    "5": "Nf4 — îţi dezvolţi ultimul nebun, cu ochii pe c7 şi pe rândul din spate. Fără dame pe tablă, ai doi nebuni buni şi o structură fără cusur — exact finalul spre care duce Colle."
  }'::jsonb
);

select public.seed_plan('colle-system', 'C',
  'Împotriva aşezării indiene, Colle nu câştigă din atac — câştigă fiindcă i-ai închis adversarului piesa pentru care a jucat toată deschiderea. Nebunul lui de pe g7 priveşte într-un zid de pioni: al tău pe e4 şi al lui pe e5. Materialul e egal, dar el are o piesă care nu face nimic.',
  '[
    {"title": "Pionul de pe e4 e zidul", "detail": "Cât timp stă acolo, nebunul de pe g7 nu vede nimic. Nu-l schimba din reflex şi nu-l împinge la e5: ambele i-ar redeschide diagonala piesei celei mai bune."},
    {"title": "Calul spre c4, prin d2", "detail": "De pe c4 apasă pe d6 şi pe b6 şi stă pe un câmp de unde nu-l alungă niciun pion. E cel mai bun drum pe care îl are calul, iar trece prin d2, nu prin f3."},
    {"title": "Coloana d se deschide singură", "detail": "După schimbul din centru, coloana d rămâne fără pioni. Turnurile care ajung acolo apasă pe pionul lui de d6, iar acela e singurul lucru pe care îl are de apărat."}
  ]'::jsonb,
  'Nu duce nebunul pe c4. Se face din dorinţa de a-l pune pe o diagonală care ţinteşte f7, şi costă cinci sutimi şi nouă zecimi de pion — dar problema adevărată e că îl scoţi de pe d3, unde apăra pionul de e4. Iar pionul acela e chiar zidul din faţa nebunului advers. Într-o poziţie unde avantajul tău e că adversarul are o piesă închisă, orice mutare care îi deschide un pic diagonala e o mutare care îţi şterge avantajul.'
);
select public.seed_plan_moves('colle-system', 'C',
  'd7c5 d3c2 b7b6 f3e5 c8a6 c3c4',
  '{
    "0": "Cc5 — calul advers îşi caută un câmp bun şi îţi atacă nebunul de pe d3.",
    "1": "Nc2 — nebunul se retrage pe c2, unde continuă să apere e4 de la distanţă şi rămâne pe diagonala spre h7.",
    "2": "b6 — adversarul îşi pregăteşte nebunul pentru a6 sau b7.",
    "3": "Cxe5 — calul ia pionul şi se înfige în mijlocul tablei, chiar pe câmpul din faţa nebunului advers de pe g7.",
    "4": "Na6 — nebunul lui iese pe singura diagonală care i-a mai rămas.",
    "5": "c4 — îi tai diagonala nebunului abia ieşit şi îţi întăreşti centrul. Adversarul are acum doi nebuni care nu văd nimic, iar tu un cal în mijlocul tablei."
  }'::jsonb
);


-- ============================================================
-- SISTEMUL LONDRA
-- ============================================================
select public.seed_plan('london-system', 'A',
  'Londra în forma ei clasică: nebunul de pe f4 scos afară înainte de e3, al doilea pe c2 după ce a fost alungat, pioni pe c3-d4-e3 şi o poziţie pe care o joci la fel indiferent ce face adversarul. El tocmai şi-a împins pionul la c4, câştigând spaţiu dar renunţând la tensiunea din centru.',
  '[
    {"title": "e4 e ruptura, şi vine acum", "detail": "Adversarul şi-a împins pionul la c4 şi a renunţat la presiunea pe d4. Din clipa aceea, centrul e al tău: e4 se pregăteşte cu De2 şi Cbd2 şi deschide poziţia exact unde ai mai multe piese."},
    {"title": "Calul spre e5, sprijinit", "detail": "Câmpul e5 e cel mai bun din poziţie pentru un cal alb, iar nebunul de pe f4 şi pionul de pe d4 îl fac greu de atacat. De acolo priveşte spre f7, d7 şi g6."},
    {"title": "Nu muta nebunul de pe f4 fără motiv", "detail": "E piesa care deosebeşte Londra de Colle. Stă în afara lanţului de pioni, apasă pe c7 şi pe e5 şi nu poate fi alungat uşor. Schimbat din comoditate, rămâi cu un sistem fără ce l-a făcut bun."}
  ]'::jsonb,
  'Nu duce nebunul pe a4. Pare că îl activezi, ţintind spre e8 şi spre calul de pe c6, dar costă cinci sutimi şi nouă zecimi de pion şi îl scoate din joc: de pe a4 nu apără nimic şi nu atacă nimic din ce contează, iar adversarul răspunde Ce4 şi îţi ocupă centrul. Nebunul de câmpuri albe are un singur câmp bun în Londra, şi acela e c2 sau d3, îndreptat spre regele advers.'
);
select public.seed_plan_moves('london-system', 'A',
  'a7a6 f1e1 e7d6 a2a4 a8b8 f3e5',
  '{
    "0": "a6 — adversarul îşi ia câmpul b5 şi pregăteşte b5.",
    "1": "Te1 — turnul ocupă coloana e, în spatele pionului pe care vrei să-l împingi.",
    "2": "Nd6 — adversarul îţi propune schimbul nebunilor de câmpuri negre.",
    "3": "a4 — îi opreşti înaintarea de pe flancul damei înainte să înceapă, şi nu-i dai schimbul pe care îl vrea.",
    "4": "Tb8 — adversarul insistă cu pregătirea lui b5.",
    "5": "Ce5 — calul se înfige pe cel mai bun câmp din poziţie, sprijinit de pionul de d4 şi de nebunul de pe f4. De aici încolo, tot ce faci trece prin el."
  }'::jsonb
);

select public.seed_plan('london-system', 'B',
  'Împotriva fianchetto-ului, Londra rămâne aceeaşi: nebunul afară, pionii pe c3-d4-e3, h3 jucat la timp. Adversarul tocmai a schimbat în centru şi ai reluat cu pionul de pe e, deci coloana e ţi s-a deschis. Poziţia e echilibrată şi o cunoşti pe de rost, ceea ce e chiar ce cumperi când alegi un sistem.',
  '[
    {"title": "Coloana e e câştigul schimbului", "detail": "Ai reluat cu pionul de pe e tocmai ca s-o deschizi. Turnul care ajunge acolo apasă pe tot ce trece prin ea, iar pionul de pe c3 rămâne să sprijine d4."},
    {"title": "Calul pe e5, ca de fiecare dată", "detail": "În toate variantele Londrei, e5 e câmpul spre care se îndreaptă calul. Aici e cu atât mai bun cu cât adversarul şi-a jucat nebunul pe g7 şi are câmpurile negre din jurul regelui mai puţin păzite."},
    {"title": "Dama de pe b6 nu e o problemă", "detail": "Adversarul o scoate ca să apese pe b2 şi pe d4. Nu-ţi retrage piese ca s-o alungi: cât timp stă acolo, nu face nimic altceva, iar tu ai mutări mai bune de făcut."}
  ]'::jsonb,
  'Nu duce nebunul înapoi pe c1. Se face de frica damei de pe b6, care apasă pe b2, şi e cea mai scumpă greşeală din poziţie: costă doi pioni şi trei zecimi, fiindcă adversarul răspunde e4 şi îţi ia centrul exact când ai retras piesa care îl ţinea. Pionul de pe b2 poate fi apărat altfel — cu dama pe c2 sau cu turnul pe b1 — dar nebunul de pe f4 nu poate fi înlocuit cu nimic.'
);
select public.seed_plan_moves('london-system', 'B',
  'e7e5 d4e5 f6d5 f4g3',
  '{
    "0": "e5 — adversarul loveşte în centru, folosind că dama lui de pe b6 apasă pe d4.",
    "1": "dxe5 — iei. Nu-l laşi să ţină tensiunea; o rezolvi tu.",
    "2": "Cd5 — calul lui sare în centru în loc să reia pionul, ca să câştige timp.",
    "3": "Ng3 — nebunul se retrage pe diagonala din spate, unde rămâne activ şi în siguranţă. Aici se opreşte continuarea, cu un pion în plus pentru tine şi cu un adversar care trebuie să demonstreze că are compensaţie pentru el."
  }'::jsonb
);

select public.seed_plan('london-system', 'C',
  'Ai schimbat nebunii de câmpuri negre — al tău îşi făcuse treaba, al lui era piesa bună — şi ai rămas cu un cal contra unui nebun închis între pionii de pe e6 şi d5. Poziţia e aproape egală şi n-are nimic ascuţit; e exact ce cere un sistem: n-ai câştigat nimic din deschidere, dar n-ai riscat nimic şi ştii ce urmează.',
  '[
    {"title": "e4 e singura ruptură şi trebuie pregătită", "detail": "Cu dama pe e2, calul pe d2 şi turnul pe e1, împingerea vine de la sine. Până atunci nu forţezi nimic: în poziţiile închise, ruptura nepregătită se întoarce împotriva celui care o face."},
    {"title": "Calul spre e5 sau b3", "detail": "Prin d2 are două drumuri. Spre e5, dacă adversarul îţi lasă câmpul; spre b3 şi c5, dacă vrea să-şi ţină centrul. Nu alege dinainte — alege după ce vezi unde îşi pune el piesele."},
    {"title": "Nebunul lui de pe c8 e diferenţa", "detail": "A jucat e6 şi d5, deci nebunul de câmpuri albe e închis între propriii pioni. Fiecare mutare care ţine structura aşa cum e măreşte diferenţa; fiecare schimb de pioni în centru îi dă lui drum."}
  ]'::jsonb,
  'Nu duce nebunul pe b5. Pare că îl activezi, ţintind calul de pe c6, dar costă un pion şi două zecimi şi îl scoate de pe diagonala care contează: de pe d3 priveşte spre h7 şi apără e4, iar de pe b5 nu face niciuna. Adversarul răspunde e4 şi ia centrul pe care ai jucat zece mutări ca să-l pregăteşti. Într-un sistem, piesa mutată de pe câmpul ei nu e doar mai puţin bună — e o gaură în plan.'
);
select public.seed_plan_moves('london-system', 'C',
  'e6e5 d4c5 d6c5 e3e4 c8b7 d3c2',
  '{
    "0": "e5 — adversarul îşi deschide în sfârşit nebunul, lovind în centru.",
    "1": "dxc5 — iei pe c5, nu pe e5. Aşa îi rămâne un pion izolat pe d5 şi îi deschizi coloana d pentru turnul tău.",
    "2": "Dxc5 — reia cu dama.",
    "3": "e4! — ruptura pentru care ai pregătit tot. Loveşti pionul izolat de pe d5 chiar în clipa în care dama lui a plecat de lângă el.",
    "4": "Nb7 — nebunul închis iese, dar priveşte drept în propriul pion de pe d5.",
    "5": "Nc2 — îţi retragi nebunul pe câmpul de unde apără e4 şi priveşte spre h7. Poziţia e egală, dar el are un pion izolat şi un nebun care nu vede nimic."
  }'::jsonb
);


-- ============================================================
-- DOVADA — prima cifră trebuie să fie 30, a doua 20
-- ============================================================
select
  (select count(*)
     from public.middlegame_plans p
     join public.opening_lines l on l.id = p.opening_line_id
    where l.user_color = 'white')                                    as planuri_de_alb,
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
