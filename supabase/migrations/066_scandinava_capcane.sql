-- ============================================================
-- Scandinava: capcanele
-- ============================================================
-- Trei curse: două în care cade albul, una în care cade negrul. Măsurate cu
-- Stockfish la adâncime 18.
--
-- Nota de metodă, fiindcă a fost o lecţie. Prima căutare a fost pe ghicite —
-- opt candidate scoase din cap, niciuna peste prag — şi concluzia a fost că
-- Scandinava n-are nicio cursă în care să cadă negrul. Concluzia era greşită.
--
-- A doua căutare a fost sistematică: la fiecare poziţie în care negrul e la
-- mutare, motorul a evaluat TOATE mutările legale, nu doar cele la care mă
-- gândisem eu. A ieşit imediat 5...De5+, care pierde dama pe loc.
--
-- Ce s-a mai văzut din căutarea aceea: în Scandinavă, aproape toate pierderile
-- mari ale negrului sunt acelaşi lucru — dama ieşită devreme nimereşte un câmp
-- unde e lovită. Nu sunt curse pregătite de alb, e o temă a deschiderii. De
-- aceea capcana a treia e scrisă ca temă, nu ca linie de memorat.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Sacrificiul pe f7 care nu merge — cade albul
-- ------------------------------------------------------------
select public.seed_trap('scandinavian-defense', 1,
  'Sacrificiul pe f7, jucat prea devreme', 'theirs',
  'e2e4 d7d5 e4d5 d8d5 b1c3 d5d8 d2d4 g8f6 f1c4 c8f5 c4f7 e8f7',
  'Nxf7+ e una dintre cele mai cunoscute lovituri din şah, şi de aceea se joacă des din reflex, fără socoteală. Aici nu merge, dintr-un motiv simplu: albul nu şi-a jucat calul pe f3. Fără el, după 6...Rxf7 nu urmează nimic — Cg5+, continuarea firească, e pur şi simplu ilegală, fiindcă nu există niciun cal care s-o facă. Albul rămâne cu un nebun dat pe un pion, iar evaluarea cade de la +0,51 la −2,53. Ce înveţi de aici nu e o linie, ci o întrebare: înainte să dai o piesă pe f7, uită-te dacă ai cu ce continua.'
);
select public.seed_trap_link('scandinavian-defense', 1, 'A', 9);
select public.seed_trap_moves('scandinavian-defense', 1, '{
  "8": "Albul îşi scoate nebunul pe c4, îndreptat drept spre f7. De aici încolo, orice jucător care a văzut vreodată lovitura pe f7 se gândeşte la ea.",
  "9": "Nf5 — îţi dezvolţi nebunul. Nu-i o momeală pusă dinadins; e pur şi simplu mutarea bună, iar el se repede.",
  "10": "GREŞEALA ALBULUI! Nxf7+. Lovitura arată la fel ca în partidele pe care le-a văzut, doar că acolo albul avea un cal pe f3.",
  "11": "Rxf7 — iei nebunul cu regele. Acum uită-te ce urmează pentru el: nimic. Cg5+ ar fi mutarea, dar calul lui e încă pe b1. Rămâi cu o piesă în plus pentru un pion, iar regele tău se întoarce liniştit acasă."
}'::jsonb);


-- ------------------------------------------------------------
-- 2. Dama pe d2, în faţa turnului tău — cade albul
-- ------------------------------------------------------------
select public.seed_trap('scandinavian-defense', 2,
  'Dama albă se aşază chiar în faţa turnului tău', 'theirs',
  'e2e4 d7d5 e4d5 d8d5 b1c3 d5a5 d2d4 g8f6 g1f3 c8g4 f1e2 b8c6 c1e3 e8c8 d1d2 g4f3 g2f3 c6d4',
  'După ce faci rocada lungă, turnul tău ajunge pe d8 fără să fi mutat nimic — chiar pe coloana pe care albul îşi ţine pionul de d4. Mutarea 8.Dd2 pare firească: leagă piesele şi pregăteşte rocada. Dar pune dama exact între turnul tău şi pionul pe care îl apără, iar evaluarea cade pe loc de la +0,04 la −2,01. Urmează 8...Nxf3 9.gxf3 Cxd4, iar pionul cade fiindcă apărătorii lui sunt legaţi unul de altul. Regula: înainte să pui dama pe o coloană, uită-te ce e la celălalt capăt al ei.'
);
select public.seed_trap_link('scandinavian-defense', 2, 'A', 13);
select public.seed_trap_moves('scandinavian-defense', 2, '{
  "12": "Albul îşi dezvoltă nebunul pe e3, ca să-şi apere pionul de d4 încă o dată.",
  "13": "Rocada lungă. Regele intră la adăpost, iar turnul ajunge pe d8 fără nicio mutare în plus — chiar pe coloana pionului de d4.",
  "14": "GREŞEALA ALBULUI! Dd2 pare cea mai firească mutare din lume: leagă turnurile şi pregăteşte rocada. Numai că aşază dama între turnul tău şi pionul pe care îl apără.",
  "15": "Nxf3 — începi prin a-i lua un apărător. Calul de pe f3 păzea d4.",
  "16": "Albul reia cu pionul, fiindcă altfel pierde material pe loc.",
  "17": "Cxd4 — iei pionul. Nebunul de pe e3 şi dama de pe d2 se apără unul pe altul, dar niciunul nu poate lua calul fără să deschidă coloana spre dama lui."
}'::jsonb);


-- ------------------------------------------------------------
-- 3. Şahul care îţi costă dama — cade negrul
-- ------------------------------------------------------------
select public.seed_trap('scandinavian-defense', 3,
  'Şahul cu dama, care se răspunde luând dama', 'ours',
  'e2e4 d7d5 e4d5 d8d5 b1c3 d5a5 d2d4 g8f6 g1f3 a5e5 f3e5',
  'Toată Scandinava se sprijină pe un lucru neplăcut: îţi scoţi dama la mutarea a doua şi trebuie să trăieşti cu ea afară vreo zece mutări. Aici e greşeala care încheie partida cel mai repede. Dama de pe a5 vede coloana e liberă până la regele alb şi dă şah — o mutare care pare că şi câştigă timp. Numai că un şah e o ameninţare doar dacă adversarul trebuie să se ferească. Pe e5 dama e atacată şi de calul de pe f3, şi de pionul de pe d4, iar amândouă capturile rezolvă şahul în aceeaşi mutare. Nu e nimic de parat: pur şi simplu dispare dama. Verificat: negrul rămâne cu nouă puncte de material în minus. Regula pe care o predă: înainte să dai şah, uită-te dacă adversarul poate răspunde luându-ţi piesa care îl dă.'
);
select public.seed_trap_link('scandinavian-defense', 3, 'A', 8);
select public.seed_trap_moves('scandinavian-defense', 3, '{
  "6": "Adversarul îşi construieşte centrul cu d4. Pionul ăsta va conta peste trei mutări, deşi acum pare doar o mutare de dezvoltare.",
  "7": "Cf6 — te dezvolţi normal. Până aici totul e după carte.",
  "8": "Cf3 — aici se armează cursa, fără ca albul să facă nimic special. Calul îşi ia câmpul firesc şi, din întâmplare, acoperă e5. Împreună cu pionul de pe d4, câmpul acela e acum păzit de două ori.",
  "9": "GREŞEALA! De5+. Coloana e e liberă până la regele alb, şahul pare că vine cu tempo, iar dama scapă din colţul de pe a5. Trei motive bune şi niciunul care să conteze.",
  "10": "Cxe5 — calul ia dama şi, în aceeaşi mutare, iese din şah. Un şah la care adversarul răspunde luându-ţi dama nu e un şah, e un cadou."
}'::jsonb);
