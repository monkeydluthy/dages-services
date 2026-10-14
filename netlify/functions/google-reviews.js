const CACHE_TTL_MS = 6 * 60 * 60 * 1000
const PLACE_ID_FALLBACK = 'ChIJRw7C8K0z3YgRnjTrItZ1M2g'

let cache = { expiresAt: 0, payload: null }

function json(status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  })
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

function shapePayload(placeId, place) {
  const reviews = Array.isArray(place.reviews)
    ? place.reviews.map((review) => ({
        authorName: review.authorAttribution?.displayName || 'Google user',
        rating: Number(review.rating) || 0,
        relativeTime: review.relativePublishTimeDescription || '',
        text:
          (typeof review.text === 'object' && review.text?.text) ||
          (typeof review.text === 'string' ? review.text : '') ||
          '',
      }))
    : []

  return {
    rating: Number(place.rating) || 0,
    userRatingsTotal: Number(place.userRatingCount) || 0,
    mapsUrl: place.googleMapsUri || reviewsUrl(placeId),
    reviewsUrl: reviewsUrl(placeId),
    writeReviewUrl: writeReviewUrl(placeId),
    reviews,
  }
}

// Places API (New). The legacy maps.googleapis.com/maps/api/place/details endpoint
// is not enabled on newer Google Cloud projects and answers REQUEST_DENIED.
async function fetchPlaceDetails(placeId, apiKey) {
  const response = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
    {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'id,rating,userRatingCount,googleMapsUri,reviews',
        'Accept-Language': 'en',
      },
      signal: AbortSignal.timeout(8000),
    },
  )

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const detail = body?.error?.status || body?.error?.message || ''
    throw new Error(`Places HTTP ${response.status} ${detail}`.trim())
  }

  return response.json()
}

export default async (request) => {
  if (request.method && request.method !== 'GET') {
    return json(405, { error: 'Method not allowed' })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const placeId = process.env.GOOGLE_PLACE_ID || PLACE_ID_FALLBACK

  if (!apiKey) {
    console.error('[reviews] GOOGLE_PLACES_API_KEY is not set; homepage reviews section will be hidden')
    return json(503, { error: 'not configured' })
  }

  if (cache.payload && cache.expiresAt > Date.now()) {
    return json(200, cache.payload, cacheHeaders())
  }

  try {
    const place = await fetchPlaceDetails(placeId, apiKey)
    const payload = shapePayload(placeId, place)
    const hasReviews = payload.reviews.length > 0

    console.log(
      `[reviews] cache MISS served by source=places_fallback reviews=${payload.reviews.length} total=${payload.userRatingsTotal}`,
    )

    if (!hasReviews) {
      console.error(
        '[reviews] EMPTY FEED from places_fallback; homepage reviews section will be hidden',
      )
      return json(200, payload, { 'Cache-Control': 'public, max-age=0, s-maxage=60' })
    }

    cache = { expiresAt: Date.now() + CACHE_TTL_MS, payload }
    return json(200, payload, cacheHeaders())
  } catch (error) {
    console.error('[reviews] FAILED source=places_fallback:', error.message)
    return json(502, { error: 'unavailable' })
  }
}
