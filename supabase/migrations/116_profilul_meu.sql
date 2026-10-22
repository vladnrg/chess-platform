-- 116_profilul_meu.sql
-- Pasul întâi din două (vezi 117): funcţia prin care aplicaţia îşi citeşte
-- propriul profil întreg. Vine înaintea ascunderii coloanelor, ca site-ul să
-- treacă pe ea înainte ca citirea directă a câmpurilor private să fie oprită.

-- Propriul profil, cu tot cu câmpurile private: aplicaţia are nevoie de ele ca
-- să ştie dacă contul aşteaptă acordul şi cui i s-a scris.
create or replace function public.profilul_meu()
returns setof public.profiles language sql security definer stable set search_path = public as $$
  select * from profiles where id = auth.uid();
$$;

revoke all on function public.profilul_meu() from public, anon;
grant execute on function public.profilul_meu() to authenticated;

select exists (select 1 from pg_proc where proname = 'profilul_meu') as functie; -- trebuie: true
