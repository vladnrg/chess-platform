# 3. Atac prin descoperire și șah dublu → `discovered.png`

Două variante. **A** e amuzantă și arată clar prada; **B** e mecanica reală a
tacticii. Alege una, nu le combina.

**Atașează la mesaj:** [`public/openings/colle-system.png`](../../public/openings/colle-system.png)
— și, dacă a ieșit bine, și `fork.png`. Seria se leagă mai bine când vede ce a
desenat înainte.

---

## Varianta A — harponul care ocolește

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

## Varianta B — mecanica reală

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

- La **A**: trebuie să se vadă curba trecând pe deasupra calului, cu spațiu
  limpede între ele. Dacă pare că lovește calul sau că merge drept, cere arc mai
  înalt.
- La **B**: calul trebuie să pară că **sare**, nu că e lovit. Dacă stă pe
  pământ sau atinge raza, cere-l mai sus, mai înclinat și mai departe de linie.
