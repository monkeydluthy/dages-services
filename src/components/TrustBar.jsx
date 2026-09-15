import GoogleReviewBadge from './GoogleReviewBadge'
import siteConfig from '../config/siteConfig.json'

function TrustBar({ reviews }) {
  const showBadge = Boolean(reviews?.rating && reviews?.userRatingsTotal)

  return (
    <section className="border-b border-brand/20 bg-brandTint">
      <ul
        className={`mx-auto grid max-w-5xl items-center gap-4 px-4 py-6 ${
          showBadge ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'
        }`}
      >
        {siteConfig.trustItems.map((item) => (
          <li
            key={item}
            className="flex items-center justify-center text-center text-sm font-medium text-ink"
          >
            {item}
          </li>
        ))}
        {showBadge ? (
          <GoogleReviewBadge
            rating={reviews.rating}
            userRatingsTotal={reviews.userRatingsTotal}
            href={reviews.reviewsUrl}
          />
        ) : null}
      </ul>
    </section>
  )
}

export default TrustBar
