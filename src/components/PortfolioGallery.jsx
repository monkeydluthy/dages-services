import { useEffect, useState } from 'react'
import { videoPosterUrl } from '../lib/portfolioMedia'
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

function GalleryThumb({ item }) {
  if (item.media_type === 'video') {
    const poster = videoPosterUrl(item.media_url)
    return (
      <span className="relative block bg-ink/10">
        {poster ? (
          <img src={poster} alt="" className="aspect-square w-full object-cover" />
        ) : null}
        <span className="absolute inset-0 flex items-center justify-center bg-ink/35">
          <PlayIcon />
        </span>
      </span>
    )
  }

  return <img src={item.media_url} alt="" className="aspect-square w-full object-cover" />
}

function GalleryLightbox({ items, index, onClose, onChange }) {
  const item = items[index]
  const hasPrev = index > 0
  const hasNext = index < items.length - 1
  const alt = item?.title || 'Recent work'

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKey(event) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft' && hasPrev) onChange(index - 1)
      if (event.key === 'ArrowRight' && hasNext) onChange(index + 1)
    }

    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [hasNext, hasPrev, index, onChange, onClose])

  if (!item) return null

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/80 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <div
        className="relative max-h-full w-full max-w-4xl"
        onClick={(event) => event.stopPropagation()}
      >
        {item.media_type === 'video' ? (
          <video
            key={item.id}
            src={item.media_url}
            poster={videoPosterUrl(item.media_url) || undefined}
            controls
            autoPlay
            playsInline
            className="max-h-[80vh] w-full rounded-lg bg-ink object-contain"
          />
        ) : (
          <img
            src={item.media_url}
            alt={alt}
            className="mx-auto max-h-[80vh] w-auto max-w-full rounded-lg object-contain"
          />
        )}
        <p className="mt-2 text-center text-sm text-brandTint">
          {item.title || 'Recent work'}
          {items.length > 1 ? ` · ${index + 1} of ${items.length}` : ''}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="absolute -right-1 -top-3 rounded-full bg-white px-3 py-1 text-sm font-semibold text-ink shadow"
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

function PortfolioGallery() {
  const [items, setItems] = useState([])
  const [ready, setReady] = useState(false)
  const [page, setPage] = useState(0)
  const [viewerIndex, setViewerIndex] = useState(null)

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
                {pageItems.map((item) => {
                  const itemIndex = items.findIndex((entry) => entry.id === item.id)
                  return (
                    <li key={item.id} className="overflow-hidden rounded-lg bg-brandTint">
                      <button
                        type="button"
                        onClick={() => setViewerIndex(itemIndex)}
                        className="block w-full text-left hover:opacity-90"
                        aria-label={`Open ${item.title || 'recent work'}`}
                      >
                        <GalleryThumb item={item} />
                      </button>
                    </li>
                  )
                })}
              </ul>
            ))}
          </div>
        </div>
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

export default PortfolioGallery
