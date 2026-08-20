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
const BeginnersPage = lazy(() => import('@/pages/Resources/BeginnersPage').then(m => ({ default: m.BeginnersPage })))
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
const MatchPage = lazy(() => import('@/pages/MatchPage').then(m => ({ default: m.MatchPage })))
const LeaderboardPage = lazy(() => import('@/pages/LeaderboardPage').then(m => ({ default: m.LeaderboardPage })))
const CalendarPage = lazy(() => import('@/pages/CalendarPage').then(m => ({ default: m.CalendarPage })))
const TacticsChestPage = lazy(() => import('@/pages/TacticsChestPage').then(m => ({ default: m.TacticsChestPage })))
const TacticsCategoryPage = lazy(() => import('@/pages/TacticsCategoryPage').then(m => ({ default: m.TacticsCategoryPage })))
const RepertoirePage = lazy(() => import('@/pages/RepertoirePage').then(m => ({ default: m.RepertoirePage })))
const LeaguesPage = lazy(() => import('@/pages/LeaguesPage').then(m => ({ default: m.LeaguesPage })))
const EventsPage = lazy(() => import('@/pages/EventsPage').then(m => ({ default: m.EventsPage })))
const AnalysisPage = lazy(() => import('@/pages/AnalysisPage').then(m => ({ default: m.AnalysisPage })))
const EventDetailPage = lazy(() => import('@/pages/EventDetailPage').then(m => ({ default: m.EventDetailPage })))
const SpecialePage = lazy(() => import('@/pages/Speciale/SpecialePage').then(m => ({ default: m.SpecialePage })))
const ArenaRunPage = lazy(() => import('@/pages/ArenaRunPage').then(m => ({ default: m.ArenaRunPage })))
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
        <Route path="/courses/:slug/middlegame/:lineId" element={<OpeningTrainerPage mode="guided" stage="middlegame" />} />
        <Route path="/courses/:slug/middlegame-practice/:lineId" element={<OpeningTrainerPage mode="practice" stage="middlegame" />} />
        <Route path="/courses/:slug/trap/:lineId" element={<OpeningTrainerPage mode="guided" stage="trap" />} />
        <Route path="/courses/:slug/trap-practice/:lineId" element={<OpeningTrainerPage mode="practice" stage="trap" />} />
        <Route path="/puzzles" element={<PuzzlesPage />} />
        <Route path="/puzzles/placement" element={<PuzzlePlacement />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/clasament" element={<LeaderboardPage />} />
        <Route path="/partida/:matchId" element={<MatchPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/tactics" element={<TacticsChestPage />} />
        <Route path="/tactics/:categoryId/:tier" element={<TacticsCategoryPage />} />
        <Route path="/pentru-incepatori" element={<BeginnersPage />} />
        <Route path="/repertoire" element={<RepertoirePage />} />
        <Route path="/leagues" element={<LeaguesPage />} />
        {/* Misiunile zilei şi Proba de foc s-au mutat împreună în „Speciale".
            Adresele vechi rămân şi duc acolo: cine le are salvate sau le-a primit
            pe un link n-are de unde şti că s-au mutat. */}
        <Route path="/misiuni" element={<Navigate to="/speciale" replace />} />
        <Route path="/analiza" element={<AnalysisPage />} />
        <Route path="/evenimente" element={<EventsPage />} />
        <Route path="/evenimente/:slug" element={<EventDetailPage />} />
        <Route path="/proba" element={<Navigate to="/speciale" replace />} />
        <Route path="/speciale" element={<SpecialePage />} />
        <Route path="/proba/joc" element={<ArenaRunPage />} />
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
