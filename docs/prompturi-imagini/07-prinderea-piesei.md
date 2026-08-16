# 7. Prinderea piesei → `trapped.png`

**Metafora:** un **turn** al cărui corp e o colivie cu gratii, iar înăuntru stă
închisă o **damă**.

Puna e dublă, și de-aia merge: turnul e piesa care de obicei prinde, dar e și
literalmente un turn — locul unde ești închis. Piesa care capturează *este*
temnița. Aceeași fuziune ca la furculiță, unde dinții sunt turnul și dama.

Descrierea din [`src/data/tactics.ts`](../../src/data/tactics.ts) spune de ce e
important golul din jur:

> Toată tabla, și ea tot n-are unde fugi.

Deci colivia stă singură în mijloc, cu spațiu liber în toate părțile. Nu e
încolțită la margine — e liberă tabla, și tot nu se poate ieși. Asta doare.

| element | ce spune |
| --- | --- |
| gratiile groase ale turnului | *nu se trece* |
| dama înăuntru, dreaptă, cu coroana lipită de tavan | *piesa cea mai valoroasă, prinsă* |
| lacătul de pe față | *închis, nu doar înconjurat* |
| tabla goală în jur | *are unde fugi, dar nu poate* |

**Atașează la mesaj:** [`furculita.png`](../../surse-imagini/tactici/furculita.png)
— rama, fundalul și aurul se copiază de acolo.

---

```text
Use the attached image as the exact style reference. This is another tile in the same set, and it must look like it was made by the same hand, in the same session: identical frame, identical background, identical gold, identical lighting and finish.

KEEP IDENTICAL TO THE REFERENCE:
- Square 1024x1024, filled edge to edge.
- BACKGROUND: the same chessboard pattern of alternating brown squares in low contrast — darker squares #4B3317, lighter squares #7F5425 — covering the whole tile, with the same warm radial glow behind the subject (#63421D) falling off to near-black in the four corners (#171513). The board is only a backdrop: the subject is not placed on its squares and does not line up with them.
- FRAME: the same ornamental border — a thin double line in warm metallic gold (#DEB863) with rounded corners, angular gold corner pieces at the four corners, and one small gold diamond centred on each of the four sides.
- RENDERING: the same sculpted polished gold — bright highlights (#FAC339), mid-tones (#6F4D15), deep shadow (#5A340A), soft rounded bevels, a gentle sheen, a soft drop shadow. One continuous piece of gold, exactly as the fork and its two chess pieces are one continuous piece of gold in the reference.

THE SUBJECT — "the tower is the prison". One fused gold sculpture, standing alone dead centre of the tile and filling about 62 percent of it:

1. A chess ROOK, large, seen from the front and standing upright — but its cylindrical body is a CAGE. Instead of a solid stone wall, five or six THICK vertical bars run from its base up to its crown, with clear dark gaps between them. The rook keeps everything else that makes it a rook: the flared foot at the bottom, the moulded ring above it, and the square battlements on top, which now form the cage's roof.

2. Inside the cage, clearly visible between the bars: a chess QUEEN, standing upright and quite still. She is tall enough that the points of her crown almost touch the underside of the battlements, and wide enough that she nearly fills the cage — she does not fit anywhere else, there is no room to move. Render her in a slightly deeper, darker gold than the bars so she reads as a separate piece behind them, not as part of the tower.

3. On the front of the cage, across the middle bars: a heavy gold PADLOCK, closed, hanging from a stout hasp. It is small but unmistakable.

4. AROUND the whole thing: nothing at all. Empty board on every side, generous space, no other pieces, no walls, no corner. The cage is not cornered or hemmed in — it stands out in the open, and that is the point: the board is wide open and the queen still cannot leave.

The bars must be thick and few, with wide dark gaps between them, so the cage reads instantly at small size. The queen must be visible through those gaps, not hidden behind a dense grille.

READABILITY: this tile is displayed small, so the silhouette carries it — a battlemented tower shape with dark vertical slots down its body and a crowned shape standing inside. Keep it bold and simple. No small ornaments, no engraving, no fine detail, no chessboard squares drawn on the pieces, no decorative ironwork on the bars.

NOT: no chess diagram, no board position, no arrows, no beams of light, no letters or numbers, no coordinates, no hands, no chains, no keys, no ropes or nets, no king, no cartoon faces, no sad expressions, no sparkles, no photorealism, no thin outlines, no plastic gloss. No text, no lettering, no logo, no watermark, no border outside the ornamental frame.

OUTPUT: square image, at least 1024x1024.
```

---

**Salvează ca:** `trapped.png`, lângă `furculita.png`.

**Verificare**

1. **Se vede dama prin gratii?** Dacă gratiile sunt prea dese sau prea subțiri,
   iese un turn cu dungi și nu se mai înțelege că e cineva înăuntru. Cere:
   *„fewer, thicker bars with wider dark gaps between them"*.
2. **Turnul rămâne turn?** Trebuie să-și păstreze crenelurile de sus și talpa
   evazată. Fără ele e o simplă colivie, și se pierde puna.
3. **E gol în jur?** Fără alte piese, fără colț, fără ziduri. Golul spune că
   tabla e liberă și tot nu se poate ieși.
4. **Dama umple colivia.** Dacă rămâne loc în jurul ei, arată ca și cum ar
   încăpea să se miște — exact opusul tacticii.
5. Aceeași ramă și același fundal ca la furculiță.
