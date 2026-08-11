-- ============================================================
-- Apărarea Nimzo-Indiană: liniile, rescrise de la zero
-- ============================================================
-- 14 din 38 de explicaţii erau decalate, şi tocmai în locurile care contează:
-- în Varianta Dc2, textul de sub 5...Nxc3+ vorbea despre a3, cel de sub
-- 6.Dxc3 vorbea despre Nxc3+, cel de sub 6...b6 vorbea despre Dxc3. Adică
-- exact schimbul care dă sens întregii deschideri era explicat greşit, cu o
-- mutare în urmă, de la un capăt la altul.
--
-- Restul lipseau. Scrise din nou, toate cincizeci şi şapte.
--
-- Liniile n-au fost schimbate: verificate cu motorul, se încheie între +0,33 şi
-- −0,39 pentru negru, fără nicio mutare care pierde. Se termină cu mutarea
-- albului, aşa cum erau construite.
-- ============================================================


-- ------------------------------------------------------------
-- A · Varianta Dc2 — Clasică
-- ------------------------------------------------------------
select public.seed_line_text('nimzo-indian-defense', 'A',
  'd2d4 g8f6 c2c4 e7e6 b1c3 f8b4 d1c2 e8g8 a2a3 b4c3 c2c3 b7b6 c1g5 c8b7 e2e3 d7d6 g1f3 b8d7 a1d1',
  '{
  "0": "Adversarul deschide cu d4.",
  "1": "Cf6 — calul iese primul şi ţine sub ochi e4, câmpul pe care albul l-ar vrea pentru al doilea pion central.",
  "2": "c4 — albul îşi ia spaţiu pe lat.",
  "3": "e6 — un pion modest, care face loc nebunului de pe f8. Ceea ce urmează e mutarea care dă numele deschiderii.",
  "4": "Cc3 — calul apără c4 şi, mai important, e piesa care păzeşte e4. Aici e toată socoteala: fără el, albul nu poate juca e4.",
  "5": "Nb4 — Apărarea Nimzo-Indiană. Nebunul iese şi ţintuieşte calul de pe c3, legându-l de regele alb de pe e1 pe diagonala b4-e1. Uită-te ce înseamnă asta în cifre: calul rămâne cu zero mutări legale. Iar de aici vine tot: dacă albul joacă totuşi e4, tu iei cu Cxe4, şi calul lui de pe c3 nu poate relua, fiindcă n-are voie să se mişte. Aşa se opreşte o împingere de pion fără să pui niciun pion în faţa ei. Preţul e că, mai devreme sau mai târziu, îţi vei da nebunul pe calul acela — o piesă mai bună pe una mai proastă, în schimbul stăpânirii unui singur câmp.",
  "6": "Dc2 — cea mai populară alegere a albului. Dama se aşază astfel încât, dacă îi iei calul, să poată relua cu ea şi să nu rămână cu pioni dublaţi pe coloana c. E răspunsul cel mai cuminte la Nimzo.",
  "7": "Rocada. Regele intră la adăpost înainte să se lămurească nimic.",
  "8": "a3 — albul te pune să te hotărăşti. Nebunul trebuie ori să ia pe c3, ori să se retragă, pierzând timpul cu care a venit.",
  "9": "Nxc3+ — iei. Retragerea ar însemna că toată ideea deschiderii a fost degeaba. Şahul e doar un amănunt care îl obligă să reia într-un anume fel.",
  "10": "Dxc3 — albul reia cu dama, exact cum a plănuit la mutarea a patra. Pionii lui rămân întregi, dar a plătit altfel: dama a mutat de două ori, iar tu ai o piesă în plus dezvoltată.",
  "11": "b6 — pregăteşti nebunul pentru b7. Ai dat nebunul de câmpuri negre; cel care ţi-a rămas trebuie folosit bine, iar diagonala lungă e cel mai bun drum pe care i-l poţi da.",
  "12": "Ng5 — albul îşi scoate nebunul şi ţinteşte calul de pe f6, unul dintre puţinii apărători ai câmpului e4.",
  "13": "Nb7 — nebunul ajunge pe diagonala lungă, îndreptat drept spre e4. Aici e răsplata pentru schimbul de la mutarea a cincea: albul a scăpat de ţintuire, dar câmpul e4 e în continuare al tău, acum păzit de nebun şi de cal.",
  "14": "e3 — albul îşi deschide drumul nebunului de pe f1. Modest, dar sigur.",
  "15": "d6 — pionul face un singur pas, nu doi. Aşa ţii poziţia închisă, iar într-o poziţie închisă nebunii albi — cei doi pe care i-a păstrat — valorează mai puţin decât caii tăi.",
  "16": "Cf3 — albul îşi termină dezvoltarea.",
  "17": "Cbd7 — ultimul cal iese pe d7, de unde sprijină e5 şi c5, rupturile cu care vei încerca să deschizi poziţia atunci când îţi convine ţie.",
  "18": "Td1 — albul îşi aduce turnul pe coloana damei şi îşi termină aşezarea. Deschiderea s-a încheiat: el are perechea de nebuni şi mai mult spaţiu, tu ai stăpânire pe câmpurile albe din centru şi o poziţie fără nicio slăbiciune. Aşa arată un târg cinstit."
}'::jsonb);


-- ------------------------------------------------------------
-- B · Varianta e3 — Rubinstein
-- ------------------------------------------------------------
select public.seed_line_text('nimzo-indian-defense', 'B',
  'd2d4 g8f6 c2c4 e7e6 b1c3 f8b4 e2e3 e8g8 f1d3 d7d5 g1f3 c7c5 e1g1 c5d4 e3d4 d5c4 d3c4 b7b6 c1g5',
  '{
  "0": "Adversarul deschide cu d4.",
  "1": "Cf6 — calul iese şi păzeşte e4.",
  "2": "c4 — albul îşi ia spaţiu.",
  "3": "e6 — faci loc nebunului.",
  "4": "Cc3 — calul care păzeşte e4 îşi ia locul.",
  "5": "Nb4 — Nimzo-Indiana. Ţintuieşti calul de pe c3 şi îi tai albului împingerea e4.",
  "6": "e3 — Varianta Rubinstein, cea mai solidă de pe listă. Albul nu se grăbeşte să lămurească nimic: îşi deschide nebunul de pe f1, face rocada şi lasă întrebarea cu nebunul tău pentru mai târziu.",
  "7": "Rocada. Regele la adăpost.",
  "8": "Nd3 — nebunul alb se aşază pe diagonala îndreptată spre h7, adică spre regele tău.",
  "9": "d5 — îţi construieşti centrul şi opreşti e4 cu un pion, nu doar cu ţintuirea. De acum, chiar dacă nebunul tău pleacă de pe b4, e4 rămâne greu de jucat.",
  "10": "Cf3 — albul îşi termină dezvoltarea.",
  "11": "c5 — a doua lovitură, de partea cealaltă. Ataci pionul de d4, adică temelia centrului alb. În Nimzo nu ţii poziţia închisă la nesfârşit: o deschizi în clipa în care piesele tale sunt gata.",
  "12": "Rocada albului.",
  "13": "cxd4 — schimbi în centru.",
  "14": "exd4 — albul reia cu pionul de pe e. Coloana e i s-a golit, iar pionul de d4 a rămas fără vecinul din stânga. Mai are unul, pe c4; peste o mutare nu-l va mai avea nici pe acela.",
  "15": "dxc4 — al doilea schimb, şi cel care încheie socoteala. Acum albul n-are niciun pion nici pe coloana c, nici pe e, iar cel de pe d4 rămâne singur: nu-l poate apăra niciun pion, oricât ar vrea. E ce se numeşte un pion izolat, şi va fi ţinta ta pentru tot restul partidei. Îl mai şi obligi să mute nebunul a doua oară.",
  "16": "Nxc4 — albul reia cu nebunul. A mutat cu el de două ori, iar tu între timp ţi-ai făcut treaba în centru.",
  "17": "b6 — pregăteşti nebunul pentru b7, pe diagonala lungă. De acolo va apăsa pe e4 şi pe pionul izolat de d4, la capătul liniei.",
  "18": "Ng5 — albul îşi scoate şi ultimul nebun, ţintind calul de pe f6. Deschiderea s-a terminat: el are piese active şi perechea de nebuni, tu ai o ţintă limpede — pionul de d4, care nu are cine să-l apere cu un pion şi care nu se poate mişca de acolo."
}'::jsonb);


-- ------------------------------------------------------------
-- C · Varianta a3 — Sämisch
-- ------------------------------------------------------------
select public.seed_line_text('nimzo-indian-defense', 'C',
  'd2d4 g8f6 c2c4 e7e6 b1c3 f8b4 a2a3 b4c3 b2c3 c7c5 f2f3 d7d5 c4d5 f6d5 d4c5 f7f5 g1h3 e8g8 h3f4',
  '{
  "0": "Adversarul deschide cu d4.",
  "1": "Cf6 — calul iese.",
  "2": "c4 — albul îşi ia spaţiu.",
  "3": "e6 — faci loc nebunului.",
  "4": "Cc3 — calul care ţine e4.",
  "5": "Nb4 — Nimzo-Indiana.",
  "6": "a3 — Varianta Sämisch, cea mai directă dintre toate. Albul îţi cere nebunul imediat şi e gata să plătească scump pentru el.",
  "7": "Nxc3+ — iei, fiindcă asta ai vrut de la început.",
  "8": "bxc3 — şi aici e diferenţa faţă de celelalte variante: albul reia cu pionul de pe b, nu cu dama. Rămâne cu doi pioni unul peste altul pe coloana c, c3 şi c4, care nu se pot apăra unul pe altul şi nu pot avansa ca lumea. În schimb are amândoi nebunii şi un centru mare. E cel mai clar târg din tot şahul: structură stricată contra putere de foc.",
  "9": "c5 — loveşti imediat, înainte ca el să apuce să-şi aşeze piesele. Într-o poziţie în care adversarul are nebunii, nu-l laşi să deschidă tabla în ritmul lui.",
  "10": "f3 — albul îşi sprijină viitorul e4 cu un pion. Mutarea e încet, dar necesară: fără ea, centrul lui nu se ridică.",
  "11": "d5 — al doilea pion intră în centru. Nu-i laşi loc.",
  "12": "cxd5 — albul schimbă.",
  "13": "Cxd5 — reiei cu calul, nu cu pionul. Aşa calul ajunge în mijlocul tablei şi, mai ales, atacă pionul dublat de pe c3 — cel care nu are cine să-l apere.",
  "14": "dxc5 — albul îşi ia un pion înapoi şi îţi desface centrul.",
  "15": "f5 — mutarea care încheie socoteala din deschidere. Îi tai definitiv câmpul e4, adică exact ce urmărea el cu f3. Toată munca lui de trei mutări rămâne fără rost.",
  "16": "Ch3 — un cal pe margine, ceea ce arată prost, dar albul n-are încotro: pe f3 e propriul pion. Încă un preţ al variantei.",
  "17": "Rocada. Îţi pui regele la adăpost, cu poziţia deja aşezată.",
  "18": "Cf4 — calul alb îşi caută drumul spre centru prin f4. Deschiderea s-a încheiat: el are perechea de nebuni şi un pion în plus pentru moment, tu ai pionii lui dublaţi de pe c ca ţintă permanentă şi stăpânire completă pe câmpul e4."
}'::jsonb);
