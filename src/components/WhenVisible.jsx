import { useEffect, useRef, useState } from 'react'
import { isPrerenderContext } from '../lib/prerender'

function WhenVisible({ children, fallback = null, rootMargin = '120px' }) {
  const ref = useRef(null)
  // Prerender snapshots never scroll, so crawlers get the content mounted up front.
  const [visible, setVisible] = useState(isPrerenderContext)

  useEffect(() => {
    const node = ref.current
    if (!node || visible) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setVisible(true)
        observer.disconnect()
      },
      { rootMargin },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [visible, rootMargin])

  return <div ref={ref}>{visible ? children : fallback}</div>
}

export default WhenVisible
