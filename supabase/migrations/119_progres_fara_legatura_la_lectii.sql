-- 119_progres_fara_legatura_la_lectii.sql
-- Progresul din cursurile de deschideri se salvează, în sfârşit.
--
-- `last_lesson_id` (001) era legat de `public.lessons`. Doar că el ţine „unde ai
-- rămas" în orice fel de curs: o lecţie la cursurile fundamentale, o variantă
-- (`opening_lines`) sau o capcană (`opening_traps`) la cele de deschideri. Pentru
-- ultimele două, baza respingea toată salvarea (23503, cheie străină), iar
-- antrenorul înghiţea eroarea — deci nicio variantă parcursă nu ajungea în
-- `completed_lesson_ids`, iar traseul cursului nu bifa nimic. Găsit pe
-- 2026-10-29, cu un cont de test.
--
-- Coloana rămâne un simplu id: cine o citeşte (pagina cursului) o compară cu
-- id-urile paşilor, nu face join cu lecţiile.
-- Idempotentă.

alter table public.user_course_progress
  drop constraint if exists user_course_progress_last_lesson_id_fkey;

-- Dovadă (trebuie să iasă: 0)
select count(*) as legaturi_ramase
from information_schema.table_constraints
where table_schema = 'public' and table_name = 'user_course_progress'
  and constraint_name = 'user_course_progress_last_lesson_id_fkey';
