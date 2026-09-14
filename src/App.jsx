import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import OneSignal from 'react-onesignal'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'
import StickyCallButton from './components/StickyCallButton'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import LandingPage from './pages/LandingPage'
import ThankYouPage from './pages/ThankYouPage'

function AppShell() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <>
      {isAdmin ? null : <Header />}
      <div className={isAdmin ? undefined : 'pb-14 md:pb-0'}>
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
      </div>
      {isAdmin ? null : <StickyCallButton />}
    </>
  )
}

function App() {
  useEffect(() => {
    OneSignal.init({ appId: import.meta.env.VITE_ONESIGNAL_APP_ID })
  }, [])

  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App
