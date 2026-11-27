import { Link } from 'react-router-dom'
import siteConfig from '../config/siteConfig.json'
import SocialIcon from './SocialIcon'

function formatList(items) {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

function Footer() {
  return (
    <footer className="bg-ink text-brandTint">
      <div className="h-1.5 bg-brand" aria-hidden="true" />
      <div className="mx-auto max-w-5xl px-4 py-10 text-center">
        <p className="flex items-center justify-center gap-2.5">
          <img
            src="/header-icon.webp"
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
            href={`tel:${siteConfig.phone}`}
            data-location="footer"
            className="underline underline-offset-2 hover:text-white"
          >
            {siteConfig.phone}
          </a>
        </p>
        <nav aria-label="Services" className="mt-6">
          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-brandTint/80">
            {siteConfig.services.map((service) => (
              <li key={service.id}>
                <Link
                  to={`/services/${service.id}`}
                  className="underline underline-offset-2 hover:text-white"
                >
                  {service.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <ul className="mt-6 flex flex-wrap justify-center gap-2">
          {siteConfig.socialLinks.map((link) => (
            <li key={link.name}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Dages Services on ${link.name}`}
                className="flex h-11 w-11 items-center justify-center rounded-full hover:text-white"
              >
                <SocialIcon name={link.name} className="h-6 w-6" />
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-brandTint/60">
          © 2026 {siteConfig.businessName}. All rights reserved.
        </p>
        <p className="mt-2 text-sm text-brandTint/60">
          Serving {formatList(siteConfig.counties)} counties
        </p>
        <p className="mt-2 text-sm text-brandTint/60">
          <a
            href="https://digitaldynamicsolution.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-white"
          >
            Site by DDS
          </a>
        </p>
      </div>
    </footer>
  )
}

export default Footer
