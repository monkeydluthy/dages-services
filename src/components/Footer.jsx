import siteConfig from '../config/siteConfig.json'

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.address)}`

function Footer() {
  return (
    <footer className="bg-ink text-brandTint">
      <div className="h-1.5 bg-brand" aria-hidden="true" />
      <div className="mx-auto max-w-5xl px-4 py-10 text-center">
        <p className="flex items-center justify-center gap-2.5">
          <img
            src="/header-icon.png"
            alt=""
            width="48"
            height="48"
            className="h-10 w-10 shrink-0 rounded-full bg-white sm:h-12 sm:w-12"
          />
          <span className="font-display text-xl font-bold sm:text-2xl">
            {siteConfig.businessName}
          </span>
        </p>
        <p className="mt-3">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-white"
          >
            {siteConfig.address}
          </a>
        </p>
        <p className="mt-2">
          <a
            href={`tel:${siteConfig.phone}`}
            className="underline underline-offset-2 hover:text-white"
          >
            {siteConfig.phone}
          </a>
        </p>
        <p className="mt-6 text-sm text-brandTint/60">
          © 2026 {siteConfig.businessName}. All rights reserved.
        </p>
        <p className="mt-2 text-sm text-brandTint/60">
          Licensed & Insured | Serving Hillsborough, Pinellas, Manatee, Polk,
          and Pasco counties
        </p>
      </div>
    </footer>
  )
}

export default Footer
