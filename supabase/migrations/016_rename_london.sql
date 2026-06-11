-- Migration 016: redenumire curs London
UPDATE public.courses
SET title = 'Sistemul Londra'
WHERE slug = 'london-system';
