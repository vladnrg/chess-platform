import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthInit, useAuth } from '@/hooks/useAuth'
import { PageLoader } from '@/components/ui/Spinner'
import { AppLayout } from '@/components/layout/AppLayout'
import { Landing } from '@/pages/Landing'
import { Login } from '@/pages/Auth/Login'
import { Register } from '@/pages/Auth/Register'
import { Onboarding } from '@/pages/Onboarding/Onboarding'
import { Dashboard } from '@/pages/Dashboard'
import { CoursesPage } from '@/pages/Courses/CoursesPage'
import { CourseDetail } from '@/pages/Courses/CourseDetail'
import { LessonPage } from '@/pages/Courses/LessonPage'
import { OpeningTrainerPage } from '@/pages/Courses/OpeningTrainerPage'
import { PuzzlesPage } from '@/pages/PuzzlesPage'
import { StatsPage } from '@/pages/StatsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { PricingPage } from '@/pages/PricingPage'
import { CommunityPage } from '@/pages/CommunityPage'
import { CalendarPage } from '@/pages/CalendarPage'
import { TacticsChestPage } from '@/pages/TacticsChestPage'
import { TacticsCategoryPage } from '@/pages/TacticsCategoryPage'
import { RepertoirePage } from '@/pages/RepertoirePage'
import { BreakPage } from '@/pages/BreakPage'
import { ParentalConfirmPage } from '@/pages/ParentalConfirmPage'
import { ParentalStatsPage } from '@/pages/ParentalStatsPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuth()
  if (!initialized) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuth()
  if (!initialized) return <PageLoader />
  if (user) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function AppRoutes() {
  useAuthInit()
  const { initialized } = useAuth()
  if (!initialized) return <PageLoader />

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/break" element={<BreakPage />} />
      <Route path="/parental/confirm" element={<ParentalConfirmPage />} />
      <Route path="/parental/stats" element={<ParentalStatsPage />} />

      {/* Onboarding */}
      <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />

      {/* App — cu sidebar */}
      <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:slug" element={<CourseDetail />} />
        <Route path="/courses/:slug/lessons/:lessonId" element={<LessonPage />} />
        <Route path="/courses/:slug/guided/:lineId" element={<OpeningTrainerPage mode="guided" />} />
        <Route path="/courses/:slug/practice/:lineId" element={<OpeningTrainerPage mode="practice" />} />
        <Route path="/puzzles" element={<PuzzlesPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/tactics" element={<TacticsChestPage />} />
        <Route path="/tactics/:categoryId" element={<TacticsCategoryPage />} />
        <Route path="/repertoire" element={<RepertoirePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { background: '#1e1e1e', color: '#f0f0f0', border: '1px solid #2a2a2a' },
            success: { iconTheme: { primary: '#4ade80', secondary: '#1e1e1e' } },
            error: { iconTheme: { primary: '#f87171', secondary: '#1e1e1e' } },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
