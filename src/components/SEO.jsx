import { Helmet } from 'react-helmet-async'

export const SITE_CANONICAL = 'https://dagesservices.com/'

export const HOME_SEO = {
  title: 'Tree Service in Plant City, FL | Dages Services',
  description:
    'Tree removal, trimming, stump grinding, storm cleanup, and crane work in Plant City and greater Tampa Bay. Request a quote — Joseph calls back.',
  canonical: SITE_CANONICAL,
}

function SEO({
  title = HOME_SEO.title,
  description = HOME_SEO.description,
}) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={SITE_CANONICAL} />
    </Helmet>
  )
}

export default SEO
