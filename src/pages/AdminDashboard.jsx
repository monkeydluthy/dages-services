import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OneSignal from 'react-onesignal'
import AdminManage from '../components/AdminManage'
import AdminUpload from '../components/AdminUpload'
import { supabase } from '../lib/supabaseClient'

function AdminDashboard() {
  const navigate = useNavigate()
  const [listVersion, setListVersion] = useState(0)

  useEffect(() => {
    OneSignal.init({ appId: import.meta.env.VITE_ONESIGNAL_APP_ID })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-ink">Admin</h1>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md border border-brand/30 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-brandTint"
        >
          Log out
        </button>
      </div>
      <div className="grid gap-8">
        <AdminUpload onUploaded={() => setListVersion((version) => version + 1)} />
        <AdminManage refreshKey={listVersion} />
      </div>
    </main>
  )
}

export default AdminDashboard
