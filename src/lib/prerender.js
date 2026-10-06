// Netlify's prerenderer doesn't document its user agent or inject anything on window,
// so this is a layered best guess: crawler/prerender UAs plus headless/automation flags.
const BOT_UA = /bot|crawl|spider|slurp|prerender|headless|facebookexternalhit/i

export function isPrerenderContext() {
  if (typeof navigator === 'undefined') return false
  return BOT_UA.test(navigator.userAgent) || navigator.webdriver === true
}

// index.html sets window.prerenderReady = false on '/'; flip it once the content
// that must be in the snapshot has settled.
export function markPrerenderReady() {
  if (typeof window !== 'undefined') window.prerenderReady = true
}
