# 5. Îndepărtarea apărătorului → `remove-defender.png`

**Metafora** e scrisă deja în descrierea tactilei din
[`src/data/tactics.ts`](../../src/data/tactics.ts):

> Scoți un bolț — și se dărâmă toată construcția.

Deci: un **turn** care se prăbușește, pentru că i-a fost scos de sub bază un
**bolț în formă de pion** — apărătorul. Turnul e alegerea bună tocmai fiindcă e
literalmente o construcție; când se înclină, se vede imediat că a rămas fără
sprijin.

Gluma e aceeași ca la furculiță: piesa nu stă *lângă* obiect, ci **este**
obiectul. Acolo doi dinți sunt turnul și dama; aici bolțul e pionul.

| element | ce spune |
| --- | --- |
| bolțul-pion, tras afară pe jumătate | *apărătorul e scos din joc* |
| gaura rămasă goală în soclu | *acolo ținea* |
| turnul înclinat, cu o crăpătură la bază | *construcția cedează* |

**Atașează la mesaj:** [`furculita.png`](../../surse-imagini/tactici/furculita.png)
— rama, fundalul și aurul se copiază de acolo.

---

```text
Use the attached image as the exact style reference. This is another tile in the same set, and it must look like it was made by the same hand, in the same session: identical frame, identical background, identical gold, identical lighting and finish.

KEEP IDENTICAL TO THE REFERENCE:
- Square 1024x1024, filled edge to edge.
- BACKGROUND: the same chessboard pattern of alternating brown squares in low contrast — darker squares #4B3317, lighter squares #7F5425 — covering the whole tile, with the same warm radial glow behind the subject (#63421D) falling off to near-black in the four corners (#171513). The board is only a backdrop: the subject is not placed on its squares and does not line up with them.
- FRAME: the same ornamental border — a thin double line in warm metallic gold (#DEB863) with rounded corners, angular gold corner pieces at the four corners, and one small gold diamond centred on each of the four sides.
- RENDERING: the same sculpted polished gold — bright highlights (#FAC339), mid-tones (#6F4D15), deep shadow (#5A340A), soft rounded bevels, a gentle sheen, soft drop shadows. One continuous piece of gold, exactly as the fork and its two chess pieces are one continuous piece of gold in the reference.

THE SUBJECT — "pull the bolt and the tower falls". Two chess pieces fused into one gold sculpture, filling about 70 percent of the tile:

1. On the RIGHT, tall: a chess ROOK, large — a castle tower with battlements on top. It is TILTING, leaning clearly to the right, mid-collapse. At its base, on the side the bolt was pulled from, a wide crack has opened and the lowest course of the tower has begun to slide.

2. On the LEFT, at the bottom: a BOLT — a thick threaded shank, like a machine bolt — whose head is shaped exactly like a chess PAWN. It has been pulled halfway out of a round socket in the tower's stone base and hangs there, half in and half out, tipped down and to the left.

3. Between them, clearly visible: the round SOCKET the bolt came out of, now a dark empty hole in the base of the tower, where the bolt's threads no longer reach.

The story must read in one glance: the pawn-headed bolt has been pulled out, its hole is empty, and the tower above it is going over.

The pawn head on the bolt must be unmistakably a chess pawn — round head, collar, flared body — sitting where a bolt head would be. It is not a pawn standing next to a bolt: it IS the head of the bolt, one continuous gold object.

READABILITY: this tile is displayed small, so the silhouette carries it — a big leaning tower on the right, a bolt sticking out low on the left, a gap between them. Keep both large and simple. No small ornaments, no engraving, no fine detail, no chessboard squares drawn on the pieces.

NOT: no chess diagram, no board position, no arrows, no beams of light, no letters or numbers, no coordinates, no hands, no tools, no king or queen, no cartoon faces, no dust or debris clouds, no sparkles, no photorealism, no thin outlines, no plastic gloss. No text, no lettering, no logo, no watermark, no border outside the ornamental frame.

OUTPUT: square image, at least 1024x1024.
```

---

**Salvează ca:** `remove-defender.png`, lângă `furculita.png`.

**Verificare**

1. **Turnul se înclină?** Dacă stă drept, imaginea nu spune că se prăbușește —
   spune doar că lângă el e un șurub. Cere: *„tilt the rook further, it must be
   clearly falling"*.
2. **Se vede gaura goală?** Fără ea nu se înțelege de unde a ieșit bolțul.
3. **Capul bolțului e un pion?** Dacă e un cap hexagonal obișnuit, s-a pierdut
   toată gluma. Cere: *„the bolt head must be shaped as a chess pawn"*.
4. Aceeași ramă și același fundal ca la furculiță.
