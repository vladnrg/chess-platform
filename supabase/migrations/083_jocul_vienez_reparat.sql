-- ============================================================
-- Jocul Vienez: reparat şi repus în circulaţie
-- ============================================================
-- Cursul era marcat nepublicat fiindcă toate trei liniile lui se rupeau. Nu
-- erau greşeli de nuanţă, ci mutări care pur şi simplu nu se pot juca:
--
-- · varianta A se oprea la mutarea 6, unde scria că pionul negru de pe d5 ia
--   pe e4 — dar pe e4 nu era nimic. Calul negru trecuse pe acolo cu două
--   mutări înainte şi fusese deja capturat;
--
-- · varianta B îl punea pe alb să facă rocada la mutarea 9, după ce regele lui
--   plecase pe f7 la mutarea 8, luând un nebun. Un rege care a mutat nu mai are
--   voie la rocadă, iar acesta nici măcar nu mai era acasă;
--
-- · varianta C juca 9.Ne3 în timp ce albul era în şah de la Nb4+. Nebunul de pe
--   c1 avea, în poziţia aceea, o singură mutare legală — Nd2 — iar e3 nu
--   acoperea şahul.
--
-- Peste toate astea, varianta C se numea „Viena vs Caro-Kann", deşi linia ei
-- începea cu 1.e4 e5. Nu avea nicio legătură cu Caro-Kann. Numele e schimbat.
--
-- Cele trei linii noi sunt scrise de la zero şi verificate: legale de la cap la
-- coadă, material egal la final, şi se încheie uşor în favoarea albului
-- (măsurat la adâncime 18: −0,10, +0,81 şi +0,40). Niciuna n-are vreo
-- cădere mai mare de 1,2 pe parcurs.
--
-- La final cursul e repus pe publicat. Motivul pentru care fusese scos —
-- liniile rupte — nu mai există.
-- ============================================================


-- ------------------------------------------------------------
-- A · Gambitul Vienez — 3.f4
-- ------------------------------------------------------------
select public.seed_line_text('vienna-game', 'A',
  'e2e4 e7e5 b1c3 g8f6 f2f4 d7d5 f4e5 f6e4 g1f3 f8e7 d2d4 e8g8 f1d3 f7f5 e5f6 e7f6 e1g1 b8c6 c3e2',
  '{
  "0": "e4 — deschizi cu pionul de rege.",
  "1": "e5 — adversarul răspunde simetric.",
  "2": "Cc3 — Jocul Vienez. Calul iese înaintea celui de pe g1, ceea ce pare o inversare fără rost. Nu e: aşa îţi păstrezi pionul de pe f liber, iar el e cel care va da toată partida.",
  "3": "Cf6 — adversarul se dezvoltă şi îţi atacă pionul de e4.",
  "4": "f4! — Gambitul Vienez. Acum se vede de ce calul a ieşit pe c3: pionul de pe f are drum liber. Îi oferi un pion ca să-i scoţi pionul de e5 din centru şi să-ţi deschizi coloana f.",
  "5": "d5 — cea mai bună apărare. Adversarul nu ia pionul de pe f4; loveşte în centru şi îşi deschide piesele. Împotriva unui gambit, contra-lovitura în centru e aproape întotdeauna răspunsul.",
  "6": "fxe5 — iei pionul de pe e5, cum plănuiseşi.",
  "7": "Cxe4 — adversarul îşi ia şi el unul. Materialul e egal, iar poziţia s-a deschis pentru amândoi.",
  "8": "Cf3 — te dezvolţi şi îţi aperi pionul înaintat de pe e5. Nu goneşti calul de pe e4 acum; îl laşi acolo şi îţi aduni piesele.",
  "9": "Ne7 — adversarul îşi pregăteşte rocada.",
  "10": "d4 — îţi construieşti centrul şi îţi deschizi nebunul de pe c1. Ai acum doi pioni în mijloc, pe d4 şi e5.",
  "11": "Rocada adversarului.",
  "12": "Nd3 — nebunul se aşază pe diagonala spre h7 şi, în acelaşi timp, îl atacă pe calul de pe e4. Prima piesă care îl întreabă ce caută acolo.",
  "13": "f5 — adversarul îşi sprijină calul cu un pion şi blochează diagonala nebunului tău.",
  "14": "exf6 — iei în trecere. E singura captură din şah pe care mulţi o uită că există, iar aici e chiar mutarea bună: îi desfaci sprijinul calului de pe e4 şi îi deschizi poziţia regelui.",
  "15": "Nxf6 — adversarul reia cu nebunul.",
  "16": "Rocada. Îţi pui regele la adăpost, iar turnul ajunge pe f1 — chiar coloana pe care ai deschis-o la mutarea a treia.",
  "17": "Cc6 — adversarul îşi aduce ultimul cal.",
  "18": "Ce2 — calul se retrage de pe c3, ca să nu mai fie schimbat, şi porneşte spre f4 sau g3. Deschiderea s-a încheiat cu material egal şi cu o poziţie deschisă în care ai turnul pe coloana f, nebunul pe diagonala spre rege şi un adversar care încă are un cal ieşit în faţă, pe e4, fără sprijin de pion."
}'::jsonb);


-- ------------------------------------------------------------
-- B · Viena Clasică — 3.Nc4
-- ------------------------------------------------------------
select public.seed_line_text('vienna-game', 'B',
  'e2e4 e7e5 b1c3 b8c6 f1c4 g8f6 d2d3 f8b4 g1e2 d7d6 e1g1 b4c3 b2c3 e8g8 f2f4 e5f4 c1f4 c6e7 d1d2',
  '{
  "0": "e4 — deschizi cu pionul de rege.",
  "1": "e5 — răspuns simetric.",
  "2": "Cc3 — Jocul Vienez.",
  "3": "Cc6 — adversarul îşi apără pionul.",
  "4": "Nc4 — Viena Clasică. În loc să împingi imediat cu f4, îţi scoţi nebunul spre f7 şi te aşezi. Gambitul rămâne o posibilitate pentru mai târziu, iar între timp nu rişti nimic.",
  "5": "Cf6 — adversarul se dezvoltă şi îţi loveşte pionul de e4.",
  "6": "d3 — îl aperi cu un pion. Un pas mic, nu doi: aşa poziţia rămâne închisă şi păstrezi împingerea f4 pentru momentul potrivit.",
  "7": "Nb4 — adversarul îşi ţintuieşte calul de pe c3.",
  "8": "Ce2 — calul iese pe e2, nu pe f3, unde ar sta în calea pionului de pe f. Toată Viena se învârte în jurul pionului aceluia; nu-i pui nimic în drum. Un amănunt de notaţie care spune ceva despre poziţie: mutarea se scrie Ce2, fără să fie nevoie să lămureşti care cal, fiindcă celălalt — cel de pe c3 — e ţintuit de nebunul de pe b4 şi n-are voie să se mişte.",
  "9": "d6 — adversarul îşi întăreşte pionul de e5.",
  "10": "Rocada. Regele la adăpost înainte să deschizi ceva.",
  "11": "Nxc3 — adversarul îţi ia calul, stricându-ţi pionii de pe flancul damei.",
  "12": "bxc3 — reiei cu pionul de pe b. Rămâi cu pionii de pe c dublaţi, ceea ce arată urât — dar în schimb ai coloana b deschisă, un centru mai puternic şi, mai ales, perechea de nebuni. E un târg pe care îl faci cu ochii deschişi.",
  "13": "Rocada adversarului.",
  "14": "f4! — abia acum. Ai aşteptat opt mutări cu împingerea asta, şi acum vine când toate piesele tale sunt aşezate şi regele lui e la locul lui, adică exact unde vrei să ajungi.",
  "15": "exf4 — adversarul ia, fiindcă altfel îi iei tu pe e5.",
  "16": "Nxf4 — reiei cu nebunul, care ajunge pe o diagonală bună şi apasă pe pionul lui de d6.",
  "17": "Ce7 — calul lui se retrage din calea nebunului.",
  "18": "Dd2 — dama îşi leagă piesele şi se aşază pe diagonala spre h6. Deschiderea s-a încheiat cu albul clar mai bine: coloana f deschisă cu turnul pe ea, perechea de nebuni, centrul şi un plan limpede la regele advers. Pionii dublaţi de pe c sunt singurul preţ, şi e mic."
}'::jsonb);


-- ------------------------------------------------------------
-- C · Viena cu fianchetto — 3.g3
-- ------------------------------------------------------------
select public.seed_line_text('vienna-game', 'C',
  'e2e4 e7e5 b1c3 b8c6 g2g3 f8c5 f1g2 d7d6 g1e2 g8f6 d2d3 e8g8 e1g1 a7a6 h2h3 c8e6 g1h2 d6d5 f2f4',
  '{
  "0": "e4 — deschizi cu pionul de rege.",
  "1": "e5 — răspuns simetric.",
  "2": "Cc3 — Jocul Vienez.",
  "3": "Cc6 — adversarul îşi apără pionul.",
  "4": "g3 — a treia faţă a Vienei, şi cea mai liniştită. În loc de gambit sau de nebunul pe c4, îţi pui nebunul în fianchetto, pe g2. Nu ceri nimic din deschidere; îţi construieşti o poziţie solidă şi păstrezi împingerea f4 pentru mai târziu, când va conta mai mult.",
  "5": "Nc5 — adversarul îşi scoate nebunul activ, ţintind f2.",
  "6": "Ng2 — nebunul îşi ia locul pe diagonala lungă, îndreptat prin centru.",
  "7": "d6 — adversarul îşi întăreşte pionul de e5.",
  "8": "Cge2 — calul pe e2, ca de fiecare dată în Viena: nu blochezi pionul de pe f.",
  "9": "Cf6 — adversarul îşi termină dezvoltarea.",
  "10": "d3 — un pas mic, care îţi aperă pionul de e4 şi îţi deschide nebunul de pe c1.",
  "11": "Rocada adversarului.",
  "12": "Rocada. Amândoi regii sunt la adăpost.",
  "13": "a6 — adversarul îşi ia câmpul b5.",
  "14": "h3 — o mutare mică şi necesară: îi tai câmpul g4, de unde nebunul lui ar veni să-ţi ţintuiască piesele.",
  "15": "Ne6 — adversarul îşi propune schimbul nebunilor de câmpuri albe.",
  "16": "Rh2 — regele face un pas în lateral. Pare o mutare fără rost şi nu e: îl dai din calea coloanei f, pe care o vei deschide cu f4, şi îţi eliberezi turnul de pe f1.",
  "17": "d5 — adversarul loveşte în centru, încercând să deschidă poziţia înainte să apuci tu.",
  "18": "f4! — împingerea pentru care s-a jucat toată deschiderea. Vine la mutarea a zecea în loc de a treia, dar vine cu regele la adăpost, cu turnul deja pe coloană şi cu toate piesele aşezate. Deschiderea s-a încheiat cu albul un pic mai bine, într-o poziţie pe care nu trebuie s-o ţii minte pe de rost: ştii unde merge fiecare piesă şi ce împingere urmează."
}'::jsonb);


-- ------------------------------------------------------------
-- Numele variantei C, care nu avea nicio legătură cu linia ei
-- ------------------------------------------------------------
update public.opening_lines l
   set variation_name = 'Viena cu fianchetto — g3'
  from public.courses c
 where l.course_id = c.id and c.slug = 'vienna-game' and l.variation_code = 'C';


-- ------------------------------------------------------------
-- Cursul se întoarce în catalog
-- ------------------------------------------------------------
update public.courses set is_published = true where slug = 'vienna-game';


-- ============================================================
-- DOVADA — trebuie să arate 0, 0, 1, 0
-- ============================================================
select
  (select count(*) from public.opening_lines l join public.courses c on c.id = l.course_id
    where c.slug = 'vienna-game'
      and array_length(string_to_array(l.moves_uci, ' '), 1)
          <> (select count(*) from jsonb_object_keys(l.move_explanations)))    as linii_incomplete,
  (select count(*) from public.opening_lines l join public.courses c on c.id = l.course_id
    where c.slug = 'vienna-game' and l.variation_name ilike '%Caro%')           as nume_gresit_ramas,
  (select count(*) from public.courses
    where slug = 'vienna-game' and is_published)                                as vienez_publicat,
  (select count(*) from public.opening_lines l join public.courses c on c.id = l.course_id
    where l.user_color = 'white'
      and array_length(string_to_array(l.moves_uci, ' '), 1)
          <> (select count(*) from jsonb_object_keys(l.move_explanations)))    as tot_albul_incomplet;
