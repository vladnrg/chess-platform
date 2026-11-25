-- ============================================================
-- 140 · Conturile de Chess.com şi Lichess, şi procentele pe rating
--
-- Cerut pe 2026-11-25. Procentele de frecvenţă vin din ratingul real al
-- jucătorului: cine îşi leagă contul de Lichess vede procentele jucătorilor de
-- pe Lichess, la ratingul lui de acolo; cine îl leagă pe cel de Chess.com, pe
-- ale celor de pe Chess.com. Fără cont legat, procentele Chess.com la nivelul
-- din testul de plasament. Ratingul de puzzle-uri rămâne separat.
--
-- Coloanele noi din `profiles` NU primesc `grant select` (vezi migrarea 117):
-- contul altcuiva nu se vede; propriul profil se citeşte prin `profilul_meu()`.
-- ============================================================

alter table public.profiles
  add column if not exists chesscom_username text,
  add column if not exists chesscom_rating int,
  add column if not exists lichess_username text,
  add column if not exists lichess_rating int,
  add column if not exists sursa_rating text check (sursa_rating in ('chesscom', 'lichess')),
  -- 'rapid' sau 'blitz': din ce ritm e ratingul folosit.
  add column if not exists rating_ritm text check (rating_ritm in ('rapid', 'blitz')),
  add column if not exists rating_actualizat_la timestamptz;

-- Procentele pe trepte de rating, pe platforme:
--   { "chesscom": { "400": 21.3, "700": 24.1, … }, "lichess": { "400": …, "1000": … } }
-- Cheia = limita de jos a treptei. Ramificaţiile (`variante`) au acelaşi câmp.
alter table public.opening_lines
  add column if not exists popularitate_pe_rating jsonb;

select
  (select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles'
      and column_name in ('chesscom_username', 'chesscom_rating', 'lichess_username', 'lichess_rating',
                          'sursa_rating', 'rating_ritm', 'rating_actualizat_la')) as coloane_profil,
  (select count(*) from information_schema.column_privileges
    where table_schema = 'public' and table_name = 'profiles' and grantee = 'authenticated'
      and privilege_type = 'SELECT' and column_name like '%chesscom%') as vizibile_altora;
