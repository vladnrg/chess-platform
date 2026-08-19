-- ============================================================
-- Numele deschiderilor rămân cele oficiale
-- ============================================================
-- Migrarea 091 a redenumit piesa din damă în regină peste tot — inclusiv în
-- numele deschiderilor, care nu sunt descrieri, ci denumiri. „Gambitul Damei"
-- e numele consacrat în şahul românesc: aşa apare în cărţi, aşa îl caută
-- oamenii, aşa se traduce „Queen's Gambit". „Gambitul Reginei" ar fi un nume pe
-- care nu-l foloseşte nimeni altcineva.
--
-- Piesa rămâne regina peste tot în rest. Singura excepţie e numele propriu.
--
-- Forma cu genitiv („Gambitului Reginei") se schimbă prima: nu se suprapune cu
-- cealaltă, dar ordinea o face evidentă pentru cine citeşte.

create or replace function public.__numele_oficiale(t text) returns text
language sql immutable as $fn$
  select replace(replace(t,
    'Gambitului Reginei', 'Gambitului Damei'),
    'Gambitul Reginei',   'Gambitul Damei')
$fn$;

update public.courses set
  title       = public.__numele_oficiale(title),
  description = public.__numele_oficiale(description);

update public.opening_lines set
  variation_name    = public.__numele_oficiale(variation_name),
  move_explanations = public.__numele_oficiale(move_explanations::text)::jsonb;

update public.middlegame_plans set
  structure         = public.__numele_oficiale(structure),
  avoid             = public.__numele_oficiale(avoid),
  ideas             = public.__numele_oficiale(ideas::text)::jsonb,
  move_explanations = public.__numele_oficiale(move_explanations::text)::jsonb;

update public.opening_traps set
  title             = public.__numele_oficiale(title),
  explanation       = public.__numele_oficiale(explanation),
  move_explanations = public.__numele_oficiale(move_explanations::text)::jsonb;

update public.lessons set
  title       = public.__numele_oficiale(title),
  theory_html = public.__numele_oficiale(theory_html),
  exercises   = public.__numele_oficiale(exercises::text)::jsonb;

drop function if exists public.__numele_oficiale(text);


-- ============================================================
-- Dovada
-- ============================================================
-- Prima cifră trebuie să fie 0 (niciun „Gambitul Reginei" rămas), a doua > 0
-- (numele oficial e la locul lui), iar a treia 0 — piesa e în continuare
-- regina peste tot, adică redenumirea din 091 n-a fost anulată din greşeală.
select
  (select count(*) from public.opening_lines
     where variation_name like '%Reginei%'
        or move_explanations::text like '%Gambitul Reginei%')      as "nume_gresite_ramase",
  (select count(*) from public.courses where title like '%Gambitul Damei%') as "cursul_cu_nume_oficial",
  (select count(*) from public.lessons
     where exercises::text ~ '\m[Dd]am')                           as "lectii_cu_dama";
