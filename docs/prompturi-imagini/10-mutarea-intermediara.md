# 10. Mutarea intermediară (Zwischenzug) → `zwischenzug.png`

Descrierea din [`src/data/tactics.ts`](../../src/data/tactics.ts):

> **În loc să răspunzi cuminte, strecori o mutare-surpriză** care schimbă tot
> calculul. Cuvântul e german, durerea pentru adversar e universală.

Toată tactica stă într-un singur cuvânt: **înainte**. Cineva se bagă în față.

Și în șah există un singur lucru care are dreptul să se bage în față: **șahul**.
Nu poți să-l ignori, nu poți să-l amâni, trebuie să-i răspunzi pe loc — orice
altceva aveai de gând rămâne pe după. De aceea aproape orice mutare intermediară
adevărată e un șah.

Deci asta se desenează: **schimbul care era pe cale să se facă, oprit la
jumătate de o piesă care s-a proptit exact în mijlocul lui și se uită în altă
parte.**

## Poziția, verificată cu motorul

```
    a  b  c  d  e  f  g  h
  +------------------------+
8 | .  .  .  .  .  .  .  . |     turn negru   a4
7 | .  .  .  .  .  .  k  . |     nebun alb    d4
6 | .  .  .  .  .  .  .  . |     turn alb     f4
5 | .  .  .  .  .  .  .  . |     rege negru   g7
4 | r  .  .  B  .  R  .  . |
3 | .  .  .  .  .  .  .  . |
2 | .  .  .  .  .  .  .  . |
1 | .  .  .  .  .  .  .  . |
  +------------------------+
```

Rulat prin chess.js, patru lucruri, toate verificate:

1. **Cele două turnuri se vedeau.** Scoate nebunul de pe d4 și turnul alb de pe
   f4 atacă direct turnul negru de pe a4, pe linia a 4-a. Ăla era schimbul care
   urma.
2. **Nebunul s-a proptit fix pe linia lor.** d4 e între a4 și f4 — le-a tăiat
   drumul unul spre altul.
3. **Nebunul stă în bătaie.** Turnul negru de pe a4 îl atacă. Și tot nebunul e
   apărat de turnul alb de pe f4, din spate.
4. **Și totuși nu se poate rezolva acum.** Nebunul dă șah regelui de pe g7, pe
   diagonala d4–e5–f6–g7. Negrul are exact **cinci mutări legale**: patru cu
   regele, plus `Rxd4`. Nimic altceva. Șahul trebuie rezolvat înaintea a orice.

Asta e mutarea intermediară, întreagă: **piesa care se bagă în față n-are cum să
fie ignorată, chiar dacă atârnă acolo la vedere.**

## Metafora: îi taie linia și se uită în altă parte

Nebunul stă drept, între cele două turnuri, **cu spatele la ele**. Nu se uită
nici la unul, nici la celălalt — privește în sus-dreapta, spre rege. Treaba lui e
acolo.

Turnurile, în schimb, sunt aplecate unul spre altul, prinse la jumătatea gestului
de a se întâlni. Amândouă opresc, amândouă așteaptă. Ăla e tot ce trebuie să
spună imaginea: **doi care erau pe cale să se rezolve între ei, și unul care s-a
băgat.**

| element | ce spune |
| --- | --- |
| cele două turnuri, aplecate unul spre altul | *schimbul la care se aștepta toată lumea* |
| nebunul auriu, drept, exact între ele | *mutarea care se bagă în față* |
| spatele lui întors la ei | *nu e despre voi* |
| regele negru, sus-dreapta, pe diagonala nebunului | *de-asta are prioritate: e șah* |

## Distanțele, numărate în pătrate

Grila desenată **e chiar tabla**: 8 pe 8, cu coloana și rândul egale cu litera și
cifra din poziția de sus.

| piesă | pătrat real | coloana | rândul |
| --- | --- | --- | --- |
| turnul negru | a4 | 1 | 4 |
| nebunul auriu | d4 | 4 | 4 |
| turnul auriu | f4 | 6 | 4 |
| regele negru | g7 | 7 | 7 |

Trei piese pe același rând, una peste alta cu ochiul — și a patra sus, pe
diagonala nebunului. Regele alb lipsește din desen, ca la toate celelalte
plăcuțe.

**Atașează la mesaj DOUĂ imagini, în ordinea asta:**
1. [`Atac prin descoperire.png`](../../surse-imagini/tactici/Atac%20prin%20descoperire.png)
   — fundalul plat, rama și cele două metale;
2. [`Sacrificiu.png`](../../surse-imagini/tactici/Sacrificiu.png) — încă un model
   de negru, unde a ieșit bine.

---

```text
Here are two images you made earlier, both from the same set of chess tiles. Copy their look exactly: the same flat decorative background, the same ornamental frame, the same way the pieces are sculpted and lit, the same two metals.

COPY FROM THEM, WITHOUT CHANGING ANYTHING:
- Square 1024x1024, filled edge to edge.
- The BACKGROUND is a FLAT chessboard pattern seen straight on — alternating brown squares in low contrast, darker #4B3317 and lighter #7F5425, with a warm radial glow behind the pieces (#63421D) falling off to near-black in the corners (#171513). It is a printed pattern, not a real board: no tilt, no perspective, no vanishing point, no thickness, no board edge, no horizon. Exactly 8 columns and 8 rows fill the tile, and the squares stay the same size all over it, corner to corner.
- The FRAME: the same ornamental border — a thin double line in warm metallic gold (#DEB863) with rounded corners and angular gold corner pieces at the four corners, plus one small gold diamond centred on each of the four sides. Draw all four diamonds COMPLETE and entirely inside the picture, each moved inwards far enough that no part of it is cropped by the edge.
- The PIECES: solid sculpted Staunton figures in relief, seen from the side, with the same proportions, the same soft rounded bevels, the same polished sheen, the same lighting from the upper left and the same soft drop shadows.

THE TWO METALS:
- The BISHOP and one ROOK are LIGHT: rich warm gold, highlight #FFD86A rising to #FCCB43 on the brightest edges, mid-tone #E7AD3E, shadows going deep to #8C4A01 and #5A340A.
- The OTHER ROOK and the KING are DARK: near-black bronze, highlight #4A3A1C, mid-tone #241A0A, deep shadow #0E0A04, with a thin warm gold rim light along their edges. The dark rook and the dark king belong to the same side, and that must be obvious at a glance.

THE PLACEMENT — read the background as a grid of 8 columns and 8 rows. Number the columns 1 to 8 from the left and the rows 1 to 8 from the bottom. Four pieces, each standing on the square it is given, its base resting on that square:

- the DARK ROOK on the square in column 1, row 4 — on the left;
- the GOLD BISHOP on the square in column 4, row 4 — the same row, three squares to its right;
- the GOLD ROOK on the square in column 6, row 4 — the same row again, two squares further right;
- the DARK KING on the square in column 7, row 7 — high up on the right.

THE THREE PIECES ON ROW 4 ARE IN ONE PERFECTLY STRAIGHT HORIZONTAL LINE, all standing on the same row of squares, their bases at exactly the same height. The bishop stands squarely in the middle of the gap between the two rooks, and the squares on either side of it are completely empty, so it is unmistakable that it is standing IN THEIR WAY. This straight row is the backbone of the picture — do not stagger the three pieces, do not raise or lower any of them.

THE TWO ROOKS ARE LEANING TOWARDS EACH OTHER. Each one is tipped slightly inwards, towards the other, caught in the middle of moving to meet — the dark rook on the left leaning to the right, the gold rook on the right leaning to the left. Just a small tilt each, enough to see that they were on their way to each other. Their bases stay on their squares.

THE BISHOP IS DEAD STRAIGHT AND LOOKING AWAY. It stands bolt upright between them, perfectly vertical, not leaning at all — the one still thing in the row. Its back is turned to both rooks: its mitre, with the diagonal slit cut into it, is turned UP AND TO THE RIGHT, pointing away from them, up towards the dark king. It is not interested in either rook.

THE BISHOP AND THE KING ARE ON ONE CLEAN DIAGONAL. Draw an imaginary straight line through the bishop's mitre and the king's crown: it must be an exact 45-degree diagonal, up and to the right, with the squares along it completely empty. Nothing is drawn on that line — no ray, no beam, no arrow — the alignment alone does the work.

THE KING IS ALERT. He stands upright, turned towards the bishop, facing down the diagonal at it.

THE BOARD IS OTHERWISE EMPTY. Four pieces, nothing else on any square.

READABILITY: this tile is displayed small, so the silhouette carries it — three shapes in one straight row across the middle of the tile, the two outer ones squat and tilted inwards, the middle one slim and bolt upright, and one dark crowned shape high on the right. The middle shape must read instantly as standing between the other two. Keep every piece bold and simple, no fine detail.

NOT: no three-dimensional board, no perspective, no tilted board, no board edge drawn as an object, no board thickness, no arrows, no beams of light, no rays, no glowing lines, no dotted paths, no highlighted or glowing squares, no barriers, no walls, no fences, no shields, no motion lines, no speed lines, no letters or numbers, no coordinates, no clock, no hourglass, no hands, no queen, no knight, no pawn, no second bishop, no cartoon faces, no eyes, no sparkles, no smoke, no photorealism, no thin outlines, no plastic gloss. No text, no lettering, no logo, no watermark, no border outside the ornamental frame.

OUTPUT: square image, at least 1024x1024.
```

---

**Salvează ca:** `zwischenzug.png`, lângă celelalte.

**Verificare**

1. **Cele trei piese de pe rând sunt la aceeași înălțime?** Ăsta e testul
   principal: dacă nebunul e mai sus sau mai jos, nu mai pare că stă în drumul
   lor, ci că trece prin spate. Cere: *„all three on the same row of squares,
   their bases at exactly the same height"*.
2. **Nebunul e clar între ele, cu spațiu gol de-o parte și de alta?** Dacă s-a
   lipit de unul dintre turnuri, se pierde ideea.
3. **Turnurile se apleacă unul spre altul?** Puțin, amândouă spre interior. Dacă
   stau drepte, nu se vede că erau pe cale să se întâlnească.
4. **Nebunul stă perfect drept și se uită în sus-dreapta?** El e singurul
   neclintit din rând. Dacă privește spre vreun turn, imaginea spune altceva.
5. **Nebunul și regele sunt pe o diagonală de fix 45°?** Ăla e motivul pentru
   care mutarea are prioritate.
6. **Culorile: nebunul și un turn aurii, celălalt turn și regele negre.** Dacă
   turnurile ies amândouă la fel, nu se mai înțelege cine cu cine se schimba.
7. **Cele patru romburi sunt întregi?** Niciunul tăiat de marginea imaginii.
