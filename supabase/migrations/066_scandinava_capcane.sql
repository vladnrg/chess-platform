-- ============================================================
-- Scandinava: capcanele
-- ============================================================
-- Două curse, amândouă în care cade albul. Măsurate cu Stockfish la adâncime 18.
--
-- N-am găsit niciuna în care să cadă negrul. Am încercat opt candidate: nebunul
-- prins pe h5 după g4 (+0,28), dama ieşită pe e5 (+0,31), pionul ţinut cu c6 la
-- momentul greşit (+0,74), nebunul pe g4 într-o poziţie cu f3 disponibil
-- (+0,26) şi altele. Niciuna nu trece pragul, iar una dintre ele — dama care ia
-- pe b2 — s-a dovedit pur şi simplu ilegală: de pe a5, dama nu ajunge la b2.
--
-- Asta spune ceva despre deschidere, nu despre căutare. Scandinava e simplă şi
-- solidă: negrul îşi ia pionul înapoi devreme, iar poziţiile care ies n-au
-- ascuţişul din care se nasc cursele. Cursul nu promite ce n-are.
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
