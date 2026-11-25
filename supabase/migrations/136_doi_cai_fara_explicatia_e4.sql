-- ============================================================
-- 136 · Apărarea celor doi cai: fără „e4 — deschizi în centru."
--
-- Cerut pe 2026-11-25. Textul de început al capitolului (migrarea 135) spune
-- deja „Începem cu e4, preluând controlul asupra centrului.", iar explicaţia
-- primei mutări, afişată imediat dedesubt, repeta acelaşi lucru. Se scoate
-- doar la acest capitol; la celelalte nu există fraza care o dublează.
-- ============================================================

update public.opening_lines l
   set move_explanations = l.move_explanations - '0'
  from public.courses c
 where c.id = l.course_id
   and c.slug = 'italian-game'
   and l.variation_code = 'B';

do $$
declare e jsonb;
begin
  select l.move_explanations into e
    from public.opening_lines l join public.courses c on c.id = l.course_id
   where c.slug = 'italian-game' and l.variation_code = 'B';
  if e ? '0' then
    raise exception 'Apărarea celor doi cai: explicaţia mutării 0 a rămas';
  end if;
  if not (e ? '1') then
    raise exception 'Apărarea celor doi cai: s-au pierdut şi alte explicaţii';
  end if;
end $$;
