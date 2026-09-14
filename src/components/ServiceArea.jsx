import siteConfig from '../config/siteConfig.json'

function formatList(items) {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

function ServiceArea() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <h2 className="mb-2 max-w-3xl text-2xl font-bold text-ink sm:text-3xl">
          Serving {formatList(siteConfig.counties)} counties
        </h2>
        <p className="mb-6 text-sm font-medium text-ink/60">including:</p>
        <ul className="flex flex-wrap gap-3">
          {siteConfig.cities.map((city) => (
            <li
              key={city}
              className="rounded-full bg-brandTint px-4 py-2 text-sm font-medium text-brand"
            >
              {city}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default ServiceArea
