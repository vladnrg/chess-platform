import { Outlet, useLocation } from 'react-router-dom'
import { TopNav } from './TopNav'
import { useChildSession } from '@/hooks/useChildSession'
import { SessionTimer } from '@/components/session/SessionTimer'
import { archetypeFor, pageZoomFor } from '@/lib/navigation'
import { useAcceptedChallengeRedirect } from '@/hooks/useChallenges'
import { useMatchWatcher } from '@/hooks/useMatchWatcher'

function ChildSessionGuard() {
  const { minutesLeft, showWarning, dismissWarning, isMinor } = useChildSession()
  if (!isMinor || !showWarning || minutesLeft === null) return null
  return <SessionTimer minutesLeft={minutesLeft} onDismiss={dismissWarning} />
}

export function AppLayout() {
  const { pathname } = useLocation()

  // Intră automat în partidă când cineva îţi acceptă provocarea, oriunde ai fi
  useAcceptedChallengeRedirect()
  // Închide partidele cu timpul expirat şi anunţă finalurile, oriunde ai fi
  useMatchWatcher()

  // Arhetipul vine dintr-un singur loc (lib/navigation), nu dintr-un `pathname ===`
  // scris în layout. Vezi comentariul de acolo pentru ce înseamnă fiecare.
  const archetype = archetypeFor(pathname)
  const zoom = pageZoomFor(pathname)

  return (
    <div className="flex h-dvh flex-col bg-[#0A0A0A] overflow-hidden">
      <TopNav />

      {/* Zona de pagină. Are exact înălțimea rămasă; scroll-ul e intern, ca bara
          de navigare să rămână fixă. O pagină care vrea să umple ecranul cere
          `height: var(--app-page-h)` şi îşi împarte singură spațiul. */}
      <main className="min-h-0 flex-1 overflow-y-auto" data-archetype={archetype}>
        <div
          className="mx-auto flex min-h-full w-full flex-col"
          style={{
            // Paginile focus au nevoie de lăţime pentru tablă şi coloanele ei.
            // 120rem, nu 112rem: la 2560×1440 tabla ajunge la 72vh = 1037px, iar
            // cu şinele şi spaţiile grupul cere 1853px. Sub vechea limită tabla
            // se strângea la 928px şi nu mai era egală cu cea din Cufăr.
            // O pagină mărită îşi citeşte lăţimea în pixeli măriţi, deci valoarea
            // se împarte la zoom ca să iasă pe ecran exact `--app-max-zoom`.
            maxWidth: archetype === 'focus'
              ? '120rem'
              : zoom > 1
                ? `calc(var(--app-max-zoom) / ${zoom})`
                : 'var(--app-max)',
            padding: 'var(--app-pad)',
            gap: 'var(--app-gap)',
          }}
          // Mărirea unei pagini întregi (vezi `pageZoomFor`). Stă pe acest
          // container, nu pe pagină, ca să prindă şi titlul — altfel „Bârlogul
          // şahistului" ar fi rămas singurul rând mic din ecran.
          //
          // Atribut, nu stil inline: mărirea se aplică din CSS şi numai de la
          // 1024px în sus. Pe telefon, un zoom de 1.25 însemna o pagină aşezată
          // ca pe 307px din 390 disponibili.
          data-zoom={zoom > 1 ? 'marit' : undefined}
        >
          {/* Fără titlu de pagină şi fără mesaje de întâmpinare. Numele paginii
              se vede deja în bara de sus, iar un salut sau o vorbă de duh nu
              spuneau nimănui nimic nou — doar împingeau conţinutul în jos ori
              acopereau un colţ de ecran. Paginile care au nevoie de un antet
              propriu (Cursuri, Puzzle-uri) şi-l randează singure. */}
          <Outlet />
        </div>
      </main>

      <ChildSessionGuard />
    </div>
  )
}
