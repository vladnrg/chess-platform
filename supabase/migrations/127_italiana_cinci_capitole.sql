-- ============================================================
-- Partida Italiană: cinci capitole în loc de trei
-- ============================================================
-- Utilizatorul, pe 2026-11-23, după o observaţie primită de la Claude Web:
-- capitolul „Giuoco Pianissimo (vs Cf6)" începe cu 3…Cf6, adică Apărarea celor
-- doi cai, nu cu 3…Nc5. A ales: capitolul se redenumeşte „Apărarea celor doi
-- cai (varianta liniştită cu d3)" şi îşi păstrează textul, iar cursul primeşte
-- două capitole noi: Giuoco Pianissimo adevărat (3…Nc5 4.c3 Cf6 5.d3) şi
-- Gambitul Evans (3…Nc5 4.b4).
--
-- Nuanţa, verificată în baza de partide de maeştri de la Lichess: după
-- 3…Cf6 4.d3 Nc5 5.c3 poziţia e IDENTICĂ cu Pianissimo (Lichess o clasifică
-- „Giuoco Pianissimo, Normal"). Deci capitolul vechi nu era greşit ca poziţie,
-- ci ca drum. Ca cele două capitole să nu se repete, se despart după 5…d6:
-- capitolul cu doi cai păstrează planul cu b4 şi a4, cel nou face rocada,
-- Te1, h3 şi manevra Cbd2-f1. Textele trimit unul la altul.
--
-- Liniile noi sunt liniile principale ale maeştrilor (mutarea cea mai jucată la
-- aproape fiecare pas), trecute prin motor la adâncimea 18:
--   · Pianissimo — nicio mutare a albului nu pierde peste 0,15; nicio mutare a
--     negrului peste 0,05; capătul liniei +0,16. Planul: +0,09.
--   · Evans — 4.b4 costă cam 0,6 (e un gambit, aşa se şi spune în text); restul
--     mutărilor albe pierd cel mult 0,06; cea mai slabă a negrului, 10…Cxc4,
--     0,33 (o joacă un sfert din maeştri). Capătul liniei +0,09, cu un pion în
--     minus şi compensaţie. Planul recuperează pionul: 0,00.
--   · „De evitat", măsurate: Cd5 în Pianissimo pierde 2,03 (Cexd5 exd5 Nxd5);
--     d5 în Evans pierde 3,61 (Dxc4, calul de pe c4 nu-l apără nimeni).
--
-- Procentele de popularitate erau aproximări vechi (45/35/8). Acum sunt cota
-- din partidele de maeştri de după 1.e4 e5 2.Cf3 Cc6 3.Nc4 (51 257 de partide):
-- Giuoco Piano cu d4 6%, Pianissimo 29%, Evans 3%, doi cai cu d3 33%, Ungara 2%.
--
-- Tot aici: `lesson_count` era vechi la toate cursurile de deschideri (5 lecţii
-- la 3 capitole), iar pagina cursurilor împarte progresul la el. Un curs
-- terminat arăta 60%. Acum e numărul de capitole plus capcane — exact ce
-- numără şi `cursTerminat`.
-- ============================================================


-- ------------------------------------------------------------
-- 1. Capitolul vechi B: Apărarea celor doi cai, varianta liniştită
-- ------------------------------------------------------------
update public.opening_lines
   set variation_name = 'Apărarea celor doi cai (varianta liniştită cu d3)',
       order_index = 4,
       popularity_pct = 33,
       move_explanations = move_explanations || $j${
  "5": "Cf6 — Apărarea celor doi cai. Adversarul nu-şi scoate nebunul, ci al doilea cal, şi îţi atacă imediat pionul de pe e4.",
  "6": "d3 — varianta liniştită. În loc să intri în lupta deschisă, faci un singur pas şi îţi aperi pionul de e4. Nu se întâmplă nimic repede, dar nici nu rişti nimic, iar poziţia rămâne bogată în idei.",
  "7": "Nc5 — adversarul îşi scoate şi nebunul, pe diagonala oglindă. După c3, poziţia e exact cea din Giuoco Pianissimo, capitolul 2: aceeaşi aşezare, la care ai ajuns pe alt drum. Aici înveţi planul cu b4 şi a4; acolo, pe cel cu rocada, h3 şi manevra calului."
}$j$::jsonb
 where id = 'ca609b84-f8db-43b8-91b5-6f843563c683';

update public.middlegame_plans
   set structure = $t$Centrul e încuiat şi nu se mişcă nimeni prin el. Ai spaţiu pe flancul damei, cu pionii de pe a4 şi b4 deja împinşi, şi o manevră lungă de făcut cu calul: d2-f1-g3. Varianta e lentă, dar cine ştie unde merge fiecare piesă are un avantaj real faţă de cine doar aşteaptă.$t$,
       ideas = $j$[
  {"title": "Cd2-f1-g3, manevra tipică a poziţiei", "detail": "Calul face trei mutări ca să ajungă pe g3, de unde priveşte spre f5 şi h5, adică spre regele advers. Într-o poziţie închisă ai timp pentru asemenea plimbări; într-una deschisă n-ai avea."},
  {"title": "Nebunul de pe c1 iese pe e3 sau g5", "detail": "E ultima piesă neaşezată. Pe e3 apără pionii de pe flancul damei şi priveşte spre a7; pe g5 ţinteşte calul de pe f6. Alege în funcţie de ce a făcut adversarul, nu dinainte."},
  {"title": "Pionii de pe flancul damei sunt deja porniţi", "detail": "a4 şi b4 nu se împing mai departe fără rost. Stau acolo şi îi iau adversarului câmpurile b5 şi c5; când vei fi gata cu piesele, atunci vine şi împingerea."}
]$j$::jsonb
 where opening_line_id = 'ca609b84-f8db-43b8-91b5-6f843563c683';


-- ------------------------------------------------------------
-- 2. Ordinea şi popularitatea celorlalte două capitole vechi
-- ------------------------------------------------------------
update public.opening_lines set order_index = 1, popularity_pct = 6
 where id = '6934b8f5-a458-41d5-962e-8d6d7325a503';   -- Giuoco Piano
update public.opening_lines set order_index = 5, popularity_pct = 2
 where id = 'e016a9f3-c2d0-46ca-9f7c-25fe06c94eed';   -- Apărarea Ungară


-- ------------------------------------------------------------
-- 3. Capitolele noi: D — Giuoco Pianissimo, E — Gambitul Evans
-- ------------------------------------------------------------
insert into public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci)
select c.id, v.nume, v.cod, v.pop, v.ord, 'white', v.mutari
  from public.courses c
 cross join (values
   ('Giuoco Pianissimo (vs Nc5, cu d3)', 'D', 29, 2,
    'e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 c2c3 g8f6 d2d3 d7d6 e1g1 e8g8 f1e1 a7a5 h2h3 h7h6 b1d2 c8e6 c4b5 d8b8 d2f1 b8a7 c1e3'),
   ('Gambitul Evans (vs Nc5, cu b4)', 'E', 3, 3,
    'e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 b2b4 c5b4 c2c3 b4a5 d2d4 d7d6 d1b3 d8d7 e1g1 a5b6 b1d2 c6a5 b3c2 a5c4 d2c4')
 ) as v(nume, cod, pop, ord, mutari)
 where c.slug = 'italian-game'
   and not exists (
     select 1 from public.opening_lines l where l.course_id = c.id and l.variation_code = v.cod
   );

-- Textele se pun separat, ca o a doua rulare să le reîmprospăteze.
update public.opening_lines l
   set move_explanations = $j${
  "0": "e4 — deschizi în centru.",
  "1": "e5 — adversarul răspunde simetric.",
  "2": "Cf3 — ataci pionul de pe e5 şi te dezvolţi.",
  "3": "Cc6 — îşi apără pionul.",
  "4": "Nc4 — nebunul pe diagonala spre f7, punctul cel mai slab din tabăra adversă.",
  "5": "Nc5 — adversarul îşi scoate nebunul în oglindă şi ţinteşte f2.",
  "6": "c3 — ca în capitolul 1, îi pregăteşti pionului de pe d drumul spre d4. Doar că de data asta nu te grăbeşti.",
  "7": "Cf6 — adversarul se dezvoltă şi îţi atacă pionul de pe e4.",
  "8": "d3 — aici te desparţi de capitolul 1. În loc de d4, faci un singur pas: îţi aperi pionul de e4 şi laşi centrul închis. Asta e Giuoco Pianissimo, „jocul foarte liniştit”: nimic nu se întâmplă repede, dar fiecare piesă îşi caută locul cel mai bun. Dintre maeştrii care joacă c3, trei din patru aleg aici d3, nu d4.",
  "9": "d6 — adversarul îşi întăreşte şi el pionul de e5. Până aici, poziţia e aceeaşi cu cea din capitolul 4, la care se ajunge din Apărarea celor doi cai. De aici drumurile se despart: acolo porneşti cu b4 şi a4, aici faci rocada şi aduci tura pe e1.",
  "10": "Rocada ta. Regele e la adăpost, iar tura ajunge pe f1, de unde trece la mutarea următoare pe e1.",
  "11": "Rocada adversarului.",
  "12": "Te1 — tura se aşază în spatele pionului de e4 şi îl păzeşte. Mai important, eliberează câmpul f1, pe unde va trece calul de pe b1.",
  "13": "a5 — adversarul îţi ia câmpul b4: dacă împingi acolo pionul, îl ia. Aşa nebunul lui de pe c5 nu poate fi alungat cu b4.",
  "14": "h3 — o mutare mică, dar de care ai nevoie: îi iei adversarului câmpul g4. Fără ea, nebunul lui de pe c8 ar ţintui calul tău de pe f3, iar calul de pe f6 ar putea sări pe g4, spre f2.",
  "15": "h6 — adversarul face acelaşi lucru: îţi ia câmpul g5, ca nici calul, nici nebunul tău să nu ajungă acolo.",
  "16": "Cbd2 — calul porneşte pe drumul lui: d2, apoi f1, apoi g3 sau e3. Pe c3 nu poate, acolo e pionul tău.",
  "17": "Ne6 — adversarul îşi dezvoltă ultima piesă uşoară şi îţi oferă schimbul nebunilor.",
  "18": "Nb5 — nu schimbi. Dacă iei pe e6, adversarul reia cu pionul de pe f, îşi deschide coloana f pentru tură şi îşi întăreşte centrul. Nebunul se mută pe b5, de unde pune presiune pe calul de pe c6 — piesa care îi apără pionul de e5.",
  "19": "Db8 — dama adversarului pleacă spre a7, de unde va lucra împreună cu nebunul de pe c5.",
  "20": "Cf1 — calul îşi continuă drumul. De pe f1 poate merge pe g3, spre regele advers, sau pe e3, spre câmpurile d5 şi f5 din centru.",
  "21": "Da7 — dama şi nebunul de pe c5 stau acum pe aceeaşi diagonală şi pun sub presiune pionul de pe f2, apărat doar de rege.",
  "22": "Ne3 — închizi diagonala exact unde trebuie. Nebunul se pune în calea bateriei spre f2 şi îi oferă adversarului schimbul. Dacă ia, reiei cu calul de pe f1, care ajunge chiar pe e3 — câmpul pe care oricum voia să-l ocupe. Deschiderea s-a încheiat: ai toate piesele ieşite, regele la adăpost şi un centru solid. Ca de obicei în Pianissimo, nu câştigi dintr-o lovitură, ci strângând poziţia mutare cu mutare."
}$j$::jsonb,
       move_marks = $j${
  "4": {"squares": ["f7"]},
  "6": {"squares": ["f2"]},
  "8": {"arrows": [{"from": "f6", "to": "e4", "color": "red"}]},
  "12": {"control": ["e4"]},
  "14": {"control": ["b4", "g4"]},
  "16": {"control": ["g5"]},
  "18": {"squares": ["c6"]},
  "20": {"arrows": [{"from": "f1", "to": "g3", "color": "green"}, {"from": "f1", "to": "e3", "color": "green"}]},
  "22": {"squares": ["f2"], "arrows": [{"from": "c5", "to": "e3", "color": "red"}]}
}$j$::jsonb
  from public.courses c
 where l.course_id = c.id and c.slug = 'italian-game' and l.variation_code = 'D';

update public.opening_lines l
   set move_explanations = $j${
  "0": "e4 — deschizi în centru.",
  "1": "e5 — adversarul răspunde simetric.",
  "2": "Cf3 — ataci pionul de pe e5 şi te dezvolţi.",
  "3": "Cc6 — îşi apără pionul.",
  "4": "Nc4 — nebunul pe diagonala spre f7, punctul cel mai slab din tabăra adversă.",
  "5": "Nc5 — adversarul îşi scoate nebunul în oglindă.",
  "6": "b4! — Gambitul Evans. Dai un pion ca să câştigi timp: dacă adversarul îl ia, îi alungi nebunul din nou cu c3, iar pionul tău de pe d ajunge pe d4 cu tempo. Motorul socoteşte jocul aproape egal; în practică, cine nu ştie cum să se apere se pierde repede.",
  "7": "Nxb4 — adversarul acceptă şi ia pionul. Aproape nouă din zece maeştri o fac.",
  "8": "c3 — alungi nebunul şi pregăteşti d4. De aici se vede ce ai cumpărat cu pionul: timp şi centru.",
  "9": "Na5 — nebunul se retrage, dar nu oricum: rămâne pe diagonala a5-e1, care duce la regele tău. După ce pionul de pe d2 pleacă, pionul de pe c3 nu mai are voie să ia nimic cât timp regele stă pe e1.",
  "10": "d4 — lovitura din centru pentru care ai dat pionul. Ataci pionul de e5 şi îi deschizi drum nebunului de pe c1.",
  "11": "d6 — adversarul îşi ţine pionul de e5 cu alt pion, în loc să ia pe d4. E apărarea cea mai jucată de maeştri şi cea mai bună după motor.",
  "12": "Db3 — dama iese şi, împreună cu nebunul de pe c4, ţinteşte f7. Dacă adversarul nu se apără, Nxf7+ câştigă un pion şi îl lasă fără rocadă.",
  "13": "Dd7 — dama acoperă f7 de pe linia a şaptea. Aproape toţi maeştrii aleg mutarea asta.",
  "14": "Rocada ta. Regele pleacă de pe diagonala nebunului de pe a5, iar pionul de pe c3 e din nou liber să ia.",
  "15": "Nb6 — nebunul se retrage încă o dată şi pune presiune pe pionul de pe d4.",
  "16": "Cbd2 — ultimul cal iese. Pe c3 nu poate, acolo e pionul; de pe d2 păzeşte nebunul de pe c4.",
  "17": "Ca5 — calul adversarului atacă deodată dama de pe b3 şi nebunul de pe c4. Vrea să scape de nebunul care îi ţinteşte f7.",
  "18": "Dc2 — dama se dă la o parte, dar rămâne în joc: de pe c2 îţi sprijină pionul de pe e4. Nebunul de pe c4 îl laşi să fie luat — ai cu ce să reiei.",
  "19": "Cxc4 — adversarul îţi ia nebunul, piesa care îl deranja cel mai tare.",
  "20": "Cxc4 — reiei cu calul, care ajunge pe un câmp activ: de pe c4 ţinteşte nebunul de pe b6 şi pionul de pe e5. Deschiderea s-a încheiat. Ai un pion mai puţin — preţul gambitului —, dar în schimb ai centrul, piesele mai active şi un adversar cu regele încă pe e8. Motorul socoteşte poziţia egală: pionul e plătit."
}$j$::jsonb,
       move_marks = $j${
  "4": {"squares": ["f7"]},
  "8": {"arrows": [{"from": "d2", "to": "d4", "color": "green"}]},
  "12": {"squares": ["f7"]},
  "16": {"squares": ["d4"]},
  "18": {"control": ["e4"]},
  "20": {"squares": ["b6", "e5"]}
}$j$::jsonb
  from public.courses c
 where l.course_id = c.id and c.slug = 'italian-game' and l.variation_code = 'E';


-- ------------------------------------------------------------
-- 4. Planurile de joc de mijloc pentru capitolele noi
-- ------------------------------------------------------------
insert into public.middlegame_plans (opening_line_id, structure, ideas, avoid, moves_uci, move_explanations, move_marks)
select l.id,
  $t$Centrul e închis: pionii tăi de pe d3 şi e4 stau faţă în faţă cu ai lui de pe d6 şi e5, şi niciunul nu se mişcă repede. Materialul e egal, regii sunt la adăpost, iar adversarul are o singură idee activă: dama şi nebunul pe diagonala spre f2. Pe aceea ai închis-o cu Ne3. De aici, câştigă cine îşi aşază mai bine piesele, nu cine atacă primul.$t$,
  $j$[
    {"title": "Calul de pe f1 îşi termină drumul", "detail": "Fie pe e3, după schimbul nebunilor, fie pe g3. De pe e3 priveşte d5 şi f5, câmpurile din mijloc pe care le vrei pentru piesele tale; de pe g3 priveşte f5 şi h5, spre regele advers."},
    {"title": "a4 ţine flancul damei pe loc", "detail": "Pionul de pe a4 îl opreşte pe cel de pe a5 şi sprijină nebunul de pe b5. Nu porneşti nimic acolo; doar nu-l laşi pe adversar să pornească."},
    {"title": "Spargerea d4, la momentul ei", "detail": "Centrul nu rămâne închis la nesfârşit. Când piesele tale sunt aşezate, împingi d3-d4. Pionul de pe c3 e acolo exact pentru asta: îl sprijină."}
  ]$j$::jsonb,
  $t$Nu sări cu calul pe d5. Pare câmpul visat, în mijlocul tablei, dar e păzit de trei piese negre — calul de pe e7, calul de pe f6 şi nebunul de pe e6 —, iar tu îl aperi doar cu pionul de pe e4. După Cexd5 exd5 Nxd5, adversarul are un pion în plus; motorul socoteşte pierderea la aproape doi pioni. Un câmp bun e bun doar dacă piesa poate şi sta acolo.$t$,
  'c5e3 f1e3 c6e7 a2a4 a8d8 b5c4',
  $j${
    "0": "Nxe3 — adversarul schimbă nebunii, cum era de aşteptat.",
    "1": "Cxe3 — reiei cu calul, care ajunge exact unde voia. De pe e3 priveşte câmpurile d5 şi f5.",
    "2": "Ce7 — calul adversarului se pregăteşte să sară pe g6 şi păzeşte şi el d5 şi f5.",
    "3": "a4 — opreşti pionul de pe a5 pe loc: nu mai poate merge pe a4 ca să-ţi strice flancul damei, iar nebunul tău de pe b5 are acum sprijinul unui pion.",
    "4": "Tad8 — tura adversarului vine în spatele pionului de pe d6.",
    "5": "Nc4 — nebunul se întoarce pe diagonala lui, faţă în faţă cu nebunul de pe e6. Dacă schimbi tu pe e6, pionul lui de pe f ajunge pe e6 şi îi rămân pionii dublaţi pe coloana e; dacă schimbă el pe c4, reiei cu pionul de pe d3 şi ai mai mult control în centru."
  }$j$::jsonb,
  $j${"1": {"control": ["d5", "f5"]}}$j$::jsonb
  from public.opening_lines l
  join public.courses c on c.id = l.course_id
 where c.slug = 'italian-game' and l.variation_code = 'D'
on conflict (opening_line_id) do update
   set structure = excluded.structure, ideas = excluded.ideas, avoid = excluded.avoid,
       moves_uci = excluded.moves_uci, move_explanations = excluded.move_explanations,
       move_marks = excluded.move_marks;

insert into public.middlegame_plans (opening_line_id, structure, ideas, avoid, moves_uci, move_explanations, move_marks)
select l.id,
  $t$Ai un pion mai puţin, dar şi tot ce ai cumpărat cu el: centrul cu d4 şi e4, regele la adăpost şi piese gata de luptă, în timp ce regele adversarului stă încă pe e8. Planul e să deschizi poziţia cât timp regele lui e în centru — şi, pe drum, să-ţi iei pionul înapoi.$t$,
  $j$[
    {"title": "Deschide centrul cât regele lui e acolo", "detail": "dxe5 deschide coloana d şi diagonalele spre regele advers. Fiecare linie deschisă e un drum pentru piesele tale, care sunt deja ieşite."},
    {"title": "Pionul se recuperează din mers", "detail": "Nu trebuie să alergi după el. Pionul de pe e5 devine slab imediat ce centrul se deschide, iar calul de pe f3 îl ia la momentul potrivit."},
    {"title": "Nebunul de pe c1 vrea diagonala a3-f8", "detail": "După ce pionul de pe d6 dispare, nebunul de pe a3 controlează f8 — iar regele nu are voie să facă rocada mică printr-un câmp atacat. E o idee clasică în Gambitul Evans."}
  ]$j$::jsonb,
  $t$Nu împinge d5 ca să alungi dama de pe c6. Pare firesc — pionul atacă dama, câştigi timp —, dar dama nu fuge, ci ia: Dxc4, şi ai pierdut calul. Calul de pe c4 nu-l apără nimeni: dama ta de pe c2 e oprită de propriul pion de pe c3. Motorul socoteşte pierderea la peste trei pioni şi jumătate. Înainte să ataci dama adversarului, uită-te ce atacă ea.$t$,
  'd7c6 c4b6 a7b6 d4e5 d6e5 f3e5',
  $j${
    "0": "Dc6 — dama adversarului atacă deodată calul de pe c4 şi pionul de pe e4.",
    "1": "Cxb6 — singura mutare bună: schimbi calul atacat pe nebunul lui. Orice altceva lasă calul în priză.",
    "2": "axb6 — adversarul reia cu pionul de pe a, iar coloana a i se deschide pentru tură.",
    "3": "dxe5 — deschizi centrul. Regele lui e încă pe e8, deci orice coloană deschisă în mijloc lucrează pentru tine.",
    "4": "dxe5 — adversarul reia.",
    "5": "Cxe5 — îţi iei pionul înapoi şi ataci dama de pe c6. Materialul e din nou egal, dar adversarul are regele în centru şi două piese încă neieşite, în timp ce tu ai făcut rocada şi eşti gata de joc."
  }$j$::jsonb,
  $j${"1": {"squares": ["c4", "e4"]}}$j$::jsonb
  from public.opening_lines l
  join public.courses c on c.id = l.course_id
 where c.slug = 'italian-game' and l.variation_code = 'E'
on conflict (opening_line_id) do update
   set structure = excluded.structure, ideas = excluded.ideas, avoid = excluded.avoid,
       moves_uci = excluded.moves_uci, move_explanations = excluded.move_explanations,
       move_marks = excluded.move_marks;


-- ------------------------------------------------------------
-- 5. lesson_count = capitole + capcane, la toate cursurile de deschideri
-- ------------------------------------------------------------
update public.courses c
   set lesson_count = (select count(*) from public.opening_lines l where l.course_id = c.id)
                    + (select count(*) from public.opening_traps t where t.course_id = c.id)
 where exists (select 1 from public.opening_lines l where l.course_id = c.id);


-- ------------------------------------------------------------
-- Dovada
-- ------------------------------------------------------------
do $$
declare
  ordine text;
  n_planuri int;
  pianissimo_in_b int;
  lc int;
begin
  select string_agg(l.variation_code, '' order by l.order_index) into ordine
    from public.opening_lines l join public.courses c on c.id = l.course_id
   where c.slug = 'italian-game';
  if ordine is distinct from 'ADEBC' then
    raise exception 'Ordinea capitolelor e %, trebuia ADEBC', ordine;
  end if;

  select count(*) into n_planuri
    from public.middlegame_plans p
    join public.opening_lines l on l.id = p.opening_line_id
    join public.courses c on c.id = l.course_id
   where c.slug = 'italian-game';
  if n_planuri <> 5 then
    raise exception 'Italiana are % planuri de mijloc, trebuiau 5', n_planuri;
  end if;

  select count(*) into pianissimo_in_b
    from public.opening_lines l
    left join public.middlegame_plans p on p.opening_line_id = l.id
   where l.id = 'ca609b84-f8db-43b8-91b5-6f843563c683'
     and (l.variation_name ilike '%pianissimo%'
          or l.move_explanations::text ilike '%Pianissimo se desparte%'
          or p.structure ilike '%Pianissimo înseamnă%'
          or p.ideas::text ilike '%dă numele variantei%');
  if pianissimo_in_b <> 0 then
    raise exception 'Capitolul cu doi cai încă se prezintă drept Pianissimo';
  end if;

  select lesson_count into lc from public.courses where slug = 'italian-game';
  if lc <> 6 then
    raise exception 'lesson_count la Italiana e %, trebuia 6 (5 capitole + 1 capcană)', lc;
  end if;

  raise notice 'OK: ordinea ADEBC, 5 planuri, capitolul cu doi cai redenumit, lesson_count 6';
end $$;
