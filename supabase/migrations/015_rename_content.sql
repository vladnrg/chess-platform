-- Migration 015: redenumiri de conținut pentru ton kid-friendly (adolescenți)

-- Cursul fundamental de reguli — titlu mai descriptiv
UPDATE public.courses
SET title = 'Mișcarea pieselor pe tabla de joc'
WHERE slug = 'piese-in-miscare';
