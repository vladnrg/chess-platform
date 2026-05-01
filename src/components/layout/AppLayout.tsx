import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Menu } from 'lucide-react'
import { useChildSession } from '@/hooks/useChildSession'
import { SessionTimer } from '@/components/session/SessionTimer'

function ChildSessionGuard() {
  const { minutesLeft, showWarning, dismissWarning, isMinor } = useChildSession()
  if (!isMinor || !showWarning || minutesLeft === null) return null
  return <SessionTimer minutesLeft={minutesLeft} onDismiss={dismissWarning} />
}

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#0f0f0f] overflow-hidden">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-200
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0 overflow-auto">
        {/* Mobile topbar */}
        <header className="flex items-center gap-3 border-b border-[#2a2a2a] px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-[#a0a0a0] hover:bg-[#1e1e1e] hover:text-[#f0f0f0] transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-bold text-[#c8a84b] text-lg">ChessUp</span>
        </header>

        {/* Page */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <ChildSessionGuard />
    </div>
  )
}
