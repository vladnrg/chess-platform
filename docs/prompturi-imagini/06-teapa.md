# 6. Țeapă și atacul cu raze X → `skewer.png`

**Metafora e chiar numele tacticii.** „Raze X" nu e o figură de stil aleasă de
noi — așa se cheamă: un atac care **trece prin** piesa din față și ajunge la ce e
în spatele ei. Deci asta se desenează: raza pleacă din damă, străbate regele ca
și cum n-ar fi acolo și cade pe turnul de dincolo de el. Regele devine sticlă
fumurie: se vede raza arzând prin el.

**Regele nu e adăpost, e fereastră.** Ăsta e tot mecanismul, într-o propoziție.

## Poziția, verificată cu motorul

```
    a  b  c  d  e  f  g  h
  +------------------------+
8 | .  .  .  .  .  .  .  . |     damă albă   b1
7 | .  .  .  .  .  .  .  . |     rege negru  e4
6 | .  .  .  .  .  .  r  . |     turn negru  g6
5 | .  .  .  .  .  .  .  . |
4 | .  .  .  .  k  .  .  . |
3 | .  .  .  .  .  .  .  . |
2 | .  .  .  .  .  .  .  . |
1 | .  Q  .  .  .  .  .  K |
  +------------------------+
```

Rulat prin chess.js, nu compus din cap:

- dama de pe **b1** dă șah regelui de pe **e4**, pe diagonala b1–c2–d3–e4;
- în spatele regelui, pe aceeași diagonală, stă turnul de pe **g6** (e4–f5–g6);
- negrul are exact **șase mutări legale**: Kd4, Kd5, Ke5, Ke3, Kf3, Kf4. Toate
  sunt mutări de rege — d3 și f5 rămân pe diagonală, deci sunt interzise;
- **după oricare dintre ele, Qxg6 ia turnul**, și nu există recaptură. Verificat
  pe toate șase, una câte una.

Asta e țeapa curată: piesa mare din față **e obligată** să se ferească, și tocmai
ferindu-se descoperă prada.

## De ce e altfel decât „Legarea"

Sunt vecine și seamănă — trei piese pe o linie — dar spun exact pe dos, iar
imaginile trebuie să arate pe dos:

| | Legarea | Țeapa |
| --- | --- | --- |
| în față stă | piesa **mică** | piesa **mare** |
| și ea | **nu poate** pleca | **trebuie** să plece |
| se desenează prin | lanțuri, nemișcare | rază care trece prin, corp aplecat |

De-asta la legare calul e țeapăn și înlănțuit, iar aici regele se apleacă deja
într-o parte, gata s-o ia din loc.

## De ce e altfel decât „Atac prin descoperire"

Și acolo e o rază aurie, tot pe diagonală — dar acolo raza trece prin **aer gol**,
iar piesa care era în drum s-a dat deja la o parte. Aici raza trece prin **piesă**,
și piesa e încă acolo.

Diferența se vede din prima: la descoperire, două piese pe linie și una lângă ea;
aici, **toate trei pe aceeași linie**, cu cea din mijloc transparentă.

| element | ce spune |
| --- | --- |
| dama aurie, jos-stânga | *cine atacă* |
| regele negru, transparent, aplecat | *piesa mare, obligată să se ferească* |
| raza care iese din el nescăzută | *atacul nu se oprește în el* |
| turnul negru, sus-dreapta | *prada, care rămâne descoperită* |

## Distanțele, numărate în pătrate

Ca la „Atragerea": fundal plat, piesele stau pe pătratele lui, distanțele se
numără. Aici grila desenată **chiar e tabla** — coloana și rândul din prompt sunt
litera și cifra din poziția de sus:

| piesă | pătrat real | coloana | rândul |
| --- | --- | --- | --- |
| dama albă | b1 | 2 | 1 |
| regele negru | e4 | 5 | 4 |
| turnul negru | g6 | 7 | 6 |

Trei pătrate de la damă la rege, două de la rege la turn — și toate pe aceeași
diagonală, fiindcă pătratele care se ating în colț *sunt* diagonala.

**Atașează la mesaj DOUĂ imagini, în ordinea asta:**
1. [`Atac prin descoperire.png`](../../surse-imagini/tactici/Atac%20prin%20descoperire.png)
   — fundalul plat, rama, raza aurie și cele două metale, toate de acolo;
2. [`Sacrificiu.png`](../../surse-imagini/tactici/Sacrificiu.png) — încă un model
   de negru, unde a ieșit bine.

---

```text
Here are two images you made earlier, both from the same set of chess tiles. Copy their look exactly: the same flat decorative background, the same ornamental frame, the same way the pieces are sculpted and lit, the same two metals. The FIRST one also has the golden ray I want here.

COPY FROM THE FIRST IMAGE, WITHOUT CHANGING ANYTHING:
- Square 1024x1024, filled edge to edge.
- The BACKGROUND is a FLAT chessboard pattern seen straight on — alternating brown squares in low contrast, darker #4B3317 and lighter #7F5425, with a warm radial glow behind the pieces (#63421D) falling off to near-black in the corners (#171513). It is a printed pattern, not a real board: no tilt, no perspective, no vanishing point, no thickness, no board edge, no horizon. The squares stay the same size all over the tile, corner to corner.
- The FRAME: the same ornamental border — a thin double line in warm metallic gold (#DEB863) with rounded corners, angular gold corner pieces at the four corners, and one small gold diamond centred on each of the four sides.
- The PIECES: solid sculpted Staunton figures in relief, seen from the side, with the same proportions, the same soft rounded bevels, the same polished sheen, the same lighting from the upper left and the same soft drop shadows.
- The RAY: the same straight golden beam of light, the same thickness and the same glow as the one crossing the first image.

THE TWO METALS:
- The QUEEN is LIGHT: rich warm gold, highlight #FFD86A rising to #FCCB43 on the brightest edges, mid-tone #E7AD3E, shadows going deep to #8C4A01 and #5A340A.
- The KING and the ROOK are DARK, and the same metal as each other: near-black bronze, highlight #4A3A1C, mid-tone #241A0A, deep shadow #0E0A04, with a thin warm gold rim light along their edges. They belong to the same side, and that must be obvious at a glance.

THE PLACEMENT — read the background as a grid of 8 columns and 8 rows. Number the columns 1 to 8 from the left and the rows 1 to 8 from the bottom. Three pieces, each standing on the square it is given:

- the QUEEN on the square in column 2, row 1 — low on the left;
- the KING on the square in column 5, row 4 — three squares from the queen, up and to the right, along the line of squares that touch corner to corner;
- the ROOK on the square in column 7, row 6 — two more squares along that same line, up and to the right.

Each piece is centred left-to-right on its own square, its base resting on that square, its width matching the square. All three therefore end up on one exact diagonal — do not adjust this by eye afterwards, just put each piece on the square it is given. The squares between them stay empty: nothing else stands on the board.

THE RAY GOES THROUGH THE KING. One straight golden beam runs along that diagonal, from the queen up to the rook. It leaves the queen's crown, crosses the empty squares, enters the black king's body, comes out the other side WITHOUT losing any brightness, crosses the last empty squares and lands on the base of the black rook, exactly the way the beam lands on the rook in the first image. It is one single unbroken straight line from end to end. The king does not stop it, does not bend it and does not dim it.

THE KING IS TRANSPARENT. Where the ray passes through him, and in fact throughout his whole body, the metal has turned to dark smoked glass: you can see the golden beam burning inside him, glowing through his body from within. He must still read as a BLACK piece — dark, near-black, only see-through, with the same thin warm gold rim light along his edges keeping his silhouette crisp. He is transparent, not pale, not white, not clear glass.

THE KING IS ABOUT TO STEP ASIDE. He leans over to one side, tipped off balance, as if starting to get out of the way — but his base is still on his square and he is still on the line. Just enough tilt that a viewer sees he cannot stay.

THE QUEEN AND THE ROOK STAND STILL. Both sit squarely and flat on their squares, upright, solid and opaque, each with its own small contact shadow on the square underneath it. Neither is tilted, neither is transparent.

READABILITY: this tile is displayed small, so the silhouette carries it — a gold crowned shape low on the left, one bright straight line running up to the right, a dark see-through crowned shape in the middle of it, a squat dark shape at the top right. Keep every piece bold and simple, no fine detail.

Nothing else anywhere. Three pieces and one ray, on the flat patterned background.

NOT: no three-dimensional board, no perspective, no tilted board, no board edge, no board thickness, no arrows, no arrowheads, no dotted paths, no highlighted or glowing squares, no second beam, no branching rays, no magnifying glass, no skeleton or bones, no medical imagery, no motion lines, no letters or numbers, no coordinates, no hands, no pawn, no knight, no bishop, no cartoon faces, no eyes, no sparkles, no smoke, no photorealism, no thin outlines, no plastic gloss. No text, no lettering, no logo, no watermark, no border outside the ornamental frame.

OUTPUT: square image, at least 1024x1024.
```

---

**Salvează ca:** `skewer.png`, lângă celelalte.

**Verificare**

1. **Raza e o singură linie dreaptă, de la un capăt la altul?** Ăsta e testul
   principal: dacă se oprește în rege sau se frânge în el, s-a pierdut tocmai
   „raze X". Cere: *„one unbroken straight ray, passing through the king and
   coming out the other side at the same brightness"*.
2. **Regele se vede prin?** Sticlă fumurie închisă, cu raza arzând înăuntru. Dacă
   a ieșit alb sau incolor, cere: *„dark smoked glass, still a black piece, only
   see-through"*.
3. **Numără pătratele.** De la damă la rege: trei. De la rege la turn: două. Toate
   pe aceeași diagonală, cu pătratele goale între ele.
4. **Regele e înclinat, dar tot pe linie?** Dacă înclinarea l-a scos de pe
   diagonală, cere-o mai mică — ideea e că *urmează* să plece, nu că a plecat.
5. **Dama și turnul stau drept, opace, cu umbră de contact?** Regele e singurul
   transparent și singurul înclinat.
6. **Doar dama e aurie.** Regele și turnul, amândouă întunecate.
7. **Nu seamănă cu „Legarea"?** Acolo trei piese pe o linie, dar cu lanțuri și
   nemișcare. Dacă apar lanțuri aici, ceva s-a amestecat.
