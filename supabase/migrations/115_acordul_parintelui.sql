-- 115_acordul_parintelui.sql
-- Acordul părintelui pentru conturile de sub 16 ani — de data asta, chiar ţinut.
--
-- Ce era stricat înainte:
--  1. Copilul îşi putea debloca singur contul: `account_frozen` e o coloană din
--     propriul profil, iar politica „actualizează propriul profil" nu oprea nicio
--     coloană. La fel cu `birth_year`: schimbat pe 2000, nu mai era minor.
--  2. `parental_links` se putea citi de oricine (`using (true)`), deci oricine
--     putea lista toate linkurile de confirmare şi confirma în locul părintelui.
--  3. Anul naşterii se salva din pagină ÎNAINTE de confirmarea emailului, când
--     nu există încă sesiune — actualizarea era respinsă în tăcere, deci nimeni
--     nu era marcat drept minor.
--  4. Pragul era 14 ani. În România vârsta consimţământului digital e 16
--     (GDPR art. 8). 14 rămâne doar pentru plată (capacitatea din Codul civil).
--
-- Idempotentă: se poate rula de mai multe ori.

-- ============================================================
-- 1. Vârsta şi emailul părintelui, la crearea contului
-- ============================================================
-- La înregistrarea cu email, pagina le trimite ca metadate ale contului, iar
-- profilul se naşte direct cu ele — nu mai depinde de o sesiune care încă nu
-- există. Cine intră cu Google n-are metadatele astea; e întrebat după prima
-- autentificare, prin `seteaza_varsta`.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_an_text text := new.raw_user_meta_data->>'birth_year';
  v_an int;
  v_email_parinte text := nullif(trim(new.raw_user_meta_data->>'parental_email'), '');
  v_minor boolean := false;
begin
  if v_an_text ~ '^\d{4}$' then
    v_an := v_an_text::int;
    if v_an < 1900 or v_an > extract(year from now())::int then
      v_an := null;
    end if;
  end if;
  v_minor := v_an is not null and extract(year from now())::int - v_an < 16;

  insert into public.profiles (
    id, username, avatar_url, birth_year, parental_email,
    account_frozen, account_frozen_reason, parental_consent_given, parental_consent_expires_at
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    v_an,
    case when v_minor then v_email_parinte end,
    v_minor,
    case when v_minor then 'awaiting_parental_consent' end,
    false,
    case when v_minor then now() + interval '30 days' end
  );
  return new;
end;
$$;

-- ============================================================
-- 2. Coloanele de acord nu le mai schimbă utilizatorul
-- ============================================================
-- Le schimbă doar serverul (funcţiile de mai jos, care ridică un semnal pe
-- durata tranzacţiei, sau cheia de serviciu). Orice altă încercare e respinsă
-- cu eroare, nu ignorată în tăcere — o schimbare ignorată ar arăta ca reuşită.
create or replace function public.protejeaza_acordul_parintelui()
returns trigger language plpgsql as $$
begin
  if coalesce(current_setting('cleanchess.acord', true), '') = 'da'
     or coalesce(auth.role(), '') not in ('authenticated', 'anon') then
    return new;
  end if;

  if new.account_frozen is distinct from old.account_frozen
     or new.account_frozen_reason is distinct from old.account_frozen_reason
     or new.parental_consent_given is distinct from old.parental_consent_given
     or new.parental_consent_expires_at is distinct from old.parental_consent_expires_at
     or new.parental_consent_token is distinct from old.parental_consent_token
     or new.parental_email is distinct from old.parental_email
     or new.birth_year is distinct from old.birth_year then
    raise exception 'Câmpurile de vârstă şi acord se schimbă doar de server.'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists protejeaza_acordul_parintelui on public.profiles;
create trigger protejeaza_acordul_parintelui
  before update on public.profiles
  for each row execute function public.protejeaza_acordul_parintelui();

-- ============================================================
-- 3. Vârsta, pentru cine n-a dat-o la înregistrare (Google, conturi vechi)
-- ============================================================
-- Se poate da o singură dată. Sub 16 ani contul se blochează pe loc, până la
-- acordul părintelui. Întoarce `true` dacă e nevoie de acord.
create or replace function public.seteaza_varsta(p_an int, p_email_parinte text default null)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_minor boolean;
  v_email text := nullif(trim(p_email_parinte), '');
begin
  if auth.uid() is null then
    raise exception 'Trebuie să fii autentificat.' using errcode = '42501';
  end if;
  if p_an is null or p_an < 1900 or p_an > extract(year from now())::int then
    raise exception 'An de naştere invalid.' using errcode = '22023';
  end if;
  if exists (select 1 from profiles where id = auth.uid() and birth_year is not null) then
    raise exception 'Anul naşterii e deja salvat.' using errcode = '42501';
  end if;

  v_minor := extract(year from now())::int - p_an < 16;
  if v_minor and (v_email is null or position('@' in v_email) = 0) then
    raise exception 'Sub 16 ani e nevoie de emailul unui părinte.' using errcode = '22023';
  end if;

  perform set_config('cleanchess.acord', 'da', true);
  update profiles set
    birth_year = p_an,
    parental_email = case when v_minor then v_email end,
    account_frozen = v_minor,
    account_frozen_reason = case when v_minor then 'awaiting_parental_consent' end,
    parental_consent_given = false,
    parental_consent_expires_at = case when v_minor then now() + interval '30 days' end
  where id = auth.uid();

  return v_minor;
end;
$$;

revoke all on function public.seteaza_varsta(int, text) from public, anon;
grant execute on function public.seteaza_varsta(int, text) to authenticated;

-- ============================================================
-- 4. Linkurile din email nu se mai citesc direct din tabel
-- ============================================================
drop policy if exists "Parental links readable by anyone with token" on public.parental_links;

-- Ce vede părintele când deschide linkul: doar numele copilului şi starea
-- linkului. Cine nu are tokenul nu află nimic.
create or replace function public.citeste_cerere_parinte(p_token uuid)
returns jsonb language sql security definer stable set search_path = public as $$
  select coalesce(
    (select jsonb_build_object(
       'stare', case
         when l.used_at is not null then 'folosit'
         when l.expires_at < now() then 'expirat'
         else 'valid' end,
       'copil', p.username)
     from parental_links l join profiles p on p.id = l.user_id
     where l.token = p_token and l.type in ('confirm', 'reject')),
    jsonb_build_object('stare', 'inexistent'));
$$;

-- Decizia părintelui. Oricare dintre cele două linkuri din email o poate lua —
-- amândouă au ajuns doar la el. După decizie, ambele se consumă.
create or replace function public.raspunde_cerere_parinte(p_token uuid, p_accept boolean)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_link parental_links%rowtype;
begin
  select * into v_link from parental_links
  where token = p_token and type in ('confirm', 'reject');

  if not found then return 'inexistent'; end if;
  if v_link.used_at is not null then return 'folosit'; end if;
  if v_link.expires_at < now() then return 'expirat'; end if;

  perform set_config('cleanchess.acord', 'da', true);
  update profiles set
    account_frozen = not p_accept,
    account_frozen_reason = case when p_accept then null else 'rejected' end,
    parental_consent_given = p_accept
  where id = v_link.user_id;

  update parental_links set used_at = now()
  where user_id = v_link.user_id and type in ('confirm', 'reject') and used_at is null;

  return case when p_accept then 'confirmat' else 'respins' end;
end;
$$;

-- Raportul pentru părinte, prin linkul „stats" din emailul săptămânal. Înainte
-- pagina citea profilul copilului direct, ceea ce baza nu permite fără cont.
create or replace function public.statistici_pentru_parinte(p_token uuid)
returns jsonb language sql security definer stable set search_path = public as $$
  select jsonb_build_object(
    'copil', jsonb_build_object(
      'username', p.username, 'current_league', p.current_league,
      'xp', p.xp, 'streak_days', p.streak_days),
    'saptamani', coalesce((
      select jsonb_agg(jsonb_build_object('week_start', w.week_start, 'xp_earned', w.xp_earned)
                       order by w.week_start desc)
      from (select week_start, xp_earned from user_weekly_xp
            where user_id = l.user_id order by week_start desc limit 8) w), '[]'::jsonb))
  from parental_links l join profiles p on p.id = l.user_id
  where l.token = p_token and l.type = 'stats' and l.expires_at > now();
$$;

grant execute on function public.citeste_cerere_parinte(uuid) to anon, authenticated;
grant execute on function public.raspunde_cerere_parinte(uuid, boolean) to anon, authenticated;
grant execute on function public.statistici_pentru_parinte(uuid) to anon, authenticated;

-- ============================================================
-- Dovadă (după rulare trebuie să iasă: 0 | true | 4)
-- ============================================================
--  0    = politici care mai lasă oricine să citească parental_links
--  true = paznicul coloanelor de acord e pus pe profiles
--  4    = funcţiile noi există
select
  (select count(*) from pg_policies
    where tablename = 'parental_links' and qual = 'true') as politici_publice,
  exists (select 1 from pg_trigger where tgname = 'protejeaza_acordul_parintelui') as paznic,
  (select count(*) from pg_proc where proname in
    ('seteaza_varsta', 'citeste_cerere_parinte', 'raspunde_cerere_parinte', 'statistici_pentru_parinte')) as functii;
