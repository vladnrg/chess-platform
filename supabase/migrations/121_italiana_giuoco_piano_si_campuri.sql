-- 121_italiana_giuoco_piano_si_campuri.sql
-- Cerut pe 2026-11-21:
--   1) marcaje pe tablă lângă textul unei mutări: câmpuri-cheie în roz şi săgeţi
--      roşii/verzi care arată o idee (coloana nouă `move_marks`);
--   2) Partida Italiană, capitolul 1 (Giuoco Piano, vs Nc5): textele rescrise de
--      utilizator, cu f7, f2 şi d4 marcate şi cu ideea Cxe4? dxc5 desenată;
--   3) „pătrat" → „câmp" în lecţii: cele 64 de căsuţe ale tablei sunt câmpuri.
--
-- Afirmaţiile de şah din texte sunt trecute prin Stockfish
-- (scripts/verificari/italiana-a.mjs). Două au fost nuanţate faţă de cerere:
--   - după 9.exd5, Cxd5 e cea mai bună mutare (−0,16), dar nu singura: Ce7 (−0,33);
--   - după 10.Db3, Cce7 (−0,17) nu e singura apărare: Ca5 (0,00, după Da4+ Cc6
--     Db3 se repetă poziţia) şi Ne6 (−0,23, dă pionul de pe b7) sunt la fel de bune.
-- Idempotentă.

-- ── 1) Marcajele ─────────────────────────────────────────────────────────────
-- { "<semi-mutarea ta>": { "squares": ["f7"],
--                          "arrows": [{ "from": "f6", "to": "e4", "color": "red" }] } }
alter table public.opening_lines    add column if not exists move_marks jsonb;
alter table public.middlegame_plans add column if not exists move_marks jsonb;

-- ── 2) Giuoco Piano ──────────────────────────────────────────────────────────
-- Câte un text pe semi-mutare: balonul de dinaintea mutării tale pune textul
-- mutării adversarului deasupra textului mutării tale.
update public.opening_lines
set
  move_explanations = $j${
    "0":  "Deschizi cu e4 și preiei controlul centrului.",
    "1":  "Adversarul răspunde cu e5 și îți ține piept în centru.",
    "2":  "Acum dezvoltăm o piesă prin Cf3 — pionul de pe e5 se află acum sub atac. Așa arată o mutare bună de deschidere: face două lucruri deodată.",
    "3":  "Cc6 apără pionul de pe e5.",
    "4":  "Vom juca Nc4 — nebunul țintește pionul de pe f7, punctul cel mai slab din tabăra adversă, fiindcă acesta este apărat doar de rege.",
    "5":  "Adversarul se dezvoltă la rândul său prin Nc5, țintind pionul nostru slab de pe f2 — o mutare în oglindă cu mutarea noastră precedentă.",
    "6":  "Jucăm c3, o mutare aparent inofensivă, dar cu care ne pregătim să preluăm controlul centrului.",
    "7":  "Adversarul își dezvoltă celălalt cal și îți atacă pionul de pe e4.",
    "8":  "Deși pare contraintuitiv, vom ignora această amenințare și vom acapara centrul, jucând pionul pe d4, apărat de pionul de pe c3, de calul de pe f3 și de regina de pe d1. Adversarul nu are timp să câștige pionul de pe e4, pentru că și-ar pierde nebunul.",
    "9":  "exd4 este mutarea naturală pentru a scăpa de presiunea atacului.",
    "10": "Noi vom recaptura cu pionul, punând din nou presiune pe nebunul de câmpuri negre, care este forțat să se mute.",
    "11": "Acesta se va muta cu tempo pe b4, dându-ne șah.",
    "12": "Vom bloca șahul prin Nd2, propunând astfel un schimb de nebuni.",
    "13": "Adversarul acceptă schimbul.",
    "14": "Noi vom captura nebunul prin Cbxd2, apărând astfel pionul nostru central de pe e4.",
    "15": "d5 — adversarul lovește în centru, singurul mod prin care poate scăpa de presiune.",
    "16": "Vom captura prin exd5, deschizând astfel coloana e. Păstrăm controlul asupra centrului cu ajutorul pionului de pe d4.",
    "17": "Cea mai firească mutare este Cxd5: adversarul recâștigă pionul, iar calul ajunge în centru.",
    "18": "Db3 — regina se dezvoltă cu două amenințări concomitente: țintește, pe de o parte, calul de pe d5 și, în al doilea rând, obligă nebunul de pe c8 să monitorizeze în continuare pionul de pe b7. De asemenea, dacă calul de pe d5 se retrage, nebunul va putea captura pe f7 cu șah.\n\nNegrul are trei apărări: Cce7, o mutare pasivă prin care nu pierde material; Ca5, care alungă regina — după Da4+ Cc6 Db3 poziția se repetă; și Ne6, prin care dă pionul de pe b7 în schimbul dezvoltării. Deschiderea s-a încheiat cu material egal, un pion cu care menținem controlul asupra centrului și o poziție solidă, fără slăbiciuni."
  }$j$::jsonb,
  move_marks = $j${
    "4": { "squares": ["f7"] },
    "6": { "squares": ["f2", "d4"] },
    "8": { "arrows": [
      { "from": "f6", "to": "e4", "color": "red" },
      { "from": "d4", "to": "c5", "color": "green" }
    ] }
  }$j$::jsonb,
  -- Textele noi stau în move_explanations; comentariile vechi pe mutare, dacă ar
  -- exista, ar avea întâietate în balon şi le-ar ascunde.
  move_comments = null
where id = '6934b8f5-a458-41d5-962e-8d6d7325a503'
  and moves_uci = 'e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 c2c3 g8f6 d2d4 e5d4 c3d4 c5b4 c1d2 b4d2 b1d2 d7d5 e4d5 f6d5 d1b3';

-- ── 3) „pătrat" → „câmp" în lecţii ───────────────────────────────────────────
-- Formele lungi întâi, ca „pătrate" să nu muşte din „pătratele". „Interiorul
-- pătratului" rămâne: acolo e regula pătratului din finaluri, o figură desenată
-- pe tablă, nu o căsuţă.
create or replace function pg_temp.campuri(t text) returns text as $f$
  select replace(replace(replace(replace(replace(replace(replace(replace(
           t,
           'interiorul pătratului', 'interiorul §REGULA§'),
           'pătratelor', 'câmpurilor'),
           'pătratele', 'câmpurile'),
           'pătratului', 'câmpului'),
           'pătratul', 'câmpul'),
           'pătrate', 'câmpuri'),
           'pătrat', 'câmp'),
           'interiorul §REGULA§', 'interiorul pătratului')
$f$ language sql immutable;

update public.lessons
set theory_html = pg_temp.campuri(theory_html),
    exercises   = pg_temp.campuri(exercises::text)::jsonb
where theory_html like '%pătrat%' or exercises::text like '%pătrat%';

-- ── Dovada ───────────────────────────────────────────────────────────────────
do $$
declare
  rest int;
begin
  select count(*) into rest from public.lessons
  where replace(coalesce(theory_html, '') || exercises::text, 'interiorul pătratului', '') like '%pătrat%';
  if rest > 0 then
    raise exception 'Mai sunt % lecţii cu „pătrat"', rest;
  end if;

  if not exists (
    select 1 from public.opening_lines
    where id = '6934b8f5-a458-41d5-962e-8d6d7325a503'
      and move_marks -> '4' -> 'squares' ? 'f7'
      and move_explanations ->> '0' = 'Deschizi cu e4 și preiei controlul centrului.'
  ) then
    raise exception 'Giuoco Piano nu a primit textele noi';
  end if;
end $$;
