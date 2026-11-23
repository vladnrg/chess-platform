-- ============================================================
-- Popularitatea capitolelor: din partidele de nivel mediu, nu ale maeştrilor
-- ============================================================
-- Utilizatorul, pe 2026-11-23: „procentele acestea sunt exclusiv bazate pe
-- meciurile maeştrilor? … acesta nu este un curs pentru maeştri, deci
-- probabilitatea ca adversarii userilor să joace precum maeştrii este
-- limitată". Dintre trei variante (maeştri, toată baza, nivel mediu) a ales
-- nivelul mediu. Înlocuieşte migrările 128 şi 129.
--
-- Sursa: exploratorul Chess.com, „All Chess.com Games", citit pe 2026-11-23,
-- filtrat: rapid şi blitz, rating 1000–2000. Toată baza (cu bullet, partide pe
-- zile şi începători sub 800) dădea „0%" la capitole perfect bune.
--
-- Metoda e aceeaşi ca la 128/129: din partidele care ajung la poziţia comună a
-- cursului, câte ajung la mutarea care dă numele capitolului. Sub 1% se
-- păstrează o zecimală; aplicaţia scrie oricum „sub 1%" (capitole-curs.ts).
--
-- Atenţie, pentru cine refăce numărătoarea: imediat după un pion împins două
-- câmpuri, Chess.com vrea poziţia cu câmpul de „en passant" scris (de pildă
-- „d3" după 1.d4). chess.js îl omite, iar fără el exploratorul numără altă
-- poziţie — după 1.d4 ieşeau 9 407 partide în loc de 7,7 miliarde.
--
--   Sistemul Londra (după d4; 2763731912 de partide)
--      A Linia Clasică (vs d5, Cf6)                     1364679136  maeştri   26% → 49%
--      B Varianta Fianchetto (vs g6)                     126812785  maeştri    3% → 5%
--      C Anti-Benoni London (vs c5)                       85190253  maeştri    1% → 3%
--   Gambitul Regelui (după e4 e5 f4; 212469098 de partide)
--      A Gambitul Regelui Acceptat — Bishop's Gambit       5600866  maeştri   15% → 3%
--      B Gambitul Regelui Acceptat — clasica cu 3...g5    14260690  maeştri   14% → 7%
--      C Gambitul Regelui Respins — Falkbeer              15117988  maeştri   23% → 7%
--   Gambitul Damei (după d4 d5 c4; 483884789 de partide)
--      A Gambitul Damei Respins — Ortodox (e6)           111143323  maeştri   41% → 23%
--      B Gambitul Damei Acceptat (dxc4)                  144625631  maeştri   12% → 30%
--      C Apărarea Slavă (c6, dxc4)                        85786912  maeştri   42% → 18%
--   Deschiderea Catalană (după d4 Nf6 c4 e6 g3; 1442577 de partide)
--      A Catalană Deschisă — dxc4                           151311  maeştri   11% → 10%
--      B Catalană Închisă — Ne7, rocadă                     265761  maeştri   14% → 18%
--      C Catalană vs c5 — gambit de centru                  180588  maeştri   21% → 13%
--   Ruy Lopez (Spaniola) (după e4 e5 Nf3 Nc6 Bb5; 279780286 de partide)
--      A Varianta Berlin — Finalul Berlin                 43656184  maeştri   15% → 16%
--      B Varianta Închisă — a6, d6, b5                     2809451  maeştri   31% → 1%
--      C Varianta Deschisă — exd4, d5                       770401  maeştri    5% → 0.3%
--   Deschiderea Engleză (după c4; 295141361 de partide)
--      A Varianta Simetrică (c5 negru)                     1024103  maeştri    6% → 0.3%
--      B Setup Hedgehog (b6, Nb7)                            24159  maeştri    1% → 0%
--      C Engleză vs Indiană a Regelui                     15987719  maeştri    8% → 5%
--   Atacul Regelui Indian (KIA) (după Nf3; 283095987 de partide)
--      A vs Setup Francez (d5, e6)                         2781632  maeştri    1% → 1%
--      B vs Setup Sicilian (c5, Cc6)                      22621649  maeştri   11% → 8%
--      C vs Caro-Kann (d5, c6)                             1012615  maeştri    2% → 0.4%
--   Sistemul Colle (după d4; 2763731912 de partide)
--      A Colle-Zukertort (b3, Nb2)                          439427  maeştri  0.1% → 0%
--      B Colle-Koltanowski (c3, Cc3)                       1247324  maeştri  0.1% → 0%
--      C Colle vs Indian (g6, Ng7)                        18601855  maeştri    6% → 0.7%
--   Jocul Vienez (după e4 e5 Nc3; 217114674 de partide)
--      A Viena cu f4 — Gambitul Vienez                    22848643  maeştri   18% → 11%
--      B Viena Clasică — Cc3, Nc4                         28879549  maeştri   12% → 13%
--      C Viena cu fianchetto — g3                          1195238  maeştri    7% → 0.6%
--   Apărarea Siciliană (după e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3; 37419096 de partide)
--      A Najdorf (a6)                                     22731852  maeştri   62% → 61%
--      B Scheveningen — Atacul Keres (g4)                  1509009  maeştri    4% → 4%
--      C Varianta Dragon (g6)                              8752805  maeştri   17% → 23%
--   Apărarea Franceză (după e4 e6 d4 d5; 180731765 de partide)
--      A Winawer (Nb4)                                     7449332  maeştri   21% → 4%
--      B Tarrasch (Cf6)                                   11171735  maeştri   31% → 6%
--      C Varianta Avans — c5 timpuriu                     82720246  maeştri   14% → 46%
--   Apărarea Caro-Kann (după e4 c6 d4 d5; 193065681 de partide)
--      A Varianta Clasică (Nf5)                           14138991  maeştri   17% → 7%
--      B Varianta Avans                                   95860638  maeştri   34% → 50%
--      C Varianta Schimb (exd5)                           47818040  maeştri   24% → 25%
--   Apărarea Regelui Indian (după d4 Nf6 c4 g6 Nc3 Bg7 e4 d6; 24490348 de partide)
--      A Varianta Clasică — Ce1, Cd3                       7990929  maeştri   33% → 33%
--      B Atacul cu Patru Pioni (f4)                        3846828  maeştri    6% → 16%
--      C Varianta Sämisch (f3, Ne3)                        2800777  maeştri   21% → 11%
--   Apărarea Nimzo-Indian (după d4 Nf6 c4 e6 Nc3 Bb4; 19096846 de partide)
--      A Varianta Dc2 — Classică                           2737039  maeştri   31% → 14%
--      B Varianta e3 — Rubinstein                          2110905  maeştri   43% → 11%
--      C Varianta a3 — Sämisch Nimzo                       2101577  maeştri    4% → 11%
--   Apărarea Olandeză (după d4 f5; 47835217 de partide)
--      A Varianta Stonewall — d5, e6, f5                    197011  maeştri    6% → 0.4%
--      B Varianta Leningrad — g6, Ng7                       158227  maeştri   20% → 0.3%
--      C Varianta Clasică — Ne7, rocadă                     303988  maeştri    6% → 0.6%
--   Apărarea Slav (după d4 d5 c4 c6; 85823696 de partide)
--      A Varianta Principală — Nf5, a6                     1850178  maeştri   19% → 2%
--      B Varianta Schimb (cxd5)                            2580501  maeştri    3% → 3%
--      C Semi-Slavă — e6, Cd7                              6213885  maeştri   22% → 7%
--   Apărarea Pirc (după e4 d6 d4 Nf6 Nc3 g6; 29793106 de partide)
--      A Varianta Clasică — Ne2, rocadă                    1476546  maeştri   22% → 5%
--      B Atacul Austrian — f4, Cf3                         3158563  maeştri   25% → 11%
--      C Atacul 150 — Ne3, Dd2, f3                         2229298  maeştri   18% → 7%
--   Apărarea Scandinavă (după e4 d5 exd5; 489694364 de partide)
--      A Varianta Principală — Dxd5, Da5                  78545491  maeştri   31% → 16%
--      B Varianta Modernă — 2...Cf6                       11275652  maeştri   15% → 2%
--      C Gambitul islandez — 3.c4 e6                       8397202  maeştri    1% → 2%
--   Apărarea Alekhine (după e4 Nf6 e5 Nd5 d4 d6; 8192187 de partide)
--      A Atacul cu Patru Pioni — c4, f4                    2442718  maeştri   15% → 30%
--      B Varianta Modernă — d4, Cf3                        1844292  maeştri   59% → 23%
--      C Varianta Schimb — exd6                            3237129  maeştri   31% → 40%
--   Partida Italiană (după e4 e5 Nf3 Nc6 Bc4; 591722743 de partide)
--      A Giuoco Piano (vs Nc5)                            12723420  maeştri    7% → 2%
--      D Giuoco Pianissimo (vs Nc5, cu d3)                50470235  maeştri   22% → 9%
--      E Gambitul Evans (vs Nc5, cu b4)                   10710351  maeştri    5% → 2%
--      B Apărarea celor doi cai (varianta liniştită cu    56905737  maeştri   33% → 10%
--      C Apărarea Ungară (vs Ne7)                         19779514  maeştri    3% → 3%
-- ============================================================

update public.opening_lines l
   set popularity_pct = v.pop
  from (values
  ('ff6881b7-305f-4fc7-865f-525e321c0ac5', 49),
  ('16cfa14a-12e5-43ba-8ae2-d397f849099a', 5),
  ('25633cb3-0436-4dba-b525-ec3fc960d31b', 3),
  ('8ea3598d-4f6d-4d99-b1ba-d14543dacb18', 3),
  ('23dc09de-9621-4448-b407-c112249bf892', 7),
  ('591d8d80-04c7-4a9c-a74f-2b4ec279f423', 7),
  ('92e3e10b-5468-4574-ab6a-b542afdc7b85', 23),
  ('50eb2fb8-dd83-4d80-8404-ce62e62d6329', 30),
  ('853448dc-5676-46f5-b5f8-9e42cba32b53', 18),
  ('53cb0cea-aa46-4f83-acb3-8303e8c9ecdb', 10),
  ('037d8d29-b31a-4d10-8a20-269255ae6f02', 18),
  ('de99d9bc-3d82-4c81-a727-04d119179599', 13),
  ('bb9e81a3-ffae-46a5-ae3e-7bab12174d9e', 16),
  ('5c021c8c-7aa5-4302-9d8b-d4305d623581', 1),
  ('c3aa691e-0e4b-4338-9605-10bb4648637f', 0.3),
  ('94b8d936-b8c3-4502-8a2e-3e703608cce6', 0.3),
  ('160cbeb7-5e1d-4618-8c5c-1bf98460a7dd', 0),
  ('85f69ee7-ca6e-4c72-be52-4b1885d69450', 5),
  ('255b2643-bbd3-4d0b-a894-7fc7f68ca847', 1),
  ('0a7ebc6f-331c-419a-98d5-bb5e39efb72b', 8),
  ('15cb1e33-b0b8-4282-b77b-d9daf86866f0', 0.4),
  ('24755074-e07c-438e-a60f-e91f89c38e62', 0),
  ('7f3c6a1b-0d00-4a52-9ded-a19341f06c49', 0),
  ('cb9a5ea6-d2c3-4dc8-acaa-4e2b7b9c9ef9', 0.7),
  ('5e83ae4c-700e-43d1-b155-660f7c0f46be', 11),
  ('7097c1e5-0444-4545-94b7-8771dc21ab8b', 13),
  ('96f1dfe8-f215-4a8a-8f60-bf7eade644e0', 0.6),
  ('3c88cf61-a4fa-4c4d-96e7-6d2187023b69', 61),
  ('8eac1248-86b5-48ba-9267-451885085fb4', 4),
  ('94b36630-0118-428f-a5fe-eb1db9102b77', 23),
  ('18d5cbda-3b68-4b37-9212-a7c7cbd5ba0b', 4),
  ('07bb5d3e-c78d-4766-81ba-e05f3d0229a1', 6),
  ('f058053d-1f18-4f16-937b-68c50d006d41', 46),
  ('70abe751-e636-4b73-8388-c6400978633d', 7),
  ('0ad89339-545b-4c60-bf91-b377f2ef47f1', 50),
  ('7d590267-22ca-49ce-b3c6-d667ff34a620', 25),
  ('0b1ab8a9-3ffb-4927-b8c7-8c9b787acd61', 33),
  ('b985052e-248e-4d10-ab41-d697fc7c7c48', 16),
  ('e9aa4ada-d437-4d60-a738-5be7d95f0738', 11),
  ('9b342dbf-a480-4b73-9c4a-3e8651f94971', 14),
  ('308290bb-fbb2-4b22-b0ba-797ad4d18fd3', 11),
  ('239609fd-3254-4094-9d21-0de5eaf9a40a', 11),
  ('2f936ee8-e9b8-42ba-8583-2809aab2f268', 0.4),
  ('4bdfb2a3-83e3-4f7b-9cd7-0dc83ea8baee', 0.3),
  ('6b730897-0f0b-4dce-b616-16ffdba8a9e6', 0.6),
  ('b6c9d551-9c8d-4c9c-91a1-07434612e1aa', 2),
  ('1c6d1336-e912-47c0-a711-99990fd2f9d5', 3),
  ('39397fab-0d28-42d2-adc8-68b3202195c9', 7),
  ('3b0518b3-6946-4fa9-bc86-dc0d77ff7567', 5),
  ('51608007-6b6c-4849-b29d-0daad96c56b5', 11),
  ('3f3424a5-2bcf-44d7-98d1-88c8f304a558', 7),
  ('37b2c1b0-f77a-4775-978e-c72835e5f1bc', 16),
  ('5b266987-3697-45b7-b0e8-fe1a6f094e14', 2),
  ('54d6fcce-ab12-44b2-a8f4-3c88d5a8b461', 2),
  ('1c4b08da-030d-4239-b4c3-7cc5f1acad00', 30),
  ('33368253-af12-4e48-a7d6-4b0d729883ee', 23),
  ('890193ea-a5d2-4729-9f0f-fb7533572b17', 40),
  ('6934b8f5-a458-41d5-962e-8d6d7325a503', 2),
  ('1c464ece-e18b-4514-891b-ba9911e98bcb', 9),
  ('2199a3a4-1680-4820-99c7-404b6f6dbaf4', 2),
  ('ca609b84-f8db-43b8-91b5-6f843563c683', 10),
  ('e016a9f3-c2d0-46ca-9f7c-25fe06c94eed', 3)
  ) as v(id, pop)
 where l.id = v.id::uuid;

do $$
declare
  n int;
begin
  select count(*) into n
    from public.opening_lines l
    join (values
  ('ff6881b7-305f-4fc7-865f-525e321c0ac5', 49),
  ('16cfa14a-12e5-43ba-8ae2-d397f849099a', 5),
  ('25633cb3-0436-4dba-b525-ec3fc960d31b', 3),
  ('8ea3598d-4f6d-4d99-b1ba-d14543dacb18', 3),
  ('23dc09de-9621-4448-b407-c112249bf892', 7),
  ('591d8d80-04c7-4a9c-a74f-2b4ec279f423', 7),
  ('92e3e10b-5468-4574-ab6a-b542afdc7b85', 23),
  ('50eb2fb8-dd83-4d80-8404-ce62e62d6329', 30),
  ('853448dc-5676-46f5-b5f8-9e42cba32b53', 18),
  ('53cb0cea-aa46-4f83-acb3-8303e8c9ecdb', 10),
  ('037d8d29-b31a-4d10-8a20-269255ae6f02', 18),
  ('de99d9bc-3d82-4c81-a727-04d119179599', 13),
  ('bb9e81a3-ffae-46a5-ae3e-7bab12174d9e', 16),
  ('5c021c8c-7aa5-4302-9d8b-d4305d623581', 1),
  ('c3aa691e-0e4b-4338-9605-10bb4648637f', 0.3),
  ('94b8d936-b8c3-4502-8a2e-3e703608cce6', 0.3),
  ('160cbeb7-5e1d-4618-8c5c-1bf98460a7dd', 0),
  ('85f69ee7-ca6e-4c72-be52-4b1885d69450', 5),
  ('255b2643-bbd3-4d0b-a894-7fc7f68ca847', 1),
  ('0a7ebc6f-331c-419a-98d5-bb5e39efb72b', 8),
  ('15cb1e33-b0b8-4282-b77b-d9daf86866f0', 0.4),
  ('24755074-e07c-438e-a60f-e91f89c38e62', 0),
  ('7f3c6a1b-0d00-4a52-9ded-a19341f06c49', 0),
  ('cb9a5ea6-d2c3-4dc8-acaa-4e2b7b9c9ef9', 0.7),
  ('5e83ae4c-700e-43d1-b155-660f7c0f46be', 11),
  ('7097c1e5-0444-4545-94b7-8771dc21ab8b', 13),
  ('96f1dfe8-f215-4a8a-8f60-bf7eade644e0', 0.6),
  ('3c88cf61-a4fa-4c4d-96e7-6d2187023b69', 61),
  ('8eac1248-86b5-48ba-9267-451885085fb4', 4),
  ('94b36630-0118-428f-a5fe-eb1db9102b77', 23),
  ('18d5cbda-3b68-4b37-9212-a7c7cbd5ba0b', 4),
  ('07bb5d3e-c78d-4766-81ba-e05f3d0229a1', 6),
  ('f058053d-1f18-4f16-937b-68c50d006d41', 46),
  ('70abe751-e636-4b73-8388-c6400978633d', 7),
  ('0ad89339-545b-4c60-bf91-b377f2ef47f1', 50),
  ('7d590267-22ca-49ce-b3c6-d667ff34a620', 25),
  ('0b1ab8a9-3ffb-4927-b8c7-8c9b787acd61', 33),
  ('b985052e-248e-4d10-ab41-d697fc7c7c48', 16),
  ('e9aa4ada-d437-4d60-a738-5be7d95f0738', 11),
  ('9b342dbf-a480-4b73-9c4a-3e8651f94971', 14),
  ('308290bb-fbb2-4b22-b0ba-797ad4d18fd3', 11),
  ('239609fd-3254-4094-9d21-0de5eaf9a40a', 11),
  ('2f936ee8-e9b8-42ba-8583-2809aab2f268', 0.4),
  ('4bdfb2a3-83e3-4f7b-9cd7-0dc83ea8baee', 0.3),
  ('6b730897-0f0b-4dce-b616-16ffdba8a9e6', 0.6),
  ('b6c9d551-9c8d-4c9c-91a1-07434612e1aa', 2),
  ('1c6d1336-e912-47c0-a711-99990fd2f9d5', 3),
  ('39397fab-0d28-42d2-adc8-68b3202195c9', 7),
  ('3b0518b3-6946-4fa9-bc86-dc0d77ff7567', 5),
  ('51608007-6b6c-4849-b29d-0daad96c56b5', 11),
  ('3f3424a5-2bcf-44d7-98d1-88c8f304a558', 7),
  ('37b2c1b0-f77a-4775-978e-c72835e5f1bc', 16),
  ('5b266987-3697-45b7-b0e8-fe1a6f094e14', 2),
  ('54d6fcce-ab12-44b2-a8f4-3c88d5a8b461', 2),
  ('1c4b08da-030d-4239-b4c3-7cc5f1acad00', 30),
  ('33368253-af12-4e48-a7d6-4b0d729883ee', 23),
  ('890193ea-a5d2-4729-9f0f-fb7533572b17', 40),
  ('6934b8f5-a458-41d5-962e-8d6d7325a503', 2),
  ('1c464ece-e18b-4514-891b-ba9911e98bcb', 9),
  ('2199a3a4-1680-4820-99c7-404b6f6dbaf4', 2),
  ('ca609b84-f8db-43b8-91b5-6f843563c683', 10),
  ('e016a9f3-c2d0-46ca-9f7c-25fe06c94eed', 3)
    ) as v(id, pop) on l.id = v.id::uuid
   where l.popularity_pct = v.pop;
  if n <> 62 then
    raise exception 'Doar % din 62 capitole au procentul nou', n;
  end if;
  raise notice 'OK: 62 capitole cu popularitatea din partidele de nivel mediu (Chess.com, 1000-2000)';
end $$;
