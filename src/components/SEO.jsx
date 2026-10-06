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
}

function SEO({
  title = HOME_SEO.title,
  description = HOME_SEO.description,
}) {
  const alreadyInDocument =
    typeof document !== 'undefined' &&
    Boolean(document.querySelector('meta[property="og:title"]'))

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={SITE_CANONICAL} />
      {alreadyInDocument ? null : (
        <>
          <meta property="og:title" content={HOME_OG.title} />
          <meta property="og:description" content={HOME_OG.description} />
          <meta property="og:image" content={HOME_OG.image} />
          <meta property="og:url" content={HOME_OG.url} />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={HOME_OG.title} />
          <meta name="twitter:description" content={HOME_OG.description} />
          <meta name="twitter:image" content={HOME_OG.image} />
        </>
      )}
    </Helmet>
  )
}

export default SEO
