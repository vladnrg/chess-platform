# 4. Atragerea și devierea → `attraction.png`

**Scena:** nebunul negru stă la intersecția a două diagonale. Pe una, la un
pătrat în jos-dreapta, îl cheamă un **pion alb cu magnet**. Pe cealaltă, trei
pătrate în sus-dreapta, păzește un **turn negru**. Ca să ia pionul, trebuie să
părăsească diagonala turnului.

Asta e devierea, întreagă, într-o singură imagine: nu e nevoie să se vadă
consecința, fiindcă se vede **alegerea imposibilă**.

## Poziția, verificată cu motorul

```
    a  b  c  d  e  f  g  h
  +------------------------+
8 | .  .  .  .  .  .  r  . |     nebun negru  d5
7 | .  .  .  .  .  .  .  . |     pion alb     e4
6 | .  .  .  .  .  .  .  . |     turn negru   g8
5 | .  .  .  b  .  .  .  . |
4 | .  .  .  .  P  .  .  . |
3 | .  .  .  .  .  .  .  . |
2 | .  .  .  .  .  .  .  . |
1 | .  .  .  .  .  .  .  . |
  +------------------------+
```

Verificat cu chess.js, nu compus din cap:

- pionul de pe **e4** atacă nebunul de pe **d5** — un pion alb bate în diagonală
  înainte, deci ţine sub bătaie d5 și f5;
- de pe **d5**, nebunul apără turnul de pe **g8**, pe diagonala d5–e6–f7–g8;
- după ce ia pionul și ajunge pe **e4**, diagonalele lui devin e4–f5–g6–h7 și
  e4–d5–c6–b7–a8. **g8 nu e pe niciuna** — turnul rămâne fără apărare.

Nebunul stă exact în punctul în care cele două diagonale se încrucișează. De
aceea imaginea funcționează fără explicații: se vede că, mergând într-o parte,
pierde cealaltă.

| element | ce spune |
| --- | --- |
| pionul alb, mic, cu magnetul | *cine cheamă — și cât de puțin costă* |
| nebunul negru, aplecat spre el | *e obligat să vină* |
| turnul negru, sus-dreapta pe diagonală | *ce lasă în urmă* |

**Atașează la mesaj DOUĂ imagini:**
1. [`furculita.png`](../../surse-imagini/tactici/furculita.png) — rama, fundalul, finisajul;
2. [`Sacrificii.png`](../../surse-imagini/tactici/Sacrificii.png) — modelul pentru cele două metale.

---

```text
Here are two images you made earlier. Use them as the style reference: the first for the frame, the background and the finish, the second for the two metals — the pale gold of its fallen queen and the dark near-black bronze of its three standing pieces.

KEEP IDENTICAL TO THE REFERENCES:
- Square 1024x1024, filled edge to edge.
- BACKGROUND: the same chessboard pattern of alternating brown squares in low contrast — darker squares #4B3317, lighter squares #7F5425 — with the same warm radial glow behind the scene (#63421D) falling off to near-black in the four corners (#171513).
- FRAME: the same ornamental border — a thin double line in warm metallic gold (#DEB863) with rounded corners, angular gold corner pieces at the four corners, and one small gold diamond centred on each of the four sides.
- FINISH: the same sculpted, polished, three-dimensional metal — soft rounded bevels, smooth gradients, a gentle sheen, soft drop shadows. Solid Staunton chess pieces, modelled in relief.

DIFFERENT THIS TIME — THE PIECES STAND ON THE SQUARES. Unlike the earlier tiles, where the board was only a backdrop, here the chessboard is a real board seen at a low angle, and each piece stands squarely on its own square, aligned to the grid. The squares must be clearly readable, because the whole meaning of this tile is which piece stands on which diagonal.

THE TWO METALS:
- The PAWN is LIGHT: rich warm gold, highlight #FFD86A rising to #FCCB43 on the brightest edges, mid-tone #E7AD3E, shadows going deep to #8C4A01 and #5A340A. Polished metal, never pale matte cream or ivory.
- The BISHOP and the ROOK are DARK, and the same metal as each other: near-black bronze, highlight #4A3A1C, mid-tone #241A0A, deep shadow #0E0A04, with a thin warm gold rim light along their edges. They belong to the same side, and that must be obvious.

THE POSITION — only three pieces on the whole board, and nothing else:

1. A DARK BISHOP, standing near the middle of the board. It is the centre of everything.

2. A LIGHT PAWN, standing exactly ONE SQUARE diagonally DOWN AND TO THE RIGHT of the bishop — the two pieces touch corners on that diagonal, with no square between them. Fixed to the front of the pawn, turned towards the bishop, is a SMALL HORSESHOE MAGNET: a compact gold U-shape with two flat pole tips, each with two simple raised bands. The magnet is part of the pawn, not a separate object beside it, and small enough that the pawn still reads as a pawn. The pawn is much smaller than the bishop, about half its height.

3. A DARK ROOK, standing THREE SQUARES diagonally UP AND TO THE RIGHT of the bishop, on the opposite diagonal from the pawn. The two empty squares between the bishop and the rook must be plainly visible and completely empty, so the line joining them is unmistakable.

THE GEOMETRY IS THE WHOLE POINT. The bishop sits where two diagonals cross. One diagonal runs down-right to the pawn, one square away. The other runs up-right to the rook, three squares away. A viewer must be able to trace both lines across the squares of the board.

THE BISHOP IS BEING PULLED. It leans over towards the pawn, down and to the right, off balance — the far edge of its base lifting off its square. Its head is TURNED BACK over its shoulder, up towards the rook. It is going where it does not want to go, and it knows what it is leaving.

Everything else on the board is empty. No other pieces anywhere.

READABILITY: this tile is displayed small, so keep the three pieces large relative to the board and keep the board's squares clean and clearly separated. No small ornaments, no engraving, no fine detail on the pieces.

NOT: no arrows, no drawn lines, no dotted paths, no highlighted squares, no beams of light, no magnetic field lines, no motion lines, no letters or numbers, no coordinates around the board, no hands, no king or queen, no cartoon faces, no eyes, no sparkles, no smoke, no photorealism, no thin outlines, no plastic gloss. No text, no lettering, no logo, no watermark, no border outside the ornamental frame.

OUTPUT: square image, at least 1024x1024.
```

---

**Salvează ca:** `attraction.png`, lângă celelalte.

**Verificare**

1. **Pionul e la exact un pătrat de nebun, în jos-dreapta?** Colț la colț, fără
   pătrat între ei. Dacă e mai departe, nu se mai vede că îl atacă.
2. **Turnul e pe cealaltă diagonală, cu două pătrate goale între ei?** Aia e
   linia care se pierde. Cere: *„put the rook three squares diagonally up-right
   from the bishop, with the two squares between them empty"*.
3. **Se numără pătratele?** Tabla trebuie citită ca tablă, nu ca fundal. Dacă
   pătratele se pierd, se pierde toată geometria.
4. **Nebunul se apleacă spre pion și privește înapoi spre turn?** Cele două
   direcții opuse sunt exact dilema lui.
5. **Doar pionul e auriu.** Nebunul și turnul, amândouă întunecate.
