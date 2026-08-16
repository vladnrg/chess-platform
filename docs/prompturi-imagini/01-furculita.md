# 1. Furculiță și atac dublu → `fork.png`

**Metafora:** o furculiță de masă, cu două piese de șah prinse în dinții ei.
O furculiță, două prăzi — exact ce înseamnă tactica.

> **Starea:** furculița e deja neagră, cum trebuie. Rămâne de corectat **tenta
> pieselor albe**: au ieșit crem mat, în loc de aurul cald al seriei.

---

## Corecție — aurul pieselor deschise

Turnul și dama au ieșit **fildeș**, nu aur. Diferența e măsurabilă, comparând cu
`Atac prin descoperire.png`, unde a ieșit cum trebuie:

| | saturație | umbra cea mai închisă |
| --- | --- | --- |
| Atac prin descoperire | **0,73–0,99** | `#8C4A01` |
| Furculiță, acum | 0,27–0,50 | `#EFC978` |

Problema nu e doar că sunt prea albe. E că **umbrele rămân tot deschise** — fără
interval tonal, metalul arată ca plasticul. Aurul are nevoie de contrast mare
între lumină și umbră ca să pară metal.

Vina e a paletei pe care o scrisesem eu: cerea `#FFF0C0 / #E4C071 / #A07C30`,
adică exact fildeș. ChatGPT a ascultat-o cuminte.

**Atașează la mesaj DOUĂ imagini:**
1. [`furculita.png`](../../surse-imagini/tactici/Furculita.png) — cea de corectat;
2. [`Atac prin descoperire.png`](../../surse-imagini/tactici/Atac%20prin%20descoperire.png)
   — modelul de aur.

Cu a doua atașată, „aurul cald" nu mai e o descriere, ci un exemplu de copiat.

```text
Here are two images you made earlier. The first is the fork tile, which needs one correction. The second is the discovered-attack tile, which is the correct look — use its metal as the model.

In the FIRST image, the two light chess pieces — the rook on the left tine and the queen on the right tine — came out the wrong material. They are pale matte cream, almost ivory. They should be RICH WARM GOLD, exactly like the bishop and the pawn in the SECOND image.

Recolour those two pieces so that their metal matches the light pieces in the second image:
- lit surfaces around #FFD86A rising to #FCCB43 on the brightest edges;
- mid-tones around #E7AD3E;
- shadowed sides going deep, down to #8C4A01 and #5A340A in the darkest folds.

THE RANGE IS THE POINT. The problem now is not only that they are too pale, it is that their shadows are almost as light as their highlights, which makes them look like matte plastic. Real gold needs a wide gap between light and dark: bright, almost white-hot highlights on the edges facing the light, and deep warm brown shadows underneath the collars, inside the crown and along the shaded side of each piece. Give them strong specular highlights and clear reflected warmth, exactly as the bishop in the second image has.

DO NOT CHANGE ANYTHING ELSE:
- the dark, near-black fork stays exactly as it is — same metal, same colour, same thin gold rim light;
- the ornamental gold frame, its corner pieces and its four diamonds;
- the brown chessboard background, its pattern and the warm glow behind the subject;
- the composition: the position, size, angle and shape of the fork, the rook and the queen;
- the lighting direction and the drop shadow;
- the square format and the framing.

This is a recolour of two objects in an existing image, not a new illustration. If anything moves, resizes or changes shape, it is wrong.

Keep the clean, definite break where each piece meets the tine it sits on: dark fork below, gold piece above, no gradient between them.

Keep the same square size, at least 1024x1024.
```

---

**Salvează ca:** peste poza actuală.

**Verificare**

1. **Pune-le una lângă alta cu `Atac prin descoperire.png`.** Piesele deschise
   trebuie să pară din același metal. Dacă cele de la furculiță sunt mai palide,
   cere: *„make them richer and deeper, match the bishop in the second image"*.
2. **Au umbre adânci?** Sub gulere, în interiorul coroanei, pe partea ferită de
   lumină. Fără ele rămân plate, oricât de aurii ar fi la culoare.
3. **Furculița a rămas neagră**, neschimbată.
4. **Compoziția e neatinsă?** Nimic nu s-a mutat, nimic nu și-a schimbat mărimea.

---

## Promptul original

*Păstrat pentru referință — cel de sus e cel care se folosește acum.*

```text
A square emblem tile in the style of a polished game-menu icon, matching the attached reference exactly in format, framing and finish.

THE TILE:
- Square 1024x1024, filled edge to edge.
- BACKGROUND: a chessboard pattern of alternating brown squares in low contrast — darker squares #4B3317, lighter squares #7F5425 — covering the entire tile. Behind the object sits a warm radial glow, brightest just behind it (#63421D) and falling off to near-black in the four corners (#171513).
- FRAME: an ornamental border inset about 4 percent from the edge — a thin double line in warm metallic gold (#DEB863), with angular L-shaped gold corner brackets at the four corners and one small solid gold diamond (rhombus) centred on each of the four sides.
- RENDERING: the subject is centred, occupying about 62 percent of the tile, modelled as smooth moulded relief in gold — soft rounded bevels, gradients running from a bright highlight (#FAC339) on the upper left, through mid-tones (#6F4D15), to deep shadow (#5A340A) on the lower right. Gently glossy but never chrome or mirror. A soft drop shadow behind it.

THE SUBJECT — "the fork": a sturdy dinner fork, seen from the front, standing upright with its tines pointing up and its handle going down. It has four tines. Impaled on the two outer tines, one on each, sits a chess piece: a ROOK on the left tine and a QUEEN on the right tine. The two pieces are the same gold as the fork but slightly darker, so they read as separate objects sitting on it. The two middle tines stay empty, which makes the two captured pieces read as a deliberate pair.

The whole thing must be BOLD and simple: this tile is displayed at 64 pixels wide in the app, so the silhouette of the fork and the two pieces on top of it is what carries the meaning. No thin details, no small ornaments on the pieces, no engraving on the handle.

READABILITY: at a glance the viewer should see one object catching two things at once. Keep the fork wide enough and the two pieces large enough that this reads instantly when the image is scaled down.

NOT: no chessboard diagram, no arrows, no letters or coordinates, no cartoon faces, no blood or violence, no photorealistic cutlery, no thin outlines, no plastic gloss. No text, no lettering, no logo, no watermark, no border outside the ornamental frame described above.

OUTPUT: square image, at least 1024x1024.
```

---

**Salvează ca:** `public/tactics/tipuri/fork.png`
(verifică în folder că nu e `fork.png.png` — Windows ascunde extensiile)

**Verificare:** privește-o mică. Dacă nu se mai vede că sunt **două** piese
prinse, cere furculiță mai lată și piese mai mari.
