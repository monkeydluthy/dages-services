import { useEffect, useState } from 'react'

function useGoogleReviews() {
  const [reviews, setReviews] = useState(null)

  useEffect(() => {
    let cancelled = false

    fetch('/.netlify/functions/google-reviews')
      .then((response) => {
        if (!response.ok) throw new Error('reviews unavailable')
        return response.json()
      })
      .then((payload) => {
        if (
          cancelled ||
          !payload?.rating ||
          !payload?.userRatingsTotal
        ) {
          return
        }
        setReviews(payload)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  return reviews
}

export default useGoogleReviews
