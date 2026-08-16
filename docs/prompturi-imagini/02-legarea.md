# 2. Legarea absolută și relativă → `pin.png`

**Metafora** e scrisă în [`src/data/tactics.ts`](../../src/data/tactics.ts),
cuvânt cu cuvânt:

> Ții o piesă „țintuită" — dacă mută, expune ceva mai valoros din spate.
> Practic, îi pui adversarului o piesă în lanțuri și arunci cheia.

Deci: un **cal negru legat în lanțuri**, lanțul ținut de un **nebun alb-auriu**,
iar în spatele calului — **dama neagră**, cea care s-ar descoperi dacă el ar
mișca. Jos, o cheiță aruncată.

| element | ce spune |
| --- | --- |
| nebunul alb, cu lanțul în mână | *cine leagă* |
| calul negru, înfășurat, țeapăn | *piesa țintuită* |
| dama neagră, exact în spatele lui | *ce se expune dacă mută* |
| cheia căzută jos | *și nu se dezleagă* |

## De ce alinierea contează

Calul și dama trebuie să fie **exact pe aceeași linie** cu nebunul, dama în
spate. Asta e tot mecanismul legării: piesa mică stă în fața celei mari. Dacă
sunt așezate alandala, imaginea arată doar un cal legat, fără să se înțeleagă de
ce nu poate pleca.

## Ca să nu semene cu „Țeapă"

Tactica 6 e vecina periculoasă — descrierea ei o spune singură: *„e furculița
întoarsă pe dos"*. Acolo piesa **valoroasă e în față** și fuge, lăsând prada
descoperită. Aici e invers: piesa mică e în față și **nu poate pleca**.

De aceea aici accentul cade pe **imobilizare** — lanțuri, cheie aruncată,
nemișcare — și nu pe o rază care străpunge. Când ajungem la Țeapă, aceea va avea
mișcare și o linie care trece prin, nu lanțuri.

**Atașează la mesaj DOUĂ imagini:**
1. [`furculita.png`](../../surse-imagini/tactici/furculita.png) — rama, fundalul, finisajul;
2. [`Sacrificii.png`](../../surse-imagini/tactici/Sacrificii.png) — modelul pentru cele două metale, alb și negru.

---

```text
Here are two images you made earlier. Use them as the style reference: the first for the frame, the background and the finish, the second for the two metals — the pale gold of its fallen queen and the dark near-black bronze of its three standing pieces.

KEEP IDENTICAL TO THE REFERENCES:
- Square 1024x1024, filled edge to edge.
- BACKGROUND: the same chessboard pattern of alternating brown squares in low contrast — darker squares #4B3317, lighter squares #7F5425 — covering the whole tile, with the same warm radial glow behind the subject (#63421D) falling off to near-black in the four corners (#171513). The board is only a backdrop: the pieces are NOT placed on its squares and do not line up with them.
- FRAME: the same ornamental border — a thin double line in warm metallic gold (#DEB863) with rounded corners, angular gold corner pieces at the four corners, and one small gold diamond centred on each of the four sides.
- FINISH: the same sculpted, polished, three-dimensional metal — soft rounded bevels, smooth gradients, a gentle sheen, soft drop shadows. Solid Staunton chess pieces, modelled in relief.

THE TWO METALS:
- LIGHT pieces are rich warm gold: highlight #FFD86A rising to #FCCB43 on the brightest edges, mid-tone #E7AD3E, shadows going deep to #8C4A01 and #5A340A. Strong contrast between light and shade — polished metal, never pale matte cream or ivory.
- DARK pieces are near-black bronze: highlight #4A3A1C, mid-tone #241A0A, deep shadow #0E0A04, with a thin warm gold rim light along their edges so their silhouettes stay crisp against the brown board.

THE SCENE — "a piece in chains, and the key thrown away". Three chess pieces and a chain, arranged along one straight line that runs from the lower left to the upper right, filling about 78 percent of the tile:

1. LOWER LEFT: a LIGHT BISHOP, upright and firmly planted, its mitre with the diagonal slit turned up along the line. From its base runs a heavy CHAIN. This is the piece doing the binding.

2. THE CHAIN: thick, heavy links — six or seven of them, large and simple, no fine ironwork. It runs taut from the bishop up to the middle of the tile, where it wraps twice around the body of the next piece and holds it fast. The chain is the same warm gold as the bishop, so it clearly belongs to him.

3. MIDDLE: a DARK KNIGHT, bound. The chain is wrapped around its body and pulled tight. It stands rigidly upright, dead still, its head turned slightly as if straining — but it does not move and cannot. It is noticeably smaller than the piece behind it.

4. BEHIND IT, further up the same line and slightly higher: a DARK QUEEN, tall and clearly the most valuable piece in the tile, standing exactly in line behind the knight. She is untouched and unbound. She is what would be exposed if the knight could step aside.

THE ALIGNMENT IS THE MECHANISM. The bishop, the knight and the queen must sit on one perfectly straight line, in that order, so a viewer sees at once that the small bound piece stands directly in front of the big one. Do not scatter them.

5. LOW IN THE FOREGROUND, off to one side and clearly separate from everything else: a small golden KEY, lying discarded on the ground, tilted at an angle as if it had just been tossed there. It is small, but it should be plainly visible.

READABILITY: this tile is displayed small, so the silhouette carries it — a light shape at the lower left, a thick chain running up to the right, a dark bound shape in the middle, a taller dark crowned shape behind it, and one tiny bright key on the ground. Keep every piece bold and simple. No small ornaments, no engraving, no fine detail, no chessboard squares drawn on the pieces.

NOT: no chess diagram, no board position, no arrows, no beams of light, no ropes, no padlocks, no blood, no letters or numbers, no coordinates, no hands, no king, no cartoon faces, no eyes, no sparkles, no smoke, no photorealism, no thin outlines, no plastic gloss. No text, no lettering, no logo, no watermark, no border outside the ornamental frame.

OUTPUT: square image, at least 1024x1024.
```

---

**Salvează ca:** `pin.png`, lângă celelalte.

**Verificare**

1. **Sunt toate trei pe o linie?** Nebun, cal, damă, în ordinea asta. Dacă dama
   e într-o parte, se pierde tot mecanismul. Cere: *„put the bishop, the knight
   and the queen on one straight line, the queen directly behind the knight"*.
2. **Calul pare imobilizat?** Lanțul strâns, corpul țeapăn. Dacă lanțul doar
   atârnă pe lângă el, nu se vede că e ținut.
3. **Dama e vizibil mai mare decât calul?** Ea e miza; fără diferența de mărime
   nu se înțelege de ce contează.
4. **Se vede cheia?** Mică, dar prezentă — ea e gluma din descrierea tactilei.
5. **Contrastul alb/negru e puternic?** Nebunul și lanțul aurii, calul și dama
   întunecate.
