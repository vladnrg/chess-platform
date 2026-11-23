-- ============================================================
-- Bun venitul de la începutul fiecărui curs de deschideri
-- ============================================================
-- Utilizatorul, pe 2026-11-24: la începutul capitolului, în poziţia iniţială,
-- un text de bun venit, apoi o frază despre capitol (aceea o compune aplicaţia,
-- vezi src/lib/intro-capitol.ts). Bun venitul apare doar la primul capitol din
-- ordinea nivelului tău. Textul Italianei e al utilizatorului; celelalte 19 sunt
-- propuneri scrise după modelul lui, pe care le corectează el.
--
-- Cifrele: exploratorul Chess.com, „Master Games", citit pe 2026-11-24. Fiecare
-- e cota mutării care dă numele deschiderii, în poziţia dinaintea ei:
--   Italiana      după 1.e4 e5 2.Cf3 Cc6    3.Nc4    81 788 / 360 730  22,7%  locul 2 (după 3.Nb5, 56,6%)
--   Spaniola      după 1.e4 e5 2.Cf3 Cc6    3.Nb5   204 353 / 360 730  56,6%  locul 1
--   Londra        după 1.d4 d5              2.Nf4    17 473 / 412 574   4,2%  locul 3
--   G. Regelui    după 1.e4 e5              2.f4     10 742 / 472 571   2,3%  locul 4
--   G. Damei      după 1.d4 d5              2.c4    285 935 / 412 574  69,3%  locul 1
--   Catalană      după 1.d4 Cf6 2.c4 e6     3.g3     34 134 / 318 950  10,7%  locul 3
--   Engleză       poziţia de start          1.c4    309 715 / 4 661 574 6,6%  locul 4
--   KIA           după 1.Cf3 d5             2.g3     58 173 / 142 019  41,0%  locul 1
--   Colle         după 1.d4 d5 2.Cf3 Cf6    3.e3     11 678 / 114 899  10,2%  locul 3
--   Vienez        după 1.e4 e5              2.Cc3    19 439 / 472 571   4,1%  locul 2
--   Siciliană     după 1.e4                 1…c5    935 463 / 2 154 181 43,4% locul 1
--   Franceză      după 1.e4                 1…e6    268 043 / 2 154 181 12,4% locul 3
--   Caro-Kann     după 1.e4                 1…c6    192 256 / 2 154 181  8,9% locul 4
--   Regele Indian după 1.d4 Cf6 2.c4 g6 3.Cc3 Ng7 4.e4  4…d6  94 461 / 105 448  89,6%
--   Nimzo-Indiană după 1.d4 Cf6 2.c4 e6 3.Cc3  3…Nb4 116 996 / 146 630  79,8%  locul 1
--   Olandeză      după 1.d4                 1…f5     41 404 / 1 591 934 2,6%  locul 6
--   Slavă         după 1.d4 d5 2.c4         2…c6    119 189 / 285 968  41,7%  locul 1 (2…e6 41%)
--   Pirc          după 1.e4 d6 2.d4 Cf6 3.Cc3  3…g6  32 443 / 70 595   46,0%  locul 1
--   Scandinavă    după 1.e4                 1…d5     57 191 / 2 154 181  2,7% locul 7
--   Alekhine      după 1.e4                 1…Cf6    44 699 / 2 154 181  2,1% locul 8
--
-- Textul Italianei spunea „23% din jocurile desfăşurate pe această platformă";
-- cifra e corectă doar în poziţia de după 2…Cc6, deci poziţia e scrisă acum în text.
-- Idempotentă.
-- ============================================================

alter table public.courses add column if not exists bun_venit text;

comment on column public.courses.bun_venit is
  'Bun venitul de la începutul primului capitol din ordinea nivelului cursantului. Paragrafe despărţite de un rând gol.';

update public.courses c
   set bun_venit = v.text
  from (values

('italian-game', $t$Te salut şi bine ai venit la Partida Italiană, o deschidere jucată cu succes de maeştri italieni încă de acum 400 de ani, dar care nu şi-a pierdut din relevanţă nici în prezent. După 1.e4 e5 2.Cf3 Cc6, este a doua cea mai jucată continuare a maeştrilor din baza de date Chess.com, după Partida Spaniolă: aproape 23% din partide, peste 80 000 de partide de nivel înalt.

Dacă îţi place să-ţi dezvolţi piesele natural şi să ai o strategie directă, această deschidere ar putea fi perfectă pentru tine.$t$),

('ruy-lopez', $t$Te salut şi bine ai venit la Partida Spaniolă, numită după preotul spaniol Ruy López de Segura, care a analizat-o într-o carte din 1561. E continuarea preferată a maeştrilor după 1.e4 e5 2.Cf3 Cc6: în baza de date Chess.com, 3.Nb5 apare în 57% din partide, peste 204 000 de partide de nivel înalt.

Dacă îţi plac poziţiile bogate, în care planul contează mai mult decât capcanele, această deschidere ar putea fi perfectă pentru tine.$t$),

('london-system', $t$Te salut şi bine ai venit la Sistemul Londra, o aşezare care şi-a câştigat numele la turneul de la Londra din 1922 şi care a devenit, în ultimii ani, una dintre deschiderile preferate ale jucătorilor de club. Printre maeştri e mai rară: în baza de date Chess.com, după 1.d4 d5, nebunul ajunge pe f4 la a doua mutare în 4% din partide, peste 17 000 de partide de nivel înalt.

Dacă vrei aceeaşi aşezare sigură împotriva aproape oricărui răspuns, fără multă teorie de memorat, această deschidere ar putea fi perfectă pentru tine.$t$),

('kings-gambit', $t$Te salut şi bine ai venit la Gambitul Regelui, deschiderea care a dominat şahul romantic al secolului al XIX-lea, când jucătorii dădeau material fără ezitare ca să atace regele. Astăzi e rar printre maeştri: în baza de date Chess.com, după 1.e4 e5, 2.f4 apare în doar 2% din partide, aproape 11 000 de partide de nivel înalt.

Dacă îţi plac atacurile directe şi nu te sperie un pion dat pentru iniţiativă, această deschidere ar putea fi perfectă pentru tine.$t$),

('queens-gambit', $t$Te salut şi bine ai venit la Gambitul Damei, una dintre cele mai vechi deschideri cunoscute şi, de mai bine de un secol, una dintre armele de bază ale campionilor mondiali. În baza de date Chess.com, după 1.d4 d5, maeştrii joacă 2.c4 în 69% din partide, de departe cea mai populară continuare, în aproape 286 000 de partide de nivel înalt.

Dacă îţi place să controlezi centrul şi să-ţi construieşti avantajul pas cu pas, această deschidere ar putea fi perfectă pentru tine.$t$),

('catalan-opening', $t$Te salut şi bine ai venit la Deschiderea Catalană, numită după turneul de la Barcelona din 1929, unde Savielly Tartakower a adus-o în prim-plan. În baza de date Chess.com, după 1.d4 Cf6 2.c4 e6, maeştrii joacă 3.g3 în 11% din partide, a treia cea mai frecventă continuare, în peste 34 000 de partide de nivel înalt.

Dacă îţi place presiunea de durată, cu nebunul pe diagonala lungă, această deschidere ar putea fi perfectă pentru tine.$t$),

('english-opening', $t$Te salut şi bine ai venit la Deschiderea Engleză, care îşi datorează numele jucătorului englez Howard Staunton, cel care a folosit-o în meciul cu Saint-Amant din 1843. În baza de date Chess.com, maeştrii deschid cu 1.c4 în aproape 7% din partide, a patra cea mai frecventă primă mutare, în peste 309 000 de partide de nivel înalt.

Dacă îţi plac poziţiile flexibile, în care alegi tu când şi cum se deschide jocul, această deschidere ar putea fi perfectă pentru tine.$t$),

('kings-indian-attack', $t$Te salut şi bine ai venit la Atacul Regelui Indian, o aşezare pe care Bobby Fischer a folosit-o cu mare succes în anii '60. Ideea e simplă: aceeaşi construcţie, cu nebunul pe g2 şi rocada mică, aproape indiferent ce joacă adversarul. În baza de date Chess.com, după 1.Cf3 d5, maeştrii joacă 2.g3 în 41% din partide, cea mai frecventă continuare, în peste 58 000 de partide de nivel înalt.

Dacă vrei un plan clar, pe care să-l poţi juca în fiecare partidă, această deschidere ar putea fi perfectă pentru tine.$t$),

('colle-system', $t$Te salut şi bine ai venit la Sistemul Colle, numit după maestrul belgian Edgard Colle, care l-a făcut cunoscut în anii '20. Albul îşi construieşte calm centrul, cu pionii pe d4 şi e3, apoi pregăteşte atacul pe flancul regelui. În baza de date Chess.com, după 1.d4 d5 2.Cf3 Cf6, maeştrii joacă 3.e3 în 10% din partide, a treia cea mai frecventă continuare, în aproape 12 000 de partide de nivel înalt.

Dacă îţi place o aşezare solidă, uşor de învăţat, care duce la atac, această deschidere ar putea fi perfectă pentru tine.$t$),

('vienna-game', $t$Te salut şi bine ai venit la Jocul Vienez, numit după jucătorii din Viena care l-au analizat în secolul al XIX-lea. Calul de pe c3 pregăteşte adesea împingerea f4, cu idei asemănătoare Gambitului Regelui. În baza de date Chess.com, după 1.e4 e5, maeştrii joacă 2.Cc3 în 4% din partide, a doua cea mai frecventă continuare după 2.Cf3, în peste 19 000 de partide de nivel înalt.

Dacă vrei o deschidere flexibilă, din care treci la atac când ţi se potriveşte, această deschidere ar putea fi perfectă pentru tine.$t$),

('sicilian-defense', $t$Te salut şi bine ai venit la Apărarea Siciliană, cel mai popular răspuns al maeştrilor la 1.e4. În baza de date Chess.com, 1…c5 apare în 43% din partidele care încep cu 1.e4, în peste 935 000 de partide de nivel înalt. Negrul nu copiază mutarea Albului: luptă pentru centru din lateral şi obţine poziţii dezechilibrate, în care joacă la câştig.

Dacă îţi plac poziţiile ascuţite, în care ambele părţi atacă, această deschidere ar putea fi perfectă pentru tine.$t$),

('french-defense', $t$Te salut şi bine ai venit la Apărarea Franceză, numită după o partidă prin corespondenţă jucată în 1834 între Londra şi Paris. În baza de date Chess.com, maeştrii răspund la 1.e4 cu 1…e6 în 12% din partide, al treilea cel mai frecvent răspuns, în peste 268 000 de partide de nivel înalt.

Dacă îţi place o poziţie solidă, din care contraataci centrul adversarului, această deschidere ar putea fi perfectă pentru tine.$t$),

('caro-kann-defense', $t$Te salut şi bine ai venit la Apărarea Caro-Kann, numită după Horatio Caro şi Marcus Kann, care au analizat-o în anii 1880. E una dintre cele mai solide apărări împotriva lui 1.e4: în baza de date Chess.com, maeştrii joacă 1…c6 în 9% din partide, în peste 192 000 de partide de nivel înalt.

Dacă preferi o structură sănătoasă de pioni şi un joc fără riscuri inutile, această deschidere ar putea fi perfectă pentru tine.$t$),

('kings-indian-defense', $t$Te salut şi bine ai venit la Apărarea Regelui Indian, deschiderea de luptă a lui Bobby Fischer şi a lui Garry Kasparov. Negrul lasă Albul să ocupe centrul, apoi îl atacă şi porneşte adesea un atac direct asupra regelui. În poziţia tipică, după 1.d4 Cf6 2.c4 g6 3.Cc3 Ng7 4.e4, maeştrii joacă 4…d6 în 90% din partidele din baza de date Chess.com, peste 94 000 de partide de nivel înalt.

Dacă îţi plac poziţiile dinamice, în care joci la câştig şi cu Negrul, această deschidere ar putea fi perfectă pentru tine.$t$),

('nimzo-indian-defense', $t$Te salut şi bine ai venit la Apărarea Nimzo-Indiană, care poartă numele lui Aron Nimzowitsch, unul dintre marii gânditori ai şahului poziţional. După 1.d4 Cf6 2.c4 e6 3.Cc3, maeştrii aleg 3…Nb4 în 80% din partidele din baza de date Chess.com, aproape 117 000 de partide de nivel înalt. Nebunul ţintuieşte calul şi luptă pentru câmpul e4 fără să ocupe centrul cu pionii.

Dacă îţi plac planurile strategice şi poziţiile cu structuri bogate, această deschidere ar putea fi perfectă pentru tine.$t$),

('dutch-defense', $t$Te salut şi bine ai venit la Apărarea Olandeză, numită după autorul olandez Elias Stein, care a recomandat-o într-o carte de la sfârşitul secolului al XVIII-lea. E un răspuns curajos la 1.d4: în baza de date Chess.com, maeştrii joacă 1…f5 în 3% din partide, peste 41 000 de partide de nivel înalt. Negrul ia imediat sub control câmpul e4 şi se pregăteşte de atac pe flancul regelui.

Dacă vrei să joci la câştig cu Negrul încă de la prima mutare, această deschidere ar putea fi perfectă pentru tine.$t$),

('slav-defense', $t$Te salut şi bine ai venit la Apărarea Slavă, numită după jucătorii slavi care au dezvoltat-o la începutul secolului al XX-lea. E răspunsul preferat al maeştrilor la Gambitul Damei: în baza de date Chess.com, după 1.d4 d5 2.c4, 2…c6 apare în 42% din partide, la mică distanţă de 2…e6, în peste 119 000 de partide de nivel înalt.

Dacă vrei o apărare solidă, în care nebunul de pe c8 nu rămâne închis, această deschidere ar putea fi perfectă pentru tine.$t$),

('pirc-defense', $t$Te salut şi bine ai venit la Apărarea Pirc, numită după maestrul sloven Vasja Pirc. Negrul lasă Albul să construiască un centru mare, apoi îl atacă din lateral, cu nebunul pe g7. După 1.e4 d6 2.d4 Cf6 3.Cc3, maeştrii joacă 3…g6 în 46% din partidele din baza de date Chess.com, peste 32 000 de partide de nivel înalt.

Dacă îţi plac poziţiile elastice, în care contraataci la momentul potrivit, această deschidere ar putea fi perfectă pentru tine.$t$),

('scandinavian-defense', $t$Te salut şi bine ai venit la Apărarea Scandinavă, una dintre cele mai vechi deschideri înregistrate: apare într-o partidă jucată la Valencia în 1475. Negrul atacă imediat pionul de pe e4, cu 1…d5. În baza de date Chess.com, maeştrii o joacă în 3% din partidele care încep cu 1.e4, peste 57 000 de partide de nivel înalt.

Dacă vrei o deschidere directă, cu planuri uşor de învăţat, această deschidere ar putea fi perfectă pentru tine.$t$),

('alekhine-defense', $t$Te salut şi bine ai venit la Apărarea Alekhine, adusă în turneele de vârf în 1921 de Alexander Alekhine, viitorul campion mondial. Negrul provoacă pionii Albului să înainteze, ca să-i atace apoi. În baza de date Chess.com, maeştrii joacă 1…Cf6 în 2% din partidele care încep cu 1.e4, aproape 45 000 de partide de nivel înalt.

Dacă îţi plac poziţiile neobişnuite, care îl scot pe adversar din teoria lui, această deschidere ar putea fi perfectă pentru tine.$t$)

  ) as v(slug, text)
 where c.slug = v.slug;


-- Dovada: toate cele 20 de cursuri de deschideri au bun venit, cu „tura" şi
-- „dama", nu „turnul" şi „regina".
do $$
declare
  n int;
begin
  select count(*) into n from public.courses where bun_venit is not null;
  if n <> 20 then raise exception 'Cursuri cu bun venit: %, trebuiau 20', n; end if;
  select count(*) into n from public.courses where bun_venit ~* '(turn(ul|uri)|regin[aăe])';
  if n <> 0 then raise exception 'Cuvinte interzise în % texte de bun venit', n; end if;
end $$;
