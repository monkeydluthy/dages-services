import { useEffect, useState } from 'react'

function useGoogleReviews() {
  const [reviews, setReviews] = useState(null)

  useEffect(() => {
    let cancelled = false

    fetch('/.netlify/functions/google-reviews')
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => null)
          throw Object.assign(new Error('reviews unavailable'), {
            status: response.status,
            body,
          })
        }
        return response.json()
      })
      .then((payload) => {
        if (cancelled) return
        if (
          !payload?.rating ||
          !payload?.userRatingsTotal ||
          !Array.isArray(payload.reviews) ||
          payload.reviews.length === 0
        ) {
          console.error('[reviews] Feed returned no reviews; hiding the reviews section.', {
            rating: payload?.rating,
            total: payload?.userRatingsTotal,
          })
          return
        }
        setReviews(payload)
      })
      .catch((error) => {
        console.error('[reviews] Failed to load reviews; hiding the reviews section.', {
          status: error.status,
          response: error.body,
          message: error.message,
        })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return reviews
}

export default useGoogleReviews
