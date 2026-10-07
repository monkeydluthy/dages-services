import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import Footer from '../components/Footer'
import JobPhotoGallery from '../components/JobPhotoGallery'
import LeadForm from '../components/LeadForm'
import SEO, { SITE_CANONICAL } from '../components/SEO'
import {
  areaPath,
  getAreaPage,
  getServicePage,
  resolveRelated,
  servicePath,
} from '../config/pages'
import useNoIndex from '../hooks/useNoIndex'
import { breadcrumbJsonLd, pageFaqJsonLd, serviceJsonLd } from '../lib/pageSchema'

function PageFaq({ items }) {
  if (!items?.length) return null

  return (
    <section className="bg-brandTint">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <h2 className="mb-6 text-2xl font-bold text-ink sm:mb-8 sm:text-3xl">
          Common questions
        </h2>
        <div className="rounded-lg border border-brand/20 bg-white px-4 sm:px-6">
          {items.map((item) => (
            <details
              key={item.id}
              className="group border-b border-brand/20 last:border-b-0"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-base font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {item.question}
                <svg
                  className="h-5 w-5 shrink-0 text-brand transition-transform group-open:rotate-180"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </summary>
              <p className="pb-4 text-sm text-ink/70">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function MissingPage() {
  useNoIndex(true)

  return (
    <main className="bg-brandTint">
      <SEO title="Page not found | Dages Services" description="That page is not on this site." />
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-ink">Page not found</h1>
        <p className="mt-3 text-ink/70">That service or area page is not on the site yet.</p>
        <Link to="/" className="mt-8 inline-flex rounded-md bg-brand px-5 py-3 font-semibold text-brandTint">
          Back to home
        </Link>
      </div>
      <Footer />
    </main>
  )
}

function ContentPage({ kind }) {
  const { slug } = useParams()
  const page = kind === 'service' ? getServicePage(slug) : getAreaPage(slug)

  if (!page) return <MissingPage />

  const path = kind === 'service' ? servicePath(page.slug) : areaPath(page.slug)
  const canonical = `${SITE_CANONICAL.replace(/\/$/, '')}${path}`
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: page.h1 },
  ]
  const related = resolveRelated(page.related)
  const galleryHeading =
    kind === 'service' ? `${page.jobType} jobs` : `Jobs in ${page.city}`

  return (
    <main className="bg-brandTint">
      <SEO title={page.title} description={page.metaDescription} canonical={canonical} />
      <Helmet>
        <script id="breadcrumb-jsonld" type="application/ld+json">
          {JSON.stringify(breadcrumbJsonLd(crumbs))}
        </script>
        {kind === 'service' ? (
          <script id="service-jsonld" type="application/ld+json">
            {JSON.stringify(serviceJsonLd(page))}
          </script>
        ) : null}
        {page.faqs?.length ? (
          <script id="page-faq-jsonld" type="application/ld+json">
            {JSON.stringify(pageFaqJsonLd(page.faqs))}
          </script>
        ) : null}
      </Helmet>

      <div className="mx-auto max-w-5xl px-4 pt-8">
        <nav aria-label="Breadcrumb" className="text-sm text-ink/60">
          <ol className="flex flex-wrap gap-2">
            <li>
              <Link to="/" className="underline underline-offset-2 hover:text-ink">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-ink" aria-current="page">
              {page.h1}
            </li>
          </ol>
        </nav>
      </div>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">{page.h1}</h1>
        <p className="mt-4 max-w-3xl text-base text-ink/80 sm:text-lg">{page.intro}</p>
        <div className="mt-8 grid gap-8">
          {page.sections?.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-bold text-ink sm:text-2xl">{section.heading}</h2>
              <p className="mt-2 text-ink/70">{section.body}</p>
            </section>
          ))}
        </div>
      </section>

      <JobPhotoGallery
        jobType={kind === 'service' ? page.jobType : undefined}
        city={kind === 'area' ? page.city : undefined}
        heading={galleryHeading}
      />

      <PageFaq items={page.faqs} />

      {related.length ? (
        <section className="bg-white">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
            <h2 className="mb-6 text-2xl font-bold text-ink sm:text-3xl">Related pages</h2>
            <ul className="flex flex-wrap gap-3">
              {related.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="inline-flex rounded-full bg-brandTint px-4 py-2 text-sm font-medium text-brand hover:opacity-90"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="bg-brand px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-xl">
          <div className="rounded-lg border border-brand/20 bg-white p-3 shadow-xl md:p-4">
            <LeadForm id={`${kind}-${page.slug}-lead-form`} plain />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}

export function ServicePage() {
  return <ContentPage kind="service" />
}

export function AreaPage() {
  return <ContentPage kind="area" />
}

export default ContentPage
