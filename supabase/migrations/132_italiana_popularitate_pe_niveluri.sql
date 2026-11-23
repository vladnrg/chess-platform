-- ============================================================
-- Partida Italiană: popularitatea pe trei niveluri, capitole ordonate după ea
-- ============================================================
-- Utilizatorul, pe 2026-11-23: intervalul unic 1000–2000 e prea strâmt pentru o
-- platformă de 400–2300. Cifrele se măsoară pe trei niveluri — 400–1000
-- începători, 1000–1600 intermediari, 1600–2300 avansaţi — iar fiecare cursant
-- vede capitolele în ordinea descrescătoare a procentelor nivelului lui (din
-- testul de plasament; fără test, nivelul intermediar).
--
-- Procentul e acum al MUTĂRII ADVERSARULUI care duce în capitol, nu al
-- capitolului. Giuoco Piano, Pianissimo şi Gambitul Evans răspund toate la
-- 3…Nc5 şi diferă doar prin mutarea TA; vechiul procent măsura ce aleg alţi
-- jucători cu Albul. Capitolele surori au acelaşi `grup` şi stau împreună, în
-- ordinea de învăţare (`order_index`).
--
-- Sursa: exploratorul Chess.com, „All Chess.com Games", rapid+blitz, citit pe
-- 2026-11-23, poziţia după 1.e4 e5 2.Cf3 Cc6 3.Nc4:
--                       400–1000   1000–1600   1600–2300
--   3…Cf6                 35,4        28,2        29,5
--   3…Nc5                 21,3        28,3        38,6
--   3…h6                  17,5        20,8         9,9
--   3…d6                   7,7         6,9         5,9
--   3…Cd4                  4,7         5,6         4,0
--   3…Ne7                  1,2         3,1         6,6
--   (fără capitol: 3…f6 2,6/1,0/–, 3…f5 1,4/2,1/3,4 — sub 3…Cd4 pe orice nivel,
--   deci cele trei capitole de practică rămân aceleaşi pe toate nivelurile.)
--
-- Textele: utilizatorul nu vrea cifre în ele („trei din patru adversari"), ci
-- formulări de felul „cel mai des te vei confrunta cu…". Fiecare formulare a
-- fost verificată pe toate cele trei niveluri, pas cu pas. Unde mutarea din
-- capitol nu e cea mai jucată pe orice nivel, textul nu mai spune că e:
--   · 3…d6, 5…Dd7: la 400–1000 e abia a şasea (8%; cea mai jucată, 5…Ch6, 16%);
--   · 3…d6, 7…Tb6: la 400–1000 a doua (32%, după 7…Nxf3, 42%);
--   · 3…Cd4, 5…d6: a treia la 400–1000, a doua la 1000–1600 (după 5…Nc5).
-- Tot aici dispar trimiterile la „capitolul 1/2/4" şi „Capitolul 6:" din
-- introduceri: numărul unui capitol depinde acum de nivel.
-- Idempotentă.
-- ============================================================

alter table public.opening_lines
  add column if not exists grup text,
  add column if not exists popularitate_niveluri jsonb;

comment on column public.opening_lines.grup is
  'Mutarea adversarului care duce în capitol (ex. 3…Nc5). Capitolele cu acelaşi grup stau împreună.';
comment on column public.opening_lines.popularitate_niveluri is
  'Procentul mutării din `grup`, pe niveluri: {"incepator","intermediar","avansat"}. Lipsă = ordinea din order_index şi popularity_pct.';

update public.opening_lines l
   set grup = v.grup,
       popularitate_niveluri = jsonb_build_object('incepator', v.inc, 'intermediar', v.inter, 'avansat', v.av),
       popularity_pct = v.inter
  from public.courses c,
       (values
         ('A',  '3…Nc5', 21.3, 28.3, 38.6),
         ('D',  '3…Nc5', 21.3, 28.3, 38.6),
         ('E',  '3…Nc5', 21.3, 28.3, 38.6),
         ('B',  '3…Cf6', 35.4, 28.2, 29.5),
         ('C',  '3…Ne7',  1.2,  3.1,  6.6),
         ('P1', '3…h6',  17.5, 20.8,  9.9),
         ('P2', '3…d6',   7.7,  6.9,  5.9),
         ('P3', '3…Cd4',  4.7,  5.6,  4.0)
       ) as v(cod, grup, inc, inter, av)
 where l.course_id = c.id and c.slug = 'italian-game' and l.variation_code = v.cod;


-- ------------------------------------------------------------
-- Capitolele de practică: introduceri şi comentarii fără cifre
-- ------------------------------------------------------------
update public.opening_lines l
   set intro = $t$Când adversarul joacă 3…h6.

După cele două răspunsuri de carte, 3…Nc5 şi 3…Cf6, e mutarea pe care o vei întâlni cel mai des aici. 3…h6 nu e o greşeală gravă, dar e o mutare pierdută, iar tu o pedepseşti deschizând centrul imediat. La fiecare pas, adversarul joacă răspunsul pe care îl vei întâlni cel mai des.

Hai să vedem! Deschizi cu e4.$t$,
       move_explanations = move_explanations || $j${
  "5": "h6 — după cele două răspunsuri de carte, e mutarea pe care o vei întâlni cel mai des aici. Adversarul vrea să-ţi ia câmpul g5, ca să nu vină calul tău acolo, dar plăteşte cu o mutare care nu dezvoltă nimic.",
  "7": "exd4 — cel mai des, adversarul ia pionul.",
  "9": "Nc5 — răspunsul pe care îl vei întâlni cel mai des: adversarul îşi scoate nebunul şi îşi apără pionul de pe d4. Pare firesc, dar nebunul ajunge pe un câmp unde va fi ţinta loviturii care urmează.",
  "11": "dxc3 — cei mai mulţi adversari iau. E greşeala care contează: acum ai o lovitură.",
  "13": "Rxf7 — cei mai mulţi adversari iau nebunul."
}$j$::jsonb
  from public.courses c
 where l.course_id = c.id and c.slug = 'italian-game' and l.variation_code = 'P1';

update public.opening_lines l
   set intro = $t$Când adversarul joacă 3…d6.

O mutare solidă, dar pasivă, pe care o vei întâlni des. Adversarul joacă aici răspunsuri obişnuite la nivelul tău — iar cel mai des face, chiar la mutarea următoare, o greşeală care costă un pion.

Hai să vedem! Deschizi cu e4.$t$,
       move_explanations = move_explanations || $j${
  "7": "Ng4 — răspunsul pe care îl vei întâlni cel mai des. Ţintuieşte calul de pe f3, dar nebunul pleacă de pe c8 şi lasă pionul de pe b7 fără apărare.",
  "11": "Tb8 — tura fuge şi atacă dama. Aproape toţi adversarii răspund aşa.",
  "13": "Tb6 — adversarul alungă din nou dama, dar mutarea nu-i aduce nimic."
}$j$::jsonb
  from public.courses c
 where l.course_id = c.id and c.slug = 'italian-game' and l.variation_code = 'P2';

update public.opening_lines l
   set intro = $t$Capcana 3…Cd4.

O mutare pe care o vei întâlni din când în când, jucată cu un scop: adversarul speră să-i iei pionul de pe e5. Aici înveţi să nu muşti momeala şi cum să-l pedepseşti pentru timpul pierdut. Adversarul joacă răspunsuri obişnuite la nivelul tău.

Hai să vedem! Deschizi cu e4.$t$,
       move_explanations = move_explanations || $j${
  "5": "Cd4 — o capcană veche, Blackburne Shilling. Pionul de pe e5 pare liber. Dacă îl iei cu calul, 4.Cxe5?, vine 4…Dg5!, care atacă deodată calul de pe e5 şi pionul de pe g2, iar partida se poate termina repede. Mulţi jucători cad în ea.",
  "7": "exd4 — reia, aproape întotdeauna. Acum are doi pioni pe coloana d.",
  "9": "d6 — îşi deschide nebunul de pe c8. E una dintre mutările cele mai jucate aici.",
  "11": "dxc3 — cei mai mulţi adversari iau. E o greşeală: îţi deschide ţie jocul şi îţi aduce calul în joc."
}$j$::jsonb
  from public.courses c
 where l.course_id = c.id and c.slug = 'italian-game' and l.variation_code = 'P3';


-- ------------------------------------------------------------
-- Teoria: capitolele se numesc după nume, nu după număr; fără cifre
-- ------------------------------------------------------------
update public.opening_lines l
   set move_explanations = replace(replace(replace(replace(replace(replace(
         l.move_explanations::text,
         'ca în capitolul 1, îi', 'ca în Giuoco Piano, îi'),
         'aici te desparţi de capitolul 1.', 'aici te desparţi de Giuoco Piano.'),
         'Dintre maeştrii care joacă c3, trei din patru aleg aici d3, nu d4.', 'Cei mai mulţi maeştri care joacă c3 aleg aici d3, nu d4.'),
         'Giuoco Pianissimo, capitolul 2:', 'Giuoco Pianissimo:'),
         'cu cea din capitolul 4, la care se ajunge din Apărarea celor doi cai', 'cu cea din capitolul Apărarea celor doi cai'),
         'Aproape nouă din zece maeştri o fac.', 'Aproape toţi maeştrii o fac.')::jsonb
  from public.courses c
 where l.course_id = c.id and c.slug = 'italian-game' and l.tip = 'teorie';


-- ------------------------------------------------------------
-- Dovada
-- ------------------------------------------------------------
do $$
declare
  n int;
begin
  select count(*) into n
    from public.opening_lines l join public.courses c on c.id = l.course_id
   where c.slug = 'italian-game' and l.grup is not null
     and (l.popularitate_niveluri ? 'incepator') and (l.popularitate_niveluri ? 'intermediar') and (l.popularitate_niveluri ? 'avansat');
  if n <> 8 then raise exception 'Capitole cu popularitate pe niveluri: %, trebuiau 8', n; end if;

  -- Nicio cifră şi nicio trimitere la un capitol după număr, în niciun text al cursului.
  select count(*) into n
    from public.opening_lines l join public.courses c on c.id = l.course_id
   where c.slug = 'italian-game'
     and (coalesce(l.intro, '') || l.move_explanations::text || coalesce(l.move_comments::text, '') || coalesce(l.final_text, ''))
         ~* '([0-9]%|din (doi|trei|patru|cinci|zece|douăzeci)\M|apitolul [0-9]|1000–2000)';
  if n <> 0 then raise exception 'Mai sunt % capitole cu cifre sau numere de capitol în text', n; end if;
end $$;
