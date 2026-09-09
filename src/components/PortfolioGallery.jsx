import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const PAGE_SIZE = 8
const ITEM_LIMIT = 24

function chunkItems(items, size) {
  const pages = []
  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size))
  }
  return pages
}

function PlayIcon() {
  return (
    <svg className="h-12 w-12 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.5v13l11-6.5L8 5.5Z" />
    </svg>
  )
}

function GalleryMedia({ item }) {
  const [playing, setPlaying] = useState(false)
  const alt = item.title || 'Recent work'

  if (item.media_type !== 'video') {
    return <img src={item.media_url} alt={alt} className="aspect-square w-full object-cover" />
  }

  if (playing) {
    return (
      <video
        src={item.media_url}
        controls
        autoPlay
        playsInline
        className="aspect-square w-full object-cover"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="relative block w-full"
      aria-label={`Play ${alt}`}
    >
      <video
        src={item.media_url}
        muted
        preload="metadata"
        className="pointer-events-none aspect-square w-full object-cover"
      />
      <span className="absolute inset-0 flex items-center justify-center bg-ink/35">
        <PlayIcon />
      </span>
    </button>
  )
}

function PortfolioGallery() {
  const [items, setItems] = useState([])
  const [ready, setReady] = useState(false)
  const [page, setPage] = useState(0)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('portfolio_items')
      .select('id, title, media_type, media_url, sort_order, created_at')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(ITEM_LIMIT)
      .then(({ data, error }) => {
        if (cancelled) return
        setItems(error ? [] : (data ?? []))
        setReady(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (!ready || items.length === 0) {
    return null
  }

  const pages = chunkItems(items, PAGE_SIZE)
  const lastPage = pages.length - 1
  const showPager = lastPage > 0

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <h2 className="text-2xl font-bold text-ink sm:text-3xl">Recent Work</h2>
          {showPager ? (
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                className="rounded-md border border-brand/30 bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-brandTint disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page === lastPage}
                onClick={() => setPage((current) => Math.min(lastPage, current + 1))}
                className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-brandTint hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          ) : null}
        </div>

        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${page * 100}%)` }}
          >
            {pages.map((pageItems, pageIndex) => (
              <ul
                key={pageIndex}
                className="grid w-full min-w-full shrink-0 grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
              >
                {pageItems.map((item) => (
                  <li key={item.id} className="overflow-hidden rounded-lg bg-brandTint">
                    <GalleryMedia item={item} />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default PortfolioGallery
