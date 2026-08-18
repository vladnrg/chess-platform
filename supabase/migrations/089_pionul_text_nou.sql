-- ============================================================
-- Lecţia „Pionul": altă frază de încheiere
-- ============================================================
-- „Este cea mai mică piesă, dar poate deveni Damă la capătul tablei!" spunea
-- despre pion ce e acum, nu de ce contează. Fraza nouă spune la ce foloseşte:
-- că pare neînsemnat la început şi decide partida la sfârşit.
--
-- Textul s-a schimbat şi în 007, ca o instalare nouă să pornească direct cu el.
-- Migrarea asta e pentru bazele care au rulat deja 007.
--
-- Caută după text, nu după id: aşa merge indiferent de ce id are lecţia în baza
-- ta, şi nu face nimic dacă a fost deja rulată.

update public.lessons
set theory_html = replace(
      theory_html,
      'Este cea mai mică piesă, dar poate deveni Damă la capătul tablei!',
      'La începutul partidei nu face nimic spectaculos, dar poate să-ți câștige meciul după promovarea în regină.'
    )
where theory_html like '%Este cea mai mică piesă, dar poate deveni Damă la capătul tablei!%';

-- Dovada, la final: trebuie să apară lecţia „Pionul" cu fraza nouă.
select title, theory_html
from public.lessons
where theory_html like '%promovarea în regină%';
