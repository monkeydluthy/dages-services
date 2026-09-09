import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import siteConfig from '../config/siteConfig.json'

function ThankYouPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-16 text-center">
        <h1 className="mb-4 text-4xl font-bold text-slate-900">Thanks — we got it.</h1>
        <p className="mb-8 text-lg text-slate-600">
          {siteConfig.businessName} will follow up shortly. If it&apos;s urgent, call{' '}
          <a className="font-medium text-slate-900 underline" href={`tel:${siteConfig.phone}`}>
            {siteConfig.phone}
          </a>
          .
        </p>
        <div>
          <Link
            to="/"
            className="inline-flex rounded-md bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
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
