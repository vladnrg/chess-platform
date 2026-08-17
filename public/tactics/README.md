# Imaginile din „Cuferele cu tactici”

Două seturi, în două locuri diferite.

## Cuferele treptelor — direct în folderul ăsta

Apar în capul paginii, câte unul pentru fiecare treaptă de dificultate. Numele
fișierului **trebuie** să fie exact id-ul treptei din
[`src/lib/tactics-path.ts`](../../src/lib/tactics-path.ts):

| Fișier             | Treapta     | ELO       |
| ------------------ | ----------- | --------- |
| `incepator.png`    | Începător   | 400–1000  |
| `intermediar.png`  | Intermediar | 1000–1600 |
| `avansat.png`      | Avansat     | 1600–2200 |
| `master.png`       | Master      | 2200–2600 |

Pătrate, fundal `#0A0A0A` plat (același cu al paginii, deci se așază invizibil).
Se randează la 128px pe ecran lat și 64px pe mobil, cu `object-contain`.

## Plăcuțele tacticilor — în `tipuri/`

Apar pe cardul fiecărei tactici (în fereastra care se deschide la click pe cufăr)
și în capul paginii de traseu. **Fiecare categorie are plăcuța ei** — dacă
adaugi una nouă, adaug-o și aici. Numele fișierului **trebuie** să fie exact
id-ul categoriei din [`src/data/tactics.ts`](../../src/data/tactics.ts):

| Fișier                  | Tactica                       |
| ----------------------- | ----------------------------- |
| `fork.png`              | Furculița                     |
| `pin.png`               | Legarea absolută și relativă  |
| `discovered.png`        | Atac prin descoperire         |
| `attraction.png`        | Atragerea și devierea         |
| `remove-defender.png`   | Eliminarea apărătorului       |
| `skewer.png`            | Atacul cu raze X              |
| `trapped.png`           | Prinderea piesei              |
| `mate.png`              | Mat în N mutări               |
| `forced-draws.png`      | Resurse defensive             |
| `zwischenzug.png`       | Mutarea intermediară          |
| `sacrifice.png`         | Sacrificiu                    |
| `subscribers.png`       | Combinații de tactici         |

Pătrate 256×256, cu rama aurie a seriei mergând până la muchie. Se randează la
96px pe card și 64px în antetul traseului.

**Nu se editează aici.** Originalele stau în
[`surse-imagini/tactici/`](../../surse-imagini/tactici/), cu numele lor în
română; de acolo se redimensionează și se redenumesc. Prompturile care le-au
produs sunt în [`docs/prompturi-imagini/`](../../docs/prompturi-imagini/).

## Dacă un fișier lipsește

Nu se strică nimic: `onError` întoarce locul la iconița lucide a treptei sau a
categoriei. Vezi `ChestButton` în
[`src/pages/TacticsChestPage.tsx`](../../src/pages/TacticsChestPage.tsx) și
[`TacticTile`](../../src/components/chess/TacticTile.tsx).
