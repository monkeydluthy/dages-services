const STAR_PATH =
  'M12 3.2 14.5 8.6l6 .9-4.3 4.2 1 5.9L12 16.8 6.8 19.6l1-5.9L3.5 9.5l6-.9L12 3.2Z'

function Star({ fill, sizeClass }) {
  const width = `${Math.max(0, Math.min(1, fill)) * 100}%`

  return (
    <span className={`relative inline-block ${sizeClass}`} aria-hidden="true">
      <svg
        className={`absolute inset-0 ${sizeClass} text-brand/20`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d={STAR_PATH} />
      </svg>
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width }}>
        <svg
          className={`${sizeClass} text-amber-500`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d={STAR_PATH} />
        </svg>
      </span>
    </span>
  )
}

function StarRating({ rating, size = 'sm' }) {
  const sizeClass = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
  const value = Number(rating) || 0

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} fill={value - index} sizeClass={sizeClass} />
      ))}
    </span>
  )
}

export default StarRating
