import { useEffect, useRef, useState } from 'react'

function WhenVisible({ children, fallback = null, rootMargin = '400px' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

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
