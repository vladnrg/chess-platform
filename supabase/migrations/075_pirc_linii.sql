-- ============================================================
-- Apărarea Pirc: liniile, cu Atacul Austrian reparat
-- ============================================================
-- Aici problema a fost mai puţin de aliniere — 6 explicaţii din 41 erau
-- decalate — şi mai mult de conţinut: lipseau douăzeci, iar Atacul Austrian
-- avea o mutare greşită.
--
-- În varianta B se juca 8.Ne3, care sare de la −0,19 la +2,21 pentru negru
-- dintr-o singură mutare. Adică lecţia îl învăţa pe cursant o linie care
-- „merge" doar fiindcă adversarul face o gafă — acelaşi lucru pe care l-am
-- găsit la Regele Indian. Mutarea corectă e 8.e5, singura care ţine poziţia
-- albului (+0,29 pentru el; a doua ca valoare, Cxb5, e deja la −0,61). Linia
-- continuă acum 8...dxe5 9.fxe5 Cg4 10.Nxb5 Cxe5 şi se încheie la −0,86 cu
-- material egal, ceea ce e normal pentru Pirc.
--
-- Variantele A şi C n-au fost schimbate: verificate, se încheie la −0,59 şi
-- +0,42, fără mutări care pierd.
-- ============================================================


-- ------------------------------------------------------------
-- A · Varianta Clasică — Ne2, rocadă
-- ------------------------------------------------------------
select public.seed_line_text('pirc-defense', 'A',
  'e2e4 d7d6 d2d4 g8f6 b1c3 g7g6 g1f3 f8g7 f1e2 e8g8 e1g1 c7c6 a2a4 c8g4 h2h3 g4f3 e2f3 e7e5 d4e5 d6e5',
  '{
  "0": "Adversarul deschide cu e4.",
  "1": "d6 — un pion mic, care nu cere nimic şi nu promite nimic. Apărarea Pirc porneşte de la o idee care sună greşit: îl laşi pe alb să-şi ia tot centrul, fiindcă un centru mare e şi o ţintă mare. Nu-l împiedici, îl aştepţi.",
  "2": "d4 — albul îşi ia al doilea pion central. Exact ce ai vrut.",
  "3": "Cf6 — calul iese şi loveşte pionul de e4, punându-l pe alb să-l apere.",
  "4": "Cc3 — îl apără cu calul. Ţine minte piesa asta: e singurul lucru care păzeşte e4.",
  "5": "g6 — pregăteşti nebunul pentru g7, pe diagonala lungă. De acolo el va apăsa pe centrul alb de la distanţă, fără să se expună.",
  "6": "Cf3 — albul îşi termină dezvoltarea liniştit. Varianta Clasică e cea în care el nu se grăbeşte să atace.",
  "7": "Ng7 — nebunul intră în fianchetto. Priveşte prin d4 până în colţul advers şi e piesa în jurul căreia se învârte toată apărarea ta.",
  "8": "Ne2 — nebunul alb se aşază modest, pregătind rocada.",
  "9": "Rocada. Regele la adăpost, iar turnul ajunge pe f8.",
  "10": "Rocada albului. Amândoi sunteţi aşezaţi, deci începe jocul adevărat.",
  "11": "c6 — un pion mic cu două rosturi: ţine câmpurile b5 şi d5 departe de piesele albe şi pregăteşte b5, dacă vei vrea să joci pe flancul damei.",
  "12": "a4 — albul îţi taie b5 înainte să apuci. Are dreptate să se grăbească, dar plăteşte cu asta: pionul de pe b4 rămâne o gaură permanentă în poziţia lui.",
  "13": "Ng4 — nebunul iese şi ţinteşte calul de pe f3, care e apărătorul pionului de d4. Nu ataci pionul, ataci pe cel care îl ţine.",
  "14": "h3 — albul îţi cere să te hotărăşti: iei calul sau te retragi.",
  "15": "Nxf3 — iei. Dai nebunul pe cal, ceea ce în general nu e o afacere, dar aici e: scapi de apărătorul lui d4 şi îţi pregăteşti lovitura din centru.",
  "16": "Nxf3 — albul reia cu nebunul. Piesa e bună, dar nu mai apără d4 aşa cum o făcea calul.",
  "17": "e5 — lovitura pentru care ai făcut schimbul. Ataci d4 exact când i-a plecat apărătorul, iar nebunul tău de pe g7 se uită prin acelaşi câmp.",
  "18": "dxe5 — albul schimbă în centru.",
  "19": "dxe5 — reiei cu pionul de pe d şi centrul se limpezeşte. Uită-te la ce ai obţinut: material egal, o structură fără nicio slăbiciune, nebunul de pe g7 în sfârşit cu diagonala liberă şi coloana d deschisă pentru turnuri. Asta e Pirc: nu iei nimic la început, ca să iei totul la mijloc."
}'::jsonb);


-- ------------------------------------------------------------
-- B · Atacul Austrian — mutarea 8 corectată
-- ------------------------------------------------------------
select public.seed_line_text('pirc-defense', 'B',
  'e2e4 d7d6 d2d4 g8f6 b1c3 g7g6 f2f4 f8g7 g1f3 e8g8 f1e2 c7c5 d4d5 b7b5 e4e5 d6e5 f4e5 f6g4 e2b5 g4e5',
  '{
  "0": "Adversarul deschide cu e4.",
  "1": "d6 — Pirc. Îi laşi centrul.",
  "2": "d4 — al doilea pion central.",
  "3": "Cf6 — calul loveşte e4.",
  "4": "Cc3 — albul îl apără.",
  "5": "g6 — pregăteşti fianchetto-ul.",
  "6": "f4 — Atacul Austrian, cel mai agresiv răspuns la Pirc. Albul pune al treilea pion în centru şi nu-şi ascunde intenţia: vrea e5, vrea să-ţi spargă poziţia înainte să apuci să te aşezi. Împotriva unei asemenea porniri nu te aperi stând pe loc, ci loveşti în temelie.",
  "7": "Ng7 — nebunul intră în fianchetto, ca de obicei. E cu atât mai important acum: cu cât albul împinge mai mulţi pioni, cu atât diagonala lungă se deschide mai repede.",
  "8": "Cf3 — albul îşi termină dezvoltarea.",
  "9": "Rocada. Regele la adăpost înainte de furtună.",
  "10": "Ne2 — ultimul nebun alb iese, pregătind rocada.",
  "11": "c5 — loveşti d4, temelia centrului. Nu aştepţi atacul, îl întrerupi.",
  "12": "d5 — albul împinge în loc să schimbe. Câştigă spaţiu şi îşi ţine centrul, dar pionul de pe d5 e acum înfipt adânc şi va avea nevoie de pază.",
  "13": "b5 — un pion oferit, şi oferit cu socoteală. Dacă albul îl ia, îşi ia şi o piesă de pe drumul spre centru, iar tu deschizi coloana b şi diagonala nebunului. Aici e cotitura variantei.",
  "14": "e5 — albul nu ia pionul, ci merge înainte cu planul lui. E singura mutare care îi ţine poziţia; oricare alta îl lasă mai prost. Împinge ca să-ţi alunge calul de pe f6 şi să-ţi deschidă poziţia regelui.",
  "15": "dxe5 — iei imediat. Nu-l laşi să treacă mai departe.",
  "16": "fxe5 — albul reia. Are acum doi pioni înfipţi, pe d5 şi pe e5, şi coloana f deschisă spre regele tău.",
  "17": "Cg4 — calul nu se retrage, sare înainte. De pe g4 loveşte pionul de e5 şi îl obligă pe alb să-l apere, în loc să atace.",
  "18": "Nxb5 — abia acum albul îşi ia pionul oferit, cu nebunul.",
  "19": "Cxe5 — şi tu ţi-l iei pe al lui. Materialul e din nou egal, centrul alb s-a subţiat la un singur pion, iar calul tău stă în mijlocul tablei. Poziţia rămâne ascuţită pentru amândoi, ceea ce e cinstit: cine împinge trei pioni în şase mutări nu poate cere şi linişte."
}'::jsonb);


-- ------------------------------------------------------------
-- C · Atacul 150 — Ne3, Dd2, f3
-- ------------------------------------------------------------
select public.seed_line_text('pirc-defense', 'C',
  'e2e4 d7d6 d2d4 g8f6 b1c3 g7g6 c1e3 f8g7 d1d2 c7c6 f2f3 b7b5 g1e2 b8d7 e3h6 g7h6 d2h6 c8b7 e1c1',
  '{
  "0": "Adversarul deschide cu e4.",
  "1": "d6 — Pirc.",
  "2": "d4 — al doilea pion central.",
  "3": "Cf6 — calul loveşte e4.",
  "4": "Cc3 — albul îl apără.",
  "5": "g6 — pregăteşti fianchetto-ul.",
  "6": "Ne3 — începe Atacul 150, aşa numit fiindcă e reţeta pe care o poate juca oricine fără să înveţe teorie. Are trei mutări şi un scop: nebunul pe e3, dama pe d2, pionul pe f3, apoi rocada lungă şi pionii peste regele tău.",
  "7": "Ng7 — îţi pui nebunul pe diagonala lungă. Ştii deja că albul va încerca să-l schimbe, fiindcă e piesa care îţi apără regele.",
  "8": "Dd2 — dama se aşază în spatele nebunului. Cele două piese ţintesc împreună câmpul h6, unde nebunul alb vrea să ajungă.",
  "9": "c6 — pregăteşti b5 şi ţii piesele albe departe de b5 şi d5. În Pirc nu ai loc de manevră, aşa că îţi câştigi spaţiu unde poţi: pe flancul damei.",
  "10": "f3 — albul îşi sprijină pionul de e4 cu unul ieftin şi pregăteşte g4 şi h4.",
  "11": "b5 — porneşti. De aici încolo e o cursă limpede: el vine cu pionii peste regele tău, tu vii cu ai tăi peste al lui. Cine ajunge primul are dreptate.",
  "12": "Cge2 — calul iese pe e2, nu pe f3, unde stă propriul pion. E preţul pe care albul îl plăteşte pentru reţeta lui simplă.",
  "13": "Cbd7 — îţi aduci ultimul cal, de unde sprijină şi b6, şi c5, şi e5.",
  "14": "Nh6 — albul îşi face schimbul plănuit de la mutarea a patra. Vrea nebunul tău de pe g7, fiindcă fără el câmpurile negre din faţa regelui tău rămân fără paznic.",
  "15": "Nxh6 — schimbi. A refuza ar însemna să-ţi retragi nebunul şi să pierzi timpul într-o cursă în care timpul e tot.",
  "16": "Dxh6 — dama albă ajunge lângă regele tău. Arată urât, dar e doar o damă singură: fără alte piese care s-o urmeze, nu poate face nimic.",
  "17": "Nb7 — îţi pui nebunul rămas pe diagonala lungă, îndreptat spre e4 şi mai departe. E piesa ta cea mai bună acum şi e aşezată exact spre partea unde va sta regele alb.",
  "18": "Rocada lungă a albului. Şi-a dus regele acolo unde tu ai deja doi pioni porniţi şi un nebun care priveşte. Deschiderea s-a încheiat: el are dama lângă regele tău, tu ai atacul care vine mai repede."
}'::jsonb);
