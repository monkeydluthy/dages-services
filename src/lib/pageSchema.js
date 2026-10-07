import { localBusinessJsonLd } from '../components/LocalBusinessSchema'
import { SITE_ORIGIN } from '../config/pages'

export function absoluteUrl(path) {
  return `${SITE_ORIGIN}${path}`
}

export function breadcrumbJsonLd(crumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => {
      const item = {
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
      }
      if (crumb.path) item.item = absoluteUrl(crumb.path)
      return item
    }),
  }
}

export function serviceJsonLd(page) {
  const provider = localBusinessJsonLd()
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: page.jobType || page.h1,
    description: page.metaDescription,
    url: absoluteUrl(`/services/${page.slug}`),
    provider: {
      '@type': provider['@type'],
      name: provider.name,
      url: provider.url,
      telephone: provider.telephone,
    },
    areaServed: provider.areaServed,
  }
}

export function pageFaqJsonLd(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
