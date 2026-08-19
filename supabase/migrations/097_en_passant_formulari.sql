-- ============================================================
-- En passant: două formulări schimbate
-- ============================================================
-- A doua frază din teorie spunea regula împărţită în trei bucăţi („se poate
-- doar imediat" / „la mutarea următoare" / „dacă joci altceva"). Acum o spune
-- dintr-o dată, ca avertisment.
--
-- Iar cerinţa primului exerciţiu spunea ce se întâmplă („capturează pionul de
-- pe d5"), nu ce are omul de făcut cu mâna. Copilul se uită la tablă şi trebuie
-- să tragă o piesă; asta scrie acum.
--
-- Pătratele rămân scrise cu literă mică, ca pe marginea tablei şi ca în tot
-- restul aplicaţiei.

update public.lessons
set
  theory_html = replace(
    theory_html,
    '<p>Se poate <strong>doar imediat</strong>, la mutarea următoare. Dacă joci altceva, dreptul se pierde.</p>',
    '<p><strong>Important:</strong> dacă nu capturezi pe mutarea imediat următoare acel pion, șansa de En Passant se pierde.</p>'
  ),
  exercises = replace(
    exercises::text,
    'En passant! Capturează pionul negru de pe d5 — mută pe d6',
    'Trage pionul tău de pe e5 pe d6'
  )::jsonb
where title = 'En passant';


-- ============================================================
-- Dovada: prima cifră 0, celelalte două 1
-- ============================================================
select
  (select count(*) from public.lessons
     where theory_html like '%dreptul se pierde%')                     as "fraza_veche",
  (select count(*) from public.lessons
     where theory_html like '%șansa de En Passant se pierde%')         as "fraza_noua",
  (select count(*) from public.lessons
     where exercises::text like '%Trage pionul tău de pe e5 pe d6%')   as "cerinta_noua";
