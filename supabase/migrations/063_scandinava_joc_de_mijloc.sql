-- ============================================================
-- Scandinava: jocul de mijloc
-- ============================================================
-- Structura, ideile şi greşeala tipică pentru fiecare variantă, plus o
-- continuare jucabilă din poziţia în care se opreşte deschiderea. Fiecare
-- afirmaţie a fost verificată pe poziţie.
--
-- Una era să intre greşită şi aici: scrisesem că la Varianta Principală rămân
-- pioni dublaţi pe coloana e. Nu rămân — pionul de pe e6 fusese deja capturat,
-- iar cel care reia e pionul de pe f. Ce rămâne cu adevărat e coloana f
-- deschisă, cu turnul negru deja pe ea.
-- ============================================================

-- ============================================================
-- A · VARIANTA PRINCIPALĂ
-- ============================================================
select public.seed_plan('scandinavian-defense', 'A',
  'Damele se schimbă aproape imediat, iar odată cu ele dispare şi ideea de atac la rege. Rămâne o poziţie de manevră, în care coloana f îţi stă deschisă şi turnul e deja pe ea. Ai un singur nebun — celălalt s-a schimbat pe e6 — deci fiecare mutare a lui contează dublu.',
  '[
    {"title": "Coloana f e câştigul tău", "detail": "După ce reiei pe e6 cu pionul de pe f, coloana f rămâne liberă, iar turnul tău de pe f8 e deja acolo, fără să fi mutat nimic. Verificat pe poziţie: f7 e gol, iar turnul stă pe f8."},
    {"title": "Adu calul de pe b8", "detail": "E singura piesă care n-a ieşit deloc. Fără dame pe tablă nu mai există grabă, dar există socoteală: cine îşi termină dezvoltarea primul are mai multe mutări bune la dispoziţie."},
    {"title": "Fără dame, joci pe câmpuri, nu pe rege", "detail": "Damele se duc la mutarea a unsprezecea. De acolo încolo nu mai caută nimeni matul; se joacă pentru coloane deschise, pentru câmpuri slabe şi pentru cine ajunge primul cu turnul unde trebuie."}
  ]'::jsonb,
  'Nu te grăbi să iei pe c3 cu nebunul doar fiindcă îi strici pionii. Ai un singur nebun rămas pe tablă, iar el e mai valoros ca piesă activă decât ca schimb pentru o structură urâtă. Într-o poziţie fără dame, o piesă bună face mai mult decât un pion dublat al adversarului.'
);

select public.seed_plan_moves('scandinavian-defense', 'A',
  'c4e6 b6e6 e2e6 f7e6 e1c1 b8c6 h1e1 b4c5',
  '{
    "0": "Albul schimbă nebunii pe e6.",
    "1": "Dxe6 — reiei cu dama, singura mutare care nu-ţi strică nimic.",
    "2": "Albul propune şi schimbul damelor.",
    "3": "fxe6 — reiei cu pionul de pe f, nu cu altceva. Aşa deschizi coloana f, iar turnul tău e deja pe ea. Pionul de pe e6 nu e frumos, dar e preţul unei coloane.",
    "4": "Albul îşi duce regele pe flancul damei.",
    "5": "Cc6 — ultima piesă care n-a ieşit din colţ intră în joc.",
    "6": "Albul îşi aduce şi celălalt turn.",
    "7": "Nc5 — nebunul se aşază pe diagonala bună, îndreptat spre f2. E singurul nebun care ţi-a rămas; ţine-l activ."
  }'::jsonb
);


-- ============================================================
-- B · VARIANTA MODERNĂ
-- ============================================================
select public.seed_plan('scandinavian-defense', 'B',
  'Albul are un pion înfipt pe d5, sprijinit de cel de pe c4. E cea mai avansată piesă a lui şi, în acelaşi timp, cea mai fixă: nu se poate muta fără să piardă sprijinul. Tot jocul tău se învârte în jurul lui — îl ataci cu pioni, nu cu piese, fiindcă pionii sunt mai ieftini.',
  '[
    {"title": "e6 şi c6 sunt loviturile", "detail": "Pionul de d5 se atacă de dedesubt, cu pioni. Mai întâi e6, apoi c6: două lovituri din direcţii diferite, iar el nu poate răspunde la amândouă cu acelaşi pion de pe c4."},
    {"title": "Nebunul se întoarce pe g7", "detail": "A ajuns pe e5 dintr-o reluare, dar acolo stă în calea propriilor planuri. Pe g7 se aşază înapoi pe diagonala lungă, exact cea pentru care l-ai pus acolo la mutarea a patra."},
    {"title": "a5 opreşte flancul damei", "detail": "Albul vrea a4-a5, ca să-ţi alunge calul de pe b6 şi să-şi facă loc. Un singur pion împins la timp îi taie tot planul, iar tu rămâi liber să te ocupi de centru."}
  ]'::jsonb,
  'Nu ataca pionul de d5 cu piese înainte să-l fi lovit cu pioni. O piesă care stă în faţa lui e o piesă blocată, iar el are cine să-l apere. Pionii fac treaba asta mai ieftin: dacă schimbi pion pe pion, structura lui se destramă, iar dacă nu schimbă, rămâne cu un pion pe care trebuie să-l păzească toată partida.'
);

select public.seed_plan_moves('scandinavian-defense', 'B',
  'a2a4 a7a5 f1e1 e7e6 e2f1 e5g7 b1c3 e6d5 c4d5 c7c6',
  '{
    "0": "Albul începe cu a4, vrând a5 şi alungarea calului tău.",
    "1": "a5 — îi tai planul dintr-o mutare. Pionul stă acolo şi nu mai lasă pe nimeni să treacă.",
    "2": "Albul îşi aduce turnul pe coloana e.",
    "3": "e6 — prima lovitură în pionul de d5. Îl ataci de dedesubt, cu un pion, nu cu o piesă.",
    "4": "Albul îşi retrage nebunul pe f1.",
    "5": "Ng7 — nebunul se întoarce pe diagonala lui. Pe e5 ajunsese dintr-o reluare, nu dintr-un plan.",
    "6": "Albul îşi dezvoltă calul.",
    "7": "exd5 — schimbi în centru şi îi desfaci perechea de pioni.",
    "8": "Albul reia cu pionul de pe c4, ca să-şi ţină pionul înaintat.",
    "9": "c6 — a doua lovitură, din cealaltă parte. Acum pionul de d5 e atacat din două direcţii şi are un singur apărător."
  }'::jsonb
);


-- ============================================================
-- C · GAMBITUL ICELANDIC
-- ============================================================
select public.seed_plan('scandinavian-defense', 'C',
  'Ai dat un pion la mutarea a treia şi ţi l-ai luat înapoi. Ce ai câştigat în plus e ceva ce nu se vede în numărătoare: regele alb rămâne în centru. Verificat pe poziţie — după schimbul de pe f1, albul pierde amândouă drepturile de rocadă, iar la capătul liniei regele lui e tot acolo, în timp ce al tău stă la adăpost.',
  '[
    {"title": "Schimbul de pe f1 îi ia rocada", "detail": "Nebunul tău ia pe f1, iar albul e obligat să reia cu regele. Din clipa aceea nu mai poate face rocada niciodată — verificat, drepturile dispar amândouă. Un nebun dat pe un nebun, şi în plus regele lui rămâne în mijlocul tablei."},
    {"title": "Fă rocada tu, cât el nu poate", "detail": "El nu mai are cum. Tu ai. E singura asimetrie care contează în poziţia asta, şi vine din schimbul de la mutarea zece."},
    {"title": "Nu-ţi trebuie atac, îţi trebuie ordine", "detail": "Cu regele lui în centru, nu te grăbi să deschizi linii cu orice preţ. Adu-ţi piesele, fă rocada, şi lasă-l pe el să găsească un loc unde să-şi pună regele. De obicei nu găseşte unul bun."}
  ]'::jsonb,
  'Nu deschide centrul cât timp regele tău e încă în centru. Sună de la sine înţeles, dar în gambitul ăsta e ispita cea mai mare: ai iniţiativă, adversarul are regele prost aşezat, şi pare că orice deschidere de linie te ajută. Îl ajută pe el, dacă la momentul acela regele tău e tot pe e8.'
);

select public.seed_plan_moves('scandinavian-defense', 'C',
  'e2f1 e1f1 b8c6 d4d5 e7e4 f3e4 c6e7 c3b5 e8g8 f1e2',
  '{
    "0": "Nxf1 — schimbi nebunii. Nu pentru material, ci pentru ce urmează.",
    "1": "Albul e obligat să reia cu regele: turnul de pe h1 nu ajunge la f1. Din clipa asta nu mai poate face rocada.",
    "2": "Cc6 — te dezvolţi liniştit. Nu e nimic de grăbit; avantajul tău nu fuge nicăieri.",
    "3": "Albul împinge d5 şi îţi alungă calul.",
    "4": "Dxe4 — schimbi damele. Cu regele lui rămas în centru, nu ai nevoie de dame ca să-l pedepseşti; ai nevoie de piese aşezate.",
    "5": "Albul reia cu pionul.",
    "6": "Ce7 — calul se retrage şi îşi caută drumul înapoi spre centru.",
    "7": "Albul îşi trimite calul pe b5.",
    "8": "Rocada. Tu poţi, el nu — asta e tot ce ai cumpărat cu pionul de la mutarea a treia.",
    "9": "Albul îşi mută regele pe e2, căutând un loc mai bun. Nu prea are unde."
  }'::jsonb
);
