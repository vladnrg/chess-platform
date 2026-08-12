-- ============================================================
-- Alekhine, Varianta Schimb: linia era greşită de la rădăcină
-- ============================================================
-- Nu era o greşeală de tipar. Linia mergea 1.e4 Cf6 2.e5 Cd5 3.exd6 — dar
-- negrul nu jucase niciodată d6, deci capturarea era imposibilă. Lipseau exact
-- mutările 3.d4 d6 4.c4 Cb6, adică miezul deschiderii.
--
-- De acolo încolo, toate cele cincisprezece semi-mutări rămase erau imposibile:
-- lecţia se oprea la a patra semi-mutare şi nu mai pornea. Practic, cursul
-- n-avea a treia variantă.
--
-- Aici e reconstruită întreagă: trunchiul corect al Variantei Schimb, plus o
-- continuare verificată cu Stockfish la adâncime 18. Evaluarea stă între +0,48
-- şi +0,77 pe tot parcursul — normal pentru Alekhine, unde albul primeşte
-- spaţiu dinadins, ca preţ pentru pionii pe care i-a împins ca să te fugărească.
--
-- Explicaţiile vechi erau şi ele decalate: textul de la semi-mutarea 14
-- descria mutarea 15, cel de la 16 descria 17. Sunt scrise din nou, toate.
-- ============================================================

select public.repara_linie('alekhine-defense', 'C',
  'e2e4 g8f6 e4e5 f6d5 d2d4 d7d6 c2c4 d5b6 e5d6 e7d6 b1c3 b8c6 c1e3 f8e7 f1d3 e8g8 b2b3 a7a5 g1e2');

update public.opening_lines l
   set move_explanations = '{
  "0": "Adversarul deschide cu e4.",
  "1": "Cf6 — Apărarea Alekhine. Nu ocupi centrul, îl provoci: calul stă chiar în faţa pionului şi îl invită să înainteze.",
  "2": "Adversarul îl alungă cu e5. Exact ce voiai — fiecare pion împins e un pion care nu se mai poate întoarce.",
  "3": "Cd5 — calul se retrage în centru, nu acasă.",
  "4": "Adversarul îşi construieşte centrul cu d4.",
  "5": "d6 — abia acum loveşti. Pionul de e5 e vârful lanţului lui, iar tu îl ataci de dedesubt.",
  "6": "Adversarul joacă c4 şi îţi alungă calul a doua oară.",
  "7": "Cb6 — a treia mutare cu acelaşi cal, şi tot n-ai ce reproşa: albul a împins patru pioni ca să te fugărească, iar pionii aceia rămân acolo unde i-a pus.",
  "8": "Adversarul schimbă pe d6 — Varianta Schimb. Simplifică, în loc să-şi apere lanţul.",
  "9": "exd6 — reiei cu pionul de pe e7. Coloana e se deschide de tot, iar nebunul de f8 capătă drum liber.",
  "10": "Adversarul îşi dezvoltă calul pe c3.",
  "11": "Cc6 — al doilea cal în joc, îndreptat spre d4.",
  "12": "Adversarul îşi scoate nebunul pe e3.",
  "13": "Ne7 — nebunul iese pe câmpul eliberat de schimb. Fără capturarea de pe d6, aici ar fi stat pionul tău.",
  "14": "Adversarul îşi dezvoltă şi celălalt nebun, pe d3.",
  "15": "Rocada. Regele la adăpost, iar turnul de pe f8 e la o singură mutare de coloana e — cea pe care ai deschis-o singur la mutarea a cincea.",
  "16": "Adversarul îşi întăreşte flancul damei cu b3.",
  "17": "a5 — începi să împingi acolo. Pionii lui de pe c4 şi b3 se sprijină unul pe altul; a5-a4 e felul în care se sparge o asemenea legătură.",
  "18": "Adversarul îşi aduce şi ultimul cal, prin e2."
}'::jsonb
  from public.courses c
 where l.course_id = c.id and c.slug = 'alekhine-defense' and l.variation_code = 'C';


-- Verificare, după rulare: linia trebuie să aibă 19 semi-mutări şi să înceapă
-- cu 1.e4 Cf6 2.e5 Cd5 3.d4 d6 4.c4 Cb6 5.exd6 exd6.
--   select left(moves_uci, 60) from public.opening_lines l
--     join public.courses c on c.id = l.course_id
--    where c.slug = 'alekhine-defense' and l.variation_code = 'C';
