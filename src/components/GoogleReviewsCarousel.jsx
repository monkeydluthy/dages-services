import useGoogleReviews from '../hooks/useGoogleReviews'
import StarRating from './StarRating'

function ReviewCard({ review }) {
  return (
    <article className="flex w-[265px] shrink-0 snap-start sm:w-[320px] flex-col rounded-lg border border-brand/20 bg-white p-5 text-left shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-3">
        <p className="font-semibold text-ink">{review.authorName}</p>
        {review.relativeTime ? (
          <p className="shrink-0 text-xs text-ink/70">{review.relativeTime}</p>
        ) : null}
      </div>
      <StarRating rating={review.rating} />
      {review.text ? (
        <p className="mt-3 min-h-[5.75rem] text-sm leading-relaxed text-ink/70">
          {review.text}
        </p>
      ) : (
        <div className="mt-3 min-h-[5.75rem]" />
      )}
    </article>
  )
}

function GoogleReviewsCarousel() {
  const data = useGoogleReviews()
  const reviews = data?.reviews ?? []

  if (!data?.rating || !data?.userRatingsTotal || reviews.length === 0) {
    return null
  }

  return (
    <section className="border-b border-brand/20 bg-brandTint px-4 py-12 sm:py-16">
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
          className="mt-8 flex snap-x snap-mandatory flex-nowrap gap-3 overflow-x-auto overflow-y-hidden px-1 pb-4 [-webkit-overflow-scrolling:touch] [overscroll-behavior-x:contain] sm:gap-5"
          role="region"
          aria-label="Google reviews"
          tabIndex={0}
        >
          {reviews.map((review, index) => (
            <ReviewCard key={`${index}-${review.authorName}`} review={review} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default GoogleReviewsCarousel
