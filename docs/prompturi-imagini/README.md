# Prompturi pentru imaginile generate

Prompturile care se dau lui ChatGPT ca să iasă imaginile din aplicație. Stau
aici, lângă cod, nu pe Desktop — ca să se vadă în editor și să rămână în istoric
odată cu imaginile pe care le-au produs.

## Cum se folosesc

Deschide fișierul, apasă **Ctrl+Shift+V** (previzualizare markdown) și
copiază din blocul de cod — VS Code pune un buton de copiere pe el.

Fiecare prompt cere o **imagine de referință atașată la mesaj**. Începând cu a
doua tactică, referința e chiar prima plăcuță din serie —
[`furculita.png`](../../surse-imagini/tactici/Furculita.png) —
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

## Rama: romburile se taie mereu

Rama are câte un romb mic pe fiecare din cele patru laturi. ChatGPT le pune
prea aproape de margine și le ciuntește — se vede pe jumătate din ele chiar și
în `Atac prin descoperire.png`, care e altfel referința bună.

De aceea în fiecare prompt nou se cere explicit:

> *one small gold diamond centred on each of the four sides, each one drawn
> COMPLETE and entirely inside the picture, none of them cropped by the edge*

## Codul culorilor: alb și negru

**Piesele nu sunt toate aurii.** Albele sunt aurii-deschis, negrele sunt închise
— exact ca pe o tablă adevărată.

| | lumină | ton mediu | umbră | umbră adâncă |
| --- | --- | --- | --- | --- |
| Piese **albe** | `#FFD86A` | `#E7AD3E` | `#8C4A01` | `#5A340A` |
| Piese **negre** | `#4A3A1C` | `#241A0A` | `#0E0A04` | — |

Negrele primesc în plus un contur subțire de lumină caldă pe muchii, ca silueta
lor să rămână limpede pe tabla maro.

**„Alb" înseamnă aur cald, nu fildeș.** Piesele deschise păstrează aurul bogat al
seriei — se schimbă doar raportul cu cele negre, nu materialul. Valorile de mai
sus sunt măsurate din `Atac prin descoperire.png`, unde a ieșit cum trebuie.

Prima paletă pe care am scris-o cerea `#FFF0C0` / `#E4C071` / `#A07C30`, iar
ChatGPT a ascultat-o cuminte: la *Furculiță* și *Sacrificii* piesele au ieșit
crem mat, cu saturația la 0,27–0,50 în loc de 0,73–0,99. Problema nu era doar
că sunt prea albe, ci că **umbrele rămâneau tot deschise** — fără interval tonal,
metalul arată ca plasticul. De aceea coloana „umbră adâncă" contează cel mai
mult din tabel.

Motivul nu e estetic: **în șah, culoarea piesei e informație.** Cine atacă, cine
suferă, a cui e piesa care cade. Totul-auriu pierde tocmai asta. La „Sacrificii"
se vede cel mai bine — fără culori, dama căzută și regele descoperit ar părea din
aceeași tabără, iar imaginea n-ar mai însemna nimic.

Restul rămâne neatins: aceeași ramă aurie, aceeași tablă maro, același relief
lustruit. Se schimbă doar metalul din care sunt turnate piesele.

> **De refăcut:** `furculita.png` și `descoperire.png` au fost generate înainte
> de regula asta și au toate piesele aurii. La furculiță, turnul și dama prinse
> în dinți ar trebui să fie negre — sunt prada. La descoperire, nebunul care
> trage și pionul care se dă la o parte sunt albi, turnul lovit e negru.

## Unde ajung imaginile

`public/tactics/tipuri/<id>.png`, unde `<id>` e id-ul categoriei din
`src/data/tactics.ts`. Se afișează la **64 de pixeli** în card — de aceea
fiecare prompt cere siluetă groasă și zero detalii fine.

## Starea

| # | Fișier imagine | Tactica | Prompt |
| --- | --- | --- | --- |
| 1 | `fork.png` | Furculiță și atac dublu | [01-furculita.md](01-furculita.md) |
| 2 | `pin.png` | Legarea absolută și relativă | [02-legarea.md](02-legarea.md) |
| 3 | `discovered.png` | Atac prin descoperire și șah dublu | [03-descoperire.md](03-descoperire.md) |
| 4 | `attraction.png` | Atragerea și devierea | [04-atragerea.md](04-atragerea.md) |
| 5 | `remove-defender.png` | Îndepărtarea apărătorului | [05-indepartarea-aparatorului.md](05-indepartarea-aparatorului.md) |
| 6 | `skewer.png` | Țeapă și atacul cu raze X | [06-teapa.md](06-teapa.md) |
| 7 | `trapped.png` | Prinderea piesei | [07-prinderea-piesei.md](07-prinderea-piesei.md) |
| 8 | `mate.png` | Dă mat în N mutări | [08-mat.md](08-mat.md) |
| 9 | `forced-draws.png` | Resurse defensive | [09-resurse-defensive.md](09-resurse-defensive.md) |
| 10 | `zwischenzug.png` | Mutarea intermediară | — |
| 11 | `sacrifice.png` | Sacrificii | [11-sacrificii.md](11-sacrificii.md) |
| 12 | `subscribers.png` | Combinații complete | — |
| 13 | `hybrid.png` | Tactici hibride | — |
| 14 | `mixed-bonus.png` | Tactici mixte bonus | — |
