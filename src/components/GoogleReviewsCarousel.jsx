import { useEffect, useState } from 'react'
import StarRating from './StarRating'

function useVisibleCards() {
  const [count, setCount] = useState(1)

  useEffect(() => {
    const sm = window.matchMedia('(min-width: 640px)')
    const lg = window.matchMedia('(min-width: 1024px)')
    const update = () => setCount(lg.matches ? 3 : sm.matches ? 2 : 1)
    update()
    sm.addEventListener('change', update)
    lg.addEventListener('change', update)
    return () => {
      sm.removeEventListener('change', update)
      lg.removeEventListener('change', update)
    }
  }, [])

  return count
}

function ReviewCard({ review }) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-brand/20 bg-white p-5 text-left shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-3">
        <p className="font-semibold text-ink">{review.authorName}</p>
        {review.relativeTime ? (
          <p className="shrink-0 text-xs text-ink/50">{review.relativeTime}</p>
        ) : null}
      </div>
      <StarRating rating={review.rating} />
      {review.text ? (
        <p className="mt-3 min-h-[5.75rem] line-clamp-4 text-sm leading-relaxed text-ink/70">
          {review.text}
        </p>
      ) : (
        <div className="mt-3 min-h-[5.75rem]" />
      )}
    </article>
  )
}

function GoogleReviewsCarousel({ data }) {
  const reviews = data?.reviews?.slice(0, 5) ?? []
  const visible = useVisibleCards()
  const maxIndex = Math.max(0, reviews.length - visible)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    setIndex((current) => Math.min(current, maxIndex))
  }, [maxIndex])

  useEffect(() => {
    if (paused || maxIndex === 0) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current >= maxIndex ? 0 : current + 1))
    }, 5000)

    return () => window.clearInterval(timer)
  }, [paused, maxIndex])

  if (!data?.rating || !data?.userRatingsTotal || reviews.length === 0) {
    return null
  }

  const stepPercent = 100 / visible

  return (
    <section className="border-t border-brand/20 bg-brandTint px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-2xl font-bold text-ink sm:text-3xl">
          What Our Customers Say
        </h2>
        <div className="mt-4 flex flex-col items-center gap-2">
          <StarRating rating={data.rating} size="lg" />
          <p className="text-sm font-medium text-ink">
            {data.rating.toFixed(1)}{' '}
            <span className="font-normal text-ink/70">
              ({data.userRatingsTotal} reviews on Google)
            </span>
          </p>
          <a
            href={data.writeReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-brandTint hover:opacity-90"
          >
            Leave a Review
          </a>
        </div>

        <div
          className="mt-8 overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${index * stepPercent}%)` }}
          >
            {reviews.map((review) => (
              <div
                key={`${review.authorName}-${review.relativeTime}`}
                className="w-full shrink-0 px-1.5 sm:w-1/2 lg:w-1/3"
              >
                <ReviewCard review={review} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default GoogleReviewsCarousel
