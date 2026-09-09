import siteConfig from '../config/siteConfig.json'

function Footer() {
  return (
    <footer className="border-t border-brand/20 bg-white text-ink">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Text wordmark until a real logo file is provided. */}
        <p className="mb-3 font-display text-xl font-bold text-brand">Dages Services</p>
        <p className="text-sm text-ink/80">
          {siteConfig.businessName}
          {' · '}
          {siteConfig.address}
          {' · '}
          <a className="hover:text-brand" href={`tel:${siteConfig.phone}`}>
            {siteConfig.phone}
          </a>
          {' · '}
          {siteConfig.trustItems[0]}
        </p>
      </div>
    </footer>
  )
}

export default Footer
