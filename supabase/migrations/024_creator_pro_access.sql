-- 024_creator_pro_access.sql
-- Acces Pro „de creator" pentru contul owner-ului platformei.
-- Un abonament Pro comp (fără Stripe) => isPro = true peste tot:
--   • puzzle-uri nelimitate (verificat în frontend)
--   • categorii Pro de tactici
--   • En Passant nelimitat (verificat pe server, în edge function)
-- Idempotent: rulează-l de câte ori vrei.

INSERT INTO public.subscriptions (user_id, plan, status, current_period_start, current_period_end, cancel_at_period_end)
SELECT id, 'annual', 'active', now(), now() + interval '100 years', false
FROM auth.users
WHERE email = 'vladnrg99@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
  status = 'active',
  plan = 'annual',
  current_period_end = EXCLUDED.current_period_end,
  cancel_at_period_end = false;
