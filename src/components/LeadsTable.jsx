import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'booked', label: 'Booked' },
  { value: 'closed', label: 'Closed' },
]

function formatWhen(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function LeadsTable() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadLeads() {
      setLoading(true)
      setError('')

      const { data, error: queryError } = await supabase
        .from('leads')
        .select(
          'id, name, phone, email, job_type, urgency, notes, status, created_at, is_emergency',
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
                  className={`border-b border-brand/10 ${
                    lead.is_emergency ? 'border-l-4 border-l-red-700 bg-red-50/60' : ''
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
                    {lead.notes || '—'}
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
    </section>
  )
}

export default LeadsTable
