import { useEffect, useState } from 'react'
import { storagePathFromPublicUrl, videoPosterPath, videoPosterUrl } from '../lib/portfolioMedia'
import { supabase } from '../lib/supabaseClient'

function AdminManage({ refreshKey = 0 }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadItems() {
      setLoading(true)
      setError('')

      const { data, error: queryError } = await supabase
        .from('portfolio_items')
        .select('id, title, media_type, media_url, job_type, created_at')
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (queryError) {
        setError('Could not load uploads. Check the authenticated read policy on portfolio_items.')
        setItems([])
      } else {
        setItems(data ?? [])
      }

      setLoading(false)
    }

    loadItems()

    return () => {
      cancelled = true
    }
  }, [refreshKey])

  async function handleDelete(item) {
    if (!window.confirm('Remove this from the site?')) {
      return
    }

    setDeletingId(item.id)
    setError('')

    const path = storagePathFromPublicUrl(item.media_url)
    if (path) {
      const toRemove = [path]
      const posterPath = item.media_type === 'video' ? videoPosterPath(path) : null
      if (posterPath) toRemove.push(posterPath)

      const { error: storageError } = await supabase.storage
        .from('portfolio-media')
        .remove(toRemove)

      if (storageError) {
        setDeletingId('')
        setError('Could not delete the file from storage. Try again.')
        return
      }
    }

    const { error: rowError } = await supabase
      .from('portfolio_items')
      .delete()
      .eq('id', item.id)

    setDeletingId('')

    if (rowError) {
      setError('File was removed but the row is still in the list. Refresh and try again.')
      return
    }

    setItems((current) => current.filter((entry) => entry.id !== item.id))
  }

  return (
    <section className="rounded-lg border border-brand/20 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-xl font-bold text-ink">Uploaded work</h2>
      <p className="mb-6 text-sm text-ink/70">
        Newest first. Delete anything that should not stay on the site.
      </p>
      {loading ? (
        <p className="text-sm text-ink/70">Loading…</p>
      ) : null}
      {error ? (
        <p className="mb-4 text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && items.length === 0 && !error ? (
        <p className="text-sm text-ink/70">Nothing uploaded yet.</p>
      ) : null}
      {items.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="overflow-hidden rounded-lg border border-brand/20 bg-brandTint"
            >
              {item.media_type === 'video' ? (
                <img
                  src={videoPosterUrl(item.media_url) || item.media_url}
                  alt={item.title || 'Portfolio video'}
                  className="h-40 w-full bg-ink/10 object-cover"
                />
              ) : (
                <img
                  src={item.media_url}
                  alt={item.title || 'Portfolio item'}
                  className="h-40 w-full object-cover"
                />
              )}
              <div className="flex items-start justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {item.title || 'Untitled'}
                  </p>
                  <p className="truncate text-xs text-ink/60">
                    {item.job_type || item.media_type}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={deletingId === item.id}
                  onClick={() => handleDelete(item)}
                  className="shrink-0 rounded-md border border-brand/30 bg-white px-3 py-1.5 text-sm font-semibold text-ink hover:bg-white/80 disabled:opacity-60"
                >
                  {deletingId === item.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

export default AdminManage
