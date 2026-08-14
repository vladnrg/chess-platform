# Cuferele treptelor de dificultate

Imaginile din acest folder apar în capul fiecărui rând din „Cufărul cu tactici”.

Numele fișierului **trebuie** să fie exact id-ul treptei din
[`src/lib/tactics-path.ts`](../../src/lib/tactics-path.ts):

| Fișier             | Treapta     | ELO       |
| ------------------ | ----------- | --------- |
| `incepator.png`    | Începător   | 400–1000  |
| `intermediar.png`  | Intermediar | 1000–1600 |
| `avansat.png`      | Avansat     | 1600–2200 |
| `master.png`       | Master      | 2200–2600 |

Pătrate, fundal `#0A0A0A` plat (același cu al paginii, deci se așază invizibil).
Se randează la 128px pe ecran lat și 64px pe mobil, cu `object-contain`.

Dacă un fișier lipsește, rândul lui se întoarce singur la iconița de nivel —
pagina nu se strică. Vezi `TierChest` în
[`src/pages/TacticsChestPage.tsx`](../../src/pages/TacticsChestPage.tsx).
