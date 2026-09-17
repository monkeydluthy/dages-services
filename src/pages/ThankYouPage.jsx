import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CustomerPhotoUpload from '../components/CustomerPhotoUpload'
import Footer from '../components/Footer'
import siteConfig from '../config/siteConfig.json'

function ThankYouPage() {
  const [searchParams] = useSearchParams()
  const leadId = searchParams.get('lead_id') ?? ''

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <main className="flex min-h-screen flex-col">
      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-start px-4 pb-24 pt-10 text-center md:pt-16">
        <h1 className="mb-3 text-3xl font-bold text-ink sm:text-4xl">Thanks — we got it.</h1>
        <p className="mb-3 text-base text-ink/70 sm:text-lg">
          We'll call you back shortly about the job. If you&apos;ve got a photo,
          drop it below so we can see the tree before we follow up.
        </p>
        <p className="mb-2 text-ink/80">
          Need us sooner? Call{' '}
          <a
            className="font-semibold text-brand underline"
            href={`tel:${siteConfig.phone}`}
          >
            {siteConfig.phone}
          </a>
        </p>
        <CustomerPhotoUpload leadId={leadId} />
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex rounded-md bg-brand px-5 py-3 font-semibold text-brandTint hover:opacity-90"
          >
            Back to home
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  )
}

export default ThankYouPage
