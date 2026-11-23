-- ============================================================
-- Partida Italiană: trei capitole „când adversarul nu joacă la carte"
-- ============================================================
-- Utilizatorul, pe 2026-11-23: pentru fiecare curs, cele mai dese 3 secvenţe
-- jucate de oamenii de 1000–2000, dacă nu sunt deja în curs — „mai importante
-- sunt secvenţele de mutări în care adversarii nu joacă ca la carte, fiindcă pe
-- acestea le vor întâlni userii mai des… cum pot profita de greşelile
-- adversarilor, obţinând un avantaj câştigător. Asta e metoda şi pe Chessly."
-- Italiana e pilotul; celelalte cursuri vin după ce e aprobat.
--
-- Cum au fost construite (Chess.com, „All Chess.com Games", rapid+blitz,
-- 1000–2000, citit pe 2026-11-23):
--   · abaterile: la fiecare poziţie din cele 5 capitole în care mută
--     adversarul, mutările care nu sunt în curs, după numărul de partide. Cele
--     mai dese trei sunt toate la mutarea a treia, după 3.Nc4 (591,7 milioane
--     de partide): 3…h6 20%, 3…d6 6,8%, 3…Cd4 5,5%. Următoarea, 4.c3 d6, are
--     de trei ori mai puţine partide decât 3…Cd4;
--   · mutările adversarului: la fiecare pas, cea mai jucată la acest nivel;
--   · mutările cursantului: prima mutare din varianta Stockfish 18 a Chess.com,
--     verificată apoi cu motorul nostru (adâncime 18). Niciuna nu pierde peste
--     0,18 faţă de cea mai bună;
--   · linia se opreşte la un punct natural, cu avantaj clar: +1,49 (3…h6),
--     +1,47 (3…d6), +2,49 (3…Cd4).
-- Procentele din texte sunt cele de la pasul respectiv („trei din patru
-- adversari iau") şi vin din aceeaşi bază.
--
-- Coloana nouă `tip` desparte teoria („ca la carte") de capitolele de practică.
-- Aplicaţia le grupează sub titluri diferite şi marchează teoria rară la nivelul
-- cursanţilor (sub 5%) cu „rar la nivelul tău".
-- ============================================================

alter table public.opening_lines
  add column if not exists tip text not null default 'teorie';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'opening_lines_tip_check') then
    alter table public.opening_lines
      add constraint opening_lines_tip_check check (tip in ('teorie', 'practica'));
  end if;
end $$;


insert into public.opening_lines (course_id, variation_name, variation_code, popularity_pct, order_index, user_color, moves_uci, tip)
select c.id, v.nume, v.cod, v.pop, v.ord, 'white', v.mutari, 'practica'
  from public.courses c
 cross join (values
   ('Când adversarul joacă 3…h6', 'P1', 20, 6,
    'e2e4 e7e5 g1f3 b8c6 f1c4 h7h6 d2d4 e5d4 e1g1 f8c5 c2c3 d4c3 c4f7 e8f7 d1d5 f7e8 d5c5'),
   ('Când adversarul joacă 3…d6', 'P2', 7, 7,
    'e2e4 e7e5 g1f3 b8c6 f1c4 d7d6 c2c3 c8g4 d1b3 d8d7 b3b7 a8b8 b7a6 b8b6 a6a4 g4f3 g2f3'),
   ('Capcana 3…Cd4 (Blackburne Shilling)', 'P3', 5, 8,
    'e2e4 e7e5 g1f3 b8c6 f1c4 c6d4 f3d4 e5d4 e1g1 d7d6 c2c3 d4c3 b1c3 g8f6 d1b3')
 ) as v(nume, cod, pop, ord, mutari)
 where c.slug = 'italian-game'
   and not exists (select 1 from public.opening_lines l where l.course_id = c.id and l.variation_code = v.cod);


-- ------------------------------------------------------------
-- P1 · 3…h6
-- ------------------------------------------------------------
update public.opening_lines l
   set intro = $t$Capitolul 6: când adversarul joacă 3…h6.

La nivelul tău, una din cinci partide ajunge aici — mai des decât în oricare capitol de teorie. 3…h6 nu e o greşeală gravă, dar e o mutare pierdută, iar tu o pedepseşti deschizând centrul imediat. La fiecare pas, adversarul joacă aici răspunsul cel mai des întâlnit la jucătorii de 1000–2000 de pe Chess.com.

Hai să vedem! Deschizi cu e4.$t$,
       move_explanations = $j${
  "0": "e4 — deschizi în centru.",
  "1": "e5 — adversarul răspunde simetric.",
  "2": "Cf3 — ataci pionul de pe e5 şi te dezvolţi.",
  "3": "Cc6 — îşi apără pionul.",
  "4": "Nc4 — Partida Italiană: nebunul ţinteşte f7, punctul cel mai slab din tabăra adversă.",
  "5": "h6 — una din cinci partide de la nivelul tău merge aşa. Adversarul vrea să-ţi ia câmpul g5, ca să nu vină calul tău acolo, dar plăteşte cu o mutare care nu dezvoltă nimic.",
  "6": "d4 — când adversarul pierde timp, deschizi centrul imediat. Nu mai ai nevoie de c3 ca pregătire: ai o mutare în plus, foloseşte-o.",
  "7": "exd4 — trei din patru adversari iau pionul.",
  "8": "Rocada ta. Nu te grăbeşti să iei înapoi pionul de pe d4: nu fuge nicăieri, iar regele tău trebuie pus la adăpost înainte să se deschidă centrul. Cxd4 era la fel de bun, chiar puţin mai precis; aici vezi continuarea în care adversarii greşesc cel mai des.",
  "9": "Nc5 — aproape jumătate dintre adversari fac asta: îşi scot nebunul şi îşi apără pionul de pe d4. Pare firesc, dar nebunul ajunge pe un câmp unde va fi ţinta loviturii care urmează.",
  "10": "c3 — oferi încă un pion. Dacă îl ia, centrul se deschide, iar nebunul de pe c5 rămâne singur.",
  "11": "dxc3 — aproape trei din patru jucători iau. E greşeala care contează: acum ai o lovitură.",
  "12": "Nxf7+! — dai nebunul ca să scoţi regele din colţ. Ideea vine la mutarea următoare.",
  "13": "Rxf7 — 85% dintre adversari iau nebunul.",
  "14": "Dd5+ — şah, şi în acelaşi timp dama atacă nebunul de pe c5. E o furculiţă: regele trebuie să fugă, iar nebunul cade.",
  "15": "Re8 — regele se retrage. Oricum s-ar fi apărat, nebunul de pe c5 era pierdut.",
  "16": "Dxc5 — iei nebunul înapoi. Ai dat doi pioni şi un nebun şi ai luat un nebun şi un pion; după ce iei şi pionul de pe c3 cu calul, materialul e egal. Doar că regele lui nu mai poate face rocada, iar tu ai piesele ieşite şi regele la adăpost. Motorul îţi dă un avantaj clar."
}$j$::jsonb,
       final_text = $t$Planul: iei pionul de pe c3 cu calul, aduci o tură pe coloana e sau d şi deschizi centrul cât timp regele lui stă pe e8. Un rege care nu mai poate face rocada rămâne ţinta ta pentru tot restul partidei.$t$,
       move_marks = $j${
  "4": {"squares": ["f7"]},
  "6": {"control": ["g5"]},
  "12": {"squares": ["f7", "c5"]},
  "14": {"squares": ["c5"], "arrows": [{"from": "d5", "to": "c5", "color": "green"}]}
}$j$::jsonb
  from public.courses c
 where l.course_id = c.id and c.slug = 'italian-game' and l.variation_code = 'P1';


-- ------------------------------------------------------------
-- P2 · 3…d6
-- ------------------------------------------------------------
update public.opening_lines l
   set intro = $t$Capitolul 7: când adversarul joacă 3…d6.

O mutare solidă, dar pasivă, pe care o întâlneşti în 7% din partidele de la nivelul tău. Adversarul joacă şi aici răspunsurile cele mai dese ale jucătorilor de 1000–2000 de pe Chess.com — iar cel mai des face, chiar la mutarea următoare, o greşeală care costă un pion.

Hai să vedem! Deschizi cu e4.$t$,
       move_explanations = $j${
  "0": "e4 — deschizi în centru.",
  "1": "e5 — adversarul răspunde simetric.",
  "2": "Cf3 — ataci pionul de pe e5 şi te dezvolţi.",
  "3": "Cc6 — îşi apără pionul.",
  "4": "Nc4 — Partida Italiană: nebunul ţinteşte f7, punctul cel mai slab din tabăra adversă.",
  "5": "d6 — adversarul îşi apără pionul de e5 încă o dată, dar îşi închide nebunul de pe f8. Solid şi pasiv.",
  "6": "c3 — pregăteşti d4, ca să-ţi construieşti centrul cu doi pioni. Împotriva unui adversar pasiv, ocupi centrul cât ai timp.",
  "7": "Ng4 — cel mai des întâlnit răspuns, aproape o treime dintre adversari. Ţintuieşte calul de pe f3, dar nebunul pleacă de pe c8 şi lasă pionul de pe b7 fără apărare.",
  "8": "Db3! — dama atacă deodată două puncte: pionul de pe b7, rămas fără apărare, şi pionul de pe f7, pe care acum îl ţinteşti de două ori — cu nebunul şi, prin spatele lui, cu dama. Adversarul nu le poate apăra pe amândouă.",
  "9": "Dd7 — adversarul apără f7 cu dama şi renunţă la pionul de pe b7. E una dintre cele mai bune apărări, dar pionul tot se pierde.",
  "10": "Dxb7 — iei pionul şi ameninţi deja tura de pe a8.",
  "11": "Tb8 — tura fuge şi atacă dama. Aşa răspund 93% dintre adversari.",
  "12": "Da6 — dama se retrage pe un câmp sigur, de unde păzeşte şi nebunul de pe c4.",
  "13": "Tb6 — adversarul alungă din nou dama. Patru din zece fac asta, dar mutarea nu-i aduce nimic.",
  "14": "Da4 — dama se aşază pe a4, de unde ţintuieşte calul de pe c6 de dama lui de pe d7.",
  "15": "Nxf3 — adversarul schimbă nebunul pe calul tău, ca să-ţi dubleze pionii pe coloana f.",
  "16": "gxf3 — reiei. Pionii dublaţi contează puţin aici: ai un pion în plus, perechea de nebuni şi o damă activă. Motorul îţi dă un avantaj clar, aproape un pion şi jumătate."
}$j$::jsonb,
       final_text = $t$Planul: d3, Nb3 şi Ne3, ca să-ţi termini dezvoltarea, apoi îţi pui regele la adăpost. Pe flancul damei ai trei pioni contra doi — pionul pe care l-ai câştigat. Când se schimbă piesele, majoritatea asta devine un pion liber.$t$,
       move_marks = $j${
  "4": {"squares": ["f7"]},
  "8": {"squares": ["b7", "f7"]},
  "12": {"control": ["c4"]}
}$j$::jsonb
  from public.courses c
 where l.course_id = c.id and c.slug = 'italian-game' and l.variation_code = 'P2';


-- ------------------------------------------------------------
-- P3 · 3…Cd4, capcana Blackburne Shilling
-- ------------------------------------------------------------
update public.opening_lines l
   set intro = $t$Capitolul 8: capcana 3…Cd4.

Un adversar din douăzeci joacă aşa la nivelul tău, şi o face cu un scop: speră să-i iei pionul de pe e5. Aici înveţi să nu muşti momeala şi cum să-l pedepseşti pentru timpul pierdut. Adversarul joacă răspunsurile cele mai dese ale jucătorilor de 1000–2000 de pe Chess.com.

Hai să vedem! Deschizi cu e4.$t$,
       move_explanations = $j${
  "0": "e4 — deschizi în centru.",
  "1": "e5 — adversarul răspunde simetric.",
  "2": "Cf3 — ataci pionul de pe e5 şi te dezvolţi.",
  "3": "Cc6 — îşi apără pionul.",
  "4": "Nc4 — Partida Italiană: nebunul ţinteşte f7, punctul cel mai slab din tabăra adversă.",
  "5": "Cd4 — o capcană veche, Blackburne Shilling. Pionul de pe e5 pare liber. Dacă îl iei cu calul, 4.Cxe5?, vine 4…Dg5!, care atacă deodată calul de pe e5 şi pionul de pe g2, iar partida se poate termina repede. La nivelul tău, un sfert dintre jucători cad în ea.",
  "6": "Cxd4 — răspunsul corect: schimbi calul care a venit în centru. Pionul de pe e5 rămâne unde era, iar adversarul a pierdut timp cu un cal care a dispărut de pe tablă.",
  "7": "exd4 — reia, aproape întotdeauna (99%). Acum are doi pioni pe coloana d.",
  "8": "Rocada ta. Regele la adăpost; urmează c3, ca să deschizi jocul cât adversarul nu e dezvoltat.",
  "9": "d6 — îşi deschide nebunul de pe c8. E mutarea cea mai jucată, aproape o partidă din patru.",
  "10": "c3 — loveşti pionul de pe d4. Vrei centrul pentru tine şi linii deschise spre regele lui, care n-a făcut rocada.",
  "11": "dxc3 — şapte din zece adversari iau. E o greşeală: îţi deschide ţie jocul şi îţi aduce calul în joc.",
  "12": "Cxc3 — reiei cu calul. Ai trei piese ieşite şi regele la adăpost; adversarul n-are încă nicio piesă scoasă, iar regele îi stă în centru.",
  "13": "Cf6 — adversarul îşi scoate în sfârşit o piesă, dar nu are grijă de f7 şi de b7.",
  "14": "Db3! — dama se alătură nebunului împotriva lui f7 şi atacă în acelaşi timp pionul de pe b7. Adversarul nu le poate apăra pe amândouă fără să cedeze ceva. Motorul îţi dă un avantaj câştigător: aproape doi pioni şi jumătate."
}$j$::jsonb,
       final_text = $t$Planul: d4 şi e5, ca să alungi calul de pe f6 şi să deschizi centrul cât regele lui stă pe e8. Dacă apără f7 cu Ne6, schimbi pe e6, iar pionul care ia înapoi rămâne slab. Ai mai multe piese în joc şi un rege mai sigur — exact ce îţi dă o capcană evitată.$t$,
       move_marks = $j${
  "4": {"squares": ["f7"]},
  "6": {"arrows": [{"from": "d8", "to": "g5", "color": "red"}]},
  "14": {"squares": ["f7", "b7"]}
}$j$::jsonb
  from public.courses c
 where l.course_id = c.id and c.slug = 'italian-game' and l.variation_code = 'P3';


-- lesson_count = capitole + capcane (migrarea 127)
update public.courses c
   set lesson_count = (select count(*) from public.opening_lines l where l.course_id = c.id)
                    + (select count(*) from public.opening_traps t where t.course_id = c.id)
 where c.slug = 'italian-game';


do $$
declare
  n int; ordine text; lc int;
begin
  select count(*) into n from public.opening_lines l join public.courses c on c.id = l.course_id
   where c.slug = 'italian-game' and l.tip = 'practica' and l.intro is not null and l.final_text is not null
     and jsonb_typeof(l.move_explanations) = 'object';
  if n <> 3 then raise exception 'Capitole de practică complete la Italiana: %, trebuiau 3', n; end if;

  select string_agg(l.variation_code, ' ' order by l.order_index) into ordine
    from public.opening_lines l join public.courses c on c.id = l.course_id where c.slug = 'italian-game';
  if ordine is distinct from 'A D E B C P1 P2 P3' then raise exception 'Ordinea e %', ordine; end if;

  select lesson_count into lc from public.courses where slug = 'italian-game';
  if lc <> 9 then raise exception 'lesson_count %, trebuia 9', lc; end if;

  select count(*) into n from public.opening_lines where tip = 'teorie';
  if n <> 62 then raise exception 'Capitole de teorie: %, trebuiau 62', n; end if;

  raise notice 'OK: Italiana are 5 capitole de teorie şi 3 de practică; lesson_count 9';
end $$;
