# 8. Dă mat în N mutări → `mate.png`

Descrierea din [`src/data/tactics.ts`](../../src/data/tactics.ts) are două
jumătăți, și amândouă trebuie să se vadă:

> Secvențe forțate care se termină inevitabil cu mat — în 1, 2 sau 3 mutări.
> **Vezi finalul înainte să se întâmple** și execută-l fără milă.

Prima jumătate e **matul**, și pentru asta se desenează poziția: regele negru în
colț, zidit de propriii lui pioni, cu turnul auriu venind pe ultima linie.

A doua jumătate e **„în N mutări"** — inevitabilul. Pentru asta e metafora:
**regele stă încă în picioare, dar umbra lui a căzut deja.** Pe tablă, lângă el,
se întinde silueta unui rege răsturnat. El e drept; sfârșitul se vede deja.

## Poziția, verificată cu motorul

```
    a  b  c  d  e  f  g  h
  +------------------------+
8 | k  .  .  .  .  .  .  R |     rege negru  a8
7 | p  p  .  .  .  .  .  . |     pioni negri a7, b7
6 | .  .  .  .  .  .  .  . |     turn alb    h8
5 | .  .  .  .  .  .  .  . |
4 | .  .  .  .  .  .  .  . |
3 | .  .  .  .  .  .  .  . |
2 | .  .  .  .  .  .  .  . |
1 | .  .  .  .  .  .  .  . |
  +------------------------+
```

Rulat prin chess.js: **`isCheckmate()` întoarce `true`, iar negrul are exact
zero mutări legale.** Nu e „aproape mat", e mat.

De ce se închide totul, pătrat cu pătrat:

- turnul de pe **h8** dă șah pe linia a 8-a, drumul e liber până la rege;
- **b8**, singurul pătrat de scăpare de pe linie, e ținut de același turn;
- **a7** și **b7** sunt ocupate de **pionii lui**;
- turnul nu poate fi luat și șahul nu poate fi blocat — pionii negri merg în jos,
  nu se pot întoarce pe linia a 8-a.

Ăsta e matul pe ultima linie, cel mai des întâlnit din șah. Și e frumos tocmai
prin ce spune: **zidul care-l ține închis e făcut din oamenii lui.**

## De ce colțul, și de ce doi pioni

Un rege în colț are doar **două** pătrate de scăpare în afara liniei — de aceea
sunt de-ajuns doi pioni. Oriunde altundeva ar fi nevoie de trei, iar plăcuța s-ar
aglomera. Colțul e și cel mai puțin de explicat: se vede din prima că nu mai e
loc.

Tabla liberă de deasupra rămâne goală **intenționat**. Nu e spațiu irosit, e
tocmai ideea: se vede unde ar putea fugi, și se vede ce-l oprește.

| element | ce spune |
| --- | --- |
| regele negru, în colț, drept | *piesa care primește matul* |
| cei doi pioni negri, lipiți de el | *zidul, și e al lui* |
| turnul auriu, la capătul liniei | *mutarea care închide* |
| umbra răsturnată, întinsă pe tablă | *finalul, deja vizibil* |

## Distanțele, numărate în pătrate

Ca la „Atragerea" și „Țeapa": fundal plat, piesele stau pe pătratele lui. Aici
grila e desenată **mai mare — 6 pătrate pe latură, nu 8** — fiindcă plăcuța arată
un colț al tablei de aproape. Colțul e tot ce contează.

| piesă | coloana | rândul |
| --- | --- | --- |
| regele negru | 1 | 1 |
| pion negru | 1 | 2 |
| pion negru | 2 | 2 |
| turnul auriu | 5 | 1 |

Colțul din stânga-jos al modelului **e colțul tablei** — de-aia regele n-are unde
să se ducă.

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
- The BACKGROUND is a FLAT chessboard pattern seen straight on — alternating brown squares in low contrast, darker #4B3317 and lighter #7F5425, with a warm radial glow behind the pieces (#63421D) falling off to near-black in the corners (#171513). It is a printed pattern, not a real board: no tilt, no perspective, no vanishing point, no thickness, no board edge, no horizon. In THIS tile the squares are drawn BIGGER than in the reference: exactly 6 columns and 6 rows fill the tile, so each square is large. They stay the same size all over the tile, corner to corner.
- The FRAME: the same ornamental border — a thin double line in warm metallic gold (#DEB863) with rounded corners and angular gold corner pieces at the four corners, plus one small gold diamond centred on each of the four sides. Draw all four diamonds COMPLETE and entirely inside the picture, each moved inwards far enough that no part of it is cropped by the edge.
- The PIECES: solid sculpted Staunton figures in relief, seen from the side, with the same proportions, the same soft rounded bevels, the same polished sheen, the same lighting from the upper left and the same soft drop shadows.

THE TWO METALS:
- The ROOK is LIGHT: rich warm gold, highlight #FFD86A rising to #FCCB43 on the brightest edges, mid-tone #E7AD3E, shadows going deep to #8C4A01 and #5A340A.
- The KING and the TWO PAWNS are DARK, and all the same metal: near-black bronze, highlight #4A3A1C, mid-tone #241A0A, deep shadow #0E0A04, with a thin warm gold rim light along their edges. The king and the pawns belong to the SAME side, and that must be obvious at a glance — the pawns are his own.

THE PLACEMENT — read the background as a grid of 6 columns and 6 rows. Number the columns 1 to 6 from the left and the rows 1 to 6 from the bottom. Four pieces, each standing on the square it is given, its base resting on that square:

- the KING on the square in column 1, row 1 — the bottom left corner square, pressed right into the corner;
- one PAWN on the square in column 1, row 2 — directly behind him;
- the other PAWN on the square in column 2, row 2 — behind him and one square to the right;
- the ROOK on the square in column 5, row 1 — far away along the same bottom row, with three empty squares between it and the king.

THE PAWNS MUST BE VISIBLE. They are much shorter than the king and they stand behind him, so draw them a little higher up and offset, their round heads and shoulders showing clearly above and beside his crown. Neither pawn may be hidden behind him. They stand shoulder to shoulder, close and tight, sealing the two squares next to the king — they read as a small wall made of his own men.

THE BOTTOM ROW IS THE EDGE OF THE BOARD. The king is jammed into its corner with nothing beyond it, and the whole bottom row between him and the rook is completely empty and open — that is the line the rook is sweeping.

THE BOARD ABOVE IS EMPTY AND STAYS EMPTY. Above the pawns, the rest of the tile is open board with the warm glow and nothing on it. That emptiness is deliberate: it is the free board the king can see and cannot reach, because his own pawns are in the way.

THE SHADOW HAS ALREADY FALLEN. The king is standing perfectly upright, calm and still. But the long shadow he throws across the board is NOT the shadow of a standing piece: it is the silhouette of a king LYING TOPPLED ON HIS SIDE, fallen over, his crown pointing away to the right. It stretches out from his base across the empty squares of the bottom rows, towards the rook, long and dark and unmistakable in shape.

The shadow must read as a shadow and not as a second piece: completely flat on the board, one soft dark shape with soft edges, no modelling, no highlights, no metal, no rim light, no detail inside it — only an outline, and the outline is a fallen king. The standing king above it stays fully solid and fully upright.

READABILITY: this tile is displayed small, so the silhouette carries it — a dark crowned shape jammed in the bottom left corner, two small round heads pressed close behind it, one squat gold shape at the far right of the bottom row, and one long dark fallen-king shape lying across the empty board between them. Keep every piece bold and simple, no fine detail.

Nothing else anywhere. Four pieces and one shadow, on the flat patterned background.

NOT: no three-dimensional board, no perspective, no tilted board, no board edge drawn as an object, no board thickness, no arrows, no beams of light, no rays, no dotted paths, no highlighted or glowing squares, no chains, no cracks, no broken crown, no blood, no motion lines, no letters or numbers, no coordinates, no clock, no hourglass, no hands, no queen, no bishop, no knight, no second king as a solid piece, no cartoon faces, no eyes, no sparkles, no smoke, no photorealism, no thin outlines, no plastic gloss. No text, no lettering, no logo, no watermark, no border outside the ornamental frame.

OUTPUT: square image, at least 1024x1024.
```

---

**Salvează ca:** `mate.png`, lângă celelalte.

**Verificare**

1. **Umbra e umbră, nu a doua piesă?** Ăsta e testul greu. Trebuie să fie plată,
   dintr-o bucată, fără metal și fără lumini. Dacă a ieșit un al doilea rege
   culcat, cere: *„make it a flat soft shadow lying on the board, no modelling,
   no metal, only a silhouette"*.
2. **Se vede că umbra e un rege răsturnat?** Coroana la capăt, corpul lung. Dacă
   e o pată oarecare, s-a pierdut toată ideea.
3. **Regele stă drept?** El e singurul lucru nemișcat din plăcuță. Dacă s-a
   înclinat și el, umbra nu mai spune nimic.
4. **Se văd amândoi pionii?** Capetele deasupra coroanei, nu ascunse în spatele
   lui. Dacă unul a dispărut, cere: *„both pawns clearly visible above and beside
   the king's crown"*.
5. **Pionii sunt negri, ca regele?** Dacă au ieșit aurii, imaginea spune pe dos:
   că-l încolțește adversarul, nu că-l zidesc ai lui.
6. **Regele e chiar în colț?** Lipit de colțul de jos-stânga al modelului. Un
   pătrat mai încolo și se pierde motivul pentru care nu poate scăpa.
7. **Cele patru romburi sunt întregi?** Niciunul tăiat de marginea imaginii.
