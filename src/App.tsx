import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { isSupabaseConfigured } from './lib/supabase'
import { useAuth } from './providers/useAuth'

const HomePage = lazy(() =>
  import('./pages/HomePage').then((m) => ({ default: m.HomePage })),
)
const FeedPage = lazy(() =>
  import('./pages/FeedPage').then((m) => ({ default: m.FeedPage })),
)
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)
const ExplorePage = lazy(() =>
  import('./pages/ExplorePage').then((m) => ({ default: m.ExplorePage })),
)
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)
const AuthPage = lazy(() =>
  import('./pages/AuthPage').then((m) => ({ default: m.AuthPage })),
)
const OnboardingPage = lazy(() =>
  import('./pages/OnboardingPage').then((m) => ({ default: m.OnboardingPage })),
)

function RouteFallback() {
  return (
    <div
      className="flex min-h-[12rem] items-center justify-center text-sm text-muted"
      role="status"
      aria-live="polite"
    >
      Caricamento…
    </div>
  )
}

export function App() {
  const { user, profile, loading } = useAuth()
  const requiresAuth = isSupabaseConfigured

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {requiresAuth ? (
          <>
            <Route
              path="auth"
              element={
                loading ? (
                  <RouteFallback />
                ) : user ? (
                  profile?.display_name?.trim() ? (
                    <Navigate to="/" replace />
                  ) : (
                    <Navigate to="/onboarding" replace />
                  )
                ) : (
                  <AuthPage />
                )
              }
            />
            <Route
              path="onboarding"
              element={loading ? <RouteFallback /> : <OnboardingPage />}
            />
            <Route
              element={
                loading ? (
                  <RouteFallback />
                ) : !user ? (
                  <Navigate to="/auth" replace />
                ) : !profile?.display_name?.trim() ? (
                  <Navigate to="/onboarding" replace />
                ) : (
                  <AppLayout />
                )
              }
            >
              <Route index element={<HomePage />} />
              <Route path="feed" element={<FeedPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="explore" element={<ExplorePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </>
        ) : (
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="feed" element={<FeedPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
