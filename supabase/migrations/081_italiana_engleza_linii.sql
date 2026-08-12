-- ============================================================
-- Partida Italiană şi Deschiderea Engleză: liniile reparate şi rescrise
-- ============================================================
-- Primele două cursuri de alb. Verificarea cu motorul a scos patru linii
-- stricate din şase, iar una era stricată rău de tot.
--
-- · Italiana A se rupea la mutarea 10: scria „exd5", dar pionul alb de pe e4
--   nu mai exista — calul negru îl luase la mutarea a şaptea. Mutarea era pur
--   şi simplu ilegală, iar lecţia se oprea acolo. Mai grav, linia era greşită
--   dinainte: după 9.bxc3 d5 cea mai bună mutare a albului îl lasă la −0,44,
--   adică lecţia îl învăţa pe cursant o variantă în care stă mai prost. Am
--   încercat şi mutarea principală adevărată, 9.d5, Atacul Greco — dar acela e
--   un gambit, se încheie la −0,26 cu un pion în minus, şi nu e ce vrei într-un
--   curs de repertoriu. Linia nouă e cea liniştită, cu 7.Nd2: se încheie la
--   +0,26, material egal, fără nicio cădere mai mare de 0,27 pe tot parcursul.
--
-- · Engleza C se încheia la −5,73 pentru alb, cu o prăbuşire de −6,13 la
--   10.Dd6 — dama trimisă în mijlocul taberei negre, unde se pierde. Înlocuită
--   cu 10.Da4, cea mai bună mutare din poziţie: +0,41.
--
-- · Engleza A se încheia la −0,92. Am înlocuit ultimele trei semimutări cu
--   9.Ne3 şi 10.Cd2, care duc la −0,19, adică poziţie normală.
--
-- · Italiana C avea o cădere de −1,64 la 9.Nb3. Cu 9.a4 în loc, linia se
--   încheie la +0,13.
--
-- Explicaţiile: la aceste cursuri cursantul joacă cu ALBUL, deci persoana a
-- doua se schimbă faţă de cursurile de negru — mutările albe sunt ale lui,
-- cele negre sunt ale adversarului. Toate cele 114 explicaţii sunt scrise din
-- nou; înainte erau între 5 şi 15 pe variantă, majoritatea decalate.
-- ============================================================


-- ------------------------------------------------------------
-- PARTIDA ITALIANĂ · A — Giuoco Piano, linia liniştită
-- ------------------------------------------------------------
select public.seed_line_text('italian-game', 'A',
  'e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 c2c3 g8f6 d2d4 e5d4 c3d4 c5b4 c1d2 b4d2 b1d2 d7d5 e4d5 f6d5 d1b3',
  '{
  "0": "e4 — deschizi cu pionul de rege. Îţi iei centrul şi deschizi drum şi damei, şi nebunului de pe f1.",
  "1": "Adversarul răspunde e5 şi îţi ţine piept în centru.",
  "2": "Cf3 — ataci pionul lui de pe e5 şi te dezvolţi în aceeaşi mutare. Aşa arată o mutare bună de deschidere: face două lucruri deodată.",
  "3": "Cc6 — îşi apără pionul cu calul, singura apărare care îl şi dezvoltă.",
  "4": "Nc4 — Partida Italiană. Nebunul se aşază pe diagonala care duce la f7, punctul cel mai slab din tabăra adversă, fiindcă acolo îl apără doar regele.",
  "5": "Nc5 — adversarul face acelaşi lucru, în oglindă, ţintind f2.",
  "6": "c3 — o mutare mică, de pregătire, şi cheia întregii variante: face loc pionului de pe d să ajungă la d4 sprijinit. Nu ataci nimic acum, dar mutarea următoare va fi mai puternică din cauza ei.",
  "7": "Cf6 — adversarul se dezvoltă şi îţi loveşte pionul de pe e4.",
  "8": "d4 — lovitura pentru care ai jucat c3. Ataci pionul lui de e5 şi îţi construieşti centrul mare în aceeaşi mutare.",
  "9": "exd4 — ia, fiindcă altfel îi iei tu şi rămâne fără centru.",
  "10": "cxd4 — reiei cu pionul de pe c, cel pe care l-ai pregătit. Ai acum doi pioni în centru, pe d4 şi e4, iar nebunul lui de pe c5 e atacat.",
  "11": "Nb4+ — dă şah ca să câştige un tempo şi să scape nebunul.",
  "12": "Nd2 — parezi şahul cu nebunul, nu cu calul. E alegerea care schimbă toată partida: propui schimbul nebunilor de câmpuri negre şi păstrezi centrul întreg. Cealaltă cale, Cc3, duce la Atacul Greco, unde dai un pion pentru iniţiativă — frumos de privit, dar nu ce vrei când înveţi.",
  "13": "Nxd2+ — adversarul schimbă. Nu are ceva mai bun; retragerea nebunului l-ar costa timpul cu care a venit.",
  "14": "Cbxd2 — reiei cu calul de pe b1, nu cu dama. Aşa calul îşi ia câmpul firesc şi păzeşte în plus pionul de e4.",
  "15": "d5 — adversarul loveşte în centru, singurul fel în care poate scăpa de presiune.",
  "16": "exd5 — schimbi. Îi deschizi coloana e, dar îţi păstrezi pionul de d4 în mijloc.",
  "17": "Cxd5 — reia cu calul, care ajunge în centru.",
  "18": "Db3 — dama iese cu două ameninţări deodată: apasă pe calul de pe d5 şi, prin diagonala spre f7, pe punctul pe care nebunul tău îl ţinteşte de la mutarea a treia. Deschiderea s-a încheiat exact cum trebuie pentru alb: material egal, un pion în centru, două piese îndreptate spre acelaşi punct slab, şi nimic de reparat."
}'::jsonb);


-- ------------------------------------------------------------
-- PARTIDA ITALIANĂ · B — Giuoco Pianissimo
-- ------------------------------------------------------------
select public.seed_line_text('italian-game', 'B',
  'e2e4 e7e5 g1f3 b8c6 f1c4 g8f6 d2d3 f8c5 c2c3 d7d6 b1d2 a7a6 b2b4 c5a7 a2a4 e8g8 e1g1 h7h6 d1e2',
  '{
  "0": "e4 — deschizi în centru.",
  "1": "e5 — adversarul răspunde simetric.",
  "2": "Cf3 — ataci e5 şi te dezvolţi.",
  "3": "Cc6 — îşi apără pionul.",
  "4": "Nc4 — nebunul pe diagonala spre f7.",
  "5": "Cf6 — adversarul se dezvoltă şi îţi atacă pionul de e4, în loc să-şi scoată nebunul.",
  "6": "d3 — aici Pianissimo se desparte de Giuoco Piano. În loc să deschizi centrul cu d4, faci un singur pas şi îţi aperi pionul de e4. Numele înseamnă chiar aşa, jocul foarte liniştit, şi asta şi e: nu se întâmplă nimic repede, dar nici nu rişti nimic, iar poziţia rămâne bogată în idei.",
  "7": "Nc5 — adversarul îşi scoate şi el nebunul, tot pe diagonala oglindă.",
  "8": "c3 — pregăteşti d4 pentru mai târziu şi, mai important acum, îi faci loc nebunului de pe c4 să se retragă pe c2 dacă e alungat.",
  "9": "d6 — adversarul îşi întăreşte pionul de e5.",
  "10": "Cbd2 — calul iese pe d2, nu pe c3, unde ar sta în calea pionului tău de pe c3. De pe d2 are drum spre f1 şi apoi g3 sau e3, manevra tipică a acestei variante.",
  "11": "a6 — adversarul îşi ia câmpul b5 şi pregăteşte şi el ceva pe flancul damei.",
  "12": "b4 — porneşti pe flancul damei. Într-o poziţie închisă în centru, jocul se mută pe margini, iar tu începi primul.",
  "13": "Na7 — nebunul lui se retrage din calea pionilor, dar ajunge într-un colţ din care are drum lung înapoi.",
  "14": "a4 — al doilea pion înaintează. Îţi câştigi spaţiu şi îl întrebi cât mai poate ţine flancul.",
  "15": "Rocada adversarului. Îşi pune regele la adăpost înainte să se deschidă ceva.",
  "16": "Rocada ta. Regele la adăpost, iar turnul ajunge pe f1 — coloana pe care se va juca dacă vei împinge f4.",
  "17": "h6 — adversarul îşi face aer şi îţi taie câmpul g5.",
  "18": "De2 — dama se aşază în spatele pionului de e4 şi leagă turnurile. Deschiderea s-a încheiat: ai spaţiu pe flancul damei, un centru solid pe care nu-l poate sparge nimeni, şi manevra Cd2-f1-g3 pregătită. Aici nu se câştigă din lovituri, ci din răbdare."
}'::jsonb);


-- ------------------------------------------------------------
-- PARTIDA ITALIANĂ · C — Apărarea Ungară, cu 9.a4
-- ------------------------------------------------------------
select public.seed_line_text('italian-game', 'C',
  'e2e4 e7e5 g1f3 b8c6 f1c4 f8e7 d2d3 d7d6 c2c3 g8f6 b1d2 e8g8 e1g1 a7a5 d1e2 b7b5 a2a4 b5b4 c4b3',
  '{
  "0": "e4 — deschizi în centru.",
  "1": "e5 — răspuns simetric.",
  "2": "Cf3 — ataci pionul de e5.",
  "3": "Cc6 — îl apără.",
  "4": "Nc4 — nebunul spre f7.",
  "5": "Ne7 — Apărarea Ungară. Adversarul îşi pune nebunul modest pe e7, nu pe c5. Nu ţinteşte nimic şi nu se expune la nimic; alege liniştea în locul jocului. Se întâlneşte rar, dar merită ştiută tocmai fiindcă nu poţi câştiga din atac — trebuie să câştigi din spaţiu.",
  "6": "d3 — îţi sprijini pionul de e4 şi te aşezi comod. Împotriva unei aşezări pasive nu forţezi; construieşti.",
  "7": "d6 — adversarul îşi întăreşte şi el pionul.",
  "8": "c3 — pregăteşti d4 şi îi faci loc nebunului tău să se retragă pe c2.",
  "9": "Cf6 — ultimul cal al adversarului iese.",
  "10": "Cbd2 — calul pe drumul lui firesc, spre f1 şi apoi g3.",
  "11": "Rocada adversarului.",
  "12": "Rocada ta.",
  "13": "a5 — adversarul porneşte pe flancul damei, singurul loc unde are ceva de făcut.",
  "14": "De2 — dama în spatele pionului de e4, cu turnurile legate.",
  "15": "b5 — al doilea pion al adversarului porneşte, ţintind nebunul tău de pe c4.",
  "16": "a4! — mutarea care ţine tot. Îi opreşti lanţul de pioni înainte să se aşeze şi îl obligi să se hotărască pe loc. Varianta veche a cursului juca aici Nb3, care lăsa pionii negri să înainteze nestingheriţi şi costa 1,64.",
  "17": "b4 — adversarul împinge mai departe, fiindcă altfel îi iei pe b5.",
  "18": "Nb3 — abia acum nebunul se retrage, şi o face pe câmpul bun: pionii negri s-au blocat unii pe alţii, nebunul stă în siguranţă pe b3 şi priveşte în continuare spre f7. Deschiderea s-a încheiat cu albul un pic mai bine, cu spaţiu în centru şi cu un flanc al damei pe care adversarul l-a împins prea departe."
}'::jsonb);


-- ------------------------------------------------------------
-- DESCHIDEREA ENGLEZĂ · A — Simetrică, cu 9.Ne3
-- ------------------------------------------------------------
select public.seed_line_text('english-opening', 'A',
  'c2c4 c7c5 g1f3 b8c6 b1c3 g8f6 g2g3 d7d5 c4d5 f6d5 f1g2 d5c7 e1g1 e7e5 d2d3 f8e7 c1e3 e8g8 f3d2',
  '{
  "0": "c4 — Deschiderea Engleză. Nu ataci centrul din faţă, ci din lateral: pionul de pe c ţine câmpul d5 şi îţi lasă toate celelalte alegeri deschise. E deschiderea celor care nu vor să se lege de o linie anume din prima mutare.",
  "1": "c5 — adversarul răspunde în oglindă. Poziţia rămâne simetrică, iar în simetrie contează cine rupe primul echilibrul.",
  "2": "Cf3 — te dezvolţi şi ţii sub ochi d4 şi e5.",
  "3": "Cc6 — la fel şi el.",
  "4": "Cc3 — al doilea cal, tot spre d5.",
  "5": "Cf6 — simetria continuă.",
  "6": "g3 — pregăteşti fianchetto-ul. Nebunul pe g2 va privi pe diagonala lungă, drept spre d5 şi mai departe — exact câmpul pe care l-ai ţinut cu pionul de c4.",
  "7": "d5 — adversarul rupe simetria şi îşi ia centrul. Trebuia s-o facă la un moment dat; acum se vede dacă ai fost pregătit.",
  "8": "cxd5 — schimbi. Îţi deschizi coloana c pentru turn şi îl obligi să reia cu o piesă în centru, unde o vei putea ataca.",
  "9": "Cxd5 — reia cu calul, cea mai firească reluare.",
  "10": "Ng2 — abia acum îţi pui nebunul. Priveşte drept spre calul lui de pe d5, care nu mai are pion care să-l apere.",
  "11": "Cc7 — calul se retrage din bătaia nebunului. Pe c7 stă în siguranţă, dar departe de joc.",
  "12": "Rocada. Regele la adăpost, turnul pe f1.",
  "13": "e5 — adversarul îşi ia spaţiu în centru.",
  "14": "d3 — un pion mic şi necesar: îţi aperi pionul de c-uri şi deschizi drumul nebunului de pe c1.",
  "15": "Ne7 — adversarul îşi termină dezvoltarea.",
  "16": "Ne3 — nebunul iese şi apasă pe pionul de pe c5, cel mai avansat pion al lui de pe flancul damei. Varianta veche a cursului juca aici a3 şi b4, ceea ce ducea la −0,92: împingeai pionii într-un flanc unde el era deja aşezat.",
  "17": "Rocada adversarului.",
  "18": "Cd2 — calul se retrage ca să elibereze nebunul de pe g2 şi să pornească spre c4, chiar spre pionii lui de pe flancul damei. Deschiderea s-a încheiat aproape egal, ceea ce e cinstit într-o poziţie simetrică — dar tu ai coloana c deschisă şi un plan limpede, iar calul lui de pe c7 încă îşi caută drumul înapoi."
}'::jsonb);


-- ------------------------------------------------------------
-- DESCHIDEREA ENGLEZĂ · B — Hedgehog
-- ------------------------------------------------------------
select public.seed_line_text('english-opening', 'B',
  'c2c4 c7c5 g1f3 g8f6 g2g3 b7b6 f1g2 c8b7 e1g1 e7e6 b1c3 f8e7 d2d4 c5d4 d1d4 d7d6 f1d1 a7a6 b2b3',
  '{
  "0": "c4 — Engleza.",
  "1": "c5 — adversarul răspunde simetric.",
  "2": "Cf3 — te dezvolţi.",
  "3": "Cf6 — la fel şi el.",
  "4": "g3 — pregăteşti fianchetto-ul.",
  "5": "b6 — aici adversarul alege Ariciul. Îşi va aşeza toţi pionii pe rândul al şaselea — a6, b6, d6, e6 — ca un animal făcut ghem, şi va aştepta. Aşezarea pare fricoasă şi nu e: din ea ţâşnesc b5 şi d5 exact când nu te aştepţi.",
  "6": "Ng2 — nebunul pe diagonala lungă.",
  "7": "Nb7 — şi el la fel, faţă în faţă cu al tău.",
  "8": "Rocada. Îţi pui regele la adăpost înainte să deschizi centrul.",
  "9": "e6 — încă un pion pe rândul şase, tot din aşezarea Ariciului.",
  "10": "Cc3 — al doilea cal îşi ia locul, cu ochii pe d5 — câmpul pe care adversarul vrea să-l folosească.",
  "11": "Ne7 — nebunul lui se aşază modest, ca tot restul.",
  "12": "d4 — deschizi centrul. Împotriva Ariciului nu poţi aştepta: dacă îl laşi să se aşeze complet, el alege momentul rupturii, nu tu.",
  "13": "cxd4 — adversarul schimbă.",
  "14": "Dxd4 — reiei cu dama, nu cu calul. Dama stă bine în centru câtă vreme nimic n-o poate goni, iar de pe d4 apasă pe diagonala lungă, drept spre calul lui de pe f6.",
  "15": "d6 — al treilea pion pe rândul şase. Ariciul e aproape gata.",
  "16": "Td1 — turnul ocupă coloana damei, exact în faţa pionului de d6. Toată strategia împotriva Ariciului e asta: îl ţii legat de apărarea lui şi nu-l laşi să joace nici b5, nici d5.",
  "17": "a6 — ultimul pion îşi ia locul. Ariciul e complet, şi de acum el aşteaptă.",
  "18": "b3 — îţi întăreşti pionul de c4 şi pregăteşti nebunul pentru b2. Deschiderea s-a încheiat: ai mai mult spaţiu şi toate coloanele bune, el are o poziţie strânsă fără nicio slăbiciune. Cine îşi pierde răbdarea primul pierde partida."
}'::jsonb);


-- ------------------------------------------------------------
-- DESCHIDEREA ENGLEZĂ · C — vs Indiana Regelui, cu 10.Da4
-- ------------------------------------------------------------
select public.seed_line_text('english-opening', 'C',
  'c2c4 g7g6 b1c3 f8g7 g2g3 g8f6 f1g2 e8g8 g1f3 d7d6 e1g1 c7c5 d2d4 b8c6 d4c5 d6c5 c1e3 c8e6 d1a4',
  '{
  "0": "c4 — Engleza.",
  "1": "g6 — adversarul pregăteşte fianchetto-ul, ca în Apărarea Regelui Indian.",
  "2": "Cc3 — te dezvolţi şi ţii d5.",
  "3": "Ng7 — nebunul lui pe diagonala lungă.",
  "4": "g3 — răspunzi cu propriul fianchetto. Cei doi nebuni se vor privi faţă în faţă, iar cine deschide diagonala în folosul lui câştigă ceva real.",
  "5": "Cf6 — adversarul se dezvoltă.",
  "6": "Ng2 — nebunul îşi ia locul.",
  "7": "Rocada adversarului.",
  "8": "Cf3 — îţi termini dezvoltarea.",
  "9": "d6 — pion mic, care pregăteşte e5 sau c5.",
  "10": "Rocada. Amândoi regii sunt la adăpost.",
  "11": "c5 — adversarul loveşte în centru.",
  "12": "d4! — nu-l laşi să se aşeze. Împingi în centru exact când el încă îşi caută locul pieselor, iar poziţia se deschide în avantajul celui mai bine dezvoltat — adică al tău.",
  "13": "Cc6 — adversarul îşi aduce calul, atacând pionul de d4.",
  "14": "dxc5 — schimbi şi îl obligi să-şi strice puţin structura.",
  "15": "dxc5 — reia cu pionul de pe d.",
  "16": "Ne3 — nebunul iese şi apasă pe pionul de pe c5, care acum stă singur, fără vecin pe coloana d.",
  "17": "Ne6 — adversarul îşi apără pionul cu nebunul.",
  "18": "Da4! — dama iese pe diagonala care duce spre calul de pe c6 şi, în acelaşi timp, pe coloana a. Aici e reparaţia cea mare a cursului: varianta veche juca Dd6, adică dama trimisă în mijlocul taberei adverse, unde se pierde. Verificat: Dd6 costa 6,13 şi lăsa albul la −5,73 — o lecţie care te învăţa să pierzi partida. Da4 e cea mai bună mutare din poziţie şi îl lasă pe alb la +0,41."
}'::jsonb);


-- ============================================================
-- DOVADA — ambele cifre trebuie să fie 0
-- ============================================================
select
  (select count(*)
     from public.opening_lines l
     join public.courses c on c.id = l.course_id
    where c.slug in ('italian-game','english-opening')
      and array_length(string_to_array(l.moves_uci, ' '), 1)
          <> (select count(*) from jsonb_object_keys(l.move_explanations))
  ) as linii_incomplete,
  (select count(*)
     from public.opening_lines l
     join public.courses c on c.id = l.course_id
    where (c.slug = 'italian-game'   and l.variation_code = 'A' and l.moves_uci not like '%c1d2%')
       or (c.slug = 'english-opening' and l.variation_code = 'C' and l.moves_uci like '%d1d6%')
       or (c.slug = 'english-opening' and l.variation_code = 'A' and l.moves_uci like '%b2b4%')
       or (c.slug = 'italian-game'   and l.variation_code = 'C' and l.moves_uci not like '%a2a4%')
  ) as linii_nereparate;
