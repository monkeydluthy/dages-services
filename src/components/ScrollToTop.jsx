import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// BrowserRouter has no built-in <ScrollRestoration> (that needs a data router),
// so this handles it:
// - new pathname (link click / navigate): jump to the top, instantly
// - URL with a hash: scroll to that element once the route has rendered
// - back/forward: restore the position the page had when you left it
const STORAGE_KEY = 'scroll-positions'
const RETRY_MS = 2000

function loadPositions() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

function savePositions(positions) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions))
  } catch {
    // storage unavailable (private mode etc.): restoration just won't survive reloads
  }
}

// Entries the router didn't create (first page load, native hash jumps) all share
// key "default", so qualify those with the URL.
function entryId({ key, pathname, search, hash }) {
  return key === 'default' ? `default:${pathname}${search}${hash}` : key
}

function findHashTarget(hash) {
  const id = decodeURIComponent(hash.slice(1))
  return id ? document.getElementById(id) : null
}

function isInitialReloadOrBackForward() {
  const [nav] = performance.getEntriesByType?.('navigation') ?? []
  return nav?.type === 'reload' || nav?.type === 'back_forward'
}

function ScrollToTop() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const positions = useRef(null)
  const currentId = useRef(null)
  const prevPathname = useRef(null)

  if (positions.current === null) positions.current = loadPositions()

  // Take over from the browser so it doesn't fight the restore logic below.
  useEffect(() => {
    if (!('scrollRestoration' in window.history)) return
    const previous = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    return () => {
      window.history.scrollRestoration = previous
    }
  }, [])

  // Remember the scroll position of whichever history entry is showing.
  useEffect(() => {
    let frame = 0
    function onScroll() {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        if (currentId.current) positions.current[currentId.current] = window.scrollY
      })
    }
    function onPageHide() {
      savePositions(positions.current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pagehide', onPageHide)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pagehide', onPageHide)
    }
  }, [])

  useLayoutEffect(() => {
    const id = entryId(location)
    const isFirstRender = prevPathname.current === null
    const pathnameChanged = prevPathname.current !== location.pathname
    prevPathname.current = location.pathname
    currentId.current = id
    savePositions(positions.current)

    const saved = positions.current[id]
    const shouldRestore =
      navigationType === 'POP' &&
      typeof saved === 'number' &&
      (!isFirstRender || isInitialReloadOrBackForward())

    // Content may still be loading (lazy routes, images), so keep trying for a bit.
    let frame = 0
    const deadline = performance.now() + RETRY_MS
    function retry(attempt) {
      if (attempt() || performance.now() > deadline) return
      frame = requestAnimationFrame(() => retry(attempt))
    }

    if (shouldRestore) {
      retry(() => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight
        const done = maxScroll >= saved
        if (done || performance.now() > deadline) window.scrollTo(0, Math.min(saved, maxScroll))
        else window.scrollTo(0, Math.max(0, maxScroll))
        return done
      })
    } else if (location.hash) {
      retry(() => {
        const target = findHashTarget(location.hash)
        if (target) target.scrollIntoView({ block: 'start' })
        return Boolean(target)
      })
    } else if (pathnameChanged && !isFirstRender) {
      window.scrollTo(0, 0)
    }

    return () => cancelAnimationFrame(frame)
  }, [location, navigationType])

  return null
}

export default ScrollToTop
