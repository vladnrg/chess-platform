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
  leagues/<nume>.png     emblemele de ligă, decupate
  tactics/<treaptă>.png  cuferele
```

## Numele ligilor

Fişierele din  poartă şi numărul treptei, şi numele văzut de utilizator,
şi identificatorul intern:

| # | Ce scrie în aplicaţie | Identificator | Fişier sursă |
| --- | --- | --- | --- |
| 1 | Iniţiat |  |  |
| 2 | Integrat |  |  |
| 3 | Pretendent |  |  |
| 4 | Bazat |  |  |
| 5 | Avansat |  |  |
| 6 | Remarcabil |  |  |
| 7 | Legendar |  |  |

**Identificatorul nu se schimbă.** E scris în baza de date, în
 şi , amândouă cu
constrângere pe cele şapte valori — plus că din el se construieşte calea imaginii
servite, . Eticheta e doar ce se afişează şi se
poate schimba oricând, dintr-un singur loc:  în .

## De ce sunt în două locuri

Nu e dezordine, e singura împărțire care contează: **tot ce e în `public/` se
copiază în build și se descarcă de pe site.** Un original de 2 MB pus acolo
ajunge pe conexiunea fiecărui vizitator, degeaba — pe ecran se afișează la 64
sau 144 de pixeli.

Diferența, măsurată pe logourile de curs: originalul are câțiva MB, versiunea
servită are **94 KB**. Cu 22 de cursuri, asta înseamnă 2 MB în loc de 50.

Deci regula e simplă: **originalul aici, versiunea mică în `public/`.**

## Cum se face versiunea mică

Micșorare la 512px și compresie cu paletă:

```js
sharp(sursa)
  .resize(512, 512, { fit: 'contain', background: { r: 6, g: 6, b: 6 } })
  .png({ compressionLevel: 9, palette: true, quality: 92 })
  .toFile(destinatia)
```

Pentru emblemele de ligă există deja un script care face și decuparea:
[`scripts/league-logos.mjs`](../scripts/league-logos.mjs).

## De reținut

Folderul ăsta e urmărit de git și cântărește ~50 MB. E în regulă cât timp
originalele se adaugă rar. Dacă ajunge să încetinească clonarea, se scot din
istoric — dar până atunci, e mai bine să existe decât să se piardă.
