import siteConfig from '../config/siteConfig.json'

function ServiceCards() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <h2 className="mb-8 text-3xl font-bold text-slate-900">Services</h2>
      <div className="grid gap-6 sm:grid-cols-3">
        {siteConfig.services.map((service) => (
          <article
            key={service.id}
            className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-2 text-xl font-semibold text-slate-900">
              {service.name}
            </h3>
            <p className="text-slate-600">{service.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ServiceCards
