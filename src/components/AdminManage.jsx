import { useEffect, useState } from 'react'
import siteConfig from '../config/siteConfig.json'
import { itemPosterUrl, storagePathFromPublicUrl, videoPosterPath } from '../lib/portfolioMedia'
import { supabase } from '../lib/supabaseClient'

const NO_CITY = ''

function CityOptions() {
  return (
    <>
      <option value={NO_CITY}>No specific city</option>
      {siteConfig.cities.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </>
  )
}

function AdminManage({ refreshKey = 0 }) {
  const [items, setItems] = useState([])
  const [altDrafts, setAltDrafts] = useState({})
  const [savingAltId, setSavingAltId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkCity, setBulkCity] = useState(NO_CITY)
  const [savingCityIds, setSavingCityIds] = useState([])
  const [cityNotice, setCityNotice] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadItems() {
      setLoading(true)
      setError('')

      const { data, error: queryError } = await supabase
        .from('portfolio_items')
        .select('id, title, media_type, media_url, original_media_url, job_type, city, created_at, alt_text, poster_url, width, height')
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (queryError) {
        const withMeta = await supabase
          .from('portfolio_items')
          .select('id, title, media_type, media_url, job_type, city, created_at, alt_text, poster_url, width, height')
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
    setSelectedIds((current) => current.filter((id) => id !== item.id))
  }

  async function applyCity(ids, nextCity) {
    if (ids.length === 0) return false
    const value = nextCity || null

    setSavingCityIds(ids)
    setError('')
    setCityNotice('')

    const { error: updateError } = await supabase
      .from('portfolio_items')
      .update({ city: value })
      .in('id', ids)

    setSavingCityIds([])

    if (updateError) {
      setError('Could not save the city. Try again.')
      return false
    }

    const idSet = new Set(ids)
    setItems((current) =>
      current.map((entry) => (idSet.has(entry.id) ? { ...entry, city: value } : entry)),
    )
    return true
  }

  async function applyBulkCity() {
    const ids = selectedIds
    const ok = await applyCity(ids, bulkCity)
    if (!ok) return
    setSelectedIds([])
    setCityNotice(
      `${ids.length} item${ids.length === 1 ? '' : 's'} ${
        bulkCity ? `set to ${bulkCity}` : 'cleared to no city'
      }.`,
    )
  }

  function toggleSelected(id) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    )
  }

  const untaggedCount = items.filter((item) => !item.city).length
  const visibleItems = filter === 'untagged' ? items.filter((item) => !item.city) : items
  const allVisibleSelected =
    visibleItems.length > 0 && visibleItems.every((item) => selectedIds.includes(item.id))

  function toggleSelectAllVisible() {
    if (allVisibleSelected) {
      const visibleIds = new Set(visibleItems.map((item) => item.id))
      setSelectedIds((current) => current.filter((id) => !visibleIds.has(id)))
    } else {
      setSelectedIds((current) => [
        ...new Set([...current, ...visibleItems.map((item) => item.id)]),
      ])
    }
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
        Newest first. Set the city so photos show on that area page, edit alt
        text, or delete anything that should not stay on the site.
      </p>
      {items.length > 0 ? (
        <div className="mb-4 grid grid-cols-2 gap-2" role="group" aria-label="Filter uploads">
          {[
            { key: 'all', label: `All (${items.length})` },
            { key: 'untagged', label: `Untagged (${untaggedCount})` },
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              aria-pressed={filter === option.key}
              onClick={() => setFilter(option.key)}
              className={`min-h-11 rounded-md border px-3 py-2 text-sm font-semibold ${
                filter === option.key
                  ? 'border-brand bg-brand text-brandTint'
                  : 'border-brand/30 bg-white text-ink'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
      {items.length > 0 ? (
        <div className="sticky top-0 z-10 mb-4 grid gap-2 rounded-lg border border-brand/20 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-ink">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAllVisible}
                className="h-6 w-6 shrink-0 accent-brand"
              />
              Select all shown
            </label>
            <span className="text-sm text-ink/70">{selectedIds.length} selected</span>
          </div>
          {selectedIds.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
              <select
                aria-label="City for selected items"
                value={bulkCity}
                onChange={(event) => setBulkCity(event.target.value)}
                className="min-h-11 w-full min-w-0 rounded-md border border-brand/30 bg-white px-3 py-2 text-base text-ink"
              >
                <CityOptions />
              </select>
              <button
                type="button"
                disabled={savingCityIds.length > 0}
                onClick={applyBulkCity}
                className="min-h-11 rounded-md bg-brand px-4 py-2 font-semibold text-brandTint hover:opacity-90 disabled:opacity-60"
              >
                {savingCityIds.length > 0 ? 'Saving…' : `Apply to ${selectedIds.length}`}
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="min-h-11 rounded-md border border-brand/30 bg-white px-4 py-2 font-semibold text-ink"
              >
                Clear
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
      {cityNotice ? (
        <p className="mb-4 text-sm font-medium text-brand" role="status">
          {cityNotice}
        </p>
      ) : null}
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
      {items.length > 0 && visibleItems.length === 0 ? (
        <p className="text-sm text-ink/70">Every item has a city.</p>
      ) : null}
      {visibleItems.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {visibleItems.map((item) => (
            <li
              key={item.id}
              className={`relative overflow-hidden rounded-lg border bg-brandTint ${
                selectedIds.includes(item.id) ? 'border-brand ring-2 ring-brand' : 'border-brand/20'
              }`}
            >
              <label className="absolute left-2 top-2 z-[1] flex h-11 w-11 items-center justify-center rounded-md bg-white/90 shadow">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => toggleSelected(item.id)}
                  aria-label={`Select ${item.title || 'item'}`}
                  className="h-6 w-6 accent-brand"
                />
              </label>
              <span
                className={`absolute right-2 top-2 z-[1] max-w-[60%] truncate rounded-full px-3 py-1 text-xs font-semibold shadow ${
                  item.city ? 'bg-brand text-brandTint' : 'bg-amber-300 text-ink'
                }`}
              >
                {item.city || 'No city'}
              </span>
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
                  <span className="mb-1 block text-xs font-medium text-ink/70">City</span>
                  <select
                    value={item.city || NO_CITY}
                    disabled={savingCityIds.includes(item.id)}
                    onChange={(event) => applyCity([item.id], event.target.value)}
                    className="min-h-11 w-full min-w-0 rounded-md border border-brand/30 bg-white px-3 py-2 text-base text-ink disabled:opacity-60"
                  >
                    <CityOptions />
                  </select>
                </label>
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
