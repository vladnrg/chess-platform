# Capcanele uzuale devin un capitol al cursului

Data: 2026-08-09 · Ramura: `feat/maestrul-pursange-si-puzzle`

## Problema

Capcanele stau azi într-un acordeon sub pagina cursului: le deschizi, vezi mutările pe o tablă mică și citești un paragraf. Sunt de citit, nu de exersat — exact plângerea care a dus, acum două zile, la transformarea tabelului de joc de mijloc în exercițiu.

Între timp cursul are traseu pe capitole, iar capcanele au rămas pe dinafară. Ele sunt însă conținutul care salvează partide de la mutarea a cincea, deci merită tratate ca lecții, nu ca anexă.

## Ce construim

Un al patrulea capitol în traseul cursului, „Capcane uzuale", cu șase noduri: pentru fiecare dintre cele trei capcane, o parcurgere ghidată (nod-lecție, carte deschisă) și un exercițiu (nod-exercițiu, gantere) jucat **din perspectiva celui care întinde cursa**.

## Deciziile luate

| Întrebare | Decizie |
|---|---|
| Cât de amănunțită e parcurgerea vizuală | Explicație la **fiecare** semi-mutare, ca la lecțiile de teorie |
| Varianta Schimb n-are capcană | Rămân cele 3 existente. Verificat în baza de date: nu există altele, în niciun curs. Nu se inventează conținut |
| De unde pornește exercițiul | Din poziția în care se armează cursa, nu de la 1.e4 |
| Când se deschide capitolul | De la început, ca și celelalte. Nodurile dinăuntru se descuie în ordine |

## Datele

### Migrarea 044

Trei coloane noi pe `public.opening_traps`:

```sql
alter table public.opening_traps
  -- Din ce variantă răsare capcana. Azi capcanele atârnă doar de curs, iar
  -- capitolul trebuie să spună omului unde o va întâlni.
  add column if not exists opening_line_id uuid
    references public.opening_lines on delete set null,

  -- Explicaţii pe semi-mutare, indexate de la 0 — aceeaşi convenţie ca la
  -- `opening_lines.move_explanations` şi `middlegame_plans.move_explanations`.
  add column if not exists move_explanations jsonb not null default '{}'::jsonb,

  -- De la a câta semi-mutare porneşte exerciţiul. Până aici e context: se
  -- rejoacă pentru a obţine poziţia de plecare, nu se cere de la utilizator.
  add column if not exists spring_ply integer;
```

`opening_line_id` e `null`-abil și cade pe `set null`: o capcană fără variantă atribuită rămâne validă și se arată fără etichetă. Legătura e către linie, nu un cod text, ca să vină cu numele și culoarea variantei fără o a doua interogare.

### Popularea celor trei capcane

Verificat prin rejucarea mutărilor din baza de date:

| # | Capcană | Variantă | Cine întinde cursa | `spring_ply` | Pornire exercițiu |
|---|---|---|---|---|---|
| 1 | Matul de pe d6 | Clasică (Nf5) | alb | 8 | după 4...Cd7, albul la mutare (5.De2, apoi 6.Cd6#) |
| 2 | Nebunul închis în cușcă | Avans | alb | 8 | după 4...e6, albul la mutare (5.g4, apoi 6.h5) |
| 3 | Nebunul pe d3 | Avans | negru | 7 | după 4.Nd3, negrul la mutare (4...Nxd3 … 6...Db6) |

Toate trei se ancorează în variante care există deja în curs, deci nu e nevoie de nicio linie nouă.

### Regula culorii

Nu se scrie de mână, se deduce:

```
culoarea ta = victim === 'ours'
  ? culoarea opusă celei din opening_lines.user_color
  : opening_lines.user_color
```

Când victima e cel care ține deschiderea, tu joci cu cealaltă culoare — fiindcă tu ești cel care întinde cursa. Pentru Caro-Kann (repertoriu de negru) iese alb, alb, negru.

Regula are nevoie de `user_color`, care vine din linie. **O capcană fără `opening_line_id` nu primește niciun nod** — nici lecție, nici exercițiu — fiindcă antrenorul n-ar ști cu ce culoare te pune să joci. Nu e cazul niciuneia dintre cele trei de acum; regula există ca să nu cadă capitolul dacă cineva adaugă mâine o capcană neatribuită.

### Interogarea

`course_middlegame` întoarce deja capcanele. Se extinde ca să dea și `id`, `opening_line_id`, `variation_name` și `spring_ply` — atât cât îi trebuie capitolului ca să construiască nodurile și eticheta. Fără `id` nu se poate face ruta.

Antrenorul își ia capcana printr-un `select` direct pe `opening_traps` după `id` — politica de citire publică există deja.

## Codul

### Rute noi (`App.tsx`)

```
/courses/:slug/trap/:trapId           → OpeningTrainerPage mode="guided"   stage="trap"
/courses/:slug/trap-practice/:trapId  → OpeningTrainerPage mode="practice" stage="trap"
```

### Încărcarea liniei iese din pagină

`OpeningTrainerPage` are ~700 de rânduri, iar `useQuery`-ul dinăuntru ar căpăta a treia ramură de încărcare. Se mută într-un modul propriu (`src/lib/trainer-line.ts`), cu o funcție per etapă:

- `linieDeschidere(lineId)` — rândul din `opening_lines`, cum e azi
- `linieJocDeMijloc(lineId)` — deschiderea rejucată pentru `start_fen`, plus planul
- `linieCapcana(trapId, mode)` — capcana, modelată ca `TrainerLine`

Pagina primește o `TrainerLine` și nu mai știe de unde vine. Nu se atinge nimic din logica de tablă, rând sau progres.

`linieCapcana` în modul `practice` rejoacă semi-mutările `[0, spring_ply)` ca să obțină `start_fen` și păstrează doar coada listei — aceeași tehnică folosită deja la jocul de mijloc, deci nu ținem un FEN duplicat în baza de date.

### O singură parte la capcane

Antrenorul rupe liniile în părți la semi-mutările 10 și 16. O capcană are 11–12 semi-mutări, deci ar apărea „Partea 1 din 2" și butonul „ești gata de faza următoare?" în mijlocul unei curse de șase mutări. La `stage === 'trap'`, linia are o singură parte.

### Capitolul (`CourseChapters.tsx`)

Componenta construiește azi câte un capitol per variantă. Primește în plus capcanele și adaugă un ultim capitol:

- titlu: „Capcane uzuale"
- subtitlu: „3 capcane · din Clasică și Avans" (variantele se strâng din capcanele chiar existente, nu se scriu fix)
- noduri: pentru fiecare capcană, `lectie` → `/trap/:id`, apoi `exercitiu` → `/trap-practice/:id`
- fără nod de verificare: nu există întrebări de capitol nicăieri încă

O capcană cu linie, dar fără `spring_ply`, primește doar nodul-lecție — n-ar avea de unde porni exercițiul. Una fără linie nu apare deloc, din motivul de mai sus.

### Pagina de antrenament

Sub titlu, două rânduri noi când etapa e `trap`:
- din ce variantă vine capcana
- „Joci cu albul — tu întinzi cursa" / „Joci cu negrul — tu pedepsești greșeala"

Panoul „Planul variantei" nu apare la capcane. Paragraful existent (`explanation`) se arată la final, ca încheiere.

### Ștergere

`OpeningTraps` iese din `CourseDetail`. Conținutul are un singur loc, ca și planurile de joc de mijloc. Componenta se șterge; RPC-ul rămâne, îl folosește capitolul.

## Progres și XP

Neschimbat față de variante: 30 XP la prima parcurgere ghidată dusă până la capăt, prin `persistProgress`. `id`-ul capcanei intră în `completed_lesson_ids`.

Verificat că nu strică nimic: `CourseDetail` calculează „x din 3 variante parcurse" ca `steps.filter(s => completedIds.includes(s.id))`, unde `steps` sunt variantele — deci capcanele nu umflă contorul. `resumeId` filtrează la fel.

## Conținutul

Cele ~33 de explicații pe semi-mutare sunt conținut didactic nou. Se prezintă utilizatorului în scris, capcană cu capcană, și se pun în migrare **doar după confirmare**.

Regula vine din sesiunea de pe 4 august, când două capcane scrise pentru Caro-Kann au fost aruncate fiindcă afirmațiile nu erau destul de sigure, deși mutările erau legale: un plan greșit nu e un bug, e cineva care învață un lucru fals și îl repetă un an.

## În afara ariei

- Capcane pentru celelalte 21 de cursuri (există doar la Caro-Kann)
- O capcană pentru Varianta Schimb — nu se inventează în cadrul acestei lucrări
- Zăvor între capitole (nu există azi și nu e nevoie aici)
- Nodul de verificare de capitol (rămâne „în curând" peste tot)

## Verificare

1. `tsc -b --noEmit` și `eslint src/` trec. (Atenție: `tsc --noEmit` fără `-b` nu verifică nimic — rădăcina are `"files": []`.)
2. Migrarea 044 rulată manual în SQL Editor, cu interogare de control după: cele 3 capcane au `opening_line_id`, `spring_ply` și explicații.
3. În aplicație, pe cursul Caro-Kann:
   - capitolul 4 apare cu 6 noduri, primul deschis
   - nodul-lecție al primei capcane joacă din partea albului și arată explicație la fiecare mutare
   - exercițiul pornește din poziția de după 4...Cd7, nu de la 1.e4
   - acordeonul de capcane a dispărut de sub curs
   - traseele celorlalte trei capitole au rămas neatinse
