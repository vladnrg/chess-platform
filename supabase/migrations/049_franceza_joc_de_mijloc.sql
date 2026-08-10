-- ============================================================
-- Franceza: jocul de mijloc
-- ============================================================
-- Ce faci după ce se termină teoria, pentru fiecare din cele trei variante:
-- structura care rezultă, ideile în ordinea în care se pun în practică,
-- greşeala tipică — şi o continuare jucabilă, plecând din poziţia exactă în
-- care se opreşte deschiderea.
--
-- Toate afirmaţiile de mai jos au fost verificate pe poziţie, cu Stockfish
-- sau numărând piesele. Unde scrie o cifră, cifra a fost măsurată.
--
-- Migrarea corectează şi o greşeală a mea din 048: la finalul variantei Avans
-- scrisesem că planul e „b5, a5 şi înaintare pe flancul damei". Nu se poate
-- juca: b5 e blocat de propria damă de pe b6, a5 de propriul cal de pe a5, iar
-- b5 împins după ce dama pleacă duce evaluarea de la −0,29 la +0,82. Planul
-- adevărat e altul şi e scris mai jos.
-- ============================================================

-- Funcţiile există din 041 şi 042; le redeclarăm identic, ca migrarea să poată
-- fi rulată şi de una singură.
create or replace function public.seed_plan(
  p_slug text, p_code text, p_structure text, p_ideas jsonb, p_avoid text
)
returns void language plpgsql security definer as $$
begin
  insert into public.middlegame_plans (opening_line_id, structure, ideas, avoid)
  select l.id, p_structure, p_ideas, p_avoid
  from public.opening_lines l
  join public.courses c on c.id = l.course_id
  where c.slug = p_slug and l.variation_code = p_code
  on conflict (opening_line_id) do update set
    structure = excluded.structure,
    ideas = excluded.ideas,
    avoid = excluded.avoid;
end;
$$;

create or replace function public.seed_plan_moves(
  p_slug text, p_code text, p_moves text, p_expl jsonb
)
returns void language plpgsql security definer as $$
begin
  update public.middlegame_plans p
    set moves_uci = p_moves, move_explanations = p_expl
  from public.opening_lines l
  join public.courses c on c.id = l.course_id
  where p.opening_line_id = l.id
    and c.slug = p_slug and l.variation_code = p_code;
end;
$$;

revoke execute on function public.seed_plan(text, text, text, jsonb, text) from authenticated;
revoke execute on function public.seed_plan_moves(text, text, text, jsonb) from authenticated;


-- ------------------------------------------------------------
-- Corectura la 048: planul de la finalul variantei Avans
-- ------------------------------------------------------------
update public.opening_lines l
   set move_explanations = jsonb_set(
         l.move_explanations, '{18}',
         to_jsonb('Adversarul îşi aşază dama. Poziţia e echilibrată, iar planul tău are o ordine: întâi dai dama la o parte de pe b6, ca să-ţi eliberezi pionul b, apoi duci regele la adăpost pe flancul damei, şi abia la urmă spargi cu f6.'::text))
  from public.courses c
 where l.course_id = c.id and c.slug = 'french-defense' and l.variation_code = 'C';


-- ============================================================
-- A · WINAWER
-- ============================================================
select public.seed_plan('french-defense', 'A',
  'Ai dat nebunul de câmpuri negre pe pionii lui dublaţi de pe coloana c, iar el ţi-a luat doi pioni de lângă rege. Regele lui e încă pe e1, netras la adăpost, iar tu ai două coloane deschise pe flancul regelui. Nu stă nimeni comod.',
  '[
    {"title": "Ia pe c3 şi eşti la egalitate", "detail": "Pionul tău de pe d4 capturează, iar materialul se face 34 la 34 — verificat prin numărare. Ai plătit doi pioni ca să-i strici structura; ăsta e primul înapoi."},
    {"title": "Calul vrea pe f5", "detail": "De pe e7 ajunge acolo într-o mutare. De pe f5 apasă în centru şi, în linia principală, atacă dama pe loc — adică vine cu tempo, nu doar cu speranţe."},
    {"title": "Coloanele deschise sunt capitalul tău", "detail": "Pionii de pe g7 şi h7 s-au dus, dar coloanele au rămas ale tale, iar turnul stă deja pe una. Regele lui n-a făcut rocada; nu-i da timp s-o facă liniştit."}
  ]'::jsonb,
  'Nu-ţi apăra pionii cu orice preţ. Ai plătit deja doi ca să-i dublezi pionii şi să-i ţii regele în centru — dacă acum joci pasiv ca să nu mai pierzi nimic, i-ai plătit degeaba. În Winawer, iniţiativa e marfa pe care ai cumpărat-o.'
);

select public.seed_plan_moves('french-defense', 'A',
  'd4c3 f2f4 b8c6 h7d3 d5d4 e2d4 c6d4 d3d4 c8d7 h1g1 e7f5 d4f2',
  '{
    "0": "Iei pe c3 cu pionul de d4. Materialul e din nou egal, iar pionii lui dublaţi rămân o slăbiciune pentru toată partida.",
    "1": "Albul îşi face loc pe flancul regelui.",
    "2": "Cbc6 — aduci şi ultimul cal în joc, cu ochii pe d4.",
    "3": "Albul îşi cheamă dama înapoi din raid.",
    "4": "d4 — împingi pionul. Fiecare schimb care urmează îţi convine: regele lui e tot în centru, iar cu mai puţine piese pe tablă nu mai are cu ce să-l ascundă.",
    "5": "Albul ia cu calul.",
    "6": "Cxd4 — reiei. Se simplifică, exact cum vrei.",
    "7": "Albul reia cu dama.",
    "8": "Nd7 — în sfârşit iese şi nebunul de c8, piesa problematică a Francezei.",
    "9": "Albul îşi aduce turnul pe g1.",
    "10": "Cf5 — calul ajunge pe câmpul lui firesc şi atacă dama pe loc. Albul trebuie să se dea la o parte, iar tu câştigi un tempo.",
    "11": "Albul îşi retrage dama."
  }'::jsonb
);


-- ============================================================
-- B · TARRASCH
-- ============================================================
select public.seed_plan('french-defense', 'B',
  'Centrul s-a deschis, iar albul a rămas cu pionul de d4 izolat: n-are niciun pion pe coloana c sau pe e care să-l apere. Tu ai pionii legaţi. Ăsta e câştigul spargerii cu f6 — nu un pion în plus, ci o slăbiciune permanentă în tabăra lui.',
  '[
    {"title": "Pionul tău de pe d5 îl ţine în loc", "detail": "Stă chiar în faţa celui izolat şi îl împiedică să înainteze. Nu-l muta fără un motiv foarte bun: în clipa în care pionul de d4 se pune în mişcare, slăbiciunea lui dispare."},
    {"title": "Nebunul iese în sfârşit", "detail": "Toată Franceza s-a învârtit în jurul nebunului de c8 închis. Acum, cu centrul deschis, îl scoţi şi devine o piesă normală. De aici încolo joci cu toate piesele, nu cu şapte."},
    {"title": "Schimbă piese", "detail": "Cu cât rămân mai puţine, cu atât pionul izolat contează mai mult: în miniatură are cine să-l apere, în final n-are. Schimburile te duc spre poziţia în care slăbiciunea lui se vede cel mai bine."}
  ]'::jsonb,
  'Nu te grăbi să iei pe d4. Pionul izolat valorează mai mult ca ţintă decât ca material: cât timp stă acolo, îi ţine piesele legate de apărarea lui. Îl câştigi la final, dacă îl câştigi — nu la mutarea 12.'
);

select public.seed_plan_moves('french-defense', 'B',
  'f8d6 d2f3 e8g8 c1f4 d6f4 e2f4 f6g4 f4h5 e6e5 d4e5 g4e5 f3e5',
  '{
    "0": "Nd6 — nebunul iese pe diagonala bună, îndreptat spre flancul regelui advers.",
    "1": "Albul îşi aduce calul pe f3.",
    "2": "Rocada. Regele la adăpost, iar turnul intră în joc pe coloana f.",
    "3": "Albul îşi dezvoltă nebunul pe f4 şi îţi propune schimbul.",
    "4": "Nxf4 — accepţi. Fiecare pereche de piese schimbată apropie finalul în care pionul lui izolat n-are cine să-l apere.",
    "5": "Albul reia cu calul.",
    "6": "Cg4 — calul sare înainte şi acoperă e5, câmpul de pe care vrei să spargi.",
    "7": "Albul îşi mută calul pe h5.",
    "8": "e5 — lovitura. Ataci pionul izolat cu un pion, adică cu cea mai ieftină piesă de pe tablă.",
    "9": "Albul ia pe e5.",
    "10": "Cgxe5 — reiei cu calul de pe g4, exact cel pe care l-ai adus pentru asta. Centrul e curăţat şi ai piesele mai active.",
    "11": "Albul schimbă calul."
  }'::jsonb
);


-- ============================================================
-- C · AVANS
-- ============================================================
select public.seed_plan('french-defense', 'C',
  'Flancul damei e încuiat: pionul tău de c4 stă înfipt în structura lui, iar calul de pe a5 îl păzeşte. Centrul e blocat şi el. Într-o poziţie închisă nu contează viteza, ci unde ajung piesele şi cine sparge primul — iar spargerea se pregăteşte, nu se improvizează.',
  '[
    {"title": "Dama trebuie să plece de pe b6", "detail": "Nu fiindcă ar sta prost, ci fiindcă îţi blochează propriul pion de b. Cât timp e acolo, ...b5 nu e o mutare slabă — e pur şi simplu ilegală. Pe c7 stă la fel de bine şi îţi deschide drumul."},
    {"title": "Regele la adăpost pe flancul damei", "detail": "Rocada lungă. Albul are spaţiu pe flancul regelui şi acolo îşi va împinge pionii; nu-ţi duce regele în calea lor. În spatele zidului c4-d5 stă mai bine decât oriunde."},
    {"title": "Sparge cu f6, dar nu devreme", "detail": "f6 loveşte vârful lanţului. Jucat imediat, evaluarea trece de la +0,15 la +0,46 — adică îl ajuţi. Jucat după ce regele e la adăpost, de la +0,06 la +0,35. Aceeaşi mutare, două lucruri diferite, doar din cauza ordinii."}
  ]'::jsonb,
  'Nu împinge b5 doar fiindcă e flancul tău şi pare firesc să înaintezi acolo. Verificat pe poziţie: după ce muţi dama şi joci b5, evaluarea trece de la −0,29 la +0,82. Pionul de c4 face mai mult stând pe loc decât înaintând — el e cel care îi ţine albului tot flancul încuiat.'
);

select public.seed_plan_moves('french-defense', 'C',
  'b6c7 e2d1 e8c8 e1g1 f7f6 b2b4',
  '{
    "0": "Dc7 — dama se dă la o parte. Nu fugea de nimic; îşi bloca propriul pion de b. Abia acum flancul tău respiră.",
    "1": "Albul îşi retrage nebunul.",
    "2": "Rocada lungă. Regele intră în spatele zidului de pioni c4-d5, departe de partea unde albul are spaţiu şi unde îşi va împinge pionii.",
    "3": "Albul face rocada scurtă. Regii au plecat în părţi opuse, deci fiecare atacă acolo unde stă celălalt.",
    "4": "f6 — abia acum. Cu regele la adăpost, lovitura în vârful lanţului deschide poziţia fără să te coste. Aceeaşi mutare, jucată acum trei mutări, ţi-ar fi stricat treaba.",
    "5": "Albul începe să împingă pe flancul damei."
  }'::jsonb
);
