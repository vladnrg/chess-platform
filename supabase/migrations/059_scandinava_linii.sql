-- ============================================================
-- Scandinava: liniile verificate cu motorul
-- ============================================================
-- Cel mai prost curs de negru din câte am verificat. Toate trei variantele
-- aveau cozi în care jucau prost amândoi, iar textele lăudau mutări care
-- pierdeau.
--
-- · Varianta Principală — 8.Cd5 era numit în lecţie „fork! Alb ameninţă
--   simultan dama şi calul". Verificat: mutarea îl costă pe alb 4,27, iar
--   negrul îşi arunca înapoi tot avantajul cu 9...c6 (−3,35). Un text mai
--   spunea „alb câştigă calul de pe d5" despre o simplă reluare.
--
-- · Varianta Modernă — 9...Ng4 pierdea 4,16, iar albul dădea totul înapoi la
--   mutarea următoare cu 10.Ne3 (−4,79). Linia „ieşea bine" doar fiindcă
--   greşiseră amândoi.
--
-- · Gambitul Icelandic — se termina cu negrul un pion în minus şi la −1,27,
--   adică gambitul pur şi simplu nu funcţiona aşa cum era jucat. În linia nouă
--   funcţionează: se încheie la +0,40 pentru negru, cu material egal.
--
-- Două dintre linii se opreau şi în mijlocul unui schimb, ca Dragonul înainte
-- de reparaţie: cursantul rămânea cu piese în minus şi fără să i se spună că
-- trebuie să reia. S-au adăugat reluările.
--
-- O afirmaţie pe care era să o scriu şi eu greşit: că 8...Nb4 ţintuieşte calul
-- de pe c3. Nu-l ţintuieşte — nebunul alb de pe d2 stă chiar pe diagonală, iar
-- calul are şase mutări legale. Verificat înainte de a intra în lecţie.
-- ============================================================

-- ------------------------------------------------------------
-- A · Varianta Principală
-- ------------------------------------------------------------
select public.repara_linie('scandinavian-defense', 'A',
  'e2e4 d7d5 e4d5 d8d5 b1c3 d5a5 d2d4 g8f6 g1f3 c8f5 f1c4 e7e6 c1d2 a5b6 d1e2 f8b4 d4d5 e8g8 d5e6 f5e6');

update public.opening_lines l
   set move_explanations = '{
  "0": "Adversarul deschide cu e4.",
  "1": "d5 — Apărarea Scandinavă. Loveşti centrul din prima mutare, fără nicio pregătire. Nu-i copiezi jocul şi nu-l laşi să-şi aleagă terenul.",
  "2": "Adversarul ia pionul. N-are ceva mai bun: dacă îl lasă acolo, iei tu pe e4.",
  "3": "Dxd5 — îţi iei pionul înapoi cu dama. Se spune că dama nu iese devreme, şi e adevărat — dar aici e singurul fel de a recupera pe loc, iar tu ştii dinainte unde o duci.",
  "4": "Adversarul o atacă cu Cc3 şi câştigă un tempo.",
  "5": "Da5 — ai ştiut de la mutarea a treia că aici ajunge. De pe a5 e în siguranţă, priveşte spre e1 şi nu mai poate fi alungată uşor.",
  "6": "Adversarul îşi construieşte centrul cu d4.",
  "7": "Cf6 — te dezvolţi şi ţii sub ochi câmpul d5.",
  "8": "Adversarul îşi scoate şi celălalt cal.",
  "9": "Nf5 — nebunul iese ÎNAINTE de e6. Asta e toată deosebirea faţă de Franceză: acolo rămâne închis în spatele propriilor pioni, aici apucă să iasă la aer.",
  "10": "Adversarul îşi aşază nebunul pe c4, îndreptat spre f7.",
  "11": "e6 — abia acum ridici zidul. Nebunul e deja afară, deci nu închizi pe nimeni.",
  "12": "Adversarul îşi leagă piesele cu Nd2.",
  "13": "Db6 — dama iese din bătaia calului şi apasă în acelaşi timp pe b2 şi pe d4. Verificat: amândouă drumurile sunt libere.",
  "14": "Adversarul îşi aduce dama pe e2, în spatele nebunului.",
  "15": "Nb4 — te dezvolţi şi apeşi pe calul de pe c3. Nu e o ţintuire, deşi arată aşa: nebunul lui de pe d2 stă chiar pe diagonală, iar calul poate pleca oricând. Dar îl ţii ocupat, iar tu îţi termini dezvoltarea.",
  "16": "Adversarul împinge d5 şi îţi deschide centrul.",
  "17": "Rocada. Regele la adăpost înainte să se complice lucrurile.",
  "18": "Adversarul ia pe e6.",
  "19": "Nxe6 — reiei cu nebunul. Materialul e egal, iar nebunul ajunge pe un câmp bun, în faţa pionilor, nu în spatele lor."
}'::jsonb
  from public.courses c
 where l.course_id = c.id and c.slug = 'scandinavian-defense' and l.variation_code = 'A';


-- ------------------------------------------------------------
-- B · Varianta Modernă
-- ------------------------------------------------------------
select public.repara_linie('scandinavian-defense', 'B',
  'e2e4 d7d5 e4d5 g8f6 d2d4 f6d5 g1f3 g7g6 f1e2 f8g7 e1g1 e8g8 c2c4 d5b6 h2h3 b8c6 d4d5 c6e5 f3e5 g7e5');

update public.opening_lines l
   set move_explanations = '{
  "0": "Adversarul deschide cu e4.",
  "1": "d5 — Scandinava.",
  "2": "Adversarul ia pionul.",
  "3": "Cf6 — varianta modernă. Nu-ţi scoţi dama; laşi calul să recupereze pionul, chiar dacă asta cere o mutare în plus.",
  "4": "Adversarul îşi ţine pionul cu d4, în loc să-l apere.",
  "5": "Cxd5 — îl iei acum. Calul stă în centru şi nu poate fi alungat cu un tempo, cum ar fi fost dama.",
  "6": "Adversarul îşi dezvoltă calul.",
  "7": "g6 — pregăteşti fianchetto. Nebunul de pe g7 va privi de-a lungul diagonalei lungi, spre centrul lui.",
  "8": "Adversarul îşi scoate nebunul pe e2, modest şi solid.",
  "9": "Ng7 — nebunul la post.",
  "10": "Adversarul face rocada.",
  "11": "Rocada. Amândoi aveţi regii la adăpost pe aceeaşi parte, deci nu urmează o cursă de pioni.",
  "12": "Adversarul joacă c4 şi îţi alungă calul din centru.",
  "13": "Cb6 — calul se retrage, dar nu în gol: de pe b6 apasă pe c4 şi păzeşte d5.",
  "14": "Adversarul joacă h3, ca să nu-i vină nimic pe g4.",
  "15": "Cc6 — aduci şi celălalt cal, îndreptat spre d4.",
  "16": "Adversarul împinge d5 şi îţi alungă calul.",
  "17": "Ce5 — calul sare în centru în loc să se retragă. De pe e5 stă bine şi propune un schimb.",
  "18": "Adversarul îl ia.",
  "19": "Nxe5 — reiei cu nebunul din fianchetto. Materialul e egal, iar nebunul ajunge chiar pe diagonala pentru care l-ai pus acolo."
}'::jsonb
  from public.courses c
 where l.course_id = c.id and c.slug = 'scandinavian-defense' and l.variation_code = 'B';


-- ------------------------------------------------------------
-- C · Gambitul Icelandic
-- ------------------------------------------------------------
select public.repara_linie('scandinavian-defense', 'C',
  'e2e4 d7d5 e4d5 g8f6 c2c4 e7e6 d5e6 c8e6 d2d4 f8b4 b1c3 f6e4 g1e2 e6c4 d1c2 d8e7 f2f3 c4e2 c2e4');

update public.opening_lines l
   set move_explanations = '{
  "0": "Adversarul deschide cu e4.",
  "1": "d5 — Scandinava.",
  "2": "Adversarul ia pionul.",
  "3": "Cf6 — nu reiei încă. Îl laşi pe pion acolo şi te dezvolţi.",
  "4": "Adversarul joacă c4, ca să-şi ţină pionul în plus. De aici încolo, partida devine un gambit.",
  "5": "e6 — Gambitul Icelandic. Dai pionul de tot şi ceri în schimb dezvoltare: după ce se schimbă pe e6, toate piesele tale ies deodată.",
  "6": "Adversarul acceptă şi ia pe e6.",
  "7": "Nxe6 — reiei cu nebunul, nu cu pionul. Aşa îl scoţi din corn şi îl pui pe o diagonală bună, în loc să-ţi mai încarci centrul cu pioni.",
  "8": "Adversarul îşi construieşte centrul cu d4.",
  "9": "Nb4+ — şah cu tempo. Îl obligi să blocheze, iar tu îţi dezvolţi încă o piesă pe gratis.",
  "10": "Adversarul blochează cu calul.",
  "11": "Ce4 — calul intră în centru şi apasă pe calul care tocmai a fost pus acolo să blocheze.",
  "12": "Adversarul îşi aduce şi celălalt cal, pe e2.",
  "13": "Nxc4 — îţi iei pionul înapoi. Gambitul şi-a plătit preţul: eşti la material egal, cu toate piesele scoase.",
  "14": "Adversarul îşi mută dama pe c2 şi atacă amândoi caii din centru.",
  "15": "De7 — dama iese pe coloana e, în spatele centrului deschis. De acolo îşi apără calul şi îşi leagă piesele.",
  "16": "Adversarul joacă f3 ca să-ţi alunge calul.",
  "17": "Nxe2 — schimbi înainte să fii alungat tu. Iei ce se poate lua cât încă e rândul tău.",
  "18": "Adversarul reia cu dama şi îţi ia calul din centru. Materialul e egal, iar poziţia e uşor în favoarea ta: piesele tale sunt scoase, ale lui nu toate."
}'::jsonb
  from public.courses c
 where l.course_id = c.id and c.slug = 'scandinavian-defense' and l.variation_code = 'C';
