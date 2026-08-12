-- ============================================================
-- Un curs poate fi scos din raft fără să fie şters
-- ============================================================
-- Jocul Vienez nu e stricat, e nesănătos. Cele trei variante ale lui predau
-- albului linii în care albul stă mai prost, iar una dintre ele — Viena
-- Clasică — e o combinaţie de atac care pierde: trei mutări la rând scad
-- evaluarea cu peste un pion fiecare (−2,99 la 5.Cf3, −5,32 la 6.Cd5, −2,21 la
-- 8.Nxf7+), iar textele le laudă drept „cavalcadă" şi „sacrificiu".
--
-- Cursul cere rescris, nu peticit. Până atunci nu trebuie să stea la vânzare:
-- cineva care îl cumpără învaţă să-şi arunce piesele.
--
-- De aici coloana. Nu ştergem cursul — conţinutul lui e punctul de plecare al
-- rescrierii, iar ştersul ar lua cu el şi progresul celor care l-au parcurs.
-- ============================================================

alter table public.courses
  /** Cursurile nepublicate nu apar în catalog şi nu se pot deschide. Rămân în
      bază pentru că urmează să fie reparate, nu aruncate. */
  add column if not exists is_published boolean not null default true;

update public.courses set is_published = false where slug = 'vienna-game';


-- Verificare, după rulare:
--   select slug, is_published from public.courses where not is_published;
-- Trebuie să întoarcă un singur rând: vienna-game.
