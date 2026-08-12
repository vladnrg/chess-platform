-- ============================================================
-- „Jucător experimentat" — nivelul 50
-- ============================================================
-- Limita anti-fabricare rămâne, dar creşte: de la nivelul 50, primeşti XP din
-- primele 5 partide clasate pe zi cu acelaşi adversar, în loc de 3.
--
-- Limita e per jucător, nu per partidă: dacă unul are nivelul 50 şi celălalt 12,
-- la a patra partidă din zi primeşte XP doar primul. Altfel un jucător de nivel
-- mic ar căpăta perk-ul doar fiindcă joacă împotriva cuiva care îl are.
-- ============================================================

create or replace function public.daily_xp_limit(p_xp integer)
returns integer language sql immutable as $$
  select case when public.player_level(p_xp) >= 50 then 5 else 3 end;
$$;

grant execute on function public.daily_xp_limit(integer) to authenticated;

-- ============================================================
-- finish_match, cu limita calculată separat pentru fiecare jucător
-- ============================================================
create or replace function public.finish_match(
  p_match_id uuid, p_result text, p_reason text
)
returns void language plpgsql security definer as $$
declare
  v_m public.matches%rowtype;
  v_winner uuid;
  v_loser uuid;
  v_winner_league text;
  v_loser_league text;
  v_diff integer;
  v_xp integer := 0;
  v_recent integer;
  v_white_xp integer;
  v_black_xp integer;
  v_winner_xp integer;
begin
  select * into v_m from public.matches where id = p_match_id for update;
  if not found then raise exception 'match_not_found'; end if;
  if v_m.status <> 'active' then return; end if;  -- deja încheiată, nimic de făcut

  if p_result = 'white' then
    v_winner := v_m.white_id; v_loser := v_m.black_id;
    v_winner_league := v_m.white_league; v_loser_league := v_m.black_league;
  elsif p_result = 'black' then
    v_winner := v_m.black_id; v_loser := v_m.white_id;
    v_winner_league := v_m.black_league; v_loser_league := v_m.white_league;
  end if;

  -- Câte partide clasate au jucat deja azi, cei doi între ei
  select count(*) into v_recent
  from public.matches
  where status = 'finished' and rated
    and finished_at >= date_trunc('day', now())
    and ((white_id = v_m.white_id and black_id = v_m.black_id)
      or (white_id = v_m.black_id and black_id = v_m.white_id));

  if v_m.rated then
    select xp into v_white_xp from public.profiles where id = v_m.white_id;
    select xp into v_black_xp from public.profiles where id = v_m.black_id;

    if p_result = 'draw' then
      v_diff := public.league_rank(v_m.white_league) - public.league_rank(v_m.black_league);

      if v_recent < public.daily_xp_limit(v_white_xp) then
        perform public.award_xp(v_m.white_id,
          case when v_diff < 0 then 20 when v_diff > 0 then 5 else 10 end);
      end if;

      if v_recent < public.daily_xp_limit(v_black_xp) then
        perform public.award_xp(v_m.black_id,
          case when v_diff > 0 then 20 when v_diff < 0 then 5 else 10 end);
      end if;

      -- Reţinem 10 ca valoare orientativă a remizei; sumele exacte diferă pe ligi
      v_xp := 10;

    elsif v_winner is not null then
      select xp into v_winner_xp from public.profiles where id = v_winner;

      if v_recent < public.daily_xp_limit(v_winner_xp) then
        v_diff := public.league_rank(v_loser_league) - public.league_rank(v_winner_league);
        v_xp := case
          when v_diff > 0 then 40   -- adversar dintr-o ligă superioară
          when v_diff < 0 then 15   -- adversar dintr-o ligă inferioară
          else 25                   -- aceeaşi ligă
        end;
        perform public.award_xp(v_winner, v_xp);
      end if;
    end if;
  end if;

  update public.matches set
    status = 'finished',
    result = p_result,
    result_reason = p_reason,
    winner_id = v_winner,
    xp_awarded = v_xp,
    finished_at = now()
  where id = p_match_id;
end;
$$;

revoke execute on function public.finish_match(uuid, text, text) from authenticated;
