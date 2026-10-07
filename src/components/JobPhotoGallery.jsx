import { useEffect, useState } from 'react'
import { markPrerenderReady } from '../lib/prerender'
import { supabase } from '../lib/supabaseClient'
import { GalleryLightbox, GalleryThumb } from './PortfolioGallery'

const SELECT =
  'id, title, media_type, media_url, sort_order, created_at, width, height, poster_url, alt_text, job_type, city'
const SELECT_BASIC = 'id, title, media_type, media_url, sort_order, created_at, job_type'

function JobPhotoGallery({ jobType, city, heading = 'Recent work' }) {
  const [items, setItems] = useState([])
  const [ready, setReady] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      let query = supabase
        .from('portfolio_items')
        .select(SELECT)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(16)

      if (jobType) query = query.eq('job_type', jobType)
      if (city) query = query.eq('city', city)

      const { data, error } = await query
      if (cancelled) return

      if (!error) {
        setItems(data ?? [])
        setReady(true)
        return
      }

      if (city) {
        setItems([])
        setReady(true)
        return
      }

      let fallback = supabase
        .from('portfolio_items')
        .select(SELECT_BASIC)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(16)

      if (jobType) fallback = fallback.eq('job_type', jobType)

      const result = await fallback
      if (cancelled) return
      setItems(result.error ? [] : (result.data ?? []))
      setReady(true)
    }

    load().catch(() => {
      if (!cancelled) setReady(true)
    })

    return () => {
      cancelled = true
    }
  }, [city, jobType])

  useEffect(() => {
    if (ready) markPrerenderReady()
  }, [ready])

  if (!ready) {
    return <div className="min-h-[12rem]" aria-hidden="true" />
  }

  if (items.length === 0) {
    return (
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <h2 className="mb-3 text-2xl font-bold text-ink sm:text-3xl">{heading}</h2>
          <p className="text-sm text-ink/70">
            Photos from this kind of job will show up here as we add them.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <h2 className="mb-6 text-2xl font-bold text-ink sm:mb-8 sm:text-3xl">{heading}</h2>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {items.map((item, index) => (
            <li key={item.id} className="overflow-hidden rounded-lg bg-brandTint">
              <button
                type="button"
                onClick={() => setViewerIndex(index)}
                className="block w-full text-left hover:opacity-90"
                aria-label={`Open ${item.alt_text || item.title || 'recent work'}`}
              >
                <GalleryThumb item={item} />
              </button>
            </li>
          ))}
        </ul>
      </div>
      {viewerIndex !== null ? (
        <GalleryLightbox
          items={items}
          index={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onChange={setViewerIndex}
        />
      ) : null}
    </section>
  )
}

export default JobPhotoGallery
