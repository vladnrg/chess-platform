-- ============================================================
-- Franceza: linii verificate cu motorul, texte care nu mai mint
-- ============================================================
-- Cele trei variante ale cursului au fost trecute prin Stockfish, mutare cu
-- mutare. Rezultatul:
--
-- · Winawer şi Tarrasch — mutările sunt sănătoase, nicio abatere serioasă.
--   Textele însă conţineau trei afirmaţii false, corectate mai jos.
--
-- · Avans — linia se rupea. 9...Dxb4+ pierdea 5,85 pioni: evaluarea sărea de
--   la +0,68 la +6,53 pentru alb, adică din echilibru în partidă pierdută.
--   Iar textul spunea „câştigi material". Cine învăţa varianta rămânea fără
--   cal. Coada e înlocuită începând cu mutarea 6.
--
-- Afirmaţiile false, toate verificate pe poziţie:
--   · Winawer, 7...Dc7: „aperi g7 indirect" — nu-l apără; calul de pe e7 şi
--     pionul de pe f7 taie drumul damei pe rândul şapte.
--   · Winawer, 8...Tg8: „ameninţi să prinzi dama" — dama are unsprezece
--     mutări. Ce e adevărat: turnul e apărat de cal, deci Dxg8+ Cxg8 ar da
--     dama pe un turn.
--   · Winawer, 9...cxd4: „material egal" — albul are un pion în plus.
--   · Avans, 5...Db6: „presiune pe b2 şi d4" — pe d4 nu ajunge, fiindcă i-l
--     acoperă chiar pionul negru de pe c5. Abia după ...c4 se deschide
--     diagonala; de aceea mutarea nouă e şi mai bună decât pare.
-- ============================================================

create or replace function public.seed_line_text(
  p_slug text, p_code text, p_moves text, p_expl jsonb
)
returns void language plpgsql security definer as $$
begin
  update public.opening_lines l
     set moves_uci = coalesce(p_moves, l.moves_uci),
         move_explanations = p_expl
    from public.courses c
   where l.course_id = c.id
     and c.slug = p_slug
     and l.variation_code = p_code;
end;
$$;

revoke execute on function public.seed_line_text(text, text, text, jsonb) from authenticated;


-- ------------------------------------------------------------
-- A · Winawer — mutările rămân, textele se îndreaptă
-- ------------------------------------------------------------
select public.seed_line_text('french-defense', 'A', null, '{
  "0": "Adversarul deschide cu e4.",
  "1": "e6 — Apărarea Franceză. Solid, şi pregăteşte d5. Preţul: nebunul de c8 rămâne închis până îi faci loc.",
  "2": "Adversarul joacă d4 şi îşi ia centrul.",
  "3": "d5 — loveşti centrul. De aici încolo, toată partida se învârte în jurul lui.",
  "4": "Adversarul joacă Cc3, ca să-şi apere pionul de e4.",
  "5": "Nb4 — Varianta Winawer. Ţintuieşti calul de pe c3 şi ameninţi să-l schimbi, lăsându-i pionii stricaţi.",
  "6": "Adversarul avansează e5. Centrul se închide, iar jocul se mută pe flancuri.",
  "7": "c5 — contra-jocul tău. Centrul albului stă pe d4; îl loveşti la bază înainte să apuce să se aşeze.",
  "8": "Adversarul joacă a3 şi te obligă să te hotărăşti cu nebunul.",
  "9": "Nxc3 — schimbi şi îi dublezi pionii. Dai perechea de nebuni pentru o slăbiciune care îi rămâne toată partida.",
  "10": "Adversarul reia cu pionul. Pionii dublaţi de pe coloana c sunt slăbiciunea pe care tocmai ai cumpărat-o.",
  "11": "Ce7 — calul stă gata să sară la f5 sau la g6.",
  "12": "Adversarul joacă Dg4 şi atacă deodată g7 şi e6.",
  "13": "Dc7 — nu apără g7, deşi pare. Calul de pe e7 şi pionul de pe f7 îi taie damei drumul pe rândul şapte. Îl laşi intenţionat. În schimb dama stă activ şi apasă pe pionul de e5.",
  "14": "Adversarul ia pe g7. A câştigat un pion, dar dama i-a ajuns departe de casă.",
  "15": "Tg8 — ataci dama şi câştigi un tempo. Turnul e apărat de calul de pe e7, deci Dxg8+ Cxg8 i-ar da dama pe un turn.",
  "16": "Adversarul mai ia un pion, pe h7.",
  "17": "cxd4 — deschizi centrul. Albul e cu un pion în plus, dar pionii lui de pe coloana c sunt dublaţi, regele n-a făcut rocada şi tu ai două coloane deschise spre el. Ăsta e târgul din Winawer: pioni contra iniţiativă."
}'::jsonb);


-- ------------------------------------------------------------
-- B · Tarrasch — mutările rămân, textele se curăţă
-- ------------------------------------------------------------
select public.seed_line_text('french-defense', 'B', null, '{
  "0": "Adversarul deschide cu e4.",
  "1": "e6 — Apărarea Franceză.",
  "2": "Adversarul joacă d4.",
  "3": "d5 — loveşti centrul.",
  "4": "Adversarul joacă Cd2 — Varianta Tarrasch. Mai puţin ascuţită decât Cc3, fiindcă nu-şi mai expune calul la ţintuire.",
  "5": "Cf6 — ataci pionul de e4 şi te dezvolţi în aceeaşi mutare.",
  "6": "Adversarul înaintează e5 şi îţi alungă calul.",
  "7": "Cfd7 — calul de pe f6 se retrage, dar nu în gol: de pe d7 sprijină spargerea c5.",
  "8": "Adversarul joacă c3, ca să-şi ţină pionul de d4.",
  "9": "c5 — spargerea principală din Franceză. Ataci baza lanţului, pionul d4.",
  "10": "Adversarul îşi dezvoltă nebunul pe d3.",
  "11": "Cc6 — încă o piesă îndreptată spre d4. Aduni presiune pe punctul pe care vrei să-l dărâmi.",
  "12": "Adversarul joacă Ce2.",
  "13": "cxd4 — schimbi şi deschizi coloana c.",
  "14": "Adversarul reia cu pionul.",
  "15": "f6 — a doua lovitură, acum în vârful lanţului. Aşa îţi deschizi jocul în Franceză.",
  "16": "Adversarul ia pe f6.",
  "17": "Cxf6 — calul revine în joc, iar poziţia s-a deschis. Nebunul de c8 are în sfârşit unde să iasă.",
  "18": "Adversarul face rocada."
}'::jsonb);


-- ------------------------------------------------------------
-- C · Avans — coadă nouă de la mutarea 6
-- ------------------------------------------------------------
-- Vechea continuare: 6...cxd4 7.cxd4 Ca5 8.b4 Cc4 9.Nxc4 Dxb4+ — pierdea o
-- piesă. Cea nouă ţine evaluarea între +0,26 şi +0,35 pe tot parcursul şi
-- predă planul clasic: încui flancul damei şi înaintezi acolo.
select public.seed_line_text('french-defense', 'C',
  'e2e4 e7e6 d2d4 d7d5 e4e5 c7c5 c2c3 b8c6 g1f3 d8b6 a2a3 c5c4 b1d2 c6a5 a1b1 c8d7 f1e2 g8e7 d1c2',
  '{
  "0": "Adversarul deschide cu e4.",
  "1": "e6 — Apărarea Franceză.",
  "2": "Adversarul joacă d4.",
  "3": "d5 — loveşti centrul.",
  "4": "Adversarul înaintează e5 — Varianta Avans. Centrul se închide, iar lupta se mută pe flancuri.",
  "5": "c5 — contra-jocul tău. Ataci baza lanţului înainte ca adversarul s-o întărească.",
  "6": "Adversarul joacă c3, ca să-şi sprijine pionul de d4.",
  "7": "Cc6 — încă un atacator îndreptat spre d4.",
  "8": "Adversarul joacă Cf3.",
  "9": "Db6 — dama iese devreme, dar are ce face: apasă pe pionul de b2. Pe d4 încă nu ajunge, fiindcă i-l acoperă chiar pionul tău de pe c5.",
  "10": "Adversarul joacă a3, pregătind b4.",
  "11": "c4 — încui flancul damei în loc să deschizi centrul. Şi îţi eliberezi dama: cu pionul plecat de pe c5, diagonala b6-d4 se deschide, iar dama ta ajunge în sfârşit la pionul de d4.",
  "12": "Adversarul îşi dezvoltă calul. De pe d2 poate ajunge la b3, unde ar ataca pionul tău de pe c4.",
  "13": "Ca5 — calul păzeşte c4. Pe a5 pare împins la margine, dar exact de acolo ţine pionul care îi încurcă albului tot flancul damei.",
  "14": "Adversarul pregăteşte b3 — spargerea cu care ar vrea să-şi recapete flancul damei.",
  "15": "Nd7 — scoţi nebunul problematic al Francezei. Nu e câmpul lui de vis, dar de pe d7 sprijină înaintarea b5 şi nu mai stă în calea nimănui.",
  "16": "Adversarul îşi termină dezvoltarea, cu nebunul pe un câmp liniştit.",
  "17": "Ce7 — calul porneşte spre f5 sau g6, fix spre câmpurile de unde apasă pe lanţul albului.",
  "18": "Adversarul îşi aşază dama. Poziţia e echilibrată, iar tu ai un plan limpede: b5, a5 şi înaintare pe flancul damei."
}'::jsonb);


-- Verificare, după rulare:
--   select variation_code, left(moves_uci, 40) as inceput,
--          jsonb_object_keys_count(move_explanations) from ...
-- Mai simplu, din aplicaţie: varianta C trebuie să aibă 19 semi-mutări şi
-- să se termine cu 10.Dc2, nu cu 10.Cbd2.
