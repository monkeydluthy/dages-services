import { Helmet } from 'react-helmet-async'
import { faqPageJsonLd } from '../lib/faq'

function FAQPageSchema() {
  const alreadyInDocument =
    typeof document !== 'undefined' && Boolean(document.getElementById('faq-page-jsonld'))

  if (alreadyInDocument) return null

  return (
    <Helmet>
      <script id="faq-page-jsonld" type="application/ld+json">
        {JSON.stringify(faqPageJsonLd())}
      </script>
    </Helmet>
  )
}

export default FAQPageSchema
