import { Outlet, useLocation } from 'react-router-dom'
import { TopNav } from './TopNav'
import { useChildSession } from '@/hooks/useChildSession'
import { SessionTimer } from '@/components/session/SessionTimer'
import { SessionQuip } from './SessionQuip'
import { archetypeFor, shellTitleFor } from '@/lib/navigation'
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
  const title = shellTitleFor(pathname)

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
            maxWidth: archetype === 'focus' ? '120rem' : 'var(--app-max)',
            padding: 'var(--app-pad)',
            gap: 'var(--app-gap)',
          }}
        >
          {/* Titlul paginii stă în conţinut, nu în bara de sus — aceea e rezervată
              navigării. Paginile cu antet propriu şi-l randează singure. */}
          {title && (
            <h1 className="flex-shrink-0 font-display text-2xl font-bold tracking-tight text-[#F0F0F0]">
              {title}
            </h1>
          )}
          <SessionQuip />
          <Outlet />
        </div>
      </main>

      <ChildSessionGuard />
    </div>
  )
}
