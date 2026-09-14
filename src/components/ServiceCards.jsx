import siteConfig from '../config/siteConfig.json'

const iconClass = 'h-8 w-8 text-brand'

function Icon({ name }) {
  switch (name) {
    case 'tree':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 21V12M8 21h8M12 3l5 7H7l5-7Zm-4 7 4 5 4-5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'trim':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M8 20h8M12 20V10M7 8c0-2.8 2.2-5 5-5s5 2.2 5 5c2 0 3.5 1.8 3.5 3.8S19 15.5 17 15.5H7C5 15.5 3.5 13.8 3.5 11.8S5 8 7 8Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'deadwood':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 21V10M8 21h8M12 10 8 6M12 10l5-3M9 13l-3-1M15 14l3-2"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'stump':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <ellipse cx="12" cy="16" rx="7" ry="3" stroke="currentColor" strokeWidth="1.75" />
          <path
            d="M5 16V12c0-1.7 3.1-3 7-3s7 1.3 7 3v4M9 11.5c.5 1.2 1.7 2 3 2s2.5-.8 3-2"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'storm':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M7 16H6a4 4 0 1 1 .7-7.9A5.5 5.5 0 0 1 17.5 10H18a3.5 3.5 0 1 1 0 7h-2M11 12l-2 5h3l-1.5 5 5-7h-3l2-3H11Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'hazard':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 9v4M12 17h.01M10.3 4.7 2.8 18a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.7a2 2 0 0 0-3.4 0Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'crane':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 21h16M7 21V10l13-6v3M7 14h7M17 7v8l-2 2"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'lot':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 18h16M5 18V8l7-4 7 4v10M9 18v-5h6v5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    default:
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.75" />
        </svg>
      )
  }
}

function ServiceCards() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <h2 className="mb-6 text-2xl font-bold text-ink sm:mb-8 sm:text-3xl">Services</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {siteConfig.services.map((service) => (
          <article
            key={service.id}
            className="rounded-lg border border-brand/20 bg-white p-6 shadow-sm"
          >
            <Icon name={service.icon} />
            <h3 className="mb-2 mt-4 text-lg font-semibold text-ink">{service.name}</h3>
            <p className="text-sm text-ink/70">{service.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ServiceCards
