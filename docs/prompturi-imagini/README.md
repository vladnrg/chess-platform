# Prompturi pentru imaginile generate

Prompturile care se dau lui ChatGPT ca să iasă imaginile din aplicație. Stau
aici, lângă cod, nu pe Desktop — ca să se vadă în editor și să rămână în istoric
odată cu imaginile pe care le-au produs.

## Cum se folosesc

Deschide fișierul, apasă **Ctrl+Shift+V** (previzualizare markdown) și
copiază din blocul de cod — VS Code pune un buton de copiere pe el.

Fiecare prompt cere o **imagine de referință atașată la mesaj**. Începând cu a
doua tactică, referința e chiar prima plăcuță din serie —
[`furculita.png`](../../public/tactics/Tipuri%20de%20tactici/furculita.png) —
nu logoul Colle: ea are deja rama, aurul și fuziunea dintre obiect și piese.
Click dreapta pe fișier în editor → *Reveal in File Explorer* → trage-l în ChatGPT.

## De unde vin culorile

Nu sunt alese, ci **măsurate** din `colle-system.png`:

| Rol | Valoare |
| --- | --- |
| Colțurile plăcuței, cel mai închis | `#171513` |
| Tablă de șah — pătrat închis | `#4B3317` |
| Tablă de șah — pătrat deschis | `#7F5425` |
| Strălucirea din spatele obiectului | `#63421D` |
| Rama aurie | `#DEB863` |
| Obiect — lumina | `#FAC339` |
| Obiect — ton mediu | `#6F4D15` |
| Obiect — umbră | `#5A340A` |
| Decupajul întunecat din obiect | `#1C160E` |

## Regula de stil

Logourile de curs **nu sunt diagrame, sunt metafore**: Sistemul Londra e o
cafea cu biscuiți, Partida Italiană e o felie de pizza, Jocul Vienez sunt doi
dansatori. Tacticile urmează același registru — se desenează ideea, nu poziția
de pe tablă.

Obiectul și piesele se topesc într-o singură sculptură de aur — la furculiță,
cei doi dinți din margine *sunt* turnul și dama. Nu obiect plus piese alături,
ci o singură piesă turnată.

Metafora se ia, pe cât se poate, din descrierea pe care o are deja tactica în
[`src/data/tactics.ts`](../../src/data/tactics.ts). Acolo sunt scrise în cuvinte
simple, iar textul ăla e deja aprobat.

## Unde ajung imaginile

`public/tactics/tipuri/<id>.png`, unde `<id>` e id-ul categoriei din
`src/data/tactics.ts`. Se afișează la **64 de pixeli** în card — de aceea
fiecare prompt cere siluetă groasă și zero detalii fine.

## Starea

| # | Fișier imagine | Tactica | Prompt |
| --- | --- | --- | --- |
| 1 | `fork.png` | Furculiță și atac dublu | [01-furculita.md](01-furculita.md) |
| 2 | `pin.png` | Legarea absolută și relativă | — |
| 3 | `discovered.png` | Atac prin descoperire și șah dublu | [03-descoperire.md](03-descoperire.md) |
| 4 | `attraction.png` | Atragerea și devierea | — |
| 5 | `remove-defender.png` | Îndepărtarea apărătorului | — |
| 6 | `skewer.png` | Țeapă și atacul cu raze X | — |
| 7 | `trapped.png` | Prinderea piesei | — |
| 8 | `mate.png` | Dă mat în N mutări | — |
| 9 | `forced-draws.png` | Resurse defensive | — |
| 10 | `zwischenzug.png` | Mutarea intermediară | — |
| 11 | `sacrifice.png` | Sacrificii | — |
| 12 | `subscribers.png` | Combinații complete | — |
| 13 | `hybrid.png` | Tactici hibride | — |
| 14 | `mixed-bonus.png` | Tactici mixte bonus | — |
