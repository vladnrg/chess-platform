-- ============================================================
-- „Tura", peste tot. „Turnul" nu mai apare în niciun curs.
-- ============================================================
-- Piesa se numeşte tură, la feminin. Migrarea 022 curăţase deja textele de
-- atunci, dar de la ea încoace au intrat în bază patru cursuri de deschideri,
-- planurile de mijloc de partidă, capcanele şi lecţia de promovare — iar în
-- ele „turnul" s-a întors: 178 de apariţii, în patru tabele.
--
-- Schimbarea nu e doar a substantivului. Când el trece la feminin, trece cu
-- tot ce se acordă cu el: „un turn adus acolo" devine „o tură adusă acolo",
-- „al doilea turn alb" devine „a doua tură albă", „turnul e apărat" devine
-- „tura e apărată". Frazele astea se corectează pe bucata lor de text, întreagă,
-- înainte ca substantivul să se schimbe — aşa fiecare atinge exact fraza ei.
-- Restul sunt formele obişnuite ale cuvântului, cu graniţă de cuvânt, ca
-- „turneu", „turnee" sau „return" să rămână neatinse.
--
-- Toate cele 45 de înlocuiri au fost rulate întâi pe copia citită din baza
-- reală, iar cele 170 de fraze rezultate au fost citite una câte una.

create or replace function pg_temp.tura(t text) returns text language plpgsql immutable as $f$
declare
  p text[];
  r text := t;
  -- fraze întregi, cu tot cu acord
  acorduri text[][] := array[
      array['Turnul e apărat de calul de pe e7', 'Tura e apărată de calul de pe e7'],
      array['iar turnul e deja pregătit', 'iar tura e deja pregătită'],
      array['Turnul pe e7, cu al doilea gata să vină pe e8', 'Tura pe e7, cu a doua gata să vină pe e8'],
      array['Turnul care ajunge primul acolo o ţine', 'Tura care ajunge prima acolo o ţine'],
      array['Turnul care ajunge primul acolo n-o câştigă, dar îl obligă pe celălalt', 'Tura care ajunge prima acolo n-o câştigă, dar o obligă pe cealaltă'],
      array['Un turn adus acolo face', 'O tură adusă acolo face'],
      array['cu turnul de pe a8, nu cu celălalt', 'cu tura de pe a8, nu cu cealaltă'],
      array['al doilea turn alb îşi ia coloana', 'a doua tură albă îşi ia coloana'],
      array['Un turn pe rândul al patrulea arată ciudat şi e chiar bun', 'O tură pe rândul al patrulea arată ciudat şi e chiar bună'],
      array['Fiecare turn pe care îl aduci pe una din coloanele centrale îl ţine acolo', 'Fiecare tură pe care o aduci pe una din coloanele centrale o ţine acolo'],
      array['turnul de pe f1 se leagă cu celălalt', 'tura de pe f1 se leagă cu cealaltă'],
      array['turnului tău', 'turei tale'],
      array['Turnului tău', 'Turei tale']
  ];
  -- formele cuvântului, cu graniţă de cuvânt
  reguli text[][] := array[
      array['turnul tău', 'tura ta'],
      array['Turnul tău', 'Tura ta'],
      array['turnul său', 'tura sa'],
      array['Turnul său', 'Tura sa'],
      array['turnul meu', 'tura mea'],
      array['Turnul meu', 'Tura mea'],
      array['celălalt turn', 'cealaltă tură'],
      array['Celălalt turn', 'Cealaltă tură'],
      array['al doilea turn', 'a doua tură'],
      array['Al doilea turn', 'A doua tură'],
      array['primul turn', 'prima tură'],
      array['Primul turn', 'Prima tură'],
      array['acest turn', 'această tură'],
      array['Acest turn', 'Această tură'],
      array['un turn', 'o tură'],
      array['Un turn', 'O tură'],
      array['turnul alb', 'tura albă'],
      array['turnul negru', 'tura neagră'],
      array['turn alb', 'tură albă'],
      array['turn negru', 'tură neagră'],
      array['Turnurilor', 'Turelor'],
      array['turnurilor', 'turelor'],
      array['Turnurile', 'Turele'],
      array['turnurile', 'turele'],
      array['Turnuri', 'Ture'],
      array['turnuri', 'ture'],
      array['Turnului', 'Turei'],
      array['turnului', 'turei'],
      array['Turnul', 'Tura'],
      array['turnul', 'tura'],
      array['Turn', 'Tură'],
      array['turn', 'tură']
  ];
begin
  if r is null then return null; end if;
  foreach p slice 1 in array acorduri loop
    r := replace(r, p[1], p[2]);
  end loop;
  foreach p slice 1 in array reguli loop
    r := regexp_replace(r, '\m' || p[1] || '\M', p[2], 'g');
  end loop;
  return r;
end
$f$;

update public.lessons set
    title = pg_temp.tura(title),
    theory_html = pg_temp.tura(theory_html),
    exercises = case when exercises is null then null else pg_temp.tura(exercises::text)::jsonb end,
    key_positions = case when key_positions is null then null else pg_temp.tura(key_positions::text)::jsonb end;

update public.courses set
    title = pg_temp.tura(title),
    description = pg_temp.tura(description);

update public.opening_lines set
    variation_name = pg_temp.tura(variation_name),
    move_explanations = case when move_explanations is null then null else pg_temp.tura(move_explanations::text)::jsonb end;

update public.middlegame_plans set
    structure = pg_temp.tura(structure),
    avoid = pg_temp.tura(avoid),
    ideas = case when ideas is null then null else pg_temp.tura(ideas::text)::jsonb end,
    move_explanations = case when move_explanations is null then null else pg_temp.tura(move_explanations::text)::jsonb end;

update public.opening_traps set
    title = pg_temp.tura(title),
    explanation = pg_temp.tura(explanation),
    move_explanations = case when move_explanations is null then null else pg_temp.tura(move_explanations::text)::jsonb end;

drop function pg_temp.tura(text);


-- ============================================================
-- Dovada: trebuie să iasă 0 peste tot
-- ============================================================
-- Câte rânduri mai conţin cuvântul, sub oricare din formele lui, în fiecare
-- tabel cu text de curs.
select
  (select count(*) from public.lessons
     where coalesce(title, '') || coalesce(theory_html, '') || coalesce(exercises::text, '') || coalesce(key_positions::text, '') ~ '\m[Tt]urn(ul|ului|uri|urile|urilor)?\M')  as "lessons",
  (select count(*) from public.courses
     where coalesce(title, '') || coalesce(description, '') ~ '\m[Tt]urn(ul|ului|uri|urile|urilor)?\M')  as "courses",
  (select count(*) from public.opening_lines
     where coalesce(variation_name, '') || coalesce(move_explanations::text, '') ~ '\m[Tt]urn(ul|ului|uri|urile|urilor)?\M')  as "opening_lines",
  (select count(*) from public.middlegame_plans
     where coalesce(structure, '') || coalesce(avoid, '') || coalesce(ideas::text, '') || coalesce(move_explanations::text, '') ~ '\m[Tt]urn(ul|ului|uri|urile|urilor)?\M')  as "middlegame_plans",
  (select count(*) from public.opening_traps
     where coalesce(title, '') || coalesce(explanation, '') || coalesce(move_explanations::text, '') ~ '\m[Tt]urn(ul|ului|uri|urile|urilor)?\M')  as "opening_traps";
