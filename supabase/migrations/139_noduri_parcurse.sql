-- ============================================================
-- 139 · Paşii de pe traseul capitolelor, cu data terminării
--
-- Cerut pe 2026-11-25, ca pe Chessly: fără bife pe noduri; un pas deblocat
-- apare fără lacăt, pasul la care ai ajuns are „Te afli aici", iar la un curs
-- terminat pasul terminat cel mai recent are „Ultimul studiu completat".
-- Până acum se ţinea minte doar studiul primului pas (`completed_lesson_ids`),
-- aşa că exersările nu se marcau niciodată şi traseul se oprea la ele.
--
-- `noduri_parcurse` = { "<id nod>": "<când, ISO>" }, scris de antrenor la
-- capătul ultimei variante dintr-un pas.
-- ============================================================

alter table public.user_course_progress
  add column if not exists noduri_parcurse jsonb not null default '{}'::jsonb;
