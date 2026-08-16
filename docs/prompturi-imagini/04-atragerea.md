# 4. Atragerea și devierea → `attraction.png`

**Metafora:** un **magnet** auriu care trage un cal negru spre el — iar nebunul
pe care calul îl păzea rămâne singur, cu locul din fața lui gol.

Magnetul nu e ales la întâmplare: e chiar iconița pe care aplicația o folosește
deja pentru categoria asta ([`tactic-visuals.ts`](../../src/lib/tactic-visuals.ts),
`attraction: Magnet`). Plăcuța continuă un simbol care există, nu inventează
altul.

Descrierea din [`src/data/tactics.ts`](../../src/data/tactics.ts) cere ambele
jumătăți ale tacticii, iar imaginea trebuie să le arate pe amândouă:

> Forțezi o piesă adversă fix unde vrei tu **sau o tragi departe de ce apăra**.
> Un mic „vino-ncoace" care se termină prost pentru ea.

| element | ce spune |
| --- | --- |
| magnetul auriu, cu polii spre dreapta | *atragerea — „vino-ncoace"* |
| calul negru, tras, cu talpa derapând | *piesa care nu se poate împotrivi* |
| golul din fața nebunului | *devierea — de acolo a plecat* |
| nebunul negru, singur | *ce nu mai e apărat* |

**Atragerea fără gol e doar o glumă cu un magnet.** Locul rămas liber e cel care
transformă imaginea din „o piesă e trasă" în „o piesă e trasă *de undeva*" — și
abia asta e tactica.

**Atașează la mesaj DOUĂ imagini:**
1. [`furculita.png`](../../surse-imagini/tactici/furculita.png) — rama, fundalul, finisajul;
2. [`Sacrificii.png`](../../surse-imagini/tactici/Sacrificii.png) — modelul pentru cele două metale.

---

```text
Here are two images you made earlier. Use them as the style reference: the first for the frame, the background and the finish, the second for the two metals — the pale gold of its fallen queen and the dark near-black bronze of its three standing pieces.

KEEP IDENTICAL TO THE REFERENCES:
- Square 1024x1024, filled edge to edge.
- BACKGROUND: the same chessboard pattern of alternating brown squares in low contrast — darker squares #4B3317, lighter squares #7F5425 — covering the whole tile, with the same warm radial glow behind the subject (#63421D) falling off to near-black in the four corners (#171513). The board is only a backdrop: the pieces are NOT placed on its squares and do not line up with them.
- FRAME: the same ornamental border — a thin double line in warm metallic gold (#DEB863) with rounded corners, angular gold corner pieces at the four corners, and one small gold diamond centred on each of the four sides.
- FINISH: the same sculpted, polished, three-dimensional metal — soft rounded bevels, smooth gradients, a gentle sheen, soft drop shadows. Solid Staunton chess pieces, modelled in relief.

THE TWO METALS:
- LIGHT objects are rich warm gold: highlight #FFD86A rising to #FCCB43 on the brightest edges, mid-tone #E7AD3E, shadows going deep to #8C4A01 and #5A340A. Strong contrast between light and shade — polished metal, never pale matte cream or ivory.
- DARK pieces are near-black bronze: highlight #4A3A1C, mid-tone #241A0A, deep shadow #0E0A04, with a thin warm gold rim light along their edges so their silhouettes stay crisp against the brown board.

THE SCENE — "come here". Read from left to right across the tile, filling about 78 percent of it:

1. LEFT: a large HORSESHOE MAGNET in polished gold, standing on its curved back with its two square pole faces turned to the RIGHT, towards the rest of the scene. Make it read unmistakably as a magnet: a thick U-shape with two flat, blunt pole tips, each tip marked with two or three simple raised bands around it. Bold and heavy, no fine detail.

2. MIDDLE: a DARK KNIGHT, being dragged towards the magnet. It leans hard to the left, out of balance, its head pulled forward and its base skidding — the rear edge of its base lifted off the ground, the front edge scraping. It is clearly not moving of its own will: it is being pulled.

3. BEHIND THE KNIGHT, to the RIGHT: a plain empty patch of ground where it used to stand. Show it as a shallow round socket or a plain flat base with nothing on it, clearly unoccupied. This is the post the knight has been pulled away from, and it must be plainly visible.

4. FAR RIGHT, standing alone just beyond that empty spot: a DARK BISHOP, upright, still, and completely unprotected. There is open, empty space between it and the knight — nothing stands in front of it any more. This is what the knight was guarding.

The story must read in one glance, right to left: the bishop stands unguarded, the spot in front of it is empty, and the piece that used to stand there is being hauled off to the magnet.

READABILITY: this tile is displayed small, so the silhouette carries it — a bold U-shape on the left, a dark shape leaning towards it, a gap, and one dark upright shape alone on the right. Keep everything large and simple. No small ornaments, no engraving, no fine detail, no chessboard squares drawn on the pieces.

NOT: no chess diagram, no board position, no arrows, no beams of light, no magnetic field lines, no motion lines, no sparks, no chains, no ropes, no letters or numbers, no coordinates, no hands, no king or queen, no cartoon faces, no eyes, no sparkles, no photorealism, no thin outlines, no plastic gloss. No text, no lettering, no logo, no watermark, no border outside the ornamental frame.

OUTPUT: square image, at least 1024x1024.
```

---

**Salvează ca:** `attraction.png`, lângă celelalte.

**Verificare**

1. **Se vede locul gol?** Fără el, imaginea spune doar „un magnet trage un cal".
   Cu el, spune „calul a fost tras **de undeva**" — adică tactica. Cere: *„show a
   clearly empty base where the knight used to stand, between it and the
   bishop"*.
2. **Calul pare tras, nu mergând?** Aplecat, dezechilibrat, cu talpa derapând.
   Dacă stă drept, arată că se plimbă spre magnet din proprie inițiativă.
3. **Magnetul se recunoaște?** Formă de U groasă, doi poli plați cu benzi. În
   aur, fără roșu și albastru, forma e singurul lucru care îl identifică.
4. **Nebunul e singur?** Spațiu liber în jurul lui, nimic în față.
5. **Contrastul alb/negru e puternic?** Magnetul auriu, cele două piese
   întunecate.
