-- ============================================================
-- Siciliana: liniile verificate cu motorul
-- ============================================================
-- Toate trei variantele au fost trecute prin Stockfish, mutare cu mutare.
--
-- · Najdorf — sănătoasă. Se încheie la −0,72 pentru negru, ceea ce e normal
--   pentru English Attack: albul primeşte spaţiu, negrul primeşte contra-joc.
--   Doar textele se curăţă.
--
-- · Scheveningen — coada era ruptă pe fond. Atacul Keres în sine e corect
--   (6.g4 e chiar prima alegere a motorului), dar de la mutarea 8 albul se
--   prăbuşea: 8.Tg1 pierdea 1,42, iar 9.Dxg4 încă 3,38. Linia se termina la
--   +4,59 pentru negru, adică îl arăta pe adversar complet pierdut. Cine
--   învăţa varianta rămânea cu impresia că Sicilianul câştigă singur.
--   Coada e înlocuită cu 8.Nxg5 Cc6 9.Dd2 Cxd4 10.Dxd4, care se încheie la
--   −0,42 — adică o poziţie de joc, nu un cadou.
--   Tot acolo, textul de la semi-mutarea 15 spunea „gxg4! — iei şi al doilea
--   pion", deşi mutarea nu captura nimic: era o împingere, iar pionul se
--   pierdea la mutarea următoare.
--
-- · Dragon — sănătoasă (−0,40), dar se oprea în mijlocul unui schimb: ultima
--   mutare era 10.Cxc6, iar cursantul rămânea cu o piesă în minus şi fără să
--   i se spună că trebuie să reia. Se adaugă reluarea, 10...bxc6, care e şi
--   alegerea motorului.
-- ============================================================

-- ------------------------------------------------------------
-- A · Najdorf — mutările rămân, textele se curăţă
-- ------------------------------------------------------------
update public.opening_lines l
   set move_explanations = l.move_explanations || '{
  "11": "e5 — câştigi spaţiu şi alungi calul din centru. Preţul e câmpul d5, care rămâne slab; contra-jocul tău trebuie să fie destul de rapid cât să nu conteze.",
  "13": "Ne7 — nebunul iese modest, dar la timp: fără el nu poţi face rocada, iar în English Attack rocada trebuie făcută înainte să înceapă albul cu g4.",
  "15": "Rocada, exact la timp. Albul urmează cu Dd2 şi rocadă lungă, apoi împinge pionii spre tine — cu regele încă în centru, aia ar fi de nejucat.",
  "17": "Cc6 — ultima piesă în joc. De acum ai toate figurile scoase şi poţi începe contra-jocul pe flancul damei, unde stă regele lui."
}'::jsonb
  from public.courses c
 where l.course_id = c.id and c.slug = 'sicilian-defense' and l.variation_code = 'A';


-- ------------------------------------------------------------
-- B · Scheveningen — coadă nouă de la mutarea 8
-- ------------------------------------------------------------
select public.repara_linie('sicilian-defense', 'B',
  'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 e7e6 g2g4 h7h6 g4g5 h6g5 c1g5 b8c6 d1d2 c6d4 d2d4');

update public.opening_lines l
   set move_explanations = '{
  "0": "Adversarul deschide cu e4.",
  "1": "c5 — Apărarea Siciliană. Nu-i copiezi mutarea; ceri o partidă asimetrică, în care amândoi jucaţi pentru câştig.",
  "2": "Adversarul joacă Cf3, pregătind d4.",
  "3": "d6 — ţii câmpul e5 sub control şi pregăteşti Cf6.",
  "4": "Adversarul deschide centrul cu d4.",
  "5": "cxd4 — schimbi pionul de flanc pe unul central. Ăsta e târgul de bază al Sicilianei: el are centrul, tu ai coloana c.",
  "6": "Adversarul reia cu calul.",
  "7": "Cf6 — ataci pionul de e4 şi te dezvolţi în aceeaşi mutare.",
  "8": "Adversarul joacă Cc3, ca să-şi apere pionul.",
  "9": "e6 — structura Scheveningen. Faţă de Najdorf, unde se joacă a6, aici ridici un zid mic şi solid pe câmpurile albe: d6 şi e6 se sprijină unul pe altul.",
  "10": "g4 — Atacul Keres. Albul porneşte pionii înainte să-şi termine dezvoltarea. E cea mai ascuţită încercare împotriva Scheveningenului şi trebuie luată în serios.",
  "11": "h6 — pui o piedică în calea lui g5. Nu-l opreşti, dar îl obligi să se hotărască: ori împinge şi schimbă, ori pierde timpul.",
  "12": "Adversarul împinge oricum g5, ca să-ţi alunge calul de pe f6.",
  "13": "hxg5 — iei. Nu de lăcomie: dacă laşi pionul acolo, calul de pe f6 e alungat şi rămâi fără cel mai bun apărător al regelui.",
  "14": "Nxg5 — albul îşi ia pionul înapoi cu nebunul. Materialul e din nou egal, dar coloana h ţi-a rămas deschisă, iar turnul tău e deja pe ea.",
  "15": "Cc6 — aduci ultima piesă uşoară şi ataci calul din centru.",
  "16": "Adversarul îşi leagă piesele cu Dd2.",
  "17": "Cxd4 — schimbi calul care ţinea centrul. Cu cât se schimbă mai multe piese, cu atât atacul lui de pe flanc are mai puţin cu ce să lovească.",
  "18": "Adversarul reia cu dama şi ajungeţi într-o poziţie de joc: el are spaţiu pe flancul regelui, tu ai coloana c şi coloana h."
}'::jsonb
  from public.courses c
 where l.course_id = c.id and c.slug = 'sicilian-defense' and l.variation_code = 'B';


-- ------------------------------------------------------------
-- C · Dragon — se adaugă reluarea care lipsea
-- ------------------------------------------------------------
select public.repara_linie('sicilian-defense', 'C',
  'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 g7g6 c1e3 f8g7 d1d2 e8g8 e1c1 b8c6 f2f3 d6d5 d4c6 b7c6');

update public.opening_lines l
   set move_explanations = l.move_explanations || '{
  "17": "d5 — spargerea din inima Dragonului. Pare că-ţi dai centrul, dar în schimb îţi deschizi diagonala nebunului de g7 şi coloana c, adică exact drumurile spre regele lui.",
  "18": "Adversarul schimbă pe c6 ca să-ţi ia apărătorul şi să te oblige să strici structura.",
  "19": "bxc6 — reiei cu pionul de pe b7. Pionii de pe c rămân dublaţi, dar coloana b ţi se deschide spre regele lui, iar el a făcut rocada tocmai acolo. În Dragon, structura se dă pe drumuri de atac."
}'::jsonb
  from public.courses c
 where l.course_id = c.id and c.slug = 'sicilian-defense' and l.variation_code = 'C';
