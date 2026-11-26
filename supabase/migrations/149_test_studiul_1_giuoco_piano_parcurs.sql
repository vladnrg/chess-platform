-- ============================================================
-- 149 · Test: studiul 1 din Giuoco Piano (vs Nc5), marcat parcurs
--
-- Cerut pe 2026-11-26, ca să se poată încerca studiul 2: pentru contul
-- vladnrg, studiul „Linia principală" al capitolului Giuoco Piano (vs Nc5)
-- din Partida Italiană se marchează terminat, ca şi cum ar fi fost parcurs.
--
-- Se scrie exact ce scrie antrenorul (vezi `capitoleDeDeschidere`):
--  - fiecare variantă a studiului: `<capitol>-teorie[-v]` şi `-exersare[-v]`
--    (prima variantă fără sufix) — asta face cărţile gata;
--  - gantera de după fiecare set de două variante: `<capitol>-r0-<k>`;
--  - pălăria de la capăt: `<capitol>-test`.
-- Variantele se citesc din `opening_lines.studii`, nu se scriu de mână.
-- Pe o bază fără acest cont nu face nimic.
-- ============================================================

do $$
declare
  v_user uuid;
  v_line uuid;
  v_course uuid;
  v_variante int[];
  v_cand text := to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
  v_noduri jsonb := '{}'::jsonb;
  v int;
  k int;
  n_linii int;
begin
  select id into v_user from public.profiles where username = 'vladnrg';
  if v_user is null then
    raise notice '149: contul vladnrg nu există aici, nu se schimbă nimic';
    return;
  end if;

  select count(*) into n_linii
    from public.opening_lines l join public.courses c on c.id = l.course_id
   where c.slug = 'italian-game' and l.variation_name ilike 'Giuoco Piano%Nc5%'
     and l.studii -> 0 ->> 'titlu' = 'Linia principală';
  if n_linii <> 1 then
    raise exception '149: aşteptam un singur capitol Giuoco Piano (vs Nc5) cu studii, am găsit %', n_linii;
  end if;

  select l.id, l.course_id,
         array(select jsonb_array_elements_text(l.studii -> 0 -> 'variante')::int)
    into v_line, v_course, v_variante
    from public.opening_lines l join public.courses c on c.id = l.course_id
   where c.slug = 'italian-game' and l.variation_name ilike 'Giuoco Piano%Nc5%'
     and l.studii -> 0 ->> 'titlu' = 'Linia principală';

  foreach v in array v_variante loop
    v_noduri := v_noduri
      || jsonb_build_object(v_line || '-teorie' || case when v = 0 then '' else '-' || v end, v_cand)
      || jsonb_build_object(v_line || '-exersare' || case when v = 0 then '' else '-' || v end, v_cand);
  end loop;

  for k in 0 .. (ceil(array_length(v_variante, 1) / 2.0)::int - 1) loop
    v_noduri := v_noduri || jsonb_build_object(v_line || '-r0-' || k, v_cand);
  end loop;

  v_noduri := v_noduri || jsonb_build_object(v_line || '-test', v_cand);

  update public.user_course_progress
     set noduri_parcurse = coalesce(noduri_parcurse, '{}'::jsonb) || v_noduri,
         completed_lesson_ids = case when v_line = any(completed_lesson_ids)
                                     then completed_lesson_ids
                                     else array_append(completed_lesson_ids, v_line) end,
         last_activity_at = now()
   where user_id = v_user and course_id = v_course;

  if not found then
    insert into public.user_course_progress (user_id, course_id, completed_lesson_ids, noduri_parcurse, last_activity_at)
    values (v_user, v_course, array[v_line], v_noduri, now());
  end if;

  raise notice '149: % variante, % chei scrise pentru capitolul %', array_length(v_variante, 1), (select count(*) from jsonb_object_keys(v_noduri)), v_line;
end $$;
