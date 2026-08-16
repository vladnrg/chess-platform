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

## Distanțele se numără acum în pătrate

Asta e schimbarea față de încercarea trecută, și rezolvă toate trei problemele
deodată. Până acum piesele pluteau peste fundal și cereau distanțele „în
cuvinte" — *aproape*, *departe* — iar cuvintele au fost interpretate greșit:
turnul a plecat în colț, pionul s-a lipit de nebun.

**Așezate pe pătrate, distanțele nu mai sunt de interpretat.** Un pătrat până la
pion, trei până la turn — exact ce spune poziția de mai sus:

| de la nebun | încotro | cât |
| --- | --- | --- |
| pionul | jos-dreapta | **un pătrat**, colț la colț |
| turnul | sus-dreapta | **trei pătrate**, cu drumul gol |

Și diagonalele vin gratis: pătratele care se ating în colț *sunt* diagonala. Nu
mai trebuie cerut un unghi de 45°, doar numărate pătratele.

Fundalul rămâne exact ăla plat, văzut din față, din „Atac prin descoperire" —
doar că piesele stau pe pătratele lui în loc să plutească peste ele.

| element | ce spune |
| --- | --- |
| pionul mic, cu magnetul, la un pătrat | *cine cheamă — și cât de puțin costă* |
| nebunul negru, ridicat de pe pătrat, aplecat spre el | *e obligat să vină* |
| turnul negru, la trei pătrate pe diagonală | *ce lasă în urmă* |

## Cine stă pe tablă și cine nu

Turnul și pionul stau **așezate**, tălpile pe pătratele lor, nemișcate. Doar
**nebunul e ridicat** — puțin, cât să se vadă că nu mai atinge pătratul: talpa
desprinsă, umbra căzută dedesubt, corpul tras spre magnet.

De-asta merge: dacă toate trei ar pluti, ridicarea nu s-ar vedea. Ridicarea
înseamnă ceva doar când celelalte stau pe loc.

**Atașează la mesaj DOUĂ imagini, în ordinea asta:**
1. **plăcuța cu magnet primită acum** — aia se corectează. Rama, fundalul,
   metalele, magnetul și modelarea pieselor sunt deja bune;
2. [`Atac prin descoperire.png`](../../surse-imagini/tactici/Atac%20prin%20descoperire.png)
   — de acolo se ia fundalul plat, dacă cel din prima s-a pierdut pe drum.

---

```text
Here are two images. The FIRST is a tile you made a moment ago — a dark bishop, a gold pawn with a magnet, and a dark rook on a flat patterned background. It is almost right and I want it corrected, not replaced. The SECOND is the discovered-attack tile from the same set, for the flat background.

KEEP EVERYTHING FROM THE FIRST IMAGE EXACTLY AS IT IS:
- the ornamental gold frame, its corner pieces and its four diamonds;
- the FLAT chessboard background: alternating brown squares in low contrast, darker #4B3317 and lighter #7F5425, with a warm radial glow behind the pieces (#63421D) falling off to near-black in the corners (#171513), seen straight on, exactly as in both attached images;
- the two metals: the PAWN in rich warm gold (highlight #FFD86A, mid-tone #E7AD3E, shadows #8C4A01 and #5A340A), the BISHOP and the ROOK in near-black bronze (highlight #4A3A1C, mid-tone #241A0A, deep shadow #0E0A04) with a thin warm gold rim light;
- the way the three pieces are sculpted and lit — same proportions, same bevels, same sheen, same light from the upper left;
- the big gold horseshoe magnet fused to the front of the pawn, at its present size and brightness. It stays the brightest object in the tile.

The background stays FLAT and seen straight on. It is a printed pattern, not a real board: no tilt, no perspective, no vanishing point, no thickness, no board edge, no horizon. The squares stay the same size all over the tile, corner to corner.

WHAT MUST CHANGE — only the placement. In the first image the three pieces are scattered: the rook drifted far off into the corner, the pawn is jammed against the bishop, and the pawn is not on a clean diagonal from it. Fix that by standing the pieces ON THE SQUARES of the flat background, so the distances are counted in squares instead of guessed.

Read the background as a grid of 8 columns and 8 rows. Number the columns 1 to 8 from the left and the rows 1 to 8 from the bottom. Place the pieces like this:

- the BISHOP on the square in column 3, row 3;
- the PAWN on the square in column 4, row 2 — one square from the bishop, down and to the right, the two squares touching at a single corner;
- the ROOK on the square in column 6, row 6 — three squares from the bishop, up and to the right, along the line of squares that touch corner to corner.

Each piece is centred left-to-right on its own square and its base sits on that square, matching its width to the square. Because the squares themselves make the diagonals, the bishop and the rook end up on one exact diagonal with the pawn on the opposite one — do not adjust this by eye afterwards, just put each piece on the square it is given.

The three squares of open board between the bishop and the rook stay completely empty: nothing stands on them, nothing crosses them.

There is a clear gap of open board between the pawn and the bishop. The magnet's two poles reach out towards the bishop across that gap and stop short — they must NOT touch it and must not overlap it. The pull crosses empty space.

THE ROOK AND THE PAWN ARE STANDING ON THE BOARD. Both sit squarely and flat on their squares, upright, still, each with its own small contact shadow on the square underneath it. Neither is tilted, neither is lifted.

ONLY THE BISHOP IS LIFTED. The magnet has pulled it up off its square: its base has come away from the board by a small amount — about a third of a square — and hangs in the air, tipped over towards the pawn and its magnet, down and to the right, off balance. Under it, on its empty square, lies its shadow, so it is obvious the piece is no longer touching the board. Its head is TURNED BACK over its shoulder, up towards the rook. Two opposite directions in one figure: the body dragged one way, the gaze held the other.

Nothing else anywhere. Three pieces and one magnet, on the flat patterned background.

NOT: no three-dimensional board, no perspective, no tilted board, no board edge, no board thickness, no arrows, no drawn lines, no dotted paths, no highlighted or glowing squares, no beams of light, no magnetic field lines, no motion lines, no letters or numbers, no coordinates, no hands, no king or queen, no cartoon faces, no eyes, no sparkles, no smoke, no photorealism, no thin outlines, no plastic gloss. No text, no lettering, no logo, no watermark, no border outside the ornamental frame.

OUTPUT: square image, at least 1024x1024.
```

---

**Salvează ca:** `attraction.png`, lângă celelalte.

## Ce s-a stricat de fiecare dată

**Prima oară** cerusem „tabla să fie o tablă adevărată, văzută în unghi, cu
piesele pe pătrate". Au ieșit tabla 3D cu perspectivă, piese redesenate în alt
stil ca să stea pe ea și un magnet micuț. Plăcuța ieșise din familie.

**A doua oară** am corectat prea mult: piesele pluteau peste fundal, iar
distanțele le ceream în cuvinte. Rama, metalele și magnetul au ieșit perfect,
dar așezarea nu — fiindcă „aproape" și „departe" nu sunt măsuri.

**Acum** e mijlocul: fundal plat, dar pătratele lui folosite ca sistem de
măsură. Un pătrat până la pion, trei până la turn. Fără unghi de cerut, fără
distanțe de ghicit — și, în plus, poziția devine chiar poziția de pe tablă.

**Verificare**

1. **Numără pătratele.** De la nebun la turn: trei, pe diagonală. De la nebun la
   pion: unul. Dacă turnul e iar în colț, cere: *„put the rook exactly three
   squares diagonally up-right from the bishop, on the flat grid"*.
2. **Se ating colțurile pătratelor?** Nebun, pion — colț la colț. Nebun, turn —
   trei pătrate care se ating în colț, drumul gol.
3. **Turnul și pionul stau pe tablă?** Tălpile pe pătrat, drepte, cu umbră mică
   dedesubt. Dacă plutesc, se pierde contrastul.
4. **Doar nebunul e ridicat?** Talpa desprinsă cam o treime de pătrat, umbra
   căzută pe pătratul gol de sub el, corpul tras spre magnet.
5. **Magnetul lasă un spațiu între el și nebun?** Polii se opresc înainte, nu-l
   ating. Atracția trece prin gol.
6. **Fundalul e tot plat?** Fără unghi, fără muchie de tablă, pătrate egale
   peste tot. Pus lângă „Atac prin descoperire", trebuie să pară aceeași lume.
7. **Doar pionul e auriu.** Nebunul și turnul, amândouă întunecate.
