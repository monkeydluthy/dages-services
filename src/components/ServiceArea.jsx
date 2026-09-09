import siteConfig from '../config/siteConfig.json'

function ServiceArea() {
  const { headline, description, areas } = siteConfig.serviceArea

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="mb-3 text-3xl font-bold text-slate-900">{headline}</h2>
        <p className="mb-6 max-w-2xl text-slate-600">{description}</p>
        <ul className="flex flex-wrap gap-3">
          {areas.map((area) => (
            <li
              key={area}
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
            >
              {area}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default ServiceArea
