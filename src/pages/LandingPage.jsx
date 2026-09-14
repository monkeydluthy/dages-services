import FAQ from '../components/FAQ'
import FinancingBadge from '../components/FinancingBadge'
import Footer from '../components/Footer'
import GoogleReviewsCarousel from '../components/GoogleReviewsCarousel'
import Hero from '../components/Hero'
import LeadForm from '../components/LeadForm'
import OwnerBio from '../components/OwnerBio'
import PortfolioGallery from '../components/PortfolioGallery'
import ServiceArea from '../components/ServiceArea'
import ServiceCards from '../components/ServiceCards'
import TrustBar from '../components/TrustBar'
import siteConfig from '../config/siteConfig.json'
import useGoogleReviews from '../hooks/useGoogleReviews'

const iconClass = 'mx-auto h-7 w-7 text-brandTint'
const areaCities = siteConfig.cities.slice(0, 4).join(', ')

function PhoneIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.5 3.5h3L11 8l-2 1.5a12 12 0 0 0 5.5 5.5L16 13l4.5 1.5v3c0 .8-.7 1.5-1.6 1.5C9.8 19 5 14.2 5 5.1 5 4.2 5.7 3.5 6.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s7-6.2 7-11.2A7 7 0 1 0 5 9.8C5 14.8 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.25" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.5 5 6.5v6.2c0 4.2 2.9 7.2 7 8.8 4.1-1.6 7-4.6 7-8.8V6.5L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m8.5 12 2.3 2.3 4.7-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function InfoCard({ icon, label, value, subtext, href }) {
  return (
    <article className="flex flex-1 flex-col items-center justify-center rounded-lg border border-white/15 bg-black/25 px-4 py-5 text-center">
      {icon}
      <p className="mt-3 text-sm font-bold text-white">{label}</p>
      {value ? (
        href ? (
          <a
            href={href}
            className="mt-1 text-lg font-bold text-white hover:opacity-90"
          >
            {value}
          </a>
        ) : (
          <p className="mt-1 text-lg font-bold text-white">{value}</p>
        )
      ) : null}
      <p className="mt-1 text-sm text-white/60">{subtext}</p>
    </article>
  )
}

function LandingPage() {
  const reviews = useGoogleReviews()

  return (
    <main>
      <Hero />
      <TrustBar reviews={reviews} />
      <ServiceCards />
      <FinancingBadge />
      <ServiceArea />
      <FAQ />
      <PortfolioGallery />
      <OwnerBio />
      <GoogleReviewsCarousel data={reviews} />
      <section className="bg-brand px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mx-auto mb-10 max-w-3xl text-center text-2xl font-bold text-white sm:text-3xl">
            Still deciding? Send us your info and Joseph will call.
          </h2>

          <div className="grid gap-8 md:grid-cols-2 md:items-stretch md:gap-12">
            <div className="order-1 md:order-2">
              <div className="h-full rounded-lg border border-brand/20 bg-white p-3 shadow-xl md:p-4">
                <LeadForm plain />
              </div>
            </div>

            <div className="order-2 flex flex-col gap-4 md:order-1">
              <InfoCard
                icon={<PhoneIcon />}
                label="Call Us"
                value={siteConfig.phone}
                href={`tel:${siteConfig.phone}`}
                subtext={siteConfig.trustItems[2]}
              />
              <InfoCard
                icon={<PinIcon />}
                label="Service Area"
                value="Tampa Bay Area"
                subtext={areaCities}
              />
              <InfoCard
                icon={<ShieldIcon />}
                label="Licensed & Insured"
                subtext="Family-run, Plant City based"
              />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}

export default LandingPage
