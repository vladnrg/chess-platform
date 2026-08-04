# Session Log

Jurnal de sesiuni de lucru - cele mai recente primele.

---

## 2026-08-04 → 08-05 - Streak, jocul de mijloc, reparații la motor

### Ce s-a făcut

**Streak** (migrarea 039) — zile la rând în care ai câştigat XP, nu în care
te-ai logat. Insignă în bara de sus, care se vede şi când e 0; click deschide
săptămâna, citită din jurnalul de XP.

**Jocul de mijloc** (migrările 040–042) — planuri legate de fiecare variantă,
aşezate pe coloane, plus capcanele deschiderii în ambele sensuri („Ai grijă" /
„Urmăreşte"). Apoi, la cererea ta, transformat din tabel în **exerciţiu**:
butonul „Parcurge ideile din jocul de mijloc" duce acum la etapa a doua a
antrenorului, pornind din poziţia exactă de la capătul deschiderii — ghidat,
apoi pe cont propriu. Conţinut: Caro-Kann complet.

**Bara de sus** mărită cu 25%, cu `--board-chrome` ajustat în consecinţă.

### Bug-uri găsite şi reparate

- **Tabla de analiză cădea după două mutări.** `stop` era urmat imediat de noua
  poziţie, iar liniile rămase din căutarea veche ajungeau la ascultătorul nou.
  chess.js aruncă eroare la mutări ilegale, iar funcţia rula la randare — deci
  pagina se stingea. Acum se aşteaptă confirmarea motorului.
- **Verificarea de echivalenţă din puzzle-uri** pornea două căutări simultan pe
  acelaşi motor, prin `Promise.all`. Acum merg una după alta.
- **`streak_days` nu-l scria nimeni.** Versiunea originală a lui `award_xp` îl
  actualiza, dar nu seta `last_active_date`; apoi rescrierile din 029/030/033
  au scos bucata cu totul.

### Ce rămâne

- [ ] **Traseul stil Duolingo** trebuie să înglobeze jocul de mijloc ca noduri
      legate, nu ca secţiune separată sub el. Schema profesionistă vine de la
      tine; instalaţia (rute, antrenor, conţinut) e deja gata.
- [ ] Jocul de mijloc pentru celelalte 9 deschideri de negru
- [ ] Rating pentru deschideri — singurul punct din lista iniţială nefăcut
- [ ] Sub-meniurile se deschid la click, nu la hover
- [ ] Misiunile zilei sunt tot machetă cu date fixe
- [ ] Proiectul nu are niciun test automat

### Commits

`a03cc5b` bara de sus · `afbc847` tabla de analiză reparată ·
`1a721aa` streak · `2099cca` jocul de mijloc (planuri şi capcane) ·
`4122794` jocul de mijloc ca exerciţiu

### Decizii importante

- **Conţinutul didactic se verifică, nu se presupune.** Am aruncat două capcane
  scrise pentru Caro-Kann fiindcă afirmaţiile nu erau destul de sigure, deşi
  mutările erau legale. Un plan greşit nu e un bug — e cineva care învaţă un
  lucru fals şi îl repetă un an.
- **Un curs complet, nu zece pe jumătate.** Structura e fixată; restul e
  conţinut curat, ~15 minute per curs.
- **Streak-ul stocat e o fotografie**, nu adevărul. Afişarea trece mereu prin
  `effectiveStreak`, altfel ar arăta un şir rupt ca activ.

---

## 2026-08-03 → 08-04 - Evenimente, tablă de analiză, curățenie vizuală

### Ce s-a făcut

**Evenimente sezoniere** (migrările 030–036)
- O singură temelie pentru toate: interval de timp, sarcini care se deschid pe
  rând, recompense. Nu cinci sisteme paralele.
- Cosmetice noi: 6 insigne + 5 teme de tablă. Nu exista nimic de dăruit, iar
  calendarul de Crăciun exact asta cere.
- Conținut: 24 de uși de calendar, chessathon de iarnă, 15 zile de mari jucători
  (inclusiv Florin Gheorghiu), vânătoarea de ouă de Paști.
- **Provocarea deschiderilor**: bancă de 60 de întrebări, calupuri de 5, luni ·
  miercuri · vineri · duminică. Un singur răspuns, definitiv. XP la final:
  +8 corect, −3 greșit, +15 dacă le iei pe toate.
- Fiecare întrebare are tabla, nu doar notația — cine nu citește notația din cap
  nu învăța nimic dintr-un șir de litere.

**Ligile, refăcute** (migrarea 038)
- Prima treime urcă, ultima coboară, restul rămân. Dispare orice prag de XP.
- Decizia se ia acum într-un singur loc. Înainte retrogradarea era în TypeScript
  (edge function, cu propriul tabel de praguri) și promovarea în SQL.

**Tabla de analiză** — pagină nouă, sub Antrenament. Muți liber, Stockfish
evaluează în timp real și arată primele trei continuări.

**Refutarea din puzzle-uri** — după o mutare greșită poți vedea cum cade,
mutare cu mutare, cu note de la Călușul savant. Un singur apel AI pentru toată
linia, fiindcă planul gratuit are 3 întrebări pe zi.

**Bârlogul** redus la trei lucruri: liga, nivelul, harta aplicației.

### Bug-uri găsite și reparate

- **Stockfish nu pornise niciodată.** `public/stockfish.js` e doar încărcătorul
  de 20KB; fișierul `.wasm` de 7MB lipsea din proiect. Analiza partidei,
  analiza din Lichess și refutarea eșuau tăcut. Se copiază acum din
  node_modules la instalare și înainte de build.
- **Puzzle-urile se repetau**: selecția nu citea ce ai rezolvat deja, iar
  `limit(40)` fără ordonare întorcea mereu aceleași rânduri. Banca are 565 de
  puzzle-uri, nu 128 — numărătoarea inițială rata id-urile cu majuscule.
- **Un mat era considerat greșit** dacă îl dădeai cu altă piesă decât cea din
  soluție. Plasa pentru mutări echivalente era dezactivată explicit tocmai în
  pozițiile de mat.
- Regresii proprii, prinse și reparate în aceeași zi: tabla micșorată cu 20%
  de un plafon inutil, culorile tablei schimbate fără să ceară nimeni (și doar
  pe jumătate dintre ele), pagina de puzzle-uri lăsată fără nicio cale de
  încărcare după ce am scos-o pe cea veche.

### Ce rămâne

- [ ] **Rating pentru deschideri** — singurul punct din lista inițială nefăcut.
      Nu e clar ce ar trebui să măsoare; fără asta ar fi un număr fără sens.
- [ ] Sub-meniurile se deschid la click, nu la hover (cerut în stil chess.com)
- [ ] Zilele marilor jucători dau un puzzle pe măsura ta, nu o poziție din
      partida lor memorabilă
- [ ] Misiunile zilei sunt tot machetă cu date fixe
- [ ] Proiectul nu are niciun test automat

### Commits

`9c01659` evenimente sezoniere · `38dce5d` tablă la „Numește deschiderea" ·
`1e5bd24` calupuri de 5 · `68d4933` `a01aef6` reparații la bancă ·
`7abcc0f` puzzle-uri care nu se mai repetă · `17d7333` `2b45ac8` `c6ec79c`
`9af57ba` `c9bc4a0` `7162485` așezarea în pagină · `4edf8fd` ligi pe treimi ·
`503e69f` Bârlog curat · `512e26c` refutarea · `7aae610` tablă de analiză +
motorul reparat · `52e6b7e` matul recunoscut

### Decizii importante

- **Motorul dă linia, AI-ul o explică.** Modelele calculează prost variante de
  șah; Stockfish spune ce se întâmplă, Călușul savant de ce doare.
- **O singură valoare decide latura oricărei table** (`--board-max`), altfel
  fiecare pagină își alege regula ei și ies mărimi diferite.
- **Un mat e un mat.** Verificarea unei mutări se face pe rezultat, nu pe
  potrivire de șiruri.
- **Deciziile de ligă se strâng înainte de a se aplica** — altfel cineva
  promovat din Bronz ar intra în clasamentul Argintului înainte să fie calculat.

---

## 2026-08-02 → 08-03 - Partide între jucători + sistem de niveluri

### Ce s-a făcut

**Bârlogul șahistului**
- Scoasă informația repetată: XP-ul apărea de 3 ori pe ecran, streak-ul de 3 ori,
  liga de 4 ori. Titlul paginii era randat de două ori (regresie de la mutarea
  navigării în bara de sus).
- Componentă nouă `AppMap` — hartă a aplicației, câte un card per zonă, cu o
  propoziție despre ce faci acolo. Sursa e `ALL_PAGES.filter(p => p.description)`
  din `lib/navigation.ts`, deci rutele rămân definite într-un singur loc.
- Misiuni zilnice: 3 pe zi, afișate pe orizontală, bifate (nu tăiate) când sunt
  gata. **Deocamdată machetă vizuală cu date fixe** — nu sunt conectate la bază.

**Nivelul jucătorului**
- „Elo estimat" înlocuit cu nivel 1–100, care doar urcă. Se calculează din XP,
  nu se stochează niciodată: `levelFromXp` în `lib/levels.ts`, aceeași formulă
  în SQL ca `player_level`. Curba: 470 XP → nivel 8, 1700 → 15, 21500 → 45,
  122848 → 100.
- Deblocări din 5 în 5 niveluri (`lib/unlocks.ts`): titluri la nivelurile
  terminate în 5, capabilități la cele terminate în 0, prestigiu la 50 și 100.
- Perk-uri: **scut de retrogradare** (20, 30, 50, 60, 70, 80, 90) și
  **promovare onorifică** (25, 45, 65, 85). Niciunul nu se stivuiește la
  consum — se stochează doar câte s-au folosit, restul se deduce din nivel.
- **Jucător experimentat** (nivel 50): 5 partide clasate pe zi dau XP, în loc de 3.

**Partide între jucători** — cea mai mare bucată a sesiunii
- Model de date: `match_challenges`, `matches`, palmares V/R/Î, clasamente de
  victorii (all-time + săptămâna curentă).
- Arbitrul e o edge function (`play-move`): validează rândul, legalitatea mutării
  și ceasul după ora serverului. Clientul nu decide nimic.
- Provocări doar în liga ta ±1 (±2 de la nivelul 40). Rated / unrated.
- Fixuri după prima partidă de test reală: intrare automată în joc când
  adversarul acceptă, ceasul izolat de tablă (redesena tabla de 5 ori pe secundă,
  de aici senzația de întârziere), mesaj de final vizibil, iar partidele se
  încheie acum chiar dacă nimeni nu stă pe pagina lor.

**Ligă: promovare competitivă**
- Promovarea nu mai e pe prag de XP total. Urcă primii 20% din clasamentul
  săptămânal al ligii (minim o persoană), dintre cei care au atins minimul
  săptămânal. Retrogradarea rămâne pe prag absolut, cu scuturi.

### Ce rămâne

- [ ] Redeployat `weekly-league-check` — s-a schimbat pentru scuturi și promovări
- [ ] Testat cu conturi reale: niveluri, titluri, scuturi, analiza partidei,
      promovarea competitivă, ambele perk-uri
- [ ] Misiunile zilnice: de conectat la bază (acum sunt date fixe)
- [ ] `LessonPage` și `PuzzlesPage` — tabla mică, ca la antrenorul de deschideri
- [ ] `zoom: 1.1` de scos din `PuzzlesPage`
- [ ] Proiectul nu are niciun test automat

### Commits

- `cfcfe93` feat: Bârlog fără informație repetată + hartă a aplicației
- `b686392` feat: nivel de jucător, texte corectate în widget-ul de ligă, misiuni (doar vizual)
- `78763fc` feat: Clasament în locul Comunității, misiuni pe orizontală, bifă în loc de tăiere
- `9818d2c` feat: clasament săptămânal (necesită migrarea 025)
- `1e1bf9a` feat: temelia partidelor între jucători — model de date, arbitru, XP
- `6b085f9` feat: partide între jucători — provocare, partidă live, palmares, clasamente
- `f1e93fd` fix: butonul de provocare lipsea exact de unde era nevoie de el
- `c054b48` fix: intrare automată în partidă, ceas izolat de tablă, final vizibil
- `62ea51f` feat: mesaje de final diferite după cum s-a încheiat partida
- `652a368` fix: partidele se încheiau doar dacă cineva stătea pe pagina lor
- `ad81bc8` feat: mesaje de final în metafora spălatului + măsurarea partidei
- `119046f` revert: scot mesajele de final în metafora spălatului
- `bfa5c26` feat: deblocări pe niveluri — analiza partidei, scuturi, titluri
- `6812a95` feat: „Jucător experimentat" — 5 partide pe zi dau XP de la nivelul 50
- `943650f` feat: promovare competitivă + perk-ul „Promovare onorifică"

### Decizii importante

- **Nivelul nu se stochează.** Se derivă din XP peste tot — în client prin
  `levelFromXp`, în bază prin `player_level`. Nu există stare de sincronizat,
  deci nu poate ieși din sincron.
- **Perk-urile stochează doar consumul** (`shields_used`, `honorary_used`).
  Câte a câștigat cineva se deduce din nivel, deci nu trebuie acordat nimic
  la avansare.
- **Nivelul dă capabilități și identitate; abonamentul Pro dă cantitate.**
  Un curs nu se deblochează niciodată prin nivel — acela e produsul vândut.
  Nimic din ce ține de învățat nu stă după o poartă de nivel.
- **Limita de XP din partide e per jucător, nu per partidă.** Altfel un jucător
  de nivel mic ar primi perk-ul doar fiindcă joacă împotriva cuiva care îl are.
- **Mesajele de final în metafora spălatului** au fost scrise, evaluate onest
  la cererea ta, apoi scoase — nu se potriveau cu tonul aplicației.
- **Migrările au dependențe și se rulează în ordine.** 028 și 029 folosesc
  `player_level`, care se creează în 027. Rulate în altă ordine, dau
  `function public.player_level(integer) does not exist`. Verificare între ele:
  `select to_regprocedure('public.player_level(integer)') is not null;`

---

## 2026-08-01 → 08-02 - Curățenie cod + reașezare layout

### Ce s-a făcut

**Curățenie (lint 86 → 0, tsc 0 erori)**
- Clientul Supabase era `createClient(...) as any` — cauza rădăcină a 44 de `any`.
  Schema `Database` completată corect: 5 tabele lipsă, 7 coloane lipsă din `Profile`,
  semnături reale pentru cele 3 funcții RPC, relația `parental_links → profiles`.
- Bug-uri descoperite prin tipare:
  - butoanele „Confirmă"/„Respinge" de pe pagina de consimțământ parental aveau
    `onClick` gol — părinții nu puteau activa contul copilului
  - `targetSquare` e `string | null` (drop în afara tablei); toate cele 8 handlere
    presupuneau string, deci un drop lângă tablă conta ca încercare greșită
  - `BreakPage`: `new Date(null)` pe `last_seen_at` dădea 1970 → pauza copilului
    era scurtată la zero
  - race conditions în efectele async fără cleanup (4 locuri)
- `useSubscription` și `useWeeklyXp` rescrise cu react-query.

**Layout**
- Tokeni de shell în `index.css`; arhetipuri de pagină (focus / catalog) în
  `lib/navigation.ts`, în locul verificărilor `pathname ===` din layout.
- Tabla din antrenorul de deschideri: de la ~590px fix la dimensionare din ecran
  (1027px pe 2560×1255).
- Pagina de curs: centrată, traseul întins pe înălțime cu plafon la spațiere.
- Navigarea mutată din bara laterală în bara de sus, grupată în 4 intrări.

### Ce rămâne
- [ ] Curatarea informației afișate — Bârlogul mai minimal (cerut explicit, nedemarat)
- [ ] `LessonPage` și `PuzzlesPage` au aceeași problemă a tablei mici ca antrenorul
- [ ] `zoom: 1.1` din `PuzzlesPage` — de scos odată cu refacerea layout-ului acelei pagini
- [ ] Verificare vizuală a barei de sus cu date reale (username lung, ligă, streak)
- [ ] Proiectul nu are niciun test automat

### Commits
- `8f57e8b` feat: navigarea trece din bara laterală în bara de sus
- `7fcb2fe` feat: pagina de curs — centrată pe ecran, cu traseul întins pe înălțime
- `f41513d` feat: tabla din antrenorul de deschideri se dimensionează din ecran
- `595d32d` revert: Cursuri interactive și Puzzle-uri revin la layout-ul dinainte
- `1d622d4` feat: shell unificat cu tokeni de layout + Cursuri interactive fără scroll
- `c5b2b0e` refactor: lint curat — stare derivată în loc de efecte de sincronizare
- `e0f92e1` fix: butoanele de consimțământ parental nu funcționau + race conditions
- `3e923a6` refactor: zero `any` în cod — tipuri reale pentru tablă, stats, edge functions
- `7cc8f7e` refactor: tipare completă a clientului Supabase + fix-uri de puritate React
- `3a5880b` feat: identitate vizuală pentru tactici — icon + culoare per categorie și nivel

### Decizii importante
- **Două arhetipuri de pagină**, nu un standard unic: `focus` (în jurul unei table,
  umple ecranul) și `catalog` (de răsfoit). Un catalog cu 20 de cursuri nu poate
  încăpea într-un viewport.
- **Prima încercare pe „Cursuri interactive" a fost respinsă și revenită** (`595d32d`):
  hero eliminat, statistici pe rândul de filtre, carduri comprimate cu container
  queries. A rămas ca notă în memorie, să nu fie reîncercată din reflex.
- **Navigarea de sus cere grupare** — cele 11 pagini pe orizontală ar ocupa ~2000px.
- Paginile din spatele autentificării **nu pot fi verificate vizual** fără cont de
  test. Metoda folosită: replică a layout-ului peste CSS-ul compilat, măsurată în
  browser. A prins defecte reale (praguri greșit calibrate, depășire orizontală).

### Capcane tehnice de reținut
- Un `interface` TS nu satisface `Record<string, unknown>` — fără mapped type,
  tot clientul Supabase cade pe `never`.
- Un container query nu poate schimba proprietăți care afectează dimensiunea
  *propriului* container; browserul ignoră regula în tăcere.
- O pagină care trebuie să încapă exact în ecran are nevoie de înălțime fermă,
  nu de `min-height: 100%`.
