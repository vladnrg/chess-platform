import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthInit, useAuth } from '@/hooks/useAuth'
import { PageLoader } from '@/components/ui/Spinner'

// Rutele se încarcă „lazy" (code-splitting): fiecare pagină devine un chunk separat,
// așa că o pagină publică (ex. /vanzare) nu mai trage după ea chess.js, Stockfish,
// recharts sau tot dashboard-ul. Named exports → mapate la `default` pentru React.lazy.
const AppLayout = lazy(() => import('@/components/layout/AppLayout').then(m => ({ default: m.AppLayout })))
const Landing = lazy(() => import('@/pages/Landing').then(m => ({ default: m.Landing })))
const SalesPage = lazy(() => import('@/pages/SalesPage').then(m => ({ default: m.SalesPage })))
const SalesPageBulletin = lazy(() => import('@/pages/SalesPageBulletin').then(m => ({ default: m.SalesPageBulletin })))
const Login = lazy(() => import('@/pages/Auth/Login').then(m => ({ default: m.Login })))
const Register = lazy(() => import('@/pages/Auth/Register').then(m => ({ default: m.Register })))
const ForgotPassword = lazy(() => import('@/pages/Auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })))
const ResetPassword = lazy(() => import('@/pages/Auth/ResetPassword').then(m => ({ default: m.ResetPassword })))
const NotationGuide = lazy(() => import('@/pages/Resources/NotationGuide').then(m => ({ default: m.NotationGuide })))
const ResourcesPage = lazy(() => import('@/pages/Resources/ResourcesPage').then(m => ({ default: m.ResourcesPage })))
const Onboarding = lazy(() => import('@/pages/Onboarding/Onboarding').then(m => ({ default: m.Onboarding })))
const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })))
const CoursesPage = lazy(() => import('@/pages/Courses/CoursesPage').then(m => ({ default: m.CoursesPage })))
const CourseDetail = lazy(() => import('@/pages/Courses/CourseDetail').then(m => ({ default: m.CourseDetail })))
const LessonPage = lazy(() => import('@/pages/Courses/LessonPage').then(m => ({ default: m.LessonPage })))
const OpeningTrainerPage = lazy(() => import('@/pages/Courses/OpeningTrainerPage').then(m => ({ default: m.OpeningTrainerPage })))
const PuzzlesPage = lazy(() => import('@/pages/PuzzlesPage').then(m => ({ default: m.PuzzlesPage })))
const PuzzlePlacement = lazy(() => import('@/pages/PuzzlePlacement').then(m => ({ default: m.PuzzlePlacement })))
const StatsPage = lazy(() => import('@/pages/StatsPage').then(m => ({ default: m.StatsPage })))
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then(m => ({ default: m.ProfilePage })))
const PricingPage = lazy(() => import('@/pages/PricingPage').then(m => ({ default: m.PricingPage })))
const CommunityPage = lazy(() => import('@/pages/CommunityPage').then(m => ({ default: m.CommunityPage })))
const CalendarPage = lazy(() => import('@/pages/CalendarPage').then(m => ({ default: m.CalendarPage })))
const TacticsChestPage = lazy(() => import('@/pages/TacticsChestPage').then(m => ({ default: m.TacticsChestPage })))
const TacticsCategoryPage = lazy(() => import('@/pages/TacticsCategoryPage').then(m => ({ default: m.TacticsCategoryPage })))
const RepertoirePage = lazy(() => import('@/pages/RepertoirePage').then(m => ({ default: m.RepertoirePage })))
const LeaguesPage = lazy(() => import('@/pages/LeaguesPage').then(m => ({ default: m.LeaguesPage })))
const BreakPage = lazy(() => import('@/pages/BreakPage').then(m => ({ default: m.BreakPage })))
const ParentalConfirmPage = lazy(() => import('@/pages/ParentalConfirmPage').then(m => ({ default: m.ParentalConfirmPage })))
const ParentalStatsPage = lazy(() => import('@/pages/ParentalStatsPage').then(m => ({ default: m.ParentalStatsPage })))

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
    <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/vanzare" element={<SalesPage />} />
      <Route path="/vanzare-b" element={<SalesPageBulletin />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/resurse" element={<ResourcesPage />} />
      <Route path="/resurse/notatie" element={<NotationGuide />} />
      {/* NU e PublicRoute: link-ul de recuperare creează o sesiune, iar PublicRoute ar redirecționa la /dashboard înainte să poți seta parola */}
      <Route path="/reset-password" element={<ResetPassword />} />
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
        <Route path="/puzzles/placement" element={<PuzzlePlacement />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/tactics" element={<TacticsChestPage />} />
        <Route path="/tactics/:categoryId" element={<TacticsCategoryPage />} />
        <Route path="/repertoire" element={<RepertoirePage />} />
        <Route path="/leagues" element={<LeaguesPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
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
            style: { background: '#141414', color: '#F0F0F0', border: '1px solid #2A2A2A' },
            success: { iconTheme: { primary: '#4ade80', secondary: '#141414' } },
            error: { iconTheme: { primary: '#FB7185', secondary: '#141414' } },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
