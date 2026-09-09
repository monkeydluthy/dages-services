import siteConfig from '../config/siteConfig.json'

function Hero() {
  return (
    <section className="bg-slate-900 text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-16 sm:py-24">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-400">
          {siteConfig.businessName}
        </p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          {siteConfig.hero.headline}
        </h1>
        <p className="max-w-2xl text-lg text-slate-200">
          {siteConfig.hero.subheadline}
        </p>
        <div>
          <a
            href="#lead-form"
            className="inline-flex rounded-md bg-amber-500 px-5 py-3 font-semibold text-slate-900 hover:bg-amber-400"
          >
            {siteConfig.cta}
          </a>
        </div>
      </div>
    </section>
  )
}

export default Hero
