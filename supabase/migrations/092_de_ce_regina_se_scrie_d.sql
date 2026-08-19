-- ============================================================
-- Lecţia de abrevieri: de ce regina se scrie tot D
-- ============================================================
-- Migrarea 091 trebuia să adauge explicaţia asta, dar căuta „D=Regina" — cu
-- „a" la sfârşit. În lecţie scria „D=Damă", care după redenumire a devenit
-- „D=Regină", cu „ă". Aşa că lecţia a rămas spunând „D = Regină" şi atât, iar
-- un copil care citeşte are tot dreptul să creadă că e o greşeală de tipar.
--
-- Litera nu se schimbă: D e abrevierea oficială din notaţia română. Se schimbă
-- doar ce scrie în jurul ei.

update public.lessons
set theory_html = replace(
      theory_html,
      '<strong>D</strong>=Regină',
      '<strong>D</strong>=Regină (litera vine de la „damă", cum i se spunea înainte)')
where theory_html like '%<strong>D</strong>=Regină%'
  and theory_html not like '%cum i se spunea înainte%';

-- Dovada: lecţia „Abrevierile pieselor" cu explicaţia în ea.
select title, theory_html
from public.lessons
where theory_html like '%cum i se spunea înainte%';
