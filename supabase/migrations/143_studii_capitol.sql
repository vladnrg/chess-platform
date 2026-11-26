-- ============================================================
-- 143 · Studiile capitolului
--
-- Cerut pe 2026-11-26, ca la Chessly: un capitol se împarte în studii
-- („Linia principală", „Negrul joacă 6…Nb6, 7…Cxe4", …), fiecare cu variantele
-- lui, parcurse în seturi de câte două. `studii` = [{ titlu, variante: [i…] }],
-- unde 0 = rândul însuşi (linia principală) şi k = variante[k - 1].
-- Lipsă (null) = aplicaţia le calculează ca până acum.
-- ============================================================

alter table public.opening_lines add column if not exists studii jsonb;

comment on column public.opening_lines.studii is
  'Studiile capitolului: [{titlu, variante:[index]}]; 0 = linia principală, k = variante[k-1] (2026-11-26).';
