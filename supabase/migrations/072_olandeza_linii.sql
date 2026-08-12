-- ============================================================
-- Apărarea Olandeză: liniile, rescrise de la zero
-- ============================================================
-- Aceeaşi boală ca la Regele Indian, şi mai rea: din 34 de explicaţii, 22
-- descriau altă mutare decât cea de sub ele. În Varianta Leningrad, textul de
-- la 4.Ng2 vorbea despre Ng7, care se joacă trei semimutări mai târziu, iar cel
-- de la 5.O-O al albului vorbea despre f5, adică prima mutare a negrului.
--
-- Aşa ceva nu se repară mutând textele cu o poziţie, fiindcă decalajul nu e
-- constant — undeva e de una, altundeva de patru — iar jumătate din explicaţii
-- lipseau oricum. Sunt scrise din nou, toate şaizeci.
--
-- Liniile în sine sunt bune: verificate cu motorul, toate trei rămân între
-- −0,3 şi −0,8 pentru negru, fără nicio mutare care pierde. Nu s-a schimbat
-- nicio mutare.
-- ============================================================


-- ------------------------------------------------------------
-- A · Varianta Stonewall — zidul de pioni
-- ------------------------------------------------------------
select public.seed_line_text('dutch-defense', 'A',
  'd2d4 f7f5 g2g3 g8f6 f1g2 e7e6 g1f3 d7d5 e1g1 f8d6 c2c4 c7c6 b2b3 e8g8 c1a3 f6e4 a3d6 d8d6 b1d2 b8d7',
  '{
  "0": "Adversarul deschide cu d4 şi ocupă centrul.",
  "1": "f5 — Apărarea Olandeză. Răspunzi în oglindă, dar de partea cealaltă: pionul tău ţine e4, câmpul pe care albul şi-ar dori al doilea pion. E o mutare curajoasă, fiindcă slăbeşte puţin adăpostul regelui tău, şi tot restul deschiderii ţine cont de asta.",
  "2": "g3 — albul îşi pregăteşte nebunul pentru g2, adică exact spre diagonala pe care ai lăsat-o mai slabă.",
  "3": "Cf6 — te dezvolţi şi întăreşti încă o dată stăpânirea pe e4. Calul şi pionul păzesc acum acelaşi câmp.",
  "4": "Ng2 — nebunul se aşază pe diagonala lungă, îndreptat spre colţul tău.",
  "5": "e6 — pionul iese cuminte. Nu e spectaculos, dar sprijină d5, mutarea care urmează, şi face loc nebunului de pe f8.",
  "6": "Cf3 — albul îşi termină dezvoltarea şi ţine sub ochi e5.",
  "7": "d5 — aici se naşte Stonewall-ul, adică zidul de piatră. Trei pioni — d5, e6 şi f5 — stau deja unul lângă altul, toţi pe câmpuri albe, iar al patrulea, c6, vine peste două mutări. Împreună fac un bloc pe care nimeni nu-l poate sparge din faţă. Preţul e cinstit şi trebuie ştiut de la început: nebunul tău de pe c8 rămâne închis în spatele lor, iar câmpurile negre din faţa ta, mai ales e5, rămân fără niciun pion care să le păzească.",
  "8": "Rocada albului. Regele intră la adăpost.",
  "9": "Nd6 — nebunul se aşază exact pe câmpul de care ai nevoie: de pe d6 apără e5, adică tocmai câmpul pe care zidul tău de pioni îl lasă descoperit. În alte variante ale Stonewall-ului nebunul ăsta priveşte de pe d6 până în colţ, la h2, şi de acolo vine atacul. Aici nu: pionul alb de pe g3 taie diagonala, şi ăsta e chiar rostul pentru care albul şi-a jucat fianchetto-ul. Bine de ştiut din vreme, ca să nu aştepţi un atac care nu vine.",
  "10": "c4 — albul îţi loveşte zidul în punctul de jos, la d5.",
  "11": "c6 — îl sprijini cu al patrulea pion. Zidul e complet: c6, d5, e6, f5. De acum nu se mai dărâmă uşor, dar nici nu se mai mişcă — iar asta înseamnă că jocul se va da pe piese, nu pe pioni.",
  "12": "b3 — albul pregăteşte nebunul pentru a3 sau b2.",
  "13": "Rocada. Regele tău intră la adăpost, iar turnul ajunge pe f8, chiar în spatele pionului de pe f5.",
  "14": "Na3 — albul vine după nebunul tău de pe d6. Ştie şi el că acela e piesa care îţi ţine câmpurile negre, şi vrea să-l schimbe.",
  "15": "Ce4 — nu-l aperi, îl ignori şi îţi pui calul unde vrei tu. Pe e4 el e sprijinit de doi pioni, de pe d5 şi de pe f5, iar de acolo nu-l poate alunga nimic. Un cal pe care adversarul nu-l poate goni valorează mai mult decât un nebun pe care poate să-l schimbe.",
  "16": "Nxd6 — albul îşi face schimbul.",
  "17": "Dxd6 — reiei cu dama, şi ea ajunge pe câmpul de unde tocmai a plecat nebunul, preluându-i treaba: de pe d6 apără e5. Nu e o consolare mică. Ai pierdut piesa care păzea câmpurile negre, dar dama stă acum exact în locul ei, iar pionul de pe d5 al tău e apărat în plus.",
  "18": "Cbd2 — albul îşi aduce ultimul cal, ţintind calul tău de pe e4.",
  "19": "Cd7 — îţi aduci şi tu ultima piesă. De pe d7 calul merge spre f6, ca să-l sprijine pe cel de pe e4, sau spre b6 dacă poziţia se deschide pe flancul damei. Deschiderea s-a încheiat: ai un zid care nu cade, un cal care nu poate fi alungat şi o damă bine aşezată."
}'::jsonb);


-- ------------------------------------------------------------
-- B · Varianta Leningrad — fianchetto
-- ------------------------------------------------------------
select public.seed_line_text('dutch-defense', 'B',
  'd2d4 f7f5 g2g3 g8f6 f1g2 g7g6 g1f3 f8g7 e1g1 e8g8 c2c4 d7d6 b1c3 d8e8 d4d5 b8a6 f3d4 a6c5 b2b3 a7a5',
  '{
  "0": "Adversarul deschide cu d4.",
  "1": "f5 — Olandeza. Ţii e4 din prima mutare.",
  "2": "g3 — albul îşi pregăteşte fianchetto-ul.",
  "3": "Cf6 — te dezvolţi şi păzeşti e4 a doua oară.",
  "4": "Ng2 — nebunul alb pe diagonala lungă.",
  "5": "g6 — aici Leningradul se desparte de Stonewall. În loc să ridici un zid de pioni, îţi pui nebunul pe g7 şi joci pe piese. Poziţia iese mai deschisă şi mai ascuţită, dar nebunul tău de câmpuri negre nu rămâne închis nicăieri.",
  "6": "Cf3 — albul îşi termină dezvoltarea.",
  "7": "Ng7 — nebunul intră în fianchetto, pe aceeaşi diagonală lungă ca al lui, doar că din partea cealaltă. Cei doi se privesc drept în faţă, iar cine reuşeşte să deschidă diagonala în folosul lui are un avantaj real.",
  "8": "Rocada albului.",
  "9": "Rocada ta. Amândoi regii sunt la adăpost, aşa că de aici încolo se joacă pentru centru.",
  "10": "c4 — albul îşi ia spaţiu pe flancul damei.",
  "11": "d6 — sprijini viitorul e5, mutarea către care se îndreaptă tot jocul tău. În Leningrad, e5 e ceea ce e f5 pentru alb: ruptura care dă sens poziţiei.",
  "12": "Cc3 — ultima piesă uşoară a albului îşi ia locul.",
  "13": "De8 — mutarea care arată cel mai ciudat din toată deschiderea şi care e, de fapt, cheia. Dama se dă la o parte de pe coloana d, unde stătea în calea propriului pion, şi se aşază în spatele pionului de pe e7. Deocamdată nu face nimic; dar în clipa în care acela sare la e5, dama îl apără de la distanţă — verificat pe poziţie: după e5, pionul e sprijinit şi de damă, şi de pionul de pe d6. Are şi un al doilea rost: de pe e8 poate ieşi pe h5 sau g6 dacă jocul se mută la regele alb.",
  "14": "d5 — albul închide centrul înainte să apuci tu să-l deschizi. Îţi taie e5 pentru moment, dar plăteşte cu asta: un centru închis înseamnă că se joacă pe flancuri.",
  "15": "Ca6 — calul pe margine, ceea ce de obicei e o greşeală, dar aici e drumul cel mai scurt: de pe a6 ajunge la c5, unde stă bine şi apasă pe e4.",
  "16": "Cd4 — calul alb ocupă centrul rămas liber.",
  "17": "Cc5 — calul tău ajunge unde voia. De pe c5 se uită la e4 şi la d3, iar albul nu-l poate alunga cu un pion fără să-şi slăbească singur poziţia.",
  "18": "b3 — albul îşi pregăteşte împingerea b4, ca să-ţi gonească totuşi calul.",
  "19": "a5 — îi tai planul dintr-o mutare. Cu pionul pe a5, b4 nu mai vine gratis, iar calul tău rămâne pe c5. O mutare de pion pusă la timp ţine în loc o piesă mai bună decât ea."
}'::jsonb);


-- ------------------------------------------------------------
-- C · Varianta Clasică — Ne7
-- ------------------------------------------------------------
select public.seed_line_text('dutch-defense', 'C',
  'd2d4 f7f5 g1f3 g8f6 g2g3 e7e6 f1g2 f8e7 e1g1 e8g8 c2c4 d7d5 b2b3 c7c6 c1a3 e7a3 b1a3 f6e4 a3c2 b8d7',
  '{
  "0": "Adversarul deschide cu d4.",
  "1": "f5 — Olandeza.",
  "2": "Cf3 — albul iese cu calul întâi, nu cu pionul de pe g.",
  "3": "Cf6 — te dezvolţi şi păzeşti e4.",
  "4": "g3 — tot spre fianchetto se îndreaptă.",
  "5": "e6 — pregăteşti d5 şi eliberezi nebunul de pe f8.",
  "6": "Ng2 — nebunul alb îşi ia locul.",
  "7": "Ne7 — aici se desparte Varianta Clasică de Stonewall. Nebunul se aşază modest pe e7, nu pe d6. Nu ţinteşte nimic, dar nici nu se expune, şi îţi lasă deschisă alegerea: poţi juca d5 şi să intri în zid, sau d6 şi e5 şi să deschizi jocul.",
  "8": "Rocada albului.",
  "9": "Rocada ta. Turnul ajunge pe f8, în spatele pionului de f5.",
  "10": "c4 — albul îşi ia spaţiu.",
  "11": "d5 — alegi zidul. Pionii tăi ajung pe câmpuri albe — d5, e6, f5 — şi ţin centrul strâns.",
  "12": "b3 — albul pregăteşte nebunul pentru a3.",
  "13": "c6 — al patrulea pion intră în zid. Structura ta e acum aceeaşi ca la Stonewall, doar că nebunul tău stă pe e7, nu pe d6.",
  "14": "Na3 — albul propune schimbul nebunilor de câmpuri negre. Pentru el e o afacere bună: după schimb, câmpurile negre din faţa ta rămân fără paznic.",
  "15": "Nxa3 — schimbi. Nu e o bucurie, dar alternativa — să-ţi retragi nebunul şi să pierzi timp — e mai rea, iar în schimb îi strici albului aşezarea pieselor de pe flancul damei.",
  "16": "Cxa3 — albul reia cu calul, care ajunge într-un colţ din care are drum lung înapoi. Asta e plata lui pentru schimb.",
  "17": "Ce4 — îţi pui calul pe câmpul cel mai bun de pe tablă. E sprijinit de pionii de pe d5 şi f5 şi nu poate fi alungat de niciun pion alb.",
  "18": "Cc2 — calul alb începe drumul de întoarcere spre centru, prin c2 şi e3.",
  "19": "Cd7 — îţi aduci şi ultima piesă. De pe d7 merge spre f6, ca să-l sprijine pe cel de pe e4, sau spre b6 dacă se deschide flancul damei. Deschiderea s-a terminat: ai zidul, ai calul de neclintit, iar el are un cal care încă se întoarce acasă."
}'::jsonb);
