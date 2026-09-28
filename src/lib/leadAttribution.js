const STORAGE_KEY = 'dages-lead-attribution'

function blankAttribution() {
  return {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    referrer: null,
    landing_path: null,
  }
}

function readParam(params, key) {
  const value = params.get(key)
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export function captureLeadAttribution() {
  if (typeof window === 'undefined') return
  if (window.location.pathname.startsWith('/admin')) return

  try {
    if (sessionStorage.getItem(STORAGE_KEY)) return
  } catch {
    return
  }

  const params = new URLSearchParams(window.location.search)
  const attribution = {
    utm_source: readParam(params, 'utm_source'),
    utm_medium: readParam(params, 'utm_medium'),
    utm_campaign: readParam(params, 'utm_campaign'),
    referrer: document.referrer.trim() || null,
    landing_path: window.location.pathname || '/',
  }

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution))
  } catch {
    // Ignore quota / private-mode failures; the form still submits.
  }
}

export function getLeadAttribution() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return blankAttribution()
    const parsed = JSON.parse(raw)
    return {
      utm_source: parsed.utm_source || null,
      utm_medium: parsed.utm_medium || null,
      utm_campaign: parsed.utm_campaign || null,
      referrer: parsed.referrer || null,
      landing_path: parsed.landing_path || null,
    }
  } catch {
    return blankAttribution()
  }
}
