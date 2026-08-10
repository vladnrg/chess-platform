-- ============================================================
-- Lecţii care se rupeau la jumătate: greşelile de tipar
-- ============================================================
-- Treisprezece variante din catalog conţineau o mutare imposibil de jucat.
-- Antrenorul o încearcă, eşuează, şi lecţia se opreşte acolo — omul rămâne
-- blocat în mijlocul ei, fără să înţeleagă de ce.
--
-- Cinci dintre ele sunt simple greşeli de tipar: câmpul de destinaţie era
-- corect, doar cel de plecare era scris greşit, iar în poziţie exista o
-- singură mutare legală care se potriveşte. Acelea sunt reparate aici.
--
--   Gambitul Damei / A      c4e7 -> g5e7   (nebunul de pe g5 ia pe e7)
--   Sistemul Colle / A      d2e5 -> f3e5   (calul de pe f3, nu cel de pe d2)
--   Apărarea Olandeză / C   b1c2 -> a3c2   (calul se întoarce de pe a3)
--   Apărarea Alekhine / A   f8f5 -> c8f5   (nebunul de c8, nu cel de f8)
--   Ruy Lopez / B           b8a5 -> c6a5   (calul de pe c6)
--
-- Verificat după reparare: toate cinci se joacă acum până la ultima mutare.
--
-- Ce NU e aici, şi de ce:
--   · Partida Italiană / A şi Jocul Vienez / B au tot greşeli de tipar, dar
--     reparate ajung la −2,41 şi −2,68 pentru cursantul care le învaţă. Sunt
--     cursuri de alb care predau albului o linie pierdută. Le repar pe fond,
--     nu doar ca să meargă.
--   · Celelalte şase cer o hotărâre, nu o corectură: mutarea scrisă e
--     imposibilă în principiu, nu doar prost tastată.
-- ============================================================

create or replace function public.repara_linie(
  p_slug text, p_code text, p_moves text
)
returns void language plpgsql security definer as $$
begin
  update public.opening_lines l
     set moves_uci = p_moves
    from public.courses c
   where l.course_id = c.id and c.slug = p_slug and l.variation_code = p_code;
end;
$$;

revoke execute on function public.repara_linie(text, text, text) from authenticated;


select public.repara_linie('queens-gambit', 'A', 'd2d4 d7d5 c2c4 e7e6 b1c3 g8f6 c1g5 f8e7 e2e3 e8g8 g1f3 b8d7 a1c1 c7c6 f1d3 d5c4 d3c4 f6d5 g5e7 d8e7');
select public.repara_linie('colle-system', 'A', 'd2d4 d7d5 g1f3 g8f6 e2e3 e7e6 f1d3 c7c5 b2b3 b8c6 e1g1 f8d6 c1b2 e8g8 b1d2 b7b6 f3e5 c8b7 f2f4');
select public.repara_linie('dutch-defense', 'C', 'd2d4 f7f5 g1f3 g8f6 g2g3 e7e6 f1g2 f8e7 e1g1 e8g8 c2c4 d7d5 b2b3 c7c6 c1a3 e7a3 b1a3 f6e4 a3c2 b8d7');
select public.repara_linie('alekhine-defense', 'A', 'e2e4 g8f6 e4e5 f6d5 d2d4 d7d6 c2c4 d5b6 f2f4 c8f5 c1e3 e7e6 b1c3 f8e7 g1f3 e8g8 f1e2 d6e5 f4e5');
select public.repara_linie('ruy-lopez', 'B', 'e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 g8f6 e1g1 f8e7 f1e1 b7b5 a4b3 d7d6 c2c3 e8g8 h2h3 c6a5 b3c2 c7c5');


-- ------------------------------------------------------------
-- Două texte care descriau altă mutare decât cea de sub ele
-- ------------------------------------------------------------
-- Gambitul Damei, semi-mutarea 18: textul vorbea despre luarea pe c4, care se
-- întâmplă cu două semi-mutări mai devreme. Sub el se joacă acum Nxe7.
update public.opening_lines l
   set move_explanations = jsonb_set(
         l.move_explanations, '{18}',
         to_jsonb('Nxe7 — schimbi nebunii pe e7. Negrul reia cu dama, iar tu rămâi cu structura clasică din Gambitul Damei Refuzat: centru aşezat, piese fără slăbiciuni.'::text))
  from public.courses c
 where l.course_id = c.id and c.slug = 'queens-gambit' and l.variation_code = 'A';

-- Apărarea Alekhine: explicaţiile erau decalate cu o poziţie. Textul despre
-- demolarea centrului stătea peste dezvoltarea albului, cu o semi-mutare mai
-- devreme decât mutarea pe care o descrie.
update public.opening_lines l
   set move_explanations =
         jsonb_set(
           jsonb_set(l.move_explanations, '{16}',
             to_jsonb('Albul îşi termină dezvoltarea, cu nebunul pe e2.'::text)),
           '{17}',
           to_jsonb('dxe5 — abia acum loveşti. L-ai lăsat să-şi umfle centrul patru mutări la rând, iar acum îl demontezi de la bază.'::text))
  from public.courses c
 where l.course_id = c.id and c.slug = 'alekhine-defense' and l.variation_code = 'A';


-- Verificare, după rulare: niciuna din cele cinci variante nu trebuie să mai
-- conţină mutarea veche.
--   select c.slug, l.variation_code from public.opening_lines l
--     join public.courses c on c.id = l.course_id
--    where l.moves_uci like '%c4e7%' or l.moves_uci like '%d2e5%'
--       or l.moves_uci like '%b1c2%' or l.moves_uci like '%f8f5%'
--       or l.moves_uci like '%b8a5%';
