import siteConfig from '../config/siteConfig.json'

function TrustBar() {
  return (
    <section className="border-b border-slate-200 bg-white">
      <ul className="mx-auto grid max-w-5xl gap-4 px-4 py-6 sm:grid-cols-3">
        {siteConfig.trustItems.map((item) => (
          <li
            key={item}
            className="text-center text-sm font-medium text-slate-700"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default TrustBar
