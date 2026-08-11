-- ============================================================
-- Franceza şi Siciliana: cele două variante rămase neterminate
-- ============================================================
-- Amândouă cursurile treceau drept gata, dar fiecare avea câte o variantă
-- căreia îi lipseau explicaţii: Franceza A avea 18 din 19, Siciliana C avea 16
-- din 20.
--
-- La Franceza A lipsea o singură mutare, ultima, şi atât s-a adăugat.
--
-- La Siciliana C lipseau patru, toate mutări ale albului de la începutul
-- deschiderii, dar problema era mai mare de-atât: textele care existau erau
-- scrise în stilul vechi, cu semne de exclamare şi cu englezisme rămase
-- netraduse — „Dragon setup", „Yugoslav Attack!", „Viteză maximă!". Fiindcă
-- oricum trebuia completată, varianta e adusă la acelaşi fel de scriere ca
-- restul cursurilor. Explicaţiile bune de la coadă — cele despre d5 şi bxc6 —
-- au fost păstrate aproape neatinse, fiindcă erau deja corecte şi limpezi.
--
-- Liniile n-au fost schimbate în niciunul din cazuri.
-- ============================================================


-- ------------------------------------------------------------
-- Franceza A · Winawer — explicaţia care lipsea
-- ------------------------------------------------------------
update public.opening_lines l
   set move_explanations = jsonb_set(l.move_explanations, '{18}', to_jsonb(
       'Ce2 — calul iese pe e2, nu pe f3, şi merită înţeles de ce: pe f3 ar sta în calea pionului de f2, cu care albul vrea să înainteze. De pe e2 face două lucruri deodată — atacă pionul tău de pe d4 şi apără pionul dublat de pe c3. Aici se încheie deschiderea, cu una dintre cele mai ciudate poziţii din şah. Socoteala, numărată pe tablă: albul are un pion în plus şi amândoi nebunii, fiindcă pe al tău de câmpuri negre l-ai dat pe cal la mutarea a cincea. În schimb pionii lui de pe c sunt dublaţi, regele lui e încă în centru şi n-are cum să facă rocada curând, dama i-a plecat de tot în colţul tău, iar tu ai un pion înfipt pe d4 şi coloana g deschisă, cu turnul deja pe ea. Nimeni nu stă „mai bine"; stă fiecare cum a ales, şi de aceea Winawer se joacă până azi.'::text))
  from public.courses c
 where l.course_id = c.id and c.slug = 'french-defense' and l.variation_code = 'A';


-- ------------------------------------------------------------
-- Siciliana C · Dragon — rescrisă
-- ------------------------------------------------------------
select public.seed_line_text('sicilian-defense', 'C',
  'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 g7g6 c1e3 f8g7 d1d2 e8g8 e1c1 b8c6 f2f3 d6d5 d4c6 b7c6',
  '{
  "0": "Adversarul deschide cu e4.",
  "1": "c5 — Apărarea Siciliană. Nu-i răspunzi în oglindă cu e5, ci ataci centrul din lateral. Aşa poziţia iese nesimetrică din prima mutare, iar partidele nesimetrice se termină rar remiză.",
  "2": "Cf3 — albul se dezvoltă şi pregăteşte d4, singura împingere care îi deschide jocul.",
  "3": "d6 — un pion mic, cu două rosturi: ţine câmpul e5 şi face loc pentru g6 şi nebunul de pe g7.",
  "4": "d4 — albul deschide centrul. Trebuie s-o facă: dacă amână, tu joci Cf6 şi d5 şi rămâne fără avantaj.",
  "5": "cxd4 — schimbi. Dai un pion lateral pe unul central, ceea ce e o afacere bună, şi îţi deschizi coloana c pentru turn — chiar coloana pe care albul îşi va duce regele.",
  "6": "Cxd4 — albul reia cu calul. Are acum o piesă în mijlocul tablei, dar tu ai un pion în plus în centru şi o coloană deschisă.",
  "7": "Cf6 — te dezvolţi şi ataci pionul de e4, obligându-l să se apere.",
  "8": "Cc3 — îl apără cu calul. Aici e Siciliana deschisă, poziţia din care pornesc jumătate dintre variantele ei.",
  "9": "g6 — aici începe Dragonul. Îţi pregăteşti nebunul pentru g7, pe diagonala lungă, de unde va privi prin tot centrul până în colţul advers. Numele vine de la felul cum arată pionii tăi pe tablă.",
  "10": "Ne3 — albul începe Atacul Iugoslav, cel mai ascuţit răspuns la Dragon. Reţeta lui are cinci mutări şi un singur scop: nebunul pe e3, dama pe d2, pionul pe f3, rocada lungă, apoi pionii peste regele tău.",
  "11": "Ng7 — nebunul Dragonului, pus pe diagonala care contează. Deocamdată nu vede până la d4: propriul tău cal de pe f6 îi stă în drum. De aceea, în Dragon, mutarea calului de pe f6 nu e doar o mutare de cal — e clipa în care nebunul începe să existe.",
  "12": "Dd2 — dama se aşază lângă nebun şi pregăteşte rocada lungă. Amândoi ştiţi deja ce urmează.",
  "13": "Rocada scurtă. Îţi pui regele exact acolo unde el îşi va trimite pionii, şi o faci fără ezitare: în Dragon nu se câştigă stând, ci ajungând primul.",
  "14": "Rocada lungă a albului. Acum regii stau în părţi opuse, ceea ce schimbă totul: fiecare atac cu pioni nu-şi mai slăbeşte propriul rege, aşa că amândoi puteţi împinge fără grijă. De aici încolo se numără mutările.",
  "15": "Cc6 — calul iese cu presiune pe d4 şi pregăteşte ruptura din centru. Nu e o mutare de dezvoltare, e o mutare de atac.",
  "16": "f3 — albul îşi sprijină pionul de e4 cu unul ieftin şi pregăteşte g4 şi h4.",
  "17": "d5 — spargerea din inima Dragonului. Pare că-ţi dai centrul, dar în schimb îţi deschizi diagonala nebunului de g7 şi coloana c, adică exact drumurile spre regele lui.",
  "18": "Cxc6 — albul îţi ia calul, ca să scape de apărătorul rupturii şi ca să te oblige să-ţi strici structura de pioni.",
  "19": "bxc6 — reiei cu pionul de pe b7, nu cu cel de pe d7, şi asta e alegerea care încheie deschiderea. Uită-te ce se schimbă: coloana b rămâne fără niciun pion de-al tău, iar turnul de pe a8 ajunge pe b8 dintr-o singură mutare — cu regele alb pe c1, adică la o coloană distanţă. Pionul mutat pe c6 nu-ţi strică nimic, ba chiar îţi sprijină pionul de d5. În Dragon aşa se socoteşte: nu te uiţi dacă pionii arată frumos, ci dacă îţi deschid drumul spre regele advers."
}'::jsonb);
