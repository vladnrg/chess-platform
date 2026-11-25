-- ============================================================
-- 135 · Mutarea cheie a capitolului: 4.d3 la Apărarea celor doi cai
--
-- Cerut pe 2026-11-25. Capitolul se desparte de celelalte la 3…Cf6, deci
-- mini-tabla de la început se oprea acolo, dar miezul variantei e 4.d3.
--   · mutare_cheie: semi-mutarea (de la 0) până la care joacă mini-tabla şi
--     pe care o colorează violet; d2d3 e a 7-a semi-mutare, deci 6.
--   · intro_extra: textul utilizatorului, pus după fraza de început.
-- ============================================================

alter table public.opening_lines add column if not exists intro_extra text;
alter table public.opening_lines add column if not exists mutare_cheie smallint;

update public.opening_lines l
   set mutare_cheie = 6,
       intro_extra = 'Vom explora ce se întâmplă după mutarea aparent precaută d2-d3. Începem cu e4, preluând controlul asupra centrului.'
  from public.courses c
 where c.id = l.course_id
   and c.slug = 'italian-game'
   and l.variation_code = 'B';

do $$
declare m text;
begin
  select split_part(l.moves_uci, ' ', l.mutare_cheie + 1) into m
    from public.opening_lines l join public.courses c on c.id = l.course_id
   where c.slug = 'italian-game' and l.variation_code = 'B';
  if m is distinct from 'd2d3' then
    raise exception 'Apărarea celor doi cai: mutarea cheie e %, aşteptat d2d3', m;
  end if;
end $$;
