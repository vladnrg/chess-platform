-- ============================================================
-- 145 · „Giuoco Piano cu 4…d6" stă lângă „Giuoco Piano"
--
-- Capitolul nou din migrarea 144 e o ramură a lui 3…Nc5. Cu grupul „4…d6" se
-- ordona singur, după procent, şi ajungea după Apărarea celor doi cai. Grupul
-- „3…Nc5, 4…d6" îl ţine în grupul lui 3…Nc5 (aplicaţia ia prima mutare drept
-- cheie), iar eticheta spune ambele mutări.
-- ============================================================

update public.opening_lines l set grup = '3…Nc5, 4…d6'
  from public.courses c where c.id = l.course_id and c.slug = 'italian-game' and l.variation_code = 'A2';
