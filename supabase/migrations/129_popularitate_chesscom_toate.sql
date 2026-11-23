-- ============================================================
-- Popularitatea tuturor capitolelor de deschideri, din baza de maeştri Chess.com
-- ============================================================
-- Utilizatorul, pe 2026-11-23: „te rog să faci această actualizare la toate
-- capitolele existente… vreau să avem procentele de pe Chess.com”. Italiana s-a
-- făcut în migrarea 128; aici sunt celelalte 19 cursuri, 57 de capitole.
-- Cifrele vechi n-aveau sursă: fuseseră puse odată cu primele capitole.
--
-- Sursa: exploratorul Chess.com, „Master Games”, citit pe 2026-11-23.
-- Metoda, aceeaşi ca la Italiana: din partidele care ajung la poziţia comună a
-- cursului (unde capitolele încă nu s-au despărţit), câte ajung la mutarea care
-- dă numele capitolului. Sub 1% se păstrează o zecimală, ca să nu apară 0%.
--
-- Două mutări s-au lăsat la primul punct de despărţire, nu la mutarea din nume:
-- Indiana Regelui A (Ne2 număra şi partide venite pe alte drumuri, deci ieşea
-- umflat) şi KIA A (poziţia exactă cu e6 apare în doar 131 de partide).
--
-- Procentele sunt mici la sisteme (Londra, Colle, KIA): poziţia comună e doar
-- 1.d4 sau 1.Cf3, iar maeştrii joacă rar sistemul până la capăt. Sunt reale.
--
--   Sistemul Londra (după d4; 1591934 de partide)
--      A Linia Clasică (vs d5, Cf6)                     d5     412582  → 26%
--      B Varianta Fianchetto (vs g6)                    g6      46078  → 3%
--      C Anti-Benoni London (vs c5)                     c5      20605  → 1%
--   Gambitul Regelui (după e4 e5 f4; 10958 de partide)
--      A Gambitul Regelui Acceptat — Bishop's Gambit    Bc4      1589  → 15%
--      B Gambitul Regelui Acceptat — clasica cu 3...g5  g5       1496  → 14%
--      C Gambitul Regelui Respins — Falkbeer            d5       2469  → 23%
--   Gambitul Damei (după d4 d5 c4; 285968 de partide)
--      A Gambitul Damei Respins — Ortodox (e6)          e6     117770  → 41%
--      B Gambitul Damei Acceptat (dxc4)                 dxc4    34398  → 12%
--      C Apărarea Slavă (c6, dxc4)                      c6     119189  → 42%
--   Deschiderea Catalană (după d4 Nf6 c4 e6 g3; 34332 de partide)
--      A Catalană Deschisă — dxc4                       dxc4     3663  → 11%
--      B Catalană Închisă — Ne7, rocadă                 Be7      4760  → 14%
--      C Catalană vs c5 — gambit de centru              c5       7227  → 21%
--   Ruy Lopez (Spaniola) (după e4 e5 Nf3 Nc6 Bb5; 204375 de partide)
--      A Varianta Berlin — Finalul Berlin               Nf6     29808  → 15%
--      B Varianta Închisă — a6, d6, b5                  Be7     63216  → 31%
--      C Varianta Deschisă — exd4, d5                   Nxe4    10333  → 5%
--   Deschiderea Engleză (după c4; 309695 de partide)
--      A Varianta Simetrică (c5 negru)                  Nc6     18447  → 6%
--      B Setup Hedgehog (b6, Nb7)                       b6       3173  → 1%
--      C Engleză vs Indiană a Regelui                   g6      24398  → 8%
--   Atacul Regelui Indian (KIA) (după Nf3; 477323 de partide)
--      A vs Setup Francez (d5, e6)                      c5       5061  → 1%
--      B vs Setup Sicilian (c5, Cc6)                    c5      51729  → 11%
--      C vs Caro-Kann (d5, c6)                          c6      11544  → 2%
--   Sistemul Colle (după d4; 1591934 de partide)
--      A Colle-Zukertort (b3, Nb2)                      b3       1947  → 0.1%
--      B Colle-Koltanowski (c3, Cc3)                    c3       1088  → 0.1%
--      C Colle vs Indian (g6, Ng7)                      g6      90432  → 6%
--   Jocul Vienez (după e4 e5 Nc3; 19589 de partide)
--      A Viena cu f4 — Gambitul Vienez                  f4       3490  → 18%
--      B Viena Clasică — Cc3, Nc4                       Bc4      2423  → 12%
--      C Viena cu fianchetto — g3                       g3       1361  → 7%
--   Apărarea Siciliană (după e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3; 208291 de partide)
--      A Najdorf (a6)                                   a6     128381  → 62%
--      B Scheveningen — Atacul Keres (g4)               e6       7502  → 4%
--      C Varianta Dragon (g6)                           g6      34493  → 17%
--   Apărarea Franceză (după e4 e6 d4 d5; 230919 de partide)
--      A Winawer (Nb4)                                  Bb4     47452  → 21%
--      B Tarrasch (Cf6)                                 Nd2     70994  → 31%
--      C Varianta Avans — c5 timpuriu                   e5      32041  → 14%
--   Apărarea Caro-Kann (după e4 c6 d4 d5; 141382 de partide)
--      A Varianta Clasică (Nf5)                         Bf5     24052  → 17%
--      B Varianta Avans                                 e5      47755  → 34%
--      C Varianta Schimb (exd5)                         exd5    34006  → 24%
--   Apărarea Regelui Indian (după d4 Nf6 c4 g6 Nc3 Bg7 e4 d6; 107866 de partide)
--      A Varianta Clasică — Ce1, Cd3                    Nf3     35319  → 33%
--      B Atacul cu Patru Pioni (f4)                     f4       6646  → 6%
--      C Varianta Sämisch (f3, Ne3)                     f3      22561  → 21%
--   Apărarea Nimzo-Indian (după d4 Nf6 c4 e6 Nc3 Bb4; 117141 de partide)
--      A Varianta Dc2 — Classică                        Qc2     36186  → 31%
--      B Varianta e3 — Rubinstein                       e3      49945  → 43%
--      C Varianta a3 — Sämisch Nimzo                    a3       4683  → 4%
--   Apărarea Olandeză (după d4 f5; 41374 de partide)
--      A Varianta Stonewall — d5, e6, f5                d5       2429  → 6%
--      B Varianta Leningrad — g6, Ng7                   g6       8096  → 20%
--      C Varianta Clasică — Ne7, rocadă                 Be7      2449  → 6%
--   Apărarea Slav (după d4 d5 c4 c6; 125394 de partide)
--      A Varianta Principală — Nf5, a6                  dxc4    23847  → 19%
--      B Varianta Schimb (cxd5)                         cxd5     4252  → 3%
--      C Semi-Slavă — e6, Cd7                           e6      27808  → 22%
--   Apărarea Pirc (după e4 d6 d4 Nf6 Nc3 g6; 34475 de partide)
--      A Varianta Clasică — Ne2, rocadă                 Be2      7584  → 22%
--      B Atacul Austrian — f4, Cf3                      f4       8772  → 25%
--      C Atacul 150 — Ne3, Dd2, f3                      Be3      6098  → 18%
--   Apărarea Scandinavă (după e4 d5 exd5; 53887 de partide)
--      A Varianta Principală — Dxd5, Da5                Qa5     16464  → 31%
--      B Varianta Modernă — 2...Cf6                     d4       7988  → 15%
--      C Gambitul islandez — 3.c4 e6                    e6        737  → 1%
--   Apărarea Alekhine (după e4 Nf6 e5 Nd5 d4 d6; 25427 de partide)
--      A Atacul cu Patru Pioni — c4, f4                 f4       3783  → 15%
--      B Varianta Modernă — d4, Cf3                     Nf3     15092  → 59%
--      C Varianta Schimb — exd6                         exd6     7947  → 31%
-- ============================================================

update public.opening_lines l
   set popularity_pct = v.pop
  from (values
  ('ff6881b7-305f-4fc7-865f-525e321c0ac5', 26),
  ('16cfa14a-12e5-43ba-8ae2-d397f849099a', 3),
  ('25633cb3-0436-4dba-b525-ec3fc960d31b', 1),
  ('8ea3598d-4f6d-4d99-b1ba-d14543dacb18', 15),
  ('23dc09de-9621-4448-b407-c112249bf892', 14),
  ('591d8d80-04c7-4a9c-a74f-2b4ec279f423', 23),
  ('92e3e10b-5468-4574-ab6a-b542afdc7b85', 41),
  ('50eb2fb8-dd83-4d80-8404-ce62e62d6329', 12),
  ('853448dc-5676-46f5-b5f8-9e42cba32b53', 42),
  ('53cb0cea-aa46-4f83-acb3-8303e8c9ecdb', 11),
  ('037d8d29-b31a-4d10-8a20-269255ae6f02', 14),
  ('de99d9bc-3d82-4c81-a727-04d119179599', 21),
  ('bb9e81a3-ffae-46a5-ae3e-7bab12174d9e', 15),
  ('5c021c8c-7aa5-4302-9d8b-d4305d623581', 31),
  ('c3aa691e-0e4b-4338-9605-10bb4648637f', 5),
  ('94b8d936-b8c3-4502-8a2e-3e703608cce6', 6),
  ('160cbeb7-5e1d-4618-8c5c-1bf98460a7dd', 1),
  ('85f69ee7-ca6e-4c72-be52-4b1885d69450', 8),
  ('255b2643-bbd3-4d0b-a894-7fc7f68ca847', 1),
  ('0a7ebc6f-331c-419a-98d5-bb5e39efb72b', 11),
  ('15cb1e33-b0b8-4282-b77b-d9daf86866f0', 2),
  ('24755074-e07c-438e-a60f-e91f89c38e62', 0.1),
  ('7f3c6a1b-0d00-4a52-9ded-a19341f06c49', 0.1),
  ('cb9a5ea6-d2c3-4dc8-acaa-4e2b7b9c9ef9', 6),
  ('5e83ae4c-700e-43d1-b155-660f7c0f46be', 18),
  ('7097c1e5-0444-4545-94b7-8771dc21ab8b', 12),
  ('96f1dfe8-f215-4a8a-8f60-bf7eade644e0', 7),
  ('3c88cf61-a4fa-4c4d-96e7-6d2187023b69', 62),
  ('8eac1248-86b5-48ba-9267-451885085fb4', 4),
  ('94b36630-0118-428f-a5fe-eb1db9102b77', 17),
  ('18d5cbda-3b68-4b37-9212-a7c7cbd5ba0b', 21),
  ('07bb5d3e-c78d-4766-81ba-e05f3d0229a1', 31),
  ('f058053d-1f18-4f16-937b-68c50d006d41', 14),
  ('70abe751-e636-4b73-8388-c6400978633d', 17),
  ('0ad89339-545b-4c60-bf91-b377f2ef47f1', 34),
  ('7d590267-22ca-49ce-b3c6-d667ff34a620', 24),
  ('0b1ab8a9-3ffb-4927-b8c7-8c9b787acd61', 33),
  ('b985052e-248e-4d10-ab41-d697fc7c7c48', 6),
  ('e9aa4ada-d437-4d60-a738-5be7d95f0738', 21),
  ('9b342dbf-a480-4b73-9c4a-3e8651f94971', 31),
  ('308290bb-fbb2-4b22-b0ba-797ad4d18fd3', 43),
  ('239609fd-3254-4094-9d21-0de5eaf9a40a', 4),
  ('2f936ee8-e9b8-42ba-8583-2809aab2f268', 6),
  ('4bdfb2a3-83e3-4f7b-9cd7-0dc83ea8baee', 20),
  ('6b730897-0f0b-4dce-b616-16ffdba8a9e6', 6),
  ('b6c9d551-9c8d-4c9c-91a1-07434612e1aa', 19),
  ('1c6d1336-e912-47c0-a711-99990fd2f9d5', 3),
  ('39397fab-0d28-42d2-adc8-68b3202195c9', 22),
  ('3b0518b3-6946-4fa9-bc86-dc0d77ff7567', 22),
  ('51608007-6b6c-4849-b29d-0daad96c56b5', 25),
  ('3f3424a5-2bcf-44d7-98d1-88c8f304a558', 18),
  ('37b2c1b0-f77a-4775-978e-c72835e5f1bc', 31),
  ('5b266987-3697-45b7-b0e8-fe1a6f094e14', 15),
  ('54d6fcce-ab12-44b2-a8f4-3c88d5a8b461', 1),
  ('1c4b08da-030d-4239-b4c3-7cc5f1acad00', 15),
  ('33368253-af12-4e48-a7d6-4b0d729883ee', 59),
  ('890193ea-a5d2-4729-9f0f-fb7533572b17', 31)
  ) as v(id, pop)
 where l.id = v.id::uuid;

do $$
declare
  n int;
begin
  select count(*) into n
    from public.opening_lines l
    join (values
  ('ff6881b7-305f-4fc7-865f-525e321c0ac5', 26),
  ('16cfa14a-12e5-43ba-8ae2-d397f849099a', 3),
  ('25633cb3-0436-4dba-b525-ec3fc960d31b', 1),
  ('8ea3598d-4f6d-4d99-b1ba-d14543dacb18', 15),
  ('23dc09de-9621-4448-b407-c112249bf892', 14),
  ('591d8d80-04c7-4a9c-a74f-2b4ec279f423', 23),
  ('92e3e10b-5468-4574-ab6a-b542afdc7b85', 41),
  ('50eb2fb8-dd83-4d80-8404-ce62e62d6329', 12),
  ('853448dc-5676-46f5-b5f8-9e42cba32b53', 42),
  ('53cb0cea-aa46-4f83-acb3-8303e8c9ecdb', 11),
  ('037d8d29-b31a-4d10-8a20-269255ae6f02', 14),
  ('de99d9bc-3d82-4c81-a727-04d119179599', 21),
  ('bb9e81a3-ffae-46a5-ae3e-7bab12174d9e', 15),
  ('5c021c8c-7aa5-4302-9d8b-d4305d623581', 31),
  ('c3aa691e-0e4b-4338-9605-10bb4648637f', 5),
  ('94b8d936-b8c3-4502-8a2e-3e703608cce6', 6),
  ('160cbeb7-5e1d-4618-8c5c-1bf98460a7dd', 1),
  ('85f69ee7-ca6e-4c72-be52-4b1885d69450', 8),
  ('255b2643-bbd3-4d0b-a894-7fc7f68ca847', 1),
  ('0a7ebc6f-331c-419a-98d5-bb5e39efb72b', 11),
  ('15cb1e33-b0b8-4282-b77b-d9daf86866f0', 2),
  ('24755074-e07c-438e-a60f-e91f89c38e62', 0.1),
  ('7f3c6a1b-0d00-4a52-9ded-a19341f06c49', 0.1),
  ('cb9a5ea6-d2c3-4dc8-acaa-4e2b7b9c9ef9', 6),
  ('5e83ae4c-700e-43d1-b155-660f7c0f46be', 18),
  ('7097c1e5-0444-4545-94b7-8771dc21ab8b', 12),
  ('96f1dfe8-f215-4a8a-8f60-bf7eade644e0', 7),
  ('3c88cf61-a4fa-4c4d-96e7-6d2187023b69', 62),
  ('8eac1248-86b5-48ba-9267-451885085fb4', 4),
  ('94b36630-0118-428f-a5fe-eb1db9102b77', 17),
  ('18d5cbda-3b68-4b37-9212-a7c7cbd5ba0b', 21),
  ('07bb5d3e-c78d-4766-81ba-e05f3d0229a1', 31),
  ('f058053d-1f18-4f16-937b-68c50d006d41', 14),
  ('70abe751-e636-4b73-8388-c6400978633d', 17),
  ('0ad89339-545b-4c60-bf91-b377f2ef47f1', 34),
  ('7d590267-22ca-49ce-b3c6-d667ff34a620', 24),
  ('0b1ab8a9-3ffb-4927-b8c7-8c9b787acd61', 33),
  ('b985052e-248e-4d10-ab41-d697fc7c7c48', 6),
  ('e9aa4ada-d437-4d60-a738-5be7d95f0738', 21),
  ('9b342dbf-a480-4b73-9c4a-3e8651f94971', 31),
  ('308290bb-fbb2-4b22-b0ba-797ad4d18fd3', 43),
  ('239609fd-3254-4094-9d21-0de5eaf9a40a', 4),
  ('2f936ee8-e9b8-42ba-8583-2809aab2f268', 6),
  ('4bdfb2a3-83e3-4f7b-9cd7-0dc83ea8baee', 20),
  ('6b730897-0f0b-4dce-b616-16ffdba8a9e6', 6),
  ('b6c9d551-9c8d-4c9c-91a1-07434612e1aa', 19),
  ('1c6d1336-e912-47c0-a711-99990fd2f9d5', 3),
  ('39397fab-0d28-42d2-adc8-68b3202195c9', 22),
  ('3b0518b3-6946-4fa9-bc86-dc0d77ff7567', 22),
  ('51608007-6b6c-4849-b29d-0daad96c56b5', 25),
  ('3f3424a5-2bcf-44d7-98d1-88c8f304a558', 18),
  ('37b2c1b0-f77a-4775-978e-c72835e5f1bc', 31),
  ('5b266987-3697-45b7-b0e8-fe1a6f094e14', 15),
  ('54d6fcce-ab12-44b2-a8f4-3c88d5a8b461', 1),
  ('1c4b08da-030d-4239-b4c3-7cc5f1acad00', 15),
  ('33368253-af12-4e48-a7d6-4b0d729883ee', 59),
  ('890193ea-a5d2-4729-9f0f-fb7533572b17', 31)
    ) as v(id, pop) on l.id = v.id::uuid
   where l.popularity_pct = v.pop;
  if n <> 57 then
    raise exception 'Doar % din 57 capitole au procentul nou', n;
  end if;
  raise notice 'OK: 57 capitole cu popularitatea din baza de maeştri Chess.com';
end $$;
