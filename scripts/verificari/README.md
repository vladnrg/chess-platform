# Verificări care rulează logica adevărată

Scripturi care importă **codul aplicaţiei**, nu o copie a lui, şi îl pun la
încercare pe banca live de puzzle-uri. Rostul lor e să prindă greşelile care nu
se văd la compilare: o probă care iese goală, un nivel calculat pe dos, o
repetiţie care se declanşează prea devreme.

Amândouă bug-urile din prima rulare au fost prinse aşa, nu din citit codul.

## Cum se rulează

```
node --experimental-strip-types --import ./scripts/verificari/register.mjs scripts/verificari/tactici.mjs
```

`register.mjs` + `alias-hook.mjs` rezolvă aliasul `@/` şi extensiile lipsă, ca
Node să poată importa direct din `src/` fără bundler.

## Ce acoperă `tactici.mjs`

- ce cartonaşe arată fiecare cufăr, şi că la master nu mai apare nicio temă cu nume;
- proba: zece poziţii, fără repetiţii, aceleaşi între rulări (ca progresul să se poată deduce);
- formatele de la master umplu traseul;
- harta punctelor slabe, pe încercări simulate din aceeaşi bandă de dificultate;
- repetiţia la interval: pragurile de 3 / 10 / 30 de zile;
- tema zilei: stabilă în aceeaşi zi, alta mâine, şi XP-ul dublu.

## Ce acoperă `exercitii-lectii.mjs`

```
node --experimental-strip-types --import ./scripts/verificari/register.mjs scripts/verificari/exercitii-lectii.mjs
```

Ia fiecare exerciţiu de mutat piesa din baza reală şi îi face mutarea declarată
corectă. Trece doar dacă mutarea e acceptată **şi** piesa chiar ajunge unde
trebuie — altfel „a mers" n-ar însemna nimic. Verificarea îşi citeşte tabla
singură din şirul FEN, cu totul altfel decât `mutare-pe-tabla.ts`, ca să nu
confirme aceeaşi greşeală de două ori.

A apărut după ce „mută tura de la a1 la h1" răspundea „Nu e mutarea potrivită"
la a1→h1: `chess.js` refuză poziţiile fără cei doi regi, iar tablele din lecţii
au pe ele doar piesa despre care e lecţia. Erau 14 exerciţii blocate din 21.

## Ce acoperă `ultima-mutare.mjs`

```
node --experimental-strip-types --import ./scripts/verificari/register.mjs scripts/verificari/ultima-mutare.mjs
```

Ia fiecare exerciţiu cu tablă din baza reală şi cere aplicaţiei ultima mutare a
adversarului — cea desenată acum pe tablă cu pătrate colorate şi o săgeată.
Mutarea nu e scrisă nicăieri: se deduce din câmpul de en passant al FEN-ului,
deci se poate deduce şi greşit fără să pice nimic la compilare. Verificarea
citeşte tabla singură din şirul FEN şi cere ca pe pătratul de sosire să stea
chiar un pion al culorii care tocmai a mutat, ca plecarea şi pătratul sărit să
fie libere, şi ca la mutare să fie acum celălalt.

Afişează şi lista exerciţiilor care arată ceva, ca să se vadă dintr-o privire
dacă apare unde trebuie (cele patru de la „En passant") şi nu apare unde n-are
ce căuta (tablele de învăţat, fără istorie).

## Ce acoperă `terminologie.mjs`

```
node --experimental-strip-types --import ./scripts/verificari/register.mjs scripts/verificari/terminologie.mjs
```

Cuvintele care n-au voie în conţinutul cursurilor. Deocamdată unul singur:
piesa se numeşte **tura**, la feminin, nu „turnul".

Migrarea 022 curăţase deja tot ce era în bază la acea dată. Apoi au intrat
patru cursuri de deschideri, planurile de mijloc de partidă, capcanele şi
lecţia de promovare — şi cuvântul s-a întors de 178 de ori, în patru tabele.
Migrarea 101 le-a schimbat pe toate, cu tot cu acord („un turn adus acolo" →
„o tură adusă acolo"); verificarea asta e ca să nu mai fie nevoie de a treia
oară.

Se uită în **baza reală**, nu în fişiere: conţinutul se scrie cu migrări, dar
se citeşte de acolo, iar o migrare nouă poate aduce oricând cuvântul înapoi.

## Ce acoperă `mutari-cu-motorul.mjs`

```
node --experimental-strip-types --import ./scripts/verificari/register.mjs scripts/verificari/mutari-cu-motorul.mjs
```

`exercitii-lectii.mjs` întreabă dacă mutarea cerută e **primită** de aplicaţie.
Asta întreabă dacă e şi **bună**: fiecare mutare din fiecare exerciţiu trece
prin Stockfish (`motor.mjs`, motorul din `node_modules`, acelaşi cu cel din
browser) şi se compară cu cea mai bună mutare din poziţie — la deznodământ, nu
la cifră. „+5" în loc de „+8" e tot partidă câştigată; ce se semnalează e
mutarea care schimbă rezultatul.

A apărut fiindcă la „Promovarea pionului" cerinţa era „promovează-l pe cel
liber", iar mutarea cerută dădea dama pe loc: turnul negru ţinea tot rândul opt.
Poziţia era −4,23 pentru alb înainte de mutare şi nimic din cod n-avea cum să
observe — exerciţiul „funcţiona". La prima rulare a mai găsit două capturi en
passant care pierdeau partida, în altă lecţie.

Durează câteva minute şi raportează separat poziţiile pe care motorul nu le
poate judeca: tablele de învăţat din lecţiile de mişcare a pieselor n-au regi pe
ele, deci nu se poate spune despre ele ce e bine şi ce nu.
