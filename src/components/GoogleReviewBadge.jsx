import StarRating from './StarRating'

function GoogleReviewBadge({ rating, userRatingsTotal, href }) {
  if (!rating || !userRatingsTotal || !href) return null

  const label = `${rating.toFixed(1)} (${userRatingsTotal} Google Reviews)`

  return (
    <li className="flex items-center justify-center text-center">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex flex-col items-center justify-center gap-1 text-sm font-medium text-ink hover:opacity-80"
      >
        <StarRating rating={rating} />
        <span>{label}</span>
      </a>
    </li>
  )
}

export default GoogleReviewBadge
