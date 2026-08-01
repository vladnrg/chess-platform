import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Menu } from 'lucide-react'
import { useChildSession } from '@/hooks/useChildSession'
import { SessionTimer } from '@/components/session/SessionTimer'
import { SessionQuip } from './SessionQuip'
import { archetypeFor, pageTitleFor, hasOwnHeader } from '@/lib/navigation'

function ChildSessionGuard() {
  const { minutesLeft, showWarning, dismissWarning, isMinor } = useChildSession()
  if (!isMinor || !showWarning || minutesLeft === null) return null
  return <SessionTimer minutesLeft={minutesLeft} onDismiss={dismissWarning} />
}

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()

  // Arhetipul vine dintr-un singur loc (lib/navigation), nu dintr-un `pathname ===`
  // scris în layout. Vezi comentariul de acolo pentru ce înseamnă fiecare.
  const archetype = archetypeFor(pathname)
  const title = pageTitleFor(pathname)
  const ownHeader = hasOwnHeader(pathname)

  return (
    <div className="flex h-dvh bg-[#0A0A0A] overflow-hidden">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 transform transition-transform duration-200
          lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ width: 'var(--app-sidebar)' }}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Coloana de conținut — înălțime fixă, scroll doar înăuntru */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Bara de sus, cu titlul paginii. Pe paginile care îşi poartă singure
            titlul rămâne doar varianta mobilă — acolo e nevoie de butonul de meniu,
            dar pe desktop bara ar dubla titlul şi ar fura din înălţime degeaba. */}
        <header
          className={`flex flex-shrink-0 items-center gap-3 border-b border-[#2A2A2A] px-4 ${ownHeader ? 'lg:hidden' : ''}`}
          style={{ height: 'var(--app-header)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-[#A0A0A0] transition-colors hover:bg-[#141414] hover:text-[#F0F0F0] lg:hidden"
            aria-label="Deschide meniul"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="truncate font-display text-base font-bold tracking-tight text-[#F0F0F0]">
            {ownHeader ? 'CleanChess' : title}
          </h1>
        </header>

        {/* Zona de pagină. Are exact înălțimea rămasă; scroll-ul e intern, ca
            shell-ul să nu se miște niciodată. O pagină care vrea să încapă fix
            în ecran cere `h-full` şi îşi împarte singură spațiul. */}
        <main
          className="min-h-0 flex-1 overflow-y-auto"
          data-archetype={archetype}
        >
          <div
            className="mx-auto flex min-h-full w-full flex-col"
            style={{
              // Paginile focus au nevoie de lăţime pentru tablă şi cele două coloane.
              maxWidth: archetype === 'focus' ? '112rem' : 'var(--app-max)',
              padding: 'var(--app-pad)',
              gap: 'var(--app-gap)',
            }}
          >
            <SessionQuip />
            <Outlet />
          </div>
        </main>
      </div>

      <ChildSessionGuard />
    </div>
  )
}
