import { Helmet } from 'react-helmet-async'
import siteConfig from '../config/siteConfig.json'

function telephoneToSchema(phone) {
  const digits = String(phone).replace(/\D/g, '')
  const national =
    digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
  return `+1-${national.slice(0, 3)}-${national.slice(3, 6)}-${national.slice(6)}`
}

export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: siteConfig.businessName,
    url: 'https://dagesservices.com',
    telephone: telephoneToSchema(siteConfig.phone),
    areaServed: siteConfig.cities.map((name) => ({
      '@type': 'City',
      name,
    })),
    sameAs: [
      `https://www.google.com/maps/place/?q=place_id:${siteConfig.google.placeId}`,
    ],
  }
}

function LocalBusinessSchema() {
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(localBusinessJsonLd())}</script>
    </Helmet>
  )
}

export default LocalBusinessSchema
