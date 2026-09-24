import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { videoPosterUrl } from '../lib/portfolioMedia'
import { supabase } from '../lib/supabaseClient'

const PAGE_SIZE = 8
const ITEM_LIMIT = 24

function chunkItems(items, size) {
  const pages = []
  for (let start = 0; start < items.length; start += size) {
    pages.push(items.slice(start, start + size))
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
  const [posterFailed, setPosterFailed] = useState(false)

  if (item.media_type === 'video') {
    const poster = videoPosterUrl(item.media_url)
    const showPoster = Boolean(poster) && !posterFailed

    return (
      <span className="relative block aspect-square bg-ink/10">
        {showPoster ? (
          <img
            src={poster}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setPosterFailed(true)}
          />
        ) : (
          <video
            src={`${item.media_url}#t=0.1`}
            muted
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-ink/35">
          <PlayIcon />
        </span>
      </span>
    )
  }

  return <img src={item.media_url} alt="" className="aspect-square w-full object-cover" />
}

function CloseIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 5 8 12l7 7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m9 5 7 7-7 7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const lightboxControlClass =
  'absolute z-[81] flex items-center justify-center rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white'

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
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onClose()
        }}
        className={`${lightboxControlClass} right-3 top-3 sm:right-5 sm:top-5`}
        aria-label="Close"
      >
        <CloseIcon />
      </button>
      {hasPrev ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onChange(index - 1)
          }}
          className={`${lightboxControlClass} left-2 top-1/2 -translate-y-1/2 sm:left-4`}
          aria-label="Previous"
        >
          <ChevronLeftIcon />
        </button>
      ) : null}
      {hasNext ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onChange(index + 1)
          }}
          className={`${lightboxControlClass} right-2 top-1/2 -translate-y-1/2 sm:right-4`}
          aria-label="Next"
        >
          <ChevronRightIcon />
        </button>
      ) : null}
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
        <p className="mt-2 text-center text-sm text-white/80">
          {item.title || 'Recent work'}
          {items.length > 1 ? ` · ${index + 1} of ${items.length}` : ''}
        </p>
      </div>
    </div>
  )
}

function PortfolioGallery() {
  const [items, setItems] = useState([])
  const [ready, setReady] = useState(false)
  const [page, setPage] = useState(0)
  const [viewerIndex, setViewerIndex] = useState(null)
  const [trackHeight, setTrackHeight] = useState(null)
  const pageRefs = useRef([])

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

  const pages = chunkItems(items, PAGE_SIZE)
  const lastPage = Math.max(0, pages.length - 1)
  const currentPage = Math.min(page, lastPage)
  const showPager = lastPage > 0

  useLayoutEffect(() => {
    const el = pageRefs.current[currentPage]
    if (!el) return undefined

    const updateHeight = () => {
      setTrackHeight(el.getBoundingClientRect().height)
    }

    updateHeight()
    const observer = new ResizeObserver(updateHeight)
    observer.observe(el)
    return () => observer.disconnect()
  }, [currentPage, items])

  if (!ready || items.length === 0) {
    return null
  }

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <h2 className="text-2xl font-bold text-ink sm:text-3xl">Recent Work</h2>
          {showPager ? (
            <div className="flex gap-2">
              <button
                type="button"
                disabled={currentPage === 0}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                className="rounded-md border border-brand/30 bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-brandTint disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage === lastPage}
                onClick={() => setPage((current) => Math.min(lastPage, current + 1))}
                className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-brandTint hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          ) : null}
        </div>

        <div
          className="overflow-hidden transition-[height] duration-500 ease-out"
          style={trackHeight != null ? { height: `${trackHeight}px` } : undefined}
        >
          <div
            className="flex items-start transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentPage * 100}%)` }}
          >
            {pages.map((pageItems, pageIndex) => (
              <ul
                key={pageIndex}
                ref={(node) => {
                  pageRefs.current[pageIndex] = node
                }}
                className="flex w-full min-w-full shrink-0 flex-wrap justify-center gap-3 md:gap-4"
              >
                {pageItems.map((item) => {
                  const itemIndex = items.findIndex((entry) => entry.id === item.id)
                  return (
                    <li
                      key={item.id}
                      className="min-w-0 shrink-0 basis-[calc((100%-0.75rem)/2)] overflow-hidden rounded-lg bg-brandTint md:basis-[calc((100%-3rem)/4)]"
                    >
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
