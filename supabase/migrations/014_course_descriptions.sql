-- Migration 014: Rich descriptions for all opening courses
UPDATE public.courses SET description = 'Una dintre cele mai solide și practice deschideri pentru alb. Ideală pentru jucătorii pragmatici care vor o structură clară fără a memora multe linii. Nebunul pe f4, pionul pe d4 și calul pe f3 formează un sistem robust care funcționează împotriva oricărui răspuns al negrului.' WHERE slug = 'london-system' AND (description IS NULL OR description = '');

UPDATE public.courses SET description = 'Deschiderea italiană este una dintre cele mai vechi și mai studiate din istoria șahului. Nebunul pe c4 vizează imediat câmpul f7, creând presiune timpurie. Ideală pentru jucătorii care vor să înțeleagă principiile de dezvoltare rapidă și controlul centrului în jocul deschis.' WHERE slug = 'italian-game' AND (description IS NULL OR description = '');

UPDATE public.courses SET description = 'Gambitul Regelui este cea mai romantică deschidere din șah — alb sacrifică un pion pentru a obține un centru activ și inițiativă fulminantă pe flancul regelui. Preferat de atacanți puri, acest gambit a fost jucat de marii maeștri ai secolului XIX și rămâne o armă surprinzătoare chiar și azi.' WHERE slug = 'kings-gambit' AND (description IS NULL OR description = '');

UPDATE public.courses SET description = 'Gambitul Damei este deschiderea strategică prin excelență cu 1.d4. Alb oferă un pion pentru a obține control central și structuri superioare. Această deschidere a fost jucată în sute de meciuri de Campionat Mondial și este esențială pentru orice jucător serios.' WHERE slug = 'queens-gambit' AND (description IS NULL OR description = '');

UPDATE public.courses SET description = 'Deschiderea Catalană combină puterea pionului de pe d4 cu fianchetto-ul nebunului pe g2 — o combinație letală care controlează centrul de la distanță. Jucată de campioni mondiali ca Kasparov și Carlsen, este o alegere sofisticată pentru jucătorii cu stil pozițional.' WHERE slug = 'catalan-opening' AND (description IS NULL OR description = '');

UPDATE public.courses SET description = 'Ruy Lopez (sau Jocul Spaniol) este coloana vertebrală a șahului clasic cu e4. Fb5 pune presiune indirectă pe e5 și creează dezechilibre strategice profunde. Varianta închisă, preferata campionilor mondiali, oferă un studiu complet al planificării pe termen lung.' WHERE slug = 'ruy-lopez' AND (description IS NULL OR description = '');

UPDATE public.courses SET description = 'Deschiderea Engleză cu 1.c4 este un sistem flexibil care transpune adesea în structuri gambitul damei sau Siciliana. Ideală pentru jucătorii care preferă să evite teoria extinsă și să joace șah pozițional și creativ. Fischer și Karpov au iubit această deschidere.' WHERE slug = 'english-opening' AND (description IS NULL OR description = '');

UPDATE public.courses SET description = 'Atacul Indian al Regelui (KIA) este un sistem complet care funcționează împotriva oricărei deschideri a negrului — franceză, siciliană sau caro-kann. Alb construiește metodic cu Cf3, g3, Fg2, d3 și e4, apoi lansează un atac devastator pe flancul regelui.' WHERE slug = 'kings-indian-attack' AND (description IS NULL OR description = '');

UPDATE public.courses SET description = 'Sistemul Colle este alegerea perfectă pentru jucătorii pragmatici care vor o deschidere solidă cu plan de atac clar. Alb construiește cu d4, Cf3, e3 și Fd3, pregătind un atac clasic pe flancul regelui prin e4 și avansul pionilor. Simplu de învățat, greu de apărat.' WHERE slug = 'colle-system' AND (description IS NULL OR description = '');

UPDATE public.courses SET description = 'Jocul Vienez cu 2.Cc3 este o alternativă surprinzătoare la Cc3 clasic. Alb poate transita la gambitul vienez agresiv cu f4 sau la sisteme poziționale cu Fc4. O deschidere versatilă care dezorientează adversarii pregătiți pentru Ruy Lopez sau Italiana.' WHERE slug = 'vienna-game' AND (description IS NULL OR description = '');

UPDATE public.courses SET description = 'Apărarea Siciliană este cel mai popular răspuns la 1.e4, ales de campioni mondiali de la Fischer la Carlsen. Negrul renunță la centru simetric pentru un contra-joc activ pe flancul damei și dezechilibre strategice bogate. Varianta Najdorf este bijuteria coroanei șahului modern.' WHERE slug = 'sicilian-defense' AND (description IS NULL OR description = '');

UPDATE public.courses SET description = 'Apărarea Franceză cu 1...e6 este solidă și metodică — negrul construiește o fortăreață în centru și contraatacă în momentul potrivit. Deși pionul de pe c8 poate fi pasiv, structura e6-d5 oferă o rezistență deosebită. Preferata lui Petrosian și a jucătorilor cu stil defensiv.' WHERE slug = 'french-defense' AND (description IS NULL OR description = '');

UPDATE public.courses SET description = 'Apărarea Caro-Kann oferă toate avantajele Francezei fără dezavantajul nebunului pasiv de pe c8. Negrul susține d5 cu c6 și poate aduce nebunul la f5 sau g4 înainte de e6. Preferata lui Karpov, această apărare solidă este ideală pentru jucătorii care vor structuri curate.' WHERE slug = 'caro-kann-defense' AND (description IS NULL OR description = '');

UPDATE public.courses SET description = 'Apărarea Regelui Indian este deschiderea preferată a atacanților — negrul lasă centrul alb să se extindă, apoi îl demolează printr-un atac de flanc violent. Fischer, Kasparov, Bronstein au construit capodopere atacante din aceasta apărare dinamică și complexă.' WHERE slug = 'kings-indian-defense' AND (description IS NULL OR description = '');

UPDATE public.courses SET description = 'Nimzo-Indiana este considerată de mulți cea mai bună apărare la 1.d4. Fb4 pinuiește calul de pe c3 și creează dezechilibre structurale complexe. Alekhine, Botvinnik, Kasprov și Carlsen au jucat Nimzo-Indiana la nivel de Campionat Mondial.' WHERE slug = 'nimzo-indian-defense' AND (description IS NULL OR description = '');

UPDATE public.courses SET description = 'Apărarea Olandeză cu 1...f5 este alegerea jucătorilor curajoși care vor un contra-joc imediat pe flancul regelui. Stonewall-ul creează o fortăreață solidă, varianta Leningrad este mai dinamică. O apărare imprevizibilă care dezorientează adversarii nepregătiți.' WHERE slug = 'dutch-defense' AND (description IS NULL OR description = '');

UPDATE public.courses SET description = 'Apărarea Slavă cu c6+d5 este solidă și activă — negrul poate juca Ff5 înainte de e6, menținând nebunul activ, spre deosebire de Gambitul Damei Respins clasic. Semi-Slava este una dintre cele mai complexe și studiate deschideri din șahul contemporan.' WHERE slug = 'slav-defense' AND (description IS NULL OR description = '');

UPDATE public.courses SET description = 'Apărarea Pirc lasă centrul albului să se extindă, mizând pe fianchetto-ul nebunului de pe g7 care va exercita presiune latentă. O apărare modernă, asimetrică, care duce la pozilii complexe unde intuiția și calculul sunt mai importante decât memoria de linii.' WHERE slug = 'pirc-defense' AND (description IS NULL OR description = '');

UPDATE public.courses SET description = 'Apărarea Scandinavă cu 1...d5 este surprinzătoare și directă — negrul atacă centrul din prima mutare. Deși dama iese devreme, ea poate fi jucată agresiv de pe a5. O deschidere excelentă pentru jucătorii care vor să iasă din teoria standard și să joace șah propriu.' WHERE slug = 'scandinavian-defense' AND (description IS NULL OR description = '');

UPDATE public.courses SET description = 'Apărarea Alekhine sfidează logica clasică — calul atrage pionii albului pentru a le submina ulterior centrul supraaglomerat. Inventată de Campionul Mondial Alexander Alekhine, această apărare cere o gândire contra-intuitivă și răbdare strategică. O alegere originală împotriva 1.e4.' WHERE slug = 'alekhine-defense' AND (description IS NULL OR description = '');
