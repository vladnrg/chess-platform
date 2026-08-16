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

**Atașează la mesaj DOUĂ imagini, în ordinea asta:**
1. [`Atac prin descoperire.png`](../../surse-imagini/tactici/Atac%20prin%20descoperire.png)
   — **nu furculița.** Acolo sunt tot trei piese, pe fundal plat, cu exact
   modelarea și lumina care trebuie copiate;
2. [`Sacrificii.png`](../../surse-imagini/tactici/Sacrificii.png) — cele două metale.

---

```text
Here are two images you made earlier. The FIRST is the discovered-attack tile — copy its look exactly: the same flat decorative background, the same ornamental frame, the same way the chess pieces are modelled and lit, the same three-piece arrangement floating on that background. The SECOND is the sacrifice tile — take its two metals from there, the pale gold and the dark near-black bronze.

COPY FROM THE FIRST IMAGE, WITHOUT CHANGING ANYTHING:
- Square 1024x1024, filled edge to edge.
- The BACKGROUND is a FLAT decorative chessboard pattern seen straight on — alternating brown squares in low contrast, darker #4B3317 and lighter #7F5425, with a warm radial glow behind the pieces (#63421D) falling off to near-black in the corners (#171513). It is a flat backdrop behind the pieces, exactly as in the first image. It is NOT a real board in perspective: no tilt, no vanishing point, no three-dimensional board, no thickness, no viewing angle. The pieces float in front of it and do not stand on its squares.
- The FRAME: the same ornamental border — a thin double line in warm metallic gold (#DEB863) with rounded corners, angular gold corner pieces at the four corners, and one small gold diamond centred on each of the four sides.
- The PIECES are modelled exactly as in the first image: solid sculpted Staunton figures in relief, seen from the side, with the same proportions, the same soft rounded bevels, the same polished sheen, the same lighting from the upper left and the same soft drop shadows.

THE TWO METALS:
- The PAWN is LIGHT: rich warm gold, highlight #FFD86A rising to #FCCB43 on the brightest edges, mid-tone #E7AD3E, shadows going deep to #8C4A01 and #5A340A — exactly like the bishop in the first image.
- The BISHOP and the ROOK are DARK, and the same metal as each other: near-black bronze, highlight #4A3A1C, mid-tone #241A0A, deep shadow #0E0A04, with a thin warm gold rim light along their edges. They belong to the same side, and that must be obvious at a glance.

THE ARRANGEMENT — three pieces, placed like this:

1. LOWER LEFT OF CENTRE: a DARK BISHOP, the largest piece in the tile.

2. CLOSE TO IT, DOWN AND TO THE RIGHT: a LIGHT PAWN, small — about half the bishop's height. It sits near the bishop, at the bishop's lower right, close enough that the two almost touch. It stands calmly upright.

3. FAR UP AND TO THE RIGHT: a DARK ROOK, alone, with plenty of empty background between it and the bishop.

THE ALIGNMENT MATTERS MORE THAN ANYTHING ELSE. The bishop and the rook must sit on one clean straight diagonal running at exactly 45 degrees, up and to the right — draw an imaginary line through the centre of the bishop's head and the centre of the rook's crown, and that line must be a perfect 45-degree diagonal, not almost. Nothing stands between them; the space along that line is completely empty. The pawn sits on the OTHER 45-degree diagonal, going down and to the right from the bishop, so the two lines leave the bishop at right angles to each other and open towards the right like an arrowhead.

THE MAGNET — make it big and impossible to miss. Fixed to the front of the pawn and turned towards the bishop is a HORSESHOE MAGNET in bright polished gold, drawn large: as tall as the pawn's own body, a thick U-shape with two broad flat pole faces aimed straight at the bishop, each pole marked with two or three bold raised bands. It is the brightest object in the whole tile. It is fused to the pawn as one piece of metal, but it must be large and clear enough to be recognised as a magnet at a glance, even when the picture is shrunk down.

THE BISHOP IS BEING PULLED. It leans over towards the pawn and its magnet, down and to the right, off balance, the far edge of its base lifting. Its head is TURNED BACK over its shoulder, up towards the rook. Two opposite directions in one figure: the body dragged one way, the gaze held the other.

Nothing else anywhere. Three pieces and one magnet, on the flat patterned background.

NOT: no three-dimensional board, no perspective, no tilted board, no board edge, no squares under the pieces, no arrows, no drawn lines, no dotted paths, no highlighted squares, no beams of light, no magnetic field lines, no motion lines, no letters or numbers, no coordinates, no hands, no king or queen, no cartoon faces, no eyes, no sparkles, no smoke, no photorealism, no thin outlines, no plastic gloss. No text, no lettering, no logo, no watermark, no border outside the ornamental frame.

OUTPUT: square image, at least 1024x1024.
```

---

**Salvează ca:** `attraction.png`, lângă celelalte.

## Ce s-a stricat data trecută

Cerusem „tabla să fie o tablă adevărată, văzută în unghi, cu piesele pe pătrate".
De acolo au venit toate trei problemele: tabla a devenit 3D cu perspectivă,
piesele au fost redesenate în alt stil ca să stea pe ea, iar magnetul s-a făcut
mic. Plăcuța a ieșit din familie.

Promptul de acum **interzice explicit perspectiva** și cere copiat fundalul plat
din „Atac prin descoperire". Geometria se ține doar din poziționare — merge, așa
cum a mers și acolo cu raza pe diagonală.

**Verificare**

1. **Fundalul e plat?** Fără unghi, fără muchie de tablă, fără pătrate sub
   piese. Pus lângă „Atac prin descoperire", trebuie să pară aceeași lume.
2. **Nebunul și turnul sunt pe o diagonală de fix 45°?** Ăsta e testul greu.
   Ține o riglă pe ecran, din capul nebunului spre coroana turnului. Dacă e
   „aproape", cere: *„the bishop and the rook must be on one exact 45-degree
   diagonal, nothing between them"*.
3. **Magnetul se vede de la distanță?** Trebuie să fie cât corpul pionului și
   cel mai luminos lucru din imagine. Dacă e o bucățică, cere-l mai mare.
4. **Piesele arată ca în „Atac prin descoperire"?** Aceleași proporții, aceeași
   lumină. Dacă par alt set, atașează poza din nou și cere-i s-o copieze.
5. **Nebunul se apleacă spre pion și privește înapoi spre turn?**
6. **Doar pionul e auriu.** Nebunul și turnul, amândouă întunecate.
