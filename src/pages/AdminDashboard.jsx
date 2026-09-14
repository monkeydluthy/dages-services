import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import OneSignal from 'react-onesignal'
import AdminManage from '../components/AdminManage'
import AdminUpload from '../components/AdminUpload'
import LeadsTable from '../components/LeadsTable'
import { supabase } from '../lib/supabaseClient'

function AdminDashboard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [view, setView] = useState(
    searchParams.get('view') === 'portfolio' ? 'portfolio' : 'leads',
  )
  const [listVersion, setListVersion] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function start() {
      await OneSignal.init({ appId: import.meta.env.VITE_ONESIGNAL_APP_ID })
      if (cancelled) return

      const { data } = await supabase.auth.getSession()
      const email = data.session?.user?.email
      if (email) await OneSignal.login(email)
    }

    start()

    return () => {
      cancelled = true
    }
  }, [])

  async function handleLogout() {
    await OneSignal.logout()
    await supabase.auth.signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-ink">Admin</h1>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md border border-brand/30 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-brandTint"
        >
          Log out
        </button>
      </div>
      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setView('leads')}
          className={`rounded-md px-4 py-2 text-sm font-semibold ${
            view === 'leads'
              ? 'bg-brand text-brandTint'
              : 'border border-brand/30 bg-white text-ink hover:bg-brandTint'
          }`}
        >
          Leads
        </button>
        <button
          type="button"
          onClick={() => setView('portfolio')}
          className={`rounded-md px-4 py-2 text-sm font-semibold ${
            view === 'portfolio'
              ? 'bg-brand text-brandTint'
              : 'border border-brand/30 bg-white text-ink hover:bg-brandTint'
          }`}
        >
          Portfolio
        </button>
      </div>
      {view === 'leads' ? (
        <LeadsTable />
      ) : (
        <div className="grid gap-8">
          <AdminUpload onUploaded={() => setListVersion((version) => version + 1)} />
          <AdminManage refreshKey={listVersion} />
        </div>
      )}
    </main>
  )
}

export default AdminDashboard
