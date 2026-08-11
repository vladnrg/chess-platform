-- ============================================================
-- Restul cursurilor de alb: liniile rescrise
-- ============================================================
-- Douăzeci de variante din şapte cursuri — Ruy Lopez, Gambitul Damei,
-- Gambitul Regelui, Atacul Regelui Indian, Catalana, Colle şi Londra. În total
-- 381 de explicaţii scrise din nou. Înainte erau între 9 şi 16 pe variantă,
-- adică jumătate din câte trebuiau, iar majoritatea celor care existau
-- descriau altă mutare decât cea de sub ele.
--
-- Liniile n-au fost schimbate niciuna. Verificate toate douăzeci cu motorul:
-- legale de la cap la coadă, se încheie între −0,27 şi +0,64 pentru alb, fără
-- nicio cădere mare. Spre deosebire de Italiana şi Engleza, unde patru linii
-- din şase erau stricate, aici problema era numai textul.
--
-- Londra A nu e atinsă. E singura variantă din tot catalogul de alb care avea
-- deja explicaţii la fiecare semimutare, toate potrivite cu mutarea lor. Nu se
-- rescrie ce e bun.
--
-- Două lucruri de ştiut, fiindcă se văd în lecţii:
--   · varianta C din Gambitul Damei e aceeaşi poziţie cu varianta A din
--     Apărarea Slavă, doar văzută din partea cealaltă a tablei. Cine le
--     parcurge pe amândouă vede acelaşi joc explicat de ambele părţi;
--   · KIA, Catalana, Colle şi Londra sunt sisteme, nu variante: joci aceleaşi
--     mutări indiferent ce face adversarul. Sunt potrivite pentru cine nu vrea
--     teorie pe de rost, dar mai greu de jucat bine, fiindcă nu poziţia îţi
--     spune ce să faci, ci planul.
-- ============================================================


-- ############################################################
-- Ruy Lopez, Gambitul Damei, Gambitul Regelui
-- ############################################################

select public.seed_line_text('ruy-lopez', 'A',
  'e2e4 e7e5 g1f3 b8c6 f1b5 g8f6 e1g1 f6e4 d2d4 e4d6 b5c6 d7c6 d4e5 d6f5 d1d8 e8d8 b1c3 h7h6 h2h3 c8d7',
  '{
  "0": "e4 — deschizi cu pionul de rege.",
  "1": "e5 — adversarul răspunde simetric.",
  "2": "Cf3 — ataci pionul de e5 şi te dezvolţi.",
  "3": "Cc6 — îl apără cu calul.",
  "4": "Nb5 — Ruy Lopez, numită şi Spaniola, cea mai veche deschidere care se joacă şi azi la cel mai înalt nivel. Nebunul ţinteşte calul de pe c6, adică apărătorul pionului de e5. Nu ataci pionul; ataci pe cel care îl ţine.",
  "5": "Cf6 — Apărarea Berlin. În loc să se ocupe de nebunul tău, adversarul îţi loveşte pionul de e4. E cea mai solidă apărare din tot şahul şi are un renume greu: i se spune Zidul Berlinez.",
  "6": "Rocada. Îţi pui regele la adăpost şi îi laşi pionul de e4 nominal în aer — dar numai nominal, cum se vede imediat.",
  "7": "Cxe4 — adversarul îl ia. Pare că a câştigat un pion; de fapt a intrat în linia principală.",
  "8": "d4 — nu-ţi iei pionul înapoi imediat, îţi deschizi centrul. Piesa lui de pe e4 va trebui oricum să plece, iar tu câştigi între timp spaţiu.",
  "9": "Cd6 — calul se retrage şi îţi atacă nebunul de pe b5.",
  "10": "Nxc6 — schimbi nebunul pe cal. E o afacere pe care alţii ar refuza-o, dar aici are un rost precis: îi strici structura de pioni pentru tot restul partidei.",
  "11": "dxc6 — reia cu pionul de pe d. Uită-te la ce a rămas: doi pioni pe coloana c, unul peste altul, care nu se pot apăra între ei. Aia e plata lui pentru perechea de nebuni.",
  "12": "dxe5 — îţi iei pionul înapoi. Materialul e din nou egal, iar pionul tău de pe e5 stă înfipt şi îi ia calului câmpurile.",
  "13": "Cf5 — calul lui îşi caută un loc mai bun.",
  "14": "Dxd8+ — schimbi damele cu şah. Poate părea că renunţi la joc, dar aici e tocmai ideea: fără dame, structura lui stricată nu mai poate fi acoperită de niciun atac. Rămâne doar socoteala pionilor, iar aceea e în favoarea ta.",
  "15": "Rxd8 — adversarul reia cu regele şi pierde dreptul la rocadă. Regele lui va rămâne în centru toată partida.",
  "16": "Cc3 — îţi dezvolţi calul şi ţii sub ochi e4 şi d5.",
  "17": "h6 — adversarul îşi face aer şi îţi taie câmpul g5.",
  "18": "h3 — o mutare mică şi utilă: îţi faci şi tu aer şi îi tai lui câmpul g4.",
  "19": "Nd7 — adversarul îşi dezvoltă nebunul şi îşi leagă turnurile. Aşa arată Finalul Berlinez: fără dame, cu regele lui în centru şi cu pionii lui de pe c dublaţi, dar cu perechea de nebuni ca despăgubire. E o poziţie în care se joacă mult şi se câştigă greu."
}'::jsonb);

select public.seed_line_text('ruy-lopez', 'B',
  'e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 g8f6 e1g1 f8e7 f1e1 b7b5 a4b3 d7d6 c2c3 e8g8 h2h3 c6a5 b3c2 c7c5',
  '{
  "0": "e4 — deschizi în centru.",
  "1": "e5 — răspuns simetric.",
  "2": "Cf3 — ataci pionul de e5.",
  "3": "Cc6 — îl apără.",
  "4": "Nb5 — Spaniola. Ţinteşti apărătorul, nu pionul.",
  "5": "a6 — mutarea Morphy, cea mai jucată din toată deschiderea. Adversarul îţi cere să te hotărăşti cu nebunul: îl schimbi pe cal sau îl retragi.",
  "6": "Na4 — îl retragi, păstrând ţintuirea. Nebunul rămâne pe diagonala spre c6, iar peste câteva mutări va ajunge pe c2, unde priveşte drept spre regele advers.",
  "7": "Cf6 — adversarul se dezvoltă şi îţi atacă pionul de e4.",
  "8": "Rocada. Regele la adăpost.",
  "9": "Ne7 — adversarul îşi pregăteşte şi el rocada.",
  "10": "Te1 — turnul ocupă coloana e, în spatele pionului. Acum pionul de e4 chiar e apărat, iar tu ai o piesă în plus îndreptată spre centru.",
  "11": "b5 — adversarul îţi alungă nebunul a doua oară, câştigând spaţiu pe flancul damei.",
  "12": "Nb3 — nebunul se retrage pe diagonala îndreptată spre f7. E acelaşi drum de fiecare dată: nebunul e alungat, dar de fiecare dată ajunge pe un câmp mai bun.",
  "13": "d6 — adversarul îşi întăreşte pionul de e5 şi îşi eliberează nebunul de pe c8.",
  "14": "c3 — mutarea liniştită care ţine toată Spaniola Închisă. Pregăteşte d4 şi, la fel de important, îi face nebunului de pe b3 un loc de retragere pe c2.",
  "15": "Rocada adversarului.",
  "16": "h3 — pregăteşti d4 fără să-ţi permiţi Ng4. E o mutare care nu face nimic vizibil şi fără de care restul planului nu merge.",
  "17": "Ca5 — calul lui vine după nebunul tău de pe b3.",
  "18": "Nc2 — nebunul se retrage pe câmpul pregătit de la mutarea a opta. De pe c2 nu-l mai atinge nimeni şi priveşte pe diagonala lungă, drept spre h7.",
  "19": "c5 — adversarul îşi câştigă spaţiu şi îşi întăreşte flancul damei. Deschiderea s-a încheiat: ai un centru care aşteaptă d4, nebunul aşezat pe cea mai bună diagonală şi o poziţie în care se joacă zeci de mutări de manevră. Spaniola Închisă nu e o cursă, e un asediu."
}'::jsonb);

select public.seed_line_text('ruy-lopez', 'C',
  'e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 g8f6 e1g1 f6e4 d2d4 b7b5 a4b3 d7d5 d4e5 c8e6 c2c3 f8e7 c1e3',
  '{
  "0": "e4 — deschizi în centru.",
  "1": "e5 — răspuns simetric.",
  "2": "Cf3 — ataci pionul.",
  "3": "Cc6 — îl apără.",
  "4": "Nb5 — Spaniola.",
  "5": "a6 — mutarea Morphy.",
  "6": "Na4 — nebunul se retrage, păstrând ţintuirea.",
  "7": "Cf6 — adversarul se dezvoltă.",
  "8": "Rocada. Regele la adăpost, pionul de e4 lăsat aparent în aer.",
  "9": "Cxe4 — Varianta Deschisă. Adversarul chiar îl ia, şi de aici partida devine ascuţită: el are un pion în plus pentru moment, tu ai iniţiativa şi centrul.",
  "10": "d4 — deschizi centrul imediat. Nu-ţi recuperezi pionul întâi; îl pui pe el să se apere.",
  "11": "b5 — adversarul îţi alungă nebunul înainte să apuci să-l foloseşti.",
  "12": "Nb3 — nebunul pe diagonala spre f7, ca de obicei.",
  "13": "d5 — adversarul îşi sprijină calul de pe e4 cu un pion. Acum piesa aceea chiar stă bine, iar poziţia se limpezeşte.",
  "14": "dxe5 — îţi iei pionul înapoi şi îţi înfigi unul pe e5. De acolo îi taie calului de pe f6 câmpul şi îi ţine poziţia strânsă.",
  "15": "Ne6 — adversarul îşi dezvoltă nebunul şi îşi întăreşte pionul de d5.",
  "16": "c3 — mutarea de sprijin, aceeaşi ca în varianta închisă: ţine d4 şi face loc nebunului spre c2.",
  "17": "Ne7 — adversarul îşi pregăteşte rocada.",
  "18": "Ne3 — îţi dezvolţi ultimul nebun şi îl aşezi pe diagonala care duce spre a7, cu ochii pe pionul de c5 dacă va apărea. Deschiderea s-a încheiat cu material egal şi cu o poziţie în care fiecare are ceva: el are un cal foarte bine plasat pe e4, tu ai pionul înfipt pe e5 şi mai mult spaţiu. Varianta Deschisă e cea în care Spaniola devine tactică."
}'::jsonb);


-- ============================================================
-- GAMBITUL DAMEI
-- ============================================================
select public.seed_line_text('queens-gambit', 'A',
  'd2d4 d7d5 c2c4 e7e6 b1c3 g8f6 c1g5 f8e7 e2e3 e8g8 g1f3 b8d7 a1c1 c7c6 f1d3 d5c4 d3c4 f6d5 g5e7 d8e7',
  '{
  "0": "d4 — deschizi cu pionul de damă. Partidele ies mai lente decât după e4 şi se joacă mai mult pe structură.",
  "1": "d5 — adversarul îţi ţine piept în centru.",
  "2": "c4 — Gambitul Damei. Îi oferi un pion lateral ca să-l scoţi din centru. Se numeşte gambit, dar nu prea e: dacă îl ia, ţi-l iei înapoi fără probleme.",
  "3": "e6 — Gambitul Damei Respins. Adversarul nu ia pionul, îşi sprijină centrul. Preţul e că îşi închide nebunul de pe c8 în spatele propriilor pioni — şi de aici pornesc toate necazurile lui.",
  "4": "Cc3 — îţi dezvolţi calul şi apeşi a treia oară pe d5.",
  "5": "Cf6 — adversarul îşi apără pionul.",
  "6": "Ng5 — nebunul iese şi ţintuieşte calul de pe f6. Piesa aceea era unul dintre apărătorii lui d5; acum e legată de damă şi nu mai poate pleca liniştită.",
  "7": "Ne7 — adversarul rupe ţintuirea aşezând nebunul între cal şi damă.",
  "8": "e3 — un pion mic şi necesar: îţi deschizi drumul nebunului de pe f1. Nu joci e4 acum, fiindcă ţi-ar lăsa nebunul de pe g5 fără sprijin.",
  "9": "Rocada adversarului.",
  "10": "Cf3 — îţi termini dezvoltarea.",
  "11": "Cbd7 — calul lui iese pe d7, nu pe c6, unde ar sta în calea pionului de c.",
  "12": "Tc1 — turnul ocupă coloana c înainte ca ea să se deschidă. Aşa se joacă Gambitul Damei: pui piesele pe câmpurile care vor conta, nu pe cele care contează acum.",
  "13": "c6 — adversarul îşi întăreşte pionul de d5 a treia oară.",
  "14": "Nd3 — nebunul îşi ia diagonala spre h7, adică spre regele advers.",
  "15": "dxc4 — abia acum ia adversarul, şi o face cu un rost: te obligă să muţi nebunul a doua oară.",
  "16": "Nxc4 — reiei cu nebunul. Ai pierdut un tempo, dar ai câştigat coloana c şi un centru curat.",
  "17": "Cd5 — adversarul propune schimburi ca să-şi uşureze poziţia strâmtă.",
  "18": "Nxe7 — schimbi nebunii, fiindcă al tău îşi făcuse treaba, iar al lui era piesa bună.",
  "19": "Dxe7 — reia cu dama. Deschiderea s-a încheiat cu albul mai bine aşezat: coloana c e a ta, ai mai mult spaţiu, iar nebunul lui de pe c8 încă n-a mutat niciodată."
}'::jsonb);

select public.seed_line_text('queens-gambit', 'B',
  'd2d4 d7d5 c2c4 d5c4 g1f3 g8f6 e2e3 e7e6 f1c4 c7c5 e1g1 a7a6 c4b3 b8c6 b1c3 b7b5 d4d5 c6e5 f3e5',
  '{
  "0": "d4 — deschizi cu pionul de damă.",
  "1": "d5 — răspuns în centru.",
  "2": "c4 — Gambitul Damei.",
  "3": "dxc4 — Gambitul Damei Acceptat. Adversarul chiar ia pionul. Nu-l poate ţine — ai să ţi-l iei înapoi — dar în schimb ţi-a cedat centrul, şi asta e tot ce ai vrut.",
  "4": "Cf3 — te dezvolţi şi, mai important, îi tai câmpul e5 şi împingerea b5 care ar sprijini pionul furat.",
  "5": "Cf6 — adversarul se dezvoltă.",
  "6": "e3 — deschizi drumul nebunului de pe f1, cel care îşi va lua pionul înapoi.",
  "7": "e6 — adversarul îşi eliberează şi el nebunul de pe f8.",
  "8": "Nxc4 — abia acum îţi iei pionul, cu nebunul care ajunge pe cea mai bună diagonală de pe tablă, spre f7. Ai un centru mare şi o piesă activă; el are un tempo pierdut cu pionul plimbat.",
  "9": "c5 — adversarul loveşte pionul de d4, singurul fel în care poate scăpa de presiune.",
  "10": "Rocada. Regele la adăpost înainte să se deschidă centrul.",
  "11": "a6 — adversarul pregăteşte b5, ca să-ţi alunge nebunul.",
  "12": "Nb3 — îl retragi din vreme, pe câmpul unde va sta în siguranţă şi va privi în continuare spre f7.",
  "13": "Cc6 — adversarul îşi aduce calul, atacând a doua oară pionul de d4.",
  "14": "Cc3 — îţi termini dezvoltarea şi ţii d5 sub ochi.",
  "15": "b5 — adversarul îşi ia spaţiu pe flancul damei.",
  "16": "d5! — mutarea care lămureşte totul. Împingi pionul înainte în loc să-l aperi, îi tai calului de pe c6 câmpul şi îţi deschizi nebunul de pe b3 spre f7.",
  "17": "Ce5 — calul lui se retrage în centru, singurul câmp bun rămas.",
  "18": "Cxe5 — schimbi calul care apăra tot. Deschiderea s-a încheiat cu albul clar mai bine: ai un pion înfipt pe d5, coloane deschise şi piese active, iar el are pionii de pe flancul damei împinşi şi un nebun de pe c8 care încă nu vede nimic."
}'::jsonb);

select public.seed_line_text('queens-gambit', 'C',
  'd2d4 d7d5 c2c4 c7c6 g1f3 g8f6 b1c3 d5c4 a2a4 c8f5 e2e3 e7e6 f1c4 f8b4 e1g1 e8g8 d1e2 b8d7 e3e4',
  '{
  "0": "d4 — deschizi cu pionul de damă.",
  "1": "d5 — răspuns în centru.",
  "2": "c4 — Gambitul Damei.",
  "3": "c6 — Apărarea Slavă. Adversarul îşi sprijină pionul de d5 cu pionul de pe c, nu cu cel de pe e, tocmai ca să nu-şi închidă nebunul de pe c8. E cea mai bună apărare împotriva Gambitului Damei şi trebuie ştiută bine, fiindcă o vei întâlni des.",
  "4": "Cf3 — te dezvolţi şi ţii e5.",
  "5": "Cf6 — adversarul îşi apără pionul a doua oară.",
  "6": "Cc3 — al doilea cal, tot cu ochii pe d5.",
  "7": "dxc4 — adversarul ia pionul, acum că şi-a scos caii.",
  "8": "a4! — mutarea care ţine toată varianta. Îi tai b5, adică singurul fel în care ar putea păstra pionul. Are un preţ, şi e cinstit să-l ştii: câmpul b4 rămâne pentru totdeauna o gaură în poziţia ta, iar peste patru mutări nebunul lui se va aşeza chiar acolo.",
  "9": "Nf5 — nebunul iese afară, în faţa lanţului de pioni. Asta a fost toată ideea lui cu c6, şi acum se vede.",
  "10": "e3 — îţi deschizi drumul nebunului de pe f1, ca să-ţi iei pionul înapoi.",
  "11": "e6 — abia acum adversarul închide diagonala, când nebunul e deja afară.",
  "12": "Nxc4 — îţi iei pionul înapoi. Materialul e din nou egal.",
  "13": "Nb4 — nebunul lui se aşază în gaura pe care ai făcut-o cu a4 şi îţi ţintuieşte calul de pe c3.",
  "14": "Rocada. Îţi scoţi regele din ţintuire şi din centru dintr-o mutare.",
  "15": "Rocada adversarului.",
  "16": "De2 — dama se aşază în spatele pionului de e3 şi pregăteşte împingerea care urmează.",
  "17": "Cbd7 — adversarul îşi aduce ultimul cal.",
  "18": "e4! — îţi iei centrul mare şi, în aceeaşi mutare, loveşti nebunul lui de pe f5. Deschiderea s-a încheiat cu albul un pic mai bine: doi pioni în centru, piese active şi iniţiativa. Poziţia asta e aceeaşi cu cea din cursul de Apărare Slavă, doar că văzută din partea cealaltă — dacă îl parcurgi şi pe acela, vezi acelaşi joc explicat de ambele părţi."
}'::jsonb);


-- ============================================================
-- GAMBITUL REGELUI
-- ============================================================
select public.seed_line_text('kings-gambit', 'A',
  'e2e4 e7e5 f2f4 e5f4 f1c4 g8f6 b1c3 c7c6 d2d4 d7d5 e4d5 c6d5 c4b5 b8c6 g1e2 c8g4 e1g1 g4e2 d1e2',
  '{
  "0": "e4 — deschizi cu pionul de rege.",
  "1": "e5 — adversarul răspunde simetric.",
  "2": "f4 — Gambitul Regelui, cea mai veche şi cea mai curajoasă deschidere din şah. Îi oferi un pion ca să-i scoţi pionul de e5 din centru şi ca să-ţi deschizi coloana f spre regele lui. Preţul e că îţi slăbeşti singur adăpostul regelui, şi toată partida se va da pe socoteala asta.",
  "3": "exf4 — adversarul acceptă. Are un pion în plus şi o grijă: pionul acela de pe f4 e greu de ţinut.",
  "4": "Nc4 — Gambitul Nebunului. Îţi scoţi nebunul spre f7 şi renunţi dinadins la rocadă pentru moment. Sună nebuneşte şi are o logică: după ce vei recupera pionul, regele îşi va găsi loc oricum, iar deocamdată ai două piese îndreptate spre punctul lui cel mai slab.",
  "5": "Cf6 — adversarul se dezvoltă şi îţi loveşte pionul de e4.",
  "6": "Cc3 — îl aperi cu calul şi îţi termini dezvoltarea de pe flancul damei.",
  "7": "c6 — adversarul pregăteşte d5, ruptura din centru cu care vrea să-şi uşureze poziţia.",
  "8": "d4 — îţi iei centrul mare şi deschizi drumul nebunului de pe c1 spre pionul de f4.",
  "9": "d5 — adversarul loveşte în centru, cum plănuise.",
  "10": "exd5 — schimbi.",
  "11": "cxd5 — reia cu pionul de pe c şi îşi eliberează calul de pe b8.",
  "12": "Nb5+ — nebunul se mută cu şah şi ţinteşte calul care abia urmează să iasă. Un şah la momentul potrivit e o mutare gratis.",
  "13": "Cc6 — adversarul acoperă şahul cu calul, aşezându-l chiar în ţintuire.",
  "14": "Cge2 — calul iese pe e2, nu pe f3, unde ar sta în calea propriului atac pe coloana f. De pe e2 va putea lua pionul de f4 sau sări spre g3.",
  "15": "Ng4 — adversarul îţi ţintuieşte calul.",
  "16": "Rocada. În sfârşit îţi pui regele la adăpost, iar turnul ajunge pe f1 — chiar coloana pe care ai deschis-o cu f4 la mutarea a doua.",
  "17": "Nxe2 — adversarul schimbă.",
  "18": "Dxe2 — reiei cu dama, care ajunge pe coloana e, îndreptată spre regele lui rămas în centru. Deschiderea s-a încheiat: ai un pion în minus, dar ai centrul, coloana f deschisă cu turnul pe ea şi toate piesele afară. Într-un gambit nu se numără pionii, se numără mutările."
}'::jsonb);

select public.seed_line_text('kings-gambit', 'B',
  'e2e4 e7e5 f2f4 e5f4 g1f3 f8e7 f1c4 e7h4 e1f1 d7d6 d2d4 b8c6 b1c3 c8g4 c1f4 g8f6 h2h3 g4h5 g2g4',
  '{
  "0": "e4 — deschizi în centru.",
  "1": "e5 — răspuns simetric.",
  "2": "f4 — Gambitul Regelui.",
  "3": "exf4 — adversarul acceptă pionul.",
  "4": "Cf3 — mutarea cea mai firească: te dezvolţi şi, mai ales, îi tai damei drumul spre h4, de unde ar da şah şi ţi-ar strica tot.",
  "5": "Ne7 — Apărarea Cunningham. Nebunul se pregăteşte să vină la h4 în locul damei, ceea ce e mai puţin grav dar tot neplăcut.",
  "6": "Nc4 — îţi scoţi nebunul spre f7 şi îţi termini dezvoltarea de pe flancul regelui.",
  "7": "Nh4+ — vine şahul. Nu poţi să-l parezi cu g3, fiindcă ţi-ai slăbi şi mai tare regele.",
  "8": "Rf1 — regele face un pas în lateral. Pierzi rocada, ceea ce în orice altă deschidere ar fi grav; aici e preţul obişnuit al gambitului, iar turnul de pe h1 va intra în joc pe coloana g după ce împingi pionii.",
  "9": "d6 — adversarul îşi deschide nebunul de pe c8 şi îşi întăreşte poziţia.",
  "10": "d4 — îţi iei centrul mare. Ai doi pioni în mijloc şi el niciunul.",
  "11": "Cc6 — adversarul îşi dezvoltă calul, atacând pionul de d4.",
  "12": "Cc3 — îţi termini dezvoltarea şi aperi în plus centrul.",
  "13": "Ng4 — adversarul îţi ţintuieşte calul de pe f3.",
  "14": "Nxf4! — abia acum îţi iei pionul înapoi, cu nebunul care ajunge pe o diagonală bună. Materialul e din nou egal, şi ai centrul.",
  "15": "Cf6 — adversarul îşi aduce ultima piesă uşoară.",
  "16": "h3 — îl întrebi pe nebunul de pe g4 ce vrea să facă. E prima mutare a înaintării cu pionii care urmează.",
  "17": "Nh5 — nebunul se retrage, păstrând ţintuirea.",
  "18": "g4! — porneşti cu pionii. Ataci nebunul şi începi să deschizi coloana g, chiar acolo unde stă turnul tău de pe h1. Deschiderea s-a încheiat aşa cum trebuie într-un Gambit al Regelui: material egal, centrul tău, regele niciunuia nu e în siguranţă şi cine atacă mai repede câştigă."
}'::jsonb);

select public.seed_line_text('kings-gambit', 'C',
  'e2e4 e7e5 f2f4 d7d5 e4d5 e5e4 d2d3 g8f6 d3e4 f6e4 g1f3 f8c5 d1e2 c8f5 b1c3 d8e7 c1e3 c5e3 e2e3',
  '{
  "0": "e4 — deschizi în centru.",
  "1": "e5 — răspuns simetric.",
  "2": "f4 — Gambitul Regelui.",
  "3": "d5 — Contragambitul Falkbeer. Adversarul refuză pionul şi îţi oferă unul în schimb. E felul cel mai ambiţios de a răspunde: în loc să apere, atacă.",
  "4": "exd5 — iei. Nu poţi refuza fără să rămâi mai prost.",
  "5": "e4 — pionul lui trece mai departe şi se înfige în tabăra ta, luându-i calului de pe g1 câmpul firesc de pe f3.",
  "6": "d3! — cea mai bună reacţie. Nu-l laşi pe pionul acela să stea în pace; îl loveşti imediat, înainte să apuce să-şi aducă piese care să-l sprijine.",
  "7": "Cf6 — adversarul îşi apără pionul cu o piesă.",
  "8": "dxe4 — schimbi.",
  "9": "Cxe4 — reia cu calul, care ajunge pe un câmp bun în centru.",
  "10": "Cf3 — abia acum calul îşi ia câmpul, eliberat de schimbul din centru.",
  "11": "Nc5 — adversarul îşi scoate nebunul, ţintind f2, punctul tău cel mai slab după f4.",
  "12": "De2 — dama se aşază pe coloana e, faţă în faţă cu calul lui de pe e4, şi îl ţintuieşte de fapt: dacă acela pleacă, dama ta priveşte drept spre regele advers.",
  "13": "Nf5 — adversarul îşi apără calul cu al doilea nebun.",
  "14": "Cc3 — ataci calul de pe e4 a doua oară. Cu ţintuirea damei şi cu doi atacatori, piesa aceea nu mai poate rămâne acolo.",
  "15": "De7 — adversarul îşi apără calul cu dama, aşezând-o pe aceeaşi coloană cu a ta.",
  "16": "Ne3 — îţi dezvolţi ultimul nebun şi îi propui schimbul celui de pe c5, care ţintea f2.",
  "17": "Nxe3 — adversarul schimbă.",
  "18": "Dxe3 — reiei cu dama, care rămâne pe coloana e, tot faţă în faţă cu dama şi cu calul lui. Deschiderea s-a încheiat: material egal, pionul lui înaintat a dispărut, iar tu ai scăpat de nebunul care îţi ţintea f2. Contragambitul a fost dezamorsat, ceea ce e tot ce-ţi trebuie când adversarul atacă primul."
}'::jsonb);


-- ############################################################
-- KIA, Catalana, Colle, Londra
-- ############################################################

select public.seed_line_text('kings-indian-attack', 'A',
  'g1f3 d7d5 g2g3 c7c5 f1g2 b8c6 e1g1 e7e6 d2d3 g8f6 b1d2 f8e7 e2e4 e8g8 f1e1 b7b5 e4e5 f6d7 h2h4',
  '{
  "0": "Cf3 — deschizi cu calul. Nu ceri nimic din primele mutări şi nu-i dai adversarului nimic de atacat; îţi construieşti aşezarea şi abia apoi te uiţi ce a făcut el.",
  "1": "d5 — adversarul îşi ia centrul.",
  "2": "g3 — pregăteşti fianchetto-ul. Nebunul pe g2 va privi pe diagonala lungă, spre d5 şi mai departe.",
  "3": "c5 — adversarul îşi lărgeşte centrul, aşezându-se ca într-o Apărare Franceză.",
  "4": "Ng2 — nebunul îşi ia locul.",
  "5": "Cc6 — adversarul se dezvoltă.",
  "6": "Rocada. Regele la adăpost din vreme. În Atacul Regelui Indian rocada vine devreme tocmai fiindcă atacul de mai târziu îţi va cere să împingi pionii din faţa lui.",
  "7": "e6 — adversarul îşi închide nebunul de pe c8, ca în Franceză. Asta e slăbiciunea structurii lui şi ţinta ta pe termen lung.",
  "8": "d3 — un pas mic, nu doi. Aşa ţii poziţia închisă şi păstrezi câmpul e4 pentru pion, nu pentru piese.",
  "9": "Cf6 — adversarul se dezvoltă.",
  "10": "Cbd2 — calul iese pe d2, de unde poate merge la f1 şi apoi g3 sau e3. Manevra asta e semnătura sistemului.",
  "11": "Ne7 — adversarul îşi pregăteşte rocada.",
  "12": "e4! — abia acum. Ai aşteptat să-ţi aşezi toate piesele, şi acum împingi în centru cu tot ce ai în spate.",
  "13": "Rocada adversarului.",
  "14": "Te1 — turnul ocupă coloana e, în spatele pionului pe care tocmai l-ai împins.",
  "15": "b5 — adversarul porneşte pe flancul damei, unde are mai mult spaţiu.",
  "16": "e5! — pionul trece mai departe şi îi taie calului de pe f6 câmpul. De aici încolo flancul regelui e al tău: el are pioni acolo, dar niciun apărător care să vină repede.",
  "17": "Cd7 — calul lui se retrage, îndepărtându-se de propriul rege.",
  "18": "h4 — porneşti atacul cu pionii. Ai un pion înfipt pe e5 care îi taie legăturile, turnul pe coloana e şi acum pionii care vin peste regele lui. Aşa se joacă Atacul Regelui Indian: te aşezi zece mutări fără să ceri nimic, şi apoi ataci dintr-odată pe o parte a tablei unde adversarul nu poate aduce ajutoare."
}'::jsonb);

select public.seed_line_text('kings-indian-attack', 'B',
  'g1f3 c7c5 g2g3 b8c6 f1g2 d7d6 e1g1 g7g6 d2d3 f8g7 b1d2 g8f6 e2e4 e8g8 c2c3 a7a6 f1e1 a8b8 a2a4',
  '{
  "0": "Cf3 — deschizi liniştit.",
  "1": "c5 — adversarul se aşază ca într-o Siciliană.",
  "2": "g3 — pregăteşti fianchetto-ul.",
  "3": "Cc6 — adversarul se dezvoltă.",
  "4": "Ng2 — nebunul pe diagonala lungă.",
  "5": "d6 — adversarul îşi pregăteşte şi el fianchetto-ul.",
  "6": "Rocada. Regele la adăpost.",
  "7": "g6 — cei doi nebuni vor sta faţă în faţă pe aceeaşi diagonală.",
  "8": "d3 — un pas mic, ca să ţii poziţia închisă.",
  "9": "Ng7 — nebunul lui îşi ia locul.",
  "10": "Cbd2 — calul pe drumul spre f1 şi mai departe.",
  "11": "Cf6 — adversarul îşi termină dezvoltarea.",
  "12": "e4 — îţi împingi pionul în centru, acum că totul e aşezat.",
  "13": "Rocada adversarului.",
  "14": "c3 — o mutare care nu arată nimic şi ţine mult: pregăteşte d4 şi îi ia câmpul b4 calului lui. Împotriva unei aşezări simetrice, mutările mici sunt cele care fac diferenţa.",
  "15": "a6 — adversarul pregăteşte b5.",
  "16": "Te1 — turnul pe coloana e, în spatele pionului.",
  "17": "Tb8 — adversarul îşi pregăteşte înaintarea pe flancul damei.",
  "18": "a4! — îi opreşti b5 înainte să vină. Aici e diferenţa faţă de varianta A: adversarul are aceleaşi planuri ca tine, doar pe partea cealaltă, aşa că nu poţi ataca liniştit — trebuie mai întâi să-l opreşti. Deschiderea s-a încheiat cu poziţia echilibrată şi cu amândoi având ce face, ceea ce e cinstit într-o poziţie aproape simetrică."
}'::jsonb);

select public.seed_line_text('kings-indian-attack', 'C',
  'g1f3 d7d5 g2g3 c7c6 f1g2 c8g4 e1g1 b8d7 d2d3 e7e6 b1d2 g8f6 e2e4 d5e4 d3e4 f8c5 d1e2 e8g8 h2h3',
  '{
  "0": "Cf3 — deschizi liniştit.",
  "1": "d5 — adversarul îşi ia centrul.",
  "2": "g3 — pregăteşti fianchetto-ul.",
  "3": "c6 — adversarul se aşază ca într-o Caro-Kann.",
  "4": "Ng2 — nebunul pe diagonala lungă.",
  "5": "Ng4 — şi aici e diferenţa faţă de celelalte variante: adversarul îşi scoate nebunul de câmpuri albe afară, înainte să-l închidă cu e6. E exact ideea Caro-Kann-ului şi îi rezolvă singura problemă pe care ar fi avut-o.",
  "6": "Rocada. Regele la adăpost.",
  "7": "Cbd7 — adversarul se dezvoltă.",
  "8": "d3 — un pas mic, ca de obicei în sistem.",
  "9": "e6 — acum poate închide liniştit: nebunul e deja afară.",
  "10": "Cbd2 — calul pe drumul lui.",
  "11": "Cgf6 — adversarul îşi termină dezvoltarea pieselor uşoare.",
  "12": "e4 — împingi în centru.",
  "13": "dxe4 — adversarul schimbă imediat, ca să nu-ţi lase centrul mare.",
  "14": "dxe4 — reiei cu pionul de pe d. Coloana d ţi se deschide, iar tu ai un pion pe e4 sprijinit de piese.",
  "15": "Nc5 — adversarul îşi scoate nebunul activ, ţintind f2.",
  "16": "De2 — dama se aşază în spatele pionului de e4 şi leagă turnurile.",
  "17": "Rocada adversarului.",
  "18": "h3 — îl întrebi pe nebunul de pe g4 ce face. E o mutare mică şi necesară: cât timp stă acolo, calul tău de pe f3 e ţintuit şi nu poate pleca. Deschiderea s-a încheiat aproape egal — împotriva unui adversar care şi-a scos nebunul la timp, sistemul nu-ţi dă avantaj, îţi dă doar o poziţie pe care o cunoşti bine."
}'::jsonb);


-- ============================================================
-- DESCHIDEREA CATALANĂ
-- ============================================================
select public.seed_line_text('catalan-opening', 'A',
  'd2d4 g8f6 c2c4 e7e6 g2g3 d7d5 f1g2 d5c4 g1f3 a7a6 e1g1 b8c6 d1a4 c8d7 a4c4 b7b5 c4d3 f8b4 c1g5',
  '{
  "0": "d4 — deschizi cu pionul de damă.",
  "1": "Cf6 — adversarul îşi scoate calul.",
  "2": "c4 — îţi lărgeşti centrul.",
  "3": "e6 — adversarul îşi deschide nebunul de pe f8.",
  "4": "g3 — aici începe Catalana. Pui nebunul pe diagonala lungă, spre d5 şi mai departe, în loc să-l scoţi în faţă. Ideea e simplă şi puternică: nebunul acela va apăsa toată partida, iar tu nu trebuie să faci nimic special ca să-l ţii acolo.",
  "5": "d5 — adversarul îşi ocupă centrul.",
  "6": "Ng2 — nebunul îşi ia locul, faţă în faţă cu pionul de pe d5.",
  "7": "dxc4 — Catalana Deschisă. Adversarul ia pionul şi îţi propune o socoteală: el are un pion în plus, tu ai diagonala.",
  "8": "Cf3 — te dezvolţi. Nu te grăbeşti să-ţi iei pionul înapoi, fiindcă el nu-l poate ţine oricum.",
  "9": "a6 — adversarul pregăteşte b5, ca să-şi sprijine pionul furat.",
  "10": "Rocada. Regele la adăpost înainte de socoteli.",
  "11": "Cc6 — adversarul îşi dezvoltă calul.",
  "12": "Da4 — dama iese pe diagonala care duce la c6 şi, în acelaşi timp, se pregăteşte să ia pionul de pe c4. O mutare care face două lucruri.",
  "13": "Nd7 — adversarul îşi apără calul.",
  "14": "Dxc4 — îţi iei pionul înapoi. Materialul e egal, iar tu ai încă diagonala.",
  "15": "b5 — adversarul îţi alungă dama şi câştigă spaţiu.",
  "16": "Dd3 — dama se retrage pe câmpul din care priveşte spre h7 şi rămâne legată de centru.",
  "17": "Nb4 — adversarul îşi scoate nebunul cu tempo.",
  "18": "Ng5 — îţi dezvolţi ultimul nebun şi ţinteşti calul de pe f6. Deschiderea s-a încheiat: material egal, nebunul tău de pe g2 apasă pe diagonala lungă de zece mutări fără să fi făcut nimic altceva, iar el are pionii de pe flancul damei împinşi. Catalana e deschiderea în care o singură piesă bine pusă lucrează toată partida."
}'::jsonb);

select public.seed_line_text('catalan-opening', 'B',
  'd2d4 g8f6 c2c4 e7e6 g2g3 d7d5 f1g2 f8e7 g1f3 e8g8 e1g1 b8d7 d1c2 c7c6 b1d2 b7b6 e2e4 d5e4 d2e4',
  '{
  "0": "d4 — deschizi cu pionul de damă.",
  "1": "Cf6 — adversarul se dezvoltă.",
  "2": "c4 — îţi lărgeşti centrul.",
  "3": "e6 — adversarul îşi deschide nebunul.",
  "4": "g3 — Catalana: nebunul pe diagonala lungă.",
  "5": "d5 — adversarul îşi ocupă centrul.",
  "6": "Ng2 — nebunul îşi ia locul.",
  "7": "Ne7 — Catalana Închisă. Adversarul nu ia pionul de pe c4; se aşază solid şi face rocada. Nu-ţi dă nimic de câştigat repede, dar nici nu-şi rezolvă problema: nebunul lui de pe c8 rămâne închis.",
  "8": "Cf3 — te dezvolţi.",
  "9": "Rocada adversarului.",
  "10": "Rocada. Amândoi regii sunt la adăpost.",
  "11": "Cbd7 — adversarul îşi aduce calul.",
  "12": "Dc2 — dama se aşază pe coloana c şi îţi leagă piesele. De acolo sprijină şi împingerea e4, care e planul.",
  "13": "c6 — adversarul îşi întăreşte pionul de d5 a doua oară.",
  "14": "Cbd2 — ultimul cal iese, pe câmpul de unde poate sări la e4 sau b3.",
  "15": "b6 — adversarul încearcă în sfârşit să-şi scoată nebunul închis, prin b7.",
  "16": "e4! — împingi exact la timp, înainte ca nebunul lui să ajungă pe b7. Deschizi centrul chiar în clipa în care el are o piesă în drum.",
  "17": "dxe4 — adversarul schimbă.",
  "18": "Cxe4 — reiei cu calul, care ajunge în mijlocul tablei. Deschiderea s-a încheiat cu albul mai bine: ai un cal în centru, nebunul de pe g2 cu diagonala în sfârşit deschisă, şi un adversar al cărui nebun de pe c8 tot n-a apucat să iasă."
}'::jsonb);

select public.seed_line_text('catalan-opening', 'C',
  'd2d4 g8f6 c2c4 e7e6 g2g3 c7c5 f1g2 c5d4 g1f3 b8c6 e1g1 d7d5 c4d5 e6d5 f3d4 f8c5 d4b3 c5b6 b1c3',
  '{
  "0": "d4 — deschizi cu pionul de damă.",
  "1": "Cf6 — adversarul se dezvoltă.",
  "2": "c4 — îţi lărgeşti centrul.",
  "3": "e6 — adversarul îşi deschide nebunul.",
  "4": "g3 — Catalana.",
  "5": "c5 — adversarul loveşte în centru înainte să apuci să te aşezi. E cea mai directă încercare împotriva Catalanei: dacă îl laşi, deschide poziţia cât nebunul tău de pe f1 e încă acasă.",
  "6": "Ng2 — nu te laşi grăbit. Îţi pui nebunul pe diagonala lungă şi îl laşi să ia ce vrea.",
  "7": "cxd4 — adversarul ia pionul.",
  "8": "Cf3 — te dezvolţi. Pionul se ia înapoi mai târziu; deocamdată aduni piese.",
  "9": "Cc6 — adversarul îşi apără pionul de pe d4 cu calul.",
  "10": "Rocada. Regele la adăpost.",
  "11": "d5 — adversarul îşi ia centrul şi îşi deschide poziţia.",
  "12": "cxd5 — schimbi în centru.",
  "13": "exd5 — reia cu pionul de pe e. Pionul lui de pe d5 e acum izolat: n-are niciun vecin nici pe c, nici pe e, care să-l apere.",
  "14": "Cxd4 — abia acum îţi iei pionul înapoi, cu calul care ajunge în mijlocul tablei.",
  "15": "Nc5 — adversarul îşi scoate nebunul, atacând calul.",
  "16": "Cb3 — calul se retrage şi îl atacă la rândul lui pe nebun. O retragere care câştigă timp nu e o retragere.",
  "17": "Nb6 — nebunul lui se dă la o parte.",
  "18": "Cc3 — îţi aduci ultimul cal şi apeşi pe pionul izolat de d5. Deschiderea s-a încheiat: ai o ţintă limpede care nu se poate mişca, nebunul de pe g2 îndreptat drept spre ea, şi material egal. Împotriva unui pion izolat nu se caută lovitura — se adună atacatori."
}'::jsonb);


-- ============================================================
-- SISTEMUL COLLE
-- ============================================================
select public.seed_line_text('colle-system', 'A',
  'd2d4 d7d5 g1f3 g8f6 e2e3 e7e6 f1d3 c7c5 b2b3 b8c6 e1g1 f8d6 c1b2 e8g8 b1d2 b7b6 f3e5 c8b7 f2f4',
  '{
  "0": "d4 — deschizi cu pionul de damă.",
  "1": "d5 — adversarul îşi ia centrul.",
  "2": "Cf3 — te dezvolţi.",
  "3": "Cf6 — la fel şi el.",
  "4": "e3 — aici începe Sistemul Colle. Un pas mic, care îţi închide nebunul de pe c1 şi pare o concesie. E preţul unui sistem: joci aceleaşi mutări indiferent ce face adversarul, şi nu trebuie să ţii minte nicio variantă.",
  "5": "e6 — adversarul îşi închide şi el nebunul, în oglindă.",
  "6": "Nd3 — nebunul pe diagonala spre h7, adică spre regele lui. E piesa care va da atacul.",
  "7": "c5 — adversarul loveşte pionul de d4.",
  "8": "b3 — aici Colle-Zukertort se desparte de varianta obişnuită. În loc să-ţi sprijini pionul de d4 cu c3, îţi scoţi nebunul de pe c1 prin b2, pe diagonala lungă. Costă un tempo şi îţi rezolvă singura piesă proastă din sistem.",
  "9": "Cc6 — adversarul se dezvoltă.",
  "10": "Rocada. Regele la adăpost.",
  "11": "Nd6 — nebunul lui, la fel ca al tău, se îndreaptă spre flancul opus.",
  "12": "Nb2 — nebunul ajunge pe diagonala lungă. Acum ai doi nebuni îndreptaţi spre regele lui, unul pe fiecare diagonală.",
  "13": "Rocada adversarului.",
  "14": "Cbd2 — ultimul cal iese, pe câmpul de unde va sări la e4 sau f3.",
  "15": "b6 — adversarul îşi pregăteşte şi el nebunul pentru diagonala lungă.",
  "16": "Ce5! — calul se înfige în mijlocul tablei, sprijinit de nebunul de pe b2 din spate. De acolo nu-l poate alunga niciun pion fără ca adversarul să-şi rupă poziţia.",
  "17": "Nb7 — adversarul îşi termină dezvoltarea.",
  "18": "f4 — îţi sprijini calul de pe e5 cu un pion şi începi înaintarea pe flancul regelui. Deschiderea s-a încheiat cu tot ce promite Zukertort: doi nebuni pe diagonale lungi, un cal de neclintit în centru şi pionii gata să pornească. Nu ai învăţat nicio variantă ca să ajungi aici."
}'::jsonb);

select public.seed_line_text('colle-system', 'B',
  'd2d4 d7d5 g1f3 g8f6 e2e3 e7e6 f1d3 c7c5 c2c3 b8c6 b1d2 f8d6 e1g1 e8g8 d4c5 d6c5 e3e4 d5e4 d2e4',
  '{
  "0": "d4 — deschizi cu pionul de damă.",
  "1": "d5 — răspuns în centru.",
  "2": "Cf3 — te dezvolţi.",
  "3": "Cf6 — la fel şi el.",
  "4": "e3 — Sistemul Colle.",
  "5": "e6 — adversarul se aşază în oglindă.",
  "6": "Nd3 — nebunul spre h7.",
  "7": "c5 — adversarul loveşte pionul de d4.",
  "8": "c3 — Colle-Koltanowski, varianta clasică. Îţi sprijini pionul de d4 cu unul ieftin şi păstrezi centrul întreg. Nebunul de pe c1 rămâne închis, dar în schimb toată poziţia ta e gata pentru o singură împingere: e4.",
  "9": "Cc6 — adversarul se dezvoltă.",
  "10": "Cbd2 — calul iese, sprijinind viitorul e4.",
  "11": "Nd6 — nebunul lui, îndreptat spre h2.",
  "12": "Rocada. Regele la adăpost.",
  "13": "Rocada adversarului.",
  "14": "dxc5 — schimbi în centru. Pare că renunţi la pionul de d4 pentru care ai jucat c3, dar de fapt îi cureţi drumul pionului de pe e.",
  "15": "Nxc5 — adversarul reia cu nebunul.",
  "16": "e4! — mutarea pentru care s-a construit tot sistemul. Zece mutări liniştite, şi acum centrul se deschide dintr-odată, cu nebunul tău de pe d3 îndreptat spre h7 şi calul gata să sară pe e4.",
  "17": "dxe4 — adversarul schimbă.",
  "18": "Cxe4 — reiei cu calul, care ajunge în mijlocul tablei şi ţinteşte f6 şi d6. Deschiderea s-a încheiat cu albul un pic mai bine şi, mai important, cu o poziţie limpede: nebunul pe diagonala spre rege, calul în centru şi jocul deschis exact când ai vrut tu."
}'::jsonb);

select public.seed_line_text('colle-system', 'C',
  'd2d4 g8f6 g1f3 g7g6 e2e3 f8g7 f1d3 e8g8 e1g1 d7d6 b1d2 b8d7 c2c3 e7e5 d4e5 d6e5 e3e4 c7c6 d1e2',
  '{
  "0": "d4 — deschizi cu pionul de damă.",
  "1": "Cf6 — adversarul se dezvoltă.",
  "2": "Cf3 — la fel şi tu.",
  "3": "g6 — adversarul se aşază indian, cu fianchetto.",
  "4": "e3 — Colle, ca de fiecare dată. Aici e şi puterea sistemului: joci aceleaşi mutări şi împotriva unei aşezări cu totul diferite.",
  "5": "Ng7 — nebunul lui pe diagonala lungă, îndreptat prin centru spre colţul tău.",
  "6": "Nd3 — nebunul tău spre h7.",
  "7": "Rocada adversarului.",
  "8": "Rocada. Amândoi regii la adăpost.",
  "9": "d6 — adversarul pregăteşte e5.",
  "10": "Cbd2 — calul iese, sprijinind e4.",
  "11": "Cbd7 — adversarul îşi aduce şi el calul, tot pentru e5.",
  "12": "c3 — sprijini centrul şi îi tai calului câmpul b4.",
  "13": "e5 — adversarul loveşte în centru.",
  "14": "dxe5 — schimbi. Nu-l laşi să ţină tensiunea; o rezolvi tu, la momentul care îţi convine.",
  "15": "dxe5 — reia cu pionul.",
  "16": "e4! — aceeaşi împingere ca în toate variantele Colle. Îţi iei câmpul d5 şi îi tai nebunului de pe g7 diagonala cu propriul tău pion — iar acela era piesa lui cea mai bună.",
  "17": "c6 — adversarul îşi întăreşte câmpurile din centru.",
  "18": "De2 — dama se aşază în spatele pionului de e4 şi leagă turnurile. Deschiderea s-a încheiat cu poziţia echilibrată şi cu nebunul lui de pe g7 privind într-un zid. Împotriva aşezărilor indiene, Colle nu câştigă din atac, ci din faptul că ai închis piesa pentru care a jucat el toată deschiderea."
}'::jsonb);


-- ============================================================
-- SISTEMUL LONDRA — B şi C (A era deja completă)
-- ============================================================
select public.seed_line_text('london-system', 'B',
  'd2d4 g7g6 g1f3 f8g7 c1f4 d7d6 e2e3 g8f6 h2h3 e8g8 f1d3 b8d7 e1g1 c7c5 c2c3 d8b6 d1e2 c5d4 e3d4',
  '{
  "0": "d4 — deschizi cu pionul de damă.",
  "1": "g6 — adversarul se aşază cu fianchetto.",
  "2": "Cf3 — te dezvolţi.",
  "3": "Ng7 — nebunul lui pe diagonala lungă.",
  "4": "Nf4 — Sistemul Londra. Îţi scoţi nebunul de pe c1 în afara lanţului de pioni ÎNAINTE să joci e3. Toată deschiderea se învârte în jurul mutării ăsteia: în Colle nebunul rămâne închis, aici nu.",
  "5": "d6 — adversarul îşi pregăteşte e5 sau c5.",
  "6": "e3 — abia acum închizi diagonala, când nebunul e deja afară.",
  "7": "Cf6 — adversarul îşi termină dezvoltarea.",
  "8": "h3 — o mutare mică şi foarte utilă: îi tai câmpul g4, de unde calul sau nebunul lui ar veni să-ţi ţintuiască piesele. În Londra, mutările astea mici sunt jumătate din sistem.",
  "9": "Rocada adversarului.",
  "10": "Nd3 — al doilea nebun îşi ia diagonala spre h7. Ai acum doi nebuni activi, ceea ce în alte sisteme cu e3 nu se întâmplă.",
  "11": "Cbd7 — adversarul îşi aduce calul.",
  "12": "Rocada. Regele la adăpost.",
  "13": "c5 — adversarul loveşte pionul de d4.",
  "14": "c3 — îl sprijini cu unul ieftin. Sistemul e gata: pioni pe c3, d4, e3, nebuni pe f4 şi d3, şi nicio variantă de ţinut minte.",
  "15": "Db6 — dama lui iese şi apasă pe b2 şi pe d4 deodată.",
  "16": "De2 — îţi aperi pionul de b2 indirect, legându-ţi piesele şi pregătind împingerea e4. Nu te sperii de dama ieşită; o laşi acolo unde nu face nimic.",
  "17": "cxd4 — adversarul schimbă în centru.",
  "18": "exd4 — reiei cu pionul de pe e, nu cu cel de pe c. Aşa coloana e ţi se deschide pentru turn şi îţi păstrezi pionul de c3 ca sprijin. Deschiderea s-a încheiat echilibrat, cu o poziţie pe care o cunoşti pe de rost şi în care adversarul, oricât s-ar fi aşezat el, tot n-a găsit nimic concret."
}'::jsonb);

select public.seed_line_text('london-system', 'C',
  'd2d4 c7c5 c2c3 g8f6 g1f3 d7d5 c1f4 e7e6 e2e3 f8d6 f4d6 d8d6 f1d3 b8c6 e1g1 e8g8 b1d2 b7b6 d1e2',
  '{
  "0": "d4 — deschizi cu pionul de damă.",
  "1": "c5 — adversarul loveşte imediat, ca într-un Benoni.",
  "2": "c3! — aici e răspunsul Londrei împotriva lui c5, şi merită înţeles. Nu împingi d5 şi nu schimbi; îţi sprijini pionul de d4 pe loc şi îl laşi pe adversar fără nimic de atacat. Sistemul rămâne acelaşi, doar ordinea mutărilor se schimbă.",
  "3": "Cf6 — adversarul se dezvoltă.",
  "4": "Cf3 — la fel şi tu.",
  "5": "d5 — adversarul îşi ocupă centrul.",
  "6": "Nf4 — nebunul iese în afara lanţului, ca întotdeauna în Londra.",
  "7": "e6 — adversarul îşi închide nebunul de pe c8. Structura lui e solidă, dar piesa aceea va sta închisă mult timp.",
  "8": "e3 — abia acum îţi închizi şi tu diagonala, cu nebunul deja scos.",
  "9": "Nd6 — adversarul îţi propune schimbul nebunilor de câmpuri negre.",
  "10": "Nxd6 — accepţi. Pare că renunţi la piesa pentru care ai jucat toată deschiderea, dar uită-te ce primeşti: dama lui ajunge pe d6, unde va trebui să se mute încă o dată, iar tu rămâi cu un cal bun contra unui nebun închis.",
  "11": "Dxd6 — adversarul reia cu dama.",
  "12": "Nd3 — nebunul rămas îşi ia diagonala spre h7.",
  "13": "Cc6 — adversarul se dezvoltă.",
  "14": "Rocada. Regele la adăpost.",
  "15": "Rocada adversarului.",
  "16": "Cbd2 — ultimul cal iese, pe câmpul de unde poate sări la e5 sau b3.",
  "17": "b6 — adversarul încearcă în sfârşit să-şi scoată nebunul închis.",
  "18": "De2 — dama se aşază în spatele pionului de e3 şi pregăteşte împingerea e4. Deschiderea s-a încheiat aproape egal, ceea ce e exact ce cere un sistem: n-ai câştigat nimic din deschidere, dar n-ai riscat nimic şi ştii perfect ce ai de făcut mai departe."
}'::jsonb);


-- ============================================================
-- DOVADA — ambele cifre trebuie să fie 0
-- ============================================================
select
  (select count(*)
     from public.opening_lines l
     join public.courses c on c.id = l.course_id
    where c.slug in ('ruy-lopez','queens-gambit','kings-gambit',
                     'kings-indian-attack','catalan-opening','colle-system','london-system')
      and array_length(string_to_array(l.moves_uci, ' '), 1)
          <> (select count(*) from jsonb_object_keys(l.move_explanations))
  ) as linii_incomplete,
  (select count(*)
     from public.opening_lines l
     join public.courses c on c.id = l.course_id
    where l.user_color = 'white'
      and c.slug <> 'vienna-game'
      and array_length(string_to_array(l.moves_uci, ' '), 1)
          <> (select count(*) from jsonb_object_keys(l.move_explanations))
  ) as tot_albul_incomplet;
