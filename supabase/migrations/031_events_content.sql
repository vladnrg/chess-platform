-- ============================================================
-- Conţinutul evenimentelor: cosmetice, Calendar de Crăciun, chessathon,
-- „Numește deschiderea", zilele marilor jucători, promoţia de Paşti
-- ============================================================
-- Mecanismul e în 030. Aici e doar ce se vede.
--
-- Regulă respectată peste tot: nu inventez poziţii de şah. Sarcinile de tip
-- `puzzle` au `puzzle_id = null`, ceea ce înseamnă „un puzzle pe măsura ta",
-- ales dintre cele care există deja în bază. Când vom avea poziţii reale din
-- partidele fiecărui jucător, se completează cu un update.
--
-- (Comentariul spunea iniţial „cele 128 verificate". Numărul era greşit —
-- sunt 565; numărătoarea rata id-urile Lichess cu majuscule.)
-- ============================================================


-- ============================================================
-- 1. Catalogul de cosmetice
-- ============================================================
insert into public.cosmetics (id, kind, name, description, rarity, payload) values
  -- Badge-uri
  ('badge_advent_2026', 'badge', 'Brad de Crăciun 2026',
   'Ai deschis toate cele 24 de uşi ale calendarului.', 'legendary',
   '{"emoji": "🎄", "color": "#4ade80"}'),
  ('badge_chessathon_iarna', 'badge', 'Chessathon de iarnă',
   'Ţi-ai atins ţinta în maratonul dintre sărbători.', 'epic',
   '{"emoji": "⚡", "color": "#E2B340"}'),
  ('badge_deschideri', 'badge', 'Cunoscător de deschideri',
   'Le recunoşti după primele mutări.', 'rare',
   '{"emoji": "📖", "color": "#8B5CF6"}'),
  ('badge_ziua_sahului', 'badge', 'Ziua Internaţională a Şahului',
   'Ai sărbătorit pe 20 iulie, cum se cuvine.', 'rare',
   '{"emoji": "♟️", "color": "#2DD4BF"}'),
  ('badge_paste_2027', 'badge', 'Ou încondeiat 2027',
   'Găsit de Paşti, printre celelalte.', 'epic',
   '{"emoji": "🥚", "color": "#FB7185"}'),
  ('badge_mari_maestri', 'badge', 'Fan al marilor maeştri',
   'Le ştii zilele de naştere mai bine decât ale rudelor.', 'rare',
   '{"emoji": "⭐", "color": "#FFD700"}'),

  -- Teme de tablă. Culorile sunt pentru câmpurile deschise şi închise.
  ('board_gheata', 'board', 'Gheaţă',
   'Alb-albăstruie, ca un lac îngheţat.', 'epic',
   '{"light": "#E8F1F5", "dark": "#7BA3B8"}'),
  ('board_primavara', 'board', 'Primăvară',
   'Verde crud, de început de aprilie.', 'rare',
   '{"light": "#F0F4E3", "dark": "#86A86B"}'),
  ('board_nuc', 'board', 'Nuc',
   'Lemn cald, ca tablele vechi de club.', 'rare',
   '{"light": "#E8D5B7", "dark": "#8B5A3C"}'),
  ('board_miez_de_noapte', 'board', 'Miez de noapte',
   'Pentru partidele care nu se mai termină.', 'epic',
   '{"light": "#6E7B94", "dark": "#2C3550"}'),
  ('board_smarald', 'board', 'Smarald',
   'Verdele turneelor mari.', 'legendary',
   '{"light": "#EAF2E6", "dark": "#3E7B5A"}')
on conflict (id) do update set
  kind = excluded.kind, name = excluded.name,
  description = excluded.description, rarity = excluded.rarity,
  payload = excluded.payload;


-- ============================================================
-- 2. Ajutoare de populare
-- ============================================================
-- Fără ele, seed-ul de mai jos ar fi câteva sute de linii de INSERT repetat.
-- Rămân în bază (nu le şterg la final) fiindcă vei mai adăuga evenimente, iar
-- atunci un singur apel e de ajuns.

create or replace function public.upsert_event(
  p_slug text, p_kind text, p_title text, p_tagline text, p_description text,
  p_starts timestamptz, p_ends timestamptz,
  p_icon text default 'Sparkles', p_accent text default '#E2B340',
  p_config jsonb default '{}'::jsonb, p_published boolean default true
)
returns uuid language plpgsql security definer as $$
declare
  v_id uuid;
begin
  insert into public.events
    (slug, kind, title, tagline, description, starts_at, ends_at,
     icon, accent_color, config, is_published)
  values
    (p_slug, p_kind, p_title, p_tagline, p_description, p_starts, p_ends,
     p_icon, p_accent, p_config, p_published)
  on conflict (slug) do update set
    kind = excluded.kind, title = excluded.title, tagline = excluded.tagline,
    description = excluded.description, starts_at = excluded.starts_at,
    ends_at = excluded.ends_at, icon = excluded.icon,
    accent_color = excluded.accent_color, config = excluded.config,
    is_published = excluded.is_published
  returning id into v_id;

  return v_id;
end;
$$;

revoke execute on function public.upsert_event(
  text, text, text, text, text, timestamptz, timestamptz,
  text, text, jsonb, boolean) from authenticated;


create or replace function public.upsert_event_task(
  p_event_id uuid, p_order integer, p_title text, p_prompt text,
  p_type text, p_payload jsonb default '{}'::jsonb,
  p_xp integer default 0, p_cosmetic text default null,
  p_available timestamptz default null, p_puzzle_id text default null
)
returns uuid language plpgsql security definer as $$
declare
  v_id uuid;
begin
  insert into public.event_tasks
    (event_id, order_index, title, prompt, task_type, payload,
     xp_reward, cosmetic_reward, available_at, puzzle_id)
  values
    (p_event_id, p_order, p_title, p_prompt, p_type, p_payload,
     p_xp, p_cosmetic, p_available, p_puzzle_id)
  on conflict (event_id, order_index) do update set
    title = excluded.title, prompt = excluded.prompt,
    task_type = excluded.task_type, payload = excluded.payload,
    xp_reward = excluded.xp_reward, cosmetic_reward = excluded.cosmetic_reward,
    available_at = excluded.available_at, puzzle_id = excluded.puzzle_id
  returning id into v_id;

  return v_id;
end;
$$;

revoke execute on function public.upsert_event_task(
  uuid, integer, text, text, text, jsonb, integer, text, timestamptz, text)
  from authenticated;


-- O „zi a jucătorului": un eveniment de 24 de ore, cu o întrebare despre el şi
-- un puzzle pe măsura ta.
create or replace function public.seed_player_day(
  p_slug text, p_title text, p_tagline text, p_description text,
  p_day date, p_quiz_prompt text, p_options text[], p_answer integer,
  p_explanation text, p_accent text default '#E2B340'
)
returns uuid language plpgsql security definer as $$
declare
  v_ev uuid;
  v_start timestamptz;
begin
  -- Ziua întreagă, ora României
  v_start := (p_day::text || ' 00:00:00+02')::timestamptz;

  v_ev := public.upsert_event(
    p_slug, 'player_day', p_title, p_tagline, p_description,
    v_start, v_start + interval '1 day',
    'Star', p_accent,
    jsonb_build_object('celebrates', p_title), true
  );

  perform public.upsert_event_task(
    v_ev, 1, 'Cât de bine îl cunoşti?', p_quiz_prompt, 'quiz',
    jsonb_build_object(
      'options', to_jsonb(p_options),
      'answer', p_answer,
      'explanation', p_explanation
    ),
    25, null, null, null
  );

  perform public.upsert_event_task(
    v_ev, 2, 'Puzzle-ul zilei',
    'Un exerciţiu pe măsura ta, în cinstea zilei.', 'puzzle',
    '{}'::jsonb, 40, 'badge_mari_maestri', null, null
  );

  return v_ev;
end;
$$;

revoke execute on function public.seed_player_day(
  text, text, text, text, date, text, text[], integer, text, text)
  from authenticated;


-- ============================================================
-- 3. Calendar de Crăciun 2026 — 24 de uşi
-- ============================================================
do $$
declare
  v_ev uuid;
  v_day integer;
  v_open timestamptz;
  v_xp integer;
  -- Uşile cu întrebare. Zilele 12 şi 24 au ramuri proprii mai sus, deci nu apar
  -- aici: sunt uşi cu premiu, nu cu întrebare.
  v_quiz_days integer[] := array[3, 6, 9, 15, 18, 21];
begin
  v_ev := public.upsert_event(
    'craciun-2026', 'advent',
    'Calendar de Crăciun',
    '24 de uşi, câte una pe zi, până la Crăciun.',
    'În fiecare dimineaţă de decembrie se deschide o uşă nouă. În spatele ei: '
    'un puzzle, o întrebare sau o poveste din istoria şahului. Uşile trecute '
    'rămân deschise, dar nu poţi sări înainte. Cine le deschide pe toate '
    'primeşte bradul de Crăciun lângă nume şi tabla „Gheaţă".',
    '2026-12-01 00:00:00+02', '2026-12-26 23:59:59+02',
    'Gift', '#4ade80',
    '{"doors": 24}'::jsonb, true
  );

  for v_day in 1..24 loop
    v_open := ('2026-12-' || lpad(v_day::text, 2, '0') || ' 00:00:00+02')::timestamptz;
    -- Creşte spre Crăciun: ziua 1 dă 20 XP, ziua 24 dă 90
    v_xp := 20 + ((v_day - 1) * 70) / 23;

    if v_day = 24 then
      -- Uşa mare
      perform public.upsert_event_task(
        v_ev, 24, 'Ajunul Crăciunului',
        'Ultima uşă. Un puzzle pe măsura ta — şi bradul e al tău.',
        'puzzle', '{}'::jsonb, 150, 'badge_advent_2026', v_open, null
      );
    elsif v_day = 12 then
      perform public.upsert_event_task(
        v_ev, 12, 'Jumătatea drumului',
        'Douăsprezece uşi deschise. Tabla „Gheaţă" e a ta.',
        'puzzle', '{}'::jsonb, 60, 'board_gheata', v_open, null
      );
    elsif v_day = any(v_quiz_days) then
      perform public.upsert_event_task(
        v_ev, v_day, 'Uşa ' || v_day,
        'O întrebare din istoria şahului.', 'quiz',
        case v_day
          when 3 then jsonb_build_object(
            'options', to_jsonb(array['Wilhelm Steinitz','Emanuel Lasker','Paul Morphy','José Raúl Capablanca']),
            'answer', 0,
            'explanation', 'Steinitz e considerat primul campion mondial oficial, din 1886.')
          when 6 then jsonb_build_object(
            'options', to_jsonb(array['8','16','32','64']),
            'answer', 3,
            'explanation', 'Tabla are 64 de câmpuri, 8 pe 8.')
          when 9 then jsonb_build_object(
            'options', to_jsonb(array['Turnul','Nebunul','Calul','Dama']),
            'answer', 2,
            'explanation', 'Calul e singura piesă care sare peste alte piese.')
          when 15 then jsonb_build_object(
            'options', to_jsonb(array['Rocada','En passant','Promovarea','Şahul dublu']),
            'answer', 1,
            'explanation', 'Captura „en passant" e singura în care piesa capturată nu stă pe câmpul unde ajunge cea care capturează.')
          when 18 then jsonb_build_object(
            'options', to_jsonb(array['Garry Kasparov','Bobby Fischer','Anatoli Karpov','Mihail Tal']),
            'answer', 1,
            'explanation', 'Fischer a câştigat titlul mondial în 1972, la Reykjavík, împotriva lui Boris Spasski.')
          when 21 then jsonb_build_object(
            'options', to_jsonb(array['Deep Blue','AlphaZero','Stockfish','Fritz']),
            'answer', 0,
            'explanation', 'Deep Blue l-a învins pe Kasparov într-un meci în 1997 — prima dată când un computer bătea campionul mondial în vigoare.')
          else '{}'::jsonb
        end,
        v_xp, null, v_open, null
      );
    else
      perform public.upsert_event_task(
        v_ev, v_day, 'Uşa ' || v_day,
        'Un puzzle pe măsura ta.', 'puzzle',
        '{}'::jsonb, v_xp, null, v_open, null
      );
    end if;
  end loop;
end $$;


-- Prima uşă are întrebarea despre campionul mondial; textul întrebării stă în
-- `prompt`, nu în payload, ca să se poată schimba fără să atingem variantele.
update public.event_tasks t set prompt = q.prompt
from (values
  (3,  'Cine e considerat primul campion mondial oficial la şah?'),
  (6,  'Câte câmpuri are o tablă de şah?'),
  (9,  'Care piesă poate sări peste altele?'),
  (15, 'Care mutare specială capturează un pion care tocmai a avansat două câmpuri?'),
  (18, 'Cine a câştigat meciul pentru titlul mondial din 1972?'),
  (21, 'Care program a învins primul un campion mondial în vigoare?')
) as q(idx, prompt)
where t.order_index = q.idx
  and t.event_id = (select id from public.events where slug = 'craciun-2026');


-- ============================================================
-- 4. Chessathon de iarnă
-- ============================================================
select public.upsert_event(
  'chessathon-iarna-2026', 'chessathon',
  'Chessathon de iarnă',
  'Săptămâna dintre Crăciun şi Anul Nou. Strânge 500 XP.',
  'Zilele libere dintre sărbători sunt cele mai bune pentru şah şi cele mai '
  'proaste pentru orice altceva. Tot XP-ul strâns între 26 decembrie şi 2 '
  'ianuarie contează — din puzzle-uri, lecţii, partide, orice. La 500 XP '
  'primeşti tabla „Smarald" şi badge-ul de chessathon. Se vede şi cât a '
  'strâns comunitatea la un loc.',
  '2026-12-26 00:00:00+02', '2027-01-02 23:59:59+02',
  'Zap', '#E2B340',
  '{"target_xp": 500, "reward_cosmetic": "board_smarald"}'::jsonb, true
);

-- Badge-ul de chessathon se ia din a doua ţintă, la 1000 XP. Îl legăm de o
-- sarcină, ca să apară în listă ca obiectiv vizibil.
do $$
declare v_ev uuid;
begin
  select id into v_ev from public.events where slug = 'chessathon-iarna-2026';
  perform public.upsert_event_task(
    v_ev, 1, 'Ţinta de 500 XP',
    'Se ridică automat din pagina evenimentului, când ajungi acolo.',
    'info', '{}'::jsonb, 0, null, null, null
  );
end $$;


-- ============================================================
-- 5. „Numește deschiderea"
-- ============================================================
-- Douăzeci de deschideri, recunoscute după primele mutări. Evenimentul stă
-- deschis tot anul: e conţinut de învăţat, nu o sărbătoare.
do $$
declare
  v_ev uuid;
begin
  v_ev := public.upsert_event(
    'numeste-deschiderea', 'name_opening',
    'Numește deschiderea',
    'Douăzeci de deschideri, recunoscute după primele mutări.',
    'Fiecare întrebare arată începutul unei partide. Tu spui cum se cheamă. '
    'Sunt deschiderile pe care le vezi la masa întâi a marilor turnee — '
    'Candidaţi, Campionatul Mondial, Wijk aan Zee. Le recunoşti pe toate şi '
    'primeşti badge-ul „Cunoscător de deschideri".',
    '2026-08-01 00:00:00+02', '2027-12-31 23:59:59+02',
    'BookOpen', '#8B5CF6',
    '{}'::jsonb, true
  );

  perform public.upsert_event_task(v_ev, 1, 'Spaniolă sau Italiană?',
    '1.e4 e5 2.Cf3 Cc6 3.Nb5', 'quiz', jsonb_build_object(
      'options', to_jsonb(array['Partida Italiană','Partida Spaniolă (Ruy López)','Partida Scoţiană','Gambitul Regelui']),
      'answer', 1,
      'explanation', 'Nebunul pe b5, atacând calul care apără pionul e5, e semnătura Spaniolei. Nebunul pe c4 ar fi fost Italiana.'),
    30, null, null, null);

  perform public.upsert_event_task(v_ev, 2, 'Cea mai jucată apărare',
    '1.e4 c5', 'quiz', jsonb_build_object(
      'options', to_jsonb(array['Apărarea Franceză','Apărarea Caro-Kann','Apărarea Siciliană','Apărarea Scandinavă']),
      'answer', 2,
      'explanation', 'Siciliana e cel mai popular răspuns la 1.e4 la toate nivelurile. Negrul luptă pentru centru din lateral.'),
    30, null, null, null);

  perform public.upsert_event_task(v_ev, 3, 'Fianchetto pe flancul regelui',
    '1.d4 Cf6 2.c4 g6 3.Cc3 Ng7 4.e4 d6', 'quiz', jsonb_build_object(
      'options', to_jsonb(array['Apărarea Indiană a Regelui','Apărarea Grünfeld','Apărarea Nimzo-Indiană','Apărarea Olandeză']),
      'answer', 0,
      'explanation', 'Negrul cedează centrul, apoi îl atacă. Arma de bază a lui Kasparov şi Fischer împotriva lui 1.d4.'),
    30, null, null, null);

  perform public.upsert_event_task(v_ev, 4, 'Zidul de pioni',
    '1.e4 e6', 'quiz', jsonb_build_object(
      'options', to_jsonb(array['Caro-Kann','Franceză','Siciliana','Pirc']),
      'answer', 1,
      'explanation', 'Franceza. Solidă, dar nebunul de c8 rămâne închis — problema centrală a deschiderii.'),
    30, null, null, null);

  perform public.upsert_event_task(v_ev, 5, 'Solidă, fără nebun închis',
    '1.e4 c6', 'quiz', jsonb_build_object(
      'options', to_jsonb(array['Apărarea Franceză','Apărarea Caro-Kann','Apărarea Alehin','Apărarea Modernă']),
      'answer', 1,
      'explanation', 'Caro-Kann. Aceeaşi idee ca Franceza — d5 — dar nebunul de c8 iese înainte să se închidă lanţul.'),
    30, null, null, null);

  perform public.upsert_event_task(v_ev, 6, 'Cel mai vechi gambit serios',
    '1.d4 d5 2.c4', 'quiz', jsonb_build_object(
      'options', to_jsonb(array['Gambitul Damei','Gambitul Regelui','Gambitul Evans','Gambitul Budapesta']),
      'answer', 0,
      'explanation', 'Gambitul Damei. „Gambit" doar cu numele: pionul de c4 se recuperează aproape întotdeauna.'),
    30, null, null, null);

  perform public.upsert_event_task(v_ev, 7, 'Nebunul ţinteşte f7',
    '1.e4 e5 2.Cf3 Cc6 3.Nc4', 'quiz', jsonb_build_object(
      'options', to_jsonb(array['Partida Spaniolă','Partida Italiană','Partida Vienei','Apărarea celor doi cai']),
      'answer', 1,
      'explanation', 'Italiana — cea mai veche deschidere analizată serios, şi cea mai bună pentru începători.'),
    30, null, null, null);

  perform public.upsert_event_task(v_ev, 8, 'Ţintuire pe calul de c3',
    '1.d4 Cf6 2.c4 e6 3.Cc3 Nb4', 'quiz', jsonb_build_object(
      'options', to_jsonb(array['Apărarea Indiană a Damei','Apărarea Nimzo-Indiană','Apărarea Bogo-Indiană','Apărarea Grünfeld']),
      'answer', 1,
      'explanation', 'Nimzo-Indiana. Nebunul ţintuieşte calul şi se schimbă pe el, stricând structura albului.'),
    30, null, null, null);

  perform public.upsert_event_task(v_ev, 9, 'Dama iese devreme',
    '1.e4 d5', 'quiz', jsonb_build_object(
      'options', to_jsonb(array['Apărarea Scandinavă','Apărarea Alehin','Gambitul Damei','Apărarea Pirc']),
      'answer', 0,
      'explanation', 'Scandinava. După 2.exd5 Dxd5 3.Cc3, dama e atacată — dar teoria arată că negrul stă bine.'),
    30, null, null, null);

  perform public.upsert_event_task(v_ev, 10, 'Romantism pur',
    '1.e4 e5 2.f4', 'quiz', jsonb_build_object(
      'options', to_jsonb(array['Gambitul Damei','Gambitul Regelui','Partida Vienei','Gambitul Letton']),
      'answer', 1,
      'explanation', 'Gambitul Regelui. Albul dă un pion pentru centru şi atac. Aproape dispărut la vârf, încă letal sub 2000.'),
    35, null, null, null);

  perform public.upsert_event_task(v_ev, 11, 'Centrul se dă ca să fie atacat',
    '1.d4 Cf6 2.c4 g6 3.Cc3 d5', 'quiz', jsonb_build_object(
      'options', to_jsonb(array['Apărarea Indiană a Regelui','Apărarea Grünfeld','Apărarea Benoni','Apărarea Slavă']),
      'answer', 1,
      'explanation', 'Grünfeld. Negrul lasă albul să-şi facă un centru mare, apoi îl demolează cu piese. Favorita lui Kasparov şi Svidler.'),
    35, null, null, null);

  perform public.upsert_event_task(v_ev, 12, 'Calul provoacă pionii',
    '1.e4 Cf6', 'quiz', jsonb_build_object(
      'options', to_jsonb(array['Apărarea Alehin','Apărarea Pirc','Apărarea Modernă','Apărarea Nimzowitsch']),
      'answer', 0,
      'explanation', 'Alehin. Calul se lasă fugărit ca albul să-şi întindă pionii prea mult — provocare pură.'),
    35, null, null, null);

  perform public.upsert_event_task(v_ev, 13, 'Pionul f, imediat',
    '1.d4 f5', 'quiz', jsonb_build_object(
      'options', to_jsonb(array['Apărarea Olandeză','Apărarea Benoni','Gambitul Budapesta','Apărarea Modernă']),
      'answer', 0,
      'explanation', 'Olandeza. Negrul joacă pentru atac pe flancul regelui, cu preţul unei mici slăbiri în jurul propriului rege.'),
    35, null, null, null);

  perform public.upsert_event_task(v_ev, 14, 'Simetrie perfectă',
    '1.e4 e5 2.Cf3 Cf6', 'quiz', jsonb_build_object(
      'options', to_jsonb(array['Apărarea celor doi cai','Apărarea Rusă (Petrov)','Partida Vienei','Partida celor patru cai']),
      'answer', 1,
      'explanation', 'Apărarea Rusă. Negrul nu apără e5, ci contraatacă e4. Reputaţie de deschidere „de remiză" la vârf.'),
    35, null, null, null);

  perform public.upsert_event_task(v_ev, 15, 'Meciul din 2000',
    '1.e4 e5 2.Cf3 Cc6 3.Nb5 Cf6', 'quiz', jsonb_build_object(
      'options', to_jsonb(array['Varianta Berlin','Varianta Deschisă','Apărarea Marshall','Varianta Schimbului']),
      'answer', 0,
      'explanation', 'Varianta Berlin — arma cu care Kramnik i-a luat titlul lui Kasparov, la Londra în 2000. Kasparov n-a reuşit nicio victorie cu albul în acel meci.'),
    40, null, null, null);

  perform public.upsert_event_task(v_ev, 16, 'Nebunul în fianchetto, la alb',
    '1.d4 Cf6 2.c4 e6 3.g3', 'quiz', jsonb_build_object(
      'options', to_jsonb(array['Sistemul Londra','Deschiderea Catalană','Deschiderea Engleză','Sistemul Colle']),
      'answer', 1,
      'explanation', 'Catalana. Presiune lungă pe diagonala mare, fără riscuri. Kramnik a readus-o la modă la cel mai înalt nivel.'),
    40, null, null, null);

  perform public.upsert_event_task(v_ev, 17, 'Fără pion în centru, deocamdată',
    '1.c4', 'quiz', jsonb_build_object(
      'options', to_jsonb(array['Deschiderea Engleză','Deschiderea Réti','Deschiderea Bird','Atacul Grob']),
      'answer', 0,
      'explanation', 'Engleza. Flexibilă: poate transpune în aproape orice, motiv pentru care e greu de pregătit împotriva ei.'),
    40, null, null, null);

  perform public.upsert_event_task(v_ev, 18, 'Cea mai analizată variantă din şah',
    '1.e4 c5 2.Cf3 d6 3.d4 cxd4 4.Cxd4 Cf6 5.Cc3 a6', 'quiz', jsonb_build_object(
      'options', to_jsonb(array['Varianta Dragonului','Varianta Najdorf','Varianta Sveshnikov','Varianta Scheveningen']),
      'answer', 1,
      'explanation', 'Najdorf. Mutarea 5...a6 pare modestă, dar deschide una dintre cele mai adânci teorii din şah. Arma lui Fischer şi a lui Kasparov.'),
    40, null, null, null);

  perform public.upsert_event_task(v_ev, 19, 'Solidă, fără să închidă nebunul',
    '1.d4 d5 2.c4 c6', 'quiz', jsonb_build_object(
      'options', to_jsonb(array['Apărarea Slavă','Gambitul Damei acceptat','Apărarea Ortodoxă','Apărarea Tarrasch']),
      'answer', 0,
      'explanation', 'Slava. Apără d5 cu pionul c6 în loc de e6, ca nebunul de c8 să rămână liber — exact problema Ortodoxei.'),
    40, null, null, null);

  perform public.upsert_event_task(v_ev, 20, 'Ultima: centrul se deschide imediat',
    '1.e4 e5 2.Cf3 Cc6 3.d4', 'quiz', jsonb_build_object(
      'options', to_jsonb(array['Partida Italiană','Partida Scoţiană','Partida Ponziani','Gambitul Nordic']),
      'answer', 1,
      'explanation', 'Scoţiana. Deschide jocul din mutarea a treia. Kasparov a reînviat-o în anii ''90 ca alternativă la Spaniolă.'),
    50, 'badge_deschideri', null, null);
end $$;


-- ============================================================
-- 6. Zilele marilor jucători + Ziua Internaţională a Şahului
-- ============================================================
-- Următoarele 12 luni. Se adaugă altele cu un singur apel la `seed_player_day`.
select public.seed_player_day(
  'zi-erigaisi-2026', 'Ziua lui Arjun Erigaisi',
  'Cel mai rapid urcuş din generaţia indiană.',
  'Arjun Erigaisi a intrat în top 5 mondial înainte de 21 de ani, parte din valul '
  'indian care a schimbat ierarhia şahului în anii 2020.',
  '2026-09-03',
  'Din ce ţară vine valul de jucători tineri care a intrat în top 10 mondial în anii 2020 — Erigaisi, Gukesh, Praggnanandhaa?',
  array['China', 'India', 'Uzbekistan', 'Iran'], 1,
  'India. Gukesh, Erigaisi şi Praggnanandhaa au ajuns toţi în elita mondială în aceeaşi perioadă.',
  '#FF9933');

select public.seed_player_day(
  'zi-abdusattorov-2026', 'Ziua lui Nodirbek Abdusattorov',
  'Campion mondial la rapid la 17 ani.',
  'Nodirbek Abdusattorov a câştigat Campionatul Mondial de rapid în 2021, la 17 ani, '
  'într-un turneu în care i-a învins pe Carlsen şi pe Nepomniachtchi.',
  '2026-09-18',
  'La ce vârstă a câştigat Abdusattorov titlul mondial de rapid?',
  array['15 ani', '17 ani', '19 ani', '21 de ani'], 1,
  'La 17 ani, în 2021 — cel mai tânăr campion mondial de rapid din istorie la acel moment.',
  '#2DD4BF');

select public.seed_player_day(
  'zi-wesley-so-2026', 'Ziua lui Wesley So',
  'Regele şahului Fischer Random.',
  'Wesley So a câştigat primul Campionat Mondial oficial de Fischer Random (Chess960) '
  'în 2019, învingându-l pe Magnus Carlsen în finală.',
  '2026-10-09',
  'Ce variantă de şah, în care piesele de pe linia întâi sunt amestecate, a câştigat Wesley So la nivel mondial în 2019?',
  array['Şah bughouse', 'Fischer Random (Chess960)', 'Şah cu trei jucători', 'Şah atomic'], 1,
  'Fischer Random, numit şi Chess960: piesele de pe linia întâi se aşază aleatoriu, deci teoria de deschidere nu ajută.',
  '#8B5CF6');

select public.seed_player_day(
  'zi-ding-2026', 'Ziua lui Ding Liren',
  'Primul campion mondial din China.',
  'Ding Liren a devenit campion mondial în 2023, la Astana, după un meci decis la tiebreak '
  'împotriva lui Ian Nepomniachtchi.',
  '2026-10-24',
  'În ce an a devenit Ding Liren campion mondial?',
  array['2021', '2022', '2023', '2024'], 2,
  '2023, la Astana. Titlul rămăsese liber după ce Carlsen a refuzat să-l mai apere.',
  '#FB7185');

select public.seed_player_day(
  'zi-carlsen-2026', 'Ziua lui Magnus Carlsen',
  'Cel mai mare rating din istoria şahului.',
  'Magnus Carlsen a fost campion mondial din 2013 până în 2023, când a renunţat să-şi mai '
  'apere titlul. A atins 2882 puncte Elo, cel mai mare rating înregistrat vreodată.',
  '2026-11-30',
  'Care e cel mai mare rating Elo atins vreodată de Magnus Carlsen?',
  array['2851', '2872', '2882', '2900'], 2,
  '2882, în 2014 — recordul absolut din istoria clasamentului FIDE.',
  '#E2B340');

select public.seed_player_day(
  'zi-nakamura-2026', 'Ziua lui Hikaru Nakamura',
  'Cel mai cunoscut jucător de blitz din lume.',
  'Hikaru Nakamura a câştigat de cinci ori campionatul Statelor Unite şi a devenit, prin '
  'streaming, unul dintre oamenii care au adus şahul la un public complet nou.',
  '2026-12-09',
  'Prin ce a contribuit Nakamura, în afara turneelor, la popularizarea şahului?',
  array['Prin cărţi de deschideri', 'Prin streaming online', 'Prin antrenarea copiilor', 'Prin arbitraj'], 1,
  'Prin streaming. Explozia de interes pentru şah din 2020 i se datorează în bună parte.',
  '#2DD4BF');

select public.seed_player_day(
  'zi-anand-2026', 'Ziua lui Viswanathan Anand',
  'Omul care a deschis drumul şahului indian.',
  'Viswanathan Anand a fost campion mondial între 2007 şi 2013 şi primul mare maestru din '
  'India. Generaţia care domină azi a crescut uitându-se la el.',
  '2026-12-11',
  'Anand a fost primul mare maestru dintr-o ţară care azi are mai mulţi jucători în top 10. Care?',
  array['China', 'India', 'Filipine', 'Vietnam'], 1,
  'India. Anand a devenit mare maestru în 1988, primul din ţara lui.',
  '#FF9933');

select public.seed_player_day(
  'zi-fischer-2027', 'Ziua lui Bobby Fischer',
  'Meciul secolului, 1972.',
  'Bobby Fischer a câştigat titlul mondial în 1972 la Reykjavík, împotriva lui Boris Spasski — '
  'un meci urmărit în plin Război Rece de oameni care nu jucaseră şah niciodată.',
  '2027-03-09',
  'În ce oraş s-a jucat meciul Fischer–Spasski din 1972?',
  array['Moscova', 'Reykjavík', 'Belgrad', 'Buenos Aires'], 1,
  'Reykjavík, Islanda. Meciul a fost numit „meciul secolului".',
  '#C0C0C0');

select public.seed_player_day(
  'zi-gheorghiu-2027', 'Ziua lui Florin Gheorghiu',
  'Primul mare maestru al României.',
  'Florin Gheorghiu a devenit primul mare maestru român în 1965 şi a câştigat campionatul '
  'mondial de juniori în 1963. L-a învins pe Bobby Fischer la Olimpiada din 1970.',
  '2027-04-06',
  'Florin Gheorghiu a fost primul român care a obţinut care titlu?',
  array['Maestru FIDE', 'Maestru Internaţional', 'Mare Maestru', 'Arbitru Internaţional'], 2,
  'Mare Maestru, în 1965. A rămas multă vreme cel mai puternic jucător român.',
  '#FFD700');

select public.seed_player_day(
  'zi-kasparov-2027', 'Ziua lui Garry Kasparov',
  'Douăzeci de ani pe primul loc mondial.',
  'Garry Kasparov a fost campion mondial din 1985 până în 2000 şi a rămas numărul unu mondial '
  'aproape neîntrerupt până la retragere, în 2005.',
  '2027-04-13',
  'Împotriva cărui program a pierdut Kasparov un meci în 1997?',
  array['Deep Thought', 'Deep Blue', 'Fritz', 'Rybka'], 1,
  'Deep Blue, al IBM. Prima dată când un computer învingea campionul mondial în vigoare într-un meci.',
  '#FB7185');

select public.seed_player_day(
  'zi-gukesh-2027', 'Ziua lui Gukesh Dommaraju',
  'Cel mai tânăr campion mondial din istorie.',
  'Gukesh a câştigat titlul mondial în 2024, la 18 ani, devenind cel mai tânăr campion din '
  'istoria şahului.',
  '2027-05-29',
  'La ce vârstă a devenit Gukesh campion mondial?',
  array['16 ani', '18 ani', '20 de ani', '22 de ani'], 1,
  'La 18 ani, în 2024 — record absolut de precocitate pentru titlul mondial.',
  '#FF9933');

select public.seed_player_day(
  'zi-firouzja-2027', 'Ziua lui Alireza Firouzja',
  'Cel mai tânăr jucător care a trecut de 2800.',
  'Alireza Firouzja a depăşit 2800 de puncte Elo la 18 ani, mai devreme decât oricine — '
  'inclusiv decât Carlsen.',
  '2027-06-18',
  'Ce prag de rating a trecut Firouzja mai devreme decât oricine în istorie?',
  array['2600', '2700', '2800', '2900'], 2,
  '2800, la 18 ani. Un prag pe care puţini jucători din istorie l-au atins vreodată.',
  '#8B5CF6');

select public.seed_player_day(
  'zi-nepomniachtchi-2027', 'Ziua lui Ian Nepomniachtchi',
  'Două turnee ale Candidaţilor câştigate la rând.',
  'Ian Nepomniachtchi a câştigat Turneul Candidaţilor de două ori consecutiv, în 2020–21 şi '
  '2022, jucând două meciuri pentru titlul mondial.',
  '2027-07-14',
  'Cum se numeşte turneul care desemnează challenger-ul pentru titlul mondial?',
  array['Turneul Candidaţilor', 'Grand Prix-ul FIDE', 'Cupa Mondială', 'Olimpiada de Şah'], 0,
  'Turneul Candidaţilor. Câştigătorul joacă meciul pentru titlul mondial.',
  '#71797E');

select public.seed_player_day(
  'zi-caruana-2027', 'Ziua lui Fabiano Caruana',
  'Meciul din 2018: douăsprezece remize la rând.',
  'Fabiano Caruana l-a ţinut pe Carlsen la douăsprezece remize consecutive în meciul pentru '
  'titlul mondial din 2018 — titlul s-a decis abia la tiebreak-ul de rapid.',
  '2027-07-30',
  'Câte partide clasice din meciul mondial 2018 Carlsen–Caruana s-au terminat remiză?',
  array['Şase', 'Nouă', 'Toate cele douăsprezece', 'Niciuna'], 2,
  'Toate douăsprezece. Un record: titlul s-a decis la tiebreak, unde Carlsen a câştigat 3–0.',
  '#4ade80');


-- Ziua Internaţională a Şahului: 20 iulie, data înfiinţării FIDE (1924).
do $$
declare v_ev uuid;
begin
  v_ev := public.upsert_event(
    'ziua-sahului-2027', 'player_day',
    'Ziua Internaţională a Şahului',
    '20 iulie — ziua în care s-a înfiinţat FIDE, în 1924.',
    'Sărbătoarea şahului din toată lumea. Trei sarcini, badge la final şi tabla „Nuc" '
    'pentru cine le termină pe toate.',
    '2027-07-20 00:00:00+02', '2027-07-21 23:59:59+02',
    'Trophy', '#2DD4BF', '{}'::jsonb, true
  );

  perform public.upsert_event_task(v_ev, 1, 'De unde vine data',
    'Ce s-a întâmplat pe 20 iulie 1924, motiv pentru care ziua asta e Ziua Internaţională a Şahului?',
    'quiz', jsonb_build_object(
      'options', to_jsonb(array['S-a jucat prima partidă oficială','S-a înfiinţat FIDE','S-a născut primul campion mondial','S-a publicat primul regulament']),
      'answer', 1,
      'explanation', 'FIDE — federaţia internaţională de şah — s-a înfiinţat la Paris pe 20 iulie 1924.'),
    30, null, null, null);

  perform public.upsert_event_task(v_ev, 2, 'Puzzle-ul sărbătorii',
    'Un exerciţiu pe măsura ta.', 'puzzle', '{}'::jsonb, 50, null, null, null);

  perform public.upsert_event_task(v_ev, 3, 'Încă unul',
    'Şi ultimul — apoi badge-ul şi tabla sunt ale tale.', 'puzzle', '{}'::jsonb,
    70, 'badge_ziua_sahului', null, null);
end $$;


-- ============================================================
-- 7. Promoţia de Paşti 2027
-- ============================================================
-- ATENŢIE: Paştele ortodox din 2027 cade pe 2 mai. Dacă vrei alt an sau
-- Paştele catolic, schimbă cele două date de mai jos — restul se aliniază.
do $$
declare v_ev uuid;
begin
  v_ev := public.upsert_event(
    'paste-2027', 'promo',
    'Vânătoarea de ouă',
    'Şapte ouă ascunse în aplicaţie, în săptămâna Paştelui.',
    'În fiecare zi din săptămâna Paştelui se deschide un ou. În ele: XP, tabla '
    '„Primăvară" şi, în ultimul, badge-ul „Ou încondeiat". Cine le găseşte pe '
    'toate şapte primeşte şi o reducere la cursuri, valabilă până la finalul lunii.',
    '2027-04-26 00:00:00+03', '2027-05-03 23:59:59+03',
    'Egg', '#FB7185',
    '{"discount_pct": 30, "discount_note": "Reducerea se aplică la orice curs, până la 31 mai 2027."}'::jsonb,
    true
  );

  perform public.upsert_event_task(v_ev, 1, 'Primul ou',
    'Un puzzle pe măsura ta.', 'puzzle', '{}'::jsonb, 30, null,
    '2027-04-26 00:00:00+03', null);
  perform public.upsert_event_task(v_ev, 2, 'Al doilea ou',
    'Un puzzle pe măsura ta.', 'puzzle', '{}'::jsonb, 35, null,
    '2027-04-27 00:00:00+03', null);
  perform public.upsert_event_task(v_ev, 3, 'Al treilea ou',
    'Cum se numeşte mutarea prin care regele şi turnul se mută împreună?',
    'quiz', jsonb_build_object(
      'options', to_jsonb(array['En passant','Rocada','Promovarea','Şahul descoperit']),
      'answer', 1,
      'explanation', 'Rocada — singura mutare în care se mişcă două piese proprii deodată.'),
    40, null, '2027-04-28 00:00:00+03', null);
  perform public.upsert_event_task(v_ev, 4, 'Al patrulea ou',
    'Un puzzle pe măsura ta. În el e şi tabla „Primăvară".', 'puzzle', '{}'::jsonb,
    45, 'board_primavara', '2027-04-29 00:00:00+03', null);
  perform public.upsert_event_task(v_ev, 5, 'Al cincilea ou',
    'Un puzzle pe măsura ta.', 'puzzle', '{}'::jsonb, 50, null,
    '2027-04-30 00:00:00+03', null);
  perform public.upsert_event_task(v_ev, 6, 'Al şaselea ou',
    'În câte mutări cel puţin se poate da mat de la începutul partidei?',
    'quiz', jsonb_build_object(
      'options', to_jsonb(array['Două','Trei','Patru','Cinci']),
      'answer', 0,
      'explanation', 'Două — „matul nebunului": 1.f3 e5 2.g4 Dh4#. Cea mai rapidă înfrângere posibilă.'),
    55, null, '2027-05-01 00:00:00+03', null);
  perform public.upsert_event_task(v_ev, 7, 'Oul de Paşti',
    'Ultimul. Un puzzle pe măsura ta — şi oul încondeiat e al tău.', 'puzzle',
    '{}'::jsonb, 100, 'badge_paste_2027', '2027-05-02 00:00:00+03', null);
end $$;
