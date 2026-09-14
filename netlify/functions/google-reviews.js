const CACHE_TTL_MS = 6 * 60 * 60 * 1000
const PLACE_ID_FALLBACK = 'ChIJRw7C8K0z3YgRnjTrItZ1M2g'

let cache = { expiresAt: 0, payload: null }

function json(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  }
}

function cacheHeaders() {
  return {
    'Cache-Control': 'public, max-age=300',
    'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=21600, stale-while-revalidate=86400',
  }
}

function writeReviewUrl(placeId) {
  return `https://search.google.com/local/writereview?placeid=${placeId}`
}

function reviewsUrl(placeId) {
  return `https://search.google.com/local/reviews?placeid=${placeId}`
}

function shapePayload(placeId, result) {
  const reviews = Array.isArray(result.reviews)
    ? result.reviews.slice(0, 5).map((review) => ({
        authorName: review.author_name || 'Google user',
        rating: Number(review.rating) || 0,
        relativeTime: review.relative_time_description || '',
        text: review.text || '',
      }))
    : []

  return {
    rating: Number(result.rating) || 0,
    userRatingsTotal: Number(result.user_ratings_total) || 0,
    mapsUrl: result.url || reviewsUrl(placeId),
    reviewsUrl: reviewsUrl(placeId),
    writeReviewUrl: writeReviewUrl(placeId),
    reviews,
  }
}

async function fetchPlaceDetails(placeId, apiKey) {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: 'rating,user_ratings_total,url,reviews',
    reviews_sort: 'newest',
    key: apiKey,
  })

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?${params}`,
    { signal: AbortSignal.timeout(8000) },
  )

  if (!response.ok) {
    throw new Error(`Places HTTP ${response.status}`)
  }

  const data = await response.json()
  if (data.status !== 'OK' || !data.result) {
    throw new Error(`Places ${data.status || 'UNKNOWN'}`)
  }

  return data.result
}

export async function handler(event) {
  if (event.httpMethod && event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed' })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const placeId = process.env.GOOGLE_PLACE_ID || PLACE_ID_FALLBACK

  if (!apiKey) {
    return json(503, { error: 'not configured' })
  }

  if (cache.payload && cache.expiresAt > Date.now()) {
    return json(200, cache.payload, cacheHeaders())
  }

  try {
    const result = await fetchPlaceDetails(placeId, apiKey)
    const payload = shapePayload(placeId, result)

    if (!payload.rating || !payload.userRatingsTotal) {
      return json(502, { error: 'no reviews' })
    }

    cache = { expiresAt: Date.now() + CACHE_TTL_MS, payload }
    return json(200, payload, cacheHeaders())
  } catch (error) {
    console.error('google-reviews:', error.message)
    return json(502, { error: 'unavailable' })
  }
}
