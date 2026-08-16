# Originalele imaginilor

Aici stau fișierele **mari, așa cum vin de la generare** — 1–2 MB bucata, uneori
mai mult. Nu ajung niciodată în browserul nimănui.

```
surse-imagini/           originalele — rămân aici
  cursuri/               logourile cursurilor (initiale, alb, negru)
  legende-cursuri/       ilustrațiile de legendă
  ligi/                  emblemele de ligă (vezi tabelul de mai jos)
  tactici/               plăcuțele tipurilor de tactică

public/                  ce se descarcă efectiv în browser
  openings/<slug>.png    logourile cursurilor, 512px
  leagues/<id>.png       emblemele de ligă, decupate
  tactics/<treaptă>.png  cuferele
```

## De ce sunt în două locuri

Nu e dezordine, e singura împărțire care contează: **tot ce e în `public/` se
copiază în build și se descarcă de pe site.** Un original de 2 MB pus acolo
ajunge pe conexiunea fiecărui vizitator, degeaba — pe ecran se afișează la 64
sau 144 de pixeli.

Diferența, măsurată pe logourile de curs: originalul are câțiva MB, versiunea
servită are **94 KB**. Cu 22 de cursuri, asta înseamnă 2 MB în loc de 50.

Deci regula e simplă: **originalul aici, versiunea mică în `public/`.**

## Numele ligilor

Fișierele din `ligi/` poartă treapta, numele văzut de utilizator și
identificatorul intern, toate trei:

| # | Ce scrie în aplicație | Identificator | Fișier sursă |
| --- | --- | --- | --- |
| 1 | Inițiat | `cherestea` | `1-initiat-cherestea.png` |
| 2 | Integrat | `tinichea` | `2-integrat-tinichea.png` |
| 3 | Pretendent | `bronz` | `3-pretendent-bronz.png` |
| 4 | Bazat | `argint` | `4-bazat-argint.png` |
| 5 | Avansat | `aur` | `5-avansat-aur.png` |
| 6 | Remarcabil | `smarald` | `6-remarcabil-smarald.png` |
| 7 | Legendar | `diamant` | `7-legendar-diamant.png` |

**Identificatorul nu se schimbă.** E scris în baza de date, în
`profiles.current_league` și în `league_history.league_at_week_start`, amândouă
cu constrângere pe exact cele șapte valori — și tot din el se construiește calea
imaginii servite, `/leagues/<identificator>.png`.

Eticheta, în schimb, e doar ce se afișează. Se poate schimba oricând, dintr-un
singur loc: `LEAGUES` în [`src/types/index.ts`](../src/types/index.ts).

## Cum se face versiunea mică

Micșorare la 512px și compresie cu paletă:

```js
sharp(sursa)
  .resize(512, 512, { fit: 'contain', background: { r: 6, g: 6, b: 6 } })
  .png({ compressionLevel: 9, palette: true, quality: 92 })
  .toFile(destinatia)
```

Pentru emblemele de ligă există deja un script care face și decuparea din
fundalul alb: [`scripts/league-logos.mjs`](../scripts/league-logos.mjs). Rulat
fără argumente scrie în `.tmp-leagues/` ca să te uiți întâi; cu `--apply` scrie
peste `public/leagues/`.

Scriptul își găsește sursa după coada numelui de fișier — `4-bazat-argint.png`
→ `argint`. Dacă un fișier lipsește sau e prost numit, se oprește cu eroare.
Înainte lua fișierele în ordine alfabetică dintr-o listă scrisă de mână, ceea ce
însemna că o simplă redenumire muta emblemele de la o ligă la alta fără niciun
semn — s-a și întâmplat.

## De reținut

Folderul ăsta e urmărit de git și cântărește ~50 MB. E în regulă cât timp
originalele se adaugă rar. Dacă ajunge să încetinească clonarea, se scot din
istoric — dar până atunci, e mai bine să existe decât să se piardă.
