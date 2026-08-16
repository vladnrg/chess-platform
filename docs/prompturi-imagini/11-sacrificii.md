# 11. Sacrificii → `sacrifice.png`

**Scena:** dama cade, luată de un pion. Din ea se desprinde o picătură de sânge.
Iar dincolo de ea, regele rămâne singur, cu drumul deschis.

Descrierea din [`src/data/tactics.ts`](../../src/data/tactics.ts) numește chiar
piesa:

> Nu orice damă dăruită e o capodoperă.

Trei lucruri trebuie să se vadă, în ordinea asta:

| element | ce spune |
| --- | --- |
| dama, mare, căzând | *ce dai* |
| pionul de sub ea, mic | *cui — și cât de puțin valorează* |
| regele singur, cu spațiu gol în față | *de ce a meritat* |

Diferența de mărime dintre damă și pion **este** sacrificiul. Dacă cele două
piese arată la fel de mari, imaginea e doar o captură oarecare.

## Picătura

E singurul element care nu e auriu din toată seria — un roșu adânc, aproape
rubiniu. Merită să fie o excepție tocmai aici: e singura tactică în care dai
ceva cu adevărat, iar accentul de culoare face plăcuța să se distingă imediat
între celelalte treisprezece.

Una singură. Două ar arăta a violență, nu a jertfă.

**Atașează la mesaj:** [`furculita.png`](../../surse-imagini/tactici/furculita.png)
— rama, fundalul și aurul se copiază de acolo.

---

```text
Use the attached image as the exact style reference. This is another tile in the same set, and it must look like it was made by the same hand, in the same session: identical frame, identical background, identical gold, identical lighting and finish.

KEEP IDENTICAL TO THE REFERENCE:
- Square 1024x1024, filled edge to edge.
- BACKGROUND: the same chessboard pattern of alternating brown squares in low contrast — darker squares #4B3317, lighter squares #7F5425 — covering the whole tile, with the same warm radial glow behind the subject (#63421D) falling off to near-black in the four corners (#171513). The board is only a backdrop: the pieces are NOT placed on its squares and do not line up with them.
- FRAME: the same ornamental border — a thin double line in warm metallic gold (#DEB863) with rounded corners, angular gold corner pieces at the four corners, and one small gold diamond centred on each of the four sides.
- RENDERING: the same sculpted polished gold — bright highlights (#FAC339), mid-tones (#6F4D15), deep shadow (#5A340A), soft rounded bevels, a gentle sheen, soft drop shadows. Solid three-dimensional gold Staunton chess pieces, exactly like the rook and queen in the reference.

THE SCENE — the queen is given up, and the road to the king opens. Three chess pieces and one drop, filling about 76 percent of the tile:

1. LEFT OF CENTRE: a chess QUEEN, large and richly modelled, TOPPLING — tilted far over to the left, her crown swinging down, caught in the moment of falling. She is the biggest piece in the tile.

2. Directly BENEATH her, standing straight on its base: a chess PAWN, small and plain, the piece that has just taken her. The size difference must be obvious and almost comic — the pawn should be roughly a third of the queen's height. That contrast is the whole point of this tile: something enormous has been handed to something tiny.

3. THE DROP: a single drop of deep ruby-red blood, about to fall from the lowest point of the toppling queen, hanging just clear of her. It is the ONLY thing in the entire image that is not gold — a rich dark crimson with one small bright highlight, like a polished garnet. Exactly one drop. It must be small but instantly noticeable against all the gold around it.

4. RIGHT, standing apart: a chess KING, alone and upright, leaning very slightly back. Between the falling queen and the king there is a WIDE OPEN EMPTY LANE — a clear corridor of untouched background, with nothing standing in it at all. No pieces, no shapes, no shields. The king has nothing left in front of him.

The story must read in one glance, left to right: the great piece is going down, a small piece took her, and the way to the king is now clear.

READABILITY: this tile is displayed small, so the silhouette carries it — a big crowned shape falling on the left, a tiny shape beneath it, a lone upright shape on the right, and clear dark space between the two groups. Keep everything bold and simple. No small ornaments, no engraving, no fine detail, no chessboard squares drawn on the pieces.

NOT: no chess diagram, no board position, no arrows, no beams of light, no swords, no wounds or cuts on the pieces, no pools or splashes of blood, no more than one drop, no letters or numbers, no coordinates, no hands, no cartoon faces, no eyes, no sparkles, no smoke, no photorealism, no thin outlines, no plastic gloss. No text, no lettering, no logo, no watermark, no border outside the ornamental frame.

OUTPUT: square image, at least 1024x1024.
```

---

**Salvează ca:** `sacrifice.png`, lângă `furculita.png`.

**Verificare**

1. **Cât de mic e pionul?** Trebuie să fie vizibil de vreo trei ori mai scund
   decât dama. Dacă seamănă ca mărime, se pierde ideea de sacrificiu — arată ca
   un schimb obișnuit. Cere: *„make the pawn much smaller, about a third of the
   queen's height"*.
2. **O singură picătură, roșie.** Dacă apar mai multe, sau bălți, sau răni pe
   piese, imaginea trece de la jertfă la măcel. Cere: *„exactly one drop, no
   splashes, no wounds"*.
3. **E gol între damă și rege?** Coridorul liber e motivul pentru care merită
   sacrificiul. Dacă e ceva în el, nu se mai înțelege ce ai câștigat.
4. **Regele stă drept și singur.** Nu căzut, nu în șah — doar descoperit.
5. Aceeași ramă și același fundal ca la furculiță.
