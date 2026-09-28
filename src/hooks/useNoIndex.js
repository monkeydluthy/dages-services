import { useEffect } from 'react'

function useNoIndex(enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined

    const existing = document.querySelector('meta[name="robots"]')
    const meta = existing ?? document.createElement('meta')
    const previous = existing?.getAttribute('content') ?? null

    meta.setAttribute('name', 'robots')
    meta.setAttribute('content', 'noindex')
    if (!existing) document.head.appendChild(meta)

    return () => {
      if (existing) {
        if (previous == null) meta.removeAttribute('content')
        else meta.setAttribute('content', previous)
      } else {
        meta.remove()
      }
    }
  }, [enabled])
}

export default useNoIndex
