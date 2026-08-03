-- ============================================================
-- „Numește deschiderea" primeşte tablă
-- ============================================================
-- În 031, întrebarea era chiar notaţia: „1.e4 e5 2.Cf3 Cc6 3.Nb5". Asta
-- funcţionează doar pentru cine citeşte notaţia din cap — adică exact pentru
-- oamenii care n-au nevoie de exerciţiu. Un începător vede un şir de litere.
--
-- Aici adăugăm mutările în notaţie UCI, din care clientul construieşte poziţia
-- şi o arată pe tablă, cu posibilitatea de a merge mutare cu mutare. Notaţia
-- rămâne afişată lângă tablă — cine o învaţă o vede acum în context.
--
-- Şi mutăm întrebarea din notaţie în text: cu poziţia pe ecran, „Ce deschidere
-- e pe tablă?" e întrebarea adevărată.
--
-- Nu modific 031: migrările sunt append-only. Rulate în ordine (031, apoi 032),
-- rezultatul e corect şi la o instalare de la zero, şi pe baza ta de acum.
-- ============================================================

update public.event_tasks t
set
  payload = t.payload || jsonb_build_object('moves', d.uci),
  prompt = d.prompt
from (values
  (1,  'e2e4 e7e5 g1f3 b8c6 f1b5',                                    'Ce deschidere e pe tablă?'),
  (2,  'e2e4 c7c5',                                                   'Cum se numește răspunsul negrului?'),
  (3,  'd2d4 g8f6 c2c4 g7g6 b1c3 f8g7 e2e4 d7d6',                     'Cum se numește apărarea neagră?'),
  (4,  'e2e4 e7e6',                                                   'Cum se numește apărarea neagră?'),
  (5,  'e2e4 c7c6',                                                   'Cum se numește apărarea neagră?'),
  (6,  'd2d4 d7d5 c2c4',                                              'Ce deschidere e pe tablă?'),
  (7,  'e2e4 e7e5 g1f3 b8c6 f1c4',                                    'Ce deschidere e pe tablă?'),
  (8,  'd2d4 g8f6 c2c4 e7e6 b1c3 f8b4',                               'Cum se numește apărarea neagră?'),
  (9,  'e2e4 d7d5',                                                   'Cum se numește răspunsul negrului?'),
  (10, 'e2e4 e7e5 f2f4',                                              'Ce deschidere e pe tablă?'),
  (11, 'd2d4 g8f6 c2c4 g7g6 b1c3 d7d5',                               'Cum se numește apărarea neagră?'),
  (12, 'e2e4 g8f6',                                                   'Cum se numește apărarea neagră?'),
  (13, 'd2d4 f7f5',                                                   'Cum se numește apărarea neagră?'),
  (14, 'e2e4 e7e5 g1f3 g8f6',                                         'Cum se numește apărarea neagră?'),
  (15, 'e2e4 e7e5 g1f3 b8c6 f1b5 g8f6',                               'Ce variantă a Spaniolei e asta?'),
  (16, 'd2d4 g8f6 c2c4 e7e6 g2g3',                                    'Ce deschidere joacă albul?'),
  (17, 'c2c4',                                                        'Ce deschidere e pe tablă?'),
  (18, 'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 a7a6',           'Ce variantă a Sicilienei e asta?'),
  (19, 'd2d4 d7d5 c2c4 c7c6',                                         'Cum se numește apărarea neagră?'),
  (20, 'e2e4 e7e5 g1f3 b8c6 d2d4',                                    'Ce deschidere e pe tablă?')
) as d(idx, uci, prompt)
where t.order_index = d.idx
  and t.event_id = (select id from public.events where slug = 'numeste-deschiderea');


-- Verificare: toate cele 20 trebuie să aibă acum mutări.
do $$
declare
  v_missing integer;
begin
  select count(*) into v_missing
  from public.event_tasks t
  where t.event_id = (select id from public.events where slug = 'numeste-deschiderea')
    and t.payload->>'moves' is null;

  if v_missing > 0 then
    raise exception 'Au rămas % sarcini fără mutări — verifică dacă 031 a rulat.', v_missing;
  end if;
end $$;
