-- ============================================================
-- Apărarea Alekhine: liniile completate
-- ============================================================
-- Cel mai curat curs de negru dintre cele rămase: din 48 de explicaţii, una
-- singură era decalată (în Varianta Schimb, textul de sub 5.exd6 vorbea despre
-- d6). Ce lipsea era coada — variantele A şi B se opreau din explicat la
-- mutarea a şasea, respectiv a opta.
--
-- Liniile n-au fost schimbate: verificate cu motorul, se încheie între −0,39 şi
-- −0,72 pentru negru, fără nicio mutare care pierde. Textele existente care
-- erau corecte au fost păstrate ca sens şi aduse la acelaşi fel de scriere ca
-- restul cursurilor.
-- ============================================================


-- ------------------------------------------------------------
-- A · Atacul cu Patru Pioni — c4, f4
-- ------------------------------------------------------------
select public.seed_line_text('alekhine-defense', 'A',
  'e2e4 g8f6 e4e5 f6d5 d2d4 d7d6 c2c4 d5b6 f2f4 c8f5 c1e3 e7e6 b1c3 f8e7 g1f3 e8g8 f1e2 d6e5 f4e5',
  '{
  "0": "Adversarul deschide cu e4.",
  "1": "Cf6 — Apărarea Alekhine, şi cea mai obraznică primă mutare din şah. Ataci pionul de e4 cu singura piesă ieşită, ştiind foarte bine că va fi alungată. Toată ideea e asta: îl inviţi să te fugărească cu pionii, fiindcă fiecare pion care înaintează lasă în urmă un câmp pe care nu-l mai poate apăra nimeni.",
  "2": "e5 — albul acceptă invitaţia şi îţi alungă calul.",
  "3": "Cd5 — calul se retrage în centru, nu înapoi acasă. De pe d5 stă bine şi îl obligă pe alb să se hotărască din nou.",
  "4": "d4 — al doilea pion înaintează şi sprijină vârful de pe e5.",
  "5": "d6 — loveşti vârful lanţului de dedesubt. Nu-l poţi ataca cu piese fără să le expui, dar un pion îl întreabă direct: rămâi sau pleci?",
  "6": "c4 — albul îţi alungă calul a doua oară şi ridică Atacul cu Patru Pioni, cea mai ambiţioasă variantă a lui.",
  "7": "Cb6 — calul se dă la o parte pe câmpul de unde încă mai priveşte c4 şi d5. Ai pierdut trei mutări cu el; albul a împins trei pioni. Socoteala e cinstită deocamdată.",
  "8": "f4 — al patrulea pion. Albul are acum c4, d4, e5 şi f4, adică cel mai mare centru pe care îl poate avea cineva. Arată copleşitor şi asta e capcana: patru pioni împinşi nu se mai pot întoarce.",
  "9": "Nf5 — îţi scoţi nebunul afară înainte să-l închizi cu e6. E aceeaşi grijă ca în Caro-Kann sau în Slavă: nebunul de câmpuri albe iese primul, ca să nu rămână închis în spatele propriilor pioni.",
  "10": "Ne3 — albul îşi apără pionul de d4 şi îşi termină dezvoltarea.",
  "11": "e6 — abia acum pionul face pasul. Nebunul e deja afară, aşa că nu închide nimic.",
  "12": "Cc3 — albul îşi aduce ultimul cal.",
  "13": "Ne7 — nebunul iese modest, dar cu rost: pregăteşte rocada, iar de pe e7 stă în afara oricărei lovituri.",
  "14": "Cf3 — albul îşi termină dezvoltarea şi sprijină pionul de e5.",
  "15": "Rocada. Regele la adăpost.",
  "16": "Ne2 — ultimul nebun alb îşi ia locul, pregătind şi el rocada.",
  "17": "dxe5 — abia acum loveşti. Ai aşteptat până ţi-ai scos toate piesele, şi asta e regula întregii deschideri: nu ataci centrul până nu eşti gata să foloseşti ce se deschide.",
  "18": "fxe5 — albul reia cu pionul de pe f. Din cei patru pioni cu care se lăuda i-au rămas trei, coloana f i s-a deschis lui, iar pionul de pe e5 a rămas singur în faţă. Deschiderea s-a încheiat exact cum promitea Alekhine: el are spaţiu, tu ai ţinte."
}'::jsonb);


-- ------------------------------------------------------------
-- B · Varianta Modernă — d4, Cf3
-- ------------------------------------------------------------
select public.seed_line_text('alekhine-defense', 'B',
  'e2e4 g8f6 e4e5 f6d5 d2d4 d7d6 g1f3 c8g4 f1e2 e7e6 e1g1 f8e7 h2h3 g4h5 c2c4 d5b6 b1c3 e8g8 c1e3',
  '{
  "0": "Adversarul deschide cu e4.",
  "1": "Cf6 — Alekhine. Ataci pionul cu calul şi ceri să fii fugărit.",
  "2": "e5 — albul îţi alungă calul.",
  "3": "Cd5 — calul se retrage în centru.",
  "4": "d4 — al doilea pion sprijină vârful.",
  "5": "d6 — loveşti lanţul de dedesubt.",
  "6": "Cf3 — Varianta Modernă, cea mai jucată azi. Albul nu se mai lăcomeşte la pioni; îşi dezvoltă piesele şi păstrează avantajul de spaţiu pe care îl are deja. E răspunsul cel mai neplăcut pentru negru, tocmai fiindcă nu-ţi dă nimic de atacat.",
  "7": "Ng4 — nebunul iese afară şi ţinteşte calul de pe f3, care sprijină pionul de e5. Iarăşi aceeaşi grijă: nebunul de câmpuri albe iese înainte de e6.",
  "8": "Ne2 — albul îşi rupe ţintuirea aşezând nebunul între cal şi dama ta.",
  "9": "e6 — pionul face pasul acum, când nu mai închide pe nimeni.",
  "10": "Rocada albului.",
  "11": "Ne7 — îţi pregăteşti rocada.",
  "12": "h3 — albul îţi cere să te hotărăşti cu nebunul: îl schimbi sau îl retragi.",
  "13": "Nh5 — îl retragi, păstrând ţintuirea. Nebunul rămâne pe diagonală şi calul de pe f3 rămâne legat de apărarea pionului de e5.",
  "14": "c4 — albul îţi alungă calul de pe d5 a doua oară şi îşi lărgeşte centrul.",
  "15": "Cb6 — calul se dă la o parte, tot pe câmpul de unde priveşte înapoi spre c4 şi d5.",
  "16": "Cc3 — albul îşi aduce ultimul cal.",
  "17": "Rocada. Regele la adăpost, iar deschiderea se apropie de sfârşit.",
  "18": "Ne3 — albul îşi termină dezvoltarea şi îşi apără pionul de d4. Poziţia finală e cinstită faţă de ce promite Alekhine: el are mai mult spaţiu şi un pion înfipt pe e5, tu ai toate piesele afară, nebunul de câmpuri albe scos la timp şi doi pioni avansaţi de-ai lui pe care îi vei lovi cu c5 sau f6."
}'::jsonb);


-- ------------------------------------------------------------
-- C · Varianta Schimb — exd6
-- ------------------------------------------------------------
select public.seed_line_text('alekhine-defense', 'C',
  'e2e4 g8f6 e4e5 f6d5 d2d4 d7d6 c2c4 d5b6 e5d6 e7d6 b1c3 b8c6 c1e3 f8e7 f1d3 e8g8 b2b3 a7a5 g1e2',
  '{
  "0": "Adversarul deschide cu e4.",
  "1": "Cf6 — Alekhine.",
  "2": "e5 — calul e alungat.",
  "3": "Cd5 — se retrage în centru.",
  "4": "d4 — albul îşi lărgeşte centrul.",
  "5": "d6 — loveşti vârful lanţului.",
  "6": "c4 — calul e alungat a doua oară.",
  "7": "Cb6 — se dă la o parte, tot cu ochii pe c4 şi d5.",
  "8": "exd6 — Varianta Schimb. Albul rupe tensiunea şi renunţă la pionul înfipt pe e5, adică la piesa lui cea mai avansată. Câştigă linişte, dar renunţă la ce te apăsa cel mai tare.",
  "9": "exd6 — reiei cu pionul de pe e, nu cu cel de pe c. E o alegere, nu o obligaţie, şi merită înţeleasă: aşa îţi deschizi coloana e pentru turn şi îi dai drum nebunului de pe f8. Cealaltă reluare ţi-ar fi dat coloana c, dar ţi-ar fi stricat pionii de pe flancul damei.",
  "10": "Cc3 — albul se dezvoltă.",
  "11": "Cc6 — te dezvolţi şi ataci pionul de d4, care acum e cel mai înaintat pion alb şi singurul cu adevărat atacabil.",
  "12": "Ne3 — albul îşi apără pionul.",
  "13": "Ne7 — nebunul iese pe coloana pe care tocmai ai deschis-o şi pregăteşte rocada.",
  "14": "Nd3 — nebunul alb îşi ia diagonala spre flancul tău de rege.",
  "15": "Rocada. Regele la adăpost, turnul pe f8.",
  "16": "b3 — albul îşi sprijină pionul de c4, care după schimb a rămas cel mai expus.",
  "17": "a5 — porneşti pe flancul damei. Pionul merge spre a4, unde loveşte tocmai sprijinul pe care albul tocmai l-a construit. Când adversarul îşi apără ceva cu un pion, mutarea următoare e să ataci pionul acela.",
  "18": "Cge2 — albul îşi aduce şi ultimul cal, pe e2 fiindcă f3 e nevoie să rămână liber. Deschiderea s-a încheiat: material egal, structuri sănătoase de amândouă părţile, şi un plan limpede pentru fiecare — el în centru şi la rege, tu pe flancul damei, împotriva pionului de c4."
}'::jsonb);
