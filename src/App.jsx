import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import ChunkFallback from './components/ChunkFallback'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'
import StickyCallButton from './components/StickyCallButton'
import useNoIndex from './hooks/useNoIndex'
import { captureLeadAttribution } from './lib/leadAttribution'
import LandingPage from './pages/LandingPage'

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const ThankYouPage = lazy(() => import('./pages/ThankYouPage'))

function AppShell() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')
  useNoIndex(isAdmin)

  useEffect(() => {
    captureLeadAttribution()
  }, [pathname])

  useEffect(() => {
    const poster = document.getElementById('hero-lcp')
    const clip = document.getElementById('hero-lcp-clip')
    const hidePoster = pathname !== '/'
    if (poster) poster.hidden = hidePoster
    if (clip) clip.hidden = hidePoster
  }, [pathname])

  return (
    <>
      {isAdmin ? null : <Header />}
      <div className={isAdmin ? undefined : 'pb-16 md:pb-0'}>
        <Suspense fallback={<ChunkFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/thank-you" element={<ThankYouPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </div>
      {isAdmin ? null : <StickyCallButton />}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App
