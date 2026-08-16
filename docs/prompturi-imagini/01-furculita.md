# 1. Furculiță și atac dublu → `fork.png`

**Metafora:** o furculiță de masă, cu două piese de șah prinse în dinții ei.
O furculiță, două prăzi — exact ce înseamnă tactica.

> **Starea:** imaginea există, dar a fost generată înainte de
> [codul culorilor](README.md#codul-culorilor-alb-și-negru) — totul e din același
> aur. Se corectează cu promptul de mai jos, nu se generează din nou.

---

## Corecție — culorile

Furculița devine **neagră**, cele două piese prinse în ea rămân **deschise**.
Adică: negrul prinde turnul și dama albului.

### Dacă vrei invers

În seria de până acum, „noi" suntem albul — la *Sacrificii*, dama care se dă e
albă, regele advers e negru. Ca să rămână așa și aici, furculița ar trebui să fie
**deschisă** și cele două prăzi **negre**.

E o singură propoziție de schimbat în prompt: interschimbă cele două paragrafe
care încep cu `THE FORK ITSELF` și `THE TWO CAPTURED PIECES`. Nimic altceva.

**Atașează la mesaj:** poza actuală, [`furculita.png`](../../surse-imagini/tactici/furculita.png).

```text
Here is an image you made earlier. Change one thing only: the metal the fork is made of. Everything else in the picture must stay exactly as it is.

DO NOT CHANGE, in any way:
- the ornamental gold frame, its corner pieces and its four diamonds;
- the brown chessboard background, its pattern, and the warm glow behind the subject;
- the composition: the position, size, angle and shape of the fork and of the two chess pieces on its outer tines;
- the lighting direction, the highlights, the shadows and the drop shadow;
- the square format and the framing.

This is a recolour of the existing image, not a new illustration. If anything moves, resizes or changes shape, it is wrong.

THE FORK ITSELF — its handle, its neck and all four of its tines — becomes DARK: a near-black bronze, with highlight #4A3A1C, mid-tone #241A0A and deep shadow #0E0A04. Keep a thin warm gold rim light along its edges so that its silhouette stays crisp against the brown board behind it. It must read instantly as a black chess piece would on a real board — clearly the dark side.

THE TWO CAPTURED PIECES — the rook on the left tine and the queen on the right tine — stay PALE and BRIGHT, as the light side: highlight #FFF0C0, mid-tone #E4C071, shadow #A07C30. They keep exactly the shapes and positions they already have.

Where each piece meets the tine it sits on, the change of metal should be a clean, definite break — dark below, pale above — not a gradient or a fade between the two.

The contrast between the dark fork and the two pale pieces must be strong and immediate: a viewer must never wonder which side is which.

Keep the same square size, at least 1024x1024.
```

---

**Salvează ca:** `fork.png`, peste cea de acum.

**Verificare**

1. **Compoziția e neatinsă?** Pune-le una lângă alta. Furculița și piesele
   trebuie să fie în exact aceleași locuri, la aceeași mărime. Dacă s-a mișcat
   ceva, cere din nou: *„this is a recolour only, do not move or redraw
   anything"*.
2. **Rama și fundalul sunt identice?** Alea nu au voie să se schimbe deloc.
3. **Se vede net unde se termină negrul?** Trecerea de la dinte la piesă
   trebuie să fie tăiată clar, nu topită.
4. **Contrastul e puternic?** Furculița trebuie citită ca „piesă neagră", nu ca
   aur mai închis.

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
