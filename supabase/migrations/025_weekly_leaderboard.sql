-- ============================================================
-- Clasament săptămânal
-- ============================================================
-- Până acum, regula de acces pe user_weekly_xp lăsa fiecare utilizator să-şi
-- vadă doar propriul rând. Cu ea în vigoare, un clasament săptămânal ar arăta
-- o singură linie — a ta.
--
-- Se schimbă DOAR dreptul de citire. Scrierile rămân exact cum erau: singura
-- cale prin care se modifică XP-ul e funcţia award_xp, care rulează cu drepturi
-- proprii (security definer) şi nu depinde de regulile de mai jos. Nu se acordă
-- nimănui drept de INSERT, UPDATE sau DELETE pe această tabelă.
--
-- Ce devine vizibil: câţi XP a strâns fiecare jucător în săptămâna curentă şi în
-- ce ligă era la începutul ei. Adică exact ce se afişează într-un clasament.
-- ============================================================

drop policy if exists "Utilizatorul vede propriul XP săptămânal" on public.user_weekly_xp;

create policy "user_weekly_xp_authenticated_read" on public.user_weekly_xp
  for select using (auth.role() = 'authenticated');

-- Indexul pe care se sprijină interogarea clasamentului: „rândurile din
-- săptămâna curentă, dintr-o anumită ligă, ordonate descrescător după XP".
create index if not exists idx_weekly_xp_leaderboard
  on public.user_weekly_xp (week_start, league_at_week_start, xp_earned desc);
