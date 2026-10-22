-- 117_profil_campuri_private.sql
-- Vârsta copilului şi emailul părintelui nu se mai văd din afara contului.
--
-- Politica „profiles_authenticated_read" (002) lasă orice utilizator logat să
-- citească orice profil — e nevoie de ea pentru clasamente, comunitate, partide.
-- Dar regulile pe rânduri nu aleg coloane: odată ce vezi rândul, vezi tot,
-- inclusiv anul naşterii, emailul părintelui şi tokenul de acord ale fiecărui copil.
--
-- Reparaţia e pe coloane: utilizatorii primesc dreptul de citire doar pe
-- coloanele publice. Propriul profil întreg se citeşte prin `profilul_meu()` (migrarea 116).
--
-- ATENŢIE pentru coloanele viitoare: dreptul e dat coloană cu coloană, deci o
-- coloană nouă în `profiles` NU se vede din aplicaţie până nu primeşte
-- `grant select (coloana) on public.profiles to authenticated;`. Prin
-- `profilul_meu()` se vede oricum. Blocul de mai jos se poate rula din nou ca să
-- dea dreptul tuturor coloanelor care nu sunt pe lista privată.
--
-- Idempotentă.

revoke select on public.profiles from anon, authenticated;

do $$
declare
  v_private text[] := array[
    'birth_year', 'parental_email', 'parental_consent_token', 'parental_consent_given',
    'parental_consent_expires_at', 'account_frozen', 'account_frozen_reason'
  ];
  v_coloane text;
begin
  select string_agg(quote_ident(column_name), ', ' order by ordinal_position)
    into v_coloane
  from information_schema.columns
  where table_schema = 'public' and table_name = 'profiles'
    and column_name <> all (v_private);

  execute format('grant select (%s) on public.profiles to authenticated', v_coloane);
end;
$$;

-- ============================================================
-- Dovadă (trebuie să iasă: 0 | 7 | true)
-- ============================================================
--  0    = coloane private pe care le mai poate citi un utilizator logat
--  7    = coloane private, în total
--  true = funcţia pentru propriul profil există
select
  (select count(*) from information_schema.column_privileges
    where table_schema = 'public' and table_name = 'profiles' and grantee = 'authenticated'
      and privilege_type = 'SELECT'
      and column_name in ('birth_year', 'parental_email', 'parental_consent_token', 'parental_consent_given',
                          'parental_consent_expires_at', 'account_frozen', 'account_frozen_reason')) as private_vizibile,
  7 as private_total,
  exists (select 1 from pg_proc where proname = 'profilul_meu') as functie;
