# Antrenorul de deschideri, după modelul Chessly

Fișa de referință pentru două lucrări:

1. **panoul** antrenorului (`src/pages/Courses/OpeningTrainerPage.tsx`), făcut într-o sesiune;
2. **textele** cursurilor, făcute de `flota-cursuri` (pilot: Sistemul Londra).

Sursa: capturi din cursul Caro-Kann de pe Chessly, făcute de utilizator pe 2026-10-29, plus
explicațiile lui. Preluăm **structura informației**, nu culorile, nu desenele și nu textele.
Culorile rămân ale CleanChess; textele se scriu de la zero, în română.

---

## 1. Ce informație apare, și când

### Antetul (deasupra tablei)

| Element | Ce arată |
|---|---|
| titlu | numele cursului, iar dedesubt „Capitolul N” și numele capitolului |
| bara variantei | „Varianta 1 din 2”, cu o icoană care spune faza (carte = învățare) |
| bara de progres | **segmentată pe faze**, nu continuă: câte un segment pentru fiecare fază a fiecărei variante (vezi „De confirmat”) |
| meniul „⋯” | Analizează poziția · Mergi la variantă · Vezi video · Încheie sesiunea |
| „Soluție” | buton cu bec, apare doar în faza de exersare |

### Panoul din dreapta

Sus, mereu, **patru butoane de navigare**: la început, înapoi, înainte, la poziția curentă.
Apar de la prima poziție, nu abia după prima mutare.

Dedesubt, **un singur balon de comentariu**. Nimic altceva în panou: nici progres, nici
alegerea modului. Tot restul e în antet.

### Faza de învățare (prima trecere prin variantă)

| Moment | Ce scrie în balon | Pe tablă |
|---|---|---|
| poziția de start | **introducerea**: ce e cursul sau capitolul, ce variantă urmează și cu ce mutare răspundem | săgeată pe mutarea de jucat |
| înainte de fiecare mutare a ta | **un comentariu care leagă două lucruri**: ce a jucat adversarul (cât de des se joacă, ce face mutarea) și ce răspundem noi, cu motivul | săgeată pe mutarea de jucat |
| după ultima mutare | **planul de după**: ce mutări urmează, ce faci dacă adversarul joacă X, ideile tipice ale structurii | **mai multe săgeți**, una pe fiecare idee din plan |

La final apar și: „Variantă completă”, butoanele **Reia** și **Continuă la exersare**, plus un
mesaj scurt cu XP-ul câștigat.

Comentariul de la mutarea adversarului există doar în faza de învățare. Ritmul e de 2–3 paragrafe
scurte: *ce s-a jucat → ce facem → de ce*. Statistica („jucată în aproximativ 55% dintre partide”)
apare acolo unde contează alegerea adversarului.

### Faza de exersare (a doua trecere, pe cont propriu)

- **Balonul e gol.** Nu se explică nimic.
- Partida curge până la prima greșeală.
- **Greșeala 1 și 2:** un semn roșu, mic, pe piesa mutată greșit. Fără text.
- **De la greșeala 3:** apare mascota cu un indiciu scurt („pionul de pe d7 pornește la drum”), iar
  pe tablă se luminează piesa care trebuie mutată. Indiciul spune piesa, nu și pătratul.
- Butonul **Soluție** din antet arată mutarea.
- Finalul arată la fel ca la învățare.

### Trecerea mai departe

După învățare, **Continuă la exersare**. După exersare, se trece la varianta următoare, cu o
introducere nouă. Din meniul „⋯” se poate sări direct la o variantă.

### Pagina cursului (pentru context, nu intră în lucrarea asta)

Capitole numerotate, fiecare cu „Studii” bifate la terminare, plus un traseu în zigzag
(lecție, exercițiu, video, test final) cu eticheta „ultimul terminat”. Lângă: „Joacă
deschiderea cu botul” și „Exersează în ordine aleatorie”. Noi avem deja traseul pe capitole.

---

## 2. Ce avem noi, față de asta

| Chessly | CleanChess azi | Ce facem |
|---|---|---|
| navigare de la prima poziție | apare după prima mutare | **o mutăm sus, mereu vizibilă** |
| introducere la poziția de start | nu există | **text nou pe variantă** (coloană nouă în baza de date) |
| comentariu: adversar + răspunsul nostru | câte o explicație de un rând pe fiecare mutare, a ambelor părți | **comentariu nou pe fiecare mutare a ta**, care include mutarea adversarului |
| plan final, cu săgeți | planul de joc de mijloc, separat | **comentariu final + săgeți**, pe variantă |
| exersare tăcută; semn la greșeli; indiciu după 3 | „Mutare greșită” în panou, la orice greșeală | **semn pe tablă la 1–2, Căluțul savant cu indiciu de la 3** |
| buton Soluție | nu | **îl adăugăm** |
| progres pe segmente, în antet | trei faze („primele 5 mutări”…) în panou | **segmente în antet**; panoul rămâne doar pentru balon |
| meniul „⋯” | nu | **Analizează poziția** (avem deja Tabla de analiză), **Mergi la variantă**, **Încheie**. Video nu avem |
| XP la final | XP există, fără mesaj aici | mesaj scurt la final |

---

## 3. Textele: ce trebuie scris pe fiecare variantă

Asta e contractul dintre panou și flotă. Panoul afișează exact câmpurile de mai jos; flota le
scrie.

| Câmp | Câte | Ce conține | Prag de verificat |
|---|---|---|---|
| `intro` | 1 pe variantă | ce variantă e, ce răspundem, de ce | 2–4 propoziții; numește prima noastră mutare |
| `comentariu[i]` | 1 pe fiecare mutare a ta | ce a jucat adversarul + ce jucăm noi + de ce | numește mutarea adversarului și pe a noastră, exact cele de pe tablă |
| `popularitate[i]` | opțional, pe mutările adversarului | „cam X% din partide” | cifra vine din baza de partide Lichess, nu din memorie |
| `final` | 1 pe variantă | planul de după ultima mutare | 2–4 idei; fiecare idee e o mutare legală în poziția finală |
| `sageti_final` | 2–6 pe variantă | săgețile ideilor din `final` | fiecare săgeată e o mutare legală sau un drum de piesă posibil |
| `indiciu[i]` | 1 pe fiecare mutare a ta | piesa de mutat, fără pătrat | numește o piesă care chiar are mutarea corectă |

Regulile de scris rămân cele din proiect: mutările la prezent, „tura”, nu „turnul”, „regina”,
niciun „tocmai”, poziții măsurate în pătrate, iar orice afirmație de șah trecută prin motor.

---

## Confirmat de utilizator (2026-10-29)

- **Segmentele barei:** câte două pe variantă, unul pentru învățare și unul pentru exersare.
  La un capitol cu două variante sunt patru.
- **Ordinea:** învățare V1 → exersare V1 → învățare V2 → exersare V2. Fiecare variantă se
  exersează imediat după ce a fost învățată.
