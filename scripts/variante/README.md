# Variantele capitolelor (ramificaţii) şi procentele pe trepte de rating

Unelte folosite pe 2026-11-25 pentru Italiana (migrările 138, 141) şi pentru celelalte
19 cursuri (migrarea 142). Datele intermediare stau în `date/` (ignorat de git).

Ordinea, din rădăcina proiectului (`node --experimental-strip-types --import ./scripts/verificari/register.mjs` pentru `.mts`/`.mjs` care importă TS):

1. `inventar.mjs`, `v1.mjs` — capitolele din baza de date şi linia principală (deschidere + jocul de mijloc lipit).
2. `pozitii.mjs` → `gen-cc.mjs date/in-candidati.json cc-candidati.json` → rulezi `date/explorer-cc.js`
   în fereastra Playwright, pe o pagină www.chess.com (`browser_run_code_unsafe`, cu `filename`).
3. `alege.mjs 3` — ramificaţiile: ≥10% la 1000–1600, nu sub 4% la 400–1000 şi 1600–2300, ≥15 000 de partide.
4. `pas.mjs init`, apoi de 7 ori: `runda.sh` + explorer-cc.js (mutarea ta: cea mai jucată la 1600–2300
   dintre cele la ≤0,35 de Stockfish adâncime 18; a lui: cea mai frecventă la 1000–1600).
5. `rating-pozitii.mjs` → `gen-cc.mjs date/in-rating-cc.json cc-rating.json 25` (Chess.com, 6 trepte) şi
   `gen-li.mjs` (Lichess, 8 trepte; rulează în fundal pe o pagină lichess.org logată; vezi `stare`/`descarca-li.js`).
6. `listare.mjs` / `ultima.mjs` — ce scrii în texte (`date/texte-*.mjs`, `date/finale.mjs`).
7. `migrare.mts <număr> <nume> curs…` — verifică textele (mutarea, cuvintele interzise) şi scrie migrarea.
