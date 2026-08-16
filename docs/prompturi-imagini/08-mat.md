# 8. Dă mat în N mutări → `mate.png`

**Nebun și cal contra rege singur.** Ăsta e matul care *chiar* se numără în
mutări: e cel mai greu final elementar din șah, se dă în până la **33 de mutări**
exacte, și mulți jucători buni îl ratează. Nicio altă poziție nu spune „în N
mutări" mai bine — aici N nu e o figură de stil, e o cifră pe care ți-o spune
oricine a învățat finalul.

Descrierea din [`src/data/tactics.ts`](../../src/data/tactics.ts):

> Secvențe forțate care se termină inevitabil cu mat — în 1, 2 sau 3 mutări.
> **Vezi finalul înainte să se întâmple** și execută-l fără milă.

De aceea plăcuța **nu arată matul**, ci vânătoarea: regele negru în colț, cele
două piese aurii strângând plasa. Matul n-a căzut încă, dar se știe. Iar pentru
partea de „se știe", metafora: **regele stă în picioare, dar umbra lui a căzut
deja.**

## Poziția, verificată cu motorul

```
    a  b  c  d  e  f  g  h
  +------------------------+
8 | .  .  .  .  .  .  .  . |     rege negru   a1
7 | .  .  .  .  .  .  .  . |     nebun alb    f6
6 | .  .  .  .  .  B  .  . |     cal alb      c4
5 | .  .  .  .  .  .  .  . |
4 | .  .  N  .  .  .  .  . |
3 | .  .  .  .  .  .  .  . |
2 | .  .  .  .  .  .  .  . |
1 | k  .  .  .  .  .  .  . |
  +------------------------+
```

Rulat prin chess.js:

- nebunul de pe **f6** dă șah pe diagonala mare, f6–e5–d4–c3–b2–**a1**;
- regele negru are exact **două mutări legale: Ka2 și Kb1**. Atât;
- **b2**, singurul pătrat care l-ar scoate din colț pe diagonală, e ținut de
  amândouă piesele deodată — și de nebun, și de cal.

## De ce colțul ăsta și nu altul

Aici e partea frumoasă, și e chestie de șah adevărat: cu nebun și cal, **matul se
poate da doar într-un colț de culoarea nebunului**. Nebunul nostru merge pe
pătrate negre, iar **a1 e pătrat negru** — deci acolo se termină, obligatoriu.

Nu regele fuge în colțul ăla. **E dus acolo.** De-asta linia nebunului din
imagine cade fix pe colțul în care stă regele: nu e o coincidență de compoziție,
e regula finalului.

| element | ce spune |
| --- | --- |
| regele negru, în colțul de jos | *unde se termină, și n-are încotro* |
| nebunul auriu, sus, pe diagonala mare | *cine alege colțul* |
| calul auriu, între ei | *cine taie pătratele de care nebunul nu se atinge* |
| umbra răsturnată, întinsă lângă rege | *finalul, deja vizibil* |

Cele două piese aurii lucrează pe culori diferite — nebunul ține doar pătratele
negre, calul le acoperă pe celelalte. **De-asta e nevoie de amândouă**, și de-asta
durează atât.

Regele alb lipsește din imagine, ca la toate celelalte plăcuțe. În partidă e și
el acolo — fără el matul nu se poate da — dar în desen ar fi a patra piesă și ar
aglomera degeaba.

## Distanțele, numărate în pătrate

Grila desenată **e chiar tabla**: 8 pe 8, cu coloana și rândul din prompt egale
cu litera și cifra din poziția de sus.

| piesă | pătrat real | coloana | rândul |
| --- | --- | --- | --- |
| regele negru | a1 | 1 | 1 |
| calul auriu | c4 | 3 | 4 |
| nebunul auriu | f6 | 6 | 6 |

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
- The BISHOP and the KNIGHT are LIGHT: rich warm gold, highlight #FFD86A rising to #FCCB43 on the brightest edges, mid-tone #E7AD3E, shadows going deep to #8C4A01 and #5A340A. They are the same metal as each other — they are hunting together, and that must be obvious at a glance.
- The KING is DARK: near-black bronze, highlight #4A3A1C, mid-tone #241A0A, deep shadow #0E0A04, with a thin warm gold rim light along his edges so his silhouette stays crisp. He is alone against the two of them.

THE PLACEMENT — read the background as a grid of 8 columns and 8 rows. Number the columns 1 to 8 from the left and the rows 1 to 8 from the bottom. Three pieces, each standing on the square it is given, its base resting on that square:

- the KING on the square in column 1, row 1 — the bottom left corner square, pressed right into the corner;
- the KNIGHT on the square in column 3, row 4 — out in the middle of the board, closer to the king;
- the BISHOP on the square in column 6, row 6 — far away, up and to the right.

THE BISHOP'S LINE POINTS INTO THE CORNER. The bishop and the king stand on the same long diagonal, the one that runs from the bottom left corner of the board up to the top right. Draw an imaginary straight line through the bishop and the king: it must be a clean 45-degree diagonal, and every square along it between them must be completely empty. The bishop is turned so that its mitre, and the diagonal slit cut into it, face down along that line towards the king. Nothing is drawn on the line — no ray, no beam, no arrow — the alignment alone does the work.

THE KNIGHT IS OFF THAT LINE, standing clearly to the left of it, and its head is turned towards the king, looking down at him.

THE KING IS CORNERED. He stands in the corner square, upright, calm and perfectly still, with no square left behind him: the board simply ends there, on two sides of him at once.

THE BOARD IS OTHERWISE EMPTY. Three pieces, nothing else on any square — that emptiness matters, because the whole point is that one king is alone out there with two pieces closing in on him.

THE SHADOW HAS ALREADY FALLEN. The long shadow the king throws is NOT the shadow of a standing piece: it is the silhouette of a king LYING TOPPLED ON HIS SIDE, fallen over, his crown pointing away to the right. It stretches out from his base across the empty squares along the bottom of the board, long and dark and unmistakable in shape. He is still standing; his shadow is already down.

The shadow must read as a shadow and not as a second piece: completely flat on the board, one soft dark shape with soft edges, no modelling, no highlights, no metal, no rim light, no detail inside it — only an outline, and the outline is a fallen king with a clear crown at its end. The standing king stays fully solid and fully upright.

READABILITY: this tile is displayed small, so the silhouette carries it — a dark crowned shape jammed in the bottom left corner, one long dark fallen-king shape lying beside it, a gold horse's head out in the middle, and a gold mitre high on the right pointing down at the corner. Keep every piece bold and simple, no fine detail.

NOT: no three-dimensional board, no perspective, no tilted board, no board edge drawn as an object, no board thickness, no arrows, no beams of light, no rays, no glowing lines, no dotted paths, no highlighted or glowing squares, no chains, no nets, no cracks, no broken crown, no blood, no motion lines, no letters or numbers, no coordinates, no clock, no hourglass, no hands, no queen, no rook, no pawn, no second king as a solid piece, no cartoon faces, no eyes, no sparkles, no smoke, no photorealism, no thin outlines, no plastic gloss. No text, no lettering, no logo, no watermark, no border outside the ornamental frame.

OUTPUT: square image, at least 1024x1024.
```

---

**Salvează ca:** `mate.png`, lângă celelalte.

**Verificare**

1. **Nebunul și regele sunt pe aceeași diagonală?** Ține o riglă din mitra
   nebunului spre coroana regelui — trebuie să cadă fix în colț. Dacă nebunul e
   deplasat, cere: *„put the bishop and the king on one exact 45-degree diagonal,
   nothing between them"*.
2. **Umbra e umbră, nu a doua piesă?** Plată, dintr-o bucată, fără metal și fără
   lumini. Dacă a ieșit un al doilea rege culcat, cere: *„make it a flat soft
   shadow lying on the board, no modelling, no metal, only a silhouette"*.
3. **Se vede că umbra e un rege răsturnat?** Coroana la capăt. Dacă e o pată
   oarecare, s-a pierdut ideea.
4. **Regele e chiar în colț?** Lipit de colțul de jos-stânga, cu tabla
   terminându-se pe două laturi ale lui.
5. **Calul e în afara diagonalei?** Dacă a ajuns pe ea, blochează linia nebunului
   și strică tocmai ce arată imaginea.
6. **Nebunul și calul sunt amândoi aurii, regele negru?** Cele două piese
   vânează împreună; dacă una a ieșit închisă, se pierde „doi contra unul".
7. **Cele patru romburi sunt întregi?** Niciunul tăiat de marginea imaginii.

---

## Ce am încercat înainte

Prima variantă era **matul pe ultima linie**: rege negru în colț, zidit de
propriii lui pioni, cu un turn auriu venind pe linia a 8-a. Poziția era corectă —
mat verificat, zero mutări legale — și ideea „zidul e făcut din oamenii lui" ținea.

Doar că matul pe ultima linie e **mat într-o mutare**, nu în N. Imaginea arăta un
sfârșit brusc, nu o vânătoare lungă. Nebunul și calul spun exact pe dos: e
finalul care se numără, cel care durează.
