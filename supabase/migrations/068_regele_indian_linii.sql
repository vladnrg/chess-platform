-- ============================================================
-- Apărarea Regelui Indian: liniile, rescrise de la zero
-- ============================================================
-- Cursul nu era subţire, era stricat, şi într-un fel pe care numărătoarea de
-- explicaţii nu-l vedea: textele erau decalate cu o semimutare faţă de mutările
-- pe care le însoţeau.
--
-- În Varianta Clasică, de la mutarea a treia încolo, sub 3.Cc3 scria explicaţia
-- lui Ng7, sub 3...Ng7 scria explicaţia lui e4, şi tot aşa până la capătul
-- liniei. Cursantul citea, la fiecare pas, descrierea altei mutări decât cea de
-- pe tablă. La fel în Sämisch, de la mutarea a patra.
--
-- Un text păstrase şi o poticnire de generare, netăiată de nimeni:
--   „g6 — pregăteşti fianchetto-ul! Nb7... wait Ng7. KID se bazează pe Ng7."
--
-- Fiindcă alinierea era greşită oriunde conta, textele nu se puteau muta cu o
-- poziţie şi gata — cele de la coadă lipseau cu totul, iar cele existente erau
-- scrise în stilul cu majuscule şi semne de exclamare pe care l-am scos din
-- restul cursurilor. Sunt scrise din nou, toate.
--
-- Şi o mutare era greşită. În Atacul cu Patru Pioni se juca 8.Nd3; linia
-- principală e 8.Ne2. Diferenţa nu e de gust: cu nebunul pe d3, 10.e5 îl costă
-- pe alb 1,93, iar linia se încheia la +1,59 pentru negru — adică lecţia îl
-- învăţa pe cursant o variantă care „merge" doar fiindcă adversarul greşeşte.
-- Cu 8.Ne2 se încheie la −0,34, ceea ce e normal pentru o deschidere în care
-- negrul cedează centrul la început. Linia merge acum până la 11...Cg4, ca să
-- se vadă şi răspunsul la ruptura din centru, şi se termină cu mutarea
-- negrului, ca celelalte două.
-- ============================================================


-- ------------------------------------------------------------
-- A · Varianta Clasică — Ce1, Cd3
-- ------------------------------------------------------------
select public.seed_line_text('kings-indian-defense', 'A',
  'd2d4 g8f6 c2c4 g7g6 b1c3 f8g7 e2e4 d7d6 g1f3 e8g8 f1e2 e7e5 e1g1 b8c6 d4d5 c6e7 f3e1 f6d7 e1d3 f7f5',
  '{
  "0": "Adversarul deschide cu d4. E cealaltă mare deschidere, în afară de e4, şi duce la partide mai lente, în care se joacă mai mult pe structură decât pe lovituri directe.",
  "1": "Cf6 — calul iese şi ţine sub ochi e4, câmpul pe care albul ar vrea să-şi pună al doilea pion central. Nu-l opreşte, dar îl face să plătească pentru el.",
  "2": "c4 — al doilea pion iese în centru. Albul îşi ia spaţiu pe lat, nu doar pe înalt.",
  "3": "g6 — aici începe Apărarea Regelui Indian. Faci loc nebunului să iasă pe g7, unde va sta pe cea mai lungă diagonală de pe tablă.",
  "4": "Cc3 — calul apără c4 şi, mai important, e singurul care păzeşte câmpul e4. Ţine minte asta; peste o mutare va conta.",
  "5": "Ng7 — nebunul se aşază pe diagonala h8-a1. De acolo se uită la tot centrul şi mai departe, până în colţul advers. E piesa în jurul căreia se învârte toată deschiderea.",
  "6": "e4 — al treilea pion central. Albul are acum c4, d4 şi e4, adică exact ce şi-a dorit: un centru mare. Îl laşi să-l aibă, fiindcă un centru mare e şi o ţintă mare.",
  "7": "d6 — un pion modest, care pregăteşte lucrul important: e5. Fără d6, pionul de pe e5 n-ar avea cine să-l sprijine.",
  "8": "Cf3 — calul iese pe câmpul lui firesc şi apără d4, punctul pe care îl vei ataca.",
  "9": "Rocada scurtă. Regele se pune la adăpost înainte să se deschidă ceva, iar turnul ajunge pe f8 — exact coloana pe care se va juca partida ta.",
  "10": "Ne2 — un nebun aşezat modest. Nu arată agresiv, dar apără calul de pe f3 şi lasă albul să facă rocada.",
  "11": "e5 — prima lovitură. Ataci pionul de d4 şi îl pui pe alb să aleagă: îl schimbă, îl apără, sau îl împinge mai departe. Fiecare alegere îi schimbă complet planul.",
  "12": "Rocada albului. Îşi pune şi el regele la adăpost înainte de încleştare.",
  "13": "Cc6 — a doua lovitură pe acelaşi punct. Acum d4 e atacat de două ori, de pionul de pe e5 şi de cal, iar albul nu mai poate amâna.",
  "14": "d5 — albul alege să împingă. Câştigă spaţiu şi închide centrul, dar plăteşte pentru asta: un centru închis nu se mai mişcă, iar de acum înainte fiecare joacă pe câte o parte a tablei. Calul tău de pe c6 e lovit de pion şi trebuie să plece.",
  "15": "Ce7 — calul se retrage, dar nu oriunde. De pe e7 sprijină f5, mutarea către care se îndreaptă tot jocul tău, şi nu stă în calea nimănui.",
  "16": "Ce1 — o mutare care arată ciudat, un cal care se întoarce acasă. Albul îl mută ca să-şi elibereze pionul de pe f şi ca să ducă apoi calul pe d3, de unde va sprijini avansul pe flancul damei.",
  "17": "Cd7 — te retragi şi tu, din acelaşi motiv: calul de pe f6 stătea în faţa pionului tău de pe f, iar acela trebuie să plece la drum. De pe d7 calul sprijină în plus c5 şi e5.",
  "18": "Cd3 — calul alb ajunge unde voia. De acolo priveşte spre c5 şi spre f4, şi sprijină împingerea c5 a albului.",
  "19": "f5 — lovitura pentru care s-a pregătit totul. Ataci centrul alb din partea în care eşti mai tare, iar turnul tău de pe f8 stă deja în spatele pionului. De aici încolo se joacă în două locuri deodată: tu la regele lui, el la dama ta. Câştigă cine ajunge primul."
}'::jsonb);


-- ------------------------------------------------------------
-- B · Atacul cu Patru Pioni — mutarea 8 corectată
-- ------------------------------------------------------------
select public.seed_line_text('kings-indian-defense', 'B',
  'd2d4 g8f6 c2c4 g7g6 b1c3 f8g7 e2e4 d7d6 f2f4 e8g8 g1f3 c7c5 d4d5 e7e6 f1e2 e6d5 c4d5 f8e8 e4e5 d6e5 f4e5 f6g4',
  '{
  "0": "Adversarul deschide cu d4.",
  "1": "Cf6 — calul iese şi ţine ochii pe e4.",
  "2": "c4 — al doilea pion central.",
  "3": "g6 — pregăteşti fianchetto-ul, adică nebunul pe g7. Joci la fel indiferent ce alege albul; abia peste câteva mutări se va vedea în ce variantă ai intrat.",
  "4": "Cc3 — calul apără e4.",
  "5": "Ng7 — nebunul pe diagonala lungă.",
  "6": "e4 — al treilea pion central.",
  "7": "d6 — sprijini viitorul e5 sau c5.",
  "8": "f4 — al patrulea pion. De aici numele variantei. Albul ridică un zid de pioni cum nu vezi în alte deschideri, şi asta e şi tăria, şi slăbiciunea lui: un pion împins nu se mai poate întoarce, iar patru pioni împinşi lasă în urmă multe câmpuri goale.",
  "9": "Rocada. Cu atâţia pioni albi în mişcare, primul lucru de făcut e să-ţi duci regele departe de centru.",
  "10": "Cf3 — albul îşi termină dezvoltarea şi apără d4.",
  "11": "c5 — loveşti zidul de jos, nu din faţă. Ataci pionul de d4, care e temelia întregii construcţii: dacă el cade, ceilalţi trei rămân în aer.",
  "12": "d5 — albul împinge mai departe, în loc să schimbe. Câştigă spaţiu, dar acum pionul lui de d5 e înfipt adânc şi are nevoie de pază.",
  "13": "e6 — a doua lovitură, din cealaltă parte. Ataci pionul avansat de la rădăcină. Albul nu-l poate ţine cu pioni la nesfârşit.",
  "14": "Ne2 — nebunul iese modest, dar la timp. Albul îşi termină dezvoltarea ca să poată face rocada înainte să se deschidă centrul.",
  "15": "exd5 — deschizi tu socoteala. Schimbi pionii în centru fiindcă, atunci când o poziţie se deschide, câştigă cel care are piesele mai bine aşezate — iar nebunul tău de pe g7 aşteaptă de şase mutări exact momentul ăsta.",
  "16": "cxd5 — albul reia cu pionul de pe c. Trebuie: dacă ar lua cu ceva ce apără d4, s-ar prăbuşi tot.",
  "17": "Te8 — turnul intră pe coloana e, care tocmai s-a deschis, şi se uită drept la pionul de e4. Nu l-ai mutat pe câmpul ăsta întâmplător: e liber tocmai fiindcă pionul tău de pe e6 a plecat la schimb.",
  "18": "e5 — albul îşi joacă cartea. Împinge ca să-ţi alunge calul de pe f6 şi să-şi deschidă drum spre regele tău. E mutarea critică a întregii variante.",
  "19": "dxe5 — iei pionul. Nu-l laşi să treacă mai departe şi îi desfaci lanţul.",
  "20": "fxe5 — albul reia cu pionul de pe f şi îşi reface vârful de lance pe e5. Observă ce s-a schimbat: coloana f i s-a deschis lui, nu ţie, iar zidul de patru pioni s-a subţiat la doi.",
  "21": "Cg4 — calul nu se retrage, ci sare înainte. De pe g4 loveşte pionul de e5 şi ameninţă să ajungă pe e3 sau pe f2. Poziţia e ascuţită şi asta e în regula ei: cine împinge patru pioni trebuie să accepte că partida se decide repede."
}'::jsonb);


-- ------------------------------------------------------------
-- C · Varianta Sämisch — f3, Ne3
-- ------------------------------------------------------------
select public.seed_line_text('kings-indian-defense', 'C',
  'd2d4 g8f6 c2c4 g7g6 b1c3 f8g7 e2e4 d7d6 f2f3 e8g8 c1e3 c7c5 d4d5 e7e6 d1d2 e6d5 c4d5 f8e8 g1e2 b8a6',
  '{
  "0": "Adversarul deschide cu d4.",
  "1": "Cf6 — calul iese primul.",
  "2": "c4 — al doilea pion central.",
  "3": "g6 — pregăteşti nebunul pentru g7.",
  "4": "Cc3 — calul apără e4.",
  "5": "Ng7 — nebunul pe diagonala lungă, îndreptat spre centru şi mai departe.",
  "6": "e4 — centrul mare al albului e gata.",
  "7": "d6 — sprijini rupturile care vin, e5 sau c5.",
  "8": "f3 — Varianta Sämisch. Un pion pus în spatele altuia, ceea ce pare încet, dar face două lucruri: apără e4 cu ceva ieftin, ca să elibereze piesele, şi îţi taie calului câmpul g4. Mai ales, pregăteşte g4 şi h4 — albul vrea să-ţi vină cu pionii peste rege.",
  "9": "Rocada. Da, ştii că vine atacul cu pioni acolo. Îl faci oricum, fiindcă în centru regele ar sta şi mai rău, iar tu vei fi mai rapid pe partea cealaltă.",
  "10": "Ne3 — nebunul iese pe câmpul rămas liber după f3 şi apără d4.",
  "11": "c5 — nu aştepţi atacul, îl începi pe al tău. Loveşti d4, adică temelia centrului, şi muţi partida pe flancul unde albul nu s-a pregătit.",
  "12": "d5 — albul închide centrul. Bine pentru el în privinţa spaţiului, dar de acum tabla e împărţită în două şi fiecare are voie să atace numai pe partea lui. Se joacă pe viteză.",
  "13": "e6 — ataci pionul înfipt pe d5 de dedesubt, cu un pion. E cel mai ieftin fel de a-l lovi: dacă schimbă, îi deschizi coloana e; dacă nu, rămâne cu o grijă permanentă.",
  "14": "Dd2 — dama se aşază lângă nebun, gata de rocada lungă şi de atacul cu h4-h5.",
  "15": "exd5 — schimbi acum, cât albul nu şi-a scos încă toate piesele.",
  "16": "cxd5 — albul reia cu pionul de pe c, singura reluare care nu-i strică centrul.",
  "17": "Te8 — turnul ocupă coloana pe care tocmai ai deschis-o şi se uită la pionul de e4.",
  "18": "Cge2 — calul iese pe e2, nu pe f3, fiindcă f3 e ocupat de propriul pion. E preţul pe care albul îl plăteşte pentru Sämisch: calul stă mai prost.",
  "19": "Ca6 — calul pe margine, ceea ce de obicei e greşit, dar aici nu: de pe a6 merge la c7, de unde sprijină b5, sau la b4, unde stă la nasul damei. Ai un drum limpede pe flancul damei, iar albul are unul pe flancul regelui. Cine ajunge primul are dreptate."
}'::jsonb);
