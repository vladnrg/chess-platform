# 3. Atac prin descoperire și șah dublu → `discovered.png`

**Metafora** vine din chiar descrierea tactilei din
[`src/data/tactics.ts`](../../src/data/tactics.ts):

> E trădarea perfectă: una se dă la o parte, cealaltă lovește.

Deci o cortină de teatru trasă în lături, iar prin deschizătura ei ies **două**
raze care lovesc un rege. Cortina spune „se dă la o parte", razele spun
„lovește", iar faptul că sunt două acoperă și șahul dublu din titlu.

**Atașează la mesaj:** [`public/openings/colle-system.png`](../../public/openings/colle-system.png)
— și, dacă a ieșit bine, și `fork.png`. Seria se leagă mai bine când vede ce a
desenat înainte.

---

```text
A square emblem tile in the style of a polished game-menu icon, matching the attached reference exactly in format, framing and finish.

THE TILE:
- Square 1024x1024, filled edge to edge.
- BACKGROUND: a chessboard pattern of alternating brown squares in low contrast — darker squares #4B3317, lighter squares #7F5425 — covering the entire tile. Behind the subject sits a warm radial glow, brightest just behind it (#63421D) and falling off to near-black in the four corners (#171513).
- FRAME: an ornamental border inset about 4 percent from the edge — a thin double line in warm metallic gold (#DEB863), with angular L-shaped gold corner brackets at the four corners and one small solid gold diamond (rhombus) centred on each of the four sides.
- RENDERING: the subject is centred, occupying about 62 percent of the tile, modelled as smooth moulded relief in gold — soft rounded bevels, gradients running from a bright highlight (#FAC339) on the upper left, through mid-tones (#6F4D15), to deep shadow (#5A340A) on the lower right. Gently glossy but never chrome or mirror. A soft drop shadow behind it.

THE SUBJECT — "the reveal": a heavy theatre curtain, drawn apart at the centre. One curtain half hangs on the left, the other on the right, each gathered and tied back, with only three or four broad folds each — bold and simple, no fine drapery.

Through the gap between them burst TWO straight beams, side by side and slightly diverging, aimed down and to the left. They are the brightest element in the tile (#FAC339 rising to near-white at their edges), clean-edged and wedge-shaped, like two blades of light.

Where the two beams land, at the lower left, a small chess KING is tipping over, caught leaning back. It is rendered in the same gold but darker, so it reads as the thing being struck rather than part of the light.

There must be exactly TWO beams, clearly separate from each other — the doubling is the point of this tile, not a decorative flourish.

The whole thing must be BOLD and simple: this tile is displayed at 64 pixels wide in the app, so what carries the meaning is the silhouette — two dark masses on the sides, a bright gap between them, two beams cutting out of it. No thin details, no tassels, no ornament on the curtains, no pattern in the fabric.

NOT: no chessboard diagram, no arrows with heads, no letters or coordinates, no cartoon faces, no photorealistic fabric, no smoke or particles, no thin outlines, no plastic gloss. No text, no lettering, no logo, no watermark, no border outside the ornamental frame described above.

OUTPUT: square image, at least 1024x1024.
```

---

**Salvează ca:** `public/tactics/tipuri/discovered.png`
(verifică în folder că nu e `discovered.png.png`)

**Verificare:** privește-o mică. Trebuie să se vadă că sunt **două** raze, nu
una groasă. Dacă se contopesc, cere-i să le depărteze și să lase mai mult
întuneric între ele.
