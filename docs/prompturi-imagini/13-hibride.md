# 13. Tactici hibride → `hybrid.png`

**Scena: șahul perpetuu.** O damă aurie și un rege negru, prinși într-un du-te-vino
din care nu iese nimeni. Fiecare apare în **două locuri deodată** — unul solid,
unul rămas în urmă ca o dâră — și se vede că a doua poziție e prima, iar prima e
a doua.

> **De verificat cu tine:** categoria din aplicație se cheamă „Tactici hibride"
> (*mai multe teme se suprapun, din mijloc de joc și finaluri*), iar șahul
> perpetuu e altceva — e remiza forțată, adică tema plăcuței 9,
> [Resurse defensive](09-resurse-defensive.md). Imaginea e mult mai concludentă,
> așa că am construit-o; dacă vrei, o mutăm pe `forced-draws.png` și îi căutăm
> altceva plăcuței 13.

## Poziția, verificată cu motorul

Două poziții care se schimbă între ele la nesfârșit:

```
      A                        B
    f  g  h                  f  g  h
  +---------+              +---------+
8 | r  .  k |            8 | r  k  . |
7 | .  .  . |            7 | .  .  . |
6 | .  .  Q |            6 | .  Q  . |
  +---------+              +---------+
```

- **A:** rege negru h8, damă albă h6. Dama dă șah pe coloana h.
- **B:** rege negru g8, damă albă g6. Dama dă șah pe coloana g.

Rulat prin chess.js, și ăsta e lucrul care merită spus:

> **În fiecare dintre cele două poziții, negrul are exact o mutare legală. Una
> singură.** În A doar `Kg8`, în B doar `Kh8`. După `Qh6+ Kg8 Qg6+ Kh8`, poziția
> de pe tablă e **identică** cu cea de la început.

Regele nu alege nimic. Merge unde e împins, și ajunge de unde a plecat. Asta e
tot ce trebuie să spună imaginea.

Turnul negru de pe f8 — cel care îi taie ieșirea prin f8 — și regele alb, undeva
departe, rămân în afara desenului, ca la toate plăcuțele.

## Cum se desenează „la infinit" cu doar două poziții

**Fiecare piesă apare de două ori:** o dată solidă, o dată ca o urmă translucidă
rămasă în aer, pe pătratul de alături. Nu o umbră pe tablă — o **copie palidă a
ei înseși**, aceeași formă, aceeași ținută, doar stinsă.

Cele două perechi stau alături, **fiecare damă exact sub regele ei**. Așezarea e
oglindită, dinadins: **nu trebuie să se poată spune care poziție a fost prima.**
Ăsta e tot trucul — dacă niciuna nu e începutul, imaginea nu are cum să se
termine.

| element | ce spune |
| --- | --- |
| dama aurie, solidă, sub rege | *șah* |
| dama palidă, un pătrat alături | *și tot ea, acum o clipă* |
| regele negru, aplecat, ferindu-se | *singura mutare pe care o are* |
| regele palid, pe celălalt pătrat | *unde tocmai era, și unde se întoarce* |

## Ce nu intră în imagine

Nicio săgeată circulară, niciun semn de infinit, niciun ceas. Sunt exact
lucrurile pe care le desenează oricine când aude „la nesfârșit", și toate ar
transforma plăcuța în pictogramă. Repetiția trebuie să se vadă **din piese**, nu
dintr-un simbol pus peste ele.

**Atașează la mesaj DOUĂ imagini, în ordinea asta:**
1. [`Atac prin descoperire.png`](../../surse-imagini/tactici/Atac%20prin%20descoperire.png)
   — fundalul plat, rama și cele două metale;
2. [`Sacrificiu.png`](../../surse-imagini/tactici/Sacrificiu.png) — de acolo se
   ia damă aurie și negrul cum trebuie.

---

```text
Here are two images you made earlier, both from the same set of chess tiles. This new tile belongs to the same set and must look like it was made by the same hand in the same session: identical frame, identical background, identical metals, identical lighting and finish.

KEEP IDENTICAL TO THE REFERENCES:
- Square 1024x1024, filled edge to edge.
- BACKGROUND: a FLAT chessboard pattern seen straight on — alternating brown squares in low contrast, darker #4B3317 and lighter #7F5425, with a warm radial glow behind the pieces (#63421D) falling off to near-black in the four corners (#171513). It is a printed pattern, not a real board: no tilt, no perspective, no vanishing point, no thickness, no board edge, no horizon. In THIS tile the squares are drawn BIGGER than in the references: exactly 6 columns and 6 rows fill the tile, so each square is large. They stay the same size all over the tile, corner to corner.
- FRAME: the same ornamental border — a thin double line in warm metallic gold (#DEB863) with rounded corners, angular gold corner pieces at the four corners, and one small gold diamond centred on each of the four sides. Draw all four diamonds COMPLETE and entirely inside the picture, none of them cropped by the edge.
- FINISH: the same sculpted, polished, three-dimensional metal — soft rounded bevels, smooth gradients, a gentle sheen, soft drop shadows. Solid Staunton chess pieces, modelled in relief, seen from the side, lit from the upper left.

THE TWO METALS:
- The QUEEN is LIGHT: rich warm gold, highlight #FFD86A rising to #FCCB43 on the brightest edges, mid-tone #E7AD3E, shadows going deep to #8C4A01 and #5A340A. Polished metal, never pale cream or ivory.
- The KING is DARK: near-black bronze, highlight #4A3A1C, mid-tone #241A0A, deep shadow #0E0A04, with a thin warm gold rim light along his edges so his silhouette stays crisp against the brown board.

THE SUBJECT — "the same two moves, over and over, for ever". There are only TWO pieces in this tile, a gold queen and a dark king, but EACH OF THEM IS DRAWN TWICE: once solid, and once as a pale after-image left behind on the square it just came from. Four figures on the board, two pieces.

Read the background as a grid of 6 columns and 6 rows, numbered 1 to 6 from the left and 1 to 6 from the bottom. Place them like this:

- the SOLID DARK KING standing on the square in column 3, row 1;
- his AFTER-IMAGE standing on the square in column 4, row 1, right beside him;
- the SOLID GOLD QUEEN standing on the square in column 3, row 3 — two squares directly below the solid king, in the same column;
- her AFTER-IMAGE standing on the square in column 4, row 3 — two squares directly below the king's after-image, in the same column.

Each queen therefore stands directly under the king she is checking, in the same column, with one empty square between them. The two pairs stand side by side, and because the pieces are wider than one square, each after-image OVERLAPS its solid piece a little — the pale one behind, the solid one in front. That overlap is what makes it read as one piece caught in two places, rather than as four pieces.

THE AFTER-IMAGES are exactly the same figure as the solid piece next to them: same shape, same size, same pose, same metal, just faint. They are TRANSLUCENT — you can see the squares of the board through them — dimmed down and softened, with no bright highlights, no rim light and no shadow of their own, as if they were still hanging in the air where the piece stood a moment ago. They are NOT flat shadows lying on the board, NOT silhouettes, NOT outlines, and NOT different pieces: each one is a ghost of the solid piece beside it.

THE KING IS DODGING. Both dark kings — the solid one and the pale one — lean away from the queen below them, tipped slightly to the side, caught mid-step. They are the ones being moved.

THE QUEEN IS CALM. Both gold queens stand bolt upright, planted, still, facing straight up at the king above them. She is the one doing the moving.

MAKE IT SYMMETRICAL. The left pair and the right pair are drawn as near-mirror images of each other, at exactly the same height and the same size, so that a viewer cannot tell which one came first. Neither pair is the beginning and neither is the end.

THE BOARD IS OTHERWISE EMPTY. Two solid pieces, two after-images, nothing else on any square.

READABILITY: this tile is displayed small, so the silhouette carries it — two dark crowned shapes side by side low down, one solid and one faint, and two gold crowned shapes side by side directly below them, one solid and one faint, each gold one looking straight up at a dark one. Keep everything bold and simple, no fine detail.

NOT: no circular arrow, no looping arrow, no arrows of any kind, no infinity symbol, no figure of eight, no clock, no hourglass, no spiral, no repeated ghost trail of three or more copies, no motion lines, no speed lines, no beams of light, no rays, no dotted paths, no highlighted or glowing squares, no three-dimensional board, no perspective, no board edge, no letters or numbers, no coordinates, no hands, no bishop, no knight, no pawn, no rook, no second king that is a different piece, no cartoon faces, no eyes, no sparkles, no smoke, no photorealism, no thin outlines, no plastic gloss. No text, no lettering, no logo, no watermark, no border outside the ornamental frame.

OUTPUT: square image, at least 1024x1024.
```

---

**Salvează ca:** `hybrid.png`, lângă celelalte.

**Verificare**

1. **Urmele sunt translucide, nu umbre?** Ăsta e testul principal. Trebuie să se
   vadă tabla prin ele, dar să rămână aceeași piesă, în picioare, nu o pată
   culcată pe jos. Cere: *„translucent ghost of the same piece, standing, board
   visible through it, not a shadow on the floor"*.
2. **Se suprapun puțin cu piesele solide?** Suprapunerea e cea care spune „aceeași
   piesă, două locuri". Dacă stau la distanță, par patru piese.
3. **Fiecare damă e exact sub regele ei, pe aceeași coloană?** Fără asta nu se
   vede că e șah.
4. **Cele două perechi sunt la aceeași înălțime și la fel de mari?** Simetria e
   ce face imaginea să nu aibă început.
5. **Regii se apleacă, damele stau drepte?** Una împinge, celălalt e împins.
6. **Sunt exact patru figuri?** Nu șase, nu o dâră lungă de copii. Două solide,
   două palide.
7. **N-a apărut niciun semn de infinit și nicio săgeată circulară?**
8. **Cele patru romburi sunt întregi?** Niciunul tăiat de marginea imaginii.

---

## Ce am încercat înainte

**Prima variantă:** o piesă **turnată din două** — corp de turn, mitră de nebun —
cu două raze plecând din ea. Spunea *piesă* hibridă, nu *tactici* hibride.

**A doua variantă:** trei **bare verticale de aur** în fața regelui, luate de la
[Prinderea piesei](07-prinderea-piesei.md). Greșeala merită scrisă: acolo
gratiile **sunt corpul turnului** — piesa care prinde *este* temnița, aia e toată
gluma. Rupte de turn, rămân trei bare de aur care nu trimit la nimic.

**A treia variantă:** rege negru încolțit de trei lucruri deodată — o rază, un
magnet și propriul lui pion. Corectă ca idee, dar aglomerată: trei limbaje într-o
plăcuță care se vede la 64 de pixeli.

Lecția, aceeași de fiecare dată: **plăcuțele bune au un singur lucru de spus.**
Șahul perpetuu are unul singur, și e ușor de recunoscut.
