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
