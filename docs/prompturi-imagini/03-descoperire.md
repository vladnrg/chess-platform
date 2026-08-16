# 3. Atac prin descoperire și șah dublu → `discovered.png`

**Scena:** un pion tocmai a pășit într-o parte, iar raza nebunului din spatele
lui — până atunci blocată — trece prin locul rămas gol și lovește un turn.

> **Starea:** imaginea există, dar a fost generată înainte de
> [codul culorilor](README.md#codul-culorilor-alb-și-negru) — totul e din același
> aur. Se corectează cu promptul de mai jos, nu se generează din nou.

---

## Corecție — culorile

**Turnul devine negru.** El e ținta: piesa adversă lovită de raza care s-a
deschis. Nebunul care trage și pionul care s-a dat la o parte rămân deschise —
sunt ale noastre, ele au făcut mutarea.

Așa se citește și tactica, nu doar culorile: două piese albe lucrează împreună,
una neagră plătește.

**Atașează la mesaj:** poza actuală,
[`Atac prin descoperire.png`](../../surse-imagini/tactici/Atac%20prin%20descoperire.png).

```text
Here is an image you made earlier. Change one thing only: the metal the rook is made of. Everything else in the picture must stay exactly as it is.

DO NOT CHANGE, in any way:
- the ornamental gold frame, its corner pieces and its four diamonds;
- the brown chessboard background, its pattern, and the warm glow;
- the composition: the position, size, angle and shape of all three chess pieces;
- the beam of light — its path, its length, its width, its brightness and its warm colour;
- the bishop in the lower left and the pawn in the middle right, which keep their present pale gold exactly as it is;
- the lighting direction, the highlights, the shadows and the drop shadows;
- the square format and the framing.

This is a recolour of one object in the existing image, not a new illustration. If anything moves, resizes or changes shape, it is wrong.

THE ROOK — the piece in the UPPER RIGHT, the one tipped over at an angle with the beam of light striking it — becomes DARK: a near-black bronze, with highlight #4A3A1C, mid-tone #241A0A and deep shadow #0E0A04. Keep a thin warm gold rim light along its edges so its silhouette stays crisp against the brown board behind it. It must read instantly as a black chess piece would on a real board — clearly the dark side.

It keeps exactly the shape, the size, the tilt and the position it already has. Only its material changes.

Where the beam of light meets the rook, the beam itself stays bright and warm as it is now, and it should throw a warm glow onto the dark metal at the point of impact — so it is still obvious that the light is hitting this piece.

The bishop and the pawn stay pale and bright, as the light side: highlight #FFF0C0, mid-tone #E4C071, shadow #A07C30. The contrast between them and the dark rook must be strong and immediate.

Keep the same square size, at least 1024x1024.
```

---

**Salvează ca:** peste poza actuală.

**Verificare**

1. **Doar turnul s-a schimbat?** Pune-le una lângă alta. Nebunul, pionul, raza,
   rama și fundalul trebuie să fie identice.
2. **Raza a rămas luminoasă acolo unde atinge turnul?** Dacă s-a stins pe metalul
   închis, se pierde legătura dintre nebun și țintă. Cere: *„keep the beam bright
   where it touches the rook, and add a warm glow at the point of impact"*.
3. **Contrastul e puternic?** Turnul trebuie citit ca „piesă neagră", nu ca aur
   mai închis.
4. **Turnul a rămas înclinat la fel?** Poziția și unghiul nu se schimbă.

---

## Promptul original

*Păstrat pentru referință — corecția de sus e cea care se folosește acum.*

Trei piese, o singură rază. Nu e diagramă: piesele nu stau pe pătrate, sunt
sculptate în aur ca furculița. Dar povestea trebuie să se citească — cine s-a
dat la o parte, cine trage, pe cine.

Ce spune fiecare element:

| element | ce spune |
| --- | --- |
| pionul înclinat, cu talpa ridicată | *tocmai s-a mișcat* |
| golul dintre nebun și turn, prin care trece raza | *aici stătea* |
| raza dreaptă, de la nebun la turn | *linia care s-a deschis* |
| turnul care se răstoarnă | *prada* |

**Atașează la mesaj:** [`furculita.png`](../../surse-imagini/tactici/furculita.png)
— rama, fundalul și aurul se copiază de acolo.

---

```text
Use the attached image as the exact style reference. This is the second tile in the same set, and it must look like it was made by the same hand, in the same session: identical frame, identical background, identical gold, identical lighting and finish.

KEEP IDENTICAL TO THE REFERENCE:
- Square 1024x1024, filled edge to edge.
- BACKGROUND: the same chessboard pattern of alternating brown squares in low contrast — darker squares #4B3317, lighter squares #7F5425 — covering the whole tile, with the same warm radial glow behind the subject (#63421D) falling off to near-black in the four corners (#171513). The board is only a backdrop: the pieces are NOT placed on its squares and do not have to line up with them.
- FRAME: the same ornamental border — a thin double line in warm metallic gold (#DEB863) with rounded corners, angular gold corner pieces at the four corners, and one small gold diamond centred on each of the four sides.
- RENDERING: the same sculpted polished gold — bright highlights (#FAC339), mid-tones (#6F4D15), deep shadow (#5A340A), soft rounded bevels, a gentle sheen, soft drop shadows. Chess pieces modelled as solid three-dimensional gold Staunton figures, exactly like the rook and queen in the reference.

THE SCENE — a pawn steps aside and uncovers the bishop's attack on a rook. Three gold chess pieces and one beam of light, arranged along a diagonal running from the lower left to the upper right, together filling about 74 percent of the tile:

1. LOWER LEFT: a BISHOP, large, standing firmly, its mitre with the diagonal slit turned up and to the right. This is the piece that was hidden behind the pawn.

2. From the bishop's mitre, one single straight BEAM of warm light shoots up and to the right, in a clean unbroken line. It is wedge-shaped, brightest at the bishop and softening as it travels, near-white at its edges — the brightest thing in the tile. Perfectly straight: no curve, no bend.

3. MIDDLE, right beside the beam: a PAWN, smaller than the other two pieces, caught in mid-step. It leans clearly away from the beam, its base tilted up off the ground as if it had just pushed off sideways. It is positioned just outside the beam, close enough that the viewer sees it has only this instant vacated that spot. The beam passes cleanly through the empty space next to it, without touching it.

4. UPPER RIGHT, where the beam lands: a ROOK, large, tipping over backwards, struck by the light. It is the target.

The story must read in one glance: the small piece hopped out of the way, and the light behind it now runs straight through the gap into the big piece at the far end.

READABILITY: this tile is displayed small, so the silhouette carries it — a big piece at the lower left, a bright straight line across the middle, a small piece leaning off that line, a big piece toppling at the upper right. Keep all three pieces large and simple. No small ornaments, no engraving, no fine detail, no chessboard squares drawn on the pieces.

NOT: no chess diagram, no board position, no arrows or arrowheads, no letters or numbers, no coordinates, no king anywhere, no second beam, no cartoon faces, no sparkles or particles, no smoke, no motion lines, no photorealism, no thin outlines, no plastic gloss. No text, no lettering, no logo, no watermark, no border outside the ornamental frame.

OUTPUT: square image, at least 1024x1024.
```

---

**Salvează ca:** `discovered.png`, lângă `furculita.png`.

**Verificare**

1. **Pionul e lângă rază, nu pe ea.** Trebuie să se vadă gol între el și lumină.
   Dacă raza îl atinge, imaginea spune „nebunul l-a luat pe pion" — altă
   poveste. Cere: *„move the pawn further off the beam, leave clear empty space
   between them"*.
2. **Pionul pare că se mișcă?** Înclinat, cu talpa ridicată. Dacă stă drept și
   cuminte, nu se înțelege că tocmai a plecat de acolo.
3. **O singură rază.** Dacă apar două, se confundă cu altă tactică.
4. **Raza e dreaptă**, de la nebun până la turn, fără să se curbeze.
5. Aceeași ramă și același fundal ca la furculiță.

---

*Încercări abandonate, cu motivul: cortina cu două raze (nu arăta ce câștigi);
harponul pe traiectorie curbată (frumos, dar ocolirea nu e mecanica tacticii);
diagrama cu poziția reală f3/e4/d4 (corectă șahistic, dar din alt film decât
furculița); capacul în formă de pion ridicat de pe nebun (prea abstract — a ieșit
un clopot care plutește, iar cele două raze nu spuneau nimic). Se recuperează din
istoricul git.*
