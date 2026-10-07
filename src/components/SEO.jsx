import { useLayoutEffect } from 'react'
import { Helmet } from 'react-helmet-async'

export const SITE_CANONICAL = 'https://dagesservices.com/'

export const HOME_SEO = {
  title: 'Tree Service in Plant City, FL | Dages Services',
  description:
    'Tree removal, trimming, stump grinding, storm cleanup, and crane work in Plant City and greater Tampa Bay. Request a quote — Joseph calls back.',
  canonical: SITE_CANONICAL,
}

export const HOME_OG = {
  title: 'Dages Services — Tree Service in Plant City, FL',
  description:
    'Tree removal, trimming, stump grinding, storm cleanup, and crane work in Plant City and greater Tampa Bay.',
  image: 'https://dagesservices.com/og-image.png',
  url: SITE_CANONICAL,
  siteName: 'Dages Services, LLC',
}

function upsertCanonical(href) {
  const extras = [...document.querySelectorAll('link[rel="canonical"]')]
  let link = extras[0]
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
  extras.slice(1).forEach((el) => el.remove())
}

function upsertMeta(attr, key, content) {
  const all = [...document.querySelectorAll(`meta[${attr}="${key}"]`)]
  let el = all[0]
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
  all.slice(1).forEach((node) => node.remove())
}

function SEO({
  title = HOME_SEO.title,
  description = HOME_SEO.description,
  canonical = SITE_CANONICAL,
}) {
  const isHome = canonical === SITE_CANONICAL
  const ogTitle = isHome ? HOME_OG.title : title
  const ogDescription = isHome ? HOME_OG.description : description
  const ogUrl = isHome ? HOME_OG.url : canonical

  useLayoutEffect(() => {
    upsertCanonical(canonical)
    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:title', ogTitle)
    upsertMeta('property', 'og:description', ogDescription)
    upsertMeta('property', 'og:image', HOME_OG.image)
    upsertMeta('property', 'og:url', ogUrl)
    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:site_name', HOME_OG.siteName)
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', ogTitle)
    upsertMeta('name', 'twitter:description', ogDescription)
    upsertMeta('name', 'twitter:image', HOME_OG.image)
  }, [canonical, description, ogDescription, ogTitle, ogUrl])

  return (
    <Helmet>
      <title>{title}</title>
    </Helmet>
  )
}

export default SEO
