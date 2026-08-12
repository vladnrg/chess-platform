-- ============================================================
-- Reia 064, 065 şi 066 într-un singur fişier
-- ============================================================
-- Migrările 064, 065 şi 066 au fost date drept rulate, dar baza spune altceva:
-- Nimzo A/8 zice în continuare „Rocadă — negrul se rochează" acolo unde se
-- joacă a3, varianta C a Scandinavei se numeşte tot „Gambitul Icelandic", iar
-- Scandinava n-are ACcio capcană din cele trei. În acelaşi timp 067, 068 şi 069
-- au intrat curat, deci nu e o problemă de drepturi sau de conexiune.
--
-- Am căutat cauza în fişiere şi n-am găsit-o: aceeaşi codare ca la cele care au
-- mers, fără BOM, apostrofi în perechi, iar `seed_trap` e un upsert obişnuit
-- care n-are cum să eşueze tăcut. E a doua oară când se întâmplă — 060 a păţit
-- la fel şi tot fără explicaţie.
--
-- Aşa că nu mai caut. Fişierul ăsta le pune pe toate trei la un loc, se poate
-- rula de câte ori vrei fără să strice nimic, şi se termină cu o interogare
-- care spune singură dacă a mers. Dacă ultimul rând arată numai zerouri şi un
-- 3, totul e la locul lui.
-- ============================================================


-- ============================================================
-- 064 · verbul „a face rocada"
-- ============================================================
-- Şase locuri unde se joacă într-adevăr rocada şi era greşit doar verbul.

update public.opening_lines l set move_explanations = jsonb_set(l.move_explanations, '{10}',
       to_jsonb('Albul face rocada.'::text))
  from public.courses c where l.course_id = c.id and c.slug = 'alekhine-defense' and l.variation_code = 'B';

update public.opening_lines l set move_explanations = jsonb_set(l.move_explanations, '{9}',
       to_jsonb('Faci rocada fără să amâni. Regele intră la adăpost înainte să înceapă contra-jocul.'::text))
  from public.courses c where l.course_id = c.id and c.slug = 'kings-indian-defense' and l.variation_code = 'B';

update public.opening_lines l set move_explanations = jsonb_set(l.move_explanations, '{13}',
       to_jsonb('Faci rocada.'::text))
  from public.courses c where l.course_id = c.id and c.slug = 'slav-defense' and l.variation_code = 'C';

update public.opening_lines l set move_explanations = jsonb_set(l.move_explanations, '{14}',
       to_jsonb('Albul face rocada.'::text))
  from public.courses c where l.course_id = c.id and c.slug = 'slav-defense' and l.variation_code = 'A';

update public.opening_lines l set move_explanations = jsonb_set(l.move_explanations, '{15}',
       to_jsonb('Faci şi tu rocada, iar regele intră la adăpost.'::text))
  from public.courses c where l.course_id = c.id and c.slug = 'slav-defense' and l.variation_code = 'A';

update public.opening_lines l set move_explanations = jsonb_set(l.move_explanations, '{9}',
       to_jsonb('Faci rocada. Regele la adăpost.'::text))
  from public.courses c where l.course_id = c.id and c.slug = 'pirc-defense' and l.variation_code = 'A';

-- Şase locuri unde textul descria cu totul altă mutare decât cea de sub el.

update public.opening_lines l set move_explanations = jsonb_set(l.move_explanations, '{8}',
       to_jsonb('Adversarul joacă a3 şi te obligă să te hotărăşti cu nebunul de pe b4: îl schimbi pe cal sau îl retragi.'::text))
  from public.courses c where l.course_id = c.id and c.slug = 'nimzo-indian-defense' and l.variation_code = 'A';

update public.opening_lines l set move_explanations = jsonb_set(l.move_explanations, '{8}',
       to_jsonb('Adversarul îşi dezvoltă nebunul pe d3, îndreptat spre flancul tău de rege.'::text))
  from public.courses c where l.course_id = c.id and c.slug = 'nimzo-indian-defense' and l.variation_code = 'B';

update public.opening_lines l set move_explanations = jsonb_set(l.move_explanations, '{13}',
       to_jsonb('cxd4 — schimbi în centru. Pionul tău de pe c pleacă, iar coloana c ţi se deschide pentru turn.'::text))
  from public.courses c where l.course_id = c.id and c.slug = 'nimzo-indian-defense' and l.variation_code = 'B';

update public.opening_lines l set move_explanations = jsonb_set(l.move_explanations, '{7}',
       to_jsonb('Ng7 — nebunul intră în fianchetto, pe diagonala lungă. Rocada vine după el.'::text))
  from public.courses c where l.course_id = c.id and c.slug = 'dutch-defense' and l.variation_code = 'B';

update public.opening_lines l set move_explanations = jsonb_set(l.move_explanations, '{12}',
       to_jsonb('Adversarul îşi dezvoltă nebunul pe d3.'::text))
  from public.courses c where l.course_id = c.id and c.slug = 'slav-defense' and l.variation_code = 'C';

update public.opening_lines l set move_explanations = jsonb_set(l.move_explanations, '{19}',
       to_jsonb('Te8 — aduci şi turnul în joc, pe coloana e.'::text))
  from public.courses c where l.course_id = c.id and c.slug = 'slav-defense' and l.variation_code = 'B';


-- ============================================================
-- 065 · „Gambitul Icelandic" → „Gambitul islandez"
-- ============================================================

update public.opening_lines l
   set variation_name = replace(l.variation_name, 'Icelandic', 'islandez'),
       move_explanations = replace(l.move_explanations::text, 'Icelandic', 'islandez')::jsonb
 where l.variation_name like '%Icelandic%' or l.move_explanations::text like '%Icelandic%';

update public.middlegame_plans p
   set structure = replace(p.structure, 'Icelandic', 'islandez'),
       ideas = replace(p.ideas::text, 'Icelandic', 'islandez')::jsonb,
       avoid = replace(p.avoid, 'Icelandic', 'islandez'),
       move_explanations = replace(p.move_explanations::text, 'Icelandic', 'islandez')::jsonb
 where p.structure like '%Icelandic%' or p.ideas::text like '%Icelandic%'
    or p.avoid like '%Icelandic%' or p.move_explanations::text like '%Icelandic%';

update public.opening_traps t
   set title = replace(t.title, 'Icelandic', 'islandez'),
       explanation = replace(t.explanation, 'Icelandic', 'islandez')
 where t.title like '%Icelandic%' or t.explanation like '%Icelandic%';


-- ============================================================
-- 066 · capcanele Scandinavei
-- ============================================================
-- Nota de metodă, fiindcă a fost o lecţie. Prima căutare a fost pe ghicite —
-- opt candidate scoase din cap, niciuna peste prag — şi concluzia a fost că
-- Scandinava n-are nicio cursă în care să cadă negrul. Concluzia era greşită.
-- A doua căutare a fost sistematică şi a scos imediat 5...De5+.

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


-- ============================================================
-- DOVADA — dacă rândul de mai jos nu arată 0, 0, 0, 3, ceva n-a intrat
-- ============================================================
select
  (select count(*) from public.opening_lines
    where move_explanations::text ~* 'rocheaz|se roch|castel[eaiă]')            as forme_inventate,
  (select count(*) from public.opening_lines
    where variation_name like '%Icelandic%'
       or move_explanations::text like '%Icelandic%')                            as icelandic_in_linii,
  (select count(*) from public.opening_lines l join public.courses c on c.id = l.course_id
    where c.slug = 'nimzo-indian-defense' and l.variation_code = 'A'
      and l.move_explanations->>'8' ilike '%rocad%')                             as nimzo_a8_gresit,
  (select count(*) from public.opening_traps t join public.courses c on c.id = t.course_id
    where c.slug = 'scandinavian-defense')                                       as capcane_scandinava;
