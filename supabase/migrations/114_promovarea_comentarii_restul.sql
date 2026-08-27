-- ============================================================
-- Promovarea pionului: comentariile care lipseau la exerciţiile 2 şi 3.
--
-- Acelaşi fel de vorbă ca la primul: ce încearcă negrul şi de ce nu-i iese,
-- în loc de „negrul mută regele de pe g8 pe h7". Unde pasul are comentariu,
-- rândul cu coordonate tace.
--
-- Adevărul poziţiilor, verificat pe tablă înainte de scris:
--   Exerciţiul 2 (k7/8/8/6P1/1p6/8/7K/8): după g7 şi b2, dama de pe g8 apare
--   cu şah regelui de pe a8 — rândul opt e liber între ele. De-aia pionul de
--   pe b2 nu mai apucă să devină damă: negrul e obligat să pareze şahul.
--   Exerciţiul 3 (6k1/8/5KP1/8/8/8/8/8): după g7, regele negru ajunge pe h7,
--   de unde chiar apără g8 — o damă pusă acolo acum ar fi luată. După Rf7,
--   regele alb apără g8, iar cel negru, de pe h6, e la două pătrate de el.
-- ============================================================

update public.lessons
   set exercises = jsonb_set(
         jsonb_set(
           jsonb_set(
             jsonb_set(
               jsonb_set(
                 exercises,
                 '{1,line,1,comentariu}',
                 to_jsonb('Pionul negru ajunge şi el la un pas de capăt, dar rândul e al tău. Aici se vede că locul întâi în cursă s-a hotărât la prima mutare.'::text)
               ),
               '{1,line,2,comentariu}',
               to_jsonb('Dama apare cu şah pe rândul opt, iar regele negru e obligat să răspundă. Pionul lui rămâne pe b2, la o mutare de o damă pe care n-o mai apucă.'::text)
             ),
             '{2,line,0,comentariu}',
             to_jsonb('Regele negru se dă la o parte, dar rămâne lipit de pătratul de promovare: de pe h7 chiar apără g8. O damă pusă acolo acum ar fi luată pe loc.'::text)
           ),
           '{2,line,1,comentariu}',
           to_jsonb('Regele negru coboară, sperând să se întoarcă la timp. Nu mai are cum: g8 e apărat acum de regele tău, iar al lui e la două pătrate distanţă.'::text)
         ),
         '{2,line,2,comentariu}',
         to_jsonb('Dama apare pe un pătrat apărat, deci rămâne pe tablă. De aici matul e tehnică: dama taie rândurile una câte una, regele tău se apropie, iar regele negru e împins într-un colţ.'::text)
       )
 where title = 'Promovarea pionului'
   and exercises -> 2 -> 'line' -> 2 is not null;

-- Dovada: toţi cei 9 paşi ai lecţiei trebuie să aibă acum comentariu.
select
  count(*)                                                  as "pasi (astept 9)",
  count(*) filter (where pas ->> 'comentariu' is not null)  as "cu comentariu (astept 9)"
from public.lessons l
cross join lateral jsonb_array_elements(l.exercises) as ex
cross join lateral jsonb_array_elements(ex -> 'line') as pas
where l.title = 'Promovarea pionului';
