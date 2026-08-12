-- ============================================================
-- Siciliana: jocul de mijloc
-- ============================================================
-- Structura, ideile şi greşeala tipică pentru fiecare variantă, plus o
-- continuare jucabilă din poziţia exactă în care se opreşte deschiderea.
-- Fiecare afirmaţie e verificată pe poziţie, cu Stockfish sau uitându-ne la
-- tablă. Unde apare o cifră, cifra a fost măsurată.
--
-- Două lucruri pe care le-am scris altfel decât se spune de obicei:
--
--  · La Dragon nu scrie că nebunul de pe g7 „mătură diagonala mare". În
--    poziţia la care ajunge cursul, e blocat de propriul cal de pe f6 şi
--    poate merge doar pe h8 sau h6. Verificat. Clişeul e adevărat mai târziu,
--    nu acolo.
--  · La Najdorf, evaluarea rămâne în jur de +0,9 pentru alb pe toată
--    continuarea. Nu se ascunde: English Attack chiar dă albului mai mult
--    spaţiu, iar preţul e scris în lecţie, nu ocolit.
-- ============================================================

-- ============================================================
-- A · NAJDORF
-- ============================================================
select public.seed_plan('sicilian-defense', 'A',
  'Regii au plecat în părţi opuse: al tău pe flancul regelui, al lui pe flancul damei. De acum partida e o cursă — fiecare împinge pionii spre celălalt, iar cine ajunge primul decide. Nu se mai joacă pentru poziţie bună, ci pentru viteză.',
  '[
    {"title": "b5-b4 e cursa ta", "detail": "Pionul de pe b nu se dezvoltă, aleargă. Îl împingi până loveşte calul de pe c3 — apărătorul cel mai apropiat al regelui alb. În cursele astea o mutare de pion valorează cât o piesă bine aşezată."},
    {"title": "Nu-ţi apăra flancul, atacă-l pe al lui", "detail": "Albul vine cu g4-g5 spre regele tău şi e tentant să răspunzi cu h6 şi mutări de aşteptare. Fiecare mutare de apărare e însă un tempo pierdut în cursă, iar tempoul e singurul lucru pe care îl ai în plus."},
    {"title": "Câmpul d5 e preţul plătit", "detail": "După e5, câmpul d5 rămâne al lui pentru toată partida şi acolo îşi va aşeza un cal. Ştiai asta când ai împins pionul. De aceea contra-jocul trebuie să vină repede: nu ai timp să-l laşi să-şi aşeze piesele comod."}
  ]'::jsonb,
  'Nu schimba damele. Într-o cursă de atacuri pe flancuri opuse, dama e piesa care loveşte prima; fără ea rămâi într-un final în care contează spaţiul lui şi câmpul d5, adică exact lucrurile la care stai mai prost. Viteza ta nu mai valorează nimic într-un final.'
);

select public.seed_plan_moves('sicilian-defense', 'A',
  'b7b5 c1b1 c8d7 g2g4 b5b4 c3d5 f6d5 e4d5 c6a5 d2b4 a5b3 b4b3',
  '{
    "0": "b5 — porneşte cursa. Pionul ăsta are o singură treabă: să ajungă la c3.",
    "1": "Albul îşi mută regele pe b1, în afara coloanei c care se va deschide.",
    "2": "Nd7 — nebunul iese şi, în acelaşi timp, leagă turnurile.",
    "3": "Albul începe şi el, cu g4.",
    "4": "b4 — loveşti calul de pe c3. Nu ai cum să dai înapoi acum: în cursa asta, cine se opreşte pierde.",
    "5": "Albul îşi salvează calul sărind pe d5 — fix câmpul pe care i l-ai dat când ai jucat e5.",
    "6": "Cxd5 — schimbi calul care tocmai s-a aşezat acolo. Nu-l lăsa să stea: de pe d5 ţine toată poziţia ta.",
    "7": "Albul reia cu pionul şi îşi înfige un pion pe d5.",
    "8": "Ca5 — calul porneşte spre b3, chiar lângă regele lui.",
    "9": "Albul îţi ia pionul de pe b4 cu dama.",
    "10": "Cxb3 — schimbi şi asta. Fiecare piesă schimbată din jurul regelui alb îl lasă mai gol, chiar dacă pe tablă rămâne material egal.",
    "11": "Albul reia cu dama şi rămâneţi într-o poziţie în care el are spaţiu, iar tu ai coloanele deschise spre regele lui."
  }'::jsonb
);


-- ============================================================
-- B · SCHEVENINGEN
-- ============================================================
select public.seed_plan('sicilian-defense', 'B',
  'Zidul mic de pioni — d6 şi e6 — e tot ce te desparte de spaţiul lui, şi n-are nicio gaură. El şi-a împins deja pionii pe flancul regelui, deci acolo nu se mai poate ascunde: amândoi vă duceţi regii pe flancul damei. Verificat pe poziţie — regele lui ajunge pe c1, al tău pe c8. Cu regii pe aceeaşi parte, cursa de pioni dispare şi rămâne jocul de manevră.',
  '[
    {"title": "Nebunul iese prin d7 spre c6", "detail": "Cu e6 jucat, nebunul de c8 şi-a pierdut diagonala firească. Drumul lui e d7 şi apoi c6, de unde priveşte drept la pionul de e4 — verificat, de pe c6 chiar ajunge acolo. Din piesa cea mai proastă devine cea mai bine aşezată."},
    {"title": "Coloana h a rămas a ta", "detail": "Pionul de pe h s-a dus la mutarea a şaptea, când ai luat pe g5, dar coloana a rămas deschisă şi turnul tău stă deja pe ea. Nu duce la regele lui — el pleacă în partea cealaltă — dar e o cale liberă pe care el nu o are."},
    {"title": "Schimbă calul din centru", "detail": "Calul lui de pe d4 e piesa care ţine toată poziţia albă legată. Îl schimbi cu Cxd4 şi, odată cu el, dispare şi cea mai bună piesă a atacului de pe flanc. Cu mai puţine piese pe tablă, spaţiul lui în plus are mai puţin cu ce lovi."}
  ]'::jsonb,
  'Nu porni un atac de pioni pe flancul damei doar fiindcă aşa se joacă Siciliana. Aici regele tău ajunge tot acolo: fiecare pion împins pe partea aia îţi deschide propria poziţie. Când regii stau pe aceeaşi parte, se joacă pe centru şi pe coloane, nu cu pionii.'
);

select public.seed_plan_moves('sicilian-defense', 'B',
  'c8d7 e1c1 d7c6 h2h4 f8e7 h1g1 d8b6 d4d2 a7a6 f1g2 e8c8 g2f3',
  '{
    "0": "Nd7 — prima parte a drumului. Nebunul iese din colţ, unde nu făcea nimic.",
    "1": "Albul îşi duce regele pe flancul damei.",
    "2": "Nc6 — a doua parte. De aici nebunul apasă pe pionul de e4 şi, în acelaşi timp, păzeşte câmpurile albe din faţa regelui tău viitor.",
    "3": "Albul continuă pe flancul regelui cu h4.",
    "4": "Ne7 — nebunul celălalt iese modest, dar îţi deschide drumul spre rocadă.",
    "5": "Albul îşi pune turnul pe coloana g, în spatele pionilor.",
    "6": "Db6 — dama iese din spatele zidului. Aici e mai activă decât pe d8 şi îţi eliberează câmpul pentru turn.",
    "7": "Albul îşi retrage dama pe d2, ca să nu stea în bătaia pieselor tale.",
    "8": "a6 — pregăteşti locul regelui. O mutare mică, dar fără ea rocada lungă e mai puţin sigură.",
    "9": "Albul îşi dezvoltă nebunul în fianchetto.",
    "10": "Rocada lungă. Regele intră lângă al lui, iar de acum nu mai e cursă: e joc de manevră, unde contează cine ocupă mai bine coloanele.",
    "11": "Albul îşi aduce nebunul pe f3, faţă în faţă cu al tău de pe c6."
  }'::jsonb
);


-- ============================================================
-- C · DRAGON
-- ============================================================
select public.seed_plan('sicilian-defense', 'C',
  'Ai pionii de pe c dublaţi — c6 şi c7 — şi în schimb ai primit coloana b deschisă, care duce drept la regele lui de pe c1. Ăsta e târgul din Dragon: structura se dă pe drumuri de atac. Nu te uita la pioni, uită-te la unde ajung turnurile tale.',
  '[
    {"title": "Coloana b e plata pe pionii dublaţi", "detail": "Pionul tău de pe b s-a dus când ai reluat pe c6, iar coloana a rămas liberă până la nebunul lui de pe b3 şi pionul de pe b2 — adică exact la piesele din faţa regelui. Un turn adus acolo face mai mult decât pionul pe care l-ai pierdut."},
    {"title": "Nebunul de c8 iese doar prin a6", "detail": "După ce joci e6, propriul pion îi taie diagonala lungă, iar b7 e ocupat de nimic dar nu duce nicăieri, fiindcă pionul tău de pe c6 blochează drumul. Rămâne a6 — verificat pe poziţie, e singurul câmp activ de unde poate ieşi."},
    {"title": "Nebunul de g7 nu e încă piesa din poveste", "detail": "Se spune despre el că mătură diagonala mare, şi aşa e — dar mai târziu. În poziţia asta îl blochează chiar calul tău de pe f6, iar singurele lui mutări sunt h8 şi h6. Ca să înceapă să conteze, calul trebuie să plece."}
  ]'::jsonb,
  'Nu-ţi pierde timpul încercând să repari pionii dublaţi de pe c. Sunt preţul pe care l-ai plătit conştient pentru coloana b, iar dacă îi „repari" ai dat structura şi n-ai luat nimic în schimb. În Dragon se atacă, nu se face ordine.'
);

select public.seed_plan_moves('sicilian-defense', 'C',
  'f1c4 e7e6 h2h4 d8c7 c4b3 c8a6 c3a4 a8d8',
  '{
    "0": "Albul îşi scoate nebunul pe c4, îndreptat spre f7.",
    "1": "e6 — ridici un zid în faţa lui. Preţul: îţi tai singur diagonala nebunului de c8, care de acum are un singur drum de ieşire.",
    "2": "Albul porneşte pionii cu h4, spre regele tău.",
    "3": "Dc7 — dama se aşază pe coloana c, în spatele pionilor dublaţi. De acolo priveşte spre regele lui.",
    "4": "Albul îşi retrage nebunul pe b3, ferindu-l de schimb.",
    "5": "Na6 — singurul câmp activ care i-a rămas nebunului. Verificat: de pe c8 mai putea merge doar pe d7 şi b7, unde nu vede nimic.",
    "6": "Albul îşi mută calul pe a4, spre c5.",
    "7": "Tad8 — aduci şi turnul în joc, pe coloana d. Poziţia e echilibrată, iar planul tău e limpede: coloana b, apoi regele lui."
  }'::jsonb
);
