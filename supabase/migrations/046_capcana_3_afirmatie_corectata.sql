-- ============================================================
-- Capcana 3: o afirmaţie care nu stătea în picioare
-- ============================================================
-- Textul de încheiere scris în 041 spunea că, după 6...Db6, „albul nu le poate
-- apăra pe amândouă comod" — b2 şi d4.
--
-- Verificat pe poziţie: le apără pe amândouă. Pionul b2 e apărat de nebunul din
-- c1, iar d4 de dama din d3. Cine ar juca ...Dxb2 ar pierde dama la Nxb2.
--
-- Ce e adevărat şi merită predat e altceva: dama de pe b6 nu câştigă material,
-- dar leagă două piese albe de apărare. Aia e valoarea mutării.
--
-- Textul contrazicea şi explicaţia pe semi-mutare adăugată în 044, care spune
-- corect ce se întâmplă. Două adevăruri diferite despre aceeaşi poziţie, în
-- aceeaşi lecţie.
-- ============================================================

update public.opening_traps t
   set explanation = 'În Varianta Avans, 4.Nd3 pare firesc, dar îţi face exact serviciul pe care îl cauţi: schimbă nebunul tău „problematic" fără să te coste nimic. După 4...Nxd3 5.Dxd3 e6 6.Cc3, mutarea 6...Db6 ţine sub observaţie şi b2, şi d4. Albul le apără pe amândouă — b2 cu nebunul din c1, d4 cu dama din d3 — deci nu câştigi material; câştigi altceva. De acum înainte două dintre piesele lui stau legate de apărare în loc să caute ceva de făcut, iar tu joci liber. Reţine tiparul: în Caro-Kann, orice schimb al nebunului tău alb e în favoarea ta.'
  from public.courses c
 where t.course_id = c.id
   and c.slug = 'caro-kann-defense'
   and t.order_index = 3;


-- Verificare: trebuie să întoarcă zero rânduri.
--   select order_index from public.opening_traps
--    where explanation like '%nu le poate apăra pe amândouă%';
