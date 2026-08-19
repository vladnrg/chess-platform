-- ============================================================
-- „Capturează", nu „atacă". Şi un şah-mat care nu era şah-mat.
-- ============================================================
-- Două lucruri găsite de aceeaşi verificare: am luat fiecare exerciţiu şi m-am
-- uitat dacă pătratul pe care aterizează piesa e ocupat.


-- ============================================================
-- 1. Unde se ia o piesă, verbul e „capturează"
-- ============================================================
-- „Atacă pionul de pe d5 cu regina" — dar regina chiar îl ia. A ataca înseamnă
-- a-l ţine sub bătaie de la distanţă; aici piesa dispare de pe tablă. Sunt
-- două lucruri diferite, iar copilul le învaţă acum pe amândouă cu acelaşi
-- cuvânt.
--
-- „Atacă centrul cu d4" rămâne cum e: acolo pionul chiar nu ia nimic.
update public.lessons
set exercises = (
  replace(replace(
    exercises::text,
    'Atacă pionul de pe d5 cu regina',
      'Capturează pionul de pe d5 cu regina'),
    'Atacă pionul adversarului de pe d8 cu tura',
      'Capturează pionul adversarului de pe d8 cu tura')
)::jsonb
where exercises::text like '%Atacă pionul%';


-- ============================================================
-- 2. Şah-matul care mânca regele
-- ============================================================
-- Exerciţiul spunea „Dă şah-mat! Mută regina pe g8", iar pe g8 stătea chiar
-- regele negru. Mutarea cerută era `Qxg8` — adică luarea regelui, ceea ce în
-- şah nu se întâmplă niciodată. Poziţia nici măcar nu era legală: negrul era în
-- şah, dar la mutare era albul.
--
-- Poziţia nouă: regele negru în colţ la h8, regele alb pe f7 (el ţine g8 şi g7),
-- regina pe g1. Qg1-g8 e şah-mat adevărat — regele nu poate lua regina, fiindcă
-- e apărată, şi n-are unde fugi. Verificat cu chess.js înainte de scris aici.
update public.lessons
set exercises = (
  replace(replace(
    exercises::text,
    '6k1/6Q1/8/8/8/8/8/6K1 w - - 0 1', '7k/5K2/8/8/8/8/8/6Q1 w - - 0 1'),
    '"correct_move": "g7g8"', '"correct_move": "g1g8"')
)::jsonb
where title = 'Șah, șah-mat și remiză';


-- ============================================================
-- Dovada: ambele cifre trebuie să fie 0
-- ============================================================
select
  (select count(*) from public.lessons
     where exercises::text like '%Atacă pionul%')                  as "atacuri_care_erau_capturi",
  (select count(*) from public.lessons
     where exercises::text like '%6k1/6Q1/8/8/8/8/8/6K1%')         as "pozitii_cu_regele_de_luat";
