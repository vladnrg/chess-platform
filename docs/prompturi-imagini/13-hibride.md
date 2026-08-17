# 13. Tactici hibride → `hybrid.png`

> **Categoria a fost scoasă din aplicație.** „Tactici hibride" și „Tactici mixte
> bonus" nu mai apar în Cuferele cu tactici; temele lor au intrat în
> [Combinații de tactici](12-combinatii.md), care e acum singura casetă fără
> temă anunțată. Plăcuța nu se mai generează.
>
> Fișierul rămâne fiindcă cele patru încercări de mai jos sunt de ținut minte —
> din a doua a ieșit regula „obiectele se țin de piesa lor" din
> [README](README.md#obiectele-se-țin-de-piesa-lor).

Descrierea din [`src/data/tactics.ts`](../../src/data/tactics.ts):

> Combinații în care **mai multe teme se suprapun**, din mijloc de joc și
> finaluri. Aici se vede **cine doar memorează și cine chiar gândește**.

## Scena: furculița care înghite și apărarea

O furculiță aurie, cu patru dinți, ca aia din [Furculiță și atac
dublu](01-furculita.md). În dinții ei, două capturi — dar **de feluri diferite**:

- pe un dinte, un **turn negru**, ridicat de pe tablă, prins normal;
- pe celălalt dinte, **pionul negru cu armură și scut** de la
  [Resurse defensive](09-resurse-defensive.md) — apărătorul, luat cu tot cu
  apărare. Dintele i-a trecut **prin scut**.

Asta e succesiunea neobișnuită: aceeași mutare face **două lucruri care de obicei
nu se întâmplă împreună** — câștigă material *și* scoate din joc resursa
defensivă care ar fi trebuit să salveze poziția. Una e temă de atac, cealaltă e
temă de apărare, și de obicei se învață separat.

**Scutul lovit, cu adânciturile lui, e tot acolo.** Nu a cedat — a fost ridicat
cu totul. Aia e diferența dintre „am spart apărarea" și „apărarea nici n-a mai
apucat să conteze".

## De unde se ia fiecare bucată

| de la | ce se ia |
| --- | --- |
| [Furculiță și atac dublu](01-furculita.md) | forma furculiței: patru dinți, capturile pe cei doi din margine |
| [Resurse defensive](09-resurse-defensive.md) | pionul cu coif și scutul mare, cu adâncituri și zgârietură |

Astea sunt **singurele două referințe atașate**. Plăcuțele care s-au tot folosit
până acum — descoperirea, sacrificiul — rămân deoparte, ca desenul să pornească
din altă parte.

## O corectură care intră pe furiș

La *Furculiță*, furculița e **întunecată** și piesele prinse în ea sunt **aurii**.
Imaginea aia e făcută înainte de codul culorilor, iar
[README](README.md#codul-culorilor-alb-și-negru) o are deja pe lista de refăcut:
prada ar fi trebuit să fie neagră.

Aici se face invers, cum trebuie: **furculița e aurie — e a noastră** — iar ce
prinde în ea e **negru**. Aceeași formă, culorile pe dos, și dintr-odată are sens
cine pe cine ține.

| element | ce spune |
| --- | --- |
| furculița aurie, cu patru dinți | *o singură mutare* |
| turnul negru, ridicat pe un dinte | *materialul câștigat* |
| pionul cu scut, ridicat pe celălalt | *și apărătorul, luat odată cu el* |
| dintele trecut prin scut | *apărarea n-a apucat să conteze* |

**Atașează la mesaj DOUĂ imagini, în ordinea asta:**
1. [`Furculita.png`](../../surse-imagini/tactici/Furculita.png) — forma furculiței,
   rama, fundalul și felul în care capturile stau pe dinții din margine;
2. [`Resurse defensive.png`](../../surse-imagini/tactici/Resurse%20defensive.png)
   — pionul cu coif și scutul lovit, cu adânciturile și zgârietura lui.

---

```text
Here are two images you made earlier, both from the same set of chess tiles. This new tile is built from the two of them and must look like it was made by the same hand in the same session: identical frame, identical background, identical metals, identical lighting and finish. From the FIRST image take the shape of the FORK. From the SECOND image take the ARMOURED PAWN WITH THE BATTERED SHIELD.

KEEP IDENTICAL TO THE REFERENCES:
- Square 1024x1024, filled edge to edge.
- BACKGROUND: the same chessboard pattern of alternating brown squares in low contrast — darker squares #4B3317, lighter squares #7F5425 — covering the whole tile, with the same warm radial glow behind the subject (#63421D) falling off to near-black in the four corners (#171513). The board is only a backdrop: nothing is placed on its squares and nothing lines up with them. It is flat and seen straight on — no tilt, no perspective, no board edge.
- FRAME: the same ornamental border — a thin double line in warm metallic gold (#DEB863) with rounded corners, angular gold corner pieces at the four corners, and one small gold diamond centred on each of the four sides. Draw all four diamonds COMPLETE and entirely inside the picture, none of them cropped by the edge.
- FINISH: the same sculpted, polished, three-dimensional metal — soft rounded bevels, smooth gradients, a gentle sheen, soft drop shadows.

THE COLOURS ARE SWAPPED FROM THE FIRST IMAGE, AND THIS MATTERS. In that image the fork is dark and the two chess pieces on it are gold. Here it is the other way round:
- The FORK is GOLD: rich warm gold, highlight #FFD86A rising to #FCCB43 on the brightest edges, mid-tone #E7AD3E, shadows going deep to #8C4A01 and #5A340A. Polished metal, never pale cream or ivory.
- EVERYTHING CAUGHT IN IT IS DARK: near-black bronze, highlight #4A3A1C, mid-tone #241A0A, deep shadow #0E0A04, with a thin warm gold rim light along the edges so the silhouettes stay crisp against the brown board.

THE SUBJECT — one gold fork, holding two catches. It stands upright in the middle of the tile, filling about 75 percent of it, exactly like the fork in the first image: a broad flat handle at the bottom widening into a shoulder, and FOUR straight tines rising from it, the two middle ones bare and pointing up at nothing.

ON THE LEFT OUTER TINE: a DARK ROOK, lifted clean off the board and sitting on the point of the tine, the way the rook sits on the fork in the first image. It is upright, whole, and completely helpless — its base is in the air, nothing under it.

ON THE RIGHT OUTER TINE: the ARMOURED PAWN FROM THE SECOND IMAGE, lifted the same way — but now in the DARK metal. Copy it exactly as it is drawn there: a small pawn wearing a plain rounded helmet with a narrow eye slit, standing behind a LARGE kite SHIELD that is taller and wider than the pawn itself, with a broad raised rim, and with the same battle damage on its face — two or three deep dents and one long diagonal scrape. Pawn and shield are one continuous casting, as they are in that image.

THE TINE HAS GONE STRAIGHT THROUGH THE SHIELD. The point of the right outer tine has punched clean through the middle of the shield's face and comes out in front of it, so the pawn and its shield hang on the tine together. Around the hole the metal of the shield is pushed outwards in a small ragged burr. The shield is NOT broken apart, NOT split and NOT in pieces — it is whole, dented, still doing its job, and simply carried off with its owner. The dents and the scrape must stay clearly visible on the dark metal, catching a bright warm highlight on their upper edges.

The two catches sit at the same height, one on each outer tine, balanced left and right, so the tile reads as one move that took both at once.

READABILITY: this tile is displayed small, so the silhouette carries it — a broad gold fork shape standing dead centre with four tines, a squat dark battlemented shape on the tine to the left, and a dark shield shape with a small helmeted head above it on the tine to the right. Keep everything bold and simple. No small ornaments, no engraving, no heraldry on the shield, no fine detail, no chessboard squares drawn on the pieces.

NOT: no third catch, no piece on the two middle tines, no hand holding the fork, no chains, no key, no bolt, no spear separate from the fork, no rope, no net, no sword, no arrows, no beams of light, no rays, no dotted paths, no highlighted or glowing squares, no cracks running through the shield, no shattered pieces, no broken chess pieces, no blood, no fire, no smoke, no motion lines, no letters or numbers, no coordinates, no three-dimensional board, no perspective, no board edge, no queen, no king, no bishop, no knight, no fused or invented chess pieces, no cartoon faces, no eyes, no sparkles, no photorealism, no thin outlines, no plastic gloss. No text, no lettering, no logo, no watermark, no border outside the ornamental frame.

OUTPUT: square image, at least 1024x1024.
```

---

**Salvează ca:** `hybrid.png`, lângă celelalte.

**Verificare**

1. **Furculița e aurie și prada neagră?** Ăsta e testul principal, și e pe dos
   față de imaginea de referință. Dacă a copiat cuminte culorile de acolo,
   cere: *„swap the colours: the fork is gold, everything caught in it is dark"*.
2. **Dintele trece prin scut?** Vârful trebuie să iasă în față, prin mijlocul lui.
   Dacă scutul e doar sprijinit de dinte, se pierde toată ideea.
3. **Scutul e întreg, doar găurit?** Cu adânciturile și zgârietura la locul lor.
   Un scut spart ar spune „apărarea a cedat" — aici apărarea n-a apucat să
   conteze, ceea ce e altceva.
4. **Se mai văd adânciturile pe metal negru?** Pe închis dispar primele. Dacă
   scutul a ieșit neted, cere: *„keep the dents and the scrape, catch a bright
   highlight on their upper edges"*.
5. **Cele două capturi sunt la aceeași înălțime?** Una nu e mai importantă decât
   cealaltă — au fost luate în aceeași mutare.
6. **Dinții din mijloc sunt goi?** Doi dinți, două capturi. Un al treilea lucru
   agățat acolo ar încărca degeaba.
7. **Turnul e ridicat, cu talpa în aer?** Dacă stă pe tablă lângă furculiță, nu
   pare prins.
8. **Cele patru romburi sunt întregi?** Niciunul tăiat de marginea imaginii.

---

## Ce am încercat înainte

Plăcuța asta a luat patru încercări. Le las scrise, fiindcă fiecare a picat din
alt motiv și motivele sunt de ținut minte:

1. **Piesă turnată din două** — corp de turn, mitră de nebun, două raze plecând
   din ea. Spunea *piesă* hibridă, nu *tactici* hibride.
2. **Trei bare de aur** în fața regelui, luate de la
   [Prinderea piesei](07-prinderea-piesei.md). Acolo gratiile **sunt corpul
   turnului**; rupte de turn, nu mai trimit la nimic. De aici a ieșit regula din
   [README](README.md#obiectele-se-țin-de-piesa-lor): obiectele se țin de piesa
   lor.
3. **Rege încolțit de trei lucruri deodată** — o rază, un magnet și propriul lui
   pion. Corectă ca idee, dar trei limbaje într-o plăcuță care se vede la 64 de
   pixeli.
4. **Șahul perpetuu**, cu fiecare piesă desenată de două ori. Imaginea era bună,
   dar tema e remiza forțată — adică plăcuța 9, nu asta.

Ce le lega: ori spuneau altceva, ori spuneau prea multe. Varianta de acum spune
**un singur lucru**, și îl spune cu obiecte care există deja în serie.
