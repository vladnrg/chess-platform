-- ============================================================
-- Jocul de mijloc devine exerciţiu, nu tabel
-- ============================================================
-- Planurile din 041 erau text: bune de citit, inutile de exersat. Butonul
-- „Parcurge ideile din jocul de mijloc" din antrenorul de deschideri exista
-- deja şi afişa „în pregătire" — promisiune făcută utilizatorilor şi neonorată.
--
-- Acum planul are mutări. Pleci din poziţia exactă în care s-a terminat
-- deschiderea şi îl joci, întâi ghidat, apoi pe cont propriu — aceeaşi
-- mecanică cu deschiderea, fiindcă e aceeaşi deprindere.
--
-- Mutările nu sunt „teorie obligatorie": sunt planul pus în practică. Rostul
-- lor e să arate ORDINEA în care se fac lucrurile, nu să fie memorate.
-- ============================================================

alter table public.middlegame_plans
  /** Continuarea, în UCI, plecând din poziţia de la finalul liniei de deschidere. */
  add column if not exists moves_uci text,
  /** Explicaţii pe semi-mutare, indexate de la 0 — aceeaşi convenţie ca la
      `opening_lines.move_explanations`. */
  add column if not exists move_explanations jsonb not null default '{}'::jsonb;


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

revoke execute on function public.seed_plan_moves(text, text, text, jsonb) from authenticated;


-- ============================================================
-- CARO-KANN — continuările
-- ============================================================

-- A. Varianta Clasică. Deschiderea se termină după 10.Dxd3, cu negrul la mutare.
-- Planul: te dezvolţi, faci rocada, apoi spargi cu c5 — exact ordinea din coloană.
select public.seed_plan_moves('caro-kann-defense', 'A',
  'e7e6 c1d2 g8f6 e1c1 f8e7 c1b1 e8g8 g3e4 f6e4 d3e4 d7f6 e4e2 c6c5',
  '{
    "0": "Acum poţi închide cu ...e6. Nebunul de c8 e deja schimbat, deci pionul ăsta nu mai blochează pe nimeni — asta e toată diferenţa faţă de Franceză.",
    "2": "Calul de la g8, nu celălalt: cel de pe d7 stă bine unde e şi ţine c5 şi e5.",
    "3": "Albul merge cu regele lung. De acum ştii de unde vine atacul lui: de pe flancul regelui, cu pionii.",
    "4": "Nebunul pe e7, simplu. Nu-l pune pe d6, unde ar sta în calea propriului plan cu c5.",
    "6": "Rocada scurtă e sigură aici: albul şi-a împins pionii h, dar n-a adus încă nicio piesă spre regele tău.",
    "8": "Schimbi calul care ţi-l ataca. Cu cât se schimbă mai multe piese, cu atât spaţiul lui în plus contează mai puţin.",
    "10": "Cu tempo pe damă. Fiecare mutare care câştigă timp te apropie de momentul spargerii.",
    "12": "Spargerea. Aici era tot planul: structura ta cerea c5, iar acum ai toate piesele la locul lor. Poziţia se deschide exact când îţi convine ţie."
  }'::jsonb
);

-- B. Varianta Avans, după 9...Ne4. Centrul e închis, deci jocul se mută pe flancuri.
select public.seed_plan_moves('caro-kann-defense', 'B',
  'f2f3 e4g6 e1c2 g8e7 c1e3 e7f5 e3f2 h7h5',
  '{
    "1": "Nebunul se retrage pe g6, unde e apărat de propriul pion. De asta conta să nu-l fi lăsat fără câmpuri mai devreme.",
    "3": "Calul porneşte spre f5. Într-un centru închis nu contează viteza, ci unde ajung piesele.",
    "5": "Ajuns. De pe f5 apasă pe d4 şi pe e3, iar albul nu-l poate alunga uşor.",
    "7": "Îl ancorezi cu pionul. Fără ...h5, albul joacă g4 şi calul tău e dat afară din cel mai bun câmp de pe tablă."
  }'::jsonb
);

-- C. Varianta Schimb, după 10.c5. Albul a luat spaţiu pe flancul damei; pionul
-- de c5 e şi ţinta lui, şi a ta.
select public.seed_plan_moves('caro-kann-defense', 'C',
  'b7b6 b2b4 b6c5 b4c5 a5c6 d3b5 c8d7',
  '{
    "0": "Singura spargere corectă. Pionul de c5 pare că-ţi ia spaţiu, dar e şi ţinta ta: îl loveşti la bază.",
    "2": "Schimbi în centru. Nu te teme că-i deschizi coloana b — o vei folosi şi tu.",
    "4": "Calul se întoarce în joc şi atacă direct pionul de c5. De pe a5 nu făcea nimic.",
    "6": "Apărare simplă. Nu-i permiţi schimbul pe c6, care ţi-ar strica structura de pioni tocmai când poziţia se deschide."
  }'::jsonb
);
