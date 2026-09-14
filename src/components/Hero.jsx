import LeadForm from './LeadForm'
import siteConfig from '../config/siteConfig.json'

function Hero() {
  return (
    <section className="bg-brand text-brandTint">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2 md:items-center md:gap-20 md:py-16">
        <div className="flex flex-col gap-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-brandTint">
            {siteConfig.businessName}
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {siteConfig.hero.headline}
          </h1>
          <p className="text-base text-brandTint/80 sm:text-lg">
            {siteConfig.hero.subheadline}
          </p>
          <div>
            <a
              href={`tel:${siteConfig.phone}`}
              className="inline-flex w-full items-center justify-center rounded-md bg-brandTint px-5 py-3 font-semibold text-brand hover:opacity-90 md:w-auto"
            >
              {siteConfig.callToday}
            </a>
          </div>
        </div>
        <div className="w-full md:justify-self-end">
          <LeadForm id="hero-lead-form" />
        </div>
      </div>
    </section>
  )
}

export default Hero
