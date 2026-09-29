import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/AppShell'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'))
const OverviewPage = lazy(() => import('./pages/app/OverviewPage'))
const ResumePage = lazy(() => import('./pages/app/ResumePage'))
const InternshipsPlaceholderPage = lazy(() => import('./pages/app/InternshipsPlaceholderPage'))
const CoverLetterPlaceholderPage = lazy(() => import('./pages/app/CoverLetterPlaceholderPage'))
const InterviewAgentPage = lazy(() => import('./pages/app/InterviewAgentPage'))
const VoiceResumePage = lazy(() => import('./pages/app/VoiceResumePage'))
const ProfilePage = lazy(() => import('./pages/app/ProfilePage'))
const CareerAssistantPage = lazy(() => import('./pages/app/CareerAssistantPage'))


export default function App() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const handleThemeToggle = () => setIsDark(v => !v)

  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="route-loading" role="status">Loading Career Match AI…</div>}>
        <Routes>
          {/* Public Landing Page */}
          <Route
            path="/"
            element={<LandingPage />}
          />

          {/* Authentication Routes */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
            
            {/* Authenticated Application Shell */}
            <Route
              path="/app"
              element={<AppShell isDark={isDark} onThemeToggle={handleThemeToggle} />}
            >
              <Route index element={<OverviewPage />} />
              <Route path="resume" element={<ResumePage />} />
              <Route path="internships" element={<InternshipsPlaceholderPage />} />
              <Route path="cover-letters" element={<CoverLetterPlaceholderPage />} />
              <Route path="interview-agent" element={<InterviewAgentPage />} />
              <Route path="voice-resume" element={<VoiceResumePage />} />
              <Route path="voice_resume" element={<VoiceResumePage />} />
              <Route path="career-assistant" element={<CareerAssistantPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
