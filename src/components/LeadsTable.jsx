import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'booked', label: 'Booked' },
  { value: 'closed', label: 'Closed' },
]

function FileIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 3.5h7l5 5V20a1.5 1.5 0 0 1-1.5 1.5h-10.5A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M14 3.5V9h5.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function formatWhen(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function PhotoViewer({ urls, index, onClose, onChange }) {
  const current = urls[index]
  const hasPrev = index > 0
  const hasNext = index < urls.length - 1

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft' && hasPrev) onChange(index - 1)
      if (event.key === 'ArrowRight' && hasNext) onChange(index + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hasNext, hasPrev, index, onChange, onClose])

  if (!current) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Job photo"
    >
      <div
        className="relative max-h-full max-w-4xl"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          src={current}
          alt={`Job photo ${index + 1} of ${urls.length}`}
          className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain"
        />
        <p className="mt-2 text-center text-sm text-brandTint">
          {index + 1} of {urls.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="absolute -right-2 -top-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-ink shadow"
        >
          Close
        </button>
        {hasPrev ? (
          <button
            type="button"
            onClick={() => onChange(index - 1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 rounded-md bg-white/90 px-2 py-1 text-sm font-semibold text-ink"
          >
            Prev
          </button>
        ) : null}
        {hasNext ? (
          <button
            type="button"
            onClick={() => onChange(index + 1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-md bg-white/90 px-2 py-1 text-sm font-semibold text-ink"
          >
            Next
          </button>
        ) : null}
      </div>
    </div>
  )
}

function LeadsTable() {
  const [searchParams] = useSearchParams()
  const focusId = searchParams.get('lead_id') || ''
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState('')
  const [viewer, setViewer] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadLeads() {
      setLoading(true)
      setError('')

      const { data, error: queryError } = await supabase
        .from('leads')
        .select(
          'id, name, phone, email, job_type, urgency, notes, status, created_at, is_emergency, photo_urls',
        )
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (queryError) {
        setError('Could not load leads. Check the authenticated read policy on leads.')
        setLeads([])
      } else {
        setLeads(data ?? [])
      }

      setLoading(false)
    }

    loadLeads()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!focusId || loading) return
    document.getElementById(`lead-${focusId}`)?.scrollIntoView({
      block: 'center',
      behavior: 'smooth',
    })
  }, [focusId, loading, leads])

  async function handleStatusChange(lead, status) {
    const previous = lead.status
    setSavingId(lead.id)
    setError('')
    setLeads((current) =>
      current.map((row) => (row.id === lead.id ? { ...row, status } : row)),
    )

    const { error: updateError } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', lead.id)

    setSavingId('')

    if (updateError) {
      setLeads((current) =>
        current.map((row) => (row.id === lead.id ? { ...row, status: previous } : row)),
      )
      setError('Could not update status. Check the authenticated update policy on leads.')
    }
  }

  return (
    <section className="rounded-lg border border-brand/20 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-xl font-bold text-ink">Leads</h2>
      <p className="mb-6 text-sm text-ink/70">
        Newest first. Emergency jobs are marked so they stand out.
      </p>
      {loading ? <p className="text-sm text-ink/70">Loading…</p> : null}
      {error ? (
        <p className="mb-4 text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && leads.length === 0 && !error ? (
        <p className="text-sm text-ink/70">No leads yet.</p>
      ) : null}
      {leads.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-brand/20 text-xs font-semibold uppercase tracking-wide text-ink/60">
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Phone</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Job</th>
                <th className="px-3 py-2">Urgency</th>
                <th className="px-3 py-2">Notes</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  id={`lead-${lead.id}`}
                  className={`border-b border-brand/10 ${
                    lead.is_emergency ? 'border-l-4 border-l-red-700' : ''
                  } ${
                    lead.id === focusId
                      ? 'bg-brandTint'
                      : lead.is_emergency
                        ? 'bg-red-50/60'
                        : ''
                  }`}
                >
                  <td className="whitespace-nowrap px-3 py-3 text-ink/80">
                    {formatWhen(lead.created_at)}
                    {lead.is_emergency ? (
                      <span className="mt-1 block text-xs font-semibold uppercase tracking-wide text-red-700">
                        Emergency
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 font-medium text-ink">{lead.name}</td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <a className="text-brand underline" href={`tel:${lead.phone}`}>
                      {lead.phone}
                    </a>
                  </td>
                  <td className="px-3 py-3">
                    <a className="text-brand underline" href={`mailto:${lead.email}`}>
                      {lead.email}
                    </a>
                  </td>
                  <td className="px-3 py-3 text-ink">{lead.job_type}</td>
                  <td className="px-3 py-3 text-ink/80">{lead.urgency}</td>
                  <td className="max-w-xs px-3 py-3 text-ink/70">
                    <div className="flex items-start gap-2">
                      <span className="min-w-0">{lead.notes || '—'}</span>
                      {lead.photo_urls?.length ? (
                        <button
                          type="button"
                          onClick={() => setViewer({ urls: lead.photo_urls, index: 0 })}
                          className="mt-0.5 shrink-0 text-brand hover:opacity-80"
                          aria-label={`View ${lead.photo_urls.length} job photo${lead.photo_urls.length === 1 ? '' : 's'} for ${lead.name}`}
                          title="View job photos"
                        >
                          <FileIcon />
                        </button>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={lead.status || 'new'}
                      disabled={savingId === lead.id}
                      onChange={(event) => handleStatusChange(lead, event.target.value)}
                      className="rounded-md border border-brand/30 bg-white px-2 py-1.5 text-sm text-ink disabled:opacity-60"
                    >
                      {STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {viewer ? (
        <PhotoViewer
          urls={viewer.urls}
          index={viewer.index}
          onClose={() => setViewer(null)}
          onChange={(nextIndex) =>
            setViewer((current) =>
              current ? { ...current, index: nextIndex } : current,
            )
          }
        />
      ) : null}
    </section>
  )
}

export default LeadsTable
