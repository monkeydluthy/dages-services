import siteConfig from '../config/siteConfig.json'

function ServiceArea() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <h2 className="mb-6 max-w-3xl text-2xl font-bold text-ink sm:text-3xl">
          Serving Plant City and the surrounding Tampa Bay area
        </h2>
        {/* City list is a placeholder pending Joe's confirmation. */}
        <ul className="flex flex-wrap gap-3">
          {siteConfig.cities.map((city) => {
            const pending = siteConfig.citiesPendingReview.includes(city)

            return (
              <li
                key={city}
                className={
                  pending
                    ? 'rounded-full border border-dashed border-brand/40 bg-white px-4 py-2 text-sm font-medium text-ink/70'
                    : 'rounded-full bg-brandTint px-4 py-2 text-sm font-medium text-brand'
                }
              >
                {city}
                {pending ? (
                  <span className="ml-2 text-xs uppercase tracking-wide text-ink/50">
                    pending
                  </span>
                ) : null}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export default ServiceArea
