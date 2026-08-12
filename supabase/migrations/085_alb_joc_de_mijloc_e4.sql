-- ============================================================
-- Jocul de mijloc pentru deschiderile de alb cu e4
-- ============================================================
-- Cincisprezece planuri: Italiana, Engleza, Ruy Lopez, Gambitul Regelui şi
-- Jocul Vienez. Al doilea lot, cu deschiderile de d4, vine separat.
--
-- La cursurile de alb cursantul joacă cu albul, deci „de evitat" înseamnă
-- greşeala LUI, iar aceea se măsoară în poziţiile unde albul e la mutare — nu
-- la capătul liniei, unde de obicei mută negrul. E aceeaşi greşeală de metodă
-- pe care am făcut-o prima dată la cursurile de negru; de data asta măsurătoarea
-- a fost făcută direct cum trebuie.
--
-- Trei continuări au fost respinse şi refăcute:
--   · Italiana A — motorul propunea Ca5 Da4+ Cc6 Db3 Ca5 Da4+, adică o
--     repetiţie de mutări. Aia e remiză prin dans, nu plan;
--   · Gambitul Damei B şi Gambitul Regelui B — liniile lor s-au schimbat în
--     migrarea 084, deci planurile au fost recalculate pe poziţiile noi;
--   · Gambitul Regelui B — continuarea de şase semimutări îl ducea pe alb de
--     la −0,67 la −3,76. Am scurtat-o la patru, până unde poziţia se mai ţine,
--     şi am scris pe faţă ce urmează.
-- ============================================================


-- ============================================================
-- PARTIDA ITALIANĂ
-- ============================================================
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
