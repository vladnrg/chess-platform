# 3. Atac prin descoperire și șah dublu → `discovered.png`

Trei variante. **C** e recomandarea: arată poziția reală, verificată cu motorul.
**A** și **B** sunt metaforele încercate înainte, păstrate ca alternativă.

**Atașează la mesaj:** [`public/openings/colle-system.png`](../../public/openings/colle-system.png)

---

## Varianta C — poziția reală, cu săgeți  ★

Nebunul alb de pe **f3** vede dama neagră de pe **c6**, dar propriul pion de pe
**e4** îi stă în cale. Pionul înaintează un pătrat, **e4–e5**, și dă șah regelui
negru de pe **f6** — iar prin plecarea lui, diagonala f3–c6 se deschide și
nebunul ia dama.

```
    a  b  c  d  e  f  g  h
  +------------------------+
8 | .  .  .  .  .  .  .  . |
7 | .  .  .  .  .  .  .  . |
6 | .  .  q  .  .  k  .  . |
5 | .  .  .  .  .  .  .  . |
4 | .  .  .  P  P  .  .  . |
3 | .  .  .  .  .  B  .  . |
2 | .  .  .  .  .  .  .  . |
1 | .  .  .  .  .  .  K  . |
  +------------------------+
```

**Verificat cu chess.js**, nu compus din cap: poziția e legală, albul e la
mutare, negrul nu e deja în șah. După `1.e5+` negrul **nu poate lua pionul** —
îl apără pionul de pe d4 — deci are numai mutări de rege, șapte la număr. După
oricare dintre ele, `2.Bxc6` ia dama. Am verificat toate șapte.

Pionul de pe **d4** nu e decor: fără el, regele ar mânca pur și simplu pionul
care dă șah și tactica s-ar face praf.

```text
A square chess diagram tile, framed in the style of the attached reference — same ornamental gold frame, same warm palette, same polished finish.

THE TILE:
- Square 1024x1024, filled edge to edge.
- FRAME: an ornamental border inset about 4 percent from the edge — a thin double line in warm metallic gold (#DEB863), with angular L-shaped gold corner brackets at the four corners and one small solid gold diamond (rhombus) centred on each of the four sides.
- INSIDE THE FRAME: a complete 8x8 chessboard, filling the whole area within the frame, seen straight from above — a flat top-down view, no perspective, no tilt, no 3D board. Dark squares #4B3317, light squares #7F5425. No file letters, no rank numbers, no coordinates of any kind.

THE POSITION — place exactly these six pieces and nothing else. Ranks are numbered 1 at the bottom and 8 at the top; files run a to h from left to right.
- WHITE BISHOP on f3
- WHITE PAWN on e4
- WHITE PAWN on d4
- WHITE KING on g1
- BLACK QUEEN on c6
- BLACK KING on f6

Every other square is empty. Do not add any extra pieces.

THE PIECES: classic Staunton silhouettes, seen from above but drawn as recognisable upright shapes, moulded in relief. White pieces are bright polished gold — highlight #FAC339, mid-tone #6F4D15, shadow #5A340A. Black pieces are near-black (#1C160E) with a thin warm gold rim light, so both sides read clearly against the brown squares. The pieces must be large and bold, filling most of their squares.

THE TWO ARROWS — these carry the whole meaning and must be the most visible thing in the tile:
- ARROW 1, bright green (#4ade80): a thick straight arrow from the centre of e4 to the centre of e5, pointing up. This is the pawn stepping forward and giving check.
- ARROW 2, bright coral red (#FB7185): a thick straight arrow running along the diagonal from the centre of f3, through e4 and d5, ending with its head on c6, on top of the black queen. This is the bishop's line, opened by the pawn leaving, capturing the queen.

Both arrows are opaque, clean-edged, with solid triangular heads, drawn ON TOP of the board and pieces. Arrow 2 must clearly pass over the squares e4 and d5 and end exactly on the black queen. The two arrows must not be the same colour and must not blur into each other.

Mark the black king on f6 with a soft red glow around its square, to show it is the one in check.

BOLD AND SIMPLE: this tile may be displayed small, so the two arrows, the six pieces and the board grid are all that should be there. No move notation, no captions, no legend, no annotations, no decorative flourishes, no shadows cast outside the board.

NOT: no letters, no numbers, no text of any kind, no watermark, no logo, no extra pieces, no 3D perspective, no tilted board, no photorealism, no cartoon faces. No border outside the ornamental frame described above.

OUTPUT: square image, at least 1024x1024.
```

---

## Varianta A — harponul care ocolește *(alternativă)*

Un harpon plecat de la un nebun, pe traiectorie curbată, ocolește calul din
față și agață dama de dincolo de el.

Nu e mecanica exactă — în șah linia se deschide fiindcă piesa din față *pleacă*,
nu fiindcă lovitura o ocolește. Dar spune ce contează: treci peste piesa mică și
iei prada mare.

```text
A square emblem tile in the style of a polished game-menu icon, matching the attached reference exactly in format, framing and finish.

THE TILE:
- Square 1024x1024, filled edge to edge.
- BACKGROUND: a chessboard pattern of alternating brown squares in low contrast — darker squares #4B3317, lighter squares #7F5425 — covering the entire tile. Behind the subject sits a warm radial glow, brightest just behind it (#63421D) and falling off to near-black in the four corners (#171513).
- FRAME: an ornamental border inset about 4 percent from the edge — a thin double line in warm metallic gold (#DEB863), with angular L-shaped gold corner brackets at the four corners and one small solid gold diamond (rhombus) centred on each of the four sides.
- RENDERING: everything is modelled as smooth moulded relief in gold — soft rounded bevels, gradients running from a bright highlight (#FAC339) on the upper left, through mid-tones (#6F4D15), to deep shadow (#5A340A) on the lower right. Gently glossy but never chrome or mirror. Soft drop shadows.

THE SUBJECT — "the curving harpoon". Three things, read left to right, filling about 74 percent of the tile:

1. On the LEFT, low: a chess BISHOP, small, firmly planted. It is the one that fired.

2. From the top of the bishop, a HARPOON flies on a strongly CURVED path — a clear, generous arc that rises up, passes high OVER the middle of the tile, then dives back down to the right. The harpoon is a thick straight shaft with a barbed spear head at its leading end, trailing a taut line behind it that follows the same arc all the way back to the bishop. Shaft and line are the brightest elements in the tile, near-white at their edges.

3. In the MIDDLE, directly under the highest part of the arc, stands a chess KNIGHT — the same height as the bishop, untouched, with clear empty space between the top of its head and the curve passing above it. The gap must be obvious: the whole joke is that the harpoon went around it.

4. On the RIGHT: a chess QUEEN, noticeably LARGER than both the bishop and the knight, tipping backwards as the barbed head hooks into her. She is the prize.

The arc must be unmistakably curved, not a straight diagonal — a viewer should see the harpoon deliberately swerve over the knight to reach the queen behind it.

The whole thing must be BOLD and simple: this tile is displayed at 64 pixels wide in the app, so what carries the meaning is the silhouette — three pieces along the bottom and one bright curve sweeping over the middle one. No thin details, no rope texture, no ornament on the pieces, no small barbs.

NOT: no chessboard diagram, no arrows with heads, no letters or coordinates, no king anywhere, no cartoon faces, no blood, no water or fishing scenery, no photorealism, no thin outlines, no plastic gloss. No text, no lettering, no logo, no watermark, no border outside the ornamental frame described above.

OUTPUT: square image, at least 1024x1024.
```

---

## Varianta B — mecanica reală, ca metaforă *(alternativă)*

Ce se întâmplă de fapt: nebunul stă în spate, calul îi stă în linie, calul
**sare din drum**, iar diagonala nebunului — până atunci blocată — ajunge la
damă.

Diferența față de A, în două cuvinte: aici raza e **dreaptă**, iar calul e **în
aer**. Ăsta e tot adevărul tacticii — nu lovitura ocolește piesa, ci piesa se dă
la o parte.

Săritura în „L" a calului e și ea corectă, nu ornament: exact felul lui de a
pleca din linie face ca mutarea să fie una singură, nu două.

```text
A square emblem tile in the style of a polished game-menu icon, matching the attached reference exactly in format, framing and finish.

THE TILE:
- Square 1024x1024, filled edge to edge.
- BACKGROUND: a chessboard pattern of alternating brown squares in low contrast — darker squares #4B3317, lighter squares #7F5425 — covering the entire tile. Behind the subject sits a warm radial glow, brightest just behind it (#63421D) and falling off to near-black in the four corners (#171513).
- FRAME: an ornamental border inset about 4 percent from the edge — a thin double line in warm metallic gold (#DEB863), with angular L-shaped gold corner brackets at the four corners and one small solid gold diamond (rhombus) centred on each of the four sides.
- RENDERING: everything is modelled as smooth moulded relief in gold — soft rounded bevels, gradients running from a bright highlight (#FAC339) on the upper left, through mid-tones (#6F4D15), to deep shadow (#5A340A) on the lower right. Gently glossy but never chrome or mirror. Soft drop shadows.

THE SUBJECT — "the line that opens". A diagonal composition running from the lower left to the upper right, filling about 76 percent of the tile:

1. LOWER LEFT: a chess BISHOP, planted on the ground, facing up and to the right.

2. From the bishop's tip, a single STRAIGHT BEAM of light shoots diagonally up to the right, in one clean unbroken line, all the way to the upper right corner area. It is wedge-shaped, widest at the bishop and tapering as it travels, and it is the brightest element in the tile — near-white at its edges. It must be perfectly straight: no curve, no bend, no wobble.

3. UPPER RIGHT, where the beam lands: a chess QUEEN, noticeably LARGER than the other pieces, tipping backwards as the beam strikes her.

4. THE KNIGHT — the key of the whole image: a chess KNIGHT caught IN MID-AIR, clearly airborne and tilted, above the middle of the beam and slightly to the left of it. It has just leapt out of the beam's path. Underneath it, on the beam's line, there is a visibly EMPTY spot — a shallow round socket or a plain flat base with nothing on it — showing where the knight used to stand a moment ago.

The knight must read as jumping AWAY from the line, not as being hit by it: it is above the beam, in the air, leaning outward, with clear space between it and the light.

The story must be readable in one glance: the knight was standing on the line, it jumped, and now the bishop's beam runs clean through the gap it left and reaches the queen.

The whole thing must be BOLD and simple: this tile is displayed at 64 pixels wide in the app, so what carries the meaning is the silhouette — one bright straight diagonal, a small piece airborne above it, a big piece toppling at the end. No thin details, no motion lines, no ornament on the pieces.

NOT: no chessboard diagram, no arrows with heads, no letters or coordinates, no king anywhere, no cartoon faces, no dust clouds or particles, no photorealism, no thin outlines, no plastic gloss. No text, no lettering, no logo, no watermark, no border outside the ornamental frame described above.

OUTPUT: square image, at least 1024x1024.
```

---

**Salvează ca:** `public/tactics/tipuri/discovered.png`
(verifică în folder că nu e `discovered.png.png`)

**Verificare**

- La **C**: numără piesele — trebuie să fie exact șase. Verifică pe rând că
  fiecare stă unde trebuie: nebunul pe f3, pionii pe d4 și e4, regele alb pe g1,
  dama neagră pe c6, regele negru pe f6. Săgeata roșie trebuie să se termine
  **pe damă**, nu lângă ea.
- La **A**: trebuie să se vadă curba trecând pe deasupra calului, cu spațiu
  limpede între ele. Dacă pare că lovește calul sau că merge drept, cere arc mai
  înalt.
- La **B**: calul trebuie să pară că **sare**, nu că e lovit. Dacă stă pe
  pământ sau atinge raza, cere-l mai sus, mai înclinat și mai departe de linie.
