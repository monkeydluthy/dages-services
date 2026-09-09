import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import siteConfig from '../config/siteConfig.json'

function ThankYouPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-16 text-center">
        <h1 className="mb-4 text-4xl font-bold text-ink">Thanks — we got it.</h1>
        <p className="mb-8 text-lg text-ink/70">
          {siteConfig.businessName} will follow up shortly. If it&apos;s urgent, call{' '}
          <a className="font-medium text-brand underline" href={`tel:${siteConfig.phone}`}>
            {siteConfig.phone}
          </a>
          .
        </p>
        <div>
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
