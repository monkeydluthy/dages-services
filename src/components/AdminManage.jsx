import { useEffect, useState } from 'react'
import { itemPosterUrl, storagePathFromPublicUrl, videoPosterPath } from '../lib/portfolioMedia'
import { supabase } from '../lib/supabaseClient'

function AdminManage({ refreshKey = 0 }) {
  const [items, setItems] = useState([])
  const [altDrafts, setAltDrafts] = useState({})
  const [savingAltId, setSavingAltId] = useState('')
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
        .select('id, title, media_type, media_url, original_media_url, job_type, created_at, alt_text, poster_url, width, height')
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (queryError) {
        const withMeta = await supabase
          .from('portfolio_items')
          .select('id, title, media_type, media_url, job_type, created_at, alt_text, poster_url, width, height')
          .order('created_at', { ascending: false })

        if (!withMeta.error) {
          if (cancelled) return
          setItems(withMeta.data ?? [])
          setLoading(false)
          return
        }

        const fallback = await supabase
          .from('portfolio_items')
          .select('id, title, media_type, media_url, job_type, created_at')
          .order('created_at', { ascending: false })

        if (cancelled) return

        if (fallback.error) {
          setError('Could not load uploads. Check the authenticated read policy on portfolio_items.')
          setItems([])
        } else {
          setItems(fallback.data ?? [])
        }
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
    const originalPath = storagePathFromPublicUrl(item.original_media_url || '')
    if (path || originalPath) {
      const toRemove = [path, originalPath].filter(Boolean)
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

  function altValue(item) {
    return altDrafts[item.id] ?? item.alt_text ?? ''
  }

  async function saveAlt(item) {
    const next = altValue(item).trim()
    if (next === (item.alt_text || '')) return

    setSavingAltId(item.id)
    setError('')

    const { error: updateError } = await supabase
      .from('portfolio_items')
      .update({ alt_text: next || null })
      .eq('id', item.id)

    setSavingAltId('')

    if (updateError) {
      setError('Could not save that alt text. Try again.')
      return
    }

    setItems((current) =>
      current.map((entry) =>
        entry.id === item.id ? { ...entry, alt_text: next || null } : entry,
      ),
    )
  }

  return (
    <section className="rounded-lg border border-brand/20 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-xl font-bold text-ink">Uploaded work</h2>
      <p className="mb-6 text-sm text-ink/70">
        Newest first. Edit alt text for the public gallery, or delete anything that
        should not stay on the site.
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
                  src={itemPosterUrl(item) || item.media_url}
                  alt={item.alt_text || item.title || 'Portfolio video'}
                  className="h-40 w-full bg-ink/10 object-cover"
                />
              ) : (
                <img
                  src={item.media_url}
                  alt={item.alt_text || item.title || 'Portfolio item'}
                  className="h-40 w-full object-cover"
                />
              )}
              <div className="flex flex-col gap-3 p-3">
                <div className="flex items-start justify-between gap-3">
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
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-ink/70">Alt text</span>
                  <input
                    type="text"
                    value={altValue(item)}
                    onChange={(event) =>
                      setAltDrafts((current) => ({
                        ...current,
                        [item.id]: event.target.value,
                      }))
                    }
                    onBlur={() => saveAlt(item)}
                    disabled={savingAltId === item.id}
                    className="w-full rounded-md border border-brand/30 bg-white px-3 py-2 text-sm text-ink"
                  />
                </label>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

export default AdminManage
