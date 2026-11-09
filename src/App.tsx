import { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthInit, useAuth } from '@/hooks/useAuth'
import { PageLoader } from '@/components/ui/Spinner'
import { PoartaCont } from '@/components/auth/PoartaCont'
import { EroarePagina } from '@/components/ui/EroarePagina'
import { lazyPagina } from '@/lib/lazy-pagina'

// Rutele se încarcă „lazy" (code-splitting): fiecare pagină devine un chunk separat,
// așa că o pagină publică (ex. /vanzare) nu mai trage după ea chess.js, Stockfish,
// recharts sau tot dashboard-ul. Named exports → mapate la `default` pentru React.lazy.
const AppLayout = lazyPagina(() => import('@/components/layout/AppLayout').then(m => ({ default: m.AppLayout })))
const Landing = lazyPagina(() => import('@/pages/Landing').then(m => ({ default: m.Landing })))
const SalesPage = lazyPagina(() => import('@/pages/SalesPage').then(m => ({ default: m.SalesPage })))
const SalesPageBulletin = lazyPagina(() => import('@/pages/SalesPageBulletin').then(m => ({ default: m.SalesPageBulletin })))
const Login = lazyPagina(() => import('@/pages/Auth/Login').then(m => ({ default: m.Login })))
const Register = lazyPagina(() => import('@/pages/Auth/Register').then(m => ({ default: m.Register })))
const ForgotPassword = lazyPagina(() => import('@/pages/Auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })))
const ResetPassword = lazyPagina(() => import('@/pages/Auth/ResetPassword').then(m => ({ default: m.ResetPassword })))
const NotationGuide = lazyPagina(() => import('@/pages/Resources/NotationGuide').then(m => ({ default: m.NotationGuide })))
const ResourcesPage = lazyPagina(() => import('@/pages/Resources/ResourcesPage').then(m => ({ default: m.ResourcesPage })))
const BeginnersPage = lazyPagina(() => import('@/pages/Resources/BeginnersPage').then(m => ({ default: m.BeginnersPage })))
const Onboarding = lazyPagina(() => import('@/pages/Onboarding/Onboarding').then(m => ({ default: m.Onboarding })))
const Dashboard = lazyPagina(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })))
const CoursesPage = lazyPagina(() => import('@/pages/Courses/CoursesPage').then(m => ({ default: m.CoursesPage })))
const CourseDetail = lazyPagina(() => import('@/pages/Courses/CourseDetail').then(m => ({ default: m.CourseDetail })))
const LessonPage = lazyPagina(() => import('@/pages/Courses/LessonPage').then(m => ({ default: m.LessonPage })))
const OpeningTrainerPage = lazyPagina(() => import('@/pages/Courses/OpeningTrainerPage').then(m => ({ default: m.OpeningTrainerPage })))
const PuzzlesPage = lazyPagina(() => import('@/pages/PuzzlesPage').then(m => ({ default: m.PuzzlesPage })))
const PuzzlePlacement = lazyPagina(() => import('@/pages/PuzzlePlacement').then(m => ({ default: m.PuzzlePlacement })))
const StatsPage = lazyPagina(() => import('@/pages/StatsPage').then(m => ({ default: m.StatsPage })))
const ProfilePage = lazyPagina(() => import('@/pages/ProfilePage').then(m => ({ default: m.ProfilePage })))
const PricingPage = lazyPagina(() => import('@/pages/PricingPage').then(m => ({ default: m.PricingPage })))
const MatchPage = lazyPagina(() => import('@/pages/MatchPage').then(m => ({ default: m.MatchPage })))
const LeaderboardPage = lazyPagina(() => import('@/pages/LeaderboardPage').then(m => ({ default: m.LeaderboardPage })))
const CalendarPage = lazyPagina(() => import('@/pages/CalendarPage').then(m => ({ default: m.CalendarPage })))
const TacticsChestPage = lazyPagina(() => import('@/pages/TacticsChestPage').then(m => ({ default: m.TacticsChestPage })))
const TacticsCategoryPage = lazyPagina(() => import('@/pages/TacticsCategoryPage').then(m => ({ default: m.TacticsCategoryPage })))
const RepertoirePage = lazyPagina(() => import('@/pages/RepertoirePage').then(m => ({ default: m.RepertoirePage })))
const LeaguesPage = lazyPagina(() => import('@/pages/LeaguesPage').then(m => ({ default: m.LeaguesPage })))
const EventsPage = lazyPagina(() => import('@/pages/EventsPage').then(m => ({ default: m.EventsPage })))
const AnalysisPage = lazyPagina(() => import('@/pages/AnalysisPage').then(m => ({ default: m.AnalysisPage })))
const EventDetailPage = lazyPagina(() => import('@/pages/EventDetailPage').then(m => ({ default: m.EventDetailPage })))
const SpecialePage = lazyPagina(() => import('@/pages/Speciale/SpecialePage').then(m => ({ default: m.SpecialePage })))
const ArenaRunPage = lazyPagina(() => import('@/pages/ArenaRunPage').then(m => ({ default: m.ArenaRunPage })))
const BreakPage = lazyPagina(() => import('@/pages/BreakPage').then(m => ({ default: m.BreakPage })))
const ParentalConfirmPage = lazyPagina(() => import('@/pages/ParentalConfirmPage').then(m => ({ default: m.ParentalConfirmPage })))
const ParentalStatsPage = lazyPagina(() => import('@/pages/ParentalStatsPage').then(m => ({ default: m.ParentalStatsPage })))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuth()
  if (!initialized) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  return <PoartaCont>{children}</PoartaCont>
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
    // Fără plasă, o pagină care cădea lăsa ecranul negru. Vezi `EroarePagina`.
    <EroarePagina>
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
    </EroarePagina>
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
