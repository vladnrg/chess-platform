-- ============================================================
-- Franceza: capcanele, în amândouă sensurile
-- ============================================================
-- Cinci curse, fiecare măsurată cu Stockfish la adâncime 18. Trei în care poţi
-- cădea tu, două în care poate cădea albul.
--
-- Patru din cinci răsar din Varianta Avans, în jurul lui 5...Db6. Nu e o
-- scăpare: acolo trăiesc tacticile Francezei la nivel de club. A cincea vine
-- din Tarrasch şi loveşte exact mutarea pe care cursul o predă altfel.
--
-- Winawerul n-a primit niciuna. Am căutat: rocada scurtă sub atacul cu Dg4
-- pare o cursă, dar după 8.Nh6 Cf5 negrul iese doar cu −0,16, adică puţin mai
-- bine. E o inexactitate instructivă, nu o capcană, şi nu se cade în ea decisiv.
-- Mai bine trei capcane adevărate decât patru din care una e umplutură.
--
-- Perechea 2 şi 4 e miezul: aceeaşi mutare, ...Dxb2, în poziţii aproape la fel.
-- O dată pierde dama, o dată câştigă un pion. Singura deosebire e dacă nebunul
-- alb mai stă pe c1.
-- ============================================================

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

create or replace function public.seed_trap_link(
  p_slug text, p_ord integer, p_code text, p_spring integer
)
returns void language plpgsql security definer as $$
begin
  update public.opening_traps t
    set opening_line_id = l.id, spring_ply = p_spring
  from public.opening_lines l
  join public.courses c on c.id = l.course_id
  where t.course_id = c.id and c.slug = p_slug
    and l.variation_code = p_code and t.order_index = p_ord;
end;
$$;

create or replace function public.seed_trap_moves(
  p_slug text, p_ord integer, p_expl jsonb
)
returns void language plpgsql security definer as $$
begin
  update public.opening_traps t
    set move_explanations = p_expl
  from public.courses c
  where t.course_id = c.id and c.slug = p_slug and t.order_index = p_ord;
end;
$$;

revoke execute on function public.seed_trap(text, integer, text, text, text, text) from authenticated;
revoke execute on function public.seed_trap_link(text, integer, text, integer) from authenticated;
revoke execute on function public.seed_trap_moves(text, integer, jsonb) from authenticated;


-- ============================================================
-- 1. Gambitul Milner-Barry — cade negrul
-- ============================================================
select public.seed_trap('french-defense', 1,
  'Gambitul Milner-Barry — pionul de d4 care costă dama', 'ours',
  'e2e4 e7e6 d2d4 d7d5 e4e5 c7c5 c2c3 b8c6 g1f3 d8b6 f1d3 c5d4 c3d4 c6d4 f3d4 b6d4 d3b5 c8d7 b5d7 e8d7 d1d4',
  'Albul îţi oferă pionul de d4 şi arată de parcă l-ar fi uitat acolo. Nu l-a uitat. După 7...Cxd4 8.Cxd4 Dxd4, evaluarea trece de la 0,00 la +5,81, iar 9.Nb5+ e mutarea pentru care s-a jucat tot: şahul îl obligă pe rege să se descopere, şi după 9...Nd7 10.Nxd7+ Rxd7 dama ta de pe d4 rămâne fără niciun apărător. 11.Dxd4 o ia pe gratis. Nu lua pionul; joacă întâi Nd7 şi cursa se dezamorsează singură.'
);
select public.seed_trap_link('french-defense', 1, 'C', 10);
select public.seed_trap_moves('french-defense', 1, '{
  "9": "Db6 — mutarea firească din Franceza Avans: dama apasă pe b2 şi se pregăteşte pentru d4.",
  "10": "Nd3 — aici se armează cursa. Albul îşi dezvoltă nebunul şi lasă pionul de d4 să pară slab.",
  "11": "Negrul schimbă în centru.",
  "12": "Albul reia cu pionul. Acum d4 e apărat o singură dată, de calul de pe f3 — pare de luat.",
  "13": "GREŞEALA! Negrul ia pionul. Îl atacă de două ori şi e apărat o dată, deci socoteala pare bună. Socoteala e bună; problema e ce urmează.",
  "14": "Iei calul.",
  "15": "Negrul reia cu dama şi rămâne, pe hârtie, cu un pion în plus.",
  "16": "Nb5+! Toată cursa a fost pentru şahul ăsta. Nu ataci dama — obligi regele să se ocupe de el însuşi, iar dama rămâne singură pe d4.",
  "17": "Negrul blochează cu nebunul, singura apărare care nu pierde pe loc.",
  "18": "Iei nebunul, cu şah.",
  "19": "Regele trebuie să reia el însuşi.",
  "20": "Dxd4 — dama, pe gratis. Pe d4 n-o mai apăra nimeni, iar regele negru e în mijlocul tablei."
}'::jsonb);


-- ============================================================
-- 2. Dama lacomă — cade negrul
-- ============================================================
select public.seed_trap('french-defense', 2,
  'Pionul de b2, care e apărat', 'ours',
  'e2e4 e7e6 d2d4 d7d5 e4e5 c7c5 c2c3 b8c6 g1f3 d8b6 f1d3 b6b2 c1b2',
  'Dama stă pe b6 şi se uită drept la pionul de b2. Pare de luat, mai ales că albul tocmai şi-a mutat nebunul pe d3 şi pare ocupat cu alte lucruri. Dar nebunul care păzeşte b2 nu e cel de pe d3 — e cel de pe c1, care n-a plecat nicăieri. 6...Dxb2 duce evaluarea de la +0,30 la +6,09, adică pierzi dama pe un pion. Nu e o cursă adâncă; e cel mai frecvent mod de a pierde Franceza în zece mutări. Înainte să iei pionul, uită-te cine îl apără.'
);
select public.seed_trap_link('french-defense', 2, 'C', 10);
select public.seed_trap_moves('french-defense', 2, '{
  "9": "Db6 — dama iese şi se uită la b2. De aici încolo, tentaţia stă pe tablă la fiecare mutare.",
  "10": "Nd3 — îţi dezvolţi nebunul. Arată de parcă ai lăsat flancul damei în urmă.",
  "11": "GREŞEALA! Negrul ia pionul de b2. A numărat nebunul de pe d3, care e departe, şi l-a uitat pe cel de pe c1, care e chiar acolo.",
  "12": "Nxb2 — nebunul de pe c1 ia dama. N-a fost nevoie de nimic ingenios."
}'::jsonb);


-- ============================================================
-- 3. Milner-Barry dezamorsat — cade albul
-- ============================================================
select public.seed_trap('french-defense', 3,
  'Milner-Barry, dezamorsat cu Nd7', 'theirs',
  'e2e4 e7e6 d2d4 d7d5 e4e5 c7c5 c2c3 b8c6 g1f3 d8b6 f1d3 c8d7 e1g1 c5d4 c3d4 c6d4 f3d4 b6d4',
  'Aceeaşi poziţie ca la prima capcană, cu o singură deosebire: ai strecurat Nd7 înainte să iei pionul. Pare o mutare modestă de dezvoltare. E însă exact antidotul — nebunul acoperă câmpul de pe care venea şahul de la b5, iar fără şahul acela albul n-are cum să ajungă la dama ta de pe d4. Dacă albul joacă gambitul oricum, luarea e curată: după 8...Cxd4 9.Cxd4 Dxd4 eşti cu un pion în plus şi evaluarea e −0,29, adică în favoarea ta. Aceeaşi capturare, alt rezultat, doar fiindcă o mutare a fost pusă înainte.'
);
select public.seed_trap_link('french-defense', 3, 'C', 11);
select public.seed_trap_moves('french-defense', 3, '{
  "10": "Albul îşi dezvoltă nebunul pe d3 şi îţi oferă acelaşi pion de d4.",
  "11": "Nd7 — mutarea care schimbă totul. Nu atacă nimic şi nu pare grăbită, dar acoperă b5, câmpul de unde ar veni şahul.",
  "12": "Albul face rocada şi îşi lasă pionul în continuare acolo.",
  "13": "Schimbi în centru.",
  "14": "Albul reia.",
  "15": "Cxd4 — acum poţi lua. Aceeaşi mutare care mai devreme pierdea dama.",
  "16": "Albul ia calul.",
  "17": "Dxd4 — reiei cu dama şi rămâi cu un pion în plus. Şahul de la b5 nu mai există, fiindcă nebunul tău stă pe drum."
}'::jsonb);


-- ============================================================
-- 4. Nebunul pleacă de pe c1 — cade albul
-- ============================================================
select public.seed_trap('french-defense', 4,
  'Nebunul pleacă de pe c1 şi b2 rămâne singur', 'theirs',
  'e2e4 e7e6 d2d4 d7d5 e4e5 c7c5 c2c3 b8c6 g1f3 d8b6 c1e3 c5d4 c3d4 b6b2',
  'Perechea capcanei a doua, întoarsă. Acolo pionul de b2 era apărat de nebunul din c1 şi luarea pierdea dama. Aici albul joacă 6.Ne3, îşi mută chiar nebunul acela, şi pionul rămâne fără pază. Evaluarea cade pe loc de la +0,34 la −1,34, înainte ca tu să fi luat ceva. După 6...cxd4 7.cxd4 Dxb2 iei pionul, iar dama iese teafără: am urmărit opt semi-mutări mai departe şi nu e prinsă nicăieri. Deosebirea dintre cele două capcane e o singură piesă, mutată o singură dată. De asta se numără apărătorii înainte, nu după.'
);
select public.seed_trap_link('french-defense', 4, 'C', 11);
select public.seed_trap_moves('french-defense', 4, '{
  "9": "Db6 — dama la post, cu ochii pe b2.",
  "10": "GREŞEALA ALBULUI! Ne3 pare o dezvoltare firească, dar mută exact piesa care păzea b2. Evaluarea cade pe loc, înainte să iei ceva.",
  "11": "Schimbi întâi în centru, ca să nu-ţi rămână dama prinsă după.",
  "12": "Albul reia cu pionul.",
  "13": "Dxb2 — acum pionul chiar e liber. Nu e nimeni care să-l apere şi nimeni care să-ţi prindă dama."
}'::jsonb);


-- ============================================================
-- 5. Tarrasch: acelaşi pion de d4, altă socoteală — cade negrul
-- ============================================================
select public.seed_trap('french-defense', 5,
  'Tarrasch: d4 pare de luat, dar dama nu poate relua', 'ours',
  'e2e4 e7e6 d2d4 d7d5 b1d2 g8f6 e4e5 f6d7 c2c3 c7c5 f1d3 b8c6 g1e2 c5d4 c3d4 c6d4 e2d4',
  'În lecţia de teorie, aici se joacă f6. Tentaţia e altă mutare: pionul de d4 e atacat de două ori şi apărat o dată, deci pare de luat. Numai că, spre deosebire de Varianta Avans, aici dama ta e pe d8, iar drumul ei spre d4 e blocat de propriul tău cal de pe d7. Deci după 8...Cxd4 9.Cxd4 nu ai cu ce relua: ai dat un cal pentru un pion. Evaluarea trece de la +0,36 la +2,33. Aceeaşi socoteală de atacatori şi apărători, alt rezultat — fiindcă socoteala nu ţine cont de cine poate ajunge efectiv acolo.'
);
select public.seed_trap_link('french-defense', 5, 'B', 12);
select public.seed_trap_moves('french-defense', 5, '{
  "11": "Negrul îşi aduce calul pe c6, a doua piesă îndreptată spre d4.",
  "12": "Ce2 — îţi aperi pionul încă o dată. Acum e atacat de două ori şi apărat de două ori, dar negrul poate să nu observe.",
  "13": "Negrul schimbă în centru.",
  "14": "Reiei cu pionul.",
  "15": "GREŞEALA! Negrul ia pe d4. Numărătoarea lui spune că iese pe plus, dar a numărat şi dama de pe d8 — care n-are cum să ajungă, fiindcă i-o blochează propriul cal de pe d7.",
  "16": "Cxd4 — iei calul şi nu mai are cu ce relua. Un cal pentru un pion."
}'::jsonb);
