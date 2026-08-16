# 9. Resurse defensive → `forced-draws.png`

**Metafora:** un **pion** în armură, cu un scut mare înfipt în pământ, singurul
rămas în picioare printre piese răsturnate.

Descrierea din [`src/data/tactics.ts`](../../src/data/tactics.ts) cere ambele
jumătăți ale imaginii:

> Poziția pare pierdută, dar există o singură mutare care te salvează.

Scutul singur ar spune doar „apărare". Piesele căzute din jur spun **„pare
pierdută"** — și abia împreună înseamnă resursă defensivă. Fără dezastru în
jur, nu se vede că e o salvare.

Pionul, nu regele sau dama: partea frumoasă a tacticii e că te scapă piesa de la
care nu te așteptai. Un rege în armură ar arăta ca o fortăreață; un pion cu scut
arată ca o minune.

| element | ce spune |
| --- | --- |
| piesele răsturnate în jur | *poziția pare pierdută* |
| pionul, singurul drept | *o singură mutare* |
| scutul mare, lovit dar întreg | *și ea ține* |

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

THE SUBJECT — "the last one standing". One armoured pawn behind a shield, with the wreckage of the position around it. Together they fill about 74 percent of the tile:

1. DEAD CENTRE, upright: a chess PAWN, small, standing perfectly straight and absolutely still. It wears a simple armoured helmet over its round head — a plain gold helm with a narrow eye slit, no plume, no crest. This is the modest piece that saves everything.

2. In FRONT of the pawn, planted firmly on the ground and slightly overlapping it: a LARGE SHIELD, taller and wider than the pawn itself, so that most of the pawn's body is behind it and only its helmeted head shows above the rim. It is a plain heavy kite shield with a broad raised rim and a smooth face. The shield and the pawn are cast as ONE continuous piece of gold, the way the fork and its chess pieces are one piece in the reference — the shield grows out of the pawn, it is not a separate object leaning against it.

3. The shield's face is BATTERED: two or three deep dents and a long scrape across it, one edge slightly bent. It has clearly taken heavy blows — and it is still whole and still upright. The damage must read as survived, not as breaking: no cracks going through it, no holes, no missing pieces.

4. AROUND them, lying on the ground on both sides: THREE toppled chess pieces — a rook, a bishop and a knight — fallen on their sides, scattered at different angles, one partly behind the shield. They are rendered in a deeper, darker gold than the pawn and shield, and they lie lower in the frame, so the standing pair is clearly the brightest and tallest thing in the tile.

The story must read in one glance: everything around has gone down, and one small piece behind a beaten shield is still on its feet.

READABILITY: this tile is displayed small, so the silhouette carries it — a broad shield shape dead centre with a small helmeted head above it, and low fallen shapes to the left and right. Keep everything bold and simple. No small ornaments, no engraving, no heraldry on the shield, no fine detail, no chessboard squares drawn on the pieces.

NOT: no chess diagram, no board position, no arrows, no swords or spears, no fire, no smoke, no sparks, no debris clouds, no letters or numbers, no coordinates, no hands, no king, no cartoon faces, no eyes, no sparkles, no photorealism, no thin outlines, no plastic gloss. No text, no lettering, no logo, no watermark, no border outside the ornamental frame.

OUTPUT: square image, at least 1024x1024.
```

---

**Salvează ca:** `forced-draws.png`, lângă `furculita.png`.

**Verificare**

1. **Se văd piesele căzute?** Fără ele, imaginea spune doar „apărare", nu
   „salvare". Dacă lipsesc sau sunt prea mici, cere: *„add three clearly visible
   toppled chess pieces lying on the ground around the shield"*.
2. **Scutul e lovit, dar întreg.** Adâncituri și zgârieturi, fără crăpături prin
   el și fără găuri. Un scut spart ar spune că apărarea a cedat.
3. **Pionul stă perfect drept.** El e singurul lucru nemișcat; dacă e și el
   înclinat, se pierde contrastul cu dezastrul din jur.
4. **Scutul e mai mare decât pionul.** Disproporția e gluma: piesa cea mai mică
   ține cel mai mare scut.
5. Aceeași ramă și același fundal ca la furculiță.
