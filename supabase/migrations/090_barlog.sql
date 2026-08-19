-- ============================================================
-- Bârlogul: ce-i lipsea bazei ca pagina de start să spună adevărul
-- ============================================================
-- Pagina nouă arată două lucruri pe care baza nu le putea răspunde:
--
--   1. „la ce curs ai fost ultima dată" — progresul reţinea doar când ai
--      ÎNCEPUT un curs (`started_at`), nu când te-ai mai uitat la el. Cine a
--      început trei cursuri în aceeaşi zi şi de-atunci lucrează numai la unul
--      ieşea, la ordonare, cu totul altul în faţă.
--
--   2. „poza ta" — `profiles.avatar_url` există din prima zi şi a rămas gol la
--      toată lumea. Cine intră cu Google are deja o poză în cont; o luăm de
--      acolo, o dată, şi rămâne a lui până o schimbă.
--
-- Plus un raft de fişiere pentru pozele încărcate de mână.


-- ============================================================
-- 1. Când ai fost ultima dată la un curs
-- ============================================================
-- Valoarea de pornire e `started_at`: pentru cine n-a mai intrat de-atunci, e
-- chiar adevărul. Pentru ceilalţi se corectează singură la prima vizită.
alter table public.user_course_progress
  add column if not exists last_activity_at timestamptz;

update public.user_course_progress
set last_activity_at = coalesce(last_activity_at, started_at);

alter table public.user_course_progress
  alter column last_activity_at set default now();

create index if not exists user_course_progress_recent
  on public.user_course_progress (user_id, last_activity_at desc);


-- ============================================================
-- 2. Poza din contul Google
-- ============================================================
-- Pentru conturile care există deja. Cele noi o primesc din trigger, mai jos.
update public.profiles p
set avatar_url = coalesce(
      u.raw_user_meta_data->>'avatar_url',
      u.raw_user_meta_data->>'picture'
    )
from auth.users u
where u.id = p.id
  and p.avatar_url is null
  and coalesce(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture') is not null;

-- Aceeaşi funcţie ca în 001, plus poza. Numele rămâne cum era.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  );
  return new;
end;
$$;


-- ============================================================
-- 3. Raftul pentru pozele încărcate
-- ============================================================
-- Public la citire: poza de profil se vede oricum lângă nume, în clasament şi
-- la provocări. Un raft privat ar însemna o adresă semnată la fiecare afişare,
-- pentru ceva ce e public prin natura lui.
--
-- Scrisul e altceva. Fiecare fişier stă într-un folder numit cu id-ul
-- utilizatorului, iar politicile cer ca folderul acela să fie al tău. Aşa nimeni
-- nu poate scrie peste poza altcuiva.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatare', 'avatare', true,
  2 * 1024 * 1024,                                   -- 2 MB ajung pentru o poză de profil
  array['image/png', 'image/jpeg', 'image/webp']     -- fără SVG: poate purta cod
)
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatare_citire_publica" on storage.objects;
create policy "avatare_citire_publica" on storage.objects
  for select using (bucket_id = 'avatare');

drop policy if exists "avatare_scrie_doar_al_tau" on storage.objects;
create policy "avatare_scrie_doar_al_tau" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatare' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatare_inlocuieste_doar_al_tau" on storage.objects;
create policy "avatare_inlocuieste_doar_al_tau" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatare' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatare_sterge_doar_al_tau" on storage.objects;
create policy "avatare_sterge_doar_al_tau" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatare' and (storage.foldername(name))[1] = auth.uid()::text);


-- ============================================================
-- Dovada
-- ============================================================
select
  (select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'user_course_progress'
      and column_name = 'last_activity_at')                        as "coloana_last_activity_at",
  (select count(*) from public.profiles where avatar_url is not null) as "profiluri_cu_poza",
  (select count(*) from storage.buckets where id = 'avatare')       as "raftul_avatare",
  (select count(*) from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname like 'avatare_%')                              as "politici_avatare";
