# 8. Dă mat în N mutări → `mate.png`

**Nebun și cal contra rege singur.** Ăsta e matul care *chiar* se numără în
mutări: e cel mai greu final elementar din șah, se dă în până la **33 de mutări**
exacte, și mulți jucători buni îl ratează. Nicio altă poziție nu spune „în N
mutări" mai bine — aici N nu e o figură de stil, e o cifră pe care ți-o spune
oricine a învățat finalul.

Descrierea din [`src/data/tactics.ts`](../../src/data/tactics.ts):

> Secvențe forțate care se termină inevitabil cu mat — în 1, 2 sau 3 mutări.
> Vezi finalul înainte să se întâmple și **execută-l fără milă**.

Plăcuța arată **capătul celor N mutări**: regele negru culcat pe tablă — gestul
prin care se cedează — iar nebunul și calul stând liniștiți pe pătratele din
jurul lui. Nu mai e nimic de calculat. S-a terminat.

## Poziția, verificată cu motorul

```
    a  b  c  d  e  f  g  h
  +------------------------+
8 | .  .  .  .  .  .  .  . |     rege negru  a1
7 | .  .  .  .  .  .  .  . |     nebun alb   b2
6 | .  .  .  .  .  .  .  . |     cal alb     c3
5 | .  .  .  .  .  .  .  . |
4 | .  .  .  .  .  .  .  . |
3 | .  .  N  .  .  .  .  . |
2 | .  B  .  .  .  .  .  . |
1 | k  .  K  .  .  .  .  . |
  +------------------------+
```

Rulat prin chess.js: **`isCheckmate()` întoarce `true`, zero mutări legale.**

Cine ce ține:

- **nebunul de pe b2** dă șahul, din pătratul de lângă rege;
- **calul de pe c3** acoperă **a2** și **b1** — exact cele două pătrate de
  scăpare rămase;
- regele nu poate lua nebunul, fiindcă e apărat.

Regele alb e și el în poziție, pe **c1** — fără el matul nu se poate da. În
desen lipsește, ca la toate celelalte plăcuțe: ar fi a patra piesă și n-ar
adăuga nimic la ce se vede.

## De ce colțul ăsta și nu altul

Aici e partea frumoasă, și e chestie de șah adevărat: cu nebun și cal, **matul se
poate da doar într-un colț de culoarea nebunului**. Nebunul nostru merge pe
pătrate negre, iar **a1 e pătrat negru** — deci acolo se termină, obligatoriu.

Nu regele fuge în colțul ăla. **E dus acolo**, mutare cu mutare, timp de zeci de
mutări.

Se vede și în desen: **a1, b2 și c3 sunt toate pe aceeași diagonală**, și toate
trei sunt pătrate de culoarea nebunului. Cele două piese aurii urcă pe diagonala
lui, iar la capătul ei zace regele.

| element | ce spune |
| --- | --- |
| regele negru, culcat pe tablă | *s-a cedat — capătul celor N mutări* |
| nebunul auriu, în pătratul de lângă el | *cine dă șahul, și cine alege colțul* |
| calul auriu, un pas mai sus | *cine taie pătratele de care nebunul nu se atinge* |
| tabla goală, sus-dreapta | *de acolo a fost adus, pas cu pas* |

Cele două piese aurii lucrează pe culori diferite — nebunul ține doar pătratele
negre, calul le acoperă pe celelalte. **De-asta e nevoie de amândouă**, și de-asta
durează atât.

## Distanțele, numărate în pătrate

Plăcuța arată colțul **de aproape**: grila e desenată cu **5 pătrate pe latură**,
nu 8, fiindcă doar colțul contează.

| piesă | pătrat real | coloana | rândul |
| --- | --- | --- | --- |
| regele negru, căzut | a1 | 1 | 1 |
| nebunul auriu | b2 | 2 | 2 |
| calul auriu | c3 | 3 | 3 |

Colțul din stânga-jos al modelului **e colțul tablei**.

**Atașează la mesaj DOUĂ imagini, în ordinea asta:**
1. [`Atac prin descoperire.png`](../../surse-imagini/tactici/Atac%20prin%20descoperire.png)
   — fundalul plat, rama și cele două metale;
2. [`Sacrificiu.png`](../../surse-imagini/tactici/Sacrificiu.png) — de acolo se ia
   felul în care arată o piesă căzută, culcată pe tablă.

---

```text
Here are two images you made earlier, both from the same set of chess tiles. Copy their look exactly: the same flat decorative background, the same ornamental frame, the same way the pieces are sculpted and lit, the same two metals. The SECOND one also shows a chess piece lying toppled on its side — copy the way that fallen piece is drawn.

COPY FROM THEM, WITHOUT CHANGING ANYTHING:
- Square 1024x1024, filled edge to edge.
- The BACKGROUND is a FLAT chessboard pattern seen straight on — alternating brown squares in low contrast, darker #4B3317 and lighter #7F5425, with a warm radial glow behind the pieces (#63421D) falling off to near-black in the corners (#171513). It is a printed pattern, not a real board: no tilt, no perspective, no vanishing point, no thickness, no board edge, no horizon. In THIS tile the squares are drawn BIGGER than in the reference: exactly 5 columns and 5 rows fill the tile, so each square is large. They stay the same size all over the tile, corner to corner.
- The FRAME: the same ornamental border — a thin double line in warm metallic gold (#DEB863) with rounded corners and angular gold corner pieces at the four corners, plus one small gold diamond centred on each of the four sides. Draw all four diamonds COMPLETE and entirely inside the picture, each moved inwards far enough that no part of it is cropped by the edge.
- The PIECES: solid sculpted Staunton figures in relief, seen from the side, with the same proportions, the same soft rounded bevels, the same polished sheen, the same lighting from the upper left and the same soft drop shadows.

THE TWO METALS:
- The BISHOP and the KNIGHT are LIGHT: rich warm gold, highlight #FFD86A rising to #FCCB43 on the brightest edges, mid-tone #E7AD3E, shadows going deep to #8C4A01 and #5A340A. They are the same metal as each other — they finished this together, and that must be obvious at a glance.
- The KING is DARK: near-black bronze, highlight #4A3A1C, mid-tone #241A0A, deep shadow #0E0A04, with a thin warm gold rim light along his edges so his silhouette stays crisp. He is alone against the two of them.

THE PLACEMENT — read the background as a grid of 5 columns and 5 rows. Number the columns 1 to 5 from the left and the rows 1 to 5 from the bottom. Three pieces:

- the KING is LYING DOWN in the bottom left corner. He is toppled flat on his side along the bottom row, his base on the corner square in column 1, row 1, and his body stretched out to the right so that his crown comes to rest on the square in column 2, row 1. He lies fully horizontal, flat on the board.
- the BISHOP stands upright on the square in column 2, row 2 — the square diagonally next to the king's corner, directly above his fallen crown.
- the KNIGHT stands upright on the square in column 3, row 3 — one more square along the same diagonal, up and to the right.

The king's corner square, the bishop's square and the knight's square are all on ONE straight 45-degree diagonal running up and to the right from the bottom left corner. The two gold pieces are close in — they are standing on the squares immediately around him, not far away across the board.

THE KING HAS BEEN RESIGNED. He is lying on his side exactly the way a player lays their king down to give up the game: flat on the board, fully horizontal, his crown pointing to the right, his base towards the corner. He is not falling and not tilted — he is already down and still. He is drawn as a solid piece in the same dark metal, with his own soft shadow on the board beneath him. His crown lies right at the foot of the bishop.

THE TWO GOLD PIECES STAND CALM. Both are bolt upright, quiet and still, standing squarely on their squares — no leaning, no triumphal pose. The bishop's mitre, with its diagonal slit, is turned down and to the left, towards the fallen king. The knight's head is turned the same way, looking down at him.

THE BOARD IS OTHERWISE EMPTY. Three pieces, nothing else on any square. The whole upper right of the tile is open empty board with the warm glow on it — that emptiness is deliberate: it is all the room the king had, before he was walked into this corner.

READABILITY: this tile is displayed small, so the silhouette carries it — one long dark crowned shape lying flat across the bottom left, one slim gold mitre standing just above it, one gold horse's head standing a step further up and to the right, and open board above. Keep every piece bold and simple, no fine detail.

NOT: no three-dimensional board, no perspective, no tilted board, no board edge drawn as an object, no board thickness, no arrows, no beams of light, no rays, no glowing lines, no dotted paths, no highlighted or glowing squares, no shadow shaped like a fallen king, no chains, no nets, no cracks, no broken crown, no blood, no motion lines, no letters or numbers, no coordinates, no clock, no hourglass, no hands, no handshake, no queen, no rook, no pawn, no second king, no cartoon faces, no eyes, no sparkles, no smoke, no photorealism, no thin outlines, no plastic gloss. No text, no lettering, no logo, no watermark, no border outside the ornamental frame.

OUTPUT: square image, at least 1024x1024.
```

---

**Salvează ca:** `mate.png`, lângă celelalte.

**Verificare**

1. **Regele e complet culcat, nu înclinat?** Ăsta e testul principal: orizontal,
   pe o parte, cu coroana în dreapta. Dacă e doar aplecat, arată ca și cum ar
   cădea, nu ca și cum s-a cedat. Cere: *„fully horizontal, lying flat on the
   board on its side"*.
2. **Nebunul și calul sunt aproape de el?** Pe pătratele din jur, pe diagonală.
   Dacă au ajuns hăt în mijlocul tablei, se pierde ideea de „l-au încolțit".
3. **Cele trei pătrate sunt pe o diagonală de fix 45°?** Colțul, apoi nebunul,
   apoi calul.
4. **Coroana ajunge la piciorul nebunului?** Detaliul ăsta face jumătate din
   imagine.
5. **Cele două piese aurii stau drepte și liniștite?** Fără poze de învingător.
6. **Nebunul și calul sunt amândoi aurii, regele negru?** Dacă una a ieșit
   închisă, se pierde „doi contra unul".
7. **Cele patru romburi sunt întregi?** Niciunul tăiat de marginea imaginii.

---

## Ce am încercat înainte

**Prima variantă:** matul pe ultima linie — rege negru în colț, zidit de propriii
lui pioni, cu un turn auriu venind pe linia a 8-a. Poziția era corectă, dar matul
pe ultima linie e **mat într-o mutare**, nu în N. Imaginea arăta un sfârșit brusc,
nu o vânătoare lungă.

**A doua variantă:** tot nebun și cal, dar prinse la mijlocul vânătorii — regele
încă în picioare, cele două piese departe de el, iar inevitabilul spus printr-o
umbră răsturnată întinsă pe tablă. Umbra era o ocolire: spunea „o să cadă" în loc
să arate că a căzut. Regele culcat de-a binelea spune același lucru direct, și
mai apropie piesele de el, ceea ce face plăcuța mai limpede la mărime mică.
