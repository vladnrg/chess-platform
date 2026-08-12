-- ============================================================
-- Jocul de mijloc: deschiderile pentru negru
-- ============================================================
-- Câte un plan pentru fiecare variantă din cele zece cursuri de negru, plus
-- capcanele uzuale ale fiecărei deschideri.
--
-- Ce e un plan bun aici: structura care rezultă, două-trei idei concrete în
-- ordinea în care se pun în practică, şi greşeala care costă cel mai des.
-- Nu „joacă activ" sau „dezvoltă-ţi piesele" — alea nu spun nimic.
-- ============================================================


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

revoke execute on function public.seed_plan(text, text, text, jsonb, text) from authenticated;


create or replace function public.seed_trap(
  p_slug text, p_ord integer, p_title text, p_victim text,
  p_moves text, p_explanation text
)
returns void language plpgsql security definer as $$
begin
  insert into public.opening_traps (course_id, order_index, title, victim, moves_uci, explanation)
  select c.id, p_ord, p_title, p_victim, p_moves, p_explanation
  from public.courses c where c.slug = p_slug
  on conflict (course_id, order_index) do update set
    title = excluded.title, victim = excluded.victim,
    moves_uci = excluded.moves_uci, explanation = excluded.explanation;
end;
$$;

revoke execute on function public.seed_trap(text, integer, text, text, text, text) from authenticated;


-- ============================================================
-- APĂRAREA CARO-KANN
-- ============================================================
select public.seed_plan('caro-kann-defense', 'A',
  'Ai schimbat pionul e pe cel din centru, ţi-ai scos nebunul alb înainte să-l închizi, iar structura ta (c6, e6 faţă de d4) nu are nicio slăbiciune. Albul are mai mult spaţiu; tu ai o poziţie fără defecte.',
  '[
    {"title": "Schimbă nebunul de f5 şi ai scăpat de singura problemă", "detail": "Tot rostul lui 4...Nf5 e să scoţi nebunul ALB înainte de ...e6. După ce îl schimbi pe cel de d3, îţi rămâne o structură solidă şi nicio piesă proastă — exact ce n-are Franceza."},
    {"title": "c5 e singura ta spargere", "detail": "Nu o juca imediat. Pregăteşte cu ...Dc7, ...Cd7, ...Cgf6, ...Ne7, şi abia apoi ...c5. Jucată devreme, deschide poziţia cât albul are încă mai mult spaţiu."},
    {"title": "Finalul lucrează pentru tine", "detail": "Structura ta e sănătoasă, a lui are pionii h4-h5 împinşi. Schimbă damele când poţi: cu cât se apropie finalul, cu atât avantajul lui de spaţiu contează mai puţin."}
  ]'::jsonb,
  'Nu juca ...e6 înainte să fi scos nebunul de c8. Ai obţine o Franceză cu un tempo pierdut — exact poziţia pe care Caro-Kann-ul e construit s-o evite.'
);

select public.seed_plan('caro-kann-defense', 'B',
  'Lanţ de pioni închis: e5-d4 al albului contra c6-d5 al tău. Albul are spaţiu pe flancul regelui, tu ai o ţintă clară — baza lanţului lui, pionul d4.',
  '[
    {"title": "Nebunul iese ÎNAINTE de ...e6", "detail": "3...Nf5 e mutarea care justifică toată deschiderea. Dacă închizi întâi cu ...e6, nebunul rămâne prizonier pentru toată partida."},
    {"title": "c5 loveşte baza lanţului", "detail": "Un lanţ de pioni se atacă la bază, nu la vârf. Baza lui e d4, iar ...c5 e lovitura. Susţine-o cu ...Cc6 şi ...Db6 înainte s-o joci."},
    {"title": "Regele tău nu e obligat să meargă scurt", "detail": "Albul îşi împinge pionii pe flancul regelui (h4-h5, g4). Rocada lungă e adesea mai sigură, iar atunci atacul lui împinge în gol."}
  ]'::jsonb,
  'Nu lăsa nebunul de f5 fără scăpare. După g4 el trebuie să aibă unde să se retragă — de obicei pe g6, iar dacă albul continuă cu h4-h5 trebuie să fi calculat dinainte unde ajunge.'
);

select public.seed_plan('caro-kann-defense', 'C',
  'Structură simetrică de pion damă, fără avantaj de spaţiu pentru nimeni. Aici nu teoria decide, ci planul: albul are atacul minoritar pe flancul damei, tu ai centrul şi flancul regelui.',
  '[
    {"title": "Recunoaşte atacul minoritar", "detail": "Albul va juca b4-b5 ca să-ţi lase un pion slab pe c6. Nu-l ignora: ...a6 îl încetineşte, iar ...Ce4 şi joc în centru îi dau altceva de făcut."},
    {"title": "Nebunul tot pe f5 iese", "detail": "Aceeaşi idee ca peste tot în Caro-Kann: îl scoţi înainte de ...e6 şi îl schimbi. Structura simetrică favorizează pe cel fără piese proaste."},
    {"title": "...Db6 pune două întrebări deodată", "detail": "De pe b6 dama loveşte şi b2, şi d4. Adesea albul trebuie să răspundă cu Dc1 sau Cc3, ceea ce îi strică aşezarea."}
  ]'::jsonb,
  'Nu juca pasiv aşteptând să se întâmple ceva. Într-o structură simetrică, cine n-are plan pierde încet — de obicei exact prin atacul minoritar.'
);

select public.seed_trap('caro-kann-defense', 1,
  'Matul de pe d6 — greşeala clasică din Caro-Kann', 'ours',
  'e2e4 c7c6 d2d4 d7d5 b1c3 d5e4 c3e4 b8d7 d1e2 g8f6 e4d6',
  'După 5.De2, mutarea firească 5...Cgf6 pierde pe loc: 6.Cd6 e MAT. Regele n-are unde fugi, iar pionul de e7 — singurul care ar putea captura calul — e ţintuit de dama de pe e2. E cea mai cunoscută capcană din Caro-Kann şi cade în ea oricine dezvoltă pe pilot automat. Mutarea corectă e 5...Cdf6, cu celălalt cal.'
);

select public.seed_trap('caro-kann-defense', 2,
  'Nebunul închis în cuşcă — 4...e6 prea devreme', 'ours',
  'e2e4 c7c6 d2d4 d7d5 e4e5 c8f5 h2h4 e7e6 g2g4 f5g6 h4h5',
  'Ai scos corect nebunul pe f5, dar 4...e6 e cu o mutare prea devreme. Albul îl fugăreşte cu 5.g4 Ng6 şi apoi 6.h5: nebunul e atacat, iar câmpul h7 — singura retragere firească — e blocat de propriul pion, exact fiindcă n-ai jucat ...h5 la timp. Rămâi cu o piesă care se zbate să scape în loc să joace. Împotriva lui 4.h4 se răspunde 4...h5, ca să ai unde te retrage.'
);

select public.seed_trap('caro-kann-defense', 3,
  'Nebunul pe d3 — inexactitatea care te ajută', 'theirs',
  'e2e4 c7c6 d2d4 d7d5 e4e5 c8f5 f1d3 f5d3 d1d3 e7e6 b1c3 d8b6',
  'În Varianta Avans, 4.Nd3 pare firesc, dar îţi face exact serviciul pe care îl cauţi: schimbă nebunul tău „problematic" fără să te coste nimic. După 4...Nxd3 5.Dxd3 e6 6.Cc3, mutarea 6...Db6 pune două întrebări deodată — b2 şi d4 — iar albul nu le poate apăra pe amândouă comod. Reţine tiparul: în Caro-Kann, orice schimb al nebunului tău alb e în favoarea ta.'
);
