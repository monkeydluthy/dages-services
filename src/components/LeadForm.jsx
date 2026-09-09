import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import siteConfig from '../config/siteConfig.json'
import PhotoUpload from './PhotoUpload'

function LeadForm() {
  const navigate = useNavigate()
  const [photos, setPhotos] = useState([])
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  })

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    // Scaffold only: later this will write to Supabase and call notify-lead.
    navigate('/thank-you')
  }

  return (
    <section id="lead-form" className="mx-auto max-w-5xl px-4 py-16">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-2 text-3xl font-bold text-slate-900">{siteConfig.cta}</h2>
        <p className="mb-8 text-slate-600">
          Share a few details and optional photos. We&apos;ll get back to you soon.
        </p>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Name</span>
            <input
              required
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Phone</span>
            <input
              required
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
            <input
              required
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              How can we help?
            </span>
            <textarea
              required
              name="message"
              rows="4"
              value={form.message}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <PhotoUpload files={photos} onChange={setPhotos} />
          <button
            type="submit"
            className="mt-2 rounded-md bg-amber-500 px-5 py-3 font-semibold text-slate-900 hover:bg-amber-400"
          >
            Submit request
          </button>
        </form>
      </div>
    </section>
  )
}

export default LeadForm
