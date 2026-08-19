-- ============================================================
-- La promovare alege jucătorul, nu programul
-- ============================================================
-- Exerciţiul spunea „Transformă pionul în regină — mută-l pe e8", iar programul
-- punea regina automat. Dar regula pe care o predă lecţia e chiar alegerea:
-- pionul ajuns la capăt poate deveni regină, tură, nebun sau cal.
--
-- Tabla arată acum cele patru piese şi aşteaptă. Instrucţiunea nu mai poate
-- cere o anume piesă, altfel ar contrazice ecranul.
--
-- „e7e8q" rămâne în `correct_move`: din el se citesc doar pătratele de plecare
-- şi de sosire, iar litera de la coadă nu mai decide nimic.

update public.lessons
set exercises = replace(
      exercises::text,
      'Transformă pionul în regină — mută-l pe e8',
      'Transformă pionul — mută-l pe e8, apoi alege ce piesă devine'
    )::jsonb
where exercises::text like '%Transformă pionul în regină%';


-- ============================================================
-- Dovada
-- ============================================================
select
  (select count(*) from public.lessons
     where exercises::text like '%Transformă pionul în regină%')          as "mai_cere_regina",
  (select count(*) from public.lessons
     where exercises::text like '%apoi alege ce piesă devine%')           as "cere_alegerea";
